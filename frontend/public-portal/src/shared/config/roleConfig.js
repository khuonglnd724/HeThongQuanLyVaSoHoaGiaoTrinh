/**
 * Role-Based Configuration
 * Maps roles to their corresponding dashboard components and permissions
 */

import StudentDashboard from '../../modules/student/pages/StudentDashboard'
import LecturerDashboard from '../../modules/lecturer/pages/LecturerDashboard'
import AdminDashboard from '../../modules/admin/pages/AdminDashboard'
import AcademicDashboard from '../../modules/academic/pages/AcademicDashboard'

/**
 * Role definitions and their metadata
 */
export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  LECTURER: 'ROLE_LECTURER',
  ADMIN: 'ROLE_ADMIN',
  HOD: 'ROLE_HOD',
  RECTOR: 'ROLE_RECTOR',
  ACADEMIC_AFFAIRS: 'ROLE_ACADEMIC_AFFAIRS',
}

/**
 * Role display names (Vietnamese)
 */
export const ROLE_DISPLAY_NAMES = {
  [ROLES.STUDENT]: 'Sinh Viên',
  [ROLES.LECTURER]: 'Giảng Viên',
  [ROLES.ADMIN]: 'Quản Trị Viên',
  [ROLES.HOD]: 'Trưởng Bộ Môn',
  [ROLES.RECTOR]: 'Hiệu Trưởng',
  [ROLES.ACADEMIC_AFFAIRS]: 'Phòng Đào Tạo',
}

/**
 * Dashboard component mapping for each role
 */
export const ROLE_COMPONENTS = {
  [ROLES.STUDENT]: StudentDashboard,
  [ROLES.LECTURER]: LecturerDashboard,
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.HOD]: AdminDashboard,
  [ROLES.RECTOR]: AdminDashboard,
  [ROLES.ACADEMIC_AFFAIRS]: AcademicDashboard,
}

/**
 * Get dashboard page for a role
 * @param {string} role - User role
 * @returns {string} Page name
 */
export const getDashboardPageByRole = (role) => {
  switch (role) {
    case ROLES.STUDENT:
      return 'student-dashboard'
    case ROLES.LECTURER:
      return 'lecturer-dashboard'
    case ROLES.ACADEMIC_AFFAIRS:
      return 'academic-dashboard'
    case ROLES.ADMIN:
    case ROLES.HOD:
    case ROLES.RECTOR:
      return 'admin-dashboard'
    default:
      return 'landing'
  }
}

/**
 * Get dashboard component for a role
 * @param {string} role - User role
 * @returns {React.Component} Component
 */
export const getDashboardComponentByRole = (role) => {
  return ROLE_COMPONENTS[role] || StudentDashboard
}

/**
 * Check if role has admin access
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isAdmin = (role) => {
  return [ROLES.ADMIN, ROLES.HOD, ROLES.RECTOR, ROLES.ACADEMIC_AFFAIRS].includes(role)
}

/**
 * Check if role has lecturer access
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isLecturer = (role) => {
  return role === ROLES.LECTURER
}

/**
 * Check if role has student access
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isStudent = (role) => {
  return role === ROLES.STUDENT
}

/**
 * Check if role can access public search
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canAccessPublicSearch = (role) => {
  return role === ROLES.STUDENT || role === undefined || role === null
}

/**
 * Check if role can manage syllabi
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canManageSyllabi = (role) => {
  return [ROLES.LECTURER, ROLES.ADMIN, ROLES.HOD, ROLES.RECTOR].includes(role)
}

/**
 * Check if role can manage users
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canManageUsers = (role) => {
  return [ROLES.ADMIN, ROLES.RECTOR].includes(role)
}

/**
 * Check if role can approve/review
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canApproveReview = (role) => {
  return [ROLES.ADMIN, ROLES.HOD, ROLES.RECTOR, ROLES.ACADEMIC_AFFAIRS].includes(role)
}

/**
 * Permissions map for role-based access control
 */
export const PERMISSIONS = {
  [ROLES.STUDENT]: {
    canSearch: true,
    canViewOwn: true,
    canDownload: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canManageUsers: false,
  },
  [ROLES.LECTURER]: {
    canSearch: true,
    canViewOwn: true,
    canDownload: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: false,
    canManageUsers: false,
  },
  [ROLES.ACADEMIC_AFFAIRS]: {
    canSearch: true,
    canViewAll: true,
    canDownload: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: true,
    canManageUsers: false,
  },
  [ROLES.ADMIN]: {
    canSearch: true,
    canViewAll: true,
    canDownload: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canManageUsers: true,
  },
  [ROLES.HOD]: {
    canSearch: true,
    canViewAll: true,
    canDownload: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canManageUsers: false,
  },
  [ROLES.RECTOR]: {
    canSearch: true,
    canViewAll: true,
    canDownload: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canManageUsers: true,
  },
}

/**
 * Get permissions for a role
 * @param {string} role - User role
 * @returns {Object} Permissions object
 */
export const getPermissions = (role) => {
  return PERMISSIONS[role] || PERMISSIONS[ROLES.STUDENT]
}

/**
 * Check if role has specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission key
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const perms = getPermissions(role)
  return perms[permission] || false
}

export default {
  ROLES,
  ROLE_DISPLAY_NAMES,
  ROLE_COMPONENTS,
  getDashboardPageByRole,
  getDashboardComponentByRole,
  isAdmin,
  isLecturer,
  isStudent,
  canAccessPublicSearch,
  canManageSyllabi,
  canManageUsers,
  canApproveReview,
  PERMISSIONS,
  getPermissions,
  hasPermission,
}
