from __future__ import annotations

import asyncio
from dataclasses import dataclass

import httpx

from app.face import FaceEngine, NoFaceDetectedError

FETCH_TIMEOUT_S = 20.0


@dataclass(frozen=True)
class BatchItem:
    """One reference photo's embedding, or the reason it could not be produced."""

    url: str
    embedding: list[float] | None
    det_score: float | None
    error: str | None


async def _fetch(client: httpx.AsyncClient, url: str, gate: asyncio.Semaphore) -> bytes | None:
    async with gate:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.content
        except httpx.HTTPError:
            return None


async def embed_urls(engine: FaceEngine, urls: list[str], concurrency: int) -> list[BatchItem]:
    """Fetch reference photos concurrently, then embed them.

    Fetching is network-bound against a high-latency host, so it fans out. Inference
    is CPU-bound and holds the GIL, so it runs sequentially in a worker thread —
    parallelising it would only add contention on a CPU-only ONNX runtime.
    """
    gate = asyncio.Semaphore(max(1, concurrency))
    async with httpx.AsyncClient(timeout=FETCH_TIMEOUT_S, follow_redirects=True) as client:
        payloads = await asyncio.gather(*(_fetch(client, url, gate) for url in urls))

    def embed_all() -> list[BatchItem]:
        items: list[BatchItem] = []
        for url, payload in zip(urls, payloads, strict=True):
            if payload is None:
                items.append(BatchItem(url, None, None, "Could not fetch reference photo"))
                continue
            try:
                result = engine.embed(payload)
                items.append(BatchItem(url, result.vector, result.det_score, None))
            except NoFaceDetectedError as e:
                items.append(BatchItem(url, None, None, str(e)))
        return items

    return await asyncio.to_thread(embed_all)
