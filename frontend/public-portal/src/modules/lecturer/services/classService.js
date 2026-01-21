import apiClient from '@/services/api/apiClient';

const classAPI = {
  getMyClasses: () => apiClient.get('/api/lecturer/classes'),
  getClassDetails: (classId) => apiClient.get(`/api/lecturer/classes/${classId}`),
  updateClass: (classId, data) => apiClient.put(`/api/lecturer/classes/${classId}`, data),
  getClassStudents: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/students`),
  addStudent: (classId, studentId) => apiClient.post(`/api/lecturer/classes/${classId}/students`, { studentId }),
  removeStudent: (classId, studentId) => apiClient.delete(`/api/lecturer/classes/${classId}/students/${studentId}`),
};

export default classAPI;
