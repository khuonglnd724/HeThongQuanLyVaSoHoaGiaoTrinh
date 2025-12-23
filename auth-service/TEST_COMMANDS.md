# Auth Service - Test Commands

## Test với cURL

### 1. Health Check
```bash
curl -X GET http://localhost:8081/actuator/health
```

### 2. Đăng ký người dùng mới
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123456",
    "fullName": "Test User",
    "phoneNumber": "0987654321"
  }'
```

### 3. Đăng nhập
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

**Lưu token từ response vào biến:**
```bash
# Linux/Mac
export TOKEN="your_token_here"

# Windows PowerShell
$env:TOKEN="your_token_here"
```

### 4. Lấy danh sách users (Admin)
```bash
# Linux/Mac
curl -X GET "http://localhost:8081/api/users?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
curl -X GET "http://localhost:8081/api/users?page=0&size=10" `
  -H "Authorization: Bearer $env:TOKEN"
```

### 5. Lấy thông tin user theo ID
```bash
# Linux/Mac
curl -X GET http://localhost:8081/api/users/1 \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
curl -X GET http://localhost:8081/api/users/1 `
  -H "Authorization: Bearer $env:TOKEN"
```

### 6. Tạo user mới (Admin)
```bash
# Linux/Mac
curl -X POST http://localhost:8081/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newlecturer",
    "email": "lecturer@smd.edu.vn",
    "password": "Lecturer@123",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789"
  }'

# Windows PowerShell
curl -X POST http://localhost:8081/api/users `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"newlecturer\",\"email\":\"lecturer@smd.edu.vn\",\"password\":\"Lecturer@123\",\"fullName\":\"Nguyễn Văn A\",\"phoneNumber\":\"0123456789\"}'
```

### 7. Cập nhật user
```bash
# Linux/Mac
curl -X PUT http://localhost:8081/api/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Full Name",
    "phoneNumber": "0999888777"
  }'
```

### 8. Khóa user
```bash
# Linux/Mac
curl -X POST http://localhost:8081/api/users/2/lock \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
curl -X POST http://localhost:8081/api/users/2/lock `
  -H "Authorization: Bearer $env:TOKEN"
```

### 9. Mở khóa user
```bash
# Linux/Mac
curl -X POST http://localhost:8081/api/users/2/unlock \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
curl -X POST http://localhost:8081/api/users/2/unlock `
  -H "Authorization: Bearer $env:TOKEN"
```

### 10. Đổi mật khẩu
```bash
# Linux/Mac
curl -X POST http://localhost:8081/api/users/reset-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "oldPassword": "Test@123456",
    "newPassword": "NewPass@123456"
  }'
```

### 11. Gán role cho user
```bash
# Linux/Mac
curl -X POST http://localhost:8081/api/users/2/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "ROLE_LECTURER"
  }'

# Windows PowerShell
curl -X POST http://localhost:8081/api/users/2/roles `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"roleName\":\"ROLE_LECTURER\"}'
```

### 12. Xem lịch sử đăng nhập
```bash
# Linux/Mac
curl -X GET http://localhost:8081/api/users/1/login-history \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
curl -X GET http://localhost:8081/api/users/1/login-history `
  -H "Authorization: Bearer $env:TOKEN"
```

### 13. Xóa user
```bash
# Linux/Mac
curl -X DELETE http://localhost:8081/api/users/2 \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
curl -X DELETE http://localhost:8081/api/users/2 `
  -H "Authorization: Bearer $env:TOKEN"
```

## Test với PowerShell (Invoke-RestMethod)

### Login và lưu token
```powershell
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'

$token = $loginResponse.token
Write-Host "Token: $token"
```

### Sử dụng token để gọi API
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

# Get users
$users = Invoke-RestMethod -Uri "http://localhost:8081/api/users?page=0&size=10" `
  -Method Get `
  -Headers $headers

$users | ConvertTo-Json -Depth 10
```

## Test Scenarios

### Scenario 1: Đăng ký và đăng nhập user mới
```bash
# 1. Đăng ký
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","email":"student01@smd.edu.vn","password":"Student@123","fullName":"Sinh Viên 01","phoneNumber":"0901234567"}'

# 2. Đăng nhập để lấy token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","password":"Student@123"}'
```

### Scenario 2: Admin quản lý users
```bash
# 1. Login as admin
export TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' | jq -r '.token')

# 2. Tạo lecturer
curl -X POST http://localhost:8081/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"lecturer01","email":"lecturer01@smd.edu.vn","password":"Lecturer@123","fullName":"Giảng Viên 01","phoneNumber":"0912345678"}'

# 3. Gán role LECTURER
curl -X POST http://localhost:8081/api/users/2/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roleName":"ROLE_LECTURER"}'

# 4. Xem danh sách users
curl -X GET "http://localhost:8081/api/users?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 3: Test account locking
```bash
# 1. Đăng nhập sai 5 lần
for i in {1..5}; do
  curl -X POST http://localhost:8081/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"student01","password":"WrongPassword"}'
  echo "\nAttempt $i"
done

# 2. Thử đăng nhập với password đúng (sẽ bị khóa)
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","password":"Student@123"}'

# 3. Admin unlock account
curl -X POST http://localhost:8081/api/users/2/unlock \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Expected Responses

### Success Response (200)
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "admin",
  "email": "admin@smd.edu.vn",
  "fullName": "System Administrator",
  "roles": ["ROLE_ADMIN"]
}
```

### Error Response (401 Unauthorized)
```json
{
  "timestamp": "2025-12-22T08:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "path": "/api/auth/login"
}
```

### Error Response (403 Forbidden)
```json
{
  "timestamp": "2025-12-22T08:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/users"
}
```

### Error Response (400 Bad Request)
```json
{
  "timestamp": "2025-12-22T08:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Username already exists",
  "path": "/api/auth/register"
}
```
