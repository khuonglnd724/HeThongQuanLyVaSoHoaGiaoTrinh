# FIREBASE CLOUD MESSAGING (FCM) + REAL-TIME NOTIFICATIONS

## 🎯 TỔNG QUAN

**Mục tiêu:** Kết hợp 2 cơ chế thông báo:
1. **Real-time (WebSocket/SSE):** Khi user đang online, active trên trang
2. **Push Notifications (FCM):** Khi user offline hoặc đóng tab, nhận notification qua browser

**Architecture:**
```
Backend (Spring Boot)
    ↓
    ├─→ WebSocket → Frontend (khi online)
    └─→ Firebase FCM → Browser (khi offline)
```

---

## 📋 PHASE 1: SETUP FIREBASE PROJECT (30 phút)

### 1.1 Tạo Firebase Project

**Bước 1:** Vào https://console.firebase.google.com/

**Bước 2:** Click "Add project" / "Thêm dự án"
- Project name: `SMD-Microservices`
- Enable Google Analytics: YES (recommended)
- Analytics account: Default hoặc Create new

**Bước 3:** Đợi Firebase tạo project (~1-2 phút)

---

### 1.2 Add Web App to Firebase

**Bước 1:** Trong Firebase Console → Project Overview → Add app → Web (</> icon)

**Bước 2:** Register app:
- App nickname: `SMD Public Portal`
- Also set up Firebase Hosting: NO (không cần)
- Click "Register app"

**Bước 3:** Copy Firebase Config
```javascript
// firebaseConfig sẽ trông như này:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```
**⚠️ LƯU LẠI CONFIG NÀY!**

---

### 1.3 Enable Firebase Cloud Messaging

**Bước 1:** Firebase Console → Build → Cloud Messaging

**Bước 2:** Nếu thấy "Cloud Messaging API (Legacy) disabled" → Click "Enable"

**Bước 3:** Get Server Key:
- Cloud Messaging → Project settings (⚙️) → Cloud Messaging tab
- Copy **Server key** (key này sẽ dùng trong backend)
- Ví dụ: `AAAAxxxxxxxx:APA91bFyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

**Bước 4:** Generate Web Push Certificate (VAPID Key):
- Cloud Messaging → Web configuration → Web Push certificates
- Click "Generate key pair"
- Copy **Key pair** (public key)
- Ví dụ: `BDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**⚠️ LƯU CẢ 2 KEYS!**

---

### 1.4 Download Service Account Key (for Backend)

**Bước 1:** Firebase Console → Project settings (⚙️) → Service accounts

**Bước 2:** Click "Generate new private key" → Download JSON file

**Bước 3:** Rename file to `firebase-service-account.json`

**Bước 4:** Move file to backend:
```
smd-microservices/
├── backend/
│   └── notification-service/
│       └── src/main/resources/
│           └── firebase-service-account.json  ← ĐẶT ĐÂY
```

**⚠️ IMPORTANT:** Add vào `.gitignore`:
```
**/firebase-service-account.json
```

---

## 🌐 PHASE 2: FRONTEND IMPLEMENTATION (2-3 giờ)

### 2.1 Install Firebase SDK

```bash
cd frontend/public-portal
npm install firebase
```

---

### 2.2 Create Firebase Config File

**File:** `frontend/public-portal/src/config/firebaseConfig.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration (thay bằng config của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// VAPID Key (Web Push Certificate)
const VAPID_KEY = "BDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, VAPID_KEY, getToken, onMessage };
```

---

### 2.3 Create Firebase Service Worker

**File:** `frontend/public-portal/public/firebase-messaging-sw.js`

```javascript
// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192.png',
    badge: '/badge.png',
    data: payload.data,
    requireInteraction: false,
    tag: payload.data?.tag || 'default',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  // Navigate to specific page based on notification data
  const data = event.notification.data;
  let urlToOpen = '/';

  if (data?.syllabusId) {
    urlToOpen = `/syllabus/${data.syllabusId}`;
  } else if (data?.url) {
    urlToOpen = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Nếu đã có tab mở, focus vào tab đó
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Nếu không, mở tab mới
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

---

### 2.4 Register Service Worker in index.html

**File:** `frontend/public-portal/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SMD Portal</title>
  </head>
  <body>
    <div id="root"></div>
    
    <!-- Register Firebase Service Worker -->
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((err) => {
            console.error('Service Worker registration failed:', err);
          });
      }
    </script>
  </body>
</html>
```

---

### 2.5 Create Notification Service

**File:** `frontend/public-portal/src/services/notificationService.js`

```javascript
import { messaging, VAPID_KEY, getToken, onMessage } from '../config/firebaseConfig';
import api from './api';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Kiểm tra browser có hỗ trợ notifications không
  isNotificationSupported() {
    return this.isSupported;
  }

  // Request permission từ user
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        await this.getFCMToken();
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Lấy FCM token
  async getFCMToken() {
    if (!this.isSupported) return null;

    try {
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
      });
      
      if (token) {
        console.log('FCM Token:', token);
        this.fcmToken = token;
        
        // Gửi token lên backend
        await this.registerTokenToBackend(token);
        
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Đăng ký token với backend
  async registerTokenToBackend(token) {
    try {
      await api.post('/notifications/register-device', {
        fcmToken: token,
        deviceType: 'WEB',
        browser: navigator.userAgent
      });
      console.log('FCM token registered to backend');
    } catch (error) {
      console.error('Error registering token to backend:', error);
    }
  }

  // Setup foreground message listener
  setupForegroundListener(callback) {
    if (!this.isSupported) return;

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Hiển thị notification ngay khi user đang online
      const { title, body } = payload.notification || {};
      const data = payload.data || {};
      
      // Custom notification UI (toast)
      if (callback && typeof callback === 'function') {
        callback({
          title: title || 'New Notification',
          body: body || '',
          data: data
        });
      }

      // Hoặc dùng browser notification
      if (Notification.permission === 'granted') {
        new Notification(title || 'New Notification', {
          body: body || '',
          icon: '/logo192.png',
          data: data
        });
      }
    });
  }

  // Unregister token khi logout
  async unregisterToken() {
    if (!this.fcmToken) return;

    try {
      await api.delete('/notifications/unregister-device', {
        data: { fcmToken: this.fcmToken }
      });
      console.log('FCM token unregistered');
      this.fcmToken = null;
    } catch (error) {
      console.error('Error unregistering token:', error);
    }
  }

  // Lấy danh sách notifications từ backend
  async getNotifications(page = 0, size = 20) {
    try {
      const response = await api.get('/notifications', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { content: [], totalElements: 0 };
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }
}

export default new NotificationService();
```

---

### 2.6 Integrate vào App Component

**File:** `frontend/public-portal/src/App.jsx`

```jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notificationService from './services/notificationService';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Setup notifications khi user đã login
    if (isAuthenticated) {
      initializeNotifications();
    }
  }, [isAuthenticated]);

  const initializeNotifications = async () => {
    // Kiểm tra browser có hỗ trợ không
    if (!notificationService.isNotificationSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    // Request permission
    const granted = await notificationService.requestPermission();
    
    if (granted) {
      // Setup foreground listener
      notificationService.setupForegroundListener((notification) => {
        // Hiển thị toast khi nhận notification
        toast.info(
          <div>
            <strong>{notification.title}</strong>
            <p>{notification.body}</p>
          </div>,
          {
            position: 'bottom-right',
            autoClose: 5000,
            onClick: () => {
              // Navigate to detail page
              if (notification.data?.syllabusId) {
                window.location.href = `/syllabus/${notification.data.syllabusId}`;
              }
            }
          }
        );
      });
    }
  };

  return (
    <Router>
      <Routes>
        {/* Your routes here */}
      </Routes>
      
      <ToastContainer />
    </Router>
  );
}

