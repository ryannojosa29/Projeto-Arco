# 10 — Taxonomia do edital ITA

## 1. Papel deste documento

Este documento é a **fonte canônica** da taxonomia do edital ITA usada pela
plataforma. Cobre três níveis:

- **Disciplina** — Matemática, Química, Física;
- **Frente** (capítulo) — ex.: "Geometria Plana", "Cinemática", "Equilíbrio Iônico";
- **Subtópicos** (itens) — ex.: "Lançamento de projéteis", "Lei de Hess".

Ele serve como:

- vocabulário fechado para o Estágio 2 do pipeline de ingestão
  (`docs/09-pipeline-de-ingestao-de-provas.md`), onde a IA classifica cada
  questão por `frente` e `subtopicos`;
- referência para a página Professores e para os critérios de cobertura por
  frente em qualidade do simulado (`docs/05-dados-e-estatistica.md` §11.2.4);
- fonte de verdade ao validar metadados gerados pelo LLM — qualquer valor
  fora desta taxonomia deve falhar o schema e disparar `enrichment_status=failed`.

A regra central é:

> Vocabulário fechado, semântica controlada. O LLM classifica dentro do edital
> ou marca como inválido — nunca inventa categorias.

### 1.1 Língua Inglesa

Questões de Língua Inglesa usam **frente única**: `"Interpretação"`. O array
`subtopicos` fica vazio — não há subdivisão no primeiro corte. A seção 🌐 Língua
Inglesa no fim deste documento materializa essa decisão. Pode evoluir quando
houver volume suficiente de dados para justificar granularidade (reading,
vocabulary, grammar etc.).

### 1.2 Como evoluir esta taxonomia

- Mudanças no edital → atualizar este documento e bumpar
  `enrichment_version` para invalidar o cache do Estágio 2;
- Cada release de prompt do `enrichment_agent` carrega referência à versão
  desta taxonomia que foi usada.

---

# 🧮 Matemática

## 1. Conjuntos e Lógica

### 1.1 Conjuntos e Lógica
- Operações com conjuntos (união, interseção, complementar)
- Princípio da inclusão-exclusão
- Proposições, conectivos e tabelas-verdade
- Quantificadores e negação
- Indução matemática

---

## 2. Aritmética

### 2.1 Aritmética
- Conjuntos numéricos (ℕ, ℤ, ℚ, ℝ, ℂ)
- Divisibilidade, MDC e MMC
- Números primos e fatoração
- Aritmética modular e congruências
- Representação em bases numéricas

---

## 3. Álgebra e Funções

### 3.1 Funções Reais
- Domínio, imagem e contradomínio
- Funções injetoras, sobrejetoras e bijetoras
- Função composta e inversa
- Funções pares, ímpares e periódicas
- Gráficos e transformações de funções

### 3.2 Funções Algébricas
- Função afim (linear e constante)
- Função quadrática: vértice, discriminante, raízes
- Funções modulares
- Funções racionais (hipérbole)

### 3.3 Funções Transcendentes
- Função exponencial e suas propriedades
- Função logarítmica e mudança de base
- Equações e inequações exponenciais e logarítmicas

### 3.4 Sistemas e Outras Equações
- Sistemas lineares e escalonamento
- Sistemas não-lineares
- Equações irracionais e com módulo

---

## 4. Álgebra Linear e Matrizes

### 4.1 Matrizes e Determinantes
- Operações com matrizes
- Matriz inversa e transposta
- Determinantes: regra de Sarrus e Laplace
- Propriedades dos determinantes

### 4.2 Sistemas Lineares
- Discussão de sistemas (Cramer, Rouché-Capelli)
- Escalonamento de Gauss
- Dependência e independência linear (conceito)

---

## 5. Polinômios

### 5.1 Polinômios
- Operações com polinômios (adição, multiplicação, divisão)
- Divisão de polinômios e teorema do resto
- Dispositivo de Briot-Ruffini
- Funções polinomiais de grau superior
- Teorema Fundamental da Álgebra
- Teorema do fator e raízes racionais
- Equações polinomiais: relações de Girard
- Multiplicidade de raízes

