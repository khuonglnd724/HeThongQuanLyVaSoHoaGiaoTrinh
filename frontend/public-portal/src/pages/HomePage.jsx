import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search, Filter, ChevronRight, Star, Users, Clock, FileText } from 'lucide-react'
import { Header, Footer } from '../shared/components/Layout'
import syllabusService from '../services/syllabusService'

const HomePage = () => {
  const navigate = useNavigate()
  const [syllabuses, setSyllabuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  const majors = ['Công Nghệ Thông Tin', 'Kinh Tế', 'Kỹ Thuật', 'Quản Lý Kinh Doanh']
  const semesters = ['Kỳ I', 'Kỳ II', 'Hè']
  const academicYears = ['2024-2025', '2023-2024', '2022-2023']

  useEffect(() => {
    loadFeaturedSyllabuses()
  }, [])

  const loadFeaturedSyllabuses = async () => {
    try {
      const data = await syllabusService.getPublishedSyllabuses(0, 8)
      setSyllabuses(Array.isArray(data) ? data : data.content || [])
    } catch (err) {
      console.error('Error loading syllabuses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (selectedMajor !== 'all') params.append('major', selectedMajor)
    if (selectedSemester !== 'all') params.append('semester', selectedSemester)
    if (selectedYear !== 'all') params.append('year', selectedYear)
    navigate(`/public/search?${params.toString()}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const filteredSyllabuses = syllabuses.slice(0, 6)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
              <BookOpen size={40} />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            📚 Hệ Thống Quản Lý Giáo Trình
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Tìm kiếm và khám phá các giáo trình chính thức của trường. Truy cập nội dung học tập chất lượng cao, được quản lý tập trung.
          </p>
        </div>
      </section>

      {/* Main Search Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 -mt-20 relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Tìm Kiếm Giáo Trình</h2>
          
          {/* Main Search Input */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm theo mã môn (VD: CS101), tên môn hoặc từ khóa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-bold flex items-center gap-2 shadow-lg"
            >
              <Search size={20} />
              Tìm Kiếm
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Major Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📌 Chuyên Ngành
              </label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">Tất cả chuyên ngành</option>
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏫 Học Kỳ
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">Tất cả học kỳ</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Năm Học
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">Tất cả năm học</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Search */}
            <div className="flex items-end">
              <button
                onClick={() => navigate('/public/search')}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition font-semibold flex items-center justify-center gap-2"
              >
                <Filter size={18} />
                Tìm Nâng Cao
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-600">
            <div className="flex items-center gap-4">
              <FileText className="text-blue-600" size={32} />
              <div>
                <p className="text-gray-600 text-sm font-medium">Giáo Trình Xuất Bản</p>
                <p className="text-3xl font-bold text-blue-600">{syllabuses.length}+</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-600">
            <div className="flex items-center gap-4">
              <Users className="text-green-600" size={32} />
              <div>
                <p className="text-gray-600 text-sm font-medium">Giảng Viên</p>
                <p className="text-3xl font-bold text-green-600">100+</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-600">
            <div className="flex items-center gap-4">
              <Clock className="text-purple-600" size={32} />
              <div>
                <p className="text-gray-600 text-sm font-medium">Cập Nhật Hằng Ngày</p>
                <p className="text-3xl font-bold text-purple-600">24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Syllabus Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Star className="text-yellow-500" size={32} />
                Giáo Trình Nổi Bật
              </h2>
              <p className="text-gray-600 mt-2">Những giáo trình được cập nhật gần đây nhất</p>
            </div>
            <button
              onClick={() => navigate('/public/search')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition"
            >
              Xem tất cả <ChevronRight size={20} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Đang tải giáo trình...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSyllabuses.map((syllabus, idx) => (
                <div
                  key={syllabus.id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-t-4 border-blue-500 hover:border-blue-700"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
                    {idx === 0 && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Nổi Bật
                      </div>
                    )}
                    <BookOpen size={32} className="text-blue-100 mb-2" />
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-sm font-bold text-blue-600 mb-2 tracking-wider">
                      {syllabus.subject_code}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                      {syllabus.subject_name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {syllabus.summary || '📖 Giáo trình chuyên ngành'}
                    </p>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">📅 v{syllabus.version_no}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{new Date(syllabus.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/public/syllabus/${syllabus.id}`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold flex items-center justify-center gap-2 group/btn"
                    >
                      Xem Chi Tiết
                      <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">✨ Tính Năng Chính</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Tìm Kiếm Nâng Cao',
                desc: 'Tìm kiếm theo mã, tên hoặc từ khóa với bộ lọc đa chiều'
              },
              {
                icon: '📖',
                title: 'Xem Chi Tiết',
                desc: 'Xem nội dung đầy đủ: CLO, đánh giá, kế hoạch giảng dạy'
              },
              {
                icon: '🤖',
                title: 'AI Summary',
                desc: 'Tóm tắt tự động giúp hiểu nhanh nội dung giáo trình'
              },
              {
                icon: '🔗',
                title: 'Quan Hệ Môn Học',
                desc: 'Xem mối liên hệ giữa các môn học: tiên quyết, phụ thuộc'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition border-t-4 border-blue-500"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">🎯 Bắt Đầu Khám Phá Ngay</h2>
          <p className="text-xl text-blue-100 mb-8">
            Tìm kiếm giáo trình phù hợp với chuyên ngành của bạn
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/public/search')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition font-bold text-lg shadow-lg"
            >
              Tìm Kiếm Ngay
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-900 transition font-bold text-lg border-2 border-white"
            >
              Đăng Nhập
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
