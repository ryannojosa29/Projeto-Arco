# 05 — Dados, métricas e estatística

## 1. Papel deste documento

Este documento define as principais métricas, regras de cálculo, indicadores pedagógicos, modelos estatísticos e padrões de leitura da plataforma Arco para simulados ITA.

Ele serve como fonte de verdade para:

- frontend;
- backend;
- geração de relatórios;
- criação de dados mockados;
- análise pedagógica;
- prompts para Claude Code;
- validação das telas;
- futura integração com dados reais.

A plataforma não deve usar estatística para parecer sofisticada.  
A estatística deve existir para melhorar a leitura pedagógica.

A regra central é:

> Estatística invisível, decisão visível.

Ou seja: a plataforma pode usar modelos, índices, regressões e análises técnicas, mas a interface deve traduzir isso em linguagem útil para o gestor.

---

## 2. Contexto do produto

A plataforma analisa simulados ITA aplicados para alunos de diferentes escolas atendidas pela Arco.

No cenário atual:

- a Arco reúne alunos de várias escolas;
- os alunos são organizados em duas turmas principais;
- os professores atuam para toda a rede;
- os professores também participam da construção das questões dos simulados;
- a análise deve servir ao gestor pedagógico;
- o foco é transformar o simulado em diagnóstico pedagógico.

A plataforma deve permitir análises em cinco níveis:

```txt
Rede
Escola
Turma
Aluno
Simulado / Questão / Frente
```

---

## 3. Entidades principais

### 3.1 Aluno

Representa cada estudante participante dos simulados ITA.

Campos recomendados:

- id
- nome
- escola
- turma
- serie
- status
- ativo
- historicoDeSimulados

Exemplos de série:

- 1º ano
- 2º ano
- 3º ano

Exemplos de turma:

- Turma 1
- Turma 2

Regras:

- ausência não deve ser tratada como nota zero;
- aluno ausente deve ser excluído da média e incluído em participação;
- aluno pode ter dados acumulados e dados por simulado.

### 3.2 Escola

Representa a instituição de origem dos alunos.

Campos recomendados:

- id
- nome
- quantidadeAlunos
- mediaGeral
- presenca
- desempenhoPorDisciplina
- desempenhoPorComponente
- historico
- status

No mockup, usar nomes genéricos:

- Escola A
- Escola B
- Escola C
- Escola D
- Escola E
- Escola F

A escola não deve ser analisada apenas como ranking.  
Ela deve ser analisada como unidade pedagógica.

### 3.3 Turma

A plataforma trabalha inicialmente com duas turmas:

- Turma 1 — alunos do 3º ano e alunos do 2º ano mais bem avaliados no processo de seleção
- Turma 2 — alunos do 1º ano e restante dos alunos do 2º ano

Campos recomendados:

- id
- nome
- criterioDeComposicao
- quantidadeAlunos
- mediaGeral
- presenca
- historico
- desempenhoPorDisciplina

A comparação entre turmas deve ser usada com cuidado, pois as turmas têm composições diferentes.

### 3.4 Simulado

Representa uma aplicação de prova.

Campos recomendados:

- id
- nome
- dataAplicacao
- tipo
- quantidadeQuestoes
- questoes
- alunosPresentes
- alunosAusentes
- mediaGeral
- participacao
- status

Exemplos:

- 1º Simulado ITA
- 2º Simulado ITA
- 3º Simulado ITA
- 4º Simulado ITA
- 5º Simulado ITA

### 3.5 Questão

É a unidade mínima de diagnóstico.

Campos recomendados:

- id
- numero
- simulado
- disciplina
- componente
- assunto
- habilidade
- dificuldadeEsperada
- gabarito
- alternativas
- percentualPorAlternativa
- acerto
- discriminante
- pontoBisserial
- distratorDominante
- status
- autorOuProfessor
- resolucao

A questão deve ser analisada por dois ângulos:

- O que ela revela sobre aprendizagem dos alunos.
- O que ela revela sobre qualidade técnica do item.

### 3.6 Professor / Autor

No contexto atual, o professor é tratado como autor ou responsável por uma frente, não como objeto de julgamento pessoal.

Campos recomendados:

- id
- nome
- disciplina
- frente
- abrangencia
- questoesAssociadas
- simuladosAssociados

Regras:

