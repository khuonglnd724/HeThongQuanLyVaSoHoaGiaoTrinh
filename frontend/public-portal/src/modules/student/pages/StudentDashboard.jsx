import React, { useEffect, useState } from 'react'
import { BookOpen, BarChart3, LogOut, FileText, RefreshCcw, AlertTriangle, Heart, Clock } from 'lucide-react'
import { getSyllabusDetail } from '../../public/services/publicSyllabusService'
import studentAPI from '../services/studentService'

const StudentDashboard = ({ user, onLogout }) => {
  const [dashboard, setDashboard] = useState({ syllabi: 0, averageGrade: 0, progress: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [followedSyllabi, setFollowedSyllabi] = useState([])
  const [followedDetails, setFollowedDetails] = useState({})
  const [recentSyllabi, setRecentSyllabi] = useState([])
  const [studentMajor, setStudentMajor] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get student major from user object
        if (user?.major) {
          setStudentMajor(user.major)
        }

        // Load API data
        const res = await studentAPI.getDashboard()
        const data = res?.data || {}
        if (mounted) {
          setDashboard({
            syllabi: data.syllabiCount ?? 0,
            averageGrade: data.averageGrade ?? 0,
            progress: data.progressPercent ?? 0
          })
        }

        // Load followed syllabi from localStorage
        const followed = JSON.parse(localStorage.getItem('followedSyllabuses') || '[]')
        setFollowedSyllabi(followed)

        // Load details for followed syllabi
        const details = {}
        for (const id of followed) {
          try {
            const syl = await getSyllabusDetail(id)
            details[id] = syl
          } catch (err) {
            console.warn('Could not load detail for', id)
          }
        }
        if (mounted) setFollowedDetails(details)

        // Load recent syllabi from localStorage
        const recent = JSON.parse(localStorage.getItem('recentlySyllabuses') || '[]')
        setRecentSyllabi(recent.slice(0, 1)) // Show only first one
      } catch (err) {
        if (mounted) setError('Không thể tải dữ liệu dashboard')
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleNavigateToFollowed = (id) => {
    window.location.href = `/public/syllabus/${id}`
  }

  const handleNavigateToRecent = (id) => {
    window.location.href = `/public/syllabus/${id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Dashboard Sinh Viên</h1>
            <p className="text-gray-600 mt-1">Xin chào, <span className="font-semibold">{user?.name}</span></p>
          </div>
          <div className="flex gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <RefreshCcw size={16} className="animate-spin" /> Đang tải
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-6 mt-4">
          <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Giáo trình của tôi</h3>
              <BookOpen size={32} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">{dashboard.syllabi}</p>
            <p className="text-gray-600">Giáo trình đã đăng ký</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Điểm thi</h3>
              <BarChart3 size={32} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">{dashboard.averageGrade}/10</p>
            <p className="text-gray-600">Điểm trung bình học kỳ này</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tiến độ học</h3>
              <FileText size={32} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">{dashboard.progress}%</p>
            <p className="text-gray-600">Hoàn thành trong kỳ</p>
          </div>
        </div>

        {/* Followed Syllabi */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart size={28} className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Giáo trình đang theo dõi</h2>
              {followedSyllabi.length > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                  {followedSyllabi.length}
                </span>
              )}
            </div>
            <a
              href="/student/followed"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              Xem tất cả →
            </a>
          </div>

          {followedSyllabi.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-8 text-center">
              <Heart size={32} className="text-yellow-400 mx-auto mb-3" />
              <p className="text-gray-600 text-lg">Chưa theo dõi giáo trình nào</p>
              <p className="text-gray-500 text-sm mt-1">Hãy khám phá và theo dõi những giáo trình bạn quan tâm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {followedSyllabi.map((id) => {
                const syl = followedDetails[id]
                if (!syl) return null
                
                // Filter by student's major - only show if major matches or major is not set
                if (studentMajor && syl.programName && syl.programName !== studentMajor) {
                  return null
                }
                
                return (
                  <button
                    key={id}
                    onClick={() => handleNavigateToFollowed(id)}
                    className="text-left bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md hover:shadow-xl transition border-l-4 border-yellow-500 p-6"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold">
                        {syl.subject_code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{syl.subject_name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">{syl.summary}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>💳 {syl.credits} tín</span>
                      <span>📅 {syl.semester}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Recently Viewed */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock size={28} className="text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">Xem gần đây</h2>
            </div>
          </div>

          {recentSyllabi.length === 0 ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-8 text-center">
              <Clock size={32} className="text-blue-400 mx-auto mb-3" />
              <p className="text-gray-600 text-lg">Chưa có lịch sử xem giáo trình</p>
              <p className="text-gray-500 text-sm mt-1">Các giáo trình bạn xem sẽ hiển thị ở đây</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentSyllabi.map((id) => {
                const syl = followedDetails[id]
                if (!syl) return null
                return (
                  <button
                    key={id}
                    onClick={() => handleNavigateToRecent(id)}
                    className="text-left bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-xl transition border-l-4 border-blue-500 p-6"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">
                        {syl.subject_code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{syl.subject_name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">{syl.summary}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>💳 {syl.credits} tín</span>
                      <span>📅 {syl.semester}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
