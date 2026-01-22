import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import authService from '../services/auth/authService'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate inputs
    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      setLoading(false)
      return
    }

    try {
      console.log('[Login] Starting login process for:', email)
      // Call real auth API
      const response = await authService.login({ email, password })
      
      console.log('[Login] Login response received:', response)
      
      // Validate response
      if (!response) {
        throw new Error('No response from server')
      }

      // Save token
      if (response.token) {
        localStorage.setItem('token', response.token)
        console.log('[Login] Token saved')
      } else {
        console.warn('[Login] No token in response')
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }

      // Extract role from roles Set (convert to array and get first role)
      const userRoles = Array.isArray(response.roles) 
        ? response.roles 
        : (response.roles ? Array.from(response.roles) : ['ROLE_STUDENT'])
      
      const primaryRole = userRoles[0] || 'ROLE_STUDENT'

      // Save user data
      const userData = {
        email: response.email || email,
        name: response.fullName || response.username || email.split('@')[0],
        username: response.username,
        role: primaryRole,
        roles: userRoles,
        userId: response.userId
      }

      console.log('[Login] User data prepared:', userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setCurrentUser(userData)
      console.log('[Login] User data saved, navigating to dashboard')

      if (rememberMe) {
        localStorage.setItem('rememberEmail', email)
      }

      console.log('[Login] Login successful, navigating...')
      // Navigate based on primary role (small delay to ensure state updates)
      const roleToPath = {
        'ROLE_ADMIN': '/admin/dashboard',
        'ROLE_LECTURER': '/lecturer/dashboard',
        'ROLE_ACADEMIC_AFFAIRS': '/academic/dashboard',
        'ROLE_STUDENT': '/student/dashboard'
      }
      const targetPath = roleToPath[primaryRole] || '/student/dashboard'
      setTimeout(() => navigate(targetPath), 100)
    } catch (err) {
      console.error('[Login] Error caught:', err)
      const errorMsg = err.message || err.error || 'Login failed. Please check your credentials.'
      console.error('[Login] Final error message:', errorMsg)
      setError(errorMsg)
      
      // Fallback demo login for testing
      if (email === 'admin@smd.edu.vn' && password === 'Lecturer@123') {
        console.warn('[Login] Backend not available, using demo login')
        const demoUser = {
          email: 'admin@smd.edu.vn',
          name: 'Quản trị viên',
          username: 'admin',
          role: 'ROLE_ADMIN',
          roles: ['ROLE_ADMIN'],
          userId: '1'
        }
        localStorage.setItem('token', 'demo-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(demoUser))
        setCurrentUser(demoUser)
        // Demo fallback: respect admin role and route accordingly
        setTimeout(() => navigate('/admin/dashboard'), 100)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Show logged in user info if exists */}
        {currentUser && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">SMD System</h1>
            <p className="text-slate-600 text-sm">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Checkbox & Link */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#forgot" className="text-sm text-emerald-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          {/* Back Button */}
          <button
            type="button"
            onClick={handleBackToHome}
            className="w-full text-sm text-slate-600 hover:text-slate-900 transition"
          >
            ← Back to Home
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          SMD System © 2025. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
