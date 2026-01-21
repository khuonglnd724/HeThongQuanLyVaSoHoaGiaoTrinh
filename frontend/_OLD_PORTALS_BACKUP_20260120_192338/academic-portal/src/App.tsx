import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Statistics from './components/Statistics';
import Notifications from './components/Notifications';
import Login from './components/Login';
import AAPendingReviews from './components/AA/AAPendingReviews';
import AASyllabusReview from './components/AA/AASyllabusReview';
import authService from './services/authService';
import './App.css';

type PageType = 'stats' | 'dashboard' | 'aa-pending' | 'aa-review';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      // Get user role from token or user info
      const role = localStorage.getItem('user_role') || 'ADMIN';
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const role = localStorage.getItem('user_role') || 'ADMIN';
    setUserRole(role);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRole('');
    setCurrentPage('dashboard');
    navigate('/');
  };

  const navigateTo = (page: PageType, path: string) => {
    setCurrentPage(page);
    navigate(path);
  };

  const isAA = userRole === 'ACADEMIC_AFFAIRS' || userRole === 'AA';

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Cổng Học Vụ</h1>
          {isAuthenticated && <span className="user-role">{userRole}</span>}
          <div className="header-actions">
            {isAuthenticated && (
              <button
                className={`btn-nav ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('dashboard', '/')}
              >
                🏠 Bảng điều khiển
              </button>
            )}
            {isAuthenticated && isAA && (
              <button
                className={`btn-nav ${currentPage === 'aa-pending' ? 'active' : ''}`}
                onClick={() => navigateTo('aa-pending', '/aa/pending')}
              >
                📋 Duyệt AA
              </button>
            )}
            {isAuthenticated && (
              <button
                className={`btn-nav ${currentPage === 'stats' ? 'active' : ''}`}
                onClick={() => navigateTo('stats', '/statistics')}
              >
                📊 Thống Kê
              </button>
            )}
            {isAuthenticated && (
              <button
                className="btn-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔 Thông Báo
              </button>
            )}
            {isAuthenticated && (
              <button
                className="btn-logout"
                onClick={handleLogout}
              >
                🚪 Đăng Xuất
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            <div className="dashboard">
              <h2>Bảng điều khiển - Học Vụ</h2>
              <div className="dashboard-message">
                <p>✅ Cổng Học Vụ - Duyệt giáo trình cấp 2</p>
                
                {isAA && (
                  <div className="redirect-info aa-info">
                    <h3>📋 Academic Affairs (AA) - Vai trò của bạn</h3>
                    <p>Nhiệm vụ:</p>
                    <ul>
                      <li>✓ Duyệt giáo trình (Phê duyệt cấp 2)</li>
                      <li>✓ Kiểm tra liên kết CLO-PLO</li>
                      <li>✓ Kiểm tra cấu trúc tín chỉ và quy định đánh giá</li>
                      <li>✓ Phê duyệt/Từ chối giáo trình</li>
                    </ul>
                    <button 
                      className="cta-button"
                      onClick={() => navigateTo('aa-pending', '/aa/pending')}
                    >
                      Vào trang Duyệt AA →
                    </button>
                  </div>
                )}

                {!isAA && (
                  <div className="redirect-info">
                    <h3>⚠️ Hạn chế truy cập</h3>
                    <p>Portal này chỉ dành cho nhân sự Học Vụ.</p>
                    <p>Nếu cần xuất bản/lưu trữ giáo trình, vui lòng dùng <strong>Hệ thống Quản trị</strong> (Port 3001).</p>
                  </div>
                )}
                
                <div className="redirect-info">
                  <h3>🎓 Các cổng khác</h3>
                  <p><strong>Lecturer Portal</strong> (Port 5173): Tạo, chỉnh sửa giáo trình</p>
                  <p><strong>Admin System</strong> (Port 3001): Xuất bản, Lưu trữ, Quản trị hệ thống</p>
                </div>
                
                <div className="features-list">
                  <h3>Chức năng Cổng Học Vụ:</h3>
                  <ul>
                    <li>📋 Duyệt giáo trình (cấp 2)</li>
                    <li>✅ Kiểm tra liên kết CLO-PLO, tín chỉ, đánh giá</li>
                    <li>📊 Thống kê giáo trình đã duyệt</li>
                    <li>🎯 Quản lý PLO (Program Learning Outcomes)</li>
                  </ul>
                </div>
              </div>
            </div>
          } />
          
          {isAA && (
            <>
              <Route path="/aa/pending" element={<AAPendingReviews />} />
              <Route path="/aa/review/:id" element={<AASyllabusReview />} />
            </>
          )}
          
          <Route path="/statistics" element={<Statistics show={true} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
