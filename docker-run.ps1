#!/usr/bin/env pwsh

# SMD Microservices Docker Helper Script
# Usage: .\docker-run.ps1 [command]

param(
    [Parameter(Position = 0)]
    [ValidateSet('build', 'up', 'down', 'logs', 'clean', 'rebuild', 'status', 'help')]
    [string]$Command = 'help'
)

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

function Show-Help {
    Write-Host @"
╔═══════════════════════════════════════════════════════╗
║     SMD Microservices - Docker Helper Script         ║
╚═══════════════════════════════════════════════════════╝

Usage: .\docker-run.ps1 [command]

Commands:
  build              🔨 Build all Docker images
  up                 🚀 Start all services
  down               🛑 Stop all services
  logs               📋 Show logs from all containers
  clean              🧹 Clean up Docker resources
  rebuild            🔄 Full rebuild (clean + build + up)
  status             📊 Show container status
  help               ℹ️  Show this help message

Examples:
  .\docker-run.ps1 build
  .\docker-run.ps1 up
  .\docker-run.ps1 rebuild

"@
}

function Build-Images {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
    docker-compose build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build complete!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}

function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Cyan
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📌 Access points:" -ForegroundColor Yellow
        Write-Host "   Frontend: http://localhost:3000 or http://localhost:3001" -ForegroundColor White
        Write-Host "   API Gateway: http://localhost:8080" -ForegroundColor White
        Write-Host "   Discovery Server: http://localhost:8761" -ForegroundColor White
        Write-Host ""
        Write-Host "Use: .\docker-run.ps1 logs   to see logs" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Failed to start services!" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "🛑 Stopping services..." -ForegroundColor Cyan
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services stopped!" -ForegroundColor Green
    }
}

function Show-Logs {
    Write-Host "📋 Logs (Press Ctrl+C to stop):" -ForegroundColor Cyan
    docker-compose logs -f
}

function Clean-Resources {
    Write-Host "🧹 Cleaning Docker resources..." -ForegroundColor Cyan
    docker-compose down -v
    Write-Host "Removing dangling images..." -ForegroundColor Gray
    docker image prune -f --filter "dangling=true"
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
}

function Rebuild-All {
    Write-Host "🔄 Full rebuild starting..." -ForegroundColor Cyan
    Clean-Resources
    Build-Images
    Start-Services
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "📊 Resource Usage:" -ForegroundColor Cyan
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main switch
switch ($Command) {
    'build' { Build-Images }
    'up' { Start-Services }
    'down' { Stop-Services }
    'logs' { Show-Logs }
    'clean' { Clean-Resources }
    'rebuild' { Rebuild-All }
    'status' { Show-Status }
    'help' { Show-Help }
    default { Show-Help }
}
