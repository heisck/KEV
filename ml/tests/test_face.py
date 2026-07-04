import os

import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.face import Embedding, FaceEngine, NoFaceDetectedError, VerifyResult, cosine_similarity
from app.main import app, get_engine


class FakeEngine:
    def __init__(self, *, similarity: float = 0.9, face: bool = True) -> None:
        self._similarity = similarity
        self._face = face

    def embed(self, image_bytes: bytes) -> Embedding:
        if not self._face:
            raise NoFaceDetectedError("No face detected")
        return Embedding(vector=[0.1, 0.2, 0.3], det_score=0.98)

    def verify(self, probe_bytes: bytes, reference_bytes: bytes) -> VerifyResult:
        if not self._face:
            raise NoFaceDetectedError("No face detected")
        return VerifyResult(
            similarity=self._similarity, match=self._similarity >= 0.35, threshold=0.35
        )


@pytest.fixture(autouse=True)
def _reset_overrides() -> None:
    app.dependency_overrides.clear()


def _use(engine: FakeEngine) -> TestClient:
    app.dependency_overrides[get_engine] = lambda: engine
    return TestClient(app)


def test_cosine_similarity_identical_vectors() -> None:
    v = np.array([0.5, 0.5, 0.5])
    assert cosine_similarity(v, v) == pytest.approx(1.0)


def test_cosine_similarity_orthogonal_vectors() -> None:
    assert cosine_similarity(np.array([1.0, 0.0]), np.array([0.0, 1.0])) == pytest.approx(0.0)


def test_cosine_similarity_zero_vector_is_zero() -> None:
    assert cosine_similarity(np.zeros(3), np.array([1.0, 2.0, 3.0])) == 0.0


def test_embed_face_returns_embedding() -> None:
    client = _use(FakeEngine())
    response = client.post("/embed-face", files={"image": ("probe.jpg", b"fake-bytes")})
    assert response.status_code == 200
    body = response.json()
    assert body["embedding"] == [0.1, 0.2, 0.3]
    assert body["det_score"] == pytest.approx(0.98)


def test_embed_face_422_when_no_face() -> None:
    client = _use(FakeEngine(face=False))
    response = client.post("/embed-face", files={"image": ("probe.jpg", b"fake-bytes")})
    assert response.status_code == 422


def test_verify_face_502_when_reference_unreachable() -> None:
    client = _use(FakeEngine())
    response = client.post(
        "/verify-face",
        files={"probe": ("probe.jpg", b"fake-bytes")},
        data={"reference_url": "http://127.0.0.1:9/nope.jpg"},
    )
    assert response.status_code == 502


@pytest.mark.skipif(
    os.environ.get("KEV_ML_REAL_MODEL") != "1",
    reason="Set KEV_ML_REAL_MODEL=1 to run the real buffalo_sc model",
)
def test_real_model_loads() -> None:
    engine = FaceEngine.get()
    assert engine is not None
