// Route Configuration
// Centralized route management for all modules

import LandingPage from '../pages/LandingPage'
import HomePage from '../pages/HomePage'
import SearchPage from '../pages/SearchPage'
import SyllabusDetailPage from '../pages/SyllabusDetailPage'
import Login from '../pages/Login'
import StudentDashboard from '../pages/StudentDashboard'
import LecturerDashboard from '../pages/LecturerDashboard'
import AdminDashboard from '../pages/AdminDashboard'

export const PUBLIC_ROUTES = {
  LANDING: 'landing',
  HOME: 'home',
  SEARCH: 'search',
  SYLLABUS_DETAIL: 'syllabus-detail',
  LOGIN: 'login',
}

export const PROTECTED_ROUTES = {
  STUDENT_DASHBOARD: 'student-dashboard',
  LECTURER_DASHBOARD: 'lecturer-dashboard',
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_DASHBOARD_HOD: 'admin-dashboard-hod',
  ADMIN_DASHBOARD_RECTOR: 'admin-dashboard-rector',
  ADMIN_DASHBOARD_ACADEMIC: 'admin-dashboard-academic',
}

export const routeComponents = {
  [PUBLIC_ROUTES.LANDING]: LandingPage,
  [PUBLIC_ROUTES.HOME]: HomePage,
  [PUBLIC_ROUTES.SEARCH]: SearchPage,
  [PUBLIC_ROUTES.SYLLABUS_DETAIL]: SyllabusDetailPage,
  [PUBLIC_ROUTES.LOGIN]: Login,
  [PROTECTED_ROUTES.STUDENT_DASHBOARD]: StudentDashboard,
  [PROTECTED_ROUTES.LECTURER_DASHBOARD]: LecturerDashboard,
  [PROTECTED_ROUTES.ADMIN_DASHBOARD]: AdminDashboard,
  [PROTECTED_ROUTES.ADMIN_DASHBOARD_HOD]: AdminDashboard,
  [PROTECTED_ROUTES.ADMIN_DASHBOARD_RECTOR]: AdminDashboard,
  [PROTECTED_ROUTES.ADMIN_DASHBOARD_ACADEMIC]: AdminDashboard,
}

export const getComponentByRoute = (routeName) => {
  return routeComponents[routeName] || HomePage
}
