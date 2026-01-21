/**
 * Portal Configuration
 * Định nghĩa các portal, port và điều hướng dựa trên role
 */

export const PORTALS = {
  PUBLIC: {
    name: 'Public Portal',
    url: 'http://localhost:3001',
    port: 3001,
    roles: ['PUBLIC', 'ROLE_STUDENT'],
    description: 'Trang chính, Landing page, Tìm kiếm công khai'
  },
  LECTURER: {
    name: 'Lecturer Portal - Syllabus Builder',
    url: 'http://localhost:3002',
    port: 3002,
    roles: ['ROLE_LECTURER'],
    description: 'Xây dựng & quản lý giáo trình'
  },
  ADMIN: {
    name: 'Admin Portal',
    url: 'http://localhost:3005',
    port: 3005,
    roles: ['ROLE_HOD', 'ROLE_RECTOR'],
    description: 'Quản lý giáo trình, phê duyệt, báo cáo'
  },
  ACADEMIC: {
    name: 'Academic Portal',
    url: 'http://localhost:3003',
    port: 3003,
    roles: ['ROLE_ACADEMIC_AFFAIRS'],
    description: 'Quản lý chương trình đào tạo, phân tích CLO-PLO'
  },
  ADMIN_SYSTEM: {
    name: 'Admin System',
    url: 'http://localhost:3004',
    port: 3004,
    roles: ['ROLE_ADMIN'],
    description: 'Quản lý người dùng, phân quyền, cài đặt hệ thống'
  }
}

/**
 * Lấy portal dựa trên role
 */
export const getPortalByRole = (role) => {
  switch(role) {
    case 'ROLE_STUDENT':
      return PORTALS.PUBLIC
    case 'ROLE_LECTURER':
      return PORTALS.LECTURER
    case 'ROLE_HOD':
    case 'ROLE_RECTOR':
      return PORTALS.ADMIN
    case 'ROLE_ACADEMIC_AFFAIRS':
      return PORTALS.ACADEMIC
    case 'ROLE_ADMIN':
      return PORTALS.ADMIN_SYSTEM
    default:
      return PORTALS.PUBLIC
  }
}

/**
 * Lấy URL redirect dựa trên role
 */
export const getRedirectUrlByRole = (role) => {
  const portal = getPortalByRole(role)
  return portal.url
}

/**
 * Role Display Names
 */
export const ROLE_DISPLAY_NAMES = {
  'ROLE_STUDENT': '📚 Sinh viên',
  'ROLE_LECTURER': '👨‍🏫 Giảng viên',
  'ROLE_HOD': '👔 Trưởng khoa',
  'ROLE_ACADEMIC_AFFAIRS': '🎓 Phòng Đào tạo',
  'ROLE_RECTOR': '🏆 Hiệu trưởng',
  'ROLE_ADMIN': '🔐 Quản trị viên'
}

/**
 * Demo Accounts
 */
export const DEMO_ACCOUNTS = [
  {
    email: 'student@smd.edu.vn',
    password: 'Student@123',
    role: 'ROLE_STUDENT',
    name: 'Sinh viên'
  },
  {
    email: 'lecturer@smd.edu.vn',
    password: 'Lecturer@123',
    role: 'ROLE_LECTURER',
    name: 'Giảng viên'
  },
  {
    email: 'hod@smd.edu.vn',
    password: 'HOD@123',
    role: 'ROLE_HOD',
    name: 'Trưởng khoa'
  },
  {
    email: 'academic@smd.edu.vn',
    password: 'Academic@123',
    role: 'ROLE_ACADEMIC_AFFAIRS',
    name: 'Phòng Đào tạo'
  },
  {
    email: 'rector@smd.edu.vn',
    password: 'Rector@123',
    role: 'ROLE_RECTOR',
    name: 'Hiệu trưởng'
  },
  {
    email: 'admin@smd.edu.vn',
    password: 'Admin@123',
    role: 'ROLE_ADMIN',
    name: 'Quản trị viên'
  }
]

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH_LOGIN: 'http://localhost:8080/api/auth/login',
  PUBLIC_SEARCH: 'http://localhost:8080/api/public/syllabi/search',
  USER_PROFILE: 'http://localhost:8080/api/auth/profile',
  LOGOUT: 'http://localhost:8080/api/auth/logout'
}

export default {
  PORTALS,
  getPortalByRole,
  getRedirectUrlByRole,
  ROLE_DISPLAY_NAMES,
  DEMO_ACCOUNTS,
  API_ENDPOINTS
}
