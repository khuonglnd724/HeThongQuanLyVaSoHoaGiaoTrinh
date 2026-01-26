import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { BookOpen, Search, Filter, X, ChevronRight, Calendar, User, BookMarked, GraduationCap, SortAsc } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import syllabusService from '../../../services/syllabusService'

export default function PublicSyllabusSearchPage({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [syllabi, setSyllabi] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '')
  const [selectedMajor, setSelectedMajor] = useState(() => {
    // If user is student with major, auto-select their major
    if (user?.major && user?.roles?.includes('ROLE_STUDENT')) {
      return user.major
    }
    return searchParams.get('major') || 'all'
  })
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || 'all')
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || 'all')
  const [sortBy, setSortBy] = useState('latest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [error, setError] = useState(null)

  // Filter data - Load from backend instead of hardcode
  const semesters = [1, 2, 3] // semester numbers from backend
  const academicYears = ['2024-2025', '2023-2024', '2022-2023']

  // Fetch all programs for dropdown
  const fetchPrograms = useCallback(async () => {
    try {
      const response = await syllabusService.getAllPrograms()
      setPrograms(response)
    } catch (err) {
      console.error('Error loading programs:', err)
      setPrograms([])
    }
  }, [])

  const fetchSyllabi = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await syllabusService.getPublishedSyllabuses(0, 50)
      // Handle both array and object response
      setSyllabi(Array.isArray(response) ? response : (response?.data || []))
    } catch (err) {
      setError('Không thể tải danh sách giáo trình. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrograms()
    fetchSyllabi()
  }, [fetchPrograms, fetchSyllabi])

  const filteredAndSortedSyllabi = useMemo(() => {
    let filtered = syllabi.filter(item => {
      const matchesSearch = !searchTerm || 
        item.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesMajor = selectedMajor === 'all' || item.programName === selectedMajor
      const matchesSemester = selectedSemester === 'all' || parseInt(item.semester) === parseInt(selectedSemester)
      const matchesYear = selectedYear === 'all' || item.academicYear === selectedYear
      
      return matchesSearch && matchesMajor && matchesSemester && matchesYear
    })

    // Sort
    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.subjectName || '').localeCompare(b.subjectName || ''))
    }

    return filtered
  }, [syllabi, searchTerm, selectedMajor, selectedSemester, selectedYear, sortBy])

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled by filteredAndSortedSyllabi useMemo
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedMajor('all')
    setSelectedSemester('all')
    setSelectedYear('all')
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Major Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chuyên Ngành {user?.major && user?.roles?.includes('ROLE_STUDENT') && <span className="text-xs text-gray-500">(Ngành của bạn)</span>}
        </label>
        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
          disabled={user?.major && user?.roles?.includes('ROLE_STUDENT')}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${user?.major && user?.roles?.includes('ROLE_STUDENT') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value={user?.major || 'all'}>{user?.major ? `${user.major} (Ngành của bạn)` : 'Tất cả'}</option>
          {!user?.major && programs.map((program) => (
            <option key={program.id} value={program.programName}>{program.programName}</option>
          ))}
        </select>
      </div>

      {/* Semester Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Học Kỳ
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả</option>
          {semesters.map((semester) => (
            <option key={semester} value={semester}>Kỳ {semester}</option>
          ))}
        </select>
      </div>

      {/* Academic Year Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Năm Học
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả</option>
          {academicYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sắp xếp theo
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="latest">Cập nhật mới nhất</option>
          <option value="oldest">Cập nhật cũ nhất</option>
          <option value="alphabetical">Thứ tự A-Z</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={32} />
            <h1 className="text-4xl font-bold">Tìm Kiếm Giáo Trình</h1>
          </div>
          <p className="text-blue-100">Tìm kiếm và khám phá các giáo trình môn học đã xuất bản</p>
        </div>
      </div>

      {/* Search Bar - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã môn (VD: CS101), tên môn hoặc từ khóa..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Filter size={20} />
              Lọc
            </button>
            <button
              type="submit"
              className="hidden lg:block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Bộ lọc</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Syllabus List */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SortAsc className="text-gray-600" size={20} />
                <p className="text-gray-700">
                  Tìm thấy <span className="font-semibold text-blue-600">{filteredAndSortedSyllabi.length}</span> giáo trình
                </p>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Đang tải giáo trình...</p>
              </div>
            ) : filteredAndSortedSyllabi.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md p-8">
                <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy giáo trình</h3>
                <p className="text-gray-600 mb-4">Không có giáo trình nào phù hợp với bộ lọc của bạn</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedSyllabi.map((syllabus) => (
                  <div 
                    key={syllabus.id} 
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              {syllabus.subjectCode || 'N/A'}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ✓ Đã xuất bản
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {syllabus.subjectName || 'Tên môn học'}
                          </h3>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {syllabus.summary || 'Không có mô tả'}
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookMarked size={16} className="text-blue-600" />
                          <span><strong>Kỳ:</strong> {syllabus.semester || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} className="text-orange-600" />
                          <span><strong>Năm:</strong> {syllabus.academicYear || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap size={16} className="text-purple-600" />
                          <span><strong>Ngành:</strong> {syllabus.programName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} className="text-green-600" />
                          <span><strong>Mã:</strong> {syllabus.syllabusCode || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(`/public/syllabus/${syllabus.id}`)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium group"
                      >
                        Xem Chi Tiết
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
