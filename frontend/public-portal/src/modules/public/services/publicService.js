// Public Services - Handle public API calls
import apiClient from '../api/apiClient'
import { API_ENDPOINTS } from '../../shared/constants/apiConstants'

export const publicService = {
  // Syllabi
  searchSyllabi: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SYLLABI_SEARCH, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getSyllabiList: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SYLLABI, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getSyllabusDetail: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SYLLABI_DETAIL.replace(':id', id))
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Landing page content
  getLandingContent: async () => {
    try {
      const response = await apiClient.get('/public/landing')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Statistics
  getPublicStats: async () => {
    try {
      const response = await apiClient.get('/public/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default publicService
