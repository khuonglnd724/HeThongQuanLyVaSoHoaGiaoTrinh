import apiClient from '@/services/api/apiClient';

const backupAPI = {
  getBackups: () => apiClient.get('/api/admin/system/backups'),
  getBackupDetails: (id) => apiClient.get(`/api/admin/system/backups/${id}`),
  createBackup: () => apiClient.post('/api/admin/system/backups'),
  restoreBackup: (id) => apiClient.post(`/api/admin/system/backups/${id}/restore`),
  deleteBackup: (id) => apiClient.delete(`/api/admin/system/backups/${id}`),
  getBackupSchedule: () => apiClient.get('/api/admin/system/backups/schedule'),
  updateBackupSchedule: (data) => apiClient.put('/api/admin/system/backups/schedule', data),
};

export default backupAPI;
