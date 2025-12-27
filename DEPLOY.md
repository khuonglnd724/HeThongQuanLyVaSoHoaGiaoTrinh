# SMD Microservices – Complete Deployment Guide

Complete guide to build, configure, and run the SMD Microservices platform with observability stack.


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

## 📋 System Architecture

### Core Microservices
| Service | Port | Purpose | Dependencies |
|---------|------|---------|--------------|
| api-gateway | 8080 | Spring Cloud Gateway with JWT auth | Eureka, Config Server |
| auth-service | 8081 | Authentication & authorization | PostgreSQL, Eureka, Config Server |
| academic-service | 8082 | Academic module management | Eureka, Config Server |
| public-service | 8083 | Public content & announcements | Eureka, Config Server |
| workflow-service | 8084 | Workflow engine | Eureka, Config Server |
| syllabus-service | 8085 | Syllabus management | Eureka, Config Server |


### Infrastructure Services
| Service | Port | Purpose |
|---------|------|---------|
| config-server | 8888 | Spring Cloud Config Server |
| discovery-server | 8761 | Eureka Service Registry |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| rabbitmq | 5672 | RabbitMQ message broker |
| kafka | 9092 | Kafka event streaming |

### Observability Stack
| Service | Port | Purpose |
|---------|------|---------|
| prometheus | 9090 | Metrics collection & storage |
| grafana | 3000 | Metrics visualization & dashboards |
| loki | 3100 | Centralized log aggregation |
| promtail | 9080 | Log collection from containers |

## 🔐 Prerequisites

### System Requirements
- **Docker Desktop** 4.0+ (Windows/macOS/Linux)
- **Docker Compose** 1.29+
- **PowerShell** 5.0+ (Windows) or Bash (Linux/macOS)
- **8GB RAM minimum** for all services
- **Java 21** (optional, for local development without Docker)

### Port Availability
Ensure these ports are free:
```
5432 (PostgreSQL)
6379 (Redis)
5672 (RabbitMQ)
9092 (Kafka)
8080 (Gateway)
8081-8085 (Microservices)
8761 (Eureka)
8888 (Config Server)
3000 (Grafana)
9090 (Prometheus)
3100 (Loki)
9080 (Promtail)
```

## 🛠️ Build & Deploy

### Option 1: Quick Start (Recommended)

**Step 1: Build all services**
```powershell
# Windows/PowerShell
cd smd-microservices

./scripts/build-all.ps1

# Linux/macOS
cd smd-microservices
./scripts/build-all.sh

```

**Step 2: Start the stack**
```powershell
# Full stack with observability
docker compose up -d

# Wait for services to start (30-60 seconds)
docker compose ps
```

**Step 3: Verify all services are running**
```powershell

docker compose ps --format "{{.Names}} - {{.Status}}"
```

### Option 2: Manual Build & Deploy

**Build individual services:**
```powershell
cd api-gateway
./mvnw.cmd clean package -DskipTests

cd ../auth-service
./mvnw.cmd clean package -DskipTests

# Repeat for other services...
```

**Start services:**
```powershell
# Start core infrastructure first
docker compose up -d postgres redis rabbitmq kafka

# Wait 15 seconds for databases to initialize
Start-Sleep -Seconds 15

# Start infrastructure services
docker compose up -d discovery-server config-server

# Wait 20 seconds for registry
Start-Sleep -Seconds 20

# Start microservices
docker compose up -d api-gateway auth-service academic-service public-service workflow-service syllabus-service

# Start observability stack
docker compose up -d prometheus grafana loki promtail
```

### Option 3: Full Reset (Clean Start)

**Remove all containers, volumes, and networks:**
```powershell
# Stop and remove all
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Start fresh
docker compose up -d
```

## ✅ Verification

### 1. Check All Services Running
```powershell
docker compose ps --all
```

Expected output: All containers should show `Up` status.

### 2. Test Service Discovery (Eureka)
```powershell
# Browser
http://localhost:8761

# Or via curl
curl http://localhost:8761/eureka/apps
```

Expected: API Gateway, Auth Service, and other microservices listed.

### 3. Test API Gateway
```powershell
# Health check (whitelisted route)
curl http://localhost:8080/actuator/health

# Expected: 200 OK with health status
```

### 4. Test JWT Authentication

**Login to get token:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'

$token = $response.token
```

**Access protected endpoint with token:**
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Headers $headers
```

Expected: 200 OK with user profile.

### 5. Test Metrics (Prometheus)
```powershell
# Browser
http://localhost:9090

# Query metrics
http://localhost:9090/api/v1/query?query=http_server_requests_seconds_count
```

Expected: Prometheus UI and metrics available.

### 6. Test Grafana
```powershell
# Browser
http://localhost:3000

# Login
Username: admin
Password: admin123
```

Expected: Grafana dashboard loads.

### 7. Test Logs (Loki)
```powershell
# Browser (via Grafana Explore)
http://localhost:3000 → Explore → Loki data source

# Or direct API
curl "http://localhost:3100/loki/api/v1/query_range?query=%7Bcompose_service%3D%22api-gateway%22%7D"
```

Expected: Real-time logs from containers.

### 8. Test Databases
```powershell
# PostgreSQL
$env:PGPASSWORD="123456"
psql -h localhost -U postgres -d auth_db -c "SELECT 1;"

# Or using Docker
docker compose exec postgres psql -U postgres -d auth_db -c "\dt"
```

