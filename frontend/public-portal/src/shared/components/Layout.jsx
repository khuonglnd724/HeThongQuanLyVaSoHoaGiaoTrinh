import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Home, Search, HelpCircle, LogIn, LogOut, User } from 'lucide-react'

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
    setMobileMenuOpen(false)
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  const getNavLinks = () => {
    const baseLinks = [
      { icon: Home, label: 'Home', path: '/' },
      { icon: Search, label: 'Search', path: '/public/search' },
      { icon: HelpCircle, label: 'Help', path: '#help' }
    ];
    
    if (user) {
      // Add dashboard link for logged-in users
      baseLinks.splice(1, 0, { icon: User, label: 'My Dashboard', path: '/student' });
    }
    
    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white text-xl font-bold">📚</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                SMD System
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Syllabus Management
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link, idx) => (
              link.path.startsWith('#') ? (
                <a 
                  key={idx}
                  href={link.path}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <link.icon size={18} />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ) : (
                <Link 
                  key={idx}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    link.label === 'My Dashboard' 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg font-medium' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <link.icon size={18} />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              )
            ))}
          </nav>

          {/* User Info & Login/Logout Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {(user.fullName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 max-w-[150px] truncate">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 border-t border-gray-200 pt-4 space-y-2 animate-fadeIn">
            {navLinks.map((link, idx) => (
              link.path.startsWith('#') ? (
                <a 
                  key={idx}
                  href={link.path}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </a>
              ) : (
                <Link 
                  key={idx}
                  to={link.path}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            ))}
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 mt-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800">{user.fullName || user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md font-medium w-full"
                >
                  <LogOut size={20} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            )}
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
              <li><Link to="/" className="hover:text-white transition">Trang chủ</Link></li>
              <li><Link to="/search" className="hover:text-white transition">Tìm kiếm</Link></li>
              <li><button type="button" className="hover:text-white transition bg-transparent border-none cursor-pointer p-0">Hỗ trợ</button></li>
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

const Layout = { Header, Footer }
export default Layout
