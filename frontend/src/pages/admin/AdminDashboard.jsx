import { NavLink, Outlet } from 'react-router-dom'
import './AdminDashboard.css'

const navItems = [
    { to: '/admin', label: 'Overview', icon: '📊', end: true },
    { section: 'Platform Users' },
    { to: '/admin/users', label: 'Users & Instructors', icon: '👥' },
    { section: 'Content & Skills' },
    { to: '/admin/careers', label: 'Careers', icon: '🎯' },
    { to: '/admin/skills', label: 'Skills', icon: '⚡' },
    { to: '/admin/career-skills', label: 'Career Skills', icon: '🔗' },
    { section: 'Questions' },
    { to: '/admin/discovery', label: 'Discovery Qs', icon: '🔍' },
    { to: '/admin/assessment', label: 'Assessment Qs', icon: '📝' },
    { section: 'Learning & Review' },
    { to: '/admin/courses', label: 'Courses & Approvals', icon: '📚' },
    { to: '/admin/reviews', label: 'Course Reviews', icon: '⭐' },
    { to: '/admin/certificates', label: 'Certificates', icon: '🏆' },
    { section: 'Community' },
    { to: '/admin/skill-exchange', label: 'Skill Exchange', icon: '🤝' },
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
