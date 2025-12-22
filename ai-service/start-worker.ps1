# PowerShell script to start Celery worker
# Usage: .\start-worker.ps1

Write-Host "Starting Celery Worker..." -ForegroundColor Green

# Activate virtual environment
& "$PSScriptRoot\..\..\.venv\Scripts\Activate.ps1"

# Navigate to ai-service directory
Set-Location $PSScriptRoot

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Start Celery worker
Write-Host "Worker starting with configuration:" -ForegroundColor Yellow
Write-Host "  RabbitMQ: localhost:5672" -ForegroundColor Cyan
Write-Host "  Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""

celery -A app.workers.celery_app worker --loglevel=info --pool=solo
