import React, { useEffect, useState } from 'react'
import academicAPI from '../services/academicService'

export const ProgramManagement = () => {
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [subjects, setSubjects] = useState([])

  const [programForm, setProgramForm] = useState({
    id: null,
    programCode: '',
    programName: '',
    description: '',
    departmentId: '',
    creditsRequired: '',
    durationYears: '',
    degreeType: '',
    accreditationStatus: '',
    isActive: true,
  })

  const [subjectForm, setSubjectForm] = useState({
    id: null,
    subjectCode: '',
    subjectName: '',
    description: '',
    programId: '',
    credits: '',
    semester: '',
    prerequisites: '',
    corequisites: '',
    subjectType: '',
    isFoundational: false,
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPrograms = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await academicAPI.getPrograms()
      const data = res.data?.data || []
      setPrograms(data)
      if (data.length && !selectedProgram) {
        handleSelectProgram(data[0])
      }
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách chương trình đào tạo')
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async (programId) => {
    if (!programId) return
    try {
      setLoading(true)
      setError('')
      const res = await academicAPI.getSubjectsByProgram(programId)
      const data = res.data?.data || []
      setSubjects(data)
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách học phần cho chương trình được chọn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetProgramForm = () => {
    setProgramForm({
      id: null,
      programCode: '',
      programName: '',
      description: '',
      departmentId: '',
      creditsRequired: '',
      durationYears: '',
      degreeType: '',
      accreditationStatus: '',
      isActive: true,
    })
  }

  const resetSubjectForm = (programId) => {
    setSubjectForm({
      id: null,
      subjectCode: '',
      subjectName: '',
      description: '',
      programId: programId || selectedProgram?.id || '',
      credits: '',
      semester: '',
      prerequisites: '',
      corequisites: '',
      subjectType: '',
      isFoundational: false,
      isActive: true,
    })
  }

  const handleSelectProgram = (program) => {
    setSelectedProgram(program)
    resetSubjectForm(program?.id)
    loadSubjects(program?.id)
  }

  const handleProgramChange = (e) => {
    const { name, value, type, checked } = e.target
    setProgramForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubjectChange = (e) => {
    const { name, value, type, checked } = e.target
    setSubjectForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEditProgram = (program) => {
    setProgramForm({
      id: program.id,
      programCode: program.programCode || '',
      programName: program.programName || '',
      description: program.description || '',
      departmentId: program.departmentId || '',
      creditsRequired: program.creditsRequired || '',
      durationYears: program.durationYears || '',
      degreeType: program.degreeType || '',
      accreditationStatus: program.accreditationStatus || '',
      isActive: program.isActive ?? true,
    })
  }

  const handleEditSubject = (subject) => {
    setSubjectForm({
      id: subject.id,
      subjectCode: subject.subjectCode || '',
      subjectName: subject.subjectName || '',
      description: subject.description || '',
      programId: subject.programId || selectedProgram?.id || '',
      credits: subject.credits || '',
      semester: subject.semester || '',
      prerequisites: subject.prerequisites || '',
      corequisites: subject.corequisites || '',
      subjectType: subject.subjectType || '',
      isFoundational: subject.isFoundational ?? false,
      isActive: subject.isActive ?? true,
    })
  }

  const handleSubmitProgram = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      const payload = {
        programCode: programForm.programCode,
        programName: programForm.programName,
        description: programForm.description,
        departmentId: programForm.departmentId ? Number(programForm.departmentId) : null,
        creditsRequired: programForm.creditsRequired ? Number(programForm.creditsRequired) : null,
        durationYears: programForm.durationYears ? Number(programForm.durationYears) : null,
        degreeType: programForm.degreeType,
        accreditationStatus: programForm.accreditationStatus,
        isActive: programForm.isActive,
      }

      if (programForm.id) {
        await academicAPI.updateProgram(programForm.id, payload)
      } else {
        await academicAPI.createProgram(payload)
      }

      resetProgramForm()
      await loadPrograms()
    } catch (err) {
      console.error(err)
      setError('Lưu chương trình đào tạo thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa chương trình này?')) return
    try {
      setLoading(true)
      setError('')
      await academicAPI.deleteProgram(programId)
      if (selectedProgram?.id === programId) {
        setSelectedProgram(null)
        setSubjects([])
        resetSubjectForm('')
      }
      await loadPrograms()
    } catch (err) {
      console.error(err)
      setError('Xóa chương trình đào tạo thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSubject = async (e) => {
    e.preventDefault()
    if (!selectedProgram?.id && !subjectForm.programId) {
      setError('Vui lòng chọn chương trình trước khi thêm học phần')
      return
    }

    try {
      setLoading(true)
      setError('')

      const programId = subjectForm.programId || selectedProgram.id

      const payload = {
        subjectCode: subjectForm.subjectCode,
        subjectName: subjectForm.subjectName,
        description: subjectForm.description,
        programId: Number(programId),
        credits: subjectForm.credits ? Number(subjectForm.credits) : null,
        semester: subjectForm.semester ? Number(subjectForm.semester) : null,
        prerequisites: subjectForm.prerequisites,
        corequisites: subjectForm.corequisites,
        subjectType: subjectForm.subjectType,
        isFoundational: subjectForm.isFoundational,
        isActive: subjectForm.isActive,
      }

      if (subjectForm.id) {
        await academicAPI.updateSubject(subjectForm.id, payload)
      } else {
        await academicAPI.createSubject(payload)
      }

      resetSubjectForm(programId)
      await loadSubjects(programId)
    } catch (err) {
      console.error(err)
      setError('Lưu học phần thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa học phần này?')) return
    try {
      setLoading(true)
      setError('')
      await academicAPI.deleteSubject(subjectId)
      if (selectedProgram?.id) {
        await loadSubjects(selectedProgram.id)
      }
    } catch (err) {
      console.error(err)
      setError('Xóa học phần thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Quản lý Chương trình & Học phần</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program list + form */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Danh sách chương trình đào tạo</h2>
              <button
                type="button"
                onClick={() => resetProgramForm()}
                className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Thêm chương trình
              </button>
            </div>

            <div className="border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Mã</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Tên chương trình</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Số tín chỉ</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Trạng thái</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {programs.map((p) => (
                    <tr
                      key={p.id}
                      className={
                        'cursor-pointer hover:bg-gray-50 ' +
                        (selectedProgram?.id === p.id ? 'bg-indigo-50' : '')
                      }
                      onClick={() => handleSelectProgram(p)}
                    >
                      <td className="px-3 py-2">{p.programCode}</td>
                      <td className="px-3 py-2">{p.programName}</td>
                      <td className="px-3 py-2">{p.creditsRequired}</td>
                      <td className="px-3 py-2">
                        {p.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                            Ngừng hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditProgram(p)
                          }}
                          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProgram(p.id)
                          }}
                          className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!programs.length && (
                    <tr>
                      <td className="px-3 py-4 text-center text-gray-500" colSpan={5}>
                        Chưa có chương trình nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">
              {programForm.id ? 'Cập nhật chương trình' : 'Thêm chương trình mới'}
            </h2>
            <form onSubmit={handleSubmitProgram} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Mã chương trình</label>
                  <input
                    type="text"
                    name="programCode"
                    value={programForm.programCode}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Tên chương trình</label>
                  <input
                    type="text"
                    name="programName"
                    value={programForm.programName}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={programForm.description}
                  onChange={handleProgramChange}
                  rows={2}
                  className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Khoa/Bộ môn (ID)</label>
                  <input
                    type="number"
                    name="departmentId"
                    value={programForm.departmentId}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Tổng số tín chỉ</label>
                  <input
                    type="number"
                    name="creditsRequired"
                    value={programForm.creditsRequired}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Thời gian (năm)</label>
                  <input
                    type="number"
                    name="durationYears"
                    value={programForm.durationYears}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Loại bằng cấp</label>
                  <input
                    type="text"
                    name="degreeType"
                    value={programForm.degreeType}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Chứng nhận kiểm định</label>
                  <input
                    type="text"
                    name="accreditationStatus"
                    value={programForm.accreditationStatus}
                    onChange={handleProgramChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={programForm.isActive}
                    onChange={handleProgramChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Đang hoạt động
                </label>

                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={resetProgramForm}
                    className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Xóa form
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {programForm.id ? 'Cập nhật' : 'Lưu mới'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Subject list + form for selected program */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Học phần theo chương trình</h2>
              <button
                type="button"
                onClick={() => resetSubjectForm(selectedProgram?.id)}
                className="px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                disabled={!selectedProgram}
              >
                + Thêm học phần
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Chương trình đang chọn:{' '}
              {selectedProgram ? (
                <span className="font-semibold">
                  [{selectedProgram.programCode}] {selectedProgram.programName}
                </span>
              ) : (
                <span className="italic text-gray-500">Chưa chọn chương trình</span>
              )}
            </p>

            <div className="border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Mã HP</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Tên học phần</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">TC</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Kỳ</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Trạng thái</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{s.subjectCode}</td>
                      <td className="px-3 py-2">{s.subjectName}</td>
                      <td className="px-3 py-2">{s.credits}</td>
                      <td className="px-3 py-2">{s.semester}</td>
                      <td className="px-3 py-2">
                        {s.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                            Đang mở
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                            Ngừng mở
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditSubject(s)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(s.id)}
                          className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!subjects.length && (
                    <tr>
                      <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                        {selectedProgram
                          ? 'Chưa có học phần nào cho chương trình này'
                          : 'Chọn một chương trình để xem danh sách học phần'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">
              {subjectForm.id ? 'Cập nhật học phần' : 'Thêm học phần mới'}
            </h2>
            <form onSubmit={handleSubmitSubject} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Mã học phần</label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={subjectForm.subjectCode}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Tên học phần</label>
                  <input
                    type="text"
                    name="subjectName"
                    value={subjectForm.subjectName}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={subjectForm.description}
                  onChange={handleSubjectChange}
                  rows={2}
                  className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Số tín chỉ</label>
                  <input
                    type="number"
                    name="credits"
                    value={subjectForm.credits}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Kỳ (semester)</label>
                  <input
                    type="number"
                    name="semester"
                    value={subjectForm.semester}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Loại học phần</label>
                  <input
                    type="text"
                    name="subjectType"
                    value={subjectForm.subjectType}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Tiên quyết</label>
                  <input
                    type="text"
                    name="prerequisites"
                    value={subjectForm.prerequisites}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Song hành</label>
                  <input
                    type="text"
                    name="corequisites"
                    value={subjectForm.corequisites}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Chương trình (ID)</label>
                  <input
                    type="number"
                    name="programId"
                    value={subjectForm.programId || selectedProgram?.id || ''}
                    onChange={handleSubjectChange}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                    disabled={!!selectedProgram}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedProgram
                      ? 'Đang gắn với chương trình đang chọn, ID được tự động điền.'
                      : 'Nhập ID chương trình nếu chưa chọn ở bảng bên trái.'}
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-2 mt-1">
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name="isFoundational"
                      checked={subjectForm.isFoundational}
                      onChange={handleSubjectChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Học phần nền tảng
                  </label>
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={subjectForm.isActive}
                      onChange={handleSubjectChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Đang mở
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => resetSubjectForm(selectedProgram?.id)}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
                >
                  Xóa form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {subjectForm.id ? 'Cập nhật' : 'Lưu mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
          <div className="bg-white shadow px-4 py-2 rounded text-sm text-gray-700">
            Đang xử lý...
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgramManagement
