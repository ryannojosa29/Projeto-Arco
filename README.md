# Sistema de Devolutiva Arco · Simulados ITA

Plataforma de inteligência pedagógica para transformar simulados ITA em diagnóstico, decisão e devolutivas acionáveis para a Arco Educação.

---

## O que é este projeto

O Sistema de Devolutiva Arco é uma plataforma web de análise pedagógica para simulados ITA, voltada ao gestor pedagógico da Arco.

A plataforma parte de uma dor concreta: hoje, a análise dos simulados ainda depende de gabaritos em PDF, planilhas e leituras manuais. Esses materiais informam resultados, mas não revelam o que os dados indicam sobre aprendizagem, qualidade das questões, prioridades de intervenção e próximos passos.

A proposta é transformar cada simulado em uma central de análise pedagógica.

> O simulado não deve terminar no gabarito. Ele deve gerar diagnóstico, decisão e devolutiva.

---

## Proposta de valor

A plataforma deve fazer o gestor sentir três coisas:

- *Isso mostra sinais que eu não veria sozinho.*
- *Isso pensa pedagogicamente comigo.*
- *Isso me economiza horas de análise.*

---

## O que a plataforma já tem (estado atual do protótipo)

O projeto está em fase de **protótipo avançado navegável** em HTML, CSS e JavaScript puro, com dados mockados determinísticos.

### Páginas implementadas

| Página | O que responde |
|---|---|
| **Home** | O que merece atenção agora? |
| **Simulados** | O que esta prova revelou sobre aprendizagem e qualidade das questões? |
| **Escolas** | Quais escolas precisam de acompanhamento e em quais frentes? |
| **Alunos** | Quem precisa de atenção individual e por quê? |
| **Professores** | O que as questões dessa frente revelam sobre aprendizagem e qualidade técnica do simulado? |
| **Devolutivas** | Geração de relatório técnico-pedagógico em PDF |

> **Nota sobre Devolutivas:** A decisão de produto é que Devolutivas deve ficar dentro da página Professores, não como área independente da sidebar. A página Devolutivas atualmente existe de forma separada no protótipo, mas isso será corrigido em etapa futura de organização da interface. Ver docs/06-questoes-abertas.md.

### Funcionalidades presentes

- Home com KPIs executivos, panorama da rede, prioridades e acesso rápido
- Simulados com anatomia da prova, painel questão por questão, aba disciplinas e aba evolução
- Escolas com visão geral, ranking, desempenho e componentes (4 abas)
- Alunos com ranking completo e perfil individual com diagnóstico, benchmark e plano de ação
- Professores com painel da frente, itens e evidências, e aprendizagem (3 abas)
- Geração de PDF via jsPDF
- Filtros funcionais que alteram dados reais (simulado, escola, turma, aluno, componente)
- Gráficos interativos com Plotly.js (scatter, barras, linhas temporais, distribuição)
- Dados mockados determinísticos para 80 alunos, 6 escolas, 5 simulados e 48 questões
- Motor de inferência pedagógica em `inference.js`

---

## Pendência técnica conhecida

Os dados mockados em `assets/js/data.js` ainda rotulam os simulados como **"Simulado ENEM 2025"**. A identidade correta do produto é exclusivamente **Simulado ITA**. Esse ajuste deve ser feito nos dados mockados em etapa futura, sem quebrar os filtros e a lógica de exibição.

---

## O que a plataforma não é

- ERP escolar ou sistema de frequência
- Boletim tradicional de notas
- Ranking de professores ou ferramenta de avaliação pessoal
- BI genérico para qualquer vestibular
- Visualizador de planilhas sem análise pedagógica
- Versão digital de gabarito em PDF

---

## Público-alvo

**Usuário principal:** Gestor ou consultor pedagógico da Arco.

Usuários futuros possíveis: coordenadores de escolas parceiras, professores/autores de questões (via devolutivas em PDF), direção pedagógica.

No protótipo atual, o foco é exclusivamente no gestor Arco.

---

## Stack atual

```
HTML5
CSS3
JavaScript puro (ES6+)
Plotly.js 2.35 — gráficos
jsPDF 2.5 — geração de PDF
Git / GitHub — versionamento
Live Server (VS Code) — desenvolvimento local
```

Não há backend implementado. O protótipo usa dados mockados em `data.js`.

---

## Estrutura de arquivos

```
Projeto-Arco/
├── README.md
├── index.html
├── assets/
│   ├── css/
│   │   ├── tokens.css      ← design tokens (cores, tipografia, sombras)
│   │   └── main.css        ← estilos globais e componentes
│   └── js/
│       ├── data.js         ← dados mockados (alunos, escolas, simulados, questões)
│       ├── inference.js    ← motor de inferência pedagógica
│       ├── charts.js       ← renderização de gráficos Plotly
│       ├── filters.js      ← lógica de filtros e seletores
│       ├── pdf.js          ← geração de devolutiva em PDF
│       └── app.js          ← lógica principal, navegação e estados
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

## Como rodar localmente

O projeto pode ser aberto com Live Server no VS Code.

1. Abrir a pasta do projeto no VS Code.
2. Clicar com o botão direito no `index.html`.
3. Selecionar **Open with Live Server**.

O navegador abrirá em `http://127.0.0.1:5500/`.

> Evitar abrir o arquivo diretamente com `file://`, pois recursos de JavaScript podem não funcionar corretamente em versões futuras.

Não há instalação de dependências. As bibliotecas Plotly e jsPDF são carregadas via CDN no `index.html`.

---

## Documentação do projeto

A documentação fica na pasta `docs/`. Leitura recomendada:

| Arquivo | O que cobre |
|---|---|
| `00-stack-e-arquitetura.md` | Stack, estrutura técnica, dependências, evolução planejada |
| `01-visao-de-produto.md` | Problema, proposta de valor, usuários, princípios |
| `02-arquitetura-da-informacao.md` | Navegação, estrutura de páginas, filtros, fluxos |
| `03-design-system.md` | Paleta, tipografia, componentes visuais, gráficos |
| `04-telas-e-funcionalidades.md` | Especificação de cada tela e suas abas |
| `05-dados-e-estatistica.md` | Métricas, fórmulas, indicadores, dados mockados |
| `06-questoes-abertas.md` | Decisões pendentes e decisões tomadas |
| `07-glossario.md` | Vocabulário padrão do produto |
| `08-roadmap-e-proximos-passos.md` | Estado atual, próximas etapas, prioridades |

---

## Fluxo de trabalho com Claude Code

### Antes de pedir mudanças

- O projeto está salvo?
- Há commit recente?
- A tela atual funciona?
- Você consegue descrever o problema em bullets?
- Quais arquivos provavelmente serão alterados?

### O que pedir ao Claude Code

- Ler os arquivos relevantes antes de editar.
- Alterar apenas o necessário — não reescrever arquitetura inteira sem motivo.
- Preservar o que já funciona.
- Entregar resumo dos arquivos alterados.
- Entregar checklist de teste manual.

### Após mudanças, testar

- Navegação entre páginas
- Filtros (trocar simulado, escola, turma, aluno)
- Gráficos atualizam após filtro
- Troca de aluno no perfil
- PDF é gerado sem erro
- Console do navegador sem `undefined`, `NaN` ou erros
- Responsividade básica

---

## Convenção de commits

Usar mensagens claras e específicas.

Exemplos corretos:

```
git commit -m "Refina home e sinais pedagógicos"
git commit -m "Reestrutura página de simulados"
git commit -m "Ajusta ranking e perfil de alunos"
git commit -m "Melhora visão geral de escolas"
git commit -m "Corrige PDF da devolutiva do professor"
git commit -m "Atualiza dados mockados com identidade ITA"
```

Evitar:

```
git commit -m "alterações"
git commit -m "final"
git commit -m "teste"
```

---

## Dados mockados

Enquanto não houver backend, os dados mockados em `data.js` são a fonte de verdade da plataforma.

Regras dos mockados:

- Não usar aleatoriedade pura a cada carregamento — dados são determinísticos.
- Cada simulado tem identidade pedagógica própria (ex.: Matemática mais crítica no 1º, Física no 2º).
- Os assuntos mudam entre simulados.
- Os gabaritos podem mudar entre simulados.
- Os filtros alteram dados reais na tela — não apenas textos.

**Pendência:** os labels dos simulados em `data.js` estão como "Simulado ENEM 2025" e precisam ser corrigidos para "Simulado ITA". Ver `docs/06-questoes-abertas.md`.

---

## Próximo passo de backend (planejado, não iniciado)

Quando o protótipo estiver validado, o backend precisará cobrir:

- Autenticação e permissões
- Upload de planilhas com respostas dos alunos
- Persistência de simulados e histórico
- Cálculo server-side das métricas (discriminante, ponto-bisserial, etc.)
- Geração profissional de PDF via HTML template

Stack futura recomendada: Python + FastAPI, PostgreSQL / Supabase, Playwright para PDF.

---

## Status atual do projeto

```
Fase: protótipo avançado navegável
Interface: funcional e navegável
Dados: mockados determinísticos
Backend: não implementado
Login: não implementado
Dados reais: não conectados
```

---

## Síntese

O Projeto Arco existe para dar corpo a uma ambição:

> Transformar os simulados ITA da Arco em uma plataforma de diagnóstico pedagógico, leitura técnica e devolutiva profissional.

A plataforma deve ser bonita, mas não decorativa.
Analítica, mas não fria.
Completa, mas não poluída.
Técnica, mas compreensível.

O produto cumpre seu papel quando faz o gestor pensar:

> "Agora eu sei onde agir."
