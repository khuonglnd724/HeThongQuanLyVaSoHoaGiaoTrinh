// Lecturer Module - Entry Point
export { default as LecturerLayout } from './layouts/LecturerLayout';

// Pages
export { default as LecturerDashboard } from './pages/LecturerDashboard';
export { default as SyllabusBuilder } from './pages/SyllabusBuilder';
export { default as ClassManagement } from './pages/ClassManagement';
export { default as AttendanceTracking } from './pages/AttendanceTracking';
export { default as GradeManagement } from './pages/GradeManagement';

// Hooks
export { useLecturerDashboard } from './hooks/useLecturerDashboard';
export { useSyllabusBuilder } from './hooks/useSyllabusBuilder';
export { useClassManagement } from './hooks/useClassManagement';
export { useGradeManagement } from './hooks/useGradeManagement';

// Services
export { default as lecturerService } from './services/lecturerService';
export { default as syllabusService } from './services/syllabusService';
export { default as classService } from './services/classService';
export { default as gradeService } from './services/gradeService';
