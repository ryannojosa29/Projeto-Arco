"""Arco API — Fase 1. Único gateway entre o front e o Supabase."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import importacoes, simulados

app = FastAPI(title="Arco API — Fase 1", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(importacoes.router)
app.include_router(simulados.router)


@app.get("/health")
def health():
    return {"ok": True}
