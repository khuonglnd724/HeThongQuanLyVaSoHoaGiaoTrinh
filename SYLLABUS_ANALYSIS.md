# Phân Tích Hệ Thống Quản Lý Giáo Trình (Syllabus) - Lecturer Frontend

**Ngày kiểm tra**: 18/01/2026  
**Hệ thống**: SMD Microservices - Academic Portal  
**Phạm vi**: Frontend Lecturer & Backend API Integration

---

## 📋 TÓM TẮT HIỆN TRẠNG

### ✅ Những gì đã hoàn thành:

#### Frontend (Academic Portal)
- ✅ **SyllabusList Component** - Danh sách giáo trình với:
  - Hiển thị danh sách giáo trình phân trang
  - Tìm kiếm theo mã hoặc tên giáo trình
  - Lọc theo trạng thái phê duyệt (PENDING, APPROVED, REJECTED)
  - Hiển thị badge trạng thái và phê duyệt
  - Nút "Xem chi tiết" và "Kiểm tra"
  - Validation results hiển thị điểm và lỗi

- ✅ **Statistics Component** - Thống kê giáo trình:
  - Tổng số giáo trình
  - Số giáo trình đã phê duyệt
  - Số giáo trình chờ phê duyệt
  - Số giáo trình bị từ chối
  - Thống kê theo chương trình
  - Thống kê theo môn học
  - Tỷ lệ coverage CLO/PLO

- ✅ **Login Component** - Xác thực người dùng
  - Đăng nhập với username/password
  - Lưu token vào localStorage

- ✅ **Notifications Component** - Thông báo cho lecturer:
  - Hiển thị danh sách thông báo
  - Đánh dấu là đã đọc
  - Xóa thông báo

#### Backend API (Academic Service)
- ✅ Syllabus CRUD operations:
  - GET `/syllabus` - Lấy danh sách
  - GET `/syllabus/{id}` - Chi tiết giáo trình
  - POST `/syllabus` - Tạo mới
  - PUT `/syllabus/{id}` - Cập nhật
  - DELETE `/syllabus/{id}` - Xóa

- ✅ Workflow APIs:
  - POST `/syllabus/{id}/submit-level1` - Submit phê duyệt cấp 1
  - POST `/syllabus/{id}/approve-level1` - Phê duyệt cấp 1
  - POST `/syllabus/{id}/reject-level1` - Từ chối cấp 1
  - POST `/syllabus/{id}/approve-level2` - Phê duyệt cấp 2
  - POST `/syllabus/{id}/reject-level2` - Từ chối cấp 2

- ✅ Validation APIs:
  - POST `/syllabus/{id}/validate-approval` - Kiểm tra phê duyệt
  - POST `/syllabus/{id}/validate-prerequisites` - Kiểm tra tiên quyết

- ✅ Version History:
  - GET `/syllabus/{id}/versions` - Lịch sử phiên bản
  - GET `/syllabus/{id}/versions/{versionNumber}` - Chi tiết phiên bản
  - GET `/syllabus/{id}/compare` - So sánh phiên bản

- ✅ Search & Filter:
  - GET `/syllabus/search` - Tìm kiếm
  - GET `/syllabus/pending-approval` - Danh sách chờ phê duyệt
  - GET `/syllabus/rejected` - Danh sách bị từ chối
  - GET `/syllabus/approved` - Danh sách đã phê duyệt

- ✅ Statistics:
  - GET `/statistics/department` - Thống kê toàn bộ
  - GET `/statistics/programs` - Thống kê theo chương trình
  - GET `/statistics/subjects` - Thống kê theo môn
  - GET `/statistics/low-coverage` - Các môn coverage thấp

- ✅ Notifications:
  - GET `/notifications` - Lấy thông báo
  - GET `/notifications/unread` - Thông báo chưa đọc
  - PUT `/notifications/{id}/read` - Đánh dấu đã đọc
  - DELETE `/notifications/{id}` - Xóa thông báo

---

## ❌ CÁC VẤN ĐỀ PHÁT HIỆN

### 1. **Thiếu Thông Tin Lecturer trong Syllabus**
- ❌ Data model `Syllabus` không chứa thông tin lecturer:
  - Không có `lecturerId`
  - Không có `lecturerName`
  - Không có `lecturerEmail`
  - Không có `lecturerDepartment`
  - Chỉ có `createdBy` (username) nhưng không đủ thông tin

**Vị trí**: [frontend/academic-portal/src/types/index.ts](frontend/academic-portal/src/types/index.ts)

```typescript
export interface Syllabus {
  id: number;
  code: string;
  name: string;
  subjectId: number;
  subjectName: string;
  academicYear: string;
  semester: number;
  credits: number;
  objectives: string;
  content: string;
  teachingMethods: string;
  assessmentMethods: string;
  prerequisites: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  approvalStatus: 'PENDING' | 'APPROVED_L1' | 'APPROVED_L2' | 'REJECTED';
  createdBy: string;  // ⚠️ Chỉ có username, không đủ thông tin
  createdAt: string;
  updatedAt: string;
  // ❌ THIẾU: lecturerId, lecturerName, lecturerEmail, lecturerDepartment
}
```

### 2. **Không Hiển Thị Thông Tin Lecturer trong UI**
- ❌ `SyllabusList` component không hiển thị:
  - Tên lecturer
  - Email lecturer
  - Phòng ban lecturer
  - Số điện thoại lecturer
  
**Vị trí**: [frontend/academic-portal/src/components/SyllabusList.tsx](frontend/academic-portal/src/components/SyllabusList.tsx)

```tsx
// Hiện tại chỉ hiển thị:
<div className="info-row">
  <span className="label">Năm học:</span>
  <span>{syllabus.academicYear}</span>
</div>
<div className="info-row">
  <span className="label">Học kỳ:</span>
  <span>{syllabus.semester}</span>
</div>
// ❌ Không có phần hiển thị lecturer
```

### 3. **Thiếu API Endpoints cho Lecturer Management**
- ❌ Backend không có APIs để:
  - Lấy danh sách lecturer
  - Gán lecturer cho giáo trình
  - Lấy giáo trình theo lecturer
  - Thay đổi lecturer của giáo trình

### 4. **Thiếu Role-Based Access Control cho Lecturer**
- ❌ Không có cách để:
  - Phân biệt lecturer từ admin/approver
  - Hiển thị chỉ giáo trình của lecturer đó
  - Kiểm soát quyền edit giáo trình

### 5. **Thiếu Component Chi Tiết Giáo Trình (Syllabus Detail)**
- ❌ Không tìm thấy component để xem chi tiết giáo trình
- Chỉ có button "Xem chi tiết" nhưng component chưa được implement

**Vị trí**: [frontend/academic-portal/src/components/SyllabusList.tsx#L182-L187](frontend/academic-portal/src/components/SyllabusList.tsx#L182-L187)

```tsx
<button
  onClick={() => onSelectSyllabus(syllabus)}
  className="btn-secondary btn-sm"
>
  Xem chi tiết
</button>
// ❌ onSelectSyllabus callback không được sử dụng trong App
```

### 6. **Approval Workflow không hoàn chỉnh**
- ❌ Không có UI để:
  - Submit giáo trình cho phê duyệt
  - Duyệt/từ chối giáo trình
  - Xem comments từ approver
  - Chỉnh sửa theo feedback

### 7. **Version History không được hiển thị**
- ❌ Component `VersionHistory.tsx` tồn tại nhưng:
  - Không được import trong App
  - Không có UI để xem lịch sử thay đổi
  - Không có so sánh giữa các phiên bản

---

## 📊 DANH SÁCH COMPONENTS HIỆN TẠI

```
frontend/academic-portal/src/
├── components/
│   ├── Login.tsx                    ✅ (Hoàn thành)
│   ├── SyllabusList.tsx             ⚠️ (Chưa hoàn chỉnh - thiếu lecturer)
│   ├── Statistics.tsx               ✅ (Hoàn thành)
│   ├── Notifications.tsx            ✅ (Hoàn thành)
│   └── VersionHistory.css           ⚠️ (CSS nhưng component chưa hoàn thành)
├── services/
│   ├── academicService.ts           ✅ (API Integration)
│   └── authService.ts               ✅ (Auth)
├── types/
│   └── index.ts                     ⚠️ (Thiếu lecturer fields)
├── App.tsx                          ⚠️ (Chưa handle detail view)
└── main.tsx                         ✅
```

---

## 🔧 CÁC BƯỚC CẦN THỰC HIỆN

### Phase 1: Cập nhật Data Model
- [ ] Thêm lecturer fields vào `Syllabus` interface:
  ```typescript
  interface Syllabus {
    // ... existing fields
    lecturerId?: number;
    lecturerName?: string;
    lecturerEmail?: string;
    lecturerPhone?: string;
    lecturerDepartment?: string;
  }
  ```

### Phase 2: Tạo Component Chi Tiết Giáo Trình
- [ ] Tạo `SyllabusDetail.tsx` để hiển thị:
  - Thông tin lecturer đầy đủ
  - Nội dung giáo trình
  - Trạng thái phê duyệt
  - Action buttons (Edit, Submit, etc.)

### Phase 3: Thêm Lecturer Management
- [ ] Tạo `LecturerSelector.tsx` component
- [ ] Backend APIs để lấy danh sách lecturer
- [ ] Assign lecturer cho giáo trình

### Phase 4: Implement Approval Workflow UI
- [ ] Tạo `ApprovalWorkflow.tsx`
- [ ] Form để submit/approve/reject
- [ ] Hiển thị comment history

### Phase 5: Role-Based Access Control
- [ ] Kiểm tra role của user (LECTURER, APPROVER_L1, APPROVER_L2, ADMIN)
- [ ] Ẩn/hiện features dựa trên role
- [ ] Lọc danh sách giáo trình theo lecturer

### Phase 6: Version History UI
- [ ] Hoàn thành `VersionHistory` component
- [ ] So sánh phiên bản
- [ ] Rollback functionality (nếu cần)

---

## 🏗️ KIẾN TRÚC HIỆN TẠI

```
┌─────────────────────────────────────────────────────┐
│         Frontend (Academic Portal)                  │
├─────────────────────────────────────────────────────┤
│  App.tsx (Main)                                     │
│  ├── Login.tsx (Auth)                              │
│  ├── SyllabusList.tsx (List View) ⚠️ Incomplete    │
│  ├── Statistics.tsx (Dashboard)                    │
│  └── Notifications.tsx (Alerts)                    │
├─────────────────────────────────────────────────────┤
│  Services:                                          │
│  ├── academicService.ts (API Calls)               │
│  └── authService.ts (Auth)                         │
├─────────────────────────────────────────────────────┤
│  Types:                                             │
│  └── index.ts ⚠️ Missing lecturer fields           │
└─────────────────────────────────────────────────────┘
                        ↓ API Calls
┌─────────────────────────────────────────────────────┐
│    Backend (Academic Service - Port 8080)          │
├─────────────────────────────────────────────────────┤
│  /api/academic/                                     │
│  ├── syllabus/                                     │
│  ├── statistics/                                   │
│  ├── notifications/                                │
│  └── (Missing: lecturers/, lecturer-assignment/)  │
└─────────────────────────────────────────────────────┘
```

---

## 📝 GHI CHÚ

- **Base URL Frontend**: `http://localhost:5174` (Vite dev server)
- **Base URL Backend**: `http://localhost:8080/api/academic`
- **Auth Service**: `http://localhost:8081/api/auth`
- **Eureka**: `http://localhost:8761`

---

## 💡 KHUYẾN NGHỊ

1. **Ưu tiên cao**: 
   - Cập nhật Syllabus model để chứa lecturer info
   - Tạo SyllabusDetail component
   - Implement lecturer display

2. **Ưu tiên trung bình**:
   - Approval workflow UI
   - Version history
   - Role-based access control

3. **Tối ưu hóa**:
   - Performance tuning cho pagination
   - Caching strategy
   - Error handling improvements

---

## 🔍 FILES LIÊN QUAN

- [SyllabusList.tsx](frontend/academic-portal/src/components/SyllabusList.tsx)
- [academicService.ts](frontend/academic-portal/src/services/academicService.ts)
- [types/index.ts](frontend/academic-portal/src/types/index.ts)
- [App.tsx](frontend/academic-portal/src/App.tsx)
- [API Config](frontend/admin-system/src/utils/api.js)

---

**Status**: 🟡 In Progress  
**Last Updated**: 2026-01-18  
**Next Review**: After implementation of Phase 1 & 2
