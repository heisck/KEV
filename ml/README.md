# KEV ML Service

FastAPI service that will host the Hugging Face **face models** used by KEV. This is a
**scaffold + stub** — the real model wiring lands in the build phase.

## Stack
- Python 3.12 (pinned via `.python-version`, managed by **uv**)
- FastAPI + Uvicorn
- `huggingface-hub` for model access (gated by `HF_TOKEN`)
- Sentry for error tracing; propagates the `X-Correlation-Id` header

## Develop
```bash
uv sync                 # creates .venv with Python 3.12 + deps
uv run uvicorn app.main:app --reload --port 8000
# or from the repo root: npm run dev:ml
```

> Env comes from the **single root `.env`** (loaded by `scripts/run-ml.mjs`) — no `ml/.env` needed.
> An optional `ml/.env` overrides the root file if present.

## Test / lint / typecheck
```bash
uv run pytest
uv run ruff check .
uv run mypy app
```

## Endpoints
- `GET /health` — liveness.
- `POST /embed-face` — **stub** (returns 501 until `HF_TOKEN` + `HF_FACE_MODEL_ID` are set and the model is wired).

## Adding the real model (build phase)
```bash
uv add transformers torch      # heavy; intentionally excluded from the scaffold
```
Alternative with no local GPU/infra: call the **Hugging Face Inference API** instead of loading the model in-process.