export default App;
```

---

### 2.7 Create Notification Bell Component

**File:** `frontend/public-portal/src/components/NotificationBell.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Notifications as BellIcon,
  FiberManualRecord as DotIcon,
  DoneAll as CheckAllIcon
} from '@mui/icons-material';
import notificationService from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const data = await notificationService.getNotifications(0, 10);
    setNotifications(data.content || []);
    setUnreadCount(data.content?.filter(n => !n.read).length || 0);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      loadNotifications();
    }

    // Navigate
    if (notification.data?.syllabusId) {
      window.location.href = `/syllabus/${notification.data.syllabusId}`;
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <BellIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: { width: 360, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={handleMarkAllAsRead} title="Mark all as read">
              <CheckAllIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                '&:hover': { backgroundColor: 'action.selected' }
              }}
            >
              <ListItemIcon>
                {!notification.read && <DotIcon color="primary" fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="textSecondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        )}

        <Divider />
        <MenuItem onClick={() => window.location.href = '/notifications'}>
          <Typography variant="body2" color="primary" textAlign="center" width="100%">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationBell;
```

---

## 🔧 PHASE 3: BACKEND IMPLEMENTATION (3-4 giờ)

### 3.1 Add Dependencies

**File:** `backend/notification-service/pom.xml`

```xml
<dependencies>
    <!-- Firebase Admin SDK -->
    <dependency>
        <groupId>com.google.firebase</groupId>
        <artifactId>firebase-admin</artifactId>
        <version>9.2.0</version>
    </dependency>

    <!-- WebSocket for real-time -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>

    <!-- Existing dependencies -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
</dependencies>
```

---

### 3.2 Create Database Schema

**File:** `backend/notification-service/src/main/resources/schema.sql`

```sql
-- Bảng lưu FCM tokens
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fcm_token VARCHAR(500) NOT NULL UNIQUE,
    device_type VARCHAR(20) DEFAULT 'WEB', -- WEB, ANDROID, IOS
    browser VARCHAR(200),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_active ON fcm_tokens(is_active);

-- Bảng notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- SYLLABUS_UPDATE, COMMENT, APPROVAL, etc.
    data JSONB, -- {syllabusId: 123, action: "view_detail"}
    is_read BOOLEAN DEFAULT FALSE,
    sent_via VARCHAR(20) DEFAULT 'WEBSOCKET', -- WEBSOCKET, FCM, BOTH
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

### 3.3 Create Entity Classes

**File:** `backend/notification-service/src/main/java/com/smd/notification/entity/FCMToken.java`

```java
package com.smd.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "fcm_tokens")
@Data
public class FCMToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "fcm_token", nullable = false, unique = true, length = 500)
    private String fcmToken;
    
    @Column(name = "device_type", length = 20)
    private String deviceType = "WEB";
    
    @Column(name = "browser", length = 200)
    private String browser;
    
    @Column(name = "registered_at")
    private LocalDateTime registeredAt = LocalDateTime.now();
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt = LocalDateTime.now();
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}
```

**File:** `backend/notification-service/src/main/java/com/smd/notification/entity/Notification.java`

```java
package com.smd.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(nullable = false, length = 50)
    private String type;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> data;
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "sent_via", length = 20)
    private String sentVia = "WEBSOCKET";
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

---

### 3.4 Create Repository

**File:** `backend/notification-service/src/main/java/com/smd/notification/repository/FCMTokenRepository.java`

```java
package com.smd.notification.repository;

import com.smd.notification.entity.FCMToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface FCMTokenRepository extends JpaRepository<FCMToken, Long> {
    
    List<FCMToken> findByUserIdAndIsActiveTrue(Long userId);
    
    Optional<FCMToken> findByFcmToken(String fcmToken);
    
    @Query("SELECT f.fcmToken FROM FCMToken f WHERE f.userId = :userId AND f.isActive = true")
    List<String> findActiveTokensByUserId(Long userId);
    
    void deleteByFcmToken(String fcmToken);
}
```

**File:** `backend/notification-service/src/main/java/com/smd/notification/repository/NotificationRepository.java`

```java
package com.smd.notification.repository;

import com.smd.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false")
    Long countUnreadByUserId(Long userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(Long userId);
}
```

---

### 3.5 Create Firebase Configuration

**File:** `backend/notification-service/src/main/java/com/smd/notification/config/FirebaseConfig.java`

```java
package com.smd.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;

@Configuration
public class FirebaseConfig {
    
    @PostConstruct
    public void initialize() throws IOException {
        ClassPathResource serviceAccount = new ClassPathResource("firebase-service-account.json");
        
        if (!serviceAccount.exists()) {
            throw new RuntimeException("Firebase service account file not found!");
        }
        
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount.getInputStream()))
                .build();
        
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
            System.out.println("Firebase initialized successfully!");
        }
    }
}
```

---

### 3.6 Create FCM Service

**File:** `backend/notification-service/src/main/java/com/smd/notification/service/FCMService.java`

```java
package com.smd.notification.service;