- todos os professores atuam na rede online;
- não associar professor a uma escola específica;
- não usar linguagem de avaliação pessoal;
- analisar o conjunto de questões e a aprendizagem da frente.

---

## 4. Disciplinas e frentes

O MVP deve considerar disciplinas alinhadas ao foco ITA.

Disciplinas principais:

- Matemática
- Física
- Química
- Língua Inglesa

Podem existir frentes/componentes dentro de cada disciplina.

Exemplos:

**Matemática**

- Álgebra
- Geometria
- Trigonometria
- Combinatória
- Probabilidade
- Funções

**Física**

- Mecânica
- Termodinâmica
- Ondulatória
- Eletromagnetismo
- Óptica
- Hidrostática

**Química**

- Estequiometria
- Termoquímica
- Cinética
- Equilíbrio
- Eletroquímica
- Orgânica
- Atomística

**Língua Inglesa**

- Reading
- Vocabulary
- Grammar
- Text comprehension
- Inference

**Nota sobre os dados mockados:** os dados em `data.js` incluem também as disciplinas Linguagens (Q33–Q39) e Ciências Humanas (Q40–Q48). Essas disciplinas não fazem parte do foco ITA e não devem ser exibidas como disciplinas centrais da plataforma. Em versão futura com dados reais de simulados ITA, apenas as quatro disciplinas acima serão usadas.

---

## 5. Métricas gerais da rede

### 5.1 Média geral

Definição:

```
média geral = soma das notas dos alunos presentes / número de alunos presentes
```

Regras:

- ausentes não entram na média;
- exibir com uma casa decimal ou em percentual, conforme padrão da plataforma;
- sempre comparar com simulado anterior ou visão acumulada.

Exemplo de exibição:

```
53,6%
+4,1 p.p. vs. simulado anterior
```

### 5.2 Participação

Definição:

```
participação = alunos presentes / alunos esperados
```

Exemplo:

```
8.214 presentes
91% de participação
```

Uso:

- medir confiabilidade do dado;
- identificar escolas/turmas com baixa adesão;
- contextualizar quedas de desempenho.

Uma média alta com baixa participação deve ser lida com cautela.

### 5.3 Alunos em atenção

Aluno em atenção é aquele que apresenta uma ou mais condições:

- média abaixo do esperado
- queda recente
- baixa participação
- ponto fraco relevante
- distância grande em relação à turma ou escola
- perfil irregular

A regra pode ser composta por pontuação.

Exemplo inicial:

```
alunoEmAtencao =
  mediaGeral < metaMinima
  OU queda >= 5 p.p.
  OU participação < 75%
  OU duas disciplinas abaixo de 45%
```

O limiar deve ser calibrado com dados reais.

### 5.4 Habilidades críticas

Uma habilidade, assunto ou componente pode ser considerado crítico quando:

- acerto médio baixo
- queda em relação ao simulado anterior
- muitos alunos errando
- baixo desempenho em várias escolas
- presença de questões com distrator forte

Exemplo de regra inicial:

```
habilidadeCritica =
  acertoMedio < 45%
  E quantidadeQuestoes >= 2
```

Ou:

```
habilidadeCritica =
  acertoMedio < médiaDaDisciplina - 10 p.p.
```

---

## 6. Métricas de aluno

### 6.1 Média do aluno

Definição:

```
médiaAluno = desempenho do aluno no simulado selecionado
```

Pode ser exibida como:

- média geral
- média por disciplina
- média acumulada

Sempre que possível, comparar com:

- rede
- escola
- turma
- top 10%
- histórico próprio
- simulado anterior

### 6.2 Participação do aluno

Definição:

```
participaçãoAluno = simulados presentes / simulados aplicados
```

Uso:

- interpretar confiabilidade do histórico;
- identificar aluno que precisa de acompanhamento;
- separar queda real de ausência.

### 6.3 Evolução do aluno

A evolução pode ser medida por diferença simples:

```
evolução = médiaAtual - médiaAnterior
```

Ou por tendência nos últimos simulados:

```
tendência = inclinação da reta de regressão das últimas médias
```

Classificação inicial:

| Status | Critério sugerido |
|---|---|
| Em crescimento | evolução positiva consistente |
| Estável | variação pequena |
| Queda recente | queda relevante no último simulado |
| Atenção | média baixa ou queda + baixa participação |
| Irregular | alta oscilação entre simulados |

