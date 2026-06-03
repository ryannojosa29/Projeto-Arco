"""Vocabulário fechado da taxonomia do edital ITA.

Fonte canônica: docs/10-taxonomia-edital-ita.md. Qualquer divergência entre
este arquivo e o docs/10 deve ser tratada como bug — o doc é a verdade humana,
este módulo é a verdade de máquina (`Literal[...]` e validação Pydantic).

Mudanças no edital exigem:
  1) editar docs/10
  2) refletir aqui (Literals + SUBTOPICOS_POR_FRENTE)
  3) bumpar `enrichment_version` no prompt para invalidar cache
"""
from typing import Literal

# ── Disciplinas ──────────────────────────────────────────────
Disciplina = Literal[
    "Matemática",
    "Química",
    "Física",
    "Língua Inglesa",
]

# ── Habilidades cognitivas (vocabulário pequeno e estável) ───
HabilidadeCognitiva = Literal[
    "modelar",          # traduzir enunciado em equação/objeto matemático
    "calcular",         # manipulação algébrica/numérica
    "interpretar",      # extrair informação de texto/gráfico/tabela
    "aplicar_lei",      # aplicação direta de princípio/fórmula conhecida
    "demonstrar",       # prova/dedução formal
    "comparar",         # contraste entre objetos, casos ou cenários
    "inferir",          # tirar conclusão não explícita
    "classificar",      # categorizar em famílias/tipos
]

# ── Frentes por disciplina ───────────────────────────────────
FrenteMatematica = Literal[
    "Conjuntos e Lógica",
    "Aritmética",
    "Funções Reais",
    "Funções Algébricas",
    "Funções Transcendentes",
    "Sistemas e Outras Equações",
    "Matrizes e Determinantes",
    "Sistemas Lineares",
    "Polinômios",
    "Geometria Plana",
    "Geometria Analítica",
    "Geometria Espacial",
    "Trigonometria",
    "Análise Combinatória",
    "Probabilidade",
    "Estatística",
    "Sequências e Progressões",
    "Limites e Continuidade",
    "Derivadas",
    "Integrais",
    "Números Complexos",
]

FrenteQuimica = Literal[
    "Estrutura Atômica",
    "Tabela Periódica e Propriedades dos Elementos",
    "Ligações Químicas",
    "Funções Inorgânicas",
    "Reações Inorgânicas",
    "Química do Estado Sólido",
    "Química Nuclear",
    "Estequiometria",
    "Gases",
    "Soluções",
    "Propriedades Coligativas",
    "Termoquímica",
    "Termodinâmica Física",
    "Cinética Química",
    "Equilíbrio Químico Geral",
    "Equilíbrio Iônico",
    "Equilíbrio de Solubilidade",
    "Eletroquímica",
    "Fundamentos e Hidrocarbonetos",
    "Funções Oxigenadas e Nitrogenadas",
    "Ácidos e Bases Orgânicas",
    "Isomeria",
    "Reações Orgânicas",
    "Polímeros",
    "Análise Qualitativa e Quantitativa",
    "Química Ambiental e Industrial",
]

FrenteFisica = Literal[
    "Fundamentos",
    "Cinemática",
    "Estática e Equilíbrio",
    "Dinâmica",
    "Energia",
    "Gravitação",
    "Movimento Harmônico Simples",
    "Ondas e Acústica",
    "Hidrostática e Hidrodinâmica",
    "Termodinâmica",
    "Óptica Geométrica",
    "Óptica Física",
    "Eletrostática",
    "Eletrodinâmica",
    "Magnetismo",
    "Indução Eletromagnética e Ondas EM",
    "Física Quântica",
    "Relatividade Restrita",
]

FrenteIngles = Literal["Interpretação"]

