# Syllabus Builder - Lecturer Portal

Frontend application for lecturers to manage syllabuses in the SMD Microservices system.

## 🎯 Purpose

This is the **dedicated frontend for LECTURER role** to:
- Create new syllabuses
- Edit syllabus content (CLOs, assessments, materials, prerequisites)
- Map CLOs to PLOs
- Submit syllabuses for review
- Respond to feedback from approvers
- View version history

## 🏗️ Architecture

### Microservices Used

| Service | Port | Purpose |
|---------|------|---------|
| **Syllabus Service** | **8085** | ⭐ Main service for all syllabus operations |
| Auth Service | 8081 | Authentication and authorization |
| Academic Service | 8080 | Reference data only (Programs, Subjects, PLOs) |

**IMPORTANT**: This frontend communicates with **Syllabus Service (Port 8085)**, NOT Academic Service (Port 8080).

## 📋 Lecturer Responsibilities

✅ **What Lecturers CAN do:**
1. Create new syllabus
2. Edit syllabus content (DRAFT/REJECTED status only)
3. Map CLOs to PLOs with Bloom's taxonomy
4. Save as draft
5. Submit for review (Level 1 approval)
6. Respond to feedback from approvers
7. View version history and compare changes
8. Search and filter own syllabuses

❌ **What Lecturers CANNOT do:**
- Approve syllabuses (restricted to approvers)
- Publish syllabuses (restricted to admin)
- Edit approved/published syllabuses
- Delete syllabuses via UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Syllabus Service running on port 8085
- Auth Service running on port 8081

### Installation

```bash
cd frontend/lecturer-portal/syllabus-builder
npm install
```

### Environment Configuration

Create `.env` file:

```env
# Syllabus Service API (Port 8085)
VITE_SYLLABUS_API_URL=http://localhost:8085

# Auth Service API (Port 8081)
VITE_AUTH_API_URL=http://localhost:8081
```

### Running Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
syllabus-builder/
├── src/
│   ├── features/
│   │   ├── syllabus/           # Syllabus management
│   │   ├── syllabus-editor/    # Create/Edit forms
│   │   ├── syllabus-list/      # List view
│   │   ├── syllabus-compare/   # Version comparison
│   │   ├── review/             # Feedback & response
│   │   ├── notifications/      # Real-time notifications
│   │   └── common/             # Shared components
│   ├── lib/
│   │   ├── api.ts             # API client (port 8085)
│   │   └── types.ts           # TypeScript interfaces
│   └── main.tsx               # App entry point
├── .env                       # Environment variables
├── package.json
└── vite.config.ts
```

## 🔌 API Endpoints

All endpoints use **Syllabus Service (Port 8085)**:

```
Base URL: http://localhost:8085/api/syllabus

Lecturer Operations:
  GET    /my-syllabuses           - Get lecturer's syllabuses
  POST   /                        - Create new syllabus
  GET    /{id}                    - Get syllabus detail
  PUT    /{id}                    - Update syllabus
  POST   /{id}/submit-level1      - Submit for L1 approval
  POST   /{id}/clos               - Save CLOs
  POST   /{id}/clo-mappings       - Save CLO-PLO mappings
  GET    /{id}/versions           - Get version history
  GET    /{id}/feedback           - Get feedback
  POST   /{id}/feedback-response  - Respond to feedback
  GET    /search                  - Search syllabuses
  GET    /draft                   - Get draft syllabuses
  GET    /rejected                - Get rejected syllabuses
```

## 🎨 Features

### 1. Syllabus List
- View all syllabuses created by current lecturer
- Filter by status (DRAFT, SUBMITTED, APPROVED, REJECTED, PUBLISHED)
- Search by code or name
- Pagination support

### 2. Create/Edit Syllabus
- Comprehensive form with validation
- Sections:
  - Basic Information (code, name, year, semester, credits)
  - Academic Content (objectives, content, prerequisites)
  - Teaching Methods
  - Assessment Methods
  - Learning Outcomes
- Save as DRAFT or Submit for Review

### 3. CLO-PLO Mapping
- Define Course Learning Outcomes (CLOs)
- Assign Bloom's taxonomy levels
- Map CLOs to Program Learning Outcomes (PLOs)
- View coverage statistics

### 4. Feedback Response (NEW)
- View feedback from approvers
- See issues (ERROR, WARNING, SUGGESTION)
- Mark issues as resolved
- Provide detailed response
- Track resolution progress

### 5. Version History
- View complete timeline of changes
- See who made changes and when
- Compare different versions
- Field-by-field difference view

## 🔐 Authentication

### Login Flow

1. User enters credentials on login page
2. Frontend calls Auth Service (port 8081)
3. Receives JWT token
4. Token stored in localStorage as `auth_token`
5. Token automatically added to all API requests
6. On 401 error, user redirected to login

### Token Storage

```javascript
// Store token after login
localStorage.setItem('auth_token', token);

