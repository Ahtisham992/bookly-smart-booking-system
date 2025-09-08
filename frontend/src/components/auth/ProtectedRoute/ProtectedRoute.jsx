// src/components/auth/ProtectedRoute/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext/AuthContext'
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to unauthorized page or dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute