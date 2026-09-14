import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatNotifications } from '../context/ChatNotificationContext'
import NotificationBell from './NotificationBell'
import './NavBar.css'

function isDesktopNav() {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches
}

function BrandLogo({ to, badge, badgeClass = '' }) {
    return (
        <Link to={to} className="navbar__logo">
            <span className="navbar__logo-mark" aria-hidden="true">S</span>
            <span className="navbar__logo-text">SkillHub</span>
            {badge && (
                <span className={`navbar__role-badge ${badgeClass}`.trim()}>{badge}</span>
            )}
        </Link>
    )
}

function NavItem({ to, end, icon, children, className = '' }) {
    return (
        <li className={className}>
            <NavLink to={to} end={end} title={typeof children === 'string' ? children : undefined}>
                {icon && <span className="navbar__icon" aria-hidden="true">{icon}</span>}
                <span className="navbar__link-label">{children}</span>
            </NavLink>
        </li>
    )
}

function NavDropdown({ title, icon, items }) {
    const [open, setOpen] = useState(false)
    const [menuPos, setMenuPos] = useState(null)
    const [flyout, setFlyout] = useState(() => isDesktopNav())
    const dropdownRef = useRef(null)
    const menuRef = useRef(null)
    const location = useLocation()

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
            const inTrigger = dropdownRef.current?.contains(e.target)
            const inMenu = menuRef.current?.contains(e.target)
            if (!inTrigger && !inMenu) setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [location.pathname])

    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    useEffect(() => {
        if (!open || !dropdownRef.current) {
            setMenuPos(null)
            return
        }

        const place = () => {
            const desktop = isDesktopNav()
            setFlyout(desktop)
            if (!desktop) {
                setMenuPos(null)
                return
            }
            const btn = dropdownRef.current.querySelector('.navbar__dropdown-btn')
            const rect = (btn || dropdownRef.current).getBoundingClientRect()
            const menuWidth = menuRef.current?.offsetWidth || 210
            let left = rect.right - menuWidth
            if (left < 12) left = 12
            if (left + menuWidth > window.innerWidth - 12) {
                left = Math.max(12, window.innerWidth - menuWidth - 12)
            }
            setMenuPos({ top: rect.bottom + 8, left })
        }

        place()
        window.addEventListener('resize', place)
        window.addEventListener('scroll', place, true)
        return () => {
            window.removeEventListener('resize', place)
            window.removeEventListener('scroll', place, true)
        }
    }, [open])

    const menu = open && (
        <ul
            ref={menuRef}
            className={`navbar__dropdown-menu${flyout ? ' navbar__dropdown-menu--flyout' : ''}`}
            style={menuPos ? { top: menuPos.top, left: menuPos.left } : undefined}
        >
            {items.map(item => (
                <li key={item.to}>
                    <NavLink to={item.to} end={item.end}>
                        {item.icon && <span className="navbar__dropdown-icon">{item.icon}</span>}
                        <span>{item.label}</span>
                    </NavLink>
                </li>
            ))}
        </ul>
    )

    return (
        <li className="navbar__dropdown" ref={dropdownRef}>
            <button
                type="button"
                className={`navbar__dropdown-btn ${isActive ? 'active' : ''} ${open ? 'open' : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                aria-haspopup="true"
                title={title}
            >
                {icon && <span className="navbar__icon" aria-hidden="true">{icon}</span>}
                <span className="navbar__link-label">{title}</span>
                <span className={`navbar__arrow ${open ? 'open' : ''}`}>▾</span>
            </button>
            {flyout && menu && typeof document !== 'undefined'
                ? createPortal(menu, document.body)
                : menu}
        </li>
    )
}

function NavShell({ logo, links, mobileLinks, userSection, toolbar, compact = false }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname, location.search])

    useEffect(() => {
        document.body.classList.toggle('navbar-lock', menuOpen)
        return () => document.body.classList.remove('navbar-lock')
    }, [menuOpen])

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    return (
        <nav className={`navbar${menuOpen ? ' navbar--menu-open' : ''}${compact ? ' navbar--compact' : ''}${mobileLinks ? ' navbar--split-links' : ''}`}>
            {logo}
            {menuOpen && (
                <button
                    type="button"
                    className="navbar__backdrop"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                />
            )}
            <div className="navbar__drawer">
                {mobileLinks ? (
                    <>
                        <div className="navbar__links-wrap navbar__links-wrap--desktop">{links}</div>
                        <div className="navbar__links-wrap navbar__links-wrap--mobile">{mobileLinks}</div>
                    </>
                ) : (
                    <div className="navbar__links-wrap">{links}</div>
                )}
                {userSection}
            </div>
            {!compact && (
                <div className="navbar__end">
                    {toolbar}
                    <button
                        type="button"
                        className="navbar__toggle"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            )}
        </nav>
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

    if (!isAuthenticated) {
        return (
            <NavShell
                compact
                logo={<BrandLogo to="/" />}
                links={
                    <ul className="navbar__links">
                        <NavItem to="/login">Sign In</NavItem>
                        <li>
                            <NavLink to="/register" className="navbar__cta">Get Started</NavLink>
                        </li>
                    </ul>
                }
            />
        )
    }

    if (isAdmin) {
        const adminMobileLinks = (
            <ul className="navbar__links">
                <NavItem to="/admin" end icon="📊">Dashboard</NavItem>
                <NavItem to="/admin/users" icon="👥">Users & Instructors</NavItem>
                <NavDropdown
                    title="Career & Skill"
                    icon="🎯"
                    items={[
                        { to: '/admin/careers', label: 'Careers', icon: '🎯' },
                        { to: '/admin/skills', label: 'Skills', icon: '⚡' },
                        { to: '/admin/career-skills', label: 'Career Skills', icon: '🔗' },
                    ]}
                />
                <NavDropdown
                    title="Questions"
                    icon="📝"
                    items={[
                        { to: '/admin/discovery', label: 'Discovery Qs', icon: '🔍' },
                        { to: '/admin/assessment', label: 'Assessment Qs', icon: '📝' },
                    ]}
                />
                <NavDropdown
                    title="Courses"
                    icon="📚"
                    items={[
                        { to: '/admin/courses', label: 'Courses & Lessons', icon: '📚' },
                        { to: '/admin/reviews', label: 'Course Reviews', icon: '⭐' },
                    ]}
                />
                <NavItem to="/admin/certificates" icon="🏆">Certificates</NavItem>
                <li className="navbar__msg-link">
                    <NavLink to="/admin/messages" title="Messages">
                        <span className="navbar__icon" aria-hidden="true">💬</span>
                        <span className="navbar__link-label">Messages</span>
                        {unreadCount > 0 && <span className="navbar__msg-badge">{unreadCount}</span>}
                    </NavLink>
                </li>
                <NavItem to="/admin/skill-exchange" icon="🤝">Skill Exchange</NavItem>
            </ul>
        )

        return (
            <NavShell
                logo={<BrandLogo to="/admin" badge="Admin" />}
                links={
                    <ul className="navbar__links">
                        <NavItem to="/admin" end icon="📊">Dashboard</NavItem>
                        <li className="navbar__msg-link">
                            <NavLink to="/admin/messages" title="Messages">
                                <span className="navbar__icon" aria-hidden="true">💬</span>
                                <span className="navbar__link-label">Messages</span>
                                {unreadCount > 0 && <span className="navbar__msg-badge">{unreadCount}</span>}
                            </NavLink>
                        </li>
                    </ul>
                }
                mobileLinks={adminMobileLinks}
                toolbar={<NotificationBell />}
                userSection={
                    <div className="navbar__user">
                        <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                        <span className="navbar__username">{user?.name}</span>
                        <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
                    </div>
                }
            />
        )
    }

    if (isInstructor) {
        return (
            <NavShell
                logo={<BrandLogo to="/instructor/dashboard" badge="Instructor" badgeClass="navbar__role-badge--instructor" />}
                links={
                    <ul className="navbar__links">
                        <NavItem to="/instructor/dashboard" end icon="📊">Dashboard</NavItem>
                        <NavItem to="/instructor/courses/create" icon="＋">Create Course</NavItem>
                        <NavItem to="/courses" icon="📚">Explore Catalog</NavItem>
                        <NavItem to="/skill-exchange" icon="🤝">Skill Exchange</NavItem>
                        <li className="navbar__msg-link">
                            <NavLink to="/instructor/dashboard?tab=messages" title="Messages">
                                <span className="navbar__icon" aria-hidden="true">💬</span>
                                <span className="navbar__link-label">Messages</span>
                                {unreadCount > 0 && <span className="navbar__msg-badge">{unreadCount}</span>}
                            </NavLink>
                        </li>
                    </ul>
                }
                toolbar={<NotificationBell />}
                userSection={
                    <div className="navbar__user">
                        <Link to="/profile" className="navbar__profile-link" title="View Profile">
                            <div className="navbar__avatar navbar__avatar--instructor">{user?.name?.charAt(0)?.toUpperCase()}</div>
                            <span className="navbar__username">{user?.name}</span>
                        </Link>
                        <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
                    </div>
                }
            />
        )
    }

    return (
        <NavShell
            logo={<BrandLogo to="/dashboard" />}
            links={
                <ul className="navbar__links">
                    <NavItem to="/dashboard" icon="🏠">Dashboard</NavItem>
                    <NavItem to="/onboarding" icon="🎯">Career</NavItem>
                    <NavDropdown
                        title="My Learning"
                        icon="📖"
                        items={[
                            { to: '/my-learning', label: 'My Courses', icon: '📚', end: true },
                            { to: '/my-learning?tab=roadmap', label: 'My Roadmap', icon: '🗺️' },
                            { to: '/my-learning?filter=completed', label: 'Completed', icon: '✅' },
                            { to: '/my-certificates', label: 'Certificates', icon: '🏆' },
                        ]}
                    />
                    <NavItem to="/courses" icon="📚">Courses</NavItem>
                    <NavItem to="/skill-exchange" icon="🤝">Skill Exchange</NavItem>
                    <li className="navbar__msg-link">
                        <NavLink to="/chat" title="Messages">
                            <span className="navbar__icon" aria-hidden="true">💬</span>
                            <span className="navbar__link-label">Messages</span>
                            {unreadCount > 0 && <span className="navbar__msg-badge">{unreadCount}</span>}
                        </NavLink>
                    </li>
                </ul>
            }
            toolbar={<NotificationBell />}
            userSection={
                <div className="navbar__user">
                    <Link to="/profile" className="navbar__profile-link" title="View Profile">
                        <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                        <span className="navbar__username">{user?.name}</span>
                    </Link>
                    <button className="navbar__logout" onClick={handleLogout}>Sign Out</button>
                </div>
            }
        />
    )
}