---

## 6. Geometria Plana

### 6.1 Geometria Plana
- Ângulos, retas e paralelismo
- Triângulos: congruência, semelhança e relações métricas
- Quadriláteros notáveis e polígonos
- Circunferência e círculo: arcos, cordas, tangentes e inscrição
- Áreas de figuras planas

---

## 7. Geometria Analítica

### 7.1 Geometria Analítica
- Ponto, reta e distâncias no plano cartesiano
- Circunferência: equação e posições relativas
- Cônicas: elipse, hipérbole e parábola
- Translação e rotação de eixos
- Coordenadas polares

---

## 8. Geometria Espacial

### 8.1 Geometria Espacial
- Posições relativas de retas e planos no espaço
- Poliedros de Platão e relação de Euler
- Prismas e pirâmides: áreas e volumes
- Cilindros, cones e esferas: áreas e volumes
- Secções planas e inscrição/circunscrição

---

## 9. Trigonometria

### 9.1 Trigonometria
- Razões trigonométricas no triângulo retângulo
- Ciclo trigonométrico e ângulos em graus e radianos
- Identidades trigonométricas fundamentais
- Fórmulas de adição, duplicação e bisseção
- Lei dos senos e lei dos cossenos
- Funções trigonométricas (sen, cos, tg e inversas)
- Equações e inequações trigonométricas
- Funções inversas: arcsen, arccos e arctg

---

## 10. Combinatória, Probabilidade e Estatística

### 10.1 Análise Combinatória
- Princípio Fundamental da Contagem
- Permutações simples e com repetição
- Combinações simples e com repetição
- Arranjos
- Binômio de Newton e Triângulo de Pascal
- Contagem em grafos e reticulados

### 10.2 Probabilidade
- Espaço amostral e eventos
- Probabilidade clássica e axiomática
- Probabilidade condicional e independência
- Teorema de Bayes
- Distribuições discretas: binomial e geométrica
- Variável aleatória e esperança matemática

### 10.3 Estatística
- Média, mediana e moda
- Variância e desvio padrão
- Representações gráficas (histograma e boxplot)
- Correlação e regressão linear (conceito)

---

## 11. Sequências e Progressões

### 11.1 Sequências e Progressões
- Progressão Aritmética (PA): termo geral e soma
- Progressão Geométrica (PG): termo geral e soma
- Séries infinitas convergentes (PG com |r| < 1)
- Sequências recursivas e relações de recorrência
- Sequência de Fibonacci e razão áurea

---

## 12. Cálculo Diferencial e Integral

### 12.1 Limites e Continuidade
- Noção intuitiva de limite
- Limites laterais e limites no infinito
- Continuidade e descontinuidades
- Limites fundamentais

### 12.2 Derivadas
- Definição de derivada como limite
- Regras de derivação (produto, quociente e cadeia)
- Derivadas de funções elementares
- Crescimento, decrescimento, concavidade e extremos
- Regra de L'Hôpital
- Derivadas de ordem superior

### 12.3 Integrais
- Integral indefinida e primitivas
- Técnicas de integração
  - Substituição
  - Integração por partes
  - Frações parciais
- Integral definida e Teorema Fundamental do Cálculo
- Áreas e volumes de revolução
- Integrais impróprias (conceito)

---

## 13. Números Complexos

### 13.1 Números Complexos
- Forma algébrica e operações
- Módulo e argumento
- Forma trigonométrica (polar)
- Fórmula de Moivre
- Raízes de números complexos
- Plano de Argand-Gauss

---

# ⚗️ Química

## 1. Química Geral e Estrutura da Matéria

### 1.1 Estrutura Atômica
- Modelos atômicos
  - Dalton
  - Thomson
  - Rutherford
  - Bohr
- Números quânticos e orbitais
- Configuração eletrônica
- Isótopos, isóbaros e isótonos

### 1.2 Tabela Periódica e Propriedades dos Elementos
- Organização da tabela periódica
- Propriedades periódicas
  - Raio atômico
  - Energia de ionização
  - Eletronegatividade
  - Afinidade eletrônica
- Metais, não-metais e semimetais
- Famílias e períodos

### 1.3 Ligações Químicas
- Ligação iônica
- Ligação covalente
- Ligação metálica
- Polaridade molecular
- Geometria molecular (VSEPR)
- Teoria do orbital molecular (básico)
- Forças intermoleculares

### 1.4 Funções Inorgânicas
- Ácidos
- Bases
- Sais
- Óxidos
- Nomenclatura inorgânica

### 1.5 Reações Inorgânicas
- Síntese e decomposição
- Simples troca
- Dupla troca
- Neutralização ácido-base
- Oxirredução
- Reações envolvendo óxidos

### 1.6 Química do Estado Sólido
- Tipos de sólidos
- Estrutura cristalina
- Empacotamentos cristalinos
- Alotropia
- Propriedades físicas dos sólidos
- Defeitos cristalinos

---

## 2. Química Nuclear

### 2.1 Química Nuclear
- Radioatividade
- Leis de Soddy
- Meia-vida
- Fissão nuclear
- Fusão nuclear
- Reações nucleares
- Energia de ligação
- Aplicações nucleares

---

## 3. Estequiometria e Gases

### 3.1 Estequiometria
- Leis ponderais
- Mol e número de Avogadro
- Massa molar
- Fórmula mínima e molecular
- Reagente limitante
- Pureza e rendimento
- Composição percentual

### 3.2 Gases
- Leis dos gases
- Equação de Clapeyron
- Misturas gasosas
- Teoria cinética
- Volume molar

---

## 4. Soluções

### 4.1 Soluções
- Solubilidade
- Curvas de solubilidade
- Concentrações
- Fração molar e molalidade
- Diluição e mistura
- Lei de Henry

---

## 5. Propriedades Coligativas

### 5.1 Propriedades Coligativas
- Tonoscopia
- Ebulioscopia
- Crioscopia
- Osmoscopia
- Fator de van't Hoff

---

## 6. Termoquímica

### 6.1 Termoquímica
- Entalpia
- Reações endotérmicas e exotérmicas
- Lei de Hess
- Energia de ligação
- Calor específico

---

## 7. Termodinâmica Física

### 7.1 Termodinâmica Física
- Primeira Lei da Termodinâmica
- Entropia
- Energia livre de Gibbs
- Espontaneidade
- Relação ΔG° e K
- Trabalho de expansão

---

## 8. Cinética Química

### 8.1 Cinética Química
- Velocidade de reação
- Lei de velocidade
- Energia de ativação
- Equação de Arrhenius
- Mecanismos de reação

---

## 9. Equilíbrio Químico

### 9.1 Equilíbrio Químico Geral
- Equilíbrio dinâmico
- Kc e Kp
- Quociente Q
- Le Chatelier
- Grau de dissociação

### 9.2 Equilíbrio Iônico
- pH e pOH
- Ka e Kb
- Hidrólise salina
- Soluções tampão
- Titulação

### 9.3 Equilíbrio de Solubilidade
- Kps
- Solubilidade
- Íon comum
- Precipitação fracionada
- Complexação

---

## 10. Eletroquímica

### 10.1 Eletroquímica
- Número de oxidação
- Pilhas
- Equação de Nernst
- Eletrólise
- Leis de Faraday
- Corrosão

---

## 11. Química Orgânica

### 11.1 Fundamentos e Hidrocarbonetos
### 11.2 Funções Oxigenadas e Nitrogenadas
### 11.3 Ácidos e Bases Orgânicas
### 11.4 Isomeria
### 11.5 Reações Orgânicas
### 11.6 Polímeros

*(mantidos conforme estrutura do edital)*

---

