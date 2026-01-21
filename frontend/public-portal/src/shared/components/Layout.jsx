import React, { useState } from 'react'
import { Menu, X, Home, Search, HelpCircle, LogIn } from 'lucide-react'

export const Header = ({ onLogoClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogoClick = () => {
    if (onLogoClick) onLogoClick()
  }

  const navLinks = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Search, label: 'Search', href: '#search' },
    { icon: HelpCircle, label: 'Help', href: '#help' }
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer"
          >
            <div className="text-3xl">📚</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SMD System
              </h1>
              <p className="text-xs text-gray-600">
                Syllabus Management
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, idx) => (
              <a 
                key={idx}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition"
              >
                <link.icon size={18} />
                <span className="text-sm font-medium">{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Login Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            <a 
              href="/login"
              className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <LogIn size={18} />
              Login
            </a>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 border-t border-gray-200 pt-4 space-y-2">
            {navLinks.map((link, idx) => (
              <a 
                key={idx}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </a>
            ))}
            <a 
              href="/login"
              className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn size={20} />
              <span>Login</span>
            </a>
          </nav>
        )}
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
