# 🚀 QUICK API REFERENCE - TRA CỨU NHANH

Dành cho developers cần tra cứu nhanh các API endpoints.

---

## 🔐 AUTH SERVICE (Port 8001)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/refresh` | Làm mới token | ❌ |
| POST | `/api/auth/logout` | Đăng xuất | ✅ |
| GET | `/api/users` | Danh sách users | ADMIN |
| GET | `/api/users/{id}` | Chi tiết user | ADMIN |
| POST | `/api/users` | Tạo user | ADMIN |
| PUT | `/api/users/{id}` | Cập nhật user | ADMIN |
| DELETE | `/api/users/{id}` | Xóa user | ADMIN |
| PUT | `/api/users/{id}/lock` | Khóa user | ADMIN |
| PUT | `/api/users/{id}/unlock` | Mở khóa user | ADMIN |
| POST | `/api/users/reset-password` | Reset password | ❌ |
| GET | `/api/roles` | Danh sách roles | ADMIN |
| GET | `/api/roles/{roleId}` | Chi tiết role | ADMIN |
| GET | `/api/roles/permissions/all` | Tất cả permissions | ADMIN |
| GET | `/api/system/settings` | Cấu hình hệ thống | ADMIN |
| PUT | `/api/system/settings/semester` | Update semester | ADMIN |
| GET | `/api/system/health` | Kiểm tra sức khỏe | ADMIN |
| GET | `/api/system/audit-logs` | Audit logs | ADMIN |
| GET | `/api/system/publishing` | Trạng thái xuất bản | ADMIN |
| PUT | `/api/system/publishing/{id}/state` | Cập nhật trạng thái | ADMIN |
| GET | `/api/services/eureka/apps` | Service discovery | ADMIN |

---

## 📚 ACADEMIC SERVICE (Port 8002)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/subject` | Tạo môn học |
| GET | `/api/v1/subject` | Danh sách môn học |
| GET | `/api/v1/subject/{id}` | Chi tiết môn học |
| GET | `/api/v1/subject/program/{programId}` | Môn học theo chương trình |
| GET | `/api/v1/subject/program/{programId}/semester/{semester}` | Môn học theo kỳ |
| GET | `/api/v1/subject/search?code={code}` | Tìm kiếm môn học |
| PUT | `/api/v1/subject/{id}` | Cập nhật môn học |
| DELETE | `/api/v1/subject/{id}` | Xóa môn học |
| POST | `/api/v1/syllabus` | Tạo giáo trình |
| GET | `/api/v1/syllabus` | Danh sách giáo trình |
| GET | `/api/v1/syllabus/{id}` | Chi tiết giáo trình |
| GET | `/api/v1/syllabus/subject/{subjectId}` | Giáo trình theo môn |
| GET | `/api/v1/syllabus/status/{status}` | Giáo trình theo trạng thái |
| GET | `/api/v1/syllabus/approval-status/{approvalStatus}` | Theo trạng thái duyệt |
| GET | `/api/v1/syllabus/program/{programId}` | Theo chương trình |
| PUT | `/api/v1/syllabus/{id}` | Cập nhật giáo trình |
| PATCH | `/api/v1/syllabus/{id}/approve` | Phê duyệt giáo trình |
| DELETE | `/api/v1/syllabus/{id}` | Xóa giáo trình |
| POST | `/api/v1/clo` | Tạo CLO |
| GET | `/api/v1/clo` | Danh sách CLO |
| GET | `/api/v1/clo/{id}` | Chi tiết CLO |
| GET | `/api/v1/clo/subject/{subjectId}` | CLO theo môn học |
| GET | `/api/v1/clo/syllabus/{syllabusId}` | CLO theo giáo trình |
| GET | `/api/v1/clo/search?code={code}` | Tìm kiếm CLO |
| PUT | `/api/v1/clo/{id}` | Cập nhật CLO |
| DELETE | `/api/v1/clo/{id}` | Xóa CLO |

---

## 📖 SYLLABUS SERVICE (Port 8003)