Expected: Connected and lists tables.

## 📊 Access Monitoring

### Prometheus (Metrics Storage)
- URL: http://localhost:9090
- Query metrics: `http_server_requests_seconds_count`, `jvm_memory_used_bytes`
- Retention: 15 days default

### Grafana (Metrics Visualization)
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin123`
- Predefined dashboard: [grafana-dashboard.json](grafana-dashboard.json)
- Add Loki data source: http://loki:3100

### Loki (Log Aggregation)
- URL: http://localhost:3100
- Query language: LogQL
- Integrated with Grafana Explore

### Promtail (Log Collection)
- Metrics: http://localhost:9080/metrics
- Automatically scrapes all container logs
- Labels: compose_service, container, compose_project

## 🔧 Configuration

### JWT Authentication
- Secret: `smdMicroservicesSecretKeyForJWTTokenGenerationAndValidation2024`
- Algorithm: HS256
- Token expiry: 30 minutes
- Whitelisted routes: `/api/auth/**`, `/actuator/health`, `/actuator/prometheus`, `/`

### Database Configuration
- Host: `postgres` (Docker service name)
- Port: `5432`
- User: `postgres`
- Password: `123456`
- Databases:
  - `auth_db` - Auth Service
  - `academic_db` - Academic Service
  - `syllabus_db` - Syllabus Service
  - `workflow_db` - Workflow Service
  - `public_db` - Public Service

### Spring Cloud Config
- Config Server: http://config-server:8888
- Configuration files: `config-repo/` directory
- Active profiles: Development (default)

### Environment Variables
Key environment variables in `docker-compose.yml`:
```yaml
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/{db_name}
SPRING_DATASOURCE_USERNAME: postgres
SPRING_DATASOURCE_PASSWORD: 123456
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://discovery-server:8761/eureka/
SPRING_CONFIG_IMPORT: optional:configserver:http://config-server:8888
```

## 📝 Common Commands

### View Logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-gateway

# Last 50 lines
docker compose logs --tail=50 auth-service

# With timestamps
docker compose logs -f --timestamps api-gateway
```

### Restart Services
```powershell
# All services
docker compose restart

# Specific service
docker compose restart api-gateway

# With rebuild
docker compose up -d --build api-gateway
```

### Database Management
```powershell
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d auth_db

# Backup database
docker compose exec postgres pg_dump -U postgres auth_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres auth_db < backup.sql

```

### Clean Up Storage
```powershell
# Remove build artifacts (~435MB)
Get-ChildItem -Recurse -Directory -Include "target" | Remove-Item -Recurse -Force

# See CLEANUP.md for more options
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

## 🐛 Troubleshooting


### Services not starting
```powershell
# Check logs
docker compose logs api-gateway

# Common issues:
# - Port already in use: Change port mapping in docker-compose.yml
# - Database not ready: Wait 30 seconds and restart
# - Config server not available: Check discovery-server is running
```

### JWT token invalid
```powershell
# Verify secret matches between services
# Secret should be: smdMicroservicesSecretKeyForJWTTokenGenerationAndValidation2024

# Get a fresh token
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'

Write-Host $response.token
```


### Database connection refused
```powershell
# Check PostgreSQL is running
docker compose ps postgres

# Verify password and port
docker compose exec postgres psql -U postgres -c "SELECT 1"

# Check firewall on port 5432
Test-NetConnection -ComputerName localhost -Port 5432
```

### High memory usage
```powershell
# Remove build artifacts
./scripts/cleanup.ps1  # Or manually: see CLEANUP.md

# Reduce log retention in Loki config
# See observability/loki-config.yml
```

### Metrics not showing in Grafana
```powershell
# Verify Prometheus scraping targets
http://localhost:9090/targets

# Check service metrics endpoint
http://localhost:8080/actuator/prometheus

# Verify Prometheus data source in Grafana
Grafana → Configuration → Data Sources → Prometheus
```

### Logs not appearing in Loki
```powershell
# Verify Promtail is running
docker compose ps promtail

# Check Promtail logs
docker compose logs promtail --tail=50

# Verify Loki is accepting data
docker compose logs loki --tail=20
```

## 📚 Additional Documentation

- **Observability**: [OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md)
- **Grafana Dashboards**: [GRAFANA_SETUP.md](GRAFANA_SETUP.md)
- **Centralized Logging**: [LOGGING_SETUP.md](LOGGING_SETUP.md)
- **Storage Cleanup**: [CLEANUP.md](CLEANUP.md)
- **Project Overview**: [README.md](README.md)
- **API Testing**: [auth-service/TEST_COMMANDS.md](auth-service/TEST_COMMANDS.md)

## ✨ Next Steps

1. **Monitor Services**: Open Grafana (http://localhost:3000)
2. **View Logs**: Use Loki in Grafana Explore
3. **Configure Alerts**: Set up alert rules in Grafana
4. **Deploy**: Follow Azure/production deployment guides
5. **Scale**: Configure load balancing and auto-scaling

## 📞 Support & Issues

If services fail to start:
1. Check Docker logs: `docker compose logs <service>`
2. Verify ports are available: `netstat -ano | findstr :<port>`
3. Review configuration: `docker-compose config`
4. Check database: `docker compose exec postgres psql -U postgres -l`
5. See troubleshooting section above

