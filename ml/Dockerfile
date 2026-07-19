# syntax=docker/dockerfile:1
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    INSIGHTFACE_HOME=/app/.insightface \
    PORT=8000

# Install system libraries needed by opencv-python-headless / onnxruntime if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libglib2.0-0 curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching.
COPY pyproject.toml ./
RUN uv sync --no-dev

COPY app ./app

# Pre-download and bake the buffalo_sc face verification model (~30MB) during docker build
# so cold starts and live verification requests execute instantly with zero download latency.
RUN uv run --no-dev python -c "from app.face import FaceEngine; FaceEngine.get()._app(); print('Successfully pre-cached buffalo_sc model.')" && \
    chmod -R 777 /app/.insightface

EXPOSE 8000 7860
CMD ["sh", "-c", "uv run --no-dev uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
