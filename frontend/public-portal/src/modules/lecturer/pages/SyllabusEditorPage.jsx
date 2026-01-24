import React, { useEffect, useState } from 'react'
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
  AlertCircle
} from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'
import dualSyllabusOrchestrator from '../services/dualSyllabusOrchestrator'
import { academicAPI } from '../services/academicAPI'
import { syllabusApprovalService } from '../services/syllabusApprovalService'

const SyllabusEditorPage = ({ syllabusId: initialSyllabusId, rootId, user, onBack }) => {
  const [syllabusId, setSyllabusId] = useState(initialSyllabusId)
  const mode = syllabusId ? 'edit' : 'create'
  const userId = user?.userId || user?.id

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
  const [formData, setFormData] = useState({
    subjectId: '',
    description: '',
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
      setFormData({
        subjectId: data.subjectId || '',
        description: data.content || '',
        cloPairIds: data.cloPairIds || [],
        modules: data.modules || []
      })
      if (data.subjectId) {
        await loadClos(data.subjectId)
      }
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
      const res = await academicAPI.getClosBySubject(subjectId)
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

  const uploadDocuments = async (savedId) => {
    if (!savedId || selectedFiles.length === 0) return
    setUploading(true)
    try {
      for (const file of selectedFiles) {
        await syllabusServiceV2.uploadDocument(savedId, file, file.name, formData.description, userId)
      }
    } catch (err) {
      console.error('Upload documents failed', err)
      alert('Tải tệp thất bại cho một số tài liệu')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.subjectId) {
      alert('Vui lòng chọn môn học')
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
      content: formData.description || '',
      summary: formData.description || '',
      learningObjectives: formData.learningObjectives || '',
      teachingMethods: formData.teachingMethods || '',
      assessmentMethods: formData.assessmentMethods || '',
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
        // setIsEditMode(true) - removed as isEditMode state was unused

        await uploadDocuments(savedId)
        alert('Tạo giáo trình thành công (lưu ở cả academic_db và syllabus_db)')
      } else {
        // ===== Update dùng dual orchestrator =====
        console.log('[SyllabusEditorPage] Updating with dual orchestrator')
        const res = await dualSyllabusOrchestrator.updateDualSyllabusVersion(
          rootId || syllabusId,
          academicSyllabusId,
          syllabusId,
          { ...payload, changes: 'Cập nhật thông tin cơ bản' },
          userId
        )

        savedId = res.id
        newAcademicId = res.academicId

        console.log('[SyllabusEditorPage] Dual update successful', {
          syllabusServiceId: savedId,
          academicId: newAcademicId
        })

        await uploadDocuments(savedId)
        alert('Cập nhật giáo trình thành công (cập nhật cả 2 database)')
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
              { id: 'files', label: 'Tệp bài giảng' }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Ghi chú</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => onChangeField('description', e.target.value)}
                    placeholder="Mô tả ngắn gọn về giáo trình, mục tiêu học tập, yêu cầu tiên quyết..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                        <label key={clo.id} className="flex items-start gap-3 p-3 bg-white rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.cloPairIds.includes(clo.id)}
                            onChange={() => toggleCloPair(clo.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-700">{clo.cloCode || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{clo.description || 'Không có mô tả'}</p>
                          </div>
                        </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chọn PLO liên kết (tùy chọn)</label>
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
                          <button onClick={() => removeFile(idx)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
                          </button>
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
