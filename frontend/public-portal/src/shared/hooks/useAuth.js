// useAuth Hook - Centralized auth logic
import { useState, useCallback } from 'react'
import authService from '../../services/auth/authService'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login({ email, password })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('role', response.user.role)
      return response
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
  }, [])

  return { login, logout, loading, error }
}
