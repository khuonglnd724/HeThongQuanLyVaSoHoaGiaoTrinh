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
6. **Suggest Similar CLOs** - Find similar CLOs based on current CLO description

## API Endpoints

### Web UI
- `GET /` - Web interface for interacting with AI service
  - Interactive forms for all endpoints
  - Real-time job status polling
  - Result display with JSON formatting

### Submit Tasks (All return 202 with jobId)
- `POST /ai/suggest` - Create suggestion task
- `POST /ai/chat` - Create chat task
- `POST /ai/diff` - Create diff detection task
- `POST /ai/clo-check` - Create CLO-PLO check task
- `POST /ai/summary` - Create summary task
- `POST /ai/suggest-similar-clos` - Find similar CLOs based on current CLO

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

**Step 1: Start Infrastructure (Root Docker Compose)**
```powershell
# From root workspace directory
docker-compose up -d
```

This starts:
- PostgreSQL, RabbitMQ, Redis, Kafka, Zookeeper, Kafka UI
- All Spring Boot services
- AI Service container + Worker container

**Verify infrastructure is running:**
```powershell
docker-compose ps
```

**Step 2: Start API + Worker Locally (Development)**

Windows (PowerShell):
```powershell
cd ai-service
# Allow script execution temporarily
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Run startup script (opens API + Worker in new windows)
.\startup-all.ps1
```

Windows (CMD):
```cmd
cd ai-service
startup-all.bat
```

Linux/Mac:
```bash
cd ai-service
chmod +x startup-all.sh
./startup-all.sh
```

This will automatically:
- ✅ Check RabbitMQ, Redis, Kafka are running
- ✅ Start FastAPI server (port 8000)
- ✅ Start Celery worker
- ✅ Display all access points

### 📱 Access Web UI

Open browser: **http://localhost:8000**

Features:
- Interactive forms for all API endpoints
- Real-time job status polling
- JSON result formatting
- Tab navigation for easy switching

See [UI_README.md](UI_README.md) for detailed UI documentation.

### Manual Setup

If you prefer running without startup script:

**Terminal 1: API Server**
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2: Celery Worker**
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

### Prerequisites
- Python 3.11+
- Docker Desktop (for RabbitMQ, Redis, Kafka)
- Virtual environment configured

### Manual Setup (2 Terminal Windows)

**Prerequisite: Infrastructure Running**
Ensure from project root:
```powershell
docker-compose ps | Select-String "smd-rabbitmq|smd-redis|smd-kafka"
```
Should show all 3 containers running.

**Terminal 1: Start API Server**
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

**Terminal 2: Start Celery Worker**
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

Once all components are running:

1. **🌐 Web UI (Recommended)**: http://localhost:8000
   - Interactive interface for all endpoints
   - Easy job status tracking
   - JSON result display

2. **📚 API Documentation (Swagger)**: http://localhost:8000/docs
   - Full API exploration
   - Interactive request testing
   
3. **🐰 RabbitMQ Management**: http://localhost:15672 (guest/guest)
   - Message queue monitoring
   - Task queue visualization

4. **🔍 Kafka UI**: http://localhost:8089
   - Event stream monitoring
   - Topic inspection

5. **💾 Redis**: localhost:6379
   - Result cache storage

### Testing

**Option 1: Use Web UI (Recommended)**
1. Open http://localhost:8000
2. Fill in any form (e.g., "Gợi Ý")
3. Enter syllabus ID: "sys-001"
4. Click submit button
5. Watch status update in real-time
6. View results in JSON format

**Option 2: Use Swagger UI**
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

**Web UI not loading**
- Check API server running: `http://localhost:8000/api`
- Check console (F12) for JavaScript errors
- Clear browser cache: Ctrl+Shift+Delete

**Worker can't connect to RabbitMQ:**
```powershell
# From project root
docker-compose logs rabbitmq
docker-compose restart rabbitmq
```

**Kafka connection issues:**
```powershell
# From project root
docker-compose logs kafka
# Kafka takes ~30s to start, wait and try again
```
root 
**Port already in use:**
Edit `docker-compose.yml` to change port mappings (e.g., `5673:5672` for RabbitMQ).

**PowerShell execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Then run start-worker.ps1 or API command.

### StopAI service:
```powershell
# Stop worker and API (Ctrl+C in each terminal, or close windows)
```

To stop infrastructure (from project root):
```powershell
cd ..(Ctrl+C in each terminal)

# Stop docker services
docker-compose down

# Remove volumes (clean slate)
docker-compose 

Infrastructure containers (from project root `docker-compose.yml`):
- **RabbitMQ** (smd-rabbitmq) - Message broker (port 5672, UI 15672)
- **Redis** (smd-redis) - Result backend (port 6379)
- **Kafka** (smd-kafka) - Event streaming (port 9092)
- **Zookeeper** (smd-zookeeper) - Kafka coordination (port 2181)
- **Kafka UI** (smd-kafka-ui) - Kafka monitoring (port 8089)

AI Service components (can run locally or in Docker):
- **FastAPI** (ai-service) - REST API server (port 8000)
- **Celery Worker** (ai-worker) - Task processor

**Run AI in Docker (from project root):**
```powershell
docker-compose up -d ai-service ai-worker
```

**Run AI locally (current default):**
Use startup scripts in `ai-service/` directory.
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
