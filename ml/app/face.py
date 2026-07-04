from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from typing import Any

import numpy as np

from app.config import settings


@dataclass(frozen=True)
class Embedding:
    vector: list[float]
    det_score: float


@dataclass(frozen=True)
class VerifyResult:
    similarity: float
    match: bool
    threshold: float


class NoFaceDetectedError(Exception):
    """Raised when no face is found in an image."""


class FaceEngine:
    """InsightFace buffalo_sc (SCRFD detect + lightweight ArcFace embed), CPU only.

    The model (~30 MB) downloads to ~/.insightface on first use, so loading is
    lazy and the singleton is shared across requests.
    """

    _instance: FaceEngine | None = None
    _lock = Lock()

    def __init__(self, model_name: str, threshold: float) -> None:
        self._model_name = model_name
        self._threshold = threshold
        self._analyzer: Any = None

    @classmethod
    def get(cls) -> FaceEngine:
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls(settings.face_model_name, settings.face_match_threshold)
            return cls._instance

    def _app(self) -> Any:
        if self._analyzer is None:
            from insightface.app import FaceAnalysis

            analyzer = FaceAnalysis(name=self._model_name, providers=["CPUExecutionProvider"])
            analyzer.prepare(ctx_id=-1, det_size=(640, 640))
            self._analyzer = analyzer
        return self._analyzer

    def _largest_face(self, image_bytes: bytes) -> Any:
        import cv2

        buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
        if image is None:
            raise NoFaceDetectedError("Could not decode image")
        faces = self._app().get(image)
        if not faces:
            raise NoFaceDetectedError("No face detected")
        return max(faces, key=lambda f: float((f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])))

    def embed(self, image_bytes: bytes) -> Embedding:
        face = self._largest_face(image_bytes)
        vector = np.asarray(face.normed_embedding, dtype=np.float64)
        return Embedding(vector=vector.tolist(), det_score=float(face.det_score))

    def verify(self, probe_bytes: bytes, reference_bytes: bytes) -> VerifyResult:
        probe = np.asarray(self._largest_face(probe_bytes).normed_embedding, dtype=np.float64)
        reference = np.asarray(
            self._largest_face(reference_bytes).normed_embedding, dtype=np.float64
        )
        similarity = cosine_similarity(probe, reference)
        return VerifyResult(
            similarity=similarity, match=similarity >= self._threshold, threshold=self._threshold
        )


def cosine_similarity(a: np.ndarray[Any, Any], b: np.ndarray[Any, Any]) -> float:
    denominator = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denominator == 0.0:
        return 0.0
    return float(np.dot(a, b) / denominator)
