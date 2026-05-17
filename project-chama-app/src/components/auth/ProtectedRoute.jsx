// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="splash">
      <div className="splash-logo">🌿</div>
      <div className="spinner" />
      <p>Loading Chama...</p>
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// src/components/auth/AdminRoute.jsx
export const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}
