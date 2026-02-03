// Firebase Cloud Messaging Service Worker
// This file handles background notifications when the app is not in focus

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - ✅ Đã cập nhật
firebase.initializeApp({
  apiKey: "AIzaSyATGRick_gjAZwvgc3a_IaSYWV6ZGMDDzs",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "963223195681",
  appId: "1:963223195681:web:5d2fc9511fa72edc951360"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages (khi user không mở app)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    data: payload.data,
    requireInteraction: false,
    tag: payload.data?.tag || 'default',
    actions: []
  };

  // Add action buttons based on notification type
  if (payload.data?.type === 'APPROVAL_REQUEST') {
    notificationOptions.actions = [
      { action: 'view', title: '👀 Xem chi tiết' },
      { action: 'dismiss', title: '✕ Đóng' }
    ];
  } else if (payload.data?.type === 'NEW_SYLLABUS') {
    notificationOptions.actions = [
      { action: 'view', title: '📚 Xem giáo trình' },
      { action: 'dismiss', title: '✕ Đóng' }
    ];
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  // Determine URL to open based on notification data
  const data = event.notification.data || {};
  let urlToOpen = '/';

  if (event.action === 'dismiss') {
    return; // Just close notification
  }

  // Route based on notification type
  if (data.type === 'APPROVAL_REQUEST' && data.syllabusId) {
    // Navigate to approval page
    urlToOpen = `/academic/approval?syllabusId=${data.syllabusId}`;
  } else if (data.type === 'NEW_SYLLABUS' && data.syllabusId) {
    // Navigate to syllabus detail
    urlToOpen = `/public/syllabus/${data.syllabusId}`;
  } else if (data.syllabusId) {
    // Fallback: navigate to syllabus detail
    urlToOpen = `/public/syllabus/${data.syllabusId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  // Open or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window open, open new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
