/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Mock Data Layer
   Dados fake realistas para demonstração. Nunca usar dados reais.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── SIMULADOS ─────────────────────────────────────────────── */
const SIMULADOS = [
  { id: 1, label: '1º Simulado ENEM 2025', labelCurto: '1º Sim. 2025', mes: 'Fevereiro 2025' },
  { id: 2, label: '2º Simulado ENEM 2025', labelCurto: '2º Sim. 2025', mes: 'Abril 2025' },
  { id: 3, label: '3º Simulado ENEM 2025', labelCurto: '3º Sim. 2025', mes: 'Junho 2025' },
  { id: 4, label: '4º Simulado ENEM 2025', labelCurto: '4º Sim. 2025', mes: 'Agosto 2025' },
  { id: 5, label: '5º Simulado ENEM 2025', labelCurto: '5º Sim. 2025', mes: 'Outubro 2025' },
];

/* ── MÉDIAS DA REDE POR SIMULADO ───────────────────────────── */
const REDE_MEDIA_SIM = [43.5, 45.1, 47.8, 50.2, 53.6];

/* ── MÉDIAS DA REDE POR DISCIPLINA (simulado 1) ────────────── */
const REDE_DISC = {
  'Física':          43.8,
  'Química':         57.0,
  'Matemática':      58.6,
  'Língua Inglesa':  63.3,
  'Linguagens':      56.1,
  'C. Humanas':      53.4,
};

const DISCIPLINAS = Object.keys(REDE_DISC);

/* ── 48 QUESTÕES ÚNICAS ────────────────────────────────────── */
/*
  Campos: num, disc, comp, assunto, diff, acerto (%), gab, dist, distPct, discriminante
  Status derivado: acerto>=70=above | acerto>=42=att | <42=crit
*/
const QUESTOES_RAW = [
  // FÍSICA (Q01–Q11)
  { num:  1, disc:'Física',         comp:'Mecânica',        assunto:'Leis de Newton',           diff:'Médio',      acerto:68, gab:'A', dist:'C', distPct:16, discriminante:0.34 },
  { num:  2, disc:'Física',         comp:'Mecânica',        assunto:'Trabalho e Energia',        diff:'Médio',      acerto:57, gab:'B', dist:'D', distPct:21, discriminante:0.37 },
  { num:  3, disc:'Física',         comp:'Termodinâmica',   assunto:'Gases Ideais',              diff:'Médio',      acerto:52, gab:'D', dist:'A', distPct:19, discriminante:0.31 },
  { num:  4, disc:'Física',         comp:'Eletromagnetismo',assunto:'Circuitos Elétricos',       diff:'Médio-alto', acerto:44, gab:'C', dist:'B', distPct:24, discriminante:0.38 },
  { num:  5, disc:'Física',         comp:'Eletromagnetismo',assunto:'Campo Magnético',           diff:'Alto',       acerto:31, gab:'E', dist:'B', distPct:31, discriminante:0.29 },
  { num:  6, disc:'Física',         comp:'Ondulatória',     assunto:'Ondas Mecânicas e Som',     diff:'Médio',      acerto:63, gab:'A', dist:'D', distPct:16, discriminante:0.33 },
  { num:  7, disc:'Física',         comp:'Óptica',          assunto:'Reflexão e Refração',       diff:'Fácil',      acerto:79, gab:'C', dist:'E', distPct: 8, discriminante:0.22 },
  { num:  8, disc:'Física',         comp:'Mecânica',        assunto:'Cinemática',                diff:'Médio',      acerto:55, gab:'B', dist:'A', distPct:19, discriminante:0.36 },
  { num:  9, disc:'Física',         comp:'Mecânica',        assunto:'Dinâmica — Plano Inclinado',diff:'Médio-alto', acerto:48, gab:'D', dist:'C', distPct:22, discriminante:0.35 },
  { num: 10, disc:'Física',         comp:'Eletromagnetismo',assunto:'Lei de Faraday',            diff:'Alto',       acerto:37, gab:'E', dist:'C', distPct:28, discriminante:0.30 },
  { num: 11, disc:'Física',         comp:'Física Moderna',  assunto:'Efeito Fotoelétrico',       diff:'Alto',       acerto:34, gab:'A', dist:'D', distPct:29, discriminante:0.27 },
  // QUÍMICA (Q12–Q18)
  { num: 12, disc:'Química',        comp:'Estequiometria',  assunto:'Cálculo Estequiométrico',   diff:'Médio',      acerto:58, gab:'D', dist:'A', distPct:18, discriminante:0.34 },
  { num: 13, disc:'Química',        comp:'Termoquímica',    assunto:'Entalpia de Reação',         diff:'Alto',       acerto:37, gab:'C', dist:'D', distPct:27, discriminante:0.32 },
  { num: 14, disc:'Química',        comp:'Eletroquímica',   assunto:'Pilhas e Eletrólise',        diff:'Médio',      acerto:64, gab:'B', dist:'E', distPct:14, discriminante:0.37 },
  { num: 15, disc:'Química',        comp:'Orgânica',        assunto:'Isomeria Orgânica',          diff:'Alto',       acerto:33, gab:'A', dist:'C', distPct:30, discriminante:0.27 },
  { num: 16, disc:'Química',        comp:'Gases',           assunto:'Transformações Gasosas',     diff:'Médio',      acerto:66, gab:'E', dist:'B', distPct:16, discriminante:0.30 },
  { num: 17, disc:'Química',        comp:'Soluções',        assunto:'Concentração Molar',         diff:'Fácil',      acerto:81, gab:'C', dist:'A', distPct: 7, discriminante:0.23 },
  { num: 18, disc:'Química',        comp:'Cinética Química',assunto:'Velocidade de Reação',       diff:'Médio-alto', acerto:47, gab:'D', dist:'A', distPct:22, discriminante:0.36 },
  // MATEMÁTICA (Q19–Q26)
  { num: 19, disc:'Matemática',     comp:'Funções',         assunto:'Função Quadrática',          diff:'Médio',      acerto:64, gab:'A', dist:'C', distPct:17, discriminante:0.39 },
  { num: 20, disc:'Matemática',     comp:'Geometria Plana', assunto:'Trigonometria',              diff:'Médio-alto', acerto:48, gab:'D', dist:'B', distPct:22, discriminante:0.41 },
  { num: 21, disc:'Matemática',     comp:'Estatística',     assunto:'Probabilidade',              diff:'Médio-alto', acerto:41, gab:'C', dist:'E', distPct:24, discriminante:0.40 },
  { num: 22, disc:'Matemática',     comp:'Geometria Esp.',  assunto:'Volumes de Sólidos',         diff:'Alto',       acerto:34, gab:'B', dist:'C', distPct:31, discriminante:0.35 },
  { num: 23, disc:'Matemática',     comp:'Progressões',     assunto:'PA e PG',                    diff:'Fácil',      acerto:83, gab:'E', dist:'A', distPct: 6, discriminante:0.19 },
  { num: 24, disc:'Matemática',     comp:'Álgebra',         assunto:'Sistemas Lineares',          diff:'Médio',      acerto:70, gab:'C', dist:'B', distPct:13, discriminante:0.43 },
  { num: 25, disc:'Matemática',     comp:'Combinatória',    assunto:'Permutações e Combinações',  diff:'Alto',       acerto:28, gab:'D', dist:'A', distPct:35, discriminante:0.30 },
  { num: 26, disc:'Matemática',     comp:'Funções',         assunto:'Função Exponencial',         diff:'Médio',      acerto:57, gab:'B', dist:'D', distPct:20, discriminante:0.37 },
  // LÍNGUA INGLESA (Q27–Q32)
  { num: 27, disc:'Língua Inglesa', comp:'Reading',         assunto:'Main Idea and Purpose',      diff:'Fácil',      acerto:82, gab:'B', dist:'D', distPct: 7, discriminante:0.21 },
  { num: 28, disc:'Língua Inglesa', comp:'Reading',         assunto:'Inference and Implication',  diff:'Médio',      acerto:67, gab:'A', dist:'C', distPct:16, discriminante:0.31 },
  { num: 29, disc:'Língua Inglesa', comp:'Vocabulary',      assunto:'Contextual Meaning',         diff:'Médio',      acerto:72, gab:'C', dist:'E', distPct:12, discriminante:0.28 },
  { num: 30, disc:'Língua Inglesa', comp:'Grammar',         assunto:'Modal Verbs and Conditionals',diff:'Médio-alto',acerto:54, gab:'D', dist:'A', distPct:21, discriminante:0.33 },
  { num: 31, disc:'Língua Inglesa', comp:'Reading',         assunto:'Text Organization',          diff:'Médio',      acerto:69, gab:'E', dist:'C', distPct:15, discriminante:0.30 },
  { num: 32, disc:'Língua Inglesa', comp:'Vocabulary',      assunto:'Synonyms and Antonyms',      diff:'Fácil',      acerto:75, gab:'B', dist:'D', distPct:10, discriminante:0.25 },
  // LINGUAGENS (Q33–Q39)
  { num: 33, disc:'Linguagens',     comp:'Interpretação',   assunto:'Texto Argumentativo',        diff:'Médio',      acerto:65, gab:'C', dist:'A', distPct:17, discriminante:0.36 },
  { num: 34, disc:'Linguagens',     comp:'Literatura',      assunto:'Romantismo Brasileiro',      diff:'Alto',       acerto:40, gab:'D', dist:'B', distPct:26, discriminante:0.37 },
  { num: 35, disc:'Linguagens',     comp:'Gramática',       assunto:'Coerência e Coesão',         diff:'Médio',      acerto:60, gab:'A', dist:'C', distPct:19, discriminante:0.32 },
  { num: 36, disc:'Linguagens',     comp:'Interpretação',   assunto:'Charge e Linguagem Visual',  diff:'Fácil',      acerto:77, gab:'E', dist:'B', distPct:11, discriminante:0.27 },
  { num: 37, disc:'Linguagens',     comp:'Literatura',      assunto:'Modernismo — 2ª Geração',    diff:'Alto',       acerto:38, gab:'B', dist:'D', distPct:28, discriminante:0.34 },
  { num: 38, disc:'Linguagens',     comp:'Gramática',       assunto:'Morfossintaxe',              diff:'Médio',      acerto:62, gab:'C', dist:'A', distPct:14, discriminante:0.29 },
  { num: 39, disc:'Linguagens',     comp:'Interpretação',   assunto:'Publicidade e Persuasão',    diff:'Fácil',      acerto:78, gab:'A', dist:'D', distPct: 9, discriminante:0.24 },
  // CIÊNCIAS HUMANAS (Q40–Q48)
  { num: 40, disc:'C. Humanas',     comp:'Geografia',       assunto:'Geopolítica Contemporânea',  diff:'Médio',      acerto:58, gab:'D', dist:'C', distPct:20, discriminante:0.33 },
  { num: 41, disc:'C. Humanas',     comp:'História',        assunto:'Brasil República',           diff:'Médio-alto', acerto:45, gab:'A', dist:'B', distPct:23, discriminante:0.38 },
  { num: 42, disc:'C. Humanas',     comp:'Filosofia',       assunto:'Iluminismo e Contrato Social',diff:'Alto',      acerto:34, gab:'E', dist:'A', distPct:29, discriminante:0.30 },
  { num: 43, disc:'C. Humanas',     comp:'Sociologia',      assunto:'Globalização e Desigualdade', diff:'Médio',     acerto:63, gab:'C', dist:'D', distPct:16, discriminante:0.31 },
  { num: 44, disc:'C. Humanas',     comp:'História',        assunto:'Segunda Guerra Mundial',     diff:'Médio',      acerto:66, gab:'B', dist:'A', distPct:15, discriminante:0.30 },
  { num: 45, disc:'C. Humanas',     comp:'Geografia',       assunto:'Climatologia e Biomas',      diff:'Fácil',      acerto:76, gab:'D', dist:'E', distPct:11, discriminante:0.25 },
  { num: 46, disc:'C. Humanas',     comp:'Filosofia',       assunto:'Ética e Moral',              diff:'Médio-alto', acerto:49, gab:'A', dist:'C', distPct:22, discriminante:0.39 },
  { num: 47, disc:'C. Humanas',     comp:'Sociologia',      assunto:'Trabalho e Capital',         diff:'Alto',       acerto:37, gab:'C', dist:'B', distPct:26, discriminante:0.33 },
  { num: 48, disc:'C. Humanas',     comp:'Geografia',       assunto:'Urbanização e Metrópoles',   diff:'Médio',      acerto:61, gab:'E', dist:'C', distPct:18, discriminante:0.32 },
];

/* Computar status de cada questão */
const QUESTOES = QUESTOES_RAW.map(q => ({
  ...q,
  status: q.acerto >= 70 ? 'above' : q.acerto >= 42 ? 'att' : 'crit',
}));

/* Helper: questões filtradas por disciplina */
function getQuestoesFiltradas(disciplina) {
  if (!disciplina || disciplina === 'all') return QUESTOES;
  return QUESTOES.filter(q => q.disc === disciplina);
}

/* ── 28 ESCOLAS ────────────────────────────────────────────── */
/*
  evo: médias nos 5 simulados (usados como histórico)
  forte/fraco: disciplina de destaque/atenção
*/
const ESCOLAS = [
  { key:'a',  nome:'Escola A',  media:62.8, var:+6.7, rankMove:+2, part:94, evo:[48.2,51.4,54.1,57.3,62.8], forte:'Matemática',     fraco:'C. Humanas'   },
  { key:'b',  nome:'Escola B',  media:60.1, var:+8.7, rankMove:+3, part:91, evo:[43.2,46.8,50.1,53.9,60.1], forte:'Física',          fraco:'Redação'      },
  { key:'c',  nome:'Escola C',  media:58.4, var:+3.2, rankMove: 0, part:89, evo:[47.1,49.2,52.4,55.8,58.4], forte:'Língua Inglesa',  fraco:'Química'      },
  { key:'d',  nome:'Escola D',  media:57.2, var:+1.8, rankMove:+1, part:88, evo:[50.1,51.4,53.7,55.9,57.2], forte:'Linguagens',      fraco:'Física'       },
  { key:'e',  nome:'Escola E',  media:55.6, var:+2.1, rankMove: 0, part:87, evo:[45.3,47.8,50.2,53.4,55.6], forte:'Matemática',      fraco:'C. Humanas'   },
  { key:'f',  nome:'Escola F',  media:54.1, var:-0.8, rankMove:-1, part:86, evo:[49.2,50.4,52.3,54.8,54.1], forte:'Língua Inglesa',  fraco:'Física'       },
  { key:'g',  nome:'Escola G',  media:53.8, var:+1.4, rankMove:+2, part:85, evo:[44.2,46.7,49.1,52.3,53.8], forte:'Química',         fraco:'Linguagens'   },
  { key:'h',  nome:'Escola H',  media:52.7, var:-1.2, rankMove:-1, part:84, evo:[48.1,50.2,52.8,54.1,52.7], forte:'C. Humanas',      fraco:'Matemática'   },
  { key:'i',  nome:'Escola I',  media:51.9, var:+0.6, rankMove: 0, part:83, evo:[45.8,47.2,49.4,51.3,51.9], forte:'Linguagens',      fraco:'Física'       },
  { key:'j',  nome:'Escola J',  media:50.8, var:-1.7, rankMove:-2, part:82, evo:[47.2,49.4,52.1,53.0,50.8], forte:'Matemática',      fraco:'Química'      },
  { key:'k',  nome:'Escola K',  media:50.2, var:+2.3, rankMove:+1, part:81, evo:[41.8,43.9,46.1,48.7,50.2], forte:'Física',          fraco:'C. Humanas'   },
  { key:'l',  nome:'Escola L',  media:49.7, var:-0.4, rankMove: 0, part:80, evo:[46.3,47.8,49.2,50.1,49.7], forte:'Língua Inglesa',  fraco:'Matemática'   },
  { key:'m',  nome:'Escola M',  media:49.1, var:+1.1, rankMove:+1, part:80, evo:[42.7,44.3,46.8,48.2,49.1], forte:'Química',         fraco:'Física'       },
  { key:'n',  nome:'Escola N',  media:48.4, var:-2.1, rankMove:-3, part:79, evo:[45.2,47.8,50.3,51.2,48.4], forte:'Linguagens',      fraco:'Matemática'   },
  { key:'o',  nome:'Escola O',  media:47.8, var:+0.9, rankMove:+1, part:78, evo:[40.2,42.1,44.3,46.9,47.8], forte:'C. Humanas',      fraco:'Física'       },
  { key:'p',  nome:'Escola P',  media:47.2, var:-1.4, rankMove:-1, part:77, evo:[44.1,46.3,48.7,49.0,47.2], forte:'Matemática',      fraco:'Química'      },
  { key:'q',  nome:'Escola Q',  media:46.5, var:+0.3, rankMove: 0, part:77, evo:[41.8,43.2,44.9,46.2,46.5], forte:'Física',          fraco:'Linguagens'   },
  { key:'r',  nome:'Escola R',  media:45.9, var:-3.2, rankMove:-4, part:76, evo:[43.8,46.1,48.4,49.7,45.9], forte:'Língua Inglesa',  fraco:'C. Humanas'   },
  { key:'s',  nome:'Escola S',  media:45.1, var:+1.7, rankMove:+2, part:75, evo:[38.4,40.2,42.1,43.8,45.1], forte:'Química',         fraco:'Matemática'   },
  { key:'t',  nome:'Escola T',  media:44.3, var:-0.7, rankMove:-1, part:74, evo:[41.2,43.1,45.8,44.9,44.3], forte:'Linguagens',      fraco:'Física'       },
  { key:'u',  nome:'Escola U',  media:43.7, var:+0.4, rankMove: 0, part:73, evo:[37.8,39.4,41.1,43.2,43.7], forte:'C. Humanas',      fraco:'Química'      },
  { key:'v',  nome:'Escola V',  media:42.8, var:-2.8, rankMove:-3, part:72, evo:[42.1,44.7,47.2,46.0,42.8], forte:'Matemática',      fraco:'Física'       },
  { key:'w',  nome:'Escola W',  media:41.9, var:+1.2, rankMove:+1, part:71, evo:[35.8,37.4,39.2,40.8,41.9], forte:'Língua Inglesa',  fraco:'Linguagens'   },
  { key:'x',  nome:'Escola X',  media:40.7, var:-1.6, rankMove:-2, part:70, evo:[39.4,41.2,43.1,42.4,40.7], forte:'Física',          fraco:'C. Humanas'   },
  { key:'y',  nome:'Escola Y',  media:39.4, var:-4.1, rankMove:-5, part:69, evo:[40.2,42.1,44.3,44.8,39.4], forte:'Química',         fraco:'Matemática'   },
  { key:'z',  nome:'Escola Z',  media:37.8, var:-5.3, rankMove:-4, part:68, evo:[38.4,39.8,41.2,43.4,37.8], forte:'Linguagens',      fraco:'Física'       },
  { key:'aa', nome:'Escola AA', media:35.9, var:+2.1, rankMove:+2, part:67, evo:[28.4,30.2,32.1,33.9,35.9], forte:'Língua Inglesa',  fraco:'Química'      },
  { key:'ab', nome:'Escola AB', media:33.2, var:-3.8, rankMove:-3, part:66, evo:[34.8,35.9,37.2,37.4,33.2], forte:'C. Humanas',      fraco:'Matemática'   },
];

