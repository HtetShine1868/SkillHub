import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Bell, Menu, X } from 'lucide-react'
import MemberAvatar from './MemberAvatar'
import { MOCK_CURRENT_USER } from '../data/forumData'

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/courses', label: 'Courses' },
  { to: '/forum', label: 'Forum' },
  { to: '/forum/my-projects', label: 'My Projects' },
]

export default function ForumNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="forum-navbar">
      <div className="forum-navbar__inner">
        {/* Logo */}
        <Link to="/forum" className="forum-navbar__logo" aria-label="SkillHub home">
          <div className="forum-navbar__logo-mark">S</div>
          <span className="forum-navbar__logo-text">
            Skill<span>Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="forum-navbar__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `forum-navbar__link ${isActive ? 'active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="forum-navbar__actions">
          <button
            className="forum-navbar__icon-btn"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="forum-navbar__notif-dot" aria-hidden="true" />
          </button>

          <div
            className="forum-navbar__avatar"
            role="button"
            tabIndex={0}
            aria-label={`Profile: ${MOCK_CURRENT_USER.name}`}
            title={MOCK_CURRENT_USER.name}
          >
            {MOCK_CURRENT_USER.initials}
          </div>

          {/* Hamburger */}
          <button
            className="forum-navbar__hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <nav
        className={`forum-navbar__mobile-menu ${menuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `forum-navbar__link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
