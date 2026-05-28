# 00 — Stack e arquitetura

Documento técnico de base do Sistema de Devolutiva Pedagógica Arco para simulados ITA.

Este arquivo descreve a estrutura técnica atual do projeto, as decisões de stack, a organização dos arquivos, as dependências externas e o caminho planejado de evolução do protótipo para um produto completo.

---

## 1. Status atual do projeto

O projeto está em fase de **protótipo avançado navegável**.

A versão atual já possui:

- Interface web funcional e navegável
- Home com KPIs, panorama e prioridades
- Página de Simulados com anatomia, disciplinas e evolução
- Página de Escolas com visão geral, ranking, desempenho e componentes
- Página de Alunos com ranking e perfil individual
- Página de Professores com painel da frente, itens/evidências e aprendizagem
- Página de Devolutivas (geração de relatório PDF — será integrada a Professores futuramente)
- Dados mockados determinísticos
- Gráficos interativos com Plotly.js
- Geração inicial de PDF com jsPDF
- Versionamento com Git/GitHub

Esta estrutura foi suficiente para validar:

- A visão do produto
- A navegação e os fluxos do gestor
- A linguagem pedagógica
- O estilo visual
- As principais métricas e análises
- A interação com filtros
- A organização das páginas e abas

---

## 2. Escopo educacional do produto

A plataforma é voltada exclusivamente para **simulados ITA**.

Isso significa que todas as decisões técnicas e de produto devem considerar:

- Simulados com foco no padrão do ITA
- Disciplinas centrais: Matemática, Física, Química e Língua Inglesa
- Análise de 1ª fase objetiva como prioridade inicial
- Possibilidade futura de análise de 2ª fase discursiva
- Alto nível de exigência conceitual nas questões
- Necessidade de leitura por assunto, frente e habilidade
- Importância de distinguir lacuna real de aprendizagem de problema de calibragem do item

A plataforma **não deve** ser tratada como produto genérico para ENEM ou vestibulares comuns. O ITA exige leitura mais técnica, longitudinal e conceitual.

**Pendência conhecida:** os dados mockados em `assets/js/data.js` ainda rotulam os simulados como "Simulado ENEM 2025". Esse ajuste deve ser feito nos dados mockados em etapa futura. A identidade correta é sempre **Simulado ITA**.

---

## 3. Stack atual

```
HTML5
CSS3
JavaScript puro (ES6+, sem framework)
Plotly.js 2.35     — gráficos interativos
jsPDF 2.5          — geração de PDF no cliente
Git / GitHub       — versionamento
Live Server        — servidor local de desenvolvimento (VS Code)
```

Não há build, bundler, transpiler, framework de frontend ou backend implementado. O projeto é inteiramente estático.

---

## 4. Estrutura de arquivos

```
Projeto-Arco/
├── README.md               ← visão geral do projeto para qualquer leitor
├── index.html              ← aplicação completa (todas as páginas em um único HTML)
├── assets/
│   ├── css/
│   │   ├── tokens.css      ← design tokens: cores, tipografia, sombras, bordas
│   │   └── main.css        ← estilos globais, layout, componentes, páginas
│   └── js/
│       ├── data.js         ← dados mockados (alunos, escolas, simulados, questões, professores)
│       ├── inference.js    ← motor de inferência pedagógica (hipóteses, status, sinais)
│       ├── charts.js       ← funções de renderização de gráficos Plotly
│       ├── filters.js      ← lógica de filtros, seletores e estado dos selects
│       ├── pdf.js          ← geração da devolutiva em PDF via jsPDF
│       └── app.js          ← lógica principal: navegação, renderização de páginas, estado global
└── docs/
    ├── 00-stack-e-arquitetura.md
    ├── 01-visao-de-produto.md
    ├── 02-arquitetura-da-informacao.md
    ├── 03-design-system.md
    ├── 04-telas-e-funcionalidades.md
    ├── 05-dados-e-estatistica.md
    ├── 06-questoes-abertas.md
    ├── 07-glossario.md
    └── 08-roadmap-e-proximos-passos.md
```

---

## 5. Responsabilidade de cada arquivo JS

### `data.js`

Contém todos os dados mockados da aplicação. É a fonte de verdade para o protótipo.

Inclui:

