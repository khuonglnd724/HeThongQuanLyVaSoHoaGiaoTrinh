# Export PDF API - Test Guide

## Endpoint

```http
GET /api/public/syllabi/{id}/export/pdf?version={version}
```

## Parameters

| Tham số | Loại | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Long (Path) | ✅ | ID của giáo trình |
| version | String (Query) | ❌ | Phiên bản giáo trình (tuỳ chọn) |

## Response

- **Content-Type**: `application/pdf`
- **Headers**: 
  - `Content-Disposition: attachment; filename="syllabus_{id}_{version}.pdf"`
- **Body**: Binary PDF file content

## Cách sử dụng

### 1. cURL

```bash
# Xuất PDF mặc định
curl -X GET "http://localhost:8086/api/public/syllabi/1/export/pdf" \
  -o syllabus_1.pdf

# Xuất PDF với phiên bản cụ thể
curl -X GET "http://localhost:8086/api/public/syllabi/1/export/pdf?version=2024.1" \
  -o syllabus_1_2024.1.pdf
```

### 2. PowerShell

```powershell
# Xuất PDF mặc định
Invoke-WebRequest -Uri "http://localhost:8086/api/public/syllabi/1/export/pdf" `
  -OutFile "syllabus_1.pdf"

# Xuất PDF với phiên bản cụ thể
Invoke-WebRequest -Uri "http://localhost:8086/api/public/syllabi/1/export/pdf?version=2024.1" `
  -OutFile "syllabus_1_2024.1.pdf"
```

### 3. JavaScript/Fetch

```javascript
// Tải PDF và mở
fetch('http://localhost:8086/api/public/syllabi/1/export/pdf')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syllabus_1.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });
```

### 4. Axios (React/Vue)

```javascript
import axios from 'axios';

const downloadPdf = async (syllabusId, version = null) => {
  try {
    const url = `/api/public/syllabi/${syllabusId}/export/pdf`;
    const params = version ? { version } : {};
    
    const response = await axios.get(url, {
      params,
      responseType: 'blob'
    });

    // Tạo link download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(response.data);
    link.download = `syllabus_${syllabusId}${version ? '_' + version : ''}.pdf`;
    link.click();
  } catch (error) {
    console.error('Lỗi khi tải PDF:', error);
  }
};

// Sử dụng
downloadPdf(1, '2024.1');
```

## HTTP Response Examples

### Success (200 OK)

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="syllabus_1_2024.1.pdf"
Content-Length: 45382

[Binary PDF content]
```

### Not Found (404)

```
HTTP/1.1 404 Not Found
Content-Type: application/json

```

### Server Error (500)

```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

"Lỗi khi tạo PDF: ..."
```

## PDF Content Structure

PDF được tạo bao gồm các section:

1. **Tiêu đề** - "GIÁO TRÌNH"
2. **Tên môn học** - Tên từ giáo trình
3. **Thông tin cơ bản** - Mã môn, tên, khoa, chuyên ngành, kỳ, năm, phiên bản, tín chỉ
4. **Mục tiêu môn học** - Objectives
5. **Nội dung môn học** - Content
6. **Learning Outcomes (CLO)** - Danh sách CLOs
7. **CLO-PLO Mapping** - Bảng mapping giữa CLO và PLO
8. **Phương pháp đánh giá** - Assessment methods
9. **Tài liệu tham khảo** - References
10. **Footer** - Ngày cập nhật

## Notes

- PDF được tạo bằng iText 7
- Font: Helvetica (hỗ trợ ASCII, cần cải thiện cho Tiếng Việt đầy đủ)
- File PDF được trả về dưới dạng attachment (tự động download)
- Size PDF phụ thuộc vào độ dài nội dung giáo trình
