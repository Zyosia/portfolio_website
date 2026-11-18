from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import AppError, EmailDeliveryError, register_error_handlers


class TeapotError(AppError):
    status_code = 418  # type: ignore[assignment]
    code = "teapot"
    message = "I am a teapot."


@pytest.fixture
def client() -> Iterator[TestClient]:
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/domain-error")
    async def domain_error() -> None:
        raise TeapotError

    @app.get("/custom-message")
    async def custom_message() -> None:
        raise EmailDeliveryError("Provider down.")

    @app.get("/crash")
    async def crash() -> None:
        raise RuntimeError("secret internal detail")

    @app.get("/typed/{number}")
    async def typed(number: int) -> int:
        return number

    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client


def test_domain_errors_use_the_standard_shape(client: TestClient) -> None:
    response = client.get("/domain-error")

    assert response.status_code == 418
    assert response.json() == {"error": {"code": "teapot", "message": "I am a teapot."}}


def test_domain_errors_accept_a_custom_message(client: TestClient) -> None:
    response = client.get("/custom-message")

    assert response.status_code == 503
    assert response.json()["error"] == {"code": "email_unavailable", "message": "Provider down."}


def test_unexpected_errors_never_leak_details(client: TestClient) -> None:
    response = client.get("/crash")

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "secret" not in response.text


def test_unknown_routes_use_the_standard_shape(client: TestClient) -> None:
    response = client.get("/nope")

    assert response.status_code == 404
    assert response.json() == {"error": {"code": "not_found", "message": "Not Found"}}


def test_wrong_method_uses_the_standard_shape(client: TestClient) -> None:
    response = client.post("/domain-error")

    assert response.status_code == 405
    assert response.json()["error"]["code"] == "method_not_allowed"


def test_validation_errors_name_the_invalid_fields(client: TestClient) -> None:
    response = client.get("/typed/abc")

    assert response.status_code == 422
    assert response.json()["error"] == {
        "code": "validation_error",
        "message": "Invalid request. Check: number.",
    }
