# 01 — Visão de produto

## 1. Problema que estamos resolvendo

Hoje, a análise pedagógica de simulados de alta exigência costuma depender de três frentes pouco integradas:

1. **Planilhas de desempenho**, que mostram médias, acertos e rankings, mas exigem trabalho manual intenso para virar decisão pedagógica.
2. **PDFs de gabarito ou relatórios estáticos**, que informam o resultado, mas não explicam o que aquele resultado revela sobre aprendizagem, qualidade das questões ou prioridades de intervenção.
3. **Interpretação informal da equipe pedagógica**, que depende muito da experiência individual do gestor, do coordenador ou do professor.

No contexto de preparação para o **ITA**, esse problema é ainda mais sensível.

O simulado não deve servir apenas para dizer quem acertou mais ou menos. Ele precisa responder perguntas mais profundas:

- Os alunos estão evoluindo nos assuntos certos?
- A prova foi bem calibrada?
- As questões conseguiram diferenciar alunos com domínio real daqueles que apenas performaram por chute, memória ou padrão?
- Quais escolas, turmas ou grupos precisam de intervenção?
- Quais questões deveriam ser priorizadas em aula pós-simulado?
- Em quais frentes os alunos parecem ter lacunas conceituais reais?
- O desempenho baixo veio de dificuldade legítima, má escolha de questão, distrator ruim, enunciado ambíguo ou falha de aprendizagem?

O Projeto Arco nasce para transformar o simulado em uma **central de inteligência pedagógica** — e não apenas em uma base de notas.

---

## 2. O que é o Projeto Arco

O Projeto Arco é uma plataforma de análise pedagógica de simulados ITA, voltada para gestores, coordenadores pedagógicos e equipes responsáveis por acompanhar a preparação dos alunos ao longo de ciclos avaliativos.

A plataforma organiza dados de desempenho, presença, questões, escolas, alunos, disciplinas, frentes, professores/autores e devolutivas em uma experiência única, visual e investigativa.

A proposta não é criar um BI genérico.

A proposta é criar uma ferramenta que ajude o gestor a enxergar, rapidamente:

- o que está funcionando;
- o que exige atenção;
- onde há risco pedagógico;
- onde há avanço consistente;
- quais questões revelam lacunas importantes;
- quais simulados foram bem construídos;
- quais devolutivas devem ser geradas para professores, coordenadores ou escolas.

A plataforma deve transmitir a sensação de:

> "Isso mostra coisas que eu não veria sozinho."
> "Isso pensa pedagogicamente comigo."
> "Isso economiza horas de análise."
> "Isso transforma o simulado em decisão."

---

## 3. Escopo educacional do produto

O foco do produto é exclusivamente a preparação para o **ITA**.

Isso implica escolhas importantes:

- Análise de simulados com alto nível de exigência conceitual.
- Disciplinas centrais: Matemática, Física, Química e Língua Inglesa. Português/Redação quando aplicável.
- Análise de 1ª fase objetiva como prioridade inicial.
- Possibilidade futura de análise de 2ª fase discursiva.
- Leitura por assunto, frente, habilidade e tipo de erro.
- Atenção especial à discriminação de itens, distratores, dificuldade, taxa de acerto e evolução por ciclo.
- Interpretação cuidadosa da diferença entre lacuna de aprendizagem e problema de calibração do item.

A plataforma não deve ser tratada como produto genérico para ENEM ou vestibulares comuns.

O ITA exige outro tipo de leitura: mais técnica, mais longitudinal, mais conceitual e menos baseada apenas em média geral.

---

## 4. O que a ferramenta faz

A plataforma cumpre seis funções principais.

### 4.1. Diagnóstico da rede — Home

A Home mostra ao gestor uma leitura executiva do estado atual da rede.

Ela deve responder:

- A rede melhorou ou piorou em relação ao simulado anterior?
- A participação está adequada?
- Há escolas abaixo do esperado?
- Há alunos em atenção?
- Há alguma disciplina ou frente crítica?
- Quais sinais merecem prioridade agora?

A Home não deve ser uma parede de números. Ela deve ser um painel de orientação.

A função da Home é dizer ao gestor:

> "Olhe primeiro para isso."

**Estado atual do protótipo:** Home implementada com 4 KPIs executivos (desempenho geral, presença, habilidades críticas, alunos em atenção), panorama da rede, prioridades do momento e acesso rápido. Filtro de simulado funcional.

---

### 4.2. Análise do simulado — Simulados

A aba Simulados analisa a qualidade e o comportamento de cada prova.

Ela deve responder:

- O simulado estava bem calibrado?
- Quais questões foram críticas?
- Quais questões discriminaram bem?
- Quais questões tiveram distratores dominantes?
- Quais assuntos puxaram o desempenho para baixo?
- O erro dos alunos parece conceitual, procedimental, interpretativo ou de calibração?
- Quais questões devem ser resolvidas em aula pós-simulado?
- Como a média, a participação e a qualidade do simulado evoluíram ao longo dos ciclos?

A aba Simulados é uma das mais importantes do produto, porque conecta desempenho dos alunos com qualidade do instrumento avaliativo. Ela não serve apenas para mostrar notas. Ela serve para investigar a prova.

**Estado atual do protótipo:** Página com 3 abas (Anatomia do simulado, Disciplinas, Evolução). Grade de 48 questões com painel detalhado por questão. Métricas de acerto, discriminante, ponto-bisserial, distrator dominante e hipótese pedagógica implementadas.

---

### 4.3. Análise de escolas — Escolas

A aba Escolas permite ao gestor acompanhar o comportamento das escolas da rede.

Ela deve responder:

- Quais escolas estão com melhor desempenho?
- Quais escolas têm maior presença?
- Quais escolas estão evoluindo mais?
- Quais escolas estão abaixo do esperado?
- Em quais disciplinas ou componentes uma escola específica precisa de atenção?
- A queda de uma escola é geral ou concentrada em uma frente?
- A evolução é consistente ou pontual?

**Estado atual do protótipo:** Página com 4 abas (Visão geral, Ranking, Desempenho, Componentes). Filtros de simulado e escola funcionais. Gráficos de evolução e desempenho por disciplina implementados.

---

### 4.4. Análise de alunos — Alunos

A aba Alunos possui duas funções principais: ranking geral dos alunos e perfil individual.

O ranking deve permitir ver: média geral, médias por disciplina, escola, turma, série, status de trajetória, alunos em crescimento, estáveis e em atenção.

O perfil individual deve permitir entender: dados básicos, participação, média geral, médias por disciplina, evolução, pontos fortes, pontos frágeis, comparação com rede/escola/turma, risco pedagógico e ação sugerida.

A análise individual não deve virar apenas ficha de notas. Ela deve ajudar o gestor a decidir quem precisa de intervenção, quem está em ascensão e quem tem lacunas específicas.

**Estado atual do protótipo:** Página com 2 abas (Ranking, Perfil). Ranking com 80 alunos, filtros funcionais, busca por nome. Perfil com diagnóstico visual, benchmark, card de risco e plano de ação.

---

### 4.5. Análise técnica de frentes — Professores

A aba Professores **não deve avaliar se um professor é bom ou ruim.**

Essa é uma decisão central e inegociável de produto.

O objetivo é analisar o conjunto de questões associado a uma frente, disciplina ou professor/autor, de modo técnico e profissional.

Ela deve responder:

- As questões daquela frente foram bem calibradas?
- Os alunos foram bem nessa frente?
- A taxa de acerto foi adequada ao nível esperado?
- As questões discriminaram bem?
- Os distratores funcionaram?
- Houve concentração excessiva de erro em uma alternativa?
- A frente revela lacuna real de aprendizagem?
- Quais questões merecem resolução em aula?
- O desempenho dos alunos naquela frente está evoluindo ou caindo?
- O conjunto de itens parece adequado para o objetivo do simulado?

A linguagem deve ser sempre técnica, cuidadosa e institucional.

Exemplos de formulação adequada:

- "O conjunto de itens sugere necessidade de revisão técnica em duas questões."
- "A frente apresentou bom potencial diagnóstico, com discriminação média adequada."
- "Há indício de lacuna conceitual em associação de resistores."
- "Recomenda-se priorizar a resolução das questões 7, 14 e 22 no pós-simulado."

Exemplos de formulação inadequada:

- "O professor foi mal."
- "O professor escolheu questões ruins."
- "A aula do professor não funcionou."

A plataforma deve permitir inferências pedagógicas sem transformar isso em julgamento pessoal.

**Estado atual do protótipo:** Página com 3 abas (Painel da frente, Itens e evidências, Aprendizagem). Scatter de acerto × discriminante implementado. KPIs da frente, sinais e hipóteses funcionais.

---

### 4.6. Devolutivas e relatórios

As devolutivas são documentos técnicos gerados a partir dos dados da plataforma, destinados principalmente aos professores/autores.

**Decisão de produto:** a devolutiva deve funcionar como fluxo integrado dentro da página Professores, não como área independente da sidebar.

A devolutiva ajuda o professor a entender:

- Como os alunos foram na sua disciplina/frente.
- Quais questões precisam ser resolvidas em sala.
- Quais assuntos apresentaram maior dificuldade.
- Quais distratores funcionaram e o que revelaram.
- Se as questões tiveram bom poder diagnóstico.
- Como interpretar os principais indicadores técnicos.

