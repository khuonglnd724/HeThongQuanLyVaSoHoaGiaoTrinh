import { http } from "../http";

export type NotificationItem = {
  id: string;
  userId: string;
  title?: string;
  message?: string;
  type?: string;
  read: boolean;
  createdAt?: string;

  // in case backend uses different fields
  content?: string;
};

export async function listNotifications(userId: string, unreadOnly: boolean) {
  const res = await http.get<NotificationItem[]>("/api/notifications", {
    params: { userId, unreadOnly },
  });
  return res.data;
}

export async function unreadCount(userId: string) {
  const res = await http.get<number>("/api/notifications/unread-count", {
    params: { userId },
  });
  return res.data;
}

export async function markRead(id: string) {
  const res = await http.post<NotificationItem>(`/api/notifications/${id}/read`);
  return res.data;
}

export async function markAllRead(userId: string) {
  const res = await http.post<number>("/api/notifications/mark-all-read", null, {
    params: { userId },
  });
  return res.data;
}

export async function deleteNotification(id: string) {
  await http.delete(`/api/notifications/${id}`);
}
