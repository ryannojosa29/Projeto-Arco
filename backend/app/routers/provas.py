"""POST /api/simulados/{chave}/prova — ingestão do .docx da prova.

Orquestra os 3 estágios do pipeline (docs/09):
  1) parse determinístico do .docx (com cruzamento contra o gabarito.xlsx já
     importado em /api/importacoes);
  1.5) atribuição de professor pela regra externa (se configurada);
  2) enriquecimento a priori via Anthropic (se ANTHROPIC_API_KEY presente);
  3a) priorização estatística;
  3b) diagnóstico pós-aplicação (LLM nas priorizadas).

Idempotente: re-upload do mesmo .docx (mesmo sha256) devolve o resultado em
cache sem reprocessar.
"""
from __future__ import annotations

import time
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from ..agent_schemas import EnrichmentResult
from ..config import settings
from ..db import get_client
from ..diagnostic_agent import DiagnosticAgent
from ..docx_parser import parse_docx
from ..enrichment_agent import EnrichmentAgent
from ..logging_config import get_logger
from ..prioritizer import priorizar
from ..professor_assigner import ProfessorAssigner
from ..taxonomia import FRENTES_POR_DISCIPLINA

router = APIRouter(prefix="/api", tags=["provas"])
logger = get_logger("app.provas")

DISCIPLINAS_VALIDAS = set(FRENTES_POR_DISCIPLINA.keys())
QUESTOES_POR_BLOCO = 12
N_BLOCOS = 4


def _parse_sequencia(raw: str) -> list[str]:
    """Valida a sequência de disciplinas vinda do upload. Espera 4 valores
    separados por vírgula, sem repetição, todos no conjunto válido."""
    valores = [v.strip() for v in raw.split(",") if v.strip()]
    if len(valores) != N_BLOCOS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"sequencia_disciplinas precisa ter exatamente {N_BLOCOS} valores, "
                f"recebido {len(valores)}."
            ),
        )
    if len(set(valores)) != N_BLOCOS:
        raise HTTPException(
            status_code=400,
            detail="sequencia_disciplinas não pode repetir disciplinas.",
        )
    invalidos = [v for v in valores if v not in DISCIPLINAS_VALIDAS]
    if invalidos:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Disciplinas inválidas em sequencia_disciplinas: {invalidos}. "
                f"Esperado um subconjunto de {sorted(DISCIPLINAS_VALIDAS)}."
            ),
        )
    return valores


def _disciplina_por_numero(numero: int, sequencia: list[str]) -> str:
    """Q1..12 → seq[0], Q13..24 → seq[1], ..., Q37..48 → seq[3]."""
    if not 1 <= numero <= N_BLOCOS * QUESTOES_POR_BLOCO:
        return ""
    return sequencia[(numero - 1) // QUESTOES_POR_BLOCO]


def _buscar_simulado(chave: str) -> dict:
    sb = get_client()
    rows = sb.table("simulados").select("id, chave, nome, ordem").eq("chave", chave).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail=f"Simulado '{chave}' não encontrado.")
    return rows[0]


def _buscar_questoes_do_xlsx(simulado_id: int) -> list[dict]:
    sb = get_client()
    return (
        sb.table("questoes")
        .select("id, numero, disciplina, gabarito")
        .eq("simulado_id", simulado_id)
        .order("numero")
        .execute()
        .data
    ) or []


def _buscar_agregados(chave: str) -> list[dict]:
    sb = get_client()
    rows = (
        sb.table("v_questoes")
        .select("num, acerto, dist, distPct, discriminante, n_respondentes")
        .eq("sim_chave", chave)
        .execute()
        .data
    ) or []
    return rows


