"""Estágio 1 — Parser determinístico do .docx da prova.

Fluxo:
  1) sha256 do arquivo (idempotência);
  2) pandoc converte .docx em markdown + LaTeX inline (preserva equações OMML);
  3) pandoc extrai imagens para pasta dedicada;
  4) split por `QUESTÃO N`;
  5) por bloco: enunciado, alternativas A-E, assunto, resolução, gabarito_doc,
     imagens e equações LaTeX;
  6) cruzamento com gabarito_xlsx → preenche `gabarito_xlsx` e adiciona warning
     em divergência.

Não usa LLM. Falhas estruturais (zero questões, pandoc ausente) levantam
ValueError; problemas por questão (sem `Resolução`, etc.) vão para `warnings`.
"""
from __future__ import annotations

import hashlib
import re
import shutil
import tempfile
from pathlib import Path
from typing import Iterable, Optional

from .agent_schemas import QuestaoConteudo
from .logging_config import get_logger

logger = get_logger("app.docx_parser")

# Os regexes toleram a saída real do pandoc: bold/itálico envolvendo marcadores
# (`**Resolução:**`), `)` escapado em alternativas (`A\)`), e ausência de quebra
# de linha após o número da questão (`QUESTÃO 25\Identifique...`).
# Padrão "ruído" do pandoc: bold/itálico (`**`/`*`), highlight (`[texto]{.mark}`),
# escapes de `)` em alternativas (`A\)`), envoltórios em colchetes.
_RE_QUESTAO = re.compile(
    r"(?:^|\n)[\s\*\[]*QUEST[AÃ]O[\s\*\[]+(\d+)(?!\d)",
    re.IGNORECASE,
)
_RE_MARCA_ALTERNATIVA = re.compile(
    r"(?:^|\n)[\s\*\[]*([A-E])[\s\*]*\\?\)\s*",
    re.IGNORECASE,
)
_RE_ASSUNTO = re.compile(
    r"(?:^|\n)[\s\*\[]*Assunto[\s\*]*:[\s\*]*(.+?)(?:\n|$)",
    re.IGNORECASE,
)
_RE_RESOLUCAO_HEADER = re.compile(
    r"(?:^|\n)[\s\*\[]*Resolu[cç][aã]o[\s\*]*:?[\s\*]*(?=\n|$)",
    re.IGNORECASE,
)
_RE_RESPOSTA = re.compile(
    r"(?:^|\n)[\s\*\[]*(?:Resposta|Gabarito)[\s\*]*:[\s\*]*([A-E])\b",
    re.IGNORECASE,
)
_RE_IMG = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
_RE_LATEX_INLINE = re.compile(r"\$([^\$\n]{2,})\$")
_RE_LATEX_DISPLAY = re.compile(r"\$\$([^\$]+?)\$\$", re.DOTALL)

# Atribuições do pandoc para destaques do Word (highlight, sublinhado).
_RE_SPAN_CLASSE = re.compile(r"\[([^\]]*)\]\{\.[a-z_]+\}")
_RE_CLASSE_DANGLING = re.compile(r"\]?\{\.[a-z_]+\}\*{0,2}")


def _clean(text: str | None) -> str | None:
    """Remove resíduos de formatação do pandoc preservando LaTeX inline.
    Aplica apenas a campos de texto (enunciado/assunto/resolucao/alternativas);
    não toca em `equacoes_latex` (bruto).
    """
    if not text:
        return text
    text = _RE_SPAN_CLASSE.sub(r"\1", text)
    text = _RE_CLASSE_DANGLING.sub("", text)
    return text.strip()


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _pandoc_convert(docx_path: Path, media_root: Path) -> str:
    """Converte .docx → markdown + LaTeX, extraindo imagens em `media_root`."""
    try:
        import pypandoc
    except ImportError as e:  # pragma: no cover
        raise RuntimeError("pypandoc não instalado. Rode: pip install pypandoc") from e

    media_root.mkdir(parents=True, exist_ok=True)
    return pypandoc.convert_file(
        str(docx_path),
        to="markdown+raw_tex+tex_math_dollars",
        extra_args=[f"--extract-media={media_root}", "--wrap=none"],
    )


