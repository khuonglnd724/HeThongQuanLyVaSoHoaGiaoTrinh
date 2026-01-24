import apiClient from '../../../services/api/apiClient';

const studentAPI = {
  // Dashboard - mock data until backend implements student-service
  getDashboard: async () => {
    try {
      return await apiClient.get('/api/student/dashboard');
    } catch (err) {
      // Fallback to mock data if endpoint not available
      console.warn('[studentAPI] Dashboard endpoint not available, using mock data');
      return {
        data: {
          syllabiCount: 8,
          averageGrade: 7.8,
          progressPercent: 72
        }
      };
    }
  },
  
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
