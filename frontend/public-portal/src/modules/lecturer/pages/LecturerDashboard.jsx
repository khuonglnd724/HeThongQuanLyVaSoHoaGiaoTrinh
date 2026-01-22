import React, { useState, useEffect } from 'react'
import { BookOpen, Users, BarChart3, LogOut, FileText, Plus, Edit, Eye, Trash2, Upload, CheckCircle, Clock, XCircle, AlertCircle, MessageSquare, ChevronDown, ChevronUp, Download } from 'lucide-react'
import apiClient from '../../../services/api/apiClient'
import DocumentUpload from '../components/DocumentUpload'

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
  const [activeTab, setActiveTab] = useState('syllabi') // syllabi, documents, workflow
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  
  // Create/Edit form
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    theoryHours: 30,
    practiceHours: 15,
    selfStudyHours: 45,
    prerequisites: '',
    description: '',
    objectives: '',
    content: '',
    assessmentMethod: '',
    references: ''
  })

  useEffect(() => {
    if (currentUser) {
      loadLecturerSyllabi()
    }
  }, [currentUser])

  const loadLecturerSyllabi = async () => {
    try {
      setLoading(true)
      if (!currentUser) {
        console.warn('No user available')
        return
      }

      // Try multiple API endpoints for lecturer syllabi
      const lecturerId = currentUser?.userId || currentUser?.id || currentUser?.lecturerId
      console.log('Loading syllabi for lecturer:', lecturerId)
      
      // backend exposes /api/syllabuses (plural); no dedicated /api/syllabus/lecturer/{id}
      const res = await apiClient.get('/api/syllabuses', { params: { page: 0, size: 200 } })
      let data = res.data?.content || res.data || []
      // filter client-side by createdBy (server stores X-User-Id in createdBy)
      data = data.filter((s) => String(s.createdBy) === String(lecturerId))

      setSyllabi(data)
      
      // Calculate stats
      const total = data.length
      const draft = data.filter(s => s.status === 'DRAFT').length
      const pending = data.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'PENDING_APPROVAL').length
      const approved = data.filter(s => s.status === 'APPROVED').length
      const published = data.filter(s => s.status === 'PUBLISHED').length
      const rejected = data.filter(s => s.status === 'REJECTED').length
      
      setStats({ total, draft, pending, approved, published, rejected })
    } catch (err) {
      console.error('Failed to load syllabi:', err)
      // Set demo data for development
      setSyllabi([
        { id: '1', courseCode: 'CS-101', courseName: 'Lập trình C++', status: 'APPROVED', version: 1, updatedAt: '2026-01-20' },
        { id: '2', courseCode: 'CS-102', courseName: 'Cơ sở dữ liệu', status: 'PENDING_REVIEW', version: 1, updatedAt: '2026-01-19' },
        { id: '3', courseCode: 'CS-103', courseName: 'Cấu trúc dữ liệu', status: 'DRAFT', version: 1, updatedAt: '2026-01-18' },
      ])
      setStats({ total: 3, draft: 1, pending: 1, approved: 1, published: 0, rejected: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSyllabus = async () => {
    try {
      const res = await apiClient.post('/api/syllabuses', formData)
      console.log('Created syllabus:', res.data)
      setShowCreateModal(false)
      resetForm()
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Create error:', err)
      alert(err?.response?.data?.message || 'Tạo giáo trình thất bại')
    }
  }

  const handleUpdateSyllabus = async () => {
    try {
      const rootId = selectedSyllabus?.rootSyllabusId || selectedSyllabus?.id
      const res = await apiClient.post(`/api/syllabuses/${rootId}/versions`, formData)
      console.log('Updated syllabus:', res.data)
      setShowEditModal(false)
      setSelectedSyllabus(null)
      resetForm()
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Update error:', err)
      alert(err?.response?.data?.message || 'Cập nhật giáo trình thất bại')
    }
  }

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm('Bạn có chắc muốn xoá giáo trình này?')) return
    try {
      await apiClient.delete(`/api/syllabuses/${syllabusId}`)
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Xoá giáo trình thất bại')
    }
  }

  const handleSubmitForReview = async (syllabusId) => {
    if (!window.confirm('Gửi giáo trình này để phê duyệt?')) return
    try {
      await apiClient.post(`/api/syllabuses/${syllabusId}/submit`)
      loadLecturerSyllabi()
      alert('Đã gửi giáo trình để phê duyệt')
    } catch (err) {
      console.error('Submit error:', err)
      alert('Gửi phê duyệt thất bại')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (syllabus) => {
    setSelectedSyllabus(syllabus)
    setFormData({
      courseCode: syllabus.courseCode || '',
      courseName: syllabus.courseName || '',
      credits: syllabus.credits || 3,
      theoryHours: syllabus.theoryHours || 30,
      practiceHours: syllabus.practiceHours || 15,
      selfStudyHours: syllabus.selfStudyHours || 45,
      prerequisites: syllabus.prerequisites || '',
      description: syllabus.description || '',
      objectives: syllabus.objectives || '',
      content: syllabus.content || '',
      assessmentMethod: syllabus.assessmentMethod || '',
      references: syllabus.references || ''
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
    } catch (err) {
      console.error('Load detail error:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      credits: 3,
      theoryHours: 30,
      practiceHours: 15,
      selfStudyHours: 45,
      prerequisites: '',
      description: '',
      objectives: '',
      content: '',
      assessmentMethod: '',
      references: ''
    })
  }

  const filteredSyllabi = syllabi.filter(s => {
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
    const matchSearch = !searchQuery || 
      s.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
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
              📚 Giáo trình của tôi
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 font-semibold ${activeTab === 'documents' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              📄 Tài liệu giảng dạy
            </button>
          </div>

          {activeTab === 'syllabi' && (
            <div className="p-8">
              {/* Actions */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={openCreateModal}
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
                {loading ? (
                  <div className="text-center py-8">Đang tải...</div>
                ) : filteredSyllabi.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Không có giáo trình nào</div>
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
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.courseCode}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{s.courseName}</td>
                          <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">v{s.version}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openDetailModal(s)}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                title="Xem chi tiết"
                              >
                                <Eye size={16} />
                              </button>
                              {(s.status === 'DRAFT' || s.status === 'REJECTED') && (
                                <>
                                  <button
                                    onClick={() => openEditModal(s)}
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
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-8">
              <DocumentUpload syllabi={syllabi} />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã môn học *</label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="VD: CS-101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học *</label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="VD: Lập trình C++"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tín chỉ</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý thuyết (giờ)</label>
                  <input
                    type="number"
                    value={formData.theoryHours}
                    onChange={(e) => setFormData({...formData, theoryHours: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thực hành (giờ)</label>
                  <input
                    type="number"
                    value={formData.practiceHours}
                    onChange={(e) => setFormData({...formData, practiceHours: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tự học (giờ)</label>
                  <input
                    type="number"
                    value={formData.selfStudyHours}
                    onChange={(e) => setFormData({...formData, selfStudyHours: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Môn tiên quyết</label>
                <input
                  type="text"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: CS-100, MATH-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Mô tả tổng quan về môn học"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mục tiêu</label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Mục tiêu học tập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={4}
                  placeholder="Nội dung chi tiết của môn học"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương pháp đánh giá</label>
                <textarea
                  value={formData.assessmentMethod}
                  onChange={(e) => setFormData({...formData, assessmentMethod: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                  placeholder="VD: Kiểm tra giữa kỳ 30%, Thi cuối kỳ 50%, Bài tập 20%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu tham khảo</label>
                <textarea
                  value={formData.references}
                  onChange={(e) => setFormData({...formData, references: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                  placeholder="Danh sách tài liệu tham khảo"
                />
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

      {/* Edit Modal - Similar to Create with different endpoint */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa giáo trình (Tạo phiên bản mới)</h2>
              <button onClick={() => {setShowEditModal(false); setSelectedSyllabus(null)}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã môn học *</label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học *</label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tín chỉ</label>
                  <input type="number" value={formData.credits} onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý thuyết (giờ)</label>
                  <input type="number" value={formData.theoryHours} onChange={(e) => setFormData({...formData, theoryHours: parseInt(e.target.value)})} className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thực hành (giờ)</label>
                  <input type="number" value={formData.practiceHours} onChange={(e) => setFormData({...formData, practiceHours: parseInt(e.target.value)})} className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tự học (giờ)</label>
                  <input type="number" value={formData.selfStudyHours} onChange={(e) => setFormData({...formData, selfStudyHours: parseInt(e.target.value)})} className="w-full border rounded-lg px-4 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Môn tiên quyết</label>
                <input type="text" value={formData.prerequisites} onChange={(e) => setFormData({...formData, prerequisites: e.target.value})} className="w-full border rounded-lg px-4 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mục tiêu</label>
                <textarea value={formData.objectives} onChange={(e) => setFormData({...formData, objectives: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={4} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương pháp đánh giá</label>
                <textarea value={formData.assessmentMethod} onChange={(e) => setFormData({...formData, assessmentMethod: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={2} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu tham khảo</label>
                <textarea value={formData.references} onChange={(e) => setFormData({...formData, references: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={2} />
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
              <button onClick={() => {setShowDetailModal(false); setSelectedSyllabus(null)}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Trạng thái:</span>
                {getStatusBadge(selectedSyllabus.status)}
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div><div className="text-xs text-gray-600">Tín chỉ</div><div className="text-lg font-bold">{selectedSyllabus.credits || 3}</div></div>
                <div><div className="text-xs text-gray-600">Lý thuyết</div><div className="text-lg font-bold">{selectedSyllabus.theoryHours || 30}h</div></div>
                <div><div className="text-xs text-gray-600">Thực hành</div><div className="text-lg font-bold">{selectedSyllabus.practiceHours || 15}h</div></div>
                <div><div className="text-xs text-gray-600">Tự học</div><div className="text-lg font-bold">{selectedSyllabus.selfStudyHours || 45}h</div></div>
              </div>

              {selectedSyllabus.prerequisites && (<div><h3 className="font-semibold mb-2">Môn tiên quyết:</h3><p className="text-gray-700">{selectedSyllabus.prerequisites}</p></div>)}
              {selectedSyllabus.description && (<div><h3 className="font-semibold mb-2">Mô tả:</h3><p className="text-gray-700">{selectedSyllabus.description}</p></div>)}
              {selectedSyllabus.objectives && (<div><h3 className="font-semibold mb-2">Mục tiêu:</h3><p className="text-gray-700 whitespace-pre-wrap">{selectedSyllabus.objectives}</p></div>)}
              {selectedSyllabus.content && (<div><h3 className="font-semibold mb-2">Nội dung:</h3><p className="text-gray-700 whitespace-pre-wrap">{selectedSyllabus.content}</p></div>)}
              {selectedSyllabus.assessmentMethod && (<div><h3 className="font-semibold mb-2">Phương pháp đánh giá:</h3><p className="text-gray-700">{selectedSyllabus.assessmentMethod}</p></div>)}
              {selectedSyllabus.references && (<div><h3 className="font-semibold mb-2">Tài liệu tham khảo:</h3><p className="text-gray-700 whitespace-pre-wrap">{selectedSyllabus.references}</p></div>)}

              <div className="text-sm text-gray-500 border-t pt-4">
                <div>Cập nhật lần cuối: {selectedSyllabus.updatedAt ? new Date(selectedSyllabus.updatedAt).toLocaleString('vi-VN') : '-'}</div>
                <div>Người tạo: {selectedSyllabus.createdBy || 'N/A'}</div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowDetailModal(false); setSelectedSyllabus(null)}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Đóng</button>
              {(selectedSyllabus.status === 'DRAFT' || selectedSyllabus.status === 'REJECTED') && (
                <button onClick={() => {setShowDetailModal(false); openEditModal(selectedSyllabus)}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Chỉnh sửa</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LecturerDashboard