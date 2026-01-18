# Frontend Admin System - API Integration Guide

Complete guide for integrating the frontend admin system with the auth-service backend.

## Overview

The frontend admin system (`frontend/admin-system/`) now includes real API integration with the auth-service (`backend/auth-service/`). Both mock data and real API endpoints are supported for flexible development.

## Architecture

```
Frontend (Admin System)
    ↓ HTTP/REST + JWT
API Gateway (8080)
    ↓ Routes to
Auth Service (8081)
    ├── User Management (/api/users)
    ├── Role Management (/api/roles)
    └── Authentication (/api/auth)
    ↓
PostgreSQL Database
```

## Frontend Components

### Pages
- **index.html** - Login page
- **dashboard.html** - Service monitoring
- **services.html** - Service list
- **eureka.html** - Eureka registry viewer
- **config-server.html** - Configuration browser
- **users.html** - User management CRUD
- **roles.html** - Role and permission management

### JavaScript Files

#### common.js
```javascript
// Defines API_BASE_URL (defaults to http://localhost:8080)
const API_BASE_URL = ...

// Token refresh function
async function refreshToken() { ... }

// Authentication checks
function checkAuth() { ... }

// Helper functions
function formatDate() { ... }
function getStatusColor() { ... }
```

#### api.js
```javascript
// Central API client with JWT interceptor
async function apiRequest(url, options) { ... }
```

#### users.js
- `loadUsers()` - Fetch users from /api/users
- `createUser()` - POST /api/users
- `updateUser()` - PUT /api/users/{id}
- `deleteUser()` - DELETE /api/users/{id}

#### roles.js
- `loadRoles()` - Fetch roles from /api/roles
- `getAllPermissions()` - GET /api/roles/permissions/all
- `renderPermissionsMatrix()` - Display role/permission mapping

## Backend API Endpoints

### Authentication
```
POST /api/auth/login
  Input: { username, password }
  Output: { accessToken, refreshToken, username }
  Status: 200, 401, 400

POST /api/auth/register
  Input: { username, email, password, fullName }
  Output: { accessToken, refreshToken, ... }
  Status: 201, 400

POST /api/auth/refresh
  Input: { refreshToken }
  Output: { accessToken, refreshToken }
  Status: 200, 401
```

### User Management
```
GET /api/users
  Headers: Authorization: Bearer <token>
  Query: page=0&size=100
  Output: Page<UserDTO> or Array<UserDTO>
  Auth: ADMIN role required

GET /api/users/{id}
  Headers: Authorization: Bearer <token>
  Output: UserDTO
  Auth: ADMIN role required

POST /api/users
  Headers: Authorization: Bearer <token>
  Input: { username, email, password, fullName, roles, isActive }
  Output: UserDTO
  Auth: ADMIN role required

PUT /api/users/{id}
  Headers: Authorization: Bearer <token>
  Input: { username, email, password, fullName, roles, isActive }
  Output: UserDTO
  Auth: ADMIN role required

DELETE /api/users/{id}
  Headers: Authorization: Bearer <token>
  Output: Success message
  Auth: ADMIN role required
```

### Role Management
```
GET /api/roles
  Headers: Authorization: Bearer <token>
  Output: Array<RoleDTO>
  Auth: ADMIN role required

GET /api/roles/{id}
  Headers: Authorization: Bearer <token>
  Output: RoleDTO
  Auth: ADMIN role required

GET /api/roles/permissions/all
  Headers: Authorization: Bearer <token>
  Output: { "User Management": [...], "System": [...], ... }
  Auth: ADMIN role required

POST /api/roles
  Headers: Authorization: Bearer <token>
  Input: { name, description, permissions }
  Output: RoleDTO
  Auth: ADMIN role required

PUT /api/roles/{id}
  Headers: Authorization: Bearer <token>
  Input: { description, permissions }
  Output: RoleDTO
  Auth: ADMIN role required

DELETE /api/roles/{id}
  Headers: Authorization: Bearer <token>
  Output: Success message
  Auth: ADMIN role required
```

## Data Models

### UserDTO
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@smd.edu.vn",
  "fullName": "System Administrator",
  "roles": ["ADMIN"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2026-01-17T10:30:00Z"
}
```

### RoleDTO
```json
{
  "id": 1,
  "name": "ADMIN",
  "description": "Full system access",
  "permissions": [
    "user.create",
    "user.read",
    "user.update",
    "user.delete",
    "role.manage"
  ]
}
```

### LoginRequest
```json
{
  "username": "admin",
  "password": "password123"
}
```

### AuthResponse
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "roles": ["ADMIN"]
}
```

## Authentication Flow

1. **Login**
   ```
   User enters credentials → POST /api/auth/login
   → Receive accessToken + refreshToken
   → Store in localStorage
   → Redirect to dashboard
   ```

2. **API Calls**
   ```
   Every API request includes:
   Authorization: Bearer <accessToken>
   ```

3. **Token Refresh**
   ```
   If 401 response:
   → POST /api/auth/refresh with refreshToken
   → Receive new accessToken
   → Retry original request
   ```

4. **Logout**
   ```
   Clear localStorage → Redirect to login
   ```

## CORS Configuration

Auth-Service CORS settings (in `CorsConfig.java`):

```java
Allowed Origins:
  - http://localhost:3000 (frontend dev)
  - http://localhost:80 (frontend nginx)
  - http://localhost:8080 (api gateway)
  
Allowed Methods:
  - GET, POST, PUT, DELETE, OPTIONS, PATCH

Exposed Headers:
  - Authorization
  - Content-Type
  - X-Requested-With
```

## Setup & Deployment

### 1. Build Auth Service
```bash
cd backend/auth-service
mvn clean package
```

### 2. Start Containers
```bash
cd docker
docker compose up -d auth-service discovery-server config-server postgres
```

### 3. Serve Frontend
```bash
# Option 1: Using Python
cd frontend/admin-system
python3 -m http.server 3000

# Option 2: Using Node.js
npx http-server . -p 3000

# Option 3: Using VS Code Live Server
# Right-click index.html → Open with Live Server
```

### 4. Test Login
```
URL: http://localhost:3000/index.html (or your frontend server)
Username: admin
Password: <password from database>
```

## Troubleshooting

### Issue: CORS Error
**Problem:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution:**
- Ensure CORS is enabled in auth-service
- Check `CorsConfig.java` is in classpath
- Verify allowed origins include your frontend URL
- Rebuild auth-service: `mvn clean package`

### Issue: 401 Unauthorized
**Problem:** All API requests return 401

**Solution:**
- Check JWT token in localStorage
- Verify token not expired
- Test token refresh: POST /api/auth/refresh
- Clear localStorage and re-login

### Issue: 404 Not Found
**Problem:** API endpoints return 404

**Solution:**
- Verify auth-service is running: http://localhost:8081/actuator/health
- Check endpoint URL matches controller mapping
- Verify RoleController.java is compiled
- Check auth-service logs: `docker logs auth-service`

### Issue: Database Connection Error
**Problem:** Auth service fails to start with DB error

**Solution:**
- Check PostgreSQL is running: `docker compose ps postgres`
- Verify database schema is initialized
- Check credentials in application.yml
- Run migration scripts manually

## Mock Data Fallback

If the real API is unavailable, the frontend automatically falls back to mock data:

```javascript
// In users.js and roles.js
if (apiCall fails) {
    console.log('Using mock data...');
    allUsers = mockUsers;
    renderUsersTable(allUsers);
}
```

This allows frontend development to continue even when the backend is not ready.

## Development Workflow

1. **Frontend Only Development**
   - Frontend runs locally
   - Uses mock data from JS files
   - No backend needed

2. **Full Stack Development**
   - Start all docker containers
   - Frontend connects to real API
   - Changes reflected in database

3. **API Endpoint Testing**
   ```bash
   # Test user creation
   curl -X POST http://localhost:8081/api/users \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@test.com","password":"pass123","roles":["STUDENT"]}'
   ```

## Next Steps

1. ✅ RoleController implemented
2. ✅ CORS configured
3. ✅ Frontend integrated with real API
4. ⏳ Database schema initialized (run migrations)
5. ⏳ Test complete workflow (login → users → roles)
6. ⏳ Add refresh token endpoint to AuthController (if missing)
7. ⏳ Implement permission validation in controllers

## Additional Resources

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Introduction](https://jwt.io)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
