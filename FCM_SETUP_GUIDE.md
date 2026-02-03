# 🔔 Firebase Cloud Messaging - Hướng dẫn cấu hình

## Bước 1: Tạo Firebase Project (5-10 phút)

### 1.1. Truy cập Firebase Console
1. Vào https://console.firebase.google.com/
2. Click **"Add project"** (Thêm dự án)
3. Nhập tên project: **smd-microservices**
4. Tắt Google Analytics (không cần thiết cho FCM)
5. Click **"Create project"**

### 1.2. Thêm Firebase vào Web App
1. Trong Firebase Console, click biểu tượng **Web** (</>) trên trang chủ
2. Nhập app nickname: **SMD Public Portal**
3. **Bỏ chọn** "Set up Firebase Hosting"
4. Click **"Register app"**
5. Copy đoạn Firebase configuration (firebaseConfig object)

### 1.3. Lấy Firebase Config
Sau khi đăng ký app, bạn sẽ thấy đoạn code như này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc..."
};
```

**➡️ Copy toàn bộ object này**

### 1.4. Lấy VAPID Key (Web Push Certificate)
1. Trong Firebase Console, click **⚙️ Settings** (góc trên bên trái)
2. Chọn **"Project settings"**
3. Tab **"Cloud Messaging"**
4. Scroll xuống section **"Web Push certificates"**
5. Click **"Generate key pair"**
6. Copy **Key pair** (bắt đầu bằng "BDx...")

**➡️ Copy key này (VAPID_KEY)**

---

## Bước 2: Cấu hình Frontend (3 phút)

### 2.1. Cập nhật firebaseConfig.js
Mở file: `frontend/public-portal/src/config/firebaseConfig.js`

**Thay thế:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDEMO-REPLACE-WITH-YOUR-API-KEY", // ❌ XÓA DÒNG NÀY
  ...
};

const VAPID_KEY = "BDxxx-REPLACE-WITH-YOUR-VAPID-KEY"; // ❌ XÓA DÒNG NÀY
```

**Bằng:**
```javascript
const firebaseConfig = {
  // ✅ PASTE firebaseConfig từ bước 1.3
  apiKey: "AIzaSyA...", // API Key thật của bạn
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc..."
};

const VAPID_KEY = "BDx..."; // ✅ PASTE VAPID Key từ bước 1.4
```

### 2.2. Cập nhật firebase-messaging-sw.js
Mở file: `frontend/public-portal/public/firebase-messaging-sw.js`

**Thay thế:**
```javascript
firebase.initializeApp({
  apiKey: "AIzaSyDEMO-REPLACE-WITH-YOUR-API-KEY", // ❌ XÓA
  ...
});
```

**Bằng:**
```javascript
firebase.initializeApp({
  // ✅ PASTE cùng firebaseConfig như trên
  apiKey: "AIzaSyA...",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc..."
});
```

---

## Bước 3: Cấu hình Backend (10 phút)

### 3.1. Tạo Service Account Key (Private Key)
1. Trong Firebase Console, vào **⚙️ Settings > Project settings**
2. Tab **"Service accounts"**
3. Click **"Generate new private key"**
4. Click **"Generate key"** (file JSON sẽ được tải xuống)
5. File tải xuống có tên dạng: `smd-microservices-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

### 3.2. Đổi tên và di chuyển file
1. **Đổi tên** file thành: `firebase-service-account.json`
2. **Di chuyển** file vào thư mục:
   ```
   backend/notification-service/src/main/resources/firebase-service-account.json
   ```

### 3.3. Cài đặt dependencies
```bash
cd backend/notification-service
mvn clean install
```

---

## Bước 4: Chạy Database Migration

### 4.1. Chạy SQL migration
```bash
psql -U smduser -d smd_db -f database/migrations/V1.0.8__fcm_notifications.sql
```

**Hoặc nếu dùng Docker:**
```bash
docker exec -i smd-postgres psql -U smduser -d smd_db < database/migrations/V1.0.8__fcm_notifications.sql
```

### 4.2. Verify database schema
```sql
\dt fcm*
\dt notifications*
```

Kết quả phải hiển thị 4 tables:
- `fcm_device_tokens`
- `notifications`
- `notification_preferences`
- `notification_logs`

---

## Bước 5: Cập nhật Docker Compose

Thêm notification-service vào `docker-compose.yml`:

```yaml
  notification-service:
    build: ./backend/notification-service
    container_name: smd-notification-service
    ports:
      - "8086:8086"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/smd_db
      - SPRING_DATASOURCE_USERNAME=smduser
      - SPRING_DATASOURCE_PASSWORD=smdpass123
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://discovery-server:8761/eureka/
    depends_on:
      - postgres
      - kafka
      - discovery-server
    networks:
      - smd-network
```

---

## Bước 6: Khởi động Services

### 6.1. Build và chạy notification-service
```bash
cd backend/notification-service
mvn clean package -DskipTests
docker-compose up -d notification-service
```

### 6.2. Restart frontend để load Firebase config mới
```bash
cd frontend/public-portal
npm install firebase
npm start
```

### 6.3. Verify services
```bash
# Check notification-service logs
docker logs -f smd-notification-service

