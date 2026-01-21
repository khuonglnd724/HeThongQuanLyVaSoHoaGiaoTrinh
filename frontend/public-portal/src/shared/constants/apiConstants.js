// API Endpoints Constants
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify',
  REFRESH: '/auth/refresh',
  
  // Syllabi
  SYLLABI: '/public/syllabi',
  SYLLABI_SEARCH: '/public/syllabi/search',
  SYLLABI_DETAIL: '/public/syllabi/:id',
  SYLLABI_BY_LECTURER: '/lecturer/syllabi',
  SYLLABI_CREATE: '/lecturer/syllabi',
  SYLLABI_UPDATE: '/lecturer/syllabi/:id',
  
  // Users
  USERS: '/admin/users',
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  
  // Admin
  STATS: '/admin/stats',
  LOGS: '/admin/logs',
  PERMISSIONS: '/admin/permissions',
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
