# 08 — Roadmap e próximos passos

## 1. Papel deste documento

Este documento descreve o estado atual do produto, as pendências conhecidas e o caminho de evolução priorizado para transformar o protótipo atual em um produto completo.

Ele serve como referência para:

- decisões sobre o que fazer agora vs. depois;
- comunicação com a Arco;
- alinhamento entre produto, design e técnico;
- onboarding de novos colaboradores no projeto.

A regra é:

> Avançar com disciplina — documentar, organizar, padronizar, validar, implementar.

---

## 2. Estado atual do produto

O projeto está em fase de **protótipo avançado navegável**.

### 2.1 O que foi construído

| Área | Estado |
|---|---|
| Home | Funcional — KPIs, panorama, prioridades |
| Simulados | Funcional — anatomia, disciplinas, evolução |
| Escolas | Funcional — visão geral, ranking, desempenho, componentes |
| Alunos | Funcional — ranking e perfil individual |
| Professores | Funcional — painel da frente, itens e evidências, aprendizagem |
| Devolutivas | Funcional como página separada (pendente integração com Professores) |
| Dados mockados | Determinísticos — 80 alunos, 6 escolas, 5 simulados, 48 questões |
| Gráficos | Plotly.js — linha temporal, barras, scatter, distribuição |
| PDF | jsPDF — geração inicial funcional com limitações de layout |
| Filtros | Funcionais — por simulado, escola, turma, aluno, professor |
| Design system | Definido — tokens.css, Plus Jakarta Sans, paleta navy/orange |
| Documentação | Em processo de consolidação (docs/00 a 08) |

### 2.2 O que ainda não existe

- Autenticação e controle de acesso
- Upload e validação de planilhas reais
- Backend e persistência de dados
- Histórico multi-simulado com dados reais
- Geração profissional de PDF (backend + Playwright)
- Separação de dados por escola/ciclo com segurança
- Modelos preditivos ou alertas automáticos

---

## 3. Pendências técnicas conhecidas

Estas são pendências no código atual que afetam identidade ou consistência do produto, mas que **não devem ser corrigidas imediatamente** — estão registradas aqui para ação futura.

| Pendência | Arquivo | Impacto | Prioridade |
|---|---|---|---|
| Labels dos simulados usam "ENEM 2025" em vez de "ITA" | `data.js` | Inconsistência de identidade do produto | Alta |
| Devolutivas é item independente na sidebar | `index.html` | Contraria decisão de produto | Alta |
| `index.html` monolítico (~1146 linhas) | `index.html` | Difícil manutenção | Média |
| `data.js` com todos os dados em um único arquivo | `data.js` | Difícil trocar por dados reais | Média |
| PDF gerado no cliente com jsPDF | `pdf.js` | Layout limitado em relatórios complexos | Baixa |
| Disciplinas Linguagens e C. Humanas nos dados mock | `data.js` | Fora do foco ITA | Baixa |

---

## 4. Pendências de produto conhecidas

Estas são decisões de produto que ainda precisam de validação formal.

| Decisão | Status | Ver |
|---|---|---|
| Formato real dos arquivos de entrada (planilha) | Pendente | docs/06 — seção 4.1 |
| Resposta por alternativa ou apenas nota final | Pendente | docs/06 — seção 4.2 |
| Classificação de questões por assunto (quem classifica?) | Pendente | docs/06 — seção 4.3 |
| Limiares de "atenção", "crítico" e "destaque" | Pendente | docs/06 — seção 5.1 |
| MVP como protótipo visual ou plataforma funcional | Pendente | docs/06 — seção 3.3 |
| Ferramenta interna da Arco ou portal para escolas | Pendente | docs/06 — seção 3.2 |

---

## 5. Roadmap de evolução

### Fase 0 — Consolidação da documentação

**Status: em andamento.**

**Objetivo:** garantir que o projeto tenha documentação clara, alinhada com o código real e com as decisões de produto já tomadas.

Entregáveis:

