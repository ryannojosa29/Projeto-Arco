# Arco API — Fase 1 (FastAPI)

Único gateway entre o front e o Supabase. Importa o gabarito agregado (`Gabarito_questoes.xlsx`)
e serve a análise de questões + KPIs do simulado. Usa a **service_role key** (server-side); o
navegador nunca toca no Supabase.

## Setup

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

As credenciais são lidas do `.env` na **raiz do projeto** (`SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`).

## Rodar

```bash
uvicorn app.main:app --port 8001 --reload
```

- Docs (Swagger): http://localhost:8001/docs
- Health: http://localhost:8001/health

O front estático roda em :8000 (ver `.vscode/tasks.json`); o CORS já libera essa origem.

## Pré-requisito: schema aplicado

A migração `supabase/migrations/20260527000001_fase1.sql` precisa estar aplicada no projeto
Supabase. Via CLI:

```bash
supabase login
supabase link --project-ref <REF_DO_PROJETO>
supabase db push
```

(ou cole a migração no SQL Editor do dashboard).

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/importacoes` | multipart: `arquivo` (.xlsx) + `ciclo: int` + `nome?` + `referencia?`. Substitui dados existentes do ciclo (apaga questões antigas e regrava). |
| GET | `/api/simulados` | lista de ciclos carregados (com `n_questoes`) |
| DELETE | `/api/simulados/{chave}` | exclui o ciclo e tudo dele (cascade) |
| GET | `/api/simulados/{chave}/questoes` | questões no shape do front (de `v_questoes`) |
| GET | `/api/simulados/{chave}/resumo` | média geral, por disciplina e disciplina crítica |

`chave` é derivado do ciclo: `chave = f"sim{ciclo}"`. Ex.: ciclo 1 → `sim1`.

Exemplo de import:

```bash
curl -F arquivo=@../Gabarito_questoes.xlsx \
     -F ciclo=1 \
     -F referencia="Fevereiro 2025" \
     http://localhost:8001/api/importacoes
```

## Deploy no Vercel (manual, plano gratuito)

> **Não há deploy automático.** Os arquivos `api/index.py`, `vercel.json` e `.vercelignore`
> só deixam o backend *pronto* pra subir. Suba **só quando quiser**. Não mexe no projeto
> do front que já existe no Vercel — o backend vira um **projeto Vercel separado**.

1. No Vercel, crie um **novo projeto** apontando para este repositório, com
   **Root Directory = `backend`**. (Assim o projeto do front continua intacto.)
2. Em **Settings → Environment Variables**, defina:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_ORIGINS` = a URL do front no Vercel (ex.: `https://arco.vercel.app`).
     Pode listar mais de uma separando por vírgula.
3. Deploy: pelo dashboard (botão Deploy) ou via CLI dentro de `backend/`:
   ```bash
   npx vercel          # preview
   npx vercel --prod   # produção
   ```
4. Depois do deploy, aponte o front para a API: em `assets/js/config.js`, troque
   `API_BASE` pela URL do backend no Vercel.

**Plano gratuito (Hobby):** funções serverless Python são suportadas; o upload do
gabarito (~10 KB) e o import (48 linhas, <1s) ficam folgados nos limites de tamanho de
corpo (4,5 MB) e de tempo de execução. O front estático também pode ficar no Hobby.
Recursos de **time/colaboração** é que exigem plano pago — o deploy em si não.

> Alternativa sem reestruturar nada: **Render / Railway / Fly.io** rodam o `uvicorn`
> como processo sempre-ligado (sem cold start). Para esse uso, qualquer um serve.
