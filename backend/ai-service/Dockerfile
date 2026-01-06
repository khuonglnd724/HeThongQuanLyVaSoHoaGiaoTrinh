# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements to --user directory
COPY requirements.txt .

# Use CPU-only PyTorch wheels to avoid huge CUDA/CUDNN downloads
ENV PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu

# Pre-install torch CPU, then remaining deps
RUN pip install --user --no-cache-dir torch==2.1.2+cpu --extra-index-url https://download.pytorch.org/whl/cpu \
 && pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime (minimal)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/root/.local/bin:$PATH \
    PYTHONPATH=/app

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY app ./app

# Environment defaults (override via docker-compose)
ENV RABBITMQ_HOST=rabbitmq \
    RABBITMQ_PORT=5672 \
    RABBITMQ_USER=guest \
    RABBITMQ_PASS=guest \
    RABBITMQ_VHOST=/ \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_DB=0 \
    KAFKA_BOOTSTRAP_SERVERS=kafka:29092 \
    KAFKA_TOPIC_AI_EVENTS=ai-events \
    DATABASE_URL=postgresql://postgres:123456@postgres:5432/ai_service_db

# Expose API port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
