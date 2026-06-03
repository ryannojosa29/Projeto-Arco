"""Estágio 2 — Enriquecimento a priori via Anthropic SDK com tool-use forçado.

Garantias:
  - Saída JSON estrita: o LLM é forçado a chamar a tool `registrar_enriquecimento`.
  - Vocabulário fechado: o `enum` de `frente` e `subtopicos` é montado da
    taxonomia (docs/10) por disciplina. Habilidades também é enum fechado.
  - Validação dupla: Pydantic (shape) + validar_enrichment (cross-field).
  - Retry 1x em qualquer falha; após, `enrichment_status='failed'`.
  - Cache em disco por (hash_questao, prompt_version, taxonomia_version, model).
  - Prompt caching no system block (taxonomia da disciplina).

O prompt em `backend/prompts/enrichment.md` é a referência humana versionada;
este arquivo monta o prompt programaticamente para controle fino.
"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path
from typing import Optional

from pydantic import ValidationError

from .agent_schemas import (
    EnrichmentInput,
    EnrichmentResult,
    QuestaoConteudo,
    validar_enrichment,
)
from .config import settings
from .docx_parser import hash_questao
from .enrichment_cache import EnrichmentCache
from .logging_config import get_logger
from .taxonomia import (
    FRENTES_POR_DISCIPLINA,
    HabilidadeCognitiva,
    subtopicos_validos,
)

logger = get_logger("app.enrichment_agent")

TOOL_NAME = "registrar_enriquecimento"
PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "enrichment.md"

_HABILIDADES = list(HabilidadeCognitiva.__args__)


def _load_prompt_meta(path: Path) -> dict:
    """Lê só o frontmatter do .md (key: value entre `---`/`---`)."""
    if not path.exists():
        return {"version": "0.0.0", "taxonomy_version": "unknown"}
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {"version": "0.0.0", "taxonomy_version": "unknown"}
    end = text.find("\n---", 4)
    if end < 0:
        return {"version": "0.0.0", "taxonomy_version": "unknown"}
    meta: dict = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta


PROMPT_META = _load_prompt_meta(PROMPT_PATH)


def _tool_schema(disciplina: str) -> dict:
    """JSON Schema da tool — frentes restritas à disciplina. Universo de
    assuntos = união dos bullets das frentes + os próprios nomes das frentes
    sem bullets (autorreferência para Química Orgânica e Inglês).
    """
    frentes = list(FRENTES_POR_DISCIPLINA.get(disciplina, ()))
    assuntos_set: set[str] = set()
    for f in frentes:
        bullets = subtopicos_validos(f)
        if bullets:
            assuntos_set.update(bullets)
        else:
            assuntos_set.add(f)  # autorreferência
    assuntos_universo = sorted(assuntos_set)

    enum_assunto = {"type": "string", "enum": assuntos_universo} if assuntos_universo else {"type": "string"}

    return {
        "type": "object",
        "additionalProperties": False,
        "required": [
            "frente_principal",
            "assunto_principal",
            "frente_secundaria",
            "assunto_secundario",
            "habilidades_cognitivas",
            "pre_requisitos",
            "dificuldade_esperada",
            "hipotese_erro_por_alternativa",
            "tags_busca",
        ],
        "properties": {
            "frente_principal": {"type": "string", "enum": frentes},
            "assunto_principal": enum_assunto,
            "frente_secundaria": {
                "anyOf": [
                    {"type": "string", "enum": frentes},
                    {"type": "null"},
                ],
            },
            "assunto_secundario": {
                "anyOf": [enum_assunto, {"type": "null"}],
            },
            "habilidades_cognitivas": {
                "type": "array",
                "items": {"type": "string", "enum": _HABILIDADES},
                "minItems": 1,
                "maxItems": 4,
            },
            "pre_requisitos": {
                "type": "array",
                "items": {"type": "string"},
                "maxItems": 8,
            },
            "dificuldade_esperada": {"type": "integer", "minimum": 1, "maximum": 5},
            "hipotese_erro_por_alternativa": {
                "type": "object",
                "additionalProperties": False,
                "required": ["A", "B", "C", "D", "E"],
                "properties": {l: {"type": "string"} for l in "ABCDE"},
            },
            "tags_busca": {
                "type": "array",
                "items": {"type": "string"},
                "maxItems": 8,
            },
        },
    }


def _system_text(disciplina: str) -> str:
    """Bloco system com taxonomia da disciplina. Cacheável."""
    frentes = FRENTES_POR_DISCIPLINA.get(disciplina, ())
    linhas = [
        "Você é um classificador pedagógico especializado em provas do "
        "vestibular ITA. Você produz metadados estruturados sobre UMA questão "
        "por vez, sem inventar valores fora do vocabulário do edital.",
        "",
        "REGRAS INVIOLÁVEIS:",
        "1. Toda questão tem 1 ou 2 assuntos. Sempre preencha `frente_principal` "
        "e `assunto_principal`. Use `frente_secundaria` e `assunto_secundario` "
        "apenas se a questão for genuinamente integradora (combina dois "
        "subtópicos distintos no raciocínio). Quando há dois, o `principal` "
        "é o que sustenta a maior parte do raciocínio; o `secundario` é apoio. "
        "Os dois podem vir de frentes diferentes.",
        "2. `frente_principal` e `frente_secundaria` (se houver) devem ser "
        "EXATAMENTE valores da lista de frentes da disciplina abaixo.",
        "3. `assunto_principal` e `assunto_secundario` (se houver) devem ser "
        "EXATAMENTE bullets listados sob a frente correspondente. "
        "EXCEÇÃO: para frentes sem bullets no edital (sinalizadas abaixo "
        "como 'sem subtópicos'), o assunto deve ser o próprio nome da frente.",
        "4. Não invente, não traduza, não adapte. Não use o principal e o "
        "secundário com par (frente, assunto) idêntico.",
        "5. Para cada alternativa A–E, descreva em uma frase o raciocínio "
        "errado que levaria a marcá-la. Para o gabarito, escreva literalmente "
        '"gabarito" seguido de uma frase explicando o acerto.',
        "6. Se a resolução não estiver fornecida, infira o raciocínio a "
        "partir do enunciado e das alternativas — não pule a questão.",
        "7. Nunca cite alunos, professores ou escolas.",
        "8. Devolva o resultado SOMENTE chamando a tool "
        f"`{TOOL_NAME}`. Não escreva texto livre.",
        "",
        f"### Frentes válidas para a disciplina {disciplina}",
    ]
    for f in frentes:
        linhas.append(f"- {f}")
    linhas.append("")
    linhas.append("### Assuntos (subtópicos) válidos por frente")
    for f in frentes:
        subs = subtopicos_validos(f)
        if subs:
            linhas.append(f"\n**{f}**")
            for s in subs:
                linhas.append(f"- {s}")
        else:
            linhas.append(
                f"\n**{f}** — sem subtópicos no edital; use `assunto = \"{f}\"`."
            )
    linhas.append("")
    linhas.append("### Habilidades cognitivas aceitas")
    linhas.append(", ".join(_HABILIDADES))
    linhas.append("")
    linhas.append(
        "### Dificuldade esperada (1–5)\n"
        "1 — trivial; 2 — aplicação direta; 3 — combinar dois conceitos; "
        "4 — múltiplos passos não-óbvios; 5 — questão divisória do ITA."
    )
    return "\n".join(linhas)


def _user_text(inp: EnrichmentInput) -> str:
    linhas = [
        f"Número: {inp.numero}",
        f"Disciplina: {inp.disciplina}",
        f"Assunto declarado pela banca: {inp.assunto or '(não informado)'}",
        "",
        "### Enunciado",
        inp.enunciado_md.strip(),
        "",
        "### Alternativas",
    ]
    for letra in "ABCDE":
        linhas.append(f"{letra}) {inp.alternativas.get(letra, '(ausente)')}")
    linhas.append("")
    linhas.append("### Resolução (opcional — pode estar ausente)")
    if inp.resolucao_md:
        linhas.append(inp.resolucao_md.strip())
    else:
        linhas.append(
            "(não fornecida — infira o raciocínio a partir do enunciado e das alternativas)"
        )
    return "\n".join(linhas)


class EnrichmentAgent:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.anthropic_api_key
        self.model = model or settings.enrichment_model
        self.cache = EnrichmentCache(settings.enrichment_cache_dir)
        self._client = None  # lazy

    @property
    def disponivel(self) -> bool:
        return bool(self.api_key)

    def _client_lazy(self):
        if self._client is None:
            try:
                import anthropic
            except ImportError as e:  # pragma: no cover
                raise RuntimeError(
                    "anthropic SDK não instalado. Rode: pip install anthropic"
                ) from e
            self._client = anthropic.Anthropic(api_key=self.api_key)
        return self._client

    def _call(self, inp: EnrichmentInput) -> dict:
        """Faz uma chamada à API e devolve o dict da tool_use. Levanta em erro."""
        client = self._client_lazy()
        schema = _tool_schema(inp.disciplina)
        system_blocks = [
            {
                "type": "text",
                "text": _system_text(inp.disciplina),
                "cache_control": {"type": "ephemeral"},
            }
        ]
        msg = client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system_blocks,
            tools=[
                {
                    "name": TOOL_NAME,
                    "description": (
                        "Registra metadados pedagógicos a priori da questão. "
                        "Deve ser chamada exatamente uma vez."
                    ),
                    "input_schema": schema,
                }
            ],
            tool_choice={"type": "tool", "name": TOOL_NAME},
            messages=[{"role": "user", "content": _user_text(inp)}],
        )
        for block in msg.content:
            if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
                return dict(block.input)
        raise RuntimeError("Resposta sem tool_use esperado.")

    def run(self, questao: QuestaoConteudo) -> tuple[Optional[EnrichmentResult], dict]:
        """Enriquece uma questão. Devolve (result_ou_None, meta) onde meta tem
        `status`, `version`, `taxonomia_version`, `model`, `cache_hit`,
        `error?`, `attempts`.
        """
        meta: dict = {
            "version": PROMPT_META.get("version", "0.0.0"),
            "taxonomia_version": PROMPT_META.get("taxonomy_version", "unknown"),
            "model": self.model,
            "cache_hit": False,
            "attempts": 0,
        }

        if questao.disciplina not in FRENTES_POR_DISCIPLINA:
            meta["status"] = "skipped"
            meta["error"] = f"disciplina '{questao.disciplina}' sem taxonomia."
            return None, meta

        try:
            inp = EnrichmentInput(
                numero=questao.numero,
                disciplina=questao.disciplina,           # type: ignore[arg-type]
                enunciado_md=questao.enunciado_md,
                alternativas=questao.alternativas,
                assunto=questao.assunto,
                resolucao_md=questao.resolucao_md,
            )
        except ValidationError as e:
            meta["status"] = "failed"
            meta["error"] = f"entrada inválida: {e}"
            return None, meta

        q_hash = hash_questao(questao)
        cache_key = self.cache.key(
            q_hash, meta["version"], meta["taxonomia_version"], self.model
        )
        cached = self.cache.get(cache_key)
        if cached is not None:
            try:
                result = EnrichmentResult.model_validate(cached["result"])
                erros = validar_enrichment(questao.disciplina, result)
                if not erros:
                    meta["cache_hit"] = True
                    meta["status"] = "ok"
                    return result, meta
            except ValidationError:
                pass  # cache corrompido — recomputa

        if not self.disponivel:
            meta["status"] = "failed"
            meta["error"] = (
                "ANTHROPIC_API_KEY ausente. Defina no .env para rodar o Estágio 2."
            )
            return None, meta

        last_err: Optional[str] = None
        for attempt in (1, 2):
            meta["attempts"] = attempt
            try:
                payload = self._call(inp)
                result = EnrichmentResult.model_validate(payload)
                erros = validar_enrichment(questao.disciplina, result)
                if erros:
                    last_err = " ; ".join(erros)
                    logger.warning(
                        "enrichment.cross_field_erro",
                        extra={
                            "extra": {
                                "numero": questao.numero,
                                "attempt": attempt,
                                "erros": erros,
                            }
                        },
                    )
                    continue
                self.cache.put(
                    cache_key,
                    {
                        "result": result.model_dump(),
                        "version": meta["version"],
                        "taxonomia_version": meta["taxonomia_version"],
                        "model": self.model,
                        "questao_hash": q_hash,
                    },
                )
                meta["status"] = "ok"
                return result, meta
            except ValidationError as e:
                last_err = f"shape inválido: {e}"
                logger.warning(
                    "enrichment.shape_erro",
                    extra={"extra": {"numero": questao.numero, "attempt": attempt}},
                )
            except Exception as e:
                last_err = f"chamada falhou: {e}"
                logger.exception(
                    "enrichment.chamada_erro",
                    extra={"extra": {"numero": questao.numero, "attempt": attempt}},
                )
            time.sleep(0.5)  # backoff curto entre tentativas

        meta["status"] = "failed"
        meta["error"] = last_err or "falha desconhecida"
        return None, meta


def filtra_xml_likes(texto: str) -> str:
    """Remove resíduos de XML/HTML que ocasionalmente sobrevivem ao pandoc."""
    return re.sub(r"<[^>]+>", "", texto)
