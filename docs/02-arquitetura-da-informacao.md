# 02 — Arquitetura da informação

## 1. Papel deste documento

Este documento define como a plataforma Arco organiza suas telas, navegação, níveis de análise, filtros e fluxos de investigação.

A arquitetura da informação precisa proteger uma ideia central:

> A plataforma não é um conjunto de páginas soltas.
> Ela é um sistema de investigação pedagógica sobre simulados ITA.

Cada área deve existir porque responde a uma pergunta real do gestor, do coordenador ou da equipe pedagógica.

A plataforma deve evitar dois riscos:

1. Virar um dashboard genérico, cheio de gráficos bonitos, mas sem consequência pedagógica.
2. Virar um relatório estático, onde o usuário precisa fazer sozinho todo o trabalho de interpretação.

A arquitetura correta é aquela que conduz o usuário de forma natural:

```
panorama → sinal → investigação → evidência → ação
```

---

## 2. Hierarquia conceitual do produto

A plataforma trabalha com cinco eixos principais:

```
Simulado → Questão → Disciplina / Frente
        ↓
Aluno → Escola / Turma → Rede
        ↓
Professor / Autor → Devolutiva
```

Esses eixos se relacionam da seguinte forma:

- O **simulado** é o evento central de análise.
- A **questão** é a unidade mínima de diagnóstico.
- A **disciplina/frente** organiza o conhecimento pedagógico.
- O **aluno** mostra o efeito individual do processo.
- A **escola/turma** mostra o comportamento coletivo e institucional.
- O **professor/autor** é analisado indiretamente, pela qualidade técnica das questões e pelo desempenho dos alunos na frente associada.
- A **devolutiva** transforma os dados em comunicação pedagógica profissional.

A plataforma não deve ser pensada como um sistema de gestão escolar completo. Ela é uma ferramenta analítica especializada em simulados ITA.

---

## 3. Navegação principal

A navegação deve ser enxuta, com poucas áreas de alto valor.

### Estrutura atual implementada

```
Home
Simulados
Escolas
Alunos
Professores
Devolutivas   ← existente no protótipo, mas será movida para dentro de Professores
```

### Estrutura de produto definida

```
Home
Simulados
Escolas
Alunos
Professores
```

**Decisão de produto — Devolutivas:** a página Devolutivas não deve existir como área independente na sidebar. No protótipo atual ela ainda aparece isolada, mas a decisão está tomada: a geração de devolutiva deve ficar dentro da página Professores, como o terceiro passo natural do fluxo de análise de uma frente. A correção desta estrutura está prevista em etapa futura de refino da interface.

No futuro, quando houver uma área específica para coordenadores de escola, pode existir uma seção mais ampla de relatórios institucionais. Por enquanto, o foco da devolutiva é o professor/autor.

---

## 4. Regra de ouro da arquitetura

Cada página deve responder a uma pergunta principal.

Se uma página tenta responder muitas perguntas ao mesmo tempo, ela fica confusa. Se um gráfico não responde uma pergunta clara, ele deve sair.

| Página | Pergunta principal |
|---|---|
| Home | O que merece atenção agora? |
| Simulados | O que este simulado revela sobre aprendizagem e qualidade da prova? |
| Escolas | Quais escolas precisam de acompanhamento e por quê? |
| Alunos | Quem precisa de atenção individual e qual é o perfil de aprendizagem? |
| Professores | O que as questões de uma frente revelam sobre aprendizagem dos alunos e qualidade do simulado? |

---

## 5. Home

### 5.1. Papel da Home

A Home é o painel inicial de vigilância pedagógica.

Ela não deve tentar explicar tudo. Ela deve mostrar rapidamente:

- Estado geral da rede
- Principais alertas
- Prioridades do momento
- Sinais que merecem investigação
- Atalhos para as áreas mais importantes

A Home deve fazer o gestor sentir:

> "Eu abri a plataforma e ela já me disse onde olhar."

### 5.2. Conteúdos essenciais

- KPIs macro da rede
- Panorama da rede
- Prioridades do momento
- Acesso rápido por área
- Filtro de simulado

### 5.3. KPIs da Home

Os KPIs devem ser poucos e estratégicos.