/* Helper: buscar escola */
function getEscola(key) {
  return ESCOLAS.find(e => e.key === key) || ESCOLAS[0];
}

/* Helper: gerar dados de componente por escola (determinístico) */
const DISC_OFFSET = {
  'Matemática':    [+9, -7, +2, -3, +5, -1, +7, +3, +1, +4, +6, -5, +3, -2, +1, -4, +2, -6, +5, -1, +3, -4, +1, -3, +6, -2, +4, -7],
  'Física':        [-6, +9, -4, +2, -3, +7, -1, +5, +3, -7, -2, +6, -1, +4, -8, +3, -5, +2, +7, -3, +1, +9, -4, +2, -1, +5, -3, +1],
  'Química':       [+3, -3, +7, -1, +8, -2, +9, -4, +2, +5, -6, -1, +9, +1, +3, -7, +8, -2, -4, +6, -1, +2, +5, -3, +7, -8, +3, +6],
  'Língua Inglesa':[+7, +4, +9, -2, +3, +8, -3, +1, -5, +2, +6, +9, -4, +3, -2, +7, -1, +5, -3, +4, +8, -6, +9, +3, -4, +1, +8, -2],
  'Linguagens':    [+1, -5, -2, +9, +2, -4, +3, -6, +8, +1, -3, +4, -7, +9, +2, -1, +5, -3, -8, +6, -2, +3, -5, +7, -1, +9, -6, +4],
  'C. Humanas':    [-4, +2, -7, +3, -8, +1, +6, +9, -2, -1, +4, -3, +5, -6, +9, +2, -7, +8, +3, -5, +9, -8, +2, +6, +3, -9, +4, -1],
};

function getEscolaComponents(escolaKey) {
  const e = getEscola(escolaKey);
  const idx = ESCOLAS.findIndex(x => x.key === escolaKey);
  return DISCIPLINAS.map(disc => {
    const off = DISC_OFFSET[disc] ? DISC_OFFSET[disc][idx] || 0 : 0;
    const mediaEscola = Math.max(22, Math.min(86, Math.round((e.media + off) * 10) / 10));
    return {
      disc,
      mediaEscola,
      mediaRede: REDE_DISC[disc],
      diff: parseFloat((mediaEscola - REDE_DISC[disc]).toFixed(1)),
      status: (mediaEscola - REDE_DISC[disc]) > 3 ? 'above' : (mediaEscola - REDE_DISC[disc]) < -3 ? 'att' : 'avg',
    };
  });
}

/* Helper: ranking por tipo (determinístico por escola + disciplina) */
const RANK_DISC_OFFSET = {
  geral:          0,
  matematica:    [+5,-3,+2,-4,+6,-1,+3,-2,+4,-5,+1,-3,+2,-1,+4,-2,+3,-4,+2,-1,+3,-5,+2,-3,+4,-1,+2,-4],
  fisica:        [-8,+4,-2,+3,-1,+6,-4,+2,-3,+5,-1,-4,+3,-5,+2,-3,+4,-6,+3,-2,+4,-7,+2,-4,+5,-3,+1,-5],
  quimica:       [+2,-2,+6,-1,+4,-3,+7,-4,+2,-3,+5,-1,+8,-3,+2,-5,+6,-2,+4,-1,+3,-4,+1,-2,+5,-6,+3,+5],
  ingles:        [+4,+3,+7,-3,+2,+6,-2,+1,-4,+3,+5,+8,-3,+2,-1,+5,-2,+4,-3,+3,+6,-5,+7,+2,-3,+1,+6,-2],
  presenca:      [-2,-1,-3,+1,+2,-2,-1,+1,-1,-2,+1,+0,-1,-2,+0,-1,-1,-2,+1,-1,+0,-2,+0,-1,-1,-2,+1,-1],
};

function getRankData(tipo, simId) {
  const offsets = tipo === 'geral' ? new Array(28).fill(0) : (RANK_DISC_OFFSET[tipo] || new Array(28).fill(0));
  return ESCOLAS.map((e, i) => {
    const media = tipo === 'presenca' ? e.part : Math.max(20, Math.min(88, parseFloat((e.media + offsets[i]).toFixed(1))));
    const status = media >= 58 ? 'above' : media >= 48 ? 'avg' : media >= 40 ? 'att' : 'crit';
    return { ...e, mediaRank: media, status, pos: i + 1 };
  }).sort((a, b) => b.mediaRank - a.mediaRank).map((e, i) => ({ ...e, pos: i + 1 }));
}

/* ── ALUNOS ────────────────────────────────────────────────── */
const ALUNOS = {
  ana: {
    av: 'AC', nome: 'Ana Clara Mendes', escola: 'Escola A', turma: 'Turma 1', serie: '3ª EM',
    nota: '87,3%', pos: '1º / 24.532', pct: '99,9%ile', part: '100%',
    strong: ['Matemática — 94,2%', 'Língua Inglesa — 91,1%', 'Física — 88,7%'],
    weak:   ['C. Humanas — 72,1%', 'Redação — 75,0%'],
    insight: 'Ana Clara apresenta desempenho excepcional e consistente em todas as áreas. <strong>Risco baixo</strong> de regressão. Oportunidade: aprofundar conteúdos de nível avançado. Recomendação: trilha de aceleração em Física e Matemática.',
    evo: [78.2, 80.5, 83.1, 85.4, 87.3],
    areas: { 'Matemática': 94.2, 'Física': 88.7, 'Química': 82.1, 'Língua Inglesa': 91.1, 'C. Humanas': 72.1 },
  },
  lucas: {
    av: 'LF', nome: 'Lucas Ferreira', escola: 'Escola A', turma: 'Turma 1', serie: '3ª EM',
    nota: '84,1%', pos: '2º / 24.532', pct: '99,8%ile', part: '100%',
    strong: ['Física — 91,3%', 'Química — 88,4%'],
    weak:   ['Língua Inglesa — 70,2%', 'C. Humanas — 68,5%'],
    insight: 'Lucas demonstra excelência em Ciências da Natureza, mas indica lacunas em Linguagens. <strong>Risco médio</strong>. Recomendação: reforço em Inglês e produção textual.',
    evo: [74.1, 76.8, 79.2, 81.7, 84.1],
    areas: { 'Matemática': 86.2, 'Física': 91.3, 'Química': 88.4, 'Língua Inglesa': 70.2, 'C. Humanas': 68.5 },
  },
  mariana: {
    av: 'MS', nome: 'Mariana Santos', escola: 'Escola B', turma: 'Turma 2', serie: '3ª EM',
    nota: '82,8%', pos: '3º / 24.532', pct: '99,7%ile', part: '97%',
    strong: ['Língua Inglesa — 95,1%', 'Linguagens — 88,9%'],
    weak:   ['Física — 65,3%', 'Química — 67,1%'],
    insight: 'Mariana tem excelência em Linguagens mas lacuna importante em Ciências. <strong>Risco médio-alto</strong> em Física. Recomendação: apoio focado em Física e Química.',
    evo: [71.0, 74.3, 77.8, 80.5, 82.8],
    areas: { 'Matemática': 82.1, 'Física': 65.3, 'Química': 67.1, 'Língua Inglesa': 95.1, 'C. Humanas': 84.2 },
  },
  pedro: {
    av: 'PO', nome: 'Pedro Oliveira', escola: 'Escola A', turma: 'Turma 2', serie: '3ª EM',
    nota: '81,2%', pos: '4º / 24.532', pct: '99,5%ile', part: '100%',
    strong: ['Matemática — 92,1%', 'Física — 86,4%'],
    weak:   ['Redação — 65,0%', 'Linguagens — 71,2%'],
    insight: 'Pedro tem forte base em exatas. <strong>Risco baixo</strong>. Lacuna em Redação pode comprometer pontuação total no ENEM. Recomendação: reforço intensivo em produção textual.',
    evo: [70.2, 73.8, 76.1, 79.0, 81.2],
    areas: { 'Matemática': 92.1, 'Física': 86.4, 'Química': 79.2, 'Língua Inglesa': 75.8, 'C. Humanas': 73.4 },
  },
  julia: {
    av: 'JC', nome: 'Julia Costa', escola: 'Escola C', turma: 'Turma 1', serie: '3ª EM',
    nota: '74,8%', pos: '8º / 24.532', pct: '99,2%ile', part: '94%',
    strong: ['C. Humanas — 84,3%', 'Linguagens — 81,7%'],
    weak:   ['Física — 58,2%', 'Matemática — 63,4%'],
    insight: 'Julia tem desempenho sólido em Humanas e Linguagens. <strong>Risco moderado</strong> em exatas. Recomendação: reforço em Física e Matemática para equilíbrio de pontuação.',
    evo: [61.2, 64.8, 68.3, 71.9, 74.8],
    areas: { 'Matemática': 63.4, 'Física': 58.2, 'Química': 67.1, 'Língua Inglesa': 78.4, 'C. Humanas': 84.3 },
  },
};

