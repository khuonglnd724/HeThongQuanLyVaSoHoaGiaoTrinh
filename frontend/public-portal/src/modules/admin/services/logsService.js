import apiClient from '../../../services/api/apiClient';

const logsAPI = {
  getLogs: (filter) => apiClient.get('/api/admin/system/logs', { params: filter }),
  getLogDetails: (id) => apiClient.get(`/api/admin/system/logs/${id}`),
  exportLogs: (format = 'csv') => apiClient.get('/api/admin/system/logs/export', { params: { format } }),
  clearLogs: () => apiClient.post('/api/admin/system/logs/clear'),
  getLogStats: () => apiClient.get('/api/admin/system/logs/stats'),
};

export default logsAPI;
