@echo off
REM Run All Services Script for Windows

echo.
echo ===================================================
echo   HE THONG QUAN LY VA SO HOA GIAO TRINH
echo   All Services Startup
echo ===================================================
echo.

REM Check if Node.js and Java are installed
echo Checking prerequisites...
java -version >nul 2>&1 && echo ✓ Java is installed || (echo ✗ Java not found && exit /b 1)
npm --version >nul 2>&1 && echo ✓ Node.js/npm is installed || (echo ✗ Node.js not found && exit /b 1)
mvn --version >nul 2>&1 && echo ✓ Maven is installed || (echo ✗ Maven not found && exit /b 1)

echo.
echo Starting services...
echo.

REM Terminal 1: Backend
echo [1/2] Starting Backend (Java Spring Boot)...
start "Backend - Public Service" cmd /k "cd backend\public-service && mvn clean package -DskipTests && java -jar target/public-service-0.0.1-SNAPSHOT.jar"

REM Wait a bit for backend to start
timeout /t 5 /nobreak

REM Terminal 2: Frontend
echo [2/2] Starting Frontend (React)...
start "Frontend - Public Portal" cmd /k "cd frontend\public-portal && npm install --legacy-peer-deps && npm start"

echo.
echo ===================================================
echo ✓ All services started!
echo ===================================================
echo.
echo Backend: http://localhost:8083
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause
