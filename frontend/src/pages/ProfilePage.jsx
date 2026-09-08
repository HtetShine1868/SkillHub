import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import './ProfilePage.css'

const LEVEL_LABELS = ['None', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert']

export default function ProfilePage() {
    const { user } = useAuth()
    const [showCertificates, setShowCertificates] = useState(false)
    const [certs, setCerts] = useState([])
    const [certsLoading, setCertsLoading] = useState(false)
    const [certsError, setCertsError] = useState(null)

    // Load certificates when user toggles showCertificates to true
    useEffect(() => {
        if (showCertificates && certs.length === 0) {
            setCertsLoading(true)
            axiosClient.get('/api/certificates/my')
                .then(res => {
                    setCerts(res.data || [])
                })
                .catch(err => {
                    console.error('Failed to load certificates', err)
                    setCertsError('Failed to load certificates from server.')
                })
                .finally(() => setCertsLoading(false))
        }
    }, [showCertificates, certs.length])

    return (
        <div className="profile-page">
            <div className="profile-blob profile-blob--1" />
            <div className="profile-blob profile-blob--2" />

            <div className="profile-inner">
                {/* Header / Hero */}
                <div className="profile-card profile-card--hero">
                    <div className="profile-avatar-wrap">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={user?.name} className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-fallback">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="profile-status-dot" title="Active" />
                    </div>

                    <div className="profile-hero-info">
                        <div className="profile-badges-row">
                            <span className="profile-role-badge">
                                {user?.role === 'ROLE_ADMIN' ? '⚡ Administrator' : '🎓 Student Learner'}
                            </span>
                            <span className={`profile-verify-badge ${user?.emailVerified ? 'profile-verify-badge--verified' : ''}`}>
                                {user?.emailVerified ? '✓ Email Verified' : '● Verification Pending'}
                            </span>
                        </div>
                        <h1 className="profile-name">{user?.name || 'SkillHub Learner'}</h1>
                        <p className="profile-email">{user?.email}</p>
                    </div>

                    <div className="profile-hero-actions">
                        <Link to="/my-learning" className="profile-cta-btn">
                            My Learning →
                        </Link>
                    </div>
                </div>

                {/* Grid details */}
                <div className="profile-grid">
                    {/* Account & Platform Info */}
                    <div className="profile-section-card">
                        <h2 className="profile-section-title">
                            <span className="profile-section-icon">👤</span> Account Details
                        </h2>
                        <div className="profile-info-list">
                            <div className="profile-info-row">
                                <span className="profile-info-label">Full Name</span>
                                <span className="profile-info-val">{user?.name || '—'}</span>
                            </div>
                            <div className="profile-info-row">
                                <span className="profile-info-label">Email Address</span>
                                <span className="profile-info-val">{user?.email || '—'}</span>
                            </div>
                            <div className="profile-info-row">
                                <span className="profile-info-label">Auth Provider</span>
                                <span className="profile-info-val profile-provider-tag">
                                    {user?.provider ? user.provider.toUpperCase() : 'LOCAL'}
                                </span>
                            </div>
                            <div className="profile-info-row">
                                <span className="profile-info-label">Account Role</span>
                                <span className="profile-info-val">{user?.role || 'ROLE_USER'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Learning & Exchange Shortcuts */}
                    <div className="profile-section-card">
                        <h2 className="profile-section-title">
                            <span className="profile-section-icon">⚡</span> Quick Actions
                        </h2>
                        <div className="profile-quick-actions">
                            <Link to="/my-learning" className="profile-action-box">
                                <span className="profile-action-box-icon">🗺️</span>
                                <div>
                                    <h3>Personalized Roadmap</h3>
                                    <p>Continue your career path & track milestones</p>
                                </div>
                            </Link>
                            <Link to="/courses" className="profile-action-box">
                                <span className="profile-action-box-icon">📚</span>
                                <div>
                                    <h3>Course Catalog</h3>
                                    <p>Explore reading lessons and skill building</p>
                                </div>
                            </Link>
                            <Link to="/skill-exchange" className="profile-action-box">
                                <span className="profile-action-box-icon">🤝</span>
                                <div>
                                    <h3>Skill Exchange</h3>
                                    <p>Collaborate on projects and match with peers</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Certificates Section */}
                <div className="profile-section-card profile-cert-section">
                    <div className="profile-cert-header">
                        <div>
                            <h2 className="profile-section-title">
                                <span className="profile-section-icon">🏆</span> Verified Achievements
                            </h2>
                            <p className="profile-cert-desc">
                                Official certificates of completion earned through your course achievements.
                            </p>
                        </div>
                        <button
                            id="btn-toggle-certificates"
                            className={`profile-toggle-cert-btn ${showCertificates ? 'profile-toggle-cert-btn--active' : ''}`}
                            onClick={() => setShowCertificates(prev => !prev)}
                        >
                            {showCertificates ? 'Hide My Certificates' : 'Show My Certificates'}
                        </button>
                    </div>

                    {showCertificates && (
                        <div className="profile-cert-content">
                            {certsLoading && (
                                <div className="profile-cert-loading">
                                    <div className="profile-spinner" />
                                    <p>Loading your certificates…</p>
                                </div>
                            )}

                            {certsError && (
                                <div className="profile-cert-error">{certsError}</div>
                            )}

                            {!certsLoading && !certsError && certs.length === 0 && (
                                <div className="profile-cert-empty">
                                    <div className="profile-cert-empty-icon">🎓</div>
                                    <h3>No Certificates Yet</h3>
                                    <p>Complete all required lessons and final assessments in a course to earn your verified certificate.</p>
                                    <Link to="/courses" className="profile-cta-btn profile-cta-btn--secondary">
                                        Browse Available Courses →
                                    </Link>
                                </div>
                            )}

                            {!certsLoading && !certsError && certs.length > 0 && (
                                <div className="profile-cert-grid">
                                    {certs.map(cert => (
                                        <div key={cert.id || cert.certificateId} className="profile-cert-card">
                                            <div className="profile-cert-seal">🏆</div>
                                            <div className="profile-cert-body">
                                                <span className="profile-cert-label">Certificate of Completion</span>
                                                <h3 className="profile-cert-course">{cert.courseName || cert.course?.title || 'Course Certificate'}</h3>
                                                <div className="profile-cert-meta">
                                                    <span className="profile-cert-id">ID: {cert.certificateId}</span>
                                                    {cert.score != null && (
                                                        <span className="profile-cert-score">Score: {cert.score}%</span>
                                                    )}
                                                </div>
                                                <div className="profile-cert-date">
                                                    Issued on {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
