# 06 — Questões abertas e decisões pendentes

## 1. Papel deste documento

Este documento registra as decisões que ainda precisam ser validadas antes da evolução técnica completa da plataforma Arco para simulados ITA.

Ele existe para evitar três problemas comuns em projetos de produto:

1. seguir desenvolvendo sem clareza;
2. transformar hipóteses em verdades;
3. deixar decisões importantes escondidas em conversas soltas.

Sempre que uma decisão for tomada, ela deve ser registrada aqui e, se necessário, refletida nos documentos anteriores.

A regra é:

> O que ainda não foi validado não deve virar premissa definitiva.

---

## 2. Status geral do projeto

O projeto já tem uma visão de produto bem definida:

> Plataforma de inteligência pedagógica da Arco para transformar simulados ITA em diagnóstico, decisão e devolutiva.

O produto já possui:

- visão de produto;
- arquitetura da informação;
- design system;
- especificação das telas;
- métricas principais;
- protótipo HTML navegável;
- dados mockados;
- páginas principais;
- lógica inicial de filtros;
- geração inicial de relatórios;
- direcionamento visual;
- proposta de devolutiva em PDF.

Ainda faltam decisões sobre:

- entrada real de dados;
- estrutura de backend;
- formato das planilhas;
- modelo de autenticação;
- escopo do MVP;
- fluxo real de geração de PDF;
- validação com usuários;
- limites das métricas;
- priorização de desenvolvimento.

---

## 3. Questões abertas de produto

### 3.1 Quem é o usuário primário do MVP?

Hipótese atual:

> Gestor pedagógico / consultor pedagógico Arco

Esse usuário precisa ver:

- desempenho da rede;
- desempenho por escola;
- desempenho por turma;
- desempenho por aluno;
- qualidade dos simulados;
- qualidade técnica das questões;
- devolutivas para professores.

Usuários futuros possíveis:

- Coordenador da escola
- Professor
- Aluno
- Direção

**Decisão pendente:**

O MVP deve ser desenhado exclusivamente para o gestor Arco ou já deve considerar permissões diferentes para coordenadores e professores?

**Recomendação atual:**

Começar pelo gestor Arco. Professores recebem apenas PDF/devolutiva gerada, não acesso completo à plataforma no MVP.

### 3.2 A plataforma será ferramenta interna da Arco ou produto para escolas?

Existem dois caminhos:

**Caminho A — Ferramenta interna da Arco**

A Arco usa a plataforma para analisar simulados e gerar devolutivas.

Vantagens:

- menor complexidade;
- controle centralizado;
- menos necessidade de permissões;
- mais fácil validar;
- mais próximo da proposta inicial.

**Caminho B — Plataforma para escolas**

Coordenadores das escolas acessam a plataforma diretamente.

Vantagens:

- maior valor comercial;
- percepção de produto completo;
- possibilidade de assinatura ou pacote premium.

Desvantagens:

- exige login por escola;
- exige permissões;
- exige segurança maior;
- exige separação de dados;
- exige suporte;
- exige onboarding.

**Decisão pendente:**

No pitch para a Arco, a plataforma será apresentada como ferramenta interna de inteligência pedagógica ou como solução escalável para escolas parceiras?

**Recomendação atual:**

Apresentar como sistema interno primeiro, mas com arquitetura preparada para virar portal de escolas depois.

### 3.3 Qual é o escopo do MVP?

O projeto está crescendo bastante. É importante decidir o que entra na primeira versão funcional.

Escopo recomendado para MVP:

1. Home
2. Simulados
3. Escolas
4. Alunos
5. Professores
6. Devolutiva em PDF para professores
7. Importação inicial de dados

Funcionalidades que podem ficar para depois:

- login completo
- permissões por usuário
- portal do aluno
- portal da escola
- notificações automáticas
- integração com banco real avançado
- histórico multi-ano
- modelos preditivos complexos

**Decisão pendente:**

O MVP será uma plataforma navegável com dados importados ou apenas um protótipo visual refinado?

**Recomendação atual:**

Avançar para um MVP técnico simples, mas real:

```
frontend organizado + dados mockados estruturados + possibilidade futura de importação
```

---

## 4. Questões abertas de dados

### 4.1 Qual será o formato real dos arquivos de entrada?

Hoje existem documentos piloto, gabaritos e resultados que inspiram o produto. Mas ainda é preciso definir o formato oficial de entrada.

**Opção A — Planilha única consolidada**

Uma planilha com:

- aluno;
- escola;
- turma;
- série;
- simulado;
- respostas;
- nota;
- presença;
- disciplina;
- questão.

Vantagens:

- simples para importar;
- fácil de validar;
- bom para MVP.

**Opção B — Múltiplas planilhas**

Arquivos separados:

- cadastro de alunos;
- gabarito;
- respostas;
- matriz de questões;
- professores/autores;
- escolas/turmas.

Vantagens:

- mais organizado;
- mais próximo de sistema real.

Desvantagens:

- mais difícil para MVP.

**Decisão pendente:**

Qual será o schema mínimo dos dados de entrada?

**Recomendação atual:**

Começar com um modelo de planilha única consolidada e depois evoluir para múltiplas tabelas.

### 4.2 O sistema receberá respostas por alternativa ou apenas notas finais?

Essa decisão muda completamente a profundidade da análise.

**Se houver apenas nota final**, é possível analisar:

- média;
- ranking;
- evolução;
- participação;
- desempenho por aluno, escola e turma.

Mas não é possível analisar bem:

- distratores;
- discriminante;
- ponto-bisserial;
- qualidade da questão;
- resolução sugerida por item.

**Se houver resposta por questão**, é possível analisar:

- acerto por questão;
- distribuição por alternativa;
- distrator dominante;
- discriminante;
- ponto-bisserial;
- dificuldade empírica;
- qualidade do item;
- hipóteses pedagógicas.

**Decisão pendente:**

A Arco terá acesso às respostas por alternativa de cada aluno?

**Recomendação atual:**

Para a plataforma fazer sentido completo, precisa haver resposta por questão. Sem isso, a aba Simulados e Professores perdem grande parte do valor.

### 4.3 Como as questões serão classificadas por assunto?

A plataforma depende de taxonomia. Cada questão precisa ter:

- disciplina
- componente/frente
- assunto
- habilidade
- dificuldade esperada
- professor/autor

**Decisão pendente:**

Essa classificação virá pronta dos professores ou será feita manualmente pela equipe Arco?

Opções:

- professor informa ao cadastrar a questão;
- equipe pedagógica revisa e padroniza;
- IA sugere tags e humano valida;
- sistema usa taxonomia pré-definida.

**Recomendação atual:**

Usar fluxo híbrido:

```
professor informa → plataforma sugere padronização → gestor valida
```

### 4.4 Como tratar questões anuladas?

Questões anuladas devem continuar existindo no histórico, mas não devem distorcer médias.

**Decisão pendente:**

Questões anuladas entram na análise técnica ou ficam ocultas por padrão?

**Recomendação:**

- não entram na nota;
- aparecem como item anulado;
- podem ter análise técnica separada;
- não entram em rankings;
- não entram em discriminante médio.

### 4.5 Como tratar ausência?

Regra recomendada:

```
ausente ≠ zero
```

Aluno ausente:

- não entra na média;
- entra no cálculo de participação;
- aparece no perfil do aluno;
- pode gerar alerta de baixa participação.

**Decisão pendente:**

A base real diferencia ausência de nota zero? Essa diferença é obrigatória.

---

## 5. Questões abertas sobre métricas

### 5.1 Quais limiares serão usados para "atenção", "crítico" e "destaque"?

Hoje existem limiares propostos, mas ainda não calibrados.

Exemplos:

- acerto < 45% → atenção/crítico
- discriminante < 0,15 → revisão técnica sugerida
- presença < 80% → atenção
- queda > 5 p.p. → queda relevante

**Decisão pendente:**

Esses limiares fazem sentido para simulados ITA da Arco?

**Recomendação:**

Começar com limiares ajustáveis no código e calibrar com dados reais após 3 a 5 simulados.

### 5.2 Como medir "alunos em atenção"?

Critérios possíveis:

- baixa média;
- queda recente;
- baixa participação;
- ponto fraco em disciplina estratégica;
- distância grande em relação à turma;
- perfil irregular.

**Decisão pendente:**

