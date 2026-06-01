"""Cliente supabase-py (service_role) — único ponto de acesso ao banco."""
from functools import lru_cache

from supabase import Client, create_client

from .config import settings
from .logging_config import get_logger

logger = get_logger("app.db")


@lru_cache(maxsize=1)
def get_client() -> Client:
    # service_role: tem BYPASSRLS, então enxerga/escreve mesmo com RLS ligada.
    # Inicializado uma única vez (lru_cache) — este log marca a 1ª conexão.
    logger.info("supabase.client_init", extra={"extra": {"url": settings.supabase_url}})
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
