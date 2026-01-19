import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8083/api/public'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens if needed
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const syllabusService = {
  // Tìm kiếm giáo trình
  search: (query, page = 0, size = 20) =>
    api.get('/syllabi/search', { params: { q: query, page, size } }),

  // Lấy chi tiết giáo trình
  getDetail: (id) =>
    api.get(`/syllabi/${id}`),

  // Lấy sơ đồ cây môn học
  getTree: (id) =>
    api.get(`/syllabi/${id}/tree`),

  // So sánh 2 phiên bản
  getDiff: (id, targetVersion) =>
    api.get(`/syllabi/${id}/diff`, { params: { targetVersion } }),

  // Xuất PDF
  exportPdf: (id) =>
    api.get(`/syllabi/${id}/export-pdf`, { responseType: 'blob' }),

  // Theo dõi/unfollow giáo trình
  follow: (id, userId, email) =>
    api.post(`/syllabi/${id}/follow`, null, {
      params: { userId, email },
    }),

  unfollow: (id, userId) =>
    api.delete(`/syllabi/${id}/follow`, { params: { userId } }),

  // Gửi phản hồi
  submitFeedback: (feedback) =>
    api.post('/feedback', feedback),
}

export default api
