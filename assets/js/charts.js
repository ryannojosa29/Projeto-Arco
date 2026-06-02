/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Camada de Gráficos
   Usa Plotly.react() em todas as funções para suportar
   re-renders quando filtros mudam, sem criar duplicatas.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── TEMA PLOTLY ───────────────────────────────────────────── */
const CT = {
  font: { family: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#6B6B66', size: 12 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor:  'rgba(0,0,0,0)',
};
const CFG = { responsive: true, displayModeBar: false };
const M   = { t: 8, r: 14, b: 32, l: 46 };
const MC  = { t: 8, r: 8,  b: 8,  l: 8  };

/* Cores semânticas */
const C = {
  orange:  '#E8563A',
  navy:    '#0D1B3E',
  blue:    '#2563EB',
  green:   '#15803D',
  green2:  '#4ADE80',
  amber:   '#B45309',
  red:     '#B91C1C',
  slate:   '#94A3B8',
  border:  '#E8E6DF',
};

/* ── ANIMAÇÃO DE ENTRADA PARA GRÁFICOS DE BARRA ──────────────
   Renderiza barras do zero e anima até os valores reais.
   Gráficos de linha/pie usam Plotly.react() normal.
─────────────────────────────────────────────────────────────── */
function renderWithAnim(id, traces, layout) {
  if (!el(id)) return;

  const zeroTraces = traces.map(t => {
    if (t.type !== 'bar') return t;
    const z = { ...t, marker: { ...t.marker } };
    if (t.orientation === 'h') z.x = Array.isArray(t.x) ? t.x.map(() => 0) : t.x;
    else                        z.y = Array.isArray(t.y) ? t.y.map(() => 0) : t.y;
    if (Array.isArray(t.text))  z.text = t.text.map(() => '');
    return z;
  });

  Plotly.react(id, zeroTraces, layout, CFG);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    Plotly.animate(id, {
      data: traces.map(t => {
        if (t.type !== 'bar') return {};
        const upd = { marker: t.marker };
        if (t.orientation === 'h') upd.x = t.x;
        else                        upd.y = t.y;
        if (t.text) upd.text = t.text;
        return upd;
      }),
      traces: traces.map((_, i) => i),
    }, {
      transition: { duration: 760, easing: 'cubic-in-out' },
      frame:      { duration: 760, redraw: false },
    });
  }));
}

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
  let vals;
  if (q.distrib && typeof q.distrib === 'object') {
    // Distribuição exata vinda do banco (API Python).
    vals = alts.map(l => q.distrib[l] ?? 0);
  } else {
    // Fallback: síntese a partir de acerto + distPct.
    const base = Math.max(0, Math.round((100 - q.acerto - q.distPct - 8) / 3));
    vals = [base, base + 2, base, base + 1, base + 1];
    vals[gabIdx]  = q.acerto;
    vals[distIdx] = q.distPct;
  }

  const colors = alts.map((_, i) =>
    i === gabIdx  ? C.green :
    i === distIdx ? C.orange : C.slate
  );

  renderWithAnim('sim-dist-chart',
    [{ type:'bar', y: alts, x: vals, orientation:'h',
       marker: { color: colors, opacity: .92 },
       text: vals.map(v => v + '%'), textposition: 'outside',
       textfont: { size: 11 },
    }],
    { ...CT, margin: { t:4, r:44, b:4, l:26 },
      xaxis: { range:[0,105], ticksuffix:'%', gridcolor: C.border, tickfont:{ size:10 }, zeroline:false },
      yaxis: { tickfont:{ size:12 } },
    }
  );
}

