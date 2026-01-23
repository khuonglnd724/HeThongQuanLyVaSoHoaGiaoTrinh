import React, { useState, useCallback } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'

const DocumentUpload = ({ syllabusId, userId }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  const MAX_SIZE_MB = 50

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Định dạng không hỗ trợ. Cho phép: PDF, DOC, DOCX, TXT`)
      return
    }

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Tệp quá lớn. Tối đa ${MAX_SIZE_MB}MB`)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!syllabusId) {
      setError('Vui lòng chọn giáo trình')
      return
    }
    if (!selectedFile) {
      setError('Vui lòng chọn tệp')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      await syllabusServiceV2.uploadDocument(
        syllabusId,
        selectedFile,
        '', // title not provided in this small form
        description,
        userId
      )
      setSuccess('✅ Tải lên thành công')
      setSelectedFile(null)
      setDescription('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Upload failed:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Tải lên thất bại'
      setError(`❌ ${errorMsg}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Upload size={18} />
        Tải lên tài liệu mới
      </h5>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tệp *</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            className="block w-full text-sm text-gray-500 file:px-3 file:py-1 file:border file:border-gray-300 file:rounded file:bg-white file:hover:bg-gray-50"
          />
          <p className="text-xs text-gray-600 mt-1">PDF, DOC, DOCX, TXT • Tối đa {MAX_SIZE_MB}MB</p>
        </div>

        {selectedFile && (
          <div className="p-2 bg-white border border-gray-200 rounded text-sm">
            📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tuỳ chọn)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả nội dung tài liệu..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          {uploading ? '⏳ Đang tải...' : '⬆️ Tải lên'}
        </button>
      </div>
    </div>
  )
}

export default DocumentUpload
