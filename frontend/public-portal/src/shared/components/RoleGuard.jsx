import React from 'react'
import { hasPermission, ROLES } from '../config/roleConfig'

/**
 * RoleGuard Component
 * Protects routes based on user role and permissions
 * 
 * Usage:
 * <RoleGuard 
 *   requiredRoles={['ROLE_LECTURER', 'ROLE_ADMIN']}
 *   fallback={<AccessDenied />}
 * >
 *   <ProtectedComponent />
 * </RoleGuard>
 */
export const RoleGuard = ({ 
  children, 
  requiredRoles = [], 
  requiredPermission = null,
  fallback = null,
  user = null 
}) => {
  // Get user from localStorage if not provided
  const currentUser = user || (() => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  })()

  // Not logged in
  if (!currentUser) {
    return fallback || (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold">Vui lòng đăng nhập để tiếp tục</p>
      </div>
    )
  }

  // Check role
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
    return fallback || <AccessDenied role={currentUser.role} />
  }

  // Check permission
  if (requiredPermission && !hasPermission(currentUser.role, requiredPermission)) {
    return fallback || <AccessDenied permission={requiredPermission} />
  }

  return children
}

/**
 * PermissionCheck Component
 * Conditionally render content based on permissions
 * 
 * Usage:
 * <PermissionCheck permission="canManageSyllabi" user={user}>
 *   <EditButton />
 * </PermissionCheck>
 */
export const PermissionCheck = ({ 
  children, 
  permission, 
  user = null 
}) => {
  const currentUser = user || (() => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  })()

  if (!currentUser) return null

  if (hasPermission(currentUser.role, permission)) {
    return children
  }

  return null
}

/**
 * RoleCheck Component
 * Conditionally render content based on role
 * 
 * Usage:
 * <RoleCheck roles={['ROLE_LECTURER']} user={user}>
 *   <LecturerSpecificContent />
 * </RoleCheck>
 */
export const RoleCheck = ({ 
  children, 
  roles = [], 
  user = null 
}) => {
  const currentUser = user || (() => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  })()

  if (!currentUser) return null

  if (roles.includes(currentUser.role)) {
    return children
  }

  return null
}

/**
 * Access Denied Component
 */
const AccessDenied = ({ role = null, permission = null }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Quyền Truy Cập Bị Từ Chối</h1>
      
      <p className="text-gray-600 mb-6">
        {permission 
          ? `Bạn không có quyền: ${permission}`
          : role 
          ? `Tài khoản ${role} không có quyền truy cập trang này`
          : 'Bạn không có quyền truy cập trang này'}
      </p>
      
      <p className="text-sm text-gray-500 mb-6">
        Nếu bạn tin rằng đây là một lỗi, vui lòng liên hệ với quản trị viên hệ thống.
      </p>
      
      <a 
        href="/" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
      >
        Quay Lại Trang Chủ
      </a>
    </div>
  </div>
)

/**
 * withRoleGuard HOC
 * Higher Order Component to protect components
 * 
 * Usage:
 * export default withRoleGuard(ProtectedComponent, ['ROLE_ADMIN'])
 */
export const withRoleGuard = (Component, requiredRoles = []) => {
  return (props) => (
    <RoleGuard requiredRoles={requiredRoles}>
      <Component {...props} />
    </RoleGuard>
  )
}

/**
 * useRoleGuard Hook
 * Custom hook for role checks
 * 
 * Usage:
 * const { user, hasRole, hasPermission } = useRoleGuard()
 */
export const useRoleGuard = () => {
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }
  }, [])

  const hasRole = (role) => user && user.role === role
  const hasAnyRole = (roles) => user && roles.includes(user.role)
  const hasPermissionCheck = (permission) => user && hasPermission(user.role, permission)

  return {
    user,
    hasRole,
    hasAnyRole,
    hasPermission: hasPermissionCheck,
    isLoggedIn: !!user,
  }
}

export default {
  RoleGuard,
  PermissionCheck,
  RoleCheck,
  withRoleGuard,
  useRoleGuard,
}
