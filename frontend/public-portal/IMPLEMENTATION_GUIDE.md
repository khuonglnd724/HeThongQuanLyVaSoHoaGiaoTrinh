# Frontend Public Portal - Implementation Guide

## 📋 Overview

Frontend Public Portal là ứng dụng React được xây dựng để cung cấp giao diện công khai cho sinh viên tìm kiếm, xem chi tiết và quản lý giáo trình.

## 🏗️ Architecture

### Pages
1. **HomePage** - Trang chủ mô tả tính năng
2. **SearchPage** - Tìm kiếm & hiển thị danh sách
3. **SyllabusDetailPage** - Chi tiết giáo trình với tabs

### Components
- **SearchBar** - Input tìm kiếm
- **SyllabusCard** - Card hiển thị giáo trình
- **SubjectTree** - Sơ đồ cây tiên quyết
- **DiffViewer** - So sánh phiên bản
- **CLOPLOMap** - Bản đồ chuẩn đầu ra
- **AISummary** - Tóm tắt AI
- **FollowButton** - Theo dõi + Share + Export PDF
- **FeedbackForm** - Phản hồi
- **Layout** - Header/Footer

### Services & Hooks
- **api.js** - API client (Axios)
- **useApi.js** - Custom React hooks
- **api-helpers.js** - Utility functions

## 💻 Development Guide

### Environment Setup

```bash
# 1. Install Node.js 18+
# https://nodejs.org/

# 2. Clone project
cd frontend/public-portal

# 3. Run setup script
# Windows
setup.cmd
# Linux/Mac
bash setup.sh

# 4. Manual setup alternative
npm install
cp .env.example .env.local
# Edit .env.local with your config
```

### Running Development Server

```bash
npm start
```

- Dev server: http://localhost:3000
- Auto-reload on file changes
- React DevTools available

### Project Structure

```
src/
├── components/
│   ├── SearchBar.jsx          # Search input
│   ├── SyllabusCard.jsx       # Course card
│   ├── SubjectTree.jsx        # Prerequisite tree
│   ├── DiffViewer.jsx         # Version comparison
│   ├── CLOPLOMap.jsx          # Learning outcomes map
│   ├── AISummary.jsx          # AI summary
│   ├── FollowButton.jsx       # Follow/Share/Export
│   ├── FeedbackForm.jsx       # Feedback form
│   └── Layout.jsx             # Header/Footer
├── pages/
│   ├── HomePage.jsx           # Home page
│   ├── SearchPage.jsx         # Search page
│   └── SyllabusDetailPage.jsx # Detail page
├── services/
│   └── api.js                 # API client
├── hooks/
│   └── useApi.js              # Custom hooks
├── utils/
│   └── api-helpers.js         # Helper functions
├── App.jsx                    # Main app
├── index.jsx                  # Entry point
└── index.css                  # Global styles
```

## 🎯 Component Development

### Creating a New Component

```jsx
// src/components/MyComponent.jsx
import React from 'react'

export const MyComponent = ({ title, data, loading }) => {
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {/* Component content */}
    </div>
  )
}

export default MyComponent
```

### Using Components

```jsx
import MyComponent from './components/MyComponent'

// In page or another component
<MyComponent 
  title="My Title" 
  data={data} 
  loading={loading} 
/>
```

## 🎨 Styling Guide

### Tailwind CSS

```jsx
// Use utility classes
<div className="flex items-center gap-4 p-6 rounded-lg bg-primary-100">
  <span className="text-primary-600 font-semibold">Label</span>
</div>
```

### Custom Classes (in index.css)

```css
/* Buttons */
.btn              /* Base button */
.btn-primary      /* Blue button */
.btn-secondary    /* Gray button */
.btn-outline      /* Border button */

/* Cards */
.card             /* Card container */

/* Inputs */
.input-base       /* Input field */

/* Badges */
.badge            /* Badge tag */
.badge-primary    /* Primary badge */
.badge-success    /* Green badge */
```

### Color System

```javascript
// Tailwind color classes
primary-*   // Blue: 50, 100, 600, 700
secondary-* // Gray: 50, 100, 500, 600
success-*   // Green: 50, 600
warning-*   // Amber: 50, 600
danger-*    // Red: 50, 600
```

## 🔌 API Integration

### Using syllabusService

