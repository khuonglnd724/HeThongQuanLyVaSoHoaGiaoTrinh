import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, XCircle, Clock, AlertCircle, LogOut, Eye } from 'lucide-react'
import apiClient from '../../../services/api/apiClient'
import SyllabusDetailModal from '../../../shared/components/SyllabusDetailModal'

/**
 * Rector Dashboard - Dành riêng cho Hiệu trưởng
 * Chức năng chính: Phê duyệt giáo trình (APPROVED → PUBLISHED)
 */
const RectorDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [syllabusDetail, setSyllabusDetail] = useState(null)
  const [syllabusDetailLoading, setSyllabusDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadApprovedSyllabi()
  }, [])

  const loadApprovedSyllabi = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[RectorDashboard] Loading approved syllabi...')
      // Rector chỉ xem giáo trình ở trạng thái APPROVED
      const response = await apiClient.get('/api/syllabuses', {
        params: { status: 'APPROVED', size: 100 }
      })
      
      const data = response.data
      console.log('[RectorDashboard] Received data:', data)
      
      let syllabusArray = []
      if (Array.isArray(data)) {
        syllabusArray = data
      } else if (data.content && Array.isArray(data.content)) {
        syllabusArray = data.content
      } else if (data.data && Array.isArray(data.data)) {
        syllabusArray = data.data
      } else if (data.data && data.data.content && Array.isArray(data.data.content)) {
        syllabusArray = data.data.content
      }

      console.log('[RectorDashboard] Processed array:', syllabusArray)
      setSyllabi(syllabusArray)
    } catch (err) {
      console.error('[RectorDashboard] Error loading syllabi:', err)
      setError('Lỗi khi tải danh sách giáo trình. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (syllabusId) => {
    if (!window.confirm('Bạn chắc chắn muốn phê duyệt giáo trình này?')) {
      return
    }

    try {
      setActionLoading(true)
      const userId = user?.id || localStorage.getItem('userId')
      
      await apiClient.post(
        `/api/syllabuses/${syllabusId}/publish`,
        { reason: '' },
        { headers: { 'X-User-Id': userId } }
      )
      
      alert('Giáo trình đã được phê duyệt thành công!')
      setSelectedSyllabus(null)
      setSyllabusDetail(null)
      loadApprovedSyllabi()
    } catch (err) {
      console.error('[RectorDashboard] Publish error:', err)
      alert('Lỗi khi phê duyệt giáo trình: ' + (err.response?.data?.message || err.message))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (syllabusId) => {
    const reason = prompt('Vui lòng nhập lý do từ chối:')
    if (!reason) return

    try {
      setActionLoading(true)
      const userId = user?.id || localStorage.getItem('userId')
      
      await apiClient.post(
        `/api/syllabuses/${syllabusId}/reject`,
        { reason },
        { headers: { 'X-User-Id': userId } }
      )
      
      alert('Giáo trình đã bị từ chối!')
      setSelectedSyllabus(null)
      setSyllabusDetail(null)
      loadApprovedSyllabi()
    } catch (err) {
      console.error('[RectorDashboard] Reject error:', err)
      alert('Lỗi khi từ chối giáo trình: ' + (err.response?.data?.message || err.message))
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewSyllabusDetail = async (syllabus) => {
    try {
      setSelectedSyllabus(syllabus)
      setSyllabusDetailLoading(true)
      // Fetch full details
      const response = await apiClient.get(`/api/syllabuses/${syllabus.id}`)
      setSyllabusDetail(response.data.data || response.data)
    } catch (err) {
      console.error('[RectorDashboard] Error loading detail:', err)
      alert('Lỗi khi tải chi tiết giáo trình')
    } finally {
      setSyllabusDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelectedSyllabus(null)
    setSyllabusDetail(null)
  }

  // Dummy handlers for SyllabusDetailModal props that Rector doesn't use
  const handleCheckCLOPLOConsistency = () => {}
  const handleViewCLOCheckHistory = () => {}
  const handleClearCLOCheckHistory = () => {}
  const handleViewDocument = (docId) => {
    window.open(`/api/documents/${docId}/download`, '_blank')
  }
  const generateDocumentSummary = () => {}
  const showToast = () => {}

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const stats = [
    {
      label: 'Chờ Phê Duyệt',
      value: syllabi.length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Tổng Giáo Trình',
      value: syllabi.length,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Đang Xử Lý',
      value: actionLoading ? 1 : 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen size={32} />
              Bảng Điều Khiển Hiệu Trưởng
            </h1>
            <p className="text-purple-100 mt-1">Phê duyệt giáo trình từ APPROVED → PUBLISHED</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right">
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-purple-200 text-sm">{user.role}</p>
                </div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <LogOut size={18} />
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon size={28} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Syllabi List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle size={24} className="text-purple-600" />
              Giáo Trình Chờ Phê Duyệt ({syllabi.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin">
                <Clock className="text-purple-600" size={32} />
              </div>
              <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : syllabi.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-500 text-lg">Không có giáo trình nào chờ phê duyệt</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã Giáo Trình</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên Môn Học</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giảng Viên</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabi.map((syllabus, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{syllabus.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{syllabus.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{syllabus.lecturer || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                          APPROVED
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewSyllabusDetail(syllabus)}
                          className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 transition"
                        >
                          <Eye size={18} />
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal using SyllabusDetailModal */}
      {selectedSyllabus && syllabusDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto max-w-4xl w-full mx-4">
            {syllabusDetailLoading ? (
              <div className="p-6 text-center text-gray-600">
                <Clock className="animate-spin mx-auto mb-4" size={32} />
                <p>Đang tải chi tiết giáo trình...</p>
              </div>
            ) : (
              <>
                <SyllabusDetailModal
                  isOpen={!!selectedSyllabus}
                  onClose={closeDetail}
                  syllabusDetailData={syllabusDetail}
                  syllabusDetailLoading={false}
                  syllabusDetailDocuments={syllabusDetail.documents || []}
                  syllabusDetailDocumentsLoading={false}
                  documentSummaries={{}}
                  documentSummarizingId={null}
                  cloCheckLoading={false}
                  cloCheckHistory={{}}
                  handleViewSyllabusDetail={() => {}}
                  handleCheckCLOPLOConsistency={handleCheckCLOPLOConsistency}
                  handleViewCLOCheckHistory={handleViewCLOCheckHistory}
                  handleClearCLOCheckHistory={handleClearCLOCheckHistory}
                  handleViewDocument={handleViewDocument}
                  generateDocumentSummary={generateDocumentSummary}
                  setShowDocumentSummaryModal={() => {}}
                  setSelectedDocumentForSummary={() => {}}
                  showToast={showToast}
                />

                {/* Rector Actions Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
                  <button
                    onClick={() => handleReject(selectedSyllabus.id)}
                    disabled={actionLoading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition font-medium text-sm"
                  >
                    <XCircle size={18} />
                    Từ Chối
                  </button>
                  <button
                    onClick={() => handlePublish(selectedSyllabus.id)}
                    disabled={actionLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition font-medium text-sm"
                  >
                    <CheckCircle size={18} />
                    {actionLoading ? 'Đang Xử Lý...' : 'Phê Duyệt'}
                  </button>
                  <button
                    onClick={closeDetail}
                    className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RectorDashboard
