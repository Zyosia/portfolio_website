import logging
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.errors import EmailDeliveryError
from tests.conftest import FakeEmailSender

URL = "/api/v1/contact"


def _payload(**overrides: Any) -> dict[str, Any]:
    return {
        "name": "Ada Lovelace",
        "email": "ada@example.org",
        "subject": "Collaboration",
        "message": "Hello, I would like to talk about a project.",
        **overrides,
    }


def test_accepts_a_valid_message(client: TestClient, email_sender: FakeEmailSender) -> None:
    response = client.post(URL, json=_payload())

    assert response.status_code == 200
    assert response.json() == {"status": "sent"}
    assert len(email_sender.sent) == 1


def test_subject_is_optional(client: TestClient, email_sender: FakeEmailSender) -> None:
    response = client.post(URL, json=_payload(subject=None))

    assert response.status_code == 200
    assert email_sender.sent[0].subject.startswith("[Portfolio] New message")


def test_trims_whitespace(client: TestClient, email_sender: FakeEmailSender) -> None:
    client.post(URL, json=_payload(name="  Ada  "))

    assert email_sender.sent[0].subject.endswith("- Ada")


@pytest.mark.parametrize(
    ("override", "field"),
    [
        ({"name": ""}, "name"),
        ({"name": "x" * 101}, "name"),
        ({"name": "Ada\r\nBcc: victim@example.com"}, "name"),
        ({"email": "not-an-email"}, "email"),
        ({"subject": "Hi\nBcc: x@example.com"}, "subject"),
        ({"message": "too short"}, "message"),
        ({"message": "x" * 5001}, "message"),
        ({"unexpected": "field"}, "unexpected"),
    ],
)
def test_rejects_invalid_input(
    client: TestClient,
    email_sender: FakeEmailSender,
    override: dict[str, Any],
    field: str,
) -> None:
    response = client.post(URL, json=_payload(**override))

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert field in response.json()["error"]["message"]
    assert email_sender.sent == []


def test_honeypot_looks_successful_but_sends_nothing(
    client: TestClient, email_sender: FakeEmailSender
) -> None:
    response = client.post(URL, json=_payload(website="https://spam.example"))

    assert response.status_code == 200
    assert email_sender.sent == []


def test_rate_limits_per_client(client: TestClient) -> None:
    # The test settings allow 3 requests per window.
    for _ in range(3):
        assert client.post(URL, json=_payload()).status_code == 200

    response = client.post(URL, json=_payload())

    assert response.status_code == 429
    assert response.json()["error"]["code"] == "rate_limited"
    assert int(response.headers["Retry-After"]) > 0


def test_provider_failure_returns_503(client: TestClient, email_sender: FakeEmailSender) -> None:
    email_sender.error = EmailDeliveryError()

    response = client.post(URL, json=_payload())

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "email_unavailable"


def test_never_logs_the_message_content(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    secret = "my very personal message content"
    with caplog.at_level(logging.DEBUG):
        client.post(URL, json=_payload(message=secret))

    assert "contact_message_sent" in caplog.text
    assert secret not in caplog.text
    assert "ada@example.org" not in caplog.text