O aluno em atenção deve ser definido por regra simples ou score composto?

**Recomendação:**

Usar score composto simples.

Exemplo:

```
+2 pontos se média < 45%
+1 ponto se queda > 5 p.p.
+1 ponto se presença < 75%
+1 ponto se duas disciplinas < 40%
+1 ponto se oscilação alta

score >= 3 → aluno em atenção
```

### 5.3 Como medir qualidade técnica do simulado?

O produto já discutiu várias métricas possíveis:

- discriminante médio;
- ponto-bisserial;
- distribuição de dificuldade;
- distratores funcionais;
- cobertura de assuntos;
- questões diagnósticas;
- questões com revisão sugerida.

**Decisão pendente:**

A plataforma deve exibir um índice único de qualidade ou apenas mostrar as dimensões separadas?

**Recomendação atual:**

Evitar índice único em telas principais. Usar dimensões separadas e linguagem interpretável.

Exemplo:

- Discriminante médio
- Distratores funcionais
- Questões diagnósticas
- Revisão técnica sugerida
- Equilíbrio de dificuldade

Se houver índice, usar apenas internamente para ordenação.

### 5.4 O que significa "questão com resolução sugerida"?

Essa métrica é central para as devolutivas.

Critérios possíveis:

- baixo acerto;
- distrator dominante forte;
- alta relevância do assunto;
- bom discriminante;
- muitos alunos errando;
- assunto recorrente no ITA.

**Decisão pendente:**

A resolução sugerida deve priorizar questão difícil, questão diagnóstica ou questão de assunto estratégico?

**Recomendação:**

Usar combinação:

```
baixo acerto + distrator forte + relevância pedagógica
```

Uma questão muito difícil, mas pouco diagnóstica, pode não ser a melhor para resolver em sala.

### 5.5 Como medir evolução?

**Diferença simples:**

```
simulado atual - simulado anterior
```

Vantagem: fácil de entender.

**Tendência:**

```
inclinação da reta nos últimos simulados
```

Vantagem: mais estável.

**Janela móvel:**

```
média dos últimos 3 - média dos 3 anteriores
```

Vantagem: menos sensível a ruído.

**Decisão pendente:**

Para o MVP, qual método será usado?

**Recomendação:**

Usar diferença simples na interface e tendência no motor interno.

---

## 6. Questões abertas de navegação e interface

### 6.1 Sidebar parecida com Poliedro ou identidade própria?

O usuário demonstrou preferência por:

- sidebar mais parecida com Poliedro;
- visual mais limpo;
- transições suaves;
- perfil no canto superior direito;
- menos excesso de elementos.

**Decisão pendente:**

A próxima rodada visual deve padronizar toda a interface nessa linha?

**Recomendação:**

Sim. Antes de avançar para backend pesado, padronizar shell visual:

- sidebar
- header
- topbar
- perfil
- filtros
- cards
- tabs

### 6.2 Devolutivas ficam na sidebar ou dentro de Professores?

**Decisão tomada:** Devolutivas devem sair da sidebar principal e entrar dentro da aba Professores.

Motivo:

- devolutiva inicial é para professores;
- não faz sentido ser área macro independente no MVP;
- futuramente pode existir devolutiva para escola/aluno;
- por enquanto, manter contextual.

**Nota de implementação:** No código atual (`index.html`), Devolutivas ainda é um item independente na sidebar. A integração para dentro da página Professores é uma pendência técnica registrada.

### 6.3 A página Professores deve ter qual linguagem?

**Decisão tomada:** A aba Professores não deve avaliar o professor diretamente.

Ela deve analisar:

- frente
- conjunto de questões
- aprendizagem dos alunos
- qualidade técnica dos itens
- prioridade de resolução

Evitar linguagem:

- professor bom
- professor ruim
- desempenho do professor

Preferir:

- leitura técnica da frente
- questões associadas
- resolução sugerida
- revisão técnica sugerida
- evidências de aprendizagem

### 6.4 Quantas abas por página?

Direção atual do protótipo (estado real do código):

| Página | Abas |
|---|---|
| Home | sem abas |
| Simulados | Anatomia, Disciplinas, Evolução |
| Escolas | Visão geral, Ranking, Desempenho, Componentes |
| Alunos | Ranking, Perfil |
| Professores | Painel da frente, Itens e evidências, Aprendizagem |

