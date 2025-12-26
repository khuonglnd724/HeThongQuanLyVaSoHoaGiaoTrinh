# Observability Setup Summary

## ✅ Completed Tasks

### 1. JWT E2E Verification
- **Status**: ✅ **SUCCESS**
- Generated JWT token using HS256 with configured secret
- Tested authentication flow through API Gateway:
  - Whitelisted routes (`/api/auth/**`) work without token
  - Protected routes return 401 without token
  - Protected routes return 200 with valid JWT token
- JWT filter propagates `X-User-Id` and `X-User-Roles` headers to downstream services

### 2. Prometheus + Grafana Integration
- **Status**: ✅ **SUCCESS**
- Added actuator and micrometer-prometheus dependencies to:
  - `api-gateway`
  - `auth-service`
- Configured Prometheus scraping:
  - Service targets: api-gateway:8080, auth-service:8081
  - Metrics path: `/actuator/prometheus`
  - Scrape interval: 15s
- Started Prometheus on http://localhost:9090
- Started Grafana on http://localhost:3000
  - Default credentials: admin / admin123

## 🔧 Configuration Changes

### Services Updated
1. **api-gateway/pom.xml**
   - Added `spring-boot-starter-actuator`
   - Added `micrometer-registry-prometheus`

2. **auth-service/pom.xml**
   - Added `spring-boot-starter-actuator`
   - Added `micrometer-registry-prometheus`

3. **academic-service/pom.xml**
   - Added actuator dependencies (build failed due to Lombok issues)

### Application Configurations
1. **api-gateway/application.yml**
   ```yaml
   management:
     endpoints:
       web:
         exposure:
           include: health,info,metrics,prometheus
     metrics:
       export:
         prometheus:
           enabled: true
   
   security:
     jwt:
       whitelist:
         - /api/auth/**
         - /actuator/prometheus   # For Prometheus scraping
         - /actuator/health       # For healthchecks
         - /
   ```

2. **auth-service/application.yml**
   - Same management endpoint configuration

### Docker Compose
- Added **Prometheus** service:
  - Port: 9090
  - Config: `./prometheus.yml`
  - Volume: prometheus_data

- Added **Grafana** service:
  - Port: 3000
  - Admin user: admin
  - Admin password: admin123
  - Volume: grafana_data

### Prometheus Configuration (prometheus.yml)
```yaml
scrape_configs:
  - job_name: 'spring-boot-services'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
          - 'api-gateway:8080'
          - 'auth-service:8081'
          - 'academic-service:8082'
          - 'public-service:8083'
          - 'workflow-service:8084'
          - 'syllabus-service:8085'
```

## 🚀 Access Points

| Service | URL | Credentials | Status |
|---------|-----|-------------|---------|
| API Gateway | http://localhost:8080 | JWT required (except whitelist) | ✅ Running |
| Prometheus | http://localhost:9090 | None | ✅ Running |
| Grafana | http://localhost:3000 | admin / admin123 | ✅ Running |
| Eureka | http://localhost:8761 | None | ✅ Running |
| Config Server | http://localhost:8888 | None | ✅ Running |

## 📊 Metrics Available

Gateway and Auth service now expose metrics at:
- `/actuator/prometheus` - Prometheus format metrics
- `/actuator/health` - Health check endpoint
- `/actuator/metrics` - JSON format metrics

**Sample Metrics:**
- JVM memory usage
- HTTP request counts and latency
- Gateway route metrics
- Database connection pool stats (auth-service)

## 🔐 JWT Configuration

**Secret**: `smdMicroservicesSecretKeyForJWTTokenGenerationAndValidation2024`

**Whitelisted Routes** (no JWT required):
- `/api/auth/**` - Authentication endpoints
- `/actuator/prometheus` - For Prometheus scraping
- `/actuator/health` - For healthchecks
- `/` - Root path

**Protected Routes** (JWT required):
- All other routes including `/actuator/metrics`, `/actuator/info`

**JWT Claims Propagated**:
- `X-User-Id`: Subject from JWT
- `X-User-Roles`: Roles array from JWT

## 🎯 Next Steps

### Priority
1. **Fix academic-service build** - Lombok annotation processing issues
2. **Configure Grafana Dashboards**
   - Add Prometheus data source
   - Import Spring Boot dashboard (ID: 4701 or 6756)
   - Create custom dashboards for API Gateway

### Optional
3. **Centralized Logging**
   - Option A: EFK Stack (Elasticsearch + Fluentd + Kibana)
   - Option B: Loki + Promtail + Grafana
4. **Secrets Management** - Move secrets to environment variables
5. **Rate Limiting** - Add rate limits in gateway
6. **CORS Refinement** - Restrict allowed origins for production

## 📝 Testing Commands

### JWT E2E Test
```bash
cd D:/h_Nam_3/hocki1nam2025_2026_nam3/XDPM_HuongDoiTuong/ProjectCK/smd-microservices
python test-jwt.py
```

### Check Prometheus Targets
```bash
# Open in browser
http://localhost:9090/targets
```

### Query Metrics
```bash
# Gateway HTTP requests
http_server_requests_seconds_count{uri="/api/auth/health"}

# JVM memory
jvm_memory_used_bytes
```

### Access Grafana
1. Navigate to http://localhost:3000
2. Login: admin / admin123
3. Add Prometheus data source:
   - URL: http://prometheus:9090
   - Save & Test
4. Import dashboard:
   - Dashboard ID: 4701 (JVM Micrometer)
   - Select Prometheus data source

## 🐛 Known Issues

1. **academic-service build failure**
   - Lombok getters/setters not generated
   - Need to verify Lombok annotation processor configuration

2. **academic-service missing /health**
   - Service doesn't have actuator endpoint yet
   - Will be fixed when build succeeds

## 📦 Dependencies Added

```xml
<!-- Actuator for health checks and metrics -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Micrometer Prometheus for metrics -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```
