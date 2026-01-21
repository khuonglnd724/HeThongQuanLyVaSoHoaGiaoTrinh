import apiClient from '@/services/api/apiClient';

const syllabusApprovalAPI = {
  getRequests: (filter) => apiClient.get('/api/academic/syllabi/requests', { params: filter }),
  getDetails: (id) => apiClient.get(`/api/academic/syllabi/${id}`),
  approve: (id, comment) => apiClient.post(`/api/academic/syllabi/${id}/approve`, { comment }),
  reject: (id, comment) => apiClient.post(`/api/academic/syllabi/${id}/reject`, { comment }),
  requestRevisions: (id, comment) => apiClient.post(`/api/academic/syllabi/${id}/request-revisions`, { comment }),
  getStats: () => apiClient.get('/api/academic/syllabi/stats'),
};

export default syllabusApprovalAPI;
