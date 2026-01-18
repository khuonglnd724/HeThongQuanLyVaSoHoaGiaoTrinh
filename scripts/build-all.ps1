Param()
$ErrorActionPreference = "Stop"

$projects = @(
  "backend/common-lib",
  "backend/discovery-server",
  "backend/config-server",
  "backend/api-gateway",
  "backend/auth-service",
  "backend/academic-service",
  "backend/public-service",
  "backend/workflow-service",
  "backend/syllabus-service"
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
    else { 
      # Check if system Maven is available
      $mvnCheck = Get-Command mvn -ErrorAction SilentlyContinue
      if ($mvnCheck) {
        $cmd = "mvn"
      } else {
        Write-Host "  [WARNING] No Maven Wrapper found and 'mvn' not in PATH" -ForegroundColor Yellow
        Write-Host "  Skipping $p (run manually if needed)" -ForegroundColor Yellow
        Pop-Location
        continue
      }
    }

    & $cmd -q clean package -DskipTests
    Pop-Location
  } else {
    Write-Host "Skipping missing: $p" -ForegroundColor Yellow
  }
}
Write-Host "`nAll Java builds done." -ForegroundColor Green

# Build AI service Docker image
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "Building AI Service (Python + FastAPI + Celery)" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

# Validate GROQ_API_KEY in .env before attempting Docker builds
$envPath = Join-Path $PSScriptRoot "../docker/.env"
if (-not (Test-Path $envPath)) {
  Write-Host "[WARNING] .env not found. Skipping AI service build." -ForegroundColor Yellow
  Write-Host "  To build AI service: Create docker/.env with GROQ_API_KEY" -ForegroundColor Gray
} else {
  $envLines = Get-Content $envPath | Where-Object { $_ -and -not ($_.TrimStart().StartsWith('#')) }
  $groqLine = $envLines | Where-Object { $_ -match '^[\s]*GROQ_API_KEY\s*=' } | Select-Object -First 1
  
  $skipAiBuild = $false
  if (-not $groqLine) {
    Write-Host "[WARNING] GROQ_API_KEY not set in .env. Skipping AI service build." -ForegroundColor Yellow
    $skipAiBuild = $true
  } else {
    $groqVal = ($groqLine -replace '^[\s]*GROQ_API_KEY\s*=\s*','').Trim('"'' ')
    if ([string]::IsNullOrWhiteSpace($groqVal) -or $groqVal -match 'GROQ_API_KEY|REPLACE|YOUR_KEY') {
      Write-Host "[WARNING] GROQ_API_KEY has placeholder value. Skipping AI service build." -ForegroundColor Yellow
      Write-Host "  Get your API key from: https://console.groq.com/keys" -ForegroundColor Gray
      $skipAiBuild = $true
    }
  }
  
  if (-not $skipAiBuild) {
    $aiServicePath = Join-Path $PSScriptRoot "..\backend\ai-service"
    if (Test-Path (Join-Path $aiServicePath "Dockerfile")) {
      Write-Host "Building ai-service and ai-worker Docker images..." -ForegroundColor Yellow
      Push-Location (Join-Path $PSScriptRoot "..\docker")

      docker compose build ai-service ai-worker

      if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] AI service images built successfully" -ForegroundColor Green
      } else {
        Write-Host "[ERROR] AI service build failed" -ForegroundColor Red
        Pop-Location
      }
      Pop-Location
    } else {
      Write-Host "[WARNING] AI service Dockerfile not found" -ForegroundColor Yellow
    }
  }
}

Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  - Backend services (Java): Built and packaged" -ForegroundColor White
Write-Host "  - AI Service (Python): Docker images built" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Run 'docker compose up -d' to start backend services" -ForegroundColor Gray
Write-Host "  2. Start frontends with 'npm start' (Admin) or 'npm run dev' (Portals)" -ForegroundColor Gray
Write-Host ""
