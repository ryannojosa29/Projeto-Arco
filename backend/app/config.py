"""Configuração do backend. Lê o .env da raiz do projeto (mesmo do front)."""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/config.py -> parents[2] = raiz do repositório
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    # origens permitidas no CORS, separadas por vírgula. "*" libera todas.
    # Fase 1 (leitura pública, sem credenciais) → "*" por conveniência no dev.
    # Em produção (Vercel), defina FRONTEND_ORIGINS com a URL exata do front.
    frontend_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=str(ROOT_ENV),
        env_file_encoding="utf-8",
        extra="ignore",  # ignora SUPABASE_ANON_KEY e outras chaves do .env
    )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
