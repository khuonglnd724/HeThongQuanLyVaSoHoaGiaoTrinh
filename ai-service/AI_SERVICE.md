# AI Service - Syllabus Management System

FastAPI-based AI service handling async tasks for syllabus management.

## Architecture

- **FastAPI**: REST API endpoints
- **Celery**: Task queue for async processing
- **RabbitMQ**: Message broker for Celery
- **Redis**: Backend for Celery results
- **Kafka**: Event publishing for notifications

## Features

1. **AI Suggest** - Generate suggestions for syllabus content
2. **AI Chat** - Interactive assistant for syllabus queries
3. **Diff Detection** - Compare syllabus versions
4. **CLO-PLO Check** - Validate learning outcome mappings
5. **Summary** - Generate content summaries

## API Endpoints

### Submit Tasks (All return 202 with jobId)
- `POST /ai/suggest` - Create suggestion task
- `POST /ai/chat` - Create chat task
- `POST /ai/diff` - Create diff detection task
- `POST /ai/clo-check` - Create CLO-PLO check task
- `POST /ai/summary` - Create summary task

### Job Management
- `GET /ai/jobs/{jobId}` - Get job status and result
- `POST /ai/jobs/{jobId}/cancel` - Cancel a job

### Health
- `GET /health` - Service health check

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### 3. Run API Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Run Celery Worker
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

## Running the AI Service

### 🚀 One-Click Startup (Recommended)

**Windows (PowerShell):**
```powershell
cd ai-service
# Allow script execution temporarily
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Run startup script (opens API + Worker in new windows + browser)
.\startup-all.ps1
```

**Windows (CMD):**
```cmd
startup-all.bat
```

**Linux/Mac:**
```bash
chmod +x startup-all.sh
./startup-all.sh
```

This will automatically:
- ✅ Check Docker is running
- ✅ Start RabbitMQ, Redis, Kafka, Zookeeper
- ✅ Start FastAPI server (port 8000)
- ✅ Start Celery worker
- ✅ Open browser to Swagger UI
- ✅ Display all access points

### Prerequisites
- Python 3.11+
- Docker Desktop (for RabbitMQ, Redis, Kafka)
- Virtual environment configured

### Manual Setup (3 Terminal Windows)

**Terminal 1: Start Infrastructure**
```powershell
cd ai-service
docker-compose up -d
```

Wait ~30 seconds for all services to start. Verify:
```powershell
docker-compose ps
```

**Terminal 2: Start API Server**
```powershell
cd ai-service
# Activate venv (if not already)
.\..\..\.venv\Scripts\Activate.ps1

# Run API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Terminal 3: Start Celery Worker**
```powershell
cd ai-service
# Activate venv (if not already)
.\..\..\.venv\Scripts\Activate.ps1

# Run worker
celery -A app.workers.celery_app worker --loglevel=info --pool=solo
```

You should see:
```
celery@<hostname> v5.3.4 (emerald-sea)
---- **** ----- Connected to amqp://guest:**@localhost:5672//
```

### Access Points

Once all three components are running:

1. **API Documentation (Swagger UI)**: http://localhost:8000/docs
2. **RabbitMQ Management**: http://localhost:15672 (guest/guest)
3. **Kafka UI**: http://localhost:8080
4. **Redis**: localhost:6379

### Testing

1. Open http://localhost:8000/docs
2. Try `/health` endpoint (should return 200 OK)
3. Try POST `/ai/suggest`:
   ```json
   {
     "syllabusId": "test-123",
     "section": "objectives",
     "textDraft": "Sample content"
   }
   ```
4. Copy returned `jobId`
5. GET `/ai/jobs/{jobId}` immediately → should show status: "queued"
6. Wait 2-3 seconds and GET again → should show status: "succeeded" with results

### Troubleshooting

**Worker can't connect to RabbitMQ:**
```powershell
docker-compose logs rabbitmq
docker-compose restart rabbitmq
```

**Kafka connection issues:**
```powershell
docker-compose logs kafka
# Kafka takes ~30s to start, wait and try again
```

**Port already in use:**
Edit `docker-compose.yml` to change port mappings (e.g., `5673:5672` for RabbitMQ).

**PowerShell execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Then run start-worker.ps1 or API command.

### Stop Services

To stop everything:
```powershell
# Stop worker and API (Ctrl+C in each terminal)

# Stop docker services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

## Docker Setup (Complete)

Contains:
- **FastAPI** - REST API server (runs locally)
- **Celery Worker** - Task processor (runs locally)
- **RabbitMQ** - Message broker (Docker)
- **Redis** - Result backend (Docker)
- **Kafka** - Event streaming (Docker)
- **Zookeeper** - Kafka coordination (Docker)
- **Kafka UI** - Kafka monitoring (Docker)

## Development

### Project Structure
```
app/
├── main.py              # FastAPI app
├── deps.py              # Dependencies & settings
├── schemas/             # Pydantic models
│   ├── jobs.py
│   ├── suggest.py
│   ├── chat.py
│   ├── diff.py
│   ├── clo_check.py
│   └── summary.py
├── routers/             # API endpoints
│   ├── health.py
│   ├── jobs.py
│   ├── suggest.py
│   ├── chat.py
│   ├── diff.py
│   ├── clo_check.py
│   └── summary.py
└── workers/             # Celery tasks
    ├── celery_app.py
    └── tasks.py
```

## Testing

Access interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Event Publishing

When tasks complete, events are published to Kafka topic `ai-events`:
```json
{
  "event": "AI_TASK_COMPLETED",
  "jobId": "uuid",
  "taskType": "suggest|chat|diff|clo_check|summary",
  "status": "succeeded|failed",
  "userId": "optional",
  "syllabusId": "optional",
  "timestamp": 1234567890
}
```

Notification service consumes these events for real-time updates.
