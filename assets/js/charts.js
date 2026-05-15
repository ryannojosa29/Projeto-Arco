/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Camada de Gráficos
   Usa Plotly.react() em todas as funções para suportar
   re-renders quando filtros mudam, sem criar duplicatas.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── TEMA PLOTLY ───────────────────────────────────────────── */
const CT = {
  font: { family: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#6B6B66', size: 11 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor:  'rgba(0,0,0,0)',
};
const CFG = { responsive: true, displayModeBar: false };
const M   = { t: 6, r: 10, b: 28, l: 42 };
const MC  = { t: 6, r: 6,  b: 6,  l: 6  };

/* Cores semânticas */
const C = {
  orange:  '#E8521A',
  navy:    '#0F1F3D',
  blue:    '#1D4ED8',
  green:   '#15803D',
  green2:  '#4ADE80',
  amber:   '#B45309',
  red:     '#B91C1C',
  slate:   '#94A3B8',
  border:  '#E8E6DF',
};

/* Paleta de distribuição por faixa (5 níveis) */
const FAIXA_COLORS = [C.green, C.green2, C.slate, '#F59E0B', C.red];
const FAIXA_LABELS = ['Muito acima', 'Acima', 'Na média', 'Abaixo', 'Muito abaixo'];

/* Helper: verificar se elemento existe */
function el(id) { return document.getElementById(id); }

/* ── SIMULADOS ─────────────────────────────────────────────── */
function renderSimDistChart(q) {
  if (!el('sim-dist-chart')) return;
  const alts = ['A', 'B', 'C', 'D', 'E'];
  const gabIdx = alts.indexOf(q.gab);
  const distIdx = alts.indexOf(q.dist);
  const base = Math.max(0, Math.round((100 - q.acerto - q.distPct - 8) / 3));
  const vals = [base, base + 2, base, base + 1, base + 1];
  vals[gabIdx]  = q.acerto;
  vals[distIdx] = q.distPct;

  const colors = alts.map((_, i) =>
    i === gabIdx  ? C.green :
    i === distIdx ? C.orange : C.slate
  );

  Plotly.react('sim-dist-chart',
    [{ type:'bar', y: alts, x: vals, orientation:'h',
       marker: { color: colors, opacity: .88 },
       text: vals.map(v => v + '%'), textposition: 'outside',
       textfont: { size: 10 },
    }],
    { ...CT, margin: { t:4, r:40, b:4, l:24 },
      xaxis: { range:[0,105], ticksuffix:'%', gridcolor: C.border, tickfont:{ size:9 }, zeroline:false },
      yaxis: { tickfont:{ size:11 } },
    }, CFG
  );
}

function renderSimTurmaChart(q) {
  if (!el('sim-turma-chart')) return;
  const t1 = Math.max(10, q.acerto - 10);
  const t2 = Math.min(95, q.acerto + 5);
  const rede = q.acerto;
  Plotly.react('sim-turma-chart',
    [{ type:'bar', x:['Turma 1','Turma 2','Rede'],
       y:[t1, t2, rede],
       marker: { color:[C.blue, C.blue, C.navy], opacity:[.75,.75,.9] },
       text:[t1+'%', t2+'%', rede+'%'], textposition:'outside', textfont:{ size:10 },
    }],
    { ...CT, margin:{ t:4, r:8, b:26, l:36 },
      yaxis:{ range:[0,105], ticksuffix:'%', gridcolor:C.border, tickfont:{size:9} },
      xaxis:{ tickfont:{size:10} },
    }, CFG
  );
}

/* ── ESCOLAS ─────────────────────────────────────────────────── */
function renderEscolaDistChart() {
  if (!el('chart-escola-dist')) return;
  const counts = ESCOLAS.reduce((acc, e) => {
    const tier = e.media >= 58 ? 0 : e.media >= 52 ? 1 : e.media >= 46 ? 2 : e.media >= 40 ? 3 : 4;
    acc[tier]++;
    return acc;
  }, [0,0,0,0,0]);

  Plotly.react('chart-escola-dist',
    [{ type:'pie', values: counts, labels: FAIXA_LABELS,
       marker: { colors: FAIXA_COLORS },
       hole: .52, textinfo:'value+label', textfont:{ size:9 },
       hovertemplate: '%{label}: %{value} escolas<extra></extra>',
    }],
    { ...CT, margin: MC, showlegend: false }, CFG
  );
}

function renderRankTableChart(tipo) {
  const data = getRankData(tipo);
  const tbody = el('rank-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(r => {
    const mv  = r.rankMove;
    const vn  = parseFloat((r.var + (tipo !== 'geral' ? (r.key.charCodeAt(0) % 5) - 2 : 0)).toFixed(1));
    const sc  = r.status === 'above' ? 'badge-above' : r.status === 'crit' ? 'badge-crit' : r.status === 'avg' ? 'badge-avg' : 'badge-att';
    const st  = r.status === 'above' ? 'Acima da média' : r.status === 'crit' ? 'Crítica' : r.status === 'avg' ? 'Na média' : 'Atenção';
    const mvH = mv > 0 ? `<div class="rmove up">↑ ${mv}</div>` : mv < 0 ? `<div class="rmove down">↓ ${Math.abs(mv)}</div>` : `<div class="rmove same">—</div>`;
    const vnH = vn >= 0 ? `<div class="rvar up">↑ ${vn}</div>` : `<div class="rvar down">↓ ${Math.abs(vn)}</div>`;
    const val = tipo === 'presenca' ? r.part + '%' : r.mediaRank + '%';
    return `<tr><td class="rpos">${r.pos}</td><td class="bold">${r.nome}</td><td class="bold">${val}</td><td>${vnH}</td><td>${mvH}</td><td>${r.part}%</td></tr>`;
  }).join('');
}

function renderEscolaEvoChart(escolaKey) {
  if (!el('chart-escola-evo')) return;
  const e = getEscola(escolaKey);
  Plotly.react('chart-escola-evo',
    [{ type:'scatter', mode:'lines+markers', name: e.nome,
       x: SIM_LABELS_CURTOS, y: e.evo,
       line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
     { type:'scatter', mode:'lines', name:'Média rede',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       line:{ color:C.slate, width:1.5, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:9}, gridcolor:C.border },
      yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border, range:[25,80] },
      legend:{ font:{size:9} } },
    CFG
  );
}

function renderEscolaFaixaChart(escolaKey) {
  if (!el('chart-escola-faixa')) return;
  const e = getEscola(escolaKey);
  const base = e.media;
  const faixa = [
    Math.round(Math.max(2, (base - 50) * 1.2)),
    Math.round(Math.max(5, (base - 42) * 1.4)),
    Math.round(Math.max(10, 42 - Math.abs(base - 54) * 0.8)),
    Math.round(Math.max(5, (58 - base) * 1.1)),
    Math.round(Math.max(2, (52 - base) * 0.9)),
  ].map(v => Math.max(2, v));

  Plotly.react('chart-escola-faixa',
    [{ type:'bar', orientation:'h', x: faixa, y: FAIXA_LABELS,
       marker:{ color: FAIXA_COLORS, opacity:.85 },
       text: faixa.map(v => v + '%'), textposition:'outside', textfont:{ size:10 },
    }],
    { ...CT, margin:{ t:4, r:40, b:16, l:90 },
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:9} },
      yaxis:{ tickfont:{size:10} },
    }, CFG
  );
}

function renderCompEscolaChart(escolaKey) {
  if (!el('chart-comp-escola')) return;
  const comps = getEscolaComponents(escolaKey);
  Plotly.react('chart-comp-escola',
    [{ type:'bar', name: getEscola(escolaKey).nome,
       y: comps.map(c=>c.disc), x: comps.map(c=>c.mediaEscola),
       orientation:'h', marker:{ color:C.orange, opacity:.85 } },
     { type:'bar', name:'Média rede',
       y: comps.map(c=>c.disc), x: comps.map(c=>c.mediaRede),
       orientation:'h', marker:{ color:C.slate, opacity:.55 } }],
    { ...CT, margin:{ t:4, r:40, b:24, l:100 }, barmode:'group',
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:9} },
      yaxis:{ tickfont:{size:9.5} },
      legend:{ font:{size:9} } },
    CFG
  );
}

function renderPartEvoChart() {
  if (!el('chart-part-evo')) return;
  Plotly.react('chart-part-evo',
    [{ type:'scatter', mode:'lines+markers', name:'Escola A',
       x: SIM_LABELS_CURTOS, y:[88,90,89,91,92],
       line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y:[82,84,83,85,87],
       line:{ color:C.slate, width:1.5, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:9} },
      yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border },
      legend:{ font:{size:9} } },
    CFG
  );
}

function renderPartDistChart() {
  if (!el('chart-part-dist')) return;
  Plotly.react('chart-part-dist',
    [{ type:'bar', orientation:'h', x:[64,16,12,8],
       y:['>90%','80–90%','70–80%','<70%'],
       marker:{ color:[C.green, C.green2, '#F59E0B', C.red], opacity:.85 },
       text:['64%','16%','12%','8%'], textposition:'outside', textfont:{ size:10 },
    }],
    { ...CT, margin:{ t:4, r:42, b:16, l:60 },
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:9} },
      yaxis:{ tickfont:{size:10} },
    }, CFG
  );
}

function renderEvoGeralChart(escolaKey) {
  if (!el('chart-evo-geral')) return;
  const e = getEscola(escolaKey);
  Plotly.react('chart-evo-geral',
    [{ type:'scatter', mode:'lines+markers', name: e.nome,
       x: SIM_LABELS_CURTOS, y: e.evo,
       line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       line:{ color:C.slate, width:1.5, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:9} },
      yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border },
      legend:{ font:{size:9} } },
    CFG
  );
}

function renderEvoRankingChart(escolaKey) {
  if (!el('chart-evo-ranking')) return;
  const idx = ESCOLAS.findIndex(e => e.key === escolaKey);
  const baseRank = idx + 1;
  const rankEvo = [
    Math.min(28, baseRank + 4), Math.min(28, baseRank + 3),
    Math.min(28, baseRank + 2), Math.min(28, baseRank + 1), baseRank,
  ];
  Plotly.react('chart-evo-ranking',
    [{ type:'scatter', mode:'lines+markers', name:'Posição',
       x: SIM_LABELS_CURTOS, y: rankEvo,
       line:{ color:C.blue, width:2.5 }, marker:{ size:5 } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:9} },
      yaxis:{ tickfont:{size:9}, gridcolor:C.border, autorange:'reversed', dtick:1 },
    }, CFG
  );
}

/* ── ESCOLAS 6 ────────────────────────────────────────────── */
function renderDesemp6DiscsChart(key, si, isAcum) {
  if (!el('chart-desemp6-discs')) return;
  const discs = DISCIPLINAS_6;
  const e     = getEscola6(key);
  const escolaVals = discs.map(d => {
    if (isAcum) return getEscola6DiscAcum(key, d) ?? 0;
    return ESCOLA_6_DISCS[key]?.[d]?.[si] ?? 0;
  });
  const redeVals = discs.map(d => {
    const arr = REDE_6_DISC_SIM[d];
    if (!arr) return 0;
    if (isAcum) return parseFloat((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1));
    return arr[si];
  });
  Plotly.react('chart-desemp6-discs',
    [{ type:'bar', name: e.nome,
       y: discs, x: escolaVals, orientation:'h',
       marker:{ color:C.orange, opacity:.85 },
       text: escolaVals.map(v => v.toFixed(1) + '%'), textposition:'outside', textfont:{ size:9 },
    },
    { type:'bar', name:'Rede',
       y: discs, x: redeVals, orientation:'h',
       marker:{ color:C.slate, opacity:.55 },
    }],
    { ...CT, margin:{ t:20, r:48, b:16, l:100 }, barmode:'group',
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{ size:9 }, range:[0,105] },
      yaxis:{ tickfont:{ size:9.5 } },
      legend:{ font:{ size:9 }, orientation:'h', y:1.12, x:0 } },
    CFG
  );
}

