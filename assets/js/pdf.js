/* ═══════════════════════════════════════════════════════════
   ARCO EDUCAÇÃO — Geração de PDF
   Requer jsPDF carregado antes deste script.
   Gera devolutiva institucional com capa, resumo e questões.
═══════════════════════════════════════════════════════════ */
'use strict';

function gerarPDF() {
  if (typeof window.jspdf === 'undefined') {
    alert('jsPDF não disponível. Verifique a conexão com a internet.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const W = 210;
  const H = 297;
  const PAD = 20;
  const CONTENT_W = W - PAD * 2;

  /* ── helpers ─────────────────────────────────────────── */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function setColor(hex) {
    const [r, g, b] = hexToRgb(hex);
    doc.setTextColor(r, g, b);
  }

  function setFill(hex) {
    const [r, g, b] = hexToRgb(hex);
    doc.setFillColor(r, g, b);
  }

  function setDraw(hex) {
    const [r, g, b] = hexToRgb(hex);
    doc.setDrawColor(r, g, b);
  }

  function textWrapped(text, x, y, maxW, lineH) {
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, x, y);
    return y + lines.length * lineH;
  }

  /* ── CAPA ─────────────────────────────────────────────── */
  setFill('#0F1F3D');
  doc.rect(0, 0, W, H, 'F');

  // Acento laranja
  setFill('#E8521A');
  doc.rect(0, H - 8, W, 8, 'F');

  // Logo / nome
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  setColor('#FFFFFF');
  doc.text('ARCO', PAD, 60);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setColor('#E8521A');
  doc.text('EDUCAÇÃO', PAD, 70);

  // Linha separadora
  setDraw('#E8521A');
  doc.setLineWidth(0.5);
  doc.line(PAD, 78, PAD + 40, 78);

  // Título do relatório
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor('#FFFFFF');
  doc.text('Devolutiva Pedagógica', PAD, 100);

  // Subtítulo (simulado atual)
  const simAtual = SIMULADOS.find(s => s.id === S.simId) || SIMULADOS[0];
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  setColor('#9E9E98');
  doc.text(simAtual.label, PAD, 112);

  // Data
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  setColor('#6B6B66');
  doc.text('Gerado em ' + hoje, PAD, 125);

  // Escola selecionada
  const escola = getEscola(S.escolaKey);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor('#FFFFFF');
  doc.text(escola.nome, PAD, 145);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor('#9E9E98');
  doc.text('Escola selecionada para esta devolutiva', PAD, 153);

  /* ── PÁGINA 2 — RESUMO EXECUTIVO ──────────────────────── */
  doc.addPage();

  // Cabeçalho da página
  setFill('#0F1F3D');
  doc.rect(0, 0, W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor('#FFFFFF');
  doc.text('ARCO EDUCAÇÃO  ·  Devolutiva Pedagógica', PAD, 12);

  let y = 32;

  // Título da seção
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor('#0F1F3D');
  doc.text('Resumo Executivo', PAD, y);
  y += 8;

  // Linha decorativa
  setFill('#E8521A');
  doc.rect(PAD, y, 30, 1.5, 'F');
  y += 10;

  // KPIs em boxes
  const kpis = [
    { label: 'Média da Escola',   value: escola.media.toFixed(1) + '%' },
    { label: 'Participação',       value: escola.part + '%' },
    { label: 'Variação vs Rede',   value: (escola.var >= 0 ? '+' : '') + escola.var.toFixed(1) + 'p.p.' },
  ];

  const boxW = (CONTENT_W - 10) / 3;
  kpis.forEach((kpi, i) => {
    const bx = PAD + i * (boxW + 5);
    const by = y;
    setFill('#F5F4F1');
    setDraw('#E8E6DF');
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, boxW, 22, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor('#6B6B66');
    doc.text(kpi.label, bx + 5, by + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setColor('#0F1F3D');
    doc.text(kpi.value, bx + 5, by + 18);
  });
  y += 32;

  // Análise da escola (inferência pedagógica)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setColor('#0F1F3D');
  doc.text('Análise Pedagógica', PAD, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor('#3D3D3A');
  const notaEscola = (typeof inferirEscola === 'function') ? inferirEscola(S.escolaKey) : '';
  y = textWrapped(notaEscola, PAD, y, CONTENT_W, 5.5);
  y += 8;

  // Pontos fortes e fracos
  const forte = escola.forte || '—';
  const fraco = escola.fraco || '—';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor('#15803D');
  doc.text('Destaque positivo:', PAD, y);
  doc.setFont('helvetica', 'normal');
  setColor('#3D3D3A');
  doc.text(forte, PAD + 38, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  setColor('#B91C1C');
  doc.text('Ponto de atenção:', PAD, y);
  doc.setFont('helvetica', 'normal');
  setColor('#3D3D3A');
  doc.text(fraco, PAD + 37, y);
  y += 14;

  /* ── PÁGINA 3 — ANÁLISE DE QUESTÕES ──────────────────── */
  doc.addPage();

  // Cabeçalho
  setFill('#0F1F3D');
  doc.rect(0, 0, W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor('#FFFFFF');
  doc.text('ARCO EDUCAÇÃO  ·  Devolutiva Pedagógica', PAD, 12);

  y = 32;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor('#0F1F3D');
  doc.text('Análise de Questões', PAD, y);
  y += 8;

  setFill('#E8521A');
  doc.rect(PAD, y, 30, 1.5, 'F');
  y += 12;

  // Tabela de questões
  const colWidths = [14, 28, 22, 18, 20, CONTENT_W - 102];
  const cols = ['Nº', 'Competência', 'Acerto', 'Discrim.', 'Padrão', 'Observação'];
  const rowH = 8;

  // Cabeçalho da tabela
  setFill('#0F1F3D');
  doc.rect(PAD, y, CONTENT_W, rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor('#FFFFFF');
  let cx = PAD + 2;
  cols.forEach((col, i) => {
    doc.text(col, cx, y + 5.5);
    cx += colWidths[i];
  });
  y += rowH;

  const COR_MAP = {
    green:  '#15803D',
    blue:   '#1D4ED8',
    amber:  '#B45309',
    red:    '#B91C1C',
    orange: '#C2410C',
  };

  QUESTOES.forEach((q, idx) => {
    if (y > H - 25) {
      doc.addPage();
      setFill('#0F1F3D');
      doc.rect(0, 0, W, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor('#FFFFFF');
      doc.text('ARCO EDUCAÇÃO  ·  Devolutiva Pedagógica', PAD, 12);
      y = 28;

      setFill('#0F1F3D');
      doc.rect(PAD, y, CONTENT_W, rowH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setColor('#FFFFFF');
      cx = PAD + 2;
      cols.forEach((col, i) => {
        doc.text(col, cx, y + 5.5);
        cx += colWidths[i];
      });
      y += rowH;
    }

    const inf = (typeof inferirQuestao === 'function') ? inferirQuestao(q) : { cor: 'blue', titulo: '—', texto: '' };

    // Zebra
    if (idx % 2 === 0) {
      setFill('#F5F4F1');
      doc.rect(PAD, y, CONTENT_W, rowH, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    const rowData = [
      'Q' + String(q.num).padStart(2, '0'),
      q.comp.length > 16 ? q.comp.slice(0, 15) + '…' : q.comp,
      q.acerto + '%',
      q.discriminante.toFixed(2),
      inf.titulo.length > 18 ? inf.titulo.slice(0, 17) + '…' : inf.titulo,
      inf.texto.length > 55 ? inf.texto.slice(0, 54) + '…' : inf.texto,
    ];

    cx = PAD + 2;
    rowData.forEach((cell, i) => {
      if (i === 4) {
        setColor(COR_MAP[inf.cor] || '#1A1A18');
      } else {
        setColor('#1A1A18');
      }
      doc.text(String(cell), cx, y + 5.5);
      cx += colWidths[i];
    });

    // Linha divisória
    setDraw('#E8E6DF');
    doc.setLineWidth(0.1);
    doc.line(PAD, y + rowH, PAD + CONTENT_W, y + rowH);

    y += rowH;
  });

  /* ── RODAPÉ em todas as páginas ───────────────────────── */
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setFill('#F5F4F1');
    doc.rect(0, H - 10, W, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor('#9E9E98');
    doc.text('Arco Educação — Uso exclusivo interno', PAD, H - 4);
    doc.text('Página ' + i + ' de ' + totalPages, W - PAD - 15, H - 4);
  }

  doc.save('devolutiva-arco-' + S.simId + '-' + S.escolaKey + '.pdf');
}

function generateProfessorFeedbackPDF(profKey, profSim) {
  const pDados = (typeof getProfDados === 'function') ? getProfDados(profKey) : null;
  const resumo = (typeof getProfResumo === 'function') ? getProfResumo(profKey, profSim, S.profComp) : null;
  if (!pDados || !resumo || !resumo.nqs) {
    alert('Nenhum dado disponível para gerar a devolutiva. Selecione um professor e simulado.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, PAD = 18;

  const navy  = [15, 31, 61];
  const orange = [232, 82, 26];
  const white  = [255, 255, 255];
  const gray   = [158, 158, 152];

  function setColor(c) { doc.setTextColor(...c); }
  function setFill(c)  { doc.setFillColor(...c); }

  const simLabel = profSim === 'acumulado' ? 'Acumulado (Sim 1–5)' : 'Simulado ' + profSim.replace('sim','');
  const compLabel = S.profComp === 'todas' ? 'Todos os componentes' : S.profComp;
  const qs = (typeof getProfQuestoesFiltradas === 'function') ? getProfQuestoesFiltradas(profKey, profSim, S.profComp) : [];
  const comResol = qs.filter(q => q.acerto < 35).length;
  const comRevis = qs.filter(q => q.status === 'revisao').length;

  // ── Capa ──
  setFill(navy);
  doc.rect(0, 0, W, H, 'F');
  setFill(orange);
  doc.rect(0, H - 18, W, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setColor(white);
  doc.text('ARCO', PAD, 36);

  doc.setFontSize(11);
  setColor([255, 255, 255]);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Devolutiva Pedagógica', PAD, 45);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  setColor(white);
  doc.text('Devolutiva da Frente', PAD, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text(pDados.nome, PAD, 103);
  doc.setFontSize(11);
  doc.text(pDados.disc + ' · ' + compLabel, PAD, 112);
  doc.text(simLabel, PAD, 120);

  doc.setFontSize(9);
  setColor(gray);
  doc.text('Gerado em ' + new Date().toLocaleDateString('pt-BR'), PAD, H - 24);

  // ── Página 2: Resumo ──
  doc.addPage();
  setFill(white);
  doc.rect(0, 0, W, H, 'F');

  setFill(navy);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(white);
  doc.text('ARCO EDUCAÇÃO — Devolutiva da Frente', PAD, 9.5);

  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setColor(navy);
  doc.text('Leitura técnica da frente', PAD, y);
  y += 10;

  const linhas = [
    ['Escopo',                `${pDados.nome} — ${pDados.disc} · ${compLabel} · ${simLabel}`],
    ['Itens analisados',      String(resumo.nqs)],
    ['Acerto médio',          resumo.acertoMedio + '%'],
    ['EFI médio',             String(resumo.efiMedio)],
    ['Distratores funcionais', resumo.distFuncionais + '%'],
    ['Com resolução sugerida', String(comResol) + ' item(ns)'],
    ['Com revisão técnica',   String(comRevis) + ' item(ns)'],
  ];

  linhas.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(gray);
    doc.text(lbl.toUpperCase(), PAD, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor(navy);
    doc.text(val, PAD, y + 6);
    y += 16;
  });

  setFill(navy);
  doc.rect(0, H - 10, W, 10, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(white);
  doc.text('Arco Educação — Uso exclusivo interno', PAD, H - 4);

  doc.save('devolutiva-professor-' + profKey + '-' + profSim + '.pdf');
}
