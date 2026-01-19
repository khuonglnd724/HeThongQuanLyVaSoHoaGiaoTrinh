import React from 'react'

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container-custom py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📚 Cổng Thông Tin Giáo Trình
            </h1>
            <p className="text-gray-600 mt-1">
              Tìm kiếm, xem chi tiết và quản lý giáo trình học phần
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Về hệ thống</h3>
            <p className="text-sm text-gray-400">
              Cổng thông tin công khai cung cấp tìm kiếm giáo trình, xem chi tiết, 
              so sánh phiên bản và quản lý theo dõi.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Liên kết nhanh</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition">Trang chủ</a></li>
              <li><a href="/search" className="hover:text-white transition">Tìm kiếm</a></li>
              <li><a href="#" className="hover:text-white transition">Hỗ trợ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Liên hệ</h3>
            <p className="text-sm text-gray-400">
              Email: support@example.com<br />
              Điện thoại: +84 (0)123 456 789
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex justify-between items-center text-sm">
          <p className="text-gray-400">© 2026 Hệ thống Quản lý Giáo Trình. All rights reserved.</p>
          <p className="text-gray-500">v1.0.0</p>
        </div>
      </div>
    </footer>
  )
}

export default { Header, Footer }
