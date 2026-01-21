import apiClient from '@/services/api/apiClient';

const academicCalendarAPI = {
  getCalendar: () => apiClient.get('/api/academic/calendar'),
  updateCalendar: (data) => apiClient.put('/api/academic/calendar', data),
  getSemesters: () => apiClient.get('/api/academic/semesters'),
  createSemester: (data) => apiClient.post('/api/academic/semesters', data),
  updateSemester: (id, data) => apiClient.put(`/api/academic/semesters/${id}`, data),
  getHolidays: () => apiClient.get('/api/academic/holidays'),
  addHoliday: (data) => apiClient.post('/api/academic/holidays', data),
};

export default academicCalendarAPI;
