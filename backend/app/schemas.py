"""Modelos Pydantic de resposta (documentação OpenAPI).

O contrato segue o que o front consome (assets/js/api-data.js, importar.html) e
o schema do banco (supabase/migrations/..._fase1.sql).
"""
from typing import Any, Optional

from pydantic import BaseModel


class ImportResult(BaseModel):
    """Resposta de POST /api/importacoes.

    O front (importar.html) lê `linhas`, `simulado.nome`, `simulado.ordem`
    e `erros`. `simulado` é a linha completa retornada pelo upsert.
    """
    linhas: int
    simulado: dict[str, Any]
    erros: list[str] = []


class ResumoOut(BaseModel):
    """Resposta de /api/simulados/{chave}/resumo."""
    resumo: Optional[dict[str, Any]] = None
    disciplinas: list[dict[str, Any]] = []
    disciplina_critica: Optional[str] = None
