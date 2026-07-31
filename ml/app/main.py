from __future__ import annotations

import asyncio
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel, Field

from app.embed_batch import embed_urls
from app.face import FaceEngine, NoFaceDetectedError
from app.sentry import init_sentry

CORRELATION_HEADER = "X-Correlation-Id"
REFERENCE_FETCH_TIMEOUT_S = 10.0
MAX_BATCH_URLS = 1000

init_sentry()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Load the face model at startup.

    The engine is otherwise lazy, which makes whoever sends the first request pay a
    multi-second model load — in practice an invigilator mid-scan.
    """
    await asyncio.to_thread(FaceEngine.get().warm_up)
    yield


app = FastAPI(title="KEV ML Service", version="0.1.0", lifespan=lifespan)


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


class EmbedBatchRequest(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=MAX_BATCH_URLS)
    concurrency: int = Field(default=16, ge=1, le=64)


class EmbedBatchItem(BaseModel):
    url: str
    embedding: list[float] | None = None
    det_score: float | None = None
    # Embeddings from different models are not comparable, so a stored vector is
    # only meaningful alongside the model that produced it.
    model_version: str | None = None
    error: str | None = None


class EmbedBatchResponse(BaseModel):
    results: list[EmbedBatchItem]


@app.post("/embed-faces", response_model=EmbedBatchResponse)
async def embed_faces(engine: EngineDep, request: EmbedBatchRequest) -> EmbedBatchResponse:
    """Embed many reference photos by URL in one call.

    The caller's link to the photo host is high-latency, so fetching fans out here
    rather than costing the backend one round trip per student. Per-URL failures are
    reported inline instead of failing the batch — one unusable photo should not
    block a whole roster from being enrolled.
    """
    items = await embed_urls(engine, request.urls, request.concurrency)
    return EmbedBatchResponse(
        results=[
            EmbedBatchItem(
                url=item.url,
                embedding=item.embedding,
                det_score=item.det_score,
                model_version=engine.model_version if item.embedding is not None else None,
                error=item.error,
            )
            for item in items
        ]
    )


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
