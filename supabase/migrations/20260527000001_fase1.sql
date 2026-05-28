-- ═══════════════════════════════════════════════════════════
-- Arco — Fase 1: import do gabarito agregado (sem escola, sem prova)
-- Grão: 1 resultado "geral" por questão de um simulado.
-- Escrita/leitura só pelo backend (service_role); RLS nega anon.
-- ═══════════════════════════════════════════════════════════

-- ── Tabelas ──────────────────────────────────────────────────
create table if not exists simulados (
  id          bigint generated always as identity primary key,
  chave       text unique not null,          -- 'sim1' (liga ao <select> do front)
  nome        text not null,                  -- '1º Simulado ENEM 2025'
  nome_curto  text,
  referencia  text,                           -- 'Fevereiro 2025'
  ordem       int  not null default 0,
  criado_em   timestamptz not null default now()
);

create table if not exists importacoes (
  id            bigint generated always as identity primary key,
  simulado_id   bigint references simulados(id) on delete cascade,
  arquivo_nome  text,
  total_linhas  int,
  criado_em     timestamptz not null default now()
);

create table if not exists questoes (
  id           bigint generated always as identity primary key,
  simulado_id  bigint not null references simulados(id) on delete cascade,
  numero       int    not null,
  disciplina   text   not null,
  gabarito     char(1) not null,
  competencia  text,                          -- null na Fase 1 (vem da prova)
  assunto      text,                          -- null na Fase 1
  unique (simulado_id, numero)
);

create table if not exists questao_resultados (
  id              bigint generated always as identity primary key,
  questao_id      bigint not null references questoes(id) on delete cascade,
  importacao_id   bigint references importacoes(id) on delete set null,
  n_respondentes  int not null,
  acerto_pct      numeric(5,2) not null,      -- 0..100
  cont_a int not null default 0,
  cont_b int not null default 0,
  cont_c int not null default 0,
  cont_d int not null default 0,
  cont_e int not null default 0,
  item_1 char(1),
  item_2 char(1),
  item_3 char(1),
  unique (questao_id)                          -- 1 resultado geral por questão (Fase 1)
);

-- Fase 2: questao_resultados ganha escola_id e a unique vira (questao_id, escola_id);
-- nasce 'respostas' (aluno x questao x alternativa) que passa a alimentar estes agregados.

-- ── Views = camada de de-mock (a API lê daqui) ───────────────
-- security_invoker: a view roda com os privilégios de quem consulta,
-- então a RLS das tabelas-base também vale para a view (anon continua negado).

create or replace view v_questoes
with (security_invoker = true) as
select
  s.chave                         as sim_chave,
  q.numero                        as num,
  q.disciplina                    as disc,
  q.gabarito                      as gab,
  round(r.acerto_pct)::int        as acerto,
  d.dist                          as dist,
  case when r.n_respondentes > 0
       then round(d.dist_count::numeric / r.n_respondentes * 100)::int
       else 0 end                 as "distPct",
  q.competencia                   as comp,
  q.assunto                       as assunto,
  null::numeric                   as discriminante,        -- Fase 2
  case
    when round(r.acerto_pct) >= 70 then 'above'
    when round(r.acerto_pct) >= 42 then 'att'
    else 'crit'
  end                             as status,
  jsonb_build_object(
    'A', case when r.n_respondentes>0 then round(r.cont_a::numeric/r.n_respondentes*100)::int else 0 end,
    'B', case when r.n_respondentes>0 then round(r.cont_b::numeric/r.n_respondentes*100)::int else 0 end,
    'C', case when r.n_respondentes>0 then round(r.cont_c::numeric/r.n_respondentes*100)::int else 0 end,
    'D', case when r.n_respondentes>0 then round(r.cont_d::numeric/r.n_respondentes*100)::int else 0 end,
    'E', case when r.n_respondentes>0 then round(r.cont_e::numeric/r.n_respondentes*100)::int else 0 end
  )                               as distrib,
  r.n_respondentes                as n_respondentes
from questoes q
join questao_resultados r on r.questao_id = q.id
join simulados s on s.id = q.simulado_id
-- distrator dominante = alternativa errada mais marcada (não o gabarito)
cross join lateral (
  select v.letra as dist, v.cont as dist_count
  from (values
    ('A', r.cont_a), ('B', r.cont_b), ('C', r.cont_c),
    ('D', r.cont_d), ('E', r.cont_e)
  ) as v(letra, cont)
  where v.letra <> q.gabarito
  order by v.cont desc
  limit 1
) d;

create or replace view v_simulado_disciplina
with (security_invoker = true) as
select
  s.chave                  as sim_chave,
  q.disciplina             as disc,
  round(avg(r.acerto_pct))::int as media,
  count(*)                 as n_questoes
from questoes q
join questao_resultados r on r.questao_id = q.id
join simulados s on s.id = q.simulado_id
group by s.chave, q.disciplina;

create or replace view v_simulado_resumo
with (security_invoker = true) as
select
  s.chave                  as sim_chave,
  s.nome                   as nome,
  round(avg(r.acerto_pct))::int as media_geral,
  count(*)                 as n_questoes,
  count(*) filter (where round(r.acerto_pct) >= 70)                              as n_above,
  count(*) filter (where round(r.acerto_pct) >= 42 and round(r.acerto_pct) < 70) as n_att,
  count(*) filter (where round(r.acerto_pct) <  42)                              as n_crit
from questoes q
join questao_resultados r on r.questao_id = q.id
join simulados s on s.id = q.simulado_id
group by s.chave, s.nome;

-- ── RLS: nega anon/authenticated; service_role (backend) ignora RLS ──
alter table simulados          enable row level security;
alter table importacoes        enable row level security;
alter table questoes           enable row level security;
alter table questao_resultados enable row level security;
-- Nenhuma policy criada de propósito: sem policy, nenhuma linha é visível/gravável
-- para anon/authenticated. O backend usa service_role, que tem BYPASSRLS.
