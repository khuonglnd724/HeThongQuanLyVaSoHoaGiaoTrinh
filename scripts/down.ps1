Param(
  [switch]$RemoveVolumes
)
$ErrorActionPreference = "Stop"

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "SMD Microservices Shutdown Script" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Push-Location $PSScriptRoot\..\docker

if ($RemoveVolumes) {
  Write-Host "`n[WARNING] WARNING: This will remove all volumes (data will be lost)!" -ForegroundColor Yellow
  $confirm = Read-Host "Are you sure? (yes/N)"
  if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    Pop-Location
    exit 0
  }
  
  Write-Host "`nStopping services and removing volumes..." -ForegroundColor Red
  docker compose down -v
  Write-Host "[OK] Services stopped and volumes removed" -ForegroundColor Green
} else {
  Write-Host "`nStopping services (data will be preserved)..." -ForegroundColor Yellow
  docker compose down
  Write-Host "[OK] Services stopped" -ForegroundColor Green
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "To restart services:" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  pwsh scripts/up.ps1" -ForegroundColor White

if (-not $RemoveVolumes) {
  Write-Host "`nTo remove all data and volumes:" -ForegroundColor Yellow
  Write-Host "  pwsh scripts/down.ps1 -RemoveVolumes" -ForegroundColor White
}

Pop-Location
