import apiClient from '@/services/api/apiClient';

// Syllabus approval API using academic-service SyllabusController via gateway
const syllabusApprovalAPI = {
  // Lấy danh sách syllabus đang chờ duyệt (approvalStatus = PENDING)
  getRequests: (filter) =>
    apiClient.get('/api/academic/syllabus/approval-status/PENDING', { params: filter }),

  // Chi tiết syllabus
  getDetails: (id) => apiClient.get(`/api/academic/syllabus/${id}`),

  // Duyệt syllabus (APPROVED)
  approve: (id, comment, approvedBy) =>
    apiClient.patch(`/api/academic/syllabus/${id}/approve`, null, {
      params: {
        approvalStatus: 'APPROVED',
        comments: comment,
        approvedBy,
      },
    }),

  // Từ chối syllabus (REJECTED)
  reject: (id, comment, approvedBy) =>
    apiClient.patch(`/api/academic/syllabus/${id}/approve`, null, {
      params: {
        approvalStatus: 'REJECTED',
        comments: comment,
        approvedBy,
      },
    }),
};

export default syllabusApprovalAPI;
