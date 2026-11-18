import smtplib
from email.message import EmailMessage
from types import TracebackType
from typing import Self

import pytest

from app.core.errors import EmailDeliveryError
from app.shared.email import OutgoingEmail, SmtpEmailSender, build_message
from tests.conftest import make_settings

EMAIL = OutgoingEmail(
    sender="site@example.com",
    recipient="owner@example.com",
    subject="Hello",
    body="Body text",
    reply_to="visitor@example.org",
)


class FakeSmtp:
    """Stands in for smtplib.SMTP / SMTP_SSL and records what the sender does."""

    instances: list[FakeSmtp]

    def __init__(self, host: str, port: int, *, timeout: float, **kwargs: object) -> None:
        self.host, self.port, self.timeout, self.kwargs = host, port, timeout, kwargs
        self.calls: list[str] = []
        self.sent: list[EmailMessage] = []
        type(self).instances.append(self)

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        self.calls.append("quit")

    def starttls(self, **_kwargs: object) -> None:
        self.calls.append("starttls")

    def login(self, user: str, password: str) -> None:
        self.calls.append(f"login:{user}:{password}")

    def send_message(self, message: EmailMessage) -> None:
        self.sent.append(message)


@pytest.fixture
def fake_smtp(monkeypatch: pytest.MonkeyPatch) -> type[FakeSmtp]:
    FakeSmtp.instances = []
    monkeypatch.setattr(smtplib, "SMTP", FakeSmtp)
    monkeypatch.setattr(smtplib, "SMTP_SSL", FakeSmtp)
    return FakeSmtp


def test_build_message_sets_headers_and_body() -> None:
    message = build_message(EMAIL)

    assert message["From"] == "site@example.com"
    assert message["To"] == "owner@example.com"
    assert message["Reply-To"] == "visitor@example.org"
    assert message["Subject"] == "Hello"
    assert message.get_content().strip() == "Body text"


def test_build_message_omits_reply_to_when_absent() -> None:
    message = build_message(OutgoingEmail("a@example.com", "b@example.com", "S", "B"))

    assert message["Reply-To"] is None


@pytest.mark.anyio
async def test_sends_with_starttls_and_login(fake_smtp: type[FakeSmtp]) -> None:
    settings = make_settings(
        smtp_host="smtp.example.com",
        smtp_port=587,
        smtp_username="user",
        smtp_password="pass",
        smtp_timeout_seconds=5,
    )

    await SmtpEmailSender(settings).send(EMAIL)

    smtp = fake_smtp.instances[0]
    assert (smtp.host, smtp.port, smtp.timeout) == ("smtp.example.com", 587, 5)
    assert smtp.calls == ["starttls", "login:user:pass", "quit"]
    assert smtp.sent[0]["Subject"] == "Hello"


@pytest.mark.anyio
async def test_sends_over_implicit_tls_without_login(fake_smtp: type[FakeSmtp]) -> None:
    settings = make_settings(smtp_starttls=False, smtp_use_tls=True, smtp_port=465)

    await SmtpEmailSender(settings).send(EMAIL)

    smtp = fake_smtp.instances[0]
    assert "context" in smtp.kwargs
    assert smtp.calls == ["quit"]


@pytest.mark.anyio
async def test_plain_smtp_for_local_mailpit(fake_smtp: type[FakeSmtp]) -> None:
    settings = make_settings(smtp_starttls=False, smtp_host="mailpit", smtp_port=1025)

    await SmtpEmailSender(settings).send(EMAIL)

    assert fake_smtp.instances[0].calls == ["quit"]


@pytest.mark.anyio
@pytest.mark.parametrize(
    "error", [smtplib.SMTPAuthenticationError(535, b"bad"), ConnectionRefusedError()]
)
async def test_delivery_failures_become_a_domain_error(
    monkeypatch: pytest.MonkeyPatch, error: Exception
) -> None:
    def failing_smtp(*_args: object, **_kwargs: object) -> None:
        raise error

    monkeypatch.setattr(smtplib, "SMTP", failing_smtp)

    with pytest.raises(EmailDeliveryError):
        await SmtpEmailSender(make_settings()).send(EMAIL)
