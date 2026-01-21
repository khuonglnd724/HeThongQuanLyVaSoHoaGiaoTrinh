import React, { useState, useEffect } from 'react'
import { BookOpen, Users, BarChart3, LogOut, FileText, Plus, Edit } from 'lucide-react'
import { syllabusService } from '../../../services'

const LecturerDashboard = ({ user, onLogout }) => {
  const [syllabi, setSyllabi] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    students: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLecturerSyllabi()
  }, [user])

  const loadLecturerSyllabi = async () => {
    try {
      setLoading(true)
      const data = await syllabusService.getSyllabiByLecturer(user?.userId)
      setSyllabi(Array.isArray(data) ? data : data.syllabi || [])
      // Calculate stats
      const total = Array.isArray(data) ? data.length : data.syllabi?.length || 0
      const approved = Array.isArray(data) 
        ? data.filter(s => s.status === 'APPROVED').length 
        : data.syllabi?.filter(s => s.status === 'APPROVED').length || 0
      const pending = Array.isArray(data)
        ? data.filter(s => s.status === 'PENDING').length
        : data.syllabi?.filter(s => s.status === 'PENDING').length || 0
      
      setStats({
        total,
        pending,
        approved,
        students: 245 // Mock data - can be fetched from academic service
      })
    } catch (err) {
      console.error('Failed to load syllabi:', err)
      // Fallback demo data
      setSyllabi([
        { id: 1, courseCode: 'CS-101', courseName: 'Lập trình C++', status: 'APPROVED' },
        { id: 2, courseCode: 'CS-102', courseName: 'Cơ sở dữ liệu', status: 'PENDING' },
      ])
      setStats({ total: 12, pending: 3, approved: 9, students: 245 })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Dashboard Giảng Viên</h1>
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
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Giáo trình</h3>
              <BookOpen size={24} className="text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Sinh viên</h3>
              <Users size={24} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.students}</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Đang soạn thảo</h3>
              <FileText size={24} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.pending}</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Được phê duyệt</h3>
              <BarChart3 size={24} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.approved}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">📝 Tạo giáo trình mới</h2>
            <p className="text-indigo-100 mb-6">Soạn thảo và quản lý giáo trình của bạn</p>
            <button className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition font-semibold">
              <Plus size={20} />
              Tạo mới
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">✏️ Quản lý giáo trình</h2>
            <p className="text-blue-100 mb-6">Chỉnh sửa và cập nhật giáo trình hiện tại</p>
            <button className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-semibold">
              <Edit size={20} />
              Quản lý
            </button>
          </div>
        </div>

        {/* Recent Syllabi */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Giáo trình gần đây</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mã môn</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên giáo trình</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cập nhật</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">CS101</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Lập trình C++ cơ bản</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Phê duyệt</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">20/01/2026</td>
                  <td className="px-6 py-4 text-sm"><button className="text-blue-600 hover:text-blue-700 font-medium">Xem</button></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">CS102</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Cấu trúc dữ liệu</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Chờ duyệt</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">19/01/2026</td>
                  <td className="px-6 py-4 text-sm"><button className="text-blue-600 hover:text-blue-700 font-medium">Sửa</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturerDashboard
