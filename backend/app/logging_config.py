"""Configuração central de logging e observabilidade da API.

Toda a aplicação loga através deste módulo. O formato e o nível são
controlados por variáveis de ambiente (ver `config.py`):

- LOG_LEVEL: DEBUG | INFO | WARNING | ERROR (default: INFO)
- LOG_FORMAT: json | text (default: json)

Em produção (Vercel) o stdout/stderr é capturado automaticamente, então
logamos sempre para o console. O formato JSON facilita a ingestão por
ferramentas de observabilidade.

Cada request recebe um `request_id` propagado via ContextVar, de forma que
todas as linhas de log de uma mesma requisição podem ser correlacionadas.
"""

import json
import logging
import sys
from contextvars import ContextVar

# Correlaciona todas as linhas de log de uma mesma requisição.
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIdFilter(logging.Filter):
    """Injeta o request_id atual em todo LogRecord."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


class JsonFormatter(logging.Formatter):
    """Formata o log como uma linha JSON (1 evento por linha)."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "request_id": getattr(record, "request_id", "-"),
            "message": record.getMessage(),
        }

        # Campos extras passados via logger.info(..., extra={"extra": {...}})
        extra = getattr(record, "extra", None)
        if isinstance(extra, dict):
            payload.update(extra)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False, default=str)


class TextFormatter(logging.Formatter):
    """Formato legível para desenvolvimento local."""

    def __init__(self) -> None:
        super().__init__(
            fmt="%(asctime)s | %(levelname)-7s | %(request_id)s | %(name)s | %(message)s",
            datefmt="%H:%M:%S",
        )


_configured = False


def setup_logging(level: str = "INFO", fmt: str = "json") -> None:
    """Configura o root logger uma única vez (idempotente)."""
    global _configured
    if _configured:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter())
    handler.setFormatter(JsonFormatter() if fmt.lower() == "json" else TextFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())

    # Alinha os loggers do uvicorn ao nosso handler/formato.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        uv_logger = logging.getLogger(name)
        uv_logger.handlers.clear()
        uv_logger.propagate = True

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """Retorna um logger nomeado pronto para uso.

    Use `logger.info("msg", extra={"extra": {"chave": valor}})` para anexar
    campos estruturados ao evento.
    """
    return logging.getLogger(name)