def _normalize_image(src: str, media_root: Path, numero: int, idx: int) -> dict:
    """Move a imagem extraída para um nome canônico q{N}_img{K}.{ext} e devolve
    metadado (path relativo + sha256)."""
    src_path = Path(src)
    if not src_path.is_absolute():
        src_path = (media_root.parent / src_path).resolve()
    if not src_path.exists():
        return {"path": src, "sha256": None, "missing": True}

    ext = src_path.suffix.lower() or ".png"
    dest = media_root / f"q{numero:02d}_img{idx:02d}{ext}"
    if src_path != dest:
        shutil.copy2(src_path, dest)
    return {"path": str(dest), "sha256": _file_sha256(dest)}


def _split_blocks(md: str) -> list[tuple[int, str]]:
    """Devolve lista de (numero, bloco_md), em ordem do documento."""
    matches = list(_RE_QUESTAO.finditer(md))
    if not matches:
        return []
    out: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        numero = int(m.group(1))
        bloco = md[start:end].strip()
        out.append((numero, bloco))
    return out


def _extrair_alternativas(bloco: str) -> tuple[dict[str, str], int | None]:
    """Encontra todas as marcas A) B) ... E) e devolve mapeamento + posição da
    primeira marca. Lida com `A)`, `A\\)`, `**A**)`, separados por múltiplas
    linhas. Corta o texto da alternativa em "Assunto:", "Resolução" ou "Resposta:".
    """
    marcas: list[tuple[int, int, str]] = []
    for m in _RE_MARCA_ALTERNATIVA.finditer(bloco):
        marcas.append((m.start(), m.end(), m.group(1).upper()))
    if not marcas:
        return {}, None
    marcas.sort(key=lambda t: t[0])

    alts: dict[str, str] = {}
    first_start = marcas[0][0]
    for i, (start, content_start, letra) in enumerate(marcas):
        if letra in alts:
            continue  # já capturei essa letra antes (duplicata)
        end = marcas[i + 1][0] if i + 1 < len(marcas) else len(bloco)
        texto = bloco[content_start:end]
        # corta em "Assunto:", "Resolução" ou "Resposta:" se aparecerem antes da próxima letra
        m_cut = re.search(
            r"\n[\s\*]*(?:Assunto|Resolu[cç][aã]o|Resposta|Gabarito)\b",
            texto,
            re.IGNORECASE,
        )
        if m_cut:
            texto = texto[:m_cut.start()]
        alts[letra] = texto.strip()
    return alts, first_start


def _parse_bloco(
    numero: int, bloco: str, media_root: Path
) -> tuple[QuestaoConteudo, list[str]]:
    warnings: list[str] = []

    # ── alternativas ──
    alts, first_alt_start = _extrair_alternativas(bloco)
    if len(alts) < 5:
        faltando = [c for c in "ABCDE" if c not in alts]
        warnings.append(
            f"Q{numero}: alternativas faltando {faltando} (encontradas: {sorted(alts)})"
        )

    # ── enunciado: do início do bloco até a primeira alternativa ──
    enunciado_end = first_alt_start if first_alt_start is not None else len(bloco)
    enunciado = bloco[:enunciado_end].strip()

    # ── assunto ──
    m_assunto = _RE_ASSUNTO.search(bloco)
    assunto = m_assunto.group(1).strip() if m_assunto else None
    if not assunto:
        warnings.append(f"Q{numero}: sem linha 'Assunto:'")

    # ── resolução (opcional no .docx) ──
    m_res = _RE_RESOLUCAO_HEADER.search(bloco)
    resolucao = None
    if m_res:
        resolucao = bloco[m_res.end():].strip()
        m_resp = _RE_RESPOSTA.search(resolucao or "")
        if m_resp:
            # Remove a linha "Resposta: X" do corpo da resolução.
            resolucao = (resolucao[:m_resp.start()] + resolucao[m_resp.end():]).strip()

    # ── gabarito do .docx (opcional; auditoria contra o xlsx) ──
    m_resp = _RE_RESPOSTA.search(bloco)
    gabarito_doc = m_resp.group(1).upper() if m_resp else None

    # ── imagens ──
    imagens: list[dict] = []
    for idx, m in enumerate(_RE_IMG.finditer(bloco), start=1):
        imagens.append(_normalize_image(m.group(1), media_root, numero, idx))

    # ── equações LaTeX (display + inline) ──
    equacoes = [e.strip() for e in _RE_LATEX_DISPLAY.findall(bloco)]
    equacoes += [e.strip() for e in _RE_LATEX_INLINE.findall(bloco) if len(e.strip()) >= 3]

    questao = QuestaoConteudo(
        numero=numero,
        disciplina="",                  # preenchido no cruzamento com xlsx
        enunciado_md=_clean(enunciado) or "",
        alternativas={l: _clean(t) or "" for l, t in alts.items()},
        assunto=_clean(assunto),
        resolucao_md=_clean(resolucao),
        gabarito_doc=gabarito_doc,
        gabarito_xlsx="",               # preenchido no cruzamento com xlsx
        imagens=imagens,
        equacoes_latex=equacoes,
        warnings=warnings,
    )
    return questao, warnings