// Remove token on logout
localStorage.removeItem('auth_token');
```

## 🧪 Testing

### Manual Testing Checklist

#### Create Syllabus
- [ ] Load application as LECTURER
- [ ] Click "Create New Syllabus" button
- [ ] Fill all required fields
- [ ] Save as DRAFT
- [ ] Verify syllabus appears in list

#### Submit for Review
- [ ] Open DRAFT syllabus
- [ ] Click "Submit for Review"
- [ ] Verify status changes to SUBMITTED
- [ ] Check that edit button disappears

#### Respond to Feedback
- [ ] View syllabus with feedback
- [ ] Click "Respond" button
- [ ] Mark issues as resolved
- [ ] Enter response text
- [ ] Submit response
- [ ] Verify response saved

#### Version History
- [ ] Open syllabus detail
- [ ] Click "History" tab
- [ ] View timeline of changes
- [ ] Compare two versions
- [ ] See field differences

## 📚 Related Documentation

- [LECTURER_RESPONSIBILITIES.md](../../../LECTURER_RESPONSIBILITIES.md) - Complete role definition
- [SYLLABUS_vs_ACADEMIC.md](../../../SYLLABUS_vs_ACADEMIC.md) - Architecture clarification
- [QUICK_REFERENCE.md](../../../QUICK_REFERENCE.md) - Quick reference guide
- [IMPLEMENTATION_STATUS.md](../../../IMPLEMENTATION_STATUS.md) - Implementation status

## 🛠️ Troubleshooting

### Common Issues

**Issue**: API returns 404
**Solution**: Ensure Syllabus Service is running on port 8085
```bash
# Check if service is running
curl http://localhost:8085/api/syllabus
```

**Issue**: Authentication fails
**Solution**: Check Auth Service is running on port 8081
```bash
curl http://localhost:8081/api/auth
```

**Issue**: Cannot edit syllabus
**Solution**: Only DRAFT and REJECTED syllabuses can be edited

**Issue**: No "Create New" button
**Solution**: Verify you're logged in as LECTURER role

## 🚀 Deployment

### Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output in dist/ folder
```

### Serve Static Files

```bash
# Preview production build
npm run preview
```

### Environment Variables for Production

```env
VITE_SYLLABUS_API_URL=https://api.yourdomain.com:8085
VITE_AUTH_API_URL=https://api.yourdomain.com:8081
```

## 📊 Technology Stack

- **Framework**: React 18.3+
- **Language**: TypeScript 5.5+
- **Build Tool**: Vite 5.4+
- **HTTP Client**: Axios 1.6+
- **Routing**: React Router DOM 6.26+
- **Forms**: React Hook Form 7.52+
- **Diff Viewer**: react-diff-viewer-continued 3.2+

## 🎓 Learning Resources

### For Lecturers (End Users)
- Review lecturer responsibilities document
- Understand syllabus lifecycle workflow
- Learn CLO-PLO mapping best practices
- Familiarize with Bloom's taxonomy levels

### For Developers
- Study microservices architecture
- Understand JWT authentication flow
- Learn React hooks patterns
- Practice TypeScript type safety

## 📝 Notes

### Important Reminders

1. **Always use Syllabus Service (Port 8085)** for syllabus operations
2. **Academic Service (Port 8080)** is only for reference data
3. **Auth tokens expire** - handle 401 errors gracefully
4. **DRAFT syllabuses** can be edited freely
5. **SUBMITTED syllabuses** cannot be edited until rejected
6. **Feedback response** is required before resubmission

### Best Practices

- Save work frequently using "Save as Draft"
- Review feedback carefully before responding
- Use clear descriptions for CLOs
- Map all CLOs to at least one PLO
- Provide detailed responses to feedback
- Check version history to track changes

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Collaborative editing
- [ ] Template library
- [ ] Bulk import/export
- [ ] PDF generation
- [ ] Mobile app
- [ ] Offline mode
- [ ] Integration with LMS

## 📞 Support

For technical issues or questions:
- Check documentation in `/docs` folder
- Review implementation status
- Contact development team

---

**Version**: 1.0  
**Last Updated**: January 18, 2026  
**Maintained By**: Development Team
