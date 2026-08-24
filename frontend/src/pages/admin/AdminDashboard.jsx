import { NavLink, Outlet } from 'react-router-dom'
import './AdminDashboard.css'

const navItems = [
    { to: '/admin', label: 'Overview', icon: '📊', end: true },
    { section: 'Content' },
    { to: '/admin/careers', label: 'Careers', icon: '🎯' },
    { to: '/admin/skills', label: 'Skills', icon: '⚡' },
    { to: '/admin/career-skills', label: 'Career Skills', icon: '🔗' },
    { section: 'Questions' },
    { to: '/admin/discovery', label: 'Discovery Qs', icon: '🔍' },
    { to: '/admin/assessment', label: 'Assessment Qs', icon: '📝' },
    { section: 'Learning' },
    { to: '/admin/courses', label: 'Courses & Lessons', icon: '📚' },
]

export default function AdminDashboard() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                {navItems.map((item, i) =>
                    item.section ? (
                        <div key={i} className="admin-sidebar__section">{item.section}</div>
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                'admin-sidebar__item' + (isActive ? ' active' : '')
                            }
                        >
                            <span className="admin-sidebar__icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    )
                )}
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    )
}