- [x] README.md — reescrito e alinhado
- [x] docs/00-stack-e-arquitetura.md — reescrito e alinhado
- [x] docs/01-visao-de-produto.md — reescrito e alinhado
- [x] docs/02-arquitetura-da-informacao.md — reescrito e alinhado
- [x] docs/03-design-system.md — reescrito e alinhado
- [x] docs/04-telas-e-funcionalidades.md — reescrito e alinhado
- [x] docs/05-dados-e-estatistica.md — reescrito e alinhado
- [x] docs/06-questoes-abertas.md — reescrito e alinhado
- [x] docs/07-glossario.md — reescrito e alinhado
- [x] docs/08-roadmap-e-proximos-passos.md — criado

**Critério de saída:** todos os documentos renderizam corretamente em markdown, sem blocos abertos, sem arquivos inexistentes referenciados, com separação clara entre estado atual e visão futura.

---

### Fase 1 — Refinamento do protótipo existente

**Status: próxima.**

**Objetivo:** corrigir as pendências técnicas de identidade e integração no protótipo atual, sem migrar de stack.

#### 1.1 Correções de identidade

- Corrigir labels nos dados mockados: "Simulado ENEM 2025" → "Simulado ITA" em `data.js`
- Remover referências a ENEM de toda interface visível
- Verificar e alinhar textos de exemplo nas telas

#### 1.2 Integração de Devolutivas em Professores

- Mover a lógica da página Devolutivas para dentro da aba Professores em `app.js`
- Remover "Devolutivas" do menu lateral em `index.html`
- Garantir que o botão "Gerar devolutiva" fique contextual dentro da página Professores
- Ajustar navegação e estado global (`S`) para refletir a mudança

#### 1.3 Organização dos dados mockados

Separar `data.js` em arquivos por entidade:

```
assets/js/
├── mock-alunos.js
├── mock-escolas.js
├── mock-simulados.js
├── mock-professores.js
├── mock-questoes.js
└── services/
    └── mockClient.js
```

`mockClient.js` expõe funções de serviço que o `app.js` consome. Isso facilita a troca por dados reais no futuro.

#### 1.4 Refino visual global

Padronizar o shell visual da aplicação:

- sidebar (itens, ícones, estado ativo, hover)
- header (título, subtítulo, filtros, ações)
- topbar (perfil, ações globais)
- tabs (estilo, estado ativo, transição)
- cards (padding, sombra, hover)
- badges (cores semânticas, tamanho)
- estados vazios e de carregamento

**Critério de saída:** identidade do produto é exclusivamente ITA, Devolutivas está dentro de Professores, dados mockados são organizados e o shell visual é consistente em todas as páginas.

---

### Fase 2 — Scaffold técnico

**Status: planejada.**

**Objetivo:** preparar a estrutura técnica para receber dados reais e backend.

#### 2.1 Reorganização de pastas

```
Projeto-Arco/
├── README.md
├── docs/
├── web/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   └── README.md
├── data/
│   ├── mock/
│   │   ├── alunos.json
│   │   ├── escolas.json
│   │   ├── simulados.json
│   │   ├── questoes.json
│   │   └── professores.json
│   └── samples/
│       └── planilha-modelo.xlsx
└── reports/
    └── templates/
        └── devolutiva-professor.html
```

#### 2.2 Schema de dados de entrada

Definir o formato oficial mínimo para importação de resultados de simulado:

- schema de alunos (id, nome, escola, turma, série)
- schema de questões (disciplina, componente, assunto, gabarito)
- schema de respostas (aluno, questão, alternativa marcada, presença)
- schema de professores/autores (disciplina, frente, questões associadas)

#### 2.3 Funções de cálculo isoladas

Separar do `app.js` as funções de cálculo de métricas:

```
assets/js/
├── metrics/
│   ├── calcAcerto.js
│   ├── calcDiscriminante.js
│   ├── calcPontoBisserial.js
│   ├── calcEvolucao.js
│   └── classifyStatus.js
```

Isso facilita testes unitários e migração futura para backend.

#### 2.4 Exemplos de planilhas

Criar planilhas de exemplo na pasta `data/samples/` com dados fictícios no formato definido para importação.

**Critério de saída:** estrutura de pastas organizada, schema de dados documentado e validado, funções de cálculo isoladas e testáveis.

---

### Fase 3 — Backend

**Status: futura.**

**Objetivo:** construir a camada de backend para persistência, cálculo server-side, autenticação e geração profissional de PDF.

