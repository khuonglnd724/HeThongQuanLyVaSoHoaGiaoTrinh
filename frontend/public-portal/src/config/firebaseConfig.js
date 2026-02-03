import { initializeApp } from 'firebase/app';
import { getMessaging, getToken as fbGetToken, onMessage as fbOnMessage } from 'firebase/messaging';

// Firebase configuration - ✅ Đã cập nhật
// Hướng dẫn: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyATGRick_gjAZwvgc3a_IaSYWV6ZGMDDzs",
  authDomain: "smd-microservices.firebaseapp.com",
  projectId: "smd-microservices",
  storageBucket: "smd-microservices.firebasestorage.app",
  messagingSenderId: "963223195681",
  appId: "1:963223195681:web:5d2fc9511fa72edc951360"
};

// VAPID Key (Web Push Certificate) - ✅ Đã cập nhật
// Lấy tại: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = "BChk3EneD041gHBUyhsZekXmUDTDX32yqAVBNMhNk2CTjIsI8ko_ZGAA-m3NSfVWs59zaBf6X-4lOHUmhYUh-wc";

// Initialize Firebase
let app;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Check if messaging is supported (requires HTTPS or localhost)
  if ('Notification' in window && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase Messaging not supported in this environment');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { messaging, VAPID_KEY };
export { fbGetToken as getToken, fbOnMessage as onMessage };
export default app;
