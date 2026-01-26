# Auth Service - SMD Microservices

Service xác thực và phân quyền cho hệ thống quản lý đề cương môn học.

## Công nghệ sử dụng

- **Spring Boot 3.2.0** - Framework chính
- **Spring Security 6.2.0** - Bảo mật và xác thực
- **JWT (JJWT 0.11.5)** - Token-based authentication
- **Spring Data JPA** - ORM và database access
- **MySQL 8** - Database chính
- **Lombok** - Giảm boilerplate code
- **Spring Cloud Netflix Eureka** - Service discovery
- **Spring Cloud Config** - Centralized configuration

## Cấu trúc thư mục

```
auth-service/
├── src/main/java/com/smd/auth_service/
│   ├── config/              # Configuration classes
│   │   └── SecurityConfig.java
│   ├── controller/          # REST Controllers
│   │   ├── AuthController.java
│   │   └── UserController.java
│   ├── dto/                 # Data Transfer Objects
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── ResetPasswordRequest.java
│   │   ├── UserDTO.java
│   │   └── LoginHistoryDTO.java
│   ├── entity/              # JPA Entities
│   │   ├── User.java
│   │   ├── Role.java
│   │   ├── ERole.java
│   │   ├── Permission.java
│   │   └── LoginHistory.java
│   ├── exception/           # Custom Exceptions
│   │   ├── ResourceNotFoundException.java
│   │   └── BadRequestException.java
│   ├── repository/          # JPA Repositories
│   │   ├── UserRepository.java
│   │   ├── RoleRepository.java
│   │   └── LoginHistoryRepository.java
│   ├── security/            # Security Components
│   │   ├── JwtTokenProvider.java
│   │   ├── UserDetailsImpl.java
│   │   ├── UserDetailsServiceImpl.java
│   │   └── AuthTokenFilter.java
│   ├── service/             # Business Logic
│   │   ├── UserService.java
│   │   └── impl/
│   │       └── UserServiceImpl.java
│   └── AuthServiceApplication.java
└── src/main/resources/
    └── application.properties
```

## Cấu hình

### application.properties

```properties
# Server Configuration
server.port=8081

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smd_auth
spring.datasource.username=root
spring.datasource.password=your_password_here
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
app.jwtSecret=YourSecretKeyHere_ChangeThisInProduction_MustBe256BitsOrLonger
app.jwtExpirationMs=86400000
app.jwtRefreshExpirationMs=604800000

# Eureka Client Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true

# Config Server
spring.config.import=optional:configserver:http://localhost:8888
spring.application.name=auth-service
```

## Cài đặt và chạy

### 1. Tạo database

```sql
CREATE DATABASE smd_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cập nhật cấu hình

Chỉnh sửa `application.properties`:
- Cập nhật thông tin database (username, password)
- Thay đổi `app.jwtSecret` thành secret key an toàn

### 3. Build project

```bash
# Windows
mvnw clean install

# Linux/Mac
./mvnw clean install
```

### 4. Chạy service

```bash
# Windows
mvnw spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Service sẽ chạy tại `http://localhost:8081`

## API Endpoints

### Public Endpoints (Không cần authentication)

#### 1. Đăng ký người dùng mới
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "fullName": "John Doe",
  "phoneNumber": "0123456789"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "roles": ["ROLE_STUDENT"]
}
```

#### 2. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "StrongPass123!"
}
```

**Response:** Giống như đăng ký

### Protected Endpoints (Cần JWT Token)

**Header required:**
```
Authorization: Bearer <your_jwt_token>
```

#### 3. Lấy thông tin user (Admin only)
```http
GET /api/users/{userId}
```

#### 4. Lấy danh sách users với phân trang (Admin only)
```http
GET /api/users?page=0&size=10&sort=username,asc
```

**Response:**
```json
{
  "content": [
    {
      "userId": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "phoneNumber": "0123456789",
      "isActive": true,
      "isLocked": false
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  "size": 10,
  "number": 0
}
```

#### 5. Tạo user mới (Admin only)
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "Password123!",
  "fullName": "New User",
  "phoneNumber": "0987654321"
}
```

#### 6. Cập nhật user (Admin only)
```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phoneNumber": "0111222333"
}
```

#### 7. Xóa user (Admin only)
```http
DELETE /api/users/{userId}
```

#### 8. Khóa user (Admin only)
```http
POST /api/users/{userId}/lock
```

#### 9. Mở khóa user (Admin only)
```http
POST /api/users/{userId}/unlock
```

#### 10. Đổi mật khẩu (Authenticated users)
```http
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### 11. Gán role cho user (Admin only)
```http
POST /api/users/{userId}/roles
Content-Type: application/json

{
  "roleName": "ROLE_LECTURER"
}
```

#### 12. Lấy lịch sử đăng nhập (Admin only)
```http
GET /api/users/{userId}/login-history
```

## Roles trong hệ thống

- `ROLE_ADMIN` - Quản trị viên hệ thống
- `ROLE_RECTOR` - Hiệu trưởng
- `ROLE_ACADEMIC_AFFAIRS` - Phòng đào tạo
- `ROLE_HOD` - Trưởng khoa
- `ROLE_LECTURER` - Giảng viên
- `ROLE_STUDENT` - Sinh viên
- `ROLE_COUNCIL_MEMBER` - Thành viên hội đồng

## Bảo mật

### JWT Token
- Token hết hạn sau 24 giờ (mặc định)
- Refresh token hết hạn sau 7 ngày
- Secret key cần đủ mạnh (256-bit minimum)

### Password Policy
- Mã hóa bằng BCrypt
- Nên có độ dài tối thiểu 8 ký tự
- Khuyến nghị có chữ hoa, chữ thường, số và ký tự đặc biệt

### Account Locking
- Tự động khóa sau 5 lần đăng nhập sai
- Admin có thể unlock thủ công

## Test với Postman

### 1. Import Collection

Tạo Postman Collection với các endpoint trên.

### 2. Setup Environment

Tạo environment variables:
```
baseUrl = http://localhost:8081
token = (để trống, sẽ tự động set sau khi login)
```

### 3. Workflow test

1. **Register** → Lấy token từ response
2. **Login** → Lấy token từ response  
3. Set token vào Authorization header cho các request khác
4. Test các endpoint còn lại

### Example Postman Pre-request Script (để tự động set token)
```javascript
// Trong tab Tests của Login/Register request:
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

### Example Authorization Header
```
Authorization: Bearer {{token}}
```

## Troubleshooting

### Lỗi kết nối database
```
Error: Unable to connect to MySQL
```
**Giải pháp:**
- Kiểm tra MySQL đã chạy
- Kiểm tra username/password trong application.properties
- Kiểm tra database đã được tạo

### Lỗi JWT Token Invalid
```
Error: JWT signature does not match
```
**Giải pháp:**
- Kiểm tra `app.jwtSecret` có khớp không
- Token có thể đã hết hạn, login lại

### Lỗi 403 Forbidden
```
Error: Access Denied
```
**Giải pháp:**
- Kiểm tra role của user có quyền truy cập endpoint không
- Kiểm tra token có được gửi trong header không

## Development

### Thêm endpoint mới

1. Tạo DTO trong `dto/`
2. Thêm method trong `UserService` interface
3. Implement method trong `UserServiceImpl`
4. Tạo endpoint trong Controller
5. Update SecurityConfig nếu cần

### Thêm role mới

1. Thêm role vào enum `ERole`
2. Tạo migration script để insert role vào database
3. Update SecurityConfig permissions nếu cần

## Liên hệ

- Member: Member 1 - System Admin
- Responsibilities: Discovery Server, Config Server, API Gateway, Auth Service

---

**Note:** Đây là phần authentication service cho project quản lý đề cương. Cần chạy Discovery Server và Config Server trước khi chạy service này.
