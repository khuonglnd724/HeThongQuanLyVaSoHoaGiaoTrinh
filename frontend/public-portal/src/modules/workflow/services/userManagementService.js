import apiClient from '@/services/api/apiClient';

const userManagementAPI = {
  getAllUsers: (filter) => apiClient.get('/api/workflow/users', { params: filter }),
  getUserDetails: (userId) => apiClient.get(`/api/workflow/users/${userId}`),
  createUser: (data) => apiClient.post('/api/workflow/users', data),
  updateUser: (userId, data) => apiClient.put(`/api/workflow/users/${userId}`, data),
  deleteUser: (userId) => apiClient.delete(`/api/workflow/users/${userId}`),
  bulkCreateUsers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/workflow/users/bulk-import', formData);
  },
  resetPassword: (userId) => apiClient.post(`/api/workflow/users/${userId}/reset-password`),
  activateUser: (userId) => apiClient.post(`/api/workflow/users/${userId}/activate`),
  deactivateUser: (userId) => apiClient.post(`/api/workflow/users/${userId}/deactivate`),
};

export default userManagementAPI;
