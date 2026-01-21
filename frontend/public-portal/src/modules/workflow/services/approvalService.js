import apiClient from '@/services/api/apiClient';

const approvalAPI = {
  getApprovals: (filter) => apiClient.get('/api/workflow/approvals', { params: filter }),
  getApprovalDetails: (id) => apiClient.get(`/api/workflow/approvals/${id}`),
  approve: (id, comment) => apiClient.post(`/api/workflow/approvals/${id}/approve`, { comment }),
  reject: (id, comment) => apiClient.post(`/api/workflow/approvals/${id}/reject`, { comment }),
  reassign: (id, userId) => apiClient.post(`/api/workflow/approvals/${id}/reassign`, { userId }),
  getApprovalStats: () => apiClient.get('/api/workflow/approvals/stats'),
};

export default approvalAPI;