import com.google.firebase.messaging.*;
import com.smd.notification.entity.FCMToken;
import com.smd.notification.repository.FCMTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FCMService {
    
    private final FCMTokenRepository fcmTokenRepository;
    
    /**
     * Register FCM token
     */
    @Transactional
    public void registerToken(Long userId, String fcmToken, String deviceType, String browser) {
        // Check if token already exists
        FCMToken existing = fcmTokenRepository.findByFcmToken(fcmToken).orElse(null);
        
        if (existing != null) {
            // Update existing token
            existing.setUserId(userId);
            existing.setLastUsedAt(LocalDateTime.now());
            existing.setIsActive(true);
            fcmTokenRepository.save(existing);
            log.info("Updated FCM token for user: {}", userId);
        } else {
            // Create new token
            FCMToken token = new FCMToken();
            token.setUserId(userId);
            token.setFcmToken(fcmToken);
            token.setDeviceType(deviceType);
            token.setBrowser(browser);
            fcmTokenRepository.save(token);
            log.info("Registered new FCM token for user: {}", userId);
        }
    }
    
    /**
     * Unregister FCM token
     */
    @Transactional
    public void unregisterToken(String fcmToken) {
        fcmTokenRepository.findByFcmToken(fcmToken).ifPresent(token -> {
            token.setIsActive(false);
            fcmTokenRepository.save(token);
            log.info("Unregistered FCM token: {}", fcmToken);
        });
    }
    
    /**
     * Send notification to single user
     */
    public void sendToUser(Long userId, String title, String body, Map<String, String> data) {
        List<String> tokens = fcmTokenRepository.findActiveTokensByUserId(userId);
        
        if (tokens.isEmpty()) {
            log.warn("No active FCM tokens found for user: {}", userId);
            return;
        }
        
        sendToTokens(tokens, title, body, data);
    }
    
    /**
     * Send notification to multiple tokens
     */
    public void sendToTokens(List<String> tokens, String title, String body, Map<String, String> data) {
        if (tokens == null || tokens.isEmpty()) {
            log.warn("No tokens provided for sending notification");
            return;
        }
        
        try {
            // Build notification
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();
            
            // Build web push config
            WebpushConfig webpushConfig = WebpushConfig.builder()
                    .setNotification(WebpushNotification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .setIcon("/logo192.png")
                            .setRequireInteraction(false)
                            .build())
                    .build();
            
            // Build multicast message
            MulticastMessage message = MulticastMessage.builder()
                    .setNotification(notification)
                    .setWebpushConfig(webpushConfig)
                    .putAllData(data)
                    .addAllTokens(tokens)
                    .build();
            
            // Send
            BatchResponse response = FirebaseMessaging.getInstance().sendMulticast(message);
            
            log.info("Successfully sent {} messages out of {}", 
                     response.getSuccessCount(), tokens.size());
            
            // Handle failures
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    if (!responses.get(i).isSuccessful()) {
                        String token = tokens.get(i);
                        String error = responses.get(i).getException().getMessage();
                        log.error("Failed to send to token {}: {}", token, error);
                        
                        // Deactivate invalid tokens
                        if (error.contains("registration-token-not-registered") || 
                            error.contains("invalid-registration-token")) {
                            unregisterToken(token);
                        }
                    }
                }
            }
            
        } catch (FirebaseMessagingException e) {
            log.error("Error sending FCM notification", e);
        }
    }
    
    /**
     * Send to topic
     */
    public void sendToTopic(String topic, String title, String body, Map<String, String> data) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data)
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent message to topic {}: {}", topic, response);
            
        } catch (FirebaseMessagingException e) {
            log.error("Error sending to topic: {}", topic, e);
        }
    }
}
```

---

### 3.7 Create Notification Service

**File:** `backend/notification-service/src/main/java/com/smd/notification/service/NotificationService.java`

```java
package com.smd.notification.service;

