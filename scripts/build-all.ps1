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
  "backend/syllabus-service"
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
  "syllabus-service"
)

Write-Host "Building Docker images using docker compose..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "..\docker")

foreach ($service in $dockerServices) {
  Write-Host "`nBuilding $service..." -ForegroundColor Cyan
  $cmdStr = "docker compose build $service"
  if (Retry-Command $cmdStr 1 0) {
    Write-Host "[OK] $service image built successfully" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] $service build failed" -ForegroundColor Red
    $global:buildFailed = $true
  }
}

Pop-Location
Write-Host "`nAll backend Docker images built." -ForegroundColor Green

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
        Pop-Location
      }
      Pop-Location
    } else {
      Write-Host "[WARNING] AI service Dockerfile not found" -ForegroundColor Yellow
    }
  }
}

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
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  - Backend services (Java): Built and packaged as JAR files" -ForegroundColor White
Write-Host "  - Backend Docker images: Built for all services" -ForegroundColor White
Write-Host "  - AI Service (Python): Docker images built" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Verify images with: docker images" -ForegroundColor Gray
Write-Host "  2. Run 'cd docker && docker compose up -d' to start all services" -ForegroundColor Gray
Write-Host "  3. Check health: docker compose ps" -ForegroundColor Gray
Write-Host "  4. View logs: docker compose logs -f [service-name]" -ForegroundColor Gray
Write-Host ""
