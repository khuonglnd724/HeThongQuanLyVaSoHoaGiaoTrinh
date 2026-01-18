Write-Host "===== TESTING SMD MICROSERVICES VIA API GATEWAY =====" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "1. LOGIN via API Gateway..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/auth/login" -Body $loginBody -ContentType "application/json"
    Write-Host "   ✓ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResult.username)" -ForegroundColor Gray
    Write-Host "   Roles: $($loginResult.roles -join ', ')" -ForegroundColor Gray
    $token = $loginResult.token
} catch {
    Write-Host "   ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test Academic Service
Write-Host "2. ACADEMIC SERVICE via API Gateway..." -ForegroundColor Yellow
$authHeaders = @{
    'Authorization' = "Bearer $token"
}

try {
    $academic = Invoke-RestMethod -Uri "http://localhost:8080/api/academic/syllabuses" -Headers $authHeaders
    Write-Host "   ✓ Academic Service OK!" -ForegroundColor Green
    Write-Host "   Response: $($academic | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Academic Service Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Syllabus Service  
Write-Host "3. SYLLABUS SERVICE via API Gateway..." -ForegroundColor Yellow
try {
    $syllabus = Invoke-RestMethod -Uri "http://localhost:8080/api/syllabus/documents" -Headers $authHeaders
    Write-Host "   ✓ Syllabus Service OK!" -ForegroundColor Green
    Write-Host "   Response: $($syllabus | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Syllabus Service Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===== TEST COMPLETE =====" -ForegroundColor Cyan