**Nota:** Devolutivas está presente na sidebar como página independente no código atual. Conforme decisão de produto (seção 6.2), deve ser integrada à página Professores.

Regra:

> Se a aba não responde uma pergunta diferente, ela deve ser removida.

---

## 7. Questões abertas técnicas

### 7.1 Continuar com HTML/CSS/JS puro ou migrar para framework?

Hoje o projeto está em HTML/CSS/JS puro.

Vantagens:

- simples;
- rápido de prototipar;
- fácil de rodar;
- compatível com Claude Code;
- bom para mockup.

Limitações:

- arquivos grandes;
- difícil manutenção;
- estado espalhado;
- pouca escalabilidade;
- componentes repetidos;
- sem build;
- sem tipagem.

**Decisão pendente:**

Quando migrar para uma estrutura mais profissional?

**Recomendação:**

Não migrar imediatamente. Primeiro organizar o projeto atual.

Depois, evoluir para:

```
frontend/
├── services/
├── components/
├── mock-data/
├── charts/
└── state/
```

Em uma fase posterior, avaliar React/Next.js.

### 7.2 Qual será a estrutura de pastas?

Estrutura recomendada para a próxima fase:

```
Projeto-Arco/
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
│   └── samples/
├── reports/
│   └── templates/
└── README.md
```

Se o projeto continuar no formato atual, ao menos manter documentados os arquivos existentes:

```
assets/css/main.css
assets/css/tokens.css
assets/js/data.js
assets/js/filters.js
assets/js/app.js
assets/js/charts.js
assets/js/inference.js
assets/js/pdf.js
index.html
```

### 7.3 Backend será necessário?

Sim, mas não imediatamente para o protótipo visual.

Backend será necessário para:

- login;
- upload de planilha;
- persistência de simulados;
- cálculo server-side;
- geração robusta de PDF;
- controle de escolas;
- dados reais;
- histórico;
- permissões.

Opção recomendada futura:

```
Python + FastAPI
Supabase/Postgres
Storage para arquivos
```

**Decisão pendente:**

A próxima fase será apenas organização frontend ou já scaffold backend?

**Recomendação:**

Organizar documentação e frontend primeiro. Depois criar scaffold backend.

### 7.4 Como gerar PDF?

**jsPDF no frontend** (estado atual):

Vantagens:

- fácil para MVP;
- sem backend;
- já iniciado.

Desvantagens:

- limitações visuais;
- difícil controlar layout avançado;
- pode quebrar em relatórios longos.

**HTML para PDF** (versão profissional):

Usar template HTML e converter com Playwright/Puppeteer.

Vantagens:

- melhor visual;
- reaproveita CSS;
- mais controle;
- bom para relatórios profissionais.

Desvantagens:

- exige backend ou pipeline Node.

**Recomendação:**

Para MVP: `jsPDF` simples. Para versão profissional: HTML template → PDF via Playwright.

### 7.5 Como lidar com dados mockados?

Os dados mockados devem continuar existindo, mas precisam ser organizados.

Problema atual:

- muitos dados embutidos em `data.js`;
- simulações úteis, mas arquivo cresce muito;
- difícil trocar por dados reais.

Recomendação — separar futuramente em:

```
mock-alunos.js
mock-escolas.js
mock-simulados.js
mock-professores.js
mock-questoes.js
```

E criar uma camada de serviço:

```
services/mockClient.js
```

Assim o frontend consome funções de serviço, não arrays soltos.

---

## 8. Questões abertas sobre relatórios

### 8.1 O PDF terá quantas páginas?

**Decisão atual:**

Capa + 3 páginas no máximo.

Estrutura:

1. Capa
2. Resumo técnico
3. Aprendizagem dos alunos
4. Questões prioritárias e plano de aula

### 8.2 O relatório será por professor ou por frente?

Na linguagem externa, pode aparecer professor. Na lógica analítica, deve ser por frente/conjunto de questões.

**Decisão recomendada:**

```
Relatório técnico-pedagógico do simulado
Professor responsável / Frente
```

Assim o professor entende que é para ele, mas o documento não vira avaliação pessoal.

