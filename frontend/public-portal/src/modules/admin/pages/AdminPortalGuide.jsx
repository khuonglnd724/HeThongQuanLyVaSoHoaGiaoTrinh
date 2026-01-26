import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Settings, FileText, BarChart3, LogOut } from 'lucide-react'

export default function AdminPortalGuide() {
  const navigate = useNavigate()

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      console.log('[AdminPortalGuide] No token/user, redirecting to login')
      navigate('/login')
      return
    }
    
    try {
      const userData = JSON.parse(user)
      if (userData.role !== 'ROLE_ADMIN') {
        console.log('[AdminPortalGuide] User not admin, redirecting')
        navigate('/login')
      }
    } catch (e) {
      console.error('[AdminPortalGuide] Invalid user data:', e)
      navigate('/login')
    }
  }, [navigate])

  const sections = [
    {
      id: 'users',
      title: 'Quản lý người dùng',
      icon: Users,
      description: 'Tạo tài khoản, gán quyền, quản lý khóa',
      features: [
        'Tạo tài khoản mới (Giáo viên, Trưởng bộ môn, Phòng Đào tạo, Sinh viên)',
        'Import người dùng từ Excel/CSV',
        'Gán vai trò & quyền (RBAC)',
        'Khóa/mở tài khoản',
        'Reset mật khẩu'
      ]
    },
    {
      id: 'system',
      title: 'Cấu hình hệ thống',
      icon: Settings,
      description: 'Thiết lập năm học, học kỳ, workflow',
      features: [
        'Cấu hình năm học & học kỳ',
        'Quản lý khoa & bộ môn',
        'Thiết lập quy trình workflow',
        'Tạo template CLO, Rubric',
        'Định nghĩa form mẫu syllabus'
      ]
    },
    {
      id: 'publishing',
      title: 'Quản lý công bố',
      icon: FileText,
      description: 'Công bố/Hủy công bố syllabus',
      features: [
        'Xem danh sách syllabus đã duyệt',
        'Công bố & hủy công bố',
        'Lưu trữ (Archive)',
        'Thiết lập ngày hiệu lực',
        'Quản lý phiên bản công bố'
      ]
    },
    {
      id: 'audit',
      title: 'Kiểm tra & giám sát',
      icon: BarChart3,
      description: 'Log hệ thống & báo cáo',
      features: [
        'Xem log đăng nhập',
        'Log chỉnh sửa syllabus',
        'Lịch sử duyệt',
        'Xuất báo cáo (PDF/CSV)',
        'Phục vụ kiểm định'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Cổng quản trị viên</h1>
            <p className="text-gray-600 mt-1">Quản lý hệ thống SMD Microservices</p>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => navigate(`/admin/portal/${section.id}`)}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all p-6 text-left border-l-4 border-blue-500"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={28} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {section.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Truy cập →
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng người dùng', value: '256' },
            { label: 'Syllabus đã công bố', value: '48' },
            { label: 'Đang chờ duyệt', value: '12' },
            { label: 'Log hôm nay', value: '1,240' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border-b-4 border-blue-500 shadow">
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
