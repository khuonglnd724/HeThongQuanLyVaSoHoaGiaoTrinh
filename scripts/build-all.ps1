Param()
$ErrorActionPreference = "Stop"

# Helper: retry a shell command string up to N times with delay (returns $true on success)
function Retry-Command([string]$cmd, [int]$attempts = 3, [int]$delay = 5) {
  for ($i = 1; $i -le $attempts; $i++) {
    Write-Host "  [retry] Attempt $($i)/$($attempts): $cmd" -ForegroundColor DarkGray
    iex $cmd
    if ($LASTEXITCODE -eq 0) { return $true }
    if ($i -lt $attempts) { Start-Sleep -Seconds $delay }
  }
  return $false
}

# Helper: retry a scriptblock (invokes command with argument arrays safely)
function Retry-Invoke([ScriptBlock]$action, [string]$desc = "", [int]$attempts = 3, [int]$delay = 5) {
  for ($i = 1; $i -le $attempts; $i++) {
    if ($desc -ne "") {
      Write-Host "  [retry] Attempt $($i)/$($attempts): $desc" -ForegroundColor DarkGray
    } else {
      Write-Host "  [retry] Attempt $($i)/$($attempts)" -ForegroundColor DarkGray
    }
    & $action
    if ($LASTEXITCODE -eq 0) { return $true }
    if ($i -lt $attempts) { Start-Sleep -Seconds $delay }
  }
  return $false
}

# Track if any build step failed
$global:buildFailed = $false

$projects = @(
  "backend/common-lib",
  "backend/discovery-server",
  "backend/config-server",
  "backend/api-gateway",
  "backend/auth-service",
  "backend/academic-service",
  "backend/public-service",
  "backend/workflow-service",
  "backend/syllabus-service",
  "backend/notification-service"
)

