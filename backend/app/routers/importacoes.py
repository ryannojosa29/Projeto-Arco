"""POST /api/importacoes — recebe o .xlsx, parseia e grava no Supabase.

Modelo: o coordenador informa o número do CICLO (1..N). A partir dele:
  chave = f"sim{ciclo}", ordem = ciclo, nome padrão = "<N>º Simulado".

Comportamento de "substituir": ao reimportar um ciclo, as questões e resultados
antigos daquele ciclo são apagados (cascade) antes da nova carga, pra não deixar
questões órfãs de um import anterior.
"""
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..db import get_client
from ..parser import parse_gabarito
from ..schemas import ImportResult

router = APIRouter(prefix="/api", tags=["importacoes"])


@router.post("/importacoes", response_model=ImportResult)
async def importar(
    arquivo: UploadFile = File(...),
    ciclo: int = Form(..., ge=1, le=99),
    nome: Optional[str] = Form(None),
    referencia: Optional[str] = Form(None),
):
    content = await arquivo.read()
    try:
        questoes, erros = parse_gabarito(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    chave = f"sim{ciclo}"
    nome_final = nome or f"{ciclo}º Simulado"
    sb = get_client()

    # 1) upsert do simulado pela chave (mantém id se já existia)
    sim = sb.table("simulados").upsert(
        {
            "chave": chave,
            "nome": nome_final,
            "referencia": referencia,
            "ordem": ciclo,
        },
        on_conflict="chave",
    ).execute().data[0]
    sim_id = sim["id"]

    # 2) substituir: apaga questões antigas desse ciclo (cascade nos resultados)
    sb.table("questoes").delete().eq("simulado_id", sim_id).execute()

    # 3) registro da importação
    imp = sb.table("importacoes").insert({
        "simulado_id": sim_id,
        "arquivo_nome": arquivo.filename,
        "total_linhas": len(questoes),
    }).execute().data[0]
    imp_id = imp["id"]

    # 4) insere questões frescas
    sb.table("questoes").insert(
        [{
            "simulado_id": sim_id,
            "numero": q["numero"],
            "disciplina": q["disciplina"],
            "gabarito": q["gabarito"],
        } for q in questoes]
    ).execute()

    # 5) recarrega id <-> numero para ligar os resultados
    existing = sb.table("questoes").select("id,numero").eq("simulado_id", sim_id).execute().data
    id_by_num = {r["numero"]: r["id"] for r in existing}

    # 6) insere os resultados (1:1 por questão)
    sb.table("questao_resultados").insert(
        [{
            "questao_id": id_by_num[q["numero"]],
            "importacao_id": imp_id,
            "n_respondentes": q["n_respondentes"],
            "acerto_pct": q["acerto_pct"],
            "cont_a": q["A"], "cont_b": q["B"], "cont_c": q["C"],
            "cont_d": q["D"], "cont_e": q["E"],
            "item_1": q["item_1"], "item_2": q["item_2"], "item_3": q["item_3"],
        } for q in questoes]
    ).execute()

    return {"linhas": len(questoes), "simulado": sim, "erros": erros}
