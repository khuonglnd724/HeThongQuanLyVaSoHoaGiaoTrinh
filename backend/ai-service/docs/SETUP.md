# SETUP GUIDE - AI SERVICE

**Phiên bản:** 1.0 | **OS:** Windows/Linux/Mac | **Python:** 3.9+

---

## 🚀 BƯỚC 1: ENVIRONMENT SETUP (5 phút)

### 1.1 Python Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend/ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux/Mac (Bash):**
```bash
cd backend/ai-service
python3 -m venv venv
source venv/bin/activate
```

### 1.2 Install Dependencies

```bash
# Inside virtual environment
pip install -r requirements.txt

# Verify installation
pip list | grep groq
pip list | grep chromadb
```

### 1.3 Environment Variables

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY = "gsk_your_api_key_here"
$env:GROQ_MODEL = "llama-3.3-70b-versatile"
$env:GROQ_TEMPERATURE = "0.7"
$env:GROQ_MAX_TOKENS = "2000"
$env:DATABASE_URL = "postgresql://postgres:123456@localhost:5432/ai_service_db"
$env:RABBITMQ_HOST = "rabbitmq"
$env:REDIS_HOST = "redis"
$env:KAFKA_BOOTSTRAP_SERVERS = "kafka:29092"
```

**Linux/Mac (Bash):**
```bash
export GROQ_API_KEY="gsk_your_api_key_here"
export GROQ_MODEL="llama-3.3-70b-versatile"
export GROQ_TEMPERATURE="0.7"
export GROQ_MAX_TOKENS="2000"
export DATABASE_URL="postgresql://postgres:123456@localhost:5432/ai_service_db"
export RABBITMQ_HOST="rabbitmq"
export REDIS_HOST="redis"
export KAFKA_BOOTSTRAP_SERVERS="kafka:29092"
```

**Verify:**
```bash
echo $GROQ_API_KEY
```

---

## 🐳 BƯỚC 2: INFRASTRUCTURE SETUP (2 phút)

### 2.1 Start Docker Services

```bash
# From project root
cd docker
docker-compose up -d

# Verify
docker-compose ps
```

**Services started:**
- PostgreSQL (5432)
- Redis (6379)
- RabbitMQ (5672/15672)
- Kafka (9092)
- Zookeeper (2181)
- Prometheus (9090)
- Grafana (3000)
- Loki (3100)

### 2.2 Verify Database

```bash
# Wait ~10 seconds for PostgreSQL to be ready
sleep 10

# Connect to database
psql -U postgres -h localhost -d ai_service_db

# Should show tables:
\dt
```

### 2.3 Verify Message Broker

```bash
# Check RabbitMQ
docker logs rabbitmq

# Access web UI
# http://localhost:15672
# Default: guest/guest
```

---

## 🤖 BƯỚC 3: AI SERVICE STARTUP (2 phút)

### 3.1 Terminal 1 - FastAPI Server

```bash
cd backend/ai-service

# Activate venv if not already
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\Activate.ps1  # Windows

# Start FastAPI
python -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload

# Output should show:
# Uvicorn running on http://0.0.0.0:8000
```

### 3.2 Terminal 2 - Celery Worker

```bash
cd backend/ai-service

# Activate venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\Activate.ps1  # Windows

# Start Celery
celery -A app.workers.celery_app worker \
  --loglevel=info \
  --concurrency=4

# Output should show:
# Connected to amqp://guest:***@rabbitmq:5672//
# [tasks] Ready to accept tasks
```

### 3.3 Terminal 3 - Celery Flower (Optional - Task Monitoring)

```bash
cd backend/ai-service

# Activate venv
source venv/bin/activate

# Start Flower
celery -A app.workers.celery_app flower \
  --port=5555

# Access: http://localhost:5555
```

---

## ✅ BƯỚC 4: VERIFICATION (2 phút)

### 4.1 Health Check

```bash
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "message": "AI Service is running",
#   "timestamp": "2025-12-29T10:30:00Z"
# }
```

### 4.2 API Documentation

**Open browser:**
```
http://localhost:8000/docs
```

### 4.3 Metrics

```bash
curl http://localhost:8000/metrics

