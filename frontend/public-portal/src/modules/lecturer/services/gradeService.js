import apiClient from '@/services/api/apiClient';

const gradeAPI = {
  getStudents: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/students`),
  submitGrades: (classId, data) => apiClient.post(`/api/lecturer/classes/${classId}/grades`, data),
  getGradesSubmitted: (classId) => apiClient.get(`/api/lecturer/classes/${classId}/grades`),
  updateGrade: (gradeId, score) => apiClient.put(`/api/lecturer/grades/${gradeId}`, { score }),
  lockGrades: (classId) => apiClient.post(`/api/lecturer/classes/${classId}/grades/lock`),
  finalizeGrades: (classId) => apiClient.post(`/api/lecturer/classes/${classId}/grades/finalize`),
};

export default gradeAPI;
