import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, XCircle, Clock, AlertCircle, LogOut, Eye, FileText } from 'lucide-react'
import syllabusApprovalService from '../services/syllabusApprovalService'

/**
 * HOD Dashboard - Dành riêng cho Head of Department
 * Chức năng chính: Review giáo trình (PENDING_REVIEW → PENDING_APPROVAL)
 */
const HODDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadPendingSyllabi()
  }, [])

  const loadPendingSyllabi = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[HODDashboard] Loading pending syllabi...')
      // HOD chỉ xem giáo trình ở trạng thái PENDING_REVIEW
      const data = await syllabusApprovalService.getPendingForReview()
      console.log('[HODDashboard] Received data:', data)
      console.log('[HODDashboard] Is array?', Array.isArray(data))
      console.log('[HODDashboard] Data length:', Array.isArray(data) ? data.length : 'N/A')
      
      const syllabusArray = Array.isArray(data) ? data : []
      console.log('[HODDashboard] Setting syllabi:', syllabusArray.length, 'items')
      setSyllabi(syllabusArray)
    } catch (err) {
      console.error('[HODDashboard] Error loading syllabi:', err)
      setError(err.message || 'Không thể tải danh sách giáo trình')
      setSyllabi([])
    } finally {
      setLoading(false)
    }
  }

  const handleReviewApprove = async (syllabusId) => {
    if (!window.confirm('Xác nhận phê duyệt giáo trình này để gửi sang phòng đào tạo?')) return

    try {
      setActionLoading(true)
      await syllabusApprovalService.reviewApprove(syllabusId, comment)
      alert('Phê duyệt thành công')
      setComment('')
      setSelectedSyllabus(null)
      loadPendingSyllabi()
    } catch (err) {
      console.error('Error review-approve:', err)
      alert('Lỗi: ' + (err.message || 'Không thể phê duyệt'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (syllabusId) => {
    const reason = prompt('Nhập lý do từ chối:')
    if (!reason || reason.trim() === '') {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      setActionLoading(true)
      await syllabusApprovalService.reject(syllabusId, reason)
      alert('Từ chối thành công')
      setSelectedSyllabus(null)
      loadPendingSyllabi()
    } catch (err) {
      console.error('Error rejecting:', err)
      alert('Lỗi: ' + (err.message || 'Không thể từ chối'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleViewDetail = (syllabus) => {
    setSelectedSyllabus(syllabus)
  }

  const closeDetail = () => {
    setSelectedSyllabus(null)
    setComment('')
  }

  // Stats calculations
  const stats = {
    pending: syllabi.length,
    thisWeek: syllabi.filter(s => {
      const created = new Date(s.createdAt || s.submittedAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return created >= weekAgo
    }).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Head of Department - Review Giáo Trình</h1>
            <p className="text-gray-600 mt-1">
              Xin chào, <span className="font-semibold">{user?.name || 'HOD'}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Pending Review */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chờ review</h3>
              <Clock size={28} className="text-yellow-500" />
            </div>
            <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-2">Giáo trình cần xử lý</p>
          </div>

          {/* Card 2: This Week */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tuần này</h3>
              <AlertCircle size={28} className="text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-blue-600">{stats.thisWeek}</p>
            <p className="text-sm text-gray-500 mt-2">Giáo trình mới</p>
          </div>

          {/* Card 3: Your Role */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vai trò</h3>
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">Trưởng Bộ Môn</p>
            <p className="text-sm text-gray-500 mt-2">Head of Department</p>
          </div>
        </div>

        {/* Syllabi List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Danh sách giáo trình chờ duyệt</h2>
            <button
              onClick={loadPendingSyllabi}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Đang tải...' : 'Tải lại'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Đang tải danh sách giáo trình...</p>
            </div>
          ) : syllabi.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Không có giáo trình cần duyệt</p>
              <p className="text-sm text-gray-500 mt-2">Tất cả giáo trình đã được xử lý</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syllabi.map((syllabus) => (
                <div
                  key={syllabus.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {syllabus.subjectCode || 'N/A'}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          PENDING_REVIEW
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">
                        {syllabus.subjectName || 'Chưa có tên'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Giảng viên: {syllabus.lecturerName || syllabus.createdBy || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ngày gửi: {syllabus.submittedAt
                          ? new Date(syllabus.submittedAt).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(syllabus)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSyllabus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Review Giáo Trình</h2>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Basic Info */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Mã môn</p>
                    <p className="font-medium text-gray-900">{selectedSyllabus.subjectCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Tên môn</p>
                    <p className="font-medium text-gray-900">{selectedSyllabus.subjectName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Giảng viên</p>
                    <p className="font-medium text-gray-900">{selectedSyllabus.lecturerName || selectedSyllabus.createdBy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Ngày gửi</p>
                    <p className="font-medium text-gray-900">
                      {selectedSyllabus.submittedAt
                        ? new Date(selectedSyllabus.submittedAt).toLocaleDateString('vi-VN')
                        : '-'}
                    </p>
                  </div>
                </div>
              </section>

              {/* CLOs */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">CLOs (Course Learning Outcomes)</h3>
                {selectedSyllabus.content?.objectives && Array.isArray(selectedSyllabus.content.objectives) && selectedSyllabus.content.objectives.length > 0 ? (
                  <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {selectedSyllabus.content.objectives.map((clo, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-3">
                        <span className="font-semibold text-gray-900 flex-shrink-0">CLO{idx + 1}:</span>
                        <span>{clo}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có CLO được định nghĩa</p>
                )}
              </section>

              {/* Lectures/Modules */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Chương trình giảng dạy</h3>
                {selectedSyllabus.content?.modules && Array.isArray(selectedSyllabus.content.modules) && selectedSyllabus.content.modules.length > 0 ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {selectedSyllabus.content.modules.map((module, idx) => (
                      <div key={idx} className="border-l-2 border-blue-400 pl-4">
                        <p className="font-medium text-gray-900">{module.title || `Module ${idx + 1}`}</p>
                        {module.topics && Array.isArray(module.topics) && module.topics.length > 0 && (
                          <ul className="text-sm text-gray-700 mt-1 space-y-1">
                            {module.topics.map((topic, tidx) => (
                              <li key={tidx} className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có module giảng dạy</p>
                )}
              </section>

              {/* Assessment */}
              {selectedSyllabus.content?.assessment && (
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Phương pháp đánh giá</h3>
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
                    {selectedSyllabus.content.assessment.midterm !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Giữa kỳ</p>
                        <p className="font-medium text-gray-900">{selectedSyllabus.content.assessment.midterm}%</p>
                      </div>
                    )}
                    {selectedSyllabus.content.assessment.final !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Cuối kỳ</p>
                        <p className="font-medium text-gray-900">{selectedSyllabus.content.assessment.final}%</p>
                      </div>
                    )}
                    {selectedSyllabus.content.assessment.assignments !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Bài tập</p>
                        <p className="font-medium text-gray-900">{selectedSyllabus.content.assessment.assignments}%</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Comment Section */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Nhận xét / Ghi chú</h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét hoặc yêu cầu chỉnh sửa của bạn..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </section>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleReviewApprove(selectedSyllabus.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
                </button>
                <button
                  onClick={() => handleReject(selectedSyllabus.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                </button>
                <button
                  onClick={closeDetail}
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HODDashboard
