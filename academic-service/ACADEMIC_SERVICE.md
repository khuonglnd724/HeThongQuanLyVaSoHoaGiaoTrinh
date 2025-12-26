# Academic Service - Công tác Học thuật

## Mô tả

Academic Service quản lý các chức năng liên quan đến chuẩn đầu ra chương trình (PLO), chuẩn đầu ra môn học (CLO), bản đồ liên kết CLO-PLO, quản lý chương trình đào tạo, môn học, và giáo trình.

## Tính năng

### 1. Quản lý Chương trình (Program)
- Tạo, cập nhật, xóa chương trình đào tạo
- Quản lý thông tin cơ bản: mã, tên, tín chỉ, năm học, loại bằng cấp

### 2. Quản lý Môn học (Subject)
- Tạo, cập nhật, xóa môn học
- Liên kết môn học với chương trình
- Quản lý tiên quyết và đồng thời tiên quyết

### 3. Quản lý Giáo trình (Syllabus)
- Tạo, cập nhật, xóa giáo trình
- Phê duyệt/Từ chối giáo trình
- Quản lý phiên bản giáo trình theo năm học

### 4. Quản lý PLO (Program Learning Outcome)
- Tạo, cập nhật, xóa PLO
- Định nghĩa chuẩn đầu ra ở cấp chương trình

### 5. Quản lý CLO (Course Learning Outcome)
- Tạo, cập nhật, xóa CLO
- Liên kết CLO với môn học và giáo trình
- Định nghĩa chuẩn đầu ra ở cấp môn học

### 6. Bản đồ CLO-PLO Mapping
- Tạo liên kết giữa CLO và PLO
- Định nghĩa mức độ liên kết (Directly Supports, Partially Supports, Not Related)
- Quản lý mức độ proficiency (Introduce, Develop, Master)
- Cập nhật độ mạnh của liên kết (1-5)

### 7. Dashboard & Analytics
- Thống kê % CLO được map vào PLO
- Thống kê PLO được cover
- Trạng thái phê duyệt giáo trình
- Heatmap ma trận mapping CLO-PLO

## API Endpoints

### Program APIs

```
# Create Program
POST /api/v1/program

# Get Program by ID
GET /api/v1/program/{id}

# Get Program by Code
GET /api/v1/program/code/{code}

# Get Programs by Department
GET /api/v1/program/department/{departmentId}

# Get all Programs
GET /api/v1/program

# Search Programs
GET /api/v1/program/search?name=Software

# Update Program
PUT /api/v1/program/{id}

# Delete Program
DELETE /api/v1/program/{id}

# Get Curriculum Tree (Program -> Subject -> Syllabus -> CLO)
GET /api/v1/program/{programId}/curriculum

# Get Dashboard Stats
GET /api/v1/program/{programId}/dashboard
```

### Subject APIs

```
# Create Subject
POST /api/v1/subject

# Get Subject by ID
GET /api/v1/subject/{id}

# Get Subjects by Program
GET /api/v1/subject/program/{programId}

# Get Subjects by Program and Semester
GET /api/v1/subject/program/{programId}/semester/{semester}

# Get all Subjects
GET /api/v1/subject

# Search Subjects
GET /api/v1/subject/search?code=CS101

# Update Subject
PUT /api/v1/subject/{id}

# Delete Subject
DELETE /api/v1/subject/{id}
```

### Syllabus APIs

```
# Create Syllabus
POST /api/v1/syllabus

# Get Syllabus by ID
GET /api/v1/syllabus/{id}

# Get Syllabuses by Subject
GET /api/v1/syllabus/subject/{subjectId}

# Get Syllabuses by Status
GET /api/v1/syllabus/status/{status}

# Get Syllabuses by Approval Status
GET /api/v1/syllabus/approval-status/{approvalStatus}

# Get Syllabuses by Program
GET /api/v1/syllabus/program/{programId}

# Get all Syllabuses
GET /api/v1/syllabus

# Update Syllabus
PUT /api/v1/syllabus/{id}

# Approve/Reject Syllabus
PATCH /api/v1/syllabus/{id}/approve?approvalStatus=Approved&approvedBy=1&comments=Good

# Delete Syllabus
DELETE /api/v1/syllabus/{id}
```

### PLO APIs

```
# Create PLO
POST /api/v1/plo

# Get PLO by ID
GET /api/v1/plo/{id}

# Get PLOs by Program
GET /api/v1/plo/program/{programId}

# Get all PLOs
GET /api/v1/plo

# Search PLOs
GET /api/v1/plo/search?code=PLO1

# Update PLO
PUT /api/v1/plo/{id}

# Delete PLO
DELETE /api/v1/plo/{id}
```

### CLO APIs