- Array `SIMULADOS` com 5 simulados e seus metadados
- Array `QUESTOES_RAW` com 48 questões e campos pedagógicos (acerto, discriminante, gabarito, distrator dominante, etc.)
- Array `ALUNOS` com 80 alunos distribuídos em 6 escolas e 2 turmas
- Array `PROFESSORES` com 5 professores/autores (2 de Física, 1 de Química, 1 de Matemática, 1 de Inglês)
- Médias por rede, escola, aluno e disciplina para os 5 simulados

**Não deve conter lógica de apresentação.** É apenas uma camada de dados.

### `inference.js`

Motor de inferência pedagógica. Recebe dados e retorna leituras interpretadas.

Responsabilidades:

- Classificar status de questões (acima, atenção, crítica, neutra)
- Gerar hipóteses pedagógicas a partir de acerto, discriminante e distrator
- Classificar status de alunos (em crescimento, estável, atenção, queda)
- Calcular sinais da Home e prioridades
- Gerar leituras automáticas de evolução

### `charts.js`

Funções de renderização de gráficos com Plotly.js.

Responsabilidades:

- Renderizar gráficos de linha temporal (evolução)
- Renderizar gráficos de barras horizontais (disciplinas, assuntos)
- Renderizar scatter de acerto × discriminante
- Renderizar distribuição por alternativa
- Renderizar distribuição por faixa de desempenho

Cada função recebe dados já processados e renderiza no elemento DOM passado.

### `filters.js`

Lógica de filtros e seletores da interface.

Responsabilidades:

- Gerenciar estado dos selects (simulado ativo, escola selecionada, aluno selecionado, etc.)
- Filtrar alunos por escola, turma, simulado e busca
- Filtrar questões por disciplina, status e professor
- Reagir a mudanças de seletor e re-renderizar a página correta

### `pdf.js`

Geração do relatório de devolutiva em PDF.

Responsabilidades:

- Montar a capa com identidade Arco
- Incluir KPIs executivos do simulado
- Listar questões prioritárias para resolução pós-simulado
- Incluir análise por disciplina/frente
- Usar jsPDF para gerar e baixar o arquivo

**Limitação atual:** jsPDF tem restrições para layouts complexos. Em versão futura, o PDF será gerado via HTML template + Playwright no backend.

### `app.js`

Lógica principal da aplicação.

Responsabilidades:

- Controlar a navegação entre páginas (Home, Simulados, Escolas, Alunos, Professores, Devolutivas)
- Manter o estado global da aplicação (`S` — objeto de estado)
- Inicializar cada página ao navegar
- Renderizar KPIs, panoramas, prioridades e tabelas
- Coordenar os outros módulos

---

## 6. Dependências externas

As dependências são carregadas via CDN diretamente no `index.html`. Não há `package.json` ou gerenciador de pacotes.

| Biblioteca | Versão | Finalidade | CDN |
|---|---|---|---|
| Plotly.js | 2.35.2 | Gráficos interativos | cdn.plot.ly |
| jsPDF | 2.5.1 | Geração de PDF | cdnjs.cloudflare.com |
| Plus Jakarta Sans | — | Tipografia principal | fonts.googleapis.com |

**Implicação:** o projeto requer conexão com internet para carregar as bibliotecas. Em desenvolvimento offline, os gráficos e o PDF não funcionarão sem ajuste para servir as libs localmente.

---

## 7. Organização do CSS

### `tokens.css`

Define todas as variáveis CSS globais (design tokens). Deve ser importado antes de `main.css`.

Contém:

- Cores institucionais (`--navy`, `--orange`, etc.)
- Cores semânticas (`--green`, `--amber`, `--red`, `--blue`)
- Superfícies e bordas (`--bg`, `--surface`, `--border`)
- Tipografia (`--f` — Plus Jakarta Sans)
- Sombras (`--shadow-sm`, `--shadow-md`, `--shadow-lg`)
- Transições (`--ease`, `--dur`)
- Raio de borda (`--r`, `--rsm`)

**Regra:** não usar valores de cor hardcoded em `main.css`. Sempre referenciar tokens.

### `main.css`

Contém todos os estilos da interface: layout base, sidebar, header, cards, KPIs, tabelas, gráficos, badges, botões e estilos específicos de cada página.

É um arquivo único e crescente. Em versão futura, pode ser dividido por página ou componente.

---

## 8. Arquitetura de navegação

O protótipo usa uma Single Page Application (SPA) manual — todas as páginas estão no mesmo `index.html` e são mostradas/escondidas via JavaScript.

