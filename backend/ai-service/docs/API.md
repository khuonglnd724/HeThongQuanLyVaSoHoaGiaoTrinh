# API REFERENCE - AI SERVICE

**Phiên bản:** 1.0 | **Base URL:** `http://localhost:8000` | **Auth:** JWT Token

---

## 📋 ENDPOINTS

### Health & Monitoring

#### GET /health
**Mục đích:** Kiểm tra trạng thái service

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "AI Service is running",
  "timestamp": "2025-12-29T10:30:00Z"
}
```

---

#### GET /metrics
**Mục đích:** Prometheus metrics

```bash
curl http://localhost:8000/metrics
```

**Response:** Prometheus format text

---

### AI Tasks (Async)

Tất cả AI task endpoints trả về **202 Accepted** với job ID. Client phải poll `/api/ai/jobs/{jobId}` để lấy kết quả.

---

#### POST /api/ai/suggest
**Mục đích:** Gợi ý cải thiện giáo trình

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123",
  "syllabusId": "syll456",
  "content": "Machine Learning course content here...",
  "focusArea": "assessment"
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `syllabusId` (string, required) - Syllabus ID
- `content` (string, required) - Syllabus content
- `focusArea` (string, optional) - Focus area for suggestions

**Response (202):**
```json
{
  "jobId": "job_abc123def456",
  "status": "queued",
  "message": "Task queued successfully"
}
```

**Poll Result:**
```bash
curl http://localhost:8000/api/ai/jobs/job_abc123def456 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Result (when done):**
```json
{
  "jobId": "job_abc123def456",
  "status": "succeeded",
  "progress": 100,
  "result": {
    "suggestions": [
      {
        "type": "assessment",
        "text": "Add more diverse assessment methods...",
        "score": 0.8,
        "priority": "high"
      },
      {
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
