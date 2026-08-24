import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

export default function NavBar() {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const isAdmin = user?.role === 'ROLE_ADMIN'

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    // Guest — show only brand + Login/Register
    if (!isAuthenticated) {
        return (
            <nav className="navbar">
                <Link to="/" className="navbar__logo">SkillHub</Link>
                <ul className="navbar__links">
                    <li><NavLink to="/login">Sign In</NavLink></li>
                    <li><NavLink to="/register" className="navbar__cta">Get Started</NavLink></li>
                </ul>
            </nav>
        )
    }

    // Admin navbar
    if (isAdmin) {
        return (
            <nav className="navbar">
                <Link to="/admin" className="navbar__logo">SkillHub <span className="navbar__role-badge">Admin</span></Link>
                <ul className="navbar__links">
                    <li><NavLink to="/admin">Dashboard</NavLink></li>
                    <li><NavLink to="/admin/careers">Careers</NavLink></li>
                    <li><NavLink to="/admin/skills">Skills</NavLink></li>
                    <li><NavLink to="/admin/discovery">Discovery Qs</NavLink></li>
                    <li><NavLink to="/admin/assessment">Assessment Qs</NavLink></li>
                    <li><NavLink to="/admin/courses">Courses</NavLink></li>
                </ul>
                <div className="navbar__user">
                    <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                    <span className="navbar__username">{user?.name}</span>
                    <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
                </div>
            </nav>
        )
    }

    // Regular user navbar
    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar__logo">SkillHub</Link>
            <ul className="navbar__links">
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/onboarding">Find Career</NavLink></li>
                <li><NavLink to="/careers">Careers</NavLink></li>
                <li><NavLink to="/assessment">Assessment</NavLink></li>
                <li><NavLink to="/courses">Courses</NavLink></li>
                <li><NavLink to="/my-learning">My Learning</NavLink></li>
                <li><NavLink to="/roadmap">Roadmap</NavLink></li>
                <li><NavLink to="/forum">Forum</NavLink></li>
            </ul>
            <div className="navbar__user">
                <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                <span className="navbar__username">{user?.name}</span>
                <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
            </div>
        </nav>
    )
}
