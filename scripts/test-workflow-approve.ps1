# Test workflow approve API
param(
    [string]$WorkflowId = "217cac6f-c154-4266-82c7-bf1249b6964c",
    [string]$ActionBy = "hod01",
    [string]$Role = "ROLE_HOD"
)

$gatewayUrl = "http://localhost:8080"

Write-Host "=== Testing Workflow Approve ===" -ForegroundColor Cyan
Write-Host "Workflow ID: $WorkflowId" -ForegroundColor Yellow
Write-Host "Action By: $ActionBy" -ForegroundColor Yellow
Write-Host "Role: $Role" -ForegroundColor Yellow

# Step 1: Check workflow status
Write-Host "`n[1] Checking workflow status..." -ForegroundColor Cyan
try {
    $workflow = Invoke-RestMethod -Uri "$gatewayUrl/api/workflows/$WorkflowId" -Method Get
    Write-Host "Current State: $($workflow.currentState)" -ForegroundColor $(if ($workflow.currentState -eq "REVIEW") { "Green" } elseif ($workflow.currentState -eq "APPROVED") { "Yellow" } else { "Red" })
    Write-Host "Entity ID: $($workflow.entityId)" -ForegroundColor Gray
    Write-Host "Entity Type: $($workflow.entityType)" -ForegroundColor Gray
    
    if ($workflow.currentState -ne "REVIEW") {
        Write-Host "`n WARNING: Workflow is not in REVIEW state!" -ForegroundColor Red
        Write-Host "Current state is: $($workflow.currentState)" -ForegroundColor Red
        if ($workflow.currentState -eq "APPROVED") {
            Write-Host "This workflow has already been approved. Cannot approve again." -ForegroundColor Yellow
        }
        Write-Host "`nTo approve a workflow, it must be in REVIEW state." -ForegroundColor Yellow
        Write-Host "You need to:" -ForegroundColor Yellow
        Write-Host "1. Create a new workflow in DRAFT state" -ForegroundColor Yellow
        Write-Host "2. SUBMIT it to move to REVIEW state" -ForegroundColor Yellow  
        Write-Host "3. Then APPROVE it" -ForegroundColor Yellow
        return
    }
} catch {
    Write-Host "Error checking workflow: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 2: Try to approve
Write-Host "`n[2] Attempting to approve workflow..." -ForegroundColor Cyan
try {
    $approveUrl = "$gatewayUrl/api/workflows/$WorkflowId/approve?actionBy=$ActionBy&role=$Role"
    Write-Host "URL: $approveUrl" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $approveUrl -Method Post -ContentType "application/json"
    
    Write-Host " SUCCESS! Workflow approved." -ForegroundColor Green
    Write-Host "New State: $response" -ForegroundColor Green
    
} catch {
    Write-Host " FAILED to approve workflow" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Error Response:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Gray
        
        # Try to parse JSON error
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            Write-Host "`nError Message: $($errorJson.message)" -ForegroundColor Yellow
        } catch {
            # Not JSON, just display raw
        }
    } catch {
        Write-Host "Could not read error response" -ForegroundColor Gray
    }
}

# Step 3: Check final state
Write-Host "`n[3] Checking final workflow status..." -ForegroundColor Cyan
try {
    $finalWorkflow = Invoke-RestMethod -Uri "$gatewayUrl/api/workflows/$WorkflowId" -Method Get
    Write-Host "Final State: $($finalWorkflow.currentState)" -ForegroundColor $(if ($finalWorkflow.currentState -eq "APPROVED") { "Green" } else { "Yellow" })
} catch {
    Write-Host "Error checking final status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