import com.smd.notification.entity.Notification;
import com.smd.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final FCMService fcmService;
    private final SimpMessagingTemplate messagingTemplate; // WebSocket
    
    /**
     * Send notification (WebSocket + FCM)
     */
    @Transactional
    public void sendNotification(Long userId, String title, String message, 
                                  String type, Map<String, Object> data) {
        
        // 1. Save to database
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setData(data);
        notification.setSentVia("BOTH");
        notificationRepository.save(notification);
        
        // 2. Send via WebSocket (real-time cho user online)
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
            );
            log.info("Sent WebSocket notification to user: {}", userId);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification: {}", e.getMessage());
        }
        
        // 3. Send via FCM (cho user offline hoặc tab đóng)
        try {
            Map<String, String> fcmData = new HashMap<>();
            fcmData.put("notificationId", notification.getId().toString());
            fcmData.put("type", type);
            if (data != null) {
                data.forEach((key, value) -> fcmData.put(key, value.toString()));
            }
            
            fcmService.sendToUser(userId, title, message, fcmData);
            log.info("Sent FCM notification to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send FCM notification", e);
        }
    }
    
    /**
     * Get notifications for user
     */
    public Page<Notification> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get unread count
     */
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    /**
     * Mark as read
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUserId().equals(userId)) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        });
    }
    
    /**
     * Mark all as read
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
```

---

### 3.8 Create Controller

**File:** `backend/notification-service/src/main/java/com/smd/notification/controller/NotificationController.java`

```java
package com.smd.notification.controller;

import com.smd.notification.dto.DeviceRegistrationRequest;
import com.smd.notification.entity.Notification;
import com.smd.notification.service.FCMService;
import com.smd.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    private final FCMService fcmService;
    
    /**
     * Register FCM device token
     */
    @PostMapping("/register-device")
    public ResponseEntity<?> registerDevice(
            @RequestBody DeviceRegistrationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        fcmService.registerToken(userId, request.getFcmToken(), 
                                 request.getDeviceType(), request.getBrowser());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Unregister device
     */
    @DeleteMapping("/unregister-device")
    public ResponseEntity<?> unregisterDevice(@RequestBody Map<String, String> request) {
        fcmService.unregisterToken(request.get("fcmToken"));
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get notifications
     */
    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        Page<Notification> notifications = notificationService.getNotifications(
                userId, PageRequest.of(page, size));
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Mark as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Mark all as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    private Long getUserId(UserDetails userDetails) {
        // Extract user ID from UserDetails (implementation depends on your auth)
        return 1L; // Replace with actual logic
    }
}
```

---

### 3.9 Event Listeners (Trigger Notifications)

**File:** `backend/syllabus-service/src/main/java/com/smd/syllabus/event/SyllabusEventListener.java`

```java
package com.smd.syllabus.event;

import com.smd.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SyllabusEventListener {
    
    private final NotificationService notificationService;
    
    @EventListener
    public void onSyllabusUpdated(SyllabusUpdatedEvent event) {
        // Gửi notification cho followers
        event.getFollowerIds().forEach(userId -> {
            notificationService.sendNotification(
                userId,
                "Giáo trình đã cập nhật",
                event.getSyllabusName() + " đã có phiên bản mới",
                "SYLLABUS_UPDATE",
                Map.of("syllabusId", event.getSyllabusId(), "action", "view_detail")
            );
        });
    }
    
    @EventListener
    public void onCommentAdded(CommentAddedEvent event) {
        // Gửi notification cho tác giả và người được mention
        notificationService.sendNotification(
            event.getAuthorId(),
            "Bình luận mới",
            event.getCommenterName() + " đã bình luận trên giáo trình của bạn",
            "COMMENT",
            Map.of("syllabusId", event.getSyllabusId(), "commentId", event.getCommentId())
        );
    }
    
    @EventListener
    public void onApprovalStatusChanged(ApprovalStatusChangedEvent event) {
        // Gửi notification cho lecturer
        String status = event.getStatus();
        String message = status.equals("APPROVED") 
            ? "Giáo trình của bạn đã được phê duyệt"
            : "Giáo trình của bạn cần chỉnh sửa";
            
        notificationService.sendNotification(
            event.getLecturerId(),
            "Trạng thái phê duyệt",
            message,
            "APPROVAL",
            Map.of("syllabusId", event.getSyllabusId(), "status", status)
        );
    }
}
```

---

## 🧪 PHASE 4: TESTING (1 giờ)

### 4.1 Test Frontend

**Bước 1:** Chạy frontend
```bash
cd frontend/public-portal
npm start
```

**Bước 2:** Mở browser console (F12)

**Bước 3:** Login vào app

**Bước 4:** Kiểm tra:
- Console log: "FCM Token: ..." → Token đã được tạo
- Console log: "FCM token registered to backend" → Token đã lưu vào DB
- Browser cho phép notification: Kiểm tra Settings → Site settings → Notifications

**Bước 5:** Test nhận notification:
- Trigger một event (ví dụ: update syllabus)
- Kiểm tra toast hiện lên (khi tab đang mở)
- Đóng tab, trigger event lại → Notification hiện từ browser

---

### 4.2 Test Backend

**Test 1: Send test notification via API**

```bash
# Get user's FCM tokens
curl -X GET http://localhost:8080/api/notifications \
  -H "Authorization: Bearer <your-jwt-token>"

# Trigger notification manually (tạo test endpoint)
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test Notification",
    "message": "This is a test",
    "type": "TEST"
  }'
