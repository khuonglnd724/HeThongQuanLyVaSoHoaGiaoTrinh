@echo off
REM AI Service Startup Script for Windows CMD
REM Usage: startup-all.bat
REM Note: Run root docker-compose first: docker-compose up -d

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ========================================
echo AI Service - Startup (Local Mode)
echo ========================================
echo.
echo [!] This script runs API and Worker locally
echo [!] Infrastructure (RabbitMQ/Redis/Kafka) must be running from root docker-compose
echo.

REM Check if required containers are running
echo [*] Checking infrastructure containers...

docker ps --filter "name=smd-rabbitmq" --filter "status=running" --format "{{.Names}}" | findstr /C:"smd-rabbitmq" >nul
if errorlevel 1 set MISSING=1

docker ps --filter "name=smd-redis" --filter "status=running" --format "{{.Names}}" | findstr /C:"smd-redis" >nul
if errorlevel 1 set MISSING=1

docker ps --filter "name=smd-kafka" --filter "status=running" --format "{{.Names}}" | findstr /C:"smd-kafka" >nul
if errorlevel 1 set MISSING=1

if defined MISSING (
    echo [!] Required containers not running: smd-rabbitmq, smd-redis, smd-kafka
    echo.
    echo [*] Please start infrastructure from project root:
    echo     cd ..
    echo     docker-compose up -d rabbitmq redis kafka zookeeper
    echo.
    echo Or start all services:
    echo     docker-compose up -d
    echo.
    pause
    exit /b 1
)

echo [+] Infrastructure containers are running

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
echo [*] Access Points:
echo     API Documentation: http://localhost:8000/docs
echo     RabbitMQ Manager: http://localhost:15672 (guest/guest)
echo     Kafka UI: http://localhost:8089
echo.
echo [*] Tips:
echo     - Close windows to stop API/Worker
echo     - From project root, run: docker-compose down (to stop infrastructure)
echo.
pause
