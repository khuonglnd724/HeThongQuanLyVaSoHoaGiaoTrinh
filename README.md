
# HeThongQuanLyVaSoHoaGiaoTrinh

Hệ thống quản lý và số hóa giáo trình với kiến trúc microservices và AI Service.

## � Cấu trúc Project

```
smd-microservices/
├── backend/              # Spring Boot Microservices & AI Service
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
├── frontend/             # Frontend applications (future)
│   ├── admin-portal/
│   ├── student-portal/
│   └── teacher-portal/
├── docker/               # Docker Compose & Infrastructure
│   ├── docker-compose.yml
│   ├── init-scripts/
│   ├── observability/
│   └── scripts/
└── scripts/              # Build & deployment scripts
```

## 🚀 Quick Start

### 1. Setup môi trường (lần đầu)
```powershell
# Tạo .env file với Groq API key
.\scripts\setup-env.ps1
```

### 2. Build tất cả services
```powershell
.\scripts\build-all.ps1
```

### 3. Khởi động hệ thống
```powershell
cd docker
docker compose up -d

# Hoặc dùng script
cd ..
.\scripts\up.ps1
```

### 4. Kiểm tra health
```powershell
.\scripts\health-check.ps1
```

### 5. Dừng hệ thống
```powershell
# Dừng nhưng giữ data
.\scripts\down.ps1

# Dừng và xóa tất cả data
.\scripts\down.ps1 -RemoveVolumes
```

## 📋 Services & Endpoints

### Core Services
| Service | Port | Description | Documentation |
|---------|------|-------------|---------------|
| API Gateway | 8080 | Spring Cloud Gateway with JWT auth | - |
| Discovery Server | 8761 | Eureka service registry | http://localhost:8761 |
| Config Server | 8888 | Centralized configuration | - |
| Auth Service | 8081 | Authentication & authorization | [README](backend/auth-service/README.md) |
| Academic Service | 8082 | Academic module management | [README](backend/academic-service/IMPLEMENTATION_SUMMARY.md) |
| Public Service | 8083 | Public content & announcements | - |
| Workflow Service | 8084 | Workflow engine | - |
| Syllabus Service | 8085 | Syllabus management | - |
| AI Service | 8000 | FastAPI + RAG + Celery | http://localhost:8000/docs |

### Infrastructure
| Service | Port | Credentials | Description |
|---------|------|-------------|-------------|
| PostgreSQL | 5432 | postgres/123456 | 6 databases (auth_db, academic_db, etc.) |
| Redis | 6379 | - | Cache & Celery broker |
| RabbitMQ | 15672 | guest/guest | Message broker |
| Kafka | 9092 | - | Event streaming |
| Kafka UI | 8089 | - | Kafka management |

### Observability Stack
| Service | Port | Credentials | Description |
|---------|------|-------------|-------------|
| Prometheus | 9090 | - | Metrics collection |
| Grafana | 3000 | admin/admin123 | Dashboards |
| Loki | 3100 | - | Log aggregation |
| Promtail | 9080 | - | Log collector |

## 📦 Automation Scripts

| Script | Description |
|--------|-------------|
| `setup-env.ps1` | Create .env file and configure Groq API key |
| `build-all.ps1` | Build all Java services (common-lib → microservices) |
| `up.ps1` | Start full stack with validation |
| `down.ps1` | Stop services (optional: remove volumes) |
| `health-check.ps1` | Check health of all services |

## 📚 Documentation

### General
- **[DEPLOY.md](DEPLOY.md)** - Complete deployment guide (3 options: Quick Start, Manual, Full Reset)
- **[docker/README.md](docker/README.md)** - Docker infrastructure documentation
- **[backend/README.md](backend/README.md)** - Backend services documentation
- **[frontend/README.md](frontend/README.md)** - Frontend architecture (planned)

### Service-Specific
- **[backend/auth-service/README.md](backend/auth-service/README.md)** - Authentication service
- **[backend/academic-service/IMPLEMENTATION_SUMMARY.md](backend/academic-service/IMPLEMENTATION_SUMMARY.md)** - Academic service details
- **[backend/ai-service/docs/PHASE_1_2_3_SETUP.md](backend/ai-service/docs/PHASE_1_2_3_SETUP.md)** - AI service setup (3 phases)
- **AI Service API**: http://localhost:8000/docs (when running)

