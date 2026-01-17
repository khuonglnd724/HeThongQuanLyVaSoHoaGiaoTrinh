import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
  type NotificationItem,
} from "../../lib/api/notificationApi";
import { connectNotificationStream } from "../../lib/api/notificationSse";
import "./NotificationPage.css";

function getUserId() {
  return localStorage.getItem("x_user_id") || "1";
}

function fmtTime(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function NotificationPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState<number>(0);

  const stopRef = useRef<null | (() => void)>(null);

  async function load() {
    const userId = getUserId();
    setLoading(true);
    setError(null);

    try {
      const [list, c] = await Promise.all([
        listNotifications(userId, unreadOnly),
        unreadCount(userId),
      ]);
      setItems(list || []);
      setCount(Number(c) || 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load notifications");
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  // Realtime SSE
  useEffect(() => {
    const userId = getUserId();
    if (stopRef.current) stopRef.current();

    stopRef.current = connectNotificationStream(userId, async () => {
      // on every push: refresh list + unread count
      await load();
    });

    return () => {
      if (stopRef.current) stopRef.current();
      stopRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  async function onMarkRead(id: string) {
    setError(null);
    try {
      await markRead(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Mark read failed");
    }
  }

  async function onMarkAll() {
    setError(null);
    try {
      await markAllRead(getUserId());
      await load();
    } catch (e: any) {
      setError(e?.message || "Mark all read failed");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await deleteNotification(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    }
  }

  return (
    <div className="notiPage">
      <div className="notiHeader">
        <div className="left">
          <button className="btn" onClick={() => nav("/")}>← Back</button>
          <h2 className="title">Notifications</h2>
          <div className="sub">Unread: <b>{count}</b></div>
        </div>

        <div className="right">
          <label className="toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            Unread only
          </label>

          <button className="btn" onClick={load} disabled={loading}>Refresh</button>
          <button className="btnPrimary" onClick={onMarkAll} disabled={loading}>Mark all read</button>
        </div>
      </div>

      {error && (
        <div className="alertError">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="card">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card">No notifications</div>
      ) : (
        <div className="list">
          {items.map((n) => (
            <div key={n.id} className={`notiCard ${n.read ? "read" : "unread"}`}>
              <div className="notiTop">
                <div className="notiTitle">{n.title || n.type || "Notification"}</div>
                <div className="notiTime">{fmtTime(n.createdAt)}</div>
              </div>

              <div className="notiMsg">{n.message || n.content || "(no message)"}</div>

              <div className="notiActions">
                {!n.read && (
                  <button className="btn" onClick={() => onMarkRead(n.id)}>Mark read</button>
                )}
                <button className="btn" onClick={() => onDelete(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
