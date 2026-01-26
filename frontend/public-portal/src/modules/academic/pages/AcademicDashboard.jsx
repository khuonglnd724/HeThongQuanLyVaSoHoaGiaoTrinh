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
  const [statsData, setStatsData] = useState({ departments: '--', programs: '--' })
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

  // CLO-PLO Check state - only keep history for SyllabusDetailModal
  const [cloCheckLoading, setCloCheckLoading] = useState(false)
  const [cloCheckHistory, setCloCheckHistory] = useState({})

  // Load CLO check history and document summaries from localStorage on mount
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

  const handleCheckCLOPLOConsistency = async (syllabusData = null) => {
    const targetSyllabus = syllabusData
    
    if (!targetSyllabus || !targetSyllabus.id) {
      alert('Không tìm thấy giáo trình')
      return
    }

    setCloCheckLoading(true)
    try {
      console.log('[AcademicDashboard] Starting CLO-PLO check with data:', {
        syllabusId: targetSyllabus.id,
        subjectCode: targetSyllabus.subjectCode,
        subjectName: targetSyllabus.subjectName
      })
      
      const content = typeof targetSyllabus.content === 'string'
        ? JSON.parse(targetSyllabus.content)
        : targetSyllabus.content

      const cloIds = content?.cloPairIds || content?.cloIds || []
      console.log('[AcademicDashboard] CLO IDs found:', cloIds)
      
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
      const response = await aiService.checkCLOPLOConsistency(targetSyllabus.id, cloList, ploList, mappingInfo)
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
      console.error('[AcademicDashboard] Error checking CLO-PLO consistency:', err)
      console.error('[AcademicDashboard] Error response:', err.response?.data)
      console.error('[AcademicDashboard] Full error:', {
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

  // handleViewCLOCheckHistory and handleViewPreviousCLOCheckResult removed - 
  // SyllabusDetailModal now handles CLO-PLO result display

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

      {/* Syllabus Detail Modal - Extracted to shared component */}
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
        documentSummarizingId={documentSummarizingId}
        cloCheckLoading={cloCheckLoading}
        cloCheckHistory={cloCheckHistory}
        handleViewSyllabusDetail={handleViewSyllabusDetail}
        handleCheckCLOPLOConsistency={handleCheckCLOPLOConsistency}
        handleClearCLOCheckHistory={handleClearCLOCheckHistory}
        handleViewDocument={handleViewDocument}
        generateDocumentSummary={generateDocumentSummary}
        setShowDocumentSummaryModal={setShowDocumentSummaryModal}
        setSelectedDocumentForSummary={setSelectedDocumentForSummary}
        showToast={() => {}}
      />
    </div>
  )
}

export default AcademicDashboard