#### Stack recomendada

```
Python + FastAPI        — API REST
PostgreSQL / Supabase   — banco de dados relacional
Playwright / Puppeteer  — geração de PDF via HTML template
Storage (S3 ou similar) — arquivos de planilha e relatórios
```

#### Funcionalidades do backend

- Autenticação por perfil (gestor, coordenador)
- Upload e validação de planilhas de resultados
- Cálculo server-side das métricas (discriminante, ponto-bisserial, evolução)
- Geração de PDF via template HTML (qualidade profissional)
- Persistência de simulados e histórico
- Separação de dados por escola e ciclo
- API REST consumida pelo frontend

#### Contratos de API (exemplos)

```
GET  /api/simulados
GET  /api/simulados/:id
GET  /api/simulados/:id/questoes
GET  /api/escolas
GET  /api/alunos
GET  /api/professores
POST /api/simulados/:id/devolutiva
POST /api/upload/planilha
```

**Critério de saída:** plataforma funcional com dados reais importados, autenticação operacional, PDF gerado com qualidade profissional e persistência de histórico.

---

### Fase 4 — Modularização do frontend

**Status: futura — depende de validação do produto.**

**Objetivo:** migrar o frontend para uma arquitetura componentizada e tipada.

#### Opções de stack

| Opção | Prós | Contras |
|---|---|---|
| React + Vite | ecossistema maduro, componentes reutilizáveis | curva de aprendizado |
| Next.js | SSR, rotas, API routes integradas | maior complexidade |
| HTML/JS modular (atual) | sem build, fácil de rodar | estado manual, sem tipagem |

#### Atividades

- Avaliar e decidir sobre migração para React ou Next.js
- Componentizar sidebar, header, cards, tabelas e gráficos
- Separar páginas em módulos independentes
- Adicionar tipagem com TypeScript
- Configurar build (Vite ou similar)
- Escrever testes para componentes críticos

**Critério de saída:** frontend modular, tipado, com componentes reutilizáveis e testes básicos funcionando.

---

## 6. Prioridades imediatas

Para a próxima sessão de trabalho, na ordem:

1. **Corrigir labels ENEM → ITA em `data.js`** — impacto direto na identidade do produto
2. **Integrar Devolutivas dentro de Professores** — alinha código com decisão de produto
3. **Padronizar shell visual** — sidebar, header, tabs (sem mudar lógica)
4. **Organizar `data.js`** — separar em arquivos por entidade

Essas quatro ações podem ser feitas sem backend e sem mudança de stack.

---

## 7. Critérios para avançar entre fases

| De → Para | Critério |
|---|---|
| Fase 0 → Fase 1 | Documentação completa e aprovada |
| Fase 1 → Fase 2 | Identidade ITA correta, Devolutivas integrada, shell visual padronizado |
| Fase 2 → Fase 3 | Schema de dados definido, MVP validado com usuário real |
| Fase 3 → Fase 4 | Backend estável, dados reais em produção, produto validado |

---

## 8. Visão de longo prazo

O produto Arco deve evoluir de protótipo interno para plataforma de inteligência pedagógica escalável.

Ao final da Fase 3, o produto deve ser capaz de:

- receber planilhas de resultados de qualquer simulado ITA;
- calcular automaticamente todas as métricas pedagógicas;
- gerar devolutivas em PDF de qualidade profissional para cada professor;
- mostrar ao gestor o panorama completo da rede, escolas, alunos e frentes;
- emitir alertas pedagógicos precisos e acionáveis.

A visão de longo prazo inclui:

- portal de acesso para coordenadores de escola;
- devolutiva para alunos (além de professores);
- integração com histórico multi-ano;
- alertas preditivos baseados em tendência;
- análise comparativa entre simulados de diferentes ciclos.

---

## 9. Síntese

O protótipo atual já valida a visão do produto. O próximo passo é transformar essa visão em produto real, sem perder a identidade pedagógica construída.

A ordem correta é:

```
documentar bem
↓
organizar o que existe
↓
refinar o protótipo
↓
preparar scaffold técnico
↓
construir backend
↓
modularizar frontend
↓
produto completo
```

Cada fase depende da anterior. Pular etapas gera retrabalho.
