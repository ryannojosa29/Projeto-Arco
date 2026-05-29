/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Mock Data Layer
   Dados fake realistas para demonstração. Nunca usar dados reais.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── SIMULADOS (Ciclos ITA — 1ª Fase) ──────────────────────── */
/*
  Estrutura de ciclos: cada ciclo = 1 prova de 1ª fase (48 questões).
  2ª fase prevista para ciclos futuros; por ora apenas 1ª fase disponível.
  Ao clicar em "Ciclo N", exibe exclusivamente a 1ª fase ITA daquele ciclo.
*/
const SIMULADOS = [
  { id: 1, label: '1º Ciclo ITA — 1ª Fase', labelCurto: 'Ciclo 1 · 1ª Fase', ciclo: 1, fase: '1ª fase', mes: 'Março 2025'    },
  { id: 2, label: '2º Ciclo ITA — 1ª Fase', labelCurto: 'Ciclo 2 · 1ª Fase', ciclo: 2, fase: '1ª fase', mes: 'Maio 2025'     },
  { id: 3, label: '3º Ciclo ITA — 1ª Fase', labelCurto: 'Ciclo 3 · 1ª Fase', ciclo: 3, fase: '1ª fase', mes: 'Julho 2025'    },
  { id: 4, label: '4º Ciclo ITA — 1ª Fase', labelCurto: 'Ciclo 4 · 1ª Fase', ciclo: 4, fase: '1ª fase', mes: 'Setembro 2025' },
  { id: 5, label: '5º Ciclo ITA — 1ª Fase', labelCurto: 'Ciclo 5 · 1ª Fase', ciclo: 5, fase: '1ª fase', mes: 'Novembro 2025' },
];

/* ── MÉDIAS DA REDE POR CICLO ──────────────────────────────── */
const REDE_MEDIA_SIM = [51.2, 52.8, 53.6, 54.9, 56.1];

/* ── MÉDIAS DA REDE POR DISCIPLINA (ITA 1ª Fase) ──────────── */
const REDE_DISC = {
  'Matemática':      65.3,
  'Física':          44.5,
  'Química':         49.8,
  'Língua Inglesa':  54.6,
};

const DISCIPLINAS = ['Matemática', 'Física', 'Química', 'Língua Inglesa'];

/* ══════════════════════════════════════════════════════════
   FUNÇÕES PSICOMÉTRICAS
   Calculam estatísticas de itens em tempo real a partir dos dados brutos.
   Não use valores pré-calculados — alimente as funções com os opts do banco.
══════════════════════════════════════════════════════════ */

/**
 * Dificuldade do item (p): proporção de acertos.
 * Entrada: opts = {A: n, B: n, C: n, D: n, E: n}, gab = letra do gabarito.
 * Saída: p ∈ [0, 1]
 */
function calcDificuldade(opts, gab) {
  const n = Object.values(opts).reduce((s, v) => s + v, 0);
  return n > 0 ? opts[gab] / n : 0;
}

/**
 * Distratores ordenados por frequência (excluindo gabarito).
 * Saída: [{letra, n, pct}, ...] — do mais ao menos escolhido.
 */
