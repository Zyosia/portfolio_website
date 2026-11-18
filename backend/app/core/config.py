"""Application settings, read from environment variables (documented in `.env.example`)."""

from functools import lru_cache
from typing import Literal, Self

from pydantic import EmailStr, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

type AppEnv = Literal["development", "test", "production"]
type LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


class Settings(BaseSettings):
    """Every setting has a safe default except the ones that must be chosen per deployment."""

    model_config = SettingsConfigDict(
        # When running `uv run fastapi dev` from `backend/`, the repository root `.env` is used.
        # In containers, variables come from the environment and these files do not exist.
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: AppEnv = "development"
    log_level: LogLevel = "INFO"

    smtp_host: str = "localhost"
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_starttls: bool = True
    smtp_use_tls: bool = False
    smtp_timeout_seconds: float = Field(default=10.0, gt=0)

    contact_from_email: EmailStr
    contact_to_email: EmailStr
    contact_rate_limit_requests: int = Field(default=5, ge=1)
    contact_rate_limit_window_seconds: int = Field(default=3600, ge=1)

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def docs_enabled(self) -> bool:
        """OpenAPI docs are a development aid; they are never exposed in production."""
        return self.app_env == "development"

    @model_validator(mode="after")
    def _check_tls_mode(self) -> Self:
        if self.smtp_starttls and self.smtp_use_tls:
            msg = "SMTP_STARTTLS and SMTP_USE_TLS are mutually exclusive"
            raise ValueError(msg)
        return self


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance, injected with `Depends(get_settings)`."""
    # Required values (contact addresses) come from the environment.
    return Settings()
