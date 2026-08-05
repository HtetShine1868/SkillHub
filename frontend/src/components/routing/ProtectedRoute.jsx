import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {

    const { isAuthenticated, loading } = useAuth()

    // Show nothing while checking auth status (cookie → /api/auth/me)
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner" />
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}