/* ── PROFESSORES ───────────────────────────────────────────── */
/* questoes: índices das questões de QUESTOES[] pertencentes ao professor */
const PROFESSORES = {
  silva: {
    nome: 'Prof. Carlos Silva', disc: 'Física',
    nqs: 11, iq: 7.4, acerto: 51.2, disc_medio: 0.32, alunos: 4820,
    questoes: [0,1,2,3,4,5,6,7,8,9,10],
    evo_iq:    [5.8, 6.2, 6.8, 7.1, 7.4],
    evo_acerto:[44.2, 46.8, 48.1, 50.4, 51.2],
    sintese: 'O Prof. Carlos Silva demonstra consistência na elaboração de questões de nível médio-alto. Pontos fortes: questões com bom discriminante e coerência curricular. Atenção: 2 questões com acerto > 85% têm baixo valor diagnóstico. Oportunidade: incluir questões com maior concentração de distratores para ampliar o poder discriminativo.',
  },
  santos: {
    nome: 'Profa. Ana Santos', disc: 'Matemática',
    nqs: 10, iq: 8.1, acerto: 63.4, disc_medio: 0.41, alunos: 5120,
    questoes: [18,19,20,21,22,23,24,25,26,27],
    evo_iq:    [7.1, 7.4, 7.7, 7.9, 8.1],
    evo_acerto:[56.2, 58.4, 60.1, 61.8, 63.4],
    sintese: 'A Profa. Ana Santos apresenta o melhor índice de qualidade da rede. Suas questões têm alto discriminante e são bem calibradas em dificuldade. Recomendação: manter a abordagem e compartilhar metodologia com os demais professores.',
  },
  oliveira: {
    nome: 'Prof. Ricardo Oliveira', disc: 'Química',
    nqs: 9, iq: 6.2, acerto: 48.3, disc_medio: 0.28, alunos: 3890,
    questoes: [11,12,13,14,15,16,17,18,19],
    evo_iq:    [6.8, 6.6, 6.4, 6.3, 6.2],
    evo_acerto:[51.4, 50.8, 49.7, 49.1, 48.3],
    sintese: 'O Prof. Ricardo Oliveira apresenta questões de dificuldade adequada, mas com discriminante abaixo do esperado. Atenção: 3 questões têm distratores pouco atrativos que reduzem o poder diagnóstico. Recomendação: revisão dos distratores e calibração da dificuldade.',
  },
  lima: {
    nome: 'Profa. Beatriz Lima', disc: 'Língua Inglesa',
    nqs: 11, iq: 7.8, acerto: 61.2, disc_medio: 0.35, alunos: 4310,
    questoes: [26,27,28,29,30,31,32,33,34,35,36],
    evo_iq:    [7.0, 7.2, 7.5, 7.7, 7.8],
    evo_acerto:[55.3, 57.1, 58.8, 60.2, 61.2],
    sintese: 'A Profa. Beatriz Lima demonstra boa calibração entre dificuldade e acerto. Suas questões de interpretação têm excelente performance. Ponto de atenção: questões de gramática apresentam acerto muito alto — considerar calibração para ampliar poder diagnóstico.',
  },
};

function getProfessor(key) {
  return PROFESSORES[key] || PROFESSORES.silva;
}

/* ── ETIQUETAS PARA SIMULADO NAS OPÇÕES ───────────────────── */
const SIM_LABELS = SIMULADOS.map(s => s.label);
const SIM_LABELS_CURTOS = SIMULADOS.map(s => s.labelCurto);

/* ── PER-SIMULADO QUESTION FACTORY ────────────────────────── */
/*
  Perfis pedagógicos distintos por simulado (nunca uma simples escala global):
  sim1 → fragilidade principal em Matemática (Álgebra, Geometria, Funções)
  sim2 → fragilidade principal em Física (Mecânica, Cinemática)
  sim3 → fragilidade principal em Química (Orgânica, Termoquímica, Estequiometria)
  sim4 → fragilidade principal em Linguagens (Literatura, Gramática)
  sim5 → prova equilibrada; Eletromagnetismo ainda crítico em Física
*/

/* Per-questão offset de variação determinística */
const _SIM_Q_OFFSETS = [2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1];

/* Fator de acerto por disciplina por simulado — cria identidade pedagógica distinta */
const _SIM_DISC_FACTORS = {
  sim1: { 'Física':0.88, 'Química':0.84, 'Matemática':0.66, 'Língua Inglesa':0.91, 'Linguagens':0.86, 'C. Humanas':0.84 },
  sim2: { 'Física':0.62, 'Química':0.88, 'Matemática':0.86, 'Língua Inglesa':0.90, 'Linguagens':0.87, 'C. Humanas':0.85 },
  sim3: { 'Física':0.86, 'Química':0.64, 'Matemática':0.87, 'Língua Inglesa':0.91, 'Linguagens':0.87, 'C. Humanas':0.87 },
  sim4: { 'Física':0.88, 'Química':0.87, 'Matemática':0.86, 'Língua Inglesa':0.76, 'Linguagens':0.60, 'C. Humanas':0.88 },
  sim5: { 'Física':0.87, 'Química':0.94, 'Matemática':0.94, 'Língua Inglesa':0.96, 'Linguagens':0.94, 'C. Humanas':0.93 },
};

/* Gabarito rotation per simulado — deterministic, no Math.random */
const _GAB_LETTERS = ['A','B','C','D','E'];
const _GAB_SHIFT_PATTERNS = {
  sim1: [1,0,2,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1],
  sim2: [0,1,0,2,0,1,0,2,1,0,2,1,0,1,0,2,1,0,2,1,0,1,2,0,1,0,2,1,0,2,1,0,1,0,2,1,0,1,0,2,1,0,1,0,2,1,0,2],
  sim3: [2,0,1,0,0,1,2,0,2,1,0,2,0,1,2,0,1,0,1,2,0,1,0,2,1,0,1,2,0,1,2,0,1,2,0,1,2,0,1,0,2,1,0,2,1,0,1,0],
  sim4: [0,0,1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0],
  sim5: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
};

