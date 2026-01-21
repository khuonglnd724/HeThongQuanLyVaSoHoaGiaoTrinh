// Workflow Module (Admin Portal) - Entry Point
export { default as WorkflowLayout } from './layouts/WorkflowLayout';

// Pages
export { default as AdminDashboard } from './pages/AdminDashboard';
export { default as UserManagement } from './pages/UserManagement';
export { default as SyllabusApprovalWorkflow } from './pages/SyllabusApprovalWorkflow';
export { default as ApprovalQueue } from './pages/ApprovalQueue';
export { default as AdminReports } from './pages/AdminReports';
export { default as AdminSettings } from './pages/AdminSettings';

// Hooks
export { useWorkflowDashboard } from './hooks/useWorkflowDashboard';
export { useUserManagement } from './hooks/useUserManagement';
export { useApprovalQueue } from './hooks/useApprovalQueue';

// Services
export { default as workflowService } from './services/workflowService';
export { default as userManagementService } from './services/userManagementService';
export { default as approvalService } from './services/approvalService';
