"""Estágio 3b — diagnóstico pós-aplicação para questões priorizadas.

Recebe agregado estatístico + enriquecimento a priori (Estágio 2) e produz
três frases: hipótese pedagógica, evidência no distrator e sugestão de
abordagem. NUNCA recebe dados de aluno individual.
"""
from __future__ import annotations

import time
from pathlib import Path
from typing import Optional

from pydantic import ValidationError

from .agent_schemas import (
    DiagnosticResult,
    EnrichmentResult,
    QuestaoConteudo,
    QuestaoPrioritaria,
)
from .config import settings
from .logging_config import get_logger

logger = get_logger("app.diagnostic_agent")

TOOL_NAME = "registrar_diagnostico"
PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "diagnostic.md"


def _load_prompt_meta(path: Path) -> dict:
    if not path.exists():
        return {"version": "0.0.0"}
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {"version": "0.0.0"}
    end = text.find("\n---", 4)
    if end < 0:
        return {"version": "0.0.0"}
    meta: dict = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta


PROMPT_META = _load_prompt_meta(PROMPT_PATH)


TOOL_SCHEMA: dict = {
    "type": "object",
    "additionalProperties": False,
    "required": ["hipotese_pedagogica", "evidencia_no_distrator", "sugestao_abordagem"],
    "properties": {
        "hipotese_pedagogica": {"type": "string", "minLength": 10, "maxLength": 400},
        "evidencia_no_distrator": {"type": "string", "minLength": 10, "maxLength": 400},
        "sugestao_abordagem": {"type": "string", "minLength": 10, "maxLength": 500},
    },
}


def _system_text() -> str:
    return (
        "Você é um analista pedagógico que escreve devolutivas curtas e "
        "acionáveis para professores de cursinho ITA. Trabalha apenas com "
        "dados agregados — nunca menciona alunos individuais. Cruza a "
        "hipótese a priori de erro por alternativa (gerada antes dos dados) "
        "com o distrator empírico mais marcado.\n\n"
        "REGRAS INVIOLÁVEIS:\n"
        "1. Apenas agregados — nunca cite aluno, escola ou turma específica.\n"
        "2. Não reformule a resolução matemática; foque em aprendizagem e abordagem.\n"
        "3. Sem hedging vazio ('talvez', 'pode ser'). Se evidência for fraca, "
        "diga 'evidência fraca' e siga.\n"
        f"4. Devolva o resultado SOMENTE chamando a tool `{TOOL_NAME}`. "
        "Não escreva texto livre.\n"
    )


def _user_text(
    questao: QuestaoConteudo,
    enriquecimento: EnrichmentResult,
    prio: QuestaoPrioritaria,
) -> str:
    hip = enriquecimento.hipotese_erro_por_alternativa
    hipoteses = "\n".join(
        f"{letra}) {getattr(hip, letra)}" for letra in "ABCDE"
    )
    alts = "\n".join(
        f"{l}) {questao.alternativas.get(l, '(ausente)')}" for l in "ABCDE"
    )
    assunto_linha = (
        f"{enriquecimento.frente_principal} → {enriquecimento.assunto_principal}"
    )
    if enriquecimento.assunto_secundario:
        assunto_linha += (
            f"  |  apoio: {enriquecimento.frente_secundaria} → "
            f"{enriquecimento.assunto_secundario}"
        )
    return (
        f"Número: {questao.numero}\n"
        f"Disciplina: {questao.disciplina}\n"
        f"Assunto: {assunto_linha}\n"
        f"Habilidades exigidas: {', '.join(enriquecimento.habilidades_cognitivas)}\n"
        f"Dificuldade esperada a priori: {enriquecimento.dificuldade_esperada}/5\n"
        f"Motivo da priorização: {prio.motivo}\n\n"
        f"### Enunciado\n{questao.enunciado_md}\n\n"
        f"### Alternativas\n{alts}\n\n"
        f"### Hipótese a priori por alternativa\n{hipoteses}\n\n"
        "## Dados empíricos agregados\n"
        f"- Acerto da turma: {prio.acerto_pct:.1f}%\n"
        f"- Distrator dominante: alternativa {prio.distrator_dominante} "
        f"({prio.distrator_pct if prio.distrator_pct is not None else '?'}%)\n"
        f"- Discriminante: {prio.discriminante if prio.discriminante is not None else '(indisponível)'}\n"
        f"- Ponto-bisserial: {prio.bisserial if prio.bisserial is not None else '(indisponível)'}\n"
    )


class DiagnosticAgent:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.anthropic_api_key
        self.model = model or settings.diagnostic_model
        self._client = None

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

    def _call(
        self,
        questao: QuestaoConteudo,
        enriquecimento: EnrichmentResult,
        prio: QuestaoPrioritaria,
    ) -> dict:
        client = self._client_lazy()
        msg = client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=[
                {
                    "type": "text",
                    "text": _system_text(),
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            tools=[
                {
                    "name": TOOL_NAME,
                    "description": (
                        "Registra o diagnóstico pedagógico pós-aplicação. "
                        "Deve ser chamada exatamente uma vez."
                    ),
                    "input_schema": TOOL_SCHEMA,
                }
            ],
            tool_choice={"type": "tool", "name": TOOL_NAME},
            messages=[
                {"role": "user", "content": _user_text(questao, enriquecimento, prio)}
            ],
        )
        for block in msg.content:
            if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
                return dict(block.input)
        raise RuntimeError("Resposta sem tool_use esperado.")

    def run(
        self,
        questao: QuestaoConteudo,
        enriquecimento: EnrichmentResult,
        prio: QuestaoPrioritaria,
    ) -> tuple[Optional[DiagnosticResult], dict]:
        meta: dict = {
            "version": PROMPT_META.get("version", "0.0.0"),
            "model": self.model,
            "attempts": 0,
        }
        if not self.disponivel:
            meta["status"] = "failed"
            meta["error"] = "ANTHROPIC_API_KEY ausente."
            return None, meta

        last_err: Optional[str] = None
        for attempt in (1, 2):
            meta["attempts"] = attempt
            try:
                payload = self._call(questao, enriquecimento, prio)
                result = DiagnosticResult.model_validate(payload)
                meta["status"] = "ok"
                return result, meta
            except ValidationError as e:
                last_err = f"shape inválido: {e}"
                logger.warning(
                    "diagnostic.shape_erro",
                    extra={"extra": {"numero": questao.numero, "attempt": attempt}},
                )
            except Exception as e:
                last_err = f"chamada falhou: {e}"
                logger.exception(
                    "diagnostic.chamada_erro",
                    extra={"extra": {"numero": questao.numero, "attempt": attempt}},
                )
            time.sleep(0.5)

        meta["status"] = "failed"
        meta["error"] = last_err or "falha desconhecida"
        return None, meta