def parse_docx(
    content: bytes,
    gabarito_xlsx: Iterable[dict],
    media_dir: Path,
    simulado_chave: Optional[str] = None,
) -> tuple[list[QuestaoConteudo], str, list[str]]:
    """Parser principal. Recebe os bytes do .docx + lista de questões já parseadas
    do xlsx (cada item com `numero, disciplina, gabarito`). Devolve:

      - lista de `QuestaoConteudo` em ordem de número;
      - sha256 do .docx (para idempotência);
      - lista global de warnings (questões sem `Resolução`, gabarito divergente,
        questão presente em um arquivo e ausente no outro).

    Levanta ValueError em problemas estruturais (zero questões encontradas).
    """
    sha = _sha256(content)
    by_num_xlsx = {int(q["numero"]): q for q in gabarito_xlsx}

    media_root = media_dir / (simulado_chave or sha[:12])
    media_root.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        md = _pandoc_convert(tmp_path, media_root)
    finally:
        tmp_path.unlink(missing_ok=True)

    blocos = _split_blocks(md)
    if not blocos:
        raise ValueError(
            "Nenhuma 'QUESTÃO N' encontrada no .docx. "
            "Verifique se o documento usa o padrão esperado."
        )

    questoes: list[QuestaoConteudo] = []
    warnings: list[str] = []
    numeros_docx = set()

    for numero, bloco in blocos:
        if numero in numeros_docx:
            warnings.append(f"Q{numero}: número duplicado no .docx; ignorando segunda ocorrência.")
            continue
        numeros_docx.add(numero)

        q, w = _parse_bloco(numero, bloco, media_root)
        warnings.extend(w)

        x = by_num_xlsx.get(numero)
        if not x:
            warnings.append(f"Q{numero}: presente no .docx, ausente no gabarito.xlsx")
            q.disciplina = ""
            q.gabarito_xlsx = ""
        else:
            q.disciplina = x.get("disciplina", "")
            q.gabarito_xlsx = (x.get("gabarito") or "").upper()
            if q.gabarito_doc and q.gabarito_doc != q.gabarito_xlsx:
                warnings.append(
                    f"Q{numero}: gabarito divergente (docx='{q.gabarito_doc}', "
                    f"xlsx='{q.gabarito_xlsx}'); mantendo o do xlsx."
                )
        questoes.append(q)

    numeros_xlsx = set(by_num_xlsx.keys())
    for n in sorted(numeros_xlsx - numeros_docx):
        warnings.append(f"Q{n}: presente no gabarito.xlsx, ausente no .docx")

    questoes.sort(key=lambda q: q.numero)

    logger.info(
        "docx.parse.ok",
        extra={
            "extra": {
                "questoes": len(questoes),
                "warnings": len(warnings),
                "sha256": sha[:16],
                "media_root": str(media_root),
            }
        },
    )
    return questoes, sha, warnings


def hash_questao(q: QuestaoConteudo) -> str:
    """Hash determinístico do conteúdo de uma questão, para chave de cache do
    Estágio 2. Mudou enunciado/alternativas/resolução → invalida só ela."""
    h = hashlib.sha256()
    h.update(q.disciplina.encode())
    h.update(b"\n")
    h.update(q.enunciado_md.encode())
    h.update(b"\n")
    for letra in sorted(q.alternativas):
        h.update(f"{letra}:{q.alternativas[letra]}\n".encode())
    if q.assunto:
        h.update(f"ASSUNTO:{q.assunto}\n".encode())
    if q.resolucao_md:
        h.update(q.resolucao_md.encode())
    return h.hexdigest()
