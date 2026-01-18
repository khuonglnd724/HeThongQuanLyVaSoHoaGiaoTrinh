# SMD Admin System - Frontend

Frontend admin portal for SMD Microservices platform using pure HTML/CSS/JavaScript.

## 🚀 Quick Start

### Option 1: Open Directly
```bash
# Navigate to the folder
cd frontend/admin-system

# Open index.html in browser
# Or use VS Code Live Server extension
```

### Option 2: Simple HTTP Server
```bash
# Python
python -m http.server 3000

# Node.js (if you have http-server installed)
npx http-server -p 3000

# Then open: http://localhost:3000
```

## 🔑 Login Credentials

Default test credentials:
- **Username:** `admin`
- **Password:** (check with backend auth-service team)

## 📁 Project Structure

```
admin-system/
├── index.html              # Login page
├── dashboard.html          # Main dashboard with service overview
├── services.html           # Service management table
├── eureka.html             # Eureka registry viewer
├── config-server.html      # Configuration browser
├── users.html              # User management (NEW)
├── roles.html              # Roles & permissions (NEW)
├── css/
│   └── style.css          # Complete styling (819 lines)
├── js/
│   ├── common.js          # Auth check, logout, utilities
│   ├── api.js             # API client with JWT interceptor
│   ├── auth.js            # Login form logic
│   ├── dashboard.js       # Dashboard with auto-refresh
│   ├── services.js        # Services table with filters
│   ├── users.js           # User CRUD (mock data)
│   └── roles.js           # Role management (mock data)
└── assets/                # (optional) Images, icons
```

## ✨ Features

### ✅ Fully Working (Connected to Backend)
- **Login/Logout** - JWT authentication
- **Dashboard** - Real-time service health monitoring
- **Service List** - Live data from Eureka registry
- **Eureka Viewer** - Direct integration with Eureka
- **Config Server** - Browse service configurations

### ⚙️ Working with Mock Data (UI Ready)
- **User Management** - CRUD operations (uses mock data)
- **Roles & Permissions** - Role management (uses mock data)

> 💡 **Note:** Users and Roles pages work independently with mock data. When backend APIs `/api/users` and `/api/roles` are ready, simply uncomment the API calls in `js/users.js` and `js/roles.js`.

## 🔧 Configuration

Edit `js/api.js` to change backend endpoints:

```javascript
const API_BASE_URL = 'http://localhost:8080';      // API Gateway
const EUREKA_URL = 'http://localhost:8761';         // Eureka Discovery
const CONFIG_SERVER_URL = 'http://localhost:8888';  // Config Server
```

## 📊 Page Details

### 1. Dashboard (`dashboard.html`)
- Service health statistics (Total, Up, Down, Health Rate)
- Real-time service cards with status badges
- Auto-refresh every 10 seconds
- Quick links to key endpoints

### 2. Services (`services.html`)
- Detailed service table with all instances
- Search by name, instance ID, or host
- Filter by status (UP/DOWN/STARTING)
- Modal popup with full service details
- Actions: View status page, health check URL

### 3. Eureka Registry (`eureka.html`)
- Live connection to Eureka server
- Applications list with instance count
- Registry status overview
- Direct link to Eureka UI

### 4. Config Server (`config-server.html`)
- Browse service configurations
- Select service and profile (default/dev/prod)
- JSON viewer for configuration properties

### 5. User Management (`users.html`) 🆕
- User list with search and filters
- Create/Edit/Delete users
- Assign multiple roles (ADMIN, TEACHER, STUDENT)
- Active/Inactive status toggle
- **Currently uses mock data**

### 6. Roles & Permissions (`roles.html`) 🆕
- Role cards with user count
- Permissions matrix view
- Create custom roles
- Assign granular permissions
- **Currently uses mock data**

## 🔌 Backend API Integration

### Currently Working APIs
```
✅ POST /api/auth/login          - Authentication
✅ POST /api/auth/refresh        - Token refresh
✅ GET  /eureka/apps             - Service registry
✅ GET  /eureka/apps/{name}      - Service details
✅ GET  /{service}/{profile}     - Config properties
```

### APIs Required for Full User Management
```
⏳ GET    /api/users             - List users
⏳ POST   /api/users             - Create user
⏳ PUT    /api/users/{id}        - Update user
⏳ DELETE /api/users/{id}        - Delete user
⏳ GET    /api/roles             - List roles
⏳ POST   /api/roles             - Create role
⏳ PUT    /api/roles/{id}        - Update role
⏳ DELETE /api/roles/{id}        - Delete role
⏳ GET    /api/roles/permissions - List permissions
```

