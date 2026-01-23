import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Header, Footer } from './shared/components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import SyllabusDetailPage from './pages/SyllabusDetailPage'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import LecturerDashboard from './pages/LecturerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AcademicDashboard from './modules/academic/pages/AcademicDashboard'
import HODDashboard from './modules/academic/pages/HODDashboard'
import ProgramManagement from './modules/academic/pages/ProgramManagement'
import SyllabusListPage from './modules/lecturer/pages/SyllabusListPage'
import SyllabusEditorPage from './modules/lecturer/pages/SyllabusEditorPage'
import SyllabusComparePage from './modules/lecturer/pages/SyllabusComparePage'
import LecturerPortalGuide from './modules/lecturer/pages/LecturerPortalGuide'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isLecturerPortal = location.pathname.startsWith('/lecturer/portal')

  return (
    <div className="flex flex-col min-h-screen">
      {!isLoginPage && !isLecturerPortal && <Header />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/syllabus/:id" element={<SyllabusDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/hod/dashboard" element={<HODDashboard />} />
          <Route path="/academic/dashboard" element={<AcademicDashboard />} />
          <Route path="/academic/programs" element={<ProgramManagement />} />
          
          {/* Lecturer Portal Routes */}
          <Route path="/lecturer/portal" element={<LecturerPortalGuide />} />
          <Route path="/lecturer/portal/syllabi" element={<SyllabusListPage />} />
          <Route path="/lecturer/portal/syllabi/new" element={<SyllabusEditorPage />} />
          <Route path="/lecturer/portal/syllabi/:id" element={<SyllabusEditorPage />} />
          <Route path="/lecturer/portal/syllabi/:rootId/compare" element={<SyllabusComparePage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isLoginPage && !isLecturerPortal && <Footer />}
    </div>
  )
}

export default App
