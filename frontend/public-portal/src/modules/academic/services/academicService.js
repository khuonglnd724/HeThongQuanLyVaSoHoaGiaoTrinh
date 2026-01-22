import apiClient from '../../../services/api/apiClient';

// Academic module API client aligned with academic-service backend
const academicAPI = {
  // ============ SYLLABUS ============
  getSyllabuses: () => apiClient.get('/api/academic/syllabus'),
  getSyllabusById: (id) => apiClient.get(`/api/academic/syllabus/${id}`),
  getSyllabusesBySubject: (subjectId) => apiClient.get(`/api/academic/syllabus/subject/${subjectId}`),
  getSyllabusesByStatus: (status) => apiClient.get(`/api/academic/syllabus/status/${status}`),
  getSyllabusesByApprovalStatus: (approvalStatus) =>
    apiClient.get(`/api/academic/syllabus/approval-status/${approvalStatus}`),
  getSyllabusesByProgram: (programId) => apiClient.get(`/api/academic/syllabus/program/${programId}`),
  createSyllabus: (data) => apiClient.post('/api/academic/syllabus', data),
  updateSyllabus: (id, data) => apiClient.put(`/api/academic/syllabus/${id}`, data),
  updateApprovalStatus: (id, approvalStatus, approvedBy, comments) =>
    apiClient.patch(`/api/academic/syllabus/${id}/approve`, null, {
      params: { approvalStatus, approvedBy, comments },
    }),
  deleteSyllabus: (id) => apiClient.delete(`/api/academic/syllabus/${id}`),

  // Validation
  validateForApproval: (id) => apiClient.get(`/api/academic/syllabus/${id}/validate-approval`),
  validatePrerequisites: (id) => apiClient.get(`/api/academic/syllabus/${id}/validate-prerequisites`),

  // Versioning
  getVersionHistory: (id) => apiClient.get(`/api/academic/syllabus/${id}/versions`),
  getVersion: (id, versionNumber) =>
    apiClient.get(`/api/academic/syllabus/${id}/versions/${versionNumber}`),
  getLatestVersion: (id) => apiClient.get(`/api/academic/syllabus/${id}/versions/latest`),
  compareVersions: (id, version1, version2) =>
    apiClient.get('/api/academic/syllabus/${id}/compare', {
      params: { version1, version2 },
    }),

  // ============ PROGRAM ============
  getPrograms: () => apiClient.get('/api/academic/program'),
  getProgramById: (id) => apiClient.get(`/api/academic/program/${id}`),
  getProgramByCode: (code) => apiClient.get(`/api/academic/program/code/${code}`),
  getProgramsByDepartment: (departmentId) =>
    apiClient.get(`/api/academic/program/department/${departmentId}`),
  searchPrograms: (name) => apiClient.get('/api/academic/program/search', { params: { name } }),
  createProgram: (data) => apiClient.post('/api/academic/program', data),
  updateProgram: (id, data) => apiClient.put(`/api/academic/program/${id}`, data),
  deleteProgram: (id) => apiClient.delete(`/api/academic/program/${id}`),
  getCurriculumTree: (programId) =>
    apiClient.get(`/api/academic/program/${programId}/curriculum`),
  getDashboardStats: (programId) =>
    apiClient.get(`/api/academic/program/${programId}/dashboard`),

  // ============ SUBJECT ============
  getSubjects: () => apiClient.get('/api/academic/subject'),
  getSubjectById: (id) => apiClient.get(`/api/academic/subject/${id}`),
  getSubjectsByProgram: (programId) =>
    apiClient.get(`/api/academic/subject/program/${programId}`),
  getSubjectsByProgramAndSemester: (programId, semester) =>
    apiClient.get(`/api/academic/subject/program/${programId}/semester/${semester}`),
  createSubject: (data) => apiClient.post('/api/academic/subject', data),
  updateSubject: (id, data) => apiClient.put(`/api/academic/subject/${id}`, data),
  deleteSubject: (id) => apiClient.delete(`/api/academic/subject/${id}`),

  // ============ CLO ============
  getCloById: (id) => apiClient.get(`/api/academic/clo/${id}`),
  getClosBySubject: (subjectId) => apiClient.get(`/api/academic/clo/subject/${subjectId}`),
  getClosBySyllabus: (syllabusId) => apiClient.get(`/api/academic/clo/syllabus/${syllabusId}`),
  getAllClos: () => apiClient.get('/api/academic/clo'),
  searchClos: (code) => apiClient.get('/api/academic/clo/search', { params: { code } }),
  createClo: (data) => apiClient.post('/api/academic/clo', data),
  updateClo: (id, data) => apiClient.put(`/api/academic/clo/${id}`, data),
  deleteClo: (id) => apiClient.delete(`/api/academic/clo/${id}`),

  // ============ PLO ============
  getPlos: () => apiClient.get('/api/academic/plo'),
  getPloById: (id) => apiClient.get(`/api/academic/plo/${id}`),
  getPlosByProgram: (programId) => apiClient.get(`/api/academic/plo/program/${programId}`),
  searchPlos: (code) => apiClient.get('/api/academic/plo/search', { params: { code } }),
  createPlo: (data) => apiClient.post('/api/academic/plo', data),
  updatePlo: (id, data) => apiClient.put(`/api/academic/plo/${id}`, data),
  deletePlo: (id) => apiClient.delete(`/api/academic/plo/${id}`),

  // ============ CLO-PLO MAPPING ============
  getMappingById: (id) => apiClient.get(`/api/academic/mapping/${id}`),
  getMappingsByClo: (cloId) => apiClient.get(`/api/academic/mapping/clo/${cloId}`),
  getMappingsByPlo: (ploId) => apiClient.get(`/api/academic/mapping/plo/${ploId}`),
  getMappingsByProgram: (programId) =>
    apiClient.get(`/api/academic/mapping/program/${programId}`),
  getAllMappings: () => apiClient.get('/api/academic/mapping'),
  createMapping: (data) => apiClient.post('/api/academic/mapping', data),
  updateMapping: (id, data) => apiClient.put(`/api/academic/mapping/${id}`, data),
  deleteMapping: (id) => apiClient.delete(`/api/academic/mapping/${id}`),
};

export default academicAPI;
