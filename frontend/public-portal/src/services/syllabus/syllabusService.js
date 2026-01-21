// Syllabus Service - Handle syllabus API calls
import apiClient from '../api/apiClient'

export const syllabusService = {
  // Get all syllabi
  getAllSyllabi: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/syllabus', { params })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Get all error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch syllabi' }
    }
  },

  // Get syllabus by ID
  getSyllabusById: async (id) => {
    try {
      const response = await apiClient.get(`/api/syllabus/${id}`)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Get by ID error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch syllabus' }
    }
  },

  // Create new syllabus
  createSyllabus: async (syllabusData) => {
    try {
      const response = await apiClient.post('/api/syllabus', syllabusData)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Create error:', error)
      throw error.response?.data || { message: error.message || 'Failed to create syllabus' }
    }
  },

  // Update syllabus
  updateSyllabus: async (id, syllabusData) => {
    try {
      const response = await apiClient.put(`/api/syllabus/${id}`, syllabusData)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Update error:', error)
      throw error.response?.data || { message: error.message || 'Failed to update syllabus' }
    }
  },

  // Delete syllabus
  deleteSyllabus: async (id) => {
    try {
      const response = await apiClient.delete(`/api/syllabus/${id}`)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Delete error:', error)
      throw error.response?.data || { message: error.message || 'Failed to delete syllabus' }
    }
  },

  // Get syllabi by lecturer
  getSyllabiByLecturer: async (lecturerId) => {
    try {
      const response = await apiClient.get(`/api/syllabus/lecturer/${lecturerId}`)
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Get by lecturer error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch lecturer syllabi' }
    }
  },

  // Get pending syllabi (for approval)
  getPendingSyllabi: async () => {
    try {
      const response = await apiClient.get('/api/syllabus/pending')
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Get pending error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch pending syllabi' }
    }
  },

  // Approve syllabus
  approveSyllabus: async (id, comment = '') => {
    try {
      const response = await apiClient.post(`/api/syllabus/${id}/approve`, { comment })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Approve error:', error)
      throw error.response?.data || { message: error.message || 'Failed to approve syllabus' }
    }
  },

  // Reject syllabus
  rejectSyllabus: async (id, reason) => {
    try {
      const response = await apiClient.post(`/api/syllabus/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Reject error:', error)
      throw error.response?.data || { message: error.message || 'Failed to reject syllabus' }
    }
  },

  // Search syllabi
  searchSyllabi: async (query) => {
    try {
      const response = await apiClient.get('/api/syllabus/search', { params: { q: query } })
      return response.data
    } catch (error) {
      console.error('Syllabus Service - Search error:', error)
      throw error.response?.data || { message: error.message || 'Search failed' }
    }
  }
}

export default syllabusService



