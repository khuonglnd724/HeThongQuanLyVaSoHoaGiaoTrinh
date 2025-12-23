Param()
$ErrorActionPreference = "Stop"

Write-Host "Starting Docker Compose stack..." -ForegroundColor Green
Push-Location $PSScriptRoot\..
docker-compose up -d
Start-Sleep -Seconds 10
docker-compose ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
Pop-Location