### 6.4 Perfil irregular

Um aluno pode ser considerado irregular quando apresenta grande oscilação.

Métrica possível:

```
oscilação = desvio padrão das médias dos últimos simulados
```

Regra inicial:

```
perfilIrregular = oscilação > oscilaçãoMedianaDaTurma * 1,5
```

### 6.5 Ponto forte e ponto de atenção

Ponto forte:

- disciplina com maior desempenho relativo do aluno

Ponto de atenção:

- disciplina com menor desempenho relativo do aluno

Não deve ser apenas a maior/menor nota absoluta.  
Idealmente considerar comparação com rede, escola ou turma.

Exemplo:

```
Física: 62%
+8 p.p. vs. rede
```

---

## 7. Métricas de escola

### 7.1 Média da escola

Definição:

```
médiaEscola = média dos alunos presentes da escola
```

Comparações úteis:

- vs. rede
- vs. simulado anterior
- vs. visão acumulada
- vs. escolas semelhantes

### 7.2 Presença da escola

Definição:

```
presençaEscola = alunos presentes da escola / alunos esperados da escola
```

É uma métrica estratégica porque baixa participação pode distorcer o desempenho.

### 7.3 Escola em atenção

Uma escola pode entrar em atenção quando:

- média abaixo da rede
- queda em relação ao simulado anterior
- presença baixa
- múltiplas disciplinas abaixo do esperado
- crescimento negativo acumulado

Exemplo de regra inicial:

```
escolaEmAtencao =
  médiaEscola < médiaRede - 5 p.p.
  OU presença < 80%
  OU queda >= 4 p.p.
```

### 7.4 Escola destaque

Uma escola pode ser destaque quando:

- média acima da rede
- boa presença
- crescimento consistente
- bom desempenho em disciplinas críticas

Evitar transformar isso em competição vazia.  
Usar como sinal de boas práticas.

---

## 8. Métricas de turma

### 8.1 Média da turma

Definição:

```
médiaTurma = média dos alunos presentes na turma
```

Como Turma 1 e Turma 2 têm composições diferentes, a comparação deve ser contextualizada.

### 8.2 Evolução da turma

Mede o crescimento ou queda ao longo dos simulados.

Exibição recomendada:

- linha temporal da Turma 1
- linha temporal da Turma 2
- linha da rede

### 8.3 Participação da turma

A participação da turma ajuda a interpretar desempenho.

Exemplo:

```
Turma 1: 94%
Turma 2: 87%
```

---

## 9. Métricas de questão

### 9.1 Índice de acerto

Definição:

```
acerto = alunos que marcaram o gabarito / alunos que responderam a questão
```

Leitura:

| Acerto | Interpretação inicial |
|---|---|
| > 80% | questão fácil ou conteúdo bem dominado |
| 60% a 80% | bom domínio |
| 40% a 60% | dificuldade média |
| 25% a 40% | questão difícil |
| < 25% | questão muito difícil ou possível problema |

No ITA, questões difíceis são esperadas.  
Baixo acerto não significa automaticamente questão ruim.

### 9.2 Dificuldade empírica

Pode ser calculada como:

```
dificuldadeEmpirica = 1 - acerto
```

Quanto maior, mais difícil foi a questão.

Exemplo:

```
acerto = 32%
dificuldadeEmpirica = 68%
```

### 9.3 Discriminante

O discriminante mede o quanto a questão separa alunos de maior desempenho dos alunos de menor desempenho.

Uma forma simples:

```
discriminante = acertoGrupoSuperior - acertoGrupoInferior
```

Onde:

- grupo superior = top 27% ou top 25% dos alunos
- grupo inferior = bottom 27% ou bottom 25% dos alunos

Leitura sugerida:

| Discriminante | Leitura |
|---|---|
| > 0,40 | excelente discriminação |
| 0,25 a 0,40 | boa discriminação |
| 0,15 a 0,25 | discriminação moderada |
| 0 a 0,15 | baixa discriminação |
| < 0 | comportamento problemático |

No ITA, uma questão difícil pode ser excelente se tiver bom discriminante.

### 9.4 Correlação ponto-bisserial

Mede a correlação entre acertar a questão e ter bom desempenho geral no simulado.

Leitura sugerida:

| Ponto-bisserial | Leitura |
|---|---|
| > 0,30 | forte associação com domínio geral |
| 0,20 a 0,30 | boa associação |
| 0,10 a 0,20 | associação fraca |
| < 0,10 | pouco informativa |
| < 0 | possível problema no item |

Uso:

- avaliar qualidade técnica do item;
- detectar questão que não acompanha o desempenho geral;
- identificar possível ambiguidade ou erro de gabarito.

### 9.5 Distrator dominante

Distrator dominante é a alternativa errada mais escolhida.

Campos:

- alternativa
- percentual
- diferença para o gabarito
- grupo que mais marcou

Leitura:

- se muitos alunos marcam o mesmo distrator, pode haver erro conceitual comum;
- se bons alunos marcam o distrator, pode haver ambiguidade;
- se todos os distratores têm baixa escolha, a questão pode estar fácil ou os erros estão dispersos.

### 9.6 Distrator funcional

Um distrator é funcional quando atrai uma parcela relevante de alunos.

Regra inicial:

```
distratorFuncional = percentualDistrator >= 10%
```

Ou, em simulados com poucos alunos:

```
distratorFuncional = percentualDistrator >= 15%
```

Um bom item geralmente tem distratores plausíveis, mas não ambíguos.

### 9.7 Eficiência do item

A eficiência do item é uma métrica composta opcional para uso interno.

Ela pode combinar:

- discriminante
- ponto-bisserial
- faixa de acerto
- funcionalidade dos distratores
- adequação da dificuldade

Importante:

- não precisa aparecer com esse nome na interface;
- pode ser usada internamente para ordenar questões;
- deve ser traduzida como "item diagnóstico", "revisão sugerida" ou "resolução sugerida".

---

## 10. Classificação técnica da questão

### 10.1 Questão diagnóstica

Uma questão é diagnóstica quando:

- tem bom discriminante
- tem acerto não extremo
- revela erro conceitual claro
- possui distrator dominante interpretável

Exemplo:

```
acerto 42%
discriminante 0,36
distrator C com 31%
```

Leitura:

> Questão difícil, mas útil para identificar lacuna real.

### 10.2 Questão de consolidação

Questão com alto acerto e boa discriminação moderada.

Uso:

- confirmar domínio;
- reforçar conteúdo;
- baixa prioridade para aula pós-simulado, exceto se o assunto for estratégico.

### 10.3 Questão com resolução sugerida

Uma questão deve ser sugerida para resolução em sala quando:

- baixo acerto
- OU distrator dominante forte
- OU bom discriminante em conteúdo relevante
- OU muitos alunos erraram em assunto prioritário

Regra inicial:

```
resolucaoSugerida =
  acerto < 45%
  OU distratorDominante >= 25%
  OU (discriminante > 0,30 E acerto < 60%)
```

Essa métrica é muito importante para o professor.

Ela responde:

> Quais questões valem ser resolvidas com os alunos depois do simulado?

### 10.4 Questão com revisão técnica sugerida

Uma questão deve ter revisão técnica sugerida quando:

- discriminante muito baixo
- ponto-bisserial baixo ou negativo
- acerto extremamente baixo sem discriminar
- bons alunos erram mais que alunos fracos
- distrator supera o gabarito

Regra inicial:

```
revisaoTecnicaSugerida =
  discriminante < 0,10
  OU pontoBisserial < 0,10
  OU discriminante < 0
```

A linguagem deve ser cuidadosa.  
Não dizer "questão ruim".

Preferir:

> Revisão técnica sugerida

---

## 11. Qualidade do simulado

### 11.1 Cuidado com o termo

A plataforma pode medir qualidade do simulado, mas deve evitar transformar isso em "nota da prova" simplista.

A qualidade deve ser lida como combinação de:

- calibragem;
- discriminação;
- equilíbrio de dificuldade;
- funcionalidade dos distratores;
- cobertura de assuntos;
- coerência com o objetivo ITA.

### 11.2 Métricas relevantes de qualidade

#### 11.2.1 Discriminante médio

Média dos discriminantes das questões.

Leitura:

> Quanto maior, melhor a prova separa níveis de domínio.

#### 11.2.2 Percentual de questões diagnósticas

Definição:

```
questõesDiagnósticas / totalDeQuestões
```

Mostra quantas questões realmente geram informação útil.

#### 11.2.3 Percentual de questões com revisão técnica sugerida

Definição:

```
questõesComRevisaoTecnica / totalDeQuestões
```

Deve ser baixo em simulados bem calibrados.

#### 11.2.4 Cobertura por frente

Verifica se a prova distribui questões de forma coerente entre os componentes esperados.

Exemplo:

- Física: Mecânica, Eletromagnetismo, Termodinâmica
- Química: Orgânica, Estequiometria, Equilíbrio
- Matemática: Álgebra, Geometria, Combinatória

#### 11.2.5 Equilíbrio de dificuldade

A prova não deve ter todas as questões fáceis ou todas extremamente difíceis.

Uma distribuição saudável pode conter:

- questões fáceis
- questões médias
- questões difíceis
- questões muito difíceis

No ITA, a prova pode ser naturalmente difícil, mas ainda precisa discriminar.

#### 11.2.6 Funcionalidade dos distratores

Mede se os distratores atraem respostas de forma informativa.

```
distratoresFuncionais / distratoresTotais
```

Uso:

- detectar alternativas irrelevantes;
- detectar erro conceitual recorrente;
- qualificar análise de questões.

#### 11.2.7 Variância do desempenho

Uma prova com variância muito baixa pode não separar alunos.

Uma prova com variância muito alta pode estar excessivamente dispersiva ou desigual.

Leitura:

> variância ajuda a entender dispersão do grupo

---

## 12. Métricas para Professores / Frentes

### 12.1 Princípio

A aba Professores não mede "qualidade do professor".

Ela mede:

```
aprendizagem dos alunos na frente
+
qualidade técnica das questões associadas
+
prioridades de resolução pós-simulado
```

### 12.2 KPIs recomendados

Para cada professor/frente:

- desempenho médio da frente
- participação
- discriminante médio
- distratores funcionais
- questões com resolução sugerida

Evitar:

- nota do professor
- ranking de professor
- professor bom/ruim

### 12.3 Leituras úteis

A página deve responder:

- os alunos estão indo bem nessa frente?
- quais assuntos concentram mais erro?
- as questões foram diagnósticas?
- quais itens devem ser resolvidos em sala?
- houve distrator que capturou erro conceitual?
- a frente evoluiu ao longo dos simulados?
- há itens com revisão técnica sugerida?

---

## 13. Métricas para Devolutivas

A devolutiva ao professor deve conter poucas métricas, mas muito úteis.

### 13.1 Métricas da Página 1 — Resumo técnico

- média geral do simulado
- média da frente
- participação
- número de questões da frente
- questões com resolução sugerida

### 13.2 Métricas da Página 2 — Aprendizagem dos alunos

- desempenho por assunto
- assuntos com maior domínio
- assuntos com maior dificuldade
- evolução da frente
- comparação entre assuntos

### 13.3 Métricas da Página 3 — Questões prioritárias

- número da questão
- assunto
- acerto
- discriminante
- distrator dominante
- hipótese pedagógica
- sugestão de abordagem

---

## 14. Regras de alerta

### 14.1 Alertas da Home

Exemplos:

- queda relevante da média geral
- participação abaixo do esperado
- aumento de alunos em atenção
- habilidade crítica recorrente
- escola com queda significativa
- frente com baixo desempenho

### 14.2 Alertas de Escola

- média abaixo da rede
- presença baixa
- queda em disciplina específica
- crescimento negativo
- componente crítico

### 14.3 Alertas de Aluno

- queda recente
- baixa participação
- ponto fraco recorrente
- perfil irregular
- distância grande da turma

### 14.4 Alertas de Questão

- baixo acerto
- baixo discriminante
- distrator dominante forte
- ponto-bisserial baixo
- resolução sugerida
- revisão técnica sugerida

---

## 15. Convenções numéricas

### 15.1 Percentuais

Usar:

```
53,6%
```

ou, quando desnecessária precisão:

```
54%
```

### 15.2 Deltas

Sempre com sinal:

```
+4,1 p.p.
-2,3 p.p.
```

Usar "p.p." para pontos percentuais.

### 15.3 Ausência de dado

Nunca mostrar `null`, `undefined`, `NaN` ou `0` quando o correto for ausência.

