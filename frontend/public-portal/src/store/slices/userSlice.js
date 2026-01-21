// User Slice - Manage user state
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: null,
  role: localStorage.getItem('role') || null,
  permissions: [],
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload
      state.role = action.payload.role
      localStorage.setItem('role', action.payload.role)
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload
    },
    clearProfile: (state) => {
      state.profile = null
      state.role = null
      state.permissions = []
      localStorage.removeItem('role')
    },
  },
})

export const { setProfile, setPermissions, clearProfile } = userSlice.actions
export default userSlice.reducer
