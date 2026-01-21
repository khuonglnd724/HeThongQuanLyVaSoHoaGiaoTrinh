import React from 'react'
import { BookOpen, BarChart3, LogOut, FileText } from 'lucide-react'

const StudentDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Dashboard Sinh Viên</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Giáo trình của tôi</h3>
              <BookOpen size={32} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">8</p>
            <p className="text-gray-600">Giáo trình đã đăng ký</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Điểm thi</h3>
              <BarChart3 size={32} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">7.8/10</p>
            <p className="text-gray-600">Điểm trung bình học kỳ này</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tiến độ học</h3>
              <FileText size={32} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">72%</p>
            <p className="text-gray-600">Hoàn thành trong kỳ</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Tìm kiếm giáo trình</h2>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
              Khám phá thêm
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Tải xuống giáo trình</h2>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium">
              Xem danh sách
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
