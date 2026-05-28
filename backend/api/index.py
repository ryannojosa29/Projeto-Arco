"""Entrypoint serverless para o Vercel (runtime @vercel/python).

O Vercel detecta o ASGI app exportado como `app`. Em produção, todas as rotas
são roteadas para cá pelo vercel.json. Em local nada muda: continue usando
`uvicorn app.main:app` a partir de backend/.
"""
import os
import sys

# garante que 'app' (backend/app) seja importável quando a function roda em backend/api/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402

# `app` é o ASGI app que o Vercel serve.
