import React, { useState, useEffect } from 'react'
import apiClient from '../../../services/api/apiClient'

const DocumentUpload = ({ syllabi = [], defaultSyllabusId = null }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({ totalDocuments: 0, totalSizeMB: 0 })
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(defaultSyllabusId)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (selectedSyllabusId) {
      fetchDocuments()
      fetchStatistics()
    }
  }, [selectedSyllabusId])

  const fetchDocuments = async () => {
    try {
      const res = await apiClient.get(`/api/syllabus/documents/syllabus/${selectedSyllabusId}`)
      setDocuments(res.data)
    } catch (err) {
      console.error('fetchDocuments error', err)
    }
  }

  const fetchStatistics = async () => {
    try {
      const res = await apiClient.get(`/api/syllabus/documents/syllabus/${selectedSyllabusId}/statistics`)
      setStats(res.data)
    } catch (err) {
      console.error('fetchStatistics error', err)
    }
  }

  const handleFileChange = (e) => {
    setError('')
    setSuccess('')
    const f = e.target.files?.[0]
    if (!f) return
    const max = 50 * 1024 * 1024
    if (f.size > max) {
      setError('Dung lượng tệp vượt quá 50MB')
      setSelectedFile(null)
      return
    }
    setSelectedFile(f)
  }

  const handleUpload = async () => {
    if (!selectedSyllabusId) return setError('Vui lòng chọn giáo trình')
    if (!selectedFile) return setError('Vui lòng chọn tệp để tải lên')

    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('syllabusId', selectedSyllabusId)
      if (description) formData.append('description', description)

      await apiClient.post('/api/syllabus/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Tải lên thành công')
      setSelectedFile(null)
      setDescription('')
      fetchDocuments()
      fetchStatistics()
    } catch (err) {
      console.error('upload error', err)
      setError(err?.response?.data?.error || 'Tải lên thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá tài liệu này?')) return
    try {
      await apiClient.delete(`/api/syllabus/documents/${id}`)
      fetchDocuments()
      fetchStatistics()
      setSuccess('Xoá thành công')
    } catch (err) {
      setError('Xoá thất bại')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Tải lên tài liệu giảng dạy</h3>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-2">Chọn giáo trình</label>
        <select
          value={selectedSyllabusId || ''}
          onChange={(e) => setSelectedSyllabusId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">-- Chọn giáo trình --</option>
          {syllabi.map((s) => (
            <option key={s.id} value={s.id}>{s.courseCode || s.id} - {s.courseName || s.title}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-2">Tệp</label>
        <input type="file" onChange={handleFileChange} />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-2">Mô tả (tuỳ chọn)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2" rows={2} />
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}
      {success && <div className="text-green-600 mb-3">{success}</div>}

      <div className="flex gap-3">
        <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {uploading ? 'Đang tải...' : 'Tải lên'}
        </button>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Tài liệu đã tải lên ({documents.length})</h4>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có tài liệu nào.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between border-b py-2">
                <div>
                  <div className="font-medium">{d.originalName}</div>
                  <div className="text-xs text-gray-500">v{d.syllabusVersion} • {d.fileSize} bytes</div>
                </div>
                <div className="flex gap-2">
                  <a href={d.downloadUrl} className="text-blue-600">Tải</a>
                  {!d.status || d.status === 'DRAFT' ? (
                    <button onClick={() => handleDelete(d.id)} className="text-red-600">Xoá</button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DocumentUpload
