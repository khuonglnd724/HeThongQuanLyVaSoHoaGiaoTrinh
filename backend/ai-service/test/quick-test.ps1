#!/usr/bin/env pwsh
<#
.SYNOPSIS
Quick AI Service Test - Minimal version for manual testing

.EXAMPLE
.\quick-test.ps1
#>

$UserId = "quick-test-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "`n[QUICK AI SERVICE TEST]`n" -ForegroundColor Cyan

# 1. Health check
Write-Host "[1] Health Check..." -ForegroundColor White
try {
  $health = Invoke-RestMethod http://localhost:8000/health
  Write-Host "    [OK] API Status: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host "    [ERROR] API not responding" -ForegroundColor Red
  exit 1
}

# 2. Submit Suggest Task
Write-Host "`n[2] Submitting Suggest Task..." -ForegroundColor White
$body = @{
  userId = $UserId
  syllabusId = "quick-test-001"
  content = "Hoc phan: Web Development`nMuc tieu: Xay dung ung dung web`nNoi dung: HTML, CSS, JavaScript"
  focusArea = "objective"
} | ConvertTo-Json

$job = Invoke-RestMethod http://localhost:8000/ai/suggest -Method Post -Body $body -ContentType application/json
$jobId = $job.jobId
Write-Host "    [OK] Job ID: $jobId" -ForegroundColor Green

# 3. Poll result
Write-Host "`n[3] Waiting for AI Processing..." -ForegroundColor White
$startTime = Get-Date
$timeout = 60  # 60 seconds

do {
  $status = Invoke-RestMethod http://localhost:8000/ai/jobs/$jobId
  $elapsed = (Get-Date) - $startTime
  $progress = $status.progress
  
  Write-Host "    [$($elapsed.Seconds)s] Status: $($status.status) | Progress: $progress%" -ForegroundColor Cyan
  
  if ($status.status -eq "succeeded") {
    Write-Host "`n    [OK] Task Completed!" -ForegroundColor Green
    break
  } elseif ($status.status -eq "failed") {
    Write-Host "`n    [ERROR] Task Failed: $($status.error)" -ForegroundColor Red
    exit 1
  }
  
  Start-Sleep -Seconds 2
} while ($elapsed.TotalSeconds -lt $timeout)

# 4. Display result
Write-Host "`n[4] Result Summary" -ForegroundColor White
$result = $status.result
$summaryPreview = $result.summary.Substring(0, [Math]::Min(80, $result.summary.Length))
Write-Host "    [SUGGESTIONS] Items: $($result.suggestions.Count)" -ForegroundColor Green
Write-Host "    [SUMMARY] $summaryPreview..." -ForegroundColor Green
Write-Host "    [MODEL] $($result.model)" -ForegroundColor Green
Write-Host "    [TOKENS] $($result.tokens)" -ForegroundColor Green

# 5. Check notifications
Write-Host "`n[5] Checking Notifications..." -ForegroundColor White
$notifications = Invoke-RestMethod "http://localhost:8000/notifications?user_id=$UserId"
Write-Host "    [NOTIFICATIONS] Total: $($notifications.Count)" -ForegroundColor Green
if ($notifications.Count -gt 0) {
  Write-Host "    [LATEST] $($notifications[0].title)" -ForegroundColor Green
}

Write-Host "`n[SUCCESS] Quick Test Complete!`n" -ForegroundColor Green
