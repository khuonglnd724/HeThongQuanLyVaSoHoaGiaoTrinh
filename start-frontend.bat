@echo off
REM ============================================
REM SMD Frontend - Single React SPA
REM Quick Start for Windows
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════╗
echo ║  SMD Frontend - Single React SPA      ║
echo ║  Port: 3000                           ║
echo ╚════════════════════════════════════════╝
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend\public-portal"

echo 📂 Frontend directory: %FRONTEND_DIR%
echo.

REM Check if frontend directory exists
if not exist "%FRONTEND_DIR%" (
    echo ❌ ERROR: Frontend directory not found!
    echo    Expected: %FRONTEND_DIR%
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "%FRONTEND_DIR%\node_modules" (
    echo 📥 Installing dependencies...
    cd /d "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo ❌ ERROR: npm install failed
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Start development server
echo 🚀 Starting development server...
echo ⏳ Server will start in a few seconds...
echo.
echo 📍 Access at: http://localhost:3000
echo.
echo 🔐 Demo Accounts:
echo    - Student:        student@smd.edu.vn / student123
echo    - Lecturer:       lecturer@smd.edu.vn / lecturer123
echo    - Academic:       academic@smd.edu.vn / academic123
echo    - Admin:          admin@smd.edu.vn / admin123
echo    - HoD:            hod@smd.edu.vn / hod123
echo    - Rector:         rector@smd.edu.vn / rector123
echo.
echo ❌ To stop: Press Ctrl+C
echo.

cd /d "%FRONTEND_DIR%"
call npm start

pause
