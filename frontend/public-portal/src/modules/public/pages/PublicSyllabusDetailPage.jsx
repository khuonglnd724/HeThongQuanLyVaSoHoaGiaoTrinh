import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, User, FileText, Loader, Eye, Zap, Download } from 'lucide-react'
import syllabusServiceV2 from '../../lecturer/services/syllabusServiceV2'
import apiClient from '../../../services/api/apiClient'

// CLO Details Display Component
const CLODetailsDisplay = ({ cloIds }) => {
  const [cloDetails, setCloDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadedIds, setLoadedIds] = useState([])

  useEffect(() => {
    const idsString = cloIds ? cloIds.sort().join(',') : ''
    const loadedString = loadedIds.sort().join(',')
    
    if (idsString === loadedString && Object.keys(cloDetails).length > 0) {
      setLoading(false)
      return
    }

    const fetchCLODetails = async () => {
      setLoading(true)
      const details = {}
      
      for (const id of (cloIds || [])) {
        try {
          const response = await syllabusServiceV2.getCLOById(id)
          const cloData = response.data?.data || response.data || response
          
          let mappedPlos = []
          try {
            const mappingRes = await apiClient.get(`/api/v1/mapping/clo/${id}`)
            const mappings = mappingRes.data?.data || []
            const ploIds = mappings.map(m => m.ploId || m.plo_id).filter(Boolean)
            
            mappedPlos = await Promise.all(
              ploIds.map(ploId => 
                apiClient.get(`/api/v1/plo/${ploId}`)
                  .then(r => r.data?.data || r.data)
                  .catch(() => null)
              )
            )
            mappedPlos = mappedPlos.filter(Boolean)
          } catch (mappingErr) {
            console.warn(`Failed to fetch PLO mappings for CLO ${id}:`, mappingErr)
          }
          
          details[id] = { ...cloData, mappedPlos }
        } catch (err) {
          console.error(`Failed to fetch CLO ${id}:`, err)
          details[id] = { id, cloCode: `CLO-${id}`, description: 'Không thể tải', mappedPlos: [] }
        }
      }
      
      setCloDetails(details)
      setLoadedIds(cloIds || [])
      setLoading(false)
    }

    if (cloIds && cloIds.length > 0) {
      fetchCLODetails()
    } else {
      setLoading(false)
    }
  }, [cloIds, loadedIds, cloDetails])

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">CLO liên kết ({cloIds?.length || 0})</h4>
      {loading ? (
        <div className="text-gray-600 text-sm py-2">
          <Loader className="inline animate-spin mr-2" size={16} />
          Đang tải thông tin CLO...
        </div>
      ) : (
        <div className="space-y-3">
          {(cloIds || []).map((id) => {
            const clo = cloDetails[id]
            const cloCode = clo?.cloCode || clo?.name || `CLO-${id}`
            const description = clo?.description || ''
            const mappedPlos = clo?.mappedPlos || []
            
            return (
              <div key={id} className="bg-white border border-indigo-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-indigo-900">
                      {cloCode}
                    </div>
                    {description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {description}
                      </div>
                    )}
                    {clo?.level && (
                      <div className="text-xs text-gray-500 mt-1">
                        Level: {clo.level}
                      </div>
                    )}
                  </div>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0">
                    #{id}
                  </span>
                </div>
                
                {mappedPlos && mappedPlos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">PLO liên kết:</p>
                    <div className="space-y-2">
                      {mappedPlos.map((plo, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-purple-50 border border-purple-200 rounded p-2"
                        >
                          <p className="font-medium text-purple-700">
                            {plo.ploCode || plo.code || 'PLO'}
                          </p>
                          <p className="text-purple-600 mt-0.5">
                            {plo.description || plo.ploName || 'Không có mô tả'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function PublicSyllabusDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [syllabus, setSyllabus] = useState(null)
  const [documents, setDocuments] = useState([])
  const [documentSummaries, setDocumentSummaries] = useState({})
  const [summarizingDocId, setSummarizingDocId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSyllabusDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        // Check if user is logged in - read directly from localStorage
        const user = localStorage.getItem('user')
        const isGuest = !user
        console.log('👤 User authentication status - isGuest:', isGuest, 'user:', user ? 'exists' : 'null')
        // Fetch syllabus info - use public endpoint for guest users, protected endpoint for logged-in users
        const syllabusUrl = isGuest 
          ? `/api/public/syllabuses/${id}` 
          : `/api/syllabuses/${id}`
        
        console.log(`📚 Fetching syllabus from: ${syllabusUrl}`)
        const syllabusResponse = await apiClient.get(syllabusUrl)
        const syllabusData = syllabusResponse.data?.data || syllabusResponse.data
        
        // Check if syllabus is empty (not found or not published for guest)
        if (!syllabusData || Object.keys(syllabusData).length === 0) {
          setError('Giáo trình không tồn tại hoặc chưa được công bố.')
          setLoading(false)
          return
        }
        
        setSyllabus(syllabusData)
        console.log('✅ Syllabus loaded:', syllabusData)
        
        // Fetch documents for this syllabus (for all users)
        try {
          const documentsUrl = isGuest 
            ? `/api/public/syllabuses/${id}/documents`
            : `/api/syllabus/documents/syllabus/${id}`
          
          console.log(`📄 Fetching documents from: ${documentsUrl} (isGuest=${isGuest})`)
          const documentsResponse = await apiClient.get(documentsUrl)
          const documentsData = documentsResponse.data?.data || documentsResponse.data
          const docs = documentsData.documents || documentsData || []
          setDocuments(docs)
          console.log('✅ Documents loaded:', documentsData)
            
          // Load cached summaries for documents that have aiIngestionJobId (only for logged-in users)
          if (!isGuest) {
            const summaries = {}
            for (const doc of docs) {
              const docId = doc.id || doc.documentId
              const jobId = doc.aiIngestionJobId
              
              if (jobId) {
                try {
                  console.log(`🔄 Loading cached summary for document ${docId}, jobId: ${jobId}`)
                  const jobRes = await apiClient.get(`/api/ai/jobs/${jobId}`)
                  const jobData = jobRes.data
                  
                  console.log(`📊 Job status for doc ${docId}:`, jobData)
                  
                  if (jobData.status === 'succeeded' && jobData.result) {
                    let summary = jobData.result
                    if (typeof summary === 'string') {
                      try {
                        summary = JSON.parse(summary)
                      } catch {}
                    }
                    summaries[docId] = summary
                    console.log(`✅ Cached summary loaded for document ${docId}:`, summary)
                  } else {
                    console.log(`⚠️ Job not succeeded for doc ${docId}, status: ${jobData.status}`)
                  }
                } catch (err) {
                  console.warn(`⚠️ Failed to load cached summary for document ${docId}:`, err)
                }
              }
            }
            
            console.log('📦 All loaded summaries:', summaries)
            if (Object.keys(summaries).length > 0) {
              setDocumentSummaries(summaries)
            }
          }
        } catch (docErr) {
          console.warn('⚠️ Failed to load documents:', docErr)
          // Continue even if documents fail - syllabus info is more important
          setDocuments([])
        }
      } catch (err) {
        console.error('❌ Error fetching syllabus:', err)
        setError('Không thể tải chi tiết giáo trình. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSyllabusDetail()
    }
  }, [id])

  const handleGenerateSummary = async (docId, docTitle) => {
    if (!docId) return
    
    setSummarizingDocId(docId)
    try {
      // Call correct AI API endpoint with proper payload
      const response = await apiClient.post('/api/ai/summary', { 
        syllabusId: id,
        documentId: docId,
        length: 'MEDIUM'
      })
      const jobId = response.data?.jobId
      
      if (!jobId) throw new Error('No jobId returned')
      
      console.log(`[Summary] Job created: ${jobId} for document ${docId}`)
      
      // Save jobId to syllabus_documents.ai_ingestion_job_id immediately
      try {
        console.log(`[Summary] Saving jobId to database...`)
        await apiClient.put(`/api/syllabus/documents/${docId}/update-job-id`, { jobId })
        console.log(`[Summary] ✅ jobId saved to database successfully`)
      } catch (saveError) {
        console.warn(`[Summary] ⚠️ Failed to save jobId:`, saveError)
        // Continue polling even if save fails
      }
      
      // Poll for result
      let attempts = 0
      const maxAttempts = 60
      const pollInterval = 2000
      
      const poll = async () => {
        if (attempts >= maxAttempts) {
          throw new Error('Timeout waiting for summary')
        }
        
        attempts++
        const statusRes = await apiClient.get(`/api/ai/jobs/${jobId}`)
        const status = statusRes.data
        
        if (status.status === 'succeeded' && status.result) {
          let summary = status.result
          if (typeof summary === 'string') {
            try {
              summary = JSON.parse(summary)
            } catch {}
          }
          
          setDocumentSummaries(prev => ({
            ...prev,
            [docId]: summary
          }))
          setSummarizingDocId(null)
          
          // Reload documents to update UI with new aiIngestionJobId
          try {
            const user = localStorage.getItem('user')
            if (user) {
              const documentsResponse = await apiClient.get(`/api/syllabus/documents/syllabus/${id}`)
              const documentsData = documentsResponse.data?.data || documentsResponse.data
              const docs = documentsData.documents || documentsData || []
              setDocuments(docs)
              console.log(`[Summary] ✅ Documents reloaded with updated jobId`)
            }
          } catch (reloadErr) {
            console.warn(`[Summary] Could not reload documents:`, reloadErr)
          }
          
          return summary
        } else if (status.status === 'FAILED') {
          throw new Error(status.error || 'Summary generation failed')
        } else {
          // Still running, poll again
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          return poll()
        }
      }
      
      await poll()
    } catch (err) {
      console.error('Error generating summary:', err)
      alert('Không thể tạo tóm tắt: ' + err.message)
      setSummarizingDocId(null)
    }
  }

  const handleViewDocument = async (downloadUrl, documentId) => {
    if (!downloadUrl && !documentId) return
    
    try {
      // Check if user is logged in - read directly from localStorage
      const user = localStorage.getItem('user')
      const isGuest = !user
      
      // Use appropriate endpoint based on user type
      const url = isGuest 
        ? `/api/public/documents/${documentId}/download`
        : downloadUrl  // Use original protected endpoint for students
      
      console.log(`📥 Downloading document from: ${url} (isGuest=${isGuest})`)
      
      // Download file via apiClient (includes auth token if available)
      // responseType: 'blob' tells axios to return data as Blob, not JSON
      const response = await apiClient.get(url, {
        responseType: 'blob'
      })
      
      // response.data is already a Blob when responseType='blob'
      const blob = response.data
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition']
      let fileName = 'document.pdf'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(?:(['"]).*?\1|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      console.log(`💾 Received file: ${fileName} (${blob.size} bytes, ${blob.type})`)
      
      // Create blob URL and open in new tab or download
      const blobUrl = URL.createObjectURL(blob)
      
      // Option 1: Open in new tab (for PDF, images, etc.)
      window.open(blobUrl, '_blank')
      
      // Option 2: Trigger download (uncomment if you prefer download instead of view)
      // const link = document.createElement('a')
      // link.href = blobUrl
      // link.download = fileName
      // link.click()
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    } catch (err) {
      console.error('Error viewing document:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Không thể mở tài liệu'
      alert(`${errorMsg}. Vui lòng thử lại.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="inline animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-600">Đang tải giáo trình...</p>
        </div>
      </div>
    )
  }

  if (error || !syllabus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText size={64} className="mx-auto mb-2" />
            <p className="text-xl font-semibold">{error || 'Không tìm thấy giáo trình'}</p>
          </div>
          <button
            onClick={() => navigate('/public/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="inline mr-2" size={16} />
            Quay lại tìm kiếm
          </button>
        </div>
      </div>
    )
  }

  const parsedContent = (() => {
    try {
      const content = syllabus.content
      if (typeof content === 'string') {
        return JSON.parse(content)
      }
      return content || {}
    } catch {
      return {}
    }
  })()

  // Check if user is logged in for rendering UI
  const isGuest = !localStorage.getItem('user')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} />
            <h1 className="text-4xl font-bold">{syllabus.subjectCode || 'N/A'}</h1>
          </div>
          <h2 className="text-2xl text-blue-100 mb-4">{syllabus.subjectName || 'Tên môn học'}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              Phiên bản: {syllabus.versionNo || 1}
            </span>
            <span className="flex items-center gap-2">
              <User size={16} />
              Tạo bởi: {syllabus.createdBy || 'N/A'}
            </span>
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
              ✓ Đã phê duyệt
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            {syllabus.summary && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Tóm tắt</h3>
                <p className="text-gray-700 leading-relaxed">{syllabus.summary}</p>
              </div>
            )}

            {/* Content Sections */}
            {parsedContent.learningOutcomes && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Learning Outcomes</h3>
                <div className="prose max-w-none text-gray-700">
                  <p>{parsedContent.learningOutcomes}</p>
                </div>
              </div>
            )}

            {parsedContent.courseContent && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Nội dung môn học</h3>
                <div className="prose max-w-none text-gray-700">
                  <p>{parsedContent.courseContent}</p>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {documents && documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📎 Bài giảng ({documents.length})
                </h3>
                <div className="space-y-4">
                  {documents.map((doc) => {
                    const docId = doc.id || doc.documentId
                    const summary = documentSummaries[docId]
                    const isSummarizing = summarizingDocId === docId
                    
                    return (
                      <div key={docId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{doc.originalName || doc.fileName || doc.title || 'Tài liệu'}</h4>
                            {doc.description && (
                              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDocument(doc.downloadUrl, doc.id || doc.documentId)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Xem tài liệu"
                            >
                              <Eye size={18} />
                            </button>
            {!isGuest && (
                              <button
                                onClick={() => handleGenerateSummary(docId, doc.originalName || doc.fileName)}
                                disabled={isSummarizing}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded transition disabled:opacity-50"
                                title="Tạo tóm tắt"
                              >
                                {isSummarizing ? (
                                  <Loader className="animate-spin" size={18} />
                                ) : (
                                  <Zap size={18} />
                                )}
                              </button>
                            )}
                            {isGuest && (
                              <button
                                onClick={() => navigate('/login')}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded transition cursor-not-allowed"
                                title="Đăng nhập để dùng chức năng tóm tắt AI"
                              >
                                <Zap size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Show summary if available */}
                        {summary && (
                          <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="text-purple-600" size={18} />
                              <p className="font-semibold text-purple-900">Tóm tắt AI</p>
                            </div>
                            
                            {/* Main Summary */}
                            {summary.summary && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-800 leading-relaxed">{summary.summary}</p>
                              </div>
                            )}
                            
                            {/* Bullets/Key Points */}
                            {summary.bullets && Array.isArray(summary.bullets) && summary.bullets.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-purple-900 mb-2">Điểm chính:</p>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {summary.bullets.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Keywords */}
                            {summary.keywords && Array.isArray(summary.keywords) && summary.keywords.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-purple-900 mb-2">Từ khóa:</p>
                                <div className="flex flex-wrap gap-2">
                                  {summary.keywords.map((keyword, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Target Audience & Prerequisites */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-purple-200">
                              {summary.targetAudience && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 mb-1">Đối tượng:</p>
                                  <p className="text-xs text-gray-700">{summary.targetAudience}</p>
                                </div>
                              )}
                              
                              {summary.prerequisites && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 mb-1">Yêu cầu:</p>
                                  <p className="text-xs text-gray-700">{summary.prerequisites}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* RAG indicator */}
                            {summary.ragUsed && (
                              <div className="mt-3 pt-3 border-t border-purple-200">
                                <p className="text-xs text-gray-500 italic">
                                  Tóm tắt được tạo bởi AI từ nội dung tài liệu
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CLO Display */}
                        {doc.cloIds && doc.cloIds.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <CLODetailsDisplay cloIds={doc.cloIds} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Mã môn:</span>
                  <span className="ml-2 font-medium text-gray-900">{syllabus.subjectCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {syllabus.status || 'APPROVED'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Phiên bản:</span>
                  <span className="ml-2 font-medium text-gray-900">{syllabus.versionNo || 1}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {syllabus.createdAt ? new Date(syllabus.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {syllabus.updatedAt ? new Date(syllabus.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Tài liệu</span>
                  <span className="text-2xl font-bold">{documents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Phiên bản</span>
                  <span className="text-2xl font-bold">{syllabus.versionNo || 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
