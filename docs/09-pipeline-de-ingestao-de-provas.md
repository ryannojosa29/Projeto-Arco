# 09 — Pipeline de ingestão de provas (.docx → metadados)

## 1. Papel deste documento

Este documento especifica o pipeline que transforma uma prova de simulado em
formato `.docx` (enunciados + resoluções) em metadados pedagógicos estruturados,
prontos para alimentar a página Professores e as Devolutivas.

Ele complementa:

- `docs/05-dados-e-estatistica.md` — define as métricas e classificações que o
  pipeline produz (resolução sugerida, revisão técnica, distrator dominante);
- `docs/08-roadmap-e-proximos-passos.md` — Fase 3 (backend);
- `backend/README.md` — o gateway FastAPI que já importa o gabarito agregado.

A regra central é:

> O `.docx` é fonte de enunciado, resolução e imagens.
> O `Gabarito_questoes.xlsx` é a fonte autoritativa de gabarito e estatística.
> A IA só entra onde a estrutura do documento cala.

---

## 2. Entradas e o que cada uma carrega

| Entrada | Conteúdo | Papel |
|---|---|---|
| `Simulado_Combinado.docx` | 48 questões, enunciados, alternativas, resoluções (opcionais), imagens | Fonte de texto e figuras |
| `Gabarito_questoes.xlsx` | Por questão: gabarito, acertos, contagem A–E, itens mais marcados | Fonte autoritativa de gabarito e estatística |
| **Sequência de disciplinas no upload** | 4 valores únicos, na ordem dos blocos | Define disciplina por questão (Q1-12 = bloco 1, ..., Q37-48 = bloco 4) |
| Regra de atribuição de professor | Determinística (sem LLM) | Liga cada questão ao professor/frente responsável |

### 2.0 Estrutura fixa do simulado

Todo simulado tem **4 blocos de 12 questões**, um por disciplina. A ordem dos
blocos varia entre simulados e é decidida quando o coordenador monta a prova —
por isso a **sequência é informada no upload do .docx**, no frontend. Cálculo:

```python
disciplina(n) = sequencia[(n - 1) // 12]   # n em 1..48
```

A sequência informada é **autoritativa**: sobrescreve `questoes.disciplina`
gravada pelo xlsx anterior. Quando diverge do xlsx, o backend registra warning
mas mantém a do upload (o simulado é a verdade do contexto).

### 2.1 O que a análise do `.docx` de exemplo revelou

| Sinal | Achado | Implicação |
|---|---|---|
| Marcador `QUESTÃO N` | 48 ocorrências (algumas como `**[QUESTÃO N]{.mark}**` quando destacadas no Word) | Split por questão tolera bold/itálico/highlight |
| `Assunto:` | Presente em 34/48 questões | Quando existe, vai para `questoes.assunto` (texto livre da banca); quando falta, a IA classifica do zero |
| `Resolução:` / `Resposta:` | Presentes em ~26/48 e ~47/48 respectivamente | **Opcionais.** Quando faltam, não há warning; o LLM infere do enunciado |
| Cabeçalho de matéria/professor | Ausente | Disciplina vem da sequência informada no upload; professor vem de regra externa |
| Imagens | 48 PNGs embutidos | Extraíveis deterministicamente |
| Equações | 205 blocos OMML (MathML do Word) | Exigem Pandoc para preservar como LaTeX — strip de XML destrói a matemática |
| Cruzamento | 48 questões (.docx) = 48 (xlsx) = 48 (mock) | Coerência confirmada; um valida o outro |

---

## 3. Arquitetura: 3 estágios com contratos JSON

A escolha de produto é separar parsing, classificação e diagnóstico em estágios
independentes com entrada/saída validável entre eles. Um "agente único de ponta
a ponta" foi descartado por fragilizar o debug e a auditoria.

