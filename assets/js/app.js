/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Controlador Principal
   Navegação, tabs, eventos DOM, inicialização.
   Depende de: data.js, inference.js, charts.js, filters.js
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── UTILITÁRIO (el() já definido em charts.js) ─────────────── */

/* Questões do simulado ativo — atualiza ao trocar de simulado */
var _SIM_Q = [];

/* Tipo de gráfico ativo na aba Evolução */
var _evoTipo = 'media';

/* ── NAVEGAÇÃO ─────────────────────────────────────────────── */
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = el('page-' + page);
  if (pageEl) pageEl.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.dataset.page === page) n.classList.add('active');
  });

  S.currentPage = page;

  // Primeira visita: inicializa o conteúdo da página
  switch (page) {
    case 'dashboard':   _initDashboard();   break;
    case 'simulados':   _initSimulados();   break;
    case 'escolas':     _initEscolas();     break;
    case 'alunos':      _initAlunos();      break;
    case 'professores': _initProfessores(); break;
  }
}

/* ── INICIALIZADORES DE PÁGINA ────────────────────────────── */
function _initDashboard() {
  _renderDashboard(S.simId);
}

function _initSimulados() {
  _SIM_Q = (typeof getQuestoesForSim === 'function') ? getQuestoesForSim(S.simId) : QUESTOES.map(q => ({...q}));
  _populateSimSelect();
  _buildSimExecStrip();
  _buildSimSummaryStats();
  buildQGrid();
  selectQ(0);
  _buildSimSignals();
  S.simTab = 'anatomia';
}

function refreshSimuladosPage() {
  const pageEl = el('page-simulados');
  if (pageEl) pageEl.classList.add('is-updating');

  _SIM_Q = (typeof getQuestoesForSim === 'function') ? getQuestoesForSim(S.simId) : QUESTOES.map(q => ({...q}));
  _buildSimExecStrip();
  _buildSimSummaryStats();
  buildQGrid();
  _buildSimSignals();
  selectQ(0);
  if (S.simTab === 'disciplinas') _buildDisciplinasContent();
  if (S.simTab === 'evolucao')    renderEvolucaoCharts(_evoTipo);

  setTimeout(() => { if (pageEl) pageEl.classList.remove('is-updating'); }, 220);
}

function switchSimTab(tab, tabEl) {
  S.simTab = tab;
  document.querySelectorAll('.stc').forEach(c => c.classList.remove('stc-active'));
  document.querySelectorAll('[data-simtab]').forEach(t => t.classList.remove('active'));
  const stcEl = document.getElementById('stc-' + tab);
  if (stcEl) stcEl.classList.add('stc-active');
  if (tabEl) tabEl.classList.add('active');
  // Hide simulado filter bar on Evolução — aba mostra todos os simulados
  const fbarEl = document.querySelector('#page-simulados .fbar');
  if (fbarEl) fbarEl.style.display = tab === 'evolucao' ? 'none' : '';
  if (tab === 'disciplinas') _buildDisciplinasContent();
  if (tab === 'evolucao') {
    renderEvolucaoCharts(_evoTipo);
    setTimeout(() => {
      document.querySelectorAll('[id^="evo-chart-"]').forEach(d => {
        if (typeof Plotly !== 'undefined') Plotly.Plots.resize(d);
      });
    }, 60);
  }
}

function _buildSimKpiStrip() {
  const simIdx = _simIdx();
  const d      = DASH_SIM_DATA[S.simId];
  const src    = _SIM_Q.length ? _SIM_Q : QUESTOES;

  _setKpi('sk-part',      d ? d.presencaNum  : '—');
  _setKpi('sk-part-note', d ? d.presencaNote : '—');

  const media = REDE_MEDIA_SIM[simIdx] ?? 0;
  _setKpi('sk-media',      media.toFixed(1) + '%');
  _setKpi('sk-media-note', simIdx > 0 ? 'vs. ' + REDE_MEDIA_SIM[simIdx-1].toFixed(1) + '% anterior' : 'Linha de base');

  const varPp = simIdx > 0 ? media - REDE_MEDIA_SIM[simIdx-1] : null;
  _setKpi('sk-var',      varPp !== null ? (varPp >= 0 ? '+' : '') + varPp.toFixed(1) + ' p.p.' : '—');
  _setKpi('sk-var-note', varPp !== null ? (varPp >= 0 ? 'Crescimento' : 'Queda') : 'Primeiro simulado');

  const avgAcerto = src.reduce((s, q) => s + q.acerto, 0) / src.length;
  _setKpi('sk-diff',      avgAcerto.toFixed(1) + '%');
  _setKpi('sk-diff-note', avgAcerto < 44 ? 'Baixo — atenção' : avgAcerto > 65 ? 'Alto — consolidado' : 'Dentro do esperado');

  const criticas = src.filter(q => q.status === 'crit').length;
  _setKpi('sk-crit',      criticas);
  _setKpi('sk-crit-note', criticas > 10 ? 'Atenção prioritária' : criticas > 5 ? 'Monitorar' : 'Aceitável');

  const byDisc = {};
  src.forEach(q => {
    if (!byDisc[q.disc]) byDisc[q.disc] = [];
    byDisc[q.disc].push(q.acerto);
  });
  let fragilDisc = '—', fragilMedia = 100;
  Object.entries(byDisc).forEach(([disc, arr]) => {
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    if (avg < fragilMedia) { fragilMedia = avg; fragilDisc = disc; }
  });
  _setKpi('sk-fragil',      fragilDisc);
  _setKpi('sk-fragil-note', fragilMedia.toFixed(1) + '% de acerto médio');
}

function _buildSimSignals() {
  const src       = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const baixaDisc = src.filter(q => q.discriminante < 0.24).length;
  const criticas  = src.filter(q => q.status === 'crit').length;
  const distDom   = src.filter(q => q.distPct >= 27).length;
  const faceis    = src.filter(q => q.acerto >= 76).length;
  _setKpi('sig-baixa-disc', baixaDisc);
  _setKpi('sig-criticas',   criticas);
  _setKpi('sig-distratores',distDom);
  _setKpi('sig-faceis',     faceis);
}

function _initEscolas() {
  switchEscolaTab('visao-geral', document.querySelector('.escola-atab[data-tab="visao-geral"]'));
}

