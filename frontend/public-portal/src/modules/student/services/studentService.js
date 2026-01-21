import apiClient from '@/services/api/apiClient';

const studentAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/api/student/dashboard'),
  
  // Enrolled Classes
  getEnrolledClasses: () => apiClient.get('/api/student/classes'),
  getClassDetails: (classId) => apiClient.get(`/api/student/classes/${classId}`),
  
  // Grades
  getGrades: () => apiClient.get('/api/student/grades'),
  getGradesByClass: (classId) => apiClient.get(`/api/student/classes/${classId}/grades`),
  
  // Syllabi
  getEnrolledSyllabi: () => apiClient.get('/api/student/syllabi'),
  getSyllabusDetails: (syllabusId) => apiClient.get(`/api/student/syllabi/${syllabusId}`),
  
  // Assignments
  getAssignments: () => apiClient.get('/api/student/assignments'),
  submitAssignment: (assignmentId, data) => 
    apiClient.post(`/api/student/assignments/${assignmentId}/submit`, data),
  
  // Schedule
  getSchedule: () => apiClient.get('/api/student/schedule'),
};

export default studentAPI;