### 8.3 Quais informações o professor precisa receber?

O professor precisa saber:

- como os alunos foram na disciplina/frente;
- quais assuntos tiveram maior dificuldade;
- quais questões devem ser resolvidas;
- quais distratores indicam erro conceitual;
- quais itens foram diagnósticos;
- quais pontos merecem revisão técnica;
- plano sugerido para aula pós-simulado.

Não precisa receber:

- ranking de professores;
- julgamento pessoal;
- estatística complexa;
- excesso de gráficos;
- comparação com outro professor.

---

## 9. Questões abertas de apresentação para a Arco

### 9.1 Como vender a ideia?

A proposta deve ser apresentada como:

> Uma camada de inteligência pedagógica sobre simulados ITA.

Não como:

> mais um dashboard

Frases úteis:

- A plataforma transforma o simulado em uma devolutiva acionável.
- O gestor não precisa garimpar sinais em planilhas; o sistema destaca onde agir.
- A análise não termina na nota: ela chega até questão, assunto, distrator e plano de intervenção.

### 9.2 Quais dores enfatizar?

Dores:

- gabarito em PDF é insuficiente;
- professores não recebem leitura clara do desempenho;
- gestor não enxerga rapidamente prioridades;
- escolas precisam de devolutivas mais ricas;
- simulados geram muitos dados, mas pouca decisão;
- cruzamento manual é lento;
- análises por questão quase nunca são exploradas.

### 9.3 Qual diferencial destacar?

Diferenciais:

- análise por questão;
- leitura pedagógica automática;
- distratores e discriminante;
- ranking e perfil de aluno;
- visão por escola;
- devolutiva PDF para professor;
- foco ITA;
- linguagem profissional;
- recomendações de resolução pós-simulado.

---

## 10. Ordem recomendada das próximas etapas

### 10.1 Etapa 1 — Documentação

**Status: quase completa.**

Arquivos com nomes corretos:

- [x] `README.md`
- [x] `docs/00-stack-e-arquitetura.md`
- [x] `docs/01-visao-de-produto.md`
- [x] `docs/02-arquitetura-da-informacao.md`
- [x] `docs/03-design-system.md`
- [x] `docs/04-telas-e-funcionalidades.md`
- [x] `docs/05-dados-e-estatistica.md`
- [x] `docs/06-questoes-abertas.md`
- [ ] `docs/07-glossario.md`
- [ ] `docs/08-roadmap-e-proximos-passos.md`

### 10.2 Etapa 2 — Organização do repositório

Criar estrutura:

```
docs/
web/
data/
reports/
```

Mover o protótipo para `web/`. Criar README raiz.

### 10.3 Etapa 3 — Refino visual global

Padronizar:

- sidebar;
- header;
- perfil;
- topbar;
- tabs;
- filtros;
- cards;
- estados;
- hover;
- transições.

### 10.4 Etapa 4 — Refino funcional

Priorizar:

- Home;
- Simulados;
- Escolas;
- Alunos;
- Professores;
- PDF.

### 10.5 Etapa 5 — Preparação para backend

Criar:

- schema de dados;
- exemplos de planilhas;
- contrato de API;
- serviços mockados;
- funções de cálculo isoladas.

---

## 11. Checklist antes de avançar para backend

Antes de iniciar backend pesado, verificar:

- [ ] a navegação está definida?
- [ ] o escopo do MVP está fechado?
- [ ] o layout base está padronizado?
- [ ] os dados mockados fazem sentido?
- [ ] as métricas principais estão documentadas?
- [ ] o formato de entrada está definido?
- [ ] o PDF tem estrutura clara?
- [ ] a página Professores não parece avaliação pessoal?
- [ ] o foco ITA está claro?
- [ ] existe README e documentação mínima?

---

## 12. Síntese

O projeto está forte em visão, visual e ambição.

O principal risco agora é tentar construir backend antes de consolidar:

- estrutura
- documentação
- escopo
- dados
- métricas
- fluxos

A recomendação é avançar com disciplina:

```
documentar
organizar
padronizar
validar
implementar
```

O projeto deve crescer sem perder sua ideia central:

> Transformar simulados ITA em inteligência pedagógica acionável para a Arco.