function renderSimTurmaChart(q) {
  if (!el('sim-turma-chart')) return;
  const t1 = Math.max(10, q.acerto - 10);
  const t2 = Math.min(95, q.acerto + 5);
  const rede = q.acerto;
  renderWithAnim('sim-turma-chart',
    [{ type:'bar', x:['Turma 1','Turma 2','Rede'],
       y:[t1, t2, rede],
       marker: { color:[C.blue, C.blue, C.navy], opacity:[.82,.82,.95] },
       text:[t1+'%', t2+'%', rede+'%'], textposition:'outside', textfont:{ size:11 },
    }],
    { ...CT, margin:{ t:4, r:8, b:30, l:38 },
      yaxis:{ range:[0,105], ticksuffix:'%', gridcolor:C.border, tickfont:{size:10} },
      xaxis:{ tickfont:{size:11} },
    }
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
       line:{ color:C.blue, width:3 }, marker:{ size:7, color:C.blue } },
     { type:'scatter', mode:'lines', name:'Média rede',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       line:{ color:C.slate, width:2, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:10}, gridcolor:C.border },
      yaxis:{ ticksuffix:'%', tickfont:{size:10}, gridcolor:C.border, range:[25,80] },
      legend:{ font:{size:10} } },
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

  renderWithAnim('chart-escola-faixa',
    [{ type:'bar', orientation:'h', x: faixa, y: FAIXA_LABELS,
       marker:{ color: FAIXA_COLORS, opacity:.92 },
       text: faixa.map(v => v + '%'), textposition:'outside', textfont:{ size:11 },
    }],
    { ...CT, margin:{ t:4, r:44, b:16, l:96 },
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:10} },
      yaxis:{ tickfont:{size:11} },
    }
  );
}

function renderCompEscolaChart(escolaKey) {
  if (!el('chart-comp-escola')) return;
  const comps = getEscolaComponents(escolaKey);
  renderWithAnim('chart-comp-escola',
    [{ type:'bar', name: getEscola(escolaKey).nome,
       y: comps.map(c=>c.disc), x: comps.map(c=>c.mediaEscola),
       orientation:'h', marker:{ color:C.blue, opacity:.88 } },
     { type:'bar', name:'Média rede',
       y: comps.map(c=>c.disc), x: comps.map(c=>c.mediaRede),
       orientation:'h', marker:{ color:C.slate, opacity:.55 } }],
    { ...CT, margin:{ t:4, r:44, b:28, l:106 }, barmode:'group',
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:10} },
      yaxis:{ tickfont:{size:10} },
      legend:{ font:{size:10} } }
  );
}

function renderPartEvoChart() {
  if (!el('chart-part-evo')) return;
  Plotly.react('chart-part-evo',
    [{ type:'scatter', mode:'lines+markers', name:'Escola A',
       x: SIM_LABELS_CURTOS, y:[88,90,89,91,92],
       line:{ color:C.blue, width:3 }, marker:{ size:7, color:C.blue } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y:[82,84,83,85,87],
       line:{ color:C.slate, width:2, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:10} },
      yaxis:{ ticksuffix:'%', tickfont:{size:10}, gridcolor:C.border },
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
       line:{ color:C.blue, width:3 }, marker:{ size:7, color:C.blue } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       line:{ color:C.slate, width:2, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:10} },
      yaxis:{ ticksuffix:'%', tickfont:{size:10}, gridcolor:C.border },
      legend:{ font:{size:10} } },
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
       line:{ color:C.orange, width:3 }, marker:{ size:7, color:C.orange } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:10} },
      yaxis:{ tickfont:{size:10}, gridcolor:C.border, autorange:'reversed', dtick:1 },
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
  renderWithAnim('chart-desemp6-discs',
    [{ type:'bar', name: e.nome,
       y: discs, x: escolaVals, orientation:'h',
       marker:{ color:C.blue, opacity:.88 },
       text: escolaVals.map(v => v.toFixed(1) + '%'), textposition:'outside', textfont:{ size:10 },
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
  renderWithAnim('chart-desemp6-faixa',
    [{ type:'bar', orientation:'h', x: faixa, y: FAIXA_LABELS,
       marker:{ color: FAIXA_COLORS, opacity:.92 },
       text: faixa.map(v => v + '%'), textposition:'outside', textfont:{ size:11 },
    }],
    { ...CT, margin:{ t:4, r:44, b:16, l:96 },
      xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{ size:10 } },
      yaxis:{ tickfont:{ size:11 } },
    }
  );
}

function renderDesemp6EvoChart(key) {
  if (!el('chart-desemp6-evo')) return;
  const e = getEscola6(key);
  Plotly.react('chart-desemp6-evo',
    [{ type:'scatter', mode:'lines+markers', name: e.nome,
       x: SIM_LABELS_CURTOS, y: e.media,
       line:{ color:C.blue, width:3 }, marker:{ size:7, color:C.blue } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y: REDE_6_MEDIA,
       line:{ color:C.slate, width:2, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{ size:10 }, gridcolor:C.border },
      yaxis:{ ticksuffix:'%', tickfont:{ size:10 }, gridcolor:C.border },
      legend:{ font:{ size:10 } } },
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
  renderWithAnim('chart-aluno-area',
    [{ type:'bar', name:'Média alunos',
       y: disc, x: medias, orientation:'h',
       marker:{ color:C.blue, opacity:.88 } },
     { type:'scatter', mode:'lines', name:'Meta (60%)',
       x:[60,60,60,60,60], y: disc,
       line:{ color:C.orange, width:2, dash:'dot' }, hoverinfo:'skip' }],
    { ...CT, margin:{ t:4, r:44, b:16, l:112 },
      xaxis:{ range:[0,85], ticksuffix:'%', gridcolor:C.border, tickfont:{size:10} },
      yaxis:{ tickfont:{size:10} },
      legend:{ font:{size:10} } }
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
       line:{ color:C.blue, width:3 }, marker:{ size:7, color:C.blue } },
     { type:'scatter', mode:'lines', name:'Rede',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       line:{ color:C.slate, width:2, dash:'dot' } }],
    { ...CT, margin:M,
      xaxis:{ tickfont:{size:10}, gridcolor:C.border },
      yaxis:{ ticksuffix:'%', tickfont:{size:10}, gridcolor:C.border },
      legend:{ font:{size:10} } },
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
    renderWithAnim('chart-alunos-geral-faixa',
      [{ type:'bar', orientation:'h', x:[21,33,36,9,1], y: FAIXA_LABELS,
         marker:{ color: FAIXA_COLORS, opacity:.92 },
         text:['21%','33%','36%','9%','1%'], textposition:'outside', textfont:{ size:11 },
      }],
      { ...CT, margin:{ t:4, r:44, b:16, l:96 },
        xaxis:{ ticksuffix:'%', gridcolor:C.border, tickfont:{size:10} },
        yaxis:{ tickfont:{size:10} } }
    );
}

function renderAlunoEvoRedeChart() {
  if (!el('chart-alunos-evo-rede')) return;
  renderWithAnim('chart-alunos-evo-rede',
    [{ type:'bar', name:'Média',
       x: SIM_LABELS_CURTOS, y: REDE_MEDIA_SIM,
       marker:{ color:C.blue, opacity:.88 },
       text: REDE_MEDIA_SIM.map(v => v + '%'), textposition:'outside', textfont:{ size:11 },
    }],
    { ...CT, margin:{ t:6, r:8, b:32, l:40 },
      xaxis:{ tickfont:{size:11} },
      yaxis:{ ticksuffix:'%', tickfont:{size:10}, gridcolor:C.border } }
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

/* ── PROFESSORES — novos gráficos ─────────────────────────── */
function renderProfEvoIqChart(evoQI, tend) {
  if (!el('chart-prof-evo-iq')) return;
  const lineColor = tend === 'up' ? C.green : tend === 'down' ? C.red : C.orange;
  const fillColor = tend === 'up' ? 'rgba(21,128,61,0.07)' : tend === 'down' ? 'rgba(185,28,28,0.07)' : 'rgba(232,82,26,0.07)';
  Plotly.react('chart-prof-evo-iq',
    [{ type:'scatter', mode:'lines+markers',
       x: SIM_LABELS_CURTOS, y: evoQI,
       line:{ color: lineColor, width: 2.5 }, marker:{ size: 5 },
       fill:'tozeroy', fillcolor: fillColor,
    }],
    { ...CT, margin: M,
      xaxis:{ tickfont:{size:9} },
      yaxis:{ range:[0,100], tickfont:{size:9}, gridcolor: C.border },
    }, CFG
  );
}

function renderProfScatterChart(qs) {
  if (!el('chart-prof-scatter')) return;
  if (!qs.length) { Plotly.purge('chart-prof-scatter'); return; }
  const efiColor = q => q.efi >= 85 ? C.green : q.efi >= 70 ? C.blue : q.efi >= 55 ? C.amber : C.red;
  Plotly.react('chart-prof-scatter',
    [{ type:'scatter', mode:'markers',
       x: qs.map(q => q.acerto),
       y: qs.map(q => q.discriminante),
       text: qs.map(q => `S${q.sim}·Q${q.num}<br>${q.assunto}<br>EFI: ${q.efi}`),
       hoverinfo: 'text',
       marker:{ color: qs.map(efiColor), size: 8, opacity: 0.85 },
    }],
    { ...CT, margin:{ t:6, r:10, b:32, l:42 },
      xaxis:{ title:'Acerto (%)', ticksuffix:'%', tickfont:{size:9}, gridcolor: C.border, range:[0,100] },
      yaxis:{ title:'Discriminante', tickfont:{size:9}, gridcolor: C.border },
      shapes:[
        { type:'rect', x0:30, x1:70, y0:0, y1:1, xref:'x', yref:'paper', fillcolor:'rgba(16,185,129,0.05)', line:{width:0} },
        { type:'line', x0:0, x1:100, y0:0.28, y1:0.28, xref:'x', yref:'y', line:{ color:C.slate, width:1, dash:'dot' } },
      ],
    }, CFG
  );
}

function renderProfEfiDistChart(qs) {
  if (!el('chart-prof-efi-dist')) return;
  if (!qs.length) { Plotly.purge('chart-prof-efi-dist'); return; }
  const cats   = ['Excelente\n(≥85)', 'Boa\n(70–84)', 'Atenção\n(55–69)', 'Revisão\n(<55)'];
  const counts = [
    qs.filter(q => q.efi >= 85).length,
    qs.filter(q => q.efi >= 70 && q.efi < 85).length,
    qs.filter(q => q.efi >= 55 && q.efi < 70).length,
    qs.filter(q => q.efi < 55).length,
  ];
  const colors = [C.green, C.blue, C.amber, C.red];
  Plotly.react('chart-prof-efi-dist',
    [{ type:'bar', x: cats, y: counts,
       marker:{ color: colors, opacity: 0.85 },
       text: counts.map(c => c > 0 ? c : ''), textposition:'outside',
    }],
    { ...CT, margin:{ t:6, r:10, b:46, l:30 },
      xaxis:{ tickfont:{size:9} },
      yaxis:{ tickfont:{size:9}, gridcolor: C.border, dtick:1 },
    }, CFG
  );
}

function renderProfDifDistChart(qs) {
  if (!el('chart-prof-dif-dist')) return;
  const diffs  = ['Fácil','Médio','Médio-alto','Alto'];
  const counts = diffs.map(d => qs.filter(q => q.diff === d).length);
  const colors = [C.slate, C.blue, C.orange, C.red];
  Plotly.react('chart-prof-dif-dist',
    [{ type:'bar', x: counts, y: diffs, orientation:'h',
       marker:{ color: colors, opacity: 0.85 },
       text: counts.map(c => c > 0 ? c : ''), textposition:'outside',
    }],
    { ...CT, margin:{ t:6, r:28, b:28, l:80 },
      xaxis:{ tickfont:{size:9}, gridcolor: C.border, dtick:1 },
      yaxis:{ tickfont:{size:9} },
    }, CFG
  );
}

function renderProfAcertoQsChart(qs) {
  if (!el('chart-prof-acerto-qs')) return;
  if (!qs.length) { Plotly.purge('chart-prof-acerto-qs'); return; }
  const labels  = qs.map(q => `S${q.sim}·Q${q.num}`);
  const vals    = qs.map(q => q.acerto);
  const colors  = vals.map(v => v >= 30 && v <= 70 ? C.green : v > 80 ? C.slate : C.red);
  Plotly.react('chart-prof-acerto-qs',
    [{ type:'bar', x: labels, y: vals,
       marker:{ color: colors, opacity: 0.85 },
    }],
    { ...CT, margin:{ t:6, r:8, b:36, l:38 },
      xaxis:{ tickfont:{size:7.5}, tickangle:-45 },
      yaxis:{ ticksuffix:'%', range:[0,100], tickfont:{size:9}, gridcolor: C.border },
      shapes:[
        { type:'rect', x0:-0.5, x1:vals.length-0.5, y0:30, y1:70,
          fillcolor:'rgba(16,185,129,0.06)', line:{width:0} },
      ],
    }, CFG
  );
}

/* ── PROFESSORES — gráficos das 3 abas ── */
function renderProfMapaChart(qs) {
  if (!el('chart-prof-mapa')) return;
  if (!qs.length) { Plotly.purge('chart-prof-mapa'); return; }
  const efiColor = q => q.efi >= 85 ? C.green : q.efi >= 70 ? C.blue : q.efi >= 55 ? C.amber : C.red;
  Plotly.react('chart-prof-mapa',
    [{ type:'scatter', mode:'markers',
       x: qs.map(q => q.acerto),
       y: qs.map(q => q.discriminante),
       text: qs.map(q => `S${q.sim}·Q${q.num}<br>${q.assunto}<br>EFI ${q.efi} · Acerto ${q.acerto}%`),
       hoverinfo:'text',
       marker:{ color: qs.map(efiColor), size:9, opacity:0.88, line:{ color:'rgba(255,255,255,0.8)', width:1.5 } },
    }],
    { ...CT, margin:{ t:6, r:10, b:36, l:46 },
      xaxis:{ title:'Acerto (%)', ticksuffix:'%', tickfont:{size:9}, gridcolor:C.border, range:[0,100] },
      yaxis:{ title:'Discriminante', tickfont:{size:9}, gridcolor:C.border },
      shapes:[
        { type:'rect',  x0:30, x1:70, y0:0.28, y1:1,   xref:'x', yref:'y',      fillcolor:'rgba(16,185,129,0.06)', line:{width:0} },
        { type:'line',  x0:0,  x1:100, y0:0.28, y1:0.28, xref:'x', yref:'y',    line:{ color:C.slate, width:1, dash:'dot' } },
        { type:'line',  x0:30, x1:30, y0:0, y1:1, xref:'x', yref:'paper', line:{ color:C.slate, width:1, dash:'dot' } },
        { type:'line',  x0:70, x1:70, y0:0, y1:1, xref:'x', yref:'paper', line:{ color:C.slate, width:1, dash:'dot' } },
      ],
    }, CFG
  );
}

function renderProfEfiDonutChart(qs) {
  if (!el('chart-prof-efi-donut')) return;
  if (!qs.length) { Plotly.purge('chart-prof-efi-donut'); return; }
  const values = [
    qs.filter(q => q.efi >= 85).length,
    qs.filter(q => q.efi >= 70 && q.efi < 85).length,
    qs.filter(q => q.efi >= 55 && q.efi < 70).length,
    qs.filter(q => q.efi < 55).length,
  ];
  Plotly.react('chart-prof-efi-donut',
    [{ type:'pie', values,
       labels:['Excelente (≥85)', 'Boa (70–84)', 'Atenção (55–69)', 'Revisão (<55)'],
       marker:{ colors:[C.green, C.blue, C.amber, C.red] },
       hole:.52, textinfo:'value', textfont:{size:10},
       hoverinfo:'label+percent', sort:false,
    }],
    { ...CT, margin:{ t:4, r:4, b:4, l:4 }, showlegend:true,
      legend:{ font:{size:8.5}, orientation:'v', x:1.02, y:.5 },
    }, CFG
  );
}

function renderProfFrenteEvoChart(evoAcerto, redeAcerto, tend) {
  if (!el('chart-prof-frente-evo')) return;
  const lineColor = tend === 'up' ? C.green : tend === 'down' ? C.red : C.orange;
  Plotly.react('chart-prof-frente-evo',
    [{ type:'scatter', mode:'lines+markers', name:'Frente',
       x: SIM_LABELS_CURTOS, y: evoAcerto,
       line:{ color:lineColor, width:2.5 }, marker:{ size:5 },
    },
    { type:'scatter', mode:'lines', name:'Média rede',
      x: SIM_LABELS_CURTOS, y: redeAcerto,
      line:{ color:C.slate, width:1.5, dash:'dot' },
    }],
    { ...CT, margin:{ t:24, r:10, b:32, l:42 },
      xaxis:{ tickfont:{size:9} },
      yaxis:{ ticksuffix:'%', range:[0,100], tickfont:{size:9}, gridcolor:C.border },
      legend:{ font:{size:9}, orientation:'h', x:0, y:1.15 },
    }, CFG
  );
}

function renderProfAssuntosChart(assuntos) {
  if (!el('chart-prof-assuntos')) return;
  if (!assuntos.length) { Plotly.purge('chart-prof-assuntos'); return; }
  const vals   = assuntos.map(a => a.acertoMedio);
  const labels = assuntos.map(a => a.comp);
  const colors = vals.map(v => v >= 60 ? C.green : v >= 40 ? C.blue : C.red);
  Plotly.react('chart-prof-assuntos',
    [{ type:'bar', orientation:'h',
       x: vals, y: labels,
       marker:{ color:colors, opacity:0.85 },
       text: vals.map(v => v + '%'), textposition:'outside',
    }],
    { ...CT, margin:{ t:6, r:44, b:28, l:110 },
      xaxis:{ ticksuffix:'%', range:[0,110], tickfont:{size:9}, gridcolor:C.border },
      yaxis:{ tickfont:{size:9} },
      shapes:[
        { type:'line', x0:40, x1:40, y0:0, y1:1, xref:'x', yref:'paper', line:{ color:C.slate, width:1, dash:'dot' } },
      ],
    }, CFG
  );
}

/* ── PROFESSORES v2 — novos gráficos ─────────────────────── */

function renderProfMapaV2Chart(qs) {
  if (!el('chart-prof-mapa-v2')) return;
  if (!qs.length) { Plotly.purge('chart-prof-mapa-v2'); return; }

  const zoneColor = q => {
    if (q.acerto >= 40 && q.acerto <= 75 && q.discriminante >= 0.28) return C.green;
    if (q.acerto < 40 && q.discriminante >= 0.28) return C.amber;
    if (q.acerto > 75 && q.discriminante < 0.28) return C.slate;
    return C.red;
  };

  Plotly.react('chart-prof-mapa-v2',
    [{
      type: 'scatter', mode: 'markers+text',
      x: qs.map(q => q.acerto),
      y: qs.map(q => q.discriminante),
      text: qs.map(q => `S${q.sim}·Q${q.num}`),
      textposition: 'top center',
      textfont: { size: 8, color: '#64748b' },
      marker: {
        color: qs.map(zoneColor),
        size: qs.map(q => 8 + q.distPct / 8),
        opacity: 0.85,
        line: { color: '#fff', width: 1.5 },
      },
      hovertemplate: '<b>%{text}</b><br>Acerto: %{x}%<br>Disc: %{y:.2f}<extra></extra>',
    }],
    {
      ...CT,
      margin: { t: 10, r: 16, b: 40, l: 44 },
      xaxis: { title: { text: 'Acerto (%)', font: { size: 10 } }, range: [0, 105], ticksuffix: '%', tickfont: { size: 9 }, gridcolor: C.border },
      yaxis: { title: { text: 'Discriminante', font: { size: 10 } }, range: [0, 0.6], tickfont: { size: 9 }, gridcolor: C.border },
      shapes: [
        { type:'rect', x0:40, x1:75, y0:0.28, y1:0.6, xref:'x', yref:'y', fillcolor:'rgba(22,163,74,.07)', line:{color:'rgba(22,163,74,.25)', width:1} },
        { type:'line', x0:40, x1:40, y0:0, y1:0.6, xref:'x', yref:'y', line:{color:C.slate, width:1, dash:'dot'} },
        { type:'line', x0:75, x1:75, y0:0, y1:0.6, xref:'x', yref:'y', line:{color:C.slate, width:1, dash:'dot'} },
        { type:'line', x0:0, x1:105, y0:0.28, y1:0.28, xref:'x', yref:'y', line:{color:C.slate, width:1, dash:'dot'} },
      ],
    }, CFG
  );
}

function renderProfArqChart(qs) {
  if (!el('chart-prof-arq')) return;
  if (!qs.length) { Plotly.purge('chart-prof-arq'); return; }

  const diffs = ['Fácil', 'Médio', 'Médio-alto', 'Alto'];
  const qualidades = ['excelente', 'boa', 'atencao', 'revisao'];
  const qColors = { excelente: C.green, boa: C.blue, atencao: C.amber, revisao: C.red };
  const qLabels = { excelente: 'Excelente', boa: 'Boa', atencao: 'Atenção', revisao: 'Revisão' };

  const traces = qualidades.map(q => ({
    type: 'bar', name: qLabels[q],
    x: diffs,
    y: diffs.map(d => qs.filter(i => i.diff === d && i.status === q).length),
    marker: { color: qColors[q], opacity: 0.85 },
  }));

  Plotly.react('chart-prof-arq', traces,
    {
      ...CT,
      barmode: 'stack',
      margin: { t: 8, r: 16, b: 40, l: 36 },
      xaxis: { tickfont: { size: 9 }, gridcolor: C.border },
      yaxis: { tickfont: { size: 9 }, gridcolor: C.border, dtick: 1 },
      legend: { orientation: 'h', y: -0.25, font: { size: 9 } },
    }, CFG
  );
}

function renderProfDistV2Chart(qs) {
  if (!el('chart-prof-dist-v2')) return;
  if (!qs.length) { Plotly.purge('chart-prof-dist-v2'); return; }

  const sorted = [...qs].filter(q => q.distPct > 0).sort((a, b) => b.distPct - a.distPct).slice(0, 12);
  const labels  = sorted.map(q => `S${q.sim}·Q${q.num}`);
  const vals    = sorted.map(q => q.distPct);
  const colors  = sorted.map(q => q.distPct > 35 ? C.red : q.distPct >= 15 ? C.green : C.slate);

  Plotly.react('chart-prof-dist-v2',
    [{
      type: 'bar', orientation: 'h',
      x: vals, y: labels,
      marker: { color: colors, opacity: 0.85 },
      text: vals.map(v => v + '%'), textposition: 'outside',
    }],
    {
      ...CT,
      margin: { t: 8, r: 44, b: 28, l: 64 },
      xaxis: { ticksuffix: '%', range: [0, 55], tickfont: { size: 9 }, gridcolor: C.border },
      yaxis: { tickfont: { size: 8 } },
      shapes: [
        { type:'line', x0:15, x1:15, y0:0, y1:1, xref:'x', yref:'paper', line:{color:C.green, width:1.5, dash:'dot'} },
        { type:'line', x0:35, x1:35, y0:0, y1:1, xref:'x', yref:'paper', line:{color:C.red, width:1.5, dash:'dot'} },
      ],
    }, CFG
  );
}

function renderProfFaixasChart(qs) {
  if (!el('chart-prof-faixas')) return;
  if (!qs.length) { Plotly.purge('chart-prof-faixas'); return; }

  const ideal   = qs.filter(q => q.acerto >= 40 && q.acerto <= 75 && q.discriminante >= 0.28).length;
  const difDiag = qs.filter(q => q.acerto < 40 && q.discriminante >= 0.28).length;
  const facil   = qs.filter(q => q.acerto > 75 && q.discriminante < 0.28).length;
  const revisao = qs.filter(q => q.status === 'revisao').length;
  const outros  = qs.length - ideal - difDiag - facil - revisao;

  Plotly.react('chart-prof-faixas',
    [{
      type: 'pie',
      labels: ['Zona ideal', 'Difícil + diagnóstico', 'Fácil – pouco info', 'Revisão técnica', 'Outros'],
      values: [ideal, difDiag, facil, revisao, Math.max(0, outros)],
      hole: 0.55,
      marker: { colors: [C.green, C.amber, C.slate, C.red, '#e2e8f0'] },
      textinfo: 'percent',
      textfont: { size: 9 },
      hovertemplate: '<b>%{label}</b><br>%{value} item(ns) (%{percent})<extra></extra>',
    }],
    {
      ...CT,
      margin: { t: 8, r: 8, b: 8, l: 8 },
      showlegend: false,
      annotations: [{
        text: `<b>${qs.length}</b><br><span style="font-size:8px">itens</span>`,
        x: 0.5, y: 0.5, showarrow: false, font: { size: 12 }, xanchor: 'center', yanchor: 'middle',
      }],
    }, CFG
  );
}

/* ── PROFESSORES — gráficos legados (mantidos para compatibilidade) ── */
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
  const redeRef  = simIdx >= 0 ? simIdx : 4;
  const discData = (simIdx >= 0 && aluno.simDiscs) ? aluno.simDiscs[simIdx] : aluno.discs;
  const prim     = aluno.nome.split(' ')[0];
  const vals     = _AR_DISCS.map(d => discData[d] || 0);
  const rede     = _AR_DISCS.map(d => (REDE_6_DISC_SIM[d] || [0,0,0,0,0])[redeRef]);

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