| KPI | Função |
|---|---|
| Desempenho geral | Média geral da rede no simulado atual ou acumulado |
| Presença no simulado | Adesão e confiabilidade da amostra |
| Habilidades críticas | Quantos pontos pedagógicos exigem atenção |
| Alunos em atenção | Volume de alunos que precisam de acompanhamento |

Evitar KPIs inúteis, como "escolas avaliadas", quando esse número não muda e não gera decisão.

### 5.4. Panorama da rede

O Panorama deve apresentar 3 a 5 sinais interpretáveis.

Exemplos:

- Rede acima/abaixo da meta
- Escolas abaixo do esperado
- Conteúdo crítico do ciclo
- Presença abaixo do planejado
- Crescimento ou queda em relação ao simulado anterior

Cada item do Panorama deve poder ser expandido, mostrando dado base, comparação, leitura pedagógica curta e próximo caminho recomendado.

### 5.5. Prioridades do momento

As prioridades devem ser mais acionáveis que descritivas.

Exemplos adequados:

- "5 escolas abaixo do esperado em Matemática."
- "842 alunos precisam de acompanhamento."
- "Eletromagnetismo aparece como frente crítica."
- "Participação caiu 8 p.p. em relação ao simulado anterior."

Exemplos inadequados:

- "Dados atualizados."
- "Simulado aplicado."
- "28 escolas avaliadas."

### 5.6. Acesso rápido

O acesso rápido não deve ser apenas um conjunto de links. Cada card deve mostrar o principal sinal da área.

| Card | Informação útil |
|---|---|
| Escolas | Principal alerta das escolas |
| Simulados | Quantidade de questões críticas |
| Professores | Frentes com itens que pedem revisão |
| Alunos | Volume de alunos em atenção |

---

## 6. Simulados

### 6.1. Papel da página Simulados

A página Simulados é uma das áreas mais importantes do produto.

Ela responde à pergunta:

> "O que este simulado revelou sobre a aprendizagem dos alunos e sobre a qualidade da prova?"

Ela não deve ser apenas uma grade de questões. Deve ser uma análise técnica e pedagógica do simulado.

### 6.2. Estrutura implementada

A página Simulados tem três abas:

```
Anatomia do simulado
Disciplinas
Evolução
```

### 6.3. Aba Anatomia do simulado

A aba Anatomia é o mapa da prova — permite investigar questão por questão.

Ela contém:

- Grade visual das 48 questões (com status por cor)
- Painel detalhado da questão selecionada
- Resumo técnico do simulado
- Distribuição de alternativas
- Sinais detectados

A grade mostra status visual por cor semântica:

| Cor | Significado |
|---|---|
| Verde | Questão acima do esperado |
| Âmbar | Questão em atenção pedagógica |
| Vermelho | Questão crítica |
| Cinza | Questão neutra |

Ao clicar em uma questão, o painel mostra: disciplina, frente/componente, assunto, dificuldade, índice de acerto, discriminante, grau de dificuldade, correlação ponto-bisserial, distrator dominante, distribuição por alternativa e hipótese pedagógica.

A hipótese pedagógica deve ser curta e baseada nos dados.

Exemplo:

> "A alternativa C concentrou parte relevante dos erros, sugerindo confusão entre associação em série e paralelo."

### 6.4. Aba Disciplinas

A aba Disciplinas responde:

> "Como cada disciplina e frente se comportou dentro do simulado?"

Ela contém três colunas: lista de disciplinas, visão da disciplina selecionada e questões da disciplina.

Cada questão listada mostra assunto, acerto, discriminante, distrator dominante, status e botão para conclusão pedagógica expansível.

### 6.5. Aba Evolução

A aba Evolução responde:

> "Como os resultados evoluem ao longo dos simulados?"

O usuário escolhe uma métrica:

- Média geral
- Índice de acerto
- Participação
- Índice de qualidade técnica

Para cada métrica, aparecem gráficos comparativos entre grupos (escolas, turmas, rede).

---

## 7. Escolas

### 7.1. Papel da página Escolas

A página Escolas responde:

> "Quais escolas estão indo bem, quais precisam de atenção e em quais componentes isso aparece?"

Ela não deve ser apenas um ranking. Deve ajudar a explicar diferenças entre escolas.

### 7.2. Estrutura implementada

A página Escolas tem quatro abas:

```
Visão geral
Ranking
Desempenho
Componentes
```

### 7.3. Aba Visão geral

