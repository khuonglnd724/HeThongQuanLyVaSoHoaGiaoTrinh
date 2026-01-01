# API REFERENCE - AI SERVICE

**Version:** 1.0 | **Base URL:** `http://localhost:8000` | **Port:** 8000

---

## 🎯 TỔNG QUAN

AI Service cung cấp các API để xử lý tác vụ AI bất đồng bộ sử dụng Groq API (LLaMA 3.3 70B). 

**Kiến trúc:**
- **FastAPI**: REST API server
- **Celery Worker**: Xử lý background tasks
- **RabbitMQ**: Message queue
- **PostgreSQL**: Lưu trữ jobs & results
- **Redis**: Cache & session
- **Groq API**: LLaMA 3.3 70B model

**Luồng hoạt động:**
1. Client gửi request → API trả về `jobId` (202 Accepted)
2. Celery worker xử lý task bất đồng bộ
3. Client poll `/ai/jobs/{jobId}` để lấy kết quả
4. Kết quả được lưu trong PostgreSQL

---

## 📋 DANH SÁCH ENDPOINTS

### Health & Monitoring

#### GET /health
**Mục đích:** Kiểm tra trạng thái service

**Không cần authentication**

**Request:**
```bash
curl http://localhost:8000/health
```

**Response 200 OK:**
```json
{
  "status": "ok",
  "message": "AI Service is running",
  "timestamp": "2026-01-01T10:30:00Z",
  "version": "1.0.0"
}
```

**Use Cases:**
- Health check cho load balancer
- Monitoring system checks
- Container orchestration readiness probe

---

#### GET /metrics
**Mục đích:** Prometheus metrics cho monitoring

**Request:**
```bash
curl http://localhost:8000/metrics
```

**Response:** Prometheus text format
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/health"} 1234
...
```

---

### AI Tasks (Async Pattern)

**Quy trình chung cho tất cả AI tasks:**

1. **Submit Task** → Nhận `jobId`
2. **Poll Status** → Kiểm tra `status` và `progress`
3. **Get Result** → Khi `status = "succeeded"`, đọc `result`

---

#### POST /ai/suggest
**Mục đích:** AI đề xuất cải thiện giáo trình

**Authentication:** Required (JWT Bearer Token)

**Request Body:**
```json
{
  "userId": "user-123",
  "syllabusId": "syll-456",
  "content": "Hoc phan: Machine Learning. Muc tieu: Hieu algorithms...",
  "focusArea": "assessment"
}
```

**Parameters:**
- `userId` (string, optional) - ID người dùng yêu cầu
- `syllabusId` (string, required) - ID giáo trình cần phân tích
- `content` (string, required) - Nội dung giáo trình đầy đủ
- `focusArea` (string, optional) - Trọng tâm gợi ý: `"assessment"`, `"content"`, `"objective"`, `"method"`, `"reference"`

**Response 202 Accepted:**
```json
{
  "jobId": "f99b549a-bce7-4bf5-9882-f6e6d9d9cf29",
  "status": "queued",
  "message": "Suggest task queued successfully"
}
```

**Polling Result (GET /ai/jobs/{jobId}):**
```json
{
  "jobId": "f99b549a-bce7-4bf5-9882-f6e6d9d9cf29",
  "taskType": "suggest",
  "status": "succeeded",
  "progress": 100,
  "result": {
    "jobId": "f99b549a-bce7-4bf5-9882-f6e6d9d9cf29",
    "suggestions": [
      {
        "type": "objective",
        "text": "Xac dinh ro muc tieu hoc phan cu the, do luong duoc va phu hop voi chuan dau ra",
        "score": 0.9,
        "priority": "high"
      },
      {
        "type": "assessment",
        "text": "Xay dung he thong danh gia toan dien, bao gom ca danh gia qua trinh va cuoi ky",
        "score": 0.8,
        "priority": "high"
      },
      {
        "type": "content",
        "text": "Cung cap thong tin chi tiet ve noi dung hoc phan, bao gom cac chu de chinh",
        "score": 0.8,
        "priority": "high"
      }
    ],
    "summary": "De cuong can bo sung them chi tiet ve muc tieu, noi dung, phuong phap giang day va danh gia",
    "tokens": 1245,
    "model": "llama-3.3-70b-versatile"
  },
  "createdAt": "2026-01-01T10:47:35Z",
  "updatedAt": "2026-01-01T10:47:37Z"
}
```

**Curl Example:**
```bash
# Step 1: Submit task
RESPONSE=$(curl -X POST http://localhost:8000/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "syllabusId": "syll-ML-2024",
    "content": "Mon hoc: Machine Learning. Muc tieu: Sinh vien hieu cac thuat toan ML...",
    "focusArea": "assessment"
  }')

JOB_ID=$(echo $RESPONSE | jq -r '.jobId')

# Step 2: Poll for result
sleep 3
curl http://localhost:8000/ai/jobs/$JOB_ID | jq '.'
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Task creation failed

**Processing Time:** 2-4 seconds

---

#### POST /ai/chat
**Mục đích:** Chat với AI assistant về giáo trình

**Authentication:** Optional (recommended for tracking)

**Request Body (NEW SCHEMA):**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the difference between lists and tuples in Python?"
    }
  ],
  "syllabusId": "syll-python-101",
  "conversationId": "conv-abc123",
  "contextVersionId": "v2.1"
}
```

**Parameters:**
- `messages` (array, required) - Danh sách messages trong conversation
  - `role` (string): `"user"` hoặc `"assistant"` hoặc `"system"`
  - `content` (string): Nội dung message
- `syllabusId` (string, optional) - ID giáo trình làm context
- `conversationId` (string, optional) - ID conversation để tiếp tục chat, nếu không có sẽ tạo mới
- `contextVersionId` (string, optional) - Version của syllabus context

**Response 202 Accepted:**
```json
{
  "jobId": "deca752d-135d-4ddc-8951-91b4574a5759",
  "status": "queued",
  "message": "Chat task queued successfully"
}
```

**Polling Result:**
```json
{
  "jobId": "deca752d-135d-4ddc-8951-91b4574a5759",
  "taskType": "chat",
  "status": "succeeded",
  "progress": 100,
  "result": {
    "jobId": "deca752d-135d-4ddc-8951-91b4574a5759",
    "conversationId": "0bf7f484-bfab-402e-881f-96ad8d340888",
    "answer": {
      "content": "In Python, lists and tuples are data structures that store multiple values. The key difference is mutability: lists are mutable (can be modified) and defined using square brackets [], whereas tuples are immutable (cannot be modified) and defined using parentheses (). For example, my_list = [1, 2, 3] can be modified, but my_tuple = (1, 2, 3) cannot.",
      "citations": []
    },
    "usage": {
      "promptTokens": 241,
      "completionTokens": 105,
      "totalTokens": 346
    },
    "model": "llama-3.3-70b-versatile"
  },
  "createdAt": "2026-01-01T10:47:37Z",
  "updatedAt": "2026-01-01T10:47:38Z"
}
```

**Multi-turn Conversation Example:**
```bash
# First message
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is OOP?"}],
    "syllabusId": "cs101"
  }' | jq -r '.jobId' > job1.txt

# Get result and conversationId
sleep 3
CONV_ID=$(curl http://localhost:8000/ai/jobs/$(cat job1.txt) | jq -r '.result.conversationId')

# Second message in same conversation
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"messages\": [{\"role\": \"user\", \"content\": \"Give me an example\"}],
    \"conversationId\": \"$CONV_ID\",
    \"syllabusId\": \"cs101\"
  }"
```

**Processing Time:** 2-5 seconds (depends on conversation history length)

---

#### POST /ai/diff
**Mục đích:** So sánh 2 phiên bản giáo trình và phát hiện thay đổi

**Request Body:**
```json
{
  "syllabusId": "syll-ML-2024",
  "baseVersionId": "v1.0",
  "targetVersionId": "v2.0",
  "sections": ["objectives", "content", "assessment"]
}
```

**Parameters:**
- `syllabusId` (string, required) - ID giáo trình
- `baseVersionId` (string, required) - Version cũ để so sánh
- `targetVersionId` (string, required) - Version mới để so sánh
- `sections` (array, optional) - Các phần cần so sánh: `["objectives", "content", "methods", "assessment", "references"]`

**Response 202:**
```json
{
  "jobId": "bf99ed46-d98f-493b-b13a-8b209ca2ac13",
  "status": "queued"
}
```

**Polling Result:**
```json
{
  "jobId": "bf99ed46-d98f-493b-b13a-8b209ca2ac13",
  "status": "succeeded",
  "result": {
    "jobId": "bf99ed46-d98f-493b-b13a-8b209ca2ac13",
    "diffs": [
      {
        "section": "objectives",
        "type": "modified",
        "description": "Added 2 new learning objectives focusing on deep learning",
        "severity": "high",
        "oldValue": "3 learning objectives",
        "newValue": "5 learning objectives"
      },
      {
        "section": "assessment",
        "type": "added",
        "description": "Introduced final project worth 40%",
        "severity": "high"
      }
    ],
    "summary": "Major changes in learning objectives and assessment structure. Added deep learning focus and project-based evaluation.",
    "impactLevel": "high",
    "tokens": 445,
    "model": "llama-3.3-70b-versatile"
  }
}
```

**Impact Levels:**
- `low`: Minor changes (typos, formatting)
- `medium`: Content updates, additional references
- `high`: Learning objectives, assessment changes, major content revision

**Processing Time:** 2-6 seconds

---

#### POST /ai/suggest-similar-clos
**Mục đích:** Tìm kiếm CLOs tương tự từ database bằng AI semantic search

**Request Body:**
```json
{
  "currentCLO": "Students can design and implement object-oriented programs using inheritance and polymorphism",
  "subjectArea": "Computer Science",
  "level": "intermediate",
  "limit": 5
}
```

**Parameters:**
- `currentCLO` (string, required) - CLO cần tìm các CLO tương tự
- `subjectArea` (string, optional) - Lọc theo lĩnh vực: `"Computer Science"`, `"Mathematics"`, `"Engineering"`, etc.
- `level` (string, optional) - Mức độ: `"beginner"`, `"intermediate"`, `"advanced"`
- `limit` (integer, optional, default: 5) - Số lượng kết quả tối đa (1-10)

**Response 202:**
```json
{
  "jobId": "3ae8ab64-3807-4170-afb0-6125381ecc55",
  "status": "queued"
}
```

**Polling Result:**
```json
{
  "jobId": "3ae8ab64-3807-4170-afb0-6125381ecc55",
  "status": "succeeded",
  "result": {
    "similarCLOs": [
      {
        "clo": "Students can develop and test algorithms using recursion and dynamic programming",
        "subject": "Computer Science",
        "syllabusId": "SYL-2024-001",
        "similarity": 0.85,
        "context": "Similar action verbs (design, develop) and cognitive levels, with focus on programming concepts"
      },
      {
        "clo": "Students can analyze and optimize data structures using object-oriented principles",
        "subject": "Computer Science",
        "syllabusId": "SYL-2024-002",
        "similarity": 0.82,
        "context": "Related learning objectives focusing on OOP and algorithm analysis"
      },
      {
        "clo": "Students can create software systems using design patterns and SOLID principles",
        "subject": "Software Engineering",
        "syllabusId": "SYL-2024-003",
        "similarity": 0.78,
        "context": "Similar cognitive level (application) with focus on software design"
      }
    ],
    "searchedCLO": "Students can design and implement object-oriented programs using inheritance and polymorphism",
    "totalFound": 5
  }
}
```

**Notes:**
- Similarity score: 0.0 - 1.0 (higher = more similar)
- Uses AI để generate similar CLOs nếu database không có dữ liệu
- Context giải thích tại sao CLO được coi là tương tự

**Processing Time:** 1-3 seconds

---

### Job Management

#### GET /ai/jobs/{jobId}
**Mục đích:** Lấy trạng thái và kết quả của job

**Authentication:** Optional

**Parameters:**
- `jobId` (path, required) - UUID của job

**Request:**
```bash
curl http://localhost:8000/ai/jobs/f99b549a-bce7-4bf5-9882-f6e6d9d9cf29
```

**Response - Job Running (200 OK):**
```json
{
  "jobId": "f99b549a-bce7-4bf5-9882-f6e6d9d9cf29",
  "taskType": "suggest",
  "status": "running",
  "progress": 60,
  "createdAt": "2026-01-01T10:47:35Z",
  "updatedAt": "2026-01-01T10:47:36Z",
  "meta": {
    "syllabusId": "syll-ML-2024",
    "focusArea": "assessment"
  },
  "result": null,
  "error": null
}
```

**Response - Job Succeeded (200 OK):**
```json
{
  "jobId": "f99b549a-bce7-4bf5-9882-f6e6d9d9cf29",
  "taskType": "suggest",
  "status": "succeeded",
  "progress": 100,
  "createdAt": "2026-01-01T10:47:35Z",
  "updatedAt": "2026-01-01T10:47:37Z",
  "meta": {...},
  "result": {
    "suggestions": [...],
    "summary": "...",
    "tokens": 1245
  },
  "error": null
}
```

**Response - Job Failed (200 OK):**
```json
{
  "jobId": "f99b549a-bce7-4bf5-9882-f6e6d9d9cf29",
  "taskType": "suggest",
  "status": "failed",
  "progress": 30,
  "createdAt": "2026-01-01T10:47:35Z",
  "updatedAt": "2026-01-01T10:47:36Z",
  "meta": {...},
  "result": null,
  "error": "Rate limit exceeded: 429 from Groq API"
}
```

**Status Values:**
- `queued` - Job đang chờ xử lý
- `running` - Job đang được worker xử lý
- `succeeded` - Job hoàn thành thành công, có `result`
- `failed` - Job thất bại, có `error`
- `canceled` - Job bị hủy

**Error Response:**
- `404 Not Found`: Job không tồn tại
```json
{
  "detail": "Job not found"
}
```

**Polling Pattern:**
```javascript
async function pollJobResult(jobId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`http://localhost:8000/ai/jobs/${jobId}`);
    const data = await response.json();
    
    if (data.status === 'succeeded') {
      return data.result;
    } else if (data.status === 'failed') {
      throw new Error(data.error);
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Job timeout');
}
```

---

#### POST /ai/jobs/{jobId}/cancel
**Mục đích:** Hủy job đang chạy

**Request:**
```bash
curl -X POST http://localhost:8000/ai/jobs/abc123/cancel
```

**Response 200 OK:**
```json
{
  "message": "Job cancellation requested",
  "jobId": "abc123"
}
```

**Note:** Job có thể không bị hủy ngay lập tức nếu đang xử lý AI request

---

#### GET /ai/notifications
**Mục đích:** Lấy danh sách notifications cho user

**Query Parameters:**
- `userId` (string, optional) - Lọc theo user
- `limit` (integer, optional, default: 50) - Số lượng tối đa

**Request:**
```bash
curl "http://localhost:8000/ai/notifications?userId=user123&limit=10"
```

**Response 200 OK:**
```json
{
  "notifications": [
    {
      "id": 1,
      "jobId": "job_abc123",
      "userId": "user123",
      "title": "Suggest task completed",
      "message": "Your syllabus analysis is ready",
      "type": "success",
      "read": false,
      "createdAt": "2026-01-01T10:50:00Z"
    }
  ],
  "total": 5,
  "unread": 3
}
```

---

## 🔐 AUTHENTICATION

### JWT Token (Optional)

Hầu hết endpoints **không yêu cầu authentication** để thuận tiện test và development.

**Khi nào cần authentication:**
- Production environment
- Multi-tenant deployments
- User-specific data isolation

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lấy token từ Auth Service:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 📊 RESPONSE CODES

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request thành công (health, job status) |
| 202 | Accepted | Task đã được queue, poll để lấy kết quả |
| 400 | Bad Request | Thiếu hoặc sai parameters |
| 401 | Unauthorized | Token không hợp lệ (nếu require auth) |
| 404 | Not Found | Job không tồn tại |
| 429 | Too Many Requests | Rate limit từ Groq API (14k tokens/min) |
| 500 | Internal Server Error | Lỗi server, worker, hoặc database |
| 503 | Service Unavailable | Service đang restart hoặc không healthy |

---

## ⏱️ PERFORMANCE & TIMING

**Thời gian xử lý trung bình (với Groq API):**

| Task Type | Avg Time | Max Time | Notes |
|-----------|----------|----------|-------|
| Health Check | <100ms | - | Sync endpoint |
| Suggest | 2-3s | 5s | 7 suggestions, ~1200 tokens |
| Chat | 2-4s | 8s | Depends on conversation history |
| Diff | 2-3s | 7s | Semantic comparison |
| Suggest CLOs | 1-2s | 3s | AI generation of similar CLOs |

**Rate Limits (Groq Free Tier):**
- **14,000 tokens/minute** (~7-10 requests/min)
- Service tự động retry với exponential backoff
- Client nên implement rate limiting

**Timeout Settings:**
- API request timeout: 60s
- Worker task timeout: 120s
- Celery result backend: Redis (24h expiration)

---

## 🛠️ ERROR HANDLING

### Common Errors

**1. Rate Limit (429)**
```json
{
  "jobId": "abc123",
  "status": "failed",
  "error": "Rate limit exceeded: Groq API returned 429. Please wait before retrying."
}
```
**Solution:** Implement exponential backoff, queue requests

**2. Groq API Error (500)**
```json
{
  "jobId": "abc123",
  "status": "failed",
  "error": "Groq API error: Connection timeout"
}
```
**Solution:** Service tự động retry 2 lần, nếu vẫn fail thì báo lỗi

**3. Invalid Schema (400)**
```json
{
  "detail": [
    {
      "loc": ["body", "messages"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
**Solution:** Kiểm tra request body schema

**4. Job Not Found (404)**
```json
{
  "detail": "Job not found"
}
```
**Solution:** Kiểm tra jobId, job có thể đã bị xóa sau 24h

---

## 📝 BEST PRACTICES

### 1. Polling Strategy

**Recommended:**
```python
import time
import requests

def poll_job(job_id, max_attempts=30, interval=2):
    """Poll job with exponential backoff"""
    base_url = "http://localhost:8000"
    
    for attempt in range(max_attempts):
        response = requests.get(f"{base_url}/ai/jobs/{job_id}")
        
        if response.status_code == 404:
            raise Exception("Job not found")
            
        data = response.json()
        
        if data['status'] == 'succeeded':
            return data['result']
        elif data['status'] == 'failed':
            raise Exception(f"Job failed: {data['error']}")
        
        # Exponential backoff: 2s, 4s, 8s, ...
        wait_time = min(interval * (2 ** (attempt // 5)), 30)
        time.sleep(wait_time)
    
    raise TimeoutError(f"Job {job_id} did not complete in time")
```

### 2. Error Handling

```typescript
async function submitAITask(endpoint: string, payload: any) {
  try {
    // Submit task
    const response = await fetch(`http://localhost:8000/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Task submission failed');
    }
    
    const { jobId } = await response.json();
    
    // Poll for result
    return await pollJobResult(jobId);
    
  } catch (error) {
    console.error('AI Task Error:', error);
    throw error;
  }
}
```

### 3. Conversation Management

```javascript
class ChatSession {
  constructor(syllabusId) {
    this.syllabusId = syllabusId;
    this.conversationId = null;
    this.messages = [];
  }
  
  async sendMessage(content) {
    // Add user message to history
    this.messages.push({ role: 'user', content });
    
    // Submit chat request
    const response = await fetch('http://localhost:8000/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: this.messages,
        syllabusId: this.syllabusId,
        conversationId: this.conversationId
      })
    });
    
    const { jobId } = await response.json();
    const result = await pollJobResult(jobId);
    
    // Update conversation ID if first message
    if (!this.conversationId) {
      this.conversationId = result.conversationId;
    }
    
    // Add assistant response to history
    this.messages.push({
      role: 'assistant',
      content: result.answer.content
    });
    
    return result.answer;
  }
}
```

### 4. Batch Processing

```python
import asyncio
import aiohttp

