#!/usr/bin/env powershell
# AI Service Startup Script - Starts API and Worker (assumes infrastructure is running)
# Usage: .\startup-all.ps1
# Note: Run root docker-compose first: docker-compose up -d

param(
    [switch]$NoBrowser = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Service - Startup (Local Mode)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[!] This script runs API and Worker locally" -ForegroundColor Yellow
Write-Host "[!] Infrastructure (RabbitMQ/Redis/Kafka) must be running from root docker-compose" -ForegroundColor Yellow
Write-Host ""

# Colors
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

# Change to ai-service directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommandPath
Set-Location $scriptDir

Write-Host "[*] Working directory: $(Get-Location)" -ForegroundColor $infoColor

# Check if required containers are running
Write-Host ""
Write-Host "[*] Checking infrastructure containers..." -ForegroundColor $infoColor

$requiredContainers = @("smd-rabbitmq", "smd-redis", "smd-kafka")
$missingContainers = @()

foreach ($container in $requiredContainers) {
    $status = docker ps --filter "name=$container" --filter "status=running" --format "{{.Names}}" 2>&1
    if ($status -notlike "*$container*") {
        $missingContainers += $container
    }
}

if ($missingContainers.Count -gt 0) {
    Write-Host "[!] Required containers not running: $($missingContainers -join ', ')" -ForegroundColor $errorColor
    Write-Host ""
    Write-Host "[*] Please start infrastructure from project root:" -ForegroundColor $warningColor
    Write-Host "    cd .." -ForegroundColor Cyan
    Write-Host "    docker-compose up -d rabbitmq redis kafka zookeeper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or start all services:" -ForegroundColor $warningColor
    Write-Host "    docker-compose up -d" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "[+] Infrastructure containers are running" -ForegroundColor $successColor

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Components" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Python path
$pythonPath = "../.venv/Scripts/python.exe"

if (-not (Test-Path $pythonPath)) {
    Write-Host "[!] Virtual environment not found!" -ForegroundColor $errorColor
    Write-Host "    Run: python -m venv ..\.venv" -ForegroundColor $warningColor
    exit 1
}

Write-Host "[*] Python path: $pythonPath" -ForegroundColor $infoColor

# Open new PowerShell windows for API and Worker
Write-Host ""
Write-Host "[*] Starting API Server..." -ForegroundColor $infoColor
$apiCommand = "Set-Location '$scriptDir'; & '$pythonPath' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; Read-Host 'Press Enter to close'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCommand

Start-Sleep -Seconds 2

Write-Host "[*] Starting Celery Worker..." -ForegroundColor $infoColor
$workerCommand = "Set-Location '$scriptDir'; & '$pythonPath' -m celery -A app.workers.celery_app worker --loglevel=info --pool=solo; Read-Host 'Press Enter to close'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $workerCommand

# Wait for API to start
Write-Host ""
Write-Host "[*] Waiting for API server to start (5 seconds)..." -ForegroundColor $warningColor
Start-Sleep -Seconds 5

# Open browser if not disabled
if (-not $NoBrowser) {
    Write-Host ""
    Write-Host "[*] Opening Swagger UI..." -ForegroundColor $infoColor
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000/docs"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[+] AI Service is Running!" -ForegroundColor $successColor
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Access Points:" -ForegroundColor $infoColor
Write-Host "    API Documentation: http://localhost:8000/docs" -ForegroundColor $successColor
Write-Host "    RabbitMQ Manager: http://localhost:15672 (guest/guest)" -ForegroundColor $successColor
Write-Host "    Kafka UI: http://localhost:8089" -ForegroundColor $successColor
Write-Host ""
Write-Host "[*] Tips:" -ForegroundColor $infoColor
Write-Host "    - API and Worker run in separate windows (keep them open)" -ForegroundColor $warningColor
Write-Host "    - Close windows to stop API/Worker" -ForegroundColor $warningColor
Write-Host "    - From project root, run: docker-compose down (to stop infrastructure)" -ForegroundColor $warningColor
Write-Host ""
Write-Host "[*] Test API:" -ForegroundColor $infoColor
Write-Host "    1. Go to http://localhost:8000/docs" -ForegroundColor $successColor
Write-Host "    2. POST /ai/suggest with syllabusId" -ForegroundColor $successColor
Write-Host "    3. Copy jobId from response" -ForegroundColor $successColor
Write-Host "    4. GET /ai/jobs/jobId to check status" -ForegroundColor $successColor
Write-Host ""
Write-Host "Press Enter to finish..." -ForegroundColor $warningColor
Read-Host
