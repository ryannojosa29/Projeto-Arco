# 03 — Design system

## 1. Papel deste documento

Este documento define a linguagem visual, os princípios de interface, a paleta de cores real implementada, a tipografia, os componentes, os estados e as regras de uso visual da plataforma Arco para simulados ITA.

O objetivo não é criar um design bonito apenas por estética.

O objetivo é criar uma interface que pareça:

- Institucional e premium
- Clara e pedagógica
- Confiável e moderna
- Alinhada à identidade Arco
- Madura o suficiente para ser apresentada a uma equipe de gestão

A interface deve evitar dois extremos:

1. Visual genérico de dashboard financeiro, com muitos números e gráficos frios.
2. Visual excessivamente editorial, com títulos dramáticos e pouca objetividade.

O produto precisa estar no meio certo:

```
clareza institucional + inteligência pedagógica + acabamento premium
```

---

## 2. Princípio visual central

A plataforma deve parecer uma ferramenta de gestão pedagógica séria.

Ela não deve parecer:

- Planilha colorida
- Power BI genérico
- Site experimental
- Mockup bonito sem função
- Sistema escolar antigo

Ela deve parecer:

- Produto educacional premium
- Sistema de inteligência pedagógica
- Painel institucional de tomada de decisão
- Ferramenta usada por gestores e coordenadores
- Ambiente limpo, suave e confiável

---

## 3. Referências visuais

### 3.1. Poliedro

Referência importante pela organização visual: sidebar limpa, cards objetivos, filtros claros, transições suaves, visual institucional, pouca poluição. O objetivo não é copiar, mas aprender com a maturidade visual.

### 3.2. Arco

A plataforma precisa parecer um produto da Arco. Isso exige uso explícito da marca, presença do navy institucional, laranja como cor de ação e sensação de tecnologia educacional.

Frase orientadora do produto presente na interface:

> Transformando dados educacionais em decisões pedagógicas.

### 3.3. Produto premium com propósito

Clareza, respiro, acabamento, microinterações discretas, foco e poucos elementos competindo. Não significa animações demais, glassmorphism exagerado ou estética inalcançável.

---

## 4. Paleta de cores — valores reais implementados

A paleta está definida em `assets/css/tokens.css`. Os valores abaixo são os efetivamente usados na plataforma.

### 4.1. Cores institucionais

```css
--navy:       #0F1F3D;   /* navy principal — sidebar, headers, textos âncora */
--navy2:      #162744;   /* navy secundário */
--navy3:      #1e305a;   /* navy terciário — estados hover */
--orange:     #E8521A;   /* laranja Arco — ações, CTAs, destaque, logo */
--orange2:    #F06330;   /* laranja secundário */
--orange-lt:  #FEF0EB;   /* laranja claro — backgrounds de destaque suave */
```

### 4.2. Superfícies e bordas

```css
--bg:         #F5F4F1;   /* fundo principal da aplicação — off-white quente */
--surface:    #FFFFFF;   /* superfície dos cards */
--surface2:   #FAFAF8;   /* superfície alternativa — inputs, fundos internos */
--border:     #E8E6DF;   /* borda padrão dos cards */
--border2:    #D8D5CC;   /* borda mais forte — separadores, inputs focados */
```

### 4.3. Texto

```css
--t1:         #1A1A18;   /* texto principal — títulos e valores */
--t2:         #3D3D3A;   /* texto secundário — subtítulos, labels */
--t3:         #6B6B66;   /* texto terciário — notas, microcopy */
--t4:         #9E9E98;   /* texto mutado — placeholders, labels secundários */
```

### 4.4. Cores semânticas

```css
--green:      #15803D;   /* positivo, acima do esperado, destaque */
--green-lt:   #DCFCE7;   /* fundo verde suave */
--green-dk:   #166534;   /* verde escuro — texto em badge verde */
--amber:      #B45309;   /* atenção, observação */
--amber-lt:   #FEF3C7;   /* fundo âmbar suave */
--red:        #B91C1C;   /* crítico, queda, risco */
--red-lt:     #FEE2E2;   /* fundo vermelho suave */
--blue:       #1D4ED8;   /* informação, referência institucional */
--blue-lt:    #DBEAFE;   /* fundo azul suave */
--blue-dk:    #1e40af;   /* azul escuro — texto em badge azul */
--teal:       #0F766E;   /* complementar — uso pontual */
--teal-lt:    #CCFBF1;   /* fundo teal suave */
```

### 4.5. Regras de cor

Usar cor com significado:

| Cor | Significado |
|---|---|
| Verde | Desempenho positivo, avanço, domínio, boa calibragem |
| Âmbar | Atenção, instabilidade, observação |
| Vermelho | Risco, queda, questão crítica, revisão técnica sugerida |
| Azul | Informação, estrutura, leitura institucional |
| Laranja | Ação, prioridade, CTA, destaque Arco |
| Cinza | Neutro, contexto, ausência de dado |

Não usar cor apenas para decorar. Não usar muitas cores ao mesmo tempo.

---

## 5. Tipografia

A tipografia é limpa, moderna e objetiva.

```css
--f: 'Plus Jakarta Sans', system-ui, sans-serif;
```

A fonte é **Plus Jakarta Sans**, carregada via Google Fonts no `index.html`.

Pesos utilizados: 300, 400, 500, 600, 700, 800.

### 5.1. Hierarquia típica

```css
/* Título de página */
font-size: 22–26px;
font-weight: 700;
letter-spacing: -0.02em;
color: var(--t1);

/* Título de card */
font-size: 13–14px;
font-weight: 700;
color: var(--t1);

/* Valor de KPI */
font-size: 28–36px;
font-weight: 700;
color: var(--t1);

/* Subtítulo / label */
font-size: 11–12px;
font-weight: 500–600;
color: var(--t3);
text-transform: uppercase;
letter-spacing: 0.04em;

/* Microcopy */
font-size: 11px;
color: var(--t4);
```

### 5.2. Regras de texto

- Títulos devem ser objetivos e descritivos, nunca poéticos.
- Explicações podem ser pedagógicas, mas curtas.
- Evitar texto longo na interface principal — reservar para PDF/relatório.
- Toda conclusão deve ser sustentada por dado.

Exemplo inadequado:

```
O que a prova sussurrou sobre a aprendizagem
```

Exemplos adequados:

```
Anatomia do simulado
Analise questão por questão, considerando acerto, discriminante e distratores.
```

---

## 6. Layout geral

### 6.1. Shell principal

```
┌───────────────┬────────────────────────────────────────────┐
│ Sidebar       │ Header da página                           │
│ fixa, navy    ├────────────────────────────────────────────┤
│               │ Conteúdo principal (scrollável)            │
│               │                                            │
└───────────────┴────────────────────────────────────────────┘
```

### 6.2. Sidebar

A sidebar é fixa, com background navy.

Contém:

- Logo Arco (SVG do arco + wordmark)
- Tagline institucional
- Itens de navegação com ícone + texto
- Slogan no rodapé
- Bloco do usuário ativo

Item ativo marcado com destaque visual. Ícones line style, stroke leve.

### 6.3. Header de página

O header de cada página contém:

- Título da página
- Subtítulo explicativo
- Filtros principais
- Ações principais (ex.: Exportar PDF)
- Identidade Arco discreta no canto direito

---

## 7. Espaçamento

A interface deve ter bastante respiro.

```css
gap: 10px;   /* gaps menores entre chips, badges */
gap: 12px;   /* gaps padrão entre elementos internos */
gap: 16px;   /* gap principal entre cards */
gap: 24px;   /* gap entre seções maiores */

padding: 20px;   /* padding interno dos cards */
padding: 14px;   /* padding reduzido em cards menores */
```

Cards não devem ficar colados. Grids principais usam gap de 12px a 16px.

---

## 8. Cards

Cards são o principal bloco visual da plataforma.

