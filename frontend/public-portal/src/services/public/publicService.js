// Public Service - Handle public API calls (no auth required)
import apiClient from '../api/apiClient'

export const publicService = {
  // Get public syllabi
  getPublicSyllabi: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/public/syllabi', { params })
      return response.data
    } catch (error) {
      console.error('Public Service - Get syllabi error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch syllabi' }
    }
  },

  // Get syllabus details
  getSyllabusDetails: async (id) => {
    try {
      const response = await apiClient.get(`/api/public/syllabi/${id}`)
      return response.data
    } catch (error) {
      console.error('Public Service - Get syllabus details error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch syllabus details' }
    }
  },

  // Search public syllabi
  searchPublicSyllabi: async (query) => {
    try {
      const response = await apiClient.get('/api/public/syllabi/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      console.error('Public Service - Search error:', error)
      throw error.response?.data || { message: error.message || 'Search failed' }
    }
  },

  // Get system announcements
  getAnnouncements: async () => {
    try {
      const response = await apiClient.get('/api/public/announcements')
      return response.data
    } catch (error) {
      console.error('Public Service - Get announcements error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch announcements' }
    }
  },

  // Get public statistics
  getPublicStatistics: async () => {
    try {
      const response = await apiClient.get('/api/public/statistics')
      return response.data
    } catch (error) {
      console.error('Public Service - Get statistics error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch statistics' }
    }
  },

  // Download syllabus
  downloadSyllabus: async (id) => {
    try {
      const response = await apiClient.get(`/api/public/syllabi/${id}/download`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Public Service - Download error:', error)
      throw error.response?.data || { message: error.message || 'Download failed' }
    }
  }
}

export default publicService