Funciona como uma Home específica da página Escolas.

Contém filtro de simulado ou visão acumulada, KPIs de rede (média, maior média, maior presença, mais evoluiu, em atenção), panorama das escolas e prioridades.

Evitar cards estáticos como "escolas avaliadas", pois isso não gera decisão.

### 7.4. Aba Ranking

Permite comparar escolas por uma métrica selecionável:

- Média geral
- Matemática
- Física
- Química
- Língua Inglesa
- Presença

A tabela mostra posição, escola, valor da métrica, variação e status.

### 7.5. Aba Desempenho

Responde:

> "Como a escola escolhida está evoluindo no desempenho geral e nas disciplinas?"

Filtros: escola, simulado/acumulado.

Contém: média da escola, presença, posição na rede, variação vs. simulado anterior, gráfico de evolução da média, desempenho por disciplina e distribuição por faixa de desempenho.

### 7.6. Aba Componentes

Responde:

> "Em quais disciplinas e frentes a escola está forte ou frágil?"

Filtros: escola, disciplina.

Mostra componentes com maior desvio em relação à rede, pontos fortes, fragilidades e evolução por disciplina ao longo dos simulados.

---

## 8. Alunos

### 8.1. Papel da página Alunos

A página Alunos responde:

> "Quem precisa de acompanhamento individual e qual é o perfil de aprendizagem desse aluno?"

### 8.2. Estrutura implementada

A página Alunos tem duas abas:

```
Ranking
Perfil do aluno
```

### 8.3. Aba Ranking

Mostra todos os alunos (80) de forma comparável.

Colunas: posição, nome, escola, turma, série, média geral, Matemática, Física, Química, Inglês, presença, evolução, status.

Filtros: simulado/acumulado, escola, turma, busca por nome, ordenação.

Status possíveis:

| Status | Critério |
|---|---|
| Em crescimento | Evolução positiva consistente |
| Estável | Variação pequena |
| Atenção | Média baixa ou queda com baixa participação |
| Queda recente | Queda relevante no último simulado |
| Alto desempenho | Média consistentemente acima da rede |
| Irregular | Alta oscilação entre simulados |

O ranking não deve ser usado para expor alunos de forma punitiva. É uma ferramenta de priorização pedagógica.

### 8.4. Aba Perfil do aluno

Mostra o diagnóstico pedagógico de um aluno específico.

Identificação: nome, escola, turma, série, status, posição na rede.

KPIs do perfil: média geral, participação, evolução, ponto forte, ponto de atenção.

Seções de diagnóstico (visual, não textual):

- Diagnóstico por disciplina com barras comparativas
- Benchmark vs. rede, escola, turma e top 10%
- Card de risco pedagógico
- Plano de ação sugerido
- Gráficos de desempenho por disciplina e evolução da média
- Síntese pedagógica
- Pontos fortes e pontos de atenção
- Histórico por simulado

### 8.5. Comparações importantes no Perfil

Todo número individual deve ter referência.

Comparações úteis:

- Aluno vs. rede
- Aluno vs. escola
- Aluno vs. turma
- Aluno vs. top 10%
- Aluno vs. simulado anterior
- Aluno vs. próprio histórico

---

## 9. Professores

### 9.1. Papel da página Professores

A página Professores precisa ser tratada com cuidado.

Ela não deve responder: "O professor é bom ou ruim?"

Ela deve responder:

> "O que as questões dessa frente revelam sobre a aprendizagem dos alunos e sobre a qualidade técnica do simulado?"

A inferência sobre professor deve ser indireta, profissional e nunca pessoal.

### 9.2. Contexto atual

O projeto considera 5 professores/autores:

- 2 de Física
- 1 de Química
- 1 de Matemática
- 1 de Língua Inglesa

Todos atuam na rede online para todos os alunos de todas as escolas. Eles também participam da construção das questões do simulado.

Portanto, não faz sentido associar professor a uma escola ou turma específica.

### 9.3. Estrutura implementada

A página Professores tem três abas:

```
Painel da frente
Itens e evidências
Aprendizagem
```

**Nota sobre a Devolutiva:** a geração da devolutiva em PDF para o professor deve existir como ação dentro desta página (botão "Gerar devolutiva" ou aba "Devolutiva"). A página independente de Devolutivas na sidebar está prevista para ser incorporada aqui em etapa futura.

