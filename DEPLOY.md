# SMD Microservices – Deployment Guide

This guide helps your team build and run the full stack locally with Docker Compose.

## Prerequisites
- Docker Desktop (Windows/macOS/Linux)
- PowerShell 5+ (Windows)
- JDK 21 (recommended; auth-service requires JDK 17 minimum)
- Maven is **optional** (project includes Maven Wrapper in each service)
- **Groq API Key** (FREE) - Required for AI Service
  - Get from: https://console.groq.com/keys
  - No credit card required, ~14,000 tokens/minute free tier

## Services & Ports
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081
- Academic Service: http://localhost:8082
- Public Service: http://localhost:8083
- Workflow Service: http://localhost:8084
- Syllabus Service: http://localhost:8085
- **AI Service (FastAPI)**: http://localhost:8000
  - Interactive API Docs: http://localhost:8000/docs
  - Health Check: http://localhost:8000/health
- Discovery Server (Eureka): http://localhost:8761
- Config Server: http://localhost:8888
- PostgreSQL: localhost:5432 (user: `postgres`, pass: `123456`)
- RabbitMQ Management: http://localhost:15672 (user: `guest`, pass: `guest`)
- Kafka UI: http://localhost:8089
- Redis: localhost:6379

## Setup Environment

**Configure AI Service API Key (Required):**
```powershell
# Navigate to project root
cd smd-microservices

# Run setup script (works in both PowerShell 5.x and 7+)
.\scripts\setup-env.ps1
```

This script will:
1. Create `.env` file from `.env.example`
2. Prompt for your Groq API key (or you can skip and edit manually)
3. Validate configuration

**Alternative (manual):**
```powershell
# Copy example file
Copy-Item .env.example .env

# Edit .env and add your Groq API key
# GROQ_API_KEY=gsk_your_actual_key_here
```

## Build (one-click)
Use the helper script that auto-detects Maven Wrapper:

**PowerShell (Windows):**
```powershell
cd smd-microservices
.\scripts\build-all.ps1
```

**Alternative (manual):**
```powershell
cd <service-folder>
.\mvnw.cmd clean package -DskipTests
```

## Run
Start the stack:
```powershell
cd smd-microservices
.\scripts\up.ps1
```

Manual alternative:
```powershell
docker-compose up -d
docker-compose ps
```

## Verify
- PostgreSQL databases are auto-created from `init-scripts/init.sql`:
  - `auth_db`, `academic_db`, `syllabus_db`, `workflow_db`, `public_db`, **`ai_service_db`**
- Eureka dashboard lists registered services:
  - Open http://localhost:8761
- API Gateway is up:
  - `curl http://localhost:8080` (or open in browser)
- **AI Service is healthy:**
  - `curl http://localhost:8000/health` → should return `{"status":"ok"}`
  - Interactive docs: http://localhost:8000/docs
- **Test AI Service:**
  ```powershell
  # Submit a suggestion task
  curl -X POST http://localhost:8000/ai/suggest `
    -H "Content-Type: application/json" `
    -d '{\"userId\":\"test\",\"syllabusId\":\"test\",\"content\":\"Test content\",\"focusArea\":\"objective\"}'
  
  # Check job status (replace {jobId} with actual ID from above)
  curl http://localhost:8000/ai/jobs/{jobId}
  ```

## Stop
```powershell
docker-compose down
```
To reset databases and volumes:
```powershell
docker-compose down -v
```

## Notes
- **Maven Wrapper**: Build scripts prefer `mvnw.cmd`/`mvnw` (no global Maven install needed).
- **Spring Versions**: Discovery/Auth/Academic/Public/Workflow/Syllabus use Spring Boot 3.2.0; API Gateway uses 3.4.0.
- **Config Server**: Currently optional; services run with static YAML configs. Do not enable `spring.config.import` unless using Config Server with active profiles.
- **Ports**: If ports conflict, adjust mappings in `docker-compose.yml`.
- **Database Init**: `init-scripts/init.sql` creates databases on first run. To reinitialize, run `docker-compose down -v` then `docker-compose up -d`.
- **AI Service**: 
  - Requires valid `GROQ_API_KEY` in `.env` file
  - Uses Groq's free tier (llama-3.3-70b-versatile model)
  - Supports 5 AI tasks: suggest, chat, diff, clo_check, summary
  - Real-time notifications via WebSocket on `/notifications/ws/{userId}`
  - Complete setup guide: `ai-service/PHASE_1_2_3_SETUP.md`

## Troubleshooting

### AI Service won't start
**Problem**: `ai-service` container exits or shows errors.

**Solutions**:
1. Check `.env` file exists: `Test-Path .env`
2. Verify API key is set: `Get-Content .env`
3. Check logs: `docker-compose logs ai-service ai-worker`
4. Rebuild: `docker-compose build ai-service ai-worker`

### "GROQ_API_KEY not set" error
**Problem**: AI service complains about missing API key.

**Solution**:
```powershell
# Run setup script
.\scripts\setup-env.ps1

# Or manually edit .env
notepad .env  # Add: GROQ_API_KEY=gsk_your_key_here

# Restart services
docker-compose restart ai-service ai-worker
```

### Database connection issues
**Problem**: Services can't connect to PostgreSQL.

**Solutions**:
1. Check PostgreSQL is healthy: `docker-compose ps postgres`
2. Verify databases exist:
   ```powershell
   docker exec -it smd-postgres psql -U postgres -l
   ```
3. Restart if needed:
   ```powershell
   docker-compose restart postgres
   Start-Sleep -Seconds 10
   docker-compose restart ai-service auth-service academic-service
   ```

### Port conflicts
**Problem**: "Port already in use" errors.

**Solution**:
1. Check what's using the port:
   ```powershell
   netstat -ano | findstr :8000  # Check AI service port
   netstat -ano | findstr :8080  # Check API Gateway port
   ```
2. Stop conflicting process or change port in `docker-compose.yml`

### View logs for specific service
```powershell
# Single service
docker-compose logs -f ai-service

# Multiple services
docker-compose logs -f ai-service ai-worker

# All services
docker-compose logs -f
```

## Additional Resources
- **AI Service Documentation**: See `ai-service/PHASE_1_2_3_SETUP.md` for complete AI setup guide
- **Interactive API**: http://localhost:8000/docs (Swagger UI)
- **Groq Documentation**: https://console.groq.com/docs
- **WebSocket Test**: Connect to `ws://localhost:8000/notifications/ws/{userId}` for real-time updates
