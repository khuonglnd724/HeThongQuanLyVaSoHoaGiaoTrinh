Param(
  [string]$GroqApiKey
)
$ErrorActionPreference = "Stop"

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Environment Setup Script" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$envFile = Join-Path $PSScriptRoot "../docker/.env"
$envExample = Join-Path $PSScriptRoot "../docker/.env.example"

# Check if .env already exists
if (Test-Path $envFile) {
  Write-Host "`n[WARNING] .env file already exists!" -ForegroundColor Yellow
  $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
  if ($overwrite -ne "y" -and $overwrite -ne "Y") {
    Write-Host "Exiting without changes." -ForegroundColor Yellow
    exit 0
  }
}

# Check if .env.example exists
if (-not (Test-Path $envExample)) {
  Write-Host "`n[ERROR] ERROR: .env.example not found!" -ForegroundColor Red
  Write-Host "   Make sure you're running this from the project root." -ForegroundColor Red
  exit 1
}

Write-Host "`nSetting up environment configuration..." -ForegroundColor Green

# If API key not provided as parameter, prompt for it
if (-not $GroqApiKey) {
  Write-Host "`n" + "=" * 60 -ForegroundColor Yellow
  Write-Host "Groq API Key Setup (FREE!)" -ForegroundColor Yellow
  Write-Host "=" * 60 -ForegroundColor Yellow
  Write-Host "`nGroq provides FREE AI API with generous limits:" -ForegroundColor White
  Write-Host "  • ~14,000 tokens/minute" -ForegroundColor Cyan
  Write-Host "  • Multiple models (llama-3.3-70b, mixtral-8x7b, etc.)" -ForegroundColor Cyan
  Write-Host "  • Extremely fast inference (500+ tokens/second)" -ForegroundColor Cyan
  Write-Host "  • No credit card required!" -ForegroundColor Green
  
  Write-Host "`nTo get your FREE API key:" -ForegroundColor Yellow
  Write-Host "  1. Visit: https://console.groq.com/keys" -ForegroundColor White
  Write-Host "  2. Sign up (free, no credit card)" -ForegroundColor White
  Write-Host "  3. Click 'Create API Key'" -ForegroundColor White
  Write-Host "  4. Copy the key (starts with 'gsk_')" -ForegroundColor White
  
  Write-Host "`n"
  $GroqApiKey = Read-Host "Enter your Groq API key (or press Enter to skip)"
}

# Create .env file
Copy-Item $envExample $envFile

# Update API key if provided
if ($GroqApiKey -and $GroqApiKey -ne "") {
  $content = Get-Content $envFile -Raw
  $content = $content -replace "GROQ_API_KEY=your-groq-api-key-here", "GROQ_API_KEY=$GroqApiKey"
  Set-Content -Path $envFile -Value $content -NoNewline
  
  Write-Host "`n[OK] Environment file created with your Groq API key!" -ForegroundColor Green
} else {
  Write-Host "`n[WARNING] Environment file created, but API key not set!" -ForegroundColor Yellow
  Write-Host "   Edit .env file and add your Groq API key before starting services." -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  File created:  .env" -ForegroundColor White
Write-Host "  Location:      $(Resolve-Path $envFile)" -ForegroundColor White

if ($GroqApiKey -and $GroqApiKey -ne "") {
  Write-Host "  API Key:       Configured [OK]" -ForegroundColor Green
} else {
  Write-Host "  API Key:       Not configured [WARNING]" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 60 -ForegroundColor Green
Write-Host "Next Steps" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green

if (-not $GroqApiKey -or $GroqApiKey -eq "") {
  Write-Host "  1. Edit .env and add your Groq API key" -ForegroundColor Yellow
  Write-Host "     Get key from: https://console.groq.com/keys" -ForegroundColor Cyan
  Write-Host "  2. Build services: pwsh scripts/build-all.ps1" -ForegroundColor White
  Write-Host "  3. Start stack:    pwsh scripts/up.ps1" -ForegroundColor White
} else {
  Write-Host "  1. Build services: pwsh scripts/build-all.ps1" -ForegroundColor White
  Write-Host "  2. Start stack:    pwsh scripts/up.ps1" -ForegroundColor White
  Write-Host "  3. Test AI:        http://localhost:8000/docs" -ForegroundColor White
}

Write-Host "`nFor detailed setup guide:" -ForegroundColor Cyan
Write-Host "  • Quick start: DEPLOY.md" -ForegroundColor White
Write-Host "  • AI Service:  ai-service/PHASE_1_2_3_SETUP.md" -ForegroundColor White
