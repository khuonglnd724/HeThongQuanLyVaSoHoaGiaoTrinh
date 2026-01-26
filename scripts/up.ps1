Param(
  [switch]$Build
)
$ErrorActionPreference = "Stop"

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "SMD Microservices Startup Script" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check .env file
Write-Host "`nChecking environment configuration..." -ForegroundColor Yellow
$envFile = Join-Path $PSScriptRoot "../docker/.env"
if (-not (Test-Path $envFile)) {
  Write-Host "[ERROR] ERROR: .env file not found!" -ForegroundColor Red
  Write-Host "   Create .env file with GROQ_API_KEY before starting." -ForegroundColor Red
  Write-Host "   Run: Copy-Item .env.example .env" -ForegroundColor Yellow
  Write-Host "   Then edit .env and add your Groq API key from: https://console.groq.com/keys" -ForegroundColor Yellow
  exit 1
}

# Check if GROQ_API_KEY is set
$envContent = Get-Content $envFile -Raw
if ($envContent -match "GROQ_API_KEY=your-groq-api-key-here|GROQ_API_KEY=\s*$") {
  Write-Host "[WARNING] WARNING: GROQ_API_KEY not configured in .env" -ForegroundColor Yellow
  Write-Host "   AI service will fail without valid Groq API key!" -ForegroundColor Yellow
  Write-Host "   Get FREE key from: https://console.groq.com/keys" -ForegroundColor Cyan
  $continue = Read-Host "Continue anyway? (y/N)"
  if ($continue -ne "y" -and $continue -ne "Y") {
    exit 0
  }
} else {
  Write-Host "[OK] Environment configuration OK" -ForegroundColor Green
}

Push-Location $PSScriptRoot\..\docker

# Build if requested
if ($Build) {
  Write-Host "`nBuilding services..." -ForegroundColor Yellow
  docker compose build
}

Write-Host "`nStarting Docker Compose stack..." -ForegroundColor Green
docker compose up -d

Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "Service Status" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n" + "=" * 60 -ForegroundColor Green
Write-Host "Key Endpoints" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "  Eureka Dashboard:    http://localhost:8761" -ForegroundColor White
Write-Host "  API Gateway:         http://localhost:8080" -ForegroundColor White
Write-Host "  AI Service (Docs):   http://localhost:8000/docs" -ForegroundColor White
Write-Host "  AI Service (Health): http://localhost:8000/health" -ForegroundColor White
Write-Host "  Kafka UI:            http://localhost:8089" -ForegroundColor White
Write-Host "  RabbitMQ:            http://localhost:15672 (guest/guest)" -ForegroundColor White

Write-Host "`nVerifying critical services..." -ForegroundColor Yellow

# Check AI Service health
Start-Sleep -Seconds 5
try {
  $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
  if ($response.StatusCode -eq 200) {
    Write-Host "[OK] AI Service is healthy" -ForegroundColor Green
  }
} catch {
  Write-Host "[WARNING] AI Service not responding yet (may still be starting...)" -ForegroundColor Yellow
  Write-Host "   Check logs: docker-compose logs -f ai-service" -ForegroundColor Cyan
}

# Check Eureka
try {
  $response = Invoke-WebRequest -Uri "http://localhost:8761" -TimeoutSec 5 -UseBasicParsing
  if ($response.StatusCode -eq 200) {
    Write-Host "[OK] Eureka Discovery Server is healthy" -ForegroundColor Green
  }
} catch {
  Write-Host "[WARNING] Eureka not responding yet" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "Useful Commands" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  View logs:           docker-compose logs -f [service-name]" -ForegroundColor White
Write-Host "  Stop all:            docker-compose down" -ForegroundColor White
Write-Host "  Restart service:     docker-compose restart [service-name]" -ForegroundColor White
Write-Host "  View AI Service:     docker-compose logs -f ai-service ai-worker" -ForegroundColor White
Write-Host "`nFor complete setup guide, see: ai-service/PHASE_1_2_3_SETUP.md" -ForegroundColor Cyan

Pop-Location
