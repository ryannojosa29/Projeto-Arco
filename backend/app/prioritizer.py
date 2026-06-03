"""Estágio 3a — priorização determinística para diagnóstico.

Regras de docs/05-dados-e-estatistica.md (§10.3 e §10.4):

  resolucao_sugerida =
    acerto < 45%
    OU distrator_dominante >= 25%
    OU (discriminante > 0,30 E acerto < 60%)

  revisao_tecnica_sugerida =
    discriminante < 0,10
    OU bisserial < 0,10
    OU discriminante < 0

Discriminante e ponto-bisserial são opcionais na Fase 2 (não temos respostas
aluno-a-aluno ainda). Quando ausentes, os critérios que dependem deles ficam
desligados — não chutamos.
"""
from __future__ import annotations

from typing import Iterable, Optional

from .agent_schemas import MotivoPriorizacao, QuestaoPrioritaria


def _resolucao_sugerida(
    acerto_pct: float, distrator_pct: Optional[float], discriminante: Optional[float]
) -> bool:
    if acerto_pct < 45:
        return True
    if (distrator_pct or 0) >= 25:
        return True
    if discriminante is not None and discriminante > 0.30 and acerto_pct < 60:
        return True
    return False


def _revisao_tecnica(
    discriminante: Optional[float], bisserial: Optional[float]
) -> bool:
    if discriminante is None and bisserial is None:
        return False
    if discriminante is not None and (discriminante < 0.10 or discriminante < 0):
        return True
    if bisserial is not None and bisserial < 0.10:
        return True
    return False


def priorizar(rows: Iterable[dict]) -> list[QuestaoPrioritaria]:
    """Filtra questões que disparam pelo menos um critério.

    `rows` deve conter dicts com pelo menos:
      questao_id, numero, acerto_pct, distrator_dominante (letra),
      distrator_pct, discriminante (opcional), bisserial (opcional)
    """
    out: list[QuestaoPrioritaria] = []
    for r in rows:
        acerto = float(r.get("acerto_pct", 0))
        dist_pct = r.get("distrator_pct")
        dist_pct_f = float(dist_pct) if dist_pct is not None else None
        disc = r.get("discriminante")
        disc_f = float(disc) if disc is not None else None
        biss = r.get("bisserial")
        biss_f = float(biss) if biss is not None else None

        rs = _resolucao_sugerida(acerto, dist_pct_f, disc_f)
        rt = _revisao_tecnica(disc_f, biss_f)
        if not (rs or rt):
            continue

        motivo: MotivoPriorizacao = (
            "ambos" if rs and rt else ("resolucao_sugerida" if rs else "revisao_tecnica")
        )

        out.append(
            QuestaoPrioritaria(
                questao_id=int(r["questao_id"]),
                numero=int(r["numero"]),
                motivo=motivo,
                acerto_pct=acerto,
                distrator_dominante=r.get("distrator_dominante"),
                distrator_pct=dist_pct_f,
                discriminante=disc_f,
                bisserial=biss_f,
            )
        )
    return out
