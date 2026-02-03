import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BarChart3, LogOut } from 'lucide-react'
import { userService, syllabusService } from '../../../services'

export default function AdminPortalGuide() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    publicSyllabi: 0,
    pendingSyllabi: 0,
    logsToday: 0,
    loading: true
  })

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

  // Fetch real data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[AdminPortalGuide] Fetching stats...')
        
        let totalUsers = 0
        let publicSyllabi = 0
        let pendingSyllabi = 0
        let logsToday = 0

        // Get total users
        try {
          const usersData = await userService.getAllUsers({ size: 1 })
          console.log('[AdminPortalGuide] Users data:', usersData)
          totalUsers = usersData?.totalElements || usersData?.length || 0
        } catch (e) {
          console.warn('[AdminPortalGuide] Could not fetch users:', e)
          totalUsers = 0
        }

        // Get public syllabi (đã công bố)
        try {
          const publicSyllabiData = await syllabusService.getPublishedSyllabi()
          console.log('[AdminPortalGuide] Public syllabi data:', publicSyllabiData)
          publicSyllabi = Array.isArray(publicSyllabiData) 
            ? publicSyllabiData.length 
            : 0
        } catch (e) {
          console.warn('[AdminPortalGuide] Could not fetch public syllabi:', e)
          publicSyllabi = 0
        }

        // Get pending syllabi (đang chờ duyệt)
        try {
          const pendingSyllabiData = await syllabusService.getPendingSyllabi()
          console.log('[AdminPortalGuide] Pending syllabi data:', pendingSyllabiData)
          pendingSyllabi = Array.isArray(pendingSyllabiData) 
            ? pendingSyllabiData.length 
            : 0
        } catch (e) {
          console.warn('[AdminPortalGuide] Could not fetch pending syllabi:', e)
          pendingSyllabi = 0
        }

        // Get logs today - no endpoint available, set to 0
        logsToday = 0
        
        console.log('[AdminPortalGuide] Final stats:', { totalUsers, publicSyllabi, pendingSyllabi, logsToday })
        setStats({
          totalUsers,
          publicSyllabi,
          pendingSyllabi,
          logsToday,
          loading: false
        })
      } catch (error) {
        console.error('[AdminPortalGuide] Error fetching stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

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
      id: 'audit',
      title: 'Kiểm tra & giám sát',
      icon: BarChart3,
      description: 'Giám sát hệ thống',
      features: [
        'Giám sát hệ thống real-time',
        'Xem trạng thái các dịch vụ',
        'Xem metrics và performance',
        'Xem logs hệ thống',
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
            onClick={() => {
              if (section.id === 'audit') {
                navigate('/admin/portal/monitoring')
              } else {
                navigate(`/admin/portal/${section.id}`)
              }
            }}
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
            { label: 'Tổng người dùng', value: stats.loading ? '-' : stats.totalUsers.toString() },
            { label: 'Giáo trình đã công bố', value: stats.loading ? '-' : stats.publicSyllabi.toString() },
            { label: 'Đang chờ duyệt', value: stats.loading ? '-' : stats.pendingSyllabi.toString() },
            { label: 'Log hôm nay', value: stats.loading ? '-' : stats.logsToday.toString() }
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
