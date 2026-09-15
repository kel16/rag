# syntax=docker/dockerfile:1

# ---- Builder stage ---------------------------------------------------
# Installs dependencies into a venv. Kept separate from the runtime stage
# so pip caches, apt build tools, etc. never end up in the final image.
FROM python:3.13-slim AS builder

WORKDIR /app

# build-essential is only needed if a wheel isn't prebuilt for this
# platform/Python version; harmless to keep, it doesn't ship in the
# runtime stage below.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

# install the CPU-only build of torch to save space and time.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# ---- Runtime stage -----------------------------------------------------
FROM python:3.13-slim AS runtime

RUN useradd --create-home --uid 1000 appuser
WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    DOCS_PATH=/app/documents

COPY app ./app

# documents/ and db/ are meant to be mounted as volumes
# so indexed PDFs and the Chroma index survive container rebuilds
# instead of being baked into the image.
RUN mkdir -p /app/documents /app/db /home/appuser/.cache/huggingface \
    && chown -R appuser:appuser /app /home/appuser/.cache

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000"]
