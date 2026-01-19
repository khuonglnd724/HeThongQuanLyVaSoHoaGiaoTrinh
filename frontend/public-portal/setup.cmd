@echo off
REM Setup script for Windows

echo.
echo ===============================================
echo   Public Portal Frontend Setup
echo ===============================================
echo.

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js found: 
node --version

echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo 📝 Checking .env.local...
if not exist ".env.local" (
    echo Creating .env.local...
    copy .env.example .env.local
    echo ✅ Created .env.local - please update with your config
) else (
    echo ✅ .env.local already exists
)

echo.
echo 🎨 Installing Tailwind CSS...
call npm install -D tailwindcss postcss autoprefixer
if errorlevel 1 (
    echo ⚠️  Tailwind installation had issues, but continuing...
)

echo.
echo ===============================================
echo ✅ Setup Complete!
echo ===============================================
echo.
echo 🚀 To start development:
echo    npm start
echo.
echo 📦 To build for production:
echo    npm run build
echo.
echo 🐳 To build Docker image:
echo    docker build -t public-portal:latest .
echo.
pause
