import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, CheckCircle, AlertCircle, Settings, LogOut, BarChart3 } from 'lucide-react'

const AcademicDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Dashboard Phòng Đào Tạo</h1>
            <p className="text-gray-600 mt-1">Xin chào, <span className="font-semibold">{user?.name}</span></p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Giáo trình chờ duyệt</h3>
              <AlertCircle size={28} className="text-yellow-500" />
            </div>
            <p className="text-4xl font-bold text-purple-600">24</p>
            <p className="text-sm text-gray-500 mt-2">Cần xử lý</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Đã duyệt</h3>
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <p className="text-4xl font-bold text-green-600">128</p>
            <p className="text-sm text-gray-500 mt-2">Giáo trình</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Khoa/Bộ môn</h3>
              <Users size={28} className="text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500 mt-2">Tổng số</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chương trình</h3>
              <BookOpen size={28} className="text-indigo-500" />
            </div>
            <p className="text-4xl font-bold text-indigo-600">45</p>
            <p className="text-sm text-gray-500 mt-2">Hoạt động</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => navigate('/academic/programs')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <CheckCircle size={20} />
            Quản lý CTĐT & học phần
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-3">
            <BarChart3 size={20} />
            Báo cáo chương trình
          </button>
          <button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-3">
            <Settings size={20} />
            Cấu hình hệ thống
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-900">Giáo trình: CS101 - Lập trình căn bản</p>
                  <p className="text-sm text-gray-500">Gửi từ Khoa CNTT - 2 giờ trước</p>
                </div>
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">Chờ duyệt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcademicDashboard
