import { useEffect, useState } from 'react'
import { getAdminStats } from '../../services/adminService'

const statCards = [
    { key: 'totalUsers',               label: 'Total Users',             icon: '👥' },
    { key: 'totalCareers',             label: 'Careers',                 icon: '🎯' },
    { key: 'totalSkills',              label: 'Skills',                  icon: '⚡' },
    { key: 'totalCourses',             label: 'Courses',                 icon: '📚' },
    { key: 'totalDiscoveryQuestions',  label: 'Discovery Questions',     icon: '🔍' },
    { key: 'totalAssessmentQuestions', label: 'Assessment Questions',    icon: '📝' },
]

export default function AdminStatsPage() {
    const [stats, setStats] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        getAdminStats()
            .then(setStats)
            .catch(() => setError('Failed to load stats'))
    }, [])

    if (error) return <div className="admin-error">{error}</div>
    if (!stats) return <div className="admin-loading">Loading stats…</div>

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Platform Overview</h1>
                    <p>Live counts across the entire SkillHub platform</p>
                </div>
            </div>

            <div className="admin-stats-grid">
                {statCards.map(({ key, label, icon }) => (
                    <div key={key} className="admin-stat-card">
                        <div className="admin-stat-icon">{icon}</div>
                        <div className="admin-stat-value">{stats[key] ?? 0}</div>
                        <div className="admin-stat-label">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
