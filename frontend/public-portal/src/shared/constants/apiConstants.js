// API Endpoints Constants
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  VERIFY: '/api/auth/verify',
  REFRESH: '/api/auth/refresh',
  
  // Syllabi
  SYLLABI: '/api/public/syllabi',
  SYLLABI_SEARCH: '/api/public/syllabi/search',
  SYLLABI_DETAIL: '/api/public/syllabi/:id',
  SYLLABI_BY_LECTURER: '/api/lecturer/syllabi',
  SYLLABI_CREATE: '/api/lecturer/syllabi',
  SYLLABI_UPDATE: '/api/lecturer/syllabi/:id',
  
  // Users
  USERS: '/api/admin/users',
  USER_PROFILE: '/api/user/profile',
  UPDATE_PROFILE: '/api/user/profile',
  
  // Admin
  STATS: '/api/admin/stats',
  LOGS: '/api/admin/logs',
  PERMISSIONS: '/api/admin/permissions',
  
  // Public
  PUBLIC_LANDING: '/api/public/landing',
  PUBLIC_STATS: '/api/public/stats',
  
  // User actions
  CHANGE_PASSWORD: '/api/user/change-password',
  UPLOAD_AVATAR: '/api/user/avatar',
}

export const ROLES = {
  STUDENT: 'STUDENT',
  LECTURER: 'LECTURER',
  ADMIN: 'ADMIN',
  HOD: 'HOD',
  RECTOR: 'RECTOR',
  ACADEMIC_AFFAIRS: 'ACADEMIC_AFFAIRS',
}

export const PERMISSIONS = {
  CAN_SEARCH: 'canSearch',
  CAN_VIEW_OWN: 'canViewOwn',
  CAN_VIEW_ALL: 'canViewAll',
  CAN_CREATE: 'canCreate',
  CAN_EDIT: 'canEdit',
  CAN_DELETE: 'canDelete',
  CAN_APPROVE: 'canApprove',
  CAN_MANAGE_USERS: 'canManageUsers',
}
