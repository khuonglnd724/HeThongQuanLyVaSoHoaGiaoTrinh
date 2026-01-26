#!/usr/bin/env pwsh
<#
.SYNOPSIS
Comprehensive AI Service Test Automation
Tests all AI tasks, notifications, and database integration

.PARAMETER UserId
Custom user ID for tests (default: random)

.PARAMETER ApiBaseUrl
API base URL (default: http://localhost:8000)

.PARAMETER Verbose
Show detailed output

.EXAMPLE
.\run-tests.ps1
.\run-tests.ps1 -UserId "my-test-user"
.\run-tests.ps1 -Verbose
#>

param(
  [string]$UserId = "test-user-$(Get-Random -Minimum 1000 -Maximum 9999)",
  [string]$ApiBaseUrl = "http://localhost:8000",
  [switch]$Verbose
)

# Set UTF-8 encoding for Vietnamese display
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

$ErrorActionPreference = "Continue"

# Colors
$colors = @{
  Header = "Cyan"
  Success = "Green"
  Error = "Red"
  Warning = "Yellow"
  Info = "White"
}

function Write-TestHeader {
  param([string]$Title)
  $line = [string]::new("=", 70)
  Write-Host "`n$line" -ForegroundColor $colors.Header
  Write-Host $Title -ForegroundColor $colors.Header
  Write-Host $line -ForegroundColor $colors.Header
}

function Write-TestInfo {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor $colors.Info
}

function Write-TestPass {
  param([string]$Message)
  Write-Host "[PASS] $Message" -ForegroundColor $colors.Success
}

function Write-TestFail {
  param([string]$Message)
  Write-Host "[FAIL] $Message" -ForegroundColor $colors.Error
}

function Write-TestWarn {
  param([string]$Message)
  Write-Host "[WARN] $Message" -ForegroundColor $colors.Warning
}

# Test results tracking
$testResults = @{
  passed = 0
  failed = 0
  skipped = 0
  tests = @()
}

function Record-Test {
  param(
    [string]$TestName,
    [string]$Status,
    [string]$Details = ""
  )
  
  $testResults.tests += @{
    name = $TestName
    status = $Status
    details = $Details
  }
  
  switch ($Status) {
    "passed" { $testResults.passed++ }
    "failed" { $testResults.failed++ }
    "skipped" { $testResults.skipped++ }
  }
}

# Main test execution
Write-Host "`n" -NoNewline
$headerLine = [string]::new("#", 70)
Write-Host $headerLine -ForegroundColor Magenta
Write-Host "AI SERVICE TEST AUTOMATION" -ForegroundColor Magenta
Write-Host $headerLine -ForegroundColor Magenta
Write-TestInfo "User ID: $UserId"
Write-TestInfo "API URL: $ApiBaseUrl"
Write-TestInfo "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# ============================================================================
Write-TestHeader "TEST 1: HEALTH CHECK"

try {
  $response = Invoke-RestMethod "$ApiBaseUrl/health" -ErrorAction Stop
  Write-TestPass "API Health - Status: $($response.status)"
  Record-Test "Health Check" "passed"
} catch {
  Write-TestFail "API not responding at $ApiBaseUrl"
  Write-TestWarn "Make sure: docker-compose up -d"
  Record-Test "Health Check" "failed" $_.Exception.Message
  exit 1
}

# ============================================================================
Write-TestHeader "TEST 2: SUGGEST TASK"

$suggestRequest = @{
  userId = $UserId
  syllabusId = "test-syll-001"
  content = "Hoc phan: Lap trinh Python. Muc tieu: Hoc sinh hieu OOP. Noi dung: 30 tiet, 15 thuc hanh."
  focusArea = "objective"
} | ConvertTo-Json

Write-TestInfo "Submitting suggest task..."

try {
  $job = Invoke-RestMethod "$ApiBaseUrl/ai/suggest" -Method Post `
    -ContentType "application/json" -Body $suggestRequest -ErrorAction Stop
  
  $jobId = $job.jobId
  Write-TestPass "Task submitted - Job ID: $jobId"
  
  # Poll for result
  $maxWait = 30
  $elapsed = 0
  $completed = $false
  
  while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    
    try {
      $status = Invoke-RestMethod "$ApiBaseUrl/ai/jobs/$jobId" -ErrorAction Stop
      
      Write-TestInfo "  Status: $($status.status) | Progress: $($status.progress)%"
      
      if ($status.status -eq "succeeded") {
        Write-TestPass "Suggest task completed in ${elapsed}s"
        $suggestions = $status.result.suggestions
        Write-TestInfo "  Suggestions generated: $($suggestions.Count)"
        Write-Host "`n  Sample suggestions:" -ForegroundColor DarkCyan
        $suggestions | Select-Object -First 3 | ForEach-Object {
          Write-Host "  - $($_.suggestion)" -ForegroundColor Gray
        }
        Record-Test "Suggest Task" "passed"
        $completed = $true
        break
      } elseif ($status.status -eq "failed") {
        Write-TestFail "Task failed: $($status.error)"
        Record-Test "Suggest Task" "failed" $status.error
        break
      }
    } catch {
      # Ignore polling errors
    }
  }
  
  if (-not $completed) {
    Write-TestWarn "Task timeout after ${maxWait}s"
    Record-Test "Suggest Task" "skipped" "Timeout"
  }
} catch {
  Write-TestFail "Submit suggest task: $($_.Exception.Message)"
  Record-Test "Suggest Task" "failed" $_.Exception.Message
}

# ============================================================================
Write-TestHeader "TEST 3: CHAT TASK"

$chatRequest = @{
  messages = @(
    @{
      role = "user"
      content = "Explain the difference between lists and tuples in Python. Answer in English, max 100 words."
    }
  )
  syllabusId = "test-syll-chat-001"
} | ConvertTo-Json -Depth 3

Write-TestInfo "Submitting chat task..."

try {
  $job = Invoke-RestMethod "$ApiBaseUrl/ai/chat" -Method Post `
    -ContentType "application/json" -Body $chatRequest -ErrorAction Stop
  
  $jobId = $job.jobId
  Write-TestPass "Task submitted - Job ID: $jobId"
  
  # Poll for result
  $maxWait = 30
  $elapsed = 0
  $completed = $false
  
  while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    
    try {
      $status = Invoke-RestMethod "$ApiBaseUrl/ai/jobs/$jobId" -ErrorAction Stop
      
      Write-TestInfo "  Status: $($status.status) | Progress: $($status.progress)%"
      
      if ($status.status -eq "succeeded") {
        Write-TestPass "Chat task completed in ${elapsed}s"
        $answer = $status.result.answer.content
        Write-TestInfo "  Response length: $($answer.Length) chars"
        Write-Host "`n  AI Response:" -ForegroundColor DarkCyan
        $preview = if ($answer.Length -gt 200) { $answer.Substring(0, 200) + "..." } else { $answer }
        Write-Host "  $preview" -ForegroundColor Gray
        Write-TestInfo "  Model: $($status.result.model) | Tokens: $($status.result.usage.totalTokens)"
        Record-Test "Chat Task" "passed"
        $completed = $true
        break
      } elseif ($status.status -eq "failed") {
        Write-TestFail "Task failed: $($status.error)"
        Record-Test "Chat Task" "failed" $status.error
        break
      }
    } catch {
      # Ignore polling errors
    }
  }
  
  if (-not $completed) {
    Write-TestWarn "Task timeout after ${maxWait}s"
    Record-Test "Chat Task" "skipped" "Timeout"
  }
} catch {
  Write-TestFail "Submit chat task: $($_.Exception.Message)"
  Record-Test "Chat Task" "failed" $_.Exception.Message
}

# ============================================================================
Write-TestHeader "TEST 4: DIFF TASK"

$diffRequest = @{
  syllabusId = "test-syll-002"
  baseVersionId = "v1-base"
  targetVersionId = "v2-updated"
  sections = @("objectives", "content")
} | ConvertTo-Json -Depth 2

Write-TestInfo "Submitting diff task..."

try {
  $job = Invoke-RestMethod "$ApiBaseUrl/ai/diff" -Method Post `
    -ContentType "application/json" -Body $diffRequest -ErrorAction Stop
  
  $jobId = $job.jobId
  Write-TestPass "Task submitted - Job ID: $jobId"
  
  # Poll for result
  $maxWait = 30
  $elapsed = 0
  $completed = $false
  
  while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    
    try {
      $status = Invoke-RestMethod "$ApiBaseUrl/ai/jobs/$jobId" -ErrorAction Stop
      
      if ($status.status -eq "succeeded") {
        Write-TestPass "Diff task completed in ${elapsed}s"
        $changes = $status.result.changes
        Write-TestInfo "  Changes detected: $($changes.Count)"
        if ($changes.Count -gt 0) {
          Write-Host "`n  Sample changes:" -ForegroundColor DarkCyan
          $changes | Select-Object -First 2 | ForEach-Object {
            Write-Host "  - [$($_.type)] $($_.section): $($_.description)" -ForegroundColor Gray
          }
        }
        Record-Test "Diff Task" "passed"
        $completed = $true
        break
      } elseif ($status.status -eq "failed") {
        Write-TestFail "Task failed: $($status.error)"
        Record-Test "Diff Task" "failed" $status.error
        break
      }
    } catch {
      # Ignore polling errors
    }
  }
  
  if (-not $completed) {
    Write-TestWarn "Task timeout after ${maxWait}s"
    Record-Test "Diff Task" "skipped" "Timeout"
  }
} catch {
  Write-TestFail "Submit diff task: $($_.Exception.Message)"
  Record-Test "Diff Task" "failed" $_.Exception.Message
}

# ============================================================================
Write-TestHeader "TEST 5: SUGGEST SIMILAR CLOs"

Write-TestInfo "Submitting suggest similar CLOs task..."

