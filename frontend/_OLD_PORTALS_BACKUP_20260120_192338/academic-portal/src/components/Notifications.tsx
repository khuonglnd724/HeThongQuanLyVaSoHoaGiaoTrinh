import React, { useState, useEffect } from 'react';
import academicService from '../services/academicService';
import { Notification } from '../types';
import './Notifications.css';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await academicService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await academicService.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await academicService.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-modal">
      <div className="notifications-content">
        <div className="notifications-header">
          <h3>Thông báo {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h3>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="empty">Không có thông báo</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </small>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn-mark-read"
                    >
                      Đánh dấu
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="btn-delete"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
