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
    # Prefer Maven Wrapper if available, fallback to system Maven
    $cmd = $null
    if (Test-Path "mvnw.cmd") { $cmd = ".\mvnw.cmd" }
    elseif (Test-Path "mvnw") { $cmd = "./mvnw" }
    else { $cmd = "mvn" }

    & $cmd -q clean package -DskipTests
    Pop-Location
  } else {
    Write-Host "Skipping missing: $p" -ForegroundColor Yellow
  }
}
Write-Host "`nAll builds done." -ForegroundColor Green