### Observability
- **[OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md)** - Prometheus, Grafana, Loki setup
- **[LOGGING_SETUP.md](LOGGING_SETUP.md)** - Logging configuration
- **[GRAFANA_SETUP.md](GRAFANA_SETUP.md)** - Grafana dashboards

## 🤖 AI Service Features

AI Service uses **Groq API (FREE)** with 5 main tasks:

1. **suggest** - Suggest improvements for syllabus
2. **chat** - AI assistant with conversation history
3. **diff** - Compare changes between 2 versions
4. **clo_check** - Check CLO-PLO consistency  
5. **summary** - Summarize educational documents

**Real-time notifications** via WebSocket + Kafka events.

## 🔧 Requirements

- Docker Desktop (Windows/macOS/Linux)
- PowerShell 5+ (Windows) or Bash (Linux/macOS)
- JDK 21 recommended (Maven Wrapper included - no need to install Maven)
- **Groq API Key** (FREE) - https://console.groq.com/keys (~14,000 tokens/min free tier)

## 🏗️ Architecture

### Three-Tier Structure
- **backend/** - All Spring Boot microservices + AI Service
- **frontend/** - Future frontend applications (React/Vue/Angular)
- **docker/** - Docker Compose orchestration + infrastructure configs

### Microservices Pattern
- Service discovery via Eureka
- Centralized configuration via Config Server
- API Gateway for routing and authentication
- Each service has its own PostgreSQL database
- Async communication via Kafka + RabbitMQ
- Caching with Redis

### Observability
- Metrics: Prometheus + Grafana
- Logging: Loki + Promtail
- Tracing: Spring Boot Actuator

## 🚀 Development Workflow

### Initial Setup
```powershell
# Clone repository
git clone <repo-url>
cd smd-microservices

# Setup environment
.\scripts\setup-env.ps1

# Build all services
.\scripts\build-all.ps1

# Start infrastructure + services
.\scripts\up.ps1
```

### Daily Development
```powershell
# Start services
cd docker
docker compose up -d

# View logs
docker compose logs -f <service-name>

# Rebuild specific service after code changes
cd ../backend/<service-name>
../../mvnw.cmd clean package -DskipTests
cd ../../docker
docker compose up -d --build <service-name>

# Check service health
cd ..
.\scripts\health-check.ps1
```

### Clean Shutdown
```powershell
# Stop but keep data
.\scripts\down.ps1

# Stop and remove all data
.\scripts\down.ps1 -RemoveVolumes
```

## 🐛 Troubleshooting

### Services Won't Start
```powershell
# Check logs
cd docker
docker compose logs <service-name>

# Restart specific service
docker compose restart <service-name>
```

### Database Issues
```powershell
# Verify databases exist
docker exec -it smd-postgres psql -U postgres -c "\l"

# Re-initialize databases
docker exec -i smd-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
docker exec -i smd-postgres psql -U postgres -d academic_db -f /docker-entrypoint-initdb.d/academic_schema.sql
```

### Service Not in Eureka
- Check Eureka dashboard: http://localhost:8761
- Verify service logs: `docker compose logs <service-name>`
- Ensure discovery-server is running: `docker compose ps discovery-server`

### Port Conflicts
```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill process
Stop-Process -Id <PID> -Force
```

### Build Failures
```powershell
# Clean rebuild
cd backend/<service-name>
../../mvnw.cmd clean install -DskipTests -U

# Rebuild common-lib first
cd ../common-lib
../../mvnw.cmd clean install -DskipTests
```

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Build all services: `.\scripts\build-all.ps1`
4. Run tests: `cd backend/<service> && ../../mvnw.cmd test`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push branch: `git push origin feature/your-feature`
7. Create pull request

## 📄 License

[Add your license here]

## 👥 Team

[Add team members here]

---

**Need help?** Check [DEPLOY.md](DEPLOY.md) for detailed deployment instructions or [docker/README.md](docker/README.md) for infrastructure details.

## 🐛 Troubleshooting

Xem logs:
```powershell
docker-compose logs -f [service-name]
```

Common issues - xem [DEPLOY.md](DEPLOY.md#troubleshooting)
