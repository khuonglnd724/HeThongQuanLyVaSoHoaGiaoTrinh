const BASE_URL =
  (import.meta as any).env?.VITE_SYLLABUS_API_URL || "http://localhost:8085";

/**
 * Kết nối SSE để nhận notification realtime.
 * Trả về hàm cleanup để đóng kết nối.
 */
export function connectNotificationStream(
  userId: string,
  onMessage: (payload: any) => void
) {
  const url = `${BASE_URL}/api/notifications/stream?userId=${encodeURIComponent(
    userId
  )}`;

  const es = new EventSource(url);

  es.addEventListener("notification", (evt: MessageEvent) => {
    try {
      onMessage(JSON.parse(evt.data));
    } catch {
      onMessage(evt.data);
    }
  });

  es.addEventListener("hello", () => {
    // optional
  });

  es.onerror = () => {
    // optional: bạn có thể log nếu muốn
    // console.warn("SSE error");
  };

  return () => {
    es.close();
  };
}
