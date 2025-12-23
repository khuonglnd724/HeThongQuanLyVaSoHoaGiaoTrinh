Param()
$ErrorActionPreference = "Stop"

$projects = @(
  "common-lib",
  "discovery-server",
  "config-server",
  "api-gateway",
  "auth-service",
  "academic-service",
  "public-service",
  "workflow-service",
  "syllabus-service"
)

Write-Host "Building services..." -ForegroundColor Green
foreach ($p in $projects) {
  if (Test-Path $p) {
    Write-Host "`n$p" -ForegroundColor Cyan
    Push-Location $p
    mvn -q clean package -DskipTests
    Pop-Location
  } else {
    Write-Host "Skipping missing: $p" -ForegroundColor Yellow
  }
}
Write-Host "`nAll builds done." -ForegroundColor Green
