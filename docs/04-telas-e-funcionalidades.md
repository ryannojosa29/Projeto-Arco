# 04 — Telas e funcionalidades

## 1. Papel deste documento

Este documento descreve as telas principais da plataforma Arco, suas abas internas, componentes, funcionalidades, perguntas respondidas e critérios de qualidade.

Ele serve como guia para:

- Revisão de produto
- Criação de prompts para Claude Code
- Validação do que cada tela precisa entregar
- Evitar que novas funcionalidades sejam adicionadas sem propósito

A plataforma não deve ser construída como uma coleção de cards bonitos. Cada tela precisa responder uma pergunta pedagógica real.

A lógica central é:

```
pergunta → dado → evidência → interpretação → ação
```

---

## 2. Estrutura geral da plataforma

### 2.1. Páginas principais implementadas

A plataforma possui as seguintes páginas no protótipo atual:

```
Home
Simulados
Escolas
Alunos
Professores
Devolutivas   ← existente no protótipo, mas será integrada a Professores
```

**Decisão de produto:** a página Devolutivas não deve existir como área independente na sidebar. Ela deve ser integrada à página Professores como ação de geração de relatório técnico-pedagógico. A correção está prevista para etapa futura de refino da interface.

Não há página de Configurações implementada na navegação atual.

### 2.2. Sidebar principal

A sidebar contém navegação principal com ícone + texto para cada página.

Regras:

- Deve ter logo Arco
- Deve destacar a página ativa
- Deve parecer produto institucional
- Deve ter perfil do usuário ou bloco institucional em área inferior

### 2.3. Header das páginas

Toda página tem um header com:

- Título
- Subtítulo explicativo
- Filtros principais
- Ação principal (quando houver)
- Identidade visual Arco discreta

---

## 3. Home

### 3.1. Pergunta principal

> O que merece atenção agora?

### 3.2. Objetivo

A Home deve fazer o gestor perceber rapidamente:

- Como a rede está no simulado atual
- Se o simulado teve boa participação
- Quais sinais exigem atenção
- Quais escolas, alunos ou frentes merecem investigação
- Quais áreas da plataforma devem ser acessadas primeiro

A sensação desejada é: "A plataforma já me disse onde olhar."

### 3.3. Estrutura implementada

```
1. Header com filtro de simulado e identidade Arco
2. Quatro KPIs executivos (cards)
3. Panorama da rede + Prioridades do momento
4. Acesso rápido por área
```

### 3.4. Filtro de simulado

O seletor de simulado deve estar no header.

Ao trocar o simulado, devem mudar: KPIs, panorama, prioridades, cards de acesso rápido, textos e sinais.

### 3.5. KPIs executivos

**Desempenho geral**

Mostra a média geral da rede no simulado selecionado.

Deve conter: valor principal, comparação com simulado anterior, mini gráfico sparkline de evolução e CTA para análise de desempenho.

**Presença no simulado**

Mostra adesão ao simulado: número de presentes, percentual de presença e comparação com esperado.

**Habilidades críticas**

Mostra quantas habilidades, assuntos ou frentes estão abaixo do esperado. Dinâmico por simulado.

**Alunos em atenção**

Mostra número de alunos com sinal de risco pedagógico e percentual do total.

### 3.6. Panorama da rede

Traz 3 a 5 sinais amplos e interpretáveis. Cada item pode ser expandido ao clicar, mostrando dado base, comparação e leitura pedagógica curta.

### 3.7. Prioridades do momento

Mostra ações mais urgentes. Cada prioridade deve ter ícone, título, microcopy e CTA.

Exemplos adequados:

- "3 escolas com queda significativa em Física"
- "842 alunos em atenção"
- "12 questões sugeridas para resolução pós-simulado"

### 3.8. Acesso rápido

Não deve ser apenas links. Cada card deve mostrar o principal sinal da área com badge de estado e frase curta.

### 3.9. Critérios de qualidade da Home

A Home está boa se:

- O gestor entende as prioridades em menos de 30 segundos
- Os KPIs mudam ao trocar simulado
- Não há textos longos
- Não há gráficos desnecessários
- A página parece institucional e limpa

---

## 4. Simulados

### 4.1. Pergunta principal

> O que este simulado revelou sobre aprendizagem, dificuldade, qualidade das questões e prioridades de intervenção?

### 4.2. Estrutura implementada

```
Header com executive strip de KPIs
Abas:
  1. Anatomia do simulado
  2. Disciplinas
  3. Evolução
```

### 4.3. Executive strip

Acima das abas, faixa de KPIs que muda ao trocar simulado:

- Média geral
- Participação
- Questões críticas
- Habilidade crítica
- Índice de qualidade

### 4.4. Aba Anatomia do simulado

**Função:** mapa da prova — permite clicar em qualquer questão e entender seu comportamento.

**Layout:**

```
Esquerda:  grade de questões + resumo técnico do simulado
Direita:   painel de detalhamento da questão selecionada
```

**Grade de questões:**

Cada célula mostra número da questão, gabarito e status visual por cor:

| Cor | Status |
|---|---|
| Verde | Acima do esperado |
| Âmbar | Atenção pedagógica |
| Vermelho | Crítica |
| Cinza | Neutra |

Ao trocar simulado, devem mudar: assuntos, disciplinas, status, gabaritos, dados e conclusões.

**Painel da questão (ao clicar):**

- Número, disciplina, componente/frente, assunto, dificuldade
- Índice de acerto, discriminante, grau de dificuldade, ponto-bisserial
- Distrator dominante
- Distribuição por alternativa
- Hipótese pedagógica
- Painel de contexto da rede

**Distribuição por alternativa:**

- Gabarito em verde
- Distrator dominante em âmbar/laranja
- Demais alternativas em cinza
- Percentual por alternativa visível

**Hipótese pedagógica:**

Curta, baseada nos dados. Sem conclusões absolutas.

Exemplo:

> "A concentração de respostas na alternativa C sugere confusão entre associação em série e paralelo."

**Resumo técnico do simulado:**

- Total de questões (48)
- Questões críticas, em atenção e acima do esperado (com percentuais)
- Sinais detectados (críticas, baixa discriminação, distratores, fáceis)

### 4.5. Aba Disciplinas

**Função:** responde "Em quais disciplinas, frentes e assuntos o simulado revelou lacunas?"

**Layout:**

```
Esquerda:  lista de disciplinas
Centro:    visão da disciplina selecionada (métricas, componentes)
Direita:   questões da disciplina com conclusão pedagógica expansível
```

Cada disciplina na lista mostra: nome, quantidade de questões, acerto médio, questões críticas, status.

A visão central mostra: acerto médio, discriminante médio, questões críticas, assunto sensível e lista de componentes.

### 4.6. Aba Evolução

**Função:** responde "Como média, acerto, participação e qualidade técnica evoluíram ao longo dos simulados?"

O usuário escolhe uma métrica:

- Média geral
- Índice de acerto
- Participação
- Índice de qualidade

Para cada métrica, aparecem gráficos comparativos entre escolas, turmas e rede.

Ao final, interpretação automática da evolução.

### 4.7. Critérios de qualidade de Simulados

A página está boa se:

- A anatomia permite investigar qualquer questão
- A troca de simulado muda realmente os dados
- A aba Disciplinas mostra assuntos diferentes por simulado
- Os gráficos de evolução comparam grupos
- As conclusões são baseadas em dados
- O gestor consegue escolher questões para resolução pós-simulado

---

## 5. Escolas

### 5.1. Pergunta principal

> Quais escolas estão indo bem, quais precisam de atenção e em quais frentes?

### 5.2. Estrutura implementada

```
Abas:
  1. Visão geral
  2. Ranking
  3. Desempenho
  4. Componentes
```

### 5.3. Aba Visão geral

Funciona como uma Home da página Escolas.

Elementos: filtro de simulado/acumulado, KPIs (média da rede, maior média, maior presença, mais evoluiu, em atenção), panorama das escolas e prioridades do momento.

Evitar "escolas avaliadas" como KPI principal — não gera decisão.

### 5.4. Aba Ranking

Permite comparar escolas por uma métrica.

Métricas disponíveis: média geral, Matemática, Física, Química, Língua Inglesa, presença.

Ao trocar a métrica: tabela, destaque da escola líder e status mudam.

A tabela mostra: posição, escola, valor da métrica, variação e status.

### 5.5. Aba Desempenho

Responde: "Como a escola escolhida está evoluindo no desempenho geral e nas disciplinas?"

Filtros: escola, simulado/acumulado.

Elementos: KPIs da escola (média, média da rede, diferença vs. rede, posição no ranking, presença), gráfico de evolução da média, desempenho por disciplina, distribuição por faixa e nota pedagógica.

### 5.6. Aba Componentes

Responde: "Em quais disciplinas e frentes a escola está forte ou frágil?"

Filtros: escola, disciplina.

Elementos: sinais relevantes da escola (componentes com maior desvio), pontos fortes, fragilidades e gráfico de evolução por disciplina.

Se filtro for "Todas as disciplinas": mostra componentes mais relevantes, positivos ou negativos.

Se filtro for uma disciplina específica: mostra todos os componentes daquela disciplina.

### 5.7. Critérios de qualidade de Escolas

A página está boa se:

- Todos os filtros alteram os dados
- A visão geral não tem KPI inútil
- O ranking é realmente comparativo
- A aba Componentes ajuda a localizar lacunas
- O gestor consegue decidir quais escolas acompanhar

