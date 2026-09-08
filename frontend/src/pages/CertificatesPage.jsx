import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './CertificatesPage.css'

function downloadCertificate(cert) {
  const win = window.open('', '_blank', 'width=900,height=650')
  const courseName = cert.courseName || cert.course?.title || 'Course'
  const issued = cert?.issuedAt
    ? new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate – ${courseName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .cert{width:820px;padding:60px;border:3px solid #7c3aed;border-radius:16px;text-align:center;position:relative;background:linear-gradient(135deg,#faf5ff 0%,#eff6ff 100%);box-shadow:0 8px 32px rgba(124,58,237,0.15)}
    .cert__corner{position:absolute;width:80px;height:80px;border-color:#7c3aed;border-style:solid;opacity:0.4}
    .cert__corner--tl{top:16px;left:16px;border-width:3px 0 0 3px}
    .cert__corner--tr{top:16px;right:16px;border-width:3px 3px 0 0}
    .cert__corner--bl{bottom:16px;left:16px;border-width:0 0 3px 3px}
    .cert__corner--br{bottom:16px;right:16px;border-width:0 3px 3px 0}
    .cert__seal{font-size:56px;margin-bottom:16px}
    .cert__label{font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#7c3aed;font-weight:600;margin-bottom:12px}
    .cert__title{font-family:'Outfit',sans-serif;font-size:38px;font-weight:800;background:linear-gradient(135deg,#7c3aed,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px}
    .cert__divider{width:80px;height:3px;background:linear-gradient(90deg,#7c3aed,#2563eb);margin:0 auto 28px;border-radius:2px}
    .cert__awarded{font-size:16px;color:#64748b;margin-bottom:8px}
    .cert__name{font-family:'Outfit',sans-serif;font-size:32px;font-weight:700;color:#1e1b4b;margin-bottom:24px}
    .cert__for{font-size:15px;color:#64748b;margin-bottom:8px}
    .cert__course{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:#312e81;margin-bottom:32px}
    .cert__meta{display:flex;justify-content:center;gap:48px;margin-top:16px;padding-top:24px;border-top:1px solid rgba(124,58,237,0.2)}
    .cert__meta-item{display:flex;flex-direction:column;align-items:center;gap:4px}
    .cert__meta-label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8}
    .cert__meta-value{font-size:14px;font-weight:600;color:#475569}
    @media print{body{background:#fff}.cert{box-shadow:none}}
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert__corner cert__corner--tl"></div>
    <div class="cert__corner cert__corner--tr"></div>
    <div class="cert__corner cert__corner--bl"></div>
    <div class="cert__corner cert__corner--br"></div>
    <div class="cert__seal">🏆</div>
    <div class="cert__label">SkillHub — Certificate of Completion</div>
    <h1 class="cert__title">Certificate of Achievement</h1>
    <div class="cert__divider"></div>
    <p class="cert__awarded">This certifies that</p>
    <p class="cert__name">SkillHub Learner</p>
    <p class="cert__for">has successfully completed</p>
    <p class="cert__course">${courseName}</p>
    <div class="cert__meta">
      <div class="cert__meta-item"><span class="cert__meta-label">Issued On</span><span class="cert__meta-value">${issued}</span></div>
      <div class="cert__meta-item"><span class="cert__meta-label">Certificate ID</span><span class="cert__meta-value">${cert.certificateId}</span></div>
      ${cert.score != null ? `<div class="cert__meta-item"><span class="cert__meta-label">Score</span><span class="cert__meta-value">${cert.score}%</span></div>` : ''}
    </div>
  </div>
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
</body>
</html>`)
  win.document.close()
}

export default function CertificatesPage() {
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
                                    onClick={() => downloadCertificate(cert)}
                                    title="Download Certificate"
                                >
                                    ⬇ Download
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
