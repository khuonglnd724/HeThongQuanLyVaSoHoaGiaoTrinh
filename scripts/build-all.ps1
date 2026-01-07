Param()
$ErrorActionPreference = "Stop"

# Check .env file for AI service
Write-Host "Checking environment setup..." -ForegroundColor Cyan
$envFile = Join-Path $PSScriptRoot "../.env"
$envExample = Join-Path $PSScriptRoot "../.env.example"

if (-not (Test-Path $envFile)) {
  Write-Host "[WARNING] Warning: .env file not found!" -ForegroundColor Yellow
  Write-Host "AI service requires GROQ_API_KEY to be set." -ForegroundColor Yellow
  if (Test-Path $envExample) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item $envExample $envFile
    Write-Host "[OK] Created .env file. Please edit it and add your Groq API key!" -ForegroundColor Green
    Write-Host "   Get FREE key from: https://console.groq.com/keys" -ForegroundColor Cyan
  }
} else {
  Write-Host "[OK] .env file exists" -ForegroundColor Green
}

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
$envPath = Join-Path $PSScriptRoot "../.env"
if (-not (Test-Path $envPath)) {
  Write-Host "[ERROR] .env not found at $envPath. Create or provide .env with GROQ_API_KEY before building." -ForegroundColor Red
  exit 1
}

$envLines = Get-Content $envPath | Where-Object { $_ -and -not ($_.TrimStart().StartsWith('#')) }
$groqLine = $envLines | Where-Object { $_ -match '^[\s]*GROQ_API_KEY\s*=' } | Select-Object -First 1
if (-not $groqLine) {
  Write-Host "[ERROR] GROQ_API_KEY not set in .env. Add 'GROQ_API_KEY=your_key' before building." -ForegroundColor Red
  exit 1
}
$groqVal = ($groqLine -replace '^[\s]*GROQ_API_KEY\s*=\s*','').Trim('"'' ')
if ([string]::IsNullOrWhiteSpace($groqVal) -or $groqVal -match 'GROQ_API_KEY|REPLACE|YOUR_KEY') {
  Write-Host "[ERROR] GROQ_API_KEY has an invalid placeholder value in .env. Replace it with a real API key." -ForegroundColor Red
  exit 1
}

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
    exit 1
  }
  Pop-Location
} else {
  Write-Host "[ERROR] Skipping ai-service Docker build (Dockerfile not found)" -ForegroundColor Red
}


