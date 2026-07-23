import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT token ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ee_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: global error handling ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (!error.response) {
      // Network / timeout / CORS error — no HTTP response at all
      toast.error('Network error. Please check your connection and try again.')
      return Promise.reject(error)
    }

    switch (status) {
      case 401:
        // Clear stored credentials and fire a custom event so AuthContext
        // can react without a hard page reload. Components that care can
        // listen to window 'auth:logout'. Fall back to redirect if no
        // listener picks it up within the same tick.
        localStorage.removeItem('ee_token')
        localStorage.removeItem('ee_user')
        window.dispatchEvent(new Event('auth:logout'))
        // Only redirect if we are not already on /login
        if (!window.location.pathname.startsWith('/login')) {
          toast.error('Your session has expired. Please sign in again.')
          window.location.replace('/login')
        }
        break

      case 403:
        toast.error("You don't have permission to perform this action.")
        break

      case 404:
        // API resource not found — do NOT navigate; let the UI handle it
        toast.error('The requested resource was not found.')
        break

      case 422:
        // Validation errors — usually handled by the calling component,
        // but provide a fallback toast just in case
        toast.error(error.response?.data?.message || 'Validation error. Please check your inputs.')
        break

      case 429:
        toast.error('Too many requests. Please slow down and try again shortly.')
        break

      case 500:
      case 502:
      case 503:
      case 504:
        toast.error('Server error. Please try again later.')
        break

      default:
        toast.error(error.response?.data?.message || 'An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

export default api
