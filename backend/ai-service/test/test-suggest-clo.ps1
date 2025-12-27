# test-suggest-clo.ps1
# Test script for Suggest Similar CLOs endpoint

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8083"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " TEST: Suggest Similar CLOs Endpoint" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "healthy") {
        Write-Host "[OK] AI Service is healthy" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] AI Service unhealthy: $($response.status)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[FAIL] Cannot connect to AI Service: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Submit Suggest Similar CLOs Request
Write-Host "[TEST 2] Submit Suggest Similar CLOs Request..." -ForegroundColor Yellow

$testRequest = @{
    currentCLO = "Students can design and implement object-oriented programs using inheritance and polymorphism"
    subjectArea = "Computer Science"
    level = "intermediate"
    limit = 5
} | ConvertTo-Json

Write-Host "[INFO] Request payload:" -ForegroundColor Cyan
Write-Host $testRequest -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/suggest-similar-clos" `
        -Method Post `
        -Body $testRequest `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    if ($response.job_id) {
        $jobId = $response.job_id
        Write-Host "[OK] Job created: $jobId" -ForegroundColor Green
        Write-Host "[INFO] Status: $($response.status)" -ForegroundColor Cyan
    } else {
        Write-Host "[FAIL] No job_id returned" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[FAIL] Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "[ERROR] Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}
Write-Host ""

# Test 3: Poll Job Status
Write-Host "[TEST 3] Poll Job Status (max 30 seconds)..." -ForegroundColor Yellow
$maxAttempts = 15
$attempt = 0
$jobCompleted = $false

while ($attempt -lt $maxAttempts -and -not $jobCompleted) {
    $attempt++
    Start-Sleep -Seconds 2
    
    try {
        $jobStatus = Invoke-RestMethod -Uri "$baseUrl/ai/jobs/$jobId" -Method Get -TimeoutSec 5
        $status = $jobStatus.status
        
        Write-Host "[POLL $attempt/$maxAttempts] Status: $status" -ForegroundColor Cyan
        
        if ($status -eq "SUCCEEDED") {
            $jobCompleted = $true
            Write-Host "[OK] Job completed successfully" -ForegroundColor Green
            
            # Display results
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host " RESULTS" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            
            $result = $jobStatus.result
            
            Write-Host "[INFO] Searched CLO: $($result.searchedCLO)" -ForegroundColor Cyan
            Write-Host "[INFO] Total Found: $($result.totalFound)" -ForegroundColor Cyan
            Write-Host ""
            
            if ($result.similarCLOs -and $result.similarCLOs.Count -gt 0) {
                Write-Host "Similar CLOs:" -ForegroundColor Yellow
                for ($i = 0; $i -lt $result.similarCLOs.Count; $i++) {
                    $clo = $result.similarCLOs[$i]
                    Write-Host ""
                    Write-Host "  [$($i+1)] $($clo.clo)" -ForegroundColor White
                    Write-Host "      Subject: $($clo.subject)" -ForegroundColor Gray
                    Write-Host "      Level: $($clo.level)" -ForegroundColor Gray
                    Write-Host "      Similarity: $($clo.similarity)%" -ForegroundColor Gray
                    if ($clo.reasoning) {
                        Write-Host "      Reason: $($clo.reasoning)" -ForegroundColor DarkGray
                    }
                }
            } else {
                Write-Host "[WARN] No similar CLOs found" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            
        } elseif ($status -eq "FAILED") {
            Write-Host "[FAIL] Job failed: $($jobStatus.error)" -ForegroundColor Red
            exit 1
        } elseif ($status -eq "RUNNING") {
            Write-Host "      Processing..." -ForegroundColor DarkGray
        }
        
    } catch {
        Write-Host "[WARN] Failed to get job status: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

if (-not $jobCompleted) {
    Write-Host "[TIMEOUT] Job did not complete within 30 seconds" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ALL TESTS PASSED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

exit 0
