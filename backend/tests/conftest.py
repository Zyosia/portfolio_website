"""Shared fixtures. Tests never read a real `.env` and never open a network connection."""

import os

# `app.main` builds a module-level app at import time (for `fastapi dev` / uvicorn), which
# needs the required settings. Provide harmless values before any test imports it.
os.environ.setdefault("CONTACT_FROM_EMAIL", "site@example.com")
os.environ.setdefault("CONTACT_TO_EMAIL", "owner@example.com")

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.features.contact.router import get_contact_service
from app.features.contact.service import ContactService
from app.main import create_app
from app.shared.email import OutgoingEmail


class FakeEmailSender:
    """Records emails instead of sending them; can be told to fail."""

    def __init__(self) -> None:
        self.sent: list[OutgoingEmail] = []
        self.error: Exception | None = None

    async def send(self, email: OutgoingEmail) -> None:
        if self.error:
            raise self.error
        self.sent.append(email)


def make_settings(**overrides: object) -> Settings:
    values: dict[str, object] = {
        "app_env": "test",
        "contact_from_email": "site@example.com",
        "contact_to_email": "owner@example.com",
        "contact_rate_limit_requests": 3,
        "contact_rate_limit_window_seconds": 3600,
        **overrides,
    }
    return Settings(_env_file=None, **values)  # type: ignore[arg-type]


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def settings() -> Settings:
    return make_settings()


@pytest.fixture
def email_sender() -> FakeEmailSender:
    return FakeEmailSender()


@pytest.fixture
def client(settings: Settings, email_sender: FakeEmailSender) -> Iterator[TestClient]:
    app = create_app(settings)
    app.dependency_overrides[get_contact_service] = lambda: ContactService(
        sender=email_sender,
        from_address=str(settings.contact_from_email),
        to_address=str(settings.contact_to_email),
    )
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
