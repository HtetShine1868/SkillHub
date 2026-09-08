import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

export default function AdminCertificatesPage() {
    const [certs, setCerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [revoking, setRevoking] = useState(null)

    const load = () => {
        setLoading(true)
        axiosClient.get('/api/admin/certificates')
            .then(r => setCerts(Array.isArray(r.data) ? r.data : []))
            .catch(() => setError('Failed to load certificates'))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const revoke = async (id) => {
        if (!window.confirm('Revoke this certificate? This cannot be undone.')) return
        setRevoking(id)
        try {
            await axiosClient.delete(`/api/admin/certificates/${id}`)
            setCerts(c => (Array.isArray(c) ? c : []).filter(x => x.id !== id))
        } catch {
            alert('Failed to revoke certificate.')
        } finally {
            setRevoking(null)
        }
    }

    const filtered = (Array.isArray(certs) ? certs : []).filter(c =>
        c.userName?.toLowerCase().includes(search.toLowerCase()) ||
        c.courseName?.toLowerCase().includes(search.toLowerCase()) ||
        c.certificateId?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="admin-loading">Loading certificates…</div>
    if (error)   return <div className="admin-error">{error}</div>

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>🏆 Certificate Management</h1>
                    <p>All certificates automatically awarded upon course completion</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <span style={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.5)' }}>
                        Total: <strong style={{ color:'#a78bfa' }}>{certs.length}</strong>
                    </span>
                </div>
            </div>

            <div className="admin-toolbar">
                <input
                    className="admin-search"
                    placeholder="Search by user, course or certificate ID…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">🏆</div>
                    <h3>No Certificates Found</h3>
                    <p>Certificates are automatically issued when users complete all lessons in a course.</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Certificate ID</th>
                                <th>User</th>
                                <th>Course</th>
                                <th>Score</th>
                                <th>Issued At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(cert => (
                                <tr key={cert.id}>
                                    <td>
                                        <code style={{ fontSize:'0.8rem', color:'#a78bfa', background:'rgba(167,139,250,0.08)', padding:'0.2rem 0.5rem', borderRadius:'4px' }}>
                                            {cert.certificateId}
                                        </code>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight:600, color:'#f0f2ff' }}>{cert.userName}</div>
                                        <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.45)' }}>{cert.userEmail}</div>
                                    </td>
                                    <td>{cert.courseName}</td>
                                    <td>
                                        <span className={`admin-badge ${cert.score >= 80 ? 'admin-badge--green' : cert.score >= 60 ? 'admin-badge--blue' : 'admin-badge--orange'}`}>
                                            {cert.score !== null && cert.score !== undefined ? `${cert.score}%` : 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize:'0.84rem', color:'rgba(255,255,255,0.6)' }}>
                                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                                    </td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn--danger admin-btn--sm"
                                            disabled={revoking === cert.id}
                                            onClick={() => revoke(cert.id)}
                                        >
                                            {revoking === cert.id ? 'Revoking…' : 'Revoke'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
