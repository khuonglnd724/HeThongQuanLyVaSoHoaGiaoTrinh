import React from 'react'
import { BookOpen, Search, Zap, Shield } from 'lucide-react'

export const HomePage = ({ onSearchClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">
            📚 Khám Phá Giáo Trình Của Bạn
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Tìm kiếm, xem chi tiết, so sánh và quản lý giáo trình học phần một cách dễ dàng
          </p>
          <button
            onClick={onSearchClick}
            className="btn btn-primary text-lg px-8 py-4 gap-2"
          >
            <Search size={24} />
            Bắt Đầu Tìm Kiếm
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-custom py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Tính Năng Chính</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Search,
              title: '🔍 Tìm Kiếm Nâng Cao',
              description: 'Tìm kiếm theo tên, mã môn hoặc lọc theo chuyên ngành/học kỳ',
              action: onSearchClick,
            },
            {
              icon: BookOpen,
              title: '📖 Xem Chi Tiết',
              description: 'Xem toàn bộ nội dung giáo trình với thông tin chi tiết',
              action: onSearchClick,
            },
            {
              icon: Zap,
              title: '⚡ AI Summary',
              description: 'Tóm tắt tự động dùng AI để nắm nhanh nội dung',
              action: onSearchClick,
            },
            {
              icon: Shield,
              title: '✅ Theo Dõi',
              description: 'Đăng ký theo dõi để nhận thông báo khi giáo trình thay đổi',
              action: onSearchClick,
            },
          ].map((feature, idx) => (
            <button
              key={idx}
              onClick={feature.action}
              className="card p-6 text-center hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
            >
              <div className="inline-block p-3 bg-primary-100 rounded-lg mb-4">
                <feature.icon size={28} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Các Tính Năng Nổi Bật</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: '🌳 Sơ Đồ Môn Học',
                items: [
                  'Hiển thị môn học tiên quyết',
                  'Hiển thị môn học phụ thuộc',
                  'Thông tin tín chỉ & học kỳ',
                ],
              },
              {
                title: '📊 So Sánh Phiên Bản',
                items: [
                  'Xem thay đổi giữa các phiên bản',
                  'Highlight nội dung mới/xóa/sửa',
                  'Thống kê % thay đổi',
                ],
              },
              {
                title: '🎯 CLO-PLO Map',
                items: [
                  'Chuẩn đầu ra môn học (CLO)',
                  'Chuẩn đầu ra chương trình (PLO)',
                  'Ánh xạ chi tiết CLO-PLO',
                ],
              },
              {
                title: '📤 Xuất PDF',
                items: [
                  'Xuất toàn bộ giáo trình',
                  'Định dạng chuyên nghiệp',
                  'Dễ chia sẻ & in ấn',
                ],
              },
            ].map((capability, idx) => (
              <div key={idx} className="card p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {capability.title}
                </h3>
                <ul className="space-y-3">
                  {capability.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn Sàng Khám Phá?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Bắt đầu tìm kiếm giáo trình ngay bây giờ
          </p>
          <button
            onClick={onSearchClick}
            className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 font-semibold"
          >
            Tìm Kiếm Ngay
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage
