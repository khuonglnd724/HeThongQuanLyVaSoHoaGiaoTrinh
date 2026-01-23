// API Client Configuration
import axios from 'axios'

// Use empty baseURL so service calls like '/api/auth/login' work with setupProxy
// setupProxy.js handles proxying /api/* to http://localhost:8080 (API Gateway)
const API_BASE_URL = ''

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // Do not set a global Content-Type here so FormData requests
  // can let axios set the proper multipart boundary header.
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // DEV: log whether Authorization header will be attached
    if (process.env.NODE_ENV === 'development') {
      try {
        const preview = token ? token.slice(0, 12) + '...' : null
        console.debug('[apiClient] Attaching token present:', !!token, 'tokenPreview:', preview)
        console.debug('[apiClient] Request:', config.method, config.url)
        // If the request contains FormData, list keys
        if (config.data && typeof config.data === 'object' && config.data instanceof FormData) {
          for (const entry of config.data.entries()) {
            const val = entry[1] && entry[1].name ? `[File] ${entry[1].name}` : entry[1]
            console.debug('[apiClient] FormData entry:', entry[0], val)
          }
        }
      } catch (e) {
        console.debug('[apiClient] debug error', e)
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.debug('[apiClient] Response error', error.response?.status, error.response?.data)
    } catch (e) {
      console.debug('[apiClient] Response debug error', e)
    }
    // On 401: in development we avoid immediate logout/redirect so DevTools can capture Network
    if (error.response?.status === 401) {
      const suppress = localStorage.getItem('suppress401Logout') === 'true'
      if (process.env.NODE_ENV === 'development' || suppress) {
        console.debug('[apiClient] 401 received — development/suppress mode, not logging out automatically')
      } else {
        // Production behaviour: remove token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