function calcDistratores(opts, gab) {
  const total = Object.values(opts).reduce((s, v) => s + v, 0);
  return Object.entries(opts)
    .filter(([k]) => k !== gab)
    .map(([letra, cnt]) => ({ letra, n: cnt, pct: total > 0 ? +(cnt / total * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.n - a.n);
}

/**
 * Discriminante exato pelo método dos grupos extremos (27% sup. vs. 27% inf.).
 * Requer dados individuais de alunos — use quando o backend fornece respostas por aluno.
 *
 * @param {Array}  respostasAlunos  [{totalScore: number, acertou: boolean[]}]
 * @param {number} qIdx             índice da questão no array (0-based)
 * @returns {number|null}           D ∈ [-1, 1] ou null se dados insuficientes
 *
 * Como integrar com Supabase:
 *   const rows = await supabase.from('respostas_aluno').select('aluno_id, score_total, acertou_json')...
 *   const D = calcDiscriminante(rows.map(r => ({ totalScore: r.score_total, acertou: JSON.parse(r.acertou_json) })), qIdx);
 */
function calcDiscriminante(respostasAlunos, qIdx) {
  if (!respostasAlunos || respostasAlunos.length < 10) return null;
  const sorted = [...respostasAlunos].sort((a, b) => b.totalScore - a.totalScore);
  const n27    = Math.max(1, Math.floor(sorted.length * 0.27));
  const upper  = sorted.slice(0, n27);
  const lower  = sorted.slice(-n27);
  const pU = upper.filter(a => a.acertou[qIdx]).length / n27;
  const pL = lower.filter(a => a.acertou[qIdx]).length / n27;
  return +((pU - pL).toFixed(3));
}

/**
 * Ponto bisserial (r_pb): correlação entre acertar o item e o score total.
 * Requer dados individuais — use junto com calcDiscriminante quando disponíveis.
 *
 * @param {Array}  respostasAlunos  [{totalScore: number, acertou: boolean[]}]
 * @param {number} qIdx             índice da questão (0-based)
 * @returns {number|null}           r_pb ∈ [-1, 1] ou null se dados insuficientes
 */
function calcPontoBisserial(respostasAlunos, qIdx) {
  if (!respostasAlunos || respostasAlunos.length < 10) return null;
  const n  = respostasAlunos.length;
  const Mt = respostasAlunos.reduce((s, a) => s + a.totalScore, 0) / n;
  const St = Math.sqrt(respostasAlunos.reduce((s, a) => s + Math.pow(a.totalScore - Mt, 2), 0) / n);
  if (St === 0) return 0;
  const correct = respostasAlunos.filter(a => a.acertou[qIdx]);
  const p = correct.length / n;
  const q = 1 - p;
  if (p === 0 || p === 1) return 0;
  const Mp = correct.reduce((s, a) => s + a.totalScore, 0) / correct.length;
  return +((Mp - Mt) / St * Math.sqrt(p / q)).toFixed(3);
}

/**
 * Estimativa de discriminante a partir de dados agregados (sem dados individuais).
 * Baseada na relação teórica D_max = 2·min(p, 1−p); D_est ≈ 0.72 · D_max.
 * Menos precisa — substituir por calcDiscriminante() quando dados individuais chegarem do banco.
 */
function calcDiscriminanteAprox(p, seed) {
  const pq  = Math.min(p, 1 - p);
  const base = 0.08 + 0.72 * pq;
  const jit  = ((seed * 7919) % 17 - 8) * 0.006;
  return Math.max(0.08, Math.min(0.60, parseFloat((base + jit).toFixed(3))));
}

/**
 * Estimativa de ponto bisserial a partir de dados agregados.
 * Relação: r_pb ≈ D · sqrt(p·q) / (2·p·q). Substituir por calcPontoBisserial() com dados reais.
 */
function calcPontoBisserialAprox(p, disc) {
  if (p <= 0 || p >= 1) return 0;
  const q   = 1 - p;
  const rpb = disc * Math.sqrt(p * q) / (2 * p * q);
  return Math.max(0.05, Math.min(0.70, parseFloat(rpb.toFixed(3))));
}

/**
 * Processa um item bruto (formato Supabase) e retorna o objeto enriquecido com
 * todas as estatísticas calculadas. Ponto de entrada para dados vindos do banco.
 *
 * @param {Object} raw              {num, disc, gab, opts, comp, assunto, diff, [habilidade]}
 * @param {Array}  [respostasAlunos] dados individuais opcionais para métricas exatas
 * @returns {Object} item com: n, p, acerto, dist, distPct, discriminante, pbis, efi, status, hipotese, sugestao
 */
function processarItem(raw, respostasAlunos) {
  const n           = Object.values(raw.opts).reduce((s, v) => s + v, 0);
  const p           = calcDificuldade(raw.opts, raw.gab);
  const acerto      = +(p * 100).toFixed(1);
  const distArr     = calcDistratores(raw.opts, raw.gab);
  const dist        = distArr.length > 0 ? distArr[0].letra : '—';
  const distPct     = distArr.length > 0 ? distArr[0].pct   : 0;

  const qIdx         = raw.num - 1;
  const discriminante = (respostasAlunos)
    ? (calcDiscriminante(respostasAlunos, qIdx) ?? calcDiscriminanteAprox(p, raw.num))
    : calcDiscriminanteAprox(p, raw.num);
  const pbis         = (respostasAlunos)
    ? (calcPontoBisserial(respostasAlunos, qIdx) ?? calcPontoBisserialAprox(p, discriminante))
    : calcPontoBisserialAprox(p, discriminante);

  const efi    = _calcProfQI(discriminante, acerto, distPct, pbis, raw.diff || 'Médio');
  const status = acerto >= 65 ? 'above' : acerto >= 38 ? 'att' : 'crit';

  let hipotese, sugestao;
  if (discriminante < 0.20 && acerto < 35) {
    hipotese = 'Possível lacuna generalizada: alunos de todos os níveis erraram. Pode indicar formulação ambígua ou conteúdo ainda não consolidado na rede.';
  } else if (discriminante < 0.25 && acerto < 40) {
    hipotese = 'Dificuldade real detectada: baixa discriminação e acerto baixo sugerem lacuna conceitual generalizada na frente.';
  } else if (discriminante < 0.25 && acerto > 70) {
    hipotese = 'Item com pouco poder diagnóstico: alunos de todos os níveis acertam, reduzindo a utilidade para separar perfis.';
  } else if (distPct > 35) {
    hipotese = `Concentração no distrator dominante (${distPct}%): indica confusão conceitual recorrente — alunos migram para a mesma alternativa errada.`;
  } else if (discriminante >= 0.35 && acerto >= 30 && acerto <= 70) {
    hipotese = 'Item bem calibrado: separa com clareza alunos com e sem domínio do conteúdo. Alta utilidade diagnóstica.';
  } else if (acerto > 75) {
    hipotese = 'Conteúdo bem consolidado. Acerto elevado reduz o valor diagnóstico do item para separação de perfis.';
  } else if (acerto < 30) {
    hipotese = 'Acerto muito baixo: pode indicar conteúdo não trabalhado, excesso de dificuldade ou formulação que gera ambiguidade.';
  } else {
    hipotese = 'Desempenho dentro do esperado. Item adequado ao nível da frente com discriminação satisfatória.';
  }
  if (efi >= 85)      sugestao = 'Manter como referência diagnóstica. Pode ser reutilizado ou adaptado em ciclos futuros sem ajustes estruturais.';
  else if (efi >= 70) sugestao = 'Pequenos ajustes nos distratores ou na calibragem de dificuldade podem elevar o impacto diagnóstico do item.';
  else if (efi >= 55) sugestao = 'Revisar enunciado e alternativas. Verificar se a dificuldade está adequada ao nível esperado da frente.';
  else                sugestao = 'Revisão técnica completa sugerida: calibragem, distratores e equilíbrio de dificuldade merecem atenção antes do próximo ciclo.';

  return { ...raw, n, p, acerto, gab: raw.gab, dist, distPct: parseFloat(distPct), distratores: distArr, discriminante, pbis, efi, status, hipotese, sugestao };
}

/* ── 48 QUESTÕES — ITA 1ª Fase (dados reais do Ciclo 1) ───── */
/*
  Formato Supabase: opts = {A, B, C, D, E} contagens brutas por alternativa.
  Estrutura: Q1-12 Matemática · Q13-24 Física · Q25-36 Química · Q37-48 Inglês
  Professors: Alexandre Cezar (Mat) | Renan Farrapo (Fís Q13-18) | Ryan Nojosa (Fís Q19-24)
              José Marques (Quím)   | Daniel Nicolas (Ingl)
  Todas as estatísticas derivadas (acerto, discriminante, pbis, efi, status)
  são calculadas em tempo real por processarItem() — nunca pré-calculadas.
*/
const QUESTOES_RAW = [
  // ── MATEMÁTICA (Q1–12) — Prof. Alexandre Cezar ──────────
  { num: 1,  disc:'Matemática',    gab:'C', opts:{A:11,  B:46,  C:132, D:98,  E:36 }, comp:'Álgebra',            assunto:'Princípio da Indução Matemática',              diff:'Médio-alto' },
  { num: 2,  disc:'Matemática',    gab:'A', opts:{A:106, B:81,  C:28,  D:65,  E:44 }, comp:'Combinatória',       assunto:'Princípio Multiplicativo e Permutações',       diff:'Alto'       },
  { num: 3,  disc:'Matemática',    gab:'B', opts:{A:11,  B:220, C:22,  D:25,  E:47 }, comp:'Geometria Analítica',assunto:'Cônicas — Elipse e Hipérbole',                 diff:'Médio'      },
  { num: 4,  disc:'Matemática',    gab:'E', opts:{A:29,  B:8,   C:4,   D:38,  E:245}, comp:'Trigonometria',      assunto:'Identidades e Equações Trigonométricas',       diff:'Fácil'      },
  { num: 5,  disc:'Matemática',    gab:'A', opts:{A:148, B:12,  C:29,  D:46,  E:85 }, comp:'Funções',            assunto:'Funções Compostas e Inversas',                 diff:'Médio-alto' },
  { num: 6,  disc:'Matemática',    gab:'A', opts:{A:241, B:9,   C:30,  D:11,  E:31 }, comp:'Geometria Espacial', assunto:'Sólidos de Revolução — Volume e Área',         diff:'Fácil'      },
  { num: 7,  disc:'Matemática',    gab:'C', opts:{A:19,  B:9,   C:275, D:9,   E:10 }, comp:'Probabilidade',      assunto:'Probabilidade Condicional e Laplace',          diff:'Fácil'      },
  { num: 8,  disc:'Matemática',    gab:'D', opts:{A:0,   B:1,   C:6,   D:313, E:3  }, comp:'Álgebra',            assunto:'Números Complexos — Forma Algébrica',          diff:'Fácil'      },
  { num: 9,  disc:'Matemática',    gab:'E', opts:{A:0,   B:2,   C:0,   D:4,   E:318}, comp:'Progressões',        assunto:'Progressão Geométrica — Soma Infinita',        diff:'Fácil'      },
  { num: 10, disc:'Matemática',    gab:'E', opts:{A:21,  B:11,  C:8,   D:32,  E:248}, comp:'Geometria Analítica',assunto:'Retas e Distâncias no Plano Cartesiano',       diff:'Médio'      },
  { num: 11, disc:'Matemática',    gab:'E', opts:{A:33,  B:4,   C:26,  D:3,   E:255}, comp:'Funções',            assunto:'Função Logarítmica — Equações e Inequações',   diff:'Médio'      },
  { num: 12, disc:'Matemática',    gab:'A', opts:{A:208, B:23,  C:53,  D:23,  E:12 }, comp:'Álgebra',            assunto:'Matrizes e Sistemas de Equações Lineares',     diff:'Médio'      },

  // ── FÍSICA (Q13–24) ─────────────────────────────────────
  // Prof. Renan Farrapo — Q13-18
  { num: 13, disc:'Física',        gab:'A', opts:{A:168, B:53,  C:50,  D:26,  E:22 }, comp:'Mecânica',           assunto:'Dinâmica — Leis de Newton em Sistemas',        diff:'Médio'      },
  { num: 14, disc:'Física',        gab:'C', opts:{A:48,  B:43,  C:163, D:21,  E:44 }, comp:'Termodinâmica',      assunto:'Gases Ideais — Transformações Gasosas',        diff:'Médio'      },
  { num: 15, disc:'Física',        gab:'D', opts:{A:33,  B:49,  C:53,  D:147, E:32 }, comp:'Eletromagnetismo',   assunto:'Circuitos com Capacitores — Carga e Energia',  diff:'Médio-alto' },
  { num: 16, disc:'Física',        gab:'E', opts:{A:18,  B:67,  C:53,  D:89,  E:87 }, comp:'Ondulatória',        assunto:'Interferência e Difração da Luz',               diff:'Alto'       },
  { num: 17, disc:'Física',        gab:'E', opts:{A:28,  B:53,  C:67,  D:61,  E:110}, comp:'Mecânica',           assunto:'Impulso e Quantidade de Movimento',             diff:'Médio-alto' },
  { num: 18, disc:'Física',        gab:'C', opts:{A:21,  B:36,  C:203, D:36,  E:23 }, comp:'Eletromagnetismo',   assunto:'Indução Magnética — Lei de Faraday',            diff:'Médio'      },
  // Prof. Ryan Nojosa — Q19-24
  { num: 19, disc:'Física',        gab:'A', opts:{A:114, B:59,  C:36,  D:36,  E:65 }, comp:'Mecânica',           assunto:'Cinemática — Movimento Relativo e Composição', diff:'Médio-alto' },
  { num: 20, disc:'Física',        gab:'D', opts:{A:30,  B:49,  C:70,  D:110, E:52 }, comp:'Óptica',             assunto:'Refração — Ângulo Crítico e Reflexão Total',   diff:'Médio-alto' },
  { num: 21, disc:'Física',        gab:'D', opts:{A:14,  B:73,  C:58,  D:145, E:28 }, comp:'Termodinâmica',      assunto:'2ª Lei da Termodinâmica — Entropia',           diff:'Médio'      },
  { num: 22, disc:'Física',        gab:'A', opts:{A:177, B:24,  C:69,  D:16,  E:33 }, comp:'Eletromagnetismo',   assunto:'Eletrostática — Potencial Elétrico',            diff:'Médio'      },
  { num: 23, disc:'Física',        gab:'E', opts:{A:19,  B:19,  C:27,  D:31,  E:220}, comp:'Mecânica',           assunto:'Momento Angular e Conservação',                 diff:'Médio'      },
  { num: 24, disc:'Física',        gab:'A', opts:{A:99,  B:81,  C:40,  D:53,  E:44 }, comp:'Física Moderna',     assunto:'Efeito Fotoelétrico e Dualidade Onda-Partícula',diff:'Alto'      },

  // ── QUÍMICA (Q25–36) — Prof. José Marques ───────────────
  { num: 25, disc:'Química',       gab:'B', opts:{A:58,  B:202, C:35,  D:11,  E:16 }, comp:'Estequiometria',     assunto:'Reagentes Limitantes e Rendimento',             diff:'Médio'      },
  { num: 26, disc:'Química',       gab:'D', opts:{A:22,  B:30,  C:101, D:132, E:37 }, comp:'Termoquímica',       assunto:'Entalpia — Lei de Hess e Diagramas',            diff:'Médio-alto' },
  { num: 27, disc:'Química',       gab:'E', opts:{A:17,  B:24,  C:17,  D:79,  E:184}, comp:'Eletroquímica',      assunto:'Potencial de Redução e Força Eletromotriz',     diff:'Médio'      },
  { num: 28, disc:'Química',       gab:'E', opts:{A:21,  B:21,  C:42,  D:31,  E:206}, comp:'Eletroquímica',      assunto:'Eletrólise — Cálculos com Lei de Faraday',      diff:'Médio'      },
  { num: 29, disc:'Química',       gab:'B', opts:{A:52,  B:93,  C:46,  D:57,  E:66 }, comp:'Química Orgânica',   assunto:'Isomeria Óptica e Estereoisomeria',             diff:'Alto'       },
  { num: 30, disc:'Química',       gab:'D', opts:{A:35,  B:36,  C:51,  D:176, E:20 }, comp:'Soluções',           assunto:'Propriedades Coligativas — Crioscopia',         diff:'Médio'      },
  { num: 31, disc:'Química',       gab:'D', opts:{A:65,  B:25,  C:39,  D:119, E:69 }, comp:'Cinética Química',   assunto:'Ordem de Reação e Constante de Velocidade',    diff:'Alto'       },
  { num: 32, disc:'Química',       gab:'C', opts:{A:74,  B:46,  C:92,  D:43,  E:62 }, comp:'Equilíbrio Químico', assunto:'Kc, Kp e Princípio de Le Chatelier',           diff:'Alto'       },
  { num: 33, disc:'Química',       gab:'B', opts:{A:50,  B:129, C:64,  D:59,  E:17 }, comp:'Estequiometria',     assunto:'Concentração Molar e Diluição de Soluções',    diff:'Médio'      },
  { num: 34, disc:'Química',       gab:'C', opts:{A:32,  B:88,  C:127, D:52,  E:19 }, comp:'Química Orgânica',   assunto:'Reações de Adição e Substituição Eletrofílica',diff:'Médio-alto' },
  { num: 35, disc:'Química',       gab:'D', opts:{A:43,  B:30,  C:38,  D:158, E:50 }, comp:'Gases',              assunto:'Equação dos Gases Reais — Van der Waals',      diff:'Médio'      },
  { num: 36, disc:'Química',       gab:'C', opts:{A:10,  B:10,  C:247, D:28,  E:24 }, comp:'Termoquímica',       assunto:'Energia de Ligação e Entalpia de Formação',    diff:'Fácil'      },

  // ── LÍNGUA INGLESA (Q37–48) — Prof. Daniel Nicolas ──────
  { num: 37, disc:'Língua Inglesa',gab:'E', opts:{A:51,  B:9,   C:10,  D:9,   E:243}, comp:'Reading',            assunto:'Text Purpose and Main Idea',                   diff:'Fácil'      },
  { num: 38, disc:'Língua Inglesa',gab:'C', opts:{A:40,  B:38,  C:191, D:20,  E:33 }, comp:'Reading',            assunto:'Inference and Implication',                    diff:'Médio'      },
  { num: 39, disc:'Língua Inglesa',gab:'D', opts:{A:19,  B:85,  C:13,  D:177, E:28 }, comp:'Grammar',            assunto:'Passive Voice and Complex Structures',          diff:'Médio'      },
  { num: 40, disc:'Língua Inglesa',gab:'B', opts:{A:33,  B:161, C:35,  D:17,  E:76 }, comp:'Vocabulary',         assunto:'Contextual Meaning and Semantic Field',         diff:'Médio'      },
  { num: 41, disc:'Língua Inglesa',gab:'D', opts:{A:16,  B:4,   C:30,  D:263, E:9  }, comp:'Reading',            assunto:'Reading for Detail and Specific Information',   diff:'Fácil'      },
  { num: 42, disc:'Língua Inglesa',gab:'E', opts:{A:87,  B:28,  C:38,  D:18,  E:151}, comp:'Grammar',            assunto:'Modal Verbs and Degrees of Certainty',          diff:'Médio-alto' },
  { num: 43, disc:'Língua Inglesa',gab:'A', opts:{A:126, B:8,   C:118, D:14,  E:56 }, comp:'Vocabulary',         assunto:'False Friends and Polysemy',                   diff:'Médio-alto' },
  { num: 44, disc:'Língua Inglesa',gab:'C', opts:{A:6,   B:10,  C:138, D:28,  E:139}, comp:'Reading',            assunto:'Text Organization and Discourse Structure',     diff:'Médio'      },
  { num: 45, disc:'Língua Inglesa',gab:'B', opts:{A:17,  B:156, C:33,  D:101, E:15 }, comp:'Grammar',            assunto:'Subjunctive Mood and Hypothetical Structures',  diff:'Médio'      },
  { num: 46, disc:'Língua Inglesa',gab:'D', opts:{A:15,  B:59,  C:57,  D:140, E:49 }, comp:'Vocabulary',         assunto:'Idiomatic Expressions in Context',              diff:'Médio'      },
  { num: 47, disc:'Língua Inglesa',gab:'C', opts:{A:36,  B:27,  C:216, D:34,  E:8  }, comp:'Reading',            assunto:'Comparative and Critical Text Analysis',        diff:'Médio'      },
  { num: 48, disc:'Língua Inglesa',gab:'B', opts:{A:26,  B:108, C:115, D:13,  E:59 }, comp:'Grammar',            assunto:'Discourse Markers and Text Cohesion',           diff:'Médio-alto' },
];

/* QUESTOES: Ciclo 1 processado — base para todos os cálculos da plataforma.
   Todas as métricas (acerto, discriminante, pbis, efi, status) calculadas em tempo real. */
const QUESTOES = QUESTOES_RAW.map(q => processarItem(q));

/* Helper: questões filtradas por disciplina */
function getQuestoesFiltradas(disciplina) {
  if (!disciplina || disciplina === 'Todas' || disciplina === 'all') return QUESTOES;
  return QUESTOES.filter(q => q.disc === disciplina);
}

/* ── 28 ESCOLAS ────────────────────────────────────────────── */
/*
  evo: médias nos 5 simulados (usados como histórico)
  forte/fraco: disciplina de destaque/atenção
*/
const ESCOLAS = [
  { key:'a',  nome:'Escola A',  media:62.8, var:+6.7, rankMove:+2, part:94, evo:[48.2,51.4,54.1,57.3,62.8], forte:'Matemática',     fraco:'Física'       },
  { key:'b',  nome:'Escola B',  media:60.1, var:+8.7, rankMove:+3, part:91, evo:[43.2,46.8,50.1,53.9,60.1], forte:'Física',          fraco:'Matemática'   },
  { key:'c',  nome:'Escola C',  media:58.4, var:+3.2, rankMove: 0, part:89, evo:[47.1,49.2,52.4,55.8,58.4], forte:'Língua Inglesa',  fraco:'Química'      },
  { key:'d',  nome:'Escola D',  media:57.2, var:+1.8, rankMove:+1, part:88, evo:[50.1,51.4,53.7,55.9,57.2], forte:'Língua Inglesa',  fraco:'Física'       },
  { key:'e',  nome:'Escola E',  media:55.6, var:+2.1, rankMove: 0, part:87, evo:[45.3,47.8,50.2,53.4,55.6], forte:'Matemática',      fraco:'Física'       },
  { key:'f',  nome:'Escola F',  media:54.1, var:-0.8, rankMove:-1, part:86, evo:[49.2,50.4,52.3,54.8,54.1], forte:'Língua Inglesa',  fraco:'Física'       },
  { key:'g',  nome:'Escola G',  media:53.8, var:+1.4, rankMove:+2, part:85, evo:[44.2,46.7,49.1,52.3,53.8], forte:'Química',         fraco:'Matemática'   },
  { key:'h',  nome:'Escola H',  media:52.7, var:-1.2, rankMove:-1, part:84, evo:[48.1,50.2,52.8,54.1,52.7], forte:'Língua Inglesa',  fraco:'Matemática'   },
  { key:'i',  nome:'Escola I',  media:51.9, var:+0.6, rankMove: 0, part:83, evo:[45.8,47.2,49.4,51.3,51.9], forte:'Química',         fraco:'Física'       },
  { key:'j',  nome:'Escola J',  media:50.8, var:-1.7, rankMove:-2, part:82, evo:[47.2,49.4,52.1,53.0,50.8], forte:'Matemática',      fraco:'Química'      },
  { key:'k',  nome:'Escola K',  media:50.2, var:+2.3, rankMove:+1, part:81, evo:[41.8,43.9,46.1,48.7,50.2], forte:'Física',          fraco:'Matemática'   },
  { key:'l',  nome:'Escola L',  media:49.7, var:-0.4, rankMove: 0, part:80, evo:[46.3,47.8,49.2,50.1,49.7], forte:'Língua Inglesa',  fraco:'Matemática'   },
  { key:'m',  nome:'Escola M',  media:49.1, var:+1.1, rankMove:+1, part:80, evo:[42.7,44.3,46.8,48.2,49.1], forte:'Química',         fraco:'Física'       },
  { key:'n',  nome:'Escola N',  media:48.4, var:-2.1, rankMove:-3, part:79, evo:[45.2,47.8,50.3,51.2,48.4], forte:'Língua Inglesa',  fraco:'Matemática'   },
  { key:'o',  nome:'Escola O',  media:47.8, var:+0.9, rankMove:+1, part:78, evo:[40.2,42.1,44.3,46.9,47.8], forte:'Química',         fraco:'Física'       },
  { key:'p',  nome:'Escola P',  media:47.2, var:-1.4, rankMove:-1, part:77, evo:[44.1,46.3,48.7,49.0,47.2], forte:'Matemática',      fraco:'Química'      },
  { key:'q',  nome:'Escola Q',  media:46.5, var:+0.3, rankMove: 0, part:77, evo:[41.8,43.2,44.9,46.2,46.5], forte:'Física',          fraco:'Matemática'   },
  { key:'r',  nome:'Escola R',  media:45.9, var:-3.2, rankMove:-4, part:76, evo:[43.8,46.1,48.4,49.7,45.9], forte:'Língua Inglesa',  fraco:'Química'      },
  { key:'s',  nome:'Escola S',  media:45.1, var:+1.7, rankMove:+2, part:75, evo:[38.4,40.2,42.1,43.8,45.1], forte:'Química',         fraco:'Matemática'   },
  { key:'t',  nome:'Escola T',  media:44.3, var:-0.7, rankMove:-1, part:74, evo:[41.2,43.1,45.8,44.9,44.3], forte:'Língua Inglesa',  fraco:'Física'       },
  { key:'u',  nome:'Escola U',  media:43.7, var:+0.4, rankMove: 0, part:73, evo:[37.8,39.4,41.1,43.2,43.7], forte:'Matemática',      fraco:'Química'      },
  { key:'v',  nome:'Escola V',  media:42.8, var:-2.8, rankMove:-3, part:72, evo:[42.1,44.7,47.2,46.0,42.8], forte:'Matemática',      fraco:'Física'       },
  { key:'w',  nome:'Escola W',  media:41.9, var:+1.2, rankMove:+1, part:71, evo:[35.8,37.4,39.2,40.8,41.9], forte:'Língua Inglesa',  fraco:'Química'      },
  { key:'x',  nome:'Escola X',  media:40.7, var:-1.6, rankMove:-2, part:70, evo:[39.4,41.2,43.1,42.4,40.7], forte:'Física',          fraco:'Matemática'   },
  { key:'y',  nome:'Escola Y',  media:39.4, var:-4.1, rankMove:-5, part:69, evo:[40.2,42.1,44.3,44.8,39.4], forte:'Química',         fraco:'Matemática'   },
  { key:'z',  nome:'Escola Z',  media:37.8, var:-5.3, rankMove:-4, part:68, evo:[38.4,39.8,41.2,43.4,37.8], forte:'Língua Inglesa',  fraco:'Física'       },
  { key:'aa', nome:'Escola AA', media:35.9, var:+2.1, rankMove:+2, part:67, evo:[28.4,30.2,32.1,33.9,35.9], forte:'Língua Inglesa',  fraco:'Química'      },
  { key:'ab', nome:'Escola AB', media:33.2, var:-3.8, rankMove:-3, part:66, evo:[34.8,35.9,37.2,37.4,33.2], forte:'Química',         fraco:'Matemática'   },
];

/* Helper: buscar escola */
function getEscola(key) {
  return ESCOLAS.find(e => e.key === key) || ESCOLAS[0];
}

/* Helper: gerar dados de componente por escola (determinístico) — ITA 4 disciplinas */
const DISC_OFFSET = {
  'Matemática':    [+9, -7, +2, -3, +5, -1, +7, +3, +1, +4, +6, -5, +3, -2, +1, -4, +2, -6, +5, -1, +3, -4, +1, -3, +6, -2, +4, -7],
  'Física':        [-6, +9, -4, +2, -3, +7, -1, +5, +3, -7, -2, +6, -1, +4, -8, +3, -5, +2, +7, -3, +1, +9, -4, +2, -1, +5, -3, +1],
  'Química':       [+3, -3, +7, -1, +8, -2, +9, -4, +2, +5, -6, -1, +9, +1, +3, -7, +8, -2, -4, +6, -1, +2, +5, -3, +7, -8, +3, +6],
  'Língua Inglesa':[+7, +4, +9, -2, +3, +8, -3, +1, -5, +2, +6, +9, -4, +3, -2, +7, -1, +5, -3, +4, +8, -6, +9, +3, -4, +1, +8, -2],
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
    weak:   ['Química — 82,1%'],
    insight: 'Ana Clara apresenta desempenho excepcional e consistente em todas as frentes do ITA. <strong>Risco baixo</strong> de regressão. Recomendação: trilha de aceleração em Física e resolução de questões históricas da 1ª fase.',
    evo: [78.2, 80.5, 83.1, 85.4, 87.3],
    areas: { 'Matemática': 94.2, 'Física': 88.7, 'Química': 82.1, 'Língua Inglesa': 91.1 },
  },
  lucas: {
    av: 'LF', nome: 'Lucas Ferreira', escola: 'Escola A', turma: 'Turma 1', serie: '3ª EM',
    nota: '84,1%', pos: '2º / 24.532', pct: '99,8%ile', part: '100%',
    strong: ['Física — 91,3%', 'Química — 88,4%'],
    weak:   ['Língua Inglesa — 70,2%'],
    insight: 'Lucas demonstra excelência em Ciências da Natureza, mas indica lacuna em Inglês. <strong>Risco médio</strong> na 1ª fase ITA. Recomendação: reforço em reading e vocabulary.',
    evo: [74.1, 76.8, 79.2, 81.7, 84.1],
    areas: { 'Matemática': 86.2, 'Física': 91.3, 'Química': 88.4, 'Língua Inglesa': 70.2 },
  },
  mariana: {
    av: 'MS', nome: 'Mariana Santos', escola: 'Escola B', turma: 'Turma 2', serie: '3ª EM',
    nota: '82,8%', pos: '3º / 24.532', pct: '99,7%ile', part: '97%',
    strong: ['Língua Inglesa — 95,1%', 'Matemática — 82,1%'],
    weak:   ['Física — 65,3%', 'Química — 67,1%'],
    insight: 'Mariana tem excelência em Inglês mas lacuna importante em Ciências da Natureza. <strong>Risco médio-alto</strong> na 1ª fase ITA. Recomendação: apoio focado em Física e Química.',
    evo: [71.0, 74.3, 77.8, 80.5, 82.8],
    areas: { 'Matemática': 82.1, 'Física': 65.3, 'Química': 67.1, 'Língua Inglesa': 95.1 },
  },
  pedro: {
    av: 'PO', nome: 'Pedro Oliveira', escola: 'Escola A', turma: 'Turma 2', serie: '3ª EM',
    nota: '81,2%', pos: '4º / 24.532', pct: '99,5%ile', part: '100%',
    strong: ['Matemática — 92,1%', 'Física — 86,4%'],
    weak:   ['Língua Inglesa — 75,8%'],
    insight: 'Pedro tem forte base em exatas — perfil ideal para o ITA. <strong>Risco baixo</strong>. Lacuna em Inglês pode comprometer a pontuação na 1ª fase. Recomendação: reforço em grammar e vocabulary.',
    evo: [70.2, 73.8, 76.1, 79.0, 81.2],
    areas: { 'Matemática': 92.1, 'Física': 86.4, 'Química': 79.2, 'Língua Inglesa': 75.8 },
  },
  julia: {
    av: 'JC', nome: 'Julia Costa', escola: 'Escola C', turma: 'Turma 1', serie: '3ª EM',
    nota: '74,8%', pos: '8º / 24.532', pct: '99,2%ile', part: '94%',
    strong: ['Língua Inglesa — 78,4%', 'Química — 67,1%'],
    weak:   ['Física — 58,2%', 'Matemática — 63,4%'],
    insight: 'Julia tem bom desempenho em Inglês, mas lacunas críticas em exatas. <strong>Risco moderado-alto</strong> para aprovação na 1ª fase ITA. Recomendação: reforço intensivo em Física e Matemática.',
    evo: [61.2, 64.8, 68.3, 71.9, 74.8],
    areas: { 'Matemática': 63.4, 'Física': 58.2, 'Química': 67.1, 'Língua Inglesa': 78.4 },
  },
};

/* ── PROFESSORES — Frentes ITA 1ª Fase ────────────────────── */
/* questoes: índices (0-based) das questões de QUESTOES[] */
const PROFESSORES = {
  cezar: {
    nome: 'Prof. Alexandre Cezar', disc: 'Matemática',
    nqs: 12, iq: 8.4, acerto: 67.2, disc_medio: 0.37, alunos: 5420,
    questoes: [0,1,2,3,4,5,6,7,8,9,10,11],
    evo_iq:    [7.8, 8.0, 8.2, 8.3, 8.4],
    evo_acerto:[62.1, 64.3, 65.8, 66.7, 67.2],
    sintese: 'O Prof. Alexandre Cezar demonstra alta qualidade técnica na elaboração de questões de Matemática. Seus itens de álgebra e geometria analítica têm discriminante elevado. Ponto de atenção: Q8 (96%) e Q9 (98%) têm acerto extremo — avaliar se o nível está adequado ao perfil ITA.',
  },
  farrapo: {
    nome: 'Prof. Renan Farrapo', disc: 'Física',
    nqs: 6, iq: 7.1, acerto: 45.3, disc_medio: 0.30, alunos: 5420,
    questoes: [12,13,14,15,16,17],
    evo_iq:    [6.8, 7.0, 7.1, 7.1, 7.1],
    evo_acerto:[42.1, 43.8, 44.9, 45.1, 45.3],
    sintese: 'O Prof. Renan Farrapo calibra bem a dificuldade das questões de Mecânica e Eletromagnetismo. Q16 (Ondulatória, 27%) é o item mais crítico da frente — verificar coerência com o cronograma e o nível esperado do ITA.',
  },
  nojosa: {
    nome: 'Prof. Ryan Nojosa', disc: 'Física',
    nqs: 6, iq: 7.3, acerto: 44.0, disc_medio: 0.31, alunos: 5420,
    questoes: [18,19,20,21,22,23],
    evo_iq:    [6.9, 7.1, 7.2, 7.3, 7.3],
    evo_acerto:[41.2, 42.5, 43.4, 43.8, 44.0],
    sintese: 'O Prof. Ryan Nojosa tem questões com bom poder diagnóstico nas frentes de Cinemática e Física Moderna. Q24 (Efeito Fotoelétrico, 30%) apresenta concentração de distratores — revisar as alternativas para ampliar o poder discriminativo.',
  },
  marques: {
    nome: 'Prof. José Marques', disc: 'Química',
    nqs: 12, iq: 7.6, acerto: 47.7, disc_medio: 0.32, alunos: 5420,
    questoes: [24,25,26,27,28,29,30,31,32,33,34,35],
    evo_iq:    [7.2, 7.4, 7.5, 7.6, 7.6],
    evo_acerto:[44.1, 45.8, 47.0, 47.5, 47.7],
    sintese: 'O Prof. José Marques apresenta questões com boa variação de dificuldade. Seus itens de eletroquímica têm excelente discriminante. Q29 (Isomeria Óptica, 29%) e Q32 (Equilíbrio Químico, 28%) merecem revisão técnica por concentração de distratores.',
  },
  nicolas: {
    nome: 'Prof. Daniel Nicolas', disc: 'Língua Inglesa',
    nqs: 12, iq: 8.0, acerto: 54.7, disc_medio: 0.29, alunos: 5420,
    questoes: [36,37,38,39,40,41,42,43,44,45,46,47],
    evo_iq:    [7.6, 7.8, 7.9, 7.9, 8.0],
    evo_acerto:[51.2, 52.8, 53.9, 54.4, 54.7],
    sintese: 'O Prof. Daniel Nicolas demonstra boa calibração nos itens de Reading e Grammar. Q43 (False Friends, 39%) e Q48 (Discourse Markers, 33%) têm acerto abaixo do esperado — considerar revisão dos distratores. Q41 (81%) tem baixo valor diagnóstico.',
  },
};

function getProfessor(key) {
  return PROFESSORES[key] || PROFESSORES.cezar;
}

/* ══════════════════════════════════════════════════════════
   PROF_DADOS — 5 frentes de conhecimento (rede online)
   125 questões: 5 profs × 5 sims × 5 questões
══════════════════════════════════════════════════════════ */
const PROF_DADOS = [
  { key:'cezar',   nome:'Prof. Alexandre Cezar', disc:'Matemática',     qRange:[1,12],  abrangencia:'Rede ITA', av:'AC', iqTend:'stable' },
  { key:'farrapo', nome:'Prof. Renan Farrapo',   disc:'Física',         qRange:[13,18], abrangencia:'Rede ITA', av:'RF', iqTend:'stable' },
  { key:'nojosa',  nome:'Prof. Ryan Nojosa',     disc:'Física',         qRange:[19,24], abrangencia:'Rede ITA', av:'RN', iqTend:'up'     },
  { key:'marques', nome:'Prof. José Marques',    disc:'Química',        qRange:[25,36], abrangencia:'Rede ITA', av:'JM', iqTend:'stable' },
  { key:'nicolas', nome:'Prof. Daniel Nicolas',  disc:'Língua Inglesa', qRange:[37,48], abrangencia:'Rede ITA', av:'DN', iqTend:'up'     },
];

function _calcProfQI(disc, acerto, distPct, pbis, diff) {
  const ds = Math.min(100, Math.max(0, (disc - 0.08) / 0.52 * 100));
  const as = acerto >= 30 && acerto <= 70 ? 100 : acerto > 70 ? Math.max(0, 100 - (acerto - 70) * 2.5) : Math.max(0, 100 - (30 - acerto) * 2);
  const rs = distPct >= 15 && distPct <= 35 ? 100 : distPct > 35 ? Math.max(0, 100 - (distPct - 35) * 3) : Math.max(0, 100 - (15 - distPct) * 4);
  const ps = Math.min(100, Math.max(0, (pbis - 0.10) / 0.45 * 100));
  const fs = diff === 'Médio' ? 100 : diff === 'Médio-alto' ? 85 : diff === 'Alto' ? 70 : 60;
  return Math.round(0.30 * ds + 0.20 * as + 0.20 * rs + 0.15 * ps + 0.15 * fs);
}

function _mkPQ(profKey, sim, num, comp, assunto, diff, acerto, disc, distPct, pbis) {
  const efi    = _calcProfQI(disc, acerto, distPct, pbis, diff);
  const status = efi >= 85 ? 'excelente' : efi >= 70 ? 'boa' : efi >= 55 ? 'atencao' : 'revisao';
  const pIdx   = PROF_DADOS.findIndex(p => p.key === profKey);
  const gabIdx = ((pIdx * 5 + (sim - 1) * 7 + (num - 1) * 3)) % 5;
  const gab    = 'ABCDE'[gabIdx];
  const alts   = ['A','B','C','D','E'].filter(a => a !== gab);
  const distDom = alts[((pIdx * 3 + (sim - 1) * 5 + (num - 1) * 7)) % 4];
  const rem    = Math.max(0, 100 - acerto - distPct);
  const oth    = ['A','B','C','D','E'].filter(a => a !== gab && a !== distDom);
  const perO   = Math.floor(rem / oth.length);
  const extra  = rem - perO * oth.length;
  const gabDist = { A:0, B:0, C:0, D:0, E:0 };
  gabDist[gab]     = acerto;
  gabDist[distDom] = distPct;
  oth.forEach((a, i) => { gabDist[a] = perO + (i === 0 ? extra : 0); });

  /* Hipótese pedagógica e sugestão geradas pelos dados */
  let hipotese, sugestao;
  if (disc < 0.20 && acerto < 35) {
    hipotese = 'Possível lacuna generalizada: alunos de todos os níveis erraram. Pode indicar formulação ambígua ou conteúdo ainda não consolidado na rede.';
  } else if (disc < 0.25 && acerto < 40) {
    hipotese = 'Dificuldade real detectada: baixa discriminação e acerto baixo sugerem lacuna conceitual generalizada na frente.';
  } else if (disc < 0.25 && acerto > 70) {
    hipotese = 'Item com pouco poder diagnóstico: alunos de todos os níveis acertam, o que reduz a utilidade para separar desempenhos.';
  } else if (distPct > 35) {
    hipotese = `Concentração no distrator dominante (${distPct}%): indica confusão conceitual recorrente — alunos migram para a mesma alternativa errada.`;
  } else if (disc >= 0.35 && acerto >= 30 && acerto <= 70) {
    hipotese = 'Item bem calibrado: separa com clareza alunos com e sem domínio do conteúdo. Alta utilidade diagnóstica.';
  } else if (acerto > 75) {
    hipotese = 'Conteúdo bem consolidado pelos alunos. Acerto elevado reduz o valor diagnóstico do item para separação de perfis.';
  } else if (acerto < 30) {
    hipotese = 'Acerto muito baixo: pode indicar conteúdo ainda não trabalhado, excesso de dificuldade ou formulação que gera ambiguidade.';
  } else {
    hipotese = 'Desempenho dentro do esperado. Item adequado ao nível da frente com discriminação satisfatória.';
  }

  if (efi >= 85) {
    sugestao = 'Manter como referência diagnóstica. Pode ser reutilizado ou adaptado em ciclos futuros sem ajustes estruturais.';
  } else if (efi >= 70) {
    sugestao = 'Pequenos ajustes nos distratores ou na calibragem de dificuldade podem elevar o impacto diagnóstico do item.';
  } else if (efi >= 55) {
    sugestao = 'Revisar enunciado e alternativas. Verificar se a dificuldade está adequada ao nível esperado da frente.';
  } else {
    sugestao = 'Revisão técnica completa sugerida: calibragem, distratores e equilíbrio de dificuldade merecem atenção antes do próximo ciclo.';
  }

  return { id: profKey+'-'+sim+'-'+num, profKey, sim, num, comp, assunto, diff, acerto, discriminante: disc, distPct, pbis, efi, status, gab, distDom, gabDist, hipotese, sugestao };
}

const PROF_QUESTOES_DADOS = [
  /* SILVA — Física 1 (melhora progressiva) */
  _mkPQ('farrapo',1,1,'Mecânica',         'Cinemática — MRU e MRUV',              'Médio',      58,0.35,22,0.32),
  _mkPQ('farrapo',1,2,'Mecânica',         'Dinâmica — Leis de Newton',            'Médio-alto', 45,0.38,28,0.35),
  _mkPQ('farrapo',1,3,'Termodinâmica',    'Leis da Termodinâmica',                'Alto',       38,0.28,32,0.26),
  _mkPQ('farrapo',1,4,'Eletromagnetismo', 'Campos Elétricos',                     'Alto',       32,0.18,38,0.16),
  _mkPQ('farrapo',1,5,'Óptica',           'Reflexão e Refração',                  'Fácil',      82,0.16,11,0.14),
  _mkPQ('farrapo',2,1,'Mecânica',         'Trabalho e Energia',                   'Médio',      60,0.40,25,0.37),
  _mkPQ('farrapo',2,2,'Mecânica',         'Impulso e Quantidade de Movimento',    'Médio-alto', 46,0.38,27,0.35),
  _mkPQ('farrapo',2,3,'Termodinâmica',    'Máquinas Térmicas e Rendimento',       'Médio',      55,0.34,26,0.31),
  _mkPQ('farrapo',2,4,'Eletromagnetismo', 'Corrente Elétrica e Resistência',      'Alto',       35,0.22,34,0.20),
  _mkPQ('farrapo',2,5,'Óptica',           'Lentes e Espelhos Esféricos',          'Médio',      72,0.24,17,0.22),
  _mkPQ('farrapo',3,1,'Mecânica',         'Gravitação Universal',                 'Médio',      60,0.43,25,0.40),
  _mkPQ('farrapo',3,2,'Ondulatória',      'Ondas Mecânicas — Propriedades',       'Médio-alto', 50,0.44,25,0.41),
  _mkPQ('farrapo',3,3,'Termodinâmica',    'Calor, Temperatura e Dilatação',       'Médio',      65,0.38,23,0.35),
  _mkPQ('farrapo',3,4,'Eletromagnetismo', 'Indução Eletromagnética',              'Alto',       38,0.30,30,0.28),
  _mkPQ('farrapo',3,5,'Física Moderna',   'Efeito Fotoelétrico',                  'Alto',       30,0.25,35,0.22),
  _mkPQ('farrapo',4,1,'Mecânica',         'Estática — Equilíbrio de Corpos',      'Médio',      63,0.45,24,0.42),
  _mkPQ('farrapo',4,2,'Ondulatória',      'Som e Acústica',                       'Médio-alto', 52,0.46,25,0.43),
  _mkPQ('farrapo',4,3,'Termodinâmica',    'Ciclo de Carnot',                      'Médio-alto', 46,0.43,26,0.40),
  _mkPQ('farrapo',4,4,'Eletromagnetismo', 'Força Magnética e Campo Magnético',    'Médio-alto', 44,0.40,27,0.37),
  _mkPQ('farrapo',4,5,'Física Moderna',   'Teoria da Relatividade Especial',      'Alto',       32,0.30,32,0.27),
  _mkPQ('farrapo',5,1,'Mecânica',         'Dinâmica Rotacional',                  'Médio',      61,0.48,23,0.45),
  _mkPQ('farrapo',5,2,'Ondulatória',      'Óptica Física — Interferência',        'Médio-alto', 50,0.47,25,0.44),
  _mkPQ('farrapo',5,3,'Termodinâmica',    'Entropia e 2ª Lei',                    'Médio-alto', 48,0.44,26,0.41),
  _mkPQ('farrapo',5,4,'Eletromagnetismo', 'Equações de Maxwell (Conceitual)',     'Alto',       40,0.40,28,0.37),
  _mkPQ('farrapo',5,5,'Óptica',           'Interferência e Difração da Luz',      'Médio',      65,0.42,22,0.39),

  /* FERREIRA — Física 2 (estável, bem calibrado) */
  _mkPQ('nojosa',1,1,'Mecânica',         'Cinemática — Velocidade Média',              'Médio',      62,0.38,24,0.34),
  _mkPQ('nojosa',1,2,'Eletromagnetismo', 'Cargas Elétricas e Lei de Coulomb',          'Médio',      58,0.36,26,0.32),
  _mkPQ('nojosa',1,3,'Ondulatória',      'Oscilações — Pêndulo e Mola',               'Médio-alto', 48,0.34,28,0.30),
  _mkPQ('nojosa',1,4,'Termodinâmica',    '1ª Lei da Termodinâmica',                   'Médio',      60,0.32,26,0.28),
  _mkPQ('nojosa',1,5,'Física Moderna',   'Modelo Atômico de Bohr',                    'Alto',       35,0.28,32,0.24),
  _mkPQ('nojosa',2,1,'Mecânica',         'Plano Inclinado e Atrito',                  'Médio',      60,0.40,24,0.36),
  _mkPQ('nojosa',2,2,'Eletromagnetismo', 'Potencial e Campo Elétrico',                'Médio-alto', 50,0.38,26,0.34),
  _mkPQ('nojosa',2,3,'Ondulatória',      'Interferência Construtiva e Destrutiva',    'Médio-alto', 46,0.36,28,0.32),
  _mkPQ('nojosa',2,4,'Termodinâmica',    '2ª Lei — Entropia e Irreversibilidade',     'Alto',       38,0.34,30,0.30),
  _mkPQ('nojosa',2,5,'Óptica',           'Espelhos Planos e Esféricos',               'Médio',      65,0.30,22,0.26),
  _mkPQ('nojosa',3,1,'Mecânica',         'Momento Angular e Conservação',             'Médio-alto', 52,0.40,25,0.36),
  _mkPQ('nojosa',3,2,'Eletromagnetismo', 'Circuitos RC e RL',                         'Alto',       40,0.38,28,0.34),
  _mkPQ('nojosa',3,3,'Ondulatória',      'Efeito Doppler',                            'Médio',      62,0.36,24,0.32),
  _mkPQ('nojosa',3,4,'Termodinâmica',    'Ciclos Termodinâmicos e Eficiência',        'Médio-alto', 50,0.34,26,0.30),
  _mkPQ('nojosa',3,5,'Física Moderna',   'Dualidade Onda-Partícula',                  'Alto',       35,0.32,32,0.28),
  _mkPQ('nojosa',4,1,'Mecânica',         'Colisões — Elásticas e Inelásticas',        'Médio',      60,0.40,24,0.36),
  _mkPQ('nojosa',4,2,'Eletromagnetismo', 'Transformadores e Indução Mútua',           'Médio-alto', 50,0.38,26,0.34),
  _mkPQ('nojosa',4,3,'Ondulatória',      'Ondas Estacionárias e Ressonância',         'Médio-alto', 48,0.36,27,0.32),
  _mkPQ('nojosa',4,4,'Termodinâmica',    'Processos Isocórico, Isobárico, Isotérmico','Alto',       38,0.34,30,0.30),
  _mkPQ('nojosa',4,5,'Física Moderna',   'Radioatividade e Decaimento Nuclear',       'Médio',      62,0.32,24,0.28),
  _mkPQ('nojosa',5,1,'Mecânica',         'Equilíbrio de Torques e Estática',          'Médio',      62,0.42,24,0.38),
  _mkPQ('nojosa',5,2,'Eletromagnetismo', 'Ondas Eletromagnéticas e Espectro',         'Médio-alto', 50,0.40,25,0.36),
  _mkPQ('nojosa',5,3,'Ondulatória',      'Polarização e Difração da Luz',             'Médio-alto', 48,0.38,26,0.34),
  _mkPQ('nojosa',5,4,'Termodinâmica',    'Transferência de Calor — Condução e Radiação','Médio',    62,0.36,24,0.32),
  _mkPQ('nojosa',5,5,'Física Moderna',   'Fissão, Fusão e Energia Nuclear',           'Alto',       38,0.34,30,0.30),

  /* SANTOS — Matemática (alta qualidade, consistente) */
  _mkPQ('cezar',1,1,'Funções',         'Domínio, Imagem e Gráficos',           'Médio',      65,0.50,23,0.46),
  _mkPQ('cezar',1,2,'Álgebra',         'Equações do 2º Grau',                  'Médio',      58,0.48,25,0.44),
  _mkPQ('cezar',1,3,'Geometria Plana', 'Triângulos — Congruência',             'Médio-alto', 50,0.45,26,0.42),
  _mkPQ('cezar',1,4,'Combinatória',    'Princípio Fundamental da Contagem',    'Médio-alto', 45,0.42,28,0.39),
  _mkPQ('cezar',1,5,'Estatística',     'Média, Mediana e Moda',                'Fácil',      75,0.36,18,0.32),
  _mkPQ('cezar',2,1,'Funções',         'Função do 2º Grau e Gráficos',         'Médio',      62,0.52,22,0.48),
  _mkPQ('cezar',2,2,'Álgebra',         'Sistemas Lineares',                    'Médio-alto', 52,0.47,25,0.44),
  _mkPQ('cezar',2,3,'Geometria Plana', 'Círculo, Circunferência e Arco',       'Médio',      60,0.48,24,0.44),
  _mkPQ('cezar',2,4,'Combinatória',    'Permutações e Arranjos',               'Alto',       40,0.44,27,0.41),
  _mkPQ('cezar',2,5,'Progressões',     'PA — Termo Geral e Soma',              'Médio',      68,0.42,20,0.38),
  _mkPQ('cezar',3,1,'Funções',         'Funções Exponenciais',                 'Médio',      60,0.52,22,0.48),
  _mkPQ('cezar',3,2,'Álgebra',         'Polinômios e Fatoração',               'Médio-alto', 50,0.50,24,0.46),
  _mkPQ('cezar',3,3,'Geometria Plana', 'Áreas e Perímetros',                   'Médio',      65,0.48,23,0.44),
  _mkPQ('cezar',3,4,'Estatística',     'Probabilidade Básica',                 'Médio',      58,0.46,25,0.42),
  _mkPQ('cezar',3,5,'Combinatória',    'Combinações Simples',                  'Médio-alto', 47,0.44,26,0.40),
  _mkPQ('cezar',4,1,'Funções',         'Funções Logarítmicas',                 'Médio-alto', 52,0.54,22,0.50),
  _mkPQ('cezar',4,2,'Geometria Plana', 'Semelhança de Triângulos',             'Médio',      62,0.50,22,0.46),
  _mkPQ('cezar',4,3,'Álgebra',         'Matrizes e Determinantes',             'Alto',       42,0.48,24,0.44),
  _mkPQ('cezar',4,4,'Progressões',     'PG — Soma e Produto',                  'Médio',      65,0.47,22,0.43),
  _mkPQ('cezar',4,5,'Geometria Esp.',  'Prismas, Pirâmides e Volumes',         'Médio-alto', 50,0.46,24,0.42),
  _mkPQ('cezar',5,1,'Funções',         'Trigonometria — Sen, Cos e Tan',       'Médio',      60,0.55,21,0.51),
  _mkPQ('cezar',5,2,'Geometria Plana', 'Trigonometria no Triângulo Retângulo', 'Médio-alto', 52,0.52,22,0.48),
  _mkPQ('cezar',5,3,'Álgebra',         'Números Complexos',                    'Alto',       40,0.50,24,0.46),
  _mkPQ('cezar',5,4,'Estatística',     'Probabilidade Condicional',            'Médio-alto', 48,0.48,24,0.44),
  _mkPQ('cezar',5,5,'Geometria Esp.',  'Sólidos de Revolução e Secções',       'Alto',       38,0.46,26,0.42),

  /* OLIVEIRA — Química (queda progressiva) */
  _mkPQ('marques',1,1,'Estequiometria','Balanceamento de Equações Químicas',   'Médio',      60,0.40,25,0.36),
  _mkPQ('marques',1,2,'Termoquímica',  'Entalpia — Reações Exo e Endotérm.',  'Médio-alto', 48,0.38,27,0.34),
  _mkPQ('marques',1,3,'Eletroquímica', 'Pilhas Galvânicas e fem',              'Médio',      58,0.36,26,0.32),
  _mkPQ('marques',1,4,'Orgânica',      'Hidrocarbonetos — Nomenclatura',       'Fácil',      76,0.28,16,0.24),
  _mkPQ('marques',1,5,'Cinética',      'Velocidade de Reação e Fatores',       'Médio',      55,0.34,26,0.30),
  _mkPQ('marques',2,1,'Estequiometria','Rendimento de Reação',                 'Médio',      55,0.34,28,0.30),
  _mkPQ('marques',2,2,'Termoquímica',  'Lei de Hess e Diagramas',              'Médio-alto', 44,0.32,30,0.28),
  _mkPQ('marques',2,3,'Orgânica',      'Funções Oxigenadas',                   'Médio',      62,0.30,24,0.26),
  _mkPQ('marques',2,4,'Cinética',      'Catálise e Equilíbrio Químico',        'Médio-alto', 48,0.28,30,0.24),
  _mkPQ('marques',2,5,'Gases',         'Leis dos Gases Ideais',                'Fácil',      80,0.20,13,0.16),
  _mkPQ('marques',3,1,'Estequiometria','Concentração de Soluções',             'Médio',      58,0.28,29,0.24),
  _mkPQ('marques',3,2,'Eletroquímica', 'Eletrólise Aquosa',                    'Médio-alto', 44,0.26,32,0.22),
  _mkPQ('marques',3,3,'Orgânica',      'Funções Nitrogenadas',                 'Alto',       34,0.24,36,0.20),
  _mkPQ('marques',3,4,'Cinética',      'Fatores que Alteram a Velocidade',     'Fácil',      85,0.15,10,0.12),
  _mkPQ('marques',3,5,'Gases',         'Transformações Gasosas (P, V, T)',      'Médio',      65,0.22,26,0.18),
  _mkPQ('marques',4,1,'Termoquímica',  'Energia de Ligação',                   'Médio-alto', 42,0.24,32,0.20),
  _mkPQ('marques',4,2,'Estequiometria','Titulação Ácido-Base',                 'Médio',      55,0.22,31,0.18),
  _mkPQ('marques',4,3,'Orgânica',      'Reações Orgânicas — Adição e Subs.',   'Alto',       35,0.20,39,0.16),
  _mkPQ('marques',4,4,'Eletroquímica', 'Corrosão e Proteção de Metais',        'Médio',      62,0.20,27,0.16),
  _mkPQ('marques',4,5,'Cinética',      'Equilíbrio Dinâmico — Kc e Kp',       'Médio-alto', 46,0.18,34,0.14),
  _mkPQ('marques',5,1,'Estequiometria','Pureza, Rendimento e Misturas',        'Médio-alto', 44,0.18,36,0.14),
  _mkPQ('marques',5,2,'Termoquímica',  'Calor de Neutralização',               'Alto',       30,0.14,44,0.10),
  _mkPQ('marques',5,3,'Orgânica',      'Polímeros e Plásticos',                'Médio',      84,0.13,12,0.10),
  _mkPQ('marques',5,4,'Eletroquímica', 'Eletrólise Ígnea — Lei de Faraday',   'Alto',       26,0.12,46,0.08),
  _mkPQ('marques',5,5,'Cinética',      'Catalisadores Industriais',            'Médio',      88,0.12,13,0.08),

  /* LIMA — Língua Inglesa (consistente, qualidade crescente) */
  _mkPQ('nicolas',1,1,'Reading',           'Interpretação de Texto Jornalístico',  'Médio',      65,0.44,22,0.40),
  _mkPQ('nicolas',1,2,'Vocabulary',        'Vocabulário em Contexto',              'Médio',      62,0.42,24,0.38),
  _mkPQ('nicolas',1,3,'Grammar',           'Present Perfect vs. Past Simple',      'Médio-alto', 52,0.40,26,0.36),
  _mkPQ('nicolas',1,4,'Reading',           'Inferência e Subtexto',                'Alto',       42,0.38,28,0.34),
  _mkPQ('nicolas',1,5,'Vocabulary',        'False Friends e Polissemia',           'Fácil',      76,0.26,17,0.22),
  _mkPQ('nicolas',2,1,'Reading',           'Gêneros Textuais em Inglês',           'Médio',      64,0.46,22,0.42),
  _mkPQ('nicolas',2,2,'Grammar',           'Reported Speech',                      'Médio',      60,0.44,24,0.40),
  _mkPQ('nicolas',2,3,'Vocabulary',        'Phrasal Verbs em Contexto',            'Médio-alto', 50,0.42,26,0.38),
  _mkPQ('nicolas',2,4,'Reading',           'Texto Publicitário e Propaganda',      'Médio',      66,0.40,22,0.36),
  _mkPQ('nicolas',2,5,'Grammar',           'Conditional Sentences (I, II, III)',   'Médio-alto', 48,0.38,26,0.34),
  _mkPQ('nicolas',3,1,'Reading',           'Intertextualidade e Referências',      'Médio-alto', 55,0.48,23,0.44),
  _mkPQ('nicolas',3,2,'Grammar',           'Passive Voice e Estruturas Formais',   'Médio',      62,0.46,22,0.42),
  _mkPQ('nicolas',3,3,'Vocabulary',        'Expressões Idiomáticas',               'Médio',      60,0.44,24,0.40),
  _mkPQ('nicolas',3,4,'Reading',           'Notícia e Artigo Jornalístico',        'Médio',      65,0.42,22,0.38),
  _mkPQ('nicolas',3,5,'Grammar',           'Modal Verbs e Nuances',                'Médio-alto', 50,0.40,25,0.36),
  _mkPQ('nicolas',4,1,'Reading',           'Análise Crítica de Texto Argumentat.', 'Médio-alto', 54,0.50,22,0.46),
  _mkPQ('nicolas',4,2,'Grammar',           'Subjunctive Mood e Inversões',         'Alto',       42,0.48,25,0.44),
  _mkPQ('nicolas',4,3,'Vocabulary',        'Collocations e Fixed Expressions',     'Médio',      62,0.46,22,0.42),
  _mkPQ('nicolas',4,4,'Reading',           'Argumentação e Persuasão',             'Médio',      64,0.44,22,0.40),
  _mkPQ('nicolas',4,5,'Grammar',           'Inversão e Estruturas de Ênfase',      'Alto',       40,0.42,26,0.38),
  _mkPQ('nicolas',5,1,'Reading',           'Análise Literária em Inglês',          'Médio-alto', 56,0.52,21,0.48),
  _mkPQ('nicolas',5,2,'Grammar',           'Perfect Tenses — Uso e Contraste',    'Médio',      62,0.50,22,0.46),
  _mkPQ('nicolas',5,3,'Vocabulary',        'Academic Word List em Contexto',       'Médio',      60,0.48,23,0.44),
  _mkPQ('nicolas',5,4,'Reading',           'Comparação Entre Textos',              'Médio-alto', 54,0.46,23,0.42),
  _mkPQ('nicolas',5,5,'Grammar',           'Discourse Markers e Coesão Textual',   'Médio',      65,0.44,22,0.40),
];

function getProfDados(key) {
  return PROF_DADOS.find(p => p.key === key) || PROF_DADOS[0];
}

function getProfQuestoesFiltradas(key, sim, comp, status) {
  return PROF_QUESTOES_DADOS.filter(q =>
    q.profKey === key &&
    (sim    === 'acumulado' || q.sim === parseInt(sim, 10)) &&
    (comp   === 'todas'     || q.comp === comp) &&
    (!status || status === 'todos' || q.status === status)
  );
}

function getProfResumo(key, sim, comp) {
  const qs = getProfQuestoesFiltradas(key, sim, comp);
  if (!qs.length) return { nqs: 0, efiMedio: 0, acertoMedio: 0, discMedio: 0, comps: 0, distFuncionais: 0, itensRevisao: 0 };
  const efiMedio       = Math.round(qs.reduce((s, q) => s + q.efi, 0) / qs.length);
  const acertoMedio    = Math.round(qs.reduce((s, q) => s + q.acerto, 0) / qs.length);
  const discMedio      = parseFloat((qs.reduce((s, q) => s + q.discriminante, 0) / qs.length).toFixed(2));
  const comps          = new Set(qs.map(q => q.comp)).size;
  const distFuncionais = Math.round(qs.filter(q => q.distPct >= 15 && q.distPct <= 35).length / qs.length * 100);
  const itensRevisao   = qs.filter(q => q.status === 'revisao').length;
  return { nqs: qs.length, efiMedio, acertoMedio, discMedio, comps, distFuncionais, itensRevisao };
}

function getProfEvoQI(key, comp) {
  return [1,2,3,4,5].map(sim => {
    const qs = PROF_QUESTOES_DADOS.filter(q =>
      q.profKey === key && q.sim === sim && (comp === 'todas' || q.comp === comp)
    );
    return qs.length ? Math.round(qs.reduce((s, q) => s + q.efi, 0) / qs.length) : 0;
  });
}

function getProfComps(key) {
  const qs = PROF_QUESTOES_DADOS.filter(q => q.profKey === key);
  return [...new Set(qs.map(q => q.comp))].sort();
}

/* Evolução do acerto médio por simulado (para Aba 3) */
function getProfEvoAcerto(key, comp) {
  return [1,2,3,4,5].map(sim => {
    const qs = PROF_QUESTOES_DADOS.filter(q =>
      q.profKey === key && q.sim === sim && (comp === 'todas' || q.comp === comp)
    );
    return qs.length ? parseFloat((qs.reduce((s, q) => s + q.acerto, 0) / qs.length).toFixed(1)) : 0;
  });
}

/* Média de acerto da rede por disciplina por simulado (linha de referência) */
function getRedeEvoAcerto(disc) {
  return [1,2,3,4,5].map(sim => {
    const qs = PROF_QUESTOES_DADOS.filter(q => {
      const p = PROF_DADOS.find(p2 => p2.key === q.profKey);
      return q.sim === sim && p && p.disc === disc;
    });
    return qs.length ? parseFloat((qs.reduce((s, q) => s + q.acerto, 0) / qs.length).toFixed(1)) : 0;
  });
}

/* Assuntos agrupados por componente com acerto médio e EFI médio */
function getProfAssuntos(key, sim, comp) {
  const qs = getProfQuestoesFiltradas(key, sim, comp);
  const byComp = {};
  qs.forEach(q => {
    if (!byComp[q.comp]) byComp[q.comp] = { comp: q.comp, acertos: [], efis: [], count: 0 };
    byComp[q.comp].acertos.push(q.acerto);
    byComp[q.comp].efis.push(q.efi);
    byComp[q.comp].count++;
  });
  return Object.values(byComp).map(c => ({
    comp: c.comp,
    acertoMedio: Math.round(c.acertos.reduce((s, v) => s + v, 0) / c.acertos.length),
    efiMedio:    Math.round(c.efis.reduce((s, v) => s + v, 0)    / c.efis.length),
    count:       c.count,
  })).sort((a, b) => b.acertoMedio - a.acertoMedio);
}

/* Acerto médio da frente neste simulado vs anterior (para variação) */
function getProfAcertoVsAnterior(key, comp, sim) {
  if (sim === 'acumulado' || parseInt(sim, 10) <= 1) return null;
  const simN = parseInt(sim, 10);
  const qs1 = PROF_QUESTOES_DADOS.filter(q => q.profKey === key && q.sim === simN - 1 && (comp === 'todas' || q.comp === comp));
  const qs2 = PROF_QUESTOES_DADOS.filter(q => q.profKey === key && q.sim === simN     && (comp === 'todas' || q.comp === comp));
  if (!qs1.length || !qs2.length) return null;
  const a1 = qs1.reduce((s, q) => s + q.acerto, 0) / qs1.length;
  const a2 = qs2.reduce((s, q) => s + q.acerto, 0) / qs2.length;
  return parseFloat((a2 - a1).toFixed(1));
}

/* Questões com maior impacto diagnóstico (alta discriminação + acerto moderado) */
function getProfQuestoesImpacto(key, sim, comp) {
  const qs = getProfQuestoesFiltradas(key, sim, comp);
  return qs
    .filter(q => q.discriminante >= 0.28)
    .sort((a, b) => (b.discriminante * 0.6 + b.efi * 0.004) - (a.discriminante * 0.6 + a.efi * 0.004))
    .slice(0, 6);
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
  sim4 → fragilidade principal em Língua Inglesa (Reading, Grammar)
  sim5 → prova equilibrada; Eletromagnetismo ainda crítico em Física
*/

/* Per-questão offset de variação determinística */
const _SIM_Q_OFFSETS = [2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1,2,-3,1,-2,3,-1];

/* Fator de acerto por disciplina por ciclo ITA (4 disciplinas) */
const _SIM_DISC_FACTORS = {
  sim1: { 'Matemática':1.00, 'Física':1.00, 'Química':1.00, 'Língua Inglesa':1.00 }, // Ciclo 1 = dados reais do banco
  sim2: { 'Matemática':0.90, 'Física':0.88, 'Química':0.92, 'Língua Inglesa':0.95 },
  sim3: { 'Matemática':0.92, 'Física':0.91, 'Química':0.86, 'Língua Inglesa':0.93 },
  sim4: { 'Matemática':0.88, 'Física':0.94, 'Química':0.90, 'Língua Inglesa':0.88 },
  sim5: { 'Matemática':0.95, 'Física':0.94, 'Química':0.96, 'Língua Inglesa':0.97 },
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

/* Temas pedagógicos por ciclo ITA — 48 entradas: 12 Mat · 12 Fís · 12 Quím · 12 Ingl */
const SIM_TOPIC_SETS = {
  /* Ciclo 1 = dados reais do banco (QUESTOES_RAW). O topicSet espelha exatamente o base. */
  sim1: QUESTOES_RAW.map(q => ({ disc: q.disc, comp: q.comp, assunto: q.assunto, diff: q.diff })),

  /* ── Ciclo 2 ── */
  sim2: [
    // idx 0-11 MATEMÁTICA
    { disc:'Matemática',    comp:'Álgebra',            assunto:'Polinômios — Fatoração e Raízes Racionais',       diff:'Médio'      },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Combinações com Repetição',                       diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Polígonos Regulares — Áreas e Apóteamas',         diff:'Médio'      },
    { disc:'Matemática',    comp:'Trigonometria',       assunto:'Lei dos Senos e dos Cossenos',                    diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Exponencial — Modelagem e Crescimento',    diff:'Médio'      },
    { disc:'Matemática',    comp:'Geometria Espacial',  assunto:'Poliedros de Platão e Teorema de Euler',          diff:'Médio'      },
    { disc:'Matemática',    comp:'Probabilidade',       assunto:'Eventos Complementares e Exclusivos',             diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Binômio de Newton e Triângulo de Pascal',         diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'PA — Interpolação e Soma de Termos',              diff:'Médio'      },
    { disc:'Matemática',    comp:'Geometria Analítica', assunto:'Cônicas — Parábola, Foco e Diretriz',             diff:'Alto'       },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Modular — Equações e Gráficos',            diff:'Médio'      },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Determinantes e Regra de Cramer',                 diff:'Médio'      },
    // idx 12-23 FÍSICA
    { disc:'Física',        comp:'Mecânica',            assunto:'MCU — Aceleração Centrípeta e Força',             diff:'Médio'      },
    { disc:'Física',        comp:'Mecânica',            assunto:'Equilíbrio de Torques e Estática de Corpos',      diff:'Médio-alto' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Calorimetria — Calor Específico e Mudança de Fase',diff:'Médio'     },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Efeito Doppler — Fontes e Observadores',          diff:'Médio-alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Trabalho e Energia Potencial Gravitacional',      diff:'Médio'      },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Lei de Ampère e Campo de Solenóides',             diff:'Médio-alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Colisões Elásticas e Inelásticas',                diff:'Médio-alto' },
    { disc:'Física',        comp:'Óptica',              assunto:'Espelhos Esféricos — Imagem e Foco',              diff:'Médio'      },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Ciclos Termodinâmicos — Eficiência de Carnot',    diff:'Alto'       },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Circuitos RC — Carga e Descarga de Capacitores',  diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Lançamento Oblíquo e Parabolismo',                diff:'Médio'      },
    { disc:'Física',        comp:'Física Moderna',      assunto:'Radioatividade — Decaimento e Meia-vida',         diff:'Médio-alto' },
    // idx 24-35 QUÍMICA
    { disc:'Química',       comp:'Estequiometria',      assunto:'Pureza, Rendimento e Mistura de Reagentes',       diff:'Médio'      },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Calor de Neutralização e Entalpia Padrão',        diff:'Médio-alto' },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Eletrólise Ígnea e Pilhas Comerciais',            diff:'Médio'      },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Corrosão Eletroquímica e Proteção Catódica',      diff:'Médio'      },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Funções Orgânicas — Nomenclatura IUPAC',          diff:'Alto'       },
    { disc:'Química',       comp:'Soluções',            assunto:'Ebulioscopia e Tonoscopia — Cálculos',            diff:'Médio'      },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Catálise — Energia de Ativação e Mecanismo',      diff:'Alto'       },
    { disc:'Química',       comp:'Equilíbrio Químico',  assunto:'pH e pOH — Força de Ácidos e Bases',              diff:'Alto'       },
    { disc:'Química',       comp:'Estequiometria',      assunto:'Titulação Ácido-Base — Cálculo de Ponto Equiv.',  diff:'Médio'      },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Reações de Eliminação e Desidratação',            diff:'Médio-alto' },
    { disc:'Química',       comp:'Gases',               assunto:'Misturas Gasosas — Pressão Parcial de Dalton',    diff:'Médio'      },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Diagrama de Born-Haber e Energia Reticular',      diff:'Médio-alto' },
    // idx 36-47 LÍNGUA INGLESA
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Genre Recognition and Register',                  diff:'Fácil'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Academic Word List in Context',                   diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Reported Speech and Indirect Questions',          diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Collocations and Fixed Expressions',              diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:"Author's Tone and Attitude",                      diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Relative Clauses and Defining Appositives',       diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Synonymy and Near-synonymy',                      diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Implicit vs. Explicit Information',               diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Verb Tenses — Perfect Aspect and Aspect Pairs',   diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Antonyms and Gradable Adjectives',                diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Making Inferences from Context',                  diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Complex Sentences and Subordination Types',       diff:'Médio-alto' },
  ],

  /* ── Ciclo 3 ── */
  sim3: [
    // idx 0-11 MATEMÁTICA
    { disc:'Matemática',    comp:'Álgebra',            assunto:'Equações e Sistemas de Grau Superior',             diff:'Alto'       },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Permutações com Restrições',                       diff:'Alto'       },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Semelhança de Triângulos e Razão de Semelhança',   diff:'Médio'      },
    { disc:'Matemática',    comp:'Trigonometria',       assunto:'Funções Trigonométricas — Gráficos e Período',     diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Quadrática — Parábola, Vértice e Zeros',    diff:'Médio'      },
    { disc:'Matemática',    comp:'Geometria Espacial',  assunto:'Cone e Esfera — Volume, Área e Secções',           diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Probabilidade',       assunto:'Probabilidade Condicional — Teorema de Bayes',     diff:'Alto'       },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Números Complexos — Forma Trigonométrica e Moivre',diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'PG — Soma, Produto e Aplicações Financeiras',      diff:'Médio'      },
    { disc:'Matemática',    comp:'Geometria Analítica', assunto:'Posição Relativa de Retas e Circunferências',      diff:'Médio'      },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Exponencial e Logarítmica — Inversa',       diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Polinômios — Teorema do Resto e Raízes',           diff:'Médio'      },
    // idx 12-23 FÍSICA
    { disc:'Física',        comp:'Mecânica',            assunto:'Dinâmica de Rotação — Torque e Inércia',           diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Gravitação Universal — Órbitas e Kepler',          diff:'Médio-alto' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Dilatação Térmica Linear e Volumétrica',           diff:'Médio'      },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Ondas Estacionárias e Ressonância',                diff:'Médio-alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Oscilações — Pêndulo Simples e Mola',              diff:'Médio'      },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Transformadores e Transmissão de Energia Elétrica',diff:'Médio'      },
    { disc:'Física',        comp:'Mecânica',            assunto:'Centro de Massa e Equilíbrio de Sistemas',         diff:'Médio'      },
    { disc:'Física',        comp:'Óptica',              assunto:'Lentes Esféricas — Imagem e Vergência',            diff:'Médio-alto' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Equação de Estado dos Gases — Clapeyron',          diff:'Médio'      },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Ondas Eletromagnéticas e Espectro',                diff:'Médio-alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Fluidos — Equação de Bernoulli e Continuidade',    diff:'Alto'       },
    { disc:'Física',        comp:'Física Moderna',      assunto:'Relatividade Especial — Dilatação e Contração',    diff:'Alto'       },
    // idx 24-35 QUÍMICA
    { disc:'Química',       comp:'Estequiometria',      assunto:'Estequiometria em Soluções — Mol e Concentração',  diff:'Médio'      },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia de Combustão e Formação',                 diff:'Médio'      },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Oxirredução — Semi-reações e Número de Oxidação',  diff:'Médio'      },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Eletrólise Aquosa — Cátodo, Ânodo e Depósito',     diff:'Médio-alto' },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Polímeros — Adição e Condensação',                 diff:'Alto'       },
    { disc:'Química',       comp:'Soluções',            assunto:'Osmoscopia e Pressão Osmótica',                    diff:'Médio-alto' },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Leis de Velocidade — Ordem 0, 1 e 2',              diff:'Alto'       },
    { disc:'Química',       comp:'Equilíbrio Químico',  assunto:'Deslocamento de Equilíbrio — Le Chatelier',        diff:'Médio-alto' },
    { disc:'Química',       comp:'Estequiometria',      assunto:'Solubilidade e Produto de Solubilidade Kps',       diff:'Médio-alto' },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Mecanismos de Reação — Intermediários e Estereoquímica',diff:'Alto' },
    { disc:'Química',       comp:'Gases',               assunto:'Comportamento Real dos Gases — Fatores de Desvio', diff:'Médio'      },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Ciclos Termoquímicos e Cálculo de Entalpia',        diff:'Médio-alto' },
    // idx 36-47 LÍNGUA INGLESA
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Critical Reading — Evaluating Arguments',          diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Word Formation — Prefixes and Suffixes',           diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Conditional Sentences — Types 1, 2 and 3',         diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Phrasal Verbs in Context',                         diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Reading Scientific Texts — Purpose and Method',    diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Inversion and Emphasis Structures',                diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Connotation and Register',                         diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Comparing Perspectives in Multiple Texts',         diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Nominalization and Abstract Nouns',                diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Technical Vocabulary in Science Contexts',         diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Evaluating Reliability and Bias in Texts',         diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Ellipsis and Substitution in Discourse',           diff:'Médio-alto' },
  ],

  /* ── Ciclo 4 ── */
  sim4: [
    // idx 0-11 MATEMÁTICA
    { disc:'Matemática',    comp:'Álgebra',            assunto:'Inequações e Sistemas de Inequações',               diff:'Médio'      },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Princípio da Inclusão-Exclusão',                    diff:'Alto'       },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Círculo Inscrito e Circunscrito em Triângulos',     diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Trigonometria',       assunto:'Relações Trigonométricas no Triângulo Oblíquo',     diff:'Médio'      },
    { disc:'Matemática',    comp:'Funções',             assunto:'Composição e Inversa — Domínio e Imagem',           diff:'Médio'      },
    { disc:'Matemática',    comp:'Geometria Espacial',  assunto:'Prismas e Pirâmides — Volume e Área Lateral',       diff:'Médio'      },
    { disc:'Matemática',    comp:'Probabilidade',       assunto:'Distribuição Binomial — Variáveis Aleatórias',      diff:'Alto'       },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Progressões — Somas Telescópicas',                  diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Progressões',         assunto:'Sequências Recursivas e Termos Gerais',             diff:'Alto'       },
    { disc:'Matemática',    comp:'Geometria Analítica', assunto:'Distância Ponto-Reta e Área de Triângulo',          diff:'Médio'      },
    { disc:'Matemática',    comp:'Funções',             assunto:'Função Trigonométrica — Transformações Gráficas',   diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Sistemas Lineares — Escalonamento de Gauss',        diff:'Médio'      },
    // idx 12-23 FÍSICA
    { disc:'Física',        comp:'Mecânica',            assunto:'MRUV — Gráficos e Equações Horárias',               diff:'Médio'      },
    { disc:'Física',        comp:'Mecânica',            assunto:'Força de Atrito Estática e Cinética',               diff:'Médio'      },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'2ª Lei da Termodinâmica — Irreversibilidade',       diff:'Alto'       },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Polarização da Luz — Filtros e Ângulo de Brewster', diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Momento de Inércia — Objetos Estendidos',           diff:'Alto'       },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Circuitos RLC em Corrente Alternada',               diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Hidrodinâmica — Viscosidade e Escoamento',          diff:'Médio-alto' },
    { disc:'Física',        comp:'Óptica',              assunto:'Instrumentos Ópticos — Microscópio e Telescópio',   diff:'Médio'      },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Transferência de Calor — Condução, Convecção, Radiação',diff:'Médio'  },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Força de Lorentz — Campo Magnético e Correntes',    diff:'Médio-alto' },
    { disc:'Física',        comp:'Mecânica',            assunto:'Colisão Bidimensional e Conservação de Momento',    diff:'Alto'       },
    { disc:'Física',        comp:'Física Moderna',      assunto:'Modelo de Bohr — Espectro do Hidrogênio',           diff:'Médio-alto' },
    // idx 24-35 QUÍMICA
    { disc:'Química',       comp:'Estequiometria',      assunto:'Estequiometria em Reações Gasosas',                 diff:'Médio'      },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Variação de Entalpia — Método Indireto de Hess',    diff:'Médio-alto' },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Potencial de Célula Padrão e DDP',                  diff:'Médio'      },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Eletrodeposição e Galvanoplastia',                  diff:'Médio'      },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Compostos Aromáticos — Benzeno e Derivados',        diff:'Alto'       },
    { disc:'Química',       comp:'Soluções',            assunto:'Concentração Percentual em Massa e Volume',         diff:'Médio'      },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Equilíbrio Dinâmico e Grau de Equilíbrio',          diff:'Alto'       },
    { disc:'Química',       comp:'Equilíbrio Químico',  assunto:'Tamponamento e Soluções Tampão',                    diff:'Alto'       },
    { disc:'Química',       comp:'Estequiometria',      assunto:'Análise Volumétrica — Gravimetria e Titulometria',  diff:'Médio-alto' },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Isomeria Geométrica e Conformacional',              diff:'Médio-alto' },
    { disc:'Química',       comp:'Gases',               assunto:'Efusão e Difusão — Lei de Graham',                  diff:'Médio'      },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Capacidade Calorífica e Calor de Combustão',        diff:'Médio'      },
    // idx 36-47 LÍNGUA INGLESA
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Reading for Gist — Skimming and Scanning',          diff:'Fácil'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Semantic Prosody and Discourse Meaning',             diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Cleft Sentences and Focus Structures',              diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Lexical Cohesion — Chains and Repetition',          diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Evaluating Evidence in Academic Texts',             diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Reduced Clauses and Participle Phrases',            diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Derivatives and Morphological Analysis',            diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Referential Chains and Pronoun Resolution',         diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Quantifiers and Determiners in Context',            diff:'Médio'      },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Hedging Language in Academic Writing',              diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Synthesizing Information Across Paragraphs',        diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Aspect and Temporal Reference in Narrative',        diff:'Médio'      },
  ],

  /* ── Ciclo 5 ── */
  sim5: [
    // idx 0-11 MATEMÁTICA
    { disc:'Matemática',    comp:'Álgebra',            assunto:'Números Reais — Supremo, Ínfimo e Completude',       diff:'Alto'       },
    { disc:'Matemática',    comp:'Combinatória',        assunto:'Contagem por Complemento e Análise de Casos',        diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Geometria Plana',     assunto:'Áreas de Figuras Compostas — Subtração e Adição',    diff:'Médio'      },
    { disc:'Matemática',    comp:'Trigonometria',       assunto:'Adição e Subtração de Arcos — Fórmulas Duplas',      diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Funções',             assunto:'Análise do Comportamento de Funções — Monotonia',    diff:'Médio'      },
    { disc:'Matemática',    comp:'Geometria Espacial',  assunto:'Troncos de Pirâmide e Cone — Volume e Frustum',      diff:'Alto'       },
    { disc:'Matemática',    comp:'Probabilidade',       assunto:'Esperança e Variância de Variáveis Discretas',       diff:'Alto'       },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Sequências e Recorrências Lineares',                  diff:'Alto'       },
    { disc:'Matemática',    comp:'Progressões',         assunto:'Soma de Séries Telescópicas e Parciais',              diff:'Médio-alto' },
    { disc:'Matemática',    comp:'Geometria Analítica', assunto:'Cônicas — Hipérbole, Assíntotas e Focos',             diff:'Alto'       },
    { disc:'Matemática',    comp:'Funções',             assunto:'Funções Implícitas e Relações Inversas',              diff:'Alto'       },
    { disc:'Matemática',    comp:'Álgebra',             assunto:'Espaços Vetoriais — Base, Dimensão e Transformações', diff:'Alto'       },
    // idx 12-23 FÍSICA
    { disc:'Física',        comp:'Mecânica',            assunto:'Dinâmica Rotacional — Rolamento sem Deslizamento',   diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Gravitação — Campo Gravitacional e Energia Orbital',  diff:'Alto'       },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Entropia e 2ª Lei — Máquinas e Refrigeradores',       diff:'Alto'       },
    { disc:'Física',        comp:'Ondulatória',         assunto:'Batimentos e Superposição de Ondas',                  diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Colisões Oblíquas — Conservação 2D',                  diff:'Alto'       },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Indução Eletromagnética — Geração e Aplicações',      diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Cadeias de Polias e Planos Inclinados Compostos',      diff:'Médio-alto' },
    { disc:'Física',        comp:'Óptica',              assunto:'Dispersão da Luz — Prismas e Fenômenos',              diff:'Médio-alto' },
    { disc:'Física',        comp:'Termodinâmica',       assunto:'Ciclo de Brayton — Turbinas a Gás',                   diff:'Alto'       },
    { disc:'Física',        comp:'Eletromagnetismo',    assunto:'Energia Eletrostática — Capacitores em Sistemas',     diff:'Alto'       },
    { disc:'Física',        comp:'Mecânica',            assunto:'Tensão Superficial e Capilaridade',                   diff:'Médio'      },
    { disc:'Física',        comp:'Física Moderna',      assunto:'Mecânica Quântica — Dualidade e Princípio de Heisenberg',diff:'Alto'   },
    // idx 24-35 QUÍMICA
    { disc:'Química',       comp:'Estequiometria',      assunto:'Cálculo em Sistemas Reacionais Complexos',            diff:'Alto'       },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia de Dissolução e Hidratação',                  diff:'Médio-alto' },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Equação de Nernst e Concentração de Células',          diff:'Alto'       },
    { disc:'Química',       comp:'Eletroquímica',       assunto:'Análise Eletroquímica — pH e Potenciometria',          diff:'Médio-alto' },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Síntese Orgânica em Múltiplos Passos',                 diff:'Alto'       },
    { disc:'Química',       comp:'Soluções',            assunto:'Soluções Ideais e Desvios — Lei de Raoult',            diff:'Alto'       },
    { disc:'Química',       comp:'Cinética Química',    assunto:'Energia de Ativação — Equação de Arrhenius',           diff:'Alto'       },
    { disc:'Química',       comp:'Equilíbrio Químico',  assunto:'Equilíbrio Heterogêneo — Reações com Sólidos',         diff:'Alto'       },
    { disc:'Química',       comp:'Estequiometria',      assunto:'Análise por Via Úmida — Volumetria Complexa',          diff:'Alto'       },
    { disc:'Química',       comp:'Química Orgânica',    assunto:'Retrossíntese e Planejamento de Rota Sintética',        diff:'Alto'       },
    { disc:'Química',       comp:'Gases',               assunto:'Velocidade Molecular — Distribuição de Maxwell-Boltzmann',diff:'Alto'   },
    { disc:'Química',       comp:'Termoquímica',        assunto:'Entalpia de Rede e Ciclo de Born-Haber Completo',       diff:'Alto'       },
    // idx 36-47 LÍNGUA INGLESA
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Rhetorical Analysis — Structure and Persuasion',       diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Metaphor and Figurative Language in Texts',             diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Subjunctive and Unreal Conditionals in Academic Use',   diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Discipline-specific Vocabulary — Science and Tech',     diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Cross-textual Synthesis and Comparison',                diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Advanced Nominal Groups and Modification',              diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Evaluative Language and Stance Marking',                diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Reading Long-form Arguments — Macro-structure',         diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Tense Shift and Narrative Perspective',                 diff:'Médio-alto' },
    { disc:'Língua Inglesa',comp:'Vocabulary',          assunto:'Nuance in Lexical Choice — Precision and Register',     diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Reading',             assunto:'Evaluating Experimental Methodology in Reports',        diff:'Alto'       },
    { disc:'Língua Inglesa',comp:'Grammar',             assunto:'Information Packaging — Theme and Rheme',               diff:'Alto'       },
  ],
};
function getQuestoesForSim(simId) {
  const discFactors = _SIM_DISC_FACTORS[simId] || _SIM_DISC_FACTORS.sim5;
  const shifts      = _GAB_SHIFT_PATTERNS[simId] || _GAB_SHIFT_PATTERNS.sim5;
  const topicSet    = SIM_TOPIC_SETS[simId]      || SIM_TOPIC_SETS.sim5;
  return QUESTOES.map((q, i) => {
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
const SIM_EVO_LABELS = ['Ciclo 1', 'Ciclo 2', 'Ciclo 3', 'Ciclo 4', 'Ciclo 5'];

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

/* ═══════════════════════════════════════════════════════════
   ESCOLAS_6 — Sistema de dados das 6 escolas da rede Arco
   Usado exclusivamente pela página Escolas. Determinístico.
═══════════════════════════════════════════════════════════ */

const REDE_6_DISC_SIM = {
  'Matemática':     [49.8, 52.4, 54.7, 56.8, 58.6],
  'Física':         [37.2, 39.4, 41.1, 42.5, 43.8],
  'Química':        [48.5, 50.8, 53.2, 55.4, 57.0],
  'Língua Inglesa': [53.8, 56.2, 58.9, 61.1, 63.3],
};

const REDE_6_MEDIA   = [43.5, 45.1, 47.8, 50.2, 53.6];
const DISCIPLINAS_6  = ['Matemática','Física','Química','Língua Inglesa'];

const ESCOLAS_6 = [
  { key:'a', nome:'Escola A', media:[48.2,51.4,54.1,57.3,62.8], presenca:[88,90,91,93,94], forte:'Matemática',    fraco:'Física',     alunosAtencao:12, compsCriticos:1, tag:'Referência',         tagClass:'above', var:+5.5, rankEvo:[3,3,2,1,1] },
  { key:'b', nome:'Escola B', media:[43.2,46.8,50.1,53.9,60.1], presenca:[84,86,88,89,91], forte:'Física',        fraco:'Matemática', alunosAtencao:18, compsCriticos:1, tag:'Em crescimento',      tagClass:'above', var:+6.2, rankEvo:[6,5,4,3,2] },
  { key:'c', nome:'Escola C', media:[47.1,49.2,52.4,55.8,58.4], presenca:[82,84,86,87,89], forte:'Língua Inglesa',fraco:'Química',    alunosAtencao:21, compsCriticos:2, tag:'Estável',             tagClass:'avg',   var:+2.6, rankEvo:[4,4,3,4,3] },
  { key:'d', nome:'Escola D', media:[50.1,51.4,53.7,55.9,57.2], presenca:[81,82,83,84,88], forte:'Língua Inglesa',fraco:'Física',     alunosAtencao:16, compsCriticos:2, tag:'Estável',             tagClass:'avg',   var:+1.3, rankEvo:[2,2,1,2,4] },
  { key:'e', nome:'Escola E', media:[45.3,47.8,50.2,53.4,55.6], presenca:[78,77,76,75,74], forte:'Matemática',   fraco:'Física',     alunosAtencao:28, compsCriticos:2, tag:'Presença em queda',   tagClass:'att',   var:+2.2, rankEvo:[5,6,5,5,5] },
  { key:'f', nome:'Escola F', media:[49.2,50.4,52.3,54.8,54.1], presenca:[80,79,78,76,74], forte:'Língua Inglesa',fraco:'Matemática', alunosAtencao:34, compsCriticos:3, tag:'Atenção',             tagClass:'att',   var:-0.7, rankEvo:[1,1,2,2,6] },
];

const ESCOLA_6_DISCS = {
  a:{ 'Matemática':[62.1,65.3,68.7,71.2,75.4],'Física':[38.2,41.4,44.8,48.3,54.6],'Química':[55.4,58.2,61.1,63.8,66.2],'Língua Inglesa':[68.1,70.4,72.8,74.9,77.2] },
  b:{ 'Física':[50.2,54.1,58.4,62.7,68.3],'Química':[58.3,61.2,64.1,67.4,70.8],'Matemática':[55.4,58.1,61.2,64.3,68.1],'Língua Inglesa':[60.2,62.4,64.7,66.8,68.9] },
  c:{ 'Língua Inglesa':[72.1,74.3,76.8,78.9,80.4],'Matemática':[52.3,54.7,57.1,60.2,63.4],'Física':[40.1,43.2,46.4,49.3,53.1],'Química':[48.3,50.4,52.1,53.8,55.9] },
  d:{ 'Língua Inglesa':[62.4,64.1,66.3,68.2,70.1],'Matemática':[56.2,58.4,60.7,62.9,64.8],'Química':[56.4,58.7,60.9,62.8,64.7],'Física':[34.2,36.4,38.7,40.8,43.4] },
  e:{ 'Matemática':[58.4,61.2,64.3,67.1,70.8],'Física':[40.3,42.7,44.9,47.8,51.4],'Química':[52.1,54.4,56.8,58.9,61.2],'Língua Inglesa':[58.3,60.4,62.7,64.8,66.9] },
  f:{ 'Língua Inglesa':[64.2,66.4,68.1,70.3,69.2],'Química':[55.4,57.2,59.1,61.3,59.8],'Matemática':[46.3,48.2,50.4,52.7,50.8],'Física':[36.1,38.4,40.2,42.6,40.4] },
};

const ESCOLA_6_COMP = {
  a:{
    'Matemática':    [{comp:'Funções',acerto:80,rede:64},{comp:'Álgebra',acerto:76,rede:61},{comp:'Geometria Plana',acerto:72,rede:58},{comp:'Estatística',acerto:74,rede:60},{comp:'Combinatória',acerto:68,rede:52},{comp:'Progressões',acerto:78,rede:64},{comp:'Geometria Esp.',acerto:66,rede:54}],
    'Física':        [{comp:'Mecânica',acerto:58,rede:52},{comp:'Eletromagnetismo',acerto:42,rede:36},{comp:'Termodinâmica',acerto:60,rede:48},{comp:'Óptica',acerto:72,rede:60},{comp:'Ondulatória',acerto:54,rede:48},{comp:'Física Moderna',acerto:38,rede:30}],
    'Química':       [{comp:'Estequiometria',acerto:68,rede:56},{comp:'Termoquímica',acerto:52,rede:38},{comp:'Eletroquímica',acerto:70,rede:60},{comp:'Orgânica',acerto:64,rede:52},{comp:'Cinética Química',acerto:62,rede:50},{comp:'Gases',acerto:72,rede:62}],
    'Língua Inglesa':[{comp:'Reading',acerto:80,rede:70},{comp:'Vocabulary',acerto:76,rede:66},{comp:'Grammar',acerto:72,rede:60}],
    'Linguagens':    [{comp:'Interpretação',acerto:72,rede:62},{comp:'Literatura',acerto:62,rede:52},{comp:'Gramática',acerto:70,rede:60}],
    'C. Humanas':    [{comp:'História',acerto:62,rede:55},{comp:'Geografia',acerto:64,rede:58},{comp:'Filosofia',acerto:52,rede:46},{comp:'Sociologia',acerto:56,rede:48}],
  },
  b:{
    'Física':        [{comp:'Mecânica',acerto:72,rede:52},{comp:'Eletromagnetismo',acerto:62,rede:36},{comp:'Termodinâmica',acerto:68,rede:48},{comp:'Óptica',acerto:74,rede:60},{comp:'Ondulatória',acerto:66,rede:48},{comp:'Física Moderna',acerto:58,rede:30}],
    'Matemática':    [{comp:'Funções',acerto:70,rede:64},{comp:'Álgebra',acerto:66,rede:61},{comp:'Geometria Plana',acerto:64,rede:58},{comp:'Estatística',acerto:62,rede:60},{comp:'Combinatória',acerto:58,rede:52},{comp:'Progressões',acerto:68,rede:64}],
    'Química':       [{comp:'Estequiometria',acerto:72,rede:56},{comp:'Termoquímica',acerto:66,rede:38},{comp:'Eletroquímica',acerto:74,rede:60},{comp:'Orgânica',acerto:68,rede:52},{comp:'Cinética Química',acerto:70,rede:50},{comp:'Gases',acerto:76,rede:62}],
    'Língua Inglesa':[{comp:'Reading',acerto:72,rede:70},{comp:'Vocabulary',acerto:68,rede:66},{comp:'Grammar',acerto:60,rede:60}],
    'Linguagens':    [{comp:'Interpretação',acerto:56,rede:62},{comp:'Literatura',acerto:46,rede:52},{comp:'Gramática',acerto:54,rede:60}],
    'C. Humanas':    [{comp:'História',acerto:52,rede:55},{comp:'Geografia',acerto:54,rede:58},{comp:'Filosofia',acerto:44,rede:46},{comp:'Sociologia',acerto:48,rede:48}],
  },
  c:{
    'Língua Inglesa':[{comp:'Reading',acerto:84,rede:70},{comp:'Vocabulary',acerto:80,rede:66},{comp:'Grammar',acerto:74,rede:60}],
    'Química':       [{comp:'Estequiometria',acerto:58,rede:56},{comp:'Termoquímica',acerto:44,rede:38},{comp:'Eletroquímica',acerto:62,rede:60},{comp:'Orgânica',acerto:52,rede:52},{comp:'Cinética Química',acerto:48,rede:50},{comp:'Gases',acerto:60,rede:62}],
    'C. Humanas':    [{comp:'História',acerto:68,rede:55},{comp:'Geografia',acerto:70,rede:58},{comp:'Filosofia',acerto:62,rede:46},{comp:'Sociologia',acerto:66,rede:48}],
    'Matemática':    [{comp:'Funções',acerto:66,rede:64},{comp:'Álgebra',acerto:62,rede:61},{comp:'Geometria Plana',acerto:60,rede:58},{comp:'Estatística',acerto:58,rede:60},{comp:'Combinatória',acerto:54,rede:52},{comp:'Progressões',acerto:64,rede:64}],
    'Física':        [{comp:'Mecânica',acerto:56,rede:52},{comp:'Eletromagnetismo',acerto:44,rede:36},{comp:'Termodinâmica',acerto:58,rede:48},{comp:'Óptica',acerto:66,rede:60},{comp:'Ondulatória',acerto:50,rede:48},{comp:'Física Moderna',acerto:34,rede:30}],
    'Linguagens':    [{comp:'Interpretação',acerto:68,rede:62},{comp:'Literatura',acerto:58,rede:52},{comp:'Gramática',acerto:66,rede:60}],
  },
  d:{
    'Linguagens':    [{comp:'Interpretação',acerto:76,rede:62},{comp:'Literatura',acerto:68,rede:52},{comp:'Gramática',acerto:74,rede:60}],
    'C. Humanas':    [{comp:'História',acerto:70,rede:55},{comp:'Geografia',acerto:72,rede:58},{comp:'Filosofia',acerto:64,rede:46},{comp:'Sociologia',acerto:68,rede:48}],
    'Física':        [{comp:'Mecânica',acerto:46,rede:52},{comp:'Eletromagnetismo',acerto:30,rede:36},{comp:'Termodinâmica',acerto:48,rede:48},{comp:'Óptica',acerto:56,rede:60},{comp:'Ondulatória',acerto:42,rede:48},{comp:'Física Moderna',acerto:28,rede:30}],
    'Matemática':    [{comp:'Funções',acerto:66,rede:64},{comp:'Álgebra',acerto:64,rede:61},{comp:'Geometria Plana',acerto:62,rede:58},{comp:'Estatística',acerto:64,rede:60},{comp:'Combinatória',acerto:56,rede:52},{comp:'Progressões',acerto:68,rede:64}],
    'Língua Inglesa':[{comp:'Reading',acerto:74,rede:70},{comp:'Vocabulary',acerto:70,rede:66},{comp:'Grammar',acerto:64,rede:60}],
    'Química':       [{comp:'Estequiometria',acerto:66,rede:56},{comp:'Termoquímica',acerto:52,rede:38},{comp:'Eletroquímica',acerto:70,rede:60},{comp:'Orgânica',acerto:64,rede:52},{comp:'Cinética Química',acerto:62,rede:50},{comp:'Gases',acerto:68,rede:62}],
  },
  e:{
    'Matemática':    [{comp:'Funções',acerto:74,rede:64},{comp:'Álgebra',acerto:70,rede:61},{comp:'Geometria Plana',acerto:68,rede:58},{comp:'Estatística',acerto:66,rede:60},{comp:'Combinatória',acerto:62,rede:52},{comp:'Progressões',acerto:72,rede:64}],
    'Física':        [{comp:'Mecânica',acerto:54,rede:52},{comp:'Eletromagnetismo',acerto:40,rede:36},{comp:'Termodinâmica',acerto:56,rede:48},{comp:'Óptica',acerto:64,rede:60},{comp:'Ondulatória',acerto:50,rede:48},{comp:'Física Moderna',acerto:32,rede:30}],
    'C. Humanas':    [{comp:'História',acerto:52,rede:55},{comp:'Geografia',acerto:54,rede:58},{comp:'Filosofia',acerto:44,rede:46},{comp:'Sociologia',acerto:48,rede:48}],
    'Língua Inglesa':[{comp:'Reading',acerto:70,rede:70},{comp:'Vocabulary',acerto:66,rede:66},{comp:'Grammar',acerto:58,rede:60}],
    'Linguagens':    [{comp:'Interpretação',acerto:68,rede:62},{comp:'Literatura',acerto:60,rede:52},{comp:'Gramática',acerto:66,rede:60}],
    'Química':       [{comp:'Estequiometria',acerto:62,rede:56},{comp:'Termoquímica',acerto:50,rede:38},{comp:'Eletroquímica',acerto:64,rede:60},{comp:'Orgânica',acerto:58,rede:52},{comp:'Cinética Química',acerto:58,rede:50},{comp:'Gases',acerto:64,rede:62}],
  },
  f:{
    'Linguagens':    [{comp:'Interpretação',acerto:68,rede:62},{comp:'Literatura',acerto:58,rede:52},{comp:'Gramática',acerto:66,rede:60}],
    'Língua Inglesa':[{comp:'Reading',acerto:74,rede:70},{comp:'Vocabulary',acerto:70,rede:66},{comp:'Grammar',acerto:62,rede:60}],
    'Química':       [{comp:'Estequiometria',acerto:60,rede:56},{comp:'Termoquímica',acerto:46,rede:38},{comp:'Eletroquímica',acerto:62,rede:60},{comp:'Orgânica',acerto:56,rede:52},{comp:'Cinética Química',acerto:54,rede:50},{comp:'Gases',acerto:60,rede:62}],
    'C. Humanas':    [{comp:'História',acerto:56,rede:55},{comp:'Geografia',acerto:58,rede:58},{comp:'Filosofia',acerto:48,rede:46},{comp:'Sociologia',acerto:52,rede:48}],
    'Matemática':    [{comp:'Funções',acerto:52,rede:64},{comp:'Álgebra',acerto:48,rede:61},{comp:'Geometria Plana',acerto:50,rede:58},{comp:'Estatística',acerto:48,rede:60},{comp:'Combinatória',acerto:42,rede:52},{comp:'Progressões',acerto:54,rede:64}],
    'Física':        [{comp:'Mecânica',acerto:44,rede:52},{comp:'Eletromagnetismo',acerto:30,rede:36},{comp:'Termodinâmica',acerto:46,rede:48},{comp:'Óptica',acerto:54,rede:60},{comp:'Ondulatória',acerto:40,rede:48},{comp:'Física Moderna',acerto:26,rede:30}],
  },
};

function getEscola6(key) {
  return ESCOLAS_6.find(e => e.key === key) || ESCOLAS_6[0];
}

function getEscola6RankData(metric) {
  return ESCOLAS_6.map(e => {
    let valor, prev;
    if (metric === 'geral')   { valor = e.media[4];    prev = e.media[3]; }
    else if (metric === 'presenca') { valor = e.presenca[4]; prev = e.presenca[3]; }
    else {
      const d = ESCOLA_6_DISCS[e.key];
      valor = d && d[metric] ? d[metric][4] : 0;
      prev  = d && d[metric] ? d[metric][3] : 0;
    }
    return { ...e, valor, variacao: parseFloat((valor - prev).toFixed(1)) };
  }).sort((a, b) => b.valor - a.valor).map((e, i) => ({ ...e, pos: i + 1 }));
}

function getEscola6Insight(key, si) {
  si = si !== undefined ? si : 4;
  const e    = getEscola6(key);
  const rede = REDE_6_MEDIA[si];
  const diff = parseFloat((e.media[si] - rede).toFixed(1));
  const delta = si > 0 ? parseFloat((e.media[si] - e.media[si - 1]).toFixed(1)) : 0;
  const pDelta = si > 0 ? e.presenca[si] - e.presenca[si - 1] : 0;
  let t = diff > 5  ? `${e.nome} está ${diff.toFixed(1)} p.p. acima da média da rede` :
          diff >= 0 ? `${e.nome} está próxima da média da rede (+${diff.toFixed(1)} p.p.)` :
                      `${e.nome} está ${Math.abs(diff).toFixed(1)} p.p. abaixo da média da rede`;
  if (si > 0) {
    if (delta >= 2)    t += `. Evolução positiva: +${delta.toFixed(1)} p.p. no último simulado`;
    else if (delta < -0.5) t += `. Queda de ${Math.abs(delta).toFixed(1)} p.p. no último simulado`;
  }
  if (pDelta < -2)        t += `. Presença em queda (${e.presenca[si]}%)`;
  else if (e.presenca[si] < 80) t += `. Presença abaixo de 80%: ${e.presenca[si]}%`;
  if (e.forte) t += `. Ponto forte: ${e.forte}`;
  if (e.fraco) t += `. Fragilidade: ${e.fraco}`;
  return t + '.';
}

/* ── ESCOLAS — HELPERS CALCULADOS ─────────────────────────── */
function getEscola6MediaAcum(key) {
  const e = getEscola6(key);
  return parseFloat((e.media.reduce((s, v) => s + v, 0) / 5).toFixed(1));
}

function getEscola6PresAcum(key) {
  const e = getEscola6(key);
  return Math.round(e.presenca.reduce((s, v) => s + v, 0) / 5);
}

function getEscola6DiscAcum(key, disc) {
  const arr = ESCOLA_6_DISCS[key]?.[disc];
  if (!arr) return null;
  return parseFloat((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1));
}

function getEscola6LiderMetrica(metric) {
  const v = (e, idx) => {
    if (metric === 'geral')    return e.media[idx];
    if (metric === 'presenca') return e.presenca[idx];
    return ESCOLA_6_DISCS[e.key]?.[metric]?.[idx] ?? 0;
  };
  const byCresc = ESCOLAS_6.slice().sort((a, b) => (v(b,4)-v(b,0)) - (v(a,4)-v(a,0)));
  const byQueda = ESCOLAS_6.slice().sort((a, b) => (v(a,4)-v(a,3)) - (v(b,4)-v(b,3)));
  return {
    liderCrescimento: byCresc[0],
    crescimento:      parseFloat((v(byCresc[0],4) - v(byCresc[0],0)).toFixed(1)),
    maiorQueda:       byQueda[0],
    quedaVal:         parseFloat((v(byQueda[0],4) - v(byQueda[0],3)).toFixed(1)),
  };
}

function calcEscola6FaixaDist(escolaMedia, redeMedia) {
  const s   = (escolaMedia - redeMedia) / 10;
  const raw = [4 + s*8, 18 + s*10, 38 - s*4, 28 - s*8, 12 - s*6];
  const cl  = raw.map(v => Math.max(1, v));
  const tot = cl.reduce((a, v) => a + v, 0);
  const n   = cl.map(v => Math.round(v * 100 / tot));
  n[2]     += 100 - n.reduce((a, v) => a + v, 0);
  return n;
}

function getEscola6RankPos(key, sim) {
  const sorted = ESCOLAS_6.slice().sort((a, b) => {
    const ma = sim === 'acumulado' ? getEscola6MediaAcum(a.key) : a.media[sim];
    const mb = sim === 'acumulado' ? getEscola6MediaAcum(b.key) : b.media[sim];
    return mb - ma;
  });
  return sorted.findIndex(e => e.key === key) + 1;
}

/* ══════════════════════════════════════════════════════════
   ALUNOS_REDE — 80 alunos distribuídos em 6 escolas
   Gerado deterministicamente: sem Math.random().
══════════════════════════════════════════════════════════ */

const _AR_NAMES = {
  a: [
    ['Ana Clara','Mendes'],['Bruno','Oliveira'],['Camila','Santos'],
    ['Diego','Ferreira'],['Elena','Costa'],['Felipe','Lima'],
    ['Gabriela','Ramos'],['Henrique','Pereira'],['Isabela','Alves'],
    ['João Victor','Silva'],['Karina','Rodrigues'],['Lucas','Carvalho'],
    ['Marina','Gomes'],['Nicolas','Martins'],
  ],
  b: [
    ['Amanda','Vieira'],['Carlos Eduardo','Castro'],['Diana','Barbosa'],
    ['Eduardo','Nascimento'],['Fernanda','Melo'],['Gabriel','Torres'],
    ['Helena','Freitas'],['Igor','Monteiro'],['Júlia','Cardoso'],
    ['Kevin','Azevedo'],['Larissa','Pinto'],['Marcos','Cunha'],['Natália','Ribeiro'],
  ],
  c: [
    ['André','Moreira'],['Beatriz','Correia'],['César','Figueiredo'],
    ['Daniela','Teixeira'],['Eduardo','Lopes'],['Flávia','Araújo'],
    ['Gustavo','Nunes'],['Heloísa','Campos'],['Ivan','Sousa'],
    ['Joana','Cerqueira'],['Kleber','Dias'],['Letícia','Borges'],['Murilo','Cavalcanti'],
  ],
  d: [
    ['Alessandro','Braga'],['Bianca','Esteves'],['Claudio','Vasconcelos'],
    ['Débora','Machado'],['Edson','Queiroz'],['Fabiana','Lacerda'],
    ['Guilherme','Tavares'],['Humberto','Leite'],['Ingrid','Siqueira'],
    ['Jonas','Medeiros'],['Karen','Paiva'],['Leonardo','Fonseca'],['Mônica','Bernardes'],
  ],
  e: [
    ['Adriana','Coelho'],['Bernardo','Pires'],['Cristiane','Assunção'],
    ['Denis','Matos'],['Eliane','Guimarães'],['Fabio','Bastos'],
    ['Gisele','Andrade'],['Hugo','Pacheco'],['Iara','Drummond'],
    ['Jeremias','Santana'],['Katia','Rezende'],['Leandro','Baptista'],
    ['Marcia','Evangelista'],['Nelson','Brito'],
  ],
  f: [
    ['Augusto','Magalhães'],['Brenda','Cavalcante'],['Celso','Duarte'],
    ['Daianny','Mourão'],['Everton','Rocha'],['Fernanda','Nogueira'],
    ['Gilson','Zambon'],['Helene','Ferraz'],['Ivan','Cordeiro'],
    ['Josiane','Valentin'],['Klaudia','Mesquita'],['Luciano','Bonfim'],['Miriam','Peixoto'],
  ],
};

const _AR_ESCOLA_CONF = {
  a: { nome: 'Escola A', mean5: 62.8, partThr: 9, idx: 0 },
  b: { nome: 'Escola B', mean5: 60.1, partThr: 9, idx: 1 },
  c: { nome: 'Escola C', mean5: 58.4, partThr: 9, idx: 2 },
  d: { nome: 'Escola D', mean5: 57.2, partThr: 9, idx: 3 },
  e: { nome: 'Escola E', mean5: 55.6, partThr: 8, idx: 4 },
  f: { nome: 'Escola F', mean5: 54.1, partThr: 7, idx: 5 },
};

const _AR_CUM_GROWTH = [0, 1.6, 4.3, 6.7, 10.1];
const _AR_DISCS = ['Matemática','Física','Química','Língua Inglesa'];

const _AR_ASSUNTOS = {
  'Matemática':     ['Funções','Geometria Plana','Probabilidade','Álgebra','Trigonometria'],
  'Física':         ['Mecânica','Cinemática','Termodinâmica','Óptica','Eletromagnetismo'],
  'Química':        ['Estequiometria','Equilíbrio Químico','Cinética Química','Eletroquímica','Orgânica'],
  'Língua Inglesa': ['Reading','Grammar','Vocabulary','Text Analysis','Academic Writing'],
};

function _gerarAlunosRede() {
  const result = [];
  let gi = 0;

  ['a','b','c','d','e','f'].forEach(eKey => {
    const conf   = _AR_ESCOLA_CONF[eKey];
    const names  = _AR_NAMES[eKey];
    const n      = names.length;
    const discsE = ESCOLA_6_DISCS[eKey];
    const t3N    = Math.ceil(n / 3);
    const t2N    = Math.ceil((n - t3N) / 2);

    names.forEach(([prim, sob], rank) => {
      const i = gi++;

      // Série e turma por rank dentro da escola
      let serie, turma;
      if (rank < t3N) {
        serie = '3º EM'; turma = 'T1';
      } else if (rank < t3N + t2N) {
        serie = '2º EM';
        turma = (rank - t3N) < Math.ceil(t2N / 2) ? 'T1' : 'T2';
      } else {
        serie = '1º EM'; turma = 'T2';
      }

      const words = prim.split(' ');
      const av    = (words[0][0] + (words[1] ? words[1][0] : sob[0])).toUpperCase();
      const baseF = conf.mean5 + (n / 2 - rank - 0.5) * (22 / n);

      const sims = _AR_CUM_GROWTH.map((cg, s) => {
        const noise = ((i * 7 + s * 13) % 9 - 4) * 0.15;
        return parseFloat(Math.max(20, Math.min(98, baseF - 10.1 + cg + noise)).toFixed(1));
      });

      const media = parseFloat((sims.reduce((a, v) => a + v, 0) / 5).toFixed(1));

      const discs = {};
      _AR_DISCS.forEach((d, di) => {
        const escMean = (discsE && discsE[d]) ? discsE[d][4] : conf.mean5;
        const dNoise  = ((i * 11 + di * 7) % 7 - 3) * 0.8;
        discs[d] = parseFloat(Math.max(20, Math.min(98,
          escMean + (baseF - conf.mean5) * 0.7 + dNoise
        )).toFixed(1));
      });

      // Notas por disciplina por simulado (para o perfil histórico)
      const simDiscs = _AR_CUM_GROWTH.map((cg, s) => {
        const sd = {};
        _AR_DISCS.forEach((d, di) => {
          const off = ((i * 5 + s * 11 + di * 7) % 9 - 4) * 0.8;
          sd[d] = parseFloat(Math.max(20, Math.min(98, discs[d] - 8 + cg * 0.4 + off)).toFixed(1));
        });
        return sd;
      });

      const part     = sims.map((_, s) => ((i * 3 + s * 7 + conf.idx * 11) % 10) < conf.partThr ? 1 : 0);
      const partRate = Math.round(part.reduce((a, v) => a + v, 0) * 20);
      const faixa    = media >= 70 ? 'Acima da Meta' : media >= 50 ? 'Na Meta' : media >= 35 ? 'Em Atenção' : 'Crítico';
      const evolucao = parseFloat((sims[4] - sims[0]).toFixed(1));

      result.push({
        key: eKey + String(rank + 1).padStart(2, '0'),
        nome: prim + ' ' + sob, av,
        escola: eKey, escolaNome: conf.nome, turma, serie,
        sims, simDiscs, media, discs, part, partRate, faixa, evolucao,
        rankEscola: rank + 1, rankRede: 0, status: '',
      });
    });
  });

  result.sort((a, b) => b.media - a.media);
  result.forEach((al, idx) => {
    al.rankRede = idx + 1;
    if      (al.media >= 70)                      al.status = 'Destaque';
    else if (al.sims[4] < al.sims[3] - 5)         al.status = 'Queda recente';
    else if (al.partRate < 75)                    al.status = 'Baixa participação';
    else if (al.sims[4] - al.sims[0] >= 5)        al.status = 'Em crescimento';
    else if (al.media < 45)                       al.status = 'Atenção';
    else                                          al.status = 'Estável';
  });
  result.sort((a, b) => a.escola.localeCompare(b.escola) || a.rankEscola - b.rankEscola);
  return result;
}

const ALUNOS_REDE = _gerarAlunosRede();

/* ── HELPERS DE ALUNOS ─────────────────────────────────────── */
function getAlunosFiltered({ escola = 'todas', turma = 'todas' } = {}) {
  return ALUNOS_REDE.filter(a =>
    (escola === 'todas' || a.escola === escola) &&
    (turma  === 'todas' || a.turma  === turma)
  );
}

function calcGrupoMedia(alunos) {
  if (!alunos.length) return 0;
  return parseFloat((alunos.reduce((s, a) => s + a.media, 0) / alunos.length).toFixed(1));
}

function calcGrupoMediaDisc(alunos, disc) {
  if (!alunos.length) return 0;
  return parseFloat((alunos.reduce((s, a) => s + (a.discs[disc] || 0), 0) / alunos.length).toFixed(1));
}

function calcGrupoPart(alunos) {
  if (!alunos.length) return 0;
  return Math.round(alunos.reduce((s, a) => s + a.partRate, 0) / alunos.length);
}

function calcFaixaDist(alunos) {
  const labels = ['Acima da Meta', 'Na Meta', 'Em Atenção', 'Crítico'];
  return labels.map(f => alunos.filter(a => a.faixa === f).length);
}

function getAlunoStatus(aluno) {
  const delta = aluno.sims[4] - aluno.sims[3];
  if (aluno.faixa === 'Crítico')      return { label: 'Crítico',   cls: 'diff-neg' };
  if (aluno.faixa === 'Em Atenção')   return { label: 'Em Atenção', cls: 'tag-att' };
  if (delta >= 3)  return { label: 'Em alta',  cls: 'diff-pos' };
  if (delta < -2)  return { label: 'Em queda', cls: 'diff-neg' };
  return { label: 'Estável', cls: 'diff-neu' };
}

function buildAlunoRanking(alunos) {
  return alunos.slice().sort((a, b) => b.media - a.media).map((a, i) => ({ ...a, pos: i + 1 }));
}

function getAlunoEvoGrupo(alunos) {
  return _AR_CUM_GROWTH.map((_, s) => {
    if (!alunos.length) return 0;
    return parseFloat((alunos.reduce((sum, a) => sum + a.sims[s], 0) / alunos.length).toFixed(1));
  });
}

function getAlunoValSim(aluno, simKey) {
  if (!simKey || simKey === 'acumulado') return aluno.media;
  const idx = parseInt(simKey, 10) - 1;
  return (idx >= 0 && idx < 5) ? aluno.sims[idx] : aluno.media;
}

function calcGrupoValSim(alunos, simKey) {
  if (!alunos.length) return 0;
  return parseFloat((alunos.reduce((s, a) => s + getAlunoValSim(a, simKey), 0) / alunos.length).toFixed(1));
}

function getRedeValSim(simKey) {
  if (!simKey || simKey === 'acumulado')
    return parseFloat((REDE_6_MEDIA.reduce((s, v) => s + v, 0) / REDE_6_MEDIA.length).toFixed(1));
  const idx = parseInt(simKey, 10) - 1;
  return (idx >= 0 && idx < 5) ? REDE_6_MEDIA[idx] : REDE_6_MEDIA[4];
}

function calcFaixaDistSim(alunos, simKey) {
  const getVal = a => getAlunoValSim(a, simKey);
  return [
    alunos.filter(a => getVal(a) >= 70).length,
    alunos.filter(a => getVal(a) >= 50 && getVal(a) < 70).length,
    alunos.filter(a => getVal(a) >= 35 && getVal(a) < 50).length,
    alunos.filter(a => getVal(a) < 35).length,
  ];
}

function getAlunoMetricaVal(aluno, metrica) {
  if (metrica === 'geral')        return aluno.media;
  if (metrica === 'participacao') return aluno.partRate;
  return aluno.discs[metrica] || 0;
}

function buildAlunoRankingMetrica(alunos, metrica) {
  return alunos.slice()
    .sort((a, b) => getAlunoMetricaVal(b, metrica) - getAlunoMetricaVal(a, metrica))
    .map((a, i) => ({ ...a, pos: i + 1 }));
}

const SIM_OPTS_HTML =
  '<option value="acumulado">Acumulado (1–5)</option>' +
  '<option value="1">Ciclo 1</option>' +
  '<option value="2">Ciclo 2</option>' +
  '<option value="3">Ciclo 3</option>' +
  '<option value="4">Ciclo 4</option>' +
  '<option value="5">Ciclo 5</option>';

function sortAlunosPor(alunos, simKey, ordenar) {
  return alunos.slice().sort((a, b) => {
    switch (ordenar) {
      case 'mat':  return (b.discs['Matemática']    || 0) - (a.discs['Matemática']    || 0);
      case 'fis':  return (b.discs['Física']        || 0) - (a.discs['Física']        || 0);
      case 'qui':  return (b.discs['Química']       || 0) - (a.discs['Química']       || 0);
      case 'ing':  return (b.discs['Língua Inglesa']|| 0) - (a.discs['Língua Inglesa']|| 0);
      case 'evo':  return b.evolucao - a.evolucao;
      case 'part': return b.partRate - a.partRate;
      default:     return getAlunoValSim(b, simKey) - getAlunoValSim(a, simKey);
    }
  });
}