function renderDesemp6FaixaChart(key, si, isAcum) {
  if (!el('chart-desemp6-faixa')) return;
  const e         = getEscola6(key);
  const escolaMed = isAcum ? getEscola6MediaAcum(key) : e.media[si];
  const redeMed   = isAcum
    ? parseFloat((REDE_6_MEDIA.reduce((s, v) => s + v, 0) / 5).toFixed(1))
    : REDE_6_MEDIA[si];
  const faixa     = calcEscola6FaixaDist(escolaMed, redeMed);
  Plotly.react('chart-desemp6-faixa',
    [{ type:'bar', orientation:'h', x: faixa, y: FAIXA_LABELS,
       marker:{ color: FAIXA_COLORS, opacity:.85 },
       text: faixa.map(v => v + '%'), textposition:'outside', textfont:{ size:10 },
    }],
    { ...CT, margin:{ t:4, r:40, b:16, l:90 },
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{ size:9 } },
      yaxis:{ tickfont:{ size:10 } },
    }, CFG
  );
}

function renderDesemp6EvoChart(key) {
  if (!el('chart-desemp6-evo')) return;
  const e = getEscola6(key);
  Plotly.react('chart-desemp6-evo',
    [{ type:'scatter', mode:'lines+markers', name: e.nome,
       x: SIM_LABELS_CURTOS, y: e.media,
       line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y: REDE_6_MEDIA,
       line:{ color:C.slate, width:1.5, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{ size:9 }, gridcolor:C.border },
      yaxis:{ ticksuffix:'%', tickfont:{ size:9 }, gridcolor:C.border },
      legend:{ font:{ size:9 } } },
    CFG
  );
}

function renderComp6EvoChart(key, disc) {
  if (!el('chart-comp6-evo')) return;
  const e = getEscola6(key);
  if (disc === 'Todas') {
    const DISC_COLORS = [C.orange, C.blue, C.green, C.amber, C.navy, C.red];
    const traces = DISCIPLINAS_6.map((d, i) => ({
      type:'scatter', mode:'lines+markers', name: d,
      x: SIM_LABELS_CURTOS,
      y: ESCOLA_6_DISCS[key]?.[d] ?? e.media,
      line:{ color: DISC_COLORS[i % DISC_COLORS.length], width:2 }, marker:{ size:4 },
    }));
    traces.push({
      type:'scatter', mode:'lines', name:'Rede média',
      x: SIM_LABELS_CURTOS, y: REDE_6_MEDIA,
      line:{ color:C.slate, width:2, dash:'dot' },
    });
    Plotly.react('chart-comp6-evo', traces,
      { ...CT, margin:{ ...M, r:16 },
        xaxis:{ tickfont:{ size:9 }, gridcolor:C.border },
        yaxis:{ ticksuffix:'%', tickfont:{ size:9 }, gridcolor:C.border },
        legend:{ font:{ size:9 } } },
      CFG
    );
  } else {
    const discData = ESCOLA_6_DISCS[key]?.[disc] ?? e.media;
    const redeData = REDE_6_DISC_SIM[disc] ?? REDE_6_MEDIA;
    Plotly.react('chart-comp6-evo',
      [{ type:'scatter', mode:'lines+markers', name: e.nome,
         x: SIM_LABELS_CURTOS, y: discData,
         line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
       { type:'scatter', mode:'lines', name:'Rede',
         x: SIM_LABELS_CURTOS, y: redeData,
         line:{ color:C.slate, width:1.5, dash:'dot' } }],
      { ...CT, margin:M,
        xaxis:{ tickfont:{ size:9 }, gridcolor:C.border },
        yaxis:{ ticksuffix:'%', tickfont:{ size:9 }, gridcolor:C.border },
        legend:{ font:{ size:9 } } },
      CFG
    );
  }
}

/* ── ALUNOS ───────────────────────────────────────────────── */
function renderAlunoAreaChart() {
  if (!el('chart-aluno-area')) return;
  const disc = ['Matemática','Física','Química','Língua Inglesa','C. Humanas'];
  const medias = [58.6, 43.8, 57.0, 63.3, 52.1];
  Plotly.react('chart-aluno-area',
    [{ type:'bar', name:'Média alunos',
       y: disc, x: medias, orientation:'h',
       marker:{ color:C.orange, opacity:.82 } },
     { type:'scatter', mode:'lines', name:'Meta (60%)',
       x:[60,60,60,60,60], y: disc,
       line:{ color:C.slate, width:1.5, dash:'dot' }, hoverinfo:'skip' }],
    { ...CT, margin:{ t:4, r:42, b:16, l:106 },
      xaxis:{ range:[0,85], ticksuffix:'%', gridcolor:C.border, tickfont:{size:9} },
      yaxis:{ tickfont:{size:9.5} },
      legend:{ font:{size:9} } },
    CFG
  );
}

function renderAlunoFaixaChart() {
  if (!el('chart-aluno-faixa')) return;
  Plotly.react('chart-aluno-faixa',
    [{ type:'pie', values:[21,33,36,9,1], labels: FAIXA_LABELS,
       marker:{ colors: FAIXA_COLORS }, hole:.52,
       textinfo:'percent+label', textfont:{ size:9 },
       hovertemplate:'%{label}: %{value}%<extra></extra>',
    }],
    { ...CT, margin: MC, showlegend: false }, CFG
  );
}

function renderAlunoEvoChart(alunoKey) {
  if (!el('chart-aluno-evo')) return;
  const d = ALUNOS[alunoKey] || ALUNOS.ana;
  Plotly.react('chart-aluno-evo',
    [{ type:'scatter', mode:'lines+markers', name: d.nome.split(' ')[0],
       x: SIM_LABELS_CURTOS, y: d.evo,
       line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       line:{ color:C.slate, width:1.5, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:9}, gridcolor:C.border },
      yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border },
      legend:{ font:{size:9} } },
    CFG
  );
}

function renderAlunoDesempenhoCharts() {
  if (el('chart-alunos-geral-evo'))
    Plotly.react('chart-alunos-geral-evo',
      [{ type:'scatter', mode:'lines+markers', name:'Média rede',
         x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
         line:{ color:C.orange, width:2.5 }, marker:{ size:5 } }],
      { ...CT, margin:M,
        xaxis:{ tickfont:{size:9} },
        yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border } },
      CFG
    );

  if (el('chart-alunos-geral-faixa'))
    Plotly.react('chart-alunos-geral-faixa',
      [{ type:'bar', orientation:'h', x:[21,33,36,9,1], y: FAIXA_LABELS,
         marker:{ color: FAIXA_COLORS, opacity:.85 },
         text:['21%','33%','36%','9%','1%'], textposition:'outside', textfont:{ size:10 },
      }],
      { ...CT, margin:{ t:4, r:42, b:16, l:92 },
        xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:9} },
        yaxis:{ tickfont:{size:9.5} } },
      CFG
    );
}

function renderAlunoEvoRedeChart() {
  if (!el('chart-alunos-evo-rede')) return;
  Plotly.react('chart-alunos-evo-rede',
    [{ type:'bar', name:'Média',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       marker:{ color:C.orange, opacity:.85 },
       text: REDE_MEDIA_SIM.map(v => v + '%'), textposition:'outside', textfont:{ size:10 },
    }],
    { ...CT, margin:{ t:6, r:8, b:30, l:38 },
      xaxis:{ tickfont:{size:10} },
      yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border } },
    CFG
  );
}

function renderAlunoPartChart() {
  if (el('chart-aluno-part-evo'))
    Plotly.react('chart-aluno-part-evo',
      [{ type:'scatter', mode:'lines+markers', name:'Rede',
         x: SIM_LABELS_CURTOS, y:[88,89,90,91,92],
         line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
       { type:'scatter', mode:'lines', name:'Referência',
         x: SIM_LABELS_CURTOS, y:[90,90,90,90,90],
         line:{ color:C.green, width:1.5, dash:'dot' } }],
      { ...CT, margin:M,
        xaxis:{ tickfont:{size:9} },
        yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border, range:[80,100] },
        legend:{ font:{size:9} } },
      CFG
    );

  if (el('chart-aluno-part-dist'))
    Plotly.react('chart-aluno-part-dist',
      [{ type:'pie', values:[18,64,12,6], labels:['>95%','90–95%','80–90%','<80%'],
         marker:{ colors:[C.green, C.green2, '#F59E0B', C.red] },
         hole:.5, textinfo:'percent+label', textfont:{ size:9 },
      }],
      { ...CT, margin: MC, showlegend: false }, CFG
    );
}

/* ── PROFESSORES ──────────────────────────────────────────── */
function renderProfDifChart(profKey) {
  if (!el('chart-prof-dif')) return;
  const qs = getProfessor(profKey).questoes.map(i => QUESTOES[i]).filter(Boolean);
  const faceis   = qs.filter(q => q.diff === 'Fácil').length;
  const medios   = qs.filter(q => q.diff === 'Médio').length;
  const maltos   = qs.filter(q => q.diff === 'Médio-alto').length;
  const altos    = qs.filter(q => q.diff === 'Alto').length;
  Plotly.react('chart-prof-dif',
    [{ type:'pie', values:[faceis, medios, maltos, altos],
       labels:['Fácil','Médio','Médio-alto','Alto'],
       marker:{ colors:[C.slate, '#F59E0B', C.orange, C.red] },
       hole:.5, textinfo:'value+label', textfont:{ size:9 },
    }],
    { ...CT, margin: MC, showlegend: false }, CFG
  );
}

function renderProfEvoChart(profKey) {
  if (!el('chart-prof-evo')) return;
  const p = getProfessor(profKey);
  Plotly.react('chart-prof-evo',
    [{ type:'scatter', mode:'lines+markers', name:'Acerto médio',
       x: SIM_LABELS_CURTOS, y: p.evo_acerto,
       line:{ color:C.orange, width:2.5 }, marker:{ size:5 } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:9} },
      yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border } },
    CFG
  );
}

function renderProfAlunosCharts(profKey) {
  if (!el('chart-prof-alunos') && !el('chart-prof-corr')) return;
  const qs = getProfessor(profKey).questoes.map(i => QUESTOES[i]).filter(Boolean);
  const vals = qs.map(q => q.acerto);

  if (el('chart-prof-alunos'))
    Plotly.react('chart-prof-alunos',
      [{ type:'pie', values:[12,46,36,6], labels:['Muito acima','Acima','Na média','Abaixo'],
         marker:{ colors:[C.green, C.green2, C.slate, '#F59E0B'] },
         hole:.5, textinfo:'percent+label', textfont:{ size:9 },
      }],
      { ...CT, margin: MC, showlegend: false }, CFG
    );

  if (el('chart-prof-corr'))
    Plotly.react('chart-prof-corr',
      [{ type:'bar', x: vals.map((_, i) => 'Q' + (i + 1)), y: vals,
         marker:{ color: vals.map(v => v >= 70 ? C.green : v >= 42 ? C.blue : C.red), opacity:.82 },
      }],
      { ...CT, margin:{ t:6, r:8, b:30, l:38 },
        xaxis:{ tickfont:{size:9} },
        yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border, range:[0,100] } },
      CFG
    );
}

function renderProfEvoQualCharts(profKey) {
  const p = getProfessor(profKey);

  if (el('chart-prof-iq-evo'))
    Plotly.react('chart-prof-iq-evo',
      [{ type:'scatter', mode:'lines+markers',
         x: SIM_LABELS_CURTOS, y: p.evo_iq,
         line:{ color:C.green, width:2.5 }, marker:{ size:5 } }],
      { ...CT, margin:M,
        xaxis:{ tickfont:{size:9} },
        yaxis:{ range:[0,10], tickfont:{size:9}, gridcolor:C.border } },
      CFG
    );

  if (el('chart-prof-acerto-evo'))
    Plotly.react('chart-prof-acerto-evo',
      [{ type:'scatter', mode:'lines+markers', name: p.nome.split(' ').slice(0,2).join(' '),
         x: SIM_LABELS_CURTOS, y: p.evo_acerto,
         line:{ color:C.orange, width:2.5 }, marker:{ size:5 } },
       { type:'scatter', mode:'lines', name:'Média rede',
         x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
         line:{ color:C.slate, width:1.5, dash:'dot' } }],
      { ...CT, margin:M,
        xaxis:{ tickfont:{size:9} },
        yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border },
        legend:{ font:{size:9} } },
      CFG
    );
}

/* ══════════════════════════════════════════════════════════
   ALUNOS_REDE — Gráficos da página Alunos
══════════════════════════════════════════════════════════ */

function renderAlunoPerfilDisciplinasChart(aluno, simKey) {
  if (!el('chart-al-discs') || typeof _AR_DISCS === 'undefined') return;
  const simIdx   = (simKey && simKey !== 'acumulado') ? parseInt(simKey, 10) - 1 : -1;
  const discData = (simIdx >= 0 && aluno.simDiscs) ? aluno.simDiscs[simIdx] : aluno.discs;
  const prim     = aluno.nome.split(' ')[0];
  const vals     = _AR_DISCS.map(d => discData[d] || 0);
  const rede     = _AR_DISCS.map(d => (REDE_6_DISC_SIM[d] || [0,0,0,0,0])[4]);

  Plotly.react('chart-al-discs', [
    { type:'bar', orientation:'h', x:vals, y:_AR_DISCS, name:prim,
      marker:{ color:C.orange, opacity:0.9 } },
    { type:'bar', orientation:'h', x:rede, y:_AR_DISCS, name:'Rede',
      marker:{ color:C.slate, opacity:0.6 } },
  ], {
    ...CT, barmode:'group',
    margin:{ t:8, r:12, b:32, l:115 },
    xaxis:{ range:[0,100], ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border },
    yaxis:{ tickfont:{size:9} },
    legend:{ orientation:'h', y:-0.22, font:{size:9} },
  }, CFG);
}

function renderAlunoPerfilEvolucaoChart(aluno) {
  if (!el('chart-al-evo')) return;
  const prim = aluno.nome.split(' ')[0];

  Plotly.react('chart-al-evo', [
    { type:'scatter', mode:'lines+markers', name:prim,
      x:SIM_LABELS_CURTOS, y:aluno.sims,
      line:{ color:C.orange, width:2.5 }, marker:{ size:7, color:C.orange } },
    { type:'scatter', mode:'lines', name:'Rede',
      x:SIM_LABELS_CURTOS, y:REDE_6_MEDIA,
      line:{ color:C.slate, width:1.5, dash:'dot' } },
  ], {
    ...CT, margin:{ t:8, r:12, b:50, l:42 },
    xaxis:{ tickfont:{size:9} },
    yaxis:{ ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border },
    legend:{ orientation:'h', y:-0.36, font:{size:9} },
  }, CFG);
}

function renderAlunoPerfilParticipacaoChart(aluno) {
  if (!el('chart-al-part')) return;
  const colors = aluno.part.map(v => v === 1 ? C.green : C.red);
  const vals   = aluno.part.map(v => v === 1 ? 100 : 40);
  const texts  = aluno.part.map(v => v === 1 ? 'Presente' : 'Ausente');

  Plotly.react('chart-al-part', [{
    type:'bar', x:SIM_LABELS_CURTOS, y:vals,
    marker:{ color:colors, opacity:0.85 },
    text:texts, textposition:'inside',
    textfont:{ size:10, color:'#fff' },
  }], {
    ...CT, height:110,
    margin:{ t:6, r:12, b:32, l:8 },
    yaxis:{ visible:false, range:[0,120] },
    xaxis:{ tickfont:{size:9} },
  }, CFG);
}
