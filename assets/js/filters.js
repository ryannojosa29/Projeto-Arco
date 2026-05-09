/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Estado Central de Filtros
   Gerencia S (estado reativo) e funções de refresh por página.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── ESTADO GLOBAL ─────────────────────────────────────────── */
const S = {
  /* Simulados */
  simId:         'sim5',
  simDisciplina: 'Todas',
  simEscola:     'A',
  simTurma:      'todas',
  selectedQIdx:  0,
  simTab:        'anatomia',
  simEvoTipo:    'media',

  /* Escolas */
  escolaKey:     'A',
  escolaTab:     'desempenho',
  rankTipo:      'geral',
  evoTipo:       'geral',

  /* Alunos */
  alunoKey:      'ana',
  alunoTab:      'desempenho',

  /* Professores */
  profKey:       'silva',
  profTab:       'questoes',

  /* Navegação */
  currentPage:   'dashboard',
};

/* ── SETTERS DE FILTRO ─────────────────────────────────────── */
function setSimulado(val) {
  S.simId = val;
  refreshSimulados();
}

function setSimDisciplina(val) {
  S.simDisciplina = val;
  if (typeof buildQGrid === 'function') buildQGrid();
}

function setSimEscola(val) {
  S.simEscola = val;
  refreshSimulados();
}

function setSimTurma(val) {
  S.simTurma = val;
  refreshSimulados();
}

function setEscola(val) {
  S.escolaKey = val;
  refreshEscolas();
}

function setRankTipo(val) {
  S.rankTipo = val;
  renderRankTableChart(val);
}

function setEvoTipo(val) {
  S.evoTipo = val;
  if (typeof renderEvoGeralChart === 'function') renderEvoGeralChart(S.escolaKey);
}

function setAluno(val) {
  S.alunoKey = val;
  if (typeof loadAluno === 'function') loadAluno(val);
  refreshAlunos();
}

function setProfessor(val) {
  S.profKey = val;
  if (typeof loadProfessor === 'function') loadProfessor(val);
  refreshProfessores();
}

/* ── REFRESH POR PÁGINA ────────────────────────────────────── */
function refreshDashboard() {
  // KPIs e métricas do dashboard são estáticos (rede inteira)
  // só re-renderiza se charts existirem na página
  if (typeof renderRankTableChart === 'function') renderRankTableChart(S.rankTipo);
}

function refreshSimulados() {
  if (typeof refreshSimuladosPage === 'function') refreshSimuladosPage();
}

function refreshEscolas() {
  if (typeof renderRankTableChart   === 'function') renderRankTableChart(S.rankTipo);
  if (typeof renderEscolaEvoChart   === 'function') renderEscolaEvoChart(S.escolaKey);
  if (typeof renderEscolaFaixaChart === 'function') renderEscolaFaixaChart(S.escolaKey);
  if (typeof renderCompEscolaChart  === 'function') renderCompEscolaChart(S.escolaKey);
  if (typeof renderEvoGeralChart    === 'function') renderEvoGeralChart(S.escolaKey);
  if (typeof renderEvoRankingChart  === 'function') renderEvoRankingChart(S.escolaKey);
  // Atualiza nota pedagógica da escola
  _updateEscolaNota();
  // Atualiza KPIs da escola
  _updateEscolaKpis();
}

function refreshAlunos() {
  if (typeof renderAlunoAreaChart       === 'function') renderAlunoAreaChart();
  if (typeof renderAlunoFaixaChart      === 'function') renderAlunoFaixaChart();
  if (typeof renderAlunoEvoChart        === 'function') renderAlunoEvoChart(S.alunoKey);
  if (typeof renderAlunoDesempenhoCharts=== 'function') renderAlunoDesempenhoCharts();
  if (typeof renderAlunoEvoRedeChart    === 'function') renderAlunoEvoRedeChart();
  if (typeof renderAlunoPartChart       === 'function') renderAlunoPartChart();
  if (typeof renderPartEvoChart         === 'function') renderPartEvoChart();
  if (typeof renderPartDistChart        === 'function') renderPartDistChart();
  _updateAlunoKpis();
}

function refreshProfessores() {
  if (typeof renderProfDifChart      === 'function') renderProfDifChart(S.profKey);
  if (typeof renderProfEvoChart      === 'function') renderProfEvoChart(S.profKey);
  if (typeof renderProfAlunosCharts  === 'function') renderProfAlunosCharts(S.profKey);
  if (typeof renderProfEvoQualCharts === 'function') renderProfEvoQualCharts(S.profKey);
  _updateProfNotas();
  _updateProfKpis();
}

function refreshCurrentPage() {
  switch (S.currentPage) {
    case 'dashboard':   refreshDashboard();   break;
    case 'simulados':   refreshSimulados();   break;
    case 'escolas':     refreshEscolas();     break;
    case 'alunos':      refreshAlunos();      break;
    case 'professores': refreshProfessores(); break;
  }
}

/* ── ATUALIZAÇÕES DE DOM ───────────────────────────────────── */
function _updateEscolaNota() {
  const el = document.getElementById('escola-nota');
  if (!el) return;
  const nota = (typeof inferirEscola === 'function') ? inferirEscola(S.escolaKey) : '';
  el.textContent = nota;
}

function _updateEscolaKpis() {
  const escola = (typeof getEscola === 'function') ? getEscola(S.escolaKey) : null;
  if (!escola) return;

  const mediaEl = document.getElementById('escola-kpi-media');
  const partEl  = document.getElementById('escola-kpi-part');
  const rankEl  = document.getElementById('escola-kpi-rank');

  const moveEl = document.getElementById('escola-kpi-move');

  if (mediaEl) mediaEl.textContent = escola.media.toFixed(1) + '%';
  if (partEl)  partEl.textContent  = escola.part + '%';

  // Rank da escola na rede
  const sorted = [...ESCOLAS].sort((a, b) => b.media - a.media);
  const rank = sorted.findIndex(e => e.key === S.escolaKey) + 1;
  if (rankEl)  rankEl.textContent  = rank + 'º / ' + ESCOLAS.length;
  if (moveEl) {
    const mv = escola.rankMove || 0;
    moveEl.textContent = mv > 0 ? '↑ ' + mv + ' pos.' : mv < 0 ? '↓ ' + Math.abs(mv) + ' pos.' : '— Estável';
  }
}

function _updateAlunoKpis() {
  const aluno = ALUNOS ? ALUNOS[S.alunoKey] : null;
  if (!aluno) return;

  const mediaEl = document.getElementById('aluno-kpi-media');
  const partEl  = document.getElementById('aluno-kpi-part');
  const faixaEl = document.getElementById('aluno-kpi-faixa');

  if (mediaEl) mediaEl.textContent = aluno.nota;
  if (partEl)  partEl.textContent  = aluno.part;
  if (faixaEl) faixaEl.textContent = aluno.pct || '—';
}

function _updateProfNotas() {
  const el = document.getElementById('prof-notas');
  if (!el) return;
  const notas = (typeof inferirProfessor === 'function') ? inferirProfessor(S.profKey) : [];
  el.innerHTML = notas.map(n => `<li>${n}</li>`).join('');
}

function _updateProfKpis() {
  const p = (typeof getProfessor === 'function') ? getProfessor(S.profKey) : null;
  if (!p) return;

  const iqEl    = document.getElementById('prof-kpi-iq');
  const acEl    = document.getElementById('prof-kpi-acerto');
  const qEl     = document.getElementById('prof-kpi-questoes');

  if (iqEl)  iqEl.textContent  = p.evo_iq.at(-1).toFixed(1);
  if (acEl)  acEl.textContent  = p.evo_acerto.at(-1) + '%';
  if (qEl)   qEl.textContent   = p.questoes.length;
}

/* ── TABS ─────────────────────────────────────────────────── */
function switchEscolaTab(tab) {
  S.escolaTab = tab;
  document.querySelectorAll('.escola-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.escola-atab').forEach(el => el.classList.remove('active'));
  const contentEl = document.getElementById('etab-' + tab);
  if (contentEl) contentEl.classList.remove('hidden');
  document.querySelectorAll('.escola-atab').forEach(el => {
    if (el.dataset.tab === tab) el.classList.add('active');
  });
  // Renderiza charts do tab recém-ativado
  switch (tab) {
    case 'desempenho':
      if (typeof renderEscolaEvoChart   === 'function') renderEscolaEvoChart(S.escolaKey);
      if (typeof renderEscolaFaixaChart === 'function') renderEscolaFaixaChart(S.escolaKey);
      if (typeof renderCompEscolaChart  === 'function') renderCompEscolaChart(S.escolaKey);
      break;
    case 'evolucao':
      if (typeof renderEvoGeralChart   === 'function') renderEvoGeralChart(S.escolaKey);
      if (typeof renderEvoRankingChart === 'function') renderEvoRankingChart(S.escolaKey);
      break;
    case 'ranking':
      if (typeof renderRankTableChart === 'function') renderRankTableChart(S.rankTipo);
      break;
    case 'componentes':
      if (typeof renderCompEscolaChart === 'function') renderCompEscolaChart(S.escolaKey);
      if (typeof buildCompTable        === 'function') buildCompTable(S.escolaKey);
      break;
  }
}

function switchAlunoTab(tab) {
  S.alunoTab = tab;
  document.querySelectorAll('.aluno-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.aluno-atab').forEach(el => el.classList.remove('active'));
  const contentEl = document.getElementById('atab-' + tab);
  if (contentEl) contentEl.classList.remove('hidden');
  document.querySelectorAll('.aluno-atab').forEach(el => {
    if (el.dataset.tab === tab) el.classList.add('active');
  });
  switch (tab) {
    case 'desempenho':
      if (typeof renderAlunoAreaChart        === 'function') renderAlunoAreaChart();
      if (typeof renderAlunoFaixaChart       === 'function') renderAlunoFaixaChart();
      if (typeof renderAlunoDesempenhoCharts === 'function') renderAlunoDesempenhoCharts();
      break;
    case 'evolucao':
      if (typeof renderAlunoEvoChart     === 'function') renderAlunoEvoChart(S.alunoKey);
      if (typeof renderAlunoEvoRedeChart === 'function') renderAlunoEvoRedeChart();
      break;
    case 'participacao':
      if (typeof renderPartEvoChart  === 'function') renderPartEvoChart();
      if (typeof renderPartDistChart === 'function') renderPartDistChart();
      if (typeof renderAlunoPartChart=== 'function') renderAlunoPartChart();
      break;
  }
}

function switchProfTab(tab) {
  S.profTab = tab;
  document.querySelectorAll('.prof-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.prof-atab').forEach(el => el.classList.remove('active'));
  const contentEl = document.getElementById('ptab-' + tab);
  if (contentEl) contentEl.classList.remove('hidden');
  document.querySelectorAll('.prof-atab').forEach(el => {
    if (el.dataset.tab === tab) el.classList.add('active');
  });
  switch (tab) {
    case 'questoes':
      if (typeof renderProfDifChart === 'function') renderProfDifChart(S.profKey);
      break;
    case 'alunos':
      if (typeof renderProfAlunosCharts === 'function') renderProfAlunosCharts(S.profKey);
      break;
    case 'evolucao':
      if (typeof renderProfEvoChart      === 'function') renderProfEvoChart(S.profKey);
      if (typeof renderProfEvoQualCharts === 'function') renderProfEvoQualCharts(S.profKey);
      break;
  }
}