### 8.1. Card base

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);        /* 12px */
  box-shadow: var(--shadow-sm);
  padding: 20px;
}
```

### 8.2. Hover

O hover dos cards deve ser suave e discreto:

```css
.card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: rgba(232, 82, 26, 0.18);  /* borda laranja suave ao hover */
}
```

---

## 9. KPIs

KPIs devem ser usados com moderação.

### 9.1. Estrutura de um bom KPI

- Rótulo (label pequeno, uppercase)
- Valor principal (grande, em destaque)
- Nota comparativa (ex.: +4,1 p.p. vs. anterior)
- CTA ou pista de ação, quando necessário

Exemplo:

```
Desempenho geral
53,6%
+4,1 p.p. vs. simulado anterior
Ver desempenho
```

### 9.2. KPIs por página

**Home:** desempenho geral, presença no simulado, habilidades críticas, alunos em atenção.

**Simulados (executive strip):** média geral, participação, questões críticas, habilidade crítica, índice de qualidade.

**Escolas — Visão geral:** média da rede, maior média, maior presença, mais evoluiu, em atenção.

**Alunos — Ranking:** média geral, em destaque, em atenção, maior evolução, participação.

**Alunos — Perfil:** média, participação, evolução, ponto forte, atenção.

**Professores:** questões analisadas, acerto médio, evolução, discriminante médio, distratores funcionais, revisão sugerida.

---

## 10. Badges e estados

Badges comunicam estado rapidamente. Devem ser curtos — uma ou duas palavras.

### 10.1. Estados implementados

| Badge | Cor |
|---|---|
| Acima do esperado | Verde |
| Em crescimento | Verde |
| Estável | Cinza |
| Atenção | Âmbar |
| Queda recente | Vermelho |
| Crítico | Vermelho |
| Revisão técnica sugerida | Vermelho |
| Resolução sugerida | Laranja |
| Diagnóstica | Azul |
| Excelente | Verde |
| Boa | Azul suave |

### 10.2. Padrão de estilo

```css
.badge-green  { background: var(--green-lt);  color: var(--green-dk); }
.badge-amber  { background: var(--amber-lt);  color: var(--amber); }
.badge-red    { background: var(--red-lt);    color: var(--red); }
.badge-blue   { background: var(--blue-lt);   color: var(--blue-dk); }
```

---

## 11. Botões e CTAs

O laranja Arco é usado principalmente em ações.

```css
/* Botão primário */
.btn-primary {
  background: var(--orange);
  color: white;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  padding: 8px 14px;
}

