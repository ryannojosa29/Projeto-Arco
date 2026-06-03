"""Estágio 1.5 — atribuição determinística questão → professor.

Sem LLM. A regra exata fica em arquivo JSON externo (ver
`backend/config/professores.example.json`). Quando não há regra ou a regra não
casa, devolve `professor_id=None` — o pipeline segue rodando e o gestor pode
preencher mais tarde.

Formatos de regra suportados:
  "por_intervalo"   — Q[de..ate] → professor_id (por chave de simulado ou *)
  "por_disciplina"  — disciplina → professor_id
  "por_frente"      — frente → professor_id (executar APÓS o Estágio 2)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from .logging_config import get_logger

logger = get_logger("app.professor_assigner")


class ProfessorAssigner:
    """Carrega a regra de atribuição uma vez e aplica em lote.

    Uso típico:
        assigner = ProfessorAssigner.from_path(settings.professores_config)
        pid = assigner.atribuir(simulado_chave="sim1", numero=3, disciplina="Física",
                                frente="Cinemática")
    """

    def __init__(self, cfg: Optional[dict] = None):
        self.cfg = cfg or {}
        self.regra = (self.cfg.get("regra") or "").strip()

    @classmethod
    def from_path(cls, path: str | Path) -> "ProfessorAssigner":
        p = Path(path)
        if not p.exists():
            logger.warning(
                "professor_assigner.config_ausente",
                extra={"extra": {"path": str(p)}},
            )
            return cls(None)
        try:
            cfg = json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:
            logger.exception(
                "professor_assigner.config_invalido",
                extra={"extra": {"path": str(p), "erro": str(e)}},
            )
            return cls(None)
        logger.info(
            "professor_assigner.config_carregado",
            extra={"extra": {"path": str(p), "regra": cfg.get("regra")}},
        )
        return cls(cfg)

    @property
    def disponivel(self) -> bool:
        return bool(self.regra)

    def atribuir(
        self,
        simulado_chave: str,
        numero: int,
        disciplina: str,
        frente: Optional[str] = None,
    ) -> Optional[int]:
        if not self.disponivel:
            return None

        if self.regra == "por_intervalo":
            return self._por_intervalo(simulado_chave, numero)
        if self.regra == "por_disciplina":
            return self._por_disciplina(disciplina)
        if self.regra == "por_frente":
            return self._por_frente(frente)
        logger.warning(
            "professor_assigner.regra_desconhecida",
            extra={"extra": {"regra": self.regra}},
        )
        return None

    def _por_intervalo(self, simulado_chave: str, numero: int) -> Optional[int]:
        mapping = self.cfg.get("mapping", {}) or {}
        intervalos = mapping.get(simulado_chave) or mapping.get("*") or []
        for it in intervalos:
            de = int(it.get("de", 0))
            ate = int(it.get("ate", 0))
            if de <= numero <= ate:
                return int(it["professor_id"])
        return None

    def _por_disciplina(self, disciplina: str) -> Optional[int]:
        mapping = self.cfg.get("mapping", {}) or {}
        v = mapping.get(disciplina)
        return int(v) if v is not None else None

    def _por_frente(self, frente: Optional[str]) -> Optional[int]:
        if not frente:
            return None
        mapping = self.cfg.get("mapping", {}) or {}
        v = mapping.get(frente)
        return int(v) if v is not None else None