## 🔐 Authentication Flow

1. User enters credentials on `index.html`
2. POST to `/api/auth/login` via API Gateway
3. Receive JWT token + refresh token
4. Store in localStorage
5. Add `Authorization: Bearer {token}` to all requests
6. Auto-refresh token on 401 responses
7. Redirect to login on auth failure

## 🐛 Troubleshooting

### Login not working
```bash
# Check if auth-service is running
curl http://localhost:8081/actuator/health

# Check API Gateway
curl http://localhost:8080/actuator/health

# Check browser console for CORS errors
```

### Services not loading
```bash
# Verify Eureka is up
curl http://localhost:8761/eureka/apps -H "Accept: application/json"

# Check if services are registered
# Open http://localhost:8761 in browser
```

### Mock Data vs Real Data

**Users and Roles pages currently use mock data:**
- Data is defined in `js/users.js` and `js/roles.js`
- Changes are stored in memory only (refresh resets)
- To connect to real backend:
  1. Ensure backend APIs exist
  2. Uncomment API calls in the JS files
  3. Replace mock data lines with actual API calls

**Example in `js/users.js`:**
```javascript
// Current (mock):
allUsers = mockUsers;

// Change to (real API):
const data = await apiRequest(`${API_BASE_URL}/api/users`);
allUsers = data;
```

## 🎨 Styling

- **Framework:** Pure CSS (no dependencies)
- **Design:** Modern, clean, responsive
- **Colors:** Blue primary, green success, red danger
- **Icons:** Emoji-based (no icon library needed)
- **Layout:** Flexbox + Grid
- **Responsive:** Works on mobile, tablet, desktop

## 📝 Development Notes

### Adding New Pages

1. **Create HTML file** (copy from existing page)
2. **Update sidebar navigation** in all HTML files
3. **Create JS file** in `js/` folder
4. **Add styles** to `css/style.css` if needed
5. **Link scripts** at bottom of HTML

### Connecting to Real APIs

In your JS file (e.g., `users.js`):

```javascript
// Replace mock data loading:
async function loadUsers() {
    try {
        // Call real API
        const data = await apiRequest(`${API_BASE_URL}/api/users`);
        allUsers = data;
        renderUsersTable(allUsers);
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
    }
}
```

### Auto-Refresh Implementation

Most pages auto-refresh every 10-15 seconds:

```javascript
// Start auto-refresh
const refreshInterval = setInterval(loadData, 10000);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    clearInterval(refreshInterval);
});
```

## 🚀 Deployment

### Production Build
No build step required! Just copy files:

```bash
# Copy entire folder to web server
cp -r admin-system/ /var/www/html/admin/

# Or use nginx
server {
    listen 80;
    server_name admin.smd.local;
    root /var/www/html/admin-system;
    index index.html;
}
```

### Environment Variables
Update API URLs in `js/api.js` for production:

```javascript
// Development
const API_BASE_URL = 'http://localhost:8080';

// Production
const API_BASE_URL = 'https://api.smd.edu.vn';
```

## 📞 Support

### Frontend Issues
- Check browser console for errors
- Verify API URLs in `js/api.js`
- Check CORS settings in backend

### Backend Issues
- Contact auth-service team for user/role APIs
- Check API Gateway logs: `docker compose logs api-gateway`
- Verify JWT token format

### Mock Data
- Users/Roles use mock data by default
- Safe to test UI without backend
- All CRUD operations work in memory

## 📚 Additional Documentation

- [Main Project README](../../README.md)
- [Backend Documentation](../../backend/README.md)
- [Deployment Guide](../../DEPLOY.md)
- [API Gateway Routes](../../backend/api-gateway/README.md)

## ✅ Checklist

- [x] Login/Logout functionality
- [x] Dashboard with service monitoring
- [x] Service management table
- [x] Eureka registry integration
- [x] Config server browser
- [x] User management UI (mock data)
- [x] Roles & permissions UI (mock data)
- [ ] Connect users to real backend API
- [ ] Connect roles to real backend API
- [ ] Add profile management page
- [ ] Add system logs viewer
- [ ] Add real-time notifications

---

**Version:** 1.0.0  
**Last Updated:** January 16, 2026  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+)