```

**Test 2: Check database**

```sql
-- Check registered tokens
SELECT * FROM fcm_tokens WHERE user_id = 1;

-- Check sent notifications
SELECT * FROM notifications WHERE user_id = 1 ORDER BY created_at DESC;
```

---

## 📊 PHASE 5: MONITORING & ANALYTICS

### 5.1 Firebase Console Monitoring

**Firebase Console → Cloud Messaging → Reports:**
- Impressions: Số notification đã gửi
- Opens: Số notification đã mở
- Conversion: Số user thực hiện action

**Realtime Logs:**
```
Firebase Console → Cloud Messaging → Notifications sent
```

---

### 5.2 Backend Logging

**Add logging in FCMService:**
```java
log.info("Sending notification: userId={}, title={}, tokensCount={}", 
         userId, title, tokens.size());
log.info("Success: {}, Failure: {}", 
         response.getSuccessCount(), response.getFailureCount());
```

**Check logs:**
```bash
tail -f backend/notification-service/logs/application.log | grep FCM
```

---

## 🎉 SUCCESS CHECKLIST

### Frontend ✅
- [x] Firebase SDK installed
- [x] Service Worker registered
- [x] FCM token generated
- [x] Token sent to backend
- [x] Foreground message handler setup
- [x] Background message handler setup
- [x] Notification Bell component created
- [x] Toast notifications working

### Backend ✅
- [x] Firebase Admin SDK integrated
- [x] Database tables created
- [x] FCM token registration API
- [x] Notification service implemented
- [x] WebSocket + FCM combined
- [x] Event listeners created

### Testing ✅
- [x] Notification permission requested
- [x] Token saved to database
- [x] Foreground notification received (tab open)
- [x] Background notification received (tab closed)
- [x] Notification click navigation works
- [x] Unread count badge updates

---

## 📚 DOCUMENTATION

### API Endpoints

```
POST   /api/notifications/register-device     # Register FCM token
DELETE /api/notifications/unregister-device   # Unregister token
GET    /api/notifications                     # Get notifications (paginated)
GET    /api/notifications/unread-count        # Get unread count
PUT    /api/notifications/{id}/read           # Mark as read
PUT    /api/notifications/read-all            # Mark all as read
```

### Notification Types

```
SYLLABUS_UPDATE     # Giáo trình cập nhật
COMMENT            # Bình luận mới
APPROVAL           # Trạng thái phê duyệt
MENTION            # Được mention
DEADLINE           # Deadline sắp tới
SYSTEM             # Thông báo hệ thống
```

---

## 🚀 DEPLOYMENT NOTES

### Production Checklist

1. **Cập nhật Firebase URLs:**
   - Frontend: Đổi apiKey, authDomain thành production values
   - Backend: Dùng production service account JSON

2. **HTTPS Required:**
   - Service Workers chỉ hoạt động trên HTTPS
   - Development: localhost OK
   - Production: MUST use HTTPS

3. **CORS Configuration:**
   - Backend cho phép origin của frontend
   - Firebase cho phép domain của bạn

4. **Environment Variables:**
   ```env
   FIREBASE_PROJECT_ID=smd-microservices
   FIREBASE_SERVICE_ACCOUNT_PATH=/config/firebase-service-account.json
   ```

---

*Document created: January 31, 2026*
