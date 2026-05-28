# 07 — Glossário do projeto

## 1. Papel deste documento

Este glossário define os principais termos usados na plataforma Arco de inteligência pedagógica para simulados ITA.

Ele existe para manter consistência entre:

- produto;
- design;
- frontend;
- backend;
- relatórios;
- prompts para Claude Code;
- documentação;
- comunicação com a Arco.

A regra é simples:

> O mesmo conceito deve ter sempre o mesmo nome.

Evitar variações desnecessárias ajuda a plataforma parecer mais madura, profissional e coerente.

---

## 2. Termos gerais do produto

### Plataforma

Sistema web desenvolvido para transformar dados de simulados ITA em análises pedagógicas, sinais de atenção, dashboards e devolutivas.

Não usar como sinônimo de "site simples" ou "mockup".

### Produto

Conjunto da solução: interface, análises, métricas, relatórios, dados, regras de negócio e proposta de valor.

### MVP

Primeira versão funcional da plataforma.

No contexto atual, o MVP deve conter:

- Home
- Simulados
- Escolas
- Alunos
- Professores
- Devolutiva em PDF
- Dados mockados ou importação inicial

### Protótipo

Versão navegável para validar visual, estrutura e experiência.

Pode estar em HTML/CSS/JS puro. Não precisa ter backend completo.

### Mockup

Representação visual de uma tela ou fluxo.

Pode ser imagem ou HTML. Serve para validar aparência e organização antes da implementação final.

### Gestor

Usuário principal da plataforma no MVP.

É quem acompanha os dados da rede, interpreta os simulados e toma decisões pedagógicas.

Pode representar:

- gestor pedagógico
- consultor pedagógico Arco
- coordenação pedagógica
- liderança educacional

### Professor / Autor

Profissional associado a uma disciplina ou frente.

No projeto, ele não deve ser tratado como objeto de julgamento pessoal.

A plataforma analisa:

- questões associadas
- frente
- desempenho dos alunos
- qualidade técnica dos itens
- necessidade de resolução pós-simulado

Evitar:

- professor bom
- professor ruim
- desempenho do professor

Preferir:

- leitura técnica da frente
- conjunto de questões
- evidências de aprendizagem
- resolução sugerida

### Rede

Conjunto de todos os alunos, escolas e turmas considerados no simulado.

Exemplos de uso:

- Média da rede
- Participação da rede
- Alunos em atenção na rede

### Escola

Instituição de origem dos alunos.

No mockup, usar nomes genéricos:

- Escola A
- Escola B
- Escola C
- Escola D
- Escola E
- Escola F

### Turma

Agrupamento pedagógico dos alunos dentro da operação Arco.

No projeto atual:

- Turma 1 — alunos do 3º ano e alunos do 2º ano mais bem avaliados no processo de seleção
- Turma 2 — alunos do 1º ano e restante dos alunos do 2º ano

### Frente

Recorte de ensino dentro de uma disciplina.

Pode representar uma área de conteúdo ou o campo de atuação de um professor.

Exemplos:

- Eletromagnetismo
- Mecânica
- Estequiometria
- Combinatória
- Reading

### Disciplina

Área principal do simulado.

No MVP:

- Matemática
- Física
- Química
- Língua Inglesa

### Componente

Subdivisão pedagógica dentro de uma disciplina.

Pode ser usado como sinônimo operacional de frente, dependendo da tela.

Exemplo:

```
Disciplina: Física
Componente: Eletromagnetismo
Assunto: Associação de resistores
```

### Assunto

Tema mais específico de uma questão.

Exemplos:

- Leis de Newton
- Circuitos elétricos
- Gases ideais
- Cinética química
- Probabilidade condicional

### Habilidade

Competência ou operação cognitiva mobilizada pela questão.

Exemplos:

- interpretar gráfico
- aplicar conservação de energia
- modelar fenômeno físico
- resolver sistema algébrico
- inferir informação em texto

---

## 3. Termos de navegação

### Home

Tela inicial da plataforma.

Responde:

> O que merece atenção agora?

Não deve ser relatório completo. Deve orientar o próximo clique do gestor.

### Simulados

Página de análise do simulado.

Responde:

> O que o simulado revelou sobre aprendizagem, dificuldade e qualidade das questões?

### Escolas

Página de análise por escola.

Responde:

> Quais escolas estão indo bem, quais precisam de atenção e em quais frentes?

### Alunos

Página de análise por aluno.

Responde:

> Quem precisa de acompanhamento individual e por quê?

### Professores

Página de análise por frente/professor/autor.

Responde:

> O que as questões dessa frente revelam sobre aprendizagem dos alunos e qualidade técnica do simulado?

Não deve responder:

> O professor é bom ou ruim?

### Devolutiva

Relatório gerado para professor/autor.

**Decisão de produto:** no MVP, deve ficar dentro da página Professores, não como item independente da sidebar.

**Estado atual do código:** Devolutivas ainda é uma página independente na sidebar em `index.html`. A integração para dentro de Professores é uma pendência técnica registrada.

### Configurações

Área secundária para ajustes do sistema.

**Estado atual do código:** não existe na sidebar atual. Pode ser adicionada em versão futura quando o produto tiver autenticação e permissões.

### Sidebar

Menu lateral principal da plataforma.

Deve conter apenas páginas principais. Evitar excesso de itens.

### Header

Área superior da página ativa, contendo título, subtítulo, filtros principais e ações.

### Topbar

Barra superior usada para ações globais, perfil do usuário, filtros ou navegação secundária.

### Tabs

Abas internas de uma página.

Devem existir apenas quando representam perguntas diferentes.

Exemplo em Simulados:

- Anatomia
- Disciplinas
- Evolução

### Filtro

Controle que altera os dados exibidos.

Um filtro só deve existir se realmente mudar a tela. Evitar filtros decorativos.

### Drill-down

Ação de sair de uma visão geral e entrar em um detalhe.

Exemplo:

```
Home → Simulados → Questão 18
```

---

## 4. Termos de simulado

### Simulado

Prova aplicada aos alunos para medir desempenho, diagnosticar aprendizagem e preparar para o ITA.

### Simulado ITA

Simulado com foco específico no padrão do vestibular ITA.

A plataforma deve manter esse foco em linguagem, métricas e exemplos.

**Pendência técnica:** os dados mockados em `data.js` ainda usam o rótulo "Simulado ENEM 2025". O rótulo correto é "Simulado ITA". Esse ajuste deve ser feito nos dados em etapa futura.

### Questão

Item individual do simulado. É a menor unidade analítica da plataforma.

### Item

Sinônimo técnico de questão. Pode ser usado em contextos de qualidade de prova.

Exemplos:

- qualidade do item
- item diagnóstico
- item com revisão técnica sugerida

### Gabarito

Alternativa correta da questão.

Exemplo:

> Questão 12 — Gabarito C

### Alternativa

Opção de resposta em uma questão objetiva.

Exemplos: A, B, C, D, E.

### Distrator

Alternativa incorreta.

Um distrator é pedagogicamente relevante quando atrai muitos alunos ou revela um erro conceitual comum.

### Distrator dominante

Alternativa incorreta mais marcada pelos alunos.

Exemplo:

> Distrator dominante: B, marcado por 31% dos alunos

### Distrator funcional

Distrator que atrai uma quantidade relevante de alunos.

Regra inicial possível:

```
distrator funcional = alternativa incorreta marcada por pelo menos 10% a 15% dos alunos
```

### Distribuição por alternativa

Percentual de alunos que escolheu cada alternativa.

Exemplo:

```
A: 12%
B: 31%
C: 42%
D:  9%
E:  6%
```

### Questão diagnóstica

Questão que gera boa informação pedagógica.

Geralmente combina:

- acerto não extremo
- bom discriminante
- distrator dominante interpretável
- assunto relevante

### Questão com resolução sugerida

Questão recomendada para ser resolvida em aula pós-simulado.

Critérios possíveis:

- baixo acerto
- distrator dominante forte
- bom discriminante
- assunto estratégico
- alta concentração de erro

Esse é um termo central para a devolutiva ao professor.

### Questão com revisão técnica sugerida

Questão que merece revisão de construção, calibragem ou clareza.

Critérios possíveis:

- baixo discriminante
- ponto-bisserial baixo
- distrator superando o gabarito
- bons alunos errando mais que alunos fracos
- acerto muito baixo sem discriminar

Evitar dizer "questão ruim". Preferir "revisão técnica sugerida".

### Questão crítica

Questão que teve baixo desempenho ou gerou alerta pedagógico.

Pode ser crítica por:

- baixo acerto
- alto erro em assunto estratégico
- distrator dominante forte
- baixa discriminação

### Questão em atenção

Questão que não é necessariamente crítica, mas merece observação.

### Questão neutra

Questão sem sinal forte positivo ou negativo.

### Questão acima do esperado

Questão com desempenho adequado ou melhor que o esperado.

---

## 5. Termos estatísticos e pedagógicos

### Média geral

Desempenho médio de um grupo no simulado.

Pode ser da rede, escola, turma ou aluno.

### Média da frente

Desempenho médio dos alunos nas questões de uma frente específica.

Exemplo:

> Média da frente de Eletromagnetismo: 48%

### Participação

Percentual de alunos presentes no simulado.

```
participação = presentes / esperados
```

### Presença

Contagem ou status de participação.

Exemplo:

```
8.214 presentes
91% de presença
```

### Aluno em atenção

Aluno que apresenta algum sinal de risco pedagógico.

Critérios possíveis:

- média baixa
- queda recente
- baixa participação
- ponto fraco recorrente
- perfil irregular

### Escola em atenção

Escola com sinal que merece acompanhamento.

Critérios possíveis:

- média abaixo da rede
- queda recente
- baixa participação
- múltiplas disciplinas abaixo do esperado

### Habilidade crítica

Habilidade, assunto ou componente com desempenho abaixo do esperado.

### Índice de acerto

Percentual de alunos que acertaram uma questão.

```
acerto = acertos / respostas válidas
```

### Dificuldade empírica

Dificuldade observada a partir do desempenho real.

```
dificuldade empírica = 1 - acerto
```

### Discriminante

Métrica que indica se a questão separa alunos de maior desempenho dos alunos de menor desempenho.

```
discriminante = acerto do grupo superior - acerto do grupo inferior
```

Leitura:

- alto discriminante = questão separa bem níveis de domínio
- baixo discriminante = questão pouco informativa
- discriminante negativo = possível problema no item

### Ponto-bisserial

Correlação entre acertar uma questão e ter bom desempenho geral no simulado.

Ajuda a identificar se o item está alinhado ao desempenho geral.

### Variância

Mede dispersão dos resultados. Não deve aparecer sozinha na interface sem explicação.

### Desvio padrão

Mede o quanto os resultados estão espalhados em torno da média. Deve ser traduzido em linguagem pedagógica.

### Percentil

Posição relativa de um aluno ou grupo em relação aos demais.

Exemplos:

- Top 10%
- percentil 75

### Tendência

Direção de evolução ao longo do tempo.

Pode ser:

- em crescimento
- estável
- em queda
- irregular

### Evolução

Mudança de desempenho entre simulados.

Exemplo:

> +4,1 p.p. vs. simulado anterior

### Delta

Diferença entre dois valores.

Exemplo:

```
média atual - média anterior
```

### Pontos percentuais

Unidade correta para diferença entre percentuais.

Exemplo:

> de 50% para 55% = +5 p.p.

Não dizer "+5%" nesse caso.

### Score composto

Indicador calculado a partir de várias métricas.

Pode ser usado internamente para classificar atenção, risco ou prioridade.

### Estatística invisível

Princípio do produto segundo o qual a estatística pode existir no motor interno, mas deve aparecer para o usuário como leitura clara, evidência e ação.

---

## 6. Termos de análise pedagógica

### Diagnóstico pedagógico

Leitura do que os dados indicam sobre aprendizagem. Não é julgamento absoluto. Deve ser baseado em evidências.

### Evidência

Dado que sustenta uma leitura.

Exemplo:

> Acerto de 31%, distrator B com 38% e discriminante de 0,34.

### Hipótese pedagógica

Interpretação possível baseada nos dados.

Exemplo:

> A concentração no distrator B sugere confusão entre associação em série e paralelo.

Deve evitar certeza excessiva.

### Sugestão pedagógica

Orientação de ação com base na análise.

Exemplo:

> Retomar associação de resistores em aula pós-simulado com comparação entre circuitos equivalentes.

### Plano de ação

Conjunto de recomendações práticas. Pode aparecer em devolutivas ou perfis.

### Resolução pós-simulado

Momento em que o professor resolve questões selecionadas após a aplicação do simulado.

A plataforma deve ajudar a escolher quais questões valem ser resolvidas.

### Frente crítica

Frente com desempenho abaixo do esperado ou com concentração de lacunas.

### Assunto prioritário

Assunto que deve receber atenção por impacto, recorrência ou baixo desempenho.

### Ponto forte

Disciplina, frente ou assunto com desempenho positivo. Deve ser preferencialmente comparativo.

### Ponto de atenção

Disciplina, frente ou assunto que merece intervenção.

