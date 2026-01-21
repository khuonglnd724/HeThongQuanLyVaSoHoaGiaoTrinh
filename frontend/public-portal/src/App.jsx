import React, { useState, useEffect } from 'react'
import { Header, Footer } from './shared/components/Layout'
import { getDashboardPageByRole } from './shared/config/roleConfig'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import SyllabusDetailPage from './pages/SyllabusDetailPage'
import Login from './pages/Login'
// Import full-featured dashboards from modules
import StudentDashboard from './modules/student/pages/StudentDashboard'
import LecturerDashboard from './modules/lecturer/pages/LecturerDashboard'
import AdminDashboard from './modules/admin/pages/AdminDashboard'
import AcademicDashboard from './modules/academic/pages/AcademicDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        // Redirect to dashboard based on role
        const dashboardPage = getDashboardPageByRole(parsedUser.role)
        setCurrentPage(dashboardPage)
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    console.log('✅ Login Success! User:', userData)
    console.log('✅ Role:', userData.role)
    
    // Lưu user data
    localStorage.setItem('token', `token-${Date.now()}`)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', userData.role)
    
    // Redirect to appropriate dashboard
    const dashboardPage = getDashboardPageByRole(userData.role)
    console.log('✅ Redirecting to:', dashboardPage)
    setCurrentPage(dashboardPage)
  }
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    setUser(null)
    setCurrentPage('landing')
  }

  const goToLanding = () => {
    if (!user) {
      setCurrentPage('landing')
    }
  }

  const goToSearch = () => setCurrentPage('search')
  const viewSyllabus = (id) => {
    setSelectedSyllabusId(id)
    setCurrentPage('detail')
  }
  const backFromDetail = () => setCurrentPage('search')
  
  const goToLogin = () => setCurrentPage('login')
  const backFromLogin = () => setCurrentPage('landing')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show header only for public pages */}
      {!user && <Header onLogoClick={goToLanding} />}

      <main className="flex-1">
        {/* Public Pages */}
        {currentPage === 'landing' && !user && (
          <LandingPage 
            onSearchClick={goToSearch}
            onLoginClick={goToLogin}
          />
        )}

        {currentPage === 'login' && !user && (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={backFromLogin}
          />
        )}

        {currentPage === 'home' && !user && (
          <HomePage onSearchClick={goToSearch} />
        )}

        {currentPage === 'search' && !user && (
          <SearchPage onSyllabusSelect={viewSyllabus} />
        )}

        {currentPage === 'detail' && !user && selectedSyllabusId && (
          <SyllabusDetailPage
            syllabusId={selectedSyllabusId}
            onBack={backFromDetail}
          />
        )}

        {/* Protected Pages - Student */}
        {currentPage === 'student-dashboard' && user?.role === 'ROLE_STUDENT' && (
          <StudentDashboard user={user} onLogout={handleLogout} />
        )}

        {/* Protected Pages - Lecturer */}
        {currentPage === 'lecturer-dashboard' && user?.role === 'ROLE_LECTURER' && (
          <LecturerDashboard user={user} onLogout={handleLogout} />
        )}

        {/* Protected Pages - Academic Affairs */}
        {currentPage === 'academic-dashboard' && user?.role === 'ROLE_ACADEMIC_AFFAIRS' && (
          <AcademicDashboard user={user} onLogout={handleLogout} />
        )}

        {/* Protected Pages - Admin/HoD/Rector */}
        {currentPage === 'admin-dashboard' && 
         (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_HOD' || 
          user?.role === 'ROLE_RECTOR') && (
          <AdminDashboard user={user} onLogout={handleLogout} />
        )}

        {/* Fallback */}
        {!user && currentPage !== 'landing' && (
          <LandingPage 
            onSearchClick={goToSearch}
            onLoginClick={goToLogin}
          />
        )}
      </main>

      {/* Show footer only for public pages */}
      {!user && <Footer />}
    </div>
  )
}

export default App
