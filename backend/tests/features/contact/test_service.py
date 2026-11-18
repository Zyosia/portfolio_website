import pytest

from app.core.errors import EmailDeliveryError
from app.features.contact.service import ContactMessage, ContactService
from tests.conftest import FakeEmailSender


@pytest.fixture
def service(email_sender: FakeEmailSender) -> ContactService:
    return ContactService(email_sender, "site@example.com", "owner@example.com")


def _message(**overrides: str | None) -> ContactMessage:
    values: dict[str, str | None] = {
        "name": "Ada Lovelace",
        "email": "ada@example.org",
        "subject": "Collaboration",
        "message": "Hello, I would like to talk about a project.",
        **overrides,
    }
    return ContactMessage(**values)  # type: ignore[arg-type]


@pytest.mark.anyio
async def test_sends_the_message_to_the_owner(
    service: ContactService, email_sender: FakeEmailSender
) -> None:
    await service.submit(_message())

    [email] = email_sender.sent
    assert email.sender == "site@example.com"
    assert email.recipient == "owner@example.com"
    assert email.reply_to == "ada@example.org"
    assert email.subject == "[Portfolio] Collaboration - Ada Lovelace"
    assert "Hello, I would like to talk about a project." in email.body
    assert "From: Ada Lovelace <ada@example.org>" in email.body


@pytest.mark.anyio
async def test_uses_a_default_subject(
    service: ContactService, email_sender: FakeEmailSender
) -> None:
    await service.submit(_message(subject=None))

    assert email_sender.sent[0].subject == "[Portfolio] New message - Ada Lovelace"


@pytest.mark.anyio
async def test_silently_drops_spam(service: ContactService, email_sender: FakeEmailSender) -> None:
    await service.submit(_message(honeypot="https://spam.example"))

    assert email_sender.sent == []


@pytest.mark.anyio
async def test_propagates_delivery_errors(
    service: ContactService, email_sender: FakeEmailSender
) -> None:
    email_sender.error = EmailDeliveryError()

    with pytest.raises(EmailDeliveryError):
        await service.submit(_message())
