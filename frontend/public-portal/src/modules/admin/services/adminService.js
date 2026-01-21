// Admin Service - Handle admin API calls
import apiClient from '../../../services/api/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiConstants'

export const adminService = {
  // Users management
  getUsers: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createUser: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.USERS}/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Syllabi approval (for HOD, Rector)
  approveSyllabus: async (id, data) => {
    try {
      const response = await apiClient.put(`/admin/syllabi/${id}/approve`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Statistics
  getAdminStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STATS)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Logs
  getLogs: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LOGS, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Permissions
  getPermissions: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PERMISSIONS)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default adminService
