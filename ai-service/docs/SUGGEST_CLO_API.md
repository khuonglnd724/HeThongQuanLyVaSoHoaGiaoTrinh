# Suggest Similar CLOs - API Documentation

## Overview

The Suggest Similar CLOs endpoint helps Lecturers find similar Course Learning Outcomes (CLOs) from existing syllabuses when writing new CLOs. This AI-powered feature provides semantic search capabilities to discover related learning outcomes based on:
- Current CLO description
- Subject area
- Academic level
- Bloom's taxonomy keywords

## Endpoint

```
POST /ai/suggest-similar-clos
```

**Returns:** 202 Accepted with `job_id` for async processing

## Request Schema

```json
{
  "currentCLO": "string (required)",
  "subjectArea": "string (optional)",
  "level": "string (optional)",
  "limit": "integer (optional, default: 5, max: 20)"
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| currentCLO | string | ✅ Yes | - | The CLO description you want to find similar outcomes for |
| subjectArea | string | ❌ No | null | Subject domain to filter results (e.g., "Computer Science", "Mathematics") |
| level | string | ❌ No | null | Academic level (e.g., "beginner", "intermediate", "advanced") |
| limit | integer | ❌ No | 5 | Number of similar CLOs to return (1-20) |

## Response Schema

**Immediate Response (202):**
```json
{
  "job_id": "uuid-string",
  "status": "QUEUED"
}
```

**Job Result (GET /ai/jobs/{job_id}):**
```json
{
  "id": "uuid-string",
  "status": "SUCCEEDED",
  "task_type": "suggest_clo",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:30:02Z",
  "result": {
    "similarCLOs": [
      {
        "clo": "Students can design and implement database schemas using normalization",
        "subject": "Computer Science",
        "level": "intermediate",
        "similarity": 85,
        "reasoning": "Both focus on design and implementation skills in CS domain"
      },
      {
        "clo": "Students can develop web applications using MVC architecture",
        "subject": "Software Engineering",
        "level": "intermediate",
        "similarity": 78,
        "reasoning": "Similar application development and architectural design concepts"
      }
    ],
    "searchedCLO": "Students can design and implement object-oriented programs using inheritance",
    "totalFound": 2
  }
}
```

## Examples

### Example 1: Basic Request

**Request:**
```bash
curl -X POST http://localhost:8083/ai/suggest-similar-clos \
  -H "Content-Type: application/json" \
  -d '{
    "currentCLO": "Students can analyze and solve complex problems using algorithms"
  }'
```

**Response:**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "QUEUED"
}
```

### Example 2: With Subject Area and Level

**Request:**
```bash
curl -X POST http://localhost:8083/ai/suggest-similar-clos \
  -H "Content-Type: application/json" \
  -d '{
    "currentCLO": "Students can design secure network architectures",
    "subjectArea": "Computer Science",
    "level": "advanced",
    "limit": 3
  }'
```

**Response:**
```json
{
  "job_id": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
  "status": "QUEUED"
}
```

### Example 3: PowerShell Script

**test-suggest-clo.ps1:**
```powershell
$baseUrl = "http://localhost:8083"

# Submit request
$request = @{
    currentCLO = "Students can evaluate ethical implications of AI systems"
    subjectArea = "Computer Science"
    level = "advanced"
    limit = 5
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$baseUrl/ai/suggest-similar-clos" `
    -Method Post `
    -Body $request `
    -ContentType "application/json"

$jobId = $response.job_id
Write-Host "Job ID: $jobId"

# Poll for result
$maxAttempts = 15
for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 2
    
    $status = Invoke-RestMethod -Uri "$baseUrl/ai/jobs/$jobId"
    Write-Host "[$i] Status: $($status.status)"
    
    if ($status.status -eq "SUCCEEDED") {
        Write-Host "`nSimilar CLOs found:"
        $status.result.similarCLOs | ForEach-Object {
            Write-Host "`n  CLO: $($_.clo)"
            Write-Host "  Subject: $($_.subject)"
            Write-Host "  Level: $($_.level)"
            Write-Host "  Similarity: $($_.similarity)%"
            Write-Host "  Reason: $($_.reasoning)"
        }
        break
    }
}
```

## Use Cases

### 1. Writing New CLOs
When a Lecturer is drafting a new CLO, they can use this endpoint to:
- Find inspiration from similar existing CLOs
- Ensure consistency across syllabuses
- Discover better phrasing alternatives
- Verify alignment with department standards

### 2. CLO Library Discovery
Administrators can use this to:
- Build a repository of effective CLOs
- Identify duplicate or redundant CLOs
- Standardize learning outcomes across courses
- Map CLO progression across curriculum

### 3. Quality Assurance
Department heads can:
- Validate new CLO proposals against successful examples
- Ensure appropriate difficulty progression
- Maintain subject-area consistency
- Review and improve existing CLOs

## Implementation Details

### AI Processing

The endpoint uses the Groq API (llama-3.3-70b-versatile) to:
1. Analyze the semantic meaning of the input CLO
2. Generate similar CLO examples based on:
   - Action verbs (Bloom's taxonomy)
   - Subject matter keywords
   - Cognitive complexity level
   - Learning domain context
3. Score similarity (0-100) based on:
   - Semantic similarity
   - Action verb matching
   - Subject area relevance
   - Level appropriateness

### Performance

- **Average Response Time:** 2-3 seconds
- **Concurrent Requests:** Supported via Celery queue
- **Rate Limits:** Groq FREE tier ~14,000 tokens/minute
- **Caching:** Results cached in Redis for 1 hour

### Error Handling

**Common Errors:**

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing currentCLO | Provide required field |
| 400 | Invalid limit (>20) | Use limit between 1-20 |
| 500 | AI service unavailable | Check Groq API key in .env |
| 500 | Worker not running | Start Celery worker: `celery -A app.workers.celery_app worker` |

## Testing

### Quick Test (30 seconds)
```powershell
cd ai-service/test
.\test-suggest-clo.ps1
```

### Comprehensive Test Suite (includes all endpoints)
```powershell
cd ai-service/test
.\run-tests.ps1
```

## Integration

### Frontend Integration

**React Example:**
```javascript
async function findSimilarCLOs(currentCLO) {
  // Submit task
  const response = await fetch('http://localhost:8083/ai/suggest-similar-clos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentCLO: currentCLO,
      subjectArea: 'Computer Science',
      level: 'intermediate',
      limit: 5
    })
  });
  
  const { job_id } = await response.json();
  
  // Poll for result
  return pollJobStatus(job_id);
}

async function pollJobStatus(jobId) {
  const maxAttempts = 15;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`http://localhost:8083/ai/jobs/${jobId}`);
    const job = await response.json();
    
    if (job.status === 'SUCCEEDED') {
      return job.result.similarCLOs;
    } else if (job.status === 'FAILED') {
      throw new Error(job.error);
    }
  }
  
  throw new Error('Timeout waiting for results');
}
```

## Related Endpoints

- **POST /ai/suggest** - Generate syllabus content suggestions
- **POST /ai/clo-check** - Validate CLO-PLO mappings
- **GET /ai/jobs/{job_id}** - Get job status and results

## Additional Resources

- [AI Service Documentation](AI_SERVICE.md)
- [Quick Start Guide](QUICK_START.md)
- [Test Scripts](../test/)
