from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel

from app.face import FaceEngine, NoFaceDetectedError
from app.sentry import init_sentry

CORRELATION_HEADER = "X-Correlation-Id"
REFERENCE_FETCH_TIMEOUT_S = 10.0

init_sentry()

app = FastAPI(title="KEV ML Service", version="0.1.0")


@app.middleware("http")
async def correlation_id_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Echo/propagate the cross-service correlation id (frontend → backend → ml)."""
    correlation_id = request.headers.get(CORRELATION_HEADER) or str(uuid.uuid4())
    response = await call_next(request)
    response.headers[CORRELATION_HEADER] = correlation_id
    return response


def get_engine() -> FaceEngine:
    return FaceEngine.get()


EngineDep = Annotated[FaceEngine, Depends(get_engine)]


class Health(BaseModel):
    status: str
    service: str


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", service="kev-ml")


class EmbedFaceResponse(BaseModel):
    embedding: list[float]
    det_score: float


@app.post("/embed-face", response_model=EmbedFaceResponse)
async def embed_face(engine: EngineDep, image: Annotated[UploadFile, File()]) -> EmbedFaceResponse:
    """Detect the largest face and return its normalized embedding."""
    payload = await image.read()
    try:
        result = engine.embed(payload)
    except NoFaceDetectedError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return EmbedFaceResponse(embedding=result.vector, det_score=result.det_score)


class VerifyFaceResponse(BaseModel):
    similarity: float
    match: bool
    threshold: float


@app.post("/verify-face", response_model=VerifyFaceResponse)
async def verify_face(
    engine: EngineDep,
    probe: Annotated[UploadFile, File()],
    reference_url: Annotated[str, Form()],
) -> VerifyFaceResponse:
    """Compare a captured probe image against the student's directory photo URL."""
    probe_bytes = await probe.read()
    try:
        async with httpx.AsyncClient(
            timeout=REFERENCE_FETCH_TIMEOUT_S, follow_redirects=True
        ) as client:
            reference = await client.get(reference_url)
            reference.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch reference photo: {e}") from e
    try:
        result = engine.verify(probe_bytes, reference.content)
    except NoFaceDetectedError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return VerifyFaceResponse(
        similarity=result.similarity, match=result.match, threshold=result.threshold
    )
