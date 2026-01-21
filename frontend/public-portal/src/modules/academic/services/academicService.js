import apiClient from '@/services/api/apiClient';

const academicAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/api/academic/dashboard'),
  
  // Syllabi Approval
  getSyllabusRequests: (filter) => apiClient.get('/api/academic/syllabi/requests', { params: filter }),
  getSyllabusDetails: (id) => apiClient.get(`/api/academic/syllabi/${id}`),
  approveSyllabus: (id, comment) => apiClient.post(`/api/academic/syllabi/${id}/approve`, { comment }),
  rejectSyllabus: (id, comment) => apiClient.post(`/api/academic/syllabi/${id}/reject`, { comment }),
  
  // Academic Calendar
  getCalendar: () => apiClient.get('/api/academic/calendar'),
  updateCalendar: (data) => apiClient.put('/api/academic/calendar', data),
  getSemesters: () => apiClient.get('/api/academic/semesters'),
  createSemester: (data) => apiClient.post('/api/academic/semesters', data),
  
  // Departments
  getDepartments: () => apiClient.get('/api/academic/departments'),
  getDepartmentDetails: (deptId) => apiClient.get(`/api/academic/departments/${deptId}`),
  updateDepartment: (deptId, data) => apiClient.put(`/api/academic/departments/${deptId}`, data),
  
  // Programs
  getPrograms: () => apiClient.get('/api/academic/programs'),
  createProgram: (data) => apiClient.post('/api/academic/programs', data),
  updateProgram: (id, data) => apiClient.put(`/api/academic/programs/${id}`, data),
  
  // Reports
  getAcademicReports: () => apiClient.get('/api/academic/reports'),
  generateReport: (type) => apiClient.post('/api/academic/reports/generate', { type }),
};

export default academicAPI;
