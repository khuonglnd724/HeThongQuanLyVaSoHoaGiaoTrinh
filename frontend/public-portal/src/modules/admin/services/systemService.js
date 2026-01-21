import apiClient from '@/services/api/apiClient';

const systemAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/api/admin/system/dashboard'),
  
  // Monitoring
  getServerStatus: () => apiClient.get('/api/admin/system/status'),
  getMetrics: (timeRange = '1h') => apiClient.get('/api/admin/system/metrics', { params: { timeRange } }),
  getHealthCheck: () => apiClient.get('/api/admin/system/health'),
  
  // Logs
  getSystemLogs: (filter) => apiClient.get('/api/admin/system/logs', { params: filter }),
  clearLogs: () => apiClient.post('/api/admin/system/logs/clear'),
  
  // Backups
  getBackups: () => apiClient.get('/api/admin/system/backups'),
  createBackup: () => apiClient.post('/api/admin/system/backups'),
  restoreBackup: (id) => apiClient.post(`/api/admin/system/backups/${id}/restore`),
  deleteBackup: (id) => apiClient.delete(`/api/admin/system/backups/${id}`),
  
  // Configuration
  getConfiguration: () => apiClient.get('/api/admin/system/config'),
  updateConfiguration: (data) => apiClient.put('/api/admin/system/config', data),
  
  // System Actions
  restartServices: () => apiClient.post('/api/admin/system/restart'),
  shutdownServices: () => apiClient.post('/api/admin/system/shutdown'),
};

export default systemAPI;