/* Temas pedagógicos por simulado — 48 entradas por prova, determinístico */
const SIM_TOPIC_SETS = {
  /* ── SIM 1 — Predominância de Matemática ── */
  sim1: [
    /* idx 0–19 Matemática */
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Princípio Multiplicativo',              habilidade:'Resolver problemas de contagem por produto entre opções', diff:'Médio' },
    { disc:'Matemática',    comp:'Probabilidade',       assunto:'Eventos Independentes',                 habilidade:'Calcular probabilidade de dois eventos independentes', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Afim — Taxa de Variação',        habilidade:'Interpretar taxa de variação em funções do 1º grau', diff:'Fácil' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Polígonos Regulares e Áreas',           habilidade:'Calcular áreas de figuras compostas por polígonos', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Equações do 2º Grau',                   habilidade:'Aplicar fórmula de Bhaskara em contextos reais', diff:'Alto' },
    { disc:'Matemática',    comp:'Estatística',         assunto:'Medidas de Dispersão',                  habilidade:'Interpretar desvio padrão e variância de conjuntos', diff:'Médio' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'Progressão Geométrica — Razão e Soma',  habilidade:'Calcular termos e soma finita de uma PG', diff:'Fácil' },
    { disc:'Matemática',    comp:'Geometria Esp.',      assunto:'Prismas e Pirâmides',                   habilidade:'Calcular volume de prismas e pirâmides geométricas', diff:'Alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Logarítmica',                    habilidade:'Resolver equações logarítmicas em contextos aplicados', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Permutações com Repetição',             habilidade:'Contar agrupamentos ordenados com elementos repetidos', diff:'Alto' },
    { disc:'Matemática',    comp:'Trigonometria',       assunto:'Lei dos Senos e Cossenos',              habilidade:'Resolver triângulos oblíquos pela lei dos senos', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Probabilidade',       assunto:'Probabilidade Condicional',             habilidade:'Calcular probabilidade em situações com eventos dependentes', diff:'Alto' },
    { disc:'Matemática',    comp:'Geometria Analítica', assunto:'Retas no Plano Cartesiano',             habilidade:'Calcular distâncias e posições relativas de retas', diff:'Médio' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Quadrática — Vértice e Zeros',   habilidade:'Identificar máximos, mínimos e raízes de parábolas', diff:'Médio' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Sistemas Lineares — Substituição',      habilidade:'Resolver sistemas pelo método da substituição ou adição', diff:'Médio' },
    { disc:'Matemática',    comp:'Estatística',         assunto:'Médias Ponderadas e Aritméticas',       habilidade:'Calcular e interpretar médias em situações práticas', diff:'Fácil' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'Interpolação Aritmética',               habilidade:'Inserir meios aritméticos entre termos de uma progressão', diff:'Médio' },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Análise Combinatória — Princípio da Adição', habilidade:'Aplicar o princípio da adição em contagens exclusivas', diff:'Médio' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Exponencial — Modelagem',        habilidade:'Modelar crescimento e decaimento exponencial em contextos reais', diff:'Médio' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Trigonometria no Triângulo Retângulo',  habilidade:'Aplicar razões trigonométricas em triângulos retângulos', diff:'Médio-alto' },
    /* idx 20–25 Física */
    { disc:'Física',        comp:'Mecânica',            assunto:'Leis de Newton e Forças',               habilidade:'Aplicar as três leis de Newton em situações práticas', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Trabalho e Energia Mecânica',           habilidade:'Relacionar trabalho realizado e variação de energia cinética', diff:'Médio' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Gases Ideais — Equação de Estado',      habilidade:'Aplicar a lei dos gases ideais em situações reais', diff:'Médio' },
    { disc:'Física',        comp:'Óptica',              assunto:'Reflexão e Refração da Luz',            habilidade:'Aplicar as leis de Snell-Descartes em meios distintos', diff:'Fácil' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Cinemática — MRU e MRUV',               habilidade:'Interpretar gráficos de posição e velocidade', diff:'Médio' },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Ondas Mecânicas — Propriedades',        habilidade:'Analisar comprimento de onda, frequência e velocidade', diff:'Médio-alto' },
    /* idx 26–29 Química */
    { disc:'Química',       comp:'Estequiometria',      assunto:'Cálculo Estequiométrico',               habilidade:'Relacionar moles e proporções em equações balanceadas', diff:'Médio' },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia de Reação',                    habilidade:'Interpretar variações de entalpia em diagramas energéticos', diff:'Alto' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Funções Orgânicas — Classificação',     habilidade:'Classificar compostos orgânicos por grupos funcionais', diff:'Médio' },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Fatores de Velocidade de Reação',       habilidade:'Relacionar temperatura, concentração e velocidade de reação', diff:'Médio-alto' },
    /* idx 30–35 Língua Inglesa */
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Main Idea and Purpose',                 habilidade:'Identificar propósito comunicativo em textos em inglês', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Inference and Implication',             habilidade:'Inferir informação implícita em textos variados', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Contextual Meaning',                    habilidade:'Interpretar vocabulário pelo contexto da leitura', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Modal Verbs and Conditionals',          habilidade:'Empregar modais em situações comunicativas reais', diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Text Organization',                     habilidade:'Identificar estrutura e progressão do texto', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Synonyms and Antonyms',                 habilidade:'Reconhecer relações lexicais entre palavras em inglês', diff:'Fácil' },
    /* idx 36–42 Linguagens */
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Texto Argumentativo',                   habilidade:'Identificar tese e estratégias de argumentação', diff:'Médio' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Romantismo Brasileiro',                  habilidade:'Relacionar obra literária e contexto histórico', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Coerência e Coesão Textual',            habilidade:'Identificar mecanismos de coesão referencial', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Charge e Linguagem Visual',             habilidade:'Interpretar a linguagem não-verbal e a ironia', diff:'Fácil' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Modernismo — 2ª Geração',               habilidade:'Reconhecer características do modernismo brasileiro', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Morfossintaxe e Análise Sintática',     habilidade:'Analisar função sintática de termos na oração', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Publicidade e Persuasão',               habilidade:'Reconhecer intenções comunicativas em anúncios', diff:'Fácil' },
    /* idx 43–47 C. Humanas */
    { disc:'C. Humanas',    comp:'História',            assunto:'Revolução Industrial',                  habilidade:'Relacionar industrialização e transformações sociais', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Geopolítica e Conflitos Regionais',     habilidade:'Analisar disputas territoriais e conflitos contemporâneos', diff:'Alto' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Contratualismo e Estado',               habilidade:'Comparar as teorias do contrato social', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Estratificação Social e Mobilidade',    habilidade:'Identificar fatores determinantes da mobilidade social', diff:'Médio' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Revoluções do Séc. XIX',                habilidade:'Relacionar revoluções oitocentistas e ideais liberais', diff:'Médio' },
  ],

  /* ── SIM 2 — Predominância de Física ── */
  sim2: [
    /* idx 0–17 Física */
    { disc:'Física',        comp:'Mecânica',            assunto:'Leis de Newton — Dinâmica',             habilidade:'Aplicar as três leis de Newton a sistemas físicos reais', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Trabalho e Energia Cinética',           habilidade:'Relacionar trabalho de forças com variação de energia', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Cinemática — MRUV e Gráficos',          habilidade:'Interpretar gráficos de posição, velocidade e aceleração', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Dinâmica — Plano Inclinado',            habilidade:'Decompor forças sobre planos inclinados com atrito', diff:'Médio-alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Impulso e Quantidade de Movimento',     habilidade:'Aplicar conservação do momento linear em colisões', diff:'Alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Movimento Circular Uniforme',           habilidade:'Calcular aceleração e força centrípeta em trajetórias circulares', diff:'Médio-alto' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Calorimetria e Equilíbrio Térmico',     habilidade:'Calcular trocas de calor entre corpos até equilíbrio', diff:'Médio' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Gases Ideais — Transformações',         habilidade:'Aplicar as leis de Boyle, Charles e Gay-Lussac', diff:'Médio' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'1ª Lei da Termodinâmica',               habilidade:'Relacionar calor, trabalho e variação de energia interna', diff:'Alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Circuitos Elétricos em Série',          habilidade:'Calcular corrente e tensão em circuitos resistivos simples', diff:'Médio-alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Campo Magnético e Força de Lorentz',    habilidade:'Calcular força sobre cargas e fios condutores em campo', diff:'Alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Lei de Faraday — Indução Magnética',    habilidade:'Analisar fluxo magnético variável e fem induzida', diff:'Alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Eletrostática — Lei de Coulomb',        habilidade:'Calcular força e campo elétrico entre cargas puntiformes', diff:'Médio-alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Lei de Ohm e Resistência Elétrica',     habilidade:'Relacionar tensão, corrente e resistência em condutores', diff:'Médio' },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Efeito Doppler',                        habilidade:'Interpretar variação de frequência por movimento relativo', diff:'Alto' },
    { disc:'Física',        comp:'Óptica',              assunto:'Lentes e Espelhos — Formação de Imagens', habilidade:'Determinar posição e tamanho de imagens por lentes', diff:'Médio' },
    { disc:'Física',        comp:'Física Moderna',      assunto:'Efeito Fotoelétrico',                   habilidade:'Relacionar energia do fóton ao limiar fotoelétrico', diff:'Alto' },
    { disc:'Física',        comp:'Hidrostática',        assunto:'Empuxo e Princípio de Arquimedes',      habilidade:'Aplicar o princípio de Arquimedes à flutuação de corpos', diff:'Médio' },
    /* idx 18–21 Química */
    { disc:'Química',       comp:'Estequiometria',      assunto:'Cálculo Estequiométrico',               habilidade:'Calcular proporções em equações químicas balanceadas', diff:'Médio' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Isomeria Orgânica — Plana e Espacial',  habilidade:'Identificar tipos de isomeria em compostos carbonados', diff:'Alto' },
    { disc:'Química',       comp:'Soluções',            assunto:'Concentração Molar e Diluição',         habilidade:'Calcular concentração molar antes e após diluição', diff:'Fácil' },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia — Lei de Hess',                habilidade:'Calcular entalpia de reações usando ciclos de Hess', diff:'Alto' },
    /* idx 22–29 Matemática */
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Quadrática — Parábola',          habilidade:'Identificar zeros, vértice e concavidade de parábolas', diff:'Médio' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Trigonometria — Lei dos Cossenos',      habilidade:'Resolver triângulos oblíquos pela lei dos cossenos', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Estatística',         assunto:'Probabilidade — Espaço Amostral',       habilidade:'Calcular probabilidade em experimentos equiprováveis', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Geometria Esp.',      assunto:'Volumes de Sólidos — Cone e Esfera',    habilidade:'Calcular volume de cones, pirâmides e esferas', diff:'Alto' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'PA e PG — Soma de Termos',              habilidade:'Calcular soma dos n primeiros termos de PA e PG', diff:'Fácil' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Sistemas de Equações Lineares',         habilidade:'Resolver sistemas pelo método da eliminação', diff:'Médio' },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Permutações e Arranjos Simples',        habilidade:'Calcular arranjos e permutações sem repetição', diff:'Alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Exponencial — Crescimento',      habilidade:'Modelar situações de crescimento e decaimento exponencial', diff:'Médio' },
    /* idx 30–35 Língua Inglesa */
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Main Idea and Purpose',                 habilidade:'Identificar propósito comunicativo em textos em inglês', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Inference and Implication',             habilidade:'Inferir informação não explicitada no texto', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Contextual Meaning',                    habilidade:'Interpretar vocabulário em contexto de leitura', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Modal Verbs and Conditionals',          habilidade:'Usar modais para expressar possibilidade e obrigação', diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Text Organization',                     habilidade:'Identificar estrutura e progressão de textos', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Synonyms and Antonyms',                 habilidade:'Reconhecer equivalências e antonímias lexicais', diff:'Fácil' },
    /* idx 36–42 Linguagens */
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Gêneros Textuais e Discursivos',        habilidade:'Identificar características e função de gêneros textuais', diff:'Médio' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Pré-Modernismo Brasileiro',             habilidade:'Interpretar textos do período pré-modernista', diff:'Médio' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Concordância Verbal e Nominal',         habilidade:'Aplicar regras de concordância em frases complexas', diff:'Médio-alto' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Intertextualidade e Paródia',           habilidade:'Identificar relações intertextuais em textos variados', diff:'Alto' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Realismo e Naturalismo',                habilidade:'Reconhecer características do Realismo na literatura brasileira', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Pontuação e Produção de Sentido',       habilidade:'Interpretar o efeito da pontuação na coesão textual', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Funções da Linguagem',                  habilidade:'Identificar a função dominante em textos de diferentes gêneros', diff:'Médio' },
    /* idx 43–47 C. Humanas */
    { disc:'C. Humanas',    comp:'História',            assunto:'Imperialismo e Colonialismo Europeu',   habilidade:'Analisar expansão colonial e exploração de recursos', diff:'Alto' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Globalização e Desigualdade',           habilidade:'Relacionar globalização e concentração de renda', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Iluminismo e Razão Moderna',            habilidade:'Identificar princípios iluministas e seus desdobramentos', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Trabalho e Alienação',                  habilidade:'Interpretar conceitos de alienação e divisão do trabalho', diff:'Médio' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Revoluções Burguesas',                  habilidade:'Relacionar revoluções burguesas e ascensão do capitalismo', diff:'Médio' },
  ],

  /* ── SIM 3 — Predominância de Química ── */
  sim3: [
    /* idx 0–5 Física */
    { disc:'Física',        comp:'Mecânica',            assunto:'Leis de Newton — Aplicações',           habilidade:'Aplicar princípios da dinâmica em sistemas reais', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Trabalho e Energia — Potência',         habilidade:'Relacionar potência, trabalho e intervalo de tempo', diff:'Médio' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Calorimetria — Calor Específico',       habilidade:'Calcular variação de temperatura em trocas de calor', diff:'Médio' },
    { disc:'Física',        comp:'Óptica',              assunto:'Reflexão e Refração da Luz',            habilidade:'Aplicar leis da reflexão e refração em meios diferentes', diff:'Fácil' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Hidrostática — Pressão e Empuxo',       habilidade:'Aplicar o princípio de Arquimedes em situações práticas', diff:'Médio' },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Propriedades das Ondas',                habilidade:'Calcular comprimento de onda, frequência e velocidade', diff:'Médio-alto' },
    /* idx 6–23 Química */
    { disc:'Química',       comp:'Estequiometria',      assunto:'Cálculo Estequiométrico — Moles',       habilidade:'Calcular quantidade de moles e proporções reacionais', diff:'Médio' },
    { disc:'Química',       comp:'Estequiometria',      assunto:'Reagente Limitante e Rendimento',       habilidade:'Identificar reagente limitante e calcular rendimento', diff:'Médio-alto' },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia de Reação — Diagrama',         habilidade:'Interpretar variação de entalpia em diagramas energéticos', diff:'Alto' },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Lei de Hess — Ciclos',                  habilidade:'Calcular entalpia de reações usando ciclos de Hess', diff:'Alto' },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Pilhas — Potencial Padrão',             habilidade:'Calcular ddp e identificar polo positivo e negativo', diff:'Médio' },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Eletrólise — Cálculos com Faraday',     habilidade:'Calcular massa depositada por eletrólise', diff:'Médio-alto' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Isomeria Orgânica — Tipos',             habilidade:'Identificar isomeria plana e espacial em compostos', diff:'Alto' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Funções Orgânicas — Nomenclatura',      habilidade:'Reconhecer grupos funcionais e nomear compostos', diff:'Médio' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Reações Orgânicas — Adição e Substituição', habilidade:'Prever produtos em reações de adição e substituição', diff:'Médio-alto' },
    { disc:'Química',       comp:'Gases',               assunto:'Transformações Gasosas — Leis',         habilidade:'Aplicar as leis de Boyle, Charles e Gay-Lussac', diff:'Médio' },
    { disc:'Química',       comp:'Gases',               assunto:'Equação de Clapeyron — PV = nRT',       habilidade:'Calcular grandezas usando a equação dos gases ideais', diff:'Médio' },
    { disc:'Química',       comp:'Soluções',            assunto:'Concentração Molar e Diluição',         habilidade:'Calcular concentração molar antes e após diluição', diff:'Fácil' },
    { disc:'Química',       comp:'Soluções',            assunto:'Propriedades Coligativas',              habilidade:'Calcular crioscopia e ebulioscopia em soluções', diff:'Médio' },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Velocidade de Reação — Fatores',        habilidade:'Relacionar temperatura, concentração e catálise à velocidade', diff:'Médio-alto' },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Catálise — Mecanismo e Energia',        habilidade:'Interpretar o papel do catalisador na energia de ativação', diff:'Médio' },
    { disc:'Química',       comp:'Equilíbrio Químico',  assunto:'Constante de Equilíbrio — Kc e Kp',    habilidade:'Calcular Kc e prever sentido de deslocamento do equilíbrio', diff:'Alto' },
    { disc:'Química',       comp:'Equilíbrio Químico',  assunto:'Princípio de Le Chatelier',             habilidade:'Analisar perturbações e deslocamento de equilíbrio', diff:'Médio-alto' },
    { disc:'Química',       comp:'Ácidos e Bases',      assunto:'pH, pOH e Força de Ácidos',             habilidade:'Calcular pH de soluções ácidas e básicas', diff:'Médio' },
    /* idx 24–29 Matemática */
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Quadrática — Raízes e Vértice',  habilidade:'Identificar zeros e vértice de parábolas em contextos', diff:'Médio' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Trigonometria — Triângulo Retângulo',   habilidade:'Aplicar razões trigonométricas em triângulos retângulos', diff:'Médio' },
    { disc:'Matemática',    comp:'Estatística',         assunto:'Probabilidade — Regra da Adição',       habilidade:'Calcular probabilidade da união de eventos mutuamente exclusivos', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'PA — Soma dos n Primeiros Termos',      habilidade:'Calcular soma dos termos de uma progressão aritmética', diff:'Fácil' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Sistemas Lineares — 2 Variáveis',       habilidade:'Resolver sistemas de duas equações lineares', diff:'Médio' },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Arranjos e Combinações Simples',        habilidade:'Diferenciar e calcular arranjos e combinações', diff:'Alto' },
    /* idx 30–35 Língua Inglesa */
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Main Idea and Purpose',                 habilidade:'Identificar ideia central e propósito comunicativo do texto', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Inference and Implication',             habilidade:'Inferir dados implícitos em textos variados', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Contextual Meaning',                    habilidade:'Interpretar significado de palavras pelo contexto', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Verb Tenses and Aspects',               habilidade:'Distinguir usos de tempos verbais no inglês', diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Reading for Detail',                    habilidade:'Localizar informações específicas em textos longos', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Idiomatic Expressions',                 habilidade:'Interpretar expressões idiomáticas em contexto', diff:'Médio' },
    /* idx 36–42 Linguagens */
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Texto Expositivo e Argumentativo',      habilidade:'Distinguir narração, exposição e argumentação em textos', diff:'Médio' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Barroco e Quinhentismo Brasileiro',     habilidade:'Reconhecer características formais do Barroco na literatura', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Coerência Textual — Progressão Temática', habilidade:'Identificar mecanismos de progressão temática em textos', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Humor e Ironia em Textos',              habilidade:'Interpretar o humor e a ironia em diferentes gêneros textuais', diff:'Fácil' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Naturalismo — Características',         habilidade:'Identificar marcas do Naturalismo na literatura brasileira', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Regência Verbal e Nominal',             habilidade:'Aplicar regras de regência em frases reais', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Intertextualidade e Referência',        habilidade:'Reconhecer relações intertextuais entre textos diferentes', diff:'Médio' },
    /* idx 43–47 C. Humanas */
    { disc:'C. Humanas',    comp:'História',            assunto:'Segunda Guerra Mundial',                habilidade:'Interpretar causas e consequências da Segunda Guerra Mundial', diff:'Médio-alto' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Biomas e Impactos Ambientais',          habilidade:'Analisar impactos ambientais de ações humanas nos biomas', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Ética — Correntes Filosóficas',         habilidade:'Comparar abordagens éticas clássicas e contemporâneas', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Cultura e Identidade Coletiva',         habilidade:'Reconhecer diversidade cultural e identitária na sociedade', diff:'Fácil' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Guerra Fria e Bipolaridade',            habilidade:'Analisar o contexto de tensão entre EUA e URSS', diff:'Alto' },
  ],

  /* ── SIM 4 — Predominância de Linguagens / Língua Inglesa ── */
  sim4: [
    /* idx 0–4 Física */
    { disc:'Física',        comp:'Mecânica',            assunto:'Leis de Newton — Sistemas',             habilidade:'Aplicar as leis de Newton em sistemas com múltiplas forças', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Energia Cinética e Potencial',          habilidade:'Relacionar conservação de energia em sistemas mecânicos', diff:'Médio' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Dilatação Térmica',                     habilidade:'Calcular dilatação linear e volumétrica de sólidos', diff:'Fácil' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Circuitos Elétricos — Resistência',     habilidade:'Calcular resistência equivalente em circuitos mistos', diff:'Médio-alto' },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Ondas Sonoras — Velocidade e Freq.',    habilidade:'Calcular velocidade e comprimento de ondas sonoras', diff:'Médio' },
    /* idx 5–9 Matemática */
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Afim — Modelagem Linear',        habilidade:'Modelar situações práticas com funções do 1º grau', diff:'Fácil' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Áreas de Figuras Planas',               habilidade:'Calcular área de triângulos, retângulos e círculos', diff:'Médio' },
    { disc:'Matemática',    comp:'Estatística',         assunto:'Leitura de Gráficos e Tabelas',         habilidade:'Interpretar dados em gráficos de barras e histogramas', diff:'Médio' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'Progressão Aritmética — Termos',        habilidade:'Calcular termos e soma de progressões aritméticas', diff:'Fácil' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Equações Lineares — Contextos Reais',   habilidade:'Resolver equações lineares em situações práticas', diff:'Médio' },
    /* idx 10–13 Química */
    { disc:'Química',       comp:'Estequiometria',      assunto:'Cálculo Estequiométrico',               habilidade:'Calcular proporções em reações químicas balanceadas', diff:'Médio' },
    { disc:'Química',       comp:'Soluções',            assunto:'Concentração e Diluição de Soluções',   habilidade:'Calcular concentração molar após diluição', diff:'Fácil' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Funções Orgânicas — Grupos Funcionais', habilidade:'Identificar grupos funcionais em fórmulas estruturais', diff:'Médio' },
    { disc:'Química',       comp:'Gases',               assunto:'Leis dos Gases — Transformações',       habilidade:'Aplicar as leis dos gases em transformações gasosas', diff:'Médio' },
    /* idx 14–25 Língua Inglesa */
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Main Idea and Purpose',                 habilidade:'Identificar o propósito comunicativo de um texto', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Inference and Implication',             habilidade:'Inferir informação implícita em textos em inglês', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Contextual Meaning',                    habilidade:'Determinar o significado de palavras pelo contexto textual', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Modal Verbs and Conditionals',          habilidade:'Usar modais para expressar diferentes matizes de sentido', diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Text Organization',                     habilidade:'Reconhecer a organização estrutural de um texto', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Synonyms and Antonyms',                 habilidade:'Reconhecer relações de sinonímia e antonímia em inglês', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Text Analysis',       assunto:'Communicative Purpose',                 habilidade:'Reconhecer função comunicativa de gêneros textuais variados', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Reading for Detail',                    habilidade:'Localizar informações específicas em textos extensos', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Cohesion and Reference',                habilidade:'Identificar elementos de referência e coesão textual', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Idiomatic Expressions',                 habilidade:'Compreender expressões idiomáticas em contextos reais', diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Text Analysis',       assunto:'Implicit Information',                  habilidade:'Interpretar informação não explicitada em textos variados', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Verb Tenses and Time Frames',           habilidade:'Distinguir tempos verbais e seus valores aspectuais em inglês', diff:'Médio' },
    /* idx 26–38 Linguagens */
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Texto Argumentativo',                   habilidade:'Identificar tese, argumentos e contra-argumentos', diff:'Médio' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Romantismo Brasileiro',                 habilidade:'Relacionar obra literária e contexto histórico', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Coerência e Coesão Textual',            habilidade:'Identificar mecanismos de coesão referencial e sequencial', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Charge e Linguagem Visual',             habilidade:'Interpretar linguagem não-verbal e marcas de ironia', diff:'Fácil' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Modernismo — 2ª Geração',               habilidade:'Reconhecer características do modernismo brasileiro', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Morfossintaxe e Análise Sintática',     habilidade:'Analisar função sintática de termos na oração', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Publicidade e Persuasão',               habilidade:'Reconhecer intenções comunicativas em textos publicitários', diff:'Fácil' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Gêneros Textuais Digitais',             habilidade:'Reconhecer características de gêneros textuais digitais', diff:'Médio' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Pré-Modernismo Brasileiro',             habilidade:'Interpretar textos de Euclides da Cunha e Lima Barreto', diff:'Médio' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Concordância Verbal e Nominal',         habilidade:'Aplicar regras de concordância em frases complexas', diff:'Médio-alto' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Intertextualidade e Paródia',           habilidade:'Identificar referências e relações intertextuais', diff:'Alto' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Quinhentismo e Barroco',                habilidade:'Identificar marcas formais do Barroco na literatura portuguesa e brasileira', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Regência Verbal e Crase',               habilidade:'Aplicar as regras de regência verbal e uso correto da crase', diff:'Médio' },
    /* idx 39–47 C. Humanas */
    { disc:'C. Humanas',    comp:'História',            assunto:'Revolução Industrial',                  habilidade:'Relacionar industrialização e transformações sociais', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Urbanização e Metropolização',          habilidade:'Analisar processos de crescimento e expansão urbana', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Ética e Política',                      habilidade:'Distinguir conceitos de ética, moral e política', diff:'Fácil' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Democracia e Cidadania',                habilidade:'Relacionar participação política e estado democrático', diff:'Médio' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Colonização Americana e Resistência',   habilidade:'Analisar processos de colonização e resistência indígena', diff:'Médio-alto' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Geopolítica e Conflitos Contemporâneos', habilidade:'Analisar disputas territoriais e conflitos contemporâneos', diff:'Alto' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Iluminismo e Razão Moderna',            habilidade:'Identificar princípios iluministas e seus desdobramentos históricos', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Trabalho e Desigualdade Social',        habilidade:'Interpretar relações de trabalho e desigualdade social', diff:'Médio' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Revoluções do Séc. XX',                 habilidade:'Analisar causas e consequências das revoluções do século XX', diff:'Médio' },
  ],

  /* ── SIM 5 — Balanceado ── */
  sim5: [
    /* idx 0–10 Física */
    { disc:'Física',        comp:'Mecânica',            assunto:'Leis de Newton e Dinâmica',             habilidade:'Aplicar princípios de dinâmica em sistemas reais', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Trabalho e Energia Cinética',           habilidade:'Relacionar trabalho realizado e variação de energia cinética', diff:'Médio' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Gases Ideais — Equação de Clapeyron',   habilidade:'Aplicar a equação de estado dos gases ideais', diff:'Médio' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Circuitos Elétricos Mistos',            habilidade:'Calcular corrente e tensão em circuitos com resistores', diff:'Médio-alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Campo Magnético e Força de Lorentz',    habilidade:'Calcular força sobre cargas em campos magnéticos', diff:'Alto' },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Ondas Mecânicas — Período e Frequência', habilidade:'Analisar período, frequência e comprimento de onda', diff:'Médio' },
    { disc:'Física',        comp:'Óptica',              assunto:'Reflexão e Refração da Luz',            habilidade:'Aplicar a lei de Snell-Descartes em meios distintos', diff:'Fácil' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Cinemática — Gráficos e Equações',      habilidade:'Interpretar gráficos de posição e velocidade em função do tempo', diff:'Médio' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Dinâmica — Plano Inclinado com Atrito', habilidade:'Decompor forças em planos inclinados com atrito', diff:'Médio-alto' },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Indução Magnética — Lei de Faraday',    habilidade:'Analisar fluxo magnético variável e força eletromotriz induzida', diff:'Alto' },
    { disc:'Física',        comp:'Física Moderna',      assunto:'Efeito Fotoelétrico',                   habilidade:'Relacionar energia do fóton ao limiar fotoelétrico', diff:'Alto' },
    /* idx 11–17 Química */
    { disc:'Química',       comp:'Estequiometria',      assunto:'Cálculo Estequiométrico',               habilidade:'Relacionar moles e proporções em equações reacionais', diff:'Médio' },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia de Reação — Diagrama',         habilidade:'Interpretar variação de entalpia em reações exo e endotérmicas', diff:'Alto' },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Pilhas e Processos de Oxirredução',     habilidade:'Analisar reações em pilhas e calcular potencial padrão', diff:'Médio' },
    { disc:'Química',       comp:'Orgânica',            assunto:'Isomeria Orgânica — Plana e Espacial',  habilidade:'Identificar isomeria constitucional e estereoisomeria', diff:'Alto' },
    { disc:'Química',       comp:'Gases',               assunto:'Transformações Gasosas — Leis',         habilidade:'Aplicar as leis dos gases em problemas de transformação', diff:'Médio' },
    { disc:'Química',       comp:'Soluções',            assunto:'Concentração Molar e Diluição',         habilidade:'Calcular concentração molar antes e após diluição', diff:'Fácil' },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Fatores de Velocidade de Reação',       habilidade:'Relacionar fatores ambientais com a velocidade de reação', diff:'Médio-alto' },
    /* idx 18–25 Matemática */
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Quadrática — Parábola',          habilidade:'Identificar zeros, vértice e concavidade de parábolas', diff:'Médio' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Trigonometria — Lei dos Senos',         habilidade:'Resolver triângulos oblíquos usando a lei dos senos', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Estatística',         assunto:'Probabilidade — Espaço Amostral',       habilidade:'Calcular probabilidade em experimentos equiprováveis', diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Geometria Esp.',      assunto:'Volumes de Sólidos — Cone e Esfera',    habilidade:'Calcular volumes de sólidos de revolução', diff:'Alto' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'PA e PG — Identificação e Cálculo',     habilidade:'Identificar tipo e calcular termos e soma de progressões', diff:'Fácil' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Sistemas de Equações Lineares',         habilidade:'Resolver sistemas lineares de duas equações', diff:'Médio' },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Permutações e Combinações Simples',     habilidade:'Distinguir e calcular permutações e combinações', diff:'Alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Exponencial e Aplicações',       habilidade:'Modelar crescimento e decaimento exponencial', diff:'Médio' },
    /* idx 26–31 Língua Inglesa */
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Main Idea and Purpose',                 habilidade:'Identificar ideia central e propósito comunicativo do texto', diff:'Fácil' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Inference and Implication',             habilidade:'Inferir informação não explicitada em textos', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Contextual Meaning',                    habilidade:'Interpretar vocabulário pelo contexto de leitura', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Modal Verbs and Conditionals',          habilidade:'Empregar modais em situações comunicativas reais', diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Text Organization',                     habilidade:'Identificar estrutura e progressão de textos em inglês', diff:'Médio' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Synonyms and Antonyms',                 habilidade:'Reconhecer equivalências e antonímias lexicais', diff:'Fácil' },
    /* idx 32–38 Linguagens */
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Texto Argumentativo',                   habilidade:'Identificar estratégias de argumentação em textos', diff:'Médio' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Romantismo Brasileiro',                 habilidade:'Relacionar obra literária e contexto histórico-cultural', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Coerência e Coesão Textual',            habilidade:'Identificar mecanismos de coesão referencial', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Charge e Linguagem Visual',             habilidade:'Interpretar linguagem não-verbal e ironia gráfica', diff:'Fácil' },
    { disc:'Linguagens',    comp:'Literatura',          assunto:'Modernismo — 2ª Geração',               habilidade:'Reconhecer traços do modernismo em poemas e prosas', diff:'Alto' },
    { disc:'Linguagens',    comp:'Gramática',           assunto:'Morfossintaxe e Análise Sintática',     habilidade:'Analisar função sintática de termos na oração', diff:'Médio' },
    { disc:'Linguagens',    comp:'Interpretação',       assunto:'Publicidade e Persuasão',               habilidade:'Reconhecer intenções e recursos persuasivos em textos', diff:'Fácil' },
    /* idx 39–47 C. Humanas */
    { disc:'C. Humanas',    comp:'História',            assunto:'Revolução Industrial',                  habilidade:'Relacionar industrialização e transformações sociais e políticas', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Geopolítica e Conflitos Regionais',     habilidade:'Analisar disputas territoriais e conflitos contemporâneos', diff:'Alto' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Contratualismo — Hobbes, Locke e Rousseau', habilidade:'Comparar concepções filosóficas do contrato social', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Estratificação e Mobilidade Social',    habilidade:'Identificar tipos de mobilidade e fatores determinantes', diff:'Médio' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Colonização Americana e Resistência',   habilidade:'Analisar o processo de colonização e formas de resistência', diff:'Médio-alto' },
    { disc:'C. Humanas',    comp:'Geografia',           assunto:'Urbanização e Metropolização',          habilidade:'Analisar crescimento urbano e formação de metrópoles', diff:'Médio' },
    { disc:'C. Humanas',    comp:'História',            assunto:'Revoluções do Séc. XIX e Liberalismo',  habilidade:'Relacionar revoluções oitocentistas e ideais liberais', diff:'Médio' },
    { disc:'C. Humanas',    comp:'Filosofia',           assunto:'Ética, Moral e Fundamentos da Política', habilidade:'Distinguir ética, moral e princípios fundamentais da política', diff:'Fácil' },
    { disc:'C. Humanas',    comp:'Sociologia',          assunto:'Cultura, Identidade e Diversidade',     habilidade:'Reconhecer diversidade cultural e identitária na sociedade', diff:'Fácil' },
  ],
};

function getQuestoesForSim(simId) {
  const discFactors = _SIM_DISC_FACTORS[simId] || _SIM_DISC_FACTORS.sim5;
  const shifts      = _GAB_SHIFT_PATTERNS[simId] || _GAB_SHIFT_PATTERNS.sim5;
  const topicSet    = SIM_TOPIC_SETS[simId]      || SIM_TOPIC_SETS.sim5;
  return QUESTOES_RAW.map((q, i) => {
    const topic         = topicSet[i] || {};
    const f             = discFactors[topic.disc || q.disc] ?? 0.90;
    const off           = _SIM_Q_OFFSETS[i] * (1 - f) * 4;
    const acerto        = Math.min(95, Math.max(10, Math.round(q.acerto * f + off)));
    const discriminante = parseFloat(Math.min(0.60, Math.max(0.08, q.discriminante * (0.82 + f * 0.18))).toFixed(2));
    const distPct       = Math.min(45, Math.round(q.distPct * (1 + (1 - f) * 0.5)));
    const status        = acerto >= 65 ? 'above' : acerto >= 38 ? 'att' : 'crit';
    // Deterministic gabarito rotation per simulado
    const shift   = shifts[i] || 0;
    const gabIdx  = _GAB_LETTERS.indexOf(q.gab);
    const distIdx = _GAB_LETTERS.indexOf(q.dist);
    const gab     = _GAB_LETTERS[(gabIdx + shift) % 5];
    let   dist    = _GAB_LETTERS[(distIdx + shift) % 5];
    if (dist === gab) dist = _GAB_LETTERS[(distIdx + shift + 1) % 5];
    return { ...q, acerto, discriminante, distPct, status, gab, dist, ...topic };
  });
}

