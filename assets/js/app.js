/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Controlador Principal
   Navegação, tabs, eventos DOM, inicialização.
   Depende de: data.js, inference.js, charts.js, filters.js
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── UTILITÁRIO (el() já definido em charts.js) ─────────────── */

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
  _populateSimSelect();
  buildQGrid();
  selectQ(0);
  _buildSimSignals();
}

function _buildSimSignals() {
  const baixaDisc = QUESTOES.filter(q => q.discriminante < 0.24).length;
  const criticas  = QUESTOES.filter(q => q.status === 'crit').length;
  const distDom   = QUESTOES.filter(q => q.distPct >= 27).length;
  const faceis    = QUESTOES.filter(q => q.acerto >= 76).length;
  _setKpi('sig-baixa-disc', baixaDisc);
  _setKpi('sig-criticas',   criticas);
  _setKpi('sig-distratores',distDom);
  _setKpi('sig-faceis',     faceis);
}

function _initEscolas() {
  _populateEscolaSelect();
  refreshEscolas();
  switchEscolaTab('desempenho');
}

function _initAlunos() {
  _populateAlunoSelect();
  loadAluno(S.alunoKey);
  switchAlunoTab('desempenho');
}

function _initProfessores() {
  _populateProfSelect();
  loadProfessor(S.profKey);
  switchProfTab('questoes');
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
      return `<div class="pi-wrap"><div class="pi pi-expandable" onclick="togglePiExpand(this.parentElement)"><div class="pi-ico ${item.cor}">${_getDashIcon(item.ico)}</div><div><div class="pi-name" style="color:${nameColor}">${item.nome}</div><div class="pi-sub">${item.sub}</div></div><div class="pi-arr pi-chevron">›</div></div><div class="pi-expand"><div class="pi-expand-inner">${expandHtml}</div></div></div>`;
    }).join('');
  }

  const priEl = el('dash-prioridades-items');
  if (priEl) {
    priEl.innerHTML = d.prioridades.map((item, i) => {
      const det = d.prioridadesDetalhe && d.prioridadesDetalhe[i];
      const expandHtml = det ? _buildPiExpand(det.rows) : '';
      return `<div class="pi-wrap"><div class="pi pi-expandable" onclick="togglePiExpand(this.parentElement)"><div class="pi-ico ${item.cor}">${_getDashIcon(item.ico)}</div><div><div class="pi-name">${item.nome}</div><div class="pi-sub">${item.sub}</div></div><div class="pi-arr pi-chevron">›</div></div><div class="pi-expand"><div class="pi-expand-inner">${expandHtml}</div></div></div>`;
    }).join('');
  }

  const arEl = el('dash-ar-items');
  if (arEl) {
    arEl.innerHTML = d.acessoRapido.map(item =>
      `<div class="dash-ar-card" onclick="goTo('${item.page}')"><div class="dash-ar-ico ${item.corClass}">${_getDashIcon(item.ico)}</div><div class="dash-ar-title">${item.titulo}</div><span class="badge ${item.badgeCor}">${item.badgeText}</span><div class="dash-ar-desc">${item.desc}</div><div class="dash-ar-link">Ver ${item.titulo.toLowerCase()} →</div></div>`
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

  const disc = S.simDisciplina;

  grid.innerHTML = QUESTOES.map((q, i) => {
    const inf = inferirQuestao(q);
    const dimmed = (disc !== 'Todas' && q.disc !== disc) ? ' dimmed' : '';
    const active  = (i === S.selectedQIdx) ? ' active' : '';
    return `<div class="qcell${dimmed}${active}" onclick="selectQ(${i})" title="${q.comp}">
      <span class="qcell-num">Q${String(q.num).padStart(2,'0')}</span>
      <span class="qcell-dot ${inf.cor}"></span>
    </div>`;
  }).join('');
}

function selectQ(idx) {
  S.selectedQIdx = idx;
  const q = QUESTOES[idx];
  if (!q) return;

  // Atualiza estado visual da grade
  document.querySelectorAll('.qcell').forEach((cell, i) => {
    cell.classList.toggle('active', i === idx);
  });

  // Preenche painel de detalhes da questão
  _renderQDetail(q);

  // Atualiza gráficos de análise
  renderSimDistChart(q);
  renderSimTurmaChart(q);
}

function _renderQDetail(q) {
  const inf = inferirQuestao(q);
  const pos = QUESTOES.indexOf(q) + 1;

  _setKpi('q-num',    String(q.num).padStart(2, '0'));
  _setKpi('qp-pos',   pos + ' / ' + QUESTOES.length);
  _setKpi('q-disc',   q.disc);
  _setKpi('q-comp',   q.comp);
  _setKpi('q-assunto',q.assunto);
  _setKpi('q-acerto', q.acerto + '%');
  _setKpi('q-gab',    q.gab);
  _setKpi('q-dist',   q.dist + ' (' + q.distPct + '%)');
  _setKpi('q-discrim',q.discriminante.toFixed(2));

  // Badge de status
  const statusEl = el('q-status');
  if (statusEl) {
    statusEl.className = 'q-status-badge ' + q.status;
    statusEl.textContent = q.status === 'above' ? 'Acima da média' :
                           q.status === 'att'   ? 'Atenção' : 'Crítico';
  }

  // Painel de inferência
  const infEl = el('q-infer');
  if (infEl) {
    infEl.className = 'infer-panel ' + inf.cor;
    infEl.innerHTML = `<div class="infer-titulo">${inf.titulo}</div>
      <div class="infer-texto">${inf.texto}</div>`;
  }
}

/* ── POPULADORES DE SELECT ─────────────────────────────────── */
function _populateSimSelect() {
  const sel = el('sel-simulado');
  if (!sel || sel.options.length > 1) return;
  sel.innerHTML = SIMULADOS.map(s =>
    `<option value="${s.id}"${s.id === S.simId ? ' selected' : ''}>${s.label}</option>`
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
  const q = QUESTOES[S.selectedQIdx];
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
