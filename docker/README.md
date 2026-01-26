# Docker Infrastructure & Containerization

Complete Docker configuration for the SMD (Syllabus Management & Digitalization) microservices platform with centralized Dockerfile management.

## 📁 Directory Structure

```
docker/
├── dockerfiles/                 # Centralized Dockerfile directory
│   ├── Dockerfile.public-service
│   ├── Dockerfile.discovery-server
│   ├── Dockerfile.config-server
│   ├── Dockerfile.api-gateway
│   ├── Dockerfile.auth-service
│   ├── Dockerfile.academic-service
│   ├── Dockerfile.syllabus-service
│   ├── Dockerfile.workflow-service
│   ├── Dockerfile.ai-service
│   └── Dockerfile.public-portal
├── docker-compose.yml           # Main orchestration file
├── .dockerignore                # Docker build ignore file
├── .env                         # Environment variables (API keys, etc.)
├── .env.example                 # Template for .env
├── grafana-dashboard.json       # Pre-configured Grafana dashboard
├── init-scripts/                # Database initialization scripts
│   ├── init.sql                 # Creates all databases
│   └── academic_schema.sql      # Academic service schema
├── observability/               # Monitoring & logging configs
│   ├── prometheus.yml           # Prometheus scrape config
│   ├── loki-config.yml          # Loki logging config
│   └── promtail-config.yml      # Log collection config
├── scripts/                     # Docker utility scripts
│   ├── build-all.ps1
│   ├── up.ps1
│   ├── down.ps1
│   └── health-check.ps1
└── README.md                    # This file
```

## 🏗️ Architecture

### Build Context Strategy
All services use a unified build context from the project root, allowing Dockerfiles to reference both frontend and backend code:

```yaml
build:
  context: ..                                      # Project root
  dockerfile: docker/dockerfiles/Dockerfile.service-name
```

This enables:
- Reusable base images
- Consistent build process
- Centralized image management
- Easy maintenance and updates

## 🚀 Quick Start

### From Project Root
```powershell
# Build all services first
.\scripts\build-all.ps1

# Start everything
.\scripts\up.ps1

# Check health
.\scripts\health-check.ps1

# Stop services
.\scripts\down.ps1
```

### From Docker Directory
```powershell
cd docker

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## 🗄️ Database Initialization

**IMPORTANT**: Databases must be initialized manually on first startup:

```powershell
# 1. Start PostgreSQL
cd docker
docker compose up -d postgres

# 2. Wait for PostgreSQL to be ready
Start-Sleep -Seconds 15

# 3. Initialize databases
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql
```

## 🔧 Configuration

### Environment Variables (.env)

Required variables in `.env`:
- `GROQ_API_KEY`: Groq API key for AI service (get from https://console.groq.com/keys)

```powershell
# Create .env from template
Copy-Item .env.example .env

# Edit and add your API key
# GROQ_API_KEY=gsk_your_actual_key_here
```

### Docker Compose Services

#### Infrastructure
- **postgres**: PostgreSQL 16 (port 5432)
- **redis**: Redis 7-alpine (port 6379)
- **rabbitmq**: RabbitMQ with management (ports 5672, 15672)
- **kafka**: Kafka event streaming (port 9092)
- **zookeeper**: Kafka dependency (port 2181)

#### Spring Boot Microservices
- **discovery-server**: Eureka (port 8761)
- **config-server**: Spring Cloud Config (port 8888)
- **api-gateway**: Spring Cloud Gateway (port 8080)
- **auth-service**: Authentication (port 8081)
- **academic-service**: Academic modules (port 8082)
- **public-service**: Public content (port 8083)
- **workflow-service**: Workflow engine (port 8084)
- **syllabus-service**: Syllabus management (port 8085)

#### AI Service
- **ai-service**: FastAPI + RAG (port 8000)
- **ai-worker**: Celery worker for async tasks

#### Observability
- **prometheus**: Metrics collection (port 9090)
- **grafana**: Dashboards (port 3000, admin/admin123)
- **loki**: Log aggregation (port 3100)
- **promtail**: Log collector (port 9080)
- **kafka-ui**: Kafka management (port 8089)

## 📊 Monitoring

### Prometheus
- URL: http://localhost:9090
- Scrapes metrics from all Spring Boot services every 15s
- Config: `observability/prometheus/prometheus.yml`

### Grafana
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin123`
- Pre-configured dashboard: `grafana-dashboard.json`
- Data sources: Prometheus, Loki

### Loki & Promtail
- Loki API: http://localhost:3100
- Aggregates logs from all Docker containers
- Query logs in Grafana: Explore → Loki

## 🔍 Troubleshooting

### Service Won't Start
```powershell
# Check logs
docker compose logs <service-name>

# Rebuild specific service
docker compose up -d --build <service-name>

# Force recreate
docker compose up -d --force-recreate <service-name>
```

### Database Connection Issues
```powershell
# Check if database exists
docker exec -it smd-postgres psql -U postgres -c "\l"

# Verify tables in academic_db
docker exec -it smd-postgres psql -U postgres -d academic_db -c "\dt"

# Re-initialize databases
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
```

### Port Conflicts
```powershell
# Check what's using a port
netstat -ano | findstr :8080

# Stop conflicting process
Stop-Process -Id <PID> -Force
```

### Clean Slate
```powershell
# Stop everything and remove volumes
docker compose down -v

# Remove all containers and networks
docker compose rm -f

# Rebuild from scratch
cd ..
.\scripts\build-all.ps1
cd docker
docker compose up -d --build
```

## 🔗 Service Dependencies

```
postgres
  ├── auth-service
  ├── academic-service
  ├── public-service
  ├── workflow-service
  └── syllabus-service

discovery-server
  ├── config-server
  ├── api-gateway
  ├── auth-service
  ├── academic-service
  ├── public-service
  ├── workflow-service
  └── syllabus-service

redis
  └── (cache for all services)

rabbitmq
  └── (message broker for async operations)

kafka
  └── (event streaming)

prometheus
  └── grafana

loki
  └── grafana
```

## 📝 Notes

- All service builds reference `../backend/<service-name>/target/<service>.jar`
- Database initialization scripts are in `./init-scripts/`
- Logs are collected via Promtail and aggregated in Loki
- Metrics are scraped by Prometheus from `/actuator/prometheus` endpoints
- Network: All services use `smd-network` bridge network
- Volumes: Data persisted in Docker volumes (postgres_data, redis_data, etc.)