/* Calculates the most critical topic from a question set (dynamic, never hardcoded) */
function getCriticalTopicForSim(questions) {
  if (!questions || !questions.length) return { comp: '—', disciplina: '—', assunto: '—', totalCriticas: 0, mediaAcerto: 0 };
  const byComp = {};
  questions.forEach(q => {
    if (!byComp[q.comp]) byComp[q.comp] = { comp: q.comp, disc: q.disc, qs: [] };
    byComp[q.comp].qs.push(q);
  });
  const stats = Object.values(byComp).map(c => {
    const criticas    = c.qs.filter(q => q.status === 'crit').length;
    const att         = c.qs.filter(q => q.status === 'att').length;
    const mediaAcerto = c.qs.reduce((s, q) => s + q.acerto, 0) / c.qs.length;
    const score       = criticas * 10 + att * 3 + (100 - mediaAcerto) * 0.1;
    return { comp: c.comp, disc: c.disc, qs: c.qs, criticas, mediaAcerto, score };
  });
  stats.sort((a, b) => b.score - a.score);
  const top    = stats[0];
  const worstQ = top.qs.slice().sort((a, b) => a.acerto - b.acerto)[0];
  return {
    comp:          top.comp,
    disciplina:    top.disc,
    assunto:       worstQ.assunto,
    totalCriticas: top.criticas,
    mediaAcerto:   Math.round(top.mediaAcerto),
  };
}

