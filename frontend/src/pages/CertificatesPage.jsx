import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import { downloadCertificatePdf } from '../utils/downloadCertificatePdf'
import './CertificatesPage.css'

export default function CertificatesPage() {
    const { user } = useAuth()
    const [certs, setCerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        axiosClient.get('/api/certificates/my')
            .then(r => setCerts(r.data))
            .catch(() => setError('Failed to load certificates'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="cert-page">
            <div className="cert-loading">Loading your certificates…</div>
        </div>
    )

    return (
        <div className="cert-page">
            <div className="cert-blob cert-blob--1" />
            <div className="cert-blob cert-blob--2" />
            <div className="cert-inner">
                <div className="cert-header">
                    <div className="cert-badge">🏆 Achievements</div>
                    <h1>Your <span className="cert-hl">Certificates</span></h1>
                    <p>Certificates are awarded automatically when you complete all lessons in a course.</p>
                </div>

                {error && <div className="cert-error">{error}</div>}

                {!error && certs.length === 0 ? (
                    <div className="cert-empty">
                        <div className="cert-empty-icon">🎓</div>
                        <h2>No Certificates Yet</h2>
                        <p>Complete a course to earn your first certificate!</p>
                        <Link to="/courses" className="cert-cta-btn">Browse Courses →</Link>
                    </div>
                ) : (
                    <div className="cert-grid">
                        {certs.map(cert => (
                            <div key={cert.id} className="cert-card">
                                <div className="cert-card__seal">🏆</div>
                                <div className="cert-card__body">
                                    <div className="cert-card__label">Certificate of Completion</div>
                                    <h2 className="cert-card__course">{cert.courseName || cert.course?.title}</h2>
                                    <div className="cert-card__meta">
                                        <span className="cert-card__id">ID: {cert.certificateId}</span>
                                        {cert.score != null && (
                                            <span className={`cert-card__score ${cert.score >= 80 ? 'cert-card__score--high' : cert.score >= 60 ? 'cert-card__score--mid' : 'cert-card__score--low'}`}>
                                                Score: {cert.score}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="cert-card__issued">
                                        Issued on {cert.issuedAt
                                            ? new Date(cert.issuedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
                                            : '—'}
                                    </div>
                                </div>
                                <div className="cert-card__ribbon" />
                                <button
                                    className="cert-card__download-btn"
                                    onClick={() => downloadCertificatePdf(cert, user?.name)}
                                    title="Download Certificate as PDF"
                                >
                                    ⬇ Download PDF
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="cert-cta">
                    <h3>Keep Learning</h3>
                    <p>Continue your journey to earn more certificates and grow your skills.</p>
                    <div className="cert-cta-links">
                        <Link to="/courses" className="cert-cta-btn">Browse Courses</Link>
                        <Link to="/my-learning" className="cert-cta-btn cert-cta-btn--outline">My Learning</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
