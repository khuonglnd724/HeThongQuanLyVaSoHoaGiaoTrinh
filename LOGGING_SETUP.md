# Centralized Logging Setup - Loki + Promtail

## Overview
This document describes the centralized logging infrastructure using Grafana Loki for log aggregation and Promtail for log collection from Docker containers.

## Architecture
```
Docker Containers → Promtail → Loki → Grafana
                    (Scraper)  (Storage) (Visualization)
```

- **Loki**: Log aggregation system (like Prometheus but for logs)
- **Promtail**: Log collector that scrapes container logs and pushes to Loki
- **Grafana**: Visualization and querying interface (already configured)

## Components

### 1. Loki (Port 3100)
- **Image**: `grafana/loki:latest`
- **Config**: `loki-config.yml`
- **Storage**: `loki_data` volume at `/loki`
- **Schema**: v11 (boltdb-shipper + filesystem)
- **Endpoints**:
  - `http://localhost:3100/ready` - Health check
  - `http://localhost:3100/loki/api/v1/push` - Log ingestion
  - `http://localhost:3100/loki/api/v1/query` - Log queries

### 2. Promtail (Port 9080)
- **Image**: `grafana/promtail:latest`
- **Config**: `promtail-config.yml`
- **Log Sources**: Docker socket (`/var/run/docker.sock`)
- **Container Logs**: `/var/lib/docker/containers`
- **Metrics**: `http://localhost:9080/metrics`

## Configuration Files

### loki-config.yml
```yaml
auth_enabled: false
server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1

limits_config:
  allow_structured_metadata: false  # Disable to use schema v11
  reject_old_samples: true
  reject_old_samples_max_age: 168h  # 7 days

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
```

### promtail-config.yml
```yaml
server:
  http_listen_port: 9080

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        filters:
          - name: label
            values: ["com.docker.compose.project=smd-microservices"]
    
    relabel_configs:
      # Labels: container, compose_service, compose_project
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
    
    pipeline_stages:
      # Parse JSON logs from Spring Boot
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
      
      # Extract log level as label
      - labels:
          level:
```

## Setup in Grafana

### 1. Add Loki Data Source
1. Open Grafana: http://localhost:3000 (admin/admin123)
2. Go to **Configuration** → **Data Sources**
3. Click **Add data source**
4. Select **Loki**
5. Configure:
   - **Name**: `Loki`
   - **URL**: `http://loki:3100` (use Docker service name)
   - **Access**: `Server (default)`
6. Click **Save & Test** → Should show "Data source connected"

### 2. Explore Logs
1. Click **Explore** (compass icon) in left sidebar
2. Select **Loki** data source
3. Use **LogQL** to query logs

## LogQL Query Examples

### Basic Queries

**All logs from API Gateway:**
```logql
{compose_service="api-gateway"}
```

**All logs from Auth Service:**
```logql
{compose_service="auth-service"}
```

**All ERROR level logs:**
```logql
{level="ERROR"}
```

**ERROR logs from specific service:**
```logql
{compose_service="auth-service", level="ERROR"}
```

### Pattern Matching

**Logs containing "JWT":**
```logql
{compose_service="api-gateway"} |= "JWT"
```

**Logs NOT containing "health":**
```logql
{compose_service="api-gateway"} != "health"
```

**Case-insensitive search:**
```logql
{compose_service="api-gateway"} |~ "(?i)error"
```

**Logs with "login" or "logout":**
```logql
{compose_service="auth-service"} |~ "login|logout"
```

### Advanced Queries

**Count ERROR logs in last 5 minutes:**
```logql
count_over_time({level="ERROR"}[5m])
```

**Rate of logs per second:**
```logql
rate({compose_service="api-gateway"}[1m])
```

**Top 5 services by log volume:**
```logql
topk(5, sum by (compose_service) (rate({compose_project="smd-microservices"}[5m])))
```

**Parse JSON and filter by field:**
```logql
{compose_service="auth-service"} 
  | json 
  | level="ERROR"
```

### Time-Based Queries

**Logs from last 15 minutes:**
- Use the time picker in Grafana UI

**Logs between specific times:**
```logql
{compose_service="api-gateway"} [2024-12-26T10:00:00Z:2024-12-26T11:00:00Z]
```

## Create Log Dashboard in Grafana

### 1. Create New Dashboard
1. Click **Dashboards** → **New Dashboard**
2. Click **Add visualization**
3. Select **Loki** data source

### 2. Add Log Panels

**Panel 1: Live Logs Stream**
- Query: `{compose_project="smd-microservices"}`
- Visualization: **Logs**
- Settings:
  - Show time: Yes
  - Show labels: Yes
  - Wrap lines: Yes

**Panel 2: Error Rate**
- Query: `sum(rate({level="ERROR"}[5m]))`
- Visualization: **Time series**
- Title: "Error Rate (errors/sec)"

**Panel 3: Log Volume by Service**
- Query: `sum by (compose_service) (rate({compose_project="smd-microservices"}[1m]))`
- Visualization: **Time series**
- Title: "Log Volume by Service"
- Legend: `{{compose_service}}`

**Panel 4: Log Level Distribution**
- Query: `sum by (level) (rate({compose_project="smd-microservices"}[5m]))`
- Visualization: **Pie chart**
- Title: "Log Levels Distribution"

### 3. Save Dashboard
- Click **Save dashboard** (disk icon)
- Name: "SMD Microservices Logs"
- Click **Save**

## Verification Commands

