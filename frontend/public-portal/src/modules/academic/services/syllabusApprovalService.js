/**
 * Syllabus Approval Service
 * Handles approval workflow using Syllabus Service endpoints from API_REFERENCE.md
 * 
 * Workflow:
 * - Lecturer creates/edits syllabus (DRAFT)
 * - Lecturer submits for review → /api/syllabuses/{id}/submit (PENDING_REVIEW)
 * - HOD reviews → /api/syllabuses/{id}/review-approve (PENDING_APPROVAL)
 * - AA/Rector approves → /api/syllabuses/{id}/approve (APPROVED)
 * - Rector publishes → /api/syllabuses/{id}/publish (PUBLISHED)
 */

import apiClient from '../../../services/api/apiClient'

const syllabusApprovalService = {
  // Lấy danh sách syllabus chờ review (PENDING_REVIEW) hoặc chờ phê duyệt (PENDING_APPROVAL)
  getPendingForReview: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, status: 'PENDING_REVIEW', size: 100 }
      })
      console.log('[syllabusApprovalService] getPendingForReview response:', response.data)
      // Handle multiple possible response shapes:
      // - Direct array
      // - Spring Page: { content: [...] }
      // - Wrapped: { data: { content: [...] } } or { data: [...] }
      // - HATEOAS: { _embedded: { syllabuses: [...] } }
      const data = response.data
      let items = []

      if (!data) return []

      if (Array.isArray(data)) {
        items = data
      } else if (data.content && Array.isArray(data.content)) {
        items = data.content
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data
      } else if (data.data && data.data.content && Array.isArray(data.data.content)) {
        items = data.data.content
      } else if (data._embedded && Array.isArray(data._embedded.syllabuses)) {
        items = data._embedded.syllabuses
      } else if (Array.isArray(data.items)) {
        items = data.items
      } else if (Array.isArray(data.results)) {
        items = data.results
      }

      if (items.length > 0) {
        console.log('[syllabusApprovalService] Parsed items count:', items.length)
        return items
      }

      // No items found — log full response for debugging
      console.warn('[syllabusApprovalService] No items parsed from response:', data)
      return []
    } catch (error) {
      console.error('Error fetching pending for review:', error)
      throw error
    }
  },

  getPendingForApproval: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, status: 'PENDING_APPROVAL', size: 100 }
      })
      console.log('[syllabusApprovalService] getPendingForApproval response:', response.data)
      const data = response.data
      let items = []

      if (!data) return []

      if (Array.isArray(data)) {
        items = data
      } else if (data.content && Array.isArray(data.content)) {
        items = data.content
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data
      } else if (data.data && data.data.content && Array.isArray(data.data.content)) {
        items = data.data.content
      } else if (data._embedded && Array.isArray(data._embedded.syllabuses)) {
        items = data._embedded.syllabuses
      } else if (Array.isArray(data.items)) {
        items = data.items
      } else if (Array.isArray(data.results)) {
        items = data.results
      }

      if (items.length > 0) {
        console.log('[syllabusApprovalService] Parsed items count:', items.length)
        return items
      }

      console.warn('[syllabusApprovalService] No items parsed from response:', data)
      return []
    } catch (error) {
      console.error('Error fetching pending for approval:', error)
      throw error
    }
  },

  // Chi tiết syllabus
  getDetails: async (id) => {
    try {
      const response = await apiClient.get(`/api/syllabuses/${id}`)
      console.log('[syllabusApprovalService] getDetails response for id', id, ':', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching syllabus details:', error)
      throw error
    }
  },

  // Lấy lịch sử phiên bản
  getVersionHistory: async (rootId) => {
    try {
      const response = await apiClient.get(`/api/syllabuses/${rootId}/versions`)
      return response
    } catch (error) {
      console.error('Error fetching version history:', error)
      throw error
    }
  },

  // HOD/ACADEMIC_AFFAIRS review & send to next approval level
  // PENDING_REVIEW → PENDING_APPROVAL
  reviewApprove: async (id, userId) => {
    try {
      const response = await apiClient.post(
        `/api/syllabuses/${id}/review-approve`,
        {},
        { headers: { 'X-User-Id': userId } }
      )
      return response
    } catch (error) {
      console.error('Error in review-approve:', error)
      throw error
    }
  },

  // ACADEMIC_AFFAIRS/RECTOR approve
  // PENDING_APPROVAL → APPROVED
  approve: async (id, userId, comment = '') => {
    try {
      const response = await apiClient.post(
        `/api/syllabuses/${id}/approve`,
        { comment },
        { headers: { 'X-User-Id': userId } }
      )
      return response
    } catch (error) {
      console.error('Error in approve:', error)
      throw error
    }
  },

  // Reject syllabus (any stage)
  reject: async (id, userId, reason = '') => {
    try {
      const response = await apiClient.post(
        `/api/syllabuses/${id}/reject`,
        { reason },
        { headers: { 'X-User-Id': userId } }
      )
      return response
    } catch (error) {
      console.error('Error in reject:', error)
      throw error
    }
  },

  // RECTOR publish (APPROVED → PUBLISHED)
  publish: async (id, userId) => {
    try {
      const response = await apiClient.post(
        `/api/syllabuses/${id}/publish`,
        {},
        { headers: { 'X-User-Id': userId } }
      )
      return response
    } catch (error) {
      console.error('Error in publish:', error)
      throw error
    }
  },

  // Revise syllabus (REJECTED → DRAFT for lecturer to re-edit)
  revise: async (id, userId) => {
    try {
      const response = await apiClient.post(
        `/api/syllabuses/${id}/revise`,
        {},
        { headers: { 'X-User-Id': userId } }
      )
      return response
    } catch (error) {
      console.error('Error in revise:', error)
      throw error
    }
  },

  // Get APPROVED syllabuses (ready for publishing)
  getApproved: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, status: 'APPROVED', size: params.size || 100 }
      })
      console.log('[syllabusApprovalService] getApproved response:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching approved syllabuses:', error)
      throw error
    }
  },

  // Get DRAFT syllabuses
  getDraft: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, status: 'DRAFT', size: params.size || 100 }
      })
      console.log('[syllabusApprovalService] getDraft response:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching draft syllabuses:', error)
      throw error
    }
  },

  // Get REVIEW syllabuses (pending review)
  getReview: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, status: 'REVIEW', size: params.size || 100 }
      })
      console.log('[syllabusApprovalService] getReview response:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching review syllabuses:', error)
      throw error
    }
  },

  // Get REJECTED syllabuses
  getRejected: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, status: 'REJECTED', size: params.size || 100 }
      })
      console.log('[syllabusApprovalService] getRejected response:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching rejected syllabuses:', error)
      throw error
    }
  },

  // Get all syllabuses (no status filter)
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', {
        params: { ...params, size: params.size || 100 }
      })
      console.log('[syllabusApprovalService] getAll response:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching all syllabuses:', error)
      throw error
    }
  }
}

export default syllabusApprovalService
