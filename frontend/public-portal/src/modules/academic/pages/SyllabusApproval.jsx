import React, { useEffect, useState } from 'react'
import { CheckCircle, Clock, XCircle, FileText, Download, LogOut, AlertCircle } from 'lucide-react'
import { useSyllabusApproval } from '../hooks/useSyllabusApproval'
import syllabusApprovalService from '../services/syllabusApprovalService'
import syllabusServiceV2 from '../../lecturer/services/syllabusServiceV2'

const SyllabusApproval = ({ user, onLogout, approvalStage = 'REVIEW' }) => {
  const { syllabi, loading, error, fetchSyllabi } = useSyllabusApproval(approvalStage)

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [versionHistory, setVersionHistory] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return undefined
      const parsed = JSON.parse(raw)
      return parsed?.userId ? Number(parsed.userId) : undefined
    } catch {
      return undefined
    }
  }

  const loadDetailAndVersions = async (syllabus) => {
    if (!syllabus?.id) return
    try {
      setActionLoading(true)
      setMessage('')

      const [detailRes, versionsRes] = await Promise.all([
        syllabusApprovalService.getDetails(syllabus.id),
        syllabusApprovalService.getVersionHistory(syllabus.rootSyllabusId || syllabus.id)
      ])

      setDetail(detailRes?.data || null)
      setRejectionReason(detailRes?.data?.rejectionReason || detailRes?.data?.review_comment || '')
      setVersionHistory(versionsRes?.data || [])
    } catch (err) {
      console.error('Failed to load syllabus detail:', err)
      setMessage('Không tải được chi tiết giáo trình')
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSelect = (syllabus) => {
    setSelected(syllabus)
    setRejectionReason('')
    loadDetailAndVersions(syllabus)
  }

  const handleReviewApprove = async () => {
    if (!selected?.id) return
    const comment = window.prompt('Nhập nhận xét (tuỳ chọn):')
    if (comment === null) return

    try {
      setActionLoading(true)
      setMessage('')
      const userId = getCurrentUserId()
      
      // HOD: review-approve (PENDING_REVIEW → PENDING_APPROVAL)
      await syllabusApprovalService.reviewApprove(selected.id, userId)
      
      setMessage('Đã gửi để phê duyệt tiếp theo')
      setMessageType('success')
      setSelected(null)
      setDetail(null)
      await fetchSyllabi()
    } catch (err) {
      console.error('Review-approve failed:', err)
      const errMsg = err?.response?.data?.message || err?.message || 'Gửi phê duyệt thất bại'
      setMessage(errMsg)
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selected?.id) return
    const comment = window.prompt('Nhập nhận xét (tuỳ chọn):')
    if (comment === null) return

    try {
      setActionLoading(true)
      setMessage('')
      const userId = getCurrentUserId()
      
      // ACADEMIC_AFFAIRS/RECTOR: approve (PENDING_APPROVAL → APPROVED)
      await syllabusApprovalService.approve(selected.id, userId, comment)
      
      setMessage('Đã phê duyệt giáo trình')
      setMessageType('success')
      setSelected(null)
      setDetail(null)
      await fetchSyllabi()
    } catch (err) {
      console.error('Approve failed:', err)
      const errMsg = err?.response?.data?.message || err?.message || 'Phê duyệt thất bại'
      setMessage(errMsg)
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selected?.id) return
    const reason = window.prompt('Nhập lý do từ chối (bắt buộc):')
    if (!reason) {
      setMessage('Phải nhập lý do từ chối')
      setMessageType('warning')
      return
    }

    try {
      setActionLoading(true)
      setMessage('')
      const userId = getCurrentUserId()
      
      await syllabusApprovalService.reject(selected.id, userId, reason)
      
      setMessage('Đã từ chối giáo trình')
      setMessageType('success')
      setSelected(null)
      setDetail(null)
      await fetchSyllabi()
    } catch (err) {
      console.error('Reject failed:', err)
      const errMsg = err?.response?.data?.message || err?.message || 'Từ chối thất bại'
      setMessage(errMsg)
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!selected?.id) return
    if (!window.confirm('Bạn chắc chắn muốn xuất bản giáo trình này?')) return

    try {
      setActionLoading(true)
      setMessage('')
      const userId = getCurrentUserId()
      
      // RECTOR only: publish (APPROVED → PUBLISHED)
      await syllabusApprovalService.publish(selected.id, userId)
      
      setMessage('Đã xuất bản giáo trình')
      setMessageType('success')
      setSelected(null)
      setDetail(null)
      await fetchSyllabi()
    } catch (err) {
      console.error('Publish failed:', err)
      const errMsg = err?.response?.data?.message || err?.message || 'Xuất bản thất bại'
      setMessage(errMsg)
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    if (!selected && syllabi?.length > 0) {
      const first = syllabi[0]
      setSelected(first)
      loadDetailAndVersions(first)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabi])

  const getStatusBadge = (status) => {
    const map = {
      'DRAFT': { bg: 'bg-gray-100', color: 'text-gray-800', text: 'Nháp' },
      'PENDING_REVIEW': { bg: 'bg-yellow-100', color: 'text-yellow-800', text: 'Chờ review' },
      'PENDING_APPROVAL': { bg: 'bg-blue-100', color: 'text-blue-800', text: 'Chờ phê duyệt' },
      'APPROVED': { bg: 'bg-green-100', color: 'text-green-800', text: 'Đã phê duyệt' },
      'PUBLISHED': { bg: 'bg-purple-100', color: 'text-purple-800', text: 'Đã xuất bản' },
      'REJECTED': { bg: 'bg-red-100', color: 'text-red-800', text: 'Bị từ chối' }
    }
    const badge = map[status] || map['DRAFT']
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.color}`}>{badge.text}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {approvalStage === 'REVIEW' ? '👀 Duyệt Review' : '✓ Phê Duyệt'} Giáo Trình
            </h1>
            <p className="text-gray-600 mt-1">Xin chào, <span className="font-semibold">{user?.name || 'User'}</span></p>
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
      <div className="container mx-auto px-6 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 border ${
            messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
            messageType === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            messageType === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {messageType === 'success' && <CheckCircle size={20} />}
            {messageType === 'error' && <XCircle size={20} />}
            {messageType === 'warning' && <AlertCircle size={20} />}
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải danh sách giáo trình...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Syllabus List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Danh sách chờ {approvalStage === 'REVIEW' ? 'review' : 'phê duyệt'}</h2>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {syllabi?.length > 0 ? (
                    syllabi.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelect(s)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selected?.id === s.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{s.subjectCode || s.syllabusCode || 'N/A'}</div>
                        <div className="text-xs text-gray-600 mt-1">{s.subjectName || 'Chưa rõ'}</div>
                        <div className="text-xs mt-2">{getStatusBadge(s.status)}</div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">Không có giáo trình nào chờ xử lý</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detail & Actions */}
            <div className="lg:col-span-3 space-y-6">
              {selected && detail ? (
                <>
                  {/* Detail Card */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{detail.subjectName || detail.subject || 'N/A'}</h2>
                        <p className="text-gray-600 mt-1">Mã: {detail.subjectCode || detail.courseCode || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(detail.status)}
                        <p className="text-sm text-gray-600 mt-2">Phiên bản: {detail.version || 1}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-xs text-gray-600 mb-1">Giảng viên</p>
                        <p className="font-semibold text-gray-900">{detail.lecturer || detail.createdByName || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-xs text-gray-600 mb-1">Năm học / Kỳ</p>
                        <p className="font-semibold text-gray-900">{detail.academicYear || 'N/A'} / Kỳ {detail.semester || 'N/A'}</p>
                      </div>
                    </div>

                    {detail.content && (
                      <>
                        <h3 className="font-semibold text-gray-900 mb-3">Nội dung giáo trình</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded mb-6">
                          {typeof detail.content === 'object' ? (
                            <>
                              <p><strong>Số lượng Modules:</strong> {detail.content.modules?.length || 0}</p>
                              <p><strong>Mục tiêu CLO:</strong> {detail.content.objectives?.length || 0}</p>
                              <p><strong>Số tín chỉ:</strong> {detail.content.credits || 'Chưa xác định'}</p>
                              <p><strong>Đánh giá:</strong> {detail.content.assessment ? 'Có' : 'Không'}</p>
                            </>
                          ) : (
                            <p>Nội dung: {detail.content}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Rejection Reason */}
                    {detail.status === 'REJECTED' && rejectionReason && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <XCircle size={18} />
                          Lý do từ chối
                        </h3>
                        <p className="text-red-800 text-sm">{rejectionReason}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      {approvalStage === 'REVIEW' ? (
                        <>
                          <button
                            onClick={handleReviewApprove}
                            disabled={actionLoading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                          >
                            Gửi để phê duyệt
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                          >
                            ✓ Phê duyệt
                          </button>
                          <button
                            onClick={handlePublish}
                            disabled={actionLoading}
                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
                          >
                            📢 Xuất bản
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Version History */}
                  {versionHistory && versionHistory.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Lịch sử phiên bản</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {versionHistory.map((v, idx) => (
                          <div key={idx} className="p-3 border border-gray-200 rounded text-sm bg-gray-50">
                            <p className="font-semibold">Phiên bản {v.version || idx + 1}</p>
                            <p className="text-xs text-gray-600">Trạng thái: {v.status || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Chọn một giáo trình từ danh sách bên trái để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {actionLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4">
            <p className="text-gray-700 font-medium">Đang xử lý...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyllabusApproval
