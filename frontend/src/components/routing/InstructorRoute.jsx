import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function InstructorRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner" />
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />
    if (user.role !== 'ROLE_INSTRUCTOR' && user.role !== 'ROLE_ADMIN') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}
