/**
 * Syllabus Service V2
 * Updated to match new API endpoints from API_REFERENCE
 */

import apiClient from '../../../services/api/apiClient'

const SYLLABUS_API_BASE = '/api/syllabuses'
const SYLLABUS_DOCUMENT_BASE = '/api/syllabus/documents'

const syllabusServiceV2 = {
  // ========== Syllabus List & Search ==========
  list: async (params = {}) => {
    const { q = '', status = 'ALL', page = 0, size = 20 } = params
    const queryParams = {}
    if (q) queryParams.q = q
    if (status && status !== 'ALL') queryParams.status = status
    queryParams.page = page
    queryParams.size = size

    return apiClient.get(SYLLABUS_API_BASE, { params: queryParams })
  },

  getById: async (id) => {
    return apiClient.get(`${SYLLABUS_API_BASE}/${id}`)
  },

  getVersions: async (rootId) => {
    return apiClient.get(`${SYLLABUS_API_BASE}/${rootId}/versions`)
  },

  compare: async (rootId, v1, v2) => {
    return apiClient.get(`${SYLLABUS_API_BASE}/${rootId}/compare`, {
      params: { v1, v2 }
    })
  },

  // ========== Create & Update ==========
  create: async (data, userId) => {
    const payload = {
      syllabusCode: data.syllabusCode,
      subjectId: data.subjectId,
      content: data.content, // JSON content
      description: data.description
    }
    return apiClient.post(SYLLABUS_API_BASE, payload, {
      headers: { 'X-User-Id': userId }
    })
  },

  createNewVersion: async (rootId, data, userId) => {
    const payload = {
      content: data.content,
      changes: data.changes
    }
    return apiClient.post(`${SYLLABUS_API_BASE}/${rootId}/versions`, payload, {
      headers: { 'X-User-Id': userId }
    })
  },

  // ========== Workflow ==========
  submit: async (id, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${id}/submit`, {}, {
      headers: { 'X-User-Id': userId }
    })
  },

  reviewApprove: async (id, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${id}/review-approve`, {}, {
      headers: { 'X-User-Id': userId }
    })
  },

  approve: async (id, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${id}/approve`, {}, {
      headers: { 'X-User-Id': userId }
    })
  },

  publish: async (id, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${id}/publish`, {}, {
      headers: { 'X-User-Id': userId }
    })
  },

  reject: async (id, reason, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${id}/reject`, 
      { reason }, 
      { headers: { 'X-User-Id': userId } }
    )
  },

  revise: async (id, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${id}/revise`, {}, {
      headers: { 'X-User-Id': userId }
    })
  },

  // ========== Follow ==========
  follow: async (rootId, userId) => {
    return apiClient.post(`${SYLLABUS_API_BASE}/${rootId}/follow`, {}, {
      headers: { 'X-User-Id': userId }
    })
  },

  unfollow: async (rootId, userId) => {
    return apiClient.delete(`${SYLLABUS_API_BASE}/${rootId}/follow`, {
      headers: { 'X-User-Id': userId }
    })
  },

  getFollowers: async (rootId) => {
    return apiClient.get(`${SYLLABUS_API_BASE}/${rootId}/followers`)
  },

  isFollowing: async (rootId, userId) => {
    return apiClient.get(`${SYLLABUS_API_BASE}/${rootId}/is-following`, {
      headers: { 'X-User-Id': userId }
    })
  },

  // ========== Documents ==========
  uploadDocument: async (syllabusId, file, title = '', description = '', userId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('syllabusId', syllabusId)
    if (title) formData.append('title', title)
    if (description) formData.append('description', description)

    // Do not set Content-Type header manually; let the browser set multipart boundary
    return apiClient.post(`${SYLLABUS_DOCUMENT_BASE}/upload`, formData, {
      headers: { 'X-User-Id': userId }
    })
  },

  getDocumentsBySyllabus: async (syllabusId) => {
    return apiClient.get(`${SYLLABUS_DOCUMENT_BASE}/syllabus/${syllabusId}`)
  },

  getDocumentsByVersion: async (syllabusId, version) => {
    return apiClient.get(`${SYLLABUS_DOCUMENT_BASE}/syllabus/${syllabusId}/version/${version}`)
  },

  getMyDocuments: async (userId) => {
    return apiClient.get(`${SYLLABUS_DOCUMENT_BASE}/my-documents`, {
      headers: { 'X-User-Id': userId }
    })
  },

  getDocumentInfo: async (documentId) => {
    return apiClient.get(`${SYLLABUS_DOCUMENT_BASE}/${documentId}`)
  },

  downloadDocument: async (documentId) => {
    return apiClient.get(`${SYLLABUS_DOCUMENT_BASE}/${documentId}/download`, {
      responseType: 'blob'
    })
  },

  deleteDocument: async (documentId, userId) => {
    return apiClient.delete(`${SYLLABUS_DOCUMENT_BASE}/${documentId}`, {
      headers: { 'X-User-Id': userId }
    })
  },

  getDocumentStatistics: async (syllabusId) => {
    return apiClient.get(`${SYLLABUS_DOCUMENT_BASE}/syllabus/${syllabusId}/statistics`)
  },

  // ========== Issues ==========
  createIssue: async (issueData, userId) => {
    return apiClient.post('/api/issues', issueData, {
      headers: { 'X-User-Id': userId }
    })
  },

  getIssues: async (params = {}) => {
    return apiClient.get('/api/issues', { params })
  },

  getIssueById: async (id) => {
    return apiClient.get(`/api/issues/${id}`)
  },

  updateIssueStatus: async (id, status, userId) => {
    return apiClient.put(`/api/issues/${id}/status`, { status }, {
      headers: { 'X-User-Id': userId }
    })
  },

  deleteIssue: async (id, userId) => {
    return apiClient.delete(`/api/issues/${id}`, {
      headers: { 'X-User-Id': userId }
    })
  },

  // ========== Review Comments ==========
  addReviewComment: async (commentData, userId) => {
    return apiClient.post('/api/review-comments', commentData, {
      headers: { 'X-User-Id': userId }
    })
  },

  getReviewComments: async (syllabusId) => {
    return apiClient.get(`/api/review-comments/syllabus/${syllabusId}`)
  },

  updateReviewComment: async (id, commentData, userId) => {
    return apiClient.put(`/api/review-comments/${id}`, commentData, {
      headers: { 'X-User-Id': userId }
    })
  },

  deleteReviewComment: async (id, userId) => {
    return apiClient.delete(`/api/review-comments/${id}`, {
      headers: { 'X-User-Id': userId }
    })
  },

  // ========== CLOs (Course Learning Outcomes) ==========
  createCLO: async (cloData) => {
    // POST /api/v1/clo
    // cloData: { cloCode, syllabusId, description, level }
    return apiClient.post('/api/v1/clo', cloData)
  },

  getCLOsBySyllabus: async (syllabusId) => {
    // GET /api/v1/clo/syllabus/{syllabusId}
    return apiClient.get(`/api/v1/clo/syllabus/${syllabusId}`)
  },

  getAllCLOs: async () => {
    // GET /api/v1/clo
    return apiClient.get('/api/v1/clo')
  },

  getCLOById: async (id) => {
    // GET /api/v1/clo/{id}
    return apiClient.get(`/api/v1/clo/${id}`)
  },

  updateCLO: async (id, cloData) => {
    // PUT /api/v1/clo/{id}
    return apiClient.put(`/api/v1/clo/${id}`, cloData)
  },

  deleteCLO: async (id) => {
    // DELETE /api/v1/clo/{id}
    return apiClient.delete(`/api/v1/clo/${id}`)
  },

  searchCLOs: async (code) => {
    // GET /api/v1/clo/search?code={code}
    return apiClient.get('/api/v1/clo/search', { params: { code } })
  }
}

export default syllabusServiceV2