```
# Create CLO
POST /api/v1/clo

# Get CLO by ID
GET /api/v1/clo/{id}

# Get CLOs by Subject
GET /api/v1/clo/subject/{subjectId}

# Get CLOs by Syllabus
GET /api/v1/clo/syllabus/{syllabusId}

# Get all CLOs
GET /api/v1/clo

# Search CLOs
GET /api/v1/clo/search?code=CLO1

# Update CLO
PUT /api/v1/clo/{id}

# Delete CLO
DELETE /api/v1/clo/{id}
```

### Mapping APIs

```
# Create CLO-PLO Mapping
POST /api/v1/mapping

# Get Mapping by ID
GET /api/v1/mapping/{id}

# Get Mappings by CLO
GET /api/v1/mapping/clo/{cloId}

# Get Mappings by PLO
GET /api/v1/mapping/plo/{ploId}

# Get Mappings by Program
GET /api/v1/mapping/program/{programId}

# Get all Mappings
GET /api/v1/mapping

# Update Mapping
PUT /api/v1/mapping/{id}

# Delete Mapping
DELETE /api/v1/mapping/{id}
```

## Request/Response Examples

### Create Program

**Request:**
```json
POST /api/v1/program
{
  "programCode": "SE001",
  "programName": "Kỹ sư Phần mềm",
  "description": "Chương trình đào tạo Kỹ sư Phần mềm",
  "departmentId": 1,
  "creditsRequired": 120,
  "durationYears": 4,
  "degreeType": "Bachelor",
  "accreditationStatus": "Accredited"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Program created successfully",
  "data": {
    "id": 1,
    "programCode": "SE001",
    "programName": "Kỹ sư Phần mềm",
    "description": "Chương trình đào tạo Kỹ sư Phần mềm",
    "departmentId": 1,
    "creditsRequired": 120,
    "durationYears": 4,
    "degreeType": "Bachelor",
    "accreditationStatus": "Accredited",
    "isActive": true,
    "createdAt": "2024-12-24T10:00:00",
    "updatedAt": "2024-12-24T10:00:00"
  },
  "timestamp": 1703412000000
}
```

### Create PLO

**Request:**
```json
POST /api/v1/plo
{
  "ploCode": "PLO1",
  "ploName": "Kiến thức chuyên môn cơ bản",
  "description": "Hiểu sâu về các khái niệm cơ bản",
  "programId": 1,
  "displayOrder": 1,
  "ploLevel": "Foundational",
  "assessmentMethod": "Exam, Project"
}
```

### Create CLO

**Request:**
```json
POST /api/v1/clo
{
  "cloCode": "CLO1",
  "cloName": "Hiểu khái niệm OOP",
  "description": "Sinh viên hiểu được các khái niệm OOP",
  "subjectId": 1,
  "syllabusId": 1,
  "bloomLevel": "Understand",
  "displayOrder": 1,
  "teachingMethod": "Lecture, Lab",
  "evaluationMethod": "Quiz, Assignment"
}
```

### Create Mapping

**Request:**
```json
POST /api/v1/mapping
{
  "cloId": 1,
  "ploId": 1,
  "mappingLevel": "Directly Supports",
  "proficiencyLevel": "Master",
  "evidenceMethod": "Exam marks >= 70%",
  "strengthLevel": 5
}
```

### Get Dashboard Stats

**Response:**
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "programId": 1,
    "totalPloCoveragePercentage": 85,
    "totalClos": 20,
    "mappedClos": 17,
    "unmappedClos": 3,
    "totalPlos": 5,
    "fullyCoveredPlos": 4,
    "partiallyCoveredPlos": 1,
    "uncoveredPlos": 0,
    "totalSubjects": 10,
    "subjectsWithClo": 9,
    "totalSyllabuses": 15,
    "syllabusesApproved": 12,
    "syllabusesUnderReview": 2,
    "syllabusesRejected": 1
  },
  "timestamp": 1703412000000
}
```

## Database Schema

### Tables
- `program` - Chương trình đào tạo
- `subject` - Môn học
- `syllabus` - Giáo trình
- `plo` - Program Learning Outcome
- `clo` - Course Learning Outcome
- `clo_mapping` - CLO-PLO Mapping

### Views
- `v_clo_coverage_by_program` - Thống kê CLO coverage
- `v_plo_coverage_by_program` - Thống kê PLO coverage
- `v_syllabus_approval_summary` - Tóm tắt phê duyệt Giáo trình

## Configuration

File `application.yml`:
```yaml
server:
  port: 8082
  servlet:
    context-path: /api/v1

spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/academic_db
    username: postgres
    password: 123456
  jpa:
    hibernate:
      ddl-auto: validate
```

## Dependencies

- Spring Boot 3.2.0
- Spring Data JPA
- PostgreSQL Driver
- Lombok
- Jackson

## Deployment

```bash
# Build
mvn clean package

# Run
java -jar target/academic-service-0.0.1-SNAPSHOT.jar
```

## Notes

- Tất cả deletions là soft deletes (isActive = false)
- API responses tuân theo format ApiResponse chuẩn
- Context path là `/api/v1` cho tất cả endpoints
- Service tự động đăng ký với Eureka
