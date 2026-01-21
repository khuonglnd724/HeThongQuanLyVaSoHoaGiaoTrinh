// Auth Service - Handle authentication API calls
import apiClient from '../api/apiClient'

export const authService = {
  login: async (credentials) => {
    try {
      // Backend expects username and password
      const loginData = {
        username: credentials.email || credentials.username,
        password: credentials.password
      }
      const response = await apiClient.post('/api/auth/login', loginData)
      return response.data
    } catch (error) {
      console.error('Auth Service - Login error:', error)
      throw error.response?.data || { message: error.message || 'Login failed' }
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await apiClient.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiClient.post('/api/auth/refresh')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default authService



