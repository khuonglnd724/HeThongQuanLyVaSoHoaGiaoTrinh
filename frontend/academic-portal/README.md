# Academic Affairs Portal

## 📋 Purpose

**Academic Affairs (AA) Portal** - Dành riêng cho nhân viên Academic Affairs để duyệt giáo trình cấp 2.

### ✅ Vai Trò: ACADEMIC AFFAIRS ONLY

**Chức năng**:
- Review syllabuses (Level 2 approval)
- Validate CLO-PLO mapping
- Check credit structure
- Check assessment rules
- Approve/Reject syllabuses
- Statistics và báo cáo

### ❌ Không Có

- ❌ Lecturer features → Xem `lecturer-portal/syllabus-builder` (Port 5173)
- ❌ Admin publish/archive → Xem `admin-system` (Port 3001)
- ❌ HoD approval → Sẽ implement sau
- ❌ Principal approval → Sẽ implement sau

---

## 🚀 Quick Start

```bash
cd frontend/academic-portal
npm install
npm run dev
# → http://localhost:5174
```

### Test AA Role:

```javascript
// Browser Console
localStorage.setItem('user_role', 'AA');
localStorage.setItem('token', 'test-token');
// Reload → Thấy "📋 AA Reviews" button
```

---

## 📂 Structure

```
academic-portal/
├── src/
│   ├── components/
│   │   ├── AA/  ✅ AA Review Components
│   │   │   ├── AAPendingReviews.tsx
│   │   │   ├── AAPendingReviews.css
│   │   │   ├── AASyllabusReview.tsx
│   │   │   └── AASyllabusReview.css
│   │   ├── Statistics.tsx
│   │   ├── Login.tsx
│   │   └── Notifications.tsx
│   ├── services/
│   │   └── authService.ts
│   ├── App.tsx
│   └── App.css
```

---

## 🎯 Workflow

```
Lecturer → [HoD] → AA (HERE!) → Principal → Admin Publish
                     ↑
              Academic Affairs
              - Review Level 2
              - Validate Rules
              - Approve/Reject
```

---

## 🔗 Related Portals

- **Lecturer Portal** (Port 5173) - Tạo, sửa syllabus
- **Admin System** (Port 3001) - Publish, Archive, System Management

---

**Port**: 5174  
**Role**: Academic Affairs (AA) only  
**Updated**: Jan 18, 2026
