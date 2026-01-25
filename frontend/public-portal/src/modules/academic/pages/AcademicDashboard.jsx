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
  Zap,
  Loader
} from 'lucide-react'
import apiClient from '../../../services/api/apiClient'
import syllabusApprovalService from '../services/syllabusApprovalService'
import syllabusServiceV2 from '../../../modules/lecturer/services/syllabusServiceV2'
import academicAPI from '../services/academicService'
import aiService from '../../lecturer/services/aiService'
import DocumentSummaryModal from '../../lecturer/components/DocumentSummaryModal'
import SyllabusDetailModal from '../../../shared/components/SyllabusDetailModal'

const AcademicDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionId, setActionId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [statsData, setStatsData] = useState({ departments: '--', programs: '--' })
  const [cloDetails, setCloDetails] = useState({})
  const [cloLoading, setCloLoading] = useState(false)
  const [syllabusDocuments, setSyllabusDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentSummaries, setDocumentSummaries] = useState({})
  const [documentSummarizingId, setDocumentSummarizingId] = useState(null)
  const [showDocumentSummaryModal, setShowDocumentSummaryModal] = useState(false)
  const [selectedDocumentForSummary, setSelectedDocumentForSummary] = useState(null)

  // Syllabus Detail Modal state
  const [showSyllabusDetailModal, setShowSyllabusDetailModal] = useState(false)
  const [syllabusDetailData, setSyllabusDetailData] = useState(null)
  const [syllabusDetailLoading, setSyllabusDetailLoading] = useState(false)
  const [syllabusDetailDocuments, setSyllabusDetailDocuments] = useState([])
  const [syllabusDetailDocumentsLoading, setSyllabusDetailDocumentsLoading] = useState(false)

  // CLO-PLO Check state
  const [showCLOCheckModal, setShowCLOCheckModal] = useState(false)
  const [cloCheckLoading, setCloCheckLoading] = useState(false)
  const [cloCheckResult, setCloCheckResult] = useState(null)
  const [cloCheckHistory, setCloCheckHistory] = useState({})

  // Load CLO check history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('academicCloCheckHistory')
    if (saved) {
      try {
        setCloCheckHistory(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to load CLO check history:', e)
      }
    }
  }, [])

  // Save CLO check history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('academicCloCheckHistory', JSON.stringify(cloCheckHistory))
  }, [cloCheckHistory])

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

  const fetchCLODetails = async (cloIds) => {
    if (!cloIds || cloIds.length === 0) {
      setCloDetails({})
      return
    }

    setCloLoading(true)
    try {
      const details = {}
      console.log('[AcademicDashboard] Fetching CLO details for IDs:', cloIds)
      
      for (const id of cloIds) {
        try {
          console.log(`[AcademicDashboard] Fetching CLO with ID: ${id}`)
          const response = await syllabusServiceV2.getCLOById(id)
          console.log(`[AcademicDashboard] CLO ${id} response:`, response)
          
          const cloData = response.data?.data || response.data || response
          details[id] = cloData
          console.log(`[AcademicDashboard] CLO ${id} data:`, cloData)
        } catch (err) {
          console.error(`Failed to fetch CLO ${id}:`, err)
          details[id] = { id, cloCode: `CLO-${id}`, description: 'Không thể tải' }
        }
      }
      setCloDetails(details)
      console.log('[AcademicDashboard] Final CLO details:', details)
    } catch (err) {
      console.error('Error fetching CLO details:', err)
    } finally {
      setCloLoading(false)
    }
  }

  const loadDocumentsForSyllabus = async (syllabusId) => {
    if (!syllabusId) return
    
    setDocumentsLoading(true)
    try {
      const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(syllabusId)
      const docs = docsRes.data?.data || docsRes.data || []
      setSyllabusDocuments(Array.isArray(docs) ? docs : [])
      
      // Load cached summaries if documents have aiIngestionJobId
      const cachedSummaries = {}
      for (const doc of docs) {
        if (doc.aiIngestionJobId) {
          try {
            const jobStatus = await aiService.getJobStatus(doc.aiIngestionJobId)
            const jobData = jobStatus.data?.data || jobStatus.data
            
            const normalizedStatus = (jobData.status || '').toUpperCase()
            
            if (normalizedStatus === 'SUCCEEDED' && jobData.result) {
              let resultData = jobData.result
              if (typeof resultData === 'string') {
                resultData = JSON.parse(resultData)
              }
              
              cachedSummaries[doc.id] = {
                summary: resultData.summary || '',
                bullets: Array.isArray(resultData.bullets) ? resultData.bullets : [],
                keywords: Array.isArray(resultData.keywords) ? resultData.keywords : [],
                targetAudience: resultData.targetAudience || '',
                prerequisites: resultData.prerequisites || ''
              }
            }
          } catch (err) {
            console.warn(`Failed to load summary for doc ${doc.id}:`, err)
          }
        }
      }
      
      if (Object.keys(cachedSummaries).length > 0) {
        setDocumentSummaries(cachedSummaries)
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
      setSyllabusDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    if (selected) {
      console.log('[AcademicDashboard] Selected item:', selected)
      
      let cloIds = []
      
      // First try to get cloIds from content (which is usually a JSON string)
      if (selected.content) {
        try {
          const content = typeof selected.content === 'string' 
            ? JSON.parse(selected.content) 
            : selected.content
          
          if (content?.cloPairIds && Array.isArray(content.cloPairIds)) {
            cloIds = content.cloPairIds
            console.log('[AcademicDashboard] Found cloPairIds in content:', cloIds)
          } else if (content?.cloIds && Array.isArray(content.cloIds)) {
            cloIds = content.cloIds
            console.log('[AcademicDashboard] Found cloIds in content:', cloIds)
          } else if (content?.clIds && Array.isArray(content.clIds)) {
            cloIds = content.clIds
            console.log('[AcademicDashboard] Found clIds in content:', cloIds)
          }
        } catch (e) {
          console.error('[AcademicDashboard] Error parsing content:', e)
        }
      }
      
      // Fallback to top-level fields
      if (cloIds.length === 0) {
        cloIds = selected.cloPairIds || selected.clIds || selected.cloIds || []
      }
      
      console.log('[AcademicDashboard] Final extracted CLO IDs:', cloIds)
      
      if (cloIds.length > 0) {
        fetchCLODetails(cloIds)
      } else {
        setCloDetails({})
      }
      
      // Load documents
      const syllabusId = selected.entityId || selected.id
      if (syllabusId) {
        loadDocumentsForSyllabus(syllabusId)
      }
    }
  }, [selected])

  const handleCheckCLOPLOConsistency = async () => {
    if (!selected || !selected.id) {
      alert('Không tìm thấy giáo trình')
      return
    }

    setCloCheckLoading(true)
    try {
      const content = typeof selected.content === 'string'
        ? JSON.parse(selected.content)
        : selected.content

      const cloIds = content?.cloPairIds || content?.cloIds || []
      
      if (cloIds.length === 0) {
        alert('Giáo trình này chưa có CLO liên kết')
        setCloCheckLoading(false)
        return
      }

      console.log(`[AcademicDashboard] Fetching details for ${cloIds.length} CLOs...`)
      
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
            console.warn(`[AcademicDashboard] Failed to fetch PLO mappings for CLO ${cloId}:`, mappingErr)
            cloToMappedPloIds[cloId] = []
          }
        } catch (cloErr) {
          console.warn(`[AcademicDashboard] Failed to fetch CLO ${cloId}:`, cloErr)
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
          console.warn(`[AcademicDashboard] Failed to fetch PLO ${ploId}:`, ploErr)
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
      console.log('[AcademicDashboard] Calling AI service...')
      const response = await aiService.checkCLOPLOConsistency(selected.id, cloList, ploList, mappingInfo)
      const jobId = response.data?.jobId || response.jobId
      
      if (!jobId) {
        alert('Không nhận được Job ID từ AI service')
        setCloCheckLoading(false)
        return
      }

      console.log(`[AcademicDashboard] Job ID: ${jobId}, polling for result...`)
      
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

      setCloCheckResult(resultData)
      setShowCLOCheckModal(true)
      
      // Save to history
      setCloCheckHistory(prev => ({
        ...prev,
        [selected.id]: {
          jobId,
          result: resultData,
          syllabusName: `${selected.subjectCode} - ${selected.subjectName}`,
          timestamp: new Date().toLocaleString('vi-VN')
        }
      }))
      
      alert('✅ Kiểm tra CLO-PLO thành công!')
    } catch (err) {
      console.error('Error checking CLO-PLO consistency:', err)
      alert(`❌ Lỗi: ${err.message}`)
      setCloCheckResult(null)
    } finally {
      setCloCheckLoading(false)
    }
  }

  const handleViewCLOCheckHistory = (syllabusId) => {
    const history = cloCheckHistory[syllabusId]
    if (history && history.result) {
      setCloCheckResult(history.result)
      setShowCLOCheckModal(true)
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
      
      let subjectInfo = null
      let programInfo = null
      if (syllabusData.subjectCode) {
        try {
          const subjectRes = await apiClient.get(`/api/academic/subjects/code/${syllabusData.subjectCode}`)
          subjectInfo = subjectRes.data
          
          if (subjectInfo?.programId) {
            try {
              const programRes = await apiClient.get(`/api/academic/programs/${subjectInfo.programId}`)
              programInfo = programRes.data
            } catch (progErr) {
              console.warn('Failed to fetch program info:', progErr)
            }
          }
        } catch (subjErr) {
          console.warn('Failed to fetch subject info:', subjErr)
        }
      }
      
      setSyllabusDetailDocumentsLoading(true)
      try {
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(syllabusId)
        const docs = docsRes.data?.data || docsRes.data || []
        setSyllabusDetailDocuments(Array.isArray(docs) ? docs : [])
        
        const cachedSummaries = {}
        for (const doc of docs) {
          if (doc.aiIngestionJobId) {
            try {
              const jobStatus = await aiService.getJobStatus(doc.aiIngestionJobId)
              const jobData = jobStatus.data?.data || jobStatus.data
              
              let resultData = null
              
              if (jobData?.status === 'SUCCEEDED' && jobData?.result) {
                resultData = jobData.result
                if (typeof resultData === 'string') {
                  resultData = JSON.parse(resultData)
                }
              } else if (jobData?.summary) {
                resultData = jobData
              }
              
              if (resultData) {
                cachedSummaries[doc.id] = {
                  summary: resultData.summary || '',
                  bullets: Array.isArray(resultData.bullets) ? resultData.bullets : [],
                  keywords: Array.isArray(resultData.keywords) ? resultData.keywords : [],
                  targetAudience: resultData.targetAudience || '',
                  prerequisites: resultData.prerequisites || '',
                  ragUsed: resultData.ragUsed || false,
                  ragContext: resultData.ragContext || '',
                  tokens: resultData.tokens || 0,
                  model: resultData.model || ''
                }
              }
            } catch (summaryErr) {
              console.warn(`Failed to load cached summary for doc ${doc.id}:`, summaryErr)
            }
          }
        }
        
        if (Object.keys(cachedSummaries).length > 0) {
          setDocumentSummaries(cachedSummaries)
        }
      } catch (docsErr) {
        console.warn('Failed to fetch documents:', docsErr)
        setSyllabusDetailDocuments([])
      } finally {
        setSyllabusDetailDocumentsLoading(false)
      }
      
      setSyllabusDetailData({
        ...syllabusData,
        subjectInfo,
        programInfo
      })
    } catch (err) {
      console.error('Failed to load syllabus detail:', err)
      alert('Không thể tải chi tiết giáo trình')
      setShowSyllabusDetailModal(false)
    } finally {
      setSyllabusDetailLoading(false)
    }
  }

  const handleViewDocument = async (documentId) => {
    try {
      const res = await apiClient.get(`/api/documents/${documentId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.click()
    } catch (err) {
      console.error('Error downloading document:', err)
      alert('Không thể tải tài liệu')
    }
  }

  const generateDocumentSummary = async (documentId, fileName) => {
    setDocumentSummarizingId(documentId)
    try {
      const response = await aiService.summarizeDocument(documentId)
      const jobId = response.data?.jobId || response.jobId
      
      if (!jobId) {
        alert('Không nhận được Job ID từ AI service')
        setDocumentSummarizingId(null)
        return
      }

      let maxAttempts = 60
      let attempts = 0

      const pollSummary = setInterval(async () => {
        attempts++
        try {
          const jobStatus = await aiService.getJobStatus(jobId)
          const jobData = jobStatus.data?.data || jobStatus.data

          if (jobData?.status === 'SUCCEEDED' || jobData?.status === 'succeeded') {
            clearInterval(pollSummary)
            let resultData = jobData.result
            if (typeof resultData === 'string') {
              resultData = JSON.parse(resultData)
            }

            setDocumentSummaries(prev => ({
              ...prev,
              [documentId]: {
                summary: resultData.summary || '',
                bullets: Array.isArray(resultData.bullets) ? resultData.bullets : [],
                keywords: Array.isArray(resultData.keywords) ? resultData.keywords : [],
                targetAudience: resultData.targetAudience || '',
                prerequisites: resultData.prerequisites || '',
                ragUsed: resultData.ragUsed || false,
                ragContext: resultData.ragContext || '',
                tokens: resultData.tokens || 0,
                model: resultData.model || ''
              }
            }))
            setDocumentSummarizingId(null)
            alert('✅ Tóm tắt tài liệu thành công!')
          } else if (jobData?.status === 'FAILED' || jobData?.status === 'failed') {
            clearInterval(pollSummary)
            setDocumentSummarizingId(null)
            alert('❌ Tóm tắt tài liệu thất bại')
          } else if (attempts >= maxAttempts) {
            clearInterval(pollSummary)
            setDocumentSummarizingId(null)
            alert('❌ Timeout tóm tắt tài liệu')
          }
        } catch (err) {
          if (attempts >= maxAttempts) {
            clearInterval(pollSummary)
            setDocumentSummarizingId(null)
            alert('❌ Lỗi tóm tắt tài liệu')
          }
        }
      }, 1000)
    } catch (err) {
      console.error('Error summarizing document:', err)
      setDocumentSummarizingId(null)
      alert(`❌ Lỗi: ${err.message}`)
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
                        onClick={() => handleViewSyllabusDetail(item)}
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
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết giáo trình</h2>
                <p className="text-sm text-gray-600 mt-1">{selected.subjectCode}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Mã môn</span>
                    <div className="font-semibold text-gray-900 mt-1">{selected.subjectCode || '-'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tên môn</span>
                    <div className="font-semibold text-gray-900 mt-1">{selected.subjectName || '-'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Giảng viên</span>
                    <div className="font-semibold text-gray-900 mt-1">{selected.lecturerName || selected.createdBy || '-'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Ngày gửi</span>
                    <div className="font-semibold text-gray-900 mt-1">
                      {selected.submittedAt ? new Date(selected.submittedAt).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* CLOs */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 CLO liên kết</h3>
                {cloLoading ? (
                  <div className="text-gray-600 text-sm py-2">
                    Đang tải thông tin CLO...
                  </div>
                ) : Object.keys(cloDetails).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(cloDetails).map(([id, clo]) => {
                      const cloCode = clo?.cloCode || clo?.name || `CLO-${id}`
                      const description = clo?.description || ''
                      
                      return (
                        <div key={id} className="bg-white border border-indigo-200 rounded-lg p-3 hover:shadow-md transition">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-indigo-900">
                                {cloCode}
                              </div>
                              {description && (
                                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {description}
                                </div>
                              )}
                              {clo?.level && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Level: {clo.level}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có CLO được liên kết</p>
                )}
              </div>

              {/* Chương trình giảng dạy */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Chương trình giảng dạy</h3>
                {selected.content ? (
                  (() => {
                    try {
                      const content = typeof selected.content === 'string' 
                        ? JSON.parse(selected.content) 
                        : selected.content

                      if (typeof content === 'object') {
                        return (
                          <div className="space-y-4">
                            {/* Metadata Section */}
                            {(content.subjectCode || content.academicYear || content.semester) && (
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">📋 Thông tin</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {content.subjectCode && <div><span className="text-gray-600">Mã môn:</span> <span className="font-medium">{content.subjectCode}</span></div>}
                                  {content.syllabusCode && <div><span className="text-gray-600">Mã giáo trình:</span> <span className="font-medium">{content.syllabusCode}</span></div>}
                                  {content.academicYear && <div><span className="text-gray-600">Năm học:</span> <span className="font-medium">{content.academicYear}</span></div>}
                                  {content.semester && <div><span className="text-gray-600">Học kỳ:</span> <span className="font-medium">{content.semester}</span></div>}
                                </div>
                              </div>
                            )}

                            {/* Modules */}
                            {content.modules && content.modules.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">📚 Các module ({content.modules.length})</h4>
                                <ul className="space-y-1 ml-4">
                                  {content.modules.map((mod, idx) => (
                                    <li key={idx} className="text-gray-700">
                                      • {mod.title || mod.name || `Module ${idx + 1}`}
                                      {mod.description && ` - ${mod.description}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Learning Objectives */}
                            {content.learningObjectives && content.learningObjectives.trim() && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">🎯 Mục tiêu học tập</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{content.learningObjectives}</p>
                              </div>
                            )}

                            {/* Teaching Methods */}
                            {content.teachingMethods && content.teachingMethods.trim() && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">👨‍🏫 Phương pháp giảng dạy</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{content.teachingMethods}</p>
                              </div>
                            )}

                            {/* Assessment Methods */}
                            {content.assessmentMethods && content.assessmentMethods.trim() && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">📝 Phương pháp đánh giá</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{content.assessmentMethods}</p>
                              </div>
                            )}

                            {/* Empty state */}
                            {(!content.modules || content.modules.length === 0) &&
                             (!content.learningObjectives || !content.learningObjectives.trim()) &&
                             (!content.teachingMethods || !content.teachingMethods.trim()) &&
                             (!content.assessmentMethods || !content.assessmentMethods.trim()) && (
                              <div className="text-gray-500 italic">
                                ℹ️ Chưa có nội dung chi tiết. Hãy thêm modules, mục tiêu, phương pháp giảng dạy và đánh giá.
                              </div>
                            )}
                          </div>
                        )
                      } else {
                        return <pre className="whitespace-pre-wrap overflow-x-auto">{content}</pre>
                      }
                    } catch (e) {
                      console.error('Error parsing content:', e)
                      return (
                        <div className="bg-red-50 p-4 rounded border border-red-200 text-sm text-red-700">
                          <p className="mb-2">⚠️ Không thể parse JSON:</p>
                          <pre className="text-xs bg-white p-2 rounded overflow-x-auto max-h-32">
                            {String(selected.content).substring(0, 500)}
                          </pre>
                        </div>
                      )
                    }
                  })()
                ) : (
                  <p className="text-sm text-gray-500">Chưa có nội dung giảng dạy</p>
                )}
              </div>

              {/* Tài liệu giảng dạy */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Tài liệu giảng dạy ({syllabusDocuments.length})</h3>
                {documentsLoading ? (
                  <div className="text-center py-4 text-gray-600">
                    <p className="text-sm">Đang tải tài liệu...</p>
                  </div>
                ) : syllabusDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {syllabusDocuments.map((doc) => (
                      <div key={doc.id} className="bg-white p-4 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{doc.originalName || doc.title || doc.fileName || 'Unnamed Document'}</p>
                            {doc.description && (
                              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                              {doc.fileSize && (
                                <span>Kích thước: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                              )}
                              {doc.uploadedAt && (
                                <span>Ngày tải: {new Date(doc.uploadedAt).toLocaleString('vi-VN')}</span>
                              )}
                              {doc.uploadedBy && (
                                <span>Người tải: {doc.uploadedBy}</span>
                              )}
                            </div>

                            {/* Inline Summary Display */}
                            {documentSummaries[doc.id] && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm space-y-2">
                                <div>
                                  <p className="font-semibold text-blue-900 mb-1">📋 Tóm tắt:</p>
                                  <p className="text-blue-800">{documentSummaries[doc.id].summary}</p>
                                </div>

                                {documentSummaries[doc.id].bullets && documentSummaries[doc.id].bullets.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">📌 Nội dung chính:</p>
                                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                                      {documentSummaries[doc.id].bullets.map((bullet, idx) => (
                                        <li key={idx} className="text-xs">{bullet}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {documentSummaries[doc.id].keywords && documentSummaries[doc.id].keywords.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">🏷️ Từ khóa:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {documentSummaries[doc.id].keywords.map((kw, idx) => (
                                        <span key={idx} className="inline-block px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded">
                                          {kw}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {documentSummaries[doc.id].targetAudience && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">👥 Đối tượng học:</p>
                                    <p className="text-blue-800 text-xs">{documentSummaries[doc.id].targetAudience}</p>
                                  </div>
                                )}

                                {documentSummaries[doc.id].prerequisites && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">📚 Điều kiện tiên quyết:</p>
                                    <p className="text-blue-800 text-xs">{documentSummaries[doc.id].prerequisites}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0 flex-col">
                            {doc.aiIngestionJobId && (
                              <button
                                onClick={() => {
                                  setSelectedDocumentForSummary(doc)
                                  setShowDocumentSummaryModal(true)
                                }}
                                title="Xem tóm tắt tài liệu"
                                className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                              >
                                <Zap size={14} />
                                Xem tóm tắt
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm italic">Chưa có tài liệu nào được tải lên</p>
                  </div>
                )}
              </div>

              {/* Thông tin khác */}
              {(selected.summary || selected.credits) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selected.credits && (
                      <div>
                        <span className="text-gray-600">Số tín chỉ</span>
                        <div className="font-semibold text-gray-900 mt-1">{selected.credits}</div>
                      </div>
                    )}
                    {selected.summary && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Tóm tắt</span>
                        <div className="text-gray-700 mt-1">{selected.summary}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setSelected(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Đóng
              </button>
              {cloCheckHistory[selected?.id] && (
                <>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✓ {cloCheckHistory[selected?.id].timestamp}
                  </span>
                  <button
                    onClick={() => handleViewCLOCheckHistory(selected?.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                  >
                    👁️ Xem kết quả
                  </button>
                  <button
                    onClick={() => handleClearCLOCheckHistory(selected?.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs"
                    title="Xoá kết quả lưu trữ"
                  >
                    ✕
                  </button>
                </>
              )}
              <button
                onClick={handleCheckCLOPLOConsistency}
                disabled={cloCheckLoading}
                className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium disabled:bg-gray-400 flex items-center gap-2"
              >
                {cloCheckLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Kiểm tra...
                  </>
                ) : (
                  '🔍 Kiểm tra CLO-PLO'
                )}
              </button>
              <button
                onClick={() => handleReject(selected.id)}
                disabled={actionId === selected.id}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {actionId === selected.id ? 'Đang xử lý...' : 'Từ chối'}
              </button>
              <button
                onClick={() => handleApprove(selected.id)}
                disabled={actionId === selected.id}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {actionId === selected.id ? 'Đang xử lý...' : 'Phê duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Summary Modal */}
      {showDocumentSummaryModal && selectedDocumentForSummary && (
        <DocumentSummaryModal 
          document={selectedDocumentForSummary}
          onClose={() => {
            setShowDocumentSummaryModal(false)
            setSelectedDocumentForSummary(null)
          }}
        />
      )}

      {/* CLO-PLO Check Modal */}
      {showCLOCheckModal && cloCheckResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Kết quả kiểm tra CLO-PLO</h2>
              <button 
                onClick={() => setShowCLOCheckModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl font-light"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Tổng quan kết quả từ overallAssessment */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-blue-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Đánh giá tổng quan</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Điểm kiểm tra: <span className="font-bold text-xl text-blue-600">{cloCheckResult?.overallAssessment?.score?.toFixed(1) || 'N/A'}/10</span>
                  </p>
                  <p className="text-gray-700">
                    Trạng thái: <span className="font-semibold text-gray-800">{cloCheckResult?.overallAssessment?.status || 'N/A'}</span>
                  </p>
                  {cloCheckResult?.overallAssessment?.keyStrengths && cloCheckResult.overallAssessment.keyStrengths.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Điểm mạnh:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {cloCheckResult.overallAssessment.keyStrengths.map((strength, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Phân tích mapping */}
              {cloCheckResult?.mappingAnalysis && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích Mapping</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-4 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Tổng số CLO</p>
                      <p className="text-3xl font-bold text-gray-900">{cloCheckResult.mappingAnalysis.totalClos || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">PLO được cover</p>
                      <p className="text-3xl font-bold text-gray-900">{cloCheckResult.mappingAnalysis.coveredPlos || 0}</p>
                    </div>
                  </div>
                  
                  {cloCheckResult.mappingAnalysis.unmappedClos && cloCheckResult.mappingAnalysis.unmappedClos.length > 0 && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-semibold text-red-900 mb-1">CLO chưa mapping:</p>
                      <p className="text-sm text-red-800">{cloCheckResult.mappingAnalysis.unmappedClos.join(', ')}</p>
                    </div>
                  )}
                  
                  {cloCheckResult.mappingAnalysis.uncoveredPlos && cloCheckResult.mappingAnalysis.uncoveredPlos.length > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-sm font-semibold text-orange-900 mb-1">PLO chưa cover:</p>
                      <p className="text-sm text-orange-800">{cloCheckResult.mappingAnalysis.uncoveredPlos.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Các vấn đề phát hiện */}
              {cloCheckResult?.issues && cloCheckResult.issues.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Các vấn đề phát hiện ({cloCheckResult.issues.length})
                  </h3>
                  <div className="space-y-3">
                    {cloCheckResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          issue.severity === 'critical'
                            ? 'bg-red-50 border-red-500'
                            : issue.severity === 'major'
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-yellow-50 border-yellow-500'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-2">
                          {issue.severity === 'critical'
                            ? 'Mức độ: Nghiêm trọng'
                            : issue.severity === 'major'
                            ? 'Mức độ: Cao'
                            : 'Mức độ: Trung bình'}
                          <span className="font-normal text-gray-600 ml-2">({issue.type})</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2"><strong>Vấn đề:</strong> {issue.problem}</p>
                        {issue.why && <p className="text-sm text-gray-700 mb-2"><strong>Nguyên nhân:</strong> {issue.why}</p>}
                        {issue.impact && <p className="text-sm text-gray-700 mb-2"><strong>Tác động:</strong> {issue.impact}</p>}
                        {issue.recommendation && <p className="text-sm text-gray-700 mb-2"><strong>Khuyến nghị:</strong> {issue.recommendation}</p>}
                        {issue.howToFix && (
                          <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                            <strong className="text-sm">Hướng dẫn sửa:</strong>
                            <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">{issue.howToFix}</div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Ưu tiên: {issue.priority}/3</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hướng dẫn chỉnh sửa */}
              {cloCheckResult?.editingGuidelines && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hướng dẫn chỉnh sửa</h3>
                  
                  {cloCheckResult.editingGuidelines.descriptions && cloCheckResult.editingGuidelines.descriptions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Cách chỉnh sửa mô tả CLO:</p>
                      <ul className="space-y-2">
                        {cloCheckResult.editingGuidelines.descriptions.map((desc, idx) => (
                          <li key={idx} className="text-sm text-gray-700 p-2 bg-gray-50 rounded border-l-2 border-blue-600">
                            {desc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {cloCheckResult.editingGuidelines.mappingTips && cloCheckResult.editingGuidelines.mappingTips.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Mẹo mapping:</p>
                      <ul className="space-y-2">
                        {cloCheckResult.editingGuidelines.mappingTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-700 p-2 bg-gray-50 rounded border-l-2 border-green-600">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Các bước tiếp theo */}
              {cloCheckResult?.overallAssessment?.nextSteps && cloCheckResult.overallAssessment.nextSteps.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Các bước tiếp theo</h3>
                  <ol className="space-y-2">
                    {cloCheckResult.overallAssessment.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-3">
                        <span className="font-semibold text-gray-900">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* JSON Raw (Debug) */}
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                  Xem dữ liệu JSON (Debug)
                </summary>
                <pre className="mt-4 p-3 bg-gray-900 text-gray-100 text-xs rounded overflow-x-auto max-h-64">
                  {JSON.stringify(cloCheckResult, null, 2)}
                </pre>
              </details>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(cloCheckResult, null, 2))
                  alert('Đã sao chép JSON vào clipboard')
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Sao chép JSON
              </button>
              <button
                onClick={() => setShowCLOCheckModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Detail Modal - Extracted to shared component */}
      <SyllabusDetailModal
        isOpen={showSyllabusDetailModal}
        onClose={() => {
          setShowSyllabusDetailModal(false)
          setSyllabusDetailData(null)
          setCloCheckResult(null)
        }}
        syllabusDetailData={syllabusDetailData}
        syllabusDetailLoading={syllabusDetailLoading}
        syllabusDetailDocuments={syllabusDetailDocuments}
        syllabusDetailDocumentsLoading={syllabusDetailDocumentsLoading}
        documentSummaries={documentSummaries}
        documentSummarizingId={documentSummarizingId}
        cloCheckLoading={cloCheckLoading}
        cloCheckHistory={cloCheckHistory}
        handleViewSyllabusDetail={handleViewSyllabusDetail}
        handleCheckCLOPLOConsistency={handleCheckCLOPLOConsistency}
        handleViewCLOCheckHistory={handleViewCLOCheckHistory}
        handleClearCLOCheckHistory={handleClearCLOCheckHistory}
        handleViewDocument={handleViewDocument}
        generateDocumentSummary={generateDocumentSummary}
        setShowDocumentSummaryModal={setShowDocumentSummaryModal}
        setSelectedDocumentForSummary={setSelectedDocumentForSummary}
        showToast={() => {}}
      />    </div>
  )
}

export default AcademicDashboard