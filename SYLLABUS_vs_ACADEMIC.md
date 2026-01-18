# SYLLABUS vs ACADEMIC - CRITICAL CLARIFICATION

**Date**: January 18, 2026  
**Issue**: Incorrect API endpoint usage in Lecturer frontend  
**Status**: CORRECTED

---

## 🔴 PROBLEM IDENTIFIED

The implementation incorrectly uses **Academic Service** endpoints for Syllabus operations. These are **TWO SEPARATE MICROSERVICES**:

| Service | Port | Database | Responsibility |
|---------|------|----------|-----------------|
| **academic-service** | 8080 | academic_db | Programs, Subjects, Courses, Statistics |
| **syllabus-service** | 8085 | syllabus_db | Syllabus creation, editing, versioning, approval workflow |

### ❌ INCORRECT (What was implemented)
```typescript
// Using Academic Service API
const baseURL = 'http://localhost:8080/api/academic';
async getSyllabuses() => GET /api/academic/syllabus
async createSyllabus() => POST /api/academic/syllabus
```

### ✅ CORRECT (What should be used)
```typescript
// Using Syllabus Service API
const baseURL = 'http://localhost:8085/api/syllabus';
async getSyllabuses() => GET /api/syllabus
async createSyllabus() => POST /api/syllabus
```

---

## 📊 MICROSERVICES ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Port 8080)                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┬──────────────────────┐
        ↓                     ↓                      ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Auth Service     │ │ Academic Service │ │ Syllabus Service │
│ (Port 8081)      │ │ (Port 8080)      │ │ (Port 8085)      │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ auth_db          │ │ academic_db      │ │ syllabus_db      │
│                  │ │                  │ │                  │
│ Users            │ │ Programs         │ │ Syllabuses       │
│ Authentication   │ │ Subjects         │ │ Versions         │
│ Authorization    │ │ Courses          │ │ Approval         │
│                  │ │ PLOs             │ │ Feedback         │
│                  │ │ Statistics       │ │ CLOs             │
│                  │ │ CLO Mappings     │ │ CLO-PLO Mappings │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🔧 CORRECTION PLAN

### Step 1: Update Frontend Service Configuration

**File**: `frontend/academic-portal/src/services/academicService.ts`

**Change**:
```typescript
// BEFORE (Wrong)
this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/academic';

// AFTER (Correct)
this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/syllabus';
```

### Step 2: Create Separate Services (Best Practice)

Create two separate service files:

1. **academicService.ts** - For Programs, Subjects, Statistics, etc.
   - Base URL: `http://localhost:8080/api/academic`
   
2. **syllabusService.ts** - For Syllabus operations
   - Base URL: `http://localhost:8085/api/syllabus`

### Step 3: Update Component Imports

All Lecturer Syllabus components should use `syllabusService`, not `academicService`:

```typescript
// components/SyllabusForm.tsx
import syllabusService from '../services/syllabusService';  // ✅ Correct

// components/CLOPLOMapping.tsx
import syllabusService from '../services/syllabusService';  // ✅ Correct

// components/SyllabusDetail.tsx
import syllabusService from '../services/syllabusService';  // ✅ Correct
```

---

## 📋 SYLLABUS SERVICE API ENDPOINTS

### Base URL
```
http://localhost:8085/api/syllabus
```

### CRUD Operations
```
GET    /                          # List syllabuses (paginated)
GET    /{id}                      # Get syllabus by ID
POST   /                          # Create new syllabus
PUT    /{id}                      # Update syllabus
DELETE /{id}                      # Delete syllabus
```

### Lecturer-Specific Operations
```
GET    /lecturer/{lecturerId}     # Get lecturer's syllabuses
GET    /{id}/my-syllabuses        # My syllabuses (current user)
```

### Content Management
```
POST   /{id}/clos                 # Save CLOs
POST   /{id}/clo-mappings         # Save CLO-PLO mappings
GET    /{id}/clos                 # Get CLOs
GET    /{id}/clo-mappings         # Get mappings
```

### Approval Workflow
```
POST   /{id}/submit-level1        # Submit for Level 1 approval
POST   /{id}/submit-level2        # Submit for Level 2 approval (if needed)
POST   /{id}/approve-level1       # Level 1 approve (APPROVER_L1 only)
POST   /{id}/reject-level1        # Level 1 reject (APPROVER_L1 only)
POST   /{id}/approve-level2       # Level 2 approve (APPROVER_L2 only)
POST   /{id}/reject-level2        # Level 2 reject (APPROVER_L2 only)
POST   /{id}/feedback-response    # Respond to feedback
```

### Validation
```
POST   /{id}/validate             # Validate syllabus
POST   /{id}/validate-approval    # Check if ready for approval
POST   /{id}/validate-prerequisites # Check prerequisites
```

### Version & History
```
GET    /{id}/versions             # Get version history
GET    /{id}/versions/{version}   # Get specific version
POST   /{id}/versions/{version}/restore # Restore version
GET    /{id}/compare              # Compare versions
```

