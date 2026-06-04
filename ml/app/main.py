from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel

from app.config import settings
from app.sentry import init_sentry

CORRELATION_HEADER = "X-Correlation-Id"

init_sentry()

app = FastAPI(title="KEV ML Service", version="0.0.1")


@app.middleware("http")
async def correlation_id_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Echo/propagate the cross-service correlation id (frontend → backend → ml)."""
    correlation_id = request.headers.get(CORRELATION_HEADER) or str(uuid.uuid4())
    response = await call_next(request)
    response.headers[CORRELATION_HEADER] = correlation_id
    return response


class Health(BaseModel):
    status: str
    service: str


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", service="kev-ml")


class EmbedFaceRequest(BaseModel):
    image_base64: str


@app.post("/embed-face")
def embed_face(_: EmbedFaceRequest) -> dict[str, str]:
    """Stub. The real Hugging Face face-embedding model is wired in the build phase."""
    if not settings.hf_token or not settings.hf_face_model_id:
        raise HTTPException(
            status_code=501,
            detail="Face model not configured (set HF_TOKEN and HF_FACE_MODEL_ID).",
        )
    raise HTTPException(status_code=501, detail="Face embedding not yet implemented.")
