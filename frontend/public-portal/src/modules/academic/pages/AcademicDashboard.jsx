import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  LogOut,
  BarChart3,
  Eye,
  XCircle
} from 'lucide-react'
import syllabusApprovalService from '../services/syllabusApprovalService'
import academicAPI from '../services/academicService'

const AcademicDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionId, setActionId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [statsData, setStatsData] = useState({ departments: '--', programs: '--' })

  useEffect(() => {
    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'))
      } catch (e) {
        return null
      }
    })()

    if (!storedUser || storedUser.role !== 'ROLE_ACADEMIC_AFFAIRS') {
      navigate('/login')
      return
    }

    setUser(storedUser)
    loadPending()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const normalizeArray = (resp) => {
    const data = resp?.data
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.data)) return data.data
    if (data.data && Array.isArray(data.data.content)) return data.data.content
    if (Array.isArray(data.content)) return data.content
    return []
  }

  const loadStats = async () => {
    try {
      const [progResp, subjResp] = await Promise.all([
        academicAPI.getPrograms(),
        academicAPI.getSubjects()
      ])
      const programs = normalizeArray(progResp)
      const subjects = normalizeArray(subjResp)
      const deptCount = new Set(programs.map((p) => p.departmentId).filter(Boolean)).size
      setStatsData({
        programs: programs.length,
        departments: deptCount || 0,
        subjects: subjects.length,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const loadPending = async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await syllabusApprovalService.getPendingForApproval()
      setPending(Array.isArray(items) ? items : [])
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách giáo trình cần duyệt')
      setPending([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!user) return
    try {
      setActionId(id)
      await syllabusApprovalService.approve(id, user.userId)
      await loadPending()
    } catch (err) {
      alert(err.message || 'Không thể phê duyệt')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    if (!user) return
    const reason = prompt('Nhập lý do từ chối:')
    if (!reason || reason.trim() === '') return
    try {
      setActionId(id)
      await syllabusApprovalService.reject(id, user.userId, reason)
      await loadPending()
    } catch (err) {
      alert(err.message || 'Không thể từ chối')
    } finally {
      setActionId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const stats = useMemo(() => ({
    pending: pending.length,
    programs: statsData.programs,
    departments: statsData.departments,
  }), [pending, statsData])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Dashboard Phòng Đào Tạo</h1>
            <p className="text-gray-600 mt-1">Xin chào, <span className="font-semibold">{user?.name}</span></p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Giáo trình chờ duyệt</h3>
              <AlertCircle size={28} className="text-yellow-500" />
            </div>
            <p className="text-4xl font-bold text-purple-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-2">PENDING_APPROVAL</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Khoa/Bộ môn</h3>
              <Users size={28} className="text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-green-600">{stats.departments}</p>
            <p className="text-sm text-gray-500 mt-2">Đang hoạt động</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chương trình</h3>
              <BookOpen size={28} className="text-indigo-500" />
            </div>
            <p className="text-4xl font-bold text-indigo-600">{stats.programs}</p>
            <p className="text-sm text-gray-500 mt-2">CTĐT</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-gray-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tùy chọn</h3>
              <Settings size={28} className="text-gray-500" />
            </div>
            <p className="text-xl font-semibold text-gray-800">Cấu hình & báo cáo</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => navigate('/academic/programs')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-3"
          >
            <CheckCircle size={20} />
            Quản lý CTĐT & học phần
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-3">
            <BarChart3 size={20} />
            Báo cáo chương trình
          </button>
          <button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-3">
            <Settings size={20} />
            Cấu hình hệ thống
          </button>
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Giáo trình chờ phê duyệt</h2>
              <p className="text-sm text-gray-500">PENDING_APPROVAL → APPROVED / REJECTED</p>
            </div>
            <button
              onClick={loadPending}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium"
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
            <div className="text-center py-10 text-gray-600">Đang tải danh sách...</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-10 text-gray-600">Không có giáo trình cần phê duyệt</div>
          ) : (
            <div className="space-y-4">
              {pending.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.subjectCode || 'N/A'}</h3>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          PENDING_APPROVAL
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{item.subjectName || 'Chưa có tên'}</p>
                      <p className="text-sm text-gray-500">Giảng viên: {item.lecturerName || item.createdBy || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Ngày gửi: {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[220px]">
                      <button
                        onClick={() => setSelected(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={actionId === item.id}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50"
                        >
                          {actionId === item.id ? 'Đang xử lý...' : 'Phê duyệt'}
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={actionId === item.id}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết giáo trình</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Mã môn</p>
                  <p className="font-medium text-gray-900">{selected.subjectCode || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Tên môn</p>
                  <p className="font-medium text-gray-900">{selected.subjectName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Giảng viên</p>
                  <p className="font-medium text-gray-900">{selected.lecturerName || selected.createdBy || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Ngày gửi</p>
                  <p className="font-medium text-gray-900">{selected.submittedAt ? new Date(selected.submittedAt).toLocaleDateString('vi-VN') : '-'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">CLOs</h3>
                {selected.content?.objectives && Array.isArray(selected.content.objectives) && selected.content.objectives.length > 0 ? (
                  <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {selected.content.objectives.map((clo, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-3">
                        <span className="font-semibold text-gray-900 flex-shrink-0">CLO{idx + 1}:</span>
                        <span>{clo}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có CLO được định nghĩa</p>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Chương trình giảng dạy</h3>
                {selected.content?.modules && Array.isArray(selected.content.modules) && selected.content.modules.length > 0 ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {selected.content.modules.map((module, idx) => (
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
                  <p className="text-sm text-gray-500">Chưa có chương trình chi tiết</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleReject(selected.id)}
                  disabled={actionId === selected.id}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Từ chối
                </button>
                <button
                  onClick={() => handleApprove(selected.id)}
                  disabled={actionId === selected.id}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AcademicDashboard
