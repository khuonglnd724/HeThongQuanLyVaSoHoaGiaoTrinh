# 🚀 QUICK START GUIDE - Syllabus Management System

## ⚡ TÓM TẮT NHANH

**Đã implement**: Lecturer → AA (Level 2) → Admin (Publish)  
**Bỏ qua**: HoD (Level 1) - sẽ làm sau  
**Trạng thái**: Frontend hoàn thành 85%, Backend cần implement APIs

---

## 🎯 CÁC THÀNH PHẦN

### 1. Lecturer Portal ✅
- **Port**: 5173
- **Location**: `frontend/lecturer-portal/syllabus-builder`
- **Role**: Lecturer
- **Chức năng**: Tạo, sửa, submit syllabus

### 2. Academic Affairs (AA) Portal ✅  
- **Port**: 5174
- **Location**: `frontend/academic-portal`
- **Role**: Academic Affairs (AA)
- **Chức năng**: Duyệt cấp 2, validate, approve/reject

### 3. Admin System ✅
- **Port**: 3001
- **Location**: `frontend/admin-system`
- **Role**: Admin/Super Admin
- **Chức năng**: Publish, Unpublish, Archive + System Management

---

## 🏃 CHẠY NHANH

### Backend:
```bash
cd docker
docker-compose up -d auth-service syllabus-service academic-service
```

### Frontend:

**Terminal 1 - Lecturer Portal**:
```bash
cd frontend/lecturer-portal/syllabus-builder
npm install
npm run dev
# → http://localhost:5173
```

**Terminal 2 - AA Portal**:
```bash
cd frontend/academic-portal
npm install
npm run dev
# → http://localhost:5174
```

**Terminal 3 - Admin System**:
```bash
cd frontend/admin-system
npm install
npm start
# → http://localhost:3001
```

---

## 🧪 TEST NHANH

### Test AA Role:
```javascript
// Browser Console
localStorage.setItem('user_role', 'AA');
localStorage.setItem('token', 'fake-token-for-testing');
// Reload page → Thấy "📋 AA Reviews" button
```

### Test Admin Role:
```javascript
localStorage.setItem('user_role', 'ADMIN');
localStorage.setItem('token', 'fake-token-for-testing');
// Reload page → Thấy "📢 Publish/Archive" button
```

---

## 📋 CHECKLIST KIỂM TRA

### AA Portal:
- [ ] Vào http://localhost:5174
- [ ] Set role = 'AA'
- [ ] Click "📋 AA Reviews"
- [ ] Xem danh sách pending3001
- [ ] Login: admin / admin123
- [ ] Click "📢 Syllabus Publish/Archive" trong sidebar
- [ ] Xem tab "Approved" - danh sách syllabuses ready to publish
- [ ] Click "📢 Publish" - confirm hoạt động
- [ ] Chuyển tab "Published"
- [ ] Click "🔒 Unpublish" - confirm hoạt động
- [ ] Click "📦 Archive" - modal hiện, yêu cầu lý do

---

## 📝 PHÂN CHIA RÕ RÀNG

### ✅ Role-Based Separation:

```
┌─────────────────────────────────────────┐
│ Lecturer Portal (Port 5173)             │
│ ROLE: Lecturer                          │
│ - Create, Edit, Submit                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Academic Portal (Port 5174)             │
│ ROLE: Academic Affairs (AA)             │
│ - Review Level 2                        │
│ - Validate Rules                        │
│ - Approve/Reject                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Admin System (Port 3001)                │
│ ROLE: Admin/Super Admin                 │
│ - Publish/Unpublish                     │
│ - Archive                               │
│ - System Management                     │
└─────────────────────────────────────────┘
```

**Không overlap**: Mỗi role chỉ làm việc của mình!
- [ ] Vào http://localhost:5174
- [ ] Set role = 'ADMIN'
- [ ] Click "📢 Publish/Archive"
- [ ] Xem tab "Approved" - danh sách syllabuses ready to publish
- [ ] Click "📢 Publish" - confirm hoạt động
- [ ] Chuyển tab "Published"
- [ ] Click "🔒 Unpublish" - confirm hoạt động
- [ ] Click "📦 Archive" - modal hiện, yêu cầu lý do

---

## 📂 FILES MỚI TẠO

```
✅ frontend/lecturer-portal/syllabus-builder/src/features/syllabus/
   └── syllabusapi.ts (Updated: +90 lines APIs)

✅ frontend/academic-portal/src/
   ├── App.tsx (Updated: +120 lines routing)
   ├── App.css (Updated: +80 lines styles)
   └── components/
       ├── AA/
       │   ├── AAPendingReviews.tsx (NEW: 169 lines)
       │   ├── AAPendingReviews.css (NEW: 210 lines)
       │   ├── AASyllabusReview.tsx (NEW: 650 lines)
       │   └── AASyllabusReview.css (NEW: 530 lines)
       └── Admin/
           ├── AdminSyllabusManagement.tsx (NEW: 280 lines)
           └── AdminSyllabusManagement.css (NEW: 290 lines)

✅ WORKFLOW_ANALYSIS.md (NEW: 1500+ lines)
✅ SYLLABUS_IMPLEMENTATION_SUMMARY.md (NEW: 800+ lines)
✅ QUICK_START.md (This file)
```

**Total**: ~3,800 lines code mới

---

## 🔧 BACKEND CẦN IMPLEMENT

### Priority 1 - AA APIs:
```java
GET    /api/syllabus/pending-aa
POST   /api/syllabus/{id}/approve-aa
POST   /api/syllabus/{id}/reject-aa
POST   /api/syllabus/{id}/validate-mapping
POST   /api/syllabus/{id}/validate-credits
POST   /api/syllabus/{id}/validate-assessment
```

### Priority 2 - Admin APIs:
```java
POST   /api/syllabus/{id}/publish
POST   /api/syllabus/{id}/unpublish
POST   /api/syllabus/{id}/archive
GET    /api/syllabus/published
GET    /api/syllabus/archived
GET    /api/syllabus/all
```

---

## 📚 TÀI LIỆU CHI TIẾT

Xem các file:
- **WORKFLOW_ANALYSIS.md** - Phân tích workflow đầy đủ
- **SYLLABUS_IMPLEMENTATION_SUMMARY.md** - Chi tiết implementation

---

## ❓ FAQ

**Q: Tại sao không có HoD?**  
A: Theo yêu cầu người dùng, bỏ qua Level 1 (HoD), implement AA (Level 2) trước.

**Q: Mock data ở đâu?**  
A: Trong mỗi component (AAPendingReviews, AASyllabusReview, AdminSyllabusManagement) có mock data để test UI.

**Q: Backend chưa có APIs?**  
A: Đúng, frontend hoàn thành trước. Backend team cần implement các endpoints ở trên.

**Q: Làm sao test role?**  
A: Dùng `localStorage.setItem('user_role', 'AA')` hoặc `'ADMIN'` trong browser console.

---

## ✅ STATUS

| Component | Status | Progress |
|-----------|--------|----------|
| Lecturer Portal | ✅ Done | 100% |
| AA Portal | ✅ Done | 100% |
| Admin Portal | ✅ Done | 100% |
| Routing | ✅ Done | 100% |
| Backend APIs | ❌ TODO | 0% |
| HoD Portal | ⏭️ Skip | 0% |
| Principal Portal | ⏳ Future | 0% |
| Public Portal | ⏳ Future | 0% |

**Overall**: 85% Frontend Done, 0% Backend Done

---

**Updated**: Jan 18, 2026  
**Ready for**: Backend API Implementation