### 9.4. Aba Painel da frente

Visão executiva da frente/disciplina associada ao professor.

KPIs implementados:

- Questões analisadas
- Acerto médio
- Evolução
- Discriminante médio
- Distratores funcionais
- Revisão sugerida

Gráficos:

- Scatter de acerto × discriminante (com quadrantes: zona ideal, difícil e diagnóstico, pouco informativo, revisão técnica)
- Sinais pedagógicos da frente
- Leitura executiva da frente

### 9.5. Aba Itens e evidências

Detalha cada questão da frente.

Inclui filtro por qualidade (Todos, Excelente, Boa, Atenção, Revisão sugerida).

Gráficos: arquitetura do conjunto (dificuldade × qualidade) e distratores em funcionamento.

Lista de questões com detalhe expansível: número, assunto, acerto, discriminante, dificuldade, distrator dominante, status, hipótese pedagógica, sugestão para aula.

### 9.6. Aba Aprendizagem

Foco no desempenho dos alunos naquela frente ao longo dos simulados.

KPIs: acerto médio, evolução, melhor componente, componente fragilizado, itens diagnósticos.

Gráficos: evolução da frente nos simulados, mapa de domínio por componente, distribuição de domínio.

Seções: hipóteses pedagógicas, ações recomendadas, impacto da frente.

---

## 10. Relatórios e devolutivas

### 10.1. Papel dos relatórios

Relatórios não são apenas exportações.

Eles servem para transformar dados em comunicação institucional.

No protótipo atual, o principal relatório é a devolutiva para professor, gerada via jsPDF.

Tipos futuros planejados:

- Relatório para coordenador de escola
- Relatório para direção
- Relatório individual do aluno
- Relatório por simulado (visão geral da rede)

### 10.2. Princípios dos PDFs

Os PDFs devem seguir:

- Visual premium e limpo, com cara Arco
- Sem exageros decorativos
- Linguagem técnica acessível
- Poucos gráficos, dados com instrução de leitura
- Conclusões curtas com foco em ação pedagógica

O PDF não deve parecer peça publicitária. Deve parecer documento profissional de empresa educacional.

---

## 11. Filtros

### 11.1. Papel dos filtros

Filtros não devem existir apenas porque "dá para filtrar".

Eles só devem existir quando mudam a leitura da página.

Filtros úteis implementados:

- Simulado
- Escola
- Turma
- Aluno
- Componente/frente
- Professor
- Status da questão
- Ordenação

### 11.2. Regra de filtro

Se o usuário muda um filtro, a página precisa mudar de verdade.

Toda mudança de filtro deve afetar: KPIs, gráficos, tabelas, textos diagnósticos, status visuais e listagens.

---

## 12. Gráficos

### 12.1. Regra dos gráficos

Todo gráfico deve responder uma pergunta pedagógica.

| Pergunta | Gráfico recomendado |
|---|---|
| A questão separa bem alunos fortes e fracos? | Scatter acerto × discriminante |
| O desempenho da escola está subindo? | Linha temporal |
| Quais assuntos estão frágeis? | Barras por assunto |
| A prova está bem calibrada? | Distribuição por dificuldade e discriminante |
| Há distrator forte? | Barras por alternativa |
| As turmas evoluem de forma parecida? | Linhas comparativas por turma |

Evitar: pizza sem necessidade, gráfico 3D, heatmap genérico sem interpretação, excesso de cores decorativas.

### 12.2. Gráficos implementados

- Linha temporal de evolução (escolas, turmas, rede)
- Barras horizontais de desempenho (disciplinas, assuntos)
- Scatter acerto × discriminante (Simulados e Professores)
- Barras por alternativa (distribuição de respostas)
- Distribuição por faixa de desempenho
- Mini sparklines em cards de evolução

---

## 13. Microinterações

As microinterações devem ser discretas e úteis.

Recomendações:

- Hover suave em cards
- Expansão de detalhes ao clicar
- Transição ao trocar simulado
- Badges que mudam cor por estado
- Gráficos com atualização suave
- Navegação entre questões com botões de seta

Evitar animações exageradas. O produto deve parecer premium, não infantil.

---

## 14. Estados importantes

A plataforma prevê estados como:

- Sem dados (exibe `—`)
- Seleção inicial necessária (ex.: "Selecione uma questão")
- Filtro sem resultado

