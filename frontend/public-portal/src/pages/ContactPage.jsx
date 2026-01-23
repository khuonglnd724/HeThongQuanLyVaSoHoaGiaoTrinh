import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Điện thoại',
      detail: '(028) 1234 5678',
      subDetail: 'Thứ 2 - Thứ 6: 8:00 - 17:00'
    },
    {
      icon: Mail,
      title: 'Email',
      detail: 'support@syllabus.edu.vn',
      subDetail: 'Phản hồi trong vòng 24h'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      detail: '268 Lý Thường Kiệt, Q.10',
      subDetail: 'TP. Hồ Chí Minh, Việt Nam'
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      detail: 'Thứ 2 - Thứ 6',
      subDetail: '8:00 AM - 5:00 PM'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">
            📬 Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh bên dưới.
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="text-primary-600" />
                Gửi Tin Nhắn
              </h2>

              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  ✅ Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    <option value="general">Câu hỏi chung</option>
                    <option value="technical">Hỗ trợ kỹ thuật</option>
                    <option value="syllabus">Về giáo trình</option>
                    <option value="account">Vấn đề tài khoản</option>
                    <option value="feedback">Góp ý / Phản hồi</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề của bạn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-4 text-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Gửi Tin Nhắn
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {contactInfo.map((info, idx) => (
              <div key={idx} className="card p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <info.icon size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {info.title}
                    </h3>
                    <p className="text-gray-700">{info.detail}</p>
                    <p className="text-sm text-gray-500">{info.subDetail}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Links */}
            <div className="card p-6 bg-primary-50 border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-3">
                💡 Trước khi liên hệ
              </h3>
              <ul className="space-y-2 text-sm text-primary-800">
                <li>• Xem <a href="/faq" className="underline hover:text-primary-600">Câu hỏi thường gặp</a></li>
                <li>• Đọc <a href="/help" className="underline hover:text-primary-600">Hướng dẫn sử dụng</a></li>
                <li>• Tìm kiếm trong <a href="/search" className="underline hover:text-primary-600">Giáo trình</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-primary-600" />
              Vị Trí Của Chúng Tôi
            </h2>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
                <p>Bản đồ sẽ hiển thị tại đây</p>
                <p className="text-sm">268 Lý Thường Kiệt, Q.10, TP.HCM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