/* Botão outline */
.btn-outline {
  background: var(--surface);
  color: var(--t1);
  border: 1px solid var(--border);
  border-radius: 999px;
}
```

Regras:

- Não usar muitos botões primários na mesma seção.
- CTA deve indicar ação real e específica.
- Evitar botões que apenas duplicam a navegação da sidebar.

---

## 12. Tabelas

Tabelas são úteis para rankings e listas analíticas.

### 12.1. Usos adequados

- Ranking de alunos
- Ranking de escolas
- Lista de questões da frente
- Histórico por simulado

### 12.2. Regras

- Cabeçalho fixo em tabelas longas
- Apenas colunas realmente úteis
- Status visual na coluna de status
- Possibilidade de ordenação quando fizer sentido
- Busca em rankings com muitos itens

### 12.3. Padrão de linha

```
posição | nome/escola/questão | métrica principal | comparação | status | ação
```

---

## 13. Gráficos

### 13.1. Princípio

Todo gráfico deve responder uma pergunta pedagógica.

Antes de inserir um gráfico:

> Que decisão esse gráfico ajuda a tomar?

Se não houver resposta clara, o gráfico deve sair.

### 13.2. Biblioteca

Todos os gráficos usam **Plotly.js 2.35**.

### 13.3. Catálogo de gráficos implementados

**Linha temporal**

Uso: evolução da média, participação, frente, escola.

Pergunta: O desempenho está subindo, caindo ou oscilando?

**Barras horizontais**

Uso: desempenho por assunto, disciplina, comparação aluno vs. rede.

Pergunta: Onde está concentrada a força ou fragilidade?

**Scatter acerto × discriminante**

Uso: qualidade das questões — Simulados e Professores.

Pergunta: A questão foi difícil e diagnóstica ou apenas pouco informativa?

Quadrantes:

| Quadrante | Leitura |
|---|---|
| Alto acerto + alto discriminante | Boa questão de consolidação |
| Baixo acerto + alto discriminante | Difícil, mas diagnóstica |
| Alto acerto + baixo discriminante | Fácil demais ou pouco discriminativa |
| Baixo acerto + baixo discriminante | Revisão técnica sugerida |

**Barras por alternativa**

Uso: análise de questão, distrator dominante, devolutivas.

Pergunta: Qual alternativa capturou o erro dos alunos?

**Distribuição por faixa**

Uso: perfil de alunos por nível de desempenho, distribuição de questões.

Pergunta: O grupo está concentrado, disperso ou polarizado?

**Mini sparklines**

Uso: cards de tendência, ranking, evolução rápida.

Pergunta: A trajetória é estável, crescente ou decrescente?

### 13.4. Gráficos a evitar

- Pizza sem necessidade
- Gráfico 3D
- Heatmap sem interpretação clara
- Gráfico com muitas cores ao mesmo tempo
- Gráfico que não muda com filtros
- Visualizações com excesso de texto interno

---

## 14. Microinterações

Microinterações devem reforçar sensação de produto premium sem atrapalhar.

### 14.1. Recomendadas

- Hover suave em cards com leve elevação
- Transição ao trocar filtros e simulados
- Expansão de detalhes pedagógicos
- Destaque suave do item ativo na sidebar
- Gráficos atualizando sem piscar

### 14.2. Evitar

- Animações longas (>300ms para interações de usuário)
- Bounce exagerado
- Elementos pulando na tela
- Excesso de brilho ou blur

```css
transition: all var(--dur) var(--ease);   /* --dur: .16s */
```

---

## 15. Accordions e expansões

Expansões evitam poluição textual nas telas analíticas.

Uso recomendado:

- Conclusões pedagógicas de questões
- Detalhes de sinais do panorama
- Evidências de prioridades
- Análises de hipóteses

Regra:

- Fechado: dado objetivo e escaneável
- Aberto: explicação curta com evidência

Não colocar textos longos dentro de accordion.

---

## 16. Tooltips e "como ler"

Métricas técnicas devem ter explicação acessível.

Exemplos de métricas que precisam de microexplicação:

- Discriminante
- Ponto-bisserial
- Distrator dominante
- Questões críticas
- Resolução sugerida
- Revisão técnica sugerida

Padrão de explicação curta:

> "Discriminante indica se a questão separou bem alunos com maior e menor domínio."

Evitar explicações estatísticas longas na tela principal.

---

## 17. Linguagem visual por página

| Página | Linguagem visual |
|---|---|
| Home | Executiva, limpa, painel de gestão. Sem texto longo. |
| Simulados | Analítica e investigativa. Grade de questões em destaque. |
| Escolas | Comparativa e institucional. Rankings e sinais. |
| Alunos | Perfil pedagógico. Ranking objetivo, diagnóstico visual. |
| Professores | Técnica e cuidadosa. Focada em frente e questões. Sem aparência de avaliação pessoal. |
| Devolutivas/PDF | Documento institucional. Limpo, útil, pouco decorativo. |

---

## 18. Responsividade

O MVP foca em **desktop**, pois o uso principal é por gestor/coordenador em computador.

Prioridade:

1. Desktop — completo
2. Tablet — aceitável
3. Mobile — apenas leitura básica

Evitar larguras rígidas demais que quebram em telas menores.

---

## 19. Acessibilidade mínima

Regras básicas:

- Contraste adequado entre texto e fundo
- Não depender apenas de cor para comunicar estado (usar texto ou ícone complementar)
- Texto legível com tamanho mínimo de 11px
- Foco visível em elementos clicáveis
- Botões com área clicável suficiente

---

## 20. Estados de vazio e erro

Nunca mostrar: `undefined`, `null`, `NaN`

Usar: `—` (em dash)

Ou mensagens como: `Sem dados suficientes para esta leitura.`

Estados necessários na interface:

- Sem dados (`—`)
- Questão não selecionada
- Filtro sem resultado
- Simulado não selecionado

---

## 21. PDFs e relatórios

### 21.1. Regras para PDF

- Menos elementos decorativos, mais clareza
- Tabelas úteis, gráficos poucos e objetivos
- Capa limpa com identidade Arco
- Rodapé institucional
- Marca Arco presente
- Máximo de 4 páginas no modelo inicial (Capa + 3)

### 21.2. Estrutura visual do PDF

```
Página 1 — Capa
Página 2 — Resumo técnico do simulado e da frente
Página 3 — Aprendizagem dos alunos
Página 4 — Questões prioritárias e plano de aula
```

---

## 22. Padrão de qualidade visual

Antes de aceitar uma tela, perguntar:

- Parece produto real?
- O gestor entende o que fazer ao olhar?
- Há texto demais?
- Os gráficos respondem perguntas reais?
- A cor está sendo usada com significado?
- Os filtros mudam a tela de verdade?
- O layout está respirado?
- Algum elemento parece decorativo sem propósito?
- A linguagem está profissional?
- A tela está alinhada à identidade Arco?

---

## 23. Síntese

O design system do Projeto Arco deve sustentar uma experiência que una:

```
clareza de produto
+
profundidade pedagógica
+
visual institucional premium
```

O objetivo visual não é impressionar pelo excesso.

É fazer o usuário confiar.

A melhor interface para este produto é aquela que faz o gestor pensar:

> "Eu entendi o que está acontecendo e sei qual decisão tomar."