```jsx
import { syllabusService } from '../services/api'

// Search
const response = await syllabusService.search('keyword', 0, 20)

// Get detail
const syllabus = await syllabusService.getDetail(1)

// Get tree
const tree = await syllabusService.getTree(1)

// Get diff
const diff = await syllabusService.getDiff(1, 2)

// Export PDF
const pdf = await syllabusService.exportPdf(1)

// Follow
await syllabusService.follow(1, 'userId', 'email@example.com')

// Feedback
await syllabusService.submitFeedback({
  syllabusId: 1,
  feedbackType: 'ERROR',
  title: 'Title',
  message: 'Content'
})
```

### Using Custom Hooks

```jsx
import { useSyllabusSearch, useSyllabusDetail } from '../hooks/useApi'

// In component
const { data, loading, error } = useSyllabusSearch(query, page)
const { syllabus, loading, error } = useSyllabusDetail(id)
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

```javascript
// src/components/__tests__/SearchBar.test.js
import { render, screen } from '@testing-library/react'
import SearchBar from '../SearchBar'

test('renders search input', () => {
  render(<SearchBar value="" onChange={() => {}} />)
  const input = screen.getByPlaceholderText(/search/i)
  expect(input).toBeInTheDocument()
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## 🐳 Docker

### Build Docker Image

```bash
# Build
docker build -t public-portal:latest .

# Run
docker run -d \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:8083/api/public \
  public-portal:latest
```

### Docker Compose

```bash
# Add to your docker-compose.yml
docker-compose up public-portal
```

## 📦 Building for Production

```bash
# Build optimized bundle
npm run build

# Output in ./build/
# Minified, optimized JS/CSS
# Source maps for debugging
```

## 🔍 Debugging

### Browser DevTools

```javascript
// React DevTools
// https://react-devtools-tutorial.vercel.app/

// Redux DevTools (if using Redux)
// https://github.com/reduxjs/redux-devtools
```

### Console Debugging

```javascript
// In components
console.log('Debug:', data)
console.error('Error:', error)

// In hooks
console.warn('Warning:', message)
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px    /* Small phones */
md: 768px    /* Tablets */
lg: 1024px   /* Desktops */
xl: 1280px   /* Large screens */
```

### Usage

```jsx
// Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>

// Show/hide on breakpoints
<div className="hidden md:block">
  {/* Hidden on mobile, shown on tablet+ */}
</div>
```

## 🚀 Performance Optimization

### Code Splitting

```javascript
// Lazy load components
import { lazy, Suspense } from 'react'

const SearchPage = lazy(() => import('./pages/SearchPage'))

<Suspense fallback={<Loading />}>
  <SearchPage />
</Suspense>
```

### Image Optimization

```jsx
// Use srcset for responsive images
<img
  src="image-sm.jpg"
  srcSet="image-sm.jpg 640w, image-md.jpg 1024w"
  alt="Description"
/>
```

### Bundle Analysis

```bash
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'
```

## 📧 Environment Variables

```env
# .env.local
REACT_APP_API_URL=http://localhost:8083/api/public
REACT_APP_ENV=development
```

## 🔐 Security Best Practices

1. **Input Validation**
   - Validate user input on client & server
   - Use form libraries (Formik, React Hook Form)

2. **API Security**
   - Use HTTPS in production
   - Add CSRF tokens if needed
   - Use secure HTTP-only cookies

3. **XSS Prevention**
   - React auto-escapes content
   - Don't use dangerouslySetInnerHTML
   - Sanitize user-generated content

4. **Environment Variables**
   - Never commit .env.local
   - Use .env.example for reference
   - Store secrets in secure location

## 🐛 Common Issues & Solutions

### Issue: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue: Node modules corrupted
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors
```javascript
// Check backend CORS config
// Ensure API_BASE_URL in api.js is correct
// Use proxy in package.json (development only)
{
  "proxy": "http://localhost:8083"
}
```

### Issue: Changes not reflecting
```bash
# Clear cache and rebuild
npm start -- --reset-cache
# or
rm -rf build
npm run build
```

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Web Accessibility](https://www.w3.org/WAI/)

## 👥 Team Guidelines

### Code Style
- Use ESLint + Prettier
- Follow naming conventions
- Add comments for complex logic
- Write meaningful commit messages

### Component Guidelines
- Functional components only
- Use hooks for state/side effects
- Props destructuring
- Prop validation with PropTypes/TypeScript

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/component-name

# Make changes
git add .
git commit -m "feat: Add new component"

# Push and create PR
git push origin feature/component-name
```

## 🎓 Development Checklist

Before pushing to production:
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Responsive on all devices
- [ ] Performance optimized
- [ ] Accessibility checked
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Code reviewed by team
- [ ] Browser compatibility tested

---

**Last Updated**: January 19, 2026  
**Maintainer**: Development Team
