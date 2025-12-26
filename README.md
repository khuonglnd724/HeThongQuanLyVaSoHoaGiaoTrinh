# SMD Microservices Platform

Hệ thống quản lý và số hóa giáo trình - Microservices Architecture

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 (for local development)
- Maven 3.8+

### Startup
```bash
# Build all services
./scripts/build-all.ps1  # or build-all.sh on Linux

# Start services
docker compose up -d

# Access services
- API Gateway: http://localhost:8080
- Config Server: http://localhost:8888
- Discovery (Eureka): http://localhost:8761
- Grafana (Metrics): http://localhost:3000 (admin/admin123)
- Prometheus: http://localhost:9090
- Loki (Logs): http://localhost:3100
```

## 📚 Documentation

### Core Setup
- [OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md) - Prometheus + Grafana metrics
- [GRAFANA_SETUP.md](GRAFANA_SETUP.md) - Dashboard configuration
- [LOGGING_SETUP.md](LOGGING_SETUP.md) - Loki centralized logging
- [DEPLOY.md](DEPLOY.md) - Deployment guide
- [CLEANUP.md](CLEANUP.md) - Storage optimization

### Configuration
- `config-repo/` - Centralized configuration files
- `observability/` - Prometheus, Loki, Promtail configs
- `init-scripts/` - Database initialization

## 🏗️ Architecture

### Services
- **api-gateway** (8080) - Spring Cloud Gateway with JWT auth
- **auth-service** (8081) - Authentication & authorization
- **academic-service** (8082) - Academic management
- **public-service** (8083) - Public content
- **workflow-service** (8084) - Workflow engine
- **syllabus-service** (8085) - Syllabus management

### Infrastructure
- **config-server** (8888) - Spring Cloud Config Server
- **discovery-server** (8761) - Eureka Service Registry
- **PostgreSQL** (5432) - Main database
- **Redis** (6379) - Caching
- **RabbitMQ** (5672) - Message queue
- **Kafka** (9092) - Event streaming

### Observability
- **Prometheus** (9090) - Metrics collection
- **Grafana** (3000) - Metrics visualization
- **Loki** (3100) - Log aggregation
- **Promtail** (9080) - Log collection

## 🔐 Security
- JWT authentication on all protected endpoints
- Role-based access control (RBAC)
- Secrets in environment variables
- CORS configured per service

## 📊 Monitoring
- Real-time metrics via Prometheus
- Custom dashboards in Grafana
- Centralized logs with Loki
- Health checks on all services

## 🧹 Cleanup
To save storage by removing build artifacts (~435MB):
```bash
# See CLEANUP.md for details
Get-ChildItem -Recurse -Directory -Include "target" | Remove-Item -Recurse -Force
```

## 📝 Testing
- JWT E2E tests: [auth-service/TEST_COMMANDS.md](auth-service/TEST_COMMANDS.md)
- API Gateway: Test endpoints via curl or Postman
- Health checks: `/actuator/health` on each service

## 🔧 Development
```bash
# Build a service
cd academic-service
mvn clean package

# Build and test
mvn clean verify

# Run locally
java -jar target/*.jar
```

## 📖 API Documentation
- Auth endpoints: `/api/auth/**`
- Academic endpoints: `/api/academic/**`
- Public endpoints: `/api/public/**`
- Gateway routes all `/api/**` requests
- Unprotected: `/api/auth/login`, `/api/auth/register`

## 🐛 Known Issues
- academic-service: Lombok build issues (see CLEANUP.md)
- Loki: Requires 15s warm-up after startup

## 📞 Support
For issues or questions:
1. Check logs: `docker compose logs <service>`
2. View metrics: http://localhost:3000
3. Query logs: http://localhost:3100 (via Grafana)
4. Review configs: `observability/` folder
