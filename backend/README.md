# Backend Services

This directory contains all backend microservices for the SMD (Student Management & Digitization) platform.

## 📁 Directory Structure

```
backend/
├── api-gateway/           # Spring Cloud Gateway (port 8080)
├── auth-service/          # Authentication & Authorization (port 8081)
├── academic-service/      # Academic module management (port 8082)
├── public-service/        # Public content & announcements (port 8083)
├── workflow-service/      # Workflow engine (port 8084)
├── syllabus-service/      # Syllabus management (port 8085)
├── discovery-server/      # Eureka service registry (port 8761)
├── config-server/         # Spring Cloud Config (port 8888)
├── common-lib/            # Shared library (models, utils)
├── config-repo/           # Configuration files
│   ├── application.yml    # Global config
│   ├── api-gateway.yml
│   ├── auth-service.yml
│   └── public-service.yml
└── ai-service/            # FastAPI + RAG + Celery (port 8000)
    ├── app/               # FastAPI application
    ├── static/            # AI assets
    ├── test/              # Unit tests
    └── requirements.txt
```

## 🛠️ Building Services

### Build All Services
```powershell
# From project root
.\scripts\build-all.ps1
```

This script builds services in the correct order:
1. **common-lib** (shared dependency)
2. All microservices in parallel

### Build Individual Service
```powershell
# Navigate to service directory
cd backend\<service-name>

# Build with Maven Wrapper (Windows)
..\..\mvnw.cmd clean package -DskipTests

# Build with Maven Wrapper (Linux/macOS)
../../mvnw clean package -DskipTests
```

### Build Common Library First
```powershell
cd backend\common-lib
..\..\mvnw.cmd clean install -DskipTests
```

> **Important**: `common-lib` must be built first as it's a dependency for all services!

## 🧪 Running Tests

### Run All Tests
```powershell
# From service directory
..\..\mvnw.cmd test

# Skip integration tests
..\..\mvnw.cmd test -DskipITs
```

### Run Specific Test
```powershell
..\..\mvnw.cmd test -Dtest=YourTestClass
```

## 🚀 Running Services

### Recommended: Docker Compose
```powershell
cd docker
docker compose up -d
```

### Local Development (Individual Service)
```powershell
cd backend\<service-name>
..\..\mvnw.cmd spring-boot:run
```

**Required order for local development:**
1. PostgreSQL
2. Redis
3. discovery-server
4. config-server
5. Other microservices
6. api-gateway

## 📦 Service Details

### API Gateway (8080)
- **Tech**: Spring Cloud Gateway
- **Auth**: JWT validation via auth-service
- **Routes**: Dynamically routes to registered services in Eureka
- **Features**: Rate limiting, circuit breaker, request/response logging

### Auth Service (8081)
- **Tech**: Spring Boot 3, Spring Security 6, JWT
- **Database**: PostgreSQL (`auth_db`)
- **Features**: User authentication, JWT generation/validation, role-based access
- **Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/validate`

### Academic Service (8082)
- **Tech**: Spring Boot 3, Spring Data JPA, Lombok (SuperBuilder)
- **Database**: PostgreSQL (`academic_db`)
- **Features**: Academic modules, outcomes (CLO/PLO), assessments
- **Special**: Uses Lombok SuperBuilder for entity inheritance
- **Test**: H2 in-memory database for unit tests

### Public Service (8083)
- **Tech**: Spring Boot 3, Spring Data JPA
- **Database**: PostgreSQL (`public_db`)
- **Features**: Public announcements, documents, news

### Workflow Service (8084)
- **Tech**: Spring Boot 3, Spring Data JPA
- **Database**: PostgreSQL (`workflow_db`)
- **Features**: Workflow definitions, process execution, task management

### Syllabus Service (8085)
- **Tech**: Spring Boot 3, Spring Data JPA
- **Database**: PostgreSQL (`syllabus_db`)
- **Features**: Syllabus creation, version control, approval workflows

### Discovery Server (8761)
- **Tech**: Spring Cloud Netflix Eureka
- **UI**: http://localhost:8761
- **Features**: Service registry, health monitoring, load balancing

### Config Server (8888)
- **Tech**: Spring Cloud Config Server
- **Source**: `config-repo/` directory (native file system)
- **Features**: Centralized configuration, environment-specific configs

### Common Lib
- **Tech**: Java library (no main class)
- **Purpose**: Shared models, DTOs, utilities
- **Usage**: Imported as Maven dependency by all services

### AI Service (8000)
- **Tech**: Python, FastAPI, Celery, Redis, LangChain, ChromaDB
- **Features**: RAG-based Q&A, document processing, AI chat
- **Endpoints**: 
  - `/docs` - Interactive API documentation
  - `/health` - Health check
  - `/api/chat` - AI chat endpoint
- **Worker**: Celery worker for async tasks (document ingestion, embeddings)

## 🔧 Configuration

### Spring Cloud Config
All Spring Boot services fetch configuration from config-server:
- `config-repo/application.yml` - Global settings
- `config-repo/<service-name>.yml` - Service-specific settings

### Environment Variables
Managed in `docker/.env`:
- `GROQ_API_KEY` - AI service API key

### Database Configuration
Each service connects to its own PostgreSQL database:
- Host: `postgres` (Docker) or `localhost` (local dev)
- Port: `5432`
- User: `postgres`
- Password: `123456`

## 📊 Actuator Endpoints

All Spring Boot services expose actuator endpoints:
- `/actuator/health` - Health check
- `/actuator/info` - Service information
- `/actuator/metrics` - Metrics
- `/actuator/prometheus` - Prometheus metrics

**Note**: Some endpoints return 403 by design for security. Check Eureka registry for service health.

## 🐛 Troubleshooting

### Lombok Build Failures (Academic Service)
```powershell
# Clean and rebuild
cd backend\academic-service
..\..\mvnw.cmd clean install -DskipTests -U

