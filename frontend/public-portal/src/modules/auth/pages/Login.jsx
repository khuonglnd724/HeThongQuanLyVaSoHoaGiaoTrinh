import React, { useState } from 'react'
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react'

const Login = ({ onLoginSuccess, onBackToLanding }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const demoAccounts = [
    { email: 'student@smd.edu.vn', password: 'Student@123', role: 'ROLE_STUDENT', name: 'Sinh viên' },
    { email: 'lecturer@smd.edu.vn', password: 'Lecturer@123', role: 'ROLE_LECTURER', name: 'Giảng viên' },
    { email: 'hod@smd.edu.vn', password: 'HOD@123', role: 'ROLE_HOD', name: 'Trưởng khoa' },
    { email: 'academic@smd.edu.vn', password: 'Academic@123', role: 'ROLE_ACADEMIC_AFFAIRS', name: 'Phòng Đào tạo' },
    { email: 'rector@smd.edu.vn', password: 'Rector@123', role: 'ROLE_RECTOR', name: 'Hiệu trưởng' },
    { email: 'admin@smd.edu.vn', password: 'Admin@123', role: 'ROLE_ADMIN', name: 'Quản trị viên' }
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const usernameInput = email?.includes('@') ? email.split('@')[0] : email

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameInput,
          password: password
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('❌ Email hoặc mật khẩu không chính xác')
        } else {
          setError('❌ Lỗi đăng nhập. Vui lòng thử lại')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      
      // Lưu token và user info
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('role', data.user.role)
      
      // Gọi callback để chuyển đến trang phù hợp theo role
      onLoginSuccess(data.user)
    } catch (err) {
      console.error('Login error:', err)
      setError('❌ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.')
      setLoading(false)
    }
  }

  const handleDemoLogin = (account) => {
    setLoading(true)
    // Giả lập login thành công
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token-' + Date.now())
      localStorage.setItem('user', JSON.stringify({
        id: Math.random(),
        email: account.email,
        name: account.name,
        role: account.role
      }))
      localStorage.setItem('role', account.role)
      
      onLoginSuccess({
        email: account.email,
        name: account.name,
        role: account.role
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 opacity-20 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 opacity-20 rounded-full blur-3xl -ml-40 -mb-40"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={onBackToLanding}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
        >
          ← Quay lại trang chính
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <LogIn size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng Nhập</h1>
            <p className="text-gray-600">Hệ thống Quản lý Giáo trình</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@smd.edu.vn"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Đăng Nhập
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">hoặc</span>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <button
            type="button"
            onClick={() => setDemoMode(!demoMode)}
            className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 py-2"
          >
            {demoMode ? '✕ Ẩn tài khoản demo' : '👥 Xem tài khoản demo'}
          </button>

          {/* Demo Accounts */}
          {demoMode && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-3">📝 Tài khoản demo:</p>
              <div className="grid grid-cols-1 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account)}
                    className="text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition text-sm"
                    disabled={loading}
                  >
                    <div className="font-medium text-gray-900">{account.name}</div>
                    <div className="text-xs text-gray-600">{account.email}</div>
                    <div className="text-xs text-blue-600 mt-1">Pass: {account.password}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Bạn không có tài khoản? <a href="#signup" className="text-blue-600 hover:text-blue-700 font-medium">Đăng ký</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
