import { messaging, VAPID_KEY, getToken, onMessage } from '../config/firebaseConfig';
import apiClient from './api/apiClient';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && messaging !== null;
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported() {
    return this.isSupported;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        await this.getFCMToken();
        return true;
      } else if (permission === 'denied') {
        console.log('❌ Notification permission denied');
        return false;
      } else {
        console.log('⚠️ Notification permission dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token for this device
   */
  async getFCMToken() {
    if (!this.isSupported) return null;

    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (token) {
        console.log('✅ FCM Token:', token.substring(0, 20) + '...');
        this.fcmToken = token;
        
        // Register token with backend
        await this.registerTokenToBackend(token);
        
        return token;
      } else {
        console.warn('⚠️ No FCM registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      
      // Specific error handling
      if (error.code === 'messaging/permission-blocked') {
        console.error('Notification permission blocked by user');
      } else if (error.code === 'messaging/failed-service-worker-registration') {
        console.error('Service worker registration failed');
      }
      
      return null;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerTokenToBackend(token) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await apiClient.post('/api/notifications/register-device', {
        fcmToken: token,
        deviceType: 'WEB',
        browser: navigator.userAgent,
        userId: user.userId || user.id  // Try both userId and id
      });
      
      console.log('✅ FCM token registered to backend');
    } catch (error) {
      console.error('Error registering token to backend:', error);
      // Don't throw - token is still valid locally
    }
  }

  /**
   * Setup foreground message listener (khi user đang online)
   */
  setupForegroundListener(callback) {
    if (!this.isSupported) return;

    onMessage(messaging, (payload) => {
      console.log('📩 Foreground message received:', payload);
      
      const { notification, data } = payload;
      const title = notification?.title || 'Thông báo mới';
      const body = notification?.body || '';
      
      // Call custom callback if provided
      if (callback && typeof callback === 'function') {
        callback({
          title,
          body,
          data: data || {}
        });
      }

      // Also show browser notification if permission granted
      if (Notification.permission === 'granted') {
        const options = {
          body,
          icon: '/logo192.png',
          badge: '/favicon.ico',
          data: data || {},
          tag: data?.tag || 'default'
        };

        const browserNotification = new Notification(title, options);
        
        // Handle click on foreground notification
        browserNotification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          
          // Navigate based on data
          if (data?.type === 'APPROVAL_REQUEST' && data?.syllabusId) {
            window.location.href = `/academic/approval?syllabusId=${data.syllabusId}`;
          } else if (data?.type === 'NEW_SYLLABUS' && data?.syllabusId) {
            window.location.href = `/public/syllabus/${data.syllabusId}`;
          } else if (data?.syllabusId) {
            window.location.href = `/public/syllabus/${data.syllabusId}`;
          }
          
          browserNotification.close();
        };
      }
    });
  }

  /**
   * Unregister FCM token when user logs out
   */
  async unregisterToken() {
    if (!this.fcmToken) return;

    try {
      await apiClient.delete('/api/notifications/unregister-device', {
        data: { fcmToken: this.fcmToken }
      });
      
      console.log('✅ FCM token unregistered');
      this.fcmToken = null;
    } catch (error) {
      console.error('Error unregistering token:', error);
    }
  }

  /**
   * Get notifications list from backend
   */
  async getNotifications(page = 0, size = 20) {
    try {
      const response = await apiClient.get('/api/notifications', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { content: [], totalElements: 0 };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await apiClient.put('/api/notifications/read-all');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }
}

export default new NotificationService();