/* ── ESCOLAS — CONSTRUTORES DE TAB ────────────────────────── */
function _buildEscolasVisaoGeral() {
  const filtro  = S.escolaVisaoFiltroSimulado;
  const isAcum  = filtro === 'acumulado';
  const si      = isAcum ? 4 : parseInt(filtro, 10);
  const simLabel = isAcum ? 'Geral acumulado' : SIM_LABELS_CURTOS[si];

  const getMedia = e => isAcum ? getEscola6MediaAcum(e.key) : e.media[si];
  const getPres  = e => isAcum ? getEscola6PresAcum(e.key) : e.presenca[si];
  const mediaRede = isAcum
    ? parseFloat((REDE_6_MEDIA.reduce((s, v) => s + v, 0) / 5).toFixed(1))
    : REDE_6_MEDIA[si];

  const topMedia   = ESCOLAS_6.slice().sort((a, b) => getMedia(b) - getMedia(a))[0];
  const topPres    = ESCOLAS_6.slice().sort((a, b) => getPres(b) - getPres(a))[0];
  // Attention: below rede OR presence < 80 OR net decline in selected period
  const attEscolas = ESCOLAS_6.filter(e => {
    if (getMedia(e) < mediaRede) return true;
    if (getPres(e) < 80)         return true;
    if (isAcum && e.media[4] < e.media[0]) return true;
    if (!isAcum && si > 0 && e.media[si] < e.media[si - 1]) return true;
    return false;
  });

  const getEvo  = e => isAcum ? e.media[4] - e.media[0] : si > 0 ? e.media[si] - e.media[si - 1] : 0;
  const maisEvoluiu = ESCOLAS_6.slice().sort((a, b) => getEvo(b) - getEvo(a))[0];
  const evoVal      = getEvo(maisEvoluiu);

  // Weakest discipline by average gap (escola avg - rede) across all schools
  const discGaps = DISCIPLINAS_6.map(d => {
    const arr     = REDE_6_DISC_SIM[d];
    const redeVal = arr
      ? (isAcum ? parseFloat((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : arr[si])
      : 0;
    const belowCount = ESCOLAS_6.filter(e => {
      const v = isAcum ? (getEscola6DiscAcum(e.key, d) ?? redeVal) : (ESCOLA_6_DISCS[e.key]?.[d]?.[si] ?? redeVal);
      return v < redeVal;
    }).length;
    const avgEscola = ESCOLAS_6.reduce((s, e) => {
      const v = isAcum ? (getEscola6DiscAcum(e.key, d) ?? redeVal) : (ESCOLA_6_DISCS[e.key]?.[d]?.[si] ?? redeVal);
      return s + v;
    }, 0) / ESCOLAS_6.length;
    return { disc: d, redeVal, avgGap: parseFloat((avgEscola - redeVal).toFixed(1)), belowCount };
  });
  const critDisc = discGaps.slice().sort((a, b) => a.avgGap - b.avgGap)[0];

  _setKpi('vg-kpi-media',             mediaRede.toFixed(1) + '%');
  _setKpi('vg-kpi-media-note',        simLabel);
  _setKpi('vg-kpi-top-media',         topMedia.nome);
  _setKpi('vg-kpi-top-media-note',    getMedia(topMedia).toFixed(1) + '%');
  _setKpi('vg-kpi-top-presenca',      topPres.nome);
  _setKpi('vg-kpi-top-presenca-note', getPres(topPres) + '% presença');
  _setKpi('vg-kpi-evolucao',          maisEvoluiu.nome);
  _setKpi('vg-kpi-evolucao-note',     '+' + evoVal.toFixed(1) + (isAcum ? ' p.p. (1º→5º)' : ' p.p. vs anterior'));
  _setKpi('vg-kpi-atencao',           attEscolas.length);

  const atencaoNote = attEscolas.length === 0
    ? 'rede dentro do esperado'
    : isAcum  ? 'abaixo da média ou presença crítica'
    : si === 0 ? 'recorte inicial da rede'
    : si === 4 ? 'queda ou presença baixa no ciclo atual'
    :            'queda ou presença abaixo do esperado';
  _setKpi('vg-kpi-atencao-note', atencaoNote);

  // Shared SVG icons
  const ICO_UP    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`;
  const ICO_TREND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
  const ICO_ALERT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  const ICO_DOWN  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
  const ICO_INFO  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  const acima  = ESCOLAS_6.filter(e => getMedia(e) >= mediaRede).length;
  const abaixo = ESCOLAS_6.length - acima;

  // Panorama accordion
  const panorama = el('vg-panorama');
  if (panorama) {
    let redeVar;
    if (isAcum) {
      redeVar = '+' + (REDE_6_MEDIA[4] - REDE_6_MEDIA[0]).toFixed(1) + ' p.p. (1º→5º)';
    } else if (si > 0) {
      const rv = parseFloat((REDE_6_MEDIA[si] - REDE_6_MEDIA[si - 1]).toFixed(1));
      redeVar = (rv >= 0 ? '+' : '') + rv.toFixed(1) + ' p.p.';
    } else {
      redeVar = 'Linha de base';
    }
    const periodoLabel = isAcum ? '1º → 5º simulado'
      : si > 0 ? SIM_LABELS_CURTOS[si - 1] + ' → ' + SIM_LABELS_CURTOS[si]
      : 'Linha de base';

    panorama.innerHTML =
      _buildVgAccordionItem('blue', ICO_INFO,
        'Média da rede: ' + mediaRede.toFixed(1) + '%', null,
        acima + ' escola' + (acima !== 1 ? 's' : '') + ' acima · ' + abaixo + ' abaixo · ' + simLabel,
        [
          { label: 'Recorte',          val: simLabel },
          { label: 'Escolas acima',    val: acima + ' de ' + ESCOLAS_6.length, cls: 'pos' },
          { label: 'Escolas abaixo',   val: abaixo + ' de ' + ESCOLAS_6.length, cls: abaixo > 2 ? 'neg' : 'warn' },
          { label: 'Variação da rede', val: redeVar, cls: 'pos' },
        ]
      ) +
      _buildVgAccordionItem('green', ICO_UP,
        topMedia.nome + ' — Líder da rede', 'var(--green)',
        getMedia(topMedia).toFixed(1) + '% · forte em ' + topMedia.forte,
        [
          { label: 'Média',         val: getMedia(topMedia).toFixed(1) + '%', cls: 'pos' },
          { label: 'Vs. rede',      val: '+' + (getMedia(topMedia) - mediaRede).toFixed(1) + ' p.p.', cls: 'pos' },
          { label: 'Presença',      val: getPres(topMedia) + '%' },
          { label: 'Ponto forte',   val: topMedia.forte },
        ]
      ) +
      _buildVgAccordionItem('blue', ICO_TREND,
        'Maior crescimento' + (isAcum ? ' acumulado' : ' neste simulado'), null,
        maisEvoluiu.nome + ': +' + evoVal.toFixed(1) + ' p.p.',
        [
          { label: 'Escola',        val: maisEvoluiu.nome },
          { label: 'Crescimento',   val: '+' + evoVal.toFixed(1) + ' p.p.', cls: 'pos' },
          { label: 'Período',       val: periodoLabel },
          { label: 'Média atual',   val: getMedia(maisEvoluiu).toFixed(1) + '%' },
        ]
      ) +
      _buildVgAccordionItem('amber', ICO_ALERT,
        critDisc.disc + ' — disciplina mais crítica', null,
        critDisc.belowCount + ' escola' + (critDisc.belowCount !== 1 ? 's' : '') + ' abaixo da rede',
        [
          { label: 'Média da rede',  val: critDisc.redeVal.toFixed(1) + '%' },
          { label: 'Escolas abaixo', val: critDisc.belowCount + ' de ' + ESCOLAS_6.length, cls: critDisc.belowCount > 3 ? 'neg' : 'warn' },
          { label: 'Desvio médio',   val: (critDisc.avgGap >= 0 ? '+' : '') + critDisc.avgGap + ' p.p.', cls: critDisc.avgGap < 0 ? 'neg' : 'pos' },
        ]
      );
  }

  // Prioridades accordion
  const prioEl = el('vg-prioridades');
  if (prioEl) {
    const quedaEscola = (si > 0 || isAcum)
      ? ESCOLAS_6.slice().sort((a, b) => getEvo(a) - getEvo(b))[0]
      : null;
    const quedaVal = quedaEscola ? getEvo(quedaEscola) : 0;
    const attKeys  = new Set(attEscolas.map(e => e.key));

    let html = attEscolas.slice(0, 3).map(e => {
      const diff = parseFloat((getMedia(e) - mediaRede).toFixed(1));
      return _buildVgAccordionItem('amber', ICO_ALERT,
        e.nome + ' — atenção pedagógica', null,
        getMedia(e).toFixed(1) + '% · ' + getPres(e) + '% presença · fraco em ' + e.fraco,
        [
          { label: 'Média',           val: getMedia(e).toFixed(1) + '%', cls: diff < 0 ? 'neg' : 'warn' },
          { label: 'Vs. rede',        val: (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' p.p.', cls: diff < 0 ? 'neg' : '' },
          { label: 'Presença',        val: getPres(e) + '%', cls: getPres(e) < 80 ? 'warn' : '' },
          { label: 'Alunos em risco', val: '' + e.alunosAtencao },
          { label: 'Fragilidade',     val: e.fraco },
        ]
      );
    }).join('');

    if (quedaEscola && quedaVal < 0 && !attKeys.has(quedaEscola.key)) {
      html += _buildVgAccordionItem('red', ICO_DOWN,
        quedaEscola.nome + ' — queda detectada', null,
        quedaVal.toFixed(1) + ' p.p. ' + (isAcum ? '(1º→5º)' : 'vs. simulado anterior'),
        [
          { label: 'Queda',       val: quedaVal.toFixed(1) + ' p.p.', cls: 'neg' },
          { label: 'Média atual', val: getMedia(quedaEscola).toFixed(1) + '%' },
          { label: 'Fragilidade', val: quedaEscola.fraco },
        ]
      );
    }

    html += _buildVgAccordionItem('green', ICO_UP,
      topMedia.nome + ' — Referência da rede', 'var(--green)',
      'Pode ser modelo compartilhado com a rede',
      [
        { label: 'Média',        val: getMedia(topMedia).toFixed(1) + '%', cls: 'pos' },
        { label: 'Acima da rede',val: '+' + (getMedia(topMedia) - mediaRede).toFixed(1) + ' p.p.', cls: 'pos' },
        { label: 'Ponto forte',  val: topMedia.forte },
        { label: 'Presença',     val: getPres(topMedia) + '%' },
      ]
    );

    prioEl.innerHTML = html;
  }
}

function _buildEscolasRanking() {
  const metric      = S.escolaRankingMetrica || 'geral';
  const rank        = getEscola6RankData(metric);
  const metricLabel = metric === 'geral' ? 'média geral' : metric === 'presenca' ? 'presença' : metric;
  const liderData   = getEscola6LiderMetrica(metric);

  const titleEl = el('rank6-title');
  if (titleEl) titleEl.textContent = 'Ranking por ' + metricLabel;

  const tbody = el('rank6-tbody');
  if (tbody) {
    tbody.innerHTML = rank.map(r => {
      const varH  = r.variacao >= 0
        ? `<span style="color:var(--green);font-weight:700">↑ +${r.variacao.toFixed(1)}</span>`
        : `<span style="color:var(--red);font-weight:700">↓ ${r.variacao.toFixed(1)}</span>`;
      const sc    = r.tagClass === 'above' ? 'badge-above' : r.tagClass === 'avg' ? 'badge-avg' : 'badge-att';
      const val   = metric === 'presenca' ? r.valor + '%' : r.valor.toFixed(1) + '%';
      const nota  = metric === 'geral' ? r.forte : metric === 'presenca' ? r.tag : r.forte;
      return `<tr>
        <td class="rpos">${r.pos}º</td>
        <td class="bold">${r.nome}</td>
        <td class="bold">${val}</td>
        <td>${varH}</td>
        <td><span class="badge ${sc}">${r.tag}</span></td>
        <td style="font-size:11px;color:var(--t3)">${nota}</td>
      </tr>`;
    }).join('');
  }

  const insEl = el('rank6-insights');
  if (insEl) {
    const leader     = rank[0];
    const last       = rank[rank.length - 1];
    const crescLabel = metric === 'presenca'
      ? 'maior crescimento de presença'
      : metric === 'geral'
        ? 'maior crescimento acumulado'
        : `maior crescimento em ${metric}`;
    const leaderVal  = metric === 'presenca' ? leader.valor + '%' : leader.valor.toFixed(1) + '%';
    const crescVal   = (liderData.crescimento >= 0 ? '+' : '') + liderData.crescimento.toFixed(1) + ' p.p.';
    insEl.innerHTML =
      `<div class="pi">
        <div class="pi-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg></div>
        <div>
          <div class="pi-name" style="color:var(--green)">${leader.nome} — 1º lugar em ${metricLabel}</div>
          <div class="pi-sub">${leaderVal} · forte em ${leader.forte}</div>
        </div>
      </div>
      <div class="pi">
        <div class="pi-ico blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div>
          <div class="pi-name">${liderData.liderCrescimento.nome} — ${crescLabel}</div>
          <div class="pi-sub">${crescVal} (1º → 5º simulado)</div>
        </div>
      </div>
      <div class="pi">
        <div class="pi-ico amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
        <div>
          <div class="pi-name">${last.nome} — Atenção prioritária em ${metricLabel}</div>
          <div class="pi-sub">${metric === 'presenca' ? last.valor + '%' : last.valor.toFixed(1) + '%'} · ${last.alunosAtencao} alunos em risco</div>
        </div>
      </div>`;
  }

  const notaEl = el('rank6-nota');
  if (notaEl) {
    const acima = rank.filter(r => r.tagClass === 'above').length;
    const att   = rank.filter(r => r.tagClass === 'att').length;
    notaEl.textContent = `${acima} escola${acima !== 1 ? 's' : ''} acima da média da rede em ${metricLabel}.` +
      (att > 0 ? ` ${att} escola${att !== 1 ? 's' : ''} requerem atenção.` : ' Demais escolas estão na média.');
  }
}

function _buildEscolasDesempenho() {
  const key    = S.escolaDesempenhoEscola   || 'a';
  const sim    = S.escolaDesempenhoSimulado;
  const isAcum = sim === 'acumulado';
  const si     = isAcum ? null : parseInt(sim, 10);
  const e      = getEscola6(key);

  const media = isAcum ? getEscola6MediaAcum(key) : e.media[si];
  const rede  = isAcum
    ? parseFloat((REDE_6_MEDIA.reduce((s, v) => s + v, 0) / 5).toFixed(1))
    : REDE_6_MEDIA[si];
  const diff  = parseFloat((media - rede).toFixed(1));
  const pres  = isAcum ? getEscola6PresAcum(key) : e.presenca[si];
  const rank  = getEscola6RankPos(key, sim);

  let mediaNote, presNote, rankNote;
  if (isAcum) {
    const varAcum    = parseFloat((e.media[4] - e.media[0]).toFixed(1));
    const presVarAcum = e.presenca[4] - e.presenca[0];
    mediaNote = (varAcum >= 0 ? '+' : '') + varAcum + ' p.p. (1º→5º sim.)';
    presNote  = (presVarAcum >= 0 ? '+' : '') + presVarAcum + ' p.p. (1º→5º sim.)';
    rankNote  = 'posição acumulada';
  } else if (si > 0) {
    const varSi = parseFloat((media - e.media[si - 1]).toFixed(1));
    const pp    = pres - e.presenca[si - 1];
    mediaNote = (varSi >= 0 ? '+' : '') + varSi + ' p.p. vs. ' + SIM_LABELS_CURTOS[si - 1];
    presNote  = (pp >= 0 ? '+' : '') + pp + ' p.p. vs. anterior';
    rankNote  = 'no ' + SIM_LABELS_CURTOS[si];
  } else {
    mediaNote = 'Linha de base';
    presNote  = 'Linha de base';
    rankNote  = 'no ' + SIM_LABELS_CURTOS[0];
  }

  _setKpi('desemp6-media',      media.toFixed(1) + '%');
  _setKpi('desemp6-media-note', mediaNote);
  _setKpi('desemp6-rede',       rede.toFixed(1) + '%');

  const diffEl = el('desemp6-diff');
  if (diffEl) {
    diffEl.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' p.p.';
    diffEl.style.color = diff >= 0 ? 'var(--green)' : 'var(--red)';
  }

  _setKpi('desemp6-rank',      rank + 'º / ' + ESCOLAS_6.length);
  _setKpi('desemp6-rank-note', rankNote);
  _setKpi('desemp6-part',      pres + '%');
  _setKpi('desemp6-part-note', presNote);

  const titleEl = el('desemp6-evo-title');
  if (titleEl) titleEl.textContent = 'Evolução da média — ' + e.nome;

  const subEl = el('desemp6-discs-sub');
  if (subEl) subEl.textContent = isAcum
    ? 'Média acumulada por disciplina (5 simulados)'
    : 'Desempenho por disciplina — ' + SIM_LABELS_CURTOS[si];

  if (typeof renderDesemp6EvoChart   === 'function') renderDesemp6EvoChart(key);
  if (typeof renderDesemp6DiscsChart === 'function') renderDesemp6DiscsChart(key, si, isAcum);
  if (typeof renderDesemp6FaixaChart === 'function') renderDesemp6FaixaChart(key, si, isAcum);

  const notaEl = el('desemp6-nota');
  if (notaEl) {
    const simStr = isAcum ? 'em média ao longo dos 5 simulados' : 'no ' + SIM_LABELS_CURTOS[si];
    notaEl.textContent = `${e.nome} teve ${media.toFixed(1)}% ${simStr}, ` +
      `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} p.p. vs. rede. ` +
      `Presença: ${pres}%. Ranking: ${rank}º na rede.`;
  }
}

function _buildEscolasComponentes() {
  const key  = S.escolaComponentesEscola       || 'a';
  const disc = S.escolaComponentesDisciplina   || 'Todas';
  const e    = getEscola6(key);

  const titleEl = el('comp6-title');
  if (titleEl) titleEl.textContent = disc === 'Todas'
    ? `Componentes — Visão geral · ${e.nome}`
    : `Componentes — ${disc} · ${e.nome}`;

  const subEl = el('comp6-sub');
  if (subEl) subEl.textContent = disc === 'Todas'
    ? 'Análise por disciplina — pontos fortes e fragilidades da escola'
    : 'Análise detalhada dos componentes curriculares';

  const contentEl = el('comp6-content');
  if (contentEl) {
    if (disc === 'Todas') {
      contentEl.innerHTML =
        `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:4px">` +
        DISCIPLINAS_6.map(d => {
          const comps = ESCOLA_6_COMP[key]?.[d] ?? [];
          if (!comps.length) return '';
          const avg    = comps.reduce((s, c) => s + (c.acerto - c.rede), 0) / comps.length;
          const sc     = avg > 3 ? 'badge-above' : avg < -3 ? 'badge-crit' : avg >= 0 ? 'badge-avg' : 'badge-att';
          const st     = avg > 3 ? 'Acima' : avg < -3 ? 'Crítico' : avg >= 0 ? 'Na média' : 'Atenção';
          const acu    = getEscola6DiscAcum(key, d);
          const redeArr = REDE_6_DISC_SIM[d];
          const redeAcu = redeArr
            ? parseFloat((redeArr.reduce((s, v) => s + v, 0) / redeArr.length).toFixed(1))
            : 0;
          return `<div class="card" style="cursor:default;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <div style="font-size:12.5px;font-weight:700;color:var(--t1)">${d}</div>
              <span class="badge ${sc}">${st}</span>
            </div>
            <div style="font-size:22px;font-weight:800;color:var(--navy)">${acu !== null ? acu.toFixed(1) + '%' : '—'}</div>
            <div style="font-size:10.5px;color:var(--t4)">rede: ${redeAcu.toFixed(1)}% · diff: <span style="color:${avg >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:700">${avg >= 0 ? '+' : ''}${avg.toFixed(1)} p.p.</span></div>
          </div>`;
        }).join('') +
        '</div>';
    } else {
      const comps = ESCOLA_6_COMP[key]?.[disc] ?? [];
      contentEl.innerHTML = comps.length
        ? `<table class="tbl" style="width:100%">
            <thead><tr><th>Componente</th><th>Escola</th><th>Rede</th><th>Diff</th><th>Status</th></tr></thead>
            <tbody>` +
          comps.map(c => {
            const diff  = c.acerto - c.rede;
            const sign  = diff >= 0 ? '+' : '';
            const sc    = diff > 5 ? 'badge-above' : diff < -5 ? 'badge-crit' : diff >= 0 ? 'badge-avg' : 'badge-att';
            const st    = diff > 5 ? 'Acima' : diff < -5 ? 'Crítico' : diff >= 0 ? 'Na média' : 'Atenção';
            const color = diff > 0 ? 'color:var(--green)' : diff < 0 ? 'color:var(--red)' : '';
            return `<tr>
              <td class="bold">${c.comp}</td>
              <td>${c.acerto}%</td>
              <td>${c.rede}%</td>
              <td style="${color};font-weight:700">${sign}${diff}</td>
              <td><span class="badge ${sc}">${st}</span></td>
            </tr>`;
          }).join('') +
          '</tbody></table>'
        : '<div style="font-size:12px;color:var(--t4);padding:8px">Sem dados de componentes para esta disciplina.</div>';
    }
  }

  const fortesEl = el('comp6-fortes');
  const fragEl   = el('comp6-frageis');

  const allComps = disc === 'Todas'
    ? DISCIPLINAS_6.flatMap(d => (ESCOLA_6_COMP[key]?.[d] ?? []).map(c => ({ ...c, _disc: d })))
    : (ESCOLA_6_COMP[key]?.[disc] ?? []).map(c => ({ ...c, _disc: disc }));
  const sortedAll = allComps.slice().sort((a, b) => (b.acerto - b.rede) - (a.acerto - a.rede));

  if (fortesEl) {
    const top = sortedAll.slice(0, 3).filter(c => c.acerto >= c.rede);
    fortesEl.innerHTML = top.length
      ? top.map(c => `<div class="pi">
          <div class="pi-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div>
            <div class="pi-name" style="color:var(--green)">${c.comp}</div>
            <div class="pi-sub">${disc === 'Todas' ? c._disc + ' · ' : ''}${c.acerto}% vs. ${c.rede}% rede (+${c.acerto - c.rede} p.p.)</div>
          </div>
        </div>`).join('')
      : '<div style="font-size:12px;color:var(--t4);padding:8px 0">Nenhum destaque identificado.</div>';
  }

  if (fragEl) {
    const bottom = sortedAll.slice(-3).reverse().filter(c => c.acerto < c.rede);
    fragEl.innerHTML = bottom.length
      ? bottom.map(c => `<div class="pi">
          <div class="pi-ico red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
          <div>
            <div class="pi-name" style="color:var(--red)">${c.comp}</div>
            <div class="pi-sub">${disc === 'Todas' ? c._disc + ' · ' : ''}${c.acerto}% vs. ${c.rede}% rede (${c.acerto - c.rede} p.p.)</div>
          </div>
        </div>`).join('')
      : '<div style="font-size:12px;color:var(--t4);padding:8px 0">Nenhuma fragilidade identificada.</div>';
  }

  const notaEl = el('comp6-nota');
  if (notaEl) {
    const frageis = allComps.filter(c => c.acerto < c.rede).length;
    if (disc === 'Todas') {
      notaEl.textContent = `${e.nome}: ${frageis} de ${allComps.length} componentes abaixo da média da rede. Forte: ${e.forte}; fraco: ${e.fraco}.`;
    } else {
      notaEl.textContent = `Em ${disc}, ${e.nome} tem ${frageis} de ${allComps.length} componentes abaixo da média. Forte geral: ${e.forte}; fraco geral: ${e.fraco}.`;
    }
  }

  const evoTitleEl = el('comp6-evo-title');
  const evoSubEl   = el('comp6-evo-sub');
  if (evoTitleEl) evoTitleEl.textContent = disc === 'Todas'
    ? `Evolução por disciplina — ${e.nome}`
    : `Evolução de ${disc} — ${e.nome}`;
  if (evoSubEl) evoSubEl.textContent = disc === 'Todas'
    ? 'Comparativo de todas as disciplinas ao longo dos simulados'
    : 'Comparativo da escola vs. média da rede';
  if (typeof renderComp6EvoChart === 'function') renderComp6EvoChart(key, disc);
}

function _initAlunos() {
  const sel = el('al-perf-aluno');
  if (sel && typeof ALUNOS_REDE !== 'undefined') {
    sel.innerHTML = ALUNOS_REDE.map(a =>
      '<option value="' + a.key + '">' + a.nome + ' — ' + a.escolaNome + '</option>'
    ).join('');
    sel.value = S.alunoPerfilAluno || ALUNOS_REDE[0].key;
  }
  switchAlunoTab('ranking');
}

function _initProfessores() {
  _populateProfSelect();
  loadProfessor(S.profKey);
  switchProfTab('questoes');
}

/* ── ALUNOS — HELPERS ──────────────────────────────────────── */
function _statusBadgeKey(status) {
  const map = {
    'Destaque': 'dest', 'Em crescimento': 'cresc', 'Estável': 'est',
    'Atenção': 'att', 'Queda recente': 'queda', 'Baixa participação': 'part',
  };
  return map[status] || 'est';
}

function _alunoStatusBadge(status) {
  return '<span class="al-badge al-badge-' + _statusBadgeKey(status) + '">' + (status || '—') + '</span>';
}

function _goToPerfil(key) {
  S.alunoPerfilAluno = key;
  const sel = el('al-perf-aluno');
  if (sel) sel.value = key;
  switchAlunoTab('perfil');
}

/* ── ALUNOS — TAB BUILDERS ─────────────────────────────────── */
function _buildAlunosRanking() {
  if (typeof ALUNOS_REDE === 'undefined') return;

  const sim    = S.alunoRankingSimulado;
  const turma  = S.alunoRankingTurma;
  const escola = S.alunoRankingEscola;
  const ord    = S.alunoRankingOrdenar;
  const busca  = (S.alunoRankingBusca || '').toLowerCase();

  const alunos = ALUNOS_REDE.filter(a =>
    (escola === 'todas' || a.escola === escola) &&
    (turma  === 'todas' || a.turma  === turma)
  );

  const sorted = (typeof sortAlunosPor === 'function' ? sortAlunosPor(alunos, sim, ord) : alunos.slice())
    .map((a, i) => ({ ...a, pos: i + 1 }));
  const rows = busca ? sorted.filter(a => a.nome.toLowerCase().includes(busca)) : sorted;

  // KPIs
  const mediaVal = typeof calcGrupoValSim === 'function' ? calcGrupoValSim(alunos, sim) : 0;
  const dest     = alunos.filter(a => a.status === 'Destaque').length;
  const atencao  = alunos.filter(a => a.status === 'Atenção' || a.status === 'Queda recente').length;
  const bestEvo  = alunos.length ? alunos.reduce((m, a) => Math.max(m, a.evolucao), -Infinity) : 0;
  const part     = typeof calcGrupoPart === 'function' ? calcGrupoPart(alunos) : 0;

  _setKpi('al-kpi-media',   mediaVal.toFixed(1) + '%');
  _setKpi('al-kpi-dest',    dest);
  _setKpi('al-kpi-atencao', atencao);
  _setKpi('al-kpi-evo',     (bestEvo >= 0 ? '+' : '') + bestEvo.toFixed(1) + ' p.p.');
  _setKpi('al-kpi-part',    part + '%');

  const mediaNote = el('al-kpi-media-note');
  if (mediaNote) mediaNote.textContent = sim === 'acumulado' ? 'Acumulada' : sim + 'º Simulado';

  // Title + subtitle
  const titleParts = [];
  if (escola !== 'todas' && typeof _AR_ESCOLA_CONF !== 'undefined') titleParts.push(_AR_ESCOLA_CONF[escola].nome);
  if (turma  !== 'todas') titleParts.push(turma);
  const titleEl = el('al-rank-title');
  if (titleEl) titleEl.textContent = 'Ranking — ' + (titleParts.length ? titleParts.join(' · ') : 'Rede completa');

  const ordLabels = { geral:'Média geral', mat:'Matemática', fis:'Física', qui:'Química', ing:'Inglês', evo:'Evolução', part:'Participação' };
  const subEl = el('al-rank-sub');
  if (subEl) subEl.textContent = alunos.length + ' alunos · Ordenado por ' + (ordLabels[ord] || 'Média geral');

  const colEl = el('al-rank-col-media');
  if (colEl) colEl.textContent = sim === 'acumulado' ? 'Média' : sim + 'º Sim.';

  // Table
  const tbody = el('al-rank-tbody');
  if (tbody) {
    tbody.innerHTML = rows.map(a => {
      const val     = typeof getAlunoValSim === 'function' ? getAlunoValSim(a, sim) : a.media;
      const evoCls  = a.evolucao >= 5 ? 'diff-pos' : a.evolucao < 0 ? 'diff-neg' : '';
      return '<tr onclick="_goToPerfil(\'' + a.key + '\')" style="cursor:pointer">' +
        '<td>' + a.pos + '</td>' +
        '<td><strong>' + a.nome + '</strong></td>' +
        '<td>' + a.escolaNome + '</td>' +
        '<td>' + a.turma + '</td>' +
        '<td>' + a.serie + '</td>' +
        '<td>' + val.toFixed(1) + '%</td>' +
        '<td>' + (a.discs['Matemática']    || 0).toFixed(1) + '%</td>' +
        '<td>' + (a.discs['Física']        || 0).toFixed(1) + '%</td>' +
        '<td>' + (a.discs['Química']       || 0).toFixed(1) + '%</td>' +
        '<td>' + (a.discs['Língua Inglesa']|| 0).toFixed(1) + '%</td>' +
        '<td>' + a.partRate + '%</td>' +
        '<td class="' + evoCls + '">' + (a.evolucao >= 0 ? '+' : '') + a.evolucao.toFixed(1) + '</td>' +
        '<td>' + _alunoStatusBadge(a.status) + '</td>' +
        '</tr>';
    }).join('');
  }

  // Leitura do ranking
  const leituraEl = el('al-rank-leitura');
  if (leituraEl && alunos.length) {
    const atLow  = alunos.filter(a => a.status === 'Atenção' || a.status === 'Queda recente');
    const atAlta = alunos.filter(a => a.status === 'Em crescimento');
    const escolasAt = {};
    atLow.forEach(a => { escolasAt[a.escolaNome] = (escolasAt[a.escolaNome] || 0) + 1; });
    const topEscolaAt = Object.entries(escolasAt).sort((a, b) => b[1] - a[1])[0];
    const bestEvoAluno = alunos.slice().sort((a, b) => b.evolucao - a.evolucao)[0];
    const topMedia     = alunos.slice().sort((a, b) => b.media - a.media)[0];

    let txt = 'No recorte selecionado, ' + alunos.length + ' aluno' + (alunos.length !== 1 ? 's' : '') + '.';
    if (atLow.length) txt += ' ' + atLow.length + ' aluno' + (atLow.length !== 1 ? 's' : '') + ' em atenção ou queda recente' + (topEscolaAt ? ', com concentração na ' + topEscolaAt[0] : '') + '.';
    if (atAlta.length) txt += ' ' + atAlta.length + ' em crescimento consistente.';
    if (topMedia) txt += ' Melhor desempenho: ' + topMedia.nome.split(' ')[0] + ' (' + topMedia.media.toFixed(1) + '% · ' + topMedia.escolaNome + ').';
    if (bestEvoAluno) txt += ' Maior evolução: ' + bestEvoAluno.nome.split(' ')[0] + ' (+' + bestEvoAluno.evolucao.toFixed(1) + ' p.p.).';
    leituraEl.textContent = txt;
  }
}

function _buildAlunoPerfil() {
  if (typeof ALUNOS_REDE === 'undefined') return;
  const aluno = ALUNOS_REDE.find(a => a.key === S.alunoPerfilAluno) || ALUNOS_REDE[0];
  if (!aluno) return;

  const sim     = S.alunoPerfilSimulado;
  const simIdx  = (sim === 'acumulado') ? -1 : parseInt(sim, 10) - 1;
  const mediaVal = typeof getAlunoValSim === 'function' ? getAlunoValSim(aluno, sim) : aluno.media;
  const discData = (simIdx >= 0 && aluno.simDiscs) ? aluno.simDiscs[simIdx] : aluno.discs;
  const sortedDiscs = _AR_DISCS.slice().sort((a, b) => (discData[b] || 0) - (discData[a] || 0));
  const forteDisc   = sortedDiscs[0];
  const fracaDisc   = sortedDiscs[sortedDiscs.length - 1];

  // Hero
  const avEl = el('al-perf-av');
  if (avEl) avEl.textContent = aluno.av;
  const nomeEl = el('al-perf-nome');
  if (nomeEl) nomeEl.textContent = aluno.nome;
  const metaEl = el('al-perf-meta');
  if (metaEl) metaEl.textContent = aluno.escolaNome + ' · ' + aluno.turma + ' · ' + aluno.serie;
  const statusEl = el('al-perf-status');
  if (statusEl) {
    statusEl.textContent = aluno.status;
    statusEl.className = 'al-status-badge al-badge al-badge-' + _statusBadgeKey(aluno.status);
  }

  // KPIs
  _setKpi('al-perf-kpi-media',  mediaVal.toFixed(1) + '%');
  _setKpi('al-perf-kpi-part',   aluno.partRate + '%');
  _setKpi('al-perf-kpi-rank',   aluno.rankRede + 'º / ' + ALUNOS_REDE.length);
  _setKpi('al-perf-kpi-forte',  forteDisc);
  _setKpi('al-perf-kpi-fraca',  fracaDisc);
  const mediaNote = el('al-perf-kpi-media-note');
  if (mediaNote) mediaNote.textContent = sim === 'acumulado' ? 'Acumulada' : sim + 'º Simulado';

  // Charts
  if (typeof renderAlunoPerfilDisciplinasChart === 'function') renderAlunoPerfilDisciplinasChart(aluno, sim);
  if (typeof renderAlunoPerfilEvolucaoChart    === 'function') renderAlunoPerfilEvolucaoChart(aluno);
  if (typeof renderAlunoPerfilParticipacaoChart === 'function') renderAlunoPerfilParticipacaoChart(aluno);

  // Síntese
  const sinteseEl = el('al-perf-sintese');
  if (sinteseEl) {
    const cresc    = aluno.evolucao;
    const crescing = aluno.sims[4] - aluno.sims[3];
    let txt = aluno.nome + ' apresenta ' + (sim === 'acumulado'
      ? 'média acumulada de ' + aluno.media.toFixed(1) + '%'
      : 'desempenho de ' + mediaVal.toFixed(1) + '% no ' + sim + 'º Simulado') +
      ' — ' + aluno.status.toLowerCase() + ', posição ' + aluno.rankRede + 'º na rede.';
    txt += ' Crescimento de ' + (cresc >= 0 ? '+' : '') + cresc.toFixed(1) + ' p.p. ao longo dos 5 simulados.';
    txt += ' Ponto forte: ' + forteDisc + ' (' + (discData[forteDisc] || 0).toFixed(1) + '%).';
    txt += ' Disciplina com maior atenção: ' + fracaDisc + ' (' + (discData[fracaDisc] || 0).toFixed(1) + '%).';
    txt += ' Participação: ' + aluno.partRate + '%.';
    if (crescing >= 3) txt += ' Tendência de alta no último simulado.';
    else if (crescing < -3) txt += ' Queda no último simulado — requer atenção.';
    sinteseEl.textContent = txt;
  }

  // Pontos fortes
  const alunoIdx  = ALUNOS_REDE.indexOf(aluno);
  const fortesEl  = el('al-perf-fortes');
  if (fortesEl) {
    const items = [];
    sortedDiscs.slice(0, 2).forEach((d, i) => {
      const val     = discData[d] || 0;
      const redeVal = (REDE_6_DISC_SIM[d] || [0,0,0,0,0])[4];
      const diff    = parseFloat((val - redeVal).toFixed(1));
      const ass     = (_AR_ASSUNTOS[d] || [])[(alunoIdx * 3 + i) % (_AR_ASSUNTOS[d] || ['—']).length] || '—';
      items.push('<div class="al-ponto">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<span style="font-weight:600;font-size:12px;color:var(--t1)">' + d + '</span>' +
          '<span class="diff-pos" style="font-size:11px">' + (diff >= 0 ? '+' : '') + diff + ' p.p. vs. rede</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--t3);margin-top:2px">' + ass + ' · ' + val.toFixed(1) + '%</div>' +
      '</div>');
    });
    if (aluno.evolucao >= 5) items.push('<div class="al-ponto"><div style="font-weight:600;font-size:12px;color:var(--t1)">Evolução</div><div style="font-size:11px;color:var(--t3);margin-top:2px">+' + aluno.evolucao.toFixed(1) + ' p.p. — crescimento consistente ao longo dos simulados</div></div>');
    if (aluno.partRate >= 90) items.push('<div class="al-ponto"><div style="font-weight:600;font-size:12px;color:var(--t1)">Participação</div><div style="font-size:11px;color:var(--t3);margin-top:2px">Presença exemplar — ' + aluno.partRate + '%</div></div>');
    fortesEl.innerHTML = items.join('') || '<div class="card-sub">—</div>';
  }

  // Pontos de atenção
  const fracosEl = el('al-perf-fracos');
  if (fracosEl) {
    const items = [];
    sortedDiscs.slice(-2).reverse().forEach((d, i) => {
      const val     = discData[d] || 0;
      const redeVal = (REDE_6_DISC_SIM[d] || [0,0,0,0,0])[4];
      const diff    = parseFloat((val - redeVal).toFixed(1));
      const ass     = (_AR_ASSUNTOS[d] || [])[(alunoIdx * 5 + i + 2) % (_AR_ASSUNTOS[d] || ['—']).length] || '—';
      items.push('<div class="al-ponto">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<span style="font-weight:600;font-size:12px;color:var(--t1)">' + d + '</span>' +
          '<span class="' + (diff >= 0 ? 'diff-neu' : 'diff-neg') + '" style="font-size:11px">' + (diff >= 0 ? '+' : '') + diff + ' p.p. vs. rede</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--t3);margin-top:2px">' + ass + ' · ' + val.toFixed(1) + '%</div>' +
      '</div>');
    });
    if (aluno.partRate < 75) items.push('<div class="al-ponto"><div style="font-weight:600;font-size:12px;color:var(--t1)">Participação</div><div style="font-size:11px;color:var(--t3);margin-top:2px">Baixa presença — ' + aluno.partRate + '% dos simulados</div></div>');
    if (aluno.evolucao < 0)  items.push('<div class="al-ponto"><div style="font-weight:600;font-size:12px;color:var(--t1)">Evolução</div><div style="font-size:11px;color:var(--t3);margin-top:2px">' + aluno.evolucao.toFixed(1) + ' p.p. — queda ao longo dos simulados</div></div>');
    fracosEl.innerHTML = items.join('') || '<div class="card-sub">—</div>';
  }

  // Histórico
  _buildAlunoHistorico(aluno, alunoIdx);
}

function _buildAlunoHistorico(aluno, alunoIdx) {
  const histEl = el('al-perf-historico');
  if (!histEl) return;

  histEl.innerHTML = aluno.sims.map((simVal, s) => {
    const presente   = aluno.part[s] === 1;
    const sd         = aluno.simDiscs ? aluno.simDiscs[s] : aluno.discs;
    const sortedD    = _AR_DISCS.slice().sort((a, b) => (sd[b] || 0) - (sd[a] || 0));
    const forte      = sortedD[0];
    const fraco      = sortedD[sortedD.length - 1];
    const forteAss   = (_AR_ASSUNTOS[forte] || [])[(alunoIdx * 3 + s * 7) % (_AR_ASSUNTOS[forte] || ['—']).length] || '—';
    const fracoAss   = (_AR_ASSUNTOS[fraco]  || [])[(alunoIdx * 5 + s * 11) % (_AR_ASSUNTOS[fraco]  || ['—']).length] || '—';
    const redeVal    = REDE_6_MEDIA[s];
    const diff       = parseFloat((simVal - redeVal).toFixed(1));
    const diffCls    = diff >= 0 ? 'diff-pos' : 'diff-neg';

    return '<div class="al-hist-item">' +
      '<div class="al-hist-num">' + (s + 1) + '</div>' +
      '<div class="al-hist-body">' +
        '<div class="al-hist-row">' +
          '<div><div class="al-hist-label">Média</div><div class="al-hist-val">' + simVal.toFixed(1) + '%</div></div>' +
          '<div><div class="al-hist-label">vs. Rede</div><div class="al-hist-val ' + diffCls + '">' + (diff >= 0 ? '+' : '') + diff + ' p.p.</div></div>' +
          '<div><div class="al-hist-label">Participação</div><div class="al-hist-val ' + (presente ? 'diff-pos' : 'diff-neg') + '">' + (presente ? 'Presente' : 'Ausente') + '</div></div>' +
        '</div>' +
        '<div class="al-hist-row" style="margin-top:8px">' +
          '<div><div class="al-hist-label" style="color:var(--green)">Ponto forte</div><div style="font-size:11px;color:var(--t1)">' + forte + ' <span style="color:var(--t3)">· ' + forteAss + '</span></div></div>' +
          '<div><div class="al-hist-label" style="color:var(--amber)">Ponto de atenção</div><div style="font-size:11px;color:var(--t1)">' + fraco + ' <span style="color:var(--t3)">· ' + fracoAss + '</span></div></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── DASHBOARD ─────────────────────────────────────────────── */

const DASH_SIM_DATA = {
  sim1: {
    mediaPct: '43,5%', mediaDelta: '—', mediaDeltaClass: '',
    presencaNum: '24.120', presencaNote: '73% do esperado', presencaBar: 73,
    criticas: 14, criticasNote: 'Atenção prioritária', criticasSub: '5 com maior impacto',
    criticasHab: 'Cinemática',
    atencao: '1.528', atencaoNote: 'Requerem acompanhamento', atencaoSub: '6,3% do total',
    panorama: [
      { cor:'amber', ico:'warn', nome:'Abaixo da meta — −3,2 p.p.',       sub:'Desempenho geral abaixo da referência Arco' },
      { cor:'amber', ico:'down', nome:'8 escolas abaixo do esperado',      sub:'Requerem atenção prioritária' },
      { cor:'red',   ico:'arr',  nome:'Cinemática — conteúdo crítico',     sub:'Principal lacuna de aprendizado' }
    ],
    prioridades: [
      { cor:'orange', ico:'school',  nome:'5 escolas com resultado crítico',    sub:'Identificar e intervir urgentemente' },
      { cor:'blue',   ico:'teacher', nome:'3 professores com baixo impacto',    sub:'Monitorar turmas afetadas' },
      { cor:'amber',  ico:'book',    nome:'Cinemática — habilidade crítica',    sub:'Principal lacuna da rede neste simulado' }
    ],
    panoramaDetalhe: [
      { rows: [
        { label: '1º Simulado', val: '43,5%' },
        { label: 'Anterior', val: '—' },
        { label: 'Tendência', val: 'Ponto de partida', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Escola A', val: '41,2%', cls: 'neg' },
        { label: 'Escola C', val: '38,7%', cls: 'neg' },
        { label: 'Escola G', val: '40,1%', cls: 'neg' },
        { label: 'Escola J', val: '39,4%', cls: 'neg' },
        { label: 'Escola N', val: '42,3%', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Q08 — 16% acerto', val: 'Cinemática vetorial', cls: 'neg' },
        { label: 'Q19 — 22% acerto', val: 'Queda livre', cls: 'neg' },
        { label: 'Q33 — 19% acerto', val: 'Lançamento oblíquo', cls: 'neg' },
        { label: 'Distrator dom.', val: 'Alt. B e C' }
      ]}
    ],
    prioridadesDetalhe: [
      { rows: [
        { label: 'Escola A', val: '41,2%', cls: 'neg' },
        { label: 'Escola C', val: '38,7%', cls: 'neg' },
        { label: 'Escola G', val: '40,1%', cls: 'neg' },
        { label: 'Escola J', val: '39,4%', cls: 'neg' },
        { label: 'Escola N', val: '42,3%', cls: 'neg' }
      ]},
      { rows: [
        { label: 'Física', val: 'Baixa discriminação', cls: 'warn' },
        { label: 'C. Humanas', val: 'Distrator dominante', cls: 'warn' },
        { label: 'Matemática', val: 'Baixo impacto', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Habilidade', val: 'Cinemática' },
        { label: 'Questões críticas', val: '5 identificadas', cls: 'neg' },
        { label: 'Acerto médio', val: '19%', cls: 'neg' },
        { label: 'Impacto', val: '82% das turmas', cls: 'warn' }
      ]}
    ],
    acessoRapido: [
      { ico:'school',  corClass:'ico-amber',  titulo:'Escolas',     badgeText:'Crítico',  badgeCor:'badge-crit',  desc:'8 escolas abaixo do esperado.',        page:'escolas' },
      { ico:'exam',    corClass:'ico-orange', titulo:'Simulados',   badgeText:'Alerta',   badgeCor:'badge-att',   desc:'Questões críticas identificadas.',     page:'simulados' },
      { ico:'teacher', corClass:'ico-blue',   titulo:'Professores', badgeText:'Atenção',  badgeCor:'badge-att',   desc:'3 professores com baixo impacto.',     page:'professores' },
      { ico:'student', corClass:'ico-red',    titulo:'Alunos',      badgeText:'Crítico',  badgeCor:'badge-crit',  desc:'1.528 alunos precisam de atenção.',    page:'alunos' },
      { ico:'chat',    corClass:'ico-teal',   titulo:'Devolutivas', badgeText:'Pronto',   badgeCor:'badge-ok',    desc:'2 devolutivas prontas para envio.',    page:'devolutivas' }
    ]
  },
  sim2: {
    mediaPct: '45,1%', mediaDelta: '↑ 1,6 p.p. em relação ao anterior', mediaDeltaClass: 'g',
    presencaNum: '25.380', presencaNote: '77% do esperado', presencaBar: 77,
    criticas: 11, criticasNote: 'Abaixo do esperado', criticasSub: '4 com maior impacto',
    criticasHab: 'Eletromagnetismo',
    atencao: '1.287', atencaoNote: 'Requerem acompanhamento', atencaoSub: '5,1% do total',
    panorama: [
      { cor:'amber', ico:'warn', nome:'Próximo da meta — −1,6 p.p.',        sub:'Melhora em relação ao simulado anterior' },
      { cor:'amber', ico:'down', nome:'6 escolas abaixo do esperado',       sub:'Requerem atenção prioritária' },
      { cor:'red',   ico:'arr',  nome:'Eletromagnetismo — conteúdo crítico', sub:'Principal lacuna de aprendizado' }
    ],
    prioridades: [
      { cor:'orange', ico:'school',  nome:'4 escolas com queda significativa',     sub:'Compare desempenho e identifique causas' },
      { cor:'blue',   ico:'teacher', nome:'2 professores com queda de impacto',    sub:'Acompanhe o efeito nas turmas' },
      { cor:'amber',  ico:'book',    nome:'Eletromagnetismo — habilidade crítica', sub:'Principal lacuna da rede neste simulado' }
    ],
    panoramaDetalhe: [
      { rows: [
        { label: '2º Simulado', val: '45,1%' },
        { label: '1º Simulado', val: '43,5%' },
        { label: 'Variação', val: '+1,6 p.p.', cls: 'pos' },
        { label: 'Tendência', val: 'Crescente', cls: 'pos' }
      ]},
      { rows: [
        { label: 'Escola C', val: '40,2%', cls: 'neg' },
        { label: 'Escola F', val: '42,1%', cls: 'neg' },
        { label: 'Escola H', val: '41,3%', cls: 'neg' },
        { label: 'Escola J', val: '42,8%', cls: 'warn' },
        { label: 'Escola N', val: '43,0%', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Q11 — 20% acerto', val: 'Eletrostática básica', cls: 'neg' },
        { label: 'Q24 — 23% acerto', val: 'Campo elétrico', cls: 'neg' },
        { label: 'Q38 — 21% acerto', val: 'Potencial elétrico', cls: 'neg' },
        { label: 'Distrator dom.', val: 'Alt. A e D' }
      ]}
    ],
    prioridadesDetalhe: [
      { rows: [
        { label: 'Escola C', val: '−4,8 p.p.', cls: 'neg' },
        { label: 'Escola H', val: '−3,2 p.p.', cls: 'neg' },
        { label: 'Escola N', val: '−5,1 p.p.', cls: 'neg' },
        { label: 'Escola P', val: '−3,9 p.p.', cls: 'neg' }
      ]},
      { rows: [
        { label: 'Física', val: 'Baixa discriminação', cls: 'warn' },
        { label: 'Química', val: 'Distrator dominante', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Habilidade', val: 'Eletromagnetismo' },
        { label: 'Questões críticas', val: '4 identificadas', cls: 'neg' },
        { label: 'Acerto médio', val: '21%', cls: 'neg' },
        { label: 'Impacto', val: '74% das turmas', cls: 'warn' }
      ]}
    ],
    acessoRapido: [
      { ico:'school',  corClass:'ico-amber',  titulo:'Escolas',     badgeText:'Atenção',   badgeCor:'badge-att',   desc:'6 escolas abaixo do esperado.',        page:'escolas' },
      { ico:'exam',    corClass:'ico-orange', titulo:'Simulados',   badgeText:'Alerta',    badgeCor:'badge-att',   desc:'Questões críticas identificadas.',     page:'simulados' },
      { ico:'teacher', corClass:'ico-green',  titulo:'Professores', badgeText:'Destaque',  badgeCor:'badge-above', desc:'22% dos professores acima da média.',  page:'professores' },
      { ico:'student', corClass:'ico-red',    titulo:'Alunos',      badgeText:'Alerta',    badgeCor:'badge-att',   desc:'1.287 alunos precisam de atenção.',    page:'alunos' },
      { ico:'chat',    corClass:'ico-teal',   titulo:'Devolutivas', badgeText:'Pronto',    badgeCor:'badge-ok',    desc:'2 devolutivas prontas para envio.',    page:'devolutivas' }
    ]
  },
  sim3: {
    mediaPct: '47,8%', mediaDelta: '↑ 2,7 p.p. em relação ao anterior', mediaDeltaClass: 'g',
    presencaNum: '26.810', presencaNote: '81% do esperado', presencaBar: 81,
    criticas: 9, criticasNote: 'Abaixo do esperado', criticasSub: '3 com maior impacto',
    criticasHab: 'Equações diferenciais',
    atencao: '1.087', atencaoNote: 'Requerem acompanhamento', atencaoSub: '4,1% do total',
    panorama: [
      { cor:'green', ico:'up',   nome:'Na meta — +1,1 p.p.',               sub:'Desempenho geral atingiu a referência Arco' },
      { cor:'amber', ico:'down', nome:'5 escolas abaixo do esperado',       sub:'Requerem atenção prioritária' },
      { cor:'red',   ico:'arr',  nome:'Equações diferenciais — crítico',    sub:'Principal lacuna de aprendizado' }
    ],
    prioridades: [
      { cor:'orange', ico:'school',  nome:'3 escolas com queda significativa',  sub:'Compare desempenho e identifique causas' },
      { cor:'blue',   ico:'teacher', nome:'2 professores com queda de impacto', sub:'Acompanhe o efeito nas turmas' },
      { cor:'amber',  ico:'book',    nome:'Equações — habilidade crítica',      sub:'Principal lacuna da rede neste simulado' }
    ],
    panoramaDetalhe: [
      { rows: [
        { label: '3º Simulado', val: '47,8%' },
        { label: '2º Simulado', val: '45,1%' },
        { label: 'Variação', val: '+2,7 p.p.', cls: 'pos' },
        { label: 'Tendência', val: 'Crescente', cls: 'pos' }
      ]},
      { rows: [
        { label: 'Escola D', val: '41,8%', cls: 'neg' },
        { label: 'Escola F', val: '43,0%', cls: 'neg' },
        { label: 'Escola H', val: '42,5%', cls: 'neg' },
        { label: 'Escola M', val: '43,3%', cls: 'warn' },
        { label: 'Escola P', val: '44,1%', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Q07 — 19% acerto', val: 'Equações diferenciais', cls: 'neg' },
        { label: 'Q22 — 22% acerto', val: 'Derivadas aplicadas', cls: 'neg' },
        { label: 'Q40 — 20% acerto', val: 'Integrais básicas', cls: 'neg' },
        { label: 'Distrator dom.', val: 'Alt. C e E' }
      ]}
    ],
    prioridadesDetalhe: [
      { rows: [
        { label: 'Escola D', val: '−5,3 p.p.', cls: 'neg' },
        { label: 'Escola H', val: '−4,1 p.p.', cls: 'neg' },
        { label: 'Escola M', val: '−3,7 p.p.', cls: 'neg' }
      ]},
      { rows: [
        { label: 'Matemática', val: 'Baixa discriminação', cls: 'warn' },
        { label: 'Física', val: 'Distrator dominante', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Habilidade', val: 'Equações diferenciais' },
        { label: 'Questões críticas', val: '3 identificadas', cls: 'neg' },
        { label: 'Acerto médio', val: '20%', cls: 'neg' },
        { label: 'Impacto', val: '71% das turmas', cls: 'warn' }
      ]}
    ],
    acessoRapido: [
      { ico:'school',  corClass:'ico-amber',  titulo:'Escolas',     badgeText:'Atenção',   badgeCor:'badge-att',   desc:'5 escolas abaixo do esperado.',        page:'escolas' },
      { ico:'exam',    corClass:'ico-orange', titulo:'Simulados',   badgeText:'Alerta',    badgeCor:'badge-att',   desc:'Questões críticas identificadas.',     page:'simulados' },
      { ico:'teacher', corClass:'ico-green',  titulo:'Professores', badgeText:'Destaque',  badgeCor:'badge-above', desc:'18% dos professores acima da média.',  page:'professores' },
      { ico:'student', corClass:'ico-red',    titulo:'Alunos',      badgeText:'Atenção',   badgeCor:'badge-att',   desc:'1.087 alunos precisam de atenção.',    page:'alunos' },
      { ico:'chat',    corClass:'ico-teal',   titulo:'Devolutivas', badgeText:'Pronto',    badgeCor:'badge-ok',    desc:'2 devolutivas prontas para envio.',    page:'devolutivas' }
    ]
  },
  sim4: {
    mediaPct: '50,2%', mediaDelta: '↑ 2,4 p.p. em relação ao anterior', mediaDeltaClass: 'g',
    presencaNum: '27.640', presencaNote: '84% do esperado', presencaBar: 84,
    criticas: 8, criticasNote: 'Abaixo do esperado', criticasSub: '3 com maior impacto',
    criticasHab: 'Trigonometria',
    atencao: '964', atencaoNote: 'Requerem acompanhamento', atencaoSub: '3,5% do total',
    panorama: [
      { cor:'green', ico:'up',   nome:'Acima da média — +3,5 p.p.',         sub:'Desempenho geral acima da referência Arco' },
      { cor:'amber', ico:'down', nome:'5 escolas abaixo do esperado',        sub:'Requerem atenção prioritária' },
      { cor:'red',   ico:'arr',  nome:'Funções trigonométricas — crítico',   sub:'Principal lacuna de aprendizado' }
    ],
    prioridades: [
      { cor:'orange', ico:'school',  nome:'3 escolas com queda significativa',  sub:'Compare desempenho e identifique causas' },
      { cor:'blue',   ico:'teacher', nome:'2 professores com queda de impacto', sub:'Acompanhe o efeito nas turmas' },
      { cor:'amber',  ico:'book',    nome:'Trigonometria — habilidade crítica', sub:'Principal lacuna da rede neste simulado' }
    ],
    panoramaDetalhe: [
      { rows: [
        { label: '4º Simulado', val: '50,2%' },
        { label: '3º Simulado', val: '47,8%' },
        { label: 'Variação', val: '+2,4 p.p.', cls: 'pos' },
        { label: 'Tendência', val: 'Crescente', cls: 'pos' }
      ]},
      { rows: [
        { label: 'Escola B', val: '43,1%', cls: 'neg' },
        { label: 'Escola F', val: '44,2%', cls: 'neg' },
        { label: 'Escola H', val: '42,9%', cls: 'neg' },
        { label: 'Escola M', val: '44,8%', cls: 'warn' },
        { label: 'Escola P', val: '45,0%', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Q15 — 21% acerto', val: 'Triângulos esféricos', cls: 'neg' },
        { label: 'Q29 — 23% acerto', val: 'Identidades trig.', cls: 'neg' },
        { label: 'Q43 — 22% acerto', val: 'Equações trig.', cls: 'neg' },
        { label: 'Distrator dom.', val: 'Alt. B e E' }
      ]}
    ],
    prioridadesDetalhe: [
      { rows: [
        { label: 'Escola B', val: '−4,9 p.p.', cls: 'neg' },
        { label: 'Escola H', val: '−3,8 p.p.', cls: 'neg' },
        { label: 'Escola M', val: '−4,2 p.p.', cls: 'neg' }
      ]},
      { rows: [
        { label: 'Matemática', val: 'Baixa discriminação', cls: 'warn' },
        { label: 'Linguagens', val: 'Distrator dominante', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Habilidade', val: 'Trigonometria' },
        { label: 'Questões críticas', val: '3 identificadas', cls: 'neg' },
        { label: 'Acerto médio', val: '22%', cls: 'neg' },
        { label: 'Impacto', val: '69% das turmas', cls: 'warn' }
      ]}
    ],
    acessoRapido: [
      { ico:'school',  corClass:'ico-amber',  titulo:'Escolas',     badgeText:'Atenção',   badgeCor:'badge-att',   desc:'5 escolas abaixo do esperado.',        page:'escolas' },
      { ico:'exam',    corClass:'ico-orange', titulo:'Simulados',   badgeText:'Alerta',    badgeCor:'badge-att',   desc:'Questões críticas identificadas.',     page:'simulados' },
      { ico:'teacher', corClass:'ico-green',  titulo:'Professores', badgeText:'Destaque',  badgeCor:'badge-above', desc:'20% dos professores acima da média.',  page:'professores' },
      { ico:'student', corClass:'ico-teal',   titulo:'Alunos',      badgeText:'Estável',   badgeCor:'badge-avg',   desc:'964 alunos com desempenho abaixo.',    page:'alunos' },
      { ico:'chat',    corClass:'ico-teal',   titulo:'Devolutivas', badgeText:'Pronto',    badgeCor:'badge-ok',    desc:'2 devolutivas prontas para envio.',    page:'devolutivas' }
    ]
  },
  sim5: {
    mediaPct: '53,6%', mediaDelta: '↑ 4,1 p.p. em relação ao último simulado', mediaDeltaClass: 'g',
    presencaNum: '28.460', presencaNote: '92% do esperado', presencaBar: 92,
    criticas: 7, criticasNote: 'Abaixo do esperado', criticasSub: '3 com maior impacto',
    criticasHab: 'Eletromagnetismo',
    atencao: '842', atencaoNote: 'Requerem acompanhamento', atencaoSub: '9,3% do total',
    panorama: [
      { cor:'green', ico:'up',   nome:'Acima da média — +4,1 p.p.',         sub:'Desempenho geral da rede acima da referência Arco' },
      { cor:'amber', ico:'down', nome:'5 escolas abaixo do esperado',        sub:'Requerem atenção prioritária' },
      { cor:'red',   ico:'arr',  nome:'Eletromagnetismo — conteúdo crítico', sub:'Principal lacuna de aprendizado identificada' }
    ],
    prioridades: [
      { cor:'orange', ico:'school',  nome:'3 escolas com queda significativa',     sub:'Compare desempenho e identifique causas' },
      { cor:'blue',   ico:'teacher', nome:'2 professores com queda de impacto',    sub:'Acompanhe o efeito nas turmas' },
      { cor:'amber',  ico:'book',    nome:'Eletromagnetismo — habilidade crítica', sub:'Principal lacuna da rede neste simulado' }
    ],
    panoramaDetalhe: [
      { rows: [
        { label: '5º Simulado', val: '53,6%' },
        { label: '4º Simulado', val: '50,2%' },
        { label: 'Variação', val: '+3,4 p.p.', cls: 'pos' },
        { label: 'Tendência', val: 'Crescente', cls: 'pos' }
      ]},
      { rows: [
        { label: 'Escola B', val: '41,3%', cls: 'neg' },
        { label: 'Escola F', val: '43,8%', cls: 'neg' },
        { label: 'Escola H', val: '−5,2 p.p.', cls: 'neg' },
        { label: 'Escola M', val: '44,1%', cls: 'warn' },
        { label: 'Escola P', val: '45,0%', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Q12 — 18% acerto', val: 'Interpret. vetorial', cls: 'neg' },
        { label: 'Q27 — 24% acerto', val: 'Eletrostática', cls: 'neg' },
        { label: 'Q35 — 21% acerto', val: 'Campo magnético', cls: 'neg' },
        { label: 'Distrator dom.', val: 'Alt. C e D' }
      ]}
    ],
    prioridadesDetalhe: [
      { rows: [
        { label: 'Escola B', val: '−6,1 p.p.', cls: 'neg' },
        { label: 'Escola H', val: '−4,4 p.p.', cls: 'neg' },
        { label: 'Escola M', val: '−5,0 p.p.', cls: 'neg' }
      ]},
      { rows: [
        { label: 'Física', val: 'Baixa discriminação', cls: 'warn' },
        { label: 'Matemática', val: 'Aumento de chute', cls: 'warn' }
      ]},
      { rows: [
        { label: 'Habilidade', val: 'Eletromagnetismo' },
        { label: 'Questões críticas', val: '3 identificadas', cls: 'neg' },
        { label: 'Acerto médio', val: '21%', cls: 'neg' },
        { label: 'Impacto', val: '68% das turmas', cls: 'warn' }
      ]}
    ],
    acessoRapido: [
      { ico:'school',  corClass:'ico-amber',  titulo:'Escolas',     badgeText:'Atenção',   badgeCor:'badge-att',   desc:'5 escolas abaixo do esperado.',          page:'escolas' },
      { ico:'exam',    corClass:'ico-orange', titulo:'Simulados',   badgeText:'Alerta',    badgeCor:'badge-crit',  desc:'Participação 8% abaixo do esperado.',    page:'simulados' },
      { ico:'teacher', corClass:'ico-green',  titulo:'Professores', badgeText:'Destaque',  badgeCor:'badge-above', desc:'18% dos professores acima da média.',    page:'professores' },
      { ico:'student', corClass:'ico-teal',   titulo:'Alunos',      badgeText:'Alerta',    badgeCor:'badge-att',   desc:'842 alunos precisam de acompanhamento.', page:'alunos' },
      { ico:'chat',    corClass:'ico-blue',   titulo:'Devolutivas', badgeText:'Pronto',    badgeCor:'badge-ok',    desc:'2 devolutivas prontas para envio.',      page:'devolutivas' }
    ]
  }
};

const _DASH_ICONS = {
  school:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  exam:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  teacher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  student: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  chat:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  up:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  down:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  arr:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  warn:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  book:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
};

function _getDashIcon(name) {
  return _DASH_ICONS[name] || _DASH_ICONS.warn;
}

function _updatePerfChartDot(simId) {
  document.querySelectorAll('.perf-dot').forEach(dot => {
    dot.classList.toggle('perf-dot-active', dot.dataset.sim === simId);
  });
}

function _buildPiExpand(rows) {
  return rows.map(r =>
    `<div class="pi-expand-row"><span class="pi-expand-label">${r.label}</span><span class="pi-expand-val${r.cls ? ' ' + r.cls : ''}">${r.val}</span></div>`
  ).join('');
}

function togglePiExpand(wrap) {
  const isOpen = wrap.classList.contains('open');
  document.querySelectorAll('#page-dashboard .pi-wrap.open').forEach(w => w.classList.remove('open'));
  if (!isOpen) wrap.classList.add('open');
}

function toggleEscolaVgExpand(wrap) {
  const isOpen = wrap.classList.contains('open');
  document.querySelectorAll('#etab-visao-geral .pi-wrap.open').forEach(w => w.classList.remove('open'));
  if (!isOpen) wrap.classList.add('open');
}

function _buildVgAccordionItem(icoColor, icoSvg, name, nameColor, sub, rows) {
  const expandHtml = rows.map(r =>
    `<div class="pi-expand-row"><span class="pi-expand-label">${r.label}</span><span class="pi-expand-val${r.cls ? ' ' + r.cls : ''}">${r.val}</span></div>`
  ).join('');
  return `<div class="pi-wrap">
    <div class="pi pi-expandable" onclick="toggleEscolaVgExpand(this.parentElement)">
      <div class="pi-ico ${icoColor}">${icoSvg}</div>
      <div>
        <div class="pi-name"${nameColor ? ` style="color:${nameColor}"` : ''}>${name}</div>
        <div class="pi-sub">${sub}</div>
        <div class="pi-hint">ver detalhes</div>
      </div>
      <svg class="pi-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 3 11 8 6 13"/></svg>
    </div>
    <div class="pi-expand"><div class="pi-expand-inner">${expandHtml}</div></div>
  </div>`;
}

function switchDashSim(simId) {
  S.simId = simId;
  _renderDashboard(simId);
}

function _renderDashboard(simId) {
  const d = DASH_SIM_DATA[simId];
  if (!d) return;

  const selEl = el('sel-dash-simulado');
  if (selEl) selEl.value = simId;

  _setKpi('dash-kpi-media', d.mediaPct);

  _updatePerfChartDot(simId);

  const noteEl = el('dash-kpi-media-note');
  if (noteEl) { noteEl.textContent = d.mediaDelta; noteEl.className = 'performance-trend ' + d.mediaDeltaClass; }

  _setKpi('dash-kpi-presenca', d.presencaNum);
  _setKpi('dash-kpi-presenca-note', d.presencaNote);
  const barEl = el('dash-kpi-presenca-bar');
  if (barEl) barEl.style.width = d.presencaBar + '%';

  _setKpi('dash-kpi-criticas', d.criticas);
  const critNoteEl = el('dash-kpi-criticas-note');
  if (critNoteEl) critNoteEl.textContent = d.criticasNote;
  _setKpi('dash-kpi-criticas-sub', d.criticasSub);
  _setKpi('dash-kpi-criticas-hab', d.criticasHab ? 'Foco: ' + d.criticasHab : '');

  _setKpi('dash-kpi-atencao', d.atencao);
  _setKpi('dash-kpi-atencao-note', d.atencaoNote);
  _setKpi('dash-kpi-atencao-sub', d.atencaoSub);

  const panEl = el('dash-panorama-items');
  if (panEl) {
    panEl.innerHTML = d.panorama.map((item, i) => {
      const nameColor = item.cor === 'green' ? 'var(--green)' : 'var(--orange)';
      const det = d.panoramaDetalhe && d.panoramaDetalhe[i];
      const expandHtml = det ? _buildPiExpand(det.rows) : '';
      const hintHtml = det ? '<div class="pi-hint">ver detalhes</div>' : '';
      return `<div class="pi-wrap"><div class="pi pi-expandable" onclick="togglePiExpand(this.parentElement)"><div class="pi-ico ${item.cor}">${_getDashIcon(item.ico)}</div><div><div class="pi-name" style="color:${nameColor}">${item.nome}</div><div class="pi-sub">${item.sub}</div>${hintHtml}</div><svg class="pi-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 3 11 8 6 13"/></svg></div><div class="pi-expand"><div class="pi-expand-inner">${expandHtml}</div></div></div>`;
    }).join('');
  }

  const priEl = el('dash-prioridades-items');
  if (priEl) {
    priEl.innerHTML = d.prioridades.map((item, i) => {
      const det = d.prioridadesDetalhe && d.prioridadesDetalhe[i];
      const expandHtml = det ? _buildPiExpand(det.rows) : '';
      const hintHtml = det ? '<div class="pi-hint">ver detalhes</div>' : '';
      return `<div class="pi-wrap"><div class="pi pi-expandable" onclick="togglePiExpand(this.parentElement)"><div class="pi-ico ${item.cor}">${_getDashIcon(item.ico)}</div><div><div class="pi-name">${item.nome}</div><div class="pi-sub">${item.sub}</div>${hintHtml}</div><svg class="pi-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 3 11 8 6 13"/></svg></div><div class="pi-expand"><div class="pi-expand-inner">${expandHtml}</div></div></div>`;
    }).join('');
  }

  const arEl = el('dash-ar-items');
  if (arEl) {
    arEl.innerHTML = d.acessoRapido.map(item =>
      `<div class="dash-ar-card" onclick="goTo('${item.page}')"><div class="dash-ar-ico ${item.corClass}">${_getDashIcon(item.ico)}</div><div class="dash-ar-head"><div class="dash-ar-title">${item.titulo}</div><span class="badge ${item.badgeCor}">${item.badgeText}</span></div><div class="dash-ar-desc">${item.desc}</div><div class="dash-ar-link">Ver ${item.titulo.toLowerCase()}</div></div>`
    ).join('');
  }
}

function _setKpi(id, val) {
  const target = el(id);
  if (target) target.textContent = val;
}

/* ── GRADE DE QUESTÕES ─────────────────────────────────────── */
function buildQGrid() {
  const grid = el('q-grid');
  if (!grid) return;
  const src = _SIM_Q.length ? _SIM_Q : QUESTOES;
  grid.innerHTML = src.map((q, i) => {
    const active = (i === S.selectedQIdx) ? ' active' : '';
    return `<div class="qcell2 ${q.status}${active}" onclick="selectQ(${i})" title="Q${q.num} — ${q.comp}">
      <span class="qc2-num">${String(q.num).padStart(2,'0')}</span>
      <span class="qc2-gab">${q.gab}</span>
    </div>`;
  }).join('');
}

function selectQ(idx) {
  S.selectedQIdx = idx;
  const src = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const q = src[idx];
  if (!q) return;

  document.querySelectorAll('.qcell2').forEach((cell, i) => {
    cell.classList.toggle('active', i === idx);
  });

  _renderQDetail(q);
  _renderQSidebar(q);
}

function _renderQDetail(q) {
  const inf    = inferirQuestao(q);
  const src    = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const pos    = src.findIndex(sq => sq.num === q.num) + 1;

  _setKpi('q-num',    String(q.num).padStart(2, '0'));
  _setKpi('qp-pos',   pos + ' de ' + src.length);
  _setKpi('q-disc',   q.disc);
  _setKpi('q-comp',   q.comp);
  _setKpi('q-assunto',q.assunto);
  _setKpi('q-diff',   q.diff);

  // Metric boxes
  _setKpi('q-acerto',   q.acerto + '%');
  _setKpi('q-discrim',  q.discriminante.toFixed(2));
  const grau = (1 - q.acerto / 100).toFixed(2);
  _setKpi('q-grau',     grau);
  _setKpi('q-bisserial',(Math.min(q.discriminante * 1.12, 0.99)).toFixed(2));

  // Semantic tags
  const _tag = (id, lbl, cls) => { const t = el(id); if (t) { t.textContent = lbl; t.className = 'qmb-tag ' + cls; } };
  const acTag = q.acerto >= 70 ? ['Alto', 'pos'] : q.acerto >= 42 ? ['Médio', 'neu'] : ['Baixo', 'neg'];
  _tag('q-acerto-tag',   acTag[0], acTag[1]);
  const dcTag = q.discriminante >= 0.35 ? ['Alto', 'pos'] : q.discriminante >= 0.25 ? ['Bom', 'pos'] : q.discriminante >= 0.15 ? ['Regular', 'warn'] : ['Fraco', 'neg'];
  _tag('q-discrim-tag',  dcTag[0], dcTag[1]);
  const grauF = parseFloat(grau);
  const grTag = grauF >= 0.65 ? ['Alta', 'neg'] : grauF >= 0.45 ? ['Média', 'warn'] : ['Baixa', 'pos'];
  _tag('q-grau-tag',     grTag[0], grTag[1]);
  const bsF = q.discriminante * 1.12;
  const bsTag = bsF >= 0.40 ? ['Adequada', 'pos'] : bsF >= 0.25 ? ['Regular', 'warn'] : ['Fraca', 'neg'];
  _tag('q-bisserial-tag',bsTag[0], bsTag[1]);

  // Status badge
  const statusEl = el('q-status');
  if (statusEl) {
    statusEl.className = 'q-status-badge ' + q.status;
    statusEl.textContent = q.status === 'above' ? 'Acima do esperado' :
                           q.status === 'att'   ? 'Atenção pedagógica' : 'Habilidade crítica';
  }

  // Inference panel
  const infEl = el('q-infer');
  if (infEl) {
    infEl.className = 'infer-panel ' + inf.cor;
    infEl.innerHTML = `<div class="infer-titulo">${inf.titulo}</div><div class="infer-texto">${inf.texto}</div>`;
  }

  // Hypothesis
  _setKpi('q-hipotese', _buildHipotese(q));

  // Answer distribution bars (center panel)
  _renderAltBars(q);
}

function _renderAltBars(q) {
  const container = el('q-alt-bars');
  if (!container) return;
  const letters  = ['A','B','C','D','E'];
  const remaining = Math.max(0, 100 - q.acerto - q.distPct);
  const others    = letters.filter(l => l !== q.gab && l !== q.dist);
  const dist = {};
  letters.forEach(l => dist[l] = 0);
  dist[q.gab]  = q.acerto;
  dist[q.dist] = q.distPct;
  const perOther = Math.floor(remaining / 3);
  others.forEach((l, i) => { dist[l] = i === 0 ? remaining - perOther * 2 : perOther; });

  container.innerHTML = letters.map(l => {
    const pct   = dist[l];
    const isGab = l === q.gab;
    const isDist = l === q.dist && !isGab;
    const cls   = isGab ? 'green' : isDist ? 'orange' : 'gray';
    const lblCls = isGab ? 'pos' : isDist ? 'warn' : '';
    const pctCls = isGab ? 'pos' : isDist ? 'warn' : '';
    return `<div class="qalt-row">
      <span class="qalt-lbl ${lblCls}">${l}</span>
      <div class="qalt-track"><div class="qalt-fill ${cls}" style="width:${pct}%"></div></div>
      <span class="qalt-pct ${pctCls}">${pct}%</span>
    </div>`;
  }).join('');
}

function _renderQSidebar(q) {
  // compact alt list (right panel)
  const altList = el('qr-alt-list');
  if (altList) {
    const letters  = ['A','B','C','D','E'];
    const remaining = Math.max(0, 100 - q.acerto - q.distPct);
    const others    = letters.filter(l => l !== q.gab && l !== q.dist);
    const dist = {};
    letters.forEach(l => dist[l] = 0);
    dist[q.gab]  = q.acerto;
    dist[q.dist] = q.distPct;
    const perOther = Math.floor(remaining / 3);
    others.forEach((l, i) => { dist[l] = i === 0 ? remaining - perOther * 2 : perOther; });
    altList.innerHTML = letters.map(l => {
      const pct   = dist[l];
      const isGab = l === q.gab;
      const isDist = l === q.dist && !isGab;
      const clr   = isGab ? 'var(--green)' : isDist ? 'var(--orange)' : 'var(--border2)';
      return `<div class="qralt-row">
        <div class="qralt-dot" style="background:${clr}"></div>
        <span class="qralt-lbl">${l}</span>
        <div class="qralt-bar"><div class="qralt-fill" style="width:${pct}%;background:${clr}"></div></div>
        <span class="qralt-pct">${pct}%</span>
      </div>`;
    }).join('');
  }

  // network context
  const mediaDisc  = REDE_DISC[q.disc] ?? 0;
  const simIdx     = _simIdx();
  const diffDisc   = (q.acerto - mediaDisc).toFixed(1);
  const sD         = parseFloat(diffDisc) >= 0 ? '+' + diffDisc : diffDisc;
  _setKpi('qnet-disc', q.disc);
  _setKpi('qnet-rede', mediaDisc.toFixed(1) + '%');
  _setKpi('qnet-q',    q.acerto + '%');
  const diffEl = el('qnet-diff');
  if (diffEl) {
    diffEl.textContent = sD + ' p.p.';
    diffEl.style.color = parseFloat(diffDisc) > 0 ? 'var(--green)' : parseFloat(diffDisc) < 0 ? 'var(--red)' : 'var(--t2)';
  }
  const msg = parseFloat(diffDisc) > 3 ? 'Esta questão está acima da média da rede neste componente.' :
              parseFloat(diffDisc) < -3 ? 'Esta questão está abaixo da média da rede — lacuna identificada.' :
              'Desempenho alinhado à média da rede neste componente.';
  _setKpi('qnet-msg', msg);
}

function _buildHipotese(q) {
  if (q.distPct >= 27)
    return `A alternativa ${q.dist} atraiu ${q.distPct}% dos alunos — possível equívoco conceitual ou ambiguidade no enunciado. Recomenda-se analisar o distrator e verificar se a habilidade foi adequadamente trabalhada antes do exame.`;
  if (q.discriminante < 0.24)
    return `Discriminante baixo (${q.discriminante.toFixed(2)}) indica que a questão não diferencia alunos de alta e baixa proficiência. Pode refletir ambiguidade no enunciado ou aprendizagem superficial presente em todos os perfis.`;
  if (q.acerto >= 76)
    return `Alta taxa de acerto (${q.acerto}%) sugere habilidade consolidada na rede. Considere elevar o nível de complexidade nas próximas avaliações para medir aprendizagem profunda.`;
  if (q.acerto < 35)
    return `Acerto muito baixo (${q.acerto}%) indica lacuna crítica em ${q.comp}. Recomenda-se intervenção pedagógica direta com foco nesta habilidade nas próximas semanas.`;
  if (q.discriminante >= 0.35)
    return `Questão altamente discriminante (${q.discriminante.toFixed(2)}): separa bem os perfis de aprendizagem. Resultado confiável para diagnóstico individual — priorize no acompanhamento de alunos em atenção.`;
  return `Desempenho dentro do esperado para este nível de habilidade. ${q.acerto}% de acerto com discriminante ${q.discriminante.toFixed(2)} — questão equilibrada para diagnóstico.`;
}

function _buildRedeCtx(q) {
  const mediaDisc  = REDE_DISC[q.disc] ?? 0;
  const simIdx     = _simIdx();
  const mediaGeral = REDE_MEDIA_SIM[simIdx] ?? 0;
  const diffDisc   = (q.acerto - mediaDisc).toFixed(1);
  const diffGeral  = (q.acerto - mediaGeral).toFixed(1);
  const sdDisc     = parseFloat(diffDisc) >= 0 ? '+' + diffDisc : diffDisc;
  const sdGeral    = parseFloat(diffGeral) >= 0 ? '+' + diffGeral : diffGeral;
  return `${q.disc}: média rede ${mediaDisc.toFixed(1)}% — esta questão ${sdDisc} p.p. vs. componente. Média geral do simulado: ${mediaGeral.toFixed(1)}% (${sdGeral} p.p.).`;
}

/* ── EXEC KPI STRIP ────────────────────────────────────────── */
function _simIdx() {
  const n = parseInt(String(S.simId).replace('sim', ''), 10);
  return isNaN(n) ? 0 : n - 1;
}

function _buildSimExecStrip() {
  const simIdx = _simIdx();
  const d      = DASH_SIM_DATA[S.simId];
  const src    = _SIM_Q.length ? _SIM_Q : QUESTOES;

  // Média geral
  const media = REDE_MEDIA_SIM[simIdx] ?? 0;
  _setKpi('exec-media', media.toFixed(1) + '%');
  const varPp = simIdx > 0 ? media - REDE_MEDIA_SIM[simIdx - 1] : null;
  _setKpi('exec-media-note', varPp !== null
    ? (varPp >= 0 ? '↑ +' : '↓ ') + Math.abs(varPp).toFixed(1) + ' p.p. vs. anterior'
    : 'Linha de base');

  // Participação
  _setKpi('exec-part',      d ? d.presencaBar + '%' : '—');
  _setKpi('exec-part-note', d ? d.presencaNote      : '—');

  // Questões críticas (do simulado ativo)
  const criticas = src.filter(q => q.status === 'crit').length;
  _setKpi('exec-crit',      criticas);
  _setKpi('exec-crit-note', Math.round(criticas / src.length * 100) + '% do total');

  // Índice de qualidade (dado mockado por simulado)
  const qual     = (typeof SIM_QUALIDADE !== 'undefined') ? (SIM_QUALIDADE[S.simId] ?? 70) : 70;
  const iqLabel  = qual >= 70 ? 'Alta capacidade diagnóstica' : qual >= 60 ? 'Boa capacidade diagnóstica' : 'Capacidade regular';
  _setKpi('exec-iq',      qual);
  _setKpi('exec-iq-note', iqLabel);

  // Habilidade crítica — calculada dinamicamente, nunca valor fixo
  if (src.length && typeof getCriticalTopicForSim === 'function') {
    const crit = getCriticalTopicForSim(src);
    _setKpi('exec-hab',      crit.comp);
    _setKpi('exec-hab-note', crit.disciplina + ' · ' + crit.mediaAcerto + '% acerto médio');
  }
}

/* ── SUMMARY STATS (right sidebar totals) ──────────────────── */
function _buildSimSummaryStats() {
  const src      = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const criticas = src.filter(q => q.status === 'crit').length;
  const acima    = src.filter(q => q.status === 'above').length;
  const att      = src.filter(q => q.status === 'att').length;
  const total    = src.length;
  _setKpi('qr-criticas',     criticas);
  _setKpi('qr-criticas-pct', Math.round(criticas / total * 100) + '%');
  _setKpi('qr-acima',        acima);
  _setKpi('qr-acima-pct',    Math.round(acima / total * 100) + '%');
  _setKpi('qr-att',          att);
  _setKpi('qr-att-pct',      Math.round(att / total * 100) + '%');
}

function _populateSimEscolaSelect() {
  const sel = el('sel-sim-escola');
  if (!sel || sel.options.length > 1) return;
  if (typeof ESCOLAS !== 'undefined') {
    ESCOLAS.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.key; opt.textContent = e.nome;
      sel.appendChild(opt);
    });
  }
}

/* ── DISCIPLINAS TAB ───────────────────────────────────────── */
const _DISC_COLORS = {
  'Física': 'var(--blue)', 'Química': 'var(--green)', 'Matemática': 'var(--orange)',
  'Língua Inglesa': 'var(--teal, #0d9488)', 'Linguagens': 'var(--amber)', 'C. Humanas': 'var(--red)'
};

function _buildDisciplinasContent() {
  if (!S.simDiscSelected) S.simDiscSelected = DISCIPLINAS[0];
  const byDisc = _groupByDisc();

  // Build left list
  const listEl = el('disc-list-body');
  if (listEl) {
    listEl.innerHTML = Object.entries(byDisc).map(([disc, d]) =>
      `<div class="disc-row${disc === S.simDiscSelected ? ' active' : ''}" data-disc="${disc}" onclick="selectDiscEntry('${disc.replace(/'/g, "\\'")}')">
        <div class="disc-dot" style="background:${_DISC_COLORS[disc] || 'var(--t3)'}"></div>
        <div class="disc-row-info">
          <div class="disc-row-name">${disc}</div>
          <div class="disc-row-meta">${d.qs.length} questões · ${d.criticas} críticas</div>
        </div>
        <div class="disc-row-pct">${d.media.toFixed(0)}%</div>
      </div>`
    ).join('');
  }
  _renderDiscDetail(S.simDiscSelected, byDisc);
}

function selectDiscEntry(disc) {
  S.simDiscSelected = disc;
  const byDisc = _groupByDisc();
  document.querySelectorAll('.disc-row').forEach(r => {
    r.classList.toggle('active', r.dataset.disc === disc);
  });
  _renderDiscDetail(disc, byDisc);
}

function _groupByDisc() {
  const src = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const out = {};
  DISCIPLINAS.forEach(d => { out[d] = { qs: [], criticas: 0, media: 0 }; });
  src.forEach(q => {
    if (!out[q.disc]) out[q.disc] = { qs: [], criticas: 0, media: 0 };
    out[q.disc].qs.push(q);
    if (q.status === 'crit') out[q.disc].criticas++;
  });
  Object.entries(out).forEach(([, d]) => {
    d.media = d.qs.length ? d.qs.reduce((s, q) => s + q.acerto, 0) / d.qs.length : 0;
  });
  return out;
}

function _renderDiscDetail(disc, byDisc) {
  const d = byDisc[disc];
  if (!d) return;

  _setKpi('disc-detail-name', disc);
  _setKpi('disc-acerto',      d.media.toFixed(1) + '%');

  const avgDiscrim = d.qs.reduce((s, q) => s + q.discriminante, 0) / (d.qs.length || 1);
  _setKpi('disc-discrim', avgDiscrim.toFixed(2));
  const dcTag = el('disc-discrim-tag');
  if (dcTag) dcTag.textContent = avgDiscrim >= 0.35 ? 'Alto' : avgDiscrim >= 0.25 ? 'Bom' : avgDiscrim >= 0.15 ? 'Regular' : 'Fraco';

  const diffMap = { 'Fácil': 0.25, 'Médio': 0.50, 'Médio-alto': 0.65, 'Alto': 0.80 };
  const avgDiff = d.qs.reduce((s, q) => s + (diffMap[q.diff] || 0.5), 0) / (d.qs.length || 1);
  const diffLabel = avgDiff >= 0.65 ? 'Alta' : avgDiff >= 0.45 ? 'Média' : 'Baixa';
  _setKpi('disc-diff-val', diffLabel);
  _setKpi('disc-criticas', d.criticas + ' de ' + d.qs.length);

  // Assunto mais sensível da disciplina
  const worstQDisc = d.qs.slice().sort((a, b) => a.acerto - b.acerto)[0];
  _setKpi('disc-assunto-sensivel', worstQDisc ? worstQDisc.assunto : '—');

  // Components (group by comp)
  const byComp = {};
  d.qs.forEach(q => {
    if (!byComp[q.comp]) byComp[q.comp] = { qs: [], criticas: 0 };
    byComp[q.comp].qs.push(q);
    if (q.status === 'crit') byComp[q.comp].criticas++;
  });
  const compEl = el('disc-comp-list');
  if (compEl) {
    const clr = _DISC_COLORS[disc] || 'var(--orange)';
    compEl.innerHTML = Object.entries(byComp).map(([comp, c]) => {
      const avg = c.qs.reduce((s, q) => s + q.acerto, 0) / c.qs.length;
      return `<div class="disc-comp-row">
        <div class="disc-comp-name">${comp}</div>
        <div class="disc-comp-track"><div class="disc-comp-fill" style="width:${avg.toFixed(1)}%;background:${clr}"></div></div>
        <div class="disc-comp-pct">${avg.toFixed(1)}%</div>
        ${c.criticas > 0 ? `<div class="disc-comp-crit">${c.criticas} crít.</div>` : ''}
      </div>`;
    }).join('');
  }

  // Questions list — accordion with pedagogical conclusion
  const qEl = el('disc-q-list');
  if (qEl) {
    const mediaRede = REDE_DISC[disc] ?? 0;
    qEl.innerHTML = d.qs.map(q => {
      const aTag        = q.status === 'above' ? 'pos' : q.status === 'att' ? 'warn' : 'neg';
      const statusLabel = q.status === 'above' ? 'Acima do esperado' : q.status === 'att' ? 'Atenção' : 'Crítica';
      const statusCls   = q.status === 'above' ? 'badge-above' : q.status === 'att' ? 'badge-att' : 'badge-crit';
      const concl       = _buildHipotese(q);
      const diffPP      = (q.acerto - mediaRede).toFixed(1);
      const diffSign    = parseFloat(diffPP) >= 0 ? '+' : '';
      const rowId       = 'dqr-' + q.num;
      return `<div class="disc-q-row" id="${rowId}">
        <div class="disc-q-hd">
          <span class="disc-q-num">Q${String(q.num).padStart(2,'0')}</span>
          <span class="disc-q-assunto">${q.assunto}</span>
          <span class="disc-q-acerto ${aTag}">${q.acerto}%</span>
        </div>
        <div class="disc-q-status-row"><span class="badge ${statusCls}">${statusLabel}</span></div>
        <div class="disc-q-dados">
          <span>Acerto: <strong>${q.acerto}%</strong></span>
          <span>Vs. rede: <strong>${diffSign}${diffPP} p.p.</strong></span>
          <span>Disc.: <strong>${q.discriminante.toFixed(2)}</strong></span>
          <span>Distrator: <strong>${q.dist} (${q.distPct}%)</strong></span>
        </div>
        <button class="disc-q-toggle" onclick="toggleDiscConclusion('${rowId}')">
          <span class="disc-q-toggle-lbl">Ver conclusão pedagógica</span>
          <span class="disc-q-toggle-arrow">↓</span>
        </button>
        <div class="disc-q-concl-body" id="${rowId}-concl">
          <div class="disc-q-concl-inner">${concl}</div>
        </div>
      </div>`;
    }).join('');
  }
}

function toggleDiscConclusion(rowId) {
  const body = document.getElementById(rowId + '-concl');
  if (!body) return;
  const row   = document.getElementById(rowId);
  const btn   = row ? row.querySelector('.disc-q-toggle') : null;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (btn) {
    const lbl   = btn.querySelector('.disc-q-toggle-lbl');
    const arrow = btn.querySelector('.disc-q-toggle-arrow');
    if (lbl)   lbl.textContent   = isOpen ? 'Ver conclusão pedagógica' : 'Ocultar conclusão pedagógica';
    if (arrow) arrow.textContent = isOpen ? '↓' : '↑';
  }
}

/* ── EVOLUÇÃO TAB — POR TIPO DE GRÁFICO ────────────────────── */
function setEvolucaoTipo(tipo, btn) {
  _evoTipo = tipo;
  S.simEvoTipo = tipo;
  document.querySelectorAll('.evo-tipo-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderEvolucaoCharts(tipo);
}

function renderEvolucaoCharts(tipo) {
  const tipoData = (typeof SIM_EVO_TIPOS !== 'undefined') ? SIM_EVO_TIPOS[tipo] : null;
  if (!tipoData) return;

  const grid = el('evo-charts-grid');
  if (!grid) return;

  const charts = tipoData.charts || [];
  const labels = (typeof SIM_EVO_LABELS !== 'undefined') ? SIM_EVO_LABELS : ['1º','2º','3º','4º','5º'];

  // Grid columns: max 3 per row
  const cols = Math.min(charts.length, 3);
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  grid.innerHTML = charts.map((c, i) =>
    `<div class="card">
      <div class="card-title mb2" style="font-size:11.5px;min-height:32px">${c.title}</div>
      <div id="evo-chart-${i}" style="height:170px"></div>
    </div>`
  ).join('');

  const baseMgn  = { t: 8, r: 10, b: 30, l: 36 };
  const baseFont = { family: 'Inter, sans-serif', size: 9.5, color: '#6B7280' };
  const cfg = { displayModeBar: false, responsive: true };

  charts.forEach((c, i) => {
    const divEl = document.getElementById('evo-chart-' + i);
    if (!divEl || typeof Plotly === 'undefined') return;
    const multi  = c.traces.length > 1;
    const traces = c.traces.map(t => ({
      x: labels, y: t.data, type: 'scatter', mode: 'lines+markers',
      name: t.label,
      line:   { color: t.color, width: t.dash ? 1.5 : 2.5, dash: t.dash || 'solid' },
      marker: { color: t.color, size: t.dash ? 4 : 5.5 },
      hovertemplate: (multi ? t.label + ': ' : '') + '%{y}' + tipoData.unit + '<extra></extra>',
    }));
    const layout = {
      margin: baseMgn,
      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
      font: baseFont,
      xaxis: { gridcolor: '#F0EDE8', tickfont: { size: 8.5 }, fixedrange: true },
      yaxis: { gridcolor: '#F0EDE8', tickfont: { size: 8.5 }, fixedrange: true, ticksuffix: tipoData.unit },
      showlegend: multi,
      legend: { font: { size: 8.5 }, orientation: 'h', x: 0, y: 1.08, xanchor: 'left' },
    };
    Plotly.react(divEl, traces, layout, cfg);
  });

  const insight = typeof tipoData.insight === 'function' ? tipoData.insight() : tipoData.insight;
  _setKpi('evo-insight-text', insight || '—');
}

/* ── COMPONENTES TAB ───────────────────────────────────────── */
function _buildComponentesContent() {
  const src = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const byDisc = {};
  src.forEach(q => {
    if (!byDisc[q.disc]) byDisc[q.disc] = { acertos: [], criticas: 0 };
    byDisc[q.disc].acertos.push(q.acerto);
    if (q.status === 'crit') byDisc[q.disc].criticas++;
  });

  const discData = Object.entries(byDisc).map(([disc, d]) => {
    const media     = d.acertos.reduce((s, v) => s + v, 0) / d.acertos.length;
    const redeMedia = REDE_DISC[disc] ?? media;
    const diff      = media - redeMedia;
    const status    = diff > 5 ? 'above' : diff < -5 ? 'crit' : diff > 0 ? 'avg' : 'below';
    return { disc, media, redeMedia, diff, status, criticas: d.criticas, n: d.acertos.length };
  }).sort((a, b) => a.media - b.media);

  // Highlight boxes
  const hlEl = el('sim-comp-hl');
  if (hlEl) {
    const worst = discData[0];
    const best  = discData[discData.length - 1];
    const focus = discData.find(d => d.diff < 0 && d.diff > -5) || discData[1];
    hlEl.innerHTML =
      `<div class="hl-box r"><div class="hl-lbl">Área mais crítica</div><div class="hl-name">${worst.disc}</div><div class="hl-sub">${worst.media.toFixed(1)}% de acerto médio</div></div>` +
      `<div class="hl-box g"><div class="hl-lbl">Mais consolidada</div><div class="hl-name">${best.disc}</div><div class="hl-sub">${best.media.toFixed(1)}% de acerto médio</div></div>` +
      `<div class="hl-box o"><div class="hl-lbl">Foco pedagógico</div><div class="hl-name">${focus.disc}</div><div class="hl-sub">${(focus.diff >= 0 ? '+' : '') + focus.diff.toFixed(1)} p.p. vs. rede</div></div>`;
  }

  // Discipline bars
  const barsEl = el('sim-comp-bars');
  if (barsEl) {
    barsEl.innerHTML = discData.map(d =>
      `<div class="sim-comp-bar-row">
        <div class="sim-comp-disc">${d.disc}</div>
        <div class="sim-comp-track"><div class="sim-comp-fill ${d.status}" style="width:${Math.min(d.media,100).toFixed(1)}%"></div></div>
        <div class="sim-comp-pct">${d.media.toFixed(1)}%</div>
      </div>`
    ).join('');
  }

  // Critical list (acerto < 44, worst first, max 6)
  const critEl = el('sim-crit-list');
  if (critEl) {
    const crits = src.filter(q => q.acerto < 44).sort((a, b) => a.acerto - b.acerto).slice(0, 6);
    critEl.innerHTML = crits.map(q =>
      `<div class="sim-crit-item">
        <div class="sim-crit-num">Q${String(q.num).padStart(2,'0')}</div>
        <div class="sim-crit-body">
          <div class="sim-crit-name">${q.comp}</div>
          <div class="sim-crit-sub">${q.disc} · ${q.assunto}</div>
        </div>
        <div class="sim-crit-pct">${q.acerto}%</div>
      </div>`
    ).join('');
  }

  // Full table
  const tbodyEl = el('sim-comp-tbody');
  if (tbodyEl) {
    tbodyEl.innerHTML = discData.map(d => {
      const sign = d.diff >= 0 ? '+' : '';
      const sc   = d.status === 'above' ? 'badge-above' : d.status === 'crit' ? 'badge-crit' : d.status === 'avg' ? 'badge-avg' : 'badge-att';
      const st   = d.status === 'above' ? 'Acima' : d.status === 'crit' ? 'Crítico' : d.status === 'avg' ? 'Na média' : 'Abaixo';
      const dc   = d.diff > 0 ? 'diff-pos' : d.diff < 0 ? 'diff-neg' : 'diff-neu';
      return `<tr>
        <td class="bold">${d.disc}</td>
        <td>${d.n}</td>
        <td>${d.media.toFixed(1)}%</td>
        <td class="${dc}">${sign}${d.diff.toFixed(1)}</td>
        <td>${d.criticas}</td>
        <td><span class="badge ${sc}">${st}</span></td>
      </tr>`;
    }).join('');
  }
}

/* ── EVOLUÇÃO TAB ──────────────────────────────────────────── */
function _buildEvolucaoContent() {
  const currentIdx = _simIdx();

  // Evolution strip (vertical bars proportional to value)
  const stripEl = el('sim-evo-strip');
  if (stripEl) {
    const minV = Math.min(...REDE_MEDIA_SIM);
    const maxV = Math.max(...REDE_MEDIA_SIM);
    const range = maxV - minV || 1;
    stripEl.innerHTML = REDE_MEDIA_SIM.map((v, i) => {
      const barH   = Math.round(50 + ((v - minV) / range) * 70);
      const isCurr = i === currentIdx ? ' current' : '';
      const sim    = SIMULADOS[i];
      return `<div class="sim-evo-step${isCurr}">
        <div class="sim-evo-step-val">${v.toFixed(1)}%</div>
        <div class="sim-evo-step-bar" style="height:${barH}px"></div>
        <div class="sim-evo-step-lbl">${sim ? sim.labelCurto : 'Sim ' + (i+1)}</div>
      </div>`;
    }).join('');
  }

  // Narrative
  const textEl       = el('sim-evo-text');
  const currentMedia = REDE_MEDIA_SIM[currentIdx];
  const totalGrowth  = currentMedia - REDE_MEDIA_SIM[0];
  if (textEl) {
    const sign = totalGrowth >= 0 ? '+' : '';
    const obs  = totalGrowth > 5
      ? 'Tendência positiva consistente — manter as estratégias pedagógicas em curso.'
      : totalGrowth < 0
        ? 'Atenção: queda no desempenho geral da rede. Identificar causas e intervir.'
        : 'Evolução moderada — há espaço para acelerar o aprendizado nas próximas semanas.';
    textEl.textContent = `A rede acumula ${sign}${totalGrowth.toFixed(1)} p.p. desde o 1º simulado, chegando a ${currentMedia.toFixed(1)}% de acerto médio no ${SIMULADOS[currentIdx]?.labelCurto || 'simulado atual'}. ${obs}`;
  }

  // Discipline bars (same style as componentes)
  const discBarsEl = el('sim-evo-disc-bars');
  if (discBarsEl) {
    const simSrc = _SIM_Q.length ? _SIM_Q : QUESTOES;
    const byDisc = {};
    simSrc.forEach(q => {
      if (!byDisc[q.disc]) byDisc[q.disc] = [];
      byDisc[q.disc].push(q.acerto);
    });
    const entries = Object.entries(byDisc)
      .map(([disc, arr]) => ({ disc, media: arr.reduce((s, v) => s + v, 0) / arr.length }))
      .sort((a, b) => b.media - a.media);

    discBarsEl.innerHTML = entries.map(e => {
      const diff   = e.media - (REDE_DISC[e.disc] ?? e.media);
      const status = diff > 3 ? 'above' : diff < -3 ? 'crit' : 'avg';
      return `<div class="sim-comp-bar-row">
        <div class="sim-comp-disc">${e.disc}</div>
        <div class="sim-comp-track"><div class="sim-comp-fill ${status}" style="width:${Math.min(e.media,100).toFixed(1)}%"></div></div>
        <div class="sim-comp-pct">${e.media.toFixed(1)}%</div>
      </div>`;
    }).join('');
  }

  // Status distribution
  const statusDistEl = el('sim-evo-status-dist');
  if (statusDistEl) {
    const simSrc2 = _SIM_Q.length ? _SIM_Q : QUESTOES;
    const counts = { above: 0, att: 0, crit: 0 };
    simSrc2.forEach(q => { if (q.status in counts) counts[q.status]++; });
    const total = simSrc2.length;
    const rows = [
      { key: 'above', label: 'Consolidadas', fill: 'above' },
      { key: 'att',   label: 'Atenção',      fill: 'below' },
      { key: 'crit',  label: 'Críticas',     fill: 'crit'  }
    ];
    statusDistEl.innerHTML = rows.map(({ key, label, fill }) => {
      const n   = counts[key];
      const pct = ((n / total) * 100).toFixed(0);
      return `<div class="sim-comp-bar-row">
        <div class="sim-comp-disc">${label}</div>
        <div class="sim-comp-track"><div class="sim-comp-fill ${fill}" style="width:${pct}%"></div></div>
        <div class="sim-comp-pct">${n} (${pct}%)</div>
      </div>`;
    }).join('');
  }
}

/* ── POPULADORES DE SELECT ─────────────────────────────────── */
function _populateSimSelect() {
  const sel = el('sel-simulado');
  if (!sel || sel.options.length > 1) return;
  sel.innerHTML = SIMULADOS.map(s =>
    `<option value="sim${s.id}"${('sim' + s.id) === S.simId ? ' selected' : ''}>${s.label}</option>`
  ).join('');
}

function _populateEscolaSelect() {
  const sel = el('sel-escola');
  if (!sel || sel.options.length > 1) return;
  sel.innerHTML = ESCOLAS.map(e =>
    `<option value="${e.key}"${e.key === S.escolaKey ? ' selected' : ''}>${e.nome}</option>`
  ).join('');
}

function _populateAlunoSelect() {
  const sel = el('sel-aluno');
  if (!sel || sel.options.length > 1) return;
  const keys = Object.keys(ALUNOS);
  sel.innerHTML = keys.map(k =>
    `<option value="${k}"${k === S.alunoKey ? ' selected' : ''}>${ALUNOS[k].nome}</option>`
  ).join('');
}

function _populateProfSelect() {
  const sel = el('sel-professor');
  if (!sel || sel.options.length > 1) return;
  const keys = Object.keys(PROFESSORES);
  sel.innerHTML = keys.map(k =>
    `<option value="${k}"${k === S.profKey ? ' selected' : ''}>${PROFESSORES[k].nome}</option>`
  ).join('');
}

/* ── LOADERS DE ENTIDADE ───────────────────────────────────── */
function loadAluno(key) {
  S.alunoKey = key;
  const aluno = ALUNOS[key];
  if (!aluno) return;

  _setKpi('aluno-nome',    aluno.nome);
  _setKpi('aluno-kpi-media', aluno.nota);
  _setKpi('aluno-kpi-part',  aluno.part);
  _setKpi('aluno-kpi-faixa', aluno.pct || '—');

  // hero card
  const avEl = el('aluno-av');
  if (avEl) avEl.textContent = aluno.av;
  const metaEl = el('aluno-meta');
  if (metaEl) metaEl.textContent = aluno.escola + ' · ' + aluno.turma + ' · ' + aluno.serie;

  _setKpi('aluno-kpi-rank', aluno.pos);

  // Pontos fortes e fracos
  const strongEl = el('aluno-strong');
  const weakEl   = el('aluno-weak');
  if (strongEl && aluno.strong) {
    strongEl.innerHTML = aluno.strong.map(s => `<div class="pi"><div class="pi-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><div class="pi-sub">${s}</div></div>`).join('');
  }
  if (weakEl && aluno.weak) {
    weakEl.innerHTML = aluno.weak.map(s => `<div class="pi"><div class="pi-ico amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div class="pi-sub">${s}</div></div>`).join('');
  }

  // Síntese pedagógica
  const insEl = el('aluno-insight');
  if (insEl && aluno.insight) insEl.innerHTML = aluno.insight;

  // Evolução
  const diff = aluno.evo.at(-1) - aluno.evo.at(-3);
  const sinal = diff >= 0 ? '+' : '';
  _setKpi('aluno-evo-crescimento', sinal + (aluno.evo.at(-1) - aluno.evo.at(0)).toFixed(1) + ' p.p.');
  _setKpi('aluno-evo-ultimo',      aluno.nota);
  _setKpi('aluno-evo-tend',        diff >= 0 ? 'Crescente' : 'Queda');
}

function loadProfessor(key) {
  S.profKey = key;
  const p = getProfessor(key);
  if (!p) return;

  _setKpi('prof-nome',       p.nome);
  _setKpi('prof-disciplina', p.disc);
  _setKpi('prof-kpi-iq',     p.evo_iq.at(-1).toFixed(1));
  _setKpi('prof-kpi-acerto', p.evo_acerto.at(-1) + '%');
  _setKpi('prof-kpi-questoes', p.questoes.length);

  // Notas pedagógicas
  _updateProfNotas();
}

/* ── DEVOLUTIVA NARRATIVA ──────────────────────────────────── */
function gerarDevolutiva() {
  const src = _SIM_Q.length ? _SIM_Q : QUESTOES;
  const q = src[S.selectedQIdx];
  if (!q) return;
  const inf = inferirQuestao(q);

  const modal = el('modal-devolutiva');
  if (!modal) return;

  el('modal-dev-titulo').textContent  = inf.titulo;
  el('modal-dev-questao').textContent = 'Q' + String(q.num).padStart(2,'0') + ' — ' + q.comp;
  el('modal-dev-texto').textContent   = inf.texto;

  const badge = el('modal-dev-badge');
  if (badge) {
    badge.className = 'infer-badge ' + inf.cor;
    badge.textContent = inf.padrao.replace(/_/g, ' ');
  }

  modal.classList.remove('hidden');
  modal.classList.add('visible');
}

function fecharModal() {
  const modal = el('modal-devolutiva');
  if (modal) {
    modal.classList.remove('visible');
    modal.classList.add('hidden');
  }
}

/* ── COMPONENTES TABLE ─────────────────────────────────────── */
function buildCompTable(escolaKey) {
  const tbody = el('comp-escola-tbody');
  if (!tbody) return;
  const comps = (typeof getEscolaComponents === 'function') ? getEscolaComponents(escolaKey) : [];
  tbody.innerHTML = comps.map(c => {
    const diffClass = c.diff > 0 ? 'diff-pos' : c.diff < 0 ? 'diff-neg' : 'diff-neu';
    const sign = c.diff >= 0 ? '+' : '';
    const sc = c.diff > 3 ? 'badge-above' : c.diff < -3 ? 'badge-crit' : c.diff > 0 ? 'badge-avg' : 'badge-att';
    const st = c.diff > 3 ? 'Acima da média' : c.diff < -3 ? 'Crítico' : c.diff > 0 ? 'Na média' : 'Atenção';
    return `<tr>
      <td class="bold">${c.disc}</td>
      <td>${c.mediaEscola.toFixed(1)}%</td>
      <td>${c.mediaRede.toFixed(1)}%</td>
      <td class="${diffClass}">${sign}${c.diff.toFixed(1)}</td>
      <td><span class="badge ${sc}">${st}</span></td>
    </tr>`;
  }).join('');
}

/* ── BOOTSTRAP ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // Ativa listeners nos nav-items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      const page = this.dataset.page;
      if (page) goTo(page);
    });
  });

  // Fecha modal ao clicar no overlay
  const modal = el('modal-devolutiva');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) fecharModal();
    });
  }

  // Tecla Escape fecha modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModal();
  });

  // Inicia no dashboard
  goTo('dashboard');
});
