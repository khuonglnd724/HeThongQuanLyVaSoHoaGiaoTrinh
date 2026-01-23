import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, Send, PlusCircle, Trash2, Search } from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'

const SyllabusEditorPage = ({ syllabusId, rootId, user, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const mode = syllabusId ? 'edit' : 'create' // create or edit
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    description: '',
    content: {} // Structured content
  })
  const [activeTab, setActiveTab] = useState('basic') // basic, clos
  const [builderOpen, setBuilderOpen] = useState(false)
  const [modulesDraft, setModulesDraft] = useState([])
  const [syllabus, setSyllabus] = useState(null)
  const [objectivesDraft, setObjectivesDraft] = useState([])
  const [assessmentDraft, setAssessmentDraft] = useState({ midterm: '', final: '', assignments: '' })
  const [creditsDraft, setCreditsDraft] = useState('')
  const [newObjective, setNewObjective] = useState('')
  
  // CLO Management States
  const [showCLOModal, setShowCLOModal] = useState(false)
  const [showSelectCLOModal, setShowSelectCLOModal] = useState(false)
  const [existingCLOs, setExistingCLOs] = useState([])
  const [selectedCLOs, setSelectedCLOs] = useState([])
  const [cloLoading, setCloLoading] = useState(false)
  const [cloError, setCloError] = useState(null)
  const [newCLOForm, setNewCLOForm] = useState({ code: '', description: '', level: 'COMPREHENSION' })

  const userId = user?.userId || user?.id

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (syllabusId && mode === 'edit') {
      loadSyllabus()
    } else {
      setLoading(false)
    }
    loadExistingCLOs()
  }, [syllabusId, mode])

  // sync modulesDraft when formData.content changes
  useEffect(() => {
    try {
      const mods = formData.content?.modules || []
      setModulesDraft(Array.isArray(mods) ? mods : [])

      const objs = formData.content?.objectives || []
      setObjectivesDraft(Array.isArray(objs) ? objs : [])

      const assess = formData.content?.assessment || {}
      setAssessmentDraft({
        midterm: assess.midterm ?? '',
        final: assess.final ?? '',
        assignments: assess.assignments ?? ''
      })

      const creditsVal = formData.content?.credits
      setCreditsDraft(creditsVal ?? '')
    } catch (e) {
      setModulesDraft([])
      setObjectivesDraft([])
      setAssessmentDraft({ midterm: '', final: '', assignments: '' })
      setCreditsDraft('')
    }
  }, [formData.content])

  const loadExistingCLOs = async () => {
    try {
      setCloLoading(true)
      setCloError(null)
      const res = await syllabusServiceV2.getAllCLOs()
      const clos = res.data?.data || res.data || []
      console.log('[SyllabusEditorPage] Loaded existing CLOs:', clos)
      setExistingCLOs(Array.isArray(clos) ? clos : [])
    } catch (err) {
      console.error('[SyllabusEditorPage] Failed to load CLOs:', err)
      // Show server error message when available, otherwise generic
      const msg = err?.response?.data?.message || err.message || 'Không thể tải CLOs'
      const errorCode = err?.response?.data?.errorCode || null
      const correlationId = err?.response?.headers?.['x-correlation-id'] || err?.response?.headers?.['X-Correlation-Id'] || null
      setCloError({ message: msg, errorCode, correlationId })
      try { alert('Lỗi khi tải CLOs: ' + msg) } catch (e) { console.error(msg) }
      setExistingCLOs([])
    } finally {
      setCloLoading(false)
    }
  }

  const copyCLOError = () => {
    if (!cloError) return
    const text = JSON.stringify(cloError, null, 2)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert('Đã sao chép thông tin lỗi vào clipboard'))
        .catch(() => { try { alert('Không thể sao chép, vui lòng sao chép thủ công') } catch (e) {} })
    } else {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy'); alert('Đã sao chép thông tin lỗi vào clipboard') } catch (e) { alert('Không thể sao chép, vui lòng sao chép thủ công') }
      ta.remove()
    }
  }

  const loadSyllabus = async () => {
    setLoading(true)
    try {
      const res = await syllabusServiceV2.getById(syllabusId)
      const data = res.data
      setSyllabus(data)
      setFormData({
        subjectCode: data.subjectCode || '',
        subjectName: data.subjectName || '',
        description: data.description || '',
        content: data.content || {}
      })
      const mods = data.content?.modules || []
      setModulesDraft(Array.isArray(mods) ? mods : [])
      const objs = data.content?.objectives || []
      setObjectivesDraft(Array.isArray(objs) ? objs : [])
      const assess = data.content?.assessment || {}
      setAssessmentDraft({
        midterm: assess.midterm ?? '',
        final: assess.final ?? '',
        assignments: assess.assignments ?? ''
      })
      setCreditsDraft(data.content?.credits ?? '')
    } catch (err) {
      console.error('Failed to load syllabus:', err)
      alert('Không thể tải giáo trình')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.subjectCode || !formData.subjectName) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }
    // For now only save basic info; content development postponed
    const compiled = {} // leave content empty; CLOs are saved separately

    setSaving(true)
    try {
      let savedSyllabusId = syllabusId
      if (mode === 'create') {
        const res = await syllabusServiceV2.create({ subjectCode: formData.subjectCode, subjectName: formData.subjectName, description: formData.description, content: compiled }, userId)
        savedSyllabusId = res.data?.id || res.data?.syllabusId
        console.log('[SyllabusEditorPage] Created syllabus with ID:', savedSyllabusId)
      } else {
        // Create new version (only basic info change)
        const res = await syllabusServiceV2.createNewVersion(
          rootId || syllabusId,
          {
            content: compiled,
            changes: 'Cập nhật thông tin cơ bản'
          },
          userId
        )
        savedSyllabusId = res.data?.id || res.data?.syllabusId
        console.log('[SyllabusEditorPage] Updated syllabus with ID:', savedSyllabusId)
      }

      // Link CLOs to syllabus if objectives exist and syllabus was saved
      // Note: CLOs were already created from modal (without syllabusId).
      // Now we just add their descriptions to the syllabus for reference.
      if (savedSyllabusId && objectivesDraft && objectivesDraft.length > 0) {
        console.log('[SyllabusEditorPage] Linking', objectivesDraft.length, 'CLOs to syllabus', savedSyllabusId)
        // In future: implement CLO-Syllabus linking if needed (e.g., via junction table)
        // For now, CLOs are standalone and referenced by description in objectivesDraft
      }

      alert('Lưu giáo trình thành công')
      onBack?.()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const compileContent = () => {
    const assessment = {}
    if (assessmentDraft.midterm !== '') assessment.midterm = Number(assessmentDraft.midterm)
    if (assessmentDraft.final !== '') assessment.final = Number(assessmentDraft.final)
    if (assessmentDraft.assignments !== '') assessment.assignments = Number(assessmentDraft.assignments)

    const content = {
      ...(formData.content || {}),
      modules: modulesDraft,
      objectives: objectivesDraft,
      assessment: Object.keys(assessment).length ? assessment : undefined,
      credits: creditsDraft === '' ? undefined : Number(creditsDraft)
    }

    // remove undefined fields
    Object.keys(content).forEach(k => content[k] === undefined && delete content[k])
    return content
  }

  const downloadJson = () => {
    const content = compileContent()
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `syllabus-${formData.subjectCode || 'content'}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleCreateNewCLO = async () => {
    if (!newCLOForm.description.trim()) {
      alert('Vui lòng nhập mô tả CLO')
      return
    }

    try {
      setCloLoading(true)
      const cloData = {
        cloCode: newCLOForm.code || `CLO_${Date.now()}`,
        description: newCLOForm.description,
        level: newCLOForm.level
        // Note: Do NOT send syllabusId when creating from modal; only send when saving syllabus
      }
      console.log('[SyllabusEditorPage] Creating new CLO:', cloData)
      const res = await syllabusServiceV2.createCLO(cloData)
      const createdCLO = res.data?.data || res.data
      console.log('[SyllabusEditorPage] CLO created:', createdCLO)

      // Reload CLOs
      await loadExistingCLOs()

      // Add to objectives
      addObjective(newCLOForm.description)

      // Reset form
      setNewCLOForm({ code: '', description: '', level: 'COMPREHENSION' })
      setShowCLOModal(false)
      alert('Tạo CLO thành công')
    } catch (err) {
      console.error('[SyllabusEditorPage] Failed to create CLO:', err)
      alert('Lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
      setCloLoading(false)
    }
  }

  const handleSelectExistingCLO = (clo) => {
    // Add CLO description to objectives
    const desc = clo.description || clo.cloCode
    if (!objectivesDraft.includes(desc)) {
      addObjective(desc)
    }
  }

  const TEMPLATE = {
    modules: [
      { title: 'Giới thiệu', topics: ['Tổng quan', 'Cài đặt môi trường'] },
      { title: 'Cấu trúc dữ liệu', topics: ['Mảng', 'Danh sách liên kết'] }
    ],
    objectives: ['Hiểu cơ bản về môn học', 'Áp dụng kỹ thuật cơ bản'],
    assessment: { midterm: 30, final: 50, assignments: 20 },
    credits: 3
  }

  const insertTemplate = () => {
    setFormData({ ...formData, content: TEMPLATE })
    setModulesDraft(TEMPLATE.modules)
    setObjectivesDraft(TEMPLATE.objectives)
    setAssessmentDraft(TEMPLATE.assessment)
    setCreditsDraft(TEMPLATE.credits)
  }

  const addModule = (title, topics) => {
    const newModules = [...modulesDraft, { title, topics }]
    setModulesDraft(newModules)
    setFormData({ ...formData, content: { ...(formData.content || {}), modules: newModules } })
  }

  const removeModuleAt = (index) => {
    const newModules = modulesDraft.filter((_, i) => i !== index)
    setModulesDraft(newModules)
    setFormData({ ...formData, content: { ...(formData.content || {}), modules: newModules } })
  }

  const addObjective = (text) => {
    if (!text) return
    const newObjectives = [...objectivesDraft, text]
    setObjectivesDraft(newObjectives)
    setFormData({ ...formData, content: { ...(formData.content || {}), objectives: newObjectives } })
    setNewObjective('')
  }

  const removeObjectiveAt = (index) => {
    const newObjectives = objectivesDraft.filter((_, i) => i !== index)
    setObjectivesDraft(newObjectives)
    setFormData({ ...formData, content: { ...(formData.content || {}), objectives: newObjectives } })
  }

  const updateAssessment = (field, value) => {
    const next = { ...assessmentDraft, [field]: value }
    setAssessmentDraft(next)
    setFormData({ ...formData, content: { ...(formData.content || {}), assessment: next } })
  }

  const updateCredits = (value) => {
    setCreditsDraft(value)
    setFormData({ ...formData, content: { ...(formData.content || {}), credits: value } })
  }

  // Simple inline ModuleBuilder component
  const ModuleBuilder = ({ modules, onAdd, onRemove }) => {
    const [title, setTitle] = useState('')
    const [topicsText, setTopicsText] = useState('')

    const handleAdd = () => {
      const topics = topicsText.split(',').map(t => t.trim()).filter(Boolean)
      if (!title) return
      onAdd(title, topics)
      setTitle('')
      setTopicsText('')
    }

    return (
      <div>
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium">Tiêu đề module</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1 border rounded" placeholder="Ví dụ: Giới thiệu" />
          </div>
          <div>
            <label className="text-sm font-medium">Danh sách topics (ngăn cách bởi dấu ,)</label>
            <input value={topicsText} onChange={(e) => setTopicsText(e.target.value)} className="w-full px-2 py-1 border rounded" placeholder="Tổng quan, Cài đặt môi trường" />
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={handleAdd} className="px-3 py-1 bg-indigo-600 text-white rounded">Thêm module</button>
          </div>
        </div>

        <div className="mt-4">
          <h5 className="font-semibold">Modules hiện có</h5>
          <ul className="mt-2 space-y-2">
            {modules && modules.length === 0 && <li className="text-sm text-gray-500">Chưa có module nào</li>}
            {modules && modules.map((m, i) => (
              <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-sm text-gray-600">{(m.topics || []).join(', ')}</div>
                </div>
                <button onClick={() => onRemove(i)} className="text-red-600"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!window.confirm('Bạn chắc chắn muốn gửi giáo trình này để xem xét?')) return

    try {
      // Note: CLOs are already created from modal and are standalone.
      // On submit, no additional CLO creation needed.
      console.log('[SyllabusEditorPage] Submitting with', objectivesDraft?.length || 0, 'CLOs')

      await syllabusServiceV2.submit(syllabusId, userId)
      alert('Gửi thành công')
      onBack?.()
    } catch (err) {
      console.error('[SyllabusEditorPage] Submit failed:', err)
      alert('Gửi thất bại: ' + (err.response?.data?.message || err.message))
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Tạo giáo trình' : 'Chỉnh sửa giáo trình'}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={downloadJson}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Tải JSON
            </button>
            {mode === 'edit' && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Send size={18} />
                Gửi
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            {['basic', 'clos'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'basic' && 'Thông tin cơ bản'}
                {tab === 'clos' && 'CLOs'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã môn học *</label>
                  <input
                    type="text"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    placeholder="VD: CS101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học *</label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    placeholder="VD: Lập trình C++"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả tổng quát về môn học..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'clos' && (
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <button
                    onClick={insertTemplate}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Dùng template mẫu
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, content: {} })
                      setModulesDraft([])
                      setObjectivesDraft([])
                      setAssessmentDraft({ midterm: '', final: '', assignments: '' })
                      setCreditsDraft('')
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Xóa nội dung
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">CLOs (Course Learning Outcomes)</h4>
                        <span className="text-xs text-gray-500">Thêm từng dòng</span>
                      </div>

                      {/* Action Buttons for CLO Management */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCLOModal(true)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                        >
                          <PlusCircle size={16} />
                          Tạo CLO mới
                        </button>
                        <button
                          onClick={() => setShowSelectCLOModal(true)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                        >
                          <Search size={16} />
                          Chọn CLO có sẵn
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded"
                          placeholder="Hoặc nhập trực tiếp CLO"
                        />
                        <button onClick={() => addObjective(newObjective)} className="px-3 py-2 bg-blue-600 text-white rounded">Thêm</button>
                      </div>
                      <ul className="space-y-2">
                        {objectivesDraft.length === 0 && (
                          <li className="text-sm text-gray-500">Chưa có CLO</li>
                        )}
                        {objectivesDraft.map((obj, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">CLO{idx + 1}: {obj}</span>
                            <button onClick={() => removeObjectiveAt(idx)} className="text-red-600"><Trash2 size={16} /></button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-white border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Đánh giá</h4>
                        <span className="text-xs text-gray-500">% điểm</span>
                      </div>
                      {['midterm', 'final', 'assignments'].map((field) => (
                        <div key={field} className="space-y-1">
                          <label className="text-sm text-gray-700 capitalize">
                            {field === 'midterm' && 'Giữa kỳ'}
                            {field === 'final' && 'Cuối kỳ'}
                            {field === 'assignments' && 'Bài tập'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={assessmentDraft[field]}
                            onChange={(e) => {
                              const val = e.target.value
                              updateAssessment(field, val === '' ? '' : Number(val))
                            }}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="0-100"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-white border rounded-lg space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Số tín chỉ</label>
                      <input
                        type="number"
                        min="0"
                        value={creditsDraft}
                        onChange={(e) => {
                          const val = e.target.value
                          updateCredits(val === '' ? '' : Number(val))
                        }}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Modules</h4>
                      <button
                        onClick={() => setBuilderOpen(!builderOpen)}
                        className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >
                        {builderOpen ? 'Ẩn builder' : 'Mở builder'}
                      </button>
                    </div>
                    {builderOpen && (
                      <ModuleBuilder modules={modulesDraft} onAdd={addModule} onRemove={removeModuleAt} />
                    )}
                    {!builderOpen && (
                      <div className="text-sm text-gray-500">Nhấn "Mở builder" để thêm module và topics.</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Xem nhanh JSON</h4>
                  <div className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-xs">
                    {(() => {
                      const compiled = compileContent()
                      if (!compiled || Object.keys(compiled).length === 0) return <div className="text-gray-500">Chưa có nội dung. Mở Builder hoặc dùng template để bắt đầu.</div>
                      return <pre className="whitespace-pre-wrap">{JSON.stringify(compiled, null, 2)}</pre>
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Preview removed per request - focus on CLOs and basic info */}
          </div>
        </div>
      </div>

      {/* Modal: Create New CLO */}
      {showCLOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-xl font-bold">Tạo CLO mới</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Mã CLO (tuỳ chọn)</label>
              <input
                type="text"
                value={newCLOForm.code}
                onChange={(e) => setNewCLOForm({ ...newCLOForm, code: e.target.value })}
                placeholder="VD: CLO1, CLO_001"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mô tả CLO *</label>
              <textarea
                value={newCLOForm.description}
                onChange={(e) => setNewCLOForm({ ...newCLOForm, description: e.target.value })}
                placeholder="Ví dụ: Hiểu các khái niệm cơ bản về Java..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mức độ</label>
              <select
                value={newCLOForm.level}
                onChange={(e) => setNewCLOForm({ ...newCLOForm, level: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="KNOWLEDGE">Kiến thức (Knowledge)</option>
                <option value="COMPREHENSION">Hiểu biết (Comprehension)</option>
                <option value="APPLICATION">Ứng dụng (Application)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateNewCLO}
                disabled={cloLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {cloLoading ? 'Đang tạo...' : 'Tạo CLO'}
              </button>
              <button
                onClick={() => {
                  setShowCLOModal(false)
                  setNewCLOForm({ code: '', description: '', level: 'COMPREHENSION' })
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Select Existing CLO */}
      {showSelectCLOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 space-y-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold">Chọn CLO có sẵn</h2>

            {cloLoading && <p className="text-gray-500">Đang tải CLOs...</p>}

            {!cloLoading && existingCLOs.length === 0 && (
              <div className="space-y-3">
                <p className="text-gray-500">Chưa có CLO nào hoặc không thể tải danh sách CLO.</p>
                {cloError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded text-sm space-y-2">
                    <div className="text-red-700 font-medium">Lỗi: {cloError.message}</div>
                    {cloError.errorCode && <div className="text-xs text-red-600">Mã lỗi: {cloError.errorCode}</div>}
                    {cloError.correlationId && <div className="text-xs text-gray-500">ID tương quan: {cloError.correlationId}</div>}
                    <div className="flex gap-2">
                      <button onClick={copyCLOError} className="px-2 py-1 bg-gray-100 rounded text-xs">Sao chép thông tin lỗi</button>
                      <button onClick={() => loadExistingCLOs()} disabled={cloLoading} className="px-2 py-1 bg-gray-100 rounded text-xs">Thử tải lại</button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCLOModal(true); setShowSelectCLOModal(false) }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Tạo CLO mới
                  </button>
                  <button
                    onClick={() => loadExistingCLOs()}
                    disabled={cloLoading}
                    className={`px-3 py-2 rounded-lg ${cloLoading ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    {cloLoading ? 'Đang tải...' : 'Thử lại'}
                  </button>
                </div>
              </div>
            )}

            {!cloLoading && existingCLOs.length > 0 && (
              <div className="space-y-2">
                {existingCLOs.map((clo, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      handleSelectExistingCLO(clo)
                      setShowSelectCLOModal(false)
                    }}
                  >
                    <div className="font-medium text-sm">{clo.cloCode || `CLO ${idx + 1}`}</div>
                    <div className="text-sm text-gray-600">{clo.description}</div>
                    {clo.level && <div className="text-xs text-gray-500">Mức: {clo.level}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowSelectCLOModal(false)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyllabusEditorPage
