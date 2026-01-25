import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, Calendar, BookOpen, ArrowLeft, Edit,
  Save, X, Heart, Clock, Bell, Award
} from 'lucide-react'

const StudentProfilePage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  })
  const [followedCount, setFollowedCount] = useState(0)
  const [recentViewedCount, setRecentViewedCount] = useState(0)

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditForm({
        fullName: parsedUser.fullName || parsedUser.name || '',
        email: parsedUser.email || '',
        phoneNumber: parsedUser.phoneNumber || ''
      })
    }

    // Load statistics
    const followed = JSON.parse(localStorage.getItem('followedSyllabuses') || '[]')
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    setFollowedCount(followed.length)
    setRecentViewedCount(recent.length)
  }, [])

  const handleSaveProfile = () => {
    // Update user in localStorage
    const updatedUser = {
      ...user,
      name: editForm.fullName,
      fullName: editForm.fullName,
      email: editForm.email,
      phoneNumber: editForm.phoneNumber
    }
    console.log('[StudentProfile] Saving user data:', updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)
    
    // Show success message
    alert('Cập nhật thông tin thành công!')
  }

  const handleCancelEdit = () => {
    setEditForm({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || ''
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Vui lòng đăng nhập</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Về Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-12 text-white">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur border-4 border-white">
                  <span className="text-4xl font-bold">
                    {(user.fullName || user.name || user.email || 'S')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{user.fullName || user.name || 'Sinh viên'}</h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <Mail size={16} />
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X size={18} />
                      <span className="hidden md:inline">Hủy</span>
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      <span className="hidden md:inline">Chỉnh sửa</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
              
              {isEditing ? (
                <div className="space-y-6">
                  {/* Edit Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      <Save size={20} />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <User className="text-blue-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{user.fullName || user.name || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="text-green-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="text-purple-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{user.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="text-orange-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Vai trò</p>
                      <p className="font-semibold text-gray-900">Sinh viên</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Heart size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang theo dõi</p>
                  <p className="text-2xl font-bold text-gray-900">{followedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đã xem</p>
                  <p className="text-2xl font-bold text-gray-900">{recentViewedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điểm hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Bell className="text-blue-600" size={24} />
              Hoạt động gần đây
            </h2>
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">Chưa có hoạt động nào</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfilePage
