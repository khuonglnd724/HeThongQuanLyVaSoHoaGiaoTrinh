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

### Project Structure
```
smd-microservices/
├── backend/              # All Spring Boot microservices & AI Service
│   ├── api-gateway/
│   ├── auth-service/
│   ├── academic-service/
│   ├── public-service/
│   ├── workflow-service/
│   ├── syllabus-service/
│   ├── discovery-server/
│   ├── config-server/
│   ├── common-lib/
│   ├── config-repo/
│   └── ai-service/       # FastAPI + Celery
├── frontend/             # Future frontend applications
├── docker/               # Docker Compose & Infrastructure
│   ├── docker-compose.yml
│   ├── init-scripts/     # Database initialization
│   ├── observability/    # Prometheus, Loki configs
│   ├── .env              # Environment variables (AI API keys)
│   └── .env.example
└── scripts/              # Build & deployment scripts
    ├── build-all.ps1
    ├── up.ps1
    ├── down.ps1
    ├── health-check.ps1
    └── setup-env.ps1
```

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

.\scripts\build-all.ps1

# Linux/macOS
cd smd-microservices
./scripts/build-all.sh
```

> **Note**: Academic-service requires Lombok and uses SuperBuilder pattern. The build script handles this automatically.

**Step 2: Initialize databases**
```powershell
# Start PostgreSQL first
cd docker
docker compose up -d postgres

# Wait 15 seconds for PostgreSQL to be ready
Start-Sleep -Seconds 15

# Initialize databases (run only once)
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql
```

**Step 3: Start the full stack**
```powershell
# From docker/ directory
docker compose up -d --build

# Or use the script from project root
cd ..
.\scripts\up.ps1

# Wait for services to start (60-90 seconds)
Start-Sleep -Seconds 60
```

**Step 4: Verify all services are registered**
```powershell
# Check Eureka registry
Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Headers @{"Accept"="application/json"} | 
  Select-Object -ExpandProperty applications | 
  Select-Object -ExpandProperty application | 
  Select name

# Expected output:
# AUTH-SERVICE
# ACADEMIC-SERVICE
# PUBLIC-SERVICE
# WORKFLOW-SERVICE
# SYLLABUS-SERVICE
# API-GATEWAY
```

**Step 5: Run health check**
```powershell
.\scripts\health-check.ps1
```

### Option 2: Manual Build & Deploy

**Build individual services:**
```powershell
# Common-lib (must build first as it's a dependency)
cd backend\common-lib
..\..\mvnw.cmd clean install -DskipTests

# API Gateway
cd ..\api-gateway
..\..\mvnw.cmd clean package -DskipTests

# Auth Service
cd ..\auth-service
..\..\mvnw.cmd clean package -DskipTests

# Academic Service (requires Lombok + SuperBuilder)
cd ..\academic-service
..\..\mvnw.cmd clean package -DskipTests

# Other services...
cd ..\public-service
..\..\mvnw.cmd clean package -DskipTests

cd ..\workflow-service
..\..\mvnw.cmd clean package -DskipTests

cd ..\syllabus-service
..\..\mvnw.cmd clean package -DskipTests
```

**Start services in order:**
```powershell
# 1. Start PostgreSQL and initialize databases
cd docker
docker compose up -d postgres
Start-Sleep -Seconds 15

# Initialize databases (IMPORTANT - run once)
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql

# 2. Start core infrastructure
docker compose up -d redis rabbitmq kafka zookeeper

# 3. Start Spring Cloud infrastructure
docker compose up -d discovery-server config-server
Start-Sleep -Seconds 30

# 4. Start microservices
docker compose up -d api-gateway auth-service academic-service public-service workflow-service syllabus-service ai-service ai-worker

# 5. Start observability stack (optional)
docker compose up -d prometheus grafana loki promtail

# 6. Verify services in Eureka
Start-Sleep -Seconds 60
Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Headers @{"Accept"="application/json"} | 
  Select-Object -ExpandProperty applications | 
  Select-Object -ExpandProperty application | 
  Select name
```

### Option 3: Full Reset (Clean Start)

**Remove all containers, volumes, and networks:**
```powershell
# From project root
cd docker

# Stop and remove all
docker compose down -v

# Clean build artifacts (optional, saves ~435MB disk space)
cd ..
Get-ChildItem backend\ -Recurse -Directory -Include "target" | Remove-Item -Recurse -Force

# Rebuild all services
.\scripts\build-all.ps1

# Start PostgreSQL and initialize databases
cd docker
docker compose up -d postgres
Start-Sleep -Seconds 15

# IMPORTANT: Initialize databases (required on fresh start)
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql

# Start full stack
docker compose up -d --build

# Wait for services to register
Start-Sleep -Seconds 60

# Verify all services in Eureka
Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Headers @{"Accept"="application/json"} | 
  Select-Object -ExpandProperty applications | 
  Select-Object -ExpandProperty application | 
  Select name
```

## ✅ Verification

### 1. Check All Services Running
```powershell
docker compose ps --all
```

Expected output: All containers should show `Up` status.

### 2. Test Service Discovery (Eureka) - **RECOMMENDED**
```powershell
# Browser
http://localhost:8761

# Or via PowerShell - Check which services are registered
Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Headers @{"Accept"="application/json"} | 
  Select-Object -ExpandProperty applications | 
  Select-Object -ExpandProperty application | 
  Select name

# Expected output (all 6 services):
# AUTH-SERVICE
# ACADEMIC-SERVICE
# PUBLIC-SERVICE  
# WORKFLOW-SERVICE
# SYLLABUS-SERVICE
# API-GATEWAY
```

> **Note**: If all 6 services appear in Eureka, they are healthy regardless of actuator endpoint responses.

### 3. Test API Gateway
```powershell
# Health check (publicly accessible)
Invoke-RestMethod -Uri http://localhost:8080/actuator/health

# Expected: status = "UP"
```

### 4. Test Database Initialization
```powershell
# List all databases
docker exec smd-postgres psql -U postgres -l

# Expected databases:
# - auth_db
# - academic_db  
# - syllabus_db
# - workflow_db
# - public_db
# - ai_service_db

# Check academic tables created
docker exec smd-postgres psql -U postgres -d academic_db -c "\dt"

# Expected: subject, program, plo, clo, syllabus, clo_mapping tables
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
- PostgreSQL databases must be manually initialized (see Build & Deploy section):
  - `auth_db`, `academic_db`, `syllabus_db`, `workflow_db`, `public_db`, **`ai_service_db`**
  - Run: `docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql`
  - Run: `docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql`
- **Eureka registry is the primary health indicator** - all 6 services should be registered:
  - Open http://localhost:8761
  - Or run: `Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Headers @{"Accept"="application/json"} | Select-Object -ExpandProperty applications | Select-Object -ExpandProperty application | Select name`
- API Gateway is up:
  - `Invoke-RestMethod http://localhost:8080/actuator/health` → status: "UP"
- **Note**: Some services return 403 Forbidden on actuator endpoints due to security config - this is normal
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

### ⚠️ Important Notes

**Database Initialization:**
- Databases are **NOT** auto-created on first startup
- You **MUST** manually run init scripts after first `docker compose up -d postgres`
- Run these commands once:
  ```powershell
  docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
  docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql
  ```
- Then restart services: `docker compose restart auth-service academic-service public-service workflow-service syllabus-service`

**Academic Service Build Issues:**
- Requires Lombok dependency (scope: provided)
- Uses Lombok SuperBuilder for entity inheritance (BaseEntity)
- Maven compiler needs annotation processor configuration
- Tests use H2 in-memory database (no external Postgres needed)

**Actuator Security:**
- Some services return 403 Forbidden on `/actuator/health` endpoints
- This is by design for security
- Services are healthy if registered in Eureka (check http://localhost:8761)
- API Gateway actuator is accessible at http://localhost:8080/actuator/health

### Services not starting
```powershell
# Check logs
docker compose logs api-gateway

# Common issues:
# - Port already in use: Change port mapping in docker-compose.yml
# - Database not initialized: Run init scripts (see Database Initialization above)
# - Database connection errors: Services started before DB init - restart them
# - Config server not available: Check discovery-server is running first
```

### Database "does not exist" error
```powershell
# This happens when services start before DB initialization
# Solution 1: Run init scripts (if not done yet)
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

# Solution 2: Restart services after DB init
docker compose restart auth-service academic-service public-service workflow-service syllabus-service

# Solution 3: Verify databases exist
docker exec smd-postgres psql -U postgres -l
```

### Academic Service "missing table [clo]" error
```powershell
# Run academic schema initialization
docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql

# Restart academic-service
docker compose restart academic-service

# Note: May have minor SQL errors (ROUND function, strength_level column) 
# but core tables should be created successfully
```

### Build failures with "package lombok does not exist"
```powershell
# Academic-service requires Lombok with annotation processing
# This is fixed in pom.xml with:
# - Lombok dependency (scope: provided)
# - Maven Compiler annotationProcessorPaths

# Rebuild academic-service
cd academic-service
./mvnw.cmd clean package -DskipTests

# Or use build-all script which handles this automatically
cd ..
./scripts/build-all.ps1
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

