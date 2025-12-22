@echo off
REM AI Service Startup Script for Windows CMD
REM Usage: startup-all.bat

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ========================================
echo AI Service - Full Startup
echo ========================================
echo.

REM Check if Docker is running
echo Checking Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo OK: Docker is running

REM Start Docker containers
echo.
echo Starting Docker containers...
docker-compose up -d

echo Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ========================================
echo Starting Components
echo ========================================
echo.

REM Check Python venv
if not exist "..\..\.venv\Scripts\python.exe" (
    echo Error: Virtual environment not found!
    echo Run: python -m venv ..\.venv
    pause
    exit /b 1
)

REM Start API Server
echo Starting API Server...
start "AI Service - API" cmd /k "cd /d %~dp0 && ..\..\..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak

REM Start Celery Worker
echo Starting Celery Worker...
start "AI Service - Worker" cmd /k "cd /d %~dp0 && ..\..\..\.venv\Scripts\python.exe -m celery -A app.workers.celery_app worker --loglevel=info --pool=solo"

timeout /t 3 /nobreak

REM Open browser
echo Opening Swagger UI...
start http://localhost:8000/docs

echo.
echo ========================================
echo AI Service is Running!
echo ========================================
echo.
echo Access Points:
echo   API Documentation: http://localhost:8000/docs
echo   RabbitMQ Manager: http://localhost:15672 (guest/guest)
echo   Kafka UI: http://localhost:8080
echo.
pause