### Quản lý Giáo trình
| Method | Endpoint | Mô tả | Header |
|--------|----------|-------|--------|
| POST | `/api/syllabuses` | Tạo giáo trình | X-User-Id |
| GET | `/api/syllabuses` | Danh sách giáo trình | - |
| GET | `/api/syllabuses/{id}` | Chi tiết giáo trình | - |
| GET | `/api/syllabuses/{rootId}/versions` | Danh sách phiên bản | - |
| GET | `/api/syllabuses/{rootId}/compare?v1=1&v2=2` | So sánh phiên bản | - |
| POST | `/api/syllabuses/{rootId}/versions` | Tạo phiên bản mới | X-User-Id |

### Workflow (Submission & Approval)
| Method | Endpoint | Mô tả | Header |
|--------|----------|-------|--------|
| POST | `/api/syllabuses/{id}/submit` | Gửi review | X-User-Id |
| POST | `/api/syllabuses/{id}/review-approve` | Phê duyệt review | X-User-Id |
| POST | `/api/syllabuses/{id}/approve` | Phê duyệt cuối | X-User-Id |
| POST | `/api/syllabuses/{id}/publish` | Xuất bản | X-User-Id |
| POST | `/api/syllabuses/{id}/reject` | Từ chối | X-User-Id |
| POST | `/api/syllabuses/{id}/revise` | Chỉnh sửa | X-User-Id |

### Tài liệu Giáo trình
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/syllabus/documents/upload` | Tải lên tài liệu |
| GET | `/api/syllabus/documents/syllabus/{syllabusId}` | Danh sách tài liệu |
| GET | `/api/syllabus/documents/syllabus/{syllabusId}/version/{version}` | Tài liệu theo phiên bản |
| GET | `/api/syllabus/documents/my-documents` | Tài liệu của tôi |
| GET | `/api/syllabus/documents/{documentId}` | Chi tiết tài liệu |
| GET | `/api/syllabus/documents/{documentId}/download` | Tải xuống |
| DELETE | `/api/syllabus/documents/{documentId}` | Xóa tài liệu |
| GET | `/api/syllabus/documents/syllabus/{syllabusId}/statistics` | Thống kê tài liệu |

### Follow & Theo dõi
| Method | Endpoint | Mô tả | Header |
|--------|----------|-------|--------|
| POST | `/api/syllabuses/{rootId}/follow` | Theo dõi | X-User-Id |
| DELETE | `/api/syllabuses/{rootId}/follow` | Bỏ theo dõi | X-User-Id |
| GET | `/api/syllabuses/{rootId}/is-following` | Kiểm tra theo dõi | X-User-Id |
| GET | `/api/syllabuses/{rootId}/followers` | Danh sách follower | - |

### Issues & Bình luận
| Method | Endpoint | Mô tả | Header |
|--------|----------|-------|--------|
| POST | `/api/issues` | Tạo issue | X-User-Id |
| GET | `/api/issues/{id}` | Chi tiết issue | - |
| GET | `/api/issues` | Danh sách issues | - |
| PUT | `/api/issues/{id}/status` | Cập nhật trạng thái | - |
| DELETE | `/api/issues/{id}` | Xóa issue | X-User-Id |
| POST | `/api/review-comments` | Thêm bình luận | X-User-Id |
| GET | `/api/review-comments/syllabus/{syllabusId}` | Danh sách bình luận | - |
| PUT | `/api/review-comments/{id}` | Cập nhật bình luận | X-User-Id |
| DELETE | `/api/review-comments/{id}` | Xóa bình luận | X-User-Id |

### Thông báo
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications` | Danh sách thông báo |
| GET | `/api/notifications/unread-count` | Số thông báo chưa đọc |
| POST | `/api/notifications/{id}/read` | Đánh dấu đã đọc |
| POST | `/api/notifications/mark-all-read` | Đánh dấu tất cả đã đọc |
| DELETE | `/api/notifications/{id}` | Xóa thông báo |
| GET | `/api/notifications/sse/{userId}` | SSE real-time |

---

## 🔄 WORKFLOW SERVICE (Port 8004)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/workflows` | Tạo workflow |
| GET | `/api/workflows/{id}` | Chi tiết workflow |
| GET | `/api/workflows` | Danh sách workflows |
| GET | `/api/workflows/{id}/history` | Lịch sử workflow |
| GET | `/api/workflows/{id}/review` | Info cho review |
| POST | `/api/workflows/{id}/submit` | Gửi review |
| POST | `/api/workflows/{id}/approve` | Phê duyệt |
| POST | `/api/workflows/{id}/reject` | Từ chối |
| POST | `/api/workflows/{id}/require-edit` | Yêu cầu sửa |

