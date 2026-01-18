import axios from "axios";

const baseURL =
  import.meta.env.VITE_SYLLABUS_API_URL || "http://localhost:8085";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const userId = localStorage.getItem("x_user_id") || "1";
  config.headers = config.headers || {};
  config.headers["X-User-Id"] = userId;
  return config;
});
