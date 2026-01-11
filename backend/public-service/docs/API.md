# Public Service API Documentation

## Overview
Public Service provides read-only access to published syllabi with caching and optimization for high performance.

## Base URL
```
http://localhost:8083/api/public
```

---

## API Endpoints

### 1. Get Syllabus Detail
**Endpoint:** `GET /api/public/syllabi/{id}`

**Description:** Retrieve detailed information about a specific syllabus (read-only)

**Parameters:**
- `id` (path): Syllabus ID (required)

**Response (200 OK):**
```json
{
  "id": 1,
  "syllabusCode": "CS101_2024_V1",
  "version": 1,
  "academicYear": "2024-2025",
  "semester": 1,
  "subject": {
    "id": 1,
    "subjectCode": "CS101",
    "subjectName": "Introduction to Computer Science"
  },
  "content": "Detailed syllabus content...",
  "learningObjectives": "Students will learn...",
  "teachingMethods": "Lectures, practical sessions...",
  "assessmentMethods": "Exams, assignments, projects...",
  "status": "Published",
  "updatedAt": "2024-01-15T10:30:00",
  "approvalComments": "Approved..."
}
```

**Caching:** 6 hours TTL (Redis)

**Error Responses:**
- `404 Not Found`: Syllabus not found
- `500 Internal Server Error`: Server error

---

### 2. Get Subject Relationship Tree
**Endpoint:** `GET /api/public/syllabi/{id}/tree`

**Description:** Get subject relationship tree showing prerequisites and dependents

**Parameters:**
- `id` (path): Syllabus ID (required)

**Response (200 OK):**
```json
{
  "id": 1,
  "subject": {
    "id": 1,
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "semester": 1,
    "credits": 3,
    "prerequisites": [],
    "dependents": [
      {
        "id": 2,
        "code": "CS102",
        "name": "Data Structures",
        "semester": 2,
        "credits": 4,
        "relationshipType": "PREREQUISITE"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

**Caching:** 12 hours TTL (Redis)

**Error Responses:**
- `404 Not Found`: Syllabus or subject not found

---

### 3. Compare Syllabus Versions
**Endpoint:** `GET /api/public/syllabi/{id}/diff?targetVersion={version}`

**Description:** Compare current version with another version of the same syllabus

**Parameters:**
- `id` (path): Syllabus ID (required)
- `targetVersion` (query): Version to compare with (optional, defaults to previous version)

**Response (200 OK):**
```json
{
  "id": 1,
  "diff": {
    "oldVersion": {
      "id": 1,
      "version": 1,
      "academicYear": "2024-2025",
      "updatedAt": "2024-01-15T10:30:00",
      "status": "Published"
    },
    "newVersion": {
      "id": 2,
      "version": 2,
      "academicYear": "2024-2025",
      "updatedAt": "2024-02-01T14:45:00",
      "status": "Published"
    },
    "differences": [
      {
        "fieldName": "content",
        "fieldLabel": "Content",
        "oldValue": "Previous content...",
        "newValue": "Updated content...",
        "changeType": "MODIFIED",
        "hasHighlight": true
      }
    ],
    "summary": "Total changes: 3 (Modified: 3, Added: 0, Removed: 0)",
    "changePercentage": 15.5
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

**Caching:** 2 hours TTL (Redis)

**Error Responses:**
- `404 Not Found`: Syllabus or version not found
- `400 Bad Request`: Invalid version parameter

---

### 4. Follow/Subscribe to Syllabus
**Endpoint:** `POST /api/public/syllabi/{id}/follow`

**Description:** Subscribe to a syllabus to receive notifications of changes

**Parameters:**
- `id` (path): Syllabus ID (required)
- `userId` (query): User ID (optional)
- `email` (query): User email (optional)

**Request Body:** (none required)

**Response (200 OK):**
```json
{
  "syllabusId": 1,
  "isFollowing": true,
  "followCount": 45,
  "followedAt": 1705329000000,
  "notifyOnChange": true,
  "message": "Successfully followed syllabus"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid user ID or email
- `404 Not Found`: Syllabus not found

---

### 5. Unfollow Syllabus
**Endpoint:** `DELETE /api/public/syllabi/{id}/follow`

**Description:** Unsubscribe from a syllabus

**Parameters:**
- `id` (path): Syllabus ID (required)
- `userId` (query): User ID (required)

**Response (200 OK):**
```json
{
  "message": "Successfully unfollowed syllabus",
  "syllabusId": "1"
}
```

**Error Responses:**
- `400 Bad Request`: User not following this syllabus
- `404 Not Found`: Syllabus not found

---

### 6. Send Feedback
**Endpoint:** `POST /api/public/feedback`

**Description:** Submit feedback, suggestions, or report errors

**Request Body:**
```json
{
  "syllabusId": 1,
  "userId": 123,
  "userEmail": "student@example.com",
  "feedbackType": "ERROR",
  "title": "Missing learning objective",
  "message": "The learning objective for topic X is missing",
  "attachment": "optional-url-to-attachment"
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "syllabusId": 1,
  "feedbackType": "ERROR",
  "title": "Missing learning objective",
  "message": "The learning objective for topic X is missing",
  "status": "SUBMITTED",
  "createdAt": 1705329000000,
  "updatedAt": 1705329000000,
  "message_success": "Feedback submitted successfully"
}
```

**Feedback Types:**
- `ERROR`: Bug report or error in syllabus
- `SUGGESTION`: Improvement suggestion
- `QUESTION`: Question about syllabus
- `OTHER`: Other feedback

**Status Values:**
- `SUBMITTED`: Initial state
- `ACKNOWLEDGED`: Received by admin
- `RESOLVED`: Issue resolved
- `CLOSED`: Feedback closed

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid input
- `404 Not Found`: Syllabus not found

---

### 7. Export Syllabus as PDF
**Endpoint:** `GET /api/public/syllabi/{id}/export-pdf`

**Description:** Download syllabus as PDF file

**Parameters:**
- `id` (path): Syllabus ID (required)

**Response (200 OK):**
- Returns PDF file with Content-Type: `application/pdf`
- Filename: `{SUBJECT_CODE}_v{VERSION}.pdf`

**Example:** `CS101_v1.pdf`

**Error Responses:**
- `404 Not Found`: Syllabus not found
- `500 Internal Server Error`: PDF generation error

---

## Search Endpoints (Existing)

### Search Syllabi
**Endpoint:** `GET /api/public/syllabi/search`

**Parameters:**
- `q` (query): Search query
- `code` (query): Subject code
- `major` (query): Major name
- `semester` (query): Semester
- `year` (query): Academic year
- `version` (query): Version
- `sort` (query): Sort field (default: relevance)
- `page` (query): Page number (default: 1)
- `size` (query): Page size (default: 10)
- `fuzzy` (query): Enable fuzzy search (default: true)
- `highlight` (query): Enable highlighting (default: true)

**Response:** Paginated list of SyllabusSummary objects

---

## Performance Features

### Caching Strategy
- **Syllabus Details**: 6 hours TTL
- **Subject Trees**: 12 hours TTL  
- **Version Comparisons**: 2 hours TTL
- **Subject Lists**: 24 hours TTL

### Query Optimization
- Lazy loading for relationships
- Pagination for large results
- Full-text search using PostgreSQL
- Database indexing on key columns
- Connection pooling (max-active: 8)

### Response Compression
- Automatic gzip compression for large responses
- Minimal JSON output

---

## Error Handling

All endpoints return standardized error responses:

**404 Not Found:**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Syllabus not found: 999"
}
```

**400 Bad Request:**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid parameters"
}
```

**500 Internal Server Error:**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Security Notes

- All endpoints are read-only for public access
- Write operations (follow, feedback) require user identification
- All data is validated before processing
- SQL injection prevention through parameterized queries
- Cross-site scripting (XSS) protection

---

## Rate Limiting

Recommended rate limits:
- Search: 100 requests/minute
- Detail retrieval: 500 requests/minute
- Feedback submission: 10 requests/minute per user

---

## Example Usage

### Get Syllabus Details
```bash
curl -X GET "http://localhost:8083/api/public/syllabi/1" \
  -H "Accept: application/json"
```

### Search for Syllabi
```bash
curl -X GET "http://localhost:8083/api/public/syllabi/search?q=database&semester=2" \
  -H "Accept: application/json"
```

### Export as PDF
```bash
curl -X GET "http://localhost:8083/api/public/syllabi/1/export-pdf" \
  -H "Accept: application/pdf" \
  -o syllabus.pdf
```

### Submit Feedback
```bash
curl -X POST "http://localhost:8083/api/public/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "syllabusId": 1,
    "userId": 123,
    "userEmail": "student@example.com",
    "feedbackType": "SUGGESTION",
    "title": "Add more examples",
    "message": "Please add more practical examples"
  }'
```

---

## Dependencies

### Required Libraries
- Spring Boot 3.2.0
- Spring Data JPA
- PostgreSQL Driver
- iText PDF (for PDF export)
- Redis (for caching)
- Lombok

### Configuration
- Redis: `redis:6379`
- PostgreSQL: `postgres:5432`
- Public Database: `public_db`

---

## Monitoring

### Health Check
```bash
curl http://localhost:8083/actuator/health
```

### Metrics
```bash
curl http://localhost:8083/actuator/metrics
```

---

## Version History
- v1.0.0 (2024-01-15): Initial release with syllabus detail, tree, diff, follow, feedback, and PDF export