async def process_multiple_syllabuses(syllabuses):
    """Process multiple syllabuses concurrently"""
    async with aiohttp.ClientSession() as session:
        # Submit all tasks
        tasks = []
        for syllabus in syllabuses:
            task = submit_suggest_task(session, syllabus)
            tasks.append(task)
        
        job_ids = await asyncio.gather(*tasks)
        
        # Poll all results
        results = []
        for job_id in job_ids:
            result = await poll_job_async(session, job_id)
            results.append(result)
        
        return results
```

---

## 🔗 INTEGRATION EXAMPLES

### React Frontend

```typescript
// hooks/useAITask.ts
import { useState, useCallback } from 'react';

interface AITaskResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  submit: (payload: any) => Promise<void>;
}

export function useAITask<T>(endpoint: string): AITaskResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const submit = useCallback(async (payload: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Submit task
      const response = await fetch(`http://localhost:8000/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const { jobId } = await response.json();
      
      // Poll for result
      const result = await pollJob(jobId);
      setData(result);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  return { data, loading, error, submit };
}

// Usage
function SuggestionsPanel({ syllabusId, content }) {
  const { data, loading, submit } = useAITask('suggest');
  
  const handleAnalyze = () => {
    submit({ syllabusId, content, focusArea: 'assessment' });
  };
  
  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Get AI Suggestions'}
      </button>
      
      {data?.suggestions.map(s => (
        <div key={s.text}>
          <span>{s.type}</span>: {s.text}
        </div>
      ))}
    </div>
  );
}
```

### Spring Boot Backend

```java
@Service
public class AIServiceClient {
    
    private final RestTemplate restTemplate;
    private final String aiServiceUrl = "http://localhost:8000";
    
    public CompletableFuture<SuggestResult> getSuggestions(
        String syllabusId, 
        String content
    ) {
        // Submit task
        SuggestRequest request = new SuggestRequest(syllabusId, content);
        JobResponse jobResponse = restTemplate.postForObject(
            aiServiceUrl + "/ai/suggest",
            request,
            JobResponse.class
        );
        
        String jobId = jobResponse.getJobId();
        
        // Poll in background
        return CompletableFuture.supplyAsync(() -> {
            return pollJobResult(jobId, SuggestResult.class);
        });
    }
    
    private <T> T pollJobResult(String jobId, Class<T> resultClass) {
        int maxAttempts = 30;
        
        for (int i = 0; i < maxAttempts; i++) {
            JobStatusResponse status = restTemplate.getForObject(
                aiServiceUrl + "/ai/jobs/" + jobId,
                JobStatusResponse.class
            );
            
            if ("succeeded".equals(status.getStatus())) {
                return objectMapper.convertValue(
                    status.getResult(), 
                    resultClass
                );
            } else if ("failed".equals(status.getStatus())) {
                throw new AIServiceException(status.getError());
            }
            
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(e);
            }
        }
        
        throw new TimeoutException("Job did not complete");
    }
}
```

---

## 📚 INTERACTIVE API DOCUMENTATION

**Swagger UI (Recommended):**
```
http://localhost:8000/docs
```
- Interactive API testing
- Auto-generated từ FastAPI
- Try out endpoints directly
- View request/response schemas

**ReDoc (Alternative):**
```
http://localhost:8000/redoc
```
- Clean documentation layout
- Better for reading
- Không có interactive testing

**OpenAPI JSON:**
```
http://localhost:8000/openapi.json
```
- Raw OpenAPI 3.0 specification
- Import vào Postman, Insomnia, etc.

---

## 🧪 TESTING

**Run Comprehensive Test Suite:**
```powershell
cd backend/ai-service/test
powershell -ExecutionPolicy Bypass -File .\run-tests.ps1
```

**Quick Smoke Test:**
```powershell
cd backend/ai-service/test
powershell -ExecutionPolicy Bypass -File .\quick-test.ps1
```

**Manual API Testing:**
```bash
# Test health
curl http://localhost:8000/health

# Test suggest
curl -X POST http://localhost:8000/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{"syllabusId":"test","content":"Test content"}' | jq '.jobId'

# Poll result (replace JOB_ID)
curl http://localhost:8000/ai/jobs/JOB_ID | jq '.'
```

---

## 🔧 TROUBLESHOOTING

### Service không khởi động

**Check logs:**
```bash
docker logs ai-service --tail 50
docker logs ai-worker --tail 50
```

**Common issues:**
- PostgreSQL chưa ready → Wait for healthcheck
- RabbitMQ connection failed → Check rabbitmq container
- Groq API key missing → Set `GROQ_API_KEY` in .env

### Job stuck ở "queued"

**Kiểm tra:**
1. Worker có đang chạy không?
   ```bash
   docker ps | grep ai-worker
   ```

2. Check worker logs
   ```bash
   docker logs ai-worker --tail 20
   ```

3. RabbitMQ có tasks không?
   ```bash
   # Open RabbitMQ UI
   http://localhost:15672
   # Login: guest/guest
   # Check queues → celery
   ```

### Rate limit errors

**Groq API free tier limit: 14k tokens/min**

**Solutions:**
- Wait 1 minute and retry
- Upgrade to Groq paid plan
- Implement request queuing

### Database connection errors

```bash
# Check PostgreSQL
docker exec -it smd-postgres psql -U postgres -d ai_service_db -c "\dt"

# Check tables
docker exec -it smd-postgres psql -U postgres -d ai_service_db -c "SELECT COUNT(*) FROM ai_jobs;"
```

---

**Last Updated:** 01/01/2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (100% Tests Passed)
**Model:** Groq LLaMA 3.3 70B Versatile
        "type": "content",
        "text": "Add more recent references...",
        "score": 0.7,
        "priority": "medium"
      }
    ],
    "summary": "Course has good structure but needs better assessment",
    "tokens": 245,
    "model": "llama-3.3-70b-versatile"
  }
}
```

---

#### POST /api/ai/chat
**Mục đích:** Chat Q&A với AI assistant

**Request Body:**
```json
{
  "userId": "user123",
  "syllabusId": "syll456",
  "conversationId": "conv789",
  "message": "What are the main learning outcomes?",
  "syllabusContext": "Machine Learning course that covers..."
}
```

**Parameters:**
- `userId` (string, required)
- `syllabusId` (string, required)
- `conversationId` (string, optional)
- `message` (string, required) - User question
- `syllabusContext` (string, optional) - Syllabus content for context

**Response (202):**
```json
{
  "jobId": "job_xyz789",
  "status": "queued"
}
```

**Result:**
```json
{
  "jobId": "job_xyz789",
  "status": "succeeded",
  "progress": 100,
  "result": {
    "conversationId": "conv789",
    "answer": {
      "content": "The main learning outcomes are...",
      "citations": ["Section 2", "Chapter 3"]
    },
    "usage": {
      "promptTokens": 150,
      "completionTokens": 100,
      "totalTokens": 250
    },
    "model": "llama-3.3-70b-versatile"
  }
}
```

---

#### POST /api/ai/diff
**Mục đích:** So sánh 2 phiên bản giáo trình

**Request Body:**
```json
{
  "userId": "user123",
  "syllabusId": "syll456",
  "oldContent": "Old syllabus version...",
  "newContent": "New syllabus version..."
}
```

**Result:**
```json
{
  "jobId": "job_diff123",
  "status": "succeeded",
  "result": {
    "diffs": [
      {
        "section": "Learning Outcomes",
        "changeType": "modified",
        "detail": "Added 2 new CLOs",
        "severity": "high",
        "oldValue": "3 CLOs",
        "newValue": "5 CLOs"
      }
    ],
    "summary": "Major changes in learning outcomes and assessment",
    "impactLevel": "high",
    "tokens": 320
  }
}
```

---

#### POST /api/ai/clo-check
**Mục đích:** Kiểm tra alignment giữa CLO và PLO

**Request Body:**
```json
{
  "userId": "user123",
  "syllabusId": "syll456",
  "clos": [
    {
      "id": "CLO1",
      "description": "Understand machine learning fundamentals"
    },
    {
      "id": "CLO2",
      "description": "Implement supervised learning algorithms"
    }
  ],
  "plos": [
    {
      "id": "PLO1",
      "description": "Master AI and ML concepts"
    }
  ],
  "mapping": {
    "CLO1": "PLO1",
    "CLO2": "PLO1"
  }
}
```

**Result:**
```json
{
  "jobId": "job_clo123",
  "status": "succeeded",
  "result": {
    "report": {
      "issues": [
        {
          "type": "weak_alignment",
          "clo": "CLO2",
          "plo": "PLO1",
          "description": "CLO is too specific for PLO",
          "severity": "warning"
        }
      ],
      "mappingSuggestions": [
        {
          "clo": "CLO2",
          "suggestedPlo": ["PLO1"],
          "reason": "Covers AI implementation",
          "confidence": 0.85
        }
      ]
    },
    "score": 7.5,
    "summary": "Generally good alignment with minor issues",
    "tokens": 280
  }
}
```

---

#### POST /api/ai/summary
**Mục đích:** Tóm tắt nội dung giáo trình

**Request Body:**
```json
{
  "userId": "user123",
  "syllabusId": "syll456",
  "content": "Full syllabus content here...",
  "length": "medium"
}
```

**Parameters:**
- `length` (enum) - "short" (100-150 words) | "medium" (200-300) | "long" (400-500)

**Result:**
```json
{
  "jobId": "job_sum123",
  "status": "succeeded",
  "result": {
    "summary": "This course provides comprehensive introduction to ML...",
    "bullets": [
      "Covers supervised and unsupervised learning",
      "Hands-on implementation with Python",
      "Real-world case studies"
    ],
    "keywords": ["machine learning", "algorithms", "AI"],
    "targetAudience": "Advanced undergraduates and postgraduates",
    "prerequisites": "Python programming, Linear Algebra",
    "tokens": 215
  }
}
```

---

#### POST /api/ai/suggest-similar-clos
**Mục đích:** Gợi ý CLO tương tự từ database

**Request Body:**
```json
{
  "userId": "user123",
  "currentCLO": "Understand machine learning algorithms",
  "subjectArea": "AI",
  "level": "application",
  "limit": 5
}
```

**Result:**
```json
{
  "jobId": "job_clo_search",
  "status": "succeeded",
  "result": {
    "similarCLOs": [
      {
        "cloId": "AI101_CLO2",
        "description": "Apply machine learning techniques to real datasets",
        "subject": "Data Science",
        "level": "application",
        "similarity": 0.92,
        "reason": "Similar scope and complexity"
      }
    ],
    "totalFound": 3
  }
}
```

---

### Job Status

#### GET /api/ai/jobs/{jobId}
**Mục đích:** Lấy trạng thái công việc

```bash
curl http://localhost:8000/api/ai/jobs/job_abc123 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (In Progress):**
```json
{
  "jobId": "job_abc123",
  "taskType": "suggest",
  "status": "running",
  "progress": 45,
  "startedAt": "2025-12-29T10:15:00Z",
  "estimatedCompletion": "2025-12-29T10:20:00Z"
}
```

