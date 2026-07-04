from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "kev-ml"


def test_health_sets_correlation_id() -> None:
    response = client.get("/health")
    assert response.headers.get("X-Correlation-Id")


def test_embed_face_requires_image_file() -> None:
    response = client.post("/embed-face")
    assert response.status_code == 422
