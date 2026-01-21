// User Service - Handle user profile API calls
import apiClient from '../../../services/api/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiConstants'

export const userService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.put('/user/change-password', {
        oldPassword,
        newPassword,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await apiClient.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default userService
