import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Eye, Send, AlertCircle } from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'
import { syllabusApprovalService } from '../services/syllabusApprovalService'
import SyllabusEditorPage from './SyllabusEditorPage'
import SyllabusCommentSection from '../components/SyllabusCommentSection'
import DocumentUploadForm from '../components/DocumentUploadForm'
import DocumentList from '../components/DocumentList'

const SyllabusListPage = ({ user }) => {
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [stats, setStats] = useState({
    total: 0, draft: 0, pending: 0, approved: 0, published: 0, rejected: 0
  })

  const pageSize = 10

  // Status badge colors
  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    PENDING_APPROVAL: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    PUBLISHED: 'bg-purple-100 text-purple-800',
    REJECTED: 'bg-red-100 text-red-800'
  }

  const statusIcons = {
    DRAFT: '📝',
    PENDING_REVIEW: '👀',
    PENDING_APPROVAL: '⏳',
    APPROVED: '✅',
    PUBLISHED: '📢',
    REJECTED: '❌'
  }

  const loadSyllabi = async () => {
    setLoading(true)
    try {
      const res = await syllabusServiceV2.list({
        q: searchQuery,
        status: statusFilter,
        page,
        size: pageSize
      })
      const data = res.data
      setSyllabi(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.totalElements || 0)

      // Calculate stats from response
      const allSyllabi = data.content || []
      setStats({
        total: allSyllabi.length,
        draft: allSyllabi.filter(s => s.status === 'DRAFT').length,
        pending: allSyllabi.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'PENDING_APPROVAL').length,
        approved: allSyllabi.filter(s => s.status === 'APPROVED').length,
        published: allSyllabi.filter(s => s.status === 'PUBLISHED').length,
        rejected: allSyllabi.filter(s => s.status === 'REJECTED').length
      })
    } catch (err) {
      console.error('Failed to load syllabi:', err)
      alert('Không thể tải danh sách giáo trình')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSyllabi()
  }, [page, statusFilter, searchQuery])

  const handleSubmit = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn gửi giáo trình này để xem xét?')) return
    setSubmitting(true)
    try {
      await syllabusApprovalService.submit(id, user?.userId || user?.id)
      alert('Gửi thành công. Giáo trình đang chờ phòng Đào Tạo xem xét.')
      loadSyllabi()
      setShowDetailModal(false)
    } catch (err) {
      console.error('Submit failed:', err)
      alert('Gửi thất bại: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Danh sách giáo trình</h1>
          <p className="text-gray-600">Quản lý và xây dựng các phiên bản giáo trình</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Tổng', value: stats.total, color: 'blue' },
            { label: 'Nháp', value: stats.draft, color: 'gray' },
            { label: 'Chờ', value: stats.pending, color: 'yellow' },
            { label: 'Duyệt', value: stats.approved, color: 'green' },
            { label: 'Xuất bản', value: stats.published, color: 'purple' },
            { label: 'Từ chối', value: stats.rejected, color: 'red' }
          ].map(stat => (
            <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-lg p-3`}>
              <p className={`text-${stat.color}-600 text-xs font-medium`}>{stat.label}</p>
              <p className={`text-${stat.color}-900 text-2xl font-bold`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(0)
                }}
                placeholder="Mã hoặc tên môn học..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(0)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả</option>
                <option value="DRAFT">Nháp</option>
                <option value="PENDING_REVIEW">Chờ xem xét</option>
                <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => loadSyllabi()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                ⟳ Làm mới
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowEditor(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Tạo mới
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : syllabi.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có giáo trình nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Môn học</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phiên bản</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cập nhật</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {syllabi.map((syllabus) => (
                    <tr key={syllabus.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{syllabus.subjectCode}</p>
                          <p className="text-sm text-gray-600">{syllabus.subjectName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">v{syllabus.version || 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[syllabus.status] || 'bg-gray-100'}`}>
                          {statusIcons[syllabus.status]} {syllabus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(syllabus.updatedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {selectedSyllabus.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => {
                                  setShowDetailModal(false)
                                  setShowEditor(true)
                                }}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                              >
                                Sửa
                              </button>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          {selectedSyllabus.status === 'REJECTED' && (
                            <>
                              <button
                                onClick={() => {
                                  setShowDetailModal(false)
                                  setShowEditor(true)
                                }}
                                className="text-orange-600 hover:text-orange-900 font-medium text-sm"
                              >
                                Sửa lại
                              </button>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedSyllabus(syllabus)
                              setShowDetailModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trang {page + 1}/{totalPages} • Tổng: {totalItems}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  ← Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSyllabus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSyllabus.subjectName}</h3>
                  <p className="text-gray-600">{selectedSyllabus.subjectCode} • v{selectedSyllabus.version}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Status Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedSyllabus.status]}`}>
                      {statusIcons[selectedSyllabus.status]} {selectedSyllabus.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Cập nhật</p>
                    <p className="font-medium">{new Date(selectedSyllabus.updatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedSyllabus.status === 'REJECTED' && selectedSyllabus.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex gap-2 text-red-800 text-sm">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Lý do từ chối:</p>
                        <p className="mt-1">{selectedSyllabus.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mb-6 flex gap-3 flex-wrap">
                {selectedSyllabus.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => handleSubmit(selectedSyllabus.id)}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      {submitting ? 'Đang gửi...' : 'Gửi để xem xét'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false)
                        setShowEditor(true)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} />
                      Chỉnh sửa
                    </button>
                  </>
                )}
                {selectedSyllabus.status === 'REJECTED' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false)
                        setShowEditor(true)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} />
                      Chỉnh sửa
                    </button>
                  </>
                )}
                {(selectedSyllabus.status === 'PENDING_REVIEW' || 
                  selectedSyllabus.status === 'PENDING_APPROVAL' || 
                  selectedSyllabus.status === 'APPROVED' || 
                  selectedSyllabus.status === 'PUBLISHED') && (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    Đang trong quy trình duyệt
                  </button>
                )}
              </div>

              {/* Documents Section */}
              <DocumentList 
                syllabusId={selectedSyllabus.id}
                userId={user?.userId || user?.id}
              />

              {/* Document Upload */}
              <DocumentUploadForm 
                syllabusId={selectedSyllabus.id}
                userId={user?.userId || user?.id}
              />

              {/* Comment Section */}
              <SyllabusCommentSection
                syllabusId={selectedSyllabus.id}
                syllabusStatus={selectedSyllabus.status}
                userId={user?.userId || user?.id}
                onCommentAdded={() => loadSyllabi()}
              />
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal: SyllabusEditorPage */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-end">
              <button onClick={() => { setShowEditor(false); setSelectedSyllabus(null); }} className="px-3 py-1 bg-gray-200 rounded">Đóng</button>
            </div>
            <div className="p-4">
              <SyllabusEditorPage
                syllabusId={selectedSyllabus?.id}
                rootId={selectedSyllabus?.rootSyllabusId || selectedSyllabus?.id}
                user={user}
                onBack={() => { setShowEditor(false); loadSyllabi(); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyllabusListPage
