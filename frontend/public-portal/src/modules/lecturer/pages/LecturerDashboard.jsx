import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BookOpen, LogOut, FileText, Plus, Edit, Eye, Trash2, Upload, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../../services/api/apiClient'
import syllabusServiceV2 from '../services/syllabusServiceV2'
import SyllabusEditorPage from './SyllabusEditorPage'

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

const LecturerDashboard = ({ user, onLogout }) => {
  // Support receiving user as prop or falling back to localStorage
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })()
  const currentUser = user || storedUser

  const [syllabi, setSyllabi] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    published: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('syllabi') // syllabi only

  // Documents upload state
  const [documentFile, setDocumentFile] = useState(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentDescription, setDocumentDescription] = useState('')
  const [syllabusDocuments, setSyllabusDocuments] = useState([])

  // Simple toast notifications (UI-only, lightweight)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' })
  const showToast = (message, type = 'info', ms = 3500) => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), ms)
  }
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  
  // Create/Edit form (simplified - only basic fields, content will be added later)
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    summary: ''
  })

  // Debounced load function to prevent excessive API calls
  const debouncedLoad = useRef(null)
  const loadingRef = useRef(false)
  const lastFetchRef = useRef(0)

  const loadLecturerSyllabi = useCallback(async () => {
    const now = Date.now()
    // prevent overlapping requests and throttle frequent calls
    if (loadingRef.current && (now - lastFetchRef.current) < 3000) return
    if ((now - lastFetchRef.current) < 1000) return
    loadingRef.current = true
    lastFetchRef.current = now
    try {
      setLoading(true)
      if (!currentUser) {
        console.warn('No user available')
        loadingRef.current = false
        setLoading(false)
        return
      }

      // Try multiple API endpoints for lecturer syllabi
      const lecturerId = currentUser?.userId || currentUser?.id || currentUser?.lecturerId
      console.log('Loading syllabi for lecturer:', lecturerId)
      
      // backend exposes /api/syllabuses (plural); no dedicated /api/syllabus/lecturer/{id}
      // Using timeout and retry logic in apiClient
      // Request path must include /api so dev proxy properly forwards to API Gateway
      const res = await apiClient.get('/api/syllabuses', { 
        params: { page: 0, size: 200 },
        // Override timeout for this specific request if needed
        timeout: 30000
      })
      let data = res.data?.content || res.data || []
      // filter client-side by createdBy (server stores X-User-Id in createdBy)
      // Accept multiple possible user id fields from frontend user object
      const candidates = [currentUser?.userId, currentUser?.id, currentUser?.lecturerId, currentUser?.username, currentUser?.userName, currentUser?.name, currentUser?.email]
        .filter(Boolean)
      console.debug('lecturerId candidates:', candidates, 'server sample createdBy:', data.length ? data[0].createdBy : null)
      if (candidates.length > 0) {
        data = data.filter((s) => candidates.some(c => String(c) === String(s.createdBy)))
      } else {
        // fallback: do not filter if we don't know current user id (helps debugging)
        console.warn('No lecturerId candidate found in currentUser, skipping client-side filter')
      }

      setSyllabi(data)
      
      // Calculate stats
      const total = data.length
      const draft = data.filter(s => s.status === 'DRAFT').length
      const pending = data.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'PENDING_APPROVAL').length
      const approved = data.filter(s => s.status === 'APPROVED').length
      const published = data.filter(s => s.status === 'PUBLISHED').length
      const rejected = data.filter(s => s.status === 'REJECTED').length
      
      setStats({ total, draft, pending, approved, published, rejected })
      console.log('Syllabi loaded successfully:', { total, draft, pending, approved, published, rejected })
    } catch (err) {
      console.error('Failed to load syllabi:', err)
      // Show user-friendly error message
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách giáo trình'
      showToast(`Lỗi: ${errorMsg}`, 'error')

      // Do NOT inject demo data. Use server response only — clear lists/stats on error.
      setSyllabi([])
      setStats({ total: 0, draft: 0, pending: 0, approved: 0, published: 0, rejected: 0 })
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [currentUser])

  useEffect(() => {
    if (!debouncedLoad.current) {
      debouncedLoad.current = debounce(loadLecturerSyllabi, 1000)
    }

    if (currentUser) {
      debouncedLoad.current()
    }
  }, [currentUser, loadLecturerSyllabi])

  const handleCreateSyllabus = async () => {
    try {
      if (!formData.subjectCode.trim() || !formData.subjectName.trim()) {
        showToast('Vui lòng nhập mã môn và tên môn', 'warning')
        return
      }

      const payload = {
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        summary: formData.summary,
        content: '{}' // Empty content placeholder for now
      }

      const res = await apiClient.post('/api/syllabuses', payload, {
        headers: { 'X-User-Id': currentUser?.userId || currentUser?.id }
      })
      console.log('Created syllabus:', res.data)
      setShowCreateModal(false)
      resetForm()
      loadLecturerSyllabi()
      showToast('Tạo giáo trình thành công', 'success')
    } catch (err) {
      console.error('Create error:', err)
      showToast(err?.response?.data?.message || 'Tạo giáo trình thất bại', 'error')
    }
  }

  const handleUpdateSyllabus = async () => {
    try {
      if (!formData.subjectName.trim()) {
        showToast('Vui lòng nhập tên môn', 'warning')
        return
      }

      const rootId = selectedSyllabus?.rootSyllabusId || selectedSyllabus?.id

      const payload = {
        subjectName: formData.subjectName,
        summary: formData.summary
      }

      const res = await apiClient.post(`/api/syllabuses/${rootId}/versions`, payload, {
        headers: { 'X-User-Id': currentUser?.userId || currentUser?.id }
      })
      console.log('Updated syllabus:', res.data)
      setShowEditModal(false)
      resetForm()
      loadLecturerSyllabi()
      showToast('Cập nhật giáo trình thành công', 'success')
    } catch (err) {
      console.error('Update error:', err)
      showToast(err?.response?.data?.message || 'Cập nhật giáo trình thất bại', 'error')
    }
  }

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm('Bạn có chắc muốn xoá giáo trình này?')) return
    try {
      await apiClient.delete(`/api/syllabuses/${syllabusId}`)
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Delete error:', err)
      showToast('Xoá giáo trình thất bại', 'error')
    }
  }

  const handleSubmitForReview = async (syllabusId) => {
    if (!window.confirm('Gửi giáo trình này để phê duyệt?')) return
    try {
      await apiClient.post(`/api/syllabuses/${syllabusId}/submit`)
      loadLecturerSyllabi()
      showToast('Đã gửi giáo trình để phê duyệt', 'success')
    } catch (err) {
      console.error('Submit error:', err)
      showToast('Gửi phê duyệt thất bại', 'error')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (syllabus) => {
    setSelectedSyllabus(syllabus)
    setFormData({
      subjectCode: syllabus.subjectCode || syllabus.courseCode || '',
      subjectName: syllabus.subjectName || syllabus.courseName || '',
      summary: syllabus.summary || ''
    })
    setShowEditModal(true)
  }

  const openDetailModal = async (syllabus) => {
    setSelectedSyllabus(syllabus)
    setShowDetailModal(true)
    // Optionally load more details
    try {
      const res = await apiClient.get(`/api/syllabuses/${syllabus.id}`)
      setSelectedSyllabus(res.data)
      // load documents for this syllabus
      try {
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(res.data.id)
        setSyllabusDocuments(docsRes.data || docsRes || [])
      } catch (dErr) {
        console.debug('Failed to load syllabus documents:', dErr)
        setSyllabusDocuments([])
      }
    } catch (err) {
      console.error('Load detail error:', err)
    }
  }

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const res = await syllabusServiceV2.downloadDocument(documentId)
      const blob = (res.data instanceof Blob)
        ? res.data
        : new Blob([res.data], { type: res.headers?.['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || `document-${documentId}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      showToast('Tải tài liệu thất bại', 'error')
    }
  }

  const handleViewDocument = async (documentId) => {
    try {
      const res = await syllabusServiceV2.downloadDocument(documentId)
      const blob = (res.data instanceof Blob)
        ? res.data
        : new Blob([res.data], { type: res.headers?.['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      // open in new tab for inline viewing
      window.open(url, '_blank')
      // revoke after a delay to allow tab to load
      setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch (err) {
      console.error('View error:', err)
      showToast('Không thể xem tài liệu', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      subjectCode: '',
      subjectName: '',
      summary: ''
    })
    setSelectedSyllabus(null)
  }

  const resetDocumentsForm = () => {
    setDocumentFile(null)
    setDocumentTitle('')
    setDocumentDescription('')
    // Don't reset selectedSyllabus - it's set when opening the modal
  }

  const handleAddDocument = async () => {
    try {
      if (!selectedSyllabus) {
        showToast('Vui lòng chọn giáo trình', 'warning')
        return
      }
      if (!documentTitle.trim()) {
        showToast('Vui lòng nhập tiêu đề tài liệu', 'warning')
        return
      }
      if (!documentFile) {
        showToast('Vui lòng chọn tệp tài liệu', 'warning')
        return
      }

      const formDataUpload = new FormData()
      formDataUpload.append('file', documentFile)
      formDataUpload.append('title', documentTitle)
      formDataUpload.append('description', documentDescription)
      formDataUpload.append('syllabusId', selectedSyllabus.id)

      // Call the syllabus documents API
      const res = await syllabusServiceV2.uploadDocument(selectedSyllabus.id, documentFile, documentTitle, documentDescription, currentUser?.userId || currentUser?.id)
      console.log('Upload document response:', res?.data)
      showToast('Thêm tài liệu thành công', 'success')
      setShowDocumentsModal(false)
      resetDocumentsForm()
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Add document error:', err)
      showToast(err?.response?.data?.message || 'Thêm tài liệu thất bại', 'error')
    }
  }

  const filteredSyllabi = syllabi.filter(s => {
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
    const matchSearch = !searchQuery || 
      s.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const getStatusBadge = (status) => {
    const statusMap = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: <FileText size={14} />, text: 'Nháp' },
      'PENDING_REVIEW': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} />, text: 'Chờ duyệt' },
      'PENDING_APPROVAL': { color: 'bg-blue-100 text-blue-800', icon: <Clock size={14} />, text: 'Chờ phê duyệt' },
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} />, text: 'Đã duyệt' },
      'PUBLISHED': { color: 'bg-purple-100 text-purple-800', icon: <CheckCircle size={14} />, text: 'Đã xuất bản' },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} />, text: 'Bị từ chối' }
    }
    const badge = statusMap[status] || statusMap['DRAFT']
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Dashboard Giảng Viên</h1>
            <p className="text-gray-600 mt-1">
              Xin chào, <span className="font-semibold">{currentUser?.name || currentUser?.fullName || 'Lecturer'}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
          {/* Toast */}
          {toast.visible && (
            <div className="fixed top-6 right-6 z-50">
              <div className={`max-w-sm px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-yellow-600 text-black' : 'bg-indigo-600'}`}>
                {toast.message}
              </div>
            </div>
          )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Tổng giáo trình</h3>
              <BookOpen size={24} className="text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Nháp</h3>
              <FileText size={24} className="text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Chờ duyệt</h3>
              <Clock size={24} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Đã duyệt</h3>
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.approved + stats.published}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('syllabi')}
              className={`px-6 py-4 font-semibold ${activeTab === 'syllabi' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              Giáo trình của tôi
            </button>
          </div>

          {activeTab === 'syllabi' && (
            <div className="p-8">
              {/* Actions */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => { setSelectedSyllabus(null); setShowEditor(true); }}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  <Plus size={20} />
                  Tạo giáo trình mới
                </button>
                
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="DRAFT">Nháp</option>
                    <option value="PENDING_REVIEW">Chờ duyệt</option>
                    <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                    <option value="REJECTED">Bị từ chối</option>
                  </select>
                </div>
              </div>

              {/* Syllabi Table */}
              <div className="overflow-x-auto">
                <div className="relative">
                  {filteredSyllabi.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="mb-4 text-2xl">📭</div>
                      <div className="mb-2 font-semibold">Bạn chưa có giáo trình nào</div>
                      <div className="mb-4 text-sm">Bắt đầu tạo giáo trình mới để quản lý tài liệu và phiên bản.</div>
                      <div className="flex justify-center">
                        <button onClick={openCreateModal} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">Tạo giáo trình mới</button>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mã môn</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên giáo trình</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phiên bản</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cập nhật</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSyllabi.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.subjectCode}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.subjectName}</td>
                          <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">v{s.versionNo || s.version}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => openDetailModal(s)}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                title="Xem chi tiết"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSyllabus(s)
                                  setShowDocumentsModal(true)
                                  resetDocumentsForm()
                                }}
                                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                title="Thêm tài liệu"
                              >
                                <FileText size={16} />
                              </button>
                              {(s.status === 'DRAFT' || s.status === 'REJECTED') && (
                                <>
                                  <button
                                    onClick={() => { setSelectedSyllabus(s); setShowEditor(true); setShowDetailModal(false); }}
                                    className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleSubmitForReview(s.id)}
                                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                    title="Gửi phê duyệt"
                                  >
                                    <Upload size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSyllabus(s.id)}
                                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                    title="Xoá"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}

                  {loading && (
                    <div className="absolute top-2 right-2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tạo giáo trình mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã môn học *</label>
                <input
                  type="text"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: CS-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học *</label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: Lập trình C++"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt (summary)</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                  placeholder="Tóm tắt ngắn về giáo trình (tuỳ chọn)"
                />
              </div>
              {/* Content development postponed - will be added later */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Ghi chú:</strong> Nội dung giáo trình (modules, mục tiêu, đánh giá) sẽ được phát triển trong phiên tiếp theo. Hiện tại bạn có thể chỉnh sửa thông tin cơ bản về môn học.
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateSyllabus}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Tạo giáo trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-end">
              <button onClick={() => { setShowEditor(false); setSelectedSyllabus(null); }} className="px-3 py-1 bg-gray-200 rounded">Đóng</button>
            </div>
            <div className="p-4">
              <SyllabusEditorPage
                syllabusId={selectedSyllabus?.id}
                rootId={selectedSyllabus?.rootSyllabusId || selectedSyllabus?.id}
                user={currentUser}
                onBack={() => { setShowEditor(false); setSelectedSyllabus(null); loadLecturerSyllabi(); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to Create with different endpoint */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa giáo trình (Tạo phiên bản mới)</h2>
              <button onClick={() => {setShowEditModal(false); setSelectedSyllabus(null)}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã môn học *</label>
                <input
                  type="text"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học *</label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt (summary)</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                />
              </div>
              {/* Content development postponed - will be added later */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Ghi chú:</strong> Nội dung giáo trình (modules, mục tiêu, đánh giá) sẽ được phát triển trong phiên tiếp theo. Hiện tại bạn có thể chỉnh sửa thông tin cơ bản về môn học.
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowEditModal(false); setSelectedSyllabus(null)}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
              <button onClick={handleUpdateSyllabus} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Lưu phiên bản mới</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSyllabus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSyllabus.courseName}</h2>
                <p className="text-sm text-gray-600">{selectedSyllabus.courseCode} • Phiên bản {selectedSyllabus.version}</p>
              </div>
              <button onClick={() => {setShowDetailModal(false); setSelectedSyllabus(null); setSyllabusDocuments([])}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Trạng thái:</span>
                {getStatusBadge(selectedSyllabus.status)}
              </div>

              {selectedSyllabus.prerequisites && (<div><h3 className="font-semibold mb-2">Môn tiên quyết:</h3><p className="text-gray-700">{selectedSyllabus.prerequisites}</p></div>)}
              {selectedSyllabus.description && (<div><h3 className="font-semibold mb-2">Mô tả:</h3><p className="text-gray-700">{selectedSyllabus.description}</p></div>)}
              {selectedSyllabus.objectives && (<div><h3 className="font-semibold mb-2">Mục tiêu:</h3><p className="text-gray-700 whitespace-pre-wrap">{selectedSyllabus.objectives}</p></div>)}
              {selectedSyllabus.content && (<div><h3 className="font-semibold mb-2">Nội dung:</h3><p className="text-gray-700 whitespace-pre-wrap">{selectedSyllabus.content}</p></div>)}
              {selectedSyllabus.assessmentMethod && (<div><h3 className="font-semibold mb-2">Phương pháp đánh giá:</h3><p className="text-gray-700">{selectedSyllabus.assessmentMethod}</p></div>)}
              {selectedSyllabus.references && (<div><h3 className="font-semibold mb-2">Tài liệu tham khảo:</h3><p className="text-gray-700 whitespace-pre-wrap">{selectedSyllabus.references}</p></div>)}

              {/* Documents / Lectures list */}
              <div>
                <h3 className="font-semibold mb-2">Bài giảng</h3>
                {syllabusDocuments && syllabusDocuments.length > 0 ? (
                  <ul className="space-y-3">
                    {syllabusDocuments.map((doc) => (
                      <li key={doc.id} className="p-3 border rounded flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{doc.title || doc.originalName || doc.fileName || 'Không có tiêu đề'}</div>
                          {doc.description && <div className="text-sm text-gray-600">{doc.description}</div>}
                          <div className="text-xs text-gray-500 mt-1">Tải lên bởi {doc.uploadedBy || doc.createdBy || doc.createdByName || 'N/A'} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('vi-VN') : (doc.createdAt ? new Date(doc.createdAt).toLocaleString('vi-VN') : '')}</div>
                        </div>
                        <div className="flex-shrink-0 ml-4 flex flex-col gap-2">
                          <button onClick={() => handleViewDocument(doc.id)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded">Xem</button>
                          <button onClick={() => handleDownloadDocument(doc.id, doc.originalName || doc.fileName || doc.title)} className="px-3 py-1 bg-indigo-600 text-white rounded">Tải</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">Chưa có bài giảng</div>
                )}
              </div>

              <div className="text-sm text-gray-500 border-t pt-4">
                <div>Cập nhật lần cuối: {selectedSyllabus.updatedAt ? new Date(selectedSyllabus.updatedAt).toLocaleString('vi-VN') : '-'}</div>
                <div>Người tạo: {selectedSyllabus.createdBy || 'N/A'}</div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowDetailModal(false); setSelectedSyllabus(null); setSyllabusDocuments([])}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Đóng</button>
              {(selectedSyllabus.status === 'DRAFT' || selectedSyllabus.status === 'REJECTED') && (
                <button onClick={() => {setShowDetailModal(false); openEditModal(selectedSyllabus)}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Chỉnh sửa</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Thêm tài liệu giảng dạy</h2>
              <button onClick={() => {setShowDocumentsModal(false); resetDocumentsForm()}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-4">
              {selectedSyllabus && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-gray-600">Giáo trình được chọn</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedSyllabus.subjectCode} - {selectedSyllabus.subjectName}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề tài liệu *</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: Bài giảng 1 - Giới thiệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tuỳ chọn)</label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Mô tả nội dung tài liệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tệp tài liệu *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                  <input
                    type="file"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="document-file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  />
                  <label htmlFor="document-file" className="cursor-pointer block">
                    <div className="text-gray-600">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="font-semibold">Chọn tệp hoặc kéo thả</div>
                      <div className="text-sm text-gray-500">PDF, Word, PowerPoint, Excel (tối đa 50MB)</div>
                      {documentFile && <div className="text-sm text-green-600 mt-2">✓ {documentFile.name}</div>}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowDocumentsModal(false); setSelectedSyllabus(null); resetDocumentsForm()}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
              <button onClick={handleAddDocument} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Thêm tài liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LecturerDashboard