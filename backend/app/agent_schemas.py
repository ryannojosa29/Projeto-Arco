"""Schemas Pydantic dos contratos JSON entre os estágios do pipeline.

Cada estágio do `docs/09-pipeline-de-ingestao-de-provas.md` produz uma struct
validada — o LLM nunca devolve string livre, sempre um objeto que passa por
estes models. Falha de validação dispara retry no agente e marca status falso.
"""
from typing import Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, model_validator  # noqa: F401

from .taxonomia import (
    Disciplina,
    FrenteFisica,
    FrenteIngles,
    FrenteMatematica,
    FrenteQuimica,
    HabilidadeCognitiva,
    frente_pertence_a,
    subtopicos_validos,
)

Frente = Union[FrenteMatematica, FrenteQuimica, FrenteFisica, FrenteIngles]


# ═══════════════════════════════════════════════════════════════
# Estágio 1 — saída do docx_parser (determinístico)
# ═══════════════════════════════════════════════════════════════
class QuestaoConteudo(BaseModel):
    """JSON canônico de uma questão extraído do .docx + cruzamento com xlsx."""

    numero: int
    disciplina: str                              # vem do xlsx (autoritativo)
    enunciado_md: str
    alternativas: dict[str, str]                 # {"A": "...", ..., "E": "..."}
    assunto: Optional[str] = None                # linha "Assunto:" quando houver
    resolucao_md: Optional[str] = None
    gabarito_doc: Optional[str] = None           # do .docx (auditoria)
    gabarito_xlsx: str                           # do xlsx (autoritativo)
    imagens: list[dict] = Field(default_factory=list)        # [{"path":..., "sha256":...}]
    equacoes_latex: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════
# Estágio 2 — enriquecimento a priori (saída do LLM)
# ═══════════════════════════════════════════════════════════════
class HipotesePorAlternativa(BaseModel):
    """Para cada alternativa, o raciocínio errado (ou "gabarito") esperado."""

    model_config = ConfigDict(extra="forbid")

    A: str
    B: str
    C: str
    D: str
    E: str


class EnrichmentResult(BaseModel):
    """Saída do enrichment_agent — JSON estrito do LLM.

    Cada questão tem 1 ou 2 assuntos. Quando há dois, `assunto_principal`
    sustenta a maior parte do raciocínio; `assunto_secundario` é apoio. Os
    dois assuntos podem vir de frentes diferentes (questão integradora).
    """

    model_config = ConfigDict(extra="forbid")

    frente_principal: str                                # validado contra disciplina
    assunto_principal: str                               # subtópico ∈ frente_principal
    frente_secundaria: Optional[str] = None
    assunto_secundario: Optional[str] = None             # subtópico ∈ frente_secundaria
    habilidades_cognitivas: list[HabilidadeCognitiva] = Field(min_length=1, max_length=4)
    pre_requisitos: list[str] = Field(default_factory=list, max_length=8)
    dificuldade_esperada: int = Field(ge=1, le=5)
    hipotese_erro_por_alternativa: HipotesePorAlternativa
    tags_busca: list[str] = Field(default_factory=list, max_length=8)

    @model_validator(mode="after")
    def _par_secundario_consistente(self):
        # frente_secundaria e assunto_secundario andam juntos (ambos ou nenhum)
        has_f = self.frente_secundaria is not None
        has_a = self.assunto_secundario is not None
        if has_f != has_a:
            raise ValueError(
                "frente_secundaria e assunto_secundario devem ser ambos preenchidos "
                "ou ambos None."
            )
        return self


class EnrichmentInput(BaseModel):
    """Entrada para `enrichment_agent.run` — uma questão por vez."""

    numero: int
    disciplina: Disciplina
    enunciado_md: str
    alternativas: dict[str, str]
    assunto: Optional[str] = None
    resolucao_md: Optional[str] = None


def _validar_par(
    disciplina: str, frente: str, assunto: str, label: str
) -> list[str]:
    """Valida que `frente` pertence à disciplina e `assunto` à frente. Para
    frentes sem bullets no edital (Química Orgânica 11.1..11.6, Inglês
    'Interpretação'), exige `assunto == frente` (autorreferência).
    """
    erros: list[str] = []
    if not frente_pertence_a(disciplina, frente):
        erros.append(
            f"{label}: frente '{frente}' não pertence à disciplina '{disciplina}'."
        )
        return erros

    bullets = subtopicos_validos(frente)
    if bullets:
        if assunto not in bullets:
            erros.append(
                f"{label}: assunto '{assunto}' não é bullet da frente '{frente}'."
            )
    else:
        # Frente sem bullets → assunto autorreferência (igual ao nome da frente).
        if assunto != frente:
            erros.append(
                f"{label}: frente '{frente}' não tem subtópicos no edital; "
                f"o assunto deve ser '{frente}', recebido '{assunto}'."
            )
    return erros


def validar_enrichment(disciplina: str, result: EnrichmentResult) -> list[str]:
    """Valida coerência entre disciplina, frentes e assuntos. Retorna lista
    de mensagens de erro (vazia = OK).
    """
    erros: list[str] = []
    erros.extend(
        _validar_par(disciplina, result.frente_principal, result.assunto_principal, "principal")
    )
    if result.frente_secundaria is not None and result.assunto_secundario is not None:
        erros.extend(
            _validar_par(
                disciplina,
                result.frente_secundaria,
                result.assunto_secundario,
                "secundario",
            )
        )
        # Bloqueia (frente, assunto) idêntico nos dois — não faz sentido como par.
        if (
            result.frente_secundaria == result.frente_principal
            and result.assunto_secundario == result.assunto_principal
        ):
            erros.append(
                "secundario: par (frente, assunto) idêntico ao principal — "
                "use apenas o principal."
            )
    return erros


# ═══════════════════════════════════════════════════════════════
# Estágio 3a — saída do prioritizer (estatística, não LLM)
# ═══════════════════════════════════════════════════════════════
MotivoPriorizacao = Literal[
    "resolucao_sugerida",
    "revisao_tecnica",
    "ambos",
]


class QuestaoPrioritaria(BaseModel):
    """Questão selecionada para diagnóstico pós-aplicação."""

    questao_id: int
    numero: int
    motivo: MotivoPriorizacao
    acerto_pct: float
    distrator_dominante: Optional[str] = None    # "A".."E"
    distrator_pct: Optional[float] = None
    discriminante: Optional[float] = None
    bisserial: Optional[float] = None


# ═══════════════════════════════════════════════════════════════
# Estágio 3b — diagnóstico pós-aplicação (saída do LLM)
# ═══════════════════════════════════════════════════════════════
class DiagnosticResult(BaseModel):
    """Saída do diagnostic_agent — JSON estrito do LLM."""

    model_config = ConfigDict(extra="forbid")

    hipotese_pedagogica: str = Field(min_length=10, max_length=400)
    evidencia_no_distrator: str = Field(min_length=10, max_length=400)
    sugestao_abordagem: str = Field(min_length=10, max_length=500)

    @model_validator(mode="after")
    def _no_aluno_individual(self):
        """Sanity check: o LLM nunca deve referenciar alunos individuais.
        Heurística simples — basta proteger contra escorregadas comuns."""
        proibidos = ("aluno x", "aluno y", "id ", "nome:", "matrícula")
        texto = " ".join(
            (self.hipotese_pedagogica, self.evidencia_no_distrator, self.sugestao_abordagem)
        ).lower()
        for p in proibidos:
            if p in texto:
                raise ValueError(
                    f"Resposta menciona aluno individual ('{p}'). "
                    "O agente só pode discutir agregados."
                )
        return self
