# Grafana Dashboard Setup Guide

## Prerequisites
- Prometheus running at http://localhost:9090
- Grafana running at http://localhost:3000
- API Gateway and Auth Service exposing metrics at `/actuator/prometheus`

## Setup Steps

### 1. Login to Grafana
1. Navigate to http://localhost:3000
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. You may be prompted to change the password (optional)

### 2. Add Prometheus Data Source
1. Click on **Configuration** (⚙️) in the left sidebar → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Configure:
   - **Name**: `Prometheus`
   - **URL**: `http://prometheus:9090` (use Docker service name, not localhost)
   - **Access**: `Server (default)`
5. Click **Save & Test** → Should show "Data source is working"

### 3. Import SMD Microservices Dashboard

#### Option A: Import from JSON File
1. Click on **Dashboards** (☷) in the left sidebar → **Import**
2. Click **Upload JSON file**
3. Select `grafana-dashboard.json` from the project root
4. Select **Prometheus** as the data source
5. Click **Import**

#### Option B: Import Community Dashboard
1. Click on **Dashboards** → **Import**
2. Enter dashboard ID:
   - **4701** - JVM (Micrometer) - Good for JVM metrics
   - **6756** - Spring Boot 2.1 Statistics - Good for Spring Boot apps
   - **11378** - Spring Cloud Gateway - Specialized for Gateway metrics
3. Click **Load**
4. Select **Prometheus** as the data source
5. Click **Import**

### 4. Verify Dashboard is Working
1. Open the imported dashboard
2. You should see:
   - **API Gateway - Request Rate**: HTTP requests per second
   - **API Gateway - Response Time (p95, p99)**: Latency percentiles
   - **API Gateway - JVM Heap Memory**: Memory usage gauge
   - **API Gateway - CPU Usage**: System and process CPU
   - **API Gateway - JVM Threads**: Thread count
   - **Auth Service - Request Rate**: Auth requests per second
   - **Auth Service - JVM Heap Memory**: Auth service memory
   - **Auth Service - DB Connections**: HikariCP pool status

### 5. Generate Some Traffic
To populate the dashboard with data, generate traffic:

```powershell
# Test JWT flow
python test-jwt.py

# Or manually test endpoints
$headers = @{
    "Authorization" = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
Invoke-WebRequest -Uri http://localhost:8080/api/auth/me -Headers $headers
```

## Dashboard Panels Explained

### API Gateway Metrics
- **Request Rate**: Shows `rate(http_server_requests_seconds_count[1m])`
  - Tracks requests per second grouped by method, URI, status
  - Helps identify traffic patterns and popular endpoints

- **Response Time (p95, p99)**: Shows latency percentiles
  - p95: 95% of requests complete within this time
  - p99: 99% of requests complete within this time
  - Critical for SLA monitoring

- **JVM Heap Memory**: `jvm_memory_used_bytes{area="heap"}`
  - Monitor memory consumption
  - Watch for memory leaks (continuously increasing)

- **CPU Usage**: `system_cpu_usage` and `process_cpu_usage`
  - System CPU: Overall CPU usage
  - Process CPU: Gateway-specific CPU usage

- **JVM Threads**: `jvm_threads_live` and `jvm_threads_daemon`
  - Monitor thread pool health
  - Watch for thread leaks

### Auth Service Metrics
- **Request Rate**: Auth-specific request patterns
- **JVM Heap Memory**: Auth service memory usage
- **DB Connections**: `hikaricp_connections_active` and `hikaricp_connections_idle`
  - Monitor database connection pool
  - Identify connection exhaustion

## Available Metrics
Gateway and Auth Service expose these metric families:
- `http_server_requests_*` - HTTP request metrics
- `http_client_requests_*` - Outbound HTTP client metrics
- `jvm_*` - JVM metrics (memory, threads, GC)
- `system_*` - System metrics (CPU, disk)
- `process_*` - Process metrics
- `spring_cloud_gateway_*` - Gateway-specific metrics
- `hikaricp_*` - Database connection pool metrics (Auth Service)
- `logback_events_total` - Log event counters

## Creating Custom Panels

### Example: Add JWT Failure Rate Panel
1. Click **Add Panel** → **Add a new panel**
2. Set query:
   ```promql
   rate(http_server_requests_seconds_count{status="401"}[5m])
   ```
3. Configure:
   - **Title**: JWT Authentication Failures
   - **Legend**: {{uri}}
   - **Unit**: requests/sec
4. Click **Apply**

### Example: Add Gateway Route Count
1. Add new panel with query:
   ```promql
   spring_cloud_gateway_routes_count
   ```
2. Set visualization to **Stat** (single number)
3. Title: Active Routes

## Alerting (Optional)
Set up alerts for critical thresholds:
1. Edit a panel → **Alert** tab
2. Create alert rule:
   - **Condition**: `avg() OF query(A, 5m, now) IS ABOVE 0.8`
   - **For**: 5m (wait 5 minutes before firing)
3. Configure notification channel (email, Slack, etc.)

## Troubleshooting

### "No data" in panels
- Check Prometheus is scraping targets: http://localhost:9090/targets
- Verify services are exposing metrics: http://localhost:8080/actuator/prometheus
- Ensure time range is recent (last 15 minutes)

### Prometheus data source not working
- Use Docker service name `http://prometheus:9090`, not `localhost`
- Verify Grafana and Prometheus are on the same Docker network

### Missing metrics
- Check service has actuator and micrometer-prometheus dependencies
- Verify `management.endpoints.web.exposure.include` includes `prometheus`
- Restart the service after configuration changes

## Next Steps
1. ✅ Dashboard imported and working
2. Configure alerting rules for critical metrics
3. Set up centralized logging (Loki + Promtail)
4. Add custom dashboards for business metrics
5. Export dashboards as JSON for version control

## Useful Queries

### Top 5 Slowest Endpoints
```promql
topk(5, histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri)
))
```

### Error Rate Percentage
```promql
100 * (
  sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
  /
  sum(rate(http_server_requests_seconds_count[5m]))
)
```

### Request Count by Status Code
```promql
sum by (status) (rate(http_server_requests_seconds_count[5m]))
```

### JVM Memory Usage Percentage
```promql
100 * (
  jvm_memory_used_bytes{area="heap"} 
  / 
  jvm_memory_max_bytes{area="heap"}
)
```

## Resources
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Micrometer Metrics](https://micrometer.io/docs/concepts)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
