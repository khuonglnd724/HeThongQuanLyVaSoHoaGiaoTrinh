import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, Clock, AlertCircle, LogOut, Eye, RefreshCw, Loader } from 'lucide-react'
import apiClient from '../services/api/apiClient'
import SyllabusDetailModal from '../shared/components/SyllabusDetailModal'
import syllabusServiceV2 from '../modules/lecturer/services/syllabusServiceV2'
import aiService from '../modules/lecturer/services/aiService'
import DocumentSummaryModal from '../modules/lecturer/components/DocumentSummaryModal'

/**
 * Rector Dashboard - Dành riêng cho Hiệu trưởng
 * Chức năng chính: Phê duyệt giáo trình (APPROVED → PUBLISHED)
 */
const RectorDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionId, setActionId] = useState(null)
  
  // Syllabus Detail Modal state
  const [showSyllabusDetailModal, setShowSyllabusDetailModal] = useState(false)
  const [syllabusDetailData, setSyllabusDetailData] = useState(null)
  const [syllabusDetailLoading, setSyllabusDetailLoading] = useState(false)
  const [syllabusDetailDocuments, setSyllabusDetailDocuments] = useState([])
  const [syllabusDetailDocumentsLoading, setSyllabusDetailDocumentsLoading] = useState(false)
  const [documentSummaries, setDocumentSummaries] = useState({})
  const [cloCheckLoading, setCloCheckLoading] = useState(false)
  const [cloCheckHistory, setCloCheckHistory] = useState({})
  const [showDocumentSummaryModal, setShowDocumentSummaryModal] = useState(false)
  const [selectedDocumentForSummary, setSelectedDocumentForSummary] = useState(null)

  // Load CLO check history from localStorage on mount
  useEffect(() => {
    const savedCloHistory = localStorage.getItem('cloCheckHistory')
    if (savedCloHistory) {
      try {
        setCloCheckHistory(JSON.parse(savedCloHistory))
      } catch (e) {
        console.warn('Failed to load CLO check history:', e)
      }
    }

    const savedDocSummaries = localStorage.getItem('documentSummaries')
    if (savedDocSummaries) {
      try {
        setDocumentSummaries(JSON.parse(savedDocSummaries))
      } catch (e) {
        console.warn('Failed to load document summaries:', e)
      }
    }
  }, [])

  // Save CLO check history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cloCheckHistory', JSON.stringify(cloCheckHistory))
  }, [cloCheckHistory])

  // Save document summaries to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('documentSummaries', JSON.stringify(documentSummaries))
  }, [documentSummaries])

  useEffect(() => {
    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'))
      } catch (e) {
        return null
      }
    })()

    if (!storedUser || storedUser.role !== 'ROLE_RECTOR') {
      navigate('/login')
      return
    }

    setUser(storedUser)
    loadApprovedSyllabi()
  }, [navigate])

  const loadApprovedSyllabi = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[RectorDashboard] Loading approved syllabi...')
      
      // Gọi API để lấy giáo trình ở trạng thái APPROVED
      const response = await apiClient.get('/api/syllabuses', {
        params: { status: 'APPROVED', size: 100 }
      })
      
      const data = response.data
      console.log('[RectorDashboard] Received data:', data)
      
      let syllabusArray = []
      if (Array.isArray(data)) {
        syllabusArray = data
      } else if (data.content && Array.isArray(data.content)) {
        syllabusArray = data.content
      } else if (data.data && Array.isArray(data.data)) {
        syllabusArray = data.data
      } else if (data.data && data.data.content && Array.isArray(data.data.content)) {
        syllabusArray = data.data.content
      }

      console.log('[RectorDashboard] Processed array:', syllabusArray)
      setApproved(syllabusArray)
    } catch (err) {
      console.error('[RectorDashboard] Error loading syllabi:', err)
      setError('Lỗi khi tải danh sách giáo trình. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id) => {
    if (!user) return
    
    if (!window.confirm('Bạn chắc chắn muốn phê duyệt giáo trình này?')) {
      return
    }

    try {
      setActionId(id)
      const userId = user?.userId || user?.id || localStorage.getItem('userId')
      
      await apiClient.post(
        `/api/syllabuses/${id}/publish`,
        { reason: '' },
        { headers: { 'X-User-Id': userId } }
      )
      
      alert('✅ Giáo trình đã được phê duyệt thành công!')
      setShowSyllabusDetailModal(false)
      setSyllabusDetailData(null)
      await loadApprovedSyllabi()
    } catch (err) {
      console.error('[RectorDashboard] Publish error:', err)
      alert('❌ Lỗi khi phê duyệt: ' + (err.response?.data?.message || err.message))
    } finally {
      setActionId(null)
    }
  }

  const handleViewSyllabusDetail = async (item) => {
    try {
      setSyllabusDetailLoading(true)
      setShowSyllabusDetailModal(true)
      setSyllabusDetailData(null)
      setSyllabusDetailDocuments([])

      let syllabusId = item.entityId || item.id || item.syllabusId
      if (!syllabusId) {
        alert('Không tìm thấy ID giáo trình')
        return
      }

      const res = await apiClient.get(`/api/syllabuses/${syllabusId}`)
      const syllabusData = res.data
      
      setSyllabusDetailData(syllabusData)
      setSyllabusDetailLoading(false)
      
      // Fetch documents for this syllabus
      setSyllabusDetailDocumentsLoading(true)
      try {
        console.log('[RectorDashboard] Fetching documents for syllabus:', syllabusId)
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(syllabusId)
        const docsData = docsRes.data?.data || docsRes.data || []
        const docs = docsData.documents || docsData || []
        console.log('[RectorDashboard] Documents loaded:', docs)
        setSyllabusDetailDocuments(docs)
        
        // Load cached summaries for documents that have aiIngestionJobId
        const summaries = {}
        for (const doc of docs) {
          const docId = doc.id || doc.documentId
          const jobId = doc.aiIngestionJobId
          
          if (jobId) {
            try {
              console.log(`[RectorDashboard] Loading cached summary for doc ${docId}, jobId: ${jobId}`)
              const jobRes = await aiService.getJobStatus(jobId)
              const jobData = jobRes.data || jobRes
              
              if (jobData.status === 'succeeded' && jobData.result) {
                let summaryData = jobData.result
                if (typeof summaryData === 'string') {
                  try {
                    summaryData = JSON.parse(summaryData)
                  } catch {}
                }
                // Set summary data directly (not wrapped) - modal expects direct access to properties
                summaries[docId] = summaryData
                console.log(`[RectorDashboard] ✅ Cached summary loaded for doc ${docId}`)
              }
            } catch (err) {
              console.warn(`[RectorDashboard] Failed to load cached summary for doc ${docId}:`, err)
            }
          }
        }
        
        if (Object.keys(summaries).length > 0) {
          setDocumentSummaries(prev => ({ ...prev, ...summaries }))
        }
      } catch (docErr) {
        console.warn('[RectorDashboard] Failed to load documents:', docErr)
        setSyllabusDetailDocuments([])
      } finally {
        setSyllabusDetailDocumentsLoading(false)
      }
    } catch (err) {
      console.error('[RectorDashboard] Error loading detail:', err)
      alert('Lỗi khi tải chi tiết giáo trình')
      setShowSyllabusDetailModal(false)
      setSyllabusDetailLoading(false)
    }
  }

  const handleCheckCLOPLOConsistency = async (syllabusData = null) => {
    const targetSyllabus = syllabusData
    
    if (!targetSyllabus || !targetSyllabus.id) {
      alert('Không tìm thấy giáo trình')
      return
    }

    setCloCheckLoading(true)
    try {
      console.log('[RectorDashboard] Starting CLO-PLO check with data:', {
        syllabusId: targetSyllabus.id,
        subjectCode: targetSyllabus.subjectCode,
        subjectName: targetSyllabus.subjectName
      })
      
      const content = typeof targetSyllabus.content === 'string'
        ? JSON.parse(targetSyllabus.content)
        : targetSyllabus.content

      const cloIds = content?.cloPairIds || content?.cloIds || []
      console.log('[RectorDashboard] CLO IDs found:', cloIds)
      
      if (cloIds.length === 0) {
        alert('Giáo trình này chưa có CLO liên kết')
        setCloCheckLoading(false)
        return
      }

      console.log(`[RectorDashboard] Fetching details for ${cloIds.length} CLOs...`)
      
      // STEP 1: Fetch CLO details + collect all PLO IDs from mappings
      const cloDetails = {}
      const cloToMappedPloIds = {}
      const allPloIds = new Set()
      
      for (const cloId of cloIds) {
        try {
          const cloRes = await syllabusServiceV2.getCLOById(cloId)
          const cloData = cloRes.data?.data || cloRes.data || {}
          cloDetails[cloId] = {
            code: cloData.cloCode || cloData.code || `CLO-${cloId}`,
            description: cloData.description || ''
          }
          
          try {
            const mappingRes = await apiClient.get(`/api/v1/mapping/clo/${cloId}`)
            const mappings = mappingRes.data?.data || mappingRes.data || []
            const ploIds = mappings.map(m => m.ploId || m.plo_id).filter(Boolean)
            cloToMappedPloIds[cloId] = ploIds
            ploIds.forEach(ploId => allPloIds.add(ploId))
          } catch (mappingErr) {
            console.warn(`[RectorDashboard] Failed to fetch PLO mappings for CLO ${cloId}:`, mappingErr)
            cloToMappedPloIds[cloId] = []
          }
        } catch (cloErr) {
          console.warn(`[RectorDashboard] Failed to fetch CLO ${cloId}:`, cloErr)
          cloDetails[cloId] = {
            code: `CLO-${cloId}`,
            description: 'Không lấy được mô tả'
          }
          cloToMappedPloIds[cloId] = []
        }
      }

      // STEP 2: Fetch PLO details
      const ploIdToCode = {}
      const ploCodeToDetails = {}
      
      for (const ploId of allPloIds) {
        try {
          const ploRes = await apiClient.get(`/api/v1/plo/${ploId}`)
          const ploData = ploRes.data?.data || ploRes.data || {}
          const ploCode = ploData.ploCode || ploData.code || `PLO-${ploId}`
          ploIdToCode[ploId] = ploCode
          ploCodeToDetails[ploCode] = {
            code: ploCode,
            description: ploData.description || ''
          }
        } catch (ploErr) {
          console.warn(`[RectorDashboard] Failed to fetch PLO ${ploId}:`, ploErr)
        }
      }

      // STEP 3: Build final lists
      const cloList = Object.values(cloDetails).map(clo => ({
        id: clo.code,
        description: clo.description
      }))
      
      const ploList = Object.values(ploCodeToDetails).map(plo => ({
        id: plo.code,
        description: plo.description
      }))
      
      // STEP 4: Build mapping with validation
      const mappingInfo = {}
      for (const cloId of cloIds) {
        const cloCode = cloDetails[cloId]?.code
        const mappedPloIds = cloToMappedPloIds[cloId] || []
        const validPloCodesForClo = mappedPloIds
          .map(backendPloId => ploIdToCode[backendPloId])
          .filter(Boolean)
        
        if (validPloCodesForClo.length > 0) {
          mappingInfo[cloCode] = validPloCodesForClo
        }
      }
      
      if (ploList.length === 0) {
        alert('Không tìm thấy PLO nào để kiểm tra')
        setCloCheckLoading(false)
        return
      }
      
      // Call AI service - returns jobId immediately
      console.log('[RectorDashboard] Calling AI service...')
      const response = await aiService.checkCLOPLOConsistency(targetSyllabus.id, cloList, ploList, mappingInfo)
      const jobId = response.data?.jobId || response.jobId
      
      if (!jobId) {
        alert('Không nhận được Job ID từ AI service')
        setCloCheckLoading(false)
        return
      }

      console.log(`[RectorDashboard] Job ID: ${jobId}, polling for result...`)
      
      // Poll for result with intelligent backoff
      const maxWaitTime = 300000 // 5 minutes
      const startTime = Date.now()
      let pollInterval = 1000 // Start with 1 second
      let pollCount = 0
      
      const pollResult = await new Promise((resolve, reject) => {
        const pollFn = async () => {
          try {
            pollCount++
            const jobStatus = await aiService.getJobStatus(jobId)
            const jobData = jobStatus.data || jobStatus
            
            console.log(`[CLO Check] Poll #${pollCount} - Status: ${jobData.status}`)
            
            if (jobData.status === 'succeeded' || jobData.status === 'SUCCEEDED') {
              console.log('[CLO Check] ✅ Job succeeded!', jobData.result)
              resolve(jobData.result)
            } else if (jobData.status === 'failed' || jobData.status === 'FAILED' || jobData.status === 'canceled' || jobData.status === 'CANCELED') {
              reject(new Error(`Job failed with status: ${jobData.status}`))
            } else if (jobData.status === 'running' || jobData.status === 'RUNNING') {
              const elapsedTime = Date.now() - startTime
              if (elapsedTime > maxWaitTime) {
                reject(new Error('Timeout waiting for CLO check result'))
              } else {
                pollInterval = Math.min(5000, pollInterval + 500)
                setTimeout(pollFn, pollInterval)
              }
            } else {
              const elapsedTime = Date.now() - startTime
              if (elapsedTime > maxWaitTime) {
                reject(new Error('Timeout waiting for CLO check result'))
              } else {
                setTimeout(pollFn, pollInterval)
              }
            }
          } catch (err) {
            console.error(`[CLO Check] Poll error:`, err)
            reject(err)
          }
        }
        pollFn()
      })

      let resultData = pollResult
      if (typeof resultData === 'string') {
        resultData = JSON.parse(resultData)
      }

      // Save to history (SyllabusDetailModal will display the result)
      setCloCheckHistory(prev => ({
        ...prev,
        [targetSyllabus.id]: {
          jobId,
          result: resultData,
          syllabusName: `${targetSyllabus.subjectCode} - ${targetSyllabus.subjectName}`,
          timestamp: new Date().toLocaleString('vi-VN')
        }
      }))
      
      // Show success alert
      
    } catch (err) {
      console.error('[RectorDashboard] Error checking CLO-PLO consistency:', err)
      console.error('[RectorDashboard] Error response:', err.response?.data)
      console.error('[RectorDashboard] Full error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config ? {
          method: err.config.method,
          url: err.config.url,
          baseURL: err.config.baseURL
        } : null
      })
      alert(`Lỗi: ${err.message}${err.response?.data?.message ? '\n' + err.response.data.message : ''}`)
    } finally {
      setCloCheckLoading(false)
    }
  }

  const handleClearCLOCheckHistory = (syllabusId) => {
    setCloCheckHistory(prev => {
      const newHistory = { ...prev }
      delete newHistory[syllabusId]
      return newHistory
    })
    alert('✅ Đã xoá kết quả kiểm tra')
  }

  const handleViewDocument = (docId) => {
    window.open(`/api/documents/${docId}/download`, '_blank')
  }

  const generateDocumentSummary = async (document, syllabusId) => {
    try {
      const docKey = `${syllabusId}-${document.documentId}`
      setDocumentSummaries(prev => ({
        ...prev,
        [docKey]: { status: 'loading' }
      }))

      const response = await aiService.generateDocumentSummary(document.documentId, document.title)
      const jobId = response.data?.jobId || response.jobId

      if (!jobId) {
        throw new Error('No job ID received')
      }

      // Poll for result
      const maxWaitTime = 120000 // 2 minutes
      const startTime = Date.now()
      let pollInterval = 1000

      const result = await new Promise((resolve, reject) => {
        const pollFn = async () => {
          try {
            const jobStatus = await aiService.getJobStatus(jobId)
            const jobData = jobStatus.data || jobStatus

            if (jobData.status === 'succeeded' || jobData.status === 'SUCCEEDED') {
              resolve(jobData.result)
            } else if (jobData.status === 'failed' || jobData.status === 'FAILED') {
              reject(new Error('Document summarization failed'))
            } else if (Date.now() - startTime > maxWaitTime) {
              reject(new Error('Timeout'))
            } else {
              pollInterval = Math.min(5000, pollInterval + 500)
              setTimeout(pollFn, pollInterval)
            }
          } catch (err) {
            reject(err)
          }
        }
        pollFn()
      })

      setDocumentSummaries(prev => ({
        ...prev,
        [docKey]: { status: 'success', summary: result }
      }))

      alert('✅ Tóm tắt tài liệu thành công!')
    } catch (err) {
      console.error('Error generating summary:', err)
      setDocumentSummaries(prev => ({
        ...prev,
        [`${syllabusId}-${document.documentId}`]: { status: 'error', error: err.message }
      }))
      alert('❌ Lỗi: ' + err.message)
    }
  }

  const showToast = (message) => {
    console.log('[Toast]', message)
  }

  const handleViewCLOCheckHistory = (syllabusId) => {
    const history = cloCheckHistory[syllabusId]
    if (history) {
      alert(`Lần kiểm tra cuối cùng: ${history.timestamp}\n\nKết quả:\n${JSON.stringify(history.result, null, 2)}`)
    }
  }

  const handleViewPreviousCLOCheckResult = (syllabusId) => {
    const history = cloCheckHistory[syllabusId]
    if (history && history.result) {
      alert(`Kết quả kiểm tra CLO-PLO:\n\n${JSON.stringify(history.result, null, 2)}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const stats = [
    {
      label: 'Chờ Phê Duyệt',
      value: approved.length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Đang Xử Lý',
      value: actionId ? 1 : 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Dashboard Hiệu Trưởng</h1>
            <p className="text-gray-600 mt-1">Phê duyệt giáo trình từ APPROVED → PUBLISHED</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{stat.label}</h3>
                  <Icon size={28} className={stat.color} />
                </div>
                <p className="text-4xl font-bold text-purple-600">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Giáo trình chờ phê duyệt</h2>
            </div>
            <button
              onClick={loadApprovedSyllabi}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw size={16} />
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
          ) : approved.length === 0 ? (
            <div className="text-center py-10 text-gray-600">Không có giáo trình cần phê duyệt</div>
          ) : (
            <div className="space-y-4">
              {approved.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.subjectCode || item.code || 'N/A'}</h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          APPROVED
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{item.subjectName || item.name || 'Chưa có tên'}</p>
                      <p className="text-sm text-gray-500">Giảng viên: {item.createdBy || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Ngày gửi: {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[220px]">
                      <button
                        onClick={() => handleViewSyllabusDetail(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handlePublish(item.id)}
                        disabled={actionId === item.id}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 flex items-center gap-1 justify-center"
                      >
                        <CheckCircle size={14} />
                        {actionId === item.id ? 'Đang...' : 'Phê Duyệt'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Syllabus Detail Modal */}
      <SyllabusDetailModal
        isOpen={showSyllabusDetailModal}
        onClose={() => {
          setShowSyllabusDetailModal(false)
          setSyllabusDetailData(null)
        }}
        syllabusDetailData={syllabusDetailData}
        syllabusDetailLoading={syllabusDetailLoading}
        syllabusDetailDocuments={syllabusDetailDocuments}
        syllabusDetailDocumentsLoading={syllabusDetailDocumentsLoading}
        documentSummaries={documentSummaries}
        documentSummarizingId={null}
        cloCheckLoading={cloCheckLoading}
        cloCheckHistory={cloCheckHistory}
        handleViewSyllabusDetail={handleViewSyllabusDetail}
        handleCheckCLOPLOConsistency={handleCheckCLOPLOConsistency}
        handleViewCLOCheckHistory={handleViewCLOCheckHistory}
        handleClearCLOCheckHistory={handleClearCLOCheckHistory}
        handleViewPreviousCLOCheckResult={handleViewPreviousCLOCheckResult}
        handleViewDocument={handleViewDocument}
        generateDocumentSummary={generateDocumentSummary}
        setShowDocumentSummaryModal={setShowDocumentSummaryModal}
        setSelectedDocumentForSummary={setSelectedDocumentForSummary}
        showToast={showToast}
      />

      {/* Rector Actions Footer in Modal */}
      {showSyllabusDetailModal && syllabusDetailData && (
        <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-200 z-40">
          <div className="container mx-auto px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={() => handlePublish(syllabusDetailData.id)}
              disabled={actionId === syllabusDetailData.id}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {actionId === syllabusDetailData.id ? 'Đang Xử Lý...' : 'Phê Duyệt'}
            </button>
            <button
              onClick={() => setShowSyllabusDetailModal(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RectorDashboard
