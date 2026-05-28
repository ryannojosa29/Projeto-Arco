# Roadmap de des-mock — Arco

> **Gerado automaticamente** de `assets/data-status.json`. Não edite à mão —
> mude o `status` de um domínio no JSON e rode `python3 scripts/gen_roadmap.py`.

**Progresso:** 1/9 domínios reais (11%).

## Como funciona

Um app só, dois modos (em `assets/js/config.js` → `ARCO.MODE`):

- **`demo`** (padrão no repo): mostra o produto inteiro; o que não é `real` ganha
  selo **DEMONSTRATIVO**. É a versão a ser perseguida pela equipe.
- **`official`**: o que está `mock` é **bloqueado** com aviso *"disponível em breve"*;
  só o que é `real` (e `partial`) navega. Nada de dado fake passando por real.

Quando todos os domínios virarem `real`, `official` == `demo` == produto completo.

Legenda: ✅ real · 🟡 parcial · ⬜ mockado

## Por fase

### Fase 1 — Gabarito agregado — questões objetivas + KPIs do simulado  (1/2)

- [x] ✅ **Análise de questões + KPIs do simulado** — `simulados`
- [ ] ⬜ **Séries de evolução entre simulados** `(interno)` — `simulado.evolucao` — _vira real ao acumular vários ciclos importados_

### Fase 2 — Folha de respostas individual — aluno, discriminante, ranking, turma, presença  (0/2)

- [ ] ⬜ **Perfil, evolução e ranking de alunos** — `alunos`
- [ ] ⬜ **Discriminante / ponto-biserial / índice de qualidade** `(interno)` — `questao.discriminante` — _exige resposta individual para correlacionar acerto com nota total_

### Fase 3 — Prova — competência, assunto, professor autor, resolução  (0/2)

- [ ] ⬜ **Auditoria pedagógica do professor** — `professores`
- [ ] ⬜ **Competência e assunto de cada questão** `(interno)` — `questao.competencia` — _vem da importação da prova_

### Fase 4 — Redação — 5 competências (0–1000)  (0/1)

- [ ] ⬜ **Redação (5 competências)** `(interno)` — `redacao`

### Fase 5 — Multi-escola — rede, ranking de escolas  (0/2)

- [ ] 🟡 **Home / visão geral** — `dashboard` — _mistura KPIs reais do simulado com agregados de rede ainda mockados_
- [ ] ⬜ **Visão por escola, rede e ranking** — `escolas`

## Tabela geral

| Domínio | O que é | Status | Fase |
|---|---|---|---|
| `simulados` | Análise de questões + KPIs do simulado | ✅ real | 1 |
| `simulado.evolucao` | Séries de evolução entre simulados | ⬜ mockado | 1 |
| `alunos` | Perfil, evolução e ranking de alunos | ⬜ mockado | 2 |
| `questao.discriminante` | Discriminante / ponto-biserial / índice de qualidade | ⬜ mockado | 2 |
| `professores` | Auditoria pedagógica do professor | ⬜ mockado | 3 |
| `questao.competencia` | Competência e assunto de cada questão | ⬜ mockado | 3 |
| `redacao` | Redação (5 competências) | ⬜ mockado | 4 |
| `dashboard` | Home / visão geral | 🟡 parcial | 5 |
| `escolas` | Visão por escola, rede e ranking | ⬜ mockado | 5 |

<sub>Gerado em 2026-05-27.</sub>