### Risco pedagógico

Sinal de que aluno, escola, turma ou frente pode precisar de acompanhamento.

### Sinal

Indicação detectada pela plataforma.

Exemplos:

- 5 escolas abaixo da média
- Eletromagnetismo como frente crítica
- 842 alunos em atenção

### Alerta

Sinal com maior urgência ou severidade.

### Prioridade

Sinal transformado em recomendação de ação.

---

## 7. Termos de relatório

### Relatório técnico-pedagógico

Documento gerado para professor/autor com dados do simulado e orientações de leitura.

### Devolutiva do professor

Relatório específico para professor/autor.

Deve mostrar como os alunos foram na disciplina/frente e quais questões merecem resolução.

### Capa

Primeira página do relatório.

Deve conter:

- nome do relatório
- disciplina/frente
- professor
- simulado
- data
- marca Arco
- símbolo ITA, se fizer sentido

### Resumo técnico

Página que apresenta dados principais do simulado e da frente. Deve ensinar como interpretar as métricas.

### Aprendizagem dos alunos

Página que mostra desempenho por assunto, domínio e dificuldade.

### Questões prioritárias

Página que mostra questões sugeridas para resolução em sala.

### Como interpretar

Bloco textual curto que explica a leitura dos dados.

Exemplo:

> O índice de acerto mostra domínio observado. O discriminante indica se a questão separou bem níveis de domínio.

---

## 8. Termos visuais e de interface

### KPI

Indicador executivo principal.

Exemplos:

- Desempenho geral
- Participação
- Alunos em atenção
- Questões com resolução sugerida

### Card

Bloco visual de informação. Deve conter uma ideia clara.

### Card expansível

Card que mostra resumo fechado e detalhe ao clicar. Útil para evitar excesso de texto.

### Badge

Etiqueta visual curta.

Exemplos:

- Atenção
- Destaque
- Crítico
- Estável
- Em crescimento

### Chip

Elemento visual pequeno usado para metadados.

Exemplos:

- Escola A
- Turma 2
- 3º ano
- Física

### CTA

Chamada para ação.

Exemplos:

- Ver análise
- Abrir perfil
- Gerar devolutiva

### Sparkline

Mini gráfico de linha usado para mostrar tendência.

### Heatmap

Mapa de calor.

Usar apenas se for muito claro e acompanhado de leitura. Preferir alternativas mais limpas quando possível.

### Gráfico de dispersão

Gráfico com pontos em dois eixos.

Muito útil para: acerto × discriminante.

### Barra comparativa

Gráfico simples para comparar valores.

Útil para: aluno vs. turma vs. escola vs. rede.

### Linha temporal

Gráfico de linha ao longo dos simulados. Útil para evolução.

### Donut / Pizza

Usar com cautela. Evitar quando uma barra for mais clara.

---

## 9. Linguagem recomendada

### Preferir

- leitura técnica
- evidência pedagógica
- resolução sugerida
- revisão técnica sugerida
- frente
- conjunto de questões
- sinal
- prioridade
- atenção
- hipótese
- sugestão

### Evitar

- professor ruim
- questão ruim
- culpa
- fracasso
- nota do professor
- ranking de professores
- prova mal feita
- erro do professor

### Usar com cuidado

- qualidade
- risco
- crítico
- baixo desempenho

Sempre explicar com dados.

---

## 10. Convenções de escrita

### Percentuais

Usar vírgula:

```
53,6%
```

### Pontos percentuais

Usar:

```
+4,1 p.p.
-2,3 p.p.
```

### Ausência de dados

Usar:

```
—
```

ou:

```
Sem dados suficientes.
```

Nunca usar `null`, `undefined` ou `NaN`.

### Simulados

Formato recomendado:

```
1º Simulado ITA
2º Simulado ITA
3º Simulado ITA
```

**Pendência técnica:** os dados mockados em `data.js` ainda usam o formato "1º Simulado ENEM 2025". Esse ajuste deve ser feito nos dados em etapa futura.

### Séries

Formato recomendado:

```
1º ano
2º ano
3º ano
```

### Turmas

Formato recomendado:

```
Turma 1
Turma 2
```

---

## 11. Síntese

Este glossário deve proteger a coerência do projeto.

A plataforma Arco precisa falar sempre a mesma língua:

- dados
- evidências
- diagnóstico
- ação

A boa terminologia evita que o produto pareça improvisado.

A regra final é:

> Nomear bem é parte do produto.
