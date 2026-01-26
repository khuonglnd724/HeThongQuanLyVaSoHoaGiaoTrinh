import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  FileText,
  BarChart3,
  LogOut,
  Home,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import LecturerDashboard from '../pages/LecturerDashboard'

export default function LecturerPortalLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      console.log('[LecturerPortalLayout] No token/user, redirecting to login')
      navigate('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'ROLE_LECTURER' && parsedUser.role !== 'ROLE_HOD') {
        console.log('[LecturerPortalLayout] User not lecturer, redirecting')
        navigate('/login')
        return
      }
      setUser(parsedUser)
    } catch (e) {
      console.error('[LecturerPortalLayout] Invalid user data:', e)
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      onClick: () => navigate('/lecturer/dashboard')
    },
    {
      id: 'syllabi',
      label: 'Quản lý Giáo trình',
      icon: FileText,
      onClick: () => navigate('/lecturer/portal/syllabi')
    }
  ]

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-indigo-900 to-purple-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r border-indigo-800`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="bg-indigo-400 p-2 rounded-lg">
                <BookOpen size={24} />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="font-bold text-sm">Lecturer</p>
                  <p className="text-xs text-indigo-200">Giảng viên</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-indigo-800 p-1 rounded"
              >
                <ChevronDown size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 hover:bg-indigo-800 m-2 rounded-lg"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-indigo-100 hover:bg-indigo-800`}
                title={item.label}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="border-t border-indigo-800 p-4 space-y-2">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-800 transition-all"
            >
              <div className="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.fullName?.charAt(0).toUpperCase() || 'L'}
              </div>
              {sidebarOpen && (
                <>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">{user?.fullName || 'Lecturer'}</p>
                    <p className="text-xs text-indigo-200">{user?.email || 'lecturer@smd.edu.vn'}</p>
                  </div>
                  <ChevronDown size={16} />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg text-gray-900 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Giảng Viên {user?.fullName ? `- ${user.fullName}` : ''}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Quản lý và công bố giáo trình
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Lecturer'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'lecturer@smd.edu.vn'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                {user?.fullName?.charAt(0).toUpperCase() || 'L'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            <LecturerDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