### Check Loki is Receiving Logs
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3100/loki/api/v1/label" | ConvertTo-Json

# Should show labels: compose_service, container, level, etc.
```

```bash
# Linux/Mac
curl -s http://localhost:3100/loki/api/v1/label | jq
```

### Query Logs via API
```powershell
# PowerShell - Get latest logs from api-gateway
$query = '{compose_service="api-gateway"}'
$encodedQuery = [System.Web.HttpUtility]::UrlEncode($query)
Invoke-RestMethod -Uri "http://localhost:3100/loki/api/v1/query?query=$encodedQuery&limit=10"
```

```bash
# Linux/Mac
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={compose_service="api-gateway"}' \
  --data-urlencode 'limit=10' | jq
```

### Check Promtail Metrics
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:9080/metrics" | Select-Object -ExpandProperty Content | Select-String "promtail_" | Select-Object -First 10
```

Expected metrics:
- `promtail_targets_active_total` - Number of active targets
- `promtail_read_bytes_total` - Bytes read from logs
- `promtail_sent_bytes_total` - Bytes sent to Loki

### Generate Test Logs
```powershell
# PowerShell - Generate some traffic to create logs
$headers = @{ Authorization = "Bearer your-token-here" }

# This will create auth and gateway logs
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'

# Multiple requests to generate more logs
1..10 | ForEach-Object {
    Invoke-WebRequest -Uri "http://localhost:8080/actuator/health"
    Start-Sleep -Milliseconds 500
}
```

## Useful Features

### 1. Live Tailing
In Grafana Explore:
1. Select Loki data source
2. Enter query: `{compose_service="api-gateway"}`
3. Click **Live** button (top right)
4. Logs will stream in real-time

### 2. Context Viewing
- Click on any log line
- Click **Show Context** to see surrounding logs
- Helps trace request flow

### 3. Log Filtering
- Click on any label value to filter
- Use **+** to add filter, **-** to exclude

### 4. Time Range Selection
- Use time picker to focus on specific time range
- Useful for incident investigation

## Log Retention

Current configuration:
- **Reject old samples**: Yes
- **Max age**: 168h (7 days)
- Logs older than 7 days will be rejected

To change retention:
1. Edit `loki-config.yml`
2. Update `reject_old_samples_max_age` in `limits_config`
3. Restart Loki: `docker compose restart loki`

## Performance Tuning

### For High Log Volume
Edit `loki-config.yml`:
```yaml
limits_config:
  ingestion_rate_mb: 10  # Max MB/sec per tenant
  ingestion_burst_size_mb: 20  # Burst size
  max_streams_per_user: 10000  # Max streams
  max_query_series: 500  # Max series in query
```

### Promtail Buffer
Edit `promtail-config.yml`:
```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
    batchwait: 1s      # Wait time before sending batch
    batchsize: 1048576  # Max batch size (bytes)
```

## Troubleshooting

### No logs appearing in Grafana
1. Check Promtail is running: `docker compose ps promtail`
2. Check Promtail logs: `docker compose logs promtail --tail=50`
3. Verify targets: `http://localhost:9080/targets`
4. Check Loki labels: `http://localhost:3100/loki/api/v1/label`

### Loki not starting
1. Check config syntax: `docker compose config`
2. Review logs: `docker compose logs loki`
3. Verify volume permissions: `docker volume inspect smd-microservices_loki_data`

### Promtail not scraping logs
1. Verify Docker socket access: `docker compose logs promtail | grep -i error`
2. Check container labels match filter
3. Ensure containers are in same Docker Compose project

### High memory usage
1. Reduce log volume by filtering in Promtail
2. Decrease retention period in Loki config
3. Limit max_query_series in Loki limits_config

## Security Considerations

### Production Checklist
- [ ] Enable authentication: Set `auth_enabled: true` in Loki config
- [ ] Use HTTPS for Loki endpoint
- [ ] Restrict Promtail Docker socket access
- [ ] Implement log filtering to exclude sensitive data
- [ ] Set up proper log retention policies
- [ ] Configure network policies to limit access

### Exclude Sensitive Data
Add to `promtail-config.yml` pipeline_stages:
```yaml
pipeline_stages:
  # Remove sensitive fields from JSON logs
  - json:
      expressions:
        password: ""
        token: ""
  
  # Mask credit card numbers
  - replace:
      expression: '\d{4}-\d{4}-\d{4}-\d{4}'
      replace: 'XXXX-XXXX-XXXX-XXXX'
```

## Integration with Alerts

### Create Alert Rule in Grafana
1. Go to **Alerting** → **Alert rules**
2. Click **New alert rule**
3. Configure:
   - **Query**: `sum(rate({level="ERROR"}[5m])) > 10`
   - **Condition**: When query result is above threshold
   - **Evaluation**: Every 1m for 5m
4. Set notification channel (email, Slack, etc.)

### Example Alert: High Error Rate
```yaml
groups:
  - name: logging_alerts
    interval: 1m
    rules:
      - alert: HighErrorRate
        expr: sum(rate({level="ERROR"}[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"
```

## Next Steps
1. ✅ Loki and Promtail running
2. ✅ Logs being collected from containers
3. Add Loki data source to Grafana
4. Create log dashboard
5. Set up log-based alerts
6. Configure log retention policies
7. Implement sensitive data filtering

## Resources
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/query/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/send-data/promtail/configuration/)
- [Grafana Loki Best Practices](https://grafana.com/docs/loki/latest/best-practices/)
