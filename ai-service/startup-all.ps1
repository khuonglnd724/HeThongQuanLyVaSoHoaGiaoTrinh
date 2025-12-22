#!/usr/bin/env powershell
# AI Service Startup Script - Starts all components automatically
# Usage: .\startup-all.ps1

param(
    [switch]$NoDocker = $false,
    [switch]$NoBrowser = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Service - Full Startup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
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

# Check if Docker is running
if (-not $NoDocker) {
    Write-Host ""
    Write-Host "[*] Checking Docker..." -ForegroundColor $infoColor
    
    try {
        $dockerStatus = docker ps 2>&1
        if ($dockerStatus -like "*Cannot connect*" -or $dockerStatus -like "*error*") {
            Write-Host "[!] Docker is not running!" -ForegroundColor $errorColor
            Write-Host "    Please start Docker Desktop first" -ForegroundColor $warningColor
            exit 1
        }
        Write-Host "[+] Docker is running" -ForegroundColor $successColor
    }
    catch {
        Write-Host "[!] Docker not found! Install Docker Desktop." -ForegroundColor $errorColor
        exit 1
    }

    # Check if containers are already running
    Write-Host ""
    Write-Host "[*] Checking containers..." -ForegroundColor $infoColor
    
    $containers = docker-compose ps 2>&1
    
    if ($containers -like "*Up*" -or $containers -like "*running*") {
        Write-Host "[+] Containers already running" -ForegroundColor $successColor
    }
    else {
        Write-Host "[*] Starting Docker containers..." -ForegroundColor $infoColor
        docker-compose up -d
        
        Write-Host "[*] Waiting for services to be ready..." -ForegroundColor $warningColor
        
        # Wait for services
        for ($i = 30; $i -gt 0; $i--) {
            Write-Host "    Waiting $i seconds..." -NoNewline
            Start-Sleep -Seconds 1
            Write-Host "`r" -NoNewline
        }
        Write-Host "`n[+] Docker services are ready" -ForegroundColor $successColor
    }
}

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
Write-Host "    Kafka UI: http://localhost:8080" -ForegroundColor $successColor
Write-Host ""
Write-Host "[*] Tips:" -ForegroundColor $infoColor
Write-Host "    - API and Worker run in separate windows (keep them open)" -ForegroundColor $warningColor
Write-Host "    - Close windows to stop services" -ForegroundColor $warningColor
Write-Host "    - Use docker-compose down to stop containers" -ForegroundColor $warningColor
Write-Host ""
Write-Host "[*] Test API:" -ForegroundColor $infoColor
Write-Host "    1. Go to http://localhost:8000/docs" -ForegroundColor $successColor
Write-Host "    2. POST /ai/suggest with syllabusId" -ForegroundColor $successColor
Write-Host "    3. Copy jobId from response" -ForegroundColor $successColor
Write-Host "    4. GET /ai/jobs/jobId to check status" -ForegroundColor $successColor
Write-Host ""
Write-Host "Press Enter to finish..." -ForegroundColor $warningColor
Read-Host