# Verify Lombok annotation processor
..\..\mvnw.cmd dependency:tree | Select-String lombok
```

### Database Connection Issues
```powershell
# Check if database exists
docker exec -it smd-postgres psql -U postgres -c "\l"

# Create database manually
docker exec -it smd-postgres psql -U postgres -c "CREATE DATABASE auth_db;"
```

### Service Not Registering with Eureka
```powershell
# Check Eureka dashboard
Start-Process http://localhost:8761

# Check service logs
docker compose logs <service-name>

# Verify eureka.client.service-url.defaultZone in config
```

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :8080

# Kill process
Stop-Process -Id <PID> -Force
```

### Maven Wrapper Permissions (Linux/macOS)
```bash
chmod +x mvnw
./mvnw clean package
```

## 📚 Dependencies

### Common Dependencies (All Services)
- Spring Boot 3.3.x
- Spring Cloud 2023.0.x
- Java 21
- Lombok
- Spring Boot Actuator
- Micrometer (metrics)

### Service-Specific
- **auth-service**: Spring Security, JWT, BCrypt
- **academic-service**: SuperBuilder (Lombok), H2 (tests)
- **ai-service**: FastAPI, LangChain, ChromaDB, Celery, Redis

### Maven Wrapper
Each service includes Maven Wrapper:
- `mvnw` (Linux/macOS)
- `mvnw.cmd` (Windows)

No need to install Maven globally!

## 🔗 Service Communication

```
Client
  ↓
API Gateway (8080)
  ↓
  ├─→ Auth Service (8081) ──→ PostgreSQL (auth_db)
  ├─→ Academic Service (8082) ──→ PostgreSQL (academic_db)
  ├─→ Public Service (8083) ──→ PostgreSQL (public_db)
  ├─→ Workflow Service (8084) ──→ PostgreSQL (workflow_db)
  ├─→ Syllabus Service (8085) ──→ PostgreSQL (syllabus_db)
  └─→ AI Service (8000) ──→ Redis + ChromaDB
        ↓
      Celery Worker
```

All services register with Eureka for service discovery.

## 📝 Development Notes

### Adding a New Microservice

1. Create service directory in `backend/`
2. Add Maven Wrapper: `mvn wrapper:wrapper`
3. Configure `pom.xml` with Spring Cloud dependencies
4. Add `bootstrap.yml` with config-server connection
5. Register with Eureka via `@EnableEurekaClient`
6. Create configuration in `config-repo/<service-name>.yml`
7. Update `docker-compose.yml` to include new service
8. Update `scripts/build-all.ps1`

### Code Style
- Java: Google Java Style Guide
- Python: PEP 8
- Line length: 120 characters
- Indentation: 2 spaces (Java), 4 spaces (Python)

### Git Workflow
- Feature branches: `feature/<name>`
- Bug fixes: `bugfix/<name>`
- Merge to `main` via pull request

## 🔐 Security

### Authentication Flow
1. Client → API Gateway → Auth Service
2. Auth Service validates credentials
3. Returns JWT token
4. Client includes JWT in `Authorization: Bearer <token>`
5. API Gateway validates JWT for subsequent requests

### Database Security
- Passwords hashed with BCrypt
- JWT tokens expire after 24 hours
- Refresh tokens expire after 7 days

### API Security
- All endpoints behind API Gateway
- JWT required (except `/api/auth/login`, `/api/auth/register`)
- Rate limiting on gateway
- CORS configured per service

## 📖 Additional Documentation

- [DEPLOY.md](../DEPLOY.md) - Full deployment guide
- [OBSERVABILITY_SETUP.md](../OBSERVABILITY_SETUP.md) - Monitoring setup
- [LOGGING_SETUP.md](../LOGGING_SETUP.md) - Logging configuration
- [academic-service/IMPLEMENTATION_SUMMARY.md](academic-service/IMPLEMENTATION_SUMMARY.md) - Academic service details
- [auth-service/README.md](auth-service/README.md) - Auth service documentation
