"""Modelos Pydantic de resposta (documentação OpenAPI)."""
from typing import Any, Optional

from pydantic import BaseModel


class ImportResult(BaseModel):
    linhas: int
    simulado: dict[str, Any]
    erros: list[str] = []


class ResumoOut(BaseModel):
    resumo: Optional[dict[str, Any]] = None
    disciplinas: list[dict[str, Any]] = []
    disciplina_critica: Optional[str] = None
