import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const journeyCards = [
    {
        icon: '🎯',
        title: 'Career Discovery',
        desc: 'Answer a quick quiz to uncover career paths that match your personality.',
        to: '/onboarding',
        cta: 'Start Discovery',
        color: '#7c3aed',
    },
    {
        icon: '📊',
        title: 'Skill Assessment',
        desc: 'Benchmark your skills against your target career with a scored assessment.',
        to: '/assessment',
        cta: 'Take Assessment',
        color: '#2563eb',
    },
    {
        icon: '🗺️',
        title: 'Your Roadmap',
        desc: 'Get a personalised, step-by-step learning roadmap built for your goals.',
        to: '/roadmap',
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
        to: '/forum',
        cta: 'Explore Forum',
        color: '#be185d',
    },
]

export default function Dashboard() {
    const { user } = useAuth()
    const firstName = user?.name?.split(' ')[0] || 'there'

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
                            <p>{user?.email}</p>
                        </div>
                    </div>
                    <div className="dash__orbs">
                        <div className="dash__orb dash__orb--1" />
                        <div className="dash__orb dash__orb--2" />
                    </div>
                </div>
            </div>

            <div className="dash__body">
                <div className="dash__section-header">
                    <h2>Your Learning Journey</h2>
                    <p>Follow each step to discover your career path and grow your skills.</p>
                </div>

                <div className="dash__cards">
                    {journeyCards.map((card, i) => (
                        <Link key={card.to} to={card.to} className="dash__card" style={{ '--card-color': card.color }}>
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
