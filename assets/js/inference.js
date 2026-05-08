/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Motor de Inferência Pedagógica
   Implementa os 7 padrões da seção 16 do documento de produto.
   Entradas: atributos da questão. Saída: { cor, titulo, texto }
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── PADRÕES DE REFERÊNCIA ─────────────────────────────────── */
const THRESHOLDS = {
  acerto: {
    facil:  76,    // acerto >= 76 → questão fácil demais
    bom:    55,    // acerto >= 55 → adequado
    baixo:  44,    // acerto < 44 → baixo
    critico: 35,   // acerto < 35 → crítico
  },
  discriminante: {
    alto: 0.32,
    baixo: 0.24,
  },
  distrator: {
    dominante: 27,   // distPct >= 27 → distrator dominante alto
  },
};

/* ── TEXTOS POR PADRÃO ─────────────────────────────────────── */
function _texto(padrao, q) {
  const comp = q.comp || q.assunto || '';
  const dist = q.dist + ' (' + q.distPct + '%)';
  switch (padrao) {
    case 'excelente':
      return `Questão bem construída: acerto de ${q.acerto}% com discriminante ${q.discriminante}. Separa com eficiência os alunos que dominam o conteúdo. Distrator ${dist} indica nível saudável de dúvida conceitual. Manter calibração nas próximas edições.`;
    case 'facil_boa_disc':
      return `Questão fácil com bom discriminante (${q.discriminante}): acerto de ${q.acerto}%. Sugere domínio consolidado do conteúdo de ${comp}. Baixo poder diagnóstico para distinguir alunos avançados — considerar aumentar a complexidade nos próximos simulados.`;
    case 'facil_baixa_disc':
      return `Questão muito fácil e com baixo discriminante (${q.discriminante}): acerto de ${q.acerto}%. Praticamente todos os alunos acertam, o que reduz o valor diagnóstico do item. Recomenda-se revisão completa — reformular enunciado ou distratores para o próximo ciclo.`;
    case 'dificil_boa_disc':
      return `Questão de alta dificuldade (${q.acerto}% de acerto) mas com bom discriminante (${q.discriminante}). O conteúdo de ${comp} indica lacuna curricular relevante: alunos que dominam o conteúdo se saem melhor, mas a maioria ainda não consolidou esse conhecimento. Recomenda-se revisão do tema em sala.`;
    case 'dificil_baixa_disc':
      return `Sinal de alerta: acerto de ${q.acerto}% e discriminante baixo (${q.discriminante}). A questão pode conter ambiguidade no enunciado ou nos distratores, ou o conteúdo de ${comp} ainda não foi trabalhado adequadamente. Revisão da questão e do planejamento curricular recomendada.`;
    case 'distrator_dominante':
      return `Distrator ${dist} concentra parcela expressiva dos erros — supera ou se aproxima da alternativa correta. Indica erro conceitual recorrente: os alunos confundem sistematicamente este conceito de ${comp}. Recomenda-se trabalhar especificamente esta confusão conceitual em aula.`;
    case 'evolucao_positiva':
      return `Evolução positiva detectada: acerto de ${q.acerto}% sugere melhora em relação ao padrão histórico. Intervenções pedagógicas recentes em ${comp} podem estar gerando resultado. Manter acompanhamento para confirmar consolidação do aprendizado.`;
    default:
      return `Questão com desempenho dentro do esperado: acerto de ${q.acerto}% e discriminante ${q.discriminante}. Distrator ${dist} dentro do padrão. Nenhum sinal de atenção identificado para este item.`;
  }
}

function _cor(padrao) {
  switch (padrao) {
    case 'excelente':          return 'green';
    case 'facil_boa_disc':     return 'blue';
    case 'facil_baixa_disc':   return 'amber';
    case 'dificil_boa_disc':   return 'blue';
    case 'dificil_baixa_disc': return 'red';
    case 'distrator_dominante':return 'orange';
    case 'evolucao_positiva':  return 'green';
    default:                   return 'blue';
  }
}

function _titulo(padrao) {
  switch (padrao) {
    case 'excelente':          return 'Questão bem construída';
    case 'facil_boa_disc':     return 'Conteúdo dominado — atenção ao diagnóstico';
    case 'facil_baixa_disc':   return 'Questão com baixo poder diagnóstico';
    case 'dificil_boa_disc':   return 'Lacuna curricular detectada';
    case 'dificil_baixa_disc': return 'Questão ou ensino merecem revisão';
    case 'distrator_dominante':return 'Erro conceitual recorrente identificado';
    case 'evolucao_positiva':  return 'Sinal de aprendizado';
    default:                   return 'Desempenho dentro do esperado';
  }
}

/* ── FUNÇÃO PRINCIPAL ─────────────────────────────────────── */
function inferirQuestao(q) {
  const A = q.acerto;
  const D = q.discriminante;
  const DP = q.distPct;

  let padrao = 'neutro';

  // Padrão 5: Distrator dominante (alta prioridade, detectar antes)
  if (DP >= THRESHOLDS.distrator.dominante) {
    padrao = 'distrator_dominante';
  }
  // Padrão 1: Acerto alto + discriminante alto
  else if (A >= THRESHOLDS.acerto.bom && D >= THRESHOLDS.discriminante.alto) {
    padrao = 'excelente';
  }
  // Padrão 2a: Acerto alto + discriminante bom (fácil mas decente)
  else if (A >= THRESHOLDS.acerto.facil && D >= THRESHOLDS.discriminante.baixo) {
    padrao = 'facil_boa_disc';
  }
  // Padrão 2b: Acerto alto + discriminante baixo (fácil e fraca)
  else if (A >= THRESHOLDS.acerto.facil && D < THRESHOLDS.discriminante.baixo) {
    padrao = 'facil_baixa_disc';
  }
  // Padrão 3: Acerto baixo + discriminante alto (boa questão, conteúdo não dominado)
  else if (A < THRESHOLDS.acerto.baixo && D >= THRESHOLDS.discriminante.alto) {
    padrao = 'dificil_boa_disc';
  }
  // Padrão 4: Acerto baixo + discriminante baixo (questão problemática)
  else if (A < THRESHOLDS.acerto.baixo && D < THRESHOLDS.discriminante.baixo) {
    padrao = 'dificil_baixa_disc';
  }

  return {
    padrao,
    cor:    _cor(padrao),
    titulo: _titulo(padrao),
    texto:  _texto(padrao, q),
  };
}

/* ── INFERÊNCIA PARA PROFESSOR ─────────────────────────────── */
function inferirProfessor(profKey) {
  const p = getProfessor(profKey);
  const qs = p.questoes.map(i => QUESTOES[i]).filter(Boolean);
  const faceis   = qs.filter(q => q.acerto >= THRESHOLDS.acerto.facil).length;
  const criticas = qs.filter(q => q.status === 'crit').length;
  const boaDisc  = qs.filter(q => q.discriminante >= THRESHOLDS.discriminante.alto).length;
  const tendencia = p.evo_iq.at(-1) > p.evo_iq.at(-3);

  let notas = [];
  if (faceis >= 2) notas.push(`${faceis} questões com acerto muito alto (>76%) — baixo poder diagnóstico. Recalibrar distratores.`);
  if (criticas >= 2) notas.push(`${criticas} questões críticas (acerto <42%) — revisar enunciado ou verificar cobertura curricular.`);
  if (boaDisc >= Math.round(qs.length * 0.6)) notas.push(`Maioria das questões com discriminante adequado — boa consistência diagnóstica.`);
  if (tendencia) notas.push(`Índice de qualidade em tendência de crescimento — evolução positiva nos últimos simulados.`);

  return notas;
}

/* ── INFERÊNCIA PARA ESCOLA ─────────────────────────────────── */
function inferirEscola(escolaKey) {
  const e = getEscola(escolaKey);
  const comps = getEscolaComponents(escolaKey);
  const abaixo = comps.filter(c => c.diff < -3);
  const acima  = comps.filter(c => c.diff > 3);
  const tendencia = e.evo.at(-1) - e.evo.at(-3);

  let textos = [];
  if (acima.length > 0) textos.push(`${acima.map(c=>c.disc).join(', ')} com desempenho acima da média da rede.`);
  if (abaixo.length > 0) textos.push(`${abaixo.map(c=>c.disc).join(', ')} requerem atenção pedagógica prioritária.`);
  if (tendencia > 3) textos.push(`Crescimento de ${tendencia.toFixed(1)} p.p. nos últimos três simulados — tendência positiva.`);
  else if (tendencia < -2) textos.push(`Queda de ${Math.abs(tendencia).toFixed(1)} p.p. nos últimos simulados — acompanhamento necessário.`);

  return textos.join(' ') || `Desempenho estável. Acompanhar evolução no próximo simulado.`;
}
