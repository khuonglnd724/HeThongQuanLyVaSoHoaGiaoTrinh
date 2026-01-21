// User Service - Handle user management API calls
import apiClient from '../api/apiClient'

export const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/auth/users', { params })
      return response.data
    } catch (error) {
      console.error('User Service - Get all users error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch users' }
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/api/auth/users/${id}`)
      return response.data
    } catch (error) {
      console.error('User Service - Get user error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch user' }
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/users/me')
      return response.data
    } catch (error) {
      console.error('User Service - Get current user error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch profile' }
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/users', userData)
      return response.data
    } catch (error) {
      console.error('User Service - Create user error:', error)
      throw error.response?.data || { message: error.message || 'Failed to create user' }
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/api/auth/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('User Service - Update user error:', error)
      throw error.response?.data || { message: error.message || 'Failed to update user' }
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/api/auth/users/${id}`)
      return response.data
    } catch (error) {
      console.error('User Service - Delete user error:', error)
      throw error.response?.data || { message: error.message || 'Failed to delete user' }
    }
  },

  // Update user role
  updateUserRole: async (userId, roles) => {
    try {
      const response = await apiClient.put(`/api/auth/users/${userId}/roles`, { roles })
      return response.data
    } catch (error) {
      console.error('User Service - Update role error:', error)
      throw error.response?.data || { message: error.message || 'Failed to update role' }
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.post('/api/auth/users/change-password', {
        oldPassword,
        newPassword
      })
      return response.data
    } catch (error) {
      console.error('User Service - Change password error:', error)
      throw error.response?.data || { message: error.message || 'Failed to change password' }
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/api/auth/users/role/${role}`)
      return response.data
    } catch (error) {
      console.error('User Service - Get users by role error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch users' }
    }
  }
}

export default userService