@router.post("/simulados/{chave}/prova")
async def importar_prova(
    chave: str,
    arquivo: UploadFile = File(...),
    sequencia_disciplinas: str = Form(
        ...,
        description=(
            "Ordem das 4 disciplinas nos blocos de 12 questões, separadas por "
            "vírgula. Ex.: 'Matemática,Física,Química,Língua Inglesa'. "
            "Q1-12 = bloco 1, Q13-24 = bloco 2, etc."
        ),
    ),
    enriquecer: bool = Query(True),
    diagnosticar: bool = Query(True),
):
    start = time.perf_counter()
    sb = get_client()

    sequencia = _parse_sequencia(sequencia_disciplinas)

    simulado = _buscar_simulado(chave)
    simulado_id = int(simulado["id"])

    questoes_xlsx = _buscar_questoes_do_xlsx(simulado_id)
    if not questoes_xlsx:
        raise HTTPException(
            status_code=409,
            detail=(
                "Simulado existe mas não tem questões importadas. "
                "Importe o gabarito .xlsx via /api/importacoes antes da prova."
            ),
        )
    id_by_num = {int(q["numero"]): int(q["id"]) for q in questoes_xlsx}

    # Constrói o gabarito com disciplina derivada da sequência informada
    # (autoritativa); a do xlsx vai virar warning quando divergir.
    gabarito_xlsx_para_parser: list[dict] = []
    divergencias_disciplina: list[str] = []
    for q in questoes_xlsx:
        n = int(q["numero"])
        disc_seq = _disciplina_por_numero(n, sequencia)
        disc_xlsx = (q.get("disciplina") or "").strip()
        if disc_seq and disc_xlsx and disc_seq != disc_xlsx:
            divergencias_disciplina.append(
                f"Q{n}: disciplina divergente (sequência='{disc_seq}', "
                f"xlsx='{disc_xlsx}'); usando a da sequência."
            )
        gabarito_xlsx_para_parser.append(
            {
                "numero": n,
                "disciplina": disc_seq or disc_xlsx,
                "gabarito": q.get("gabarito"),
            }
        )

    content = await arquivo.read()
    logger.info(
        "provas.start",
        extra={
            "extra": {
                "chave": chave,
                "filename": arquivo.filename,
                "size_bytes": len(content),
                "sequencia": sequencia,
                "divergencias_disciplina": len(divergencias_disciplina),
                "enriquecer": enriquecer,
                "diagnosticar": diagnosticar,
            }
        },
    )

    # ── Estágio 1: parse + cruzamento com xlsx ─────────────────
    try:
        questoes, sha, warnings = parse_docx(
            content,
            gabarito_xlsx=gabarito_xlsx_para_parser,
            media_dir=Path(settings.media_dir),
            simulado_chave=chave,
        )
    except ValueError as e:
        logger.warning(
            "provas.parse.invalido",
            extra={"extra": {"chave": chave, "motivo": str(e)}},
        )
        raise HTTPException(status_code=400, detail=str(e))

    warnings = divergencias_disciplina + warnings

    # ── Idempotência: já importamos esse mesmo .docx? ──────────
    ja = (
        sb.table("prova_docx_importacoes")
        .select("id, criado_em, total_questoes, warnings_count")
        .eq("simulado_id", simulado_id)
        .eq("sha256", sha)
        .execute()
        .data
    )
    if ja:
        logger.info(
            "provas.idempotente",
            extra={"extra": {"chave": chave, "sha256_prefix": sha[:12]}},
        )
        return {
            "status": "ja_importado",
            "simulado": simulado,
            "importacao": ja[0],
            "sha256": sha,
        }

    # ── Persistir Estágio 1: questao_conteudo + atualizar disciplina ──
    rows_conteudo = []
    for q in questoes:
        qid = id_by_num.get(q.numero)
        if qid is None:
            continue  # questão no docx que não tem registro do xlsx (já está em warnings)
        rows_conteudo.append({
            "questao_id": qid,
            "enunciado_md": q.enunciado_md,
            "alternativas": q.alternativas,
            "resolucao_md": q.resolucao_md,
            "gabarito_doc": q.gabarito_doc,
            "imagens": q.imagens,
            "equacoes_latex": q.equacoes_latex,
            "origem_sha256": sha,
        })
        # sequência informada é autoritativa: força a disciplina por bloco
        disc_seq = _disciplina_por_numero(q.numero, sequencia)
        update_q: dict = {}
        if disc_seq:
            update_q["disciplina"] = disc_seq
        if q.assunto:
            update_q["assunto"] = q.assunto  # texto livre da banca
        if update_q:
            sb.table("questoes").update(update_q).eq("id", qid).execute()

    if rows_conteudo:
        sb.table("questao_conteudo").upsert(rows_conteudo, on_conflict="questao_id").execute()

    # ── Estágio 1.5: atribuição de professor (se houver regra) ─
    assigner = ProfessorAssigner.from_path(settings.professores_config)
    professor_updates = 0
    enriquecimentos: dict[int, EnrichmentResult] = {}

    if assigner.disponivel and assigner.regra in ("por_intervalo", "por_disciplina"):
        # estas regras não dependem da frente — rodam antes do Estágio 2.
        for q in questoes:
            qid = id_by_num.get(q.numero)
            if qid is None:
                continue
            pid = assigner.atribuir(
                simulado_chave=chave,
                numero=q.numero,
                disciplina=q.disciplina,
            )
            if pid is not None:
                sb.table("questoes").update({"professor_id": pid}).eq("id", qid).execute()
                professor_updates += 1

    # ── Estágio 2: enriquecimento ──────────────────────────────
    estagio2 = {"ok": 0, "failed": 0, "skipped": 0, "cache_hit": 0}
    if enriquecer:
        agent = EnrichmentAgent()
        if not agent.disponivel:
            logger.warning("provas.estagio2.sem_chave", extra={"extra": {"chave": chave}})
        for q in questoes:
            qid = id_by_num.get(q.numero)
            if qid is None:
                continue
            result, meta = agent.run(q)
            row = {
                "questao_id": qid,
                "enrichment_status": meta["status"],
                "enrichment_version": meta.get("version"),
                "enrichment_model": meta.get("model"),
                "enrichment_error": meta.get("error"),
                "atualizado_em": "now()",
            }
            if result is not None:
                row.update({
                    "frente_principal": result.frente_principal,
                    "assunto_principal": result.assunto_principal,
                    "frente_secundaria": result.frente_secundaria,
                    "assunto_secundario": result.assunto_secundario,
                    "habilidades_cognitivas": result.habilidades_cognitivas,
                    "pre_requisitos": result.pre_requisitos,
                    "dificuldade_esperada": result.dificuldade_esperada,
                    "hipotese_erro_por_alternativa": result.hipotese_erro_por_alternativa.model_dump(),
                    "tags_busca": result.tags_busca,
                })
                enriquecimentos[qid] = result
            sb.table("questao_meta").upsert(row, on_conflict="questao_id").execute()

            estagio2[meta["status"]] = estagio2.get(meta["status"], 0) + 1
            if meta.get("cache_hit"):
                estagio2["cache_hit"] += 1

    # ── Estágio 1.5 (parte por_frente): após enriquecimento ────
    if assigner.disponivel and assigner.regra == "por_frente":
        for q in questoes:
            qid = id_by_num.get(q.numero)
            if qid is None:
                continue
            enr = enriquecimentos.get(qid)
            pid = assigner.atribuir(
                simulado_chave=chave,
                numero=q.numero,
                disciplina=q.disciplina,
                frente=enr.frente_principal if enr else None,
            )
            if pid is not None:
                sb.table("questoes").update({"professor_id": pid}).eq("id", qid).execute()
                professor_updates += 1

    # ── Estágio 3a: priorização ────────────────────────────────
    agregados_view = _buscar_agregados(chave)
    rows_prio = []
    for r in agregados_view:
        qid = id_by_num.get(int(r["num"]))
        if qid is None:
            continue
        rows_prio.append({
            "questao_id": qid,
            "numero": int(r["num"]),
            "acerto_pct": float(r["acerto"]),
            "distrator_dominante": r.get("dist"),
            "distrator_pct": r.get("distPct"),
            "discriminante": r.get("discriminante"),
            "bisserial": None,                  # ainda não calculado na Fase 1/2
        })
    priorizadas = priorizar(rows_prio)
    logger.info(
        "provas.estagio3a",
        extra={"extra": {"chave": chave, "priorizadas": len(priorizadas)}},
    )

    # ── Estágio 3b: diagnóstico nas priorizadas ────────────────
    estagio3 = {"ok": 0, "failed": 0, "skipped": 0}
    if diagnosticar and priorizadas:
        dagent = DiagnosticAgent()
        if not dagent.disponivel:
            logger.warning("provas.estagio3.sem_chave", extra={"extra": {"chave": chave}})

        # indexa questoes por id para passar conteúdo ao agent
        q_by_id = {id_by_num[q.numero]: q for q in questoes if q.numero in id_by_num}

        for prio in priorizadas:
            q = q_by_id.get(prio.questao_id)
            enr = enriquecimentos.get(prio.questao_id)
            if q is None or enr is None:
                # sem conteúdo ou sem enriquecimento, diagnóstico fica skipped
                sb.table("questao_diagnostico").upsert({
                    "questao_id": prio.questao_id,
                    "motivo_priorizacao": prio.motivo,
                    "diagnostico_status": "skipped",
                    "diagnostico_version": None,
                    "diagnostico_model": None,
                    "atualizado_em": "now()",
                }, on_conflict="questao_id").execute()
                estagio3["skipped"] += 1
                continue

            result, meta = dagent.run(q, enr, prio)
            row = {
                "questao_id": prio.questao_id,
                "motivo_priorizacao": prio.motivo,
                "diagnostico_status": meta["status"],
                "diagnostico_version": meta.get("version"),
                "diagnostico_model": meta.get("model"),
                "atualizado_em": "now()",
            }
            if result is not None:
                row.update({
                    "hipotese_pedagogica": result.hipotese_pedagogica,
                    "evidencia_no_distrator": result.evidencia_no_distrator,
                    "sugestao_abordagem": result.sugestao_abordagem,
                })
            sb.table("questao_diagnostico").upsert(row, on_conflict="questao_id").execute()
            estagio3[meta["status"]] = estagio3.get(meta["status"], 0) + 1

    # ── Registro de importação ─────────────────────────────────
    imp = (
        sb.table("prova_docx_importacoes")
        .insert({
            "simulado_id": simulado_id,
            "arquivo_nome": arquivo.filename,
            "sha256": sha,
            "total_questoes": len(questoes),
            "warnings_count": len(warnings),
            "warnings": warnings,
        })
        .execute()
        .data[0]
    )

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "provas.ok",
        extra={
            "extra": {
                "chave": chave,
                "sha256_prefix": sha[:12],
                "questoes": len(questoes),
                "warnings": len(warnings),
                "professor_updates": professor_updates,
                "estagio2": estagio2,
                "estagio3": estagio3,
                "duration_ms": elapsed_ms,
                "priorizadas": len(priorizadas),
            }
        },
    )

    return {
        "status": "ok",
        "simulado": simulado,
        "importacao": imp,
        "questoes": len(questoes),
        "warnings_count": len(warnings),
        "warnings": warnings,
        "professor_updates": professor_updates,
        "estagio2": estagio2,
        "estagio3": estagio3,
        "priorizadas": len(priorizadas),
        "duration_ms": elapsed_ms,
    }
