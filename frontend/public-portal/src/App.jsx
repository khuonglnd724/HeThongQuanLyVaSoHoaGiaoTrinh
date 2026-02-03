import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Header, Footer } from './shared/components/Layout'
import HomePage from './pages/HomePage'
import notificationService from './services/notificationService'
import { Bell } from 'lucide-react'
import SyllabusDetailPage from './pages/SyllabusDetailPage'
import Login from './pages/Login'
import StudentPage from './pages/StudentPage'
import StudentSyllabusDetailPage from './pages/StudentSyllabusDetailPage'
import StudentProfilePage from './pages/StudentProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import AcademicDashboard from './modules/academic/pages/AcademicDashboard'
import HODDashboard from './modules/academic/pages/HODDashboard'
import RectorDashboard from './pages/RectorDashboard'
import ProgramManagement from './modules/academic/pages/ProgramManagement'
import SyllabusListPage from './modules/lecturer/pages/SyllabusListPage'
import SyllabusEditorPage from './modules/lecturer/pages/SyllabusEditorPage'
import SyllabusComparePage from './modules/lecturer/pages/SyllabusComparePage'
import LecturerPortalGuide from './modules/lecturer/pages/LecturerPortalGuide'
import LecturerPortalLayout from './modules/lecturer/layout/LecturerPortalLayout'
import AdminPortalGuide from './modules/admin/pages/AdminPortalGuide'
import AdminPortalLayout from './modules/admin/layout/AdminPortalLayout'
import PublicSyllabusSearchPage from './modules/public/pages/PublicSyllabusSearchPage'
import PublicSyllabusDetailPage from './modules/public/pages/PublicSyllabusDetailPage'
import FollowedSyllabuses from './modules/student/pages/FollowedSyllabuses'

const RequireRole = ({ allowedRoles, children }) => {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch (e) {
      return null
    }
  })()

  const role = storedUser?.role || localStorage.getItem('role')

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const location = useLocation()
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [notificationData, setNotificationData] = useState(null)
  const isLoginPage = location.pathname === '/login'
  const isStudentPage = location.pathname.startsWith('/student')
  const isLecturerDashboard = location.pathname === '/lecturer/dashboard'
  const isLecturerPortal = location.pathname.startsWith('/lecturer/portal')
  const isAdminPortal = location.pathname.startsWith('/admin/portal')
  const isAcademicPortal = location.pathname.startsWith('/academic')
  const isRectorPortal = location.pathname.startsWith('/rector')

  // Setup FCM notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Expose notificationService to global scope for debugging
      window.notificationService = notificationService
      
      // Only setup notifications for logged-in users
      if (!user || !user.id) return

      // Check if browser supports notifications
      if (!notificationService.isNotificationSupported()) {
        console.log('Notifications not supported in this browser')
        return
      }

      // Auto-request permission if not already set
      if (Notification.permission === 'default') {
        await notificationService.requestPermission()
      } else if (Notification.permission === 'granted') {
        // Get FCM token if permission already granted
        await notificationService.getFCMToken()
      }

      // Setup foreground message listener (when user is online)
      notificationService.setupForegroundListener((notification) => {
        console.log('📩 Received notification:', notification)
        
        // Show toast notification
        setNotificationData(notification)
        setShowNotificationToast(true)
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotificationToast(false)
        }, 5000)
      })
    }

    initializeNotifications()

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
  }, [])

  const handleNotificationClick = () => {
    setShowNotificationToast(false)
    
    // Navigate based on notification type
    if (notificationData?.data?.type === 'APPROVAL_REQUEST' && notificationData?.data?.syllabusId) {
      window.location.href = `/academic/approval?syllabusId=${notificationData.data.syllabusId}`
    } else if (notificationData?.data?.type === 'NEW_SYLLABUS' && notificationData?.data?.syllabusId) {
      window.location.href = `/public/syllabus/${notificationData.data.syllabusId}`
    } else if (notificationData?.data?.syllabusId) {
      window.location.href = `/public/syllabus/${notificationData.data.syllabusId}`
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isLoginPage && !isStudentPage && !isLecturerDashboard && !isLecturerPortal && !isAdminPortal && !isAcademicPortal && !isRectorPortal && <Header />}

      {/* Notification Toast */}
      {showNotificationToast && notificationData && (
        <div 
          className="fixed top-20 right-4 z-50 bg-white shadow-2xl rounded-xl p-4 max-w-sm cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-600 animate-slide-in"
          onClick={handleNotificationClick}
        >
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{notificationData.title}</h4>
              <p className="text-sm text-gray-600">{notificationData.body}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowNotificationToast(false)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<Navigate to="/public/search" replace />} />
          <Route path="/syllabus/:id" element={<SyllabusDetailPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/followed" element={<FollowedSyllabuses />} />
          <Route path="/student/syllabus/:id" element={<StudentSyllabusDetailPage />} />
          
          <Route path="/lecturer/dashboard" element={<LecturerPortalLayout />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/hod/dashboard"
            element={
              <RequireRole allowedRoles={['ROLE_HOD', 'ROLE_ADMIN', 'ROLE_RECTOR']}>
                <HODDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/academic/dashboard"
            element={
              <RequireRole allowedRoles={['ROLE_ACADEMIC_AFFAIRS', 'ROLE_RECTOR']}>
                <AcademicDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/rector/dashboard"
            element={
              <RequireRole allowedRoles={['ROLE_RECTOR', 'ROLE_ADMIN']}>
                <RectorDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/academic/programs"
            element={
              <RequireRole allowedRoles={['ROLE_ACADEMIC_AFFAIRS', 'ROLE_ADMIN']}>
                <ProgramManagement />
              </RequireRole>
            }
          />
          
          {/* Public Portal Routes */}
          <Route path="/public/search" element={<PublicSyllabusSearchPage />} />
          <Route path="/public/syllabus/:id" element={<PublicSyllabusDetailPage />} />
          
          {/* Lecturer Portal Routes */}
          <Route path="/lecturer/portal" element={<LecturerPortalGuide />} />
          <Route path="/lecturer/portal/syllabi" element={<SyllabusListPage />} />
          <Route path="/lecturer/portal/syllabi/new" element={<SyllabusEditorPage />} />
          <Route path="/lecturer/portal/syllabi/:id" element={<SyllabusEditorPage />} />
          <Route path="/lecturer/portal/syllabi/:rootId/compare" element={<SyllabusComparePage />} />
          
          {/* Admin Portal Routes */}
          <Route path="/admin/portal" element={<AdminPortalGuide />} />
          <Route path="/admin/portal/:section" element={<AdminPortalLayout />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isLoginPage && !isStudentPage && !isLecturerDashboard && !isLecturerPortal && !isAdminPortal && !isAcademicPortal && !isRectorPortal && <Footer />}
    </div>
  )
}

export default App
