# Public Portal - Frontend

Cổng thông tin công khai cho sinh viên - Tìm kiếm và quản lý giáo trình

---

## 🎉 IMPLEMENTATION STATUS (Updated: 23/01/2026)

**✅ FRONTEND COMPLETE - READY FOR TESTING**

### 📊 Summary
- **31 pages** implemented
- **16 components** created/reused
- **7 services** validated
- **9-stage workflow** complete
- **6 role-based dashboards** ready

### 📄 Documentation
- 📘 **[QUICK_SUMMARY.md](./QUICK_SUMMARY.md)** - Tóm tắt nhanh (5 phút đọc)
- 📗 **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Báo cáo đầy đủ
- 📙 **[API_VALIDATION_SUMMARY.md](./API_VALIDATION_SUMMARY.md)** - Chi tiết API validation

---

## 🚀 Tính Năng

### 1. **Tìm Kiếm** 🔍
- Tìm kiếm giáo trình theo tên, mã môn
- Lọc theo chuyên ngành, học kỳ
- Full-text search hỗ trợ từ khóa phức tạp
- Phân trang kết quả

### 2. **Xem Chi Tiết** 📖
- Thông tin chi tiết giáo trình
- Mô tả, mục tiêu học tập
- Phương pháp giảng dạy & đánh giá
- Thông tin tín chỉ & học kỳ

### 3. **AI Summary** 🤖
- Tóm tắt tự động nội dung giáo trình
- Trích xuất điểm chính
- Giúp sinh viên nắm nhanh nội dung

### 4. **Sơ Đồ Môn Học** 🌳
- Hiển thị môn học tiên quyết
- Hiển thị môn học phụ thuộc
- Thông tin tín chỉ & học kỳ
- Dễ dàng lập kế hoạch học tập

### 5. **So Sánh Phiên Bản** 📊
- So sánh 2 phiên bản giáo trình
- Highlight thay đổi: Xanh (thêm), Đỏ (xóa), Vàng (sửa)
- Thống kê % thay đổi
- Dễ theo dõi cập nhật

### 6. **CLO-PLO Map** 🎯
- Chuẩn đầu ra môn học (CLO)
- Chuẩn đầu ra chương trình (PLO)
- Bảng ánh xạ chi tiết
- Hỗ trợ lập kế hoạch học tập

### 7. **Theo Dõi/Subscri** ❤️
- Theo dõi giáo trình
- Nhận thông báo khi có thay đổi
- Email notification

### 8. **Phản Hồi** 💬
- Gửi báo cáo lỗi
- Gửi gợi ý cải thiện
- Gửi câu hỏi
- Gửi khen ngợi

### 9. **Xuất PDF** 📤
- Xuất toàn bộ giáo trình ra PDF
- Định dạng chuyên nghiệp
- Dễ dàng chia sẻ & in ấn

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS + PostCSS
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Date Utils**: date-fns
- **Build Tool**: React Scripts
- **Containerization**: Docker

## 📦 Cấu Trúc Project

```
frontend/public-portal/
├── public/
│   ├── index.html
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx
│   │   ├── SubjectTree.jsx
│   │   ├── DiffViewer.jsx
│   │   ├── CLOPLOMap.jsx
│   │   ├── AISummary.jsx
│   │   ├── FollowButton.jsx
│   │   ├── FeedbackForm.jsx
│   │   ├── SyllabusCard.jsx
│   │   └── Layout.jsx (Header/Footer)
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   └── SyllabusDetailPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── hooks/
│   │   └── useApi.js
│   ├── utils/
│   │   └── api-helpers.js
│   ├── App.jsx
│   ├── index.jsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
└── README.md
```

## 🚀 Cài Đặt & Chạy

### Prerequisites
- Node.js 18+
- npm hoặc yarn

### Local Development

1. **Clone & Navigate**
```bash
cd frontend/public-portal
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment**
```bash
cp .env.example .env.local
# Edit .env.local với config của bạn
```

4. **Run Development Server**
```bash
npm start
```
- Truy cập: http://localhost:3000
- Dev server tự động reload khi file thay đổi

5. **Build for Production**
```bash
npm run build
```

6. **Run Production Build (Local)**
```bash
npm run build
npx serve -s build
```

## 🐳 Docker

### Build Docker Image
```bash
docker build -t public-portal:latest .
```

### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://backend:8083/api/public \
  --name public-portal \
  public-portal:latest
```

### Docker Compose (trong docker/docker-compose.yml)
```bash
cd ../../docker
docker-compose up public-portal
```

## 🔧 API Integration