# Or in browser:
# http://localhost:9090 (Prometheus)
# http://localhost:3000 (Grafana)
```

### 4.4 Test API Endpoint

```bash
# Create sample token for testing (use 'test' as placeholder)
TOKEN="test"

# Call suggest endpoint
curl -X POST http://localhost:8000/api/ai/suggest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "syllabusId": "syll456",
    "content": "Introduction to Python Programming Course",
    "focusArea": "assessment"
  }'

# Expected: 202 Accepted with jobId
```

---

## 🧪 BƯỚC 5: RUN TESTS (1 phút)

```bash
cd backend/ai-service

# Run all tests
pytest test/ -v

# Run specific test
pytest test/test_ai_service.py::TestAIClient -v

# With coverage
pytest test/ --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

---

## 📊 BƯỚC 6: MONITORING (Optional)

### 6.1 Prometheus

```
http://localhost:9090
```

**Example Queries:**
```promql
# Task completion rate
rate(ai_task_total{status="succeeded"}[5m])

# Average task duration
rate(ai_task_duration_seconds_sum[5m]) / rate(ai_task_duration_seconds_count[5m])

# Groq tokens per minute
rate(groq_tokens_total[1m])

# Error rate
rate(errors_total[5m])
```

### 6.2 Grafana

```
http://localhost:3000
# Default: admin/admin
```

### 6.3 Flower (Task Queue)

```
http://localhost:5555
```

---

## ⚠️ TROUBLESHOOTING

### Issue: Port Already in Use

```bash
# Find process
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
sleep 10
```

### Issue: RabbitMQ Connection Failed

```bash
# Check RabbitMQ
docker ps | grep rabbitmq

# Restart
docker-compose restart rabbitmq

# Check logs
docker logs rabbitmq
```

### Issue: GROQ_API_KEY Not Set

```bash
# Check variable is set
echo $GROQ_API_KEY  # Linux/Mac
echo %GROQ_API_KEY%  # Windows CMD
$env:GROQ_API_KEY  # Windows PowerShell

# If empty, set again
export GROQ_API_KEY="gsk_..."
```

### Issue: Python Module Not Found

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check installation
python -c "import groq; print(groq.__version__)"
```

### Issue: Celery Worker Not Connecting

```bash
# Check RabbitMQ is running and accessible
docker logs rabbitmq

# Check connection string
env | grep RABBITMQ

# Restart Celery
# Stop the celery process (Ctrl+C)
# Restart with same command
```

---

## 📋 QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `python -m venv venv` | Create virtual env |
| `source venv/bin/activate` | Activate venv (Linux/Mac) |
| `.\venv\Scripts\Activate.ps1` | Activate venv (Windows) |
| `pip install -r requirements.txt` | Install dependencies |
| `python -m uvicorn app.main:app --port 8000` | Start FastAPI |
| `celery -A app.workers.celery_app worker --loglevel=info` | Start Celery |
| `pytest test/ -v` | Run tests |
| `docker-compose up -d` | Start infrastructure |
| `docker-compose ps` | View running services |
| `docker-compose logs -f` | View logs |

---

## ✅ SETUP CHECKLIST

- [ ] Python 3.9+ installed
- [ ] Virtual environment created & activated
- [ ] Dependencies installed: `pip list | wc -l` shows 30+
- [ ] GROQ_API_KEY environment variable set
- [ ] All database env vars set
- [ ] Docker services running: `docker-compose ps` all green
- [ ] FastAPI running on port 8000
- [ ] Celery workers running
- [ ] Health check passing
- [ ] Tests passing: `pytest test/ -v`
- [ ] Can view API docs: http://localhost:8000/docs

---

## 🎯 NEXT STEPS

1. **Read Documentation:**
   - [README.md](README.md) - Overview
   - [IMPLEMENTATION.md](IMPLEMENTATION.md) - How it works
   - [API.md](API.md) - API reference

2. **Test Features:**
   - Try API endpoints via Swagger UI
   - Run pytest suite
   - Monitor with Prometheus

3. **Deploy:**
   - Configure for production
   - Set up CI/CD pipeline
   - Deploy to cloud

---

**Last Updated:** 29/12/2025  
**Status:** ✅ Ready for Testing
