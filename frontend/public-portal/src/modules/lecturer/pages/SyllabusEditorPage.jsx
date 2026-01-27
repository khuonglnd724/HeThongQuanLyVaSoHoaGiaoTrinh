import React, { useEffect, useState, useRef } from 'react'
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Trash2,
  File,
  Plus,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'
import dualSyllabusOrchestrator from '../services/dualSyllabusOrchestrator'
import { academicAPI } from '../services/academicAPI'
import { syllabusApprovalService } from '../services/syllabusApprovalService'
import aiService from '../services/aiService'

const SyllabusEditorPage = ({ syllabusId: initialSyllabusId, rootId, user, onBack }) => {
  // Debug logging
  console.log('[SyllabusEditorPage] Component initialized with:', {
    initialSyllabusId,
    rootId,
    hasUser: !!user
  })

  const [syllabusId, setSyllabusId] = useState(initialSyllabusId)
  const syllabusIdRef = useRef(initialSyllabusId)  // Keep immutable reference
  const mode = syllabusId ? 'edit' : 'create'
  const userId = user?.userId || user?.id

  // Keep syllabusIdRef in sync with syllabusId state and log changes
  useEffect(() => {
    console.log('[SyllabusEditorPage] syllabusId state updated:', syllabusId)
    if (syllabusId) {
      syllabusIdRef.current = syllabusId
      console.log('[SyllabusEditorPage] syllabusIdRef updated to:', syllabusIdRef.current)
    }
  }, [syllabusId])

  // Monitor prop changes
  useEffect(() => {
    console.log('[SyllabusEditorPage] Props changed - initialSyllabusId:', initialSyllabusId)
    if (initialSyllabusId && initialSyllabusId !== syllabusId) {
      console.log('[SyllabusEditorPage] Updating syllabusId from prop:', initialSyllabusId)
      setSyllabusId(initialSyllabusId)
    }
  }, [initialSyllabusId])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic') // basic | clos | structure | files

  const [subjects, setSubjects] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [clos, setClos] = useState([])
  const [closLoading, setClosLoading] = useState(false)
  const [plos, setPlos] = useState([])
  const [plosLoading, setPlosLoading] = useState(false)
  const [programInfo, setProgramInfo] = useState(null)
  const [academicSyllabusId, setAcademicSyllabusId] = useState(null)  // ID từ academic-service
  const [loadedRootId, setLoadedRootId] = useState(null)  // rootId loaded from API
  const [loadedSubjectCode, setLoadedSubjectCode] = useState(null)  // Temp storage for matching subject
  const [loadedCloPairIds, setLoadedCloPairIds] = useState([])
  const [formData, setFormData] = useState({
    subjectId: '',
    summary: '',
    learningObjectives: '',
    teachingMethods: '',
    assessmentMethods: '',
    cloPairIds: [],
    modules: []
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showCloModal, setShowCloModal] = useState(false)
  const [showAddCloModal, setShowAddCloModal] = useState(false)
  const [creatingClo, setCreatingClo] = useState(false)
  const [newModule, setNewModule] = useState({
    week: '',
    topic: '',
    content: '',
    learning_objectives: ''
  })
  const [newClo, setNewClo] = useState({
    cloCode: '',
    description: '',
    selectedPloIds: []
  })
  const [syllabusStatus, setSyllabusStatus] = useState(null)  // DRAFT, REJECTED, etc.

  useEffect(() => {
    const init = async () => {
      await loadSubjects()
      if (mode === 'edit' && syllabusId) {
        await loadSyllabus()
      }
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabusId, mode])

  // After subjects are loaded, try to match subjectId if we have subjectCode
  useEffect(() => {
    if (subjects.length > 0 && loadedSubjectCode && !formData.subjectId) {
      const matchedSubject = subjects.find(s => 
        (s.subjectCode || '').toLowerCase() === loadedSubjectCode.toLowerCase()
      )
      if (matchedSubject) {
        console.log('Matched subject:', matchedSubject)
        setFormData(prev => ({ ...prev, subjectId: matchedSubject.id }))
        // CLOs will be loaded by the next useEffect
      }
    }
  }, [subjects, loadedSubjectCode, formData.subjectId])

  const loadSubjects = async () => {
    setSubjectsLoading(true)
    try {
      const res = await syllabusServiceV2.getSubjects()
      const data = res.data?.data || res.data || []
      const normalized = Array.isArray(data)
        ? data.map(s => ({
          ...s,
          // normalize subjectCode from possible backend keys and trim spaces
          subjectCode: (s.subjectCode || s.code || s.subject_code || s.subjectcode || '').trim(),
          // normalize subjectName for downstream payloads
          subjectName: (s.subjectName || s.name || s.subject_name || s.subjectname || '').trim()
        }))
        : []
      setSubjects(normalized)
    } catch (err) {
      console.error('Failed to load subjects', err)
      alert('Không thể tải danh sách môn học')
    } finally {
      setSubjectsLoading(false)
    }
  }

  const loadSyllabus = async () => {
    try {
      const res = await syllabusServiceV2.getById(syllabusId)
      const data = res.data?.data || res.data || {}
      
      console.log('Loaded syllabus from API:', data)
      console.log('[SyllabusEditorPage] Checking rootId from API:', data.rootId || 'NOT FOUND')
      console.log('[SyllabusEditorPage] Current syllabusId:', syllabusId)
      console.log('[SyllabusEditorPage] Checking for academicId:', data.academicId || data.academicSyllabusId || 'NOT FOUND')
      
      // CRITICAL: Set rootId from API response (this is the root syllabus ID)
      if (data.rootId) {
        // This is a child version, set rootId
        console.log('[SyllabusEditorPage] Setting loadedRootId from API:', data.rootId)
        setLoadedRootId(data.rootId)
      } else {
        // This IS the root version (no rootId in response means this is the root)
        console.log('[SyllabusEditorPage] No rootId in response - this IS the root version')
        setLoadedRootId(null)  // null means this is the root
      }
      
      // Set academicSyllabusId if exists in response
      if (data.academicId || data.academicSyllabusId) {
        setAcademicSyllabusId(data.academicId || data.academicSyllabusId)
        console.log('[SyllabusEditorPage] Set academicSyllabusId to:', data.academicId || data.academicSyllabusId)
      } else {
        // Fallback: use syllabusId as academicId for backward compatibility
        setAcademicSyllabusId(syllabusId)
        console.log('[SyllabusEditorPage] No academicId found, using syllabusId as fallback:', syllabusId)
      }
      
      // Set status
      setSyllabusStatus(data.status || null)
      
      // Parse content JSON to extract cloPairIds and other fields
      let cloPairIds = []
      let contentObj = {}
      if (data.content) {
        try {
          contentObj = typeof data.content === 'string' ? JSON.parse(data.content) : data.content
          cloPairIds = contentObj.cloPairIds || []
        } catch (e) {
          console.warn('Failed to parse content JSON:', e)
        }
      }
      
      // Get subject code to match with subjects list later
      const subjectCode = data.subjectCode || contentObj.subjectCode || ''
      const subjectId = data.subjectId || contentObj.subjectId || ''
      
      console.log('Parsed data:', { subjectId, subjectCode, cloPairIds, status: data.status })
      
      // Store for later matching
      setLoadedSubjectCode(subjectCode)
      setLoadedCloPairIds(cloPairIds)
      
      setFormData({
        subjectId: subjectId,
        summary: contentObj.summary || '',
        learningObjectives: contentObj.learningObjectives || '',
        teachingMethods: contentObj.teachingMethods || '',
        assessmentMethods: contentObj.assessmentMethods || '',
        cloPairIds: cloPairIds,
        modules: contentObj.modules || []
      })
    } catch (err) {
      console.error('Failed to load syllabus', err)
      alert('Không thể tải giáo trình')
    }
  }

  const loadClos = async (subjectId) => {
    if (!subjectId) {
      setClos([])
      return
    }
    setClosLoading(true)
    try {
      // Use new API that enriches CLOs with PLO mapping information
      const res = await academicAPI.getClosBySubjectWithPloMapping(subjectId)
      const closList = res.data?.data || res.data || []
      setClos(Array.isArray(closList) ? closList : [])
    } catch (err) {
      console.error('Load CLOs failed:', err)
      setClos([])
    } finally {
      setClosLoading(false)
    }
  }

  const loadPlos = async (programId) => {
    if (!programId) {
      setPlos([])
      setProgramInfo(null)
      return
    }
    setPlosLoading(true)
    try {
      // Fetch PLOs
      const res = await academicAPI.getPlosByProgram(programId)
      const plosList = res.data?.data || res.data || []
      setPlos(Array.isArray(plosList) ? plosList : [])
      
      // Fetch program details
      try {
        const progRes = await academicAPI.getProgramById(programId)
        setProgramInfo(progRes.data?.data || progRes.data || null)
      } catch (progErr) {
        console.warn('Failed to load program details:', progErr)
        setProgramInfo(null)
      }
    } catch (err) {
      console.error('Load PLOs failed:', err)
      setPlos([])
      setProgramInfo(null)
    } finally {
      setPlosLoading(false)
    }
  }

  // Load CLOs/PLOs when subject changes
  useEffect(() => {
    if (formData.subjectId) {
      const subject = subjects.find(s => String(s.id) === String(formData.subjectId))
      if (subject) {
        loadClos(formData.subjectId)
        if (subject.programId) {
          loadPlos(subject.programId)
        }
      }
    }
  }, [formData.subjectId, subjects])

  const onChangeField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubjectChange = (value) => {
    setFormData(prev => ({ ...prev, subjectId: value }))
  }

  const toggleCloPair = (cloId) => {
    setFormData(prev => {
      const cloPairIds = prev.cloPairIds.includes(cloId)
        ? prev.cloPairIds.filter(id => id !== cloId)
        : [...prev.cloPairIds, cloId]
      return { ...prev, cloPairIds }
    })
  }

  // Unused functions - commented out to avoid ESLint warnings
  // const handleAddModule = () => {
  //   if (!newModule.week || !newModule.topic) {
  //     alert('Vui lòng nhập tuần và chủ đề')
  //     return
  //   }
  //   setFormData(prev => ({
  //     ...prev,
  //     modules: [
  //       ...prev.modules,
  //       {
  //         ...newModule,
  //         id: Date.now(),
  //         week: parseInt(newModule.week)
  //       }
  //     ]
  //   }))
  //   setNewModule({ week: '', topic: '', content: '', learning_objectives: '' })
  //   setShowModuleForm(false)
  // }

  // const handleRemoveModule = (moduleId) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     modules: prev.modules.filter(m => m.id !== moduleId)
  //   }))
  // }

  const handleFileUpload = (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const list = Array.from(files)
    setSelectedFiles(prev => [...prev, ...list])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const previewFile = (file) => {
    const fileUrl = URL.createObjectURL(file)
    window.open(fileUrl, '_blank')
  }

  const uploadDocuments = async (savedId) => {
    if (!savedId || selectedFiles.length === 0) return
    setUploading(true)
    try {
      for (const file of selectedFiles) {
        await syllabusServiceV2.uploadDocument(savedId, file, file.name, formData.description, userId)
      }
      return true
    } catch (err) {
      console.error('Upload documents failed', err)
      alert('Tải tệp thất bại cho một số tài liệu')
      return false
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.subjectId) {
      alert('Vui lòng chọn môn học')
      return
    }

    if (formData.cloPairIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 CLO')
      return
    }

    const subject = subjects.find(s => String(s.id) === String(formData.subjectId))
    if (!subject || !subject.subjectCode) {
      alert('Môn học thiếu mã môn (subjectCode). Vui lòng chọn lại hoặc tải lại danh sách môn học.')
      return
    }

    const subjectCode = subject.subjectCode.trim()
    const subjectName = (subject.subjectName || subject.name || '').trim()

    const payload = {
      syllabusCode: formData.syllabusCode || `${subjectCode}-${new Date().getFullYear()}`,
      subjectCode,
      subjectName,
      subjectId: Number(formData.subjectId),
      academicYear: formData.academicYear || new Date().getFullYear().toString(),
      semester: formData.semester || 1,
      content: JSON.stringify({
        summary: formData.summary || '',
        learningObjectives: formData.learningObjectives || '',
        teachingMethods: formData.teachingMethods || '',
        assessmentMethods: formData.assessmentMethods || '',
        modules: formData.modules || [],
        cloPairIds: formData.cloPairIds || [],
        subjectId: Number(formData.subjectId),
        subjectCode: subjectCode
      }),
      summary: formData.summary || '',
      cloPairIds: formData.cloPairIds,
      modules: formData.modules,
      version: formData.version || 1
    }

    setSaving(true)
    try {
      let savedId = syllabusId
      let newAcademicId = academicSyllabusId

      if (mode === 'create') {
        // ===== Create dùng dual orchestrator =====
        console.log('[SyllabusEditorPage] Creating with dual orchestrator')
        const res = await dualSyllabusOrchestrator.createDualSyllabus(payload, userId)
        
        savedId = res.id  // syllabusServiceId
        newAcademicId = res.academicId
        
        console.log('[SyllabusEditorPage] Dual creation successful', {
          syllabusServiceId: savedId,
          academicId: newAcademicId,
          cloPairIds: res.cloPairIds
        })

        setAcademicSyllabusId(newAcademicId)
        setSyllabusId(savedId)

        await uploadDocuments(savedId)
        alert('Tạo giáo trình thành công')
      } else {
        // ===== Update mode =====
        // Check status: nếu DRAFT hoặc REJECTED → tạo version mới
        // Ngược lại → chỉ update partial (documents)
        const effectiveSyllabusId = syllabusIdRef.current || syllabusId  // Use ref as fallback
        
        console.log('[SyllabusEditorPage] Update mode DEBUG:', {
          syllabusId: syllabusId,
          syllabusIdRef: syllabusIdRef.current,
          effectiveSyllabusId: effectiveSyllabusId,
          initialSyllabusId: initialSyllabusId,
          rootId: rootId,
          syllabusStatus: syllabusStatus
        })
        
        if (!effectiveSyllabusId) {
          console.error('[SyllabusEditorPage] CRITICAL ERROR: No syllabusId available for update!')
          alert('Lỗi: Không có ID giáo trình để cập nhật. Vui lòng đóng và mở lại trang chỉnh sửa.')
          throw new Error('Không có ID giáo trình để cập nhật')
        }
        
        console.log('[SyllabusEditorPage] Update mode - status:', syllabusStatus, 'syllabusId:', effectiveSyllabusId)
        
        // Determine rootId for version creation
        // Use loadedRootId from API response (set during loadSyllabus)
        // If no loadedRootId, this IS the root version, so use syllabusId as rootId
        const effectiveRootId = loadedRootId || effectiveSyllabusId
        console.log('[SyllabusEditorPage] Using rootId for version creation:', {
          loadedRootId: loadedRootId,
          syllabusId: effectiveSyllabusId,
          effectiveRootId: effectiveRootId
        })

        if (syllabusStatus === 'REJECTED') {
          // ===== REJECTED: Create NEW version from rejected one =====
          console.log('[SyllabusEditorPage] Creating new version from REJECTED syllabus')
          console.log('[SyllabusEditorPage] academicSyllabusId:', academicSyllabusId)
          
          const res = await dualSyllabusOrchestrator.updateDualSyllabusVersion(
            effectiveRootId,
            academicSyllabusId || effectiveSyllabusId,
            effectiveSyllabusId,
            { ...payload, changes: 'Tạo version mới từ bản bị từ chối' },
            userId
          )
          savedId = res.id
          newAcademicId = res.academicId

          console.log('[SyllabusEditorPage] New version created from REJECTED', {
            syllabusServiceId: savedId,
            academicId: newAcademicId
          })
        } else if (syllabusStatus === 'DRAFT') {
          // ===== DRAFT: Create NEW version (backend doesn't have update endpoint) =====
          console.log('[SyllabusEditorPage] Creating new version for DRAFT (backend has no update API)')
          const res = await dualSyllabusOrchestrator.updateDualSyllabusVersion(
            effectiveRootId,
            academicSyllabusId || effectiveSyllabusId,
            effectiveSyllabusId,
            { ...payload, changes: 'Cập nhật giáo trình' },
            userId
          )
          savedId = res.id
          newAcademicId = res.academicId

          console.log('[SyllabusEditorPage] New DRAFT version created', {
            syllabusServiceId: savedId,
            academicId: newAcademicId,
            versionNo: res.versionNo
          })
        } else {
          // ===== Other status: Partial update (documents only) =====
          console.log('[SyllabusEditorPage] Partial update (documents only) for status:', syllabusStatus)
          const res = await dualSyllabusOrchestrator.updateDualSyllabusPartial(
            effectiveSyllabusId,
            payload,
            userId
          )

          console.log('[SyllabusEditorPage] Partial update successful', {
            syllabusServiceId: res.id,
            status: res.status,
            versionNo: res.versionNo
          })
        }

        await uploadDocuments(savedId)
      }

      onBack?.()
    } catch (err) {
      console.error('[SyllabusEditorPage] Save failed:', err)
      alert('Lưu thất bại: ' + (err.message || err.response?.data?.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!window.confirm('Bạn chắc chắn muốn gửi giáo trình này để xem xét?')) return

    setSubmitting(true)
    try {
      await syllabusApprovalService.submit(syllabusId, userId)
      alert('Gửi thành công. Giáo trình đang chờ phòng Đào Tạo xem xét.')
      onBack?.()
    } catch (err) {
      console.error('Submit failed:', err)
      alert('Gửi thất bại: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleNewCloPlo = (ploId) => {
    setNewClo(prev => {
      const exists = prev.selectedPloIds.includes(ploId)
      return {
        ...prev,
        selectedPloIds: exists
          ? prev.selectedPloIds.filter(id => id !== ploId)
          : [...prev.selectedPloIds, ploId]
      }
    })
  }

  const handleCreateClo = async () => {
    if (!formData.subjectId) {
      alert('Vui lòng chọn môn học trước khi tạo CLO')
      return
    }
    if (!newClo.cloCode.trim()) {
      alert('Vui lòng nhập mã CLO')
      return
    }
    if (newClo.selectedPloIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 PLO để liên kết với CLO')
      return
    }

    setCreatingClo(true)
    try {
      const cloPayload = {
        cloCode: newClo.cloCode.trim(),
        cloName: newClo.cloCode.trim(),
        description: newClo.description || '',
        subjectId: Number(formData.subjectId)
      }

      const cloRes = await academicAPI.createClo(cloPayload)
      const createdId = cloRes.data?.data?.id || cloRes.data?.id

      if (!createdId) {
        throw new Error('Không xác định được ID CLO vừa tạo')
      }

      if (newClo.selectedPloIds.length > 0) {
        for (const ploId of newClo.selectedPloIds) {
          await academicAPI.createCloMapping({ cloId: createdId, ploId })
        }
      }

      await loadClos(formData.subjectId)
      setShowAddCloModal(false)
      setNewClo({ cloCode: '', description: '', selectedPloIds: [] })

      // Tự động chọn CLO mới tạo
      setFormData(prev => ({
        ...prev,
        cloPairIds: [...new Set([...(prev.cloPairIds || []), createdId])]
      }))
      alert('Tạo CLO thành công')
    } catch (err) {
      console.error('Create CLO failed:', err)
      alert('Tạo CLO thất bại: ' + (err.response?.data?.message || err.message))
    } finally {
      setCreatingClo(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Tạo giáo trình mới' : 'Chỉnh sửa giáo trình'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Đang lưu...' : 'Lưu bản nháp'}
            </button>
            {mode === 'edit' && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                <Send size={18} />
                {submitting ? 'Đang gửi...' : 'Gửi duyệt'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'basic', label: 'Thông tin cơ bản' },
              { id: 'clos', label: 'Chuẩn đầu ra (CLO)' },
              ...(mode !== 'edit' ? [{ id: 'files', label: 'Tệp bài giảng' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Môn học *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    disabled={subjectsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Môn học --</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subjectCode} - {sub.subjectName}
                      </option>
                    ))}
                  </select>
                  {subjectsLoading && <p className="text-xs text-gray-500 mt-1">Đang tải danh sách môn học...</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt giáo trình</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => onChangeField('summary', e.target.value)}
                    placeholder="Tóm tắt ngắn gọn về giáo trình"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
{/* 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu học tập</label>
                  <textarea
                    value={formData.learningObjectives}
                    onChange={(e) => onChangeField('learningObjectives', e.target.value)}
                    placeholder="Các mục tiêu học tập mà sinh viên sẽ đạt được"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp giảng dạy</label>
                  <textarea
                    value={formData.teachingMethods}
                    onChange={(e) => onChangeField('teachingMethods', e.target.value)}
                    placeholder="Mô tả các phương pháp giảng dạy được sử dụng"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp đánh giá</label>
                  <textarea
                    value={formData.assessmentMethods}
                    onChange={(e) => onChangeField('assessmentMethods', e.target.value)}
                    placeholder="Mô tả các phương pháp và tiêu chí đánh giá"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
*/}
                {/* Program/PLO Info */}
                {formData.subjectId && (programInfo || plos.length > 0) && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    {programInfo && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Chương trình đào tạo: <span className="text-blue-600 font-semibold">{programInfo.programCode} - {programInfo.programName}</span>
                      </p>
                    )}
                    {plosLoading && <p className="text-xs text-gray-500">Đang tải PLO...</p>}
                    {plos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Chuẩn đầu ra chương trình (PLO):</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {plos.map(plo => (
                            <div key={plo.id} className="text-xs bg-white p-2 rounded border border-blue-100">
                              <p className="font-medium text-gray-700">{plo.ploCode || 'N/A'}</p>
                              <p className="text-gray-600">{plo.description || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CLO Tab */}
            {activeTab === 'clos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Chuẩn đầu ra học phần (CLO) - {formData.cloPairIds.length} / {clos.length} được chọn
                  </h3>
                  <div className="flex gap-2">
                    {clos.length > 0 && (
                      <button
                        onClick={() => setShowCloModal(!showCloModal)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <ChevronDown size={14} />
                        {showCloModal ? 'Ẩn danh sách' : 'Chọn CLO'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddCloModal(true)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Thêm CLO
                    </button>
                  </div>
                </div>

                {!formData.subjectId && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Vui lòng chọn môn học trước để xem danh sách CLO
                  </div>
                )}

                {closLoading && <p className="text-xs text-gray-500">Đang tải CLOs...</p>}

                {showCloModal && formData.subjectId && clos.length > 0 && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {clos.map(clo => (
                        <div
                          key={clo.id}
                          className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.cloPairIds.includes(clo.id)}
                              onChange={() => toggleCloPair(clo.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-700">{clo.cloCode || 'N/A'}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{clo.description || 'Không có mô tả'}</p>
                              
                              {/* Display mapped PLOs */}
                              {clo.mappedPlos && clo.mappedPlos.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Mapping PLO:</p>
                                  <div className="space-y-1">
                                    {clo.mappedPlos.map((plo, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs bg-purple-50 border border-purple-200 rounded p-1.5"
                                      >
                                        <p className="font-medium text-purple-700">
                                          {plo.ploCode || 'PLO'}
                                        </p>
                                        <p className="text-purple-600">
                                          {plo.description || plo.ploName || 'Không có mô tả'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.cloPairIds.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">CLO được chọn:</p>
                    <div className="space-y-2">
                      {clos
                        .filter(c => formData.cloPairIds.includes(c.id))
                        .map(clo => (
                          <div
                            key={clo.id}
                            className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-700 flex items-center gap-2">
                                <Check size={14} className="text-green-600" />
                                {clo.cloCode}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{clo.description}</p>
                              
                              {/* Display mapped PLOs for selected CLO */}
                              {clo.mappedPlos && clo.mappedPlos.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Mapping PLO:</p>
                                  <div className="space-y-1">
                                    {clo.mappedPlos.map((plo, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs bg-purple-50 border border-purple-200 rounded p-1.5"
                                      >
                                        <p className="font-medium text-purple-700">
                                          {plo.ploCode || 'PLO'}
                                        </p>
                                        <p className="text-purple-600">
                                          {plo.description || plo.ploName || 'Không có mô tả'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => toggleCloPair(clo.id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {clos.length === 0 && formData.subjectId && !closLoading && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                    Không có CLO nào cho môn học này. Vui lòng liên hệ với Phòng Đào Tạo để tạo CLO.
                  </div>
                )}
              </div>
            )}

            {/* Add CLO Modal */}
            {showAddCloModal && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">Tạo CLO mới</h3>
                    <button onClick={() => setShowAddCloModal(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã CLO *</label>
                      <input
                        type="text"
                        value={newClo.cloCode}
                        onChange={(e) => setNewClo(prev => ({ ...prev, cloCode: e.target.value }))}
                        placeholder="VD: CLO1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <textarea
                        value={newClo.description}
                        onChange={(e) => setNewClo(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả ngắn cho CLO"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chọn PLO liên kết *</label>
                      {plosLoading && <p className="text-xs text-gray-500">Đang tải PLO...</p>}
                      {!plosLoading && plos.length === 0 && (
                        <p className="text-xs text-gray-600">Chưa có PLO cho chương trình này.</p>
                      )}
                      {!plosLoading && plos.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                          {plos.map(plo => (
                            <label key={plo.id} className="flex items-start gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newClo.selectedPloIds.includes(plo.id)}
                                onChange={() => toggleNewCloPlo(plo.id)}
                                className="mt-1"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{plo.ploCode || 'PLO'}</p>
                                <p className="text-xs text-gray-600">{plo.description || 'Không có mô tả'}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddCloModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      disabled={creatingClo}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleCreateClo}
                      disabled={creatingClo}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                    >
                      {creatingClo ? 'Đang tạo...' : 'Tạo CLO'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên tệp bài giảng</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.jpg,.png,.zip"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Kéo thả tệp hoặc <span className="text-blue-600">chọn tệp</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, Word, PowerPoint, Excel, Hình ảnh, ZIP (Max 50MB)</p>
                    </label>
                  </div>
                </div>

                {uploading && <p className="text-center text-gray-600">Đang tải lên...</p>}

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Tệp đã chọn</h4>
                    <ul className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2">
                            <File size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => previewFile(file)} 
                              className="text-blue-600 hover:text-blue-800"
                              title="Xem tệp"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => removeFile(idx)} 
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tóm tắt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Môn học:</p>
              <p className="font-medium text-gray-900">{subjects.find(s => String(s.id) === String(formData.subjectId))?.subjectName || 'Chưa chọn'}</p>
            </div>
            <div>
              <p className="text-gray-600">CLO được chọn:</p>
              <p className="font-medium text-gray-900">{formData.cloPairIds.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyllabusEditorPage
