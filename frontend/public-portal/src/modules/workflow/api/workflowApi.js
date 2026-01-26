import apiClient from '../../../services/api/apiClient'

const workflowApi = {
  getPending: () =>
    apiClient.get('/api/workflows', {
      params: { state: 'REVIEW' },
    }),

  getAll: () => apiClient.get('/api/workflows'),

  getReview: (workflowId) =>
    apiClient.get(`/api/workflows/${workflowId}/review`),

  approve: (workflowId, params) =>
    apiClient.post(`/api/workflows/${workflowId}/approve`, null, { params }),

  reject: (workflowId, params, body) =>
    apiClient.post(`/api/workflows/${workflowId}/reject`, body, { params }),

  requireEdit: (workflowId, params, body) =>
    apiClient.post(`/api/workflows/${workflowId}/require-edit`, body, { params }),

  getHistory: (workflowId) => apiClient.get(`/api/workflows/${workflowId}/history`),
}

export default workflowApi