A devolutiva não deve ter tom avaliativo pessoal. Deve parecer um relatório institucional: limpo, objetivo, profissional e útil.

Estrutura recomendada para o PDF:

1. **Capa** — nome do relatório, disciplina/frente, simulado, identificação institucional Arco
2. **Resumo técnico** — desempenho geral, média da frente, participação, questões com resolução sugerida
3. **Aprendizagem dos alunos** — desempenho por assunto, lacunas, evolução
4. **Questões prioritárias e plano de aula** — questões sugeridas para resolução, distratores, hipótese pedagógica, sugestão de abordagem

**Estado atual do protótipo:** Existe uma página separada de Devolutivas na sidebar, que ainda não foi integrada a Professores. A geração de PDF via jsPDF está parcialmente implementada em `pdf.js`.

---

## 5. O que a ferramenta não é

O Projeto Arco não deve tentar ser tudo.

Ele não é:

- Sistema acadêmico completo ou diário de classe
- Ferramenta de matrícula ou financeiro
- Plataforma de comunicação com pais
- Ambiente de aulas ou conteúdo didático
- Substituto do professor ou do coordenador
- Ranking público de professores
- BI genérico para qualquer exame ou vestibular
- Simples visualizador de planilhas
- PDF automático sem inteligência analítica

A plataforma deve se manter focada em um problema:

> Transformar dados de simulados ITA em diagnóstico pedagógico acionável.

---

## 6. Usuários principais

### 6.1. Gestor pedagógico da rede

É o usuário principal do produto.

Perguntas centrais:

- A preparação dos alunos está indo bem?
- Onde a rede está forte? Onde está frágil?
- Quais escolas precisam de atenção?
- Quais alunos precisam de intervenção?
- Quais frentes estão críticas?
- O simulado foi bem construído?
- Que devolutivas devo enviar?

Fluxo típico de uso:

1. Abre a Home
2. Identifica prioridades
3. Navega para Escolas, Alunos ou Simulados
4. Investiga causas
5. Gera devolutivas para professores

---

### 6.2. Coordenador de escola

Usuário futuro possível.

Perguntas centrais:

- Como minha escola está em relação à rede?
- Quais alunos da minha escola estão em atenção?
- Em quais disciplinas minha escola está abaixo?
- A presença está adequada?

Não implementado no protótipo atual.

---

### 6.3. Professor ou autor de questões

Usuário indireto no MVP — acessa os dados apenas via devolutiva em PDF.

Perguntas centrais:

- Como os alunos foram na minha disciplina/frente?
- Quais questões devo resolver em aula?
- Quais assuntos apresentaram maior dificuldade?
- Minhas questões funcionaram bem como instrumento diagnóstico?

Fluxo típico:

1. Recebe PDF técnico gerado pela plataforma
2. Entende os dados com ajuda da leitura fornecida no relatório
3. Planeja resolução pós-simulado
4. Ajusta futuras escolhas de questões

---

## 7. Princípios de produto

### 7.1. Diagnóstico antes de decoração

A plataforma pode ser bonita, mas a beleza não pode competir com a clareza.

Cada componente visual precisa justificar sua existência. Um gráfico só entra se responder a uma pergunta real.

### 7.2. Uma tela, uma pergunta principal

Cada aba deve ter uma pergunta dominante.

| Tela | Pergunta principal |
|---|---|
| Home | O que merece atenção agora? |
| Simulados | O que esta prova revelou? |
| Escolas | Quais escolas precisam de leitura ou intervenção? |
| Alunos | Quem está bem, quem está em risco e por quê? |
| Professores | O que as questões dessa frente revelam sobre aprendizagem e qualidade do simulado? |

### 7.3. Comparação como padrão

Nenhum número importante deve aparecer sozinho.

Toda métrica deve ser acompanhada de referência: vs. simulado anterior, vs. média da rede, vs. escola, vs. turma, vs. histórico, vs. esperado para aquele nível de dificuldade.

Um número isolado informa pouco. Um número comparado orienta decisão.

### 7.4. Cor como linguagem semântica

Cor não é decoração. Cor deve indicar estado:

- Verde: acima do esperado, avanço, estabilidade positiva
- Âmbar/amarelo: atenção, ponto de observação
- Vermelho: crítico, queda, risco
- Azul: informação institucional, estrutura, referência
- Cinza: neutro, ausência de dado, contexto

### 7.5. Menos gráficos, melhores perguntas

A plataforma deve evitar gráficos apenas bonitos. Gráfico sem pergunta pedagógica clara deve ser removido.

### 7.6. Explicação breve, não texto excessivo

A plataforma precisa ajudar a interpretar dados, mas sem transformar a tela em relatório longo. O ideal é usar microtextos, mini cards, tooltips, estados expansíveis e leituras executivas curtas.

### 7.7. Inferência pedagógica com cuidado

A plataforma pode sugerir hipóteses, mas não deve fingir certeza absoluta.

Formulações adequadas:

- "Os dados sugerem..."
- "Há indício de..."
- "Pode haver..."
- "Recomenda-se investigar..."

Formulações inadequadas:

- "A causa é..."
- "O professor falhou..."
- "Os alunos não aprenderam..."

O sistema deve ser analítico, não acusatório.

---

## 8. Personalidade do produto

A plataforma deve parecer:

- Premium e institucional
- Limpa e objetiva
- Pedagógica e confiável
- Técnica, mas compreensível
- Moderna e próxima da identidade Arco

Ela não deve parecer:

- Planilha colorida
- Dashboard financeiro genérico
- Sistema escolar antigo
- Relatório excessivamente editorial
- Produto experimental sem acabamento
- Tela poluída de BI

---

## 9. Critérios de sucesso do produto

O produto será bem-sucedido se conseguir gerar três tipos de ganho.

### 9.1. Ganho de tempo

O gestor deve gastar menos tempo cruzando planilhas, calculando médias e montando relatórios.

### 9.2. Ganho de visão

A plataforma deve revelar padrões difíceis de perceber manualmente:

- Queda concentrada em uma frente
- Escola com presença baixa
- Aluno em trajetória descendente
- Questão com alto erro e baixo discriminante
- Distrator dominante revelando erro conceitual
- Simulado com dificuldade desbalanceada

### 9.3. Ganho de ação

A plataforma deve ajudar a decidir:

- Quem acompanhar
- Qual escola investigar
- Qual disciplina priorizar
- Quais questões resolver em sala
- Qual devolutiva gerar

---

## 10. Riscos de produto

### 10.1. Virar uma parede de números

O risco mais comum é adicionar muitos KPIs e gráficos sem hierarquia.

Solução: cada bloco precisa responder uma pergunta clara.

### 10.2. Parecer que avalia professores diretamente

A aba Professores precisa ser tratada com muito cuidado. O produto deve analisar questões, frentes e desempenho dos alunos, nunca julgar professores como pessoas.

Solução: usar linguagem técnica, focada em itens e aprendizagem.

### 10.3. Excesso de estatística explícita

Métricas estatísticas são importantes, mas não podem dominar a interface.

Solução: mostrar estatística quando ela melhora a decisão; esconder complexidade quando ela só aumenta ruído.

### 10.4. Confundir dado mockado com dado real

Enquanto o produto usa dados mockados, é preciso deixar claro nos contextos certos que os números são demonstrativos.

Solução: documentar a origem dos dados e calibrar métricas com dados reais antes de qualquer uso institucional.

### 10.5. Criar telas bonitas, mas pouco úteis

Visual premium não compensa falta de utilidade pedagógica.

Solução: validar cada tela com a pergunta: "que decisão isso ajuda a tomar?"

---

## 11. Prioridades do protótipo atual

O protótipo atual já entrega:

1. Home com panorama e sinais de atenção
2. Simulados com anatomia da prova, disciplinas e evolução
3. Escolas com visão geral, ranking, desempenho e componentes
4. Alunos com ranking e perfil individual com diagnóstico
5. Professores com leitura técnica das questões/frentes
6. Geração inicial de PDF para devolutiva

Próximos passos pendentes:

- Corrigir labels dos simulados de "ENEM" para "ITA"
- Integrar Devolutivas dentro da página Professores
- Conectar dados reais em substituição aos mockados
- Preparar estrutura para backend

---

## 12. Visão de longo prazo

No longo prazo, o Projeto Arco pode evoluir para uma plataforma completa de inteligência pedagógica para simulados ITA.

Possibilidades futuras:

- Upload real de planilhas e integração com dados Arco
- Banco de dados e autenticação por perfil de usuário
- Área para coordenadores de escola
- Área para professores (não só via PDF)
- Geração automática de devolutivas
- Comparação histórica entre ciclos e coortes
- Projeção de desempenho e alertas automáticos
- Análise de 2ª fase discursiva
- Análise por habilidade e matriz própria ITA
- Acompanhamento longitudinal por coorte

A ambição não é apenas visualizar dados.

A ambição é transformar o simulado em um sistema contínuo de diagnóstico, intervenção e melhoria pedagógica.

---

## 13. Síntese

O Projeto Arco é uma plataforma de inteligência pedagógica para simulados ITA.

Sua função é transformar dados de provas em leitura estratégica para gestores, coordenadores e professores.

Ela deve equilibrar visual premium, clareza institucional, diagnóstico pedagógico, rigor técnico, linguagem cuidadosa e foco em ação.

Ela deve ajudar a responder uma pergunta central:

> O que os dados deste simulado revelam — e o que devemos fazer agora?
