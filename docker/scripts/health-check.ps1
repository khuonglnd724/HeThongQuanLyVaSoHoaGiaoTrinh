Param()
$ErrorActionPreference = "Continue"

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "SMD Microservices Health Check" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
  @{Name="Eureka Discovery"; Url="http://localhost:8761"; Type="Web"},
  @{Name="Config Server"; Url="http://localhost:8888/actuator/health"; Type="JSON"},
  @{Name="API Gateway"; Url="http://localhost:8080/actuator/health"; Type="JSON"},
  @{Name="Auth Service"; Url="http://localhost:8081/actuator/health"; Type="JSON"},
  @{Name="Academic Service"; Url="http://localhost:8082/actuator/health"; Type="JSON"},
  @{Name="Public Service"; Url="http://localhost:8083/actuator/health"; Type="JSON"},
  @{Name="Workflow Service"; Url="http://localhost:8084/actuator/health"; Type="JSON"},
  @{Name="Syllabus Service"; Url="http://localhost:8085/actuator/health"; Type="JSON"},
  @{Name="AI Service"; Url="http://localhost:8000/health"; Type="JSON"}
)

$passed = 0
$failed = 0
$timeout = 5

Write-Host "`nChecking services..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
  $name = $service.Name.PadRight(25)
  Write-Host "$name " -NoNewline -ForegroundColor White
  
  try {
    $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec $timeout -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
      if ($service.Type -eq "JSON") {
        $json = $response.Content | ConvertFrom-Json
        if ($json.status -eq "UP" -or $json.status -eq "ok") {
          Write-Host "[OK] HEALTHY" -ForegroundColor Green
          $passed++
        } else {
          Write-Host "[WARNING] DEGRADED ($($json.status))" -ForegroundColor Yellow
          $failed++
        }
      } else {
        Write-Host "[OK] HEALTHY" -ForegroundColor Green
        $passed++
      }
    } else {
      Write-Host "[ERROR] UNHEALTHY (HTTP $($response.StatusCode))" -ForegroundColor Red
      $failed++
    }
  } catch {
    Write-Host "[ERROR] DOWN (Not responding)" -ForegroundColor Red
    $failed++
  }
}

Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  Healthy:   $passed" -ForegroundColor Green
Write-Host "  Unhealthy: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "  Total:     $($services.Count)" -ForegroundColor White

if ($failed -gt 0) {
  Write-Host "`n[WARNING] Some services are not healthy!" -ForegroundColor Yellow
  Write-Host "   Check logs: docker-compose logs [service-name]" -ForegroundColor Cyan
  Write-Host "   Restart: docker-compose restart [service-name]" -ForegroundColor Cyan
}

# Additional checks
Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "Docker Container Status" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

Push-Location $PSScriptRoot\..
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>$null
Pop-Location

# Database check
Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "Database Check" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

try {
  $output = docker exec smd-postgres psql -U postgres -l -t 2>$null
  if ($LASTEXITCODE -eq 0) {
    $databases = @("auth_db", "academic_db", "syllabus_db", "workflow_db", "public_db", "ai_service_db")
    foreach ($db in $databases) {
      $exists = $output -match $db
      $dbName = $db.PadRight(20)
      if ($exists) {
        Write-Host "  $dbName ✅" -ForegroundColor Green
      } else {
        Write-Host "  $dbName ❌ Missing" -ForegroundColor Red
      }
    }
  } else {
    Write-Host "  ⚠️  Could not connect to PostgreSQL" -ForegroundColor Yellow
  }
} catch {
  Write-Host "  ⚠️  PostgreSQL not available" -ForegroundColor Yellow
}

# Kafka check
Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "Kafka Topics" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

try {
  $topics = docker exec smd-kafka kafka-topics --list --bootstrap-server localhost:9092 2>$null
  if ($LASTEXITCODE -eq 0) {
    if ($topics -match "ai-events") {
      Write-Host "  ai-events                ✅" -ForegroundColor Green
    } else {
      Write-Host "  ai-events                ❌ Not found" -ForegroundColor Red
    }
  } else {
    Write-Host "  ⚠️  Could not list Kafka topics" -ForegroundColor Yellow
  }
} catch {
  Write-Host "  ⚠️  Kafka not available" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 70 -ForegroundColor Green
Write-Host "Health Check Complete" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green

if ($failed -eq 0) {
  Write-Host "✅ All services are healthy!" -ForegroundColor Green
  exit 0
} else {
  Write-Host "⚠️  $failed service(s) need attention" -ForegroundColor Yellow
  exit 1
}
