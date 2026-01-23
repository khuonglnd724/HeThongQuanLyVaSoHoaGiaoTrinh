import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle, BookOpen, User, Settings, FileText } from 'lucide-react'

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState({})
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Tất cả', icon: HelpCircle },
    { id: 'general', name: 'Chung', icon: HelpCircle },
    { id: 'syllabus', name: 'Giáo trình', icon: BookOpen },
    { id: 'account', name: 'Tài khoản', icon: User },
    { id: 'technical', name: 'Kỹ thuật', icon: Settings },
  ]

  const faqData = [
    {
      id: 1,
      category: 'general',
      question: 'Hệ thống quản lý giáo trình là gì?',
      answer: 'Hệ thống quản lý giáo trình là nền tảng số hóa giúp quản lý, tìm kiếm, và theo dõi các giáo trình học phần của trường đại học. Hệ thống cho phép sinh viên, giảng viên và quản trị viên truy cập thông tin giáo trình một cách dễ dàng và hiệu quả.'
    },
    {
      id: 2,
      category: 'general',
      question: 'Ai có thể sử dụng hệ thống này?',
      answer: 'Hệ thống được thiết kế cho 4 nhóm người dùng chính: Sinh viên (xem và theo dõi giáo trình), Giảng viên (tạo và chỉnh sửa giáo trình), Trưởng khoa (phê duyệt giáo trình), và Quản trị viên (quản lý toàn bộ hệ thống).'
    },
    {
      id: 3,
      category: 'syllabus',
      question: 'Làm thế nào để tìm kiếm giáo trình?',
      answer: 'Bạn có thể sử dụng tính năng tìm kiếm trên trang chủ hoặc trang Tìm kiếm. Nhập tên môn học, mã môn, hoặc từ khóa liên quan. Bạn cũng có thể lọc theo khoa, học kỳ, hoặc năm học để thu hẹp kết quả.'
    },
    {
      id: 4,
      category: 'syllabus',
      question: 'Tính năng AI Summary hoạt động như thế nào?',
      answer: 'AI Summary sử dụng trí tuệ nhân tạo để phân tích và tóm tắt nội dung giáo trình. Chỉ cần nhấn nút "AI Summary" trên trang chi tiết giáo trình, hệ thống sẽ tự động tạo bản tóm tắt ngắn gọn giúp bạn nắm bắt nhanh nội dung chính.'
    },
    {
      id: 5,
      category: 'syllabus',
      question: 'Làm sao để theo dõi một giáo trình?',
      answer: 'Đăng nhập vào tài khoản của bạn, mở trang chi tiết giáo trình và nhấn nút "Theo dõi". Bạn sẽ nhận được thông báo khi giáo trình được cập nhật hoặc có phiên bản mới.'
    },
    {
      id: 6,
      category: 'account',
      question: 'Làm thế nào để đăng ký tài khoản?',
      answer: 'Sinh viên và giảng viên được cấp tài khoản tự động thông qua hệ thống quản lý của trường. Nếu bạn chưa có tài khoản, vui lòng liên hệ phòng đào tạo hoặc quản trị viên hệ thống.'
    },
    {
      id: 7,
      category: 'account',
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Nhấn "Quên mật khẩu" tại trang đăng nhập và nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu đến email của bạn. Nếu không nhận được email, hãy kiểm tra thư mục spam hoặc liên hệ hỗ trợ.'
    },
    {
      id: 8,
      category: 'account',
      question: 'Làm thế nào để cập nhật thông tin cá nhân?',
      answer: 'Đăng nhập vào hệ thống, vào trang "Hồ sơ" từ menu. Tại đây bạn có thể cập nhật thông tin liên hệ, ảnh đại diện và các cài đặt tài khoản khác.'
    },
    {
      id: 9,
      category: 'technical',
      question: 'Hệ thống hỗ trợ những trình duyệt nào?',
      answer: 'Hệ thống hoạt động tốt nhất trên các trình duyệt hiện đại: Google Chrome (khuyến nghị), Mozilla Firefox, Microsoft Edge, và Safari. Để có trải nghiệm tốt nhất, hãy cập nhật trình duyệt lên phiên bản mới nhất.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'Tôi gặp lỗi khi sử dụng hệ thống, phải làm sao?',
      answer: 'Trước tiên, hãy thử làm mới trang (F5) hoặc xóa cache trình duyệt. Nếu lỗi vẫn tiếp tục, hãy chụp ảnh màn hình lỗi và gửi đến trang Liên hệ hoặc email support@syllabus.edu.vn để được hỗ trợ.'
    },
    {
      id: 11,
      category: 'technical',
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Có, hệ thống sử dụng các biện pháp bảo mật tiêu chuẩn công nghiệp bao gồm mã hóa SSL, xác thực JWT, và tuân thủ các quy định về bảo vệ dữ liệu cá nhân. Dữ liệu được sao lưu định kỳ và lưu trữ an toàn.'
    },
    {
      id: 12,
      category: 'syllabus',
      question: 'Giảng viên có thể chỉnh sửa giáo trình như thế nào?',
      answer: 'Giảng viên đăng nhập vào hệ thống, truy cập "Cổng Giảng viên" để xem danh sách giáo trình được phân công. Chọn giáo trình cần chỉnh sửa, thực hiện các thay đổi và gửi để phê duyệt. Trưởng khoa sẽ xem xét và phê duyệt các thay đổi.'
    }
  ]

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">
            ❓ Câu Hỏi Thường Gặp
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Tìm câu trả lời nhanh cho các thắc mắc phổ biến về hệ thống quản lý giáo trình
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-300 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <category.icon size={18} />
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500">
                Thử tìm kiếm với từ khóa khác hoặc <a href="/contact" className="text-primary-600 underline">liên hệ với chúng tôi</a>
              </p>
            </div>
          ) : (
            filteredFAQs.map(faq => (
              <div key={faq.id} className="card overflow-hidden">
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-primary-600 font-bold text-lg">Q.</span>
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </div>
                  {openItems[faq.id] ? (
                    <ChevronUp className="text-gray-500 flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-500 flex-shrink-0" size={20} />
                  )}
                </button>
                
                {openItems[faq.id] && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="flex items-start gap-3 pt-4">
                      <span className="text-green-600 font-bold text-lg">A.</span>
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="card p-8 bg-primary-50 border-primary-200 max-w-2xl mx-auto">
            <FileText size={40} className="mx-auto text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy câu trả lời?
            </h3>
            <p className="text-gray-600 mb-6">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn với mọi thắc mắc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="btn btn-primary px-6 py-3"
              >
                📬 Liên hệ hỗ trợ
              </a>
              <a
                href="/help"
                className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-6 py-3"
              >
                📖 Xem hướng dẫn
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { number: '24/7', label: 'Hỗ trợ trực tuyến' },
            { number: '< 24h', label: 'Thời gian phản hồi' },
            { number: '98%', label: 'Tỷ lệ hài lòng' },
            { number: '1000+', label: 'Câu hỏi đã giải đáp' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQPage
