# API REFERENCE - Hệ Thống Quản Lý và Số Hóa Giáo Trình

Tài liệu này liệt kê toàn bộ API endpoints của dự án. Sử dụng để tra cứu và tích hợp.

**Ngày cập nhật:** 22/01/2026
**Phiên bản:** 1.0.0

---

## 📋 MỤC LỤC

1. [Auth Service](#auth-service)
2. [Academic Service](#academic-service)
3. [Syllabus Service](#syllabus-service)
4. [Workflow Service](#workflow-service)
5. [Public Service](#public-service)
6. [AI Service](#ai-service)
7. [API Gateway](#api-gateway)

---

## 🔐 AUTH SERVICE

**Port:** 8001 (Development)
**Base URL:** `/api/auth`, `/api/users`, `/api/roles`, `/api/system`, `/api/services`

### Authentication Endpoints

#### POST /api/auth/register
**Mô tả:** Đăng ký tài khoản người dùng mới
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Response:** `AuthResponse` (201 Created)

#### POST /api/auth/login
**Mô tả:** Đăng nhập người dùng
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:** `AuthResponse` (200 OK)
- Trả về access token, refresh token, và thông tin user

#### POST /api/auth/refresh
**Mô tả:** Làm mới access token bằng refresh token
**Request Body:**
```json
{
  "refreshToken": "string"
}
```
**Response:** `AuthResponse` (200 OK)

#### POST /api/auth/logout
**Mô tả:** Đăng xuất người dùng
**Headers:** `Authorization: Bearer <token>`
**Response:** 200 OK

---

### User Management

#### GET /api/users
**Mô tả:** Lấy danh sách tất cả người dùng (phân trang)
**Authorization:** ADMIN
**Query Parameters:**
- `page` (int, default=0)
- `size` (int, default=20)
**Response:** Page<UserDTO> (200 OK)

#### GET /api/users/{id}
**Mô tả:** Lấy thông tin chi tiết người dùng theo ID
**Authorization:** ADMIN
**Response:** UserDTO (200 OK)

#### POST /api/users
**Mô tả:** Tạo người dùng mới (admin only)
**Authorization:** ADMIN
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}
```
**Response:** UserDTO (201 Created)

#### PUT /api/users/{id}
**Mô tả:** Cập nhật thông tin người dùng
**Authorization:** ADMIN
**Request Body:** RegisterRequest
**Response:** UserDTO (200 OK)

#### DELETE /api/users/{id}
**Mô tả:** Xóa người dùng
**Authorization:** ADMIN
**Response:** 200 OK

#### PUT /api/users/{id}/lock
**Mô tả:** Khóa tài khoản người dùng
**Authorization:** ADMIN
**Response:** UserDTO (200 OK)

#### PUT /api/users/{id}/unlock
**Mô tả:** Mở khóa tài khoản người dùng
**Authorization:** ADMIN
**Response:** UserDTO (200 OK)

#### POST /api/users/reset-password
**Mô tả:** Đặt lại mật khẩu
**Request Body:**
```json
{
  "email": "string",
  "newPassword": "string"
}
```
**Response:** 200 OK

---

### Role Management

#### GET /api/roles
**Mô tả:** Lấy danh sách tất cả roles với permissions
**Authorization:** ADMIN
**Response:** List<RoleDTO> (200 OK)

#### GET /api/roles/{roleId}
**Mô tả:** Lấy thông tin chi tiết role
**Authorization:** ADMIN
**Response:** RoleDTO (200 OK)

#### GET /api/roles/permissions/all
**Mô tả:** Lấy tất cả permissions, nhóm theo category
**Authorization:** ADMIN
**Response:** Map<String, List<String>> (200 OK)

---

### System Settings & Admin

#### GET /api/system/settings
**Mô tả:** Lấy tất cả cấu hình hệ thống
**Authorization:** ADMIN
**Response:** Map (200 OK)

#### PUT /api/system/settings/semester
**Mô tả:** Cập nhật cấu hình học kỳ
**Authorization:** ADMIN
**Request Body:**
```json
{
  "name": "string",
  "code": "string",
  "startDate": "2026-01-15",
  "endDate": "2026-05-30"
}
```
**Response:** 200 OK

#### GET /api/system/health
**Mô tả:** Kiểm tra tình trạng sức khỏe hệ thống
**Authorization:** ADMIN
**Response:** HealthStatus (200 OK)

#### GET /api/system/audit-logs
**Mô tả:** Lấy audit logs (phân trang)
**Authorization:** ADMIN
**Query Parameters:**
- `page` (int, default=0)
- `size` (int, default=50)
**Response:** Page<AuditLog> (200 OK)

#### GET /api/system/publishing
**Mô tả:** Lấy trạng thái xuất bản của tất cả syllabi
**Authorization:** ADMIN
**Response:** List<SyllabusPublishStatus> (200 OK)

#### PUT /api/system/publishing/{id}/state
**Mô tả:** Cập nhật trạng thái xuất bản syllabus
**Authorization:** ADMIN
**Request Body:**
```json
{
  "state": "PUBLISHED|DRAFT|UNPUBLISHED|ARCHIVED"
}
```
**Response:** 200 OK

---

### Service Discovery

#### GET /api/services/eureka/apps
**Mô tả:** Lấy danh sách tất cả microservices đã đăng ký (Eureka)
**Authorization:** ADMIN
**Response:** EurekaAppsResponse (200 OK)

---

## 📚 ACADEMIC SERVICE

**Port:** 8002 (Development)
**Base URL:** `/api/v1`

### Subject Management

#### POST /api/v1/subject
**Mô tả:** Tạo môn học mới
**Request Body:**
```json
{
  "subjectCode": "CS101",
  "subjectName": "Introduction to Programming",
  "credits": 3,
  "semester": 1
}
```
**Response:** ApiResponse<SubjectDto> (201 Created)

#### GET /api/v1/subject
**Mô tả:** Lấy danh sách tất cả môn học
**Response:** ApiResponse<List<SubjectDto>> (200 OK)

#### GET /api/v1/subject/{id}
**Mô tả:** Lấy thông tin môn học theo ID
**Response:** ApiResponse<SubjectDto> (200 OK)

#### GET /api/v1/subject/program/{programId}
**Mô tả:** Lấy danh sách môn học theo chương trình
**Path Parameters:** `programId` (Long)
**Response:** ApiResponse<List<SubjectDto>> (200 OK)

#### GET /api/v1/subject/program/{programId}/semester/{semester}
**Mô tả:** Lấy môn học theo chương trình và học kỳ
**Path Parameters:** `programId` (Long), `semester` (Integer)
**Response:** ApiResponse<List<SubjectDto>> (200 OK)

#### GET /api/v1/subject/search?code={code}
**Mô tả:** Tìm kiếm môn học theo mã
**Query Parameters:** `code` (String)
**Response:** ApiResponse<List<SubjectDto>> (200 OK)

#### PUT /api/v1/subject/{id}
**Mô tả:** Cập nhật thông tin môn học
**Path Parameters:** `id` (Long)
**Request Body:** SubjectDto
**Response:** ApiResponse<SubjectDto> (200 OK)

#### DELETE /api/v1/subject/{id}
**Mô tả:** Xóa môn học (soft delete)
**Path Parameters:** `id` (Long)
**Response:** ApiResponse<Void> (200 OK)

---

### Syllabus Management (Academic Service)

#### POST /api/v1/syllabus
**Mô tả:** Tạo giáo trình mới
**Request Body:**
```json
{
  "syllabusCode": "CS101-2026",
  "subjectId": 1,
  "version": 1,
  "description": "string"
}
```
**Response:** ApiResponse<SyllabusDto> (201 Created)

#### GET /api/v1/syllabus
**Mô tả:** Lấy danh sách tất cả giáo trình
**Response:** ApiResponse<List<SyllabusDto>> (200 OK)

#### GET /api/v1/syllabus/{id}
**Mô tả:** Lấy giáo trình theo ID
**Response:** ApiResponse<SyllabusDto> (200 OK)

#### GET /api/v1/syllabus/subject/{subjectId}
**Mô tả:** Lấy danh sách giáo trình theo môn học
**Response:** ApiResponse<List<SyllabusDto>> (200 OK)

#### GET /api/v1/syllabus/status/{status}
**Mô tả:** Lấy giáo trình theo trạng thái
**Path Parameters:** `status` (DRAFT, PUBLISHED, REJECTED, etc.)
**Response:** ApiResponse<List<SyllabusDto>> (200 OK)

#### GET /api/v1/syllabus/approval-status/{approvalStatus}
**Mô tả:** Lấy giáo trình theo trạng thái duyệt
**Path Parameters:** `approvalStatus` (PENDING, APPROVED, REJECTED, etc.)
**Response:** ApiResponse<List<SyllabusDto>> (200 OK)

#### GET /api/v1/syllabus/program/{programId}
**Mô tả:** Lấy giáo trình theo chương trình
**Response:** ApiResponse<List<SyllabusDto>> (200 OK)

#### PUT /api/v1/syllabus/{id}
**Mô tả:** Cập nhật giáo trình
**Request Body:** SyllabusDto
**Response:** ApiResponse<SyllabusDto> (200 OK)

#### PATCH /api/v1/syllabus/{id}/approve
**Mô tả:** Duyệt/từ chối giáo trình
**Query Parameters:**
- `approvalStatus` (APPROVED, REJECTED, etc.)
- `approvedBy` (Long, optional)
- `comments` (String, optional)
**Response:** ApiResponse<SyllabusDto> (200 OK)

#### DELETE /api/v1/syllabus/{id}
**Mô tả:** Xóa giáo trình (soft delete)
**Response:** ApiResponse<Void> (200 OK)

---

### CLO (Course Learning Outcome) Management

#### POST /api/v1/clo
**Mô tả:** Tạo CLO mới
**Request Body:**
```json
{
  "cloCode": "CLO1",
  "syllabusId": 1,
  "description": "string",
  "level": "KNOWLEDGE|COMPREHENSION|APPLICATION"
}
```
**Response:** ApiResponse<CloDto> (201 Created)

#### GET /api/v1/clo
**Mô tả:** Lấy danh sách tất cả CLO
**Response:** ApiResponse<List<CloDto>> (200 OK)

#### GET /api/v1/clo/{id}
**Mô tả:** Lấy CLO theo ID
**Response:** ApiResponse<CloDto> (200 OK)

#### GET /api/v1/clo/subject/{subjectId}
**Mô tả:** Lấy CLO theo môn học
**Response:** ApiResponse<List<CloDto>> (200 OK)

#### GET /api/v1/clo/syllabus/{syllabusId}
**Mô tả:** Lấy CLO theo giáo trình
**Response:** ApiResponse<List<CloDto>> (200 OK)

#### GET /api/v1/clo/search?code={code}
**Mô tả:** Tìm kiếm CLO theo mã
**Query Parameters:** `code` (String)
**Response:** ApiResponse<List<CloDto>> (200 OK)

#### PUT /api/v1/clo/{id}
**Mô tả:** Cập nhật CLO
**Request Body:** CloDto
**Response:** ApiResponse<CloDto> (200 OK)

#### DELETE /api/v1/clo/{id}
**Mô tả:** Xóa CLO (soft delete)
**Response:** ApiResponse<Void> (200 OK)

---

## 📖 SYLLABUS SERVICE

**Port:** 8003 (Development)
**Base URL:** `/api/syllabuses`, `/api/syllabus/documents`, `/api/issues`, `/api/notifications`, `/api/review-comments`

### Syllabus Versioning & Management

#### POST /api/syllabuses
**Mô tả:** Tạo giáo trình mới (Draft)
**Headers:** `X-User-Id: <userId>`
**Request Body:**
```json
{
  "syllabusCode": "CS101",
  "subjectId": 1,
  "content": "string"
}
```
**Response:** SyllabusResponse (200 OK)

#### GET /api/syllabuses
**Mô tả:** Tìm kiếm và lấy danh sách giáo trình (phân trang)
**Query Parameters:**
- `q` (String, optional) - Từ khóa tìm kiếm
- `status` (String, optional) - DRAFT, PENDING_REVIEW, PENDING_APPROVAL, APPROVED, PUBLISHED, REJECTED
- `page` (int, default=0)
- `size` (int, default=20, max=100)
**Response:** Page<SyllabusResponse> (200 OK)

#### GET /api/syllabuses/{id}
**Mô tả:** Lấy chi tiết giáo trình theo ID
**Response:** SyllabusResponse (200 OK)

#### GET /api/syllabuses/{rootId}/versions
**Mô tả:** Lấy danh sách tất cả phiên bản của giáo trình
**Response:** List<SyllabusResponse> (200 OK)

#### GET /api/syllabuses/{rootId}/compare?v1=1&v2=2
**Mô tả:** So sánh 2 phiên bản giáo trình
**Query Parameters:**
- `v1` (int, required) - Phiên bản thứ 1
- `v2` (int, required) - Phiên bản thứ 2
**Response:** List<ComparisonResult> (200 OK)

#### POST /api/syllabuses/{rootId}/versions
**Mô tả:** Cập nhật giáo trình bằng cách tạo phiên bản mới
**Headers:** `X-User-Id: <userId>`
**Request Body:**
```json
{
  "content": "string",
  "changes": "string"
}
```
**Response:** SyllabusResponse (200 OK)

---

### Syllabus Workflow (Submission & Approval)

#### POST /api/syllabuses/{id}/submit
**Mô tả:** Gửi giáo trình để review (DRAFT → PENDING_REVIEW)
**Headers:** `X-User-Id: <userId>`
**Response:** SyllabusResponse (200 OK)

#### POST /api/syllabuses/{id}/review-approve
**Mô tả:** Reviewer phê duyệt (PENDING_REVIEW → PENDING_APPROVAL)
**Headers:** `X-User-Id: <userId>`
**Response:** SyllabusResponse (200 OK)

#### POST /api/syllabuses/{id}/approve
**Mô tả:** Approver phê duyệt cuối (PENDING_APPROVAL → APPROVED)
**Headers:** `X-User-Id: <userId>`
**Response:** SyllabusResponse (200 OK)

#### POST /api/syllabuses/{id}/publish
**Mô tả:** Xuất bản giáo trình (APPROVED → PUBLISHED)
**Headers:** `X-User-Id: <userId>`
**Response:** SyllabusResponse (200 OK)

#### POST /api/syllabuses/{id}/reject
**Mô tả:** Từ chối giáo trình (PENDING_REVIEW/PENDING_APPROVAL → REJECTED)
**Headers:** `X-User-Id: <userId>`
**Request Body:**
```json
{
  "reason": "string"
}
```
**Response:** SyllabusResponse (200 OK)

#### POST /api/syllabuses/{id}/revise
**Mô tả:** Chỉnh sửa giáo trình (REJECTED → DRAFT)
**Headers:** `X-User-Id: <userId>`
**Response:** SyllabusResponse (200 OK)

---

### Syllabus Document Management

#### POST /api/syllabus/documents/upload
**Mô tả:** Tải lên tài liệu giảng dạy
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** multipart/form-data
**Form Parameters:**
- `file` (File, required) - PDF, DOCX, DOC, TXT
- `syllabusId` (UUID, required)
- `description` (String, optional)
**Response:** DocumentResponse (201 Created)

#### GET /api/syllabus/documents/syllabus/{syllabusId}
**Mô tả:** Lấy tất cả tài liệu của giáo trình
**Response:** List<DocumentResponse> (200 OK)

#### GET /api/syllabus/documents/syllabus/{syllabusId}/version/{version}
**Mô tả:** Lấy tài liệu theo phiên bản giáo trình
**Response:** List<DocumentResponse> (200 OK)

#### GET /api/syllabus/documents/my-documents
**Mô tả:** Lấy tài liệu do người dùng hiện tại tải lên
**Headers:** `Authorization: Bearer <token>`
**Response:** List<DocumentResponse> (200 OK)

#### GET /api/syllabus/documents/{documentId}
**Mô tả:** Lấy metadata tài liệu
**Response:** DocumentResponse (200 OK)

#### GET /api/syllabus/documents/{documentId}/download
**Mô tả:** Tải xuống tài liệu
**Response:** File (200 OK)

#### DELETE /api/syllabus/documents/{documentId}
**Mô tả:** Xóa tài liệu (soft delete)
**Headers:** `Authorization: Bearer <token>`
**Response:** 200 OK

#### PUT /api/syllabus/documents/{documentId}/update-job-id
**Mô tả:** Cập nhật AI ingestion job ID cho tài liệu (lưu trữ jobId từ AI service)
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "jobId": "string"
}
```
**Response:** DocumentResponse (200 OK)
**Ghi chú:** Được gọi tự động từ frontend sau khi summary generation thành công. Lưu jobId để có thể tải lại cached summary lần sau.

#### GET /api/syllabus/documents/syllabus/{syllabusId}/statistics
**Mô tả:** Lấy thống kê tài liệu của giáo trình
**Response:** DocumentStatistics (200 OK)

---

### Follow & Subscription

#### POST /api/syllabuses/{rootId}/follow
**Mô tả:** Theo dõi giáo trình
**Headers:** `X-User-Id: <userId>`
**Response:** 200 OK

#### DELETE /api/syllabuses/{rootId}/follow
**Mô tả:** Bỏ theo dõi giáo trình
**Headers:** `X-User-Id: <userId>`
**Response:** 200 OK

#### GET /api/syllabuses/{rootId}/is-following
**Mô tả:** Kiểm tra đang theo dõi giáo trình hay không
**Headers:** `X-User-Id: <userId>`
**Response:** boolean (200 OK)

#### GET /api/syllabuses/{rootId}/followers
**Mô tả:** Lấy danh sách người theo dõi giáo trình
**Response:** List<FollowInfo> (200 OK)

---

### Issues & Problem Tracking

#### POST /api/issues
**Mô tả:** Tạo issue/vấn đề mới
**Headers:** `X-User-Id: <userId>`
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "title": "string",
  "description": "string",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL"
}
```
**Response:** SyllabusIssueResponse (201 Created)

#### GET /api/issues/{id}
**Mô tả:** Lấy chi tiết issue
**Response:** SyllabusIssueResponse (200 OK)

#### GET /api/issues
**Mô tả:** Tìm kiếm issues (phân trang)
**Query Parameters:**
- `syllabusRootId` (UUID, optional)
- `syllabusId` (UUID, optional)
- `reporterUserId` (String, optional)
- `status` (OPEN|IN_PROGRESS|CLOSED|RESOLVED, optional)
- `page` (int)
- `size` (int)
**Response:** Page<SyllabusIssueResponse> (200 OK)

#### PUT /api/issues/{id}/status
**Mô tả:** Cập nhật trạng thái issue
**Request Body:**
```json
{
  "status": "OPEN|IN_PROGRESS|CLOSED|RESOLVED"
}
```
**Response:** SyllabusIssueResponse (200 OK)

#### DELETE /api/issues/{id}
**Mô tả:** Xóa issue
**Headers:** `X-User-Id: <userId>`
**Response:** 200 OK

---

### Review Comments

#### POST /api/review-comments
**Mô tả:** Thêm bình luận review
**Headers:** `X-User-Id: <userId>` (Long)
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "sectionKey": "string",
  "content": "string"
}
```
**Response:** ReviewCommentResponse (201 Created)

#### GET /api/review-comments/syllabus/{syllabusId}
**Mô tả:** Lấy danh sách bình luận review cho giáo trình
**Response:** List<ReviewCommentResponse> (200 OK)

#### PUT /api/review-comments/{id}
**Mô tả:** Cập nhật bình luận review
**Headers:** `X-User-Id: <userId>`
**Request Body:**
```json
{
  "content": "string"
}
```
**Response:** ReviewCommentResponse (200 OK)

#### DELETE /api/review-comments/{id}
**Mô tả:** Xóa bình luận review
**Headers:** `X-User-Id: <userId>`
**Response:** 200 OK

---

### Notifications

#### GET /api/notifications
**Mô tả:** Lấy danh sách thông báo người dùng
**Query Parameters:**
- `userId` (String, required)
- `unreadOnly` (boolean, default=false)
**Response:** List<Notification> (200 OK)

#### GET /api/notifications/unread-count
**Mô tả:** Lấy số lượng thông báo chưa đọc
**Query Parameters:** `userId` (String, required)
**Response:** long (200 OK)

#### POST /api/notifications/{id}/read
**Mô tả:** Đánh dấu thông báo là đã đọc
**Response:** Notification (200 OK)

#### POST /api/notifications/mark-all-read
**Mô tả:** Đánh dấu tất cả thông báo là đã đọc
**Query Parameters:** `userId` (String, required)
**Response:** int (200 OK)

#### DELETE /api/notifications/{id}
**Mô tả:** Xóa thông báo
**Response:** 200 OK

---

### Server-Sent Events (SSE) for Real-time Notifications

#### GET /api/notifications/sse/{userId}
**Mô tả:** Kết nối SSE để nhận thông báo real-time
**Response:** Server-Sent Events stream

---

## 🔄 WORKFLOW SERVICE

**Port:** 8004 (Development)
**Base URL:** `/api/workflows`

### Workflow Management

#### POST /api/workflows
**Mô tả:** Tạo workflow mới cho syllabus
**Query Parameters:**
- `entityId` (String, required) - UUID của syllabus
- `entityType` (String, required) - "SYLLABUS"
**Response:** Workflow (201 Created)

#### GET /api/workflows/{id}
**Mô tả:** Lấy thông tin workflow
**Response:** Workflow (200 OK)

#### GET /api/workflows
**Mô tả:** Lấy danh sách workflows
**Query Parameters:**
- `state` (WorkflowState, optional) - DRAFT, SUBMITTED, REVIEW, APPROVED, PUBLISHED, REJECTED
**Response:** List<Workflow> (200 OK)

#### GET /api/workflows/{id}/history
**Mô tả:** Lấy lịch sử thay đổi trạng thái workflow
**Response:** List<WorkflowHistory> (200 OK)

#### GET /api/workflows/{id}/review
**Mô tả:** Lấy thông tin workflow cho việc review
**Response:** WorkflowReviewDTO (200 OK)

---

### Workflow Actions (State Transitions)

#### POST /api/workflows/{id}/submit
**Mô tả:** Gửi syllabus để review (DRAFT → SUBMITTED)
**Query Parameters:** `actionBy` (String, required)
**Response:** WorkflowState (200 OK)

#### POST /api/workflows/{id}/approve
**Mô tả:** Phê duyệt workflow
**Query Parameters:**
- `actionBy` (String, required)
- `role` (UserRole, required) - ROLE_LECTURER, ROLE_DEPARTMENT_HEAD, ROLE_DEAN, etc.
**Response:** WorkflowState (200 OK)

#### POST /api/workflows/{id}/reject
**Mô tả:** Từ chối workflow với ghi chú
**Query Parameters:**
- `actionBy` (String, required)
- `role` (UserRole, required)
**Request Body:**
```json
{
  "comment": "string"
}
```
**Response:** WorkflowState (200 OK)

#### POST /api/workflows/{id}/require-edit
**Mô tả:** Yêu cầu chỉnh sửa
**Query Parameters:**
- `actionBy` (String, required)
- `role` (UserRole, required)
**Request Body:**
```json
{
  "comment": "string"
}
```
**Response:** WorkflowState (200 OK)

---

## 🌐 PUBLIC SERVICE

**Port:** 8005 (Development)
**Base URL:** `/api/public/syllabi`

### Syllabus Search (Public)

#### GET /api/public/syllabi/search
**Mô tả:** Tìm kiếm giáo trình công khai
**Query Parameters:**
- `q` (String, optional) - Từ khóa tìm kiếm
- `code` (String, optional) - Mã giáo trình
- `major` (String, optional) - Ngành học
- `semester` (String, optional) - Học kỳ
- `year` (Integer, optional) - Năm học
- `version` (String, optional) - Phiên bản
- `sort` (String, default=relevance) - relevance, date, name
- `page` (int, default=1)
- `size` (int, default=10)
- `fuzzy` (boolean, default=true) - Cho phép tìm kiếm mờ
- `highlight` (boolean, default=true) - Highlight kết quả
**Response:** SearchResponse (200 OK)

---

### Syllabus Detail (Public)

#### GET /api/public/syllabi/{id}
**Mô tả:** Lấy chi tiết giáo trình (read-only, không cần auth)
**Response:** SyllabusDetailDto (200 OK)
**Cache:** `syllabi:{id}`

#### GET /api/public/syllabi/{id}/tree
**Mô tả:** Lấy cây môn học (mối quan hệ giữa các môn)
**Response:** SubjectTreeNode (200 OK)
**Cache:** `treeView:{id}`

#### GET /api/public/syllabi/{id}/diff?targetVersion={version}
**Mô tả:** So sánh giáo trình với phiên bản khác
**Query Parameters:**
- `targetVersion` (Integer, optional) - Nếu không có, so sánh với phiên bản trước
**Response:** DiffResult (200 OK)
**Cache:** `diff:{id}-{version}`

---

### Follow & Feedback (Public)

#### POST /api/public/syllabi/{id}/follow
**Mô tả:** Theo dõi giáo trình
**Query Parameters:**
- `userId` (Long, optional)
- `email` (String, optional)
**Response:** FollowResponseDto (200 OK)

#### DELETE /api/public/syllabi/{id}/unfollow
**Mô tả:** Bỏ theo dõi giáo trình
**Response:** 200 OK

#### GET /api/public/syllabi/{id}/follow-count
**Mô tả:** Lấy số lượng người theo dõi
**Response:** long (200 OK)

#### POST /api/public/syllabi/{id}/feedback
**Mô tả:** Gửi feedback/đánh giá giáo trình
**Request Body:**
```json
{
  "rating": 1-5,
  "comment": "string",
  "email": "string",
  "category": "CONTENT|CLARITY|COMPLETENESS|OTHER"
}
```
**Response:** FeedbackResponseDto (201 Created)

---

## 🤖 AI SERVICE

**Port:** 8000 (Development)
**Base URL:** `/ai`

### Health Check

#### GET /health
**Mô tả:** Kiểm tra tình trạng dịch vụ AI
**Response:** `{"status": "ok", "service": "ai-service"}` (200 OK)

#### GET /api
**Mô tả:** Lấy danh sách tất cả endpoints AI
**Response:** API Index (200 OK)

---

### Document Management & RAG

#### POST /ai/documents/ingest
**Mô tả:** Tải bài giảng vào vector store cho RAG
**Content-Type:** multipart/form-data
**Form Parameters:**
- `file` (File, required) - PDF, DOCX, DOC, TXT
- `syllabus_id` (String, required)
- `subject_name` (String, optional)
- `document_id` (String, optional) - UUID of document in syllabus_documents table for tracking
**Response:** DocumentIngestResponse (201 Created)
```json
{
  "success": true,
  "message": "Document ingested successfully",
  "syllabus_id": "uuid",
  "chunks_created": 25
}
```

#### GET /ai/documents/search
**Mô tả:** Tìm kiếm trong vector store
**Query Parameters:**
- `query` (String, required) - Truy vấn tìm kiếm
- `syllabus_id` (String, optional) - Giới hạn trong syllabus
- `limit` (int, default=5) - Số kết quả
**Response:** SearchResultsResponse (200 OK)

#### GET /ai/documents/collections
**Mô tả:** Lấy danh sách collections (syllabi đã ingest)
**Response:** List<CollectionInfo> (200 OK)

#### DELETE /ai/documents/{syllabus_id}
**Mô tả:** Xóa vector store cho syllabus
**Response:** 200 OK

---

### AI Suggestions

#### POST /ai/suggest
**Mô tả:** Lấy gợi ý cải thiện nội dung giáo trình
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "sectionKey": "objectives",
  "currentContent": "string",
  "context": "string"
}
```
**Response:** JobCreateResponse (202 Accepted)
```json
{
  "jobId": "uuid",
  "status": "QUEUED",
  "message": "Suggestion task queued successfully"
}
```
**Polling:** GET /ai/jobs/{jobId}

---

### AI Chat (RAG-based)

#### POST /ai/chat
**Mô tả:** Chat với AI về giáo trình (sử dụng RAG)
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "messages": [
    {
      "role": "user",
      "content": "string"
    }
  ],
  "conversationId": "uuid (optional)"
}
```
**Response:** JobCreateResponse (202 Accepted)
**Polling:** GET /ai/jobs/{jobId} - result sẽ chứa AI response

---

### Diff Detection

#### POST /ai/diff
**Mô tả:** Phát hiện thay đổi giữa hai phiên bản
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "version1": 1,
  "version2": 2
}
```
**Response:** JobCreateResponse (202 Accepted)

---

### CLO-PLO Consistency Check

#### POST /ai/clo-check
**Mô tả:** Kiểm tra tính nhất quán giữa CLO và PLO
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "clos": ["CLO1", "CLO2"],
  "plos": ["PLO1", "PLO2"]
}
```
**Response:** JobCreateResponse (202 Accepted)

---

### Summary Generation

#### POST /ai/summary
**Mô tả:** Tạo tóm tắt cho một document hoặc toàn bộ syllabus
**Request Body:**
```json
{
  "syllabusId": "uuid",
  "documentId": "uuid (optional)",
  "length": "SHORT|MEDIUM|LONG",
  "versionId": "integer (optional)",
  "sections": ["section1", "section2"] (optional)
}
```
**Response:** JobCreateResponse (202 Accepted)
```json
{
  "jobId": "uuid",
  "status": "QUEUED",
  "message": "Summary task queued successfully"
}
```
**Flow:**
1. Frontend calls POST /ai/summary with syllabusId + documentId (optional)
2. AI Service returns jobId and status QUEUED
3. **Backend saves jobId** to `SyllabusDocument.aiIngestionJobId` if documentId provided
4. Frontend polls GET /ai/jobs/{jobId} to get result
5. Result contains: summary, bullets, keywords, targetAudience, prerequisites, ragUsed, tokens, model
6. Next time user views this document, use cached summary from jobId (no need to regenerate)

---

### Similar CLO Suggestions

#### POST /ai/suggest-similar-clos
**Mô tả:** Gợi ý CLO tương tự từ các giáo trình khác
**Request Body:**
```json
{
  "cloDescription": "string",
  "limit": 5,
  "threshold": 0.7
}
```
**Response:** JobCreateResponse (202 Accepted)

---

### Job Management

#### GET /ai/jobs/{jobId}
**Mô tả:** Lấy trạng thái và kết quả của job
**Response:** JobResponse (200 OK)
```json
{
  "jobId": "uuid",
  "taskType": "suggest|chat|diff|clo_check|summary",
  "status": "QUEUED|RUNNING|SUCCEEDED|FAILED|CANCELED",
  "createdAt": "2026-01-22T10:30:00Z",
  "updatedAt": "2026-01-22T10:35:00Z",
  "progress": 75,
  "meta": {},
  "result": {},
  "error": null
}
```

#### POST /ai/jobs/{jobId}/cancel
**Mô tả:** Hủy job đang chạy
**Response:** 200 OK

---

### Notifications (WebSocket & REST)

#### WebSocket: /notifications/ws/{userId}
**Mô tả:** Kết nối WebSocket để nhận thông báo real-time
**URL:** `ws://localhost:8006/notifications/ws/{userId}`
**Heartbeat:** Gửi "ping", nhận "pong"

#### GET /notifications
**Mô tả:** Lấy danh sách thông báo (REST)
**Query Parameters:**
- `user_id` (String, required)
- `unread_only` (boolean, default=false)
- `limit` (int, default=50, max=100)
**Response:** Notifications List (200 OK)

#### POST /notifications/{notificationId}/read
**Mô tả:** Đánh dấu thông báo là đã đọc
**Response:** 200 OK

#### POST /notifications/mark-all-read
**Mô tả:** Đánh dấu tất cả thông báo là đã đọc
**Query Parameters:** `user_id` (String, required)
**Response:** 200 OK

#### DELETE /notifications/{notificationId}
**Mô tả:** Xóa thông báo
**Response:** 200 OK

---

## 🌉 API GATEWAY

**Port:** 8000 (Development)
**Base URL:** `/` (routes to all services)

### Gateway Features
- Service discovery via Eureka
- Load balancing
- Rate limiting
- Authentication routing
- CORS handling

### Service Routes
```
/api/auth/** → Auth Service (8001)
/api/users/** → Auth Service (8001)
/api/roles/** → Auth Service (8001)
/api/system/** → Auth Service (8001)
/api/v1/subject/** → Academic Service (8002)
/api/v1/syllabus/** → Academic Service (8002)
/api/v1/clo/** → Academic Service (8002)
/api/syllabuses/** → Syllabus Service (8003)
/api/syllabus/** → Syllabus Service (8003)
/api/issues/** → Syllabus Service (8003)
/api/notifications/** → Syllabus Service (8003)
/api/review-comments/** → Syllabus Service (8003)
/api/workflows/** → Workflow Service (8004)
/api/public/** → Public Service (8005)
/ai/** → AI Service (8006)
```

---

## 📊 Common Response Formats

### Success Response (Generic ApiResponse)
```json
{
  "data": {},
  "message": "string",
  "timestamp": "2026-01-22T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "string",
  "message": "string",
  "timestamp": "2026-01-22T10:30:00Z",
  "path": "/api/..."
}
```

### Pagination Response
```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## 🔑 Authentication

### Headers
```
Authorization: Bearer {accessToken}
X-User-Id: {userId}  (some endpoints require this)
```

### Token Refresh
```
POST /api/auth/refresh
{
  "refreshToken": "{refreshToken}"
}
```

---

## ⚙️ Common Query Parameters

### Pagination
- `page` (int, default=0) - 0-indexed
- `size` (int, default=20, max=100)
- `sort` (String, e.g., "id,desc")

### Filtering
- `q` or `search` - Keyword search
- `status` - Filter by status
- `from`, `to` - Date range

### Caching (Public Service)
- Use ETag headers for conditional requests
- Cache duration: 1 hour for public data

---

## 🚀 Integration Tips

1. **Async Tasks**: AI Service uses job polling. Always check status with `/ai/jobs/{jobId}`
2. **WebSocket**: Connect to `/notifications/ws/{userId}` for real-time updates
3. **File Upload**: Use multipart/form-data for document uploads
4. **Version Control**: Track syllabus versions via `rootId`
5. **Workflow States**: Follow the state machine carefully
6. **User Headers**: Some endpoints require `X-User-Id` header
7. **Document Summary Flow**:
   - User selects a document in the syllabus detail view
   - Frontend downloads the document file
   - Frontend ingests it via POST `/ai/documents/ingest`
   - Frontend calls POST `/ai/summary` with syllabusId + documentId
   - Frontend polls GET `/ai/jobs/{jobId}` until status is SUCCEEDED
   - Result contains: summary, bullets, keywords, targetAudience, prerequisites, ragUsed, tokens, model

---

**Last Updated:** 22/01/2026 | **Version:** 1.0.0
