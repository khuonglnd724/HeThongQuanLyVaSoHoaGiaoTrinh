// Student Module - Entry Point
export { default as StudentLayout } from './layouts/StudentLayout';

// Pages
export { default as StudentDashboard } from './pages/StudentDashboard';
export { default as EnrolledClasses } from './pages/EnrolledClasses';
export { default as GradesView } from './pages/GradesView';
export { default as ViewSyllabi } from './pages/ViewSyllabi';

// Hooks
export { useStudentDashboard } from './hooks/useStudentDashboard';
export { useEnrollments } from './hooks/useEnrollments';
export { useGrades } from './hooks/useGrades';

// Services
export { default as studentService } from './services/studentService';
