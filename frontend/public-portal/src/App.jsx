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

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="flex flex-col min-h-screen">
      {!isLoginPage && <Header />}

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
          <Route path="/academic/dashboard" element={<AcademicDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isLoginPage && <Footer />}
    </div>
  )
}

export default App
