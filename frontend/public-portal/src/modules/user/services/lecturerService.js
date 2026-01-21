// Lecturer Service - Handle lecturer API calls
import apiClient from '../../../services/api/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiConstants'

export const lecturerService = {
  // Syllabi management
  getSyllabi: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SYLLABI_BY_LECTURER, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createSyllabus: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SYLLABI_CREATE, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateSyllabus: async (id, data) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.SYLLABI_UPDATE.replace(':id', id),
        data
      )
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteSyllabus: async (id) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.SYLLABI_UPDATE.replace(':id', id)
      )
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Dashboard
  getLecturerStats: async () => {
    try {
      const response = await apiClient.get('/lecturer/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default lecturerService