# Subtópicos válidos por frente — mapeamento exato do docs/10. Frentes sem
# bullets no doc (caso de algumas frentes de Química Orgânica) aceitam apenas
# array vazio em `subtopicos`.
SUBTOPICOS_POR_FRENTE: dict[str, tuple[str, ...]] = {
    # ── Matemática ───────────────────────────────────────────
    "Conjuntos e Lógica": (
        "Operações com conjuntos (união, interseção, complementar)",
        "Princípio da inclusão-exclusão",
        "Proposições, conectivos e tabelas-verdade",
        "Quantificadores e negação",
        "Indução matemática",
    ),
    "Aritmética": (
        "Conjuntos numéricos (ℕ, ℤ, ℚ, ℝ, ℂ)",
        "Divisibilidade, MDC e MMC",
        "Números primos e fatoração",
        "Aritmética modular e congruências",
        "Representação em bases numéricas",
    ),
    "Funções Reais": (
        "Domínio, imagem e contradomínio",
        "Funções injetoras, sobrejetoras e bijetoras",
        "Função composta e inversa",
        "Funções pares, ímpares e periódicas",
        "Gráficos e transformações de funções",
    ),
    "Funções Algébricas": (
        "Função afim (linear e constante)",
        "Função quadrática: vértice, discriminante, raízes",
        "Funções modulares",
        "Funções racionais (hipérbole)",
    ),
    "Funções Transcendentes": (
        "Função exponencial e suas propriedades",
        "Função logarítmica e mudança de base",
        "Equações e inequações exponenciais e logarítmicas",
    ),
    "Sistemas e Outras Equações": (
        "Sistemas lineares e escalonamento",
        "Sistemas não-lineares",
        "Equações irracionais e com módulo",
    ),
    "Matrizes e Determinantes": (
        "Operações com matrizes",
        "Matriz inversa e transposta",
        "Determinantes: regra de Sarrus e Laplace",
        "Propriedades dos determinantes",
    ),
    "Sistemas Lineares": (
        "Discussão de sistemas (Cramer, Rouché-Capelli)",
        "Escalonamento de Gauss",
        "Dependência e independência linear (conceito)",
    ),
    "Polinômios": (
        "Operações com polinômios (adição, multiplicação, divisão)",
        "Divisão de polinômios e teorema do resto",
        "Dispositivo de Briot-Ruffini",
        "Funções polinomiais de grau superior",
        "Teorema Fundamental da Álgebra",
        "Teorema do fator e raízes racionais",
        "Equações polinomiais: relações de Girard",
        "Multiplicidade de raízes",
    ),
    "Geometria Plana": (
        "Ângulos, retas e paralelismo",
        "Triângulos: congruência, semelhança e relações métricas",
        "Quadriláteros notáveis e polígonos",
        "Circunferência e círculo: arcos, cordas, tangentes e inscrição",
        "Áreas de figuras planas",
    ),
    "Geometria Analítica": (
        "Ponto, reta e distâncias no plano cartesiano",
        "Circunferência: equação e posições relativas",
        "Cônicas: elipse, hipérbole e parábola",
        "Translação e rotação de eixos",
        "Coordenadas polares",
    ),
    "Geometria Espacial": (
        "Posições relativas de retas e planos no espaço",
        "Poliedros de Platão e relação de Euler",
        "Prismas e pirâmides: áreas e volumes",
        "Cilindros, cones e esferas: áreas e volumes",
        "Secções planas e inscrição/circunscrição",
    ),
    "Trigonometria": (
        "Razões trigonométricas no triângulo retângulo",
        "Ciclo trigonométrico e ângulos em graus e radianos",
        "Identidades trigonométricas fundamentais",
        "Fórmulas de adição, duplicação e bisseção",
        "Lei dos senos e lei dos cossenos",
        "Funções trigonométricas (sen, cos, tg e inversas)",
        "Equações e inequações trigonométricas",
        "Funções inversas: arcsen, arccos e arctg",
    ),
    "Análise Combinatória": (
        "Princípio Fundamental da Contagem",
        "Permutações simples e com repetição",
        "Combinações simples e com repetição",
        "Arranjos",
        "Binômio de Newton e Triângulo de Pascal",
        "Contagem em grafos e reticulados",
    ),
    "Probabilidade": (
        "Espaço amostral e eventos",
        "Probabilidade clássica e axiomática",
        "Probabilidade condicional e independência",
        "Teorema de Bayes",
        "Distribuições discretas: binomial e geométrica",
        "Variável aleatória e esperança matemática",
    ),
    "Estatística": (
        "Média, mediana e moda",
        "Variância e desvio padrão",
        "Representações gráficas (histograma e boxplot)",
        "Correlação e regressão linear (conceito)",
    ),
    "Sequências e Progressões": (
        "Progressão Aritmética (PA): termo geral e soma",
        "Progressão Geométrica (PG): termo geral e soma",
        "Séries infinitas convergentes (PG com |r| < 1)",
        "Sequências recursivas e relações de recorrência",
        "Sequência de Fibonacci e razão áurea",
    ),
    "Limites e Continuidade": (
        "Noção intuitiva de limite",
        "Limites laterais e limites no infinito",
        "Continuidade e descontinuidades",
        "Limites fundamentais",
    ),
    "Derivadas": (
        "Definição de derivada como limite",
        "Regras de derivação (produto, quociente e cadeia)",
        "Derivadas de funções elementares",
        "Crescimento, decrescimento, concavidade e extremos",
        "Regra de L'Hôpital",
        "Derivadas de ordem superior",
    ),
    "Integrais": (
        "Integral indefinida e primitivas",
        "Técnicas de integração",
        "Substituição",
        "Integração por partes",
        "Frações parciais",
        "Integral definida e Teorema Fundamental do Cálculo",
        "Áreas e volumes de revolução",
        "Integrais impróprias (conceito)",
    ),
    "Números Complexos": (
        "Forma algébrica e operações",
        "Módulo e argumento",
        "Forma trigonométrica (polar)",
        "Fórmula de Moivre",
        "Raízes de números complexos",
        "Plano de Argand-Gauss",
    ),
    # ── Química ──────────────────────────────────────────────
    "Estrutura Atômica": (
        "Modelos atômicos",
        "Dalton",
        "Thomson",
        "Rutherford",
        "Bohr",
        "Números quânticos e orbitais",
        "Configuração eletrônica",
        "Isótopos, isóbaros e isótonos",
    ),
    "Tabela Periódica e Propriedades dos Elementos": (
        "Organização da tabela periódica",
        "Propriedades periódicas",
        "Raio atômico",
        "Energia de ionização",
        "Eletronegatividade",
        "Afinidade eletrônica",
        "Metais, não-metais e semimetais",
        "Famílias e períodos",
    ),
    "Ligações Químicas": (
        "Ligação iônica",
        "Ligação covalente",
        "Ligação metálica",
        "Polaridade molecular",
        "Geometria molecular (VSEPR)",
        "Teoria do orbital molecular (básico)",
        "Forças intermoleculares",
    ),
    "Funções Inorgânicas": (
        "Ácidos",
        "Bases",
        "Sais",
        "Óxidos",
        "Nomenclatura inorgânica",
    ),
    "Reações Inorgânicas": (
        "Síntese e decomposição",
        "Simples troca",
        "Dupla troca",
        "Neutralização ácido-base",
        "Oxirredução",
        "Reações envolvendo óxidos",
    ),
    "Química do Estado Sólido": (
        "Tipos de sólidos",
        "Estrutura cristalina",
        "Empacotamentos cristalinos",
        "Alotropia",
        "Propriedades físicas dos sólidos",
        "Defeitos cristalinos",
    ),
    "Química Nuclear": (
        "Radioatividade",
        "Leis de Soddy",
        "Meia-vida",
        "Fissão nuclear",
        "Fusão nuclear",
        "Reações nucleares",
        "Energia de ligação",
        "Aplicações nucleares",
    ),
    "Estequiometria": (
        "Leis ponderais",
        "Mol e número de Avogadro",
        "Massa molar",
        "Fórmula mínima e molecular",
        "Reagente limitante",
        "Pureza e rendimento",
        "Composição percentual",
    ),
    "Gases": (
        "Leis dos gases",
        "Equação de Clapeyron",
        "Misturas gasosas",
        "Teoria cinética dos gases",
        "Volume molar",
    ),
    "Soluções": (
        "Solubilidade",
        "Curvas de solubilidade",
        "Concentrações",
        "Fração molar e molalidade",
        "Diluição e mistura",
        "Lei de Henry",
    ),
    "Propriedades Coligativas": (
        "Tonoscopia",
        "Ebulioscopia",
        "Crioscopia",
        "Osmoscopia",
        "Fator de van't Hoff",
    ),
    "Termoquímica": (
        "Entalpia",
        "Reações endotérmicas e exotérmicas",
        "Lei de Hess",
        "Energia de ligação (termoquímica)",
        "Calor específico",
    ),
    "Termodinâmica Física": (
        "Primeira Lei da Termodinâmica",
        "Entropia",
        "Energia livre de Gibbs",
        "Espontaneidade",
        "Relação ΔG° e K",
        "Trabalho de expansão",
    ),
    "Cinética Química": (
        "Velocidade de reação",
        "Lei de velocidade",
        "Energia de ativação",
        "Equação de Arrhenius",
        "Mecanismos de reação",
    ),
    "Equilíbrio Químico Geral": (
        "Equilíbrio dinâmico",
        "Kc e Kp",
        "Quociente Q",
        "Le Chatelier",
        "Grau de dissociação",
    ),
    "Equilíbrio Iônico": (
        "pH e pOH",
        "Ka e Kb",
        "Hidrólise salina",
        "Soluções tampão",
        "Titulação",
    ),
    "Equilíbrio de Solubilidade": (
        "Kps",
        "Solubilidade (equilíbrio)",
        "Íon comum",
        "Precipitação fracionada",
        "Complexação",
    ),
    "Eletroquímica": (
        "Número de oxidação",
        "Pilhas",
        "Equação de Nernst",
        "Eletrólise",
        "Leis de Faraday",
        "Corrosão",
    ),
    "Fundamentos e Hidrocarbonetos": (),
    "Funções Oxigenadas e Nitrogenadas": (),
    "Ácidos e Bases Orgânicas": (),
    "Isomeria": (),
    "Reações Orgânicas": (),
    "Polímeros": (),
    "Análise Qualitativa e Quantitativa": (
        "Identificação de cátions e ânions",
        "Volumetria",
        "Espectrofotometria",
    ),
    "Química Ambiental e Industrial": (
        "Poluição",
        "Efeito estufa",
        "Processos industriais",
        "Combustíveis",
        "Biocombustíveis",
    ),
    # ── Física ───────────────────────────────────────────────
    "Fundamentos": (
        "Medidas físicas",
        "Erro e incerteza",
        "Análise dimensional",
        "Grandezas escalares e vetoriais",
        "Operações vetoriais",
        "Escalas e gráficos",
        "Sistema Internacional (SI)",
    ),
    "Cinemática": (
        "Equação horária",
        "Velocidade e aceleração",
        "Gráficos do movimento",
        "Lançamento de projéteis",
        "Movimento circular",
        "Cinemática vetorial",
    ),
    "Estática e Equilíbrio": (
        "Forças",
        "Equilíbrio de partículas",
        "Momento de força",
        "Equilíbrio de corpos rígidos",
        "Estabilidade",
    ),
    "Dinâmica": (
        "Leis de Newton",
        "Movimento retilíneo",
        "Movimento circular (dinâmica)",
        "Força centrípeta",
        "Referenciais acelerados",
        "Impulso e quantidade de movimento",
        "Centro de massa",
    ),
    "Energia": (
        "Trabalho",
        "Energia cinética",
        "Energia potencial",
        "Conservação da energia",
        "Forças conservativas e dissipativas",
    ),
    "Gravitação": (
        "Gravitação universal",
        "Campo gravitacional",
        "Leis de Kepler",
    ),
    "Movimento Harmônico Simples": (
        "MHS",
        "Superposição",
        "Pêndulo simples",
    ),
    "Ondas e Acústica": (
        "Ondas mecânicas",
        "Som",
        "Cordas vibrantes",
        "Tubos sonoros",
        "Efeito Doppler",
    ),
    "Hidrostática e Hidrodinâmica": (
        "Pressão",
        "Arquimedes",
        "Pascal",
        "Vazão",
        "Continuidade",
        "Bernoulli",
        "Torricelli",
    ),
    "Termodinâmica": (
        "Temperatura",
        "Escalas termométricas",
        "Dilatação",
        "Gases perfeitos",
        "Teoria cinética (termodinâmica)",
        "Calorimetria",
        "1ª e 2ª Leis",
        "Propagação do calor",
    ),
    "Óptica Geométrica": (
        "Reflexão",
        "Refração",
        "Espelhos",
        "Prismas",
        "Lentes",
    ),
    "Óptica Física": (
        "Interferência",
        "Difração",
        "Polarização",
        "Natureza da luz",
    ),
    "Eletrostática": (
        "Eletrização",
        "Lei de Coulomb",
        "Campo elétrico",
        "Potencial elétrico",
        "Capacitores",
    ),
    "Eletrodinâmica": (
        "Corrente elétrica",
        "Resistência",
        "Lei de Ohm",
        "Efeito Joule",
        "Kirchhoff",
        "Ponte de Wheatstone",
        "Geradores",
    ),
    "Magnetismo": (
        "Campo magnético",
        "Ímãs",
        "Bobinas",
        "Força magnética",
        "Interação entre correntes",
    ),
    "Indução Eletromagnética e Ondas EM": (
        "Lei de Faraday",
        "Lei de Lenz",
        "Indutância",
        "Ondas eletromagnéticas",
    ),
    "Física Quântica": (
        "Efeito fotoelétrico",
        "Corpo negro",
        "Átomo de Bohr",
        "Princípio da incerteza",
    ),
    "Relatividade Restrita": (
        "Postulados de Einstein",
        "Transformações de Lorentz",
        "Dilatação temporal",
        "Contração espacial",
        "Composição de velocidades",
        "Massa-energia",
    ),
    # ── Língua Inglesa ───────────────────────────────────────
    "Interpretação": (),
}

# Mapping disciplina → frentes válidas (Literal interno por disciplina).
FRENTES_POR_DISCIPLINA: dict[str, tuple[str, ...]] = {
    "Matemática": tuple(FrenteMatematica.__args__),
    "Química": tuple(FrenteQuimica.__args__),
    "Física": tuple(FrenteFisica.__args__),
    "Língua Inglesa": tuple(FrenteIngles.__args__),
}


def subtopicos_validos(frente: str) -> tuple[str, ...]:
    """Retorna tupla de subtópicos válidos para uma frente. Vazia se a frente
    não tiver bullets no edital (caso de algumas frentes de Química Orgânica
    e de Língua Inglesa)."""
    return SUBTOPICOS_POR_FRENTE.get(frente, ())


def frente_pertence_a(disciplina: str, frente: str) -> bool:
    return frente in FRENTES_POR_DISCIPLINA.get(disciplina, ())