```
index.html
├── #page-dashboard      ← Home
├── #page-simulados      ← Simulados
├── #page-escolas        ← Escolas
├── #page-alunos         ← Alunos
├── #page-professores    ← Professores
└── #page-devolutivas    ← Devolutivas (será movida para Professores)
```

A função de navegação em `app.js` exibe a página selecionada e esconde as demais via classe `hidden`.

---

## 9. Estado global

O estado da aplicação é mantido em um objeto global `S` em `app.js`.

Contém informações como:

- Simulado ativo
- Escola selecionada
- Aluno selecionado
- Professor/frente selecionados
- Questão selecionada
- Aba ativa em cada página
- Filtros ativos

**Limitação:** por não usar framework, o estado é manual. Em versão futura com React ou outro framework, isso seria gerenciado de forma mais robusta.

---

## 10. Convenções do código atual

- Modo estrito (`'use strict'`) em todos os arquivos JS
- Variáveis globais em `UPPER_SNAKE_CASE` para dados (ex.: `SIMULADOS`, `QUESTOES_RAW`)
- Funções de renderização em `camelCase` (ex.: `renderHome()`, `renderPerfil()`)
- Funções de filtro prefixadas com `set` (ex.: `setSimulado()`, `setEscola()`)
- IDs de elementos HTML prefixados por área (ex.: `dash-kpi-media`, `al-rank-tbody`)
- Classes CSS com prefixo de escopo (ex.: `.sb-` para sidebar, `.kpi-`, `.card-`)
- Ausência de dado exibida como `—` (em dash), nunca `null`, `undefined` ou `NaN`

---

## 11. Como rodar localmente

**Requisito:** VS Code com a extensão Live Server instalada.

```
1. Abrir a pasta Projeto-Arco no VS Code
2. Clicar com botão direito em index.html
3. Selecionar "Open with Live Server"
4. O navegador abrirá em http://127.0.0.1:5500/
```

Não é necessário instalar dependências. As bibliotecas são carregadas via CDN.

**Alternativa:** qualquer servidor HTTP estático funciona (ex.: `npx serve .`, `python -m http.server`).

---

## 12. Limitações técnicas atuais

| Limitação | Impacto | Planejado para |
|---|---|---|
| Dados mockados com "ENEM" nos labels | Inconsistência de identidade do produto | Próxima rodada de dados |
| Devolutivas como página independente na sidebar | Contraria decisão de produto | Refino de interface |
| index.html monolítico (~1100 linhas) | Difícil manutenção | Modularização futura |
| data.js com todos os dados em um único arquivo | Difícil trocar por dados reais | Separação em serviços |
| PDF gerado no cliente com jsPDF | Layout limitado | Backend + Playwright |
| Sem autenticação ou permissões | Apenas para uso interno/demonstração | Backend |
| Sem persistência de estado | Dados voltam ao padrão ao recarregar | Backend |

---

## 13. Evolução técnica planejada

### Fase 1 — Organização do protótipo (próxima)

- Corrigir labels de simulados de "ENEM" para "ITA" nos dados mockados
- Mover Devolutivas para dentro da página Professores
- Separar `data.js` em arquivos por entidade (`mock-alunos.js`, `mock-questoes.js`, etc.)
- Criar uma camada de serviço (`services/mockClient.js`)
- Completar documentação

### Fase 2 — Scaffold técnico

- Organizar estrutura de pastas em `web/`, `data/`, `reports/`
- Criar schema de dados de entrada (formato de planilha)
- Isolar funções de cálculo de métricas
- Criar exemplos de planilhas de importação

### Fase 3 — Backend

Stack recomendada:

```
Python + FastAPI         ← API REST
PostgreSQL / Supabase    ← banco de dados
Playwright / Puppeteer   ← geração de PDF profissional
Storage                  ← arquivos de planilha e relatórios
```

Funcionalidades cobertas pelo backend:

- Autenticação e permissões por perfil
- Upload e validação de planilhas
- Cálculo server-side das métricas (discriminante, ponto-bisserial)
- Geração de PDF via HTML template
- Persistência de simulados e histórico
- Separação de dados por escola e ciclo

### Fase 4 — Modularização do frontend

- Avaliar migração para React ou Next.js
- Componentizar sidebar, header, cards, tabelas e gráficos
- Separar páginas em módulos independentes
- Adicionar tipagem com TypeScript