---

## 6. Alunos

### 6.1. Pergunta principal

> Quem precisa de acompanhamento individual e por quê?

### 6.2. Estrutura implementada

```
Abas:
  1. Ranking dos alunos
  2. Perfil do aluno
```

### 6.3. Aba Ranking

**Função:** mostrar todos os alunos de forma comparável.

**Filtros:** simulado/acumulado, turma, escola, ordenar por, busca por nome.

**Colunas da tabela:** posição, nome, escola, turma, série, média geral, Matemática, Física, Química, Inglês, participação, evolução, status.

**KPIs do ranking:** média geral, em destaque (acima de 70%), em atenção, maior evolução, participação.

**Ao final:** leitura automática do ranking.

### 6.4. Aba Perfil do aluno

**Função:** mostrar o diagnóstico pedagógico de um aluno específico.

**Filtros:** aluno selecionado, simulado.

**Identificação (topo):** avatar com inicial, nome completo, escola, turma, série, simulado ativo, status e posição na rede.

**KPIs do perfil:** média, participação, evolução, ponto forte, ponto de atenção.

**Seções do diagnóstico:**

1. Card de diagnóstico principal — desempenho por disciplina com barras comparativas
2. Card de benchmark — vs. rede, vs. escola, vs. turma
3. Card de risco pedagógico
4. Card de plano de ação sugerido
5. Gráfico de desempenho por disciplina
6. Gráfico de evolução da média
7. Síntese pedagógica
8. Pontos fortes e pontos de atenção
9. Histórico por simulado

**Comparações obrigatórias:**

- Aluno vs. rede
- Aluno vs. escola
- Aluno vs. turma
- Aluno vs. top 10%
- Aluno vs. simulado anterior

### 6.5. Critérios de qualidade de Alunos

A página está boa se:

- O ranking é fácil de usar e filtrar
- O perfil muda de verdade ao trocar aluno ou simulado
- O diagnóstico é visual, não um bloco de texto
- Há comparações com rede, escola e turma
- O gestor sabe qual aluno acompanhar e por quê

---

## 7. Professores

### 7.1. Pergunta principal

> O que as questões dessa frente revelam sobre aprendizagem dos alunos e qualidade técnica do simulado?

Ela **não deve responder**: "O professor é bom ou ruim?"

### 7.2. Contexto

A plataforma considera 5 professores/autores: 2 de Física, 1 de Química, 1 de Matemática e 1 de Língua Inglesa.

Todos atuam na rede online para toda a rede. Não há professor vinculado a uma escola ou turma específica.

A análise é sobre: frente, conjunto de questões, desempenho dos alunos, qualidade dos itens e sugestões de aula pós-simulado.

### 7.3. Estrutura implementada

```
Filtros no header: professor, simulado, componente, botão exportar
Abas:
  1. Painel da frente
  2. Itens e evidências
  3. Aprendizagem
```

**Nota sobre Devolutiva:** a geração da devolutiva em PDF para o professor está implementada como botão "Gerar devolutiva" na aba Anatomia de Simulados e como botão na página Devolutivas (independente). A decisão de produto é integrar isso como ação dentro desta página Professores, como quarta aba ou ação explícita no painel. Essa integração está prevista para etapa futura.

### 7.4. Aba Painel da frente

**Função:** visão técnica e pedagógica executiva da frente.

**KPIs:**

- Questões analisadas
- Acerto médio
- Evolução (Sim 1 → Sim 5)
- Discriminante médio
- Distratores funcionais
- Revisão sugerida

**Elementos:**

- Card hero com leitura técnica da frente
- Mapa diagnóstico dos itens (scatter com quadrantes: zona ideal, difícil e diagnóstico, pouco informativo, revisão técnica)
- Sinais pedagógicos da frente

**Linguagem obrigatória:**

Usar: "frente", "conjunto de itens", "leitura técnica", "resolução sugerida", "revisão técnica sugerida", "evidência pedagógica".

Evitar: "professor ruim", "bom professor", "questão ruim", "falha do professor".

### 7.5. Aba Itens e evidências

**Função:** detalhar cada questão da frente com análise técnica.

**Filtro por qualidade:** Todos, Excelente, Boa, Atenção, Revisão sugerida.

**Gráficos:**

- Arquitetura do conjunto: dificuldade × qualidade
- Distratores em funcionamento

**Lista de questões:** cada item mostra número, assunto, acerto, discriminante, dificuldade, distrator dominante, status, sugestão de uso.

**Detalhe ao clicar:** distribuição por alternativas, gabarito, hipótese pedagógica, evidência, sugestão de resolução e leitura técnica.

**KPIs desta aba:** questões analisadas, acerto médio, discriminante médio, distratores funcionais.

### 7.6. Aba Aprendizagem

**Função:** foco no desempenho dos alunos naquela frente ao longo dos simulados.

**KPIs:** acerto médio, evolução, melhor componente, componente fragilizado, itens diagnósticos.

**Gráficos:**

- Evolução da frente nos simulados (linha temporal)
- Mapa de domínio por componente (barras)
- Distribuição de domínio (faixas)

**Seções:**

- Hipóteses pedagógicas (lacunas conceituais detectadas)
- Ações recomendadas para aula pós-simulado
- Impacto da frente no desempenho geral

### 7.7. Critérios de qualidade de Professores

A página está boa se:

- Não parece julgamento pessoal
- Ajuda a escolher questões para resolução pós-simulado
- Usa gráficos com propósito
- Mostra aprendizagem dos alunos na frente
- Mostra qualidade técnica dos itens
- Usa linguagem técnica e cuidadosa

---

## 8. Devolutiva em PDF

### 8.1. Estado atual

A geração de PDF está implementada via jsPDF em `assets/js/pdf.js`.

Existe uma página Devolutivas na sidebar que será integrada à página Professores futuramente.

### 8.2. Papel da devolutiva

A devolutiva é o documento que transforma a análise da plataforma em comunicação profissional para o professor/autor.

O professor deve conseguir responder com o relatório:

- Como os alunos foram na minha disciplina/frente?
- Quais questões devo resolver em aula?
- Quais assuntos apresentaram maior dificuldade?
- Quais distratores indicam erros conceituais?
- As questões foram bem calibradas?
- O que fazer no próximo ciclo?

### 8.3. Estrutura recomendada do PDF

```
Capa
Página 1 — Resumo técnico do simulado
Página 2 — Aprendizagem dos alunos
Página 3 — Questões prioritárias e plano de aula
```

Máximo recomendado: **Capa + 3 páginas**.

### 8.4. Capa

Deve conter: nome do relatório, disciplina/frente, simulado, data, marca Arco, visual limpo e institucional.

### 8.5. Página 1 — Resumo técnico

Deve conter: média geral do simulado, média da frente, participação, número de questões da frente, questões com resolução sugerida e instruções de leitura.

Evitar excesso de conclusão. Explicar como ler os dados.

### 8.6. Página 2 — Aprendizagem dos alunos

Deve conter: desempenho por assunto, assuntos com maior domínio, assuntos com maior dificuldade, evolução na frente e leitura curta.

### 8.7. Página 3 — Questões prioritárias e plano de aula

Deve conter: questões sugeridas para resolução em sala, acerto, discriminante, distrator dominante, hipótese pedagógica e sugestão de abordagem.

### 8.8. Critérios de qualidade do PDF

O PDF está bom se:

- O professor entende rapidamente o que deve fazer
- Não parece julgamento pessoal
- Não é gourmetizado demais
- Mostra dados e ensina a ler
- Cabe em no máximo 4 páginas
- Tem visual institucional e limpo

---

## 9. Funcionalidades transversais

### 9.1. Troca de simulado

Trocar simulado deve atualizar: KPIs, tabelas, gráficos, assuntos, conclusões, status, gabaritos e textos.

Não pode acontecer de mudar o select e apenas um texto mudar.

### 9.2. Cards expansíveis

Usados em: Home, Escolas, Disciplinas, questões individuais, prioridades e sinais.

Padrão: fechado mostra dado objetivo; aberto mostra explicação curta com evidência.

### 9.3. Busca

Implementada no ranking de alunos (campo de busca por nome).

### 9.4. Navegação entre questões

Na aba Anatomia do simulado: navegação por setas (anterior/próxima questão) além de clique na grade.

### 9.5. Exportação

PDF implementado: devolutiva gerada via jsPDF.

Exportações futuras planejadas: PDF por escola, CSV de ranking, relatório executivo da rede.

---

## 10. Checklist geral de cada tela

Antes de aceitar uma tela, verificar:

- A pergunta principal está clara?
- Os filtros mudam a tela de verdade?
- Há gráfico inútil?
- Há texto demais?
- Os KPIs são úteis?
- Existe comparação?
- A linguagem está profissional?
- A interface parece produto real?
- Há ação possível ao final da leitura?
- A tela está alinhada ao foco ITA?
- A tela parece avaliação pessoal de alguém? (se sim, revisar linguagem)

---

## 11. Síntese

As telas da plataforma Arco formam um fluxo contínuo:

```
Home
↓
Simulados / Escolas / Alunos / Professores
↓
Devolutiva (dentro de Professores)
```

A plataforma deve permitir que o gestor comece por uma visão geral e chegue rapidamente a uma evidência específica.

A regra principal é:

> Toda tela precisa transformar dado em decisão pedagógica.

Se um componente não ajuda nisso, ele deve ser removido, simplificado ou reposicionado.
