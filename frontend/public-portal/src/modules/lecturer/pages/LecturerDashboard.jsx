import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BookOpen, LogOut, FileText, Plus, Edit, Eye, Trash2, Upload, CheckCircle, Clock, XCircle, Zap, Loader } from 'lucide-react'
import apiClient from '../../../services/api/apiClient'
import syllabusServiceV2 from '../services/syllabusServiceV2'
import aiService from '../services/aiService'
import SyllabusEditorPage from './SyllabusEditorPage'
import DocumentSummaryModal from '../components/DocumentSummaryModal'
import workflowApi from '../../workflow/api/workflowApi'

// Minimal role constants here to avoid circular import with roleConfig (roleConfig imports LecturerDashboard)
const ROLES = {
  HOD: 'ROLE_HOD',
  LECTURER: 'ROLE_LECTURER',
}

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// CLO Details Display Component
const CLODetailsDisplay = ({ cloIds }) => {
  const [cloDetails, setCloDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadedIds, setLoadedIds] = useState([])

  useEffect(() => {
    // Check if we've already loaded these CLO IDs
    const idsString = cloIds ? cloIds.sort().join(',') : ''
    const loadedString = loadedIds.sort().join(',')
    
    if (idsString === loadedString && Object.keys(cloDetails).length > 0) {
      setLoading(false)
      return // Already loaded, skip
    }

    const fetchCLODetails = async () => {
      setLoading(true)
      const details = {}
      
      for (const id of (cloIds || [])) {
        try {
          const response = await syllabusServiceV2.getCLOById(id)
          // API returns { success, message, data: {...}, timestamp }
          const cloData = response.data?.data || response.data || response
          console.log(`CLO ${id} fetched:`, cloData)
          
          // Fetch PLO mappings for this CLO
          let mappedPlos = []
          try {
            const mappingRes = await apiClient.get(`/api/v1/mapping/clo/${id}`)
            const mappings = mappingRes.data?.data || []
            const ploIds = mappings.map(m => m.ploId || m.plo_id).filter(Boolean)
            
            // Fetch PLO details for each mapped PLO
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
                  <span className="ml-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0">
                    #{id}
                  </span>
                </div>
                
                {/* Mapped PLOs */}
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
  const [activeTab, setActiveTab] = useState('syllabi')

  // Documents upload state
  const [documentFile, setDocumentFile] = useState(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentDescription, setDocumentDescription] = useState('')
  const [syllabusDocuments, setSyllabusDocuments] = useState([])

  // Simple toast notifications (UI-only, lightweight)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' })
  const showToast = (message, type = 'info', ms = 3500) => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), ms)
  }
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [reviewItems, setReviewItems] = useState([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const reviewLastFetchRef = useRef(0)
  const reviewInFlightRef = useRef(false)
  const [showSyllabusDetailModal, setShowSyllabusDetailModal] = useState(false)
  const [syllabusDetailData, setSyllabusDetailData] = useState(null)
  const [syllabusDetailLoading, setSyllabusDetailLoading] = useState(false)
  const [syllabusDetailDocuments, setSyllabusDetailDocuments] = useState([])
  const [syllabusDetailDocumentsLoading, setSyllabusDetailDocumentsLoading] = useState(false)
  const [syllabusDetailAISummary, setSyllabusDetailAISummary] = useState(null)
  const [syllabusDetailAISummaryLoading, setSyllabusDetailAISummaryLoading] = useState(false)
  const [syllabusDetailAISummaryJobId, setSyllabusDetailAISummaryJobId] = useState(null)
  const [documentSummaries, setDocumentSummaries] = useState({}) // Lưu tóm tắt cho từng document: {documentId: summary}
  const [documentSummarizingId, setDocumentSummarizingId] = useState(null) // Document nào đang được tóm tắt
  const [showDocumentSummaryModal, setShowDocumentSummaryModal] = useState(false) // Show/hide document summary modal
  const [selectedDocumentForSummary, setSelectedDocumentForSummary] = useState(null) // Document được chọn để view summary
  
  // Create/Edit form (simplified - only basic fields, content will be added later)
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    summary: ''
  })

  // Debounced load function to prevent excessive API calls
  const debouncedLoad = useRef(null)
  const loadingRef = useRef(false)
  const lastFetchRef = useRef(0)
  const isHod = currentUser?.role === ROLES.HOD

  const loadLecturerSyllabi = useCallback(async () => {
    const now = Date.now()
    // prevent overlapping requests and throttle frequent calls
    if (loadingRef.current && (now - lastFetchRef.current) < 3000) return
    if ((now - lastFetchRef.current) < 1000) return
    loadingRef.current = true
    lastFetchRef.current = now
    try {
      setLoading(true)
      if (!currentUser) {
        console.warn('No user available')
        loadingRef.current = false
        setLoading(false)
        return
      }

      // Try multiple API endpoints for lecturer syllabi
      const lecturerId = currentUser?.userId || currentUser?.id || currentUser?.lecturerId
      console.log('Loading syllabi for lecturer:', lecturerId)
      
      // backend exposes /api/syllabuses (plural); no dedicated /api/syllabus/lecturer/{id}
      // Using timeout and retry logic in apiClient
      // Request path must include /api so dev proxy properly forwards to API Gateway
      const res = await apiClient.get('/api/syllabuses', { 
        params: { page: 0, size: 200 },
        // Override timeout for this specific request if needed
        timeout: 30000
      })
      let data = res.data?.content || res.data || []
      // filter client-side by createdBy (server stores X-User-Id in createdBy)
      // Accept multiple possible user id fields from frontend user object
      const candidates = [currentUser?.userId, currentUser?.id, currentUser?.lecturerId, currentUser?.username, currentUser?.userName, currentUser?.name, currentUser?.email]
        .filter(Boolean)
      console.debug('lecturerId candidates:', candidates, 'server sample createdBy:', data.length ? data[0].createdBy : null)
      if (candidates.length > 0) {
        data = data.filter((s) => candidates.some(c => String(c) === String(s.createdBy)))
      } else {
        // fallback: do not filter if we don't know current user id (helps debugging)
        console.warn('No lecturerId candidate found in currentUser, skipping client-side filter')
      }

      setSyllabi(data)
      
      // Calculate stats
      const total = data.length
      const draft = data.filter(s => s.status === 'DRAFT').length
      const pending = data.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'PENDING_APPROVAL').length
      const approved = data.filter(s => s.status === 'APPROVED').length
      const published = data.filter(s => s.status === 'PUBLISHED').length
      const rejected = data.filter(s => s.status === 'REJECTED').length
      
      setStats({ total, draft, pending, approved, published, rejected })
      console.log('Syllabi loaded successfully:', { total, draft, pending, approved, published, rejected })
    } catch (err) {
      console.error('Failed to load syllabi:', err)
      // Show user-friendly error message
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách giáo trình'
      showToast(`Lỗi: ${errorMsg}`, 'error')

      // Do NOT inject demo data. Use server response only — clear lists/stats on error.
      setSyllabi([])
      setStats({ total: 0, draft: 0, pending: 0, approved: 0, published: 0, rejected: 0 })
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [currentUser])

  const loadReviewQueue = useCallback(async (force = false) => {
    if (!isHod) return
    const now = Date.now()
    // Throttle to avoid hammering the API unless explicitly forced
    if (!force) {
      if (reviewInFlightRef.current) return
      if (now - reviewLastFetchRef.current < 8000) return
    }
    reviewInFlightRef.current = true
    reviewLastFetchRef.current = now
    try {
      setReviewLoading(true)
      setReviewError('')
      const res = await workflowApi.getPending()
      const workflows = res.data || []
      
      // Fetch syllabus details for each workflow
      const enrichedItems = await Promise.all(
        workflows.map(async (workflow) => {
          try {
            if (workflow.entityId) {
              const syllabusRes = await apiClient.get(`/api/syllabuses/${workflow.entityId}`)
              return {
                ...workflow,
                syllabusData: syllabusRes.data
              }
            }
            return workflow
          } catch (err) {
            console.warn('Failed to fetch syllabus for workflow:', workflow.id, err)
            return workflow
          }
        })
      )
      
      setReviewItems(enrichedItems)
    } catch (err) {
      console.error('Failed to load HOD review queue:', err)
      const msg = err?.response?.data?.message || err.message || 'Không tải được danh sách cần duyệt'
      setReviewError(msg)
      setReviewItems([])
    } finally {
      setReviewLoading(false)
      reviewInFlightRef.current = false
    }
  }, [isHod])

  useEffect(() => {
    if (!debouncedLoad.current) {
      debouncedLoad.current = debounce(loadLecturerSyllabi, 1000)
    }

    if (currentUser) {
      debouncedLoad.current()
    }
    if (isHod) {
      loadReviewQueue()
    }
  }, [currentUser, loadLecturerSyllabi, isHod, loadReviewQueue])

  useEffect(() => {
    if (isHod && activeTab === 'review') {
      loadReviewQueue()
    }
  }, [activeTab, isHod, loadReviewQueue])

  const handleCreateSyllabus = async () => {
    try {
      if (!formData.subjectCode.trim() || !formData.subjectName.trim()) {
        showToast('Vui lòng nhập mã môn và tên môn', 'warning')
        return
      }

      // Check for duplicate subject code
      const normalizedCode = formData.subjectCode.trim().toUpperCase()
      const isDuplicate = syllabi.some(s => s.subjectCode?.toUpperCase() === normalizedCode)
      if (isDuplicate) {
        showToast(`Mã môn '${formData.subjectCode}' đã tồn tại. Vui lòng sử dụng mã khác.`, 'warning')
        return
      }

      const payload = {
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        summary: formData.summary,
        content: '{}' // Empty content placeholder for now
      }

      const res = await apiClient.post('/api/syllabuses', payload, {
        headers: { 'X-User-Id': currentUser?.userId || currentUser?.id }
      })
      console.log('Created syllabus:', res.data)
      setShowCreateModal(false)
      resetForm()
      loadLecturerSyllabi()
      showToast('Tạo giáo trình thành công', 'success')
    } catch (err) {
      console.error('Create error:', err)
      showToast(err?.response?.data?.message || 'Tạo giáo trình thất bại', 'error')
    }
  }

  const resolveActionBy = () => {
    // Try to get userId from localStorage user first
    let userId = currentUser?.userId || currentUser?.id || currentUser?.lecturerId
    
    // If not found, decode from JWT token
    if (!userId) {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const parts = token.split('.')
          if (parts.length === 3) {
            const decoded = JSON.parse(atob(parts[1]))
            userId = decoded.userId || decoded.sub
          }
        }
      } catch (e) {
        console.warn('Failed to decode JWT token for userId:', e)
      }
    }
    
    // Fallback to username or email
    return userId || currentUser?.username || currentUser?.email || 'unknown'
  }

  const handleApproveWorkflow = async (workflowId) => {
    try {
      setReviewLoading(true)
      const actionBy = resolveActionBy()
      
      // Approve workflow
      await workflowApi.approve(workflowId, { actionBy, role: ROLES.HOD })
      
      // Find the corresponding syllabus from reviewItems
      const reviewItem = reviewItems.find(item => item.id === workflowId)
      if (reviewItem && reviewItem.syllabusData) {
        // Update syllabus status to APPROVED
        try {
          // Make direct API call to update syllabus
          await apiClient.patch(`/api/syllabi/${reviewItem.syllabusData.id}`, {
            status: 'APPROVED'
          })
          console.log('Syllabus status updated to APPROVED')
        } catch (updateErr) {
          console.warn('Failed to update syllabus status:', updateErr)
          // Don't throw error - workflow was already approved
        }
      }
      
      await loadReviewQueue(true)
      showToast('Đã duyệt giáo trình', 'success')
    } catch (err) {
      console.error('Approve failed:', err)
      showToast(err?.response?.data?.message || 'Duyệt thất bại', 'error')
      setReviewLoading(false)
    }
  }

  const handleRejectWorkflow = async (workflowId) => {
    const comment = window.prompt('Nhập lý do từ chối')
    if (!comment) return
    try {
      setReviewLoading(true)
      
      // Reject workflow
      await workflowApi.reject(workflowId, { actionBy: resolveActionBy(), role: ROLES.HOD }, { comment })
      
      // Find the corresponding syllabus from reviewItems
      const reviewItem = reviewItems.find(item => item.id === workflowId)
      if (reviewItem && reviewItem.syllabusData) {
        // Update syllabus status to REJECTED
        try {
          // Make direct API call to update syllabus
          await apiClient.patch(`/api/syllabi/${reviewItem.syllabusData.id}`, {
            status: 'REJECTED',
            rejectionReason: comment
          })
          console.log('Syllabus status updated to REJECTED with reason:', comment)
        } catch (updateErr) {
          console.warn('Failed to update syllabus status:', updateErr)
          // Don't throw error - workflow was already rejected
        }
      }
      
      await loadReviewQueue(true)
      showToast('Đã từ chối giáo trình', 'success')
    } catch (err) {
      console.error('Reject failed:', err)
      showToast(err?.response?.data?.message || 'Từ chối thất bại', 'error')
      setReviewLoading(false)
    }
  }


  const handleViewSyllabusDetail = async (item) => {
    try {
      setSyllabusDetailLoading(true)
      setShowSyllabusDetailModal(true)
      setSyllabusDetailData(null)
      setSyllabusDetailDocuments([])

      // Extract syllabusId - support both workflow items and syllabus objects
      let syllabusId = item.entityId || item.id || item.syllabusId
      if (!syllabusId) {
        showToast('Không tìm thấy ID giáo trình', 'error')
        return
      }

      // Fetch syllabus details from syllabus-service
      const res = await apiClient.get(`/api/syllabuses/${syllabusId}`)
      const syllabusData = res.data
      
      // Fetch subject and program info from academic-service
      let subjectInfo = null
      let programInfo = null
      if (syllabusData.subjectCode) {
        try {
          const subjectRes = await apiClient.get(`/api/academic/subjects/code/${syllabusData.subjectCode}`)
          subjectInfo = subjectRes.data
          
          // Fetch program if we have programId
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
      
      // Fetch documents for this syllabus
      setSyllabusDetailDocumentsLoading(true)
      try {
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(syllabusId)
        const docs = docsRes.data?.data || docsRes.data || []
        setSyllabusDetailDocuments(Array.isArray(docs) ? docs : [])
        
        // Phase 6: Load cached summaries if documents have aiIngestionJobId
        const cachedSummaries = {}
        for (const doc of docs) {
          if (doc.aiIngestionJobId) {
            try {
              console.log(`[Phase 6] Loading cached summary for doc ${doc.id}, jobId=${doc.aiIngestionJobId}`)
              const jobStatus = await aiService.getJobStatus(doc.aiIngestionJobId)
              const jobData = jobStatus.data?.data || jobStatus.data
              
              // Handle both response formats:
              // Format 1: { status: 'SUCCEEDED', result: {...} }
              // Format 2: { jobId, summary, bullets, ... } (direct response)
              let resultData = null
              
              if (jobData?.status === 'SUCCEEDED' && jobData?.result) {
                // Format 1: Old format with status wrapper
                resultData = jobData.result
                if (typeof resultData === 'string') {
                  resultData = JSON.parse(resultData)
                }
              } else if (jobData?.summary) {
                // Format 2: New format - direct response
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
                console.log(`[Phase 6] Loaded cached summary for doc ${doc.id}`)
              }
            } catch (summaryErr) {
              console.warn(`[Phase 6] Failed to load cached summary for doc ${doc.id}:`, summaryErr)
              // Continue loading other summaries
            }
          }
        }
        
        if (Object.keys(cachedSummaries).length > 0) {
          setDocumentSummaries(cachedSummaries)
          console.log('[Phase 6] Loaded all cached summaries:', cachedSummaries)
        }
      } catch (docsErr) {
        console.warn('Failed to fetch documents:', docsErr)
        setSyllabusDetailDocuments([])
      } finally {
        setSyllabusDetailDocumentsLoading(false)
      }
      
      // Reset AI summary state
      setSyllabusDetailAISummary(null)
      setSyllabusDetailAISummaryJobId(null)
      
      setSyllabusDetailData({
        ...syllabusData,
        subjectInfo,
        programInfo
      })
    } catch (err) {
      console.error('Failed to load syllabus detail:', err)
      showToast('Không thể tải chi tiết giáo trình', 'error')
      setShowSyllabusDetailModal(false)
    } finally {
      setSyllabusDetailLoading(false)
    }
  }

  const handleUpdateSyllabus = async () => {
    try {
      if (!formData.subjectName.trim()) {
        showToast('Vui lòng nhập tên môn', 'warning')
        return
      }

      const rootId = selectedSyllabus?.rootSyllabusId || selectedSyllabus?.id

      const payload = {
        subjectName: formData.subjectName,
        summary: formData.summary
      }

      const res = await apiClient.post(`/api/syllabuses/${rootId}/versions`, payload, {
        headers: { 'X-User-Id': currentUser?.userId || currentUser?.id }
      })
      console.log('Updated syllabus:', res.data)
      
      setShowEditModal(false)
      resetForm()
      loadLecturerSyllabi()
      showToast('Cập nhật giáo trình thành công', 'success')
    } catch (err) {
      console.error('Update error:', err)
      showToast(err?.response?.data?.message || 'Cập nhật giáo trình thất bại', 'error')
    }
  }

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm('Bạn có chắc muốn xoá giáo trình này?')) return
    try {
      await apiClient.delete(`/api/syllabuses/${syllabusId}`)
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Delete error:', err)
      showToast('Xoá giáo trình thất bại', 'error')
    }
  }

  const handleSubmitForReview = async (syllabusId) => {
    if (!window.confirm('Gửi giáo trình này để phê duyệt?')) return
    try {
      const userId = currentUser?.userId || currentUser?.username || currentUser?.email || 'unknown'
      await apiClient.post(`/api/syllabuses/${syllabusId}/submit`, null, {
        headers: { 'X-User-Id': userId }
      })
      loadLecturerSyllabi()
      showToast('Đã gửi giáo trình để phê duyệt', 'success')
    } catch (err) {
      console.error('Submit error:', err)
      showToast('Gửi phê duyệt thất bại', 'error')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = async (syllabus) => {
    setSelectedSyllabus(syllabus)
    setFormData({
      subjectCode: syllabus.subjectCode || syllabus.courseCode || '',
      subjectName: syllabus.subjectName || syllabus.courseName || '',
      summary: syllabus.summary || ''
    })
    
    // Load full syllabus data including content and documents
    try {
      const res = await apiClient.get(`/api/syllabuses/${syllabus.id}`)
      const fullData = res.data
      
      console.log('[LecturerDashboard] openEditModal - Loaded full data:', fullData);
      console.log('[LecturerDashboard] openEditModal - Full data ID:', fullData.id);
      
      // Update form with complete data
      setFormData({
        subjectCode: fullData.subjectCode || syllabus.subjectCode || '',
        subjectName: fullData.subjectName || syllabus.subjectName || '',
        summary: fullData.summary || ''
      })
      
      // Load documents
      try {
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(fullData.id)
        setSyllabusDocuments(docsRes.data || docsRes || [])
      } catch (docErr) {
        console.warn('Failed to load documents:', docErr)
        setSyllabusDocuments([])
      }
      
      // Store full data for display
      setSelectedSyllabus(fullData)
      
      // Open the editor
      setShowEditor(true)
      setShowDetailModal(false)
    } catch (err) {
      console.error('Failed to load full syllabus data:', err)
      setSyllabusDocuments([])
    }
  }

  const openDetailModal = async (syllabus) => {
    setSelectedSyllabus(syllabus)
    setShowDetailModal(true)
    // Optionally load more details
    try {
      const res = await apiClient.get(`/api/syllabuses/${syllabus.id}`)
      setSelectedSyllabus(res.data)
      // load documents for this syllabus
      try {
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(res.data.id)
        setSyllabusDocuments(docsRes.data || docsRes || [])
      } catch (dErr) {
        console.debug('Failed to load syllabus documents:', dErr)
        setSyllabusDocuments([])
      }
    } catch (err) {
      console.error('Load detail error:', err)
    }
  }

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const res = await syllabusServiceV2.downloadDocument(documentId)
      const blob = (res.data instanceof Blob)
        ? res.data
        : new Blob([res.data], { type: res.headers?.['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || `document-${documentId}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      showToast('Tải tài liệu thất bại', 'error')
    }
  }

  const handleViewDocument = async (documentId) => {
    try {
      const res = await syllabusServiceV2.downloadDocument(documentId)
      const blob = (res.data instanceof Blob)
        ? res.data
        : new Blob([res.data], { type: res.headers?.['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      // open in new tab for inline viewing
      window.open(url, '_blank')
      // revoke after a delay to allow tab to load
      setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch (err) {
      console.error('View error:', err)
      showToast('Không thể xem tài liệu', 'error')
    }
  }

  const generateAISummary = async (syllabusId) => {
    try {
      setSyllabusDetailAISummaryLoading(true)
      const res = await aiService.generateSummary(syllabusId, 'MEDIUM')
      const jobId = res.data?.data?.jobId || res.data?.jobId
      
      if (jobId) {
        setSyllabusDetailAISummaryJobId(jobId)
        // Start polling for job completion
        pollAISummaryJob(jobId)
      }
      showToast('Đang tạo tóm tắt AI...', 'info')
    } catch (err) {
      console.error('Generate summary failed:', err)
      showToast('Tạo tóm tắt AI thất bại', 'error')
      setSyllabusDetailAISummaryLoading(false)
    }
  }

  const pollAISummaryJob = async (jobId) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    
    const poll = async () => {
      try {
        const res = await aiService.getJobStatus(jobId)
        const job = res.data?.data || res.data || {}
        
        console.log('Full job response:', job)
        
        if (job.status === 'SUCCEEDED') {
          // Result might be in job.result OR directly in job response
          let resultData = job.result || job
          
          // If result is a JSON string, parse it
          if (typeof resultData === 'string') {
            try {
              resultData = JSON.parse(resultData)
            } catch (e) {
              console.warn('Failed to parse result as JSON:', e)
            }
          }
          
          // Extract only the relevant fields from the response
          const summaryData = {
            summary: resultData.summary || '',
            bullets: resultData.bullets || [],
            keywords: resultData.keywords || [],
            targetAudience: resultData.targetAudience || '',
            prerequisites: resultData.prerequisites || '',
            ragUsed: resultData.ragUsed || false,
            ragContext: resultData.ragContext || '',
            tokens: resultData.tokens || 0,
            model: resultData.model || ''
          }
          
          console.log('Setting AI summary data:', summaryData)
          
          // Store full result for display
          setSyllabusDetailAISummary(summaryData)
          setSyllabusDetailAISummaryLoading(false)
          showToast('Tóm tắt AI được tạo thành công', 'success')
        } else if (job.status === 'FAILED') {
          setSyllabusDetailAISummaryLoading(false)
          showToast('Tạo tóm tắt AI thất bại: ' + (job.error || 'Unknown error'), 'error')
        } else if (job.status === 'QUEUED' || job.status === 'RUNNING') {
          attempts++
          console.log(`Polling attempt ${attempts}/${maxAttempts}, job status: ${job.status}`)
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            setSyllabusDetailAISummaryLoading(false)
            showToast('Hết thời gian chờ tạo tóm tắt AI', 'warning')
          }
        } else {
          // Unknown status
          console.warn('Unknown job status:', job.status)
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000)
          } else {
            setSyllabusDetailAISummaryLoading(false)
            showToast('Không thể xác định trạng thái tóm tắt AI', 'warning')
          }
        }
      } catch (err) {
        console.error('Poll job status failed:', err)
        setSyllabusDetailAISummaryLoading(false)
        showToast('Lỗi khi kiểm tra trạng thái: ' + err.message, 'error')
      }
    }
    
    poll()
  }

  const downloadDocumentAsFile = async (documentId, fileName) => {
    try {
      const response = await apiClient.get(`/api/syllabus/documents/${documentId}/download`, {
        responseType: 'blob'
      })
      // Create File object from blob
      return new File([response.data], fileName, { type: response.data.type })
    } catch (err) {
      console.error('Download document failed:', err)
      throw err
    }
  }

  const generateDocumentSummary = async (documentId, documentFileName) => {
    if (!syllabusDetailData?.id) {
      showToast('Không tìm thấy giáo trình', 'error')
      return
    }

    setDocumentSummarizingId(documentId)

    try {
      // Step 1: Download document file từ server
      console.log('[Summary] Step 1: Downloading document:', documentId)
      const documentFile = await downloadDocumentAsFile(documentId, documentFileName)
      console.log('[Summary] Document downloaded successfully')

      // Step 2: Ingest document vào AI service (POST /ai/documents/ingest)
      console.log('[Summary] Step 2: Ingesting document to AI service')
      const ingestRes = await aiService.ingestDocument(
        documentFile,
        syllabusDetailData.id,
        syllabusDetailData.subjectName || '',
        documentId  // document_id parameter
      )
      console.log('[Summary] Ingest response:', ingestRes)

      // Check ingest response
      if (!ingestRes.data?.success) {
        // Extract error message from nested structure
        const errorMsg = ingestRes.data?.error?.message || 
                        ingestRes.data?.message || 
                        'Lỗi tải tài liệu vào AI service'
        console.error('[Summary] ❌ Ingest failed:', errorMsg, 'Full response:', ingestRes.data)
        showToast(errorMsg, 'error')
        setDocumentSummarizingId(null)
        return
      }

      console.log('[Summary] ✅ Document ingested successfully, chunks created:', ingestRes.data?.chunks_created)

      // Step 3: Generate summary (POST /ai/summary)
      console.log('[Summary] Step 3: Generating summary using POST /ai/summary')
      let summaryRes
      try {
        summaryRes = await aiService.generateDocumentSummary(
          syllabusDetailData.id,
          documentId,
          'MEDIUM'
        )
        console.log('[Summary] Summary API response:', summaryRes)
      } catch (summaryError) {
        console.error('[Summary] ❌ Summary API call failed:', summaryError)
        const errorMsg = summaryError.response?.data?.error?.message || 
                        summaryError.response?.data?.message || 
                        summaryError.message || 
                        'Lỗi tạo tóm tắt'
        showToast(errorMsg, 'error')
        setDocumentSummarizingId(null)
        return
      }

      // Extract jobId from response (JobCreateResponse)
      // Response format: { jobId, status: "QUEUED", message }
      const jobId = summaryRes.data?.jobId || summaryRes?.jobId
      const jobStatus = summaryRes.data?.status || summaryRes?.status

      if (!jobId) {
        console.error('[Summary] ❌ No jobId in response:', summaryRes)
        showToast('Không thể tạo job tóm tắt (không nhận được jobId)', 'error')
        setDocumentSummarizingId(null)
        return
      }

      console.log('[Summary] ✅ Summary job created - jobId:', jobId, 'status:', jobStatus)

      // Step 4: Save jobId to syllabus_documents.ai_ingestion_job_id
      console.log('[Summary] Step 4: Saving jobId to ai_ingestion_job_id')
      try {
        await aiService.saveDocumentJobIdImmediately(documentId, jobId)
        console.log('[Summary] ✅ jobId saved to database successfully')

        // Step 5: Reload documents to refresh UI
        console.log('[Summary] Step 5: Reloading documents from server')
        const docsRes = await syllabusServiceV2.getDocumentsBySyllabus(syllabusDetailData.id)
        const updatedDocs = docsRes.data?.data || docsRes.data || []
        setSyllabusDetailDocuments(updatedDocs)
        console.log('[Summary] ✅ Documents reloaded - "Xem tóm tắt" button should now be visible')

        showToast('✅ Tài liệu đã được gửi để tóm tắt. Tóm tắt sẽ có sẵn trong vài giây.', 'success')
        setDocumentSummarizingId(null)
      } catch (saveError) {
        console.error('[Summary] ❌ Failed to save jobId:', saveError)
        showToast('⚠️ Lưu jobId thất bại (job vẫn đang chạy): ' + saveError.message, 'warning')
        setDocumentSummarizingId(null)
      }
    } catch (err) {
      console.error('[Summary] ❌ Unexpected error:', err)
      showToast('Lỗi khi tạo tóm tắt: ' + err.message, 'error')
      setDocumentSummarizingId(null)
    }
  }



  const resetForm = () => {
    setFormData({
      subjectCode: '',
      subjectName: '',
      summary: ''
    })
    setSelectedSyllabus(null)
  }

  const resetDocumentsForm = () => {
    setDocumentFile(null)
    setDocumentTitle('')
    setDocumentDescription('')
    // Don't reset selectedSyllabus - it's set when opening the modal
  }


  const handleAddDocument = async () => {
    try {
      if (!selectedSyllabus) {
        showToast('Vui lòng chọn giáo trình', 'warning')
        return
      }
      if (!documentTitle.trim()) {
        showToast('Vui lòng nhập tiêu đề tài liệu', 'warning')
        return
      }
      if (!documentFile) {
        showToast('Vui lòng chọn tệp tài liệu', 'warning')
        return
      }

      const formDataUpload = new FormData()
      formDataUpload.append('file', documentFile)
      formDataUpload.append('title', documentTitle)
      formDataUpload.append('description', documentDescription)
      formDataUpload.append('syllabusId', selectedSyllabus.id)

      // Call the syllabus documents API
      const res = await syllabusServiceV2.uploadDocument(selectedSyllabus.id, documentFile, documentTitle, documentDescription, currentUser?.userId || currentUser?.id)
      console.log('Upload document response:', res?.data)
      
      // Also ingest into AI service for RAG
      try {
        await aiService.ingestDocument(documentFile, selectedSyllabus.id, selectedSyllabus.subjectName || '')
        console.log('Document ingested into AI service')
      } catch (aiErr) {
        console.warn('Failed to ingest document into AI service:', aiErr)
        // Don't fail the entire operation if AI ingest fails
      }
      
      showToast('Thêm tài liệu thành công', 'success')
      setShowDocumentsModal(false)
      resetDocumentsForm()
      loadLecturerSyllabi()
    } catch (err) {
      console.error('Add document error:', err)
      showToast(err?.response?.data?.message || 'Thêm tài liệu thất bại', 'error')
    }
  }

  const filteredSyllabi = syllabi.filter(s => {
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
    const matchSearch = !searchQuery || 
      s.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectName?.toLowerCase().includes(searchQuery.toLowerCase())
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
          {/* Toast */}
          {toast.visible && (
            <div className="fixed top-6 right-6 z-50">
              <div className={`max-w-sm px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-yellow-600 text-black' : 'bg-indigo-600'}`}>
                {toast.message}
              </div>
            </div>
          )}
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
              Giáo trình của tôi
            </button>
            {isHod && (
              <button
                onClick={() => setActiveTab('review')}
                className={`px-6 py-4 font-semibold ${activeTab === 'review' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
              >
                Duyệt giáo trình
              </button>
            )}
          </div>

          {activeTab === 'syllabi' && (
            <div className="p-8">
              {/* Actions */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => { setSelectedSyllabus(null); setShowEditor(true); }}
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
                <div className="relative">
                  {filteredSyllabi.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="mb-2 font-semibold">Bạn chưa có giáo trình nào</div>
                      <div className="mb-4 text-sm">Bắt đầu tạo giáo trình mới để quản lý tài liệu và phiên bản.</div>
                      <div className="flex justify-center">
                        <button onClick={openCreateModal} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">Tạo giáo trình mới</button>
                      </div>
                    </div>
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
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.subjectCode}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.subjectName}</td>
                          <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">v{s.versionNo || s.version}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleViewSyllabusDetail(s)}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                title="Xem chi tiết"
                              >
                                <Eye size={16} />
                              </button>
                              {s.status === 'DRAFT' && (
                                <>
                                  <button
                                    onClick={() => { 
                                      console.log('[LecturerDashboard] Opening editor for syllabus:', s.id, s);
                                      openEditModal(s);
                                    }}
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
                              {s.status === 'REJECTED' && (
                                <button
                                  onClick={() => { 
                                    console.log('[LecturerDashboard] Opening editor for REJECTED syllabus:', s.id, s);
                                    openEditModal(s);
                                  }}
                                  className="text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}

                  {loading && (
                    <div className="absolute top-2 right-2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && isHod && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Danh sách cần duyệt (HoD)</h3>
                  <p className="text-sm text-gray-600">Nhấn duyệt / từ chối / yêu cầu chỉnh sửa.</p>
                </div>
                <button
                  onClick={() => loadReviewQueue(true)}
                  className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={reviewLoading}
                >
                  Làm mới
                </button>
              </div>

              {reviewError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
                  {reviewError}
                </div>
              )}

              {reviewLoading ? (
                <div className="text-gray-600">Đang tải danh sách cần duyệt...</div>
              ) : reviewItems.length === 0 ? (
                <div className="text-gray-500">Không có giáo trình nào đang chờ HoD duyệt.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-900">Môn học</th>
                        <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-900">Người tạo</th>
                        <th className="w-1/6 px-6 py-3 text-center text-sm font-semibold text-gray-900">Chi tiết</th>
                        <th className="w-1/3 px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reviewItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.syllabusData ? (
                              <div>
                                <div className="font-medium text-gray-900">{item.syllabusData.subjectCode}</div>
                                <div className="text-xs text-gray-500">{item.syllabusData.subjectName}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.syllabusData ? (
                              <div>
                                <div className="font-medium text-gray-900">{item.syllabusData.createdBy}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleViewSyllabusDetail(item)}
                              className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                            >
                              Xem
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleApproveWorkflow(item.id)}
                                className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60"
                                disabled={reviewLoading}
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectWorkflow(item.id)}
                                className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                                disabled={reviewLoading}
                              >
                                Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã môn học *</label>
                <input
                  type="text"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: CS-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học *</label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: Lập trình C++"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt (summary)</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                  placeholder="Tóm tắt ngắn về giáo trình (tuỳ chọn)"
                />
              </div>
              {/* Content development postponed - will be added later */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Ghi chú:</strong> Nội dung giáo trình (modules, mục tiêu, đánh giá) sẽ được phát triển trong phiên tiếp theo. Hiện tại bạn có thể chỉnh sửa thông tin cơ bản về môn học.
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

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-end">
              <button onClick={() => { setShowEditor(false); setSelectedSyllabus(null); }} className="px-3 py-1 bg-gray-200 rounded">Đóng</button>
            </div>
            <div className="p-4">
              <SyllabusEditorPage
                syllabusId={selectedSyllabus?.id}
                rootId={selectedSyllabus?.rootSyllabusId || selectedSyllabus?.id}
                user={currentUser}
                onBack={() => { 
                  // IMPORTANT: Không set selectedSyllabus=null ngay để tránh nullify props
                  // trong khi async operation vẫn chạy. Chỉ close editor.
                  setShowEditor(false); 
                  // Reload danh sách sau khi close
                  setTimeout(() => {
                    loadLecturerSyllabi();
                    setSelectedSyllabus(null);
                  }, 500);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to Create with different endpoint */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa giáo trình (Tạo phiên bản mới)</h2>
              <button onClick={() => {setShowEditModal(false); setSelectedSyllabus(null)}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-4">
              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã môn học *</label>
                <input
                  type="text"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học *</label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt (summary)</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                />
              </div>

              {/* Hiển thị nội dung cũ */}
              {selectedSyllabus?.content && selectedSyllabus?.content !== '{}' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Nội dung hiện tại</h3>
                  <div className="text-xs text-gray-700 space-y-2">
                    {(() => {
                      try {
                        const content = typeof selectedSyllabus.content === 'string' 
                          ? JSON.parse(selectedSyllabus.content) 
                          : selectedSyllabus.content
                        
                        return (
                          <div className="space-y-2">
                            {content.modules && content.modules.length > 0 && (
                              <div>
                                <p className="font-medium text-gray-700">Các module ({content.modules.length}):</p>
                                <ul className="ml-3 text-gray-600">
                                  {content.modules.map((mod, idx) => (
                                    <li key={idx}>• {mod.title || mod.name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {content.learningObjectives && (
                              <div>
                                <p className="font-medium text-gray-700">Mục tiêu học tập:</p>
                                <p className="ml-3 text-gray-600 whitespace-pre-wrap line-clamp-3">{content.learningObjectives}</p>
                              </div>
                            )}
                            {content.teachingMethods && (
                              <div>
                                <p className="font-medium text-gray-700">Phương pháp giảng dạy:</p>
                                <p className="ml-3 text-gray-600 line-clamp-2">{content.teachingMethods}</p>
                              </div>
                            )}
                            {content.assessmentMethods && (
                              <div>
                                <p className="font-medium text-gray-700">Phương pháp đánh giá:</p>
                                <p className="ml-3 text-gray-600 line-clamp-2">{content.assessmentMethods}</p>
                              </div>
                            )}
                          </div>
                        )
                      } catch (err) {
                        return <p className="text-red-600">Không thể hiển thị nội dung</p>
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Hiển thị CLO đã chọn */}
              {selectedSyllabus?.content && (() => {
                try {
                  const content = typeof selectedSyllabus.content === 'string' 
                    ? JSON.parse(selectedSyllabus.content) 
                    : selectedSyllabus.content
                  
                  if (content?.cloPairIds && content.cloPairIds.length > 0) {
                    return (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">CLO đã liên kết ({content.cloPairIds.length})</h3>
                        <div className="text-xs text-gray-700">
                          <p>IDs: {content.cloPairIds.join(', ')}</p>
                        </div>
                      </div>
                    )
                  }
                } catch (e) {
                  return null
                }
              })()}

              {/* Hiển thị tài liệu đã tải lên */}
              {syllabusDocuments && syllabusDocuments.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tài liệu giảng dạy ({syllabusDocuments.length})</h3>
                  <div className="space-y-2">
                    {syllabusDocuments.map((doc, idx) => (
                      <div key={idx} className="text-xs bg-white p-2 rounded border border-orange-100">
                        <p className="font-medium text-gray-700">{doc.title || doc.originalName || doc.fileName}</p>
                        {doc.description && <p className="text-gray-600 mt-1">{doc.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Ghi chú:</strong> Chỉnh sửa thông tin cơ bản (mã môn, tên môn, tóm tắt) sẽ tạo phiên bản mới. Để chỉnh sửa chi tiết nội dung, modules, CLO và tài liệu, vui lòng sử dụng công cụ biên tập giáo trình.
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowEditModal(false); setSelectedSyllabus(null); setSyllabusDocuments([])}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
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
                <h2 className="text-2xl font-bold text-gray-900">{selectedSyllabus.subjectName || selectedSyllabus.courseName}</h2>
                <p className="text-sm text-gray-600">{selectedSyllabus.subjectCode || selectedSyllabus.courseCode} • v{selectedSyllabus.versionNo || selectedSyllabus.version || 1}</p>
              </div>
              <button onClick={() => {setShowDetailModal(false); setSelectedSyllabus(null); setSyllabusDocuments([])}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="font-semibold">Trạng thái:</span>
                {getStatusBadge(selectedSyllabus.status)}
              </div>

              {/* Basic Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mã môn học:</span>
                    <div className="font-semibold text-gray-900 mt-1">{selectedSyllabus.subjectCode || selectedSyllabus.courseCode || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tên môn học:</span>
                    <div className="font-semibold text-gray-900 mt-1">{selectedSyllabus.subjectName || selectedSyllabus.courseName || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Người tạo:</span>
                    <div className="font-semibold text-gray-900 mt-1">{selectedSyllabus.createdBy || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phiên bản:</span>
                    <div className="font-semibold text-gray-900 mt-1">v{selectedSyllabus.versionNo || selectedSyllabus.version || 1}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <div className="font-semibold text-gray-900 mt-1">
                      {selectedSyllabus.createdAt ? new Date(selectedSyllabus.createdAt).toLocaleString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedSyllabus.summary && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt</h3>
                  <p className="text-gray-700">{selectedSyllabus.summary}</p>
                </div>
              )}

              {/* Content Preview */}
              {selectedSyllabus.content && selectedSyllabus.content !== '{}' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung giáo trình</h3>
                  <div className="text-sm text-gray-700">
                    {(() => {
                      try {
                        const content = typeof selectedSyllabus.content === 'string' 
                          ? JSON.parse(selectedSyllabus.content) 
                          : selectedSyllabus.content
                        
                        if (typeof content === 'object') {
                          return (
                            <div className="space-y-4">
                              {(content.subjectCode || content.academicYear || content.semester) && (
                                <div className="bg-white p-3 rounded border border-gray-200">
                                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {content.subjectCode && <div><span className="text-gray-600">Mã môn:</span> <span className="font-medium">{content.subjectCode}</span></div>}
                                    {content.syllabusCode && <div><span className="text-gray-600">Mã giáo trình:</span> <span className="font-medium">{content.syllabusCode}</span></div>}
                                    {content.academicYear && <div><span className="text-gray-600">Năm học:</span> <span className="font-medium">{content.academicYear}</span></div>}
                                    {content.semester && <div><span className="text-gray-600">Học kỳ:</span> <span className="font-medium">{content.semester}</span></div>}
                                  </div>
                                </div>
                              )}

                              {content.modules && content.modules.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Các module ({content.modules.length})</h4>
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

                              {content.learningObjectives && content.learningObjectives.trim() && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Mục tiêu học tập</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content.learningObjectives}</p>
                                </div>
                              )}

                              {content.teachingMethods && content.teachingMethods.trim() && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Phương pháp giảng dạy</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content.teachingMethods}</p>
                                </div>
                              )}

                              {content.assessmentMethods && content.assessmentMethods.trim() && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Phương pháp đánh giá</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content.assessmentMethods}</p>
                                </div>
                              )}

                              {content.cloPairIds && content.cloPairIds.length > 0 && (
                                <CLODetailsDisplay cloIds={content.cloPairIds} />
                              )}

                              {(!content.modules || content.modules.length === 0) &&
                               (!content.learningObjectives || !content.learningObjectives.trim()) &&
                               (!content.teachingMethods || !content.teachingMethods.trim()) &&
                               (!content.assessmentMethods || !content.assessmentMethods.trim()) &&
                               (!content.cloPairIds || content.cloPairIds.length === 0) && (
                                <div className="text-gray-500 italic">
                                  Chưa có nội dung chi tiết. Hãy thêm modules, mục tiêu, phương pháp giảng dạy và đánh giá.
                                </div>
                              )}
                            </div>
                          )
                        } else {
                          return <pre className="whitespace-pre-wrap overflow-x-auto">{content}</pre>
                        }
                      } catch (err) {
                        return (
                          <div>
                            <p className="text-red-600 text-xs mb-2">⚠️ Không thể parse JSON, hiển thị thô:</p>
                            <pre className="bg-white p-3 rounded border border-gray-300 text-xs overflow-x-auto max-h-48">
                              {selectedSyllabus.content}
                            </pre>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Documents / Lectures list */}
              {syllabusDocuments && syllabusDocuments.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu giảng dạy</h3>
                  <ul className="space-y-3">
                    {syllabusDocuments.map((doc) => (
                      <li key={doc.id} className="p-3 bg-white border border-gray-200 rounded flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{doc.title || doc.originalName || doc.fileName || 'Không có tiêu đề'}</div>
                          {doc.description && <div className="text-sm text-gray-600 mt-1">{doc.description}</div>}
                          <div className="text-xs text-gray-500 mt-2">Tải lên bởi {doc.uploadedBy || doc.createdBy || doc.createdByName || 'N/A'} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('vi-VN') : (doc.createdAt ? new Date(doc.createdAt).toLocaleString('vi-VN') : '')}</div>
                        </div>
                        <div className="flex-shrink-0 ml-4 flex flex-col gap-2">
                          <button onClick={() => handleViewDocument(doc.id)} className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Xem</button>
                          <button onClick={() => handleDownloadDocument(doc.id, doc.originalName || doc.fileName || doc.title)} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Tải</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cập nhật lần cuối:</span>
                    <div className="text-gray-900 mt-1">
                      {selectedSyllabus.updatedAt ? new Date(selectedSyllabus.updatedAt).toLocaleString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowDetailModal(false); setSelectedSyllabus(null); setSyllabusDocuments([])}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Đóng</button>
              {selectedSyllabus.status === 'DRAFT' && (
                <>
                  <button onClick={() => handleDeleteSyllabus(selectedSyllabus.id)} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Xoá</button>
                  <button onClick={() => handleSubmitForReview(selectedSyllabus.id)} className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Gửi phê duyệt</button>
                  <button onClick={() => {setShowDetailModal(false); openEditModal(selectedSyllabus)}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Chỉnh sửa</button>
                </>
              )}
              {selectedSyllabus.status === 'REJECTED' && (
                <button onClick={() => {setShowDetailModal(false); openEditModal(selectedSyllabus)}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Chỉnh sửa</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Thêm tài liệu giảng dạy</h2>
              <button onClick={() => {setShowDocumentsModal(false); resetDocumentsForm()}} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-8 space-y-4">
              {selectedSyllabus && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-gray-600">Giáo trình được chọn</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedSyllabus.subjectCode} - {selectedSyllabus.subjectName}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề tài liệu *</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="VD: Bài giảng 1 - Giới thiệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tuỳ chọn)</label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Mô tả nội dung tài liệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tệp tài liệu *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                  <input
                    type="file"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="document-file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  />
                  <label htmlFor="document-file" className="cursor-pointer block">
                    <div className="text-gray-600">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="font-semibold">Chọn tệp hoặc kéo thả</div>
                      <div className="text-sm text-gray-500">PDF, Word, PowerPoint, Excel (tối đa 50MB)</div>
                      {documentFile && <div className="text-sm text-green-600 mt-2">✓ {documentFile.name}</div>}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t">
              <button onClick={() => {setShowDocumentsModal(false); setSelectedSyllabus(null); resetDocumentsForm()}} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
              <button onClick={handleAddDocument} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Thêm tài liệu</button>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Detail Modal */}
      {showSyllabusDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết giáo trình</h2>
              <button 
                onClick={() => {
                  setShowSyllabusDetailModal(false)
                  setSyllabusDetailData(null)
                }} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {syllabusDetailLoading ? (
                <div className="text-center py-8 text-gray-600">
                  Đang tải thông tin giáo trình...
                </div>
              ) : syllabusDetailData ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Mã môn học:</span>
                        <div className="font-semibold text-gray-900">{syllabusDetailData.subjectCode}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Tên môn học:</span>
                        <div className="font-semibold text-gray-900">{syllabusDetailData.subjectName}</div>
                      </div>
                      {syllabusDetailData.programInfo && (
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600">Chương trình đào tạo:</span>
                          <div className="font-semibold text-gray-900">
                            {syllabusDetailData.programInfo.programCode} - {syllabusDetailData.programInfo.programName}
                          </div>
                        </div>
                      )}
                      {syllabusDetailData.subjectInfo && (
                        <>
                          <div>
                            <span className="text-sm text-gray-600">Số tín chỉ:</span>
                            <div className="font-semibold text-gray-900">{syllabusDetailData.subjectInfo.credits || '-'}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Học kỳ:</span>
                            <div className="font-semibold text-gray-900">{syllabusDetailData.subjectInfo.semester || '-'}</div>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <div className="font-semibold">
                          <span className={`px-2 py-1 rounded text-xs ${
                            syllabusDetailData.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            syllabusDetailData.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                            syllabusDetailData.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                            syllabusDetailData.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                            syllabusDetailData.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {syllabusDetailData.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phiên bản:</span>
                        <div className="font-semibold text-gray-900">v{syllabusDetailData.versionNo || 1}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Người tạo:</span>
                        <div className="font-semibold text-gray-900">{syllabusDetailData.createdBy}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Ngày tạo:</span>
                        <div className="font-semibold text-gray-900">
                          {syllabusDetailData.createdAt ? new Date(syllabusDetailData.createdAt).toLocaleString('vi-VN') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Timeline */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử workflow</h3>
                    <div className="space-y-3">
                      {syllabusDetailData.submittedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Đã nộp:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(syllabusDetailData.submittedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      )}
                      {syllabusDetailData.reviewedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Đã duyệt bởi HoD:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(syllabusDetailData.reviewedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      )}
                      {syllabusDetailData.approvedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Đã phê duyệt:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(syllabusDetailData.approvedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      )}
                      {syllabusDetailData.rejectedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Bị từ chối:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(syllabusDetailData.rejectedAt).toLocaleString('vi-VN')}
                            </span>
                            {syllabusDetailData.rejectionReason && (
                              <div className="text-sm text-red-600 mt-1">Lý do: {syllabusDetailData.rejectionReason}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {syllabusDetailData.publishedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Đã công bố:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(syllabusDetailData.publishedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {syllabusDetailData.summary && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt</h3>
                      <p className="text-gray-700">{syllabusDetailData.summary}</p>
                    </div>
                  )}

                  {/* Content Preview */}
                  {syllabusDetailData.content && syllabusDetailData.content !== '{}' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung giáo trình</h3>
                      <div className="text-sm text-gray-700">
                        {(() => {
                          try {
                            const content = typeof syllabusDetailData.content === 'string' 
                              ? JSON.parse(syllabusDetailData.content) 
                              : syllabusDetailData.content
                            
                            // Nếu là object, render từng field
                            if (typeof content === 'object') {
                              return (
                                <div className="space-y-4">
                                  {/* Metadata Section */}
                                  {(content.subjectCode || content.academicYear || content.semester) && (
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                      <h4 className="font-semibold text-gray-900 mb-2">Thông tin</h4>
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
                                      <h4 className="font-semibold text-gray-900 mb-2">Các module ({content.modules.length})</h4>
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
                                      <h4 className="font-semibold text-gray-900 mb-2">Mục tiêu học tập</h4>
                                      <p className="text-gray-700 whitespace-pre-wrap">{content.learningObjectives}</p>
                                    </div>
                                  )}

                                  {/* Teaching Methods */}
                                  {content.teachingMethods && content.teachingMethods.trim() && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Phương pháp giảng dạy</h4>
                                      <p className="text-gray-700 whitespace-pre-wrap">{content.teachingMethods}</p>
                                    </div>
                                  )}

                                  {/* Assessment Methods */}
                                  {content.assessmentMethods && content.assessmentMethods.trim() && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Phương pháp đánh giá</h4>
                                      <p className="text-gray-700 whitespace-pre-wrap">{content.assessmentMethods}</p>
                                    </div>
                                  )}

                                  {/* CLO Pair IDs */}
                                  {content.cloPairIds && content.cloPairIds.length > 0 && (
                                    <CLODetailsDisplay cloIds={content.cloPairIds} />
                                  )}

                                  {/* Empty state */}
                                  {(!content.modules || content.modules.length === 0) &&
                                   (!content.learningObjectives || !content.learningObjectives.trim()) &&
                                   (!content.teachingMethods || !content.teachingMethods.trim()) &&
                                   (!content.assessmentMethods || !content.assessmentMethods.trim()) &&
                                   (!content.cloPairIds || content.cloPairIds.length === 0) && (
                                    <div className="text-gray-500 italic">
                                      Chưa có nội dung chi tiết. Hãy thêm modules, mục tiêu, phương pháp giảng dạy và đánh giá.
                                    </div>
                                  )}
                                </div>
                              )
                            } else {
                              // Nếu là string, hiển thị thô
                              return <pre className="whitespace-pre-wrap overflow-x-auto">{content}</pre>
                            }
                          } catch (err) {
                            // Nếu parse lỗi, hiển thị thô
                            return (
                              <div>
                                <p className="text-red-600 text-xs mb-2">⚠️ Không thể parse JSON, hiển thị thô:</p>
                                <pre className="bg-white p-3 rounded border border-gray-300 text-xs overflow-x-auto max-h-48">
                                  {syllabusDetailData.content}
                                </pre>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tệp bài giảng ({syllabusDetailDocuments.length})</h3>
                    {syllabusDetailDocumentsLoading ? (
                      <div className="text-center py-4 text-gray-600">
                        <p className="text-sm">Đang tải tệp...</p>
                      </div>
                    ) : syllabusDetailDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {syllabusDetailDocuments.map((doc) => (
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

                                {/* Show document summary if available */}
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
                                            <li key={idx} className="text-xs">
                                              {bullet}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {documentSummaries[doc.id].keywords && documentSummaries[doc.id].keywords.length > 0 && (
                                      <div>
                                        <p className="font-semibold text-blue-900 mb-1">🏷️ Từ khoá:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {documentSummaries[doc.id].keywords.map((kw, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-block px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded"
                                            >
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

                                    {documentSummaries[doc.id].ragUsed && (
                                      <div className="bg-purple-100 p-2 rounded">
                                        <p className="font-semibold text-purple-900 mb-1">🔗 RAG Context:</p>
                                        <p className="text-purple-800 text-xs whitespace-pre-wrap">{documentSummaries[doc.id].ragContext}</p>
                                      </div>
                                    )}

                                    {documentSummaries[doc.id].model && (
                                      <p className="text-xs text-blue-600 italic border-t border-blue-200 pt-2">
                                        ⚙️ Model: {documentSummaries[doc.id].model} | 💬 Tokens: {documentSummaries[doc.id].tokens}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 flex-shrink-0 flex-col">
                                <button
                                  onClick={() => handleViewDocument(doc.id)}
                                  title="Xem trực tiếp"
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                                >
                                  <Eye size={14} />
                                  Xem
                                </button>
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
                                <button
                                  onClick={() => generateDocumentSummary(doc.id, doc.fileName)}
                                  disabled={documentSummarizingId === doc.id}
                                  title="Tóm tắt tài liệu bằng AI"
                                  className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  {documentSummarizingId === doc.id ? (
                                    <Loader size={14} className="animate-spin" />
                                  ) : (
                                    <Zap size={14} />
                                  )}
                                  {documentSummarizingId === doc.id ? 'Đang...' : 'Tóm tắt'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm italic">Chưa có tệp bài giảng nào được tải lên</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Workflow ID:</span>
                        <div className="font-mono text-xs text-gray-900 mt-1">{syllabusDetailData.workflowId || '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Người cập nhật gần nhất:</span>
                        <div className="text-gray-900 mt-1">{syllabusDetailData.lastActionBy || syllabusDetailData.updatedBy || '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Root ID:</span>
                        <div className="font-mono text-xs text-gray-900 mt-1">{syllabusDetailData.rootId || '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cập nhật lần cuối:</span>
                        <div className="text-gray-900 mt-1">
                          {syllabusDetailData.updatedAt ? new Date(syllabusDetailData.updatedAt).toLocaleString('vi-VN') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-600">
                  Không tải được thông tin giáo trình
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end border-t">
              <button 
                onClick={() => {
                  setShowSyllabusDetailModal(false)
                  setSyllabusDetailData(null)
                }} 
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Đóng
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
    </div>
  )
}

export default LecturerDashboard