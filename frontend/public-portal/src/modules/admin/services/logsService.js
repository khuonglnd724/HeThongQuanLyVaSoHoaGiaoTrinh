import apiClient from '../../../services/api/apiClient';

const logsAPI = {
  getAuditLogs: (params = {}) => apiClient.get('/api/system/audit-logs', { params }),
};

export default logsAPI;
