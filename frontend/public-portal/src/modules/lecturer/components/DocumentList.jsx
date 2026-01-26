import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Download, Trash2 } from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'

const DocumentList = ({ syllabusId, userId, onRefresh }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(true)

  const fetchDocuments = async () => {
    if (!syllabusId) return
    setLoading(true)
    setError('')
    try {
      const res = await syllabusServiceV2.getDocumentsBySyllabus(syllabusId)
      setDocuments(res.data || [])
    } catch (err) {
      console.error('Failed to fetch documents:', err)
      setError('Không thể tải danh sách tài liệu')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDocuments()
  }, [syllabusId])

  const handleDownload = async (docId, fileName) => {
    try {
      const blob = await syllabusServiceV2.downloadDocument(docId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'document'
      a.click()
    } catch (err) {
      console.error('Download failed:', err)
      alert('Tải xuống thất bại')
    }
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá tài liệu này?')) return
    try {
      await syllabusServiceV2.deleteDocument(docId, userId)
      setDocuments(documents.filter(d => d.id !== docId))
      alert('Xoá thành công')
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Xoá thất bại')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-4">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <h4 className="font-semibold text-gray-900">📎 Tài liệu ({documents.length})</h4>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4">
          {error && (
            <div className="text-red-600 text-sm mb-3">{error}</div>
          )}
          
          {loading ? (
            <div className="text-gray-500 text-sm">Đang tải...</div>
          ) : documents.length === 0 ? (
            <div className="text-gray-500 text-sm">Chưa có tài liệu nào</div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(doc.uploadedAt).toLocaleString('vi-VN')} • {(doc.fileSize / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(doc.id, doc.originalName)}
                      className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                      title="Tải xuống"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="Xoá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DocumentList