Frontend tích hợp với Backend Public Service ở `http://localhost:8083/api/public`

### API Endpoints
```javascript
// Services trong src/services/api.js
syllabusService.search(query, page, size)         // Tìm kiếm
syllabusService.getDetail(id)                     // Chi tiết
syllabusService.getTree(id)                       // Sơ đồ cây
syllabusService.getDiff(id, targetVersion)       // So sánh
syllabusService.exportPdf(id)                     // Xuất PDF
syllabusService.follow(id, userId, email)        // Theo dõi
syllabusService.unfollow(id, userId)              // Bỏ theo dõi
syllabusService.submitFeedback(feedback)          // Gửi phản hồi
```

## 📚 Components Reference

### SearchBar
```jsx
<SearchBar 
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  placeholder="..."
/>
```

### SubjectTree
```jsx
<SubjectTree tree={tree} loading={loading} />
```

### DiffViewer
```jsx
<DiffViewer diff={diff} loading={loading} />
```

### CLOPLOMap
```jsx
<CLOPLOMap syllabus={syllabus} loading={loading} />
```

### AISummary
```jsx
<AISummary syllabus={syllabus} loading={loading} />
```

### FollowButton
```jsx
<FollowButton syllabusId={id} onFollowChange={handleChange} />
```

### FeedbackForm
```jsx
<FeedbackForm syllabusId={id} onSuccess={handleSuccess} />
```

## 🎨 Styling

### Tailwind CSS Classes

**Custom Classes (trong src/index.css)**
```css
.container-custom    /* Container max-width + padding */
.btn                 /* Base button */
.btn-primary         /* Primary button */
.btn-secondary       /* Secondary button */
.btn-outline         /* Outline button */
.card                /* Card component */
.input-base          /* Input styling */
.badge               /* Badge/tag */
.badge-primary       /* Primary badge */
.fade-in             /* Fade animation */
.slide-in-left       /* Slide animation */
```

### Colors
```css
primary-* (50-700)      /* Primary blue */
secondary-* (50-600)    /* Gray */
success-* (50-600)      /* Green */
warning-* (50-600)      /* Amber */
danger-* (50-600)       /* Red */
```

## 🔐 Security

- HTTPS for production
- Input validation trên client & server
- CSRF protection (nếu cần)
- XSS prevention
- Safe API calls with error handling

## 📊 Performance

- Code splitting (React lazy loading)
- Image optimization
- Caching strategy với Redis (backend)
- Debounce search queries (300ms)
- Lazy load images
- Minimize bundle size

## 🧪 Testing

```bash
# Run tests
npm test

# Coverage report
npm test -- --coverage
```

## 📝 Conventions

### Component Naming
- File: `PascalCase.jsx`
- Export: default export hoặc named export

### Hooks Naming
- Custom hooks: `useXxx`
- Stored in: `src/hooks/`

### Service Naming
- Service object: `xxxService`
- Stored in: `src/services/`

### CSS Classes
- Use Tailwind utility classes
- Custom classes in `src/index.css`
- BEM convention for complex components

## 🌐 SEO

- Meta tags đã được setup
- Semantic HTML
- Open Graph tags (có thể thêm)
- Structured data (JSON-LD)

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## 🚦 Status Codes & Error Handling

```javascript
// Automatic handling trong api.js
200-299: Success
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
500: Server Error
```

## 🔄 Version Control

```bash
# Commit messages
feat: Thêm component X
fix: Sửa lỗi Y
docs: Cập nhật README
style: Format code
refactor: Tái cấu trúc X
test: Thêm test cho X
```

## 📧 Environment Variables

```env
REACT_APP_API_URL=http://localhost:8083/api/public
REACT_APP_ENV=development
```

## 🆘 Troubleshooting

### Port 3000 đã được sử dụng
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Node modules issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS errors
- Kiểm tra backend CORS config
- Ensure API URL chính xác trong .env

## 📞 Support

Liên hệ: support@example.com

## 📄 License

MIT License - © 2026

Role	Email	Password	Trang chủ	Module
👨‍🎓 Student	student@smd.edu	demo123	StudentDashboard	/modules/student/pages/
👨‍🏫 Lecturer	lecturer@smd.edu	demo123	LecturerDashboard	/modules/lecturer/pages/
🔐 Admin	admin@smd.edu	demo123	AdminDashboard	/modules/admin/pages/
📚 Academic Officer	academic@smd.edu	demo123	AcademicDashboard	/modules/academic/pages/
👔 Head of Department	hod@smd.edu	demo123	Trang HoD	/modules/