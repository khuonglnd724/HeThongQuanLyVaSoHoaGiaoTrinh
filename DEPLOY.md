# SMD Microservices – Deployment Guide

This guide helps your team build and run the full stack locally with Docker Compose.

## Prerequisites
- Docker Desktop (Windows/macOS/Linux)
- PowerShell 5+ (Windows) or Bash (macOS/Linux)
- Java 17 + 21 and Maven 3.8+ (for building JARs)

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
Use the helper script:

PowerShell (Windows):
```
cd smd-microservices
./scripts/build-all.ps1
```

Bash (macOS/Linux):
```
cd smd-microservices
pwsh ./scripts/build-all.ps1
```

## Run
Start the stack:
```
cd smd-microservices
./scripts/up.ps1
```

Manual alternative:
```
cd smd-microservices
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
```
cd smd-microservices
docker-compose down
```
To reset databases:
```
docker-compose down -v
```

## Notes
- Config Server is currently optional; clients run with static configs. Do not enable `spring.config.import` unless using Config Server profiles.
- Build scripts compile all service JARs that are volume-mounted by Compose.
- If ports are in use, adjust mappings in `docker-compose.yml`.
