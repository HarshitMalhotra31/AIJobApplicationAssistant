import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { SpinnerIcon } from './Icons'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <SpinnerIcon className="w-8 h-8 text-blue-400 mb-3" />
        <p className="text-xs">Authenticating session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
