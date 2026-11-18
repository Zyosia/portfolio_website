from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import make_settings


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_every_response_carries_a_request_id(client: TestClient) -> None:
    response = client.get("/api/health")

    assert len(response.headers["X-Request-ID"]) == 32


def test_a_valid_upstream_request_id_is_propagated(client: TestClient) -> None:
    response = client.get("/api/health", headers={"X-Request-ID": "abc-123"})

    assert response.headers["X-Request-ID"] == "abc-123"


def test_an_unsafe_upstream_request_id_is_replaced(client: TestClient) -> None:
    response = client.get("/api/health", headers={"X-Request-ID": "bad id\twith spaces"})

    assert response.headers["X-Request-ID"] != "bad id\twith spaces"


def test_docs_are_served_in_development() -> None:
    app = create_app(make_settings(app_env="development"))
    with TestClient(app) as client:
        assert client.get("/api/docs").status_code == 200
        assert client.get("/api/openapi.json").status_code == 200


def test_docs_are_hidden_in_production() -> None:
    app = create_app(make_settings(app_env="production"))
    with TestClient(app) as client:
        assert client.get("/api/docs").status_code == 404
        assert client.get("/api/openapi.json").status_code == 404
