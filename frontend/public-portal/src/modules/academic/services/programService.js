import apiClient from '@/services/api/apiClient';

const programAPI = {
  getPrograms: () => apiClient.get('/api/academic/programs'),
  getDetails: (id) => apiClient.get(`/api/academic/programs/${id}`),
  create: (data) => apiClient.post('/api/academic/programs', data),
  update: (id, data) => apiClient.put(`/api/academic/programs/${id}`, data),
  delete: (id) => apiClient.delete(`/api/academic/programs/${id}`),
  getCourses: (programId) => apiClient.get(`/api/academic/programs/${programId}/courses`),
};

export default programAPI;
