// useUser Hook - Manage user data
import { useState, useCallback } from 'react'

export const useUser = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const updateUser = useCallback((newUser) => {
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }, [])

  return { user, updateUser, clearUser }
}
