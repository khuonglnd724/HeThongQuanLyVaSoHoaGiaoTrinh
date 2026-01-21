import apiClient from '@/services/api/apiClient';

const lecturerAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/api/lecturer/dashboard'),
  
  // Syllabi
  getSyllabi: () => apiClient.get('/api/lecturer/syllabi'),
  createSyllabus: (data) => apiClient.post('/api/lecturer/syllabi', data),
  updateSyllabus: (id, data) => apiClient.put(`/api/lecturer/syllabi/${id}`, data),
  deleteSyllabus: (id) => apiClient.delete(`/api/lecturer/syllabi/${id}`),
  submitSyllabusForApproval: (id) => apiClient.post(`/api/lecturer/syllabi/${id}/submit`),
  
  // Classes
  getClasses: () => apiClient.get('/api/lecturer/classes'),
  getClassDetails: (classId) => apiClient.get(`/api/lecturer/classes/${classId}`),
  updateClass: (classId, data) => apiClient.put(`/api/lecturer/classes/${classId}`, data),
  
  // Attendance
  getAttendance: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/attendance`),
  markAttendance: (classId, data) => apiClient.post(`/api/lecturer/classes/${classId}/attendance`, data),
  getAttendanceReport: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/attendance/report`),
  
  // Grades
  getStudents: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/students`),
  submitGrades: (classId, data) => apiClient.post(`/api/lecturer/classes/${classId}/grades`, data),
  getGradesSubmitted: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/grades`),
  
  // Assignments
  createAssignment: (classId, data) => apiClient.post(`/api/lecturer/classes/${classId}/assignments`, data),
  getAssignmentSubmissions: (assignmentId) => apiClient.get(`/api/lecturer/assignments/${assignmentId}/submissions`),
  gradeAssignment: (submissionId, score) => apiClient.post(`/api/lecturer/submissions/${submissionId}/grade`, { score }),
};

export default lecturerAPI;
