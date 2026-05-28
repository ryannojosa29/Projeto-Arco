/* ═══════════════════════════════════════════════════════════
   ARCO — Camada de dados real (Fase 1)
   Busca os agregados do simulado na API Python e sobrescreve a
   função síncrona getQuestoesForSim para devolver dados do banco.
   Fallback ao mock se a API estiver offline ou o simulado ausente.
   Carrega APÓS data.js e ANTES de app.js.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!window.ARCO || !window.ARCO.API_BASE) {
    console.warn('[arco] ARCO.API_BASE não definido; mantendo mocks.');
    window.bootstrapArco = async function () {};
    return;
  }
  const BASE = window.ARCO.API_BASE.replace(/\/$/, '');

  /* dificuldade derivada do % de acerto (sem o rótulo da prova) */
  function _difficultyFromAcerto(a) {
    if (a >= 76) return 'Fácil';
    if (a >= 56) return 'Médio';
    if (a >= 42) return 'Médio-alto';
    return 'Alto';
  }

  /* adapta uma linha de v_questoes para o shape do front (QUESTOES) */
  function _adaptQuestao(row) {
    return {
      num: row.num,
      disc: row.disc,
      gab: row.gab,
      acerto: row.acerto,
      dist: row.dist,
      distPct: row.distPct,
      status: row.status,
      distrib: row.distrib,                 // novo: {A..E} em % (exato)
      n_respondentes: row.n_respondentes,
      // Fase 2 (vêm da prova / folha individual):
      comp: row.comp || null,
      assunto: row.assunto || null,
      discriminante: row.discriminante,     // null na Fase 1
      diff: _difficultyFromAcerto(row.acerto),
    };
  }

  /* cache em memória das respostas */
  const _cache = { questoes: {}, simulados: null, resumo: {} };
  window.ARCO._cache = _cache;  // exposto para inspeção/debug

  async function _fetchSimulados() {
    const res = await fetch(`${BASE}/api/simulados`);
    if (!res.ok) throw new Error(`API /simulados ${res.status}`);
    return res.json();
  }
  async function _fetchQuestoes(chave) {
    const res = await fetch(`${BASE}/api/simulados/${encodeURIComponent(chave)}/questoes`);
    if (!res.ok) throw new Error(`API /questoes(${chave}) ${res.status}`);
    return (await res.json()).map(_adaptQuestao);
  }
  async function _fetchResumo(chave) {
    const res = await fetch(`${BASE}/api/simulados/${encodeURIComponent(chave)}/resumo`);
    if (!res.ok) throw new Error(`API /resumo(${chave}) ${res.status}`);
    return res.json();
  }

  /* sobrescreve getQuestoesForSim: prefere cache real; cai no mock se ausente */
  function _installOverride() {
    const _mock = window.getQuestoesForSim;
    window.getQuestoesForSim = function (simId) {
      const real = _cache.questoes[simId];
      if (real && real.length) return real.map(q => ({ ...q }));
      return _mock ? _mock(simId) : [];
    };
  }

  /* bootstrap: chamado pelo app.js antes do primeiro render */
  async function bootstrapArco() {
    _installOverride();
    try {
      const sims = await _fetchSimulados();
      _cache.simulados = sims;
      await Promise.all(sims.map(s =>
        Promise.all([
          _fetchQuestoes(s.chave).then(qs => { _cache.questoes[s.chave] = qs; }),
          _fetchResumo(s.chave).then(r => { _cache.resumo[s.chave] = r; }),
        ]).catch(err => console.warn(`[arco] sim ${s.chave}:`, err.message))
      ));
      const chaves = Object.keys(_cache.questoes);
      console.info(`[arco] dados reais carregados: ${chaves.length ? chaves.join(', ') : '(nenhum simulado no banco)'}`);
    } catch (err) {
      console.warn('[arco] bootstrap falhou; seguindo no mock:', err.message);
    }
  }
  window.bootstrapArco = bootstrapArco;
})();
