/* ═══════════════════════════════════════════════════════════
   ARCO — Governança de mock (Fase 1)
   Lê assets/data-status.json (fonte de verdade) e aplica, conforme
   ARCO.MODE (config.js):
     • 'demo'     → selo "DEMONSTRATIVO" no que não é real (não bloqueia)
     • 'official' → bloqueia o que é 'mock' com aviso "disponível em breve"
   A navegação usa data-page como chave de domínio.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const MODE = (window.ARCO && window.ARCO.MODE) || 'demo';

  function injectCSS() {
    if (document.getElementById('arco-status-css')) return;
    const s = document.createElement('style');
    s.id = 'arco-status-css';
    s.textContent = `
      .arco-badge{display:inline-block;font-size:8.5px;font-weight:700;letter-spacing:.04em;
        text-transform:uppercase;padding:2px 5px;border-radius:5px;margin-left:6px;vertical-align:middle}
      .arco-badge.demo{background:#fef3c7;color:#92400e;border:1px solid #fde68a}
      .arco-badge.lock{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe}
      .nav-item.arco-locked{opacity:.55}
      .arco-page-banner{display:flex;gap:8px;align-items:center;margin:0 0 14px;padding:9px 13px;
        border-radius:9px;font-size:12.5px;font-weight:500}
      .arco-page-banner.demo{background:#fffbeb;border:1px solid #fde68a;color:#92400e}
      .arco-soon{display:flex;flex-direction:column;align-items:center;justify-content:center;
        min-height:48vh;text-align:center;color:var(--t4,#6b6b78);gap:8px;padding:40px}
      .arco-soon b{color:var(--t2,#2b2b35);font-size:16px;font-weight:700}
      .arco-soon .pill{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;
        background:#eef2ff;color:#3730a3;padding:3px 9px;border-radius:999px}`;
    document.head.appendChild(s);
  }

  function badge(kind, text) {
    const b = document.createElement('span');
    b.className = 'arco-badge ' + kind;
    b.textContent = text;
    return b;
  }

  async function loadManifest() {
    try {
      const res = await fetch('assets/data-status.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      console.warn('[arco-status] manifesto indisponível; sem selo/bloqueio:', e.message);
      return null;
    }
  }

  function apply(manifest) {
    if (!manifest) return;
    const doms = manifest.dominios || {};
    injectCSS();

    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      const dom = doms[item.dataset.page];
      if (!dom || dom.status === 'real') return;

      if (MODE === 'official' && dom.status === 'mock') {
        // bloqueia navegação e marca com cadeado
        item.classList.add('arco-locked');
        item.appendChild(badge('lock', '🔒 em breve'));
        item.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          mostrarEmBreve(dom);
        }, true); // captura: roda antes do listener do app.js
      } else {
        // demo (ou partial no official): só sinaliza
        item.appendChild(badge('demo', 'demo'));
        bannerNaPagina(item.dataset.page, dom);
      }
    });
  }

  function bannerNaPagina(domainKey, dom) {
    const page = document.getElementById('page-' + domainKey);
    if (!page || page.querySelector('.arco-page-banner')) return;
    const fase = dom.fase;
    const b = document.createElement('div');
    b.className = 'arco-page-banner demo';
    b.innerHTML = `<span>⚠️</span><span>Dados <b>demonstrativos</b> — ` +
      `${dom.label} ainda é mockado (vira real na <b>Fase ${fase}</b>).` +
      (dom.nota ? ` ${dom.nota}.` : '') + `</span>`;
    page.insertBefore(b, page.firstChild);
  }

  function mostrarEmBreve(dom) {
    // troca o conteúdo visível por um placeholder, sem depender do goTo do app
    const main = document.querySelector('.main') || document.body;
    let ph = document.getElementById('arco-soon');
    if (!ph) {
      ph = document.createElement('div');
      ph.id = 'arco-soon';
      ph.className = 'page';
      main.appendChild(ph);
    }
    document.querySelectorAll('.main .page').forEach(p => p.classList.add('hidden'));
    ph.classList.remove('hidden');
    ph.innerHTML = `<div class="arco-soon">
      <span class="pill">Fase ${dom.fase}</span>
      <b>${dom.label}</b>
      <div>Disponível em breve. Esta seção entra quando os dados da Fase ${dom.fase} forem importados.</div>
    </div>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    apply(await loadManifest());
  });
})();
