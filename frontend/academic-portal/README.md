# Academic Portal Frontend

Frontend riêng cho Academic Service - Quản Lý Giáo Trình Học Thuật

## Các tính năng chính

- **Danh sách giáo trình**: Xem, tìm kiếm, lọc giáo trình
- **Kiểm tra hợp lệ**: Kiểm tra điểm số giáo trình (7 tiêu chí)
- **Lịch sử phiên bản**: Xem lịch sử thay đổi và so sánh phiên bản
- **Quy trình phê duyệt**: Gửi, phê duyệt, từ chối ở 2 cấp độ
- **Thống kê**: Dashboard với thống kê CLO-PLO coverage
- **Thông báo**: Hệ thống thông báo real-time

## Công nghệ

- React 18.3.1
- TypeScript 5.5.4
- Vite 5.4.1
- Axios 1.6.8
- React Router DOM 6.26.2
- Recharts 2.12.0

## Cấu trúc thư mục

```
academic-portal/
├── src/
│   ├── components/          # React components
│   │   ├── SyllabusList.tsx
│   │   ├── VersionHistory.tsx
│   │   ├── Statistics.tsx
│   │   ├── Notifications.tsx
│   │   └── *.css
│   ├── pages/               # Page components (future)
│   ├── services/            # API services
│   │   └── academicService.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

## Cài đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy dev server (port 5174)
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## API Endpoints (được gọi từ academicService)

### Syllabus CRUD
- `GET /api/academic/syllabuses` - Danh sách giáo trình
- `POST /api/academic/syllabuses` - Tạo giáo trình mới
- `PUT /api/academic/syllabuses/{id}` - Cập nhật giáo trình
- `DELETE /api/academic/syllabuses/{id}` - Xóa giáo trình

### Validation
- `POST /api/academic/syllabuses/{id}/validate-approval` - Kiểm tra phê duyệt
- `POST /api/academic/syllabuses/{id}/validate-prerequisites` - Kiểm tra điều kiện tiên quyết

### Approval Workflow
- `POST /api/academic/syllabuses/{id}/submit-level1` - Gửi cấp 1
- `POST /api/academic/syllabuses/{id}/approve-level1` - Phê duyệt cấp 1
- `POST /api/academic/syllabuses/{id}/reject-level1` - Từ chối cấp 1
- `POST /api/academic/syllabuses/{id}/approve-level2` - Phê duyệt cấp 2
- `POST /api/academic/syllabuses/{id}/reject-level2` - Từ chối cấp 2

### Version History
- `GET /api/academic/syllabuses/{id}/versions` - Lịch sử phiên bản
- `GET /api/academic/syllabuses/{id}/compare` - So sánh phiên bản
- `GET /api/academic/syllabuses/{id}/versions/latest` - Phiên bản mới nhất

### Search & Filter
- `GET /api/academic/syllabuses/search` - Tìm kiếm
- `GET /api/academic/syllabuses/pending-approval` - Chờ phê duyệt
- `GET /api/academic/syllabuses/rejected` - Bị từ chối
- `GET /api/academic/syllabuses/approved` - Đã phê duyệt

### Statistics
- `GET /api/academic/statistics/department` - Thống kê toàn bộ
- `GET /api/academic/statistics/programs` - Thống kê theo chương trình
- `GET /api/academic/statistics/subjects` - Thống kê theo môn học
- `GET /api/academic/statistics/low-coverage` - Môn học coverage thấp

### Notifications
- `GET /api/academic/notifications` - Danh sách thông báo
- `GET /api/academic/notifications/unread` - Thông báo chưa đọc
- `PUT /api/academic/notifications/{id}/read` - Đánh dấu đã đọc
- `DELETE /api/academic/notifications/{id}` - Xóa thông báo

## Biến môi trường

Tạo file `.env.local` tại thư mục gốc:

```
VITE_API_URL=http://localhost:8080/api/academic
```

## Lưu ý

- Frontend này là riêng cho Academic Service
- Sử dụng REST API qua axios
- Hỗ trợ authentication token (localStorage)
- Responsive design cho mobile, tablet, desktop
