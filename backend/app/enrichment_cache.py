"""Cache em disco para o Estágio 2.

Chave: sha256 do conteúdo da questão + versão do prompt + versão da taxonomia +
nome do modelo. Mudou qualquer um dos quatro → cache miss e o LLM é chamado.

Persistido como JSON em `settings.enrichment_cache_dir`. Sem TTL — quem
invalida é a versão do prompt/taxonomia.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Optional

from .logging_config import get_logger

logger = get_logger("app.enrichment_cache")


class EnrichmentCache:
    def __init__(self, root: str | Path):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    def key(
        self,
        questao_hash: str,
        prompt_version: str,
        taxonomia_version: str,
        model: str,
    ) -> str:
        h = hashlib.sha256()
        h.update(questao_hash.encode())
        h.update(b"|")
        h.update(prompt_version.encode())
        h.update(b"|")
        h.update(taxonomia_version.encode())
        h.update(b"|")
        h.update(model.encode())
        return h.hexdigest()

    def _path(self, key: str) -> Path:
        return self.root / f"{key}.json"

    def get(self, key: str) -> Optional[dict]:
        p = self._path(key)
        if not p.exists():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            logger.exception("enrichment_cache.read_erro", extra={"extra": {"key": key[:16]}})
            return None

    def put(self, key: str, value: dict) -> None:
        try:
            self._path(key).write_text(
                json.dumps(value, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        except Exception:
            logger.exception("enrichment_cache.write_erro", extra={"extra": {"key": key[:16]}})
