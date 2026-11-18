import pytest
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from tests.conftest import make_settings


def test_defaults_are_safe() -> None:
    settings = make_settings()

    assert settings.smtp_starttls is True
    assert settings.contact_rate_limit_requests == 3
    assert settings.is_production is False


def test_reads_values_from_the_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("SMTP_PORT", "2525")
    monkeypatch.setenv("CONTACT_TO_EMAIL", "inbox@example.org")

    settings = Settings(_env_file=None)

    assert settings.is_production is True
    assert settings.docs_enabled is False
    assert settings.smtp_port == 2525
    assert settings.contact_to_email == "inbox@example.org"


def test_requires_the_contact_addresses(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CONTACT_FROM_EMAIL", raising=False)

    with pytest.raises(ValidationError, match="contact_from_email"):
        Settings(_env_file=None)


def test_rejects_conflicting_tls_modes() -> None:
    with pytest.raises(ValidationError, match="mutually exclusive"):
        make_settings(smtp_starttls=True, smtp_use_tls=True)


def test_rejects_an_invalid_email_address() -> None:
    with pytest.raises(ValidationError):
        make_settings(contact_to_email="not-an-email")


def test_get_settings_is_cached() -> None:
    assert get_settings() is get_settings()
