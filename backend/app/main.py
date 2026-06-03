"""Arco API — Fase 1. Único gateway entre o front e o Supabase."""
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .logging_config import get_logger, request_id_var, setup_logging
from .routers import importacoes, provas, simulados

# Configura o logging antes de qualquer outra coisa.
setup_logging(level=settings.log_level, fmt=settings.log_format)
logger = get_logger("app.main")

app = FastAPI(title="Arco API — Fase 1", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Loga toda requisição com request_id, latência e status.

    O request_id é propagado via ContextVar para todas as linhas de log da
    requisição e devolvido no header `x-request-id`. Se o cliente enviar o
    próprio `x-request-id`, ele é reaproveitado (correlação ponta a ponta).
    """
    request_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    token = request_id_var.set(request_id)
    start = time.perf_counter()

    logger.info(
        "request.start",
        extra={
            "extra": {
                "method": request.method,
                "path": request.url.path,
                "query": str(request.url.query) or None,
                "client": request.client.host if request.client else None,
            }
        },
    )

    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.exception(
            "request.error",
            extra={
                "extra": {
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": elapsed_ms,
                }
            },
        )
        request_id_var.reset(token)
        return JSONResponse(
            status_code=500,
            content={"detail": "Erro interno do servidor.", "request_id": request_id},
            headers={"x-request-id": request_id},
        )

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    log_fn = logger.warning if response.status_code >= 500 else logger.info
    log_fn(
        "request.end",
        extra={
            "extra": {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": elapsed_ms,
            }
        },
    )
    response.headers["x-request-id"] = request_id
    request_id_var.reset(token)
    return response


@app.on_event("startup")
async def on_startup():
    logger.info(
        "app.startup",
        extra={
            "extra": {
                "version": app.version,
                "log_level": settings.log_level,
                "log_format": settings.log_format,
                "cors_origins": settings.cors_origins,
            }
        },
    )


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("app.shutdown")


app.include_router(importacoes.router)
app.include_router(simulados.router)
app.include_router(provas.router)


@app.get("/health")
def health():
    return {"ok": True}
