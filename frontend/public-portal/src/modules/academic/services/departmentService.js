import apiClient from '@/services/api/apiClient';

const departmentAPI = {
  getDepartments: () => apiClient.get('/api/academic/departments'),
  getDetails: (id) => apiClient.get(`/api/academic/departments/${id}`),
  update: (id, data) => apiClient.put(`/api/academic/departments/${id}`, data),
  getFaculty: (deptId) => apiClient.get(`/api/academic/departments/${deptId}/faculty`),
};

export default departmentAPI;
