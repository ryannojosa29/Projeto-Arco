"""Cliente supabase-py (service_role) — único ponto de acesso ao banco."""
from functools import lru_cache

from supabase import Client, create_client

from .config import settings


@lru_cache(maxsize=1)
def get_client() -> Client:
    # service_role: tem BYPASSRLS, então enxerga/escreve mesmo com RLS ligada.
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
