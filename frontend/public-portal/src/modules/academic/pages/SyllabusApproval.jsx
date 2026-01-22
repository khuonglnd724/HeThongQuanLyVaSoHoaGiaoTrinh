import React, { useEffect, useState } from 'react'
import { useSyllabusApproval } from '../hooks/useSyllabusApproval'
import academicAPI from '../services/academicService'
import syllabusApprovalService from '../services/syllabusApprovalService'

export const SyllabusApproval = () => {
  const { syllabi, loading, error, fetchSyllabi } = useSyllabusApproval()

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [versionHistory, setVersionHistory] = useState([])
  const [approvalValidation, setApprovalValidation] = useState(null)
  const [prereqValidation, setPrereqValidation] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadDetailAndVersions = async (syllabus) => {
    if (!syllabus?.id) return
    try {
      setActionLoading(true)
      setMessage('')

      const [detailRes, versionsRes] = await Promise.all([
        syllabusApprovalService.getDetails(syllabus.id),
        academicAPI.getVersionHistory(syllabus.id),
      ])

      setDetail(detailRes?.data?.data || null)
      setVersionHistory(versionsRes?.data?.data || [])
      setApprovalValidation(null)
      setPrereqValidation(null)
    } catch (err) {
      console.error('Failed to load syllabus detail or versions', err)
      setMessage('Không tải được chi tiết hoặc lịch sử phiên bản giáo trình')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSelect = (syllabus) => {
    setSelected(syllabus)
    loadDetailAndVersions(syllabus)
  }

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

  const handleApproveReject = async (type) => {
    if (!selected?.id) return
    const isApprove = type === 'approve'
    const comment = window.prompt(
      isApprove ? 'Nhập nhận xét khi duyệt (tuỳ chọn):' : 'Nhập lý do từ chối (bắt buộc):',
    )
    if (!isApprove && !comment) {
      return
    }

    try {
      setActionLoading(true)
      setMessage('')
      const approvedBy = getCurrentUserId()

      if (isApprove) {
        await syllabusApprovalService.approve(selected.id, comment || '', approvedBy)
        setMessage('Đã duyệt giáo trình thành công')
      } else {
        await syllabusApprovalService.reject(selected.id, comment || '', approvedBy)
        setMessage('Đã từ chối giáo trình')
      }

      setSelected(null)
      setDetail(null)
      setVersionHistory([])
      setApprovalValidation(null)
      setPrereqValidation(null)
      await fetchSyllabi()
    } catch (err) {
      console.error('Failed to update approval status', err)
      setMessage('Cập nhật trạng thái duyệt thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleValidateApproval = async () => {
    if (!selected?.id) return
    try {
      setActionLoading(true)
      setMessage('')
      const res = await academicAPI.validateForApproval(selected.id)
      setApprovalValidation(res?.data?.data || null)
    } catch (err) {
      console.error('Failed to validate for approval', err)
      setMessage('Kiểm tra trước khi duyệt thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleValidatePrereq = async () => {
    if (!selected?.id) return
    try {
      setActionLoading(true)
      setMessage('')
      const res = await academicAPI.validatePrerequisites(selected.id)
      setPrereqValidation(res?.data?.data || null)
    } catch (err) {
      console.error('Failed to validate prerequisites', err)
      setMessage('Kiểm tra tiên quyết thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    if (!selected && syllabi?.length) {
      const first = syllabi[0]
      setSelected(first)
      loadDetailAndVersions(first)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabi])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold mb-2">Duyệt Giáo Trình</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <p>Đang tải danh sách giáo trình chờ duyệt...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Danh sách giáo trình chờ duyệt */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Danh sách chờ duyệt</h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {syllabi?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left border rounded px-3 py-2 text-sm hover:bg-indigo-50 ${
                    selected?.id === s.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{s.syllabusCode || `Syllabus #${s.id}`}</span>
                    <span className="text-xs text-gray-500">Version {s.version}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px] text-gray-600">
                    <span>Năm: {s.academicYear || '-'}</span>
                    <span>| Kỳ: {s.semester ?? '-'}</span>
                  </div>
                  <div className="mt-1 flex gap-2 items-center text-[11px]">
                    <span
                      className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                    >
                      Trạng thái: {s.status || 'N/A'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        s.approvalStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : s.approvalStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : s.approvalStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Duyệt: {s.approvalStatus || 'Chưa rõ'}
                    </span>
                  </div>
                </button>
              ))}
              {!syllabi?.length && (
                <p className="text-sm text-gray-500">Hiện không có giáo trình nào chờ duyệt.</p>
              )}
            </div>
          </div>

          {/* Chi tiết + hành động */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Chi tiết giáo trình</h2>
                  {detail && (
                    <p className="text-sm text-gray-600">
                      [{detail.syllabusCode}] Năm {detail.academicYear} - Kỳ {detail.semester}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleValidateApproval}
                    disabled={!selected || actionLoading}
                    className="px-3 py-1.5 text-xs rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    Kiểm tra trước khi duyệt
                  </button>
                  <button
                    type="button"
                    onClick={handleValidatePrereq}
                    disabled={!selected || actionLoading}
                    className="px-3 py-1.5 text-xs rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    Kiểm tra tiên quyết
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveReject('approve')}
                    disabled={!selected || actionLoading}
                    className="px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveReject('reject')}
                    disabled={!selected || actionLoading}
                    className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                </div>
              </div>

              {detail ? (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-semibold">Mã giáo trình:</span> {detail.syllabusCode}
                    </div>
                    <div>
                      <span className="font-semibold">Version hiện tại:</span> {detail.version}
                    </div>
                    <div>
                      <span className="font-semibold">Trạng thái:</span> {detail.status}
                    </div>
                    <div>
                      <span className="font-semibold">Trạng thái duyệt:</span> {detail.approvalStatus}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold">Mục tiêu học tập:</span>
                    <p className="mt-1 text-gray-700 whitespace-pre-line">
                      {detail.learningObjectives || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Nội dung môn học:</span>
                    <p className="mt-1 text-gray-700 whitespace-pre-line">
                      {detail.content || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-semibold">Phương pháp giảng dạy:</span>
                      <p className="mt-1 text-gray-700 whitespace-pre-line">
                        {detail.teachingMethods || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Đánh giá:</span>
                      <p className="mt-1 text-gray-700 whitespace-pre-line">
                        {detail.assessmentMethods || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chọn một giáo trình ở danh sách bên trái để xem chi tiết.</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kết quả validate duyệt */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold mb-2">Kết quả kiểm tra trước khi duyệt</h3>
                {approvalValidation ? (
                  <div className="space-y-2 text-xs text-gray-700">
                    <p>
                      Tổng quan:{' '}
                      <span
                        className={
                          approvalValidation.isReadyForApproval
                            ? 'text-green-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {approvalValidation.isReadyForApproval
                          ? 'ĐỦ điều kiện duyệt'
                          : 'CHƯA đủ điều kiện duyệt'}
                      </span>
                    </p>
                    <p>Điểm đánh giá: {approvalValidation.approvalScore}/100</p>
                    <p>Thông điệp: {approvalValidation.message}</p>
                    {approvalValidation.warnings?.length > 0 && (
                      <div>
                        <p className="font-semibold text-amber-700">Cảnh báo:</p>
                        <ul className="list-disc list-inside">
                          {approvalValidation.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {approvalValidation.errors?.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-700">Lỗi cần xử lý:</p>
                        <ul className="list-disc list-inside">
                          {approvalValidation.errors.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Bấm "Kiểm tra trước khi duyệt" để xem kết quả đánh giá tự động.
                  </p>
                )}
              </div>

              {/* Kết quả kiểm tra tiên quyết */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold mb-2">Kết quả kiểm tra tiên quyết</h3>
                {prereqValidation ? (
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 max-h-40 overflow-auto">
                    {JSON.stringify(prereqValidation, null, 2)}
                  </pre>
                ) : (
                  <p className="text-xs text-gray-500">
                    Bấm "Kiểm tra tiên quyết" để xem kết quả.
                  </p>
                )}
              </div>
            </div>

            {/* Lịch sử phiên bản */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold mb-2">Lịch sử phiên bản giáo trình</h3>
              {versionHistory?.length ? (
                <div className="max-h-52 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Phiên bản</th>
                        <th className="px-2 py-1 text-left">Loại thay đổi</th>
                        <th className="px-2 py-1 text-left">Trạng thái</th>
                        <th className="px-2 py-1 text-left">Duyệt</th>
                        <th className="px-2 py-1 text-left">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versionHistory.map((v) => (
                        <tr key={v.auditId} className="border-t">
                          <td className="px-2 py-1">{v.versionNumber}</td>
                          <td className="px-2 py-1">{v.changeType}</td>
                          <td className="px-2 py-1">{v.status}</td>
                          <td className="px-2 py-1">{v.approvalStatus}</td>
                          <td className="px-2 py-1 text-gray-500">
                            {v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Chưa có lịch sử phiên bản hoặc chưa chọn giáo trình.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {actionLoading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
          <div className="bg-white shadow px-4 py-2 rounded text-sm text-gray-700">
            Đang xử lý...
          </div>
        </div>
      )}
    </div>
  )
}

export default SyllabusApproval
