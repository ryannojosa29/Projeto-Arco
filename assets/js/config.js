/* ═══════════════════════════════════════════════════════════
   Configuração do front. Apenas a base da API Python (FastAPI).
   Sem chaves do Supabase aqui — o navegador nunca fala com o Supabase.
═══════════════════════════════════════════════════════════ */
window.ARCO = window.ARCO || {};
window.ARCO.API_BASE = 'http://localhost:8001';

/* Modo de exibição (governança de mock — ver assets/data-status.json):
   'demo'     → mostra tudo; o que não é real ganha selo "DEMONSTRATIVO".
   'official' → bloqueia o que é mockado com aviso "disponível em breve".
   Em produção, sirva o build com ARCO.MODE = 'official'. */
window.ARCO.MODE = 'demo';
