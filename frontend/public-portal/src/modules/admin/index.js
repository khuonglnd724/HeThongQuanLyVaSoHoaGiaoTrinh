// Admin Module (System Admin) - Entry Point
export { default as AdminLayout } from './layouts/AdminLayout';

// Pages
export { default as SystemDashboard } from './pages/SystemDashboard';
export { default as ServerMonitoring } from './pages/ServerMonitoring';
export { default as LogsViewer } from './pages/LogsViewer';
export { default as BackupManagement } from './pages/BackupManagement';
export { default as HealthCheck } from './pages/HealthCheck';
export { default as Configuration } from './pages/Configuration';

// Hooks
export { useRealTimeMonitoring } from './hooks/useRealTimeMonitoring';
export { useSystemHealth } from './hooks/useSystemHealth';
export { useBackupManagement } from './hooks/useBackupManagement';

// Services
export { default as systemService } from './services/systemService';
export { default as monitoringService } from './services/monitoringService';
export { default as logsService } from './services/logsService';
export { default as backupService } from './services/backupService';
