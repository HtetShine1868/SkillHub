import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyEnrollments } from '../services/enrollmentService'
import './Dashboard.css'

const journeyCards = [
    {
        icon: '🎯',
        title: 'Career Discovery',
        desc: 'Answer a quick quiz to uncover career paths that match your personality.',
        to: '/careers',
        cta: 'Start Discovery',
        color: '#7c3aed',
    },
    {
        icon: '📊',
        title: 'Skill Assessment',
        desc: 'Benchmark your skills against your target career with a scored assessment.',
        to: '/careers',
        cta: 'Take Assessment',
        color: '#2563eb',
    },
    {
        icon: '🗺️',
        title: 'Your Roadmap',
        desc: 'Get a personalised, step-by-step learning roadmap built for your goals.',
        to: '/my-learning?tab=roadmap',
        cta: 'View Roadmap',
        color: '#0891b2',
    },
    {
        icon: '📚',
        title: 'Courses',
        desc: 'Browse curated courses aligned to your roadmap and start learning.',
        to: '/courses',
        cta: 'Browse Courses',
        color: '#059669',
    },
    {
        icon: '📈',
        title: 'My Learning',
        desc: 'Track your progress, revisit completed lessons, and celebrate wins.',
        to: '/my-learning',
        cta: 'Track Progress',
        color: '#d97706',
    },
    {
        icon: '🤝',
        title: 'Skill Exchange',
        desc: 'Connect with peers — teach what you know, learn what you need.',
        to: '/skill-exchange',
        cta: 'Explore Exchange',
        color: '#be185d',
    },
]

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const firstName = user?.name?.split(' ')[0] || 'there'

    const [enrollments, setEnrollments] = useState([])
    const [activeCareer, setActiveCareer] = useState(null)

    useEffect(() => {
        if (user?.role === 'ROLE_INSTRUCTOR') {
            navigate('/instructor/dashboard', { replace: true })
            return
        }
        if (user?.role === 'ROLE_ADMIN') {
            navigate('/admin', { replace: true })
            return
        }

        getMyEnrollments()
            .then(data => setEnrollments(Array.isArray(data) ? data : []))
            .catch(() => setEnrollments([]))

        try {
            const userKey = user?.id ? `skillhub_active_career_${user.id}` : 'skillhub_active_career'
            const saved = localStorage.getItem(userKey)
            if (saved) {
                setActiveCareer(JSON.parse(saved))
            }
        } catch (e) {}
    }, [user, navigate])

    const activeCourse = enrollments.find(e => !e.completed) || enrollments[0]
    const completedCount = enrollments.filter(e => e.completed).length

    return (
        <div className="dash">
            <div className="dash__hero">
                <div className="dash__hero-inner">
                    <div className="dash__greeting">
                        <div className="dash__avatar">
                            {user?.profileImage
                                ? <img src={user.profileImage} alt={user.name} />
                                : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                            }
                        </div>
                        <div>
                            <h1>Welcome back, {firstName} 👋</h1>
                            <p>{user?.email} · Ready to level up your engineering skills today?</p>
                        </div>
                    </div>
                    <div className="dash__orbs">
                        <div className="dash__orb dash__orb--1" />
                        <div className="dash__orb dash__orb--2" />
                    </div>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="dash__stats-strip">
                <div className="dash__stats-inner">
                    <div className="dash__stat-box">
                        <span className="dash__stat-icon">🔥</span>
                        <div>
                            <strong className="dash__stat-value">3 Days</strong>
                            <span className="dash__stat-label">Learning Streak</span>
                        </div>
                    </div>
                    <div className="dash__stat-box">
                        <span className="dash__stat-icon">📚</span>
                        <div>
                            <strong className="dash__stat-value">{enrollments.length}</strong>
                            <span className="dash__stat-label">Courses Enrolled</span>
                        </div>
                    </div>
                    <div className="dash__stat-box">
                        <span className="dash__stat-icon">🏆</span>
                        <div>
                            <strong className="dash__stat-value">{completedCount}</strong>
                            <span className="dash__stat-label">Certificates Earned</span>
                        </div>
                    </div>
                    <div className="dash__stat-box">
                        <span className="dash__stat-icon">🎯</span>
                        <div>
                            <strong className="dash__stat-value">{activeCareer?.title || activeCareer?.name || 'In Progress'}</strong>
                            <span className="dash__stat-label">Career Goal</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash__body">
                {/* Resume Learning Widget if enrolled */}
                {activeCourse && (
                    <div className="dash__resume-card">
                        <div className="dash__resume-info">
                            <span className="dash__resume-tag">⚡ Jump Back In</span>
                            <h3 className="dash__resume-title">{activeCourse.course?.title || 'Active Course'}</h3>
                            <div className="dash__resume-progress-bar">
                                <div
                                    className="dash__resume-progress-fill"
                                    style={{ width: `${activeCourse.progressPercentage || 0}%` }}
                                />
                            </div>
                            <span className="dash__resume-meta">{activeCourse.progressPercentage || 0}% Completed</span>
                        </div>
                        <button
                            className="dash__resume-btn"
                            onClick={() => navigate(`/courses/${activeCourse.course?.id || activeCourse.courseId}`)}
                        >
                            ▶ Continue Course
                        </button>
                    </div>
                )}

                <div className="dash__section-header">
                    <h2>Your Learning Journey</h2>
                    <p>Follow each step to discover your career path and grow your skills.</p>
                </div>

                <div className="dash__cards">
                    {journeyCards.map((card, i) => (
                        <Link key={card.title} to={card.to} className="dash__card" style={{ '--card-color': card.color }}>
                            <div className="dash__card-num">{String(i + 1).padStart(2, '0')}</div>
                            <div className="dash__card-icon">{card.icon}</div>
                            <h3>{card.title}</h3>
                            <p>{card.desc}</p>
                            <span className="dash__card-cta">{card.cta} →</span>
                        </Link>
                    ))}
                </div>

                <div className="dash__profile-strip">
                    <div className="dash__profile-item">
                        <span className="dash__profile-label">Name</span>
                        <span className="dash__profile-val">{user?.name}</span>
                    </div>
                    <div className="dash__profile-item">
                        <span className="dash__profile-label">Email</span>
                        <span className="dash__profile-val">{user?.email}</span>
                    </div>
                    <div className="dash__profile-item">
                        <span className="dash__profile-label">Provider</span>
                        <span className="dash__profile-val">{user?.provider || 'local'}</span>
                    </div>
                    <div className="dash__profile-item">
                        <span className="dash__profile-label">Verified</span>
                        <span className={`admin-badge ${user?.emailVerified ? 'admin-badge--green' : 'admin-badge--orange'}`}>
                            {user?.emailVerified ? '✓ Verified' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