**Response (Failed):**
```json
{
  "jobId": "job_abc123",
  "taskType": "suggest",
  "status": "failed",
  "progress": 30,
  "error": "Rate limit exceeded",
  "timestamp": "2025-12-29T10:25:00Z"
}
```

---

## 🔐 AUTHENTICATION

### JWT Token

**Required Header:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Exception:** `/health` endpoint không cần token

### Getting JWT Token

```bash
# Gửi request đến API Gateway hoặc Auth Service
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password"
  }'

# Response:
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "tokenType": "Bearer"
}
```

---

## 🔄 STATUS CODES

| Code | Meaning | Notes |
|------|---------|-------|
| 200 | OK | Health check, health endpoint |
| 202 | Accepted | Task queued successfully |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Job ID not found |
| 429 | Too Many Requests | Rate limited by Groq API |
| 500 | Server Error | Internal error |

---

## ⏱️ RESPONSE TIMES

**Typical Processing Times:**

| Task | Time | Notes |
|------|------|-------|
| Suggest | 2-5s | Groq API latency |
| Chat | 3-8s | With conversation history |
| Diff | 3-7s | Semantic analysis |
| CLO-Check | 5-10s | Complex validation |
| Summary | 2-4s | Shorter content |
| Suggest-CLO | 1-3s | Database lookup |

---

## 🔗 FULL EXAMPLE

```bash
# 1. Check health
curl http://localhost:8000/health

# 2. Submit suggest task (with JWT)
RESPONSE=$(curl -X POST http://localhost:8000/api/ai/suggest \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "syllabusId": "syll456",
    "content": "Machine Learning course...",
    "focusArea": "assessment"
  }')

# Extract jobId
JOB_ID=$(echo $RESPONSE | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)

# 3. Poll for result
curl http://localhost:8000/api/ai/jobs/$JOB_ID \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## 📚 INTERACTIVE API DOCS

**Swagger UI (Recommended):**
```
http://localhost:8000/docs
```

**ReDoc:**
```
http://localhost:8000/redoc
```

---

**Last Updated:** 29/12/2025  
**Status:** ✅ Complete