/* ── QUALITY INDEX PER SIMULADO (0–100) ────────────────────── */
const SIM_QUALIDADE = { sim1: 62, sim2: 66, sim3: 68, sim4: 71, sim5: 73 };

/* ── EVOLUÇÃO POR TIPO DE GRÁFICO ──────────────────────────── */
const SIM_EVO_LABELS = ['1º Sim.', '2º Sim.', '3º Sim.', '4º Sim.', '5º Sim.'];

/* Cada tipo tem charts[] com traces[] por gráfico — permite múltiplas linhas comparativas */
const SIM_EVO_TIPOS = {
  media: {
    unit: '%',
    insight: 'A média geral cresceu +10,1 p.p. ao longo dos 5 simulados. Escola A e D puxam a rede para cima; Turma 2 ainda cresce abaixo da meta. Identificar escolas com crescimento abaixo de +2 p.p./simulado e aplicar intervenções direcionadas.',
    charts: [
      {
        title: 'Média Geral — Rede',
        traces: [
          { label: 'Média da rede', data: [43.5,45.1,47.8,50.2,53.6], color: '#E8521A' },
        ],
      },
      {
        title: 'Média Geral — Por Escola',
        traces: [
          { label: 'Escola A', data: [48.2,51.4,54.1,57.3,62.8], color: '#1D4ED8' },
          { label: 'Escola B', data: [43.2,46.8,50.1,53.9,60.1], color: '#059669' },
          { label: 'Escola C', data: [47.1,49.2,52.4,55.8,58.4], color: '#D97706' },
          { label: 'Escola D', data: [50.1,51.4,53.7,55.9,57.2], color: '#7C3AED' },
          { label: 'Rede',    data: [43.5,45.1,47.8,50.2,53.6], color: '#9CA3AF', dash: 'dot' },
        ],
      },
      {
        title: 'Média Geral — Por Turma',
        traces: [
          { label: 'Turma 1', data: [46.2,48.1,51.3,53.8,57.4], color: '#1D4ED8' },
          { label: 'Turma 2', data: [41.8,44.2,47.1,49.8,53.1], color: '#059669' },
          { label: 'Rede',    data: [43.5,45.1,47.8,50.2,53.6], color: '#9CA3AF', dash: 'dot' },
        ],
      },
    ],
  },
  acerto: {
    unit: '%',
    insight: 'O índice de acerto médio cresceu +22 p.p. ao longo dos simulados. Escola A lidera com 69% no 5º. O gap entre Turma 2 (61%) e Escola A (69%) indica disparidade de prática diagnóstica. Priorizar nivelamento entre turmas antes do ciclo seguinte.',
    charts: [
      {
        title: 'Índice de Acerto — Rede',
        traces: [
          { label: 'Média da rede', data: [41,45,52,58,63], color: '#E8521A' },
        ],
      },
      {
        title: 'Índice de Acerto — Por Escola',
        traces: [
          { label: 'Escola A', data: [46,51,58,64,69], color: '#1D4ED8' },
          { label: 'Escola B', data: [40,44,51,57,64], color: '#059669' },
          { label: 'Escola C', data: [44,48,55,61,66], color: '#D97706' },
          { label: 'Escola D', data: [47,51,57,63,67], color: '#7C3AED' },
          { label: 'Rede',    data: [41,45,52,58,63], color: '#9CA3AF', dash: 'dot' },
        ],
      },
      {
        title: 'Índice de Acerto — Por Turma',
        traces: [
          { label: 'Turma 1', data: [43,47,54,60,65], color: '#1D4ED8' },
          { label: 'Turma 2', data: [39,43,50,56,61], color: '#059669' },
          { label: 'Rede',    data: [41,45,52,58,63], color: '#9CA3AF', dash: 'dot' },
        ],
      },
    ],
  },
  participacao: {
    unit: '%',
    insight: 'A participação cresceu de forma sustentada. Escola A atingiu 95% no 5º simulado — referência para a rede. Turma 2 permanece abaixo de 85%: necessário engajamento ativo das lideranças pedagógicas. Meta: atingir 90% de adesão dos alunos.',
    charts: [
      {
        title: 'Participação — Rede',
        traces: [
          { label: 'Média da rede', data: [78,81,83,85,87], color: '#E8521A' },
        ],
      },
      {
        title: 'Participação — Por Escola',
        traces: [
          { label: 'Escola A', data: [91,92,93,94,95], color: '#1D4ED8' },
          { label: 'Escola B', data: [87,89,91,92,93], color: '#059669' },
          { label: 'Escola C', data: [85,88,90,91,92], color: '#D97706' },
          { label: 'Escola D', data: [88,90,91,92,93], color: '#7C3AED' },
          { label: 'Rede',    data: [78,81,83,85,87], color: '#9CA3AF', dash: 'dot' },
        ],
      },
      {
        title: 'Participação — Por Turma',
        traces: [
          { label: 'Turma 1', data: [79,82,84,86,88], color: '#1D4ED8' },
          { label: 'Turma 2', data: [75,78,80,82,84], color: '#059669' },
          { label: 'Rede',    data: [78,81,83,85,87], color: '#9CA3AF', dash: 'dot' },
        ],
      },
    ],
  },
  qualidade: {
    unit: '',
    insight: 'O índice de qualidade mede discriminação média, equilíbrio de dificuldade e robustez dos distratores. Matemática lidera a evolução (+14 pontos). Física ainda apresenta capacidade diagnóstica abaixo do esperado — priorizar revisão dos distratores nessa disciplina.',
    charts: [
      {
        title: 'Qualidade Geral',
        traces: [{ label: 'Índice geral', data: [62,66,68,71,73], color: '#E8521A' }],
      },
      {
        title: 'Qualidade — Matemática',
        traces: [{ label: 'Matemática', data: [58,63,67,70,72], color: '#1D4ED8' }],
      },
      {
        title: 'Qualidade — Física',
        traces: [{ label: 'Física', data: [60,64,66,69,71], color: '#059669' }],
      },
      {
        title: 'Qualidade — Química',
        traces: [{ label: 'Química', data: [64,68,70,73,75], color: '#D97706' }],
      },
      {
        title: 'Qualidade — Língua Inglesa',
        traces: [{ label: 'Inglês', data: [66,69,71,73,75], color: '#7C3AED' }],
      },
    ],
  },
};