---

## 🌐 PUBLIC SERVICE (Port 8005)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/public/syllabi/search` | Tìm kiếm giáo trình |
| GET | `/api/public/syllabi/{id}` | Chi tiết giáo trình |
| GET | `/api/public/syllabi/{id}/tree` | Cây môn học |
| GET | `/api/public/syllabi/{id}/diff?targetVersion={v}` | So sánh phiên bản |
| POST | `/api/public/syllabi/{id}/follow` | Theo dõi |
| DELETE | `/api/public/syllabi/{id}/unfollow` | Bỏ theo dõi |
| GET | `/api/public/syllabi/{id}/follow-count` | Số lượng follower |
| POST | `/api/public/syllabi/{id}/feedback` | Gửi feedback |

---

## 🤖 AI SERVICE (Port 8006)

### Health & Info
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Kiểm tra dịch vụ |
| GET | `/api` | Danh sách endpoints |

### Document Management
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/ai/documents/ingest` | Tải giáo trình vào RAG |
| GET | `/ai/documents/search` | Tìm kiếm vector store |
| GET | `/ai/documents/collections` | Danh sách collections |
| DELETE | `/ai/documents/{syllabus_id}` | Xóa collection |

### AI Features
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/ai/suggest` | Gợi ý cải thiện |
| POST | `/ai/chat` | Chat RAG-based |
| POST | `/ai/diff` | Phát hiện thay đổi |
| POST | `/ai/clo-check` | Kiểm tra CLO-PLO |
| POST | `/ai/summary` | Tạo tóm tắt |
| POST | `/ai/suggest-similar-clos` | Gợi ý CLO tương tự |

### Job Management
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/ai/jobs/{jobId}` | Lấy trạng thái job |
| POST | `/ai/jobs/{jobId}/cancel` | Hủy job |

### Notifications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| WS | `/notifications/ws/{userId}` | WebSocket real-time |
| GET | `/notifications` | Danh sách thông báo |
| POST | `/notifications/{id}/read` | Đánh dấu đã đọc |
| POST | `/notifications/mark-all-read` | Đánh dấu tất cả đã đọc |
| DELETE | `/notifications/{id}` | Xóa thông báo |

---

## 🔑 Authentication Examples

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Using Token
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer {accessToken}"
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"{refreshToken}"}'
```

---

## 📋 Common Query Parameters

```
?page=0&size=20          # Pagination
?q=search_term           # Keyword search
?status=PUBLISHED        # Filter by status
?sort=id,desc            # Sorting
?from=2026-01-01&to=2026-01-31  # Date range
```

---

## ⚠️ Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 202 | Accepted (async task) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🎯 Common Flow Examples

### Tạo & Xuất bản Giáo trình
```
1. POST /api/syllabuses          → Create (DRAFT)
2. POST /api/syllabuses/{id}/submit        → PENDING_REVIEW
3. POST /api/syllabuses/{id}/review-approve  → PENDING_APPROVAL
4. POST /api/syllabuses/{id}/approve       → APPROVED
5. POST /api/syllabuses/{id}/publish       → PUBLISHED
```

### Sử dụng AI Service
```
1. POST /ai/suggest                    → JobCreateResponse (202)
2. POLL /ai/jobs/{jobId}               → Check status
3. When status=SUCCEEDED, read result  → Get suggestions
```

### Upload & Search Documents
```
1. POST /ai/documents/ingest            → Upload PDF/DOCX
2. GET /ai/documents/search?query=...   → Search vector store
```

---

## 💡 Tips

- **Async Jobs**: AI tasks are async. Always poll `/ai/jobs/{jobId}`
- **WebSocket**: Connect to `ws://localhost:8006/notifications/ws/{userId}` for real-time
- **Versioning**: Syllabus versions tracked via `rootId`
- **Caching**: Public APIs cached for 1 hour
- **File Upload**: Use `multipart/form-data` for documents
- **User Headers**: Some endpoints need `X-User-Id` header

---

**Generated:** 22/01/2026 | **Version:** 1.0.0
