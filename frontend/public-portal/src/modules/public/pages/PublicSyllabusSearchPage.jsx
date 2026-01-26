import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { BookOpen, Search, Filter, X, ChevronRight, Calendar, User, BookMarked, GraduationCap, SortAsc } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import syllabusService from '../../../services/syllabusService'

export default function PublicSyllabusSearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get user from localStorage instead of props
  const [localUser, setLocalUser] = useState(null)
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '')
  const [sortBy, setSortBy] = useState('latest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [error, setError] = useState(null)
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [isStudent, setIsStudent] = useState(false)

  useEffect(() => {
    // Load user from localStorage on mount
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setLocalUser(user)
        // Check if user is a student (support both 'STUDENT' and 'ROLE_STUDENT')
        const studentRole = user.roles?.some(r => r === 'STUDENT' || r === 'ROLE_STUDENT') 
                         || user.role === 'STUDENT' 
                         || user.role === 'ROLE_STUDENT'
        setIsStudent(studentRole)
        console.log('👤 User loaded from localStorage:', user)
        console.log('🎓 Is student:', studentRole)
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    } else {
      // Guest user - fetch all programs for filter
      fetchPrograms()
    }
  }, [])

  const fetchPrograms = useCallback(async () => {
    try {
      console.log('📚 Fetching all programs for guest filter')
      // Call public-service (no auth required)
      const response = await fetch('/api/public/programs')
      
      if (response.ok) {
        const data = await response.json()
        const programsArray = Array.isArray(data) ? data : (data.data || [])
        setPrograms(programsArray)
        console.log('✅ Programs loaded:', programsArray)
      }
    } catch (err) {
      console.error('❌ Error fetching programs:', err)
    }
  }, [])

  const fetchSyllabi = useCallback(async (user, programFilter = null) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      // Check if user is student (support both 'STUDENT' and 'ROLE_STUDENT')
      const userIsStudent = user && (
        user.roles?.some(r => r === 'STUDENT' || r === 'ROLE_STUDENT') 
        || user.role === 'STUDENT' 
        || user.role === 'ROLE_STUDENT'
      )
      
      if (userIsStudent) {
        // STUDENT: Fetch APPROVED + PUBLIC syllabuses for their program
        console.log('🎓 Student user - fetching APPROVED + PUBLIC syllabuses')
        
        const programName = user?.major
        console.log('🎓 User program name:', programName)
        
        if (!programName) {
          console.warn('⚠️ Student has no program name')
          setSyllabi([])
          setError('Không thể xác định ngành học của bạn. Vui lòng đăng nhập lại.')
          return
        }
        
        // Fetch subjects of the program
        console.log('📚 Fetching subjects for program:', programName)
        const subjectsUrl = `/api/v1/subject/program/search?name=${encodeURIComponent(programName)}`
        
        const subjectsResponse = await fetch(subjectsUrl, { headers })
        
        if (!subjectsResponse.ok) {
          console.warn(`⚠️ Failed to fetch subjects for program: ${subjectsResponse.status}`)
          setSyllabi([])
          return
        }
        
        const subjectsData = await subjectsResponse.json()
        console.log('✅ Subjects loaded:', subjectsData)
        
        const subjects = subjectsData.data || subjectsData
        const subjectCodes = Array.isArray(subjects) 
          ? subjects.map(s => s.subjectCode || s.code).filter(Boolean)
          : []
        
        console.log('📋 Subject codes:', subjectCodes)
        
        if (subjectCodes.length === 0) {
          console.warn('No subjects found for program')
          setSyllabi([])
          return
        }
        
        // Fetch APPROVED + PUBLISHED syllabuses for these subjects
        console.log('🔍 Fetching APPROVED + PUBLISHED syllabuses for subjects:', subjectCodes)
        const syllabusesResponse = await fetch(
          `/api/syllabuses/student-syllabuses?${subjectCodes.map(code => `subjectCodes=${encodeURIComponent(code)}`).join('&')}`,
          { headers }
        )
        
        if (!syllabusesResponse.ok) {
          throw new Error(`Failed to fetch syllabuses: ${syllabusesResponse.status}`)
        }
        
        const syllabusesData = await syllabusesResponse.json()
        console.log('✅ APPROVED + PUBLISHED syllabuses loaded:', syllabusesData)
        
        const syllabusesArray = Array.isArray(syllabusesData) ? syllabusesData : (syllabusesData.data || [])
        setSyllabi(syllabusesArray)
        console.log('📊 Total syllabuses:', syllabusesArray.length)
        
      } else {
        // GUEST or NON-STUDENT: Fetch PUBLIC syllabuses only
        console.log('👤 Guest/non-student user - fetching PUBLIC syllabuses')
        
        let url = '/api/public/syllabuses'
        
        // Add program filter if selected (for guest users)
        if (programFilter) {
          // Fetch subjects of selected program via public-service
          console.log('📚 Fetching subjects for selected program:', programFilter)
          const subjectsUrl = `/api/public/subjects/by-program?programName=${encodeURIComponent(programFilter)}`
          
          const subjectsResponse = await fetch(subjectsUrl)
          
          if (subjectsResponse.ok) {
            const subjectsData = await subjectsResponse.json()
            const subjects = subjectsData.data || subjectsData
            const subjectCodes = Array.isArray(subjects) 
              ? subjects.map(s => s.subjectCode || s.code).filter(Boolean)
              : []
            
            if (subjectCodes.length > 0) {
              // Filter by subject codes
              url += `?${subjectCodes.map(code => `subjectCodes=${encodeURIComponent(code)}`).join('&')}`
            }
          }
        }
        
        console.log('🔍 Fetching from:', url)
        const syllabusesResponse = await fetch(url)
        
        if (!syllabusesResponse.ok) {
          throw new Error(`Failed to fetch syllabuses: ${syllabusesResponse.status}`)
        }
        
        const syllabusesData = await syllabusesResponse.json()
        console.log('✅ PUBLIC syllabuses loaded:', syllabusesData)
        
        const syllabusesArray = Array.isArray(syllabusesData) ? syllabusesData : (syllabusesData.data || [])
        setSyllabi(syllabusesArray)
        console.log('📊 Total syllabuses:', syllabusesArray.length)
      }
      
    } catch (err) {
      console.error('❌ Error fetching syllabuses:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      })
      setError('Không thể tải danh sách giáo trình. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSyllabi(localUser, selectedProgram)
  }, [localUser, selectedProgram, fetchSyllabi])

  const filteredAndSortedSyllabi = useMemo(() => {
    let filtered = syllabi.filter(item => {
      const matchesSearch = !searchTerm || 
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
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
  }, [syllabi, searchTerm, sortBy])

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled by filteredAndSortedSyllabi useMemo
  }

  const clearFilters = () => {
    setSearchTerm('')
    if (!localUser) {
      setSelectedProgram('')
    }
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">{!localUser ? 'Bộ lọc & Sắp xếp' : 'Sắp xếp'}</h3>
        </div>
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

      {/* ============================================================
          TODO: Search Bar - Sticky
          Thanh tìm kiếm cố định với các nút lọc và tìm kiếm
          
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
      ============================================================ */}

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
                              {syllabus.code || syllabus.subjectCode || 'N/A'}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ✓ Đã phê duyệt
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {syllabus.title || syllabus.subjectName || 'Tên môn học'}
                          </h3>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {syllabus.snippet || syllabus.summary || 'Không có mô tả'}
                      </p>



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