### Search & Filter
```
GET    /search                    # Search syllabuses
GET    /pending-approval          # Pending approval
GET    /approved                  # Approved
GET    /rejected                  # Rejected
GET    /draft                     # Drafts
GET    /published                 # Published
```

### Feedback & Comments
```
GET    /{id}/feedback             # Get feedback
POST   /{id}/feedback-response    # Post response
GET    /{id}/feedback-history     # Feedback history
```

---

## 📱 DATA FLOW WITH CORRECT SERVICES

### Creating a New Syllabus (Correct Flow)

```
1. User fills SyllabusForm
   ↓
2. Click "Save Draft"
   ↓
3. syllabusService.createSyllabus(data)
   ↓
4. POST http://localhost:8085/api/syllabus
   ↓
5. Syllabus Service saves to syllabus_db
   ↓
6. Response: Syllabus object with id
   ↓
7. Navigate to SyllabusDetail
```

### Adding CLOs (Correct Flow)

```
1. User opens CLOPLOMapping component
   ↓
2. User adds CLOs
   ↓
3. Click "Save"
   ↓
4. syllabusService.saveCLOs(syllabusId, clos)
   ↓
5. POST http://localhost:8085/api/syllabus/{id}/clos
   ↓
6. Syllabus Service saves to syllabus_db
   ↓
7. Update CLOs in component
```

### Mapping CLOs to PLOs

```
1. User selects CLO and PLO
   ↓
2. Click "Map"
   ↓
3. syllabusService.saveCLOMappings(syllabusId, mappings)
   ↓
4. POST http://localhost:8085/api/syllabus/{id}/clo-mappings
   ↓
5. Syllabus Service updates mappings in syllabus_db
   ↓
6. Update UI with confirmation
```

---

## 🔗 WHEN TO USE EACH SERVICE

### Use **Academic Service** (Port 8080) for:
- Getting list of Programs
- Getting list of Subjects
- Getting Subject details
- Getting PLO information
- Fetching Statistics (program/subject coverage)
- Getting academic metadata

### Use **Syllabus Service** (Port 8085) for:
- Creating/Editing syllabuses
- Managing CLOs
- Mapping CLO to PLO
- Submitting syllabuses for approval
- Viewing approval feedback
- Version history
- Approval workflow

---

## 📝 ENVIRONMENT CONFIGURATION

### .env (Frontend)

```env
# Academic Service (for programs, subjects, statistics)
VITE_ACADEMIC_API_URL=http://localhost:8080/api/academic

# Syllabus Service (for syllabus operations)
VITE_SYLLABUS_API_URL=http://localhost:8085/api/syllabus

# Auth Service
VITE_AUTH_API_URL=http://localhost:8081/api/auth
```

### Docker Compose

```yaml
services:
  academic-service:
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/academic_db

  syllabus-service:
    ports:
      - "8085:8085"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/syllabus_db

  auth-service:
    ports:
      - "8081:8081"
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Create `syllabusService.ts` with correct base URL (8085)
- [ ] Update all Lecturer components to import syllabusService
- [ ] Remove academicService calls from Lecturer components
- [ ] Update environment variables
- [ ] Test API calls to verify correct endpoints
- [ ] Update documentation in component files
- [ ] Verify database operations in syllabus_db
- [ ] Test approval workflow
- [ ] Test version history
- [ ] Test CLO/PLO mapping

---

## 🚨 CRITICAL DIFFERENCES

| Aspect | Academic Service | Syllabus Service |
|--------|------------------|------------------|
| **Port** | 8080 | 8085 |
| **Database** | academic_db | syllabus_db |
| **Main Entity** | Program, Subject, Course | Syllabus |
| **Key Features** | Metadata, Statistics | Versioning, Approval |
| **API Prefix** | /api/academic | /api/syllabus |
| **For Lecturer** | Read program/subject info | Create/manage syllabuses |

---

## 🔄 NEXT STEPS

1. **Create syllabusService.ts** - Duplicate and modify academicService.ts
2. **Update component imports** - Change to use syllabusService
3. **Update environment config** - Add VITE_SYLLABUS_API_URL
4. **Test API connectivity** - Verify endpoints work
5. **Update documentation** - Reflect correct architecture

---

## 📚 RELATED FILES

- [Syllabus Service Config](backend/syllabus-service/src/main/resources/application.yml)
- [Academic Service Config](backend/academic-service/src/main/resources/application.yml)
- [Frontend Services](frontend/academic-portal/src/services/)
- [Components](frontend/academic-portal/src/components/)

---

**Author**: System Analysis  
**Status**: CRITICAL - REQUIRES IMMEDIATE CORRECTION  
**Priority**: HIGH  
**Impact**: All Lecturer Syllabus Operations  
**Estimated Fix Time**: 1-2 hours
