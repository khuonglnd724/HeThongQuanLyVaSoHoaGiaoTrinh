# Docker Setup Guide - AI Service Infrastructure

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

## Quick Start

### 1. Start Infrastructure Services

```bash
# Navigate to ai-service directory
cd ai-service

# Start all services (RabbitMQ, Redis, Kafka, Zookeeper)
docker-compose up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Verify Services

**RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

**Kafka UI:**
- URL: http://localhost:8080

**Redis:**
- Port: 6379 (no UI, use redis-cli or RedisInsight)

### 3. Start Celery Worker

**Windows (PowerShell):**
```powershell
.\start-worker.ps1
```

**Linux/Mac:**
```bash
chmod +x start-worker.sh
./start-worker.sh
```

**Or manually:**
```bash
# Activate virtual environment first
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate      # Linux/Mac

# Start worker
cd ai-service
celery -A app.workers.celery_app worker --loglevel=info --pool=solo
```

### 4. Test the System

1. **Start API Server** (if not already running):
   ```bash
   cd ai-service
   uvicorn app.main:app --reload
   ```

2. **Open Swagger UI**: http://localhost:8000/docs

3. **Test workflow**:
   - POST `/ai/suggest` with payload:
     ```json
     {
       "syllabusId": "test-123",
       "section": "objectives",
       "textDraft": "Sample syllabus content"
     }
     ```
   - Copy the returned `jobId`
   - GET `/ai/jobs/{jobId}` to check status
   - Wait ~2-3 seconds
   - GET again to see result with suggestions

## Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| RabbitMQ AMQP | 5672 | Celery message broker |
| RabbitMQ Management | 15672 | Web UI for RabbitMQ |
| Redis | 6379 | Celery result backend |
| Kafka | 9092 | Event streaming (external) |
| Kafka Internal | 29092 | Event streaming (inter-container) |
| Zookeeper | 2181 | Kafka coordination |
| Kafka UI | 8080 | Kafka monitoring UI |

## Common Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart a specific service
docker-compose restart rabbitmq

# View logs for specific service
docker-compose logs -f kafka

# Check service health
docker-compose ps
docker inspect smd-rabbitmq --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Worker can't connect to RabbitMQ

Check RabbitMQ is running:
```bash
docker-compose ps rabbitmq
docker-compose logs rabbitmq
```

### Kafka connection issues

Kafka takes ~30 seconds to fully start. Check:
```bash
docker-compose logs kafka
```

### Port conflicts

If ports are already in use, edit `docker-compose.yml` to change port mappings.

### Worker errors on Windows

Use `--pool=solo` flag:
```bash
celery -A app.workers.celery_app worker --loglevel=info --pool=solo
```

## Production Notes

For production deployment:
1. Change default passwords in `docker-compose.yml`
2. Set proper resource limits
3. Use external volumes for persistence
4. Configure Kafka replication factor > 1
5. Set up monitoring (Prometheus/Grafana)
6. Use Docker secrets for sensitive data
