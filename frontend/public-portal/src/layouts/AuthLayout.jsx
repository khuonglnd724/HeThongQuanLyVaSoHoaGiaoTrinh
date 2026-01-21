// Auth Layout - Layout for authentication pages
import React from 'react'

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

export default AuthLayout
