// Academic Module - Entry Point
export { default as AcademicLayout } from './layouts/AcademicLayout';

// Pages
export { default as AcademicDashboard } from './pages/AcademicDashboard';
export { default as HODDashboard } from './pages/HODDashboard';
export { default as RectorDashboard } from './pages/RectorDashboard';
export { default as SyllabusApproval } from './pages/SyllabusApproval';
export { default as AcademicCalendarMgmt } from './pages/AcademicCalendarMgmt';
export { default as DepartmentManagement } from './pages/DepartmentManagement';
export { default as ProgramManagement } from './pages/ProgramManagement';
export { default as AcademicReports } from './pages/AcademicReports';

// Hooks
export { useAcademicDashboard } from './hooks/useAcademicDashboard';
export { useSyllabusApproval } from './hooks/useSyllabusApproval';
export { useAcademicCalendar } from './hooks/useAcademicCalendar';

// Services
export { default as academicService } from './services/academicService';
export { default as syllabusApprovalService } from './services/syllabusApprovalService';
export { default as academicCalendarService } from './services/academicCalendarService';
export { default as departmentService } from './services/departmentService';
export { default as programService } from './services/programService';