Nunca exibir `null`, `undefined`, `NaN` ou `0` quando o correto é ausência de dado.

Padrão para ausência de dado: `—`

---

## 15. Linguagem

A linguagem da plataforma deve ser pedagógica, técnica na medida certa, profissional, objetiva e não punitiva.

Evitar:

- "professor ruim"
- "questão ruim"
- "aluno fraco"
- "fracasso"

Preferir:

- "revisão técnica sugerida"
- "questão com baixa discriminação"
- "aluno em atenção"
- "frente com lacuna relevante"
- "item prioritário para resolução"

---

## 16. Fluxos principais

### 16.1. Fluxo do gestor ao abrir a plataforma

```
Home
↓
identifica prioridade
↓
navega para escola, aluno, simulado ou professor
↓
analisa evidências
↓
define ação pedagógica
```

### 16.2. Fluxo de análise de simulado

```
Simulados
↓
escolhe simulado
↓
vê KPIs e sinais
↓
abre Anatomia
↓
clica em questões críticas
↓
analisa distratores e discriminante
↓
define questões para resolução
```

### 16.3. Fluxo de análise de escola

```
Escolas
↓
escolhe visão acumulada ou simulado específico
↓
analisa ranking
↓
abre Desempenho ou Componentes
↓
identifica disciplina/frente frágil
↓
compara com rede
```

### 16.4. Fluxo de análise de aluno

```
Alunos
↓
ranking
↓
filtra por status, escola ou turma
↓
abre perfil
↓
analisa evolução e pontos fracos
↓
define acompanhamento
```

### 16.5. Fluxo de devolutiva para professor

```
Professores
↓
seleciona professor/frente
↓
analisa painel da frente
↓
abre itens e evidências
↓
gera devolutiva
↓
professor usa relatório para aula pós-simulado
```

---

## 17. Decisões arquiteturais tomadas

### 17.1. Devolutivas dentro de Professores

**Decisão:** a geração de devolutiva não é uma área macro independente. É uma ação dentro da análise de frente, na página Professores.

Motivo: no MVP, a principal devolutiva é para professor; colocar como área independente cria a ilusão de produto mais completo do que é; o relatório faz mais sentido no contexto da análise técnica da frente.

### 17.2. Alunos com apenas duas abas

**Decisão:** Ranking e Perfil — não mais.

Motivo: reduz complexidade, evita repetição de informação em muitas abas, coloca o foco no que o gestor realmente precisa.

### 17.3. Simulados com três abas

**Decisão:** Anatomia, Disciplinas e Evolução.

Motivo: cobre análise da prova, análise por disciplina/frente e análise longitudinal sem fragmentação.

### 17.4. Professores sem avaliação pessoal direta

**Decisão:** a página analisa qualidade técnica dos itens, desempenho dos alunos na frente, hipóteses pedagógicas e sugestões de aula pós-simulado. Não analisa o mérito pessoal do professor.

### 17.5. Escolas com quatro abas

**Decisão:** Visão geral, Ranking, Desempenho e Componentes.

A aba Desempenho existe porque responde a uma pergunta diferente de Componentes: ela cobre a evolução temporal e o comparativo da escola, enquanto Componentes cobre a profundidade por disciplina/frente.

---

## 18. Decisões pendentes

Pontos a validar futuramente:

- A plataforma será usada apenas por gestores Arco ou também por coordenadores das escolas?
- Haverá login separado para professor?
- O professor verá apenas sua frente ou comparativos com outras frentes?
- O aluno terá acesso individual à plataforma?
- O relatório para professor será gerado automaticamente ou revisado antes do envio?
- O sistema analisará apenas 1ª fase ITA ou futuramente 2ª fase discursiva?
- A métrica de qualidade técnica do simulado será exibida abertamente ou usada apenas internamente?
- Haverá histórico de coortes?

---

## 19. Síntese

A arquitetura da informação da plataforma Arco deve proteger o foco pedagógico.

O produto não existe para mostrar dados. Ele existe para transformar simulados ITA em decisões pedagógicas.

Cada tela deve ajudar o usuário a responder:

- O que aconteceu?
- Onde está o problema?
- Qual evidência sustenta isso?
- Quem precisa de atenção?
- O que deve ser feito agora?

A lógica central é:

```
panorama → investigação → evidência → ação
```