```
Simulado_Combinado.docx ─┐
Gabarito_questoes.xlsx ──┤
                         ▼
  [1]  docx_parser.py        Pandoc + extração de imagens. JSON canônico de 48
       └─ cruza com xlsx     questões + warnings. Determinístico, sem LLM.
                         │
  [1.5] professor_assigner   Script Python puro. Regra fixa. Sem LLM.
                         │
  [2]  enrichment_agent.py   LLM por questão, em batch. JSON estrito validado
                             por Pydantic, enums fechados. Cache por hash.
                         │  (junta com acerto/distrator/bisserial do xlsx)
                         │
  [3a] prioritizer.py        Regras estatísticas do doc 05 §10.3/10.4 escolhem
                             quais questões merecem diagnóstico.
                         │
  [3b] diagnostic_agent.py   LLM só nas priorizadas. Cruza a hipótese de erro
                             a priori com o distrator empírico real.
                         │
                         ▼
  Supabase: questoes + questao_meta + questao_diagnostico + professores
                         │
                         ▼
            Frontend (página Professores + Devolutivas)
```

### 3.1 Estágio 1 — Parser determinístico (sem LLM)

Responsabilidade: virar o `.docx` num JSON canônico de 48 questões.

- Usar **Pandoc** (`pandoc -f docx -t markdown+latex_math`) para preservar as
  205 equações como LaTeX legível.
- Extrair imagens para `media/sim{N}/q{numero}_img{k}.png` com hash de conteúdo.
- Split por `QUESTÃO N` (regex tolera bold/itálico do Word: `**QUESTÃO 5**`,
  `**[QUESTÃO 25]{.mark}**`).
- Por bloco extrair: `enunciado`, `alternativas{A..E}`, `assunto?` (texto livre da
  banca), `resolucao?` (opcional, sem warning), `gabarito_doc?` (auditoria),
  `equacoes_latex[]`, `imagens[]`.
- **Disciplina vem da sequência informada no upload** (não do xlsx). Cálculo
  `disc = sequencia[(n-1)//12]`. Divergência com o xlsx vira warning, mas a
  sequência vence.
- Gabarito autoritativo é o do xlsx. Se `gabarito_doc ≠ gabarito_xlsx`, registra
  warning e mantém o xlsx.
- Idempotência: hash do `.docx` (chave única por `(simulado_id, sha256)`) + hash
  por questão. Mesmo arquivo re-uploadado devolve resultado em cache sem
  reprocessar.
- Saída validada com Pydantic.

### 3.2 Estágio 1.5 — Atribuição de professor (sem LLM)

Script Python puro que aplica a regra determinística de atribuição. **A regra
ainda precisa ser especificada** (ver seção 7). O posicionamento no pipeline
(antes ou depois do Estágio 2) depende da natureza da regra:

- regra por **intervalo de questão** ou por **disciplina** → roda antes do Estágio 2;
- regra por **frente** → depende da classificação do Estágio 2, roda depois.

### 3.3 Estágio 2 — Enriquecimento a priori (LLM)

Responsabilidade: gerar metadados pedagógicos **antes de ver qualquer dado de
aluno**, mantendo o sinal limpo. Entrada por questão:
`{enunciado, alternativas, assunto?, resolucao?, disciplina}` (resolução é
opcional — quando ausente, o LLM infere do enunciado).

Cada questão tem **1 ou 2 assuntos**. Quando há dois, `assunto_principal`
sustenta a maior parte do raciocínio; `assunto_secundario` é apoio. Os dois
podem vir de **frentes diferentes** (questão integradora). Saída JSON estrito:

```jsonc
{
  "frente_principal": "Cinemática",                     // capítulo do docs/10
  "assunto_principal": "Lançamento de projéteis",       // bullet sob frente_principal
  "frente_secundaria": "Energia",                       // null se mono-assunto
  "assunto_secundario": "Conservação da energia",       // null se mono-assunto
  "habilidades_cognitivas": ["modelar", "calcular"],
  "pre_requisitos": ["Operações vetoriais", "Equação horária"],
  "dificuldade_esperada": 4,                            // 1–5, calibrada ITA
  "hipotese_erro_por_alternativa": {
    "A": "confundiu velocidade com aceleração no eixo vertical",
    "B": "...", "C": "...", "D": "...", "E": "gabarito"
  },
  "tags_busca": ["projetil", "decomposicao-vetorial"]
}
```

**Vocabulário fechado** com `Literal[...]` no schema Pydantic:

- Frentes: `FrenteMatematica = Literal["Conjuntos e Lógica", ...]`, etc. — cada
  Literal restrito à disciplina.
