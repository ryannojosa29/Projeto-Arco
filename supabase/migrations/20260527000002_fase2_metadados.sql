-- ═══════════════════════════════════════════════════════════
-- Arco — Fase 2: ingestão da prova (.docx) + metadados pedagógicos
-- Pipeline: docs/09-pipeline-de-ingestao-de-provas.md
-- Taxonomia (vocabulário fechado): docs/10-taxonomia-edital-ita.md
-- ═══════════════════════════════════════════════════════════

-- ── Professores ──────────────────────────────────────────────
-- A atribuição questão → professor é determinística, via regra externa
-- (backend/app/professor_assigner.py). A FK em questoes(professor_id)
-- entra opcional para permitir importar a prova antes da regra existir.
create table if not exists professores (
  id              bigint generated always as identity primary key,
  nome            text not null,
  disciplina      text not null,                 -- Matemática | Química | Física | Língua Inglesa
  frente          text,                          -- valor do docs/10 (opcional)
  vigencia_inicio date,                          -- inclusiva (null = sempre)
  vigencia_fim    date,                          -- inclusiva (null = sempre)
  criado_em       timestamptz not null default now()
);
create index if not exists idx_professores_disciplina on professores(disciplina);

alter table questoes
  add column if not exists professor_id bigint references professores(id) on delete set null;
create index if not exists idx_questoes_professor on questoes(professor_id);

-- ── Importação da prova (.docx), distinta da importação do gabarito .xlsx ──
create table if not exists prova_docx_importacoes (
  id              bigint generated always as identity primary key,
  simulado_id     bigint not null references simulados(id) on delete cascade,
  arquivo_nome    text,
  sha256          text not null,                 -- idempotência por conteúdo
  total_questoes  int,
  warnings_count  int not null default 0,
  warnings        jsonb,                         -- lista de strings p/ auditoria
  criado_em       timestamptz not null default now(),
  unique (simulado_id, sha256)
);

-- ── Estágio 1: enunciado, alternativas, resolução, imagens, equações ──
-- Persistidos como complemento da prova (texto bruto + LaTeX preservado).
create table if not exists questao_conteudo (
  questao_id           bigint primary key references questoes(id) on delete cascade,
  enunciado_md         text,                     -- markdown + LaTeX inline ($...$, $$...$$)
  alternativas         jsonb,                    -- {"A": "...", "B": "...", ..., "E": "..."}
  resolucao_md         text,
  gabarito_doc         char(1),                  -- só p/ auditoria; xlsx é autoritativo
  imagens              jsonb,                    -- [{"path": "media/...", "sha256": "..."}]
  equacoes_latex       jsonb,                    -- ["a^2+b^2=c^2", ...]
  origem_sha256        text,                     -- sha256 do .docx que originou
  criado_em            timestamptz not null default now()
);

-- ── Estágio 2: enriquecimento a priori (LLM) ──
-- Cada questão tem 1 ou 2 assuntos. Quando há dois, _principal sustenta a
-- maior parte do raciocínio; _secundario é apoio. Os dois assuntos podem vir
-- de frentes diferentes (questão integradora). Frente/assunto secundário são
-- NULL quando a questão é mono-assunto.
create table if not exists questao_meta (
  questao_id                    bigint primary key references questoes(id) on delete cascade,
  frente_principal              text,            -- valor do docs/10
  assunto_principal             text,            -- bullet do docs/10 sob frente_principal (ou nome da frente quando sem bullets)
  frente_secundaria             text,
  assunto_secundario            text,
  habilidades_cognitivas        jsonb,           -- ["modelar","calcular",...]
  pre_requisitos                jsonb,           -- ["..."]
  dificuldade_esperada          int,             -- 1..5
  hipotese_erro_por_alternativa jsonb,           -- {"A": "...", ..., "E": "gabarito"}
  tags_busca                    jsonb,           -- ["..."]
  resolucao_latex               text,            -- opcional, normalização
  enrichment_status             text not null default 'pending',  -- pending|ok|failed|skipped
  enrichment_version            text,            -- versão do prompt
  enrichment_model              text,            -- ex.: claude-sonnet-4-6
  enrichment_error              text,            -- mensagem quando failed
  atualizado_em                 timestamptz not null default now(),
  -- secundário só faz sentido se ambos os campos vierem juntos
  constraint questao_meta_secundario_consistente check (
    (frente_secundaria is null and assunto_secundario is null)
    or (frente_secundaria is not null and assunto_secundario is not null)
  )
);
create index if not exists idx_questao_meta_frente_principal on questao_meta(frente_principal);
create index if not exists idx_questao_meta_assunto_principal on questao_meta(assunto_principal);

-- ── Estágio 3: diagnóstico pós-aplicação (só priorizadas) ──
create table if not exists questao_diagnostico (
  questao_id              bigint primary key references questoes(id) on delete cascade,
  motivo_priorizacao      text not null,         -- "resolucao_sugerida" | "revisao_tecnica" | ambos
  hipotese_pedagogica     text,
  evidencia_no_distrator  text,
  sugestao_abordagem      text,
  diagnostico_status      text not null default 'pending',  -- pending|ok|failed|skipped
  diagnostico_version     text,
  diagnostico_model       text,
  atualizado_em           timestamptz not null default now()
);

-- ── RLS: igual à fase 1 (nega anon/authenticated, service_role bypassa) ──
alter table professores              enable row level security;
alter table prova_docx_importacoes   enable row level security;
alter table questao_conteudo         enable row level security;
alter table questao_meta             enable row level security;
alter table questao_diagnostico      enable row level security;
-- nenhuma policy criada de propósito.

-- ── View enriquecida (apenas leitura via backend) ───────────────────────
-- Junta v_questoes original com meta e diagnóstico quando existirem.
create or replace view v_questoes_enriquecidas
with (security_invoker = true) as
select
  v.*,
  m.frente_principal               as meta_frente_principal,
  m.assunto_principal              as meta_assunto_principal,
  m.frente_secundaria              as meta_frente_secundaria,
  m.assunto_secundario             as meta_assunto_secundario,
  m.habilidades_cognitivas         as meta_habilidades,
  m.dificuldade_esperada           as meta_dificuldade,
  m.hipotese_erro_por_alternativa  as meta_hipoteses,
  m.enrichment_status              as meta_status,
  d.hipotese_pedagogica            as diag_hipotese,
  d.evidencia_no_distrator         as diag_evidencia,
  d.sugestao_abordagem             as diag_sugestao,
  d.motivo_priorizacao             as diag_motivo,
  d.diagnostico_status             as diag_status,
  p.nome                           as professor_nome,
  p.frente                         as professor_frente
from v_questoes v
left join questoes        q on q.simulado_id = (select id from simulados s where s.chave = v.sim_chave) and q.numero = v.num
left join questao_meta    m on m.questao_id = q.id
left join questao_diagnostico d on d.questao_id = q.id
left join professores     p on p.id = q.professor_id;
