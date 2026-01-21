# Admin System

## 👨‍💼 Purpose

**Admin System** - Super Admin portal for system management AND syllabus lifecycle management.

### ✅ Vai Trò: ADMIN/SUPER_ADMIN ONLY

**Chức năng System Management**:
- 👥 User account management
- 🔐 Role & permissions management
- ⚙️ System settings
- 🖥️ Service monitoring
- 📊 Audit logs
- 🔍 Health checks

**Chức năng Syllabus Lifecycle**:
- 📢 **Publish** approved syllabuses (make public)
- 🔒 **Unpublish** syllabuses (remove from public)
- 📦 **Archive** old syllabuses (with reason)
- 📋 View all syllabuses (Approved/Published/Archived)
- 📈 Syllabus statistics

### ❌ Không Có

- ❌ Lecturer features → Xem `lecturer-portal/syllabus-builder` (Port 5173)
- ❌ AA review → Xem `academic-portal` (Port 5174)
- ❌ Syllabus creation/editing → Lecturer portal

---

## 🚀 Quick Start

```bash
cd frontend/admin-system
npm install
npm start
# → http://localhost:3001
```

### Default Login:
```
Username: admin
Password: admin123
```

---

## 📂 Structure

```
admin-system/
├── src/
│   ├── components/
│   │   └── AdminSyllabusManagement.tsx ✅ NEW
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Users.js
│   │   ├── Roles.js
│   │   ├── Services.js
│   │   ├── SystemSettings.js
│   │   └── ...
│   ├── utils/
│   │   └── api.js
│   └── App.js
```

---

## 🎯 Workflow Integration

```
Lecturer → HoD → AA → Principal → ADMIN (HERE!) → Published
                                     ↓
                              Publish/Archive Control
                              - Make public
                              - Remove from public
                              - Archive old versions
```

### Admin Workflow:

1. **View Approved Syllabuses** (tab: Approved)
   - Syllabuses approved by Principal
   - Ready to publish

2. **Publish** → Make public
   - Students/Public can view
   - Status: PUBLISHED

3. **Manage Published** (tab: Published)
   - View all published syllabuses
   - Unpublish if needed
   - Archive when outdated

4. **Archive** (tab: Archived)
   - Old/obsolete syllabuses
   - With archive reason
   - Preserved for records

---

## 📋 Features

### System Management:
- ✅ User accounts (all users)
- ✅ Role assignments (Lecturer, AA, Admin, etc.)
- ✅ Service health monitoring (Eureka integration)
- ✅ System settings
- ✅ Audit logs

### Syllabus Management (NEW):
- ✅ Publish approved syllabuses
- ✅ Unpublish published syllabuses
- ✅ Archive with reason
- ✅ Search syllabuses
- ✅ View statistics
- ✅ 3 tabs: Approved / Published / Archived

---

## 🔗 Related Portals

| Portal | Port | Role | Purpose |
|--------|------|------|---------|
| **Lecturer Portal** | 5173 | Lecturer | Create, edit syllabuses |
| **Academic Portal** | 5174 | AA | Review Level 2, validate |
| **Admin System** | 3001 | Admin | Publish, Archive, System |

---

## 🎨 UI Features

- **3 Tabs Navigation**:
  - Approved (ready to publish)
  - Published (currently public)
  - Archived (old versions)

- **Actions**:
  - 📢 Publish button (with confirmation)
  - 🔒 Unpublish button (with confirmation)
  - 📦 Archive button (with reason modal)

- **Search**: By code, name, or lecturer
- **Stats**: Total count, last updated

---

## 🔧 Backend APIs Required

```java
// Syllabus Lifecycle
POST   /api/syllabus/{id}/publish
POST   /api/syllabus/{id}/unpublish
POST   /api/syllabus/{id}/archive
GET    /api/syllabus/published
GET    /api/syllabus/archived
GET    /api/syllabus/all

// System Management (existing)
GET    /api/users
POST   /api/users
GET    /api/roles
...
```

---

**Port**: 3001  
**Role**: Admin/Super Admin only  
**Updated**: Jan 18, 2026
