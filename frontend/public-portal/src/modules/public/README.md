# Public Student Portal Module

Module này cung cấp giao diện công khai (public) cho sinh viên và khách truy cập xem thông tin syllabus.

## Cấu trúc

```
modules/public/
├── components/
│   ├── SearchBar.jsx              # Tìm kiếm syllabus
│   ├── FilterPanel.jsx            # Lọc theo chuyên ngành/học kì
│   ├── AISummaryBox.jsx           # Hiển thị tóm tắt AI
│   ├── SubscribeButton.jsx        # Nút theo dõi/hủy theo dõi
│   ├── PDFExportButton.jsx        # Nút tải xuống PDF
│   ├── RelationshipTree.jsx       # Hiển thị quan hệ môn học
│   ├── CLOPLOMappingView.jsx      # Bảng CLO-PLO mapping
│   └── FeedbackForm.jsx           # Biểu mẫu phản hồi
├── pages/
│   ├── PublicSyllabusSearchPage.jsx    # Trang tìm kiếm/danh sách
│   └── PublicSyllabusDetailPage.jsx    # Trang chi tiết syllabus
├── services/
│   └── publicSyllabusService.js   # API service
└── README.md
```

## Tính năng

### 1. Tìm kiếm và lọc
- **SearchBar**: Tìm kiếm theo mã môn, tên môn
- **FilterPanel**: Lọc theo chuyên ngành, học kì

### 2. Xem chi tiết
- Hiển thị thông tin cơ bản: mã, tên, giảng viên, tín chỉ, học kì
- 4 tab: Tổng quan, CLO-PLO Mapping, Quan hệ môn học, Phản hồi

### 3. Tóm tắt AI
- Hiển thị tóm tắt tự động được tạo bằng AI
- Trạng thái tải và xử lý lỗi

### 4. CLO-PLO Mapping
- Hiển thị Course Learning Outcomes (CLOs)
- Hiển thị Program Learning Outcomes (PLOs)
- Các mối quan hệ giữa CLO và PLO với mức độ đạt được

### 5. Quan hệ môn học
- Hiển thị các môn học tiên quyết
- Hiển thị các môn học cùng điều kiện
- Hiển thị các môn học song song

### 6. Theo dõi/Đăng ký
- Nút theo dõi (subscribe) để nhận thông báo
- Nút hủy theo dõi (unsubscribe)

### 7. Tải xuống PDF
- Xuất syllabus thành file PDF
- (Tính năng placeholder - cần implement)

### 8. Phản hồi
- Gửi phản hồi, báo lỗi, gợi ý
- Liên hệ tùy chọn (email)

## API Endpoints

Tất cả endpoints không yêu cầu authentication (công khai):

```
GET  /api/syllabi/public?page=0&size=10&search=    # Danh sách syllabus công khai
GET  /api/syllabi/{id}/public                      # Chi tiết syllabus
GET  /api/syllabi/{id}/clo-plo-mapping             # CLO-PLO mapping
GET  /api/syllabi/{id}/ai-summary                  # AI tóm tắt
GET  /api/subjects/{id}/relationships              # Quan hệ môn học

POST /api/syllabi/{id}/subscribe                   # Theo dõi (optional: email)
POST /api/syllabi/{id}/unsubscribe                 # Hủy theo dõi
POST /api/feedback                                 # Gửi phản hồi
```

## Sử dụng

### Trang tìm kiếm
```javascript
import { PublicSyllabusSearchPage } from '@/modules/public'

<Route path="/public/search" element={<PublicSyllabusSearchPage />} />
```

### Trang chi tiết
```javascript
import { PublicSyllabusDetailPage } from '@/modules/public'

<Route path="/public/syllabus/:id" element={<PublicSyllabusDetailPage />} />
```

### Component riêng lẻ
```javascript
import { SearchBar, FilterPanel, AISummaryBox } from '@/modules/public/components'

// Sử dụng trong component khác
<SearchBar onSearch={handleSearch} />
<FilterPanel onFilter={handleFilter} />
<AISummaryBox summary={data} loading={false} />
```

## Service API

```javascript
import { 
  getPublishedSyllabi,
  getSyllabusDetail,
  getCLOPLOMapping,
  getAISummary,
  getSubjectRelationships,
  subscribeSyllabus,
  unsubscribeSyllabus,
  submitFeedback
} from '@/modules/public/services'

// Lấy danh sách syllabus công khai
const data = await getPublishedSyllabi(page, size, searchTerm)

// Lấy chi tiết syllabus
const syllabus = await getSyllabusDetail(syllabusId)

// Theo dõi syllabus
await subscribeSyllabus(syllabusId, email)

// Gửi phản hồi
await submitFeedback({
  type: 'feedback',
  title: 'Title',
  message: 'Message',
  email: 'user@example.com'
})
```

## Status

### ✅ Hoàn thành
- Tất cả 8 components
- Service layer với 8 API methods
- 2 pages (search, detail)
- Routing được cấu hình

### 🔄 Đang phát triển
- Backend API endpoints
- Sample data trong database
- PDF export implementation

### ⏳ Cần làm
- Tích hợp notification service
- Hoàn thiện PDF export
- Testing đầy đủ
- Tối ưu hiệu suất
