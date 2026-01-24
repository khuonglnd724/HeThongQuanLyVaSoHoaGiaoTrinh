import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Users,
  Settings,
  FileText,
  BarChart3,
  LogOut,
  Home,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import UserManagement from '../pages/UserManagement'
import SystemConfiguration from '../pages/SystemConfiguration'
import PublishingManagement from '../pages/PublishingManagement'
import AuditMonitoring from '../pages/AuditMonitoring'

export default function AdminPortalLayout() {
  const { section } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      console.log('[AdminPortalLayout] No token/user, redirecting to login')
      navigate('/login')
      return
    }
    
    try {
      const userData = JSON.parse(user)
      if (userData.role !== 'ROLE_ADMIN') {
        console.log('[AdminPortalLayout] User not admin, redirecting')
        navigate('/login')
      }
    } catch (e) {
      console.error('[AdminPortalLayout] Invalid user data:', e)
      navigate('/login')
    }
  }, [navigate])

  const navItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: Home,
      onClick: () => navigate('/admin/portal')
    },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      icon: Users,
      onClick: () => navigate('/admin/portal/users')
    },
    {
      id: 'system',
      label: 'Cấu hình hệ thống',
      icon: Settings,
      onClick: () => navigate('/admin/portal/system')
    },
    {
      id: 'publishing',
      label: 'Quản lý công bố',
      icon: FileText,
      onClick: () => navigate('/admin/portal/publishing')
    },
    {
      id: 'audit',
      label: 'Kiểm tra & giám sát',
      icon: BarChart3,
      onClick: () => navigate('/admin/portal/audit')
    }
  ]

  const pageConfig = {
    users: {
      title: 'Quản lý người dùng',
      component: <UserManagement />
    },
    system: {
      title: 'Cấu hình hệ thống',
      component: <SystemConfiguration />
    },
    publishing: {
      title: 'Quản lý công bố',
      component: <PublishingManagement />
    },
    audit: {
      title: 'Kiểm tra & giám sát',
      component: <AuditMonitoring />
    }
  }

  const currentPage = section ? pageConfig[section] : null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-blue-900 to-indigo-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r border-blue-800`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="bg-blue-400 p-2 rounded-lg">
                <Settings size={24} />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="font-bold text-sm">Admin</p>
                  <p className="text-xs text-blue-200">Quản trị viên</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-blue-800 p-1 rounded"
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
            className="p-3 hover:bg-blue-800 m-2 rounded-lg"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = item.id === section || (item.id === 'home' && !section)
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-400 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
                title={item.label}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="border-t border-blue-800 p-4 space-y-2">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-800 transition-all"
            >
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-blue-200">admin@smd.edu.vn</p>
                  </div>
                  <ChevronDown size={16} />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg text-gray-900 py-2 z-50">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={() => window.location.href = '/login'}
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
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentPage ? currentPage.title : 'Cổng quản trị'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Quản lý hệ thống SMD Microservices
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@smd.edu.vn</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {currentPage ? currentPage.component : null}
          </div>
        </main>
      </div>
    </div>
  )
}
