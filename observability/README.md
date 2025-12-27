# Observability Configuration Files

Directory containing configuration files for the observability stack:

## Files
- **prometheus.yml** - Prometheus metrics scraping configuration
  - Targets: All Spring Boot services, Config Server, Discovery Server
  - Scrape interval: 15s
  - Metrics endpoint: `/actuator/prometheus`

- **loki-config.yml** - Loki log aggregation configuration
  - Storage: Filesystem (boltdb-shipper + filesystem)
  - Schema: v11
  - Log retention: 7 days
  - Port: 3100

- **promtail-config.yml** - Promtail log collection configuration
  - Source: Docker containers
  - Target: Loki
  - Labels: compose_service, container, compose_project
  - Port: 9080

## Quick Reference
- Prometheus: http://localhost:9090
- Loki: http://localhost:3100
- Promtail: http://localhost:9080
- Grafana: http://localhost:3000

## Configuration Changes
Edit these files and restart services:
```bash
docker compose down prometheus loki promtail
# Edit config file
docker compose up -d prometheus loki promtail
```

## Documentation
- Full setup guide: ../OBSERVABILITY_SETUP.md
- Logging setup: ../LOGGING_SETUP.md
- Grafana setup: ../GRAFANA_SETUP.md