## 12. Química Analítica e Ambiental

### 12.1 Análise Qualitativa e Quantitativa
- Identificação de cátions e ânions
- Volumetria
- Espectrofotometria

### 12.2 Química Ambiental e Industrial
- Poluição
- Efeito estufa
- Processos industriais
- Combustíveis
- Biocombustíveis

---

# ⚛️ Física

## 1. Fundamentos e Ferramentas Matemáticas

### 1.1 Fundamentos
- Medidas físicas
- Erro e incerteza
- Análise dimensional
- Grandezas escalares e vetoriais
- Operações vetoriais
- Escalas e gráficos
- Sistema Internacional (SI)

---

## 2. Cinemática

### 2.1 Cinemática
- Equação horária
- Velocidade e aceleração
- Gráficos do movimento
- Lançamento de projéteis
- Movimento circular
- Cinemática vetorial

---

## 3. Estática e Equilíbrio

### 3.1 Estática e Equilíbrio
- Forças
- Equilíbrio de partículas
- Momento de força
- Equilíbrio de corpos rígidos
- Estabilidade

---

## 4. Dinâmica

### 4.1 Dinâmica
- Leis de Newton
- Movimento retilíneo
- Movimento circular
- Força centrípeta
- Referenciais acelerados
- Impulso e quantidade de movimento
- Centro de massa

---

## 5. Energia

### 5.1 Energia
- Trabalho
- Energia cinética
- Energia potencial
- Conservação da energia
- Forças conservativas e dissipativas

---

## 6. Gravitação

### 6.1 Gravitação
- Gravitação universal
- Campo gravitacional
- Leis de Kepler

---

## 7. Oscilações e Ondas Mecânicas

### 7.1 Movimento Harmônico Simples
- MHS
- Superposição
- Pêndulo simples

### 7.2 Ondas e Acústica
- Ondas mecânicas
- Som
- Cordas vibrantes
- Tubos sonoros
- Efeito Doppler

---

## 8. Hidrostática e Hidrodinâmica

### 8.1 Hidrostática e Hidrodinâmica
- Pressão
- Arquimedes
- Pascal
- Vazão
- Continuidade
- Bernoulli
- Torricelli

---

## 9. Termodinâmica

### 9.1 Termodinâmica
- Temperatura
- Escalas termométricas
- Dilatação
- Gases perfeitos
- Teoria cinética
- Calorimetria
- 1ª e 2ª Leis
- Propagação do calor

---

## 10. Óptica

### 10.1 Óptica Geométrica
- Reflexão
- Refração
- Espelhos
- Prismas
- Lentes

### 10.2 Óptica Física
- Interferência
- Difração
- Polarização
- Natureza da luz

---

## 11. Eletrostática

### 11.1 Eletrostática
- Eletrização
- Lei de Coulomb
- Campo elétrico
- Potencial elétrico
- Capacitores

---

## 12. Eletrodinâmica

### 12.1 Eletrodinâmica
- Corrente elétrica
- Resistência
- Lei de Ohm
- Efeito Joule
- Kirchhoff
- Ponte de Wheatstone
- Geradores

---

## 13. Eletromagnetismo

### 13.1 Magnetismo
- Campo magnético
- Ímãs
- Bobinas
- Força magnética
- Interação entre correntes

### 13.2 Indução Eletromagnética e Ondas EM
- Lei de Faraday
- Lei de Lenz
- Indutância
- Ondas eletromagnéticas

---

## 14. Física Moderna

### 14.1 Física Quântica
- Efeito fotoelétrico
- Corpo negro
- Átomo de Bohr
- Princípio da incerteza

### 14.2 Relatividade Restrita
- Postulados de Einstein
- Transformações de Lorentz
- Dilatação temporal
- Contração espacial
- Composição de velocidades
- Massa-energia

---

# 🌐 Língua Inglesa

## 1. Interpretação

### 1.1 Interpretação
- (sem subdivisão — todas as questões de Inglês caem aqui)
