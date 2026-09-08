import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatNotifications } from '../context/ChatNotificationContext'
import './NavBar.css'

function NavDropdown({ title, items }) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)
    const location = useLocation()

    // Active state if current route matches any child item
    const isActive = items.some(item => {
        const [itemPath, itemSearch] = item.to.split('?')
        const currentSearch = location.search.replace('?', '')
        if (itemSearch) {
            return location.pathname === itemPath && currentSearch === itemSearch
        }
        return location.pathname === itemPath
    })

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [location.pathname])

    return (
        <li className="navbar__dropdown" ref={dropdownRef}>
            <button
                type="button"
                className={`navbar__dropdown-btn ${isActive ? 'active' : ''} ${open ? 'open' : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
            >
                <span>{title}</span>
                <span className={`navbar__arrow ${open ? 'open' : ''}`}>▾</span>
            </button>
            {open && (
                <ul className="navbar__dropdown-menu">
                    {items.map(item => (
                        <li key={item.to}>
                            <NavLink to={item.to} end={item.end}>
                                {item.icon && <span className="navbar__dropdown-icon">{item.icon}</span>}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    )
}

export default function NavBar() {
    const { user, isAuthenticated, logout } = useAuth()
    const { unreadCount } = useChatNotifications()
    const navigate = useNavigate()
    const isAdmin = user?.role === 'ROLE_ADMIN'

    const isInstructor = user?.role === 'ROLE_INSTRUCTOR'

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
                    <li><NavLink to="/admin" end>Dashboard</NavLink></li>
                    <NavDropdown
                        title="Career & Skill"
                        items={[
                            { to: '/admin/careers', label: 'Careers', icon: '🎯' },
                            { to: '/admin/skills', label: 'Skills', icon: '⚡' },
                            { to: '/admin/career-skills', label: 'Career Skills', icon: '🔗' },
                        ]}
                    />
                    <NavDropdown
                        title="Career & Assessment Qs"
                        items={[
                            { to: '/admin/discovery', label: 'Discovery Qs', icon: '🔍' },
                            { to: '/admin/assessment', label: 'Assessment Qs', icon: '📝' },
                        ]}
                    />
                    <NavDropdown
                        title="Courses & Certs"
                        items={[
                            { to: '/admin/courses', label: 'Courses & Lessons', icon: '📚' },
                            { to: '/admin/certificates', label: 'Certificates', icon: '🏆' },
                        ]}
                    />
                    <li><NavLink to="/admin/skill-exchange">Skill Exchange</NavLink></li>
                </ul>
                <div className="navbar__user">
                    <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                    <span className="navbar__username">{user?.name}</span>
                    <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
                </div>
            </nav>
        )
    }

    // Instructor navbar
    if (isInstructor) {
        return (
            <nav className="navbar">
                <Link to="/instructor/dashboard" className="navbar__logo">SkillHub <span className="navbar__role-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>Instructor</span></Link>
                <ul className="navbar__links">
                    <li><NavLink to="/instructor/dashboard" end>Dashboard</NavLink></li>
                    <li><NavLink to="/instructor/courses/create">+ Create Course</NavLink></li>
                    <li><NavLink to="/courses">Explore Catalog</NavLink></li>
                    <li><NavLink to="/skill-exchange">Skill Exchange</NavLink></li>
                    <li className="navbar__msg-link">
                        <NavLink to="/instructor/dashboard?tab=messages">
                            Messages
                            {unreadCount > 0 && <span className="navbar__msg-badge">{unreadCount}</span>}
                        </NavLink>
                    </li>
                </ul>
                <div className="navbar__user">
                    <Link to="/profile" className="navbar__profile-link" title="View Profile">
                        <div className="navbar__avatar" style={{ background: 'linear-gradient(135deg, #0284c7, #6366f1)' }}>{user?.name?.charAt(0)?.toUpperCase()}</div>
                        <span className="navbar__username">{user?.name}</span>
                    </Link>
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
                <li><NavLink to="/onboarding">Career</NavLink></li>
                <NavDropdown
                    title="My Learning"
                    items={[
                        { to: '/my-learning', label: 'My Courses', icon: '📚', end: true },
                        { to: '/my-learning?tab=roadmap', label: 'My Roadmap', icon: '🗺️' },
                        { to: '/my-learning?filter=completed', label: 'Completed', icon: '✅' },
                        { to: '/my-certificates', label: 'Certificates', icon: '🏆' },
                    ]}
                />
                <li><NavLink to="/courses">Courses</NavLink></li>
                <li><NavLink to="/skill-exchange">Skill Exchange</NavLink></li>
                <li className="navbar__msg-link">
                    <NavLink to="/chat">
                        Messages
                        {unreadCount > 0 && <span className="navbar__msg-badge">{unreadCount}</span>}
                    </NavLink>
                </li>
            </ul>
            <div className="navbar__user">
                <Link to="/profile" className="navbar__profile-link" title="View Profile">
                    <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                    <span className="navbar__username">{user?.name}</span>
                </Link>
                <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
            </div>
        </nav>
    )
}

