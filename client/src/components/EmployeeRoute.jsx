import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function EmployeeRoute({ children }) {
  const { isAuthenticated, isEmployee, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isEmployee && !isAdmin) return <Navigate to="/" replace />
  return children
}
