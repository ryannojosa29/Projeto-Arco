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
  Cada simulado representa um momento diferente do ciclo letivo.
  As questões são as mesmas, mas o desempenho dos alunos varia.
  Fatores derivados de REDE_MEDIA_SIM: sim1=43.5/53.6≈0.812 ... sim5=1.0
  Offsets determinísticos por índice criam variação realista por questão.
*/
const _SIM_FACTORS = { sim1: 0.812, sim2: 0.841, sim3: 0.892, sim4: 0.937, sim5: 1.0 };
const _SIM_Q_OFFSETS = [2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1];

/* Gabarito rotation per simulado — deterministic, no Math.random */
const _GAB_LETTERS = ['A','B','C','D','E'];
const _GAB_SHIFT_PATTERNS = {
  sim1: [1,0,2,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1,0,2,1,0,1,2,0,1],
  sim2: [0,1,0,2,0,1,0,2,1,0,2,1,0,1,0,2,1,0,2,1,0,1,2,0,1,0,2,1,0,2,1,0,1,0,2,1,0,1,0,2,1,0,1,0,2,1,0,2],
  sim3: [2,0,1,0,0,1,2,0,2,1,0,2,0,1,2,0,1,0,1,2,0,1,0,2,1,0,1,2,0,1,2,0,1,2,0,1,2,0,1,0,2,1,0,2,1,0,1,0],
  sim4: [0,0,1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0],
  sim5: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
};

function getQuestoesForSim(simId) {
  const f      = _SIM_FACTORS[simId] ?? 1.0;
  const shifts = _GAB_SHIFT_PATTERNS[simId] || _GAB_SHIFT_PATTERNS.sim5;
  return QUESTOES_RAW.map((q, i) => {
    const off           = _SIM_Q_OFFSETS[i] * (1 - f) * 4;
    const acerto        = Math.min(95, Math.max(10, Math.round(q.acerto * f + off)));
    const discriminante = parseFloat(Math.min(0.60, Math.max(0.08, q.discriminante * (0.82 + f * 0.18))).toFixed(2));
    const distPct       = Math.min(45, Math.round(q.distPct * (1 + (1 - f) * 0.5)));
    const status        = acerto >= 65 ? 'above' : acerto >= 38 ? 'att' : 'crit';
    // Deterministic gabarito rotation
    const shift   = shifts[i] || 0;
    const gabIdx  = _GAB_LETTERS.indexOf(q.gab);
    const distIdx = _GAB_LETTERS.indexOf(q.dist);
    const gab     = _GAB_LETTERS[(gabIdx + shift) % 5];
    let   dist    = _GAB_LETTERS[(distIdx + shift) % 5];
    if (dist === gab) dist = _GAB_LETTERS[(distIdx + shift + 1) % 5];
    return { ...q, acerto, discriminante, distPct, status, gab, dist };
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

const SIM_EVO_TIPOS = {
  media: {
    chartTitle: 'Média Geral',
    unit: '%',
    series: [
      { label: 'Alunos',  data: [43.5, 45.1, 47.8, 50.2, 53.6], color: '#E8521A' },
      { label: 'Escolas', data: [42.8, 44.9, 47.1, 49.8, 52.9], color: '#1D4ED8' },
      { label: 'Turmas',  data: [41.2, 43.8, 46.5, 49.1, 52.3], color: '#059669' },
    ],
    insight: 'A média geral da rede cresceu +10,1 p.p. ao longo dos 5 simulados. Alunos e turmas apresentaram evolução consistente, com aceleração entre o 3º e 5º simulado. Manter as estratégias de preparação em curso e identificar escolas com crescimento abaixo da tendência.',
  },
  acerto: {
    chartTitle: 'Índice de Acerto',
    unit: '%',
    series: [
      { label: 'Alunos',  data: [41, 45, 52, 58, 63], color: '#E8521A' },
      { label: 'Escolas', data: [44, 48, 54, 60, 64], color: '#1D4ED8' },
      { label: 'Turmas',  data: [39, 43, 50, 56, 61], color: '#059669' },
    ],
    insight: 'O índice de acerto médio cresceu robustamente — maior salto entre o 2º e 3º simulado (+7 p.p. para alunos). Escolas mantiveram acerto 3–4 p.p. acima dos alunos em média. Monitorar turmas: crescimento proporcional, mas ainda abaixo do esperado para o ciclo.',
  },
  participacao: {
    chartTitle: 'Participação',
    unit: '%',
    series: [
      { label: 'Alunos',  data: [78, 81, 83, 85, 87], color: '#E8521A' },
      { label: 'Escolas', data: [89, 90, 91, 92, 93], color: '#1D4ED8' },
      { label: 'Turmas',  data: [75, 78, 80, 82, 84], color: '#059669' },
    ],
    insight: 'A participação cresceu de forma gradual e sustentada. Escolas lideram com 93% no 5º simulado — resultado de gestão ativa do calendário. O crescimento entre alunos (+9 p.p.) indica maior engajamento com o programa ao longo do ano. Meta: atingir 90% de adesão dos alunos.',
  },
  qualidade: {
    chartTitle: 'Índice de Qualidade',
    unit: '',
    series: [
      { label: 'Geral (rede)',  data: [62, 66, 68, 71, 73], color: '#E8521A' },
      { label: 'Matemática',   data: [58, 63, 67, 70, 72], color: '#1D4ED8' },
      { label: 'Física',       data: [60, 64, 66, 69, 71], color: '#059669' },
      { label: 'Química',      data: [64, 68, 70, 73, 75], color: '#D97706' },
    ],
    insight: 'O índice de qualidade do simulado — que combina discriminação média, equilíbrio de dificuldade e consistência das alternativas — cresceu em todas as disciplinas. Matemática mostrou a maior evolução (+14 pontos). Física ainda apresenta capacidade diagnóstica abaixo do esperado: priorizar revisão dos distratores.',
  },
};
