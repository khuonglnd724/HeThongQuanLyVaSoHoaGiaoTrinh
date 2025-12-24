# SMD Microservices – Deployment Guide

This guide helps your team build and run the full stack locally with Docker Compose.

## Prerequisites
- Docker Desktop (Windows/macOS/Linux)
- PowerShell 5+ (Windows)
- JDK 21 (recommended; auth-service requires JDK 17 minimum)
- Maven is **optional** (project includes Maven Wrapper in each service)

## Services & Ports
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081
- Academic Service: http://localhost:8082
- Public Service: http://localhost:8083
- Workflow Service: http://localhost:8084
- Syllabus Service: http://localhost:8085
- Discovery Server (Eureka): http://localhost:8761
- Config Server: http://localhost:8888
- PostgreSQL: localhost:5432 (user: `postgres`, pass: `123456`)

## Build (one-click)
Use the helper script that auto-detects Maven Wrapper:

**PowerShell (Windows):**
```powershell
cd smd-microservices
pwsh scripts/build-all.ps1
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
pwsh scripts/up.ps1
```

Manual alternative:
```powershell
docker-compose up -d
docker-compose ps
```

## Verify
- PostgreSQL databases are auto-created from `init-scripts/init.sql`:
  - `auth_db`, `academic_db`, `syllabus_db`, `workflow_db`, `public_db`
- Eureka dashboard lists registered services:
  - Open http://localhost:8761
- API Gateway is up:
  - `curl http://localhost:8080` (or open in browser)

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