# Verify Firebase initialized
# Tìm dòng: "✅ Firebase initialized successfully"
```

---

## Bước 7: Test Notifications

### 7.1. Test trong browser
1. Mở frontend: http://localhost:3001
2. **Login** với bất kỳ tài khoản nào
3. Browser sẽ hiện popup xin quyền notifications
4. Click **"Allow"** (Cho phép)
5. Check console (F12):
   ```
   ✅ Firebase initialized successfully
   ✅ FCM Token: c7xxx... (token sẽ hiện)
   ✅ FCM token registered to backend
   ```

### 7.2. Test API endpoints
```bash
# Get unread count
curl -X GET "http://localhost:8080/api/notifications/unread-count?userId=1"

# Get notifications list
curl -X GET "http://localhost:8080/api/notifications?userId=1&page=0&size=20"
```

---

## Bước 8: Trigger Notifications (Test 2 Use Cases)

### Use Case 1: Approval Request Notification
**Khi giảng viên submit giáo trình:**

```java
// Trong SyllabusService.java (syllabus-service)
public void submitForApproval(Long syllabusId) {
    // ... existing code ...
    
    // Publish Kafka event
    Map<String, Object> event = new HashMap<>();
    event.put("syllabusId", syllabusId);
    event.put("syllabusName", syllabus.getName());
    event.put("submitterName", lecturer.getName());
    event.put("approverRole", "HOD"); // or ACADEMIC_AFFAIRS, RECTOR
    event.put("approverId", approver.getId());
    
    kafkaTemplate.send("syllabus.submitted", event);
}
```

**Kết quả:** HOD/Academic Affairs/Rector nhận thông báo "Yêu cầu duyệt giáo trình mới"

### Use Case 2: New Syllabus for Students
**Khi rector duyệt giáo trình (status = PUBLIC):**

```java
// Trong WorkflowService.java (workflow-service)
public void approveSyllabus(Long syllabusId) {
    // ... existing code ...
    
    // Get students by major
    List<Long> studentIds = studentRepository.findIdsByMajorCode(syllabus.getMajorCode());
    
    // Publish Kafka event
    Map<String, Object> event = new HashMap<>();
    event.put("syllabusId", syllabusId);
    event.put("syllabusName", syllabus.getName());
    event.put("subjectCode", syllabus.getSubjectCode());
    event.put("majorCode", syllabus.getMajorCode());
    event.put("majorName", major.getName());
    event.put("studentIds", studentIds);
    
    kafkaTemplate.send("syllabus.published", event);
}
```

**Kết quả:** Sinh viên nhận thông báo "📚 Giáo trình mới... đã được xuất bản"

---

## 🎯 Tóm tắt các file quan trọng

| File | Mục đích | Cần config |
|------|----------|-----------|
| `firebaseConfig.js` | Frontend Firebase setup | ✅ Thay apiKey, VAPID_KEY |
| `firebase-messaging-sw.js` | Service Worker (background) | ✅ Thay firebaseConfig |
| `firebase-service-account.json` | Backend credentials | ✅ Tải từ Firebase |
| `application.yml` | Backend config | ✅ Đã config sẵn |
| `ApprovalRequestListener.java` | Xử lý yêu cầu duyệt | ✅ Đã implement |
| `NewSyllabusListener.java` | Xử lý giáo trình mới | ✅ Đã implement |

---

## ✅ Checklist hoàn thành

- [ ] Tạo Firebase Project
- [ ] Lấy firebaseConfig và VAPID_KEY
- [ ] Cập nhật firebaseConfig.js
- [ ] Cập nhật firebase-messaging-sw.js
- [ ] Tạo Service Account Key
- [ ] Đặt firebase-service-account.json vào resources/
- [ ] Chạy database migration
- [ ] Thêm notification-service vào docker-compose
- [ ] Build và chạy notification-service
- [ ] Install firebase npm package
- [ ] Test browser notification permission
- [ ] Verify FCM token registered
- [ ] Test approval request notification
- [ ] Test new syllabus notification

---

## 🚨 Troubleshooting

### Lỗi: "Failed to register service worker"
**Nguyên nhân:** Service worker chỉ chạy trên HTTPS hoặc localhost
**Giải pháp:** Đảm bảo chạy trên `http://localhost:3001`

### Lỗi: "Notification permission denied"
**Nguyên nhân:** User đã từ chối quyền trước đó
**Giải pháp:** 
1. Chrome: Settings > Privacy > Site settings > Notifications
2. Xóa localhost khỏi "Block" list
3. Refresh trang và thử lại

### Lỗi: "Firebase initialization error"
**Nguyên nhân:** firebaseConfig sai hoặc thiếu
**Giải pháp:** Double-check apiKey, projectId, appId từ Firebase Console

### Lỗi: "Firebase Admin SDK not found"
**Nguyên nhân:** Thiếu firebase-service-account.json
**Giải pháp:** Đảm bảo file nằm trong `backend/notification-service/src/main/resources/`

---

## 📚 Tài liệu tham khảo

- Firebase Console: https://console.firebase.google.com/
- FCM Documentation: https://firebase.google.com/docs/cloud-messaging
- Web Push Protocol: https://developers.google.com/web/fundamentals/push-notifications

---

**🎉 Hoàn thành! Notification system đã sẵn sàng.**
