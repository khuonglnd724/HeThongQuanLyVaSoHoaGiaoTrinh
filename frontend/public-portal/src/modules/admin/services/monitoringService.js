import apiClient from '@/services/api/apiClient';

const monitoringAPI = {
  getServerStatus: () => apiClient.get('/api/admin/system/status'),
  getMetrics: (timeRange) => apiClient.get('/api/admin/system/metrics', { params: { timeRange } }),
  getCPUMetrics: () => apiClient.get('/api/admin/system/metrics/cpu'),
  getMemoryMetrics: () => apiClient.get('/api/admin/system/metrics/memory'),
  getDiskMetrics: () => apiClient.get('/api/admin/system/metrics/disk'),
  getNetworkMetrics: () => apiClient.get('/api/admin/system/metrics/network'),
};

export default monitoringAPI;
