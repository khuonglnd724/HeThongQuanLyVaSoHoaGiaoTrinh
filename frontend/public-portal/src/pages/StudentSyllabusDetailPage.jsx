import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen, ArrowLeft, Heart, Bell, Clock, User, BookMarked,
  Calendar, GraduationCap, ChevronRight, Star, Download
} from 'lucide-react'
import syllabusService from '../services/syllabusService'
import { followSyllabus, unfollowSyllabus, isFollowingSyllabus } from '../modules/student/services/studentService'

const StudentSyllabusDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [syllabus, setSyllabus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadSyllabusDetail()
    loadNotificationHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (syllabus) {
      addToRecentlyViewed()
      checkIfFollowing() // Check follow status after syllabus is loaded
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabus])

  const loadSyllabusDetail = async () => {
    try {
      setLoading(true)
      const response = await syllabusService.getSyllabusById(id)
      setSyllabus(response.data)
    } catch (err) {
      console.error('Error loading syllabus:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkIfFollowing = async () => {
    try {
      // Use rootId if available, otherwise use id
      const rootId = syllabus?.rootId || id
      const result = await isFollowingSyllabus(rootId)
      setIsFollowing(result)
    } catch (err) {
      console.warn('Could not check follow status:', err)
      // Fallback to localStorage for compatibility
      const followed = JSON.parse(localStorage.getItem('followedSyllabuses') || '[]')
      const isAlreadyFollowing = followed.some(s => s.id === id)
      setIsFollowing(isAlreadyFollowing)
    }
  }

  const loadNotificationHistory = () => {
    // Mock notification history for this syllabus
    setNotifications([
      {
        id: 1,
        type: 'update',
        message: 'Phiên bản 2.0 đã được xuất bản',
        date: '2024-01-20'
      },
      {
        id: 2,
        type: 'change',
        message: 'Cập nhật nội dung chương 3',
        date: '2024-01-15'
      },
      {
        id: 3,
        type: 'new',
        message: 'Tài liệu tham khảo mới được thêm',
        date: '2024-01-10'
      }
    ])
  }

  const addToRecentlyViewed = () => {
    // Add to recently viewed in localStorage
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    const newItem = {
      id,
      name: syllabus?.subject_name || 'Giáo trình',
      viewedAt: new Date().toLocaleString('vi-VN')
    }
    
    // Remove duplicates and add to front
    const filtered = recent.filter(item => item.id !== id)
    filtered.unshift(newItem)
    
    // Keep only last 10 items
    localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)))
  }

  const handleFollowToggle = async () => {
    const rootId = syllabus?.rootId || id
    setFollowLoading(true)
    
    try {
      if (isFollowing) {
        // Unfollow via API
        await unfollowSyllabus(rootId)
        setIsFollowing(false)
        
        // Also update localStorage for compatibility
        const followed = JSON.parse(localStorage.getItem('followedSyllabuses') || '[]')
        const updated = followed.filter(s => s.id !== id)
        localStorage.setItem('followedSyllabuses', JSON.stringify(updated))
      } else {
        // Follow via API
        await followSyllabus(rootId)
        setIsFollowing(true)
        
        // Also update localStorage for compatibility
        const followed = JSON.parse(localStorage.getItem('followedSyllabuses') || '[]')
        const newFollowed = {
          id,
          rootId,
          name: syllabus?.subject_name || syllabus?.subjectName || 'Giáo trình',
          code: syllabus?.subject_code || syllabus?.subjectCode || 'N/A',
          followedAt: new Date().toISOString()
        }
        followed.push(newFollowed)
        localStorage.setItem('followedSyllabuses', JSON.stringify(followed))
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
      alert('Không thể thực hiện thao tác. Vui lòng thử lại.')
    } finally {
      setFollowLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BookOpen },
    { id: 'clo-plo', label: 'CLO-PLO', icon: Star },
    { id: 'assessment', label: 'Đánh giá', icon: BookMarked },
    { id: 'materials', label: 'Tài liệu', icon: Download }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải giáo trình...</p>
        </div>
      </div>
    )
  }

  if (!syllabus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giáo trình</h2>
          <button
            onClick={() => navigate('/student')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/student')}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Về Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Follow Button */}
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-md ${
                  isFollowing
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {followLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart size={18} className={isFollowing ? 'fill-current' : ''} />
                )}
                <span>{isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</span>
              </button>

              {/* Notification History Button */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                <Bell size={18} />
                <span className="hidden md:inline">Lịch sử thông báo</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel (Slide-in) */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNotifications(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Lịch sử thông báo</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Bell size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{notif.message}</p>
                      <p className="text-xs text-gray-600">{notif.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 mb-4 text-blue-200 text-sm">
            <span>Trang chủ</span>
            <ChevronRight size={16} />
            <span>Giáo trình</span>
            <ChevronRight size={16} />
            <span className="text-white">{syllabus.subject_code}</span>
          </div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur">
              <BookOpen size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{syllabus.subject_name}</h1>
              <p className="text-blue-100 text-lg mb-4">{syllabus.subject_code}</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur">
                  <BookMarked size={16} />
                  <span className="text-sm">{syllabus.credits || 3} tín chỉ</span>
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur">
                  <User size={16} />
                  <span className="text-sm">GV: {syllabus.created_by || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur">
                  <Calendar size={16} />
                  <span className="text-sm">Năm: {syllabus.academic_year || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur">
                  <GraduationCap size={16} />
                  <span className="text-sm">Học kỳ: {syllabus.semester || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tổng quan</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {syllabus.summary || 'Không có mô tả'}
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin chi tiết</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BookMarked className="text-blue-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Số tín chỉ</p>
                        <p className="font-semibold text-gray-900">{syllabus.credits || 3}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Phiên bản</p>
                        <p className="font-semibold text-gray-900">v{syllabus.version_no || '1.0'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clo-plo' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Chuẩn đầu ra (CLO-PLO)</h3>
                <p className="text-gray-600">Nội dung CLO-PLO sẽ được hiển thị ở đây...</p>
              </div>
            )}

            {activeTab === 'assessment' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Phương pháp đánh giá</h3>
                <p className="text-gray-600">Nội dung đánh giá sẽ được hiển thị ở đây...</p>
              </div>
            )}

            {activeTab === 'materials' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tài liệu tham khảo</h3>
                <p className="text-gray-600">Danh sách tài liệu sẽ được hiển thị ở đây...</p>
              </div>
            )}
          </div>
        </div>

        {/* Note about read-only */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <Bell className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="font-semibold text-yellow-900 mb-1">Lưu ý</p>
            <p className="text-sm text-yellow-800">
              Đây là chế độ xem dành cho sinh viên. Bạn có thể theo dõi giáo trình để nhận thông báo về các cập nhật mới.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentSyllabusDetailPage
