import apiClient from '@/services/api/apiClient';

const workflowAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/api/workflow/dashboard'),
  
  // Users
  getAllUsers: (filter) => apiClient.get('/api/workflow/users', { params: filter }),
  getUserDetails: (userId) => apiClient.get(`/api/workflow/users/${userId}`),
  createUser: (data) => apiClient.post('/api/workflow/users', data),
  updateUser: (userId, data) => apiClient.put(`/api/workflow/users/${userId}`, data),
  deleteUser: (userId) => apiClient.delete(`/api/workflow/users/${userId}`),
  resetUserPassword: (userId) => apiClient.post(`/api/workflow/users/${userId}/reset-password`),
  
  // Approvals
  getApprovals: (filter) => apiClient.get('/api/workflow/approvals', { params: filter }),
  approveRequest: (id, comment) => apiClient.post(`/api/workflow/approvals/${id}/approve`, { comment }),
  rejectRequest: (id, comment) => apiClient.post(`/api/workflow/approvals/${id}/reject`, { comment }),
  
  // Syllabi
  getSyllabusRequests: (filter) => apiClient.get('/api/workflow/syllabi', { params: filter }),
  approveSyllabus: (id, comment) => apiClient.post(`/api/workflow/syllabi/${id}/approve`, { comment }),
  rejectSyllabus: (id, comment) => apiClient.post(`/api/workflow/syllabi/${id}/reject`, { comment }),
  
  // Reports
  getAdminReports: () => apiClient.get('/api/workflow/reports'),
  generateReport: (type) => apiClient.post('/api/workflow/reports/generate', { type }),
};

export default workflowAPI;