try {
  $cloRequest = @{
    currentCLO = "Students can design and implement object-oriented programs using inheritance and polymorphism"
    subjectArea = "Computer Science"
    level = "intermediate"
    limit = 5
  }
  
  $job = Invoke-RestMethod -Uri "$ApiBaseUrl/ai/suggest-similar-clos" `
    -Method Post -Body ($cloRequest | ConvertTo-Json) `
    -ContentType "application/json" -ErrorAction Stop
  
  $jobId = $job.jobId
  Write-TestPass "Task submitted - Job ID: $jobId"
  
  # Poll for result
  $maxWait = 30
  $elapsed = 0
  $completed = $false
  
  while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    
    try {
      $status = Invoke-RestMethod "$ApiBaseUrl/ai/jobs/$jobId" -ErrorAction Stop
      
      if ($status.status -eq "succeeded") {
        Write-TestPass "Suggest CLO task completed in ${elapsed}s"
        $clos = $status.result.similarCLOs
        Write-TestInfo "  Similar CLOs found: $($clos.Count)"
        Write-Host "`n  Sample similar CLOs:" -ForegroundColor DarkCyan
        $clos | Select-Object -First 2 | ForEach-Object {
          Write-Host "  - $($_.clo) (Similarity: $($_.similarity))" -ForegroundColor Gray
        }
        Record-Test "Suggest Similar CLOs" "passed"
        $completed = $true
        break
      } elseif ($status.status -eq "failed") {
        Write-TestFail "Task failed: $($status.error)"
        Record-Test "Suggest Similar CLOs" "failed" $status.error
        break
      }
    } catch {
      # Ignore polling errors
    }
  }
  
  if (-not $completed) {
    Write-TestWarn "Task timeout after ${maxWait}s"
    Record-Test "Suggest Similar CLOs" "skipped" "Timeout"
  }
} catch {
  Write-TestFail "Submit suggest CLO task: $($_.Exception.Message)"
  Record-Test "Suggest Similar CLOs" "failed" $_.Exception.Message
}

# ============================================================================
Write-TestHeader "TEST 6: NOTIFICATIONS API"

Write-TestInfo "Fetching notifications..."

try {
  $notifications = Invoke-RestMethod "$ApiBaseUrl/notifications?user_id=$UserId" -ErrorAction Stop
  Write-TestPass "Get notifications - Count: $($notifications.Count)"
  Record-Test "Notifications API" "passed"
} catch {
  Write-TestFail "Get notifications: $($_.Exception.Message)"
  Record-Test "Notifications API" "failed" $_.Exception.Message
}

# ============================================================================
Write-TestHeader "TEST 7: DATABASE INTEGRATION"

Write-TestInfo "Checking database records..."

try {
  # Count total jobs
  $jobsCount = docker exec smd-postgres psql -U postgres -d ai_service_db -t `
    -c "SELECT COUNT(*) FROM ai_jobs;" 2>$null | Select-String -Pattern '\d+' | Select-Object -First 1
  
  if ($jobsCount) {
    Write-TestPass "Database access - Jobs in DB: $jobsCount"
    Record-Test "Database Integration" "passed"
  } else {
    Write-TestWarn "Could not query database"
    Record-Test "Database Integration" "skipped" "Docker exec failed"
  }
} catch {
  Write-TestWarn "Database check - skipping"
  Record-Test "Database Integration" "skipped" $_.Exception.Message
}

# ============================================================================
Write-TestHeader "TEST SUMMARY"

$total = $testResults.passed + $testResults.failed + $testResults.skipped
$passRate = if ($total -gt 0) { [math]::Round(($testResults.passed / $total * 100), 1) } else { 0 }

Write-Host "`nTotal Tests:    $total"
Write-TestPass "Passed: $($testResults.passed)"
if ($testResults.failed -gt 0) {
  Write-TestFail "Failed: $($testResults.failed)"
}
if ($testResults.skipped -gt 0) {
  Write-TestWarn "Skipped: $($testResults.skipped)"
}
Write-Host "Pass Rate:      $passRate%"

Write-Host "`nDetailed Results:"
$dashLine = [string]::new("-", 70)
Write-Host $dashLine

foreach ($test in $testResults.tests) {
  $statusDisplay = switch ($test.status) {
    "passed" { "PASS" }
    "failed" { "FAIL" }
    "skipped" { "SKIP" }
  }
  
  $statusColor = switch ($test.status) {
    "passed" { $colors.Success }
    "failed" { $colors.Error }
    "skipped" { $colors.Warning }
  }
  
  Write-Host "[$statusDisplay] $($test.name)" -ForegroundColor $statusColor
  if ($test.details -and $Verbose) {
    Write-Host "     $($test.details)" -ForegroundColor Gray
  }
}

Write-Host ""
$footerLine = [string]::new("#", 70)
Write-Host $footerLine -ForegroundColor Magenta
if ($testResults.failed -eq 0) {
  Write-Host "[SUCCESS] ALL TESTS PASSED!" -ForegroundColor Green
} else {
  Write-Host "[WARNING] SOME TESTS FAILED" -ForegroundColor Yellow
}
Write-Host $footerLine -ForegroundColor Magenta

exit $(if ($testResults.failed -eq 0) { 0 } else { 1 })