- Assuntos: bullets sob a frente correspondente em `docs/10`.
- `habilidades_cognitivas`: `Literal` fechado de 8 valores.

**Regras cruzadas** (validador além do shape Pydantic):

1. `assunto_principal` ∈ subtópicos de `frente_principal`.
2. `assunto_secundario` ∈ subtópicos de `frente_secundaria` (quando ambos preenchidos).
3. Par secundário anda junto: ou ambos não-nulos ou ambos nulos.
4. (frente_principal, assunto_principal) ≠ (frente_secundaria, assunto_secundario).
5. Para frentes **sem bullets no edital** (Química Orgânica 11.1–11.6 e Língua
   Inglesa "Interpretação"), o assunto é **autorreferência**: igual ao nome da
   frente. Ex: `frente="Interpretação", assunto="Interpretação"`.

Mudanças no edital exigem atualização do código e bump em `enrichment_version`.

Comportamento em falha: 1 retry se o schema falhar; `enrichment_status=failed` se
persistir. Cacheado por hash da questão + versão do prompt + versão da taxonomia
+ modelo.

### 3.4 Estágio 3 — Diagnóstico pós-aplicação

1. **Estágio 3a (estatística, não LLM):** as regras do `docs/05` §10.3/§10.4
   decidem quais questões são prioritárias:
   - resolução sugerida: `acerto<45% OU distrator≥25% OU (discriminante>0,30 E acerto<60%)`;
   - revisão técnica: `discriminante<0,10 OU bisserial<0,10 OU discriminante<0`.
2. **Estágio 3b (LLM, só nas priorizadas):** recebe
   `{enriquecimento_a_priori + acerto + distrator_dominante% + bisserial}` e produz:
   - `hipotese_pedagogica` (1 frase);
   - `evidencia_no_distrator` — cruza a `hipotese_erro_por_alternativa` do
     Estágio 2 com o distrator empírico real (o cruzamento de maior valor pedagógico);
   - `sugestao_abordagem` (1–2 frases acionáveis).

Isso preenche diretamente a "Página 3 da Devolutiva" (`docs/05` §13.3).

---

## 4. Arquivos e schema

### 4.1 Arquivos novos previstos

| Arquivo | Papel |
|---|---|
| `backend/app/docx_parser.py` | Estágio 1 — Pandoc, imagens, split por `QUESTÃO N` |
| `backend/app/professor_assigner.py` | Estágio 1.5 — regra determinística |
| `backend/app/enrichment_agent.py` | Estágio 2 — Anthropic SDK, batch, cache por hash |
| `backend/app/prioritizer.py` | Estágio 3a — regras do `docs/05` |
| `backend/app/diagnostic_agent.py` | Estágio 3b — LLM nas priorizadas |
| `backend/prompts/enrichment.md` | Prompt versionado do Estágio 2 |
| `backend/prompts/diagnostic.md` | Prompt versionado do Estágio 3 |
| `supabase/migrations/20260527000002_fase2_metadados.sql` | `questao_meta`, `questao_diagnostico`, `professores`, FK `questoes.professor_id` |

### 4.2 Encaixe no schema atual

| Já existe | O que falta |
|---|---|
| `questoes` com `assunto` e `competencia` nullable (`20260527000001_fase1.sql`) | Tabela `questao_meta` (1:1) com `frente_principal`, `assunto_principal`, `frente_secundaria`, `assunto_secundario`, `habilidades_cognitivas`, `pre_requisitos`, `dificuldade_esperada`, `hipotese_erro_por_alternativa`, `resolucao_latex`, `enrichment_version`, `enrichment_status` |
| `questao_resultados` com acerto, contagens, itens mais marcados | Tabela `questao_diagnostico` (1:1, só priorizadas) com `hipotese_pedagogica`, `evidencia_no_distrator`, `sugestao_abordagem`, `motivo_priorizacao` |
| Endpoint `POST /api/importacoes` (xlsx) | Endpoint `POST /api/simulados/{chave}/prova` (docx, com `sequencia_disciplinas`) que dispara os Estágios 1→3 |
| — | Tabela `professores` (`nome`, `disciplina`, `frente`, vigência) + FK `questoes.professor_id` |

`questao_meta` é tabela separada de `questoes` de propósito: a `questoes` é o
agregado canônico (estável, FK-friendly); o enriquecimento pode ser regerado com
uma versão nova de prompt sem tocar no canônico.

---

## 5. Princípios de robustez

1. **Gabarito autoritativo = xlsx, não .docx.** O `.docx` traz `Resposta:` em só
   33/48 questões; divergência vira `warning`, nunca sobrescreve o xlsx.
2. **Cache por hash de questão + versão de prompt.** Mudou uma questão? Só ela
   reprocessa. Mudou o prompt? Bumpa `enrichment_version` e o cache invalida limpo.
3. **JSON estrito com Pydantic + 1 retry + `failed`.** Nunca aceitar resposta mal
   formada em silêncio. Enums fechados para `frente` e `habilidades_cognitivas`.
4. **O LLM nunca vê dados de aluno individuais.** Mesmo no Estágio 3, só agregados
   (acerto%, distrator%, bisserial). Privacy by design.
5. **Estágio 3 só roda nas priorizadas.** De 48, tipicamente 10–15 disparam
   critérios — economia real e foco na devolutiva.
6. **Endpoint idempotente por hash do .docx.** `sha256` do upload; mesmo hash já
   importado devolve o resultado em cache.
7. **Warnings ≠ erros.** Questão sem `Resolução:` acumula em `warnings[]` e o
   pipeline segue; não aborta.

---

## 6. O que conscientemente fica fora

| Não fazer | Por quê |
|---|---|
| LLM valida a matemática da resolução | Risco alto de erro silencioso em questão difícil de ITA. No máximo, sinal assíncrono `resolucao_check_status`, nunca verdade |
| Modelo multimodal lê os PNGs para interpretar gráficos | Caro e supérfluo no primeiro corte; reavaliar só se uma frente específica provar necessidade |
| LLM infere "qual professor é dono da questão" | Sem fonte externa é alucinação; atribuição é sempre determinística |
| LLM decide "revisão técnica sugerida" | É regra estatística do `docs/05`; IA aqui só atrapalha |
| LLM recalcula acerto/discriminante | É contagem sobre respostas, não inferência |

---

## 7. Pendência: regra de atribuição de professor

A atribuição de questão → professor será feita por **script Python determinístico**
(decisão tomada), mas a **regra exata ainda não foi especificada**. Possíveis formatos:

- intervalos de questão fixos (`Q1–Q12 = Prof X`, ...);
- 1:1 disciplina → professor;
- por frente (depende do Estágio 2);
- intervalos variáveis informados no upload de cada simulado.

A definição dessa regra determina o posicionamento do Estágio 1.5 no pipeline e
se ela é hardcoded, configurável por arquivo, ou input do upload. Enquanto não
especificada, o pipeline pode rodar os Estágios 1, 2 e 3 deixando `professor_id`
nulo.

---

## 8. Escopo do primeiro corte

A decisão de produto é entregar o **pipeline completo (Estágios 1 + 2 + 3)**, já
que existem dados empíricos confiáveis no `Gabarito_questoes.xlsx`. Conversão de
matemática e imagens via **Pandoc + extração de PNG**.

Ordem de construção sugerida:

1. Estágio 1 (parser + cruzamento com xlsx) — base verificável.
2. Migração `20260527000002` (tabelas de metadados e professores).
3. Estágio 2 (enriquecimento) + prompt versionado.
4. Estágio 1.5 (assim que a regra de professor for definida).
5. Estágios 3a/3b (priorização + diagnóstico).
6. Endpoint `POST /api/simulados/{chave}/prova` ligando tudo.

---

## 9. Síntese

O `.docx` é estruturado o bastante para um parser determinístico fazer ~80% do
trabalho; o LLM entra na semântica (frente, habilidade, hipótese de erro) e na
síntese pedagógica (cruzar hipótese a priori com o distrator real). A separação
em estágios com contratos JSON e cache por hash dá auditabilidade e controle de
custo. A lógica final é:

```
.docx + .xlsx
↓
parsing determinístico
↓
atribuição de professor (regra fixa)
↓
enriquecimento a priori (LLM)
↓
priorização estatística
↓
diagnóstico pós-aplicação (LLM)
↓
metadados úteis para a coordenação
```
