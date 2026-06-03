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

    # Observabilidade. LOG_LEVEL: DEBUG|INFO|WARNING|ERROR.
    # LOG_FORMAT: "json" (produção, 1 evento por linha) ou "text" (dev local).
    log_level: str = "INFO"
    log_format: str = "json"

    # Fase 2 — pipeline .docx + agentes. Vazio quando indisponível: o parser
    # (Estágio 1) e o assigner (Estágio 1.5) seguem rodando; os Estágios 2 e 3
    # falham com mensagem clara em vez de tentar uma chamada sem credencial.
    anthropic_api_key: str = ""
    enrichment_model: str = "claude-sonnet-4-6"
    diagnostic_model: str = "claude-opus-4-7"

    # Diretórios de artefatos do pipeline. Relativos à raiz do repositório.
    media_dir: str = "backend/.cache/media"
    enrichment_cache_dir: str = "backend/.cache/enrichment"
    professores_config: str = "backend/config/professores.json"

    model_config = SettingsConfigDict(
        env_file=str(ROOT_ENV),
        env_file_encoding="utf-8",
        extra="ignore",  # ignora SUPABASE_ANON_KEY e outras chaves do .env
    )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
