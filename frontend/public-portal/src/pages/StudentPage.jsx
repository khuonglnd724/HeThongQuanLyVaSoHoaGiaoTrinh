import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, LogOut, Search, Bell, Star, Clock, Eye, ChevronRight,
  TrendingUp, Home, BookMarked, Heart
} from 'lucide-react'
import { getMyFollowedSyllabuses } from '../modules/student/services/studentService'

const StudentPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [followedSyllabuses, setFollowedSyllabuses] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load followed syllabuses from API
      const followedData = await getMyFollowedSyllabuses()
      console.log('[StudentPage] Loaded followed syllabuses:', followedData)
      setFollowedSyllabuses(followedData)
      
      // Load recently viewed from localStorage
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      setRecentlyViewed(recent.slice(0, 4)) // Show only 4 most recent
      
      // Mock notifications (in real app, fetch from backend)
      setNotifications([
        {
          id: 1,
          type: 'update',
          title: 'Cập nhật giáo trình',
          message: 'Giáo trình "Lập trình hướng đối tượng" đã có phiên bản mới',
          time: '2 giờ trước',
          read: false
        },
        {
          id: 2,
          type: 'new',
          title: 'Giáo trình mới',
          message: 'Giáo trình "Cấu trúc dữ liệu" vừa được xuất bản',
          time: '1 ngày trước',
          read: false
        },
        {
          id: 3,
          type: 'reminder',
          title: 'Nhắc nhở',
          message: 'Bạn có 3 giáo trình đang theo dõi',
          time: '2 ngày trước',
          read: true
        }
      ])
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleSearchClick = () => {
    navigate('/public/search')
  }

  const handleViewFollowed = () => {
    navigate('/student/followed')
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header with User Info & Logout */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-xs text-gray-500">Quản lý giáo trình của bạn</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Home size={18} />
                <span className="text-sm font-medium">Trang chủ</span>
              </button>
              
              <button
                onClick={() => navigate('/student/profile')}
                className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {(user?.fullName || user?.name || user?.email || 'S')[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.fullName || user?.name || 'Sinh viên'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Xin chào, {user?.fullName || user?.name || 'Sinh viên'}! 👋
              </h2>
              <p className="text-blue-100">
                Chào mừng bạn trở lại. Bạn có {unreadNotifications} thông báo mới.
              </p>
            </div>
            <TrendingUp size={64} className="text-blue-300 opacity-50 hidden md:block" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleSearchClick}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search size={24} className="text-white" />
              </div>
              <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tìm kiếm giáo trình</h3>
            <p className="text-sm text-gray-600">Khám phá và tìm kiếm giáo trình theo môn học</p>
          </button>

          <button
            onClick={handleViewFollowed}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart size={24} className="text-white" />
              </div>
              <ChevronRight size={24} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Giáo trình đang theo dõi</h3>
            <p className="text-sm text-gray-600">Xem tất cả giáo trình bạn đã theo dõi</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Dashboard Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Followed Syllabus Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="text-yellow-500" size={24} />
                    <h3 className="text-lg font-bold text-gray-900">Giáo trình đang theo dõi</h3>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {followedSyllabuses.length}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {followedSyllabuses.length > 0 ? (
                  <div className="space-y-4">
                    {followedSyllabuses.slice(0, 3).map((syllabus, idx) => (
                      <div
                        key={syllabus.rootId || idx}
                        onClick={() => navigate(`/public/syllabus/${syllabus.rootId}`)}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:shadow-md transition-all cursor-pointer border border-yellow-200 hover:border-yellow-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookMarked size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{syllabus.subjectName || syllabus.name}</h4>
                          <p className="text-sm text-gray-600">{syllabus.subjectCode || syllabus.code}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    ))}
                    {followedSyllabuses.length > 3 && (
                      <button
                        onClick={handleViewFollowed}
                        className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Xem tất cả ({followedSyllabuses.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 mb-4">Bạn chưa theo dõi giáo trình nào</p>
                    <button
                      onClick={handleSearchClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Tìm kiếm giáo trình
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recently Viewed Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-500" size={24} />
                  <h3 className="text-lg font-bold text-gray-900">Xem gần đây</h3>
                </div>
              </div>
              <div className="p-6">
                {recentlyViewed.length > 0 ? (
                  <div className="space-y-4">
                    {recentlyViewed.map((syllabus, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/student/syllabus/${syllabus.id}`)}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all cursor-pointer border border-blue-200 hover:border-blue-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Eye size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{syllabus.name}</h4>
                          <p className="text-sm text-gray-600">{syllabus.viewedAt}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600">Chưa có lịch sử xem giáo trình</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Notifications Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-red-500" size={24} />
                    <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          notif.read
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-gray-400' : 'bg-blue-600'}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{notif.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-gray-500">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 text-sm">Không có thông báo mới</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentPage
