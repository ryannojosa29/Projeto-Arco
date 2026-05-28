"""Leitura e administração de ciclos (a partir das views e tabelas)."""
from fastapi import APIRouter, HTTPException

from ..db import get_client
from ..schemas import ResumoOut

router = APIRouter(prefix="/api", tags=["simulados"])


@router.get("/simulados")
def listar_simulados():
    """Lista ciclos carregados, com n_questoes embedded (via PostgREST)."""
    rows = (
        get_client()
        .table("simulados")
        .select("id, chave, nome, nome_curto, referencia, ordem, criado_em, questoes(count)")
        .order("ordem")
        .execute()
        .data
    )
    # normaliza o embedded count -> int simples
    for r in rows:
        q = r.pop("questoes", None)
        r["n_questoes"] = (q[0]["count"] if isinstance(q, list) and q else 0)
    return rows


@router.delete("/simulados/{chave}", status_code=204)
def excluir_simulado(chave: str):
    """Exclui o ciclo e tudo dele (cascade: questoes, questao_resultados, importacoes)."""
    sb = get_client()
    res = sb.table("simulados").delete().eq("chave", chave).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Ciclo '{chave}' não encontrado.")
    return None


@router.get("/simulados/{chave}/questoes")
def questoes_do_simulado(chave: str):
    # v_questoes já devolve no shape do front (num, disc, gab, acerto, dist, distPct, status, distrib, comp, assunto, discriminante)
    return (
        get_client()
        .table("v_questoes")
        .select("*")
        .eq("sim_chave", chave)
        .order("num")
        .execute()
        .data
    )


@router.get("/simulados/{chave}/resumo", response_model=ResumoOut)
def resumo_do_simulado(chave: str):
    sb = get_client()
    resumo = sb.table("v_simulado_resumo").select("*").eq("sim_chave", chave).execute().data
    disc = (
        sb.table("v_simulado_disciplina")
        .select("*")
        .eq("sim_chave", chave)
        .order("media")  # ascendente: a primeira é a disciplina mais crítica
        .execute()
        .data
    )
    return {
        "resumo": resumo[0] if resumo else None,
        "disciplinas": disc,
        "disciplina_critica": disc[0]["disc"] if disc else None,
    }