Usar:

```
—
```

ou:

```
Sem dados suficientes.
```

### 15.4 Casas decimais

Recomendação:

| Tipo | Formato |
|---|---|
| Média percentual | 1 casa |
| Participação | 0 ou 1 casa |
| Discriminante | 2 casas |
| Ponto-bisserial | 2 casas |
| Ranking | inteiro |
| Contagem | inteiro |

---

## 16. Comparações obrigatórias

Nenhuma métrica importante deve aparecer sozinha.

Comparações recomendadas:

- vs. simulado anterior
- vs. visão acumulada
- vs. rede
- vs. escola
- vs. turma
- vs. top 10%
- vs. histórico do próprio aluno

Exemplo ruim:

```
Média: 62%
```

Exemplo bom:

```
Média: 62%
+5,4 p.p. vs. rede
```

---

## 17. Dados mockados

Enquanto não houver backend real, os dados mockados precisam respeitar coerência pedagógica.

Regras:

- não usar valores totalmente aleatórios a cada carregamento;
- manter dados determinísticos;
- cada simulado deve ter identidade pedagógica própria;
- assuntos devem mudar entre simulados;
- gabaritos podem mudar entre simulados;
- status das questões devem mudar de forma coerente;
- filtros devem alterar dados de verdade.

Exemplo:

```
1º Simulado — Matemática mais crítica
2º Simulado — Física mais crítica
3º Simulado — Química mais crítica
4º Simulado — Inglês mais crítico
5º Simulado — distribuição mais balanceada
```

**Pendência técnica conhecida:** os dados em `data.js` identificam os simulados como "Simulado ENEM 2025" (ex.: `'1º Simulado ENEM 2025'`). O rótulo correto é "Simulado ITA". Essa correção deve ser feita nos dados mockados em etapa futura. Nenhuma tela ou documento deve usar "ENEM" como identidade do produto.

---

## 18. Pipeline futuro de dados

Fluxo futuro recomendado:

```
upload de planilha / base
↓
validação de schema
↓
normalização dos dados
↓
cálculo das métricas
↓
geração de sinais
↓
atualização da interface
↓
geração de relatórios
```

---

## 19. Validação de dados

O sistema deve verificar:

- alunos duplicados;
- alunos sem escola;
- alunos sem turma;
- notas fora do intervalo;
- questões sem gabarito;
- alternativas inválidas;
- ausência não marcada;
- simulado sem data;
- respostas incompletas;
- número de questões inconsistente.

---

## 20. Métricas que não devem ser prioridade

Evitar trazer para a interface principal:

- variância pura sem explicação;
- desvio padrão sem leitura;
- p-valor;
- regressão explícita;
- fórmulas complexas;
- índices com nomes técnicos sem necessidade.

Essas métricas podem existir no motor interno, mas devem ser traduzidas.

Exemplo:

Em vez de:

```
p = 0,034
```

Preferir:

```
queda consistente nos últimos simulados
```

---

## 21. Estatística invisível

A plataforma pode usar internamente:

- regressão linear;
- z-score;
- percentis;
- correlação ponto-bisserial;
- análise de distratores;
- classificação por limiares;
- tendência temporal;
- comparação entre grupos.

Mas a interface deve mostrar:

- alerta;
- evidência;
- comparação;
- sugestão;
- ação.

---

## 22. Checklist de qualidade das métricas

Antes de aceitar uma métrica, perguntar:

- Ela responde uma pergunta real?
- Ela muda alguma decisão?
- Ela é compreensível?
- Ela tem comparação?
- Ela é confiável com os dados disponíveis?
- Ela pode ser explicada em uma frase?
- Ela evita julgamento pessoal?
- Ela funciona para ITA?
- Ela melhora a análise pedagógica?
- Ela evita poluir a tela?

---

## 23. Síntese

A plataforma Arco deve usar dados e estatística para transformar simulados ITA em inteligência pedagógica.

O objetivo não é mostrar tudo que pode ser calculado.

O objetivo é mostrar o que ajuda o gestor a decidir.

A lógica final é:

```
dados brutos
↓
métricas pedagógicas
↓
sinais interpretáveis
↓
evidências
↓
ação
```

A métrica certa é aquela que faz o usuário pensar:

> "Agora eu sei onde agir."
