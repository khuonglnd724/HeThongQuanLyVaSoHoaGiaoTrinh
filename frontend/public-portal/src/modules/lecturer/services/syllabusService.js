import apiClient from '@/services/api/apiClient';

const syllabusAPI = {
  create: (data) => apiClient.post('/api/lecturer/syllabi', data),
  update: (id, data) => apiClient.put(`/api/lecturer/syllabi/${id}`, data),
  get: (id) => apiClient.get(`/api/lecturer/syllabi/${id}`),
  delete: (id) => apiClient.delete(`/api/lecturer/syllabi/${id}`),
  submit: (id) => apiClient.post(`/api/lecturer/syllabi/${id}/submit`),
  getDraft: () => apiClient.get('/api/lecturer/syllabi/draft'),
  publishDraft: (id) => apiClient.post(`/api/lecturer/syllabi/${id}/publish`),
};

export default syllabusAPI;