Write-Host "Building services..." -ForegroundColor Green
if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host "Pulling Maven images (temurin-17 and temurin-21) for Dockerized builds..." -ForegroundColor Gray
  if (-not (Retry-Command "docker pull maven:3.9.9-eclipse-temurin-17" 3 5)) {
    Write-Host "  [WARN] Failed to pull maven:3.9.9-eclipse-temurin-17 after retries" -ForegroundColor Yellow
    $global:buildFailed = $true
  }
  if (-not (Retry-Command "docker pull maven:3.9.9-eclipse-temurin-21" 3 5)) {
    Write-Host "  [WARN] Failed to pull maven:3.9.9-eclipse-temurin-21 after retries" -ForegroundColor Yellow
    $global:buildFailed = $true
  }
}
foreach ($p in $projects) {
  if (Test-Path $p) {
    Write-Host "`n$p" -ForegroundColor Cyan
    Push-Location $p
    # Prefer Maven Wrapper if available, fallback to system Maven or Dockerized Maven
    $cmd = $null
    $useDockerMaven = $false
    if (Test-Path "mvnw.cmd") { $cmd = ".\mvnw.cmd" }
    elseif (Test-Path "mvnw") { $cmd = "./mvnw" }
    else { 
      # Check if system Maven is available
      $mvnCheck = Get-Command mvn -ErrorAction SilentlyContinue
      if ($mvnCheck) {
        $cmd = "mvn"
      } else {
        # If Docker is available, use the official Maven image to build
        $dockerCheck = Get-Command docker -ErrorAction SilentlyContinue
        if ($dockerCheck) {
          $useDockerMaven = $true
        } else {
          Write-Host "  [WARNING] No Maven Wrapper found and 'mvn' not in PATH" -ForegroundColor Yellow
          Write-Host "  Skipping $p (run manually if needed)" -ForegroundColor Yellow
          Pop-Location
          continue
        }
      }
    }

    # choose dockerized maven image depending on service (auth-service needs temurin-17)
    $serviceName = Split-Path $p -Leaf
    $mavenImage = "maven:3.9.9-eclipse-temurin-21"
    if ($serviceName -eq "auth-service") { $mavenImage = "maven:3.9.9-eclipse-temurin-17" }

    # Use 'install' for common-lib so the artifact is placed into local Maven repo (~/.m2)
    $mvnGoals = "-q clean package -DskipTests"
    if ($serviceName -eq "common-lib") { $mvnGoals = "-q clean install -DskipTests" }

    if (-not $useDockerMaven) {
      # Split mvn goals into tokens and invoke safely so PowerShell doesn't pass them as one string
      $mvnParts = $mvnGoals -split '\s+'
      & $cmd @mvnParts
    } else {
      # Use Docker Maven image to build the project in the current directory
      $hostPath = (Get-Location).ProviderPath
      Write-Host "  Using Docker Maven image to build at $hostPath (image: $mavenImage)" -ForegroundColor Yellow

      # If host Maven repository exists, mount it so locally-installed artifacts (e.g. common-lib) are available
      $m2Host = Join-Path $env:USERPROFILE ".m2"
      # Resolve paths to absolute/normalized form for Docker bind mounts
      $hostPathResolved = (Get-Item $hostPath).FullName
      $mountArgs = "--mount type=bind,source=`"$hostPathResolved`",target=/workspace"
      if (Test-Path $m2Host) {
        $m2Resolved = (Get-Item $m2Host).FullName
        Write-Host "  Mounting host Maven repo: $m2Resolved" -ForegroundColor Gray
        $mountArgs += " --mount type=bind,source=`"$m2Resolved`",target=/root/.m2"
      } else {
        Write-Host "  Host Maven repo not found at $m2Host — dependencies will be downloaded inside container" -ForegroundColor Yellow
      }

      # Build argument array to avoid shell/quoting issues when passing Maven goals
      $dockerArgs = @('run','--rm')
      # split mount args into tokens (each --mount and its value) so they are passed correctly
      $mountParts = $mountArgs -split ' '
      $dockerArgs += $mountParts
      $dockerArgs += '-w','/workspace',$mavenImage,'mvn'
      # split mvn goals into tokens (e.g. -q, clean, package, -DskipTests)
      $mvnParts = $mvnGoals -split '\s+'
      $dockerArgs += $mvnParts

      $action = { & docker @dockerArgs }
      $desc = "docker run $mavenImage mvn $mvnGoals"
      if (-not (Retry-Invoke $action $desc 3 10)) {
        Write-Host "  [ERROR] Dockerized Maven build failed for $p" -ForegroundColor Red
        $global:buildFailed = $true
      }
    }
    Pop-Location
  } else {
    Write-Host "Skipping missing: $p" -ForegroundColor Yellow
  }
}
Write-Host "`nAll Java builds done." -ForegroundColor Green

# Build frontend Docker image (SPA) so compose doesn't try to pull missing image
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "Building Frontend (React) image" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$repoRoot = (Join-Path $PSScriptRoot "..")
if (Test-Path (Join-Path $repoRoot "frontend\public-portal\Dockerfile")) {
  Push-Location $repoRoot
  Write-Host "Building frontend image 'smd/frontend:latest'..." -ForegroundColor Yellow
  $frontendBuildCmd = "docker build -t smd/frontend:latest -f frontend/public-portal/Dockerfile ."
  if (Retry-Command $frontendBuildCmd 3 10) {
    Write-Host "[OK] frontend image built" -ForegroundColor Green
  } else {
    Write-Host "[WARN] frontend image build failed after retries; compose may attempt to pull the image instead" -ForegroundColor Yellow
    $global:buildFailed = $true
  }
  Pop-Location
} else {
  Write-Host "[INFO] frontend Dockerfile not found at frontend/public-portal/Dockerfile — skipping frontend build" -ForegroundColor Gray
}

# Build Docker images for all backend services
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "Building Docker Images for Backend Services" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$dockerServices = @(
  "discovery-server",
  "config-server",
  "api-gateway",
  "auth-service",
  "academic-service",
  "public-service",
  "workflow-service",
  "syllabus-service",
  "notification-service"
)

Write-Host "Building Docker images using docker compose..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "..\docker")

# Build each docker service with retry on network/transient failures
$composeAttempts = 3
$composeDelay = 10
foreach ($service in $dockerServices) {
  Write-Host "`nBuilding $service..." -ForegroundColor Cyan
  $cmdStr = "docker compose build $service"
  if (Retry-Command $cmdStr $composeAttempts $composeDelay) {
    Write-Host "[OK] $service image built successfully" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] $service build failed after $composeAttempts attempts" -ForegroundColor Red
    Write-Host "  Tip: network/TLS errors often resolve after retry; try `docker pull` for base images or `docker login`." -ForegroundColor Yellow
    $global:buildFailed = $true
  }
}

Pop-Location

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

      $aiCmd = "docker compose build ai-service ai-worker"
      if (Retry-Command $aiCmd 1 0) {
        Write-Host "[OK] AI service images built successfully" -ForegroundColor Green
      } else {
        Write-Host "[ERROR] AI service build failed" -ForegroundColor Red
        $global:buildFailed = $true
      }
      
      Pop-Location
    } else {
      Write-Host "[WARNING] AI service Dockerfile not found" -ForegroundColor Yellow
    }
  }
}

 
Write-Host "`nAll backend Docker images built." -ForegroundColor Green

# --- Ensure Postgres is running and required DBs exist ---
Write-Host "`nStarting Postgres (only) via docker compose to ensure DBs exist..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "..\docker")

$upCmd = "docker compose up -d postgres"
if (Retry-Command $upCmd 3 5) {
  Write-Host "[OK] postgres compose up issued" -ForegroundColor Green
} else {
  Write-Host "[WARN] Failed to start postgres via compose after retries" -ForegroundColor Yellow
}

# Wait for postgres to be ready (pg_isready inside the container)
$waitSec = 120
$start = Get-Date
Write-Host "Waiting for postgres to be ready (pg_isready)..." -ForegroundColor Gray
while ($true) {
  try {
    docker exec -u postgres smd-postgres pg_isready -U postgres | Out-Null
    if ($LASTEXITCODE -eq 0) { break }
  } catch {}
  if (((Get-Date) - $start).TotalSeconds -gt $waitSec) {
    Write-Host "[ERROR] Postgres did not become ready within $waitSec seconds." -ForegroundColor Red
    break
  }
  Start-Sleep -Seconds 2
}

# Databases to ensure exist
# Include ai_service_db so it's created even when the postgres volume
# already exists (init-scripts only run on first initialization).
$databases = @('workflow_db','auth_db','syllabus_db','public_db','academic_db','ai_service_db')
foreach ($db in $databases) {
  try {
    $exists = docker exec -u postgres smd-postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db';" 2>$null
    if ($exists -and $exists.Trim() -eq '1') {
      Write-Host "Database exists: $db" -ForegroundColor Gray
    } else {
      Write-Host "Creating database: $db" -ForegroundColor Yellow
      docker exec -u postgres smd-postgres psql -U postgres -c "CREATE DATABASE \"$db\";"
    }
  } catch {
    Write-Host "[WARN] Could not verify/create database ($db): $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

Pop-Location

# Start all services (using the images we just built)
Write-Host "`nStarting all services via docker compose..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "..\docker")

$upAllCmd = "docker compose up -d"
if (Retry-Command $upAllCmd 3 10) {
  Write-Host "[OK] all services started" -ForegroundColor Green
} else {
  Write-Host "[WARN] Failed to start all services via compose after retries" -ForegroundColor Yellow
  $global:buildFailed = $true
}

Pop-Location

if ($global:buildFailed) {
  Write-Host "`n" + "="*60 -ForegroundColor Red
  Write-Host "BUILD FAILED: one or more steps failed" -ForegroundColor Red
  Write-Host "="*60 -ForegroundColor Red
  exit 1
} else {
  Write-Host "`n" + "="*60 -ForegroundColor Green
  Write-Host "BUILD COMPLETE!" -ForegroundColor Green
  Write-Host "="*60 -ForegroundColor Green
}