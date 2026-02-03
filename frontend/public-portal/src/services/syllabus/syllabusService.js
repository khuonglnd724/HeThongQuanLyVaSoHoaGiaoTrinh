// Syllabus Service - Handle syllabus API calls
import apiClient from '../api/apiClient'

export const syllabusService = {
  // Get all syllabi
  getAllSyllabi: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabuses', { params })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Get all error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch syllabi' }
    }
  },

  // Get syllabus by ID
  getSyllabusById: async (id) => {
    try {
      const response = await apiClient.get(`/api/syllabuses/${id}`)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Get by ID error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch syllabus' }
    }
  },

  // Create new syllabus
  createSyllabus: async (syllabusData) => {
    try {
      const response = await apiClient.post('/api/syllabuses', syllabusData)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Create error:', error)
      throw error.response?.data || { message: error.message || 'Failed to create syllabus' }
    }
  },

  // Update syllabus
  // Update implemented as creating a new version on the server
  updateSyllabus: async (rootId, syllabusData) => {
    try {
      const response = await apiClient.post(`/api/syllabuses/${rootId}/versions`, syllabusData)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Update (new version) error:', error)
      throw error.response?.data || { message: error.message || 'Failed to update syllabus' }
    }
  },

  // Delete syllabus
  deleteSyllabus: async (id) => {
    try {
      const response = await apiClient.delete(`/api/syllabuses/${id}`)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Delete error:', error)
      throw error.response?.data || { message: error.message || 'Failed to delete syllabus' }
    }
  },

  // Get syllabi by lecturer
  getSyllabiByLecturer: async (lecturerId) => {
    try {
      // backend does not expose a dedicated "by-lecturer" endpoint; fetch and filter client-side
      const response = await apiClient.get('/api/syllabuses', { params: { size: 200 } })
      const data = response.data
      const list = data?.content || data || []
      return list.filter((s) => String(s.createdBy) === String(lecturerId))
    } catch (error) {
      console.error('Syllabus Service - Get by lecturer error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch lecturer syllabi' }
    }
  },

  // Get pending syllabi (for approval)
  getPendingSyllabi: async () => {
    try {
      const response = await apiClient.get('/api/syllabuses', { params: { status: 'PENDING_REVIEW', size: 200 } })
      const data = response.data
      return data?.content || data || []
    } catch (error) {
      console.error('Syllabus Service - Get pending error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch pending syllabi' }
    }
  },

  // Get published syllabi (đã công bố)
  getPublishedSyllabi: async () => {
    try {
      const response = await apiClient.get('/api/syllabuses', { params: { status: 'PUBLISHED', size: 200 } })
      const data = response.data
      return data?.content || data || []
    } catch (error) {
      console.error('Syllabus Service - Get published error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch published syllabi' }
    }
  },

  // Approve syllabus
  approveSyllabus: async (id, comment = '') => {
    try {
      const response = await apiClient.post(`/api/syllabuses/${id}/approve`, { comment })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Approve error:', error)
      throw error.response?.data || { message: error.message || 'Failed to approve syllabus' }
    }
  },

  // Reject syllabus
  rejectSyllabus: async (id, reason) => {
    try {
      const response = await apiClient.post(`/api/syllabuses/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Reject error:', error)
      throw error.response?.data || { message: error.message || 'Failed to reject syllabus' }
    }
  },

  // Search syllabi
  searchSyllabi: async (query) => {
    try {
      const response = await apiClient.get('/api/syllabuses', { params: { q: query } })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Search error:', error)
      throw error.response?.data || { message: error.message || 'Search failed' }
    }
  }
}

export default syllabusService



