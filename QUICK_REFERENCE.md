# QUICK REFERENCE - SYLLABUS vs ACADEMIC

## 🎯 CRITICAL DIFFERENCE

| Aspect | Academic Service | Syllabus Service |
|--------|------------------|------------------|
| **PORT** | **8080** | **8085** ⭐ |
| **Database** | academic_db | syllabus_db |
| **For Lecturer** | Read reference data | **CREATE/EDIT/MANAGE** |
| **What it does** | Programs, Subjects, PLOs, Stats | **Syllabuses, CLOs, Versioning, Approvals** |

---

## 📍 WHERE EACH IS USED

### Syllabus Service (8085) - **LECTURER USES THIS**
```typescript
import syllabusService from '../services/syllabusService';

// Lecturer creating/editing syllabuses
await syllabusService.createSyllabus(data)
await syllabusService.updateSyllabus(id, data)
await syllabusService.submitForLevel1Approval(id)
await syllabusService.saveCLOs(id, clos)
await syllabusService.saveCLOMappings(id, mappings)
```

### Academic Service (8080) - **ADMIN/REFERENCE**
```typescript
import academicService from '../services/academicService';

// For reading program/subject information
await academicService.getPrograms()
await academicService.getSubjects()
await academicService.getPLOs()
await academicService.getStatistics()
```

---

## 🚀 UPDATED COMPONENTS

All Lecturer components now use **syllabusService**:

```
✅ SyllabusForm.tsx        → uses syllabusService
✅ CLOPLOMapping.tsx       → uses syllabusService
✅ SyllabusDetail.tsx      → uses syllabusService
✅ SyllabusList.tsx        → uses syllabusService
```

---

## 🔧 QUICK SETUP

### Environment Variable
```env
VITE_SYLLABUS_API_URL=http://localhost:8085/api/syllabus
```

### Service File Location
```
frontend/academic-portal/src/services/syllabusService.ts
```

### Starting Services
```bash
# Terminal 1 - Database
docker-compose up postgres

# Terminal 2 - Discovery Server
cd backend/discovery-server && mvn spring-boot:run

# Terminal 3 - Syllabus Service
cd backend/syllabus-service && mvn spring-boot:run

# Terminal 4 - Auth Service
cd backend/auth-service && mvn spring-boot:run

# Terminal 5 - Frontend
cd frontend/academic-portal && npm run dev
```

---

## 📊 API ENDPOINTS

### All Lecturer Operations Go Here:
```
http://localhost:8085/api/syllabus

POST   /                    → Create
GET    /                    → List
GET    /{id}                → Detail
PUT    /{id}                → Update
DELETE /{id}                → Delete

POST   /{id}/submit-level1  → Submit approval
POST   /{id}/clos           → Save CLOs
POST   /{id}/clo-mappings   → Save mappings
GET    /{id}/versions       → Get history
GET    /{id}/feedback       → Get feedback
```

---

## ✅ KEY CHANGES MADE

1. **Created syllabusService.ts** with correct port (8085)
2. **Updated all components** to use syllabusService
3. **Fixed API endpoints** to point to Syllabus Service
4. **Added lecturer-specific methods** (getMySyllabuses, getDraftSyllabuses, etc.)
5. **Enhanced filter options** (DRAFT, PUBLISHED status)

---

## ⚠️ COMMON MISTAKES TO AVOID

```typescript
❌ WRONG - This won't work for Lecturer operations:
import academicService from '../services/academicService';
await academicService.createSyllabus(data)  // Port 8080!

✅ CORRECT - Use this for Lecturer:
import syllabusService from '../services/syllabusService';
await syllabusService.createSyllabus(data)  // Port 8085!
```

---

## 🧪 TESTING THE SETUP

```bash
# Test Syllabus Service API
curl http://localhost:8085/api/syllabus

# Test Academic Service API
curl http://localhost:8080/api/academic

# Test Auth Service
curl http://localhost:8081/api/auth
```

---

## 📚 DOCUMENTATION FILES

1. **SYLLABUS_ANALYSIS.md** - Initial analysis
2. **SYLLABUS_vs_ACADEMIC.md** - Architecture details ⭐ READ THIS
3. **LECTURER_IMPLEMENTATION.md** - Full implementation guide
4. **LECTURER_FINAL_SUMMARY.md** - Complete summary

---

**Remember**: Syllabus Service (8085) = Lecturer's home base for syllabus operations!
