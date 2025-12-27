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

## JWT E2E Testing qua API Gateway

### 1. Generate Test JWT Token

**Option A: Sử dụng Auth Service Login**
```powershell
# PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'

$token = $response.token
Write-Host "Token: $token"
```

```bash
# Linux/Mac
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

**Option B: Generate Manual JWT (for testing)**
```powershell
# PowerShell - Install-Module -Name PSJwt first
$secret = "smdMicroservicesSecretKeyForJWTTokenGenerationAndValidation2024"
$payload = @{
    sub = "test-user"
    roles = @("USER")
    iat = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    exp = [DateTimeOffset]::UtcNow.AddMinutes(30).ToUnixTimeSeconds()
} | ConvertTo-Json

# Or use online tool: https://jwt.io with HS256 algorithm
```

### 2. Test Whitelisted Routes (No Token Required)

```powershell
# PowerShell
# Health check - whitelisted
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/health"

# Login endpoint - whitelisted
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'

# Actuator health - whitelisted
Invoke-WebRequest -Uri "http://localhost:8080/actuator/health"

# Prometheus metrics - whitelisted for monitoring
Invoke-WebRequest -Uri "http://localhost:8080/actuator/prometheus"
```

```bash
# Linux/Mac
curl http://localhost:8080/api/auth/health
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/prometheus
```

### 3. Test Protected Routes (Token Required)

```powershell
# PowerShell - Without token (should return 401 Unauthorized)
Invoke-WebRequest -Uri "http://localhost:8080/api/users"
# Expected: 401 Unauthorized

# With valid token (should return 200 OK)
$headers = @{ Authorization = "Bearer $token" }
Invoke-WebRequest -Uri "http://localhost:8080/api/users?page=0&size=10" -Headers $headers

# Test user profile endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/me" -Headers $headers

# Test protected academic service endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/academic/plos" -Headers $headers
```

```bash
# Linux/Mac - Without token
curl http://localhost:8080/api/users
# Expected: 401 Unauthorized

# With valid token
curl http://localhost:8080/api/users?page=0&size=10 \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Invalid Token (should return 401)

```powershell
# PowerShell
$invalidHeaders = @{ Authorization = "Bearer invalid.token.here" }
Invoke-WebRequest -Uri "http://localhost:8080/api/users" -Headers $invalidHeaders
# Expected: 401 Unauthorized - Invalid JWT token
```

```bash
# Linux/Mac
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer invalid.token.here"
# Expected: 401 Unauthorized
```

### 5. Test Expired Token (should return 401)

```powershell
# Generate token with 1 second expiration, wait, then test
# Token will expire and return 401 Unauthorized
```

### 6. Verify JWT Filter Logs

Check API Gateway logs to see JWT validation:
```powershell
docker compose logs -f api-gateway --tail=50
```

Expected log patterns:
- `Whitelisted request: /api/auth/login` - Bypassed JWT validation
- `Valid JWT token for user: admin` - Successful validation
- `Invalid JWT token` - Failed validation

### 7. Test Gateway Routing with JWT

```powershell
# PowerShell - Test routing to different services
$headers = @{ Authorization = "Bearer $token" }

# Route to Auth Service
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/me" -Headers $headers

# Route to Academic Service
Invoke-WebRequest -Uri "http://localhost:8080/api/academic/plos" -Headers $headers

# Route to Public Service
Invoke-WebRequest -Uri "http://localhost:8080/api/public/announcements" -Headers $headers
```

### 8. Full E2E JWT Flow Test

```powershell
# PowerShell - Complete flow
Write-Host "=== JWT E2E Verification Test ===" -ForegroundColor Cyan

# Step 1: Login and get token
Write-Host "`n1. Login to get JWT token..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'
$token = $loginResponse.token
Write-Host "✓ Token received: $($token.Substring(0,50))..." -ForegroundColor Green

# Step 2: Test whitelisted route without token
Write-Host "`n2. Test whitelisted route (no token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/health"
    Write-Host "✓ Whitelisted route accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test protected route without token (should fail)
Write-Host "`n3. Test protected route without token (should fail)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:8080/api/users"
    Write-Host "✗ Should have returned 401!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly returned 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 4: Test protected route with valid token
Write-Host "`n4. Test protected route with valid token..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Headers $headers
    Write-Host "✓ Protected route accessible with token" -ForegroundColor Green
    Write-Host "  User: $($response.username), Roles: $($response.roles -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== JWT E2E Test Complete ===" -ForegroundColor Cyan
```

```bash
# Linux/Mac - Complete flow
echo "=== JWT E2E Verification Test ==="

# Step 1: Login
echo -e "\n1. Login to get JWT token..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' | jq -r '.token')
echo "✓ Token received: ${TOKEN:0:50}..."

# Step 2: Test whitelisted route
echo -e "\n2. Test whitelisted route (no token)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/health)
echo "✓ Whitelisted route accessible: $STATUS"

# Step 3: Test protected route without token
echo -e "\n3. Test protected route without token (should fail)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/users)
if [ "$STATUS" = "401" ]; then
    echo "✓ Correctly returned 401 Unauthorized"
else
    echo "✗ Expected 401, got $STATUS"
fi

# Step 4: Test protected route with token
echo -e "\n4. Test protected route with valid token..."
RESPONSE=$(curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN")
echo "✓ Protected route accessible with token"
echo "  Response: $RESPONSE"

echo -e "\n=== JWT E2E Test Complete ==="
```

### JWT Whitelist Configuration

Current whitelisted routes (no JWT required):
- `/api/auth/**` - All auth endpoints (login, register, health)
- `/actuator/health` - Health check endpoint
- `/actuator/prometheus` - Metrics for Prometheus scraping
- `/` - Root endpoint

All other routes require valid JWT token in `Authorization: Bearer <token>` header.
