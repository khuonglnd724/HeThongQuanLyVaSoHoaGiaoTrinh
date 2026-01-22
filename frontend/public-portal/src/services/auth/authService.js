// Auth Service - Handle authentication API calls
import apiClient from '../api/apiClient'

export const authService = {
  login: async (credentials) => {
    try {
      // Backend expects a `username` (not full email). If caller passed an email,
      // convert to username by taking the local part before '@'. Prefer explicit
      // credentials.username when provided.
      const derivedUsername = credentials.username
        ? credentials.username
        : (credentials.email && credentials.email.includes('@')
          ? credentials.email.split('@')[0]
          : credentials.email)

      const loginData = {
        username: derivedUsername,
        password: credentials.password
      }
      console.log('[AuthService] Sending login request:', { username: loginData.username })
      const response = await apiClient.post('/api/auth/login', loginData)
      console.log('[AuthService] Login response:', response.data)
      return response.data
    } catch (error) {
      console.error('[AuthService] Login error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Login failed'
      console.error('[AuthService] Error message:', errorMsg)
      throw new Error(errorMsg)
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



