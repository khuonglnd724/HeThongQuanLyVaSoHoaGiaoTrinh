import React, { useEffect, useState, useCallback } from 'react'
import { BookOpen, BarChart3, FileText, RefreshCcw, AlertTriangle } from 'lucide-react'
import studentAPI from '../modules/student/services/studentService'

const StudentDashboard = ({ user, onLogout = () => {} }) => {
  const [dashboard, setDashboard] = useState({ syllabi: 0, averageGrade: 0, progress: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await studentAPI.getDashboard()
      const data = res?.data || {}
      setDashboard({
        syllabi: data.syllabiCount ?? 0,
        averageGrade: data.averageGrade ?? 0,
        progress: data.progressPercent ?? 0
      })
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard (cần API /api/student/dashboard)')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {error && (
        <div className="container mx-auto px-6 pt-6">
          <div className="flex flex-wrap items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle size={18} />
            <span className="text-sm md:text-base">{error}</span>
            <button
              onClick={loadDashboard}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              <RefreshCcw size={14} /> Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Giáo trình của tôi</h3>
              <BookOpen size={32} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">{dashboard.syllabi}</p>
            <p className="text-gray-600">Giáo trình đã đăng ký</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Điểm thi</h3>
              <BarChart3 size={32} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">{dashboard.averageGrade}/10</p>
            <p className="text-gray-600">Điểm trung bình học kỳ này</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tiến độ học</h3>
              <FileText size={32} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">{dashboard.progress}%</p>
            <p className="text-gray-600">Hoàn thành trong kỳ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Tìm kiếm giáo trình</h2>
            <a
              href="/public/search"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Khám phá thêm
            </a>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Tải xuống giáo trình</h2>
            <a
              href="/public/search"
              className="block w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Xem danh sách
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
