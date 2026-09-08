import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

const STATUS_COLORS = { OPEN:'admin-badge--blue', IN_PROGRESS:'admin-badge--orange', COMPLETED:'admin-badge--green', CANCELLED:'admin-badge--red', FLAGGED:'admin-badge--red' }

export default function AdminSkillExchangePage() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('ALL')
    const [acting, setActing] = useState(null)

    const load = () => {
        setLoading(true)
        axiosClient.get('/api/admin/skill-exchange/projects')
            .then(r => setProjects(Array.isArray(r.data) ? r.data : []))
            .catch(() => setError('Failed to load projects'))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const doAction = async (id, action) => {
        setActing(id + action)
        try {
            await axiosClient.patch(`/api/admin/skill-exchange/projects/${id}/${action}`)
            load()
        } catch {
            alert('Action failed.')
        } finally {
            setActing(null)
        }
    }

    const remove = async (id) => {
        if (!window.confirm('Delete this project permanently?')) return
        setActing(id + 'del')
        try {
            await axiosClient.delete(`/api/admin/skill-exchange/projects/${id}`)
            setProjects(p => (Array.isArray(p) ? p : []).filter(x => x.id !== id))
        } catch {
            alert('Failed to delete.')
        } finally {
            setActing(null)
        }
    }

    const statuses = ['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'FLAGGED', 'CANCELLED']

    const safeProjects = Array.isArray(projects) ? projects : []

    const filtered = safeProjects.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.ownerName?.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'ALL' || p.status === filter
        return matchSearch && matchFilter
    })

    if (loading) return <div className="admin-loading">Loading Skill Exchange projects…</div>
    if (error)   return <div className="admin-error">{error}</div>

    const counts = { ALL: safeProjects.length }
    statuses.slice(1).forEach(s => { counts[s] = safeProjects.filter(p => p.status === s).length })

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>🤝 Skill Exchange Management</h1>
                    <p>Moderate projects, resolve reports, manage platform rules</p>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                    {projects.filter(p => p.status === 'FLAGGED').length > 0 && (
                        <span className="admin-badge admin-badge--red" style={{ padding:'0.4rem 0.9rem', fontSize:'0.85rem' }}>
                            ⚠️ {projects.filter(p => p.status === 'FLAGGED').length} Flagged
                        </span>
                    )}
                </div>
            </div>

            {/* Summary cards */}
            <div className="admin-stats-grid" style={{ marginBottom:'1.5rem' }}>
                {[
                    { label:'Total Projects', value: counts.ALL,         icon:'📋', color:'#a78bfa' },
                    { label:'Open',           value: counts.OPEN || 0,   icon:'🟢', color:'#34d399' },
                    { label:'In Progress',    value: counts.IN_PROGRESS || 0, icon:'🔄', color:'#38bdf8' },
                    { label:'Flagged',        value: counts.FLAGGED || 0,icon:'🚩', color:'#f87171' },
                ].map(c => (
                    <div key={c.label} className="admin-stat-card">
                        <div className="admin-stat-icon">{c.icon}</div>
                        <div className="admin-stat-value" style={{ color: c.color }}>{c.value}</div>
                        <div className="admin-stat-label">{c.label}</div>
                    </div>
                ))}
            </div>

            <div className="admin-toolbar">
                <input
                    className="admin-search"
                    placeholder="Search by project title or owner…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className="admin-search"
                    style={{ flex:'0 0 160px' }}
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    {statuses.map(s => (
                        <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_',' ')}</option>
                    ))}
                </select>
            </div>

            {filtered.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">🤝</div>
                    <h3>No Projects Found</h3>
                    <p>No Skill Exchange projects match your filters.</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Owner</th>
                                <th>Skills</th>
                                <th>Requests</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} style={p.status === 'FLAGGED' ? { background:'rgba(239,68,68,0.04)' } : {}}>
                                    <td>
                                        <div style={{ fontWeight:600, color:'#f0f2ff', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {p.title}
                                        </div>
                                        {p.status === 'FLAGGED' && <div style={{ fontSize:'0.75rem', color:'#f87171', marginTop:2 }}>⚠️ Flagged for review</div>}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight:500 }}>{p.ownerName}</div>
                                        <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.45)' }}>{p.ownerEmail}</div>
                                    </td>
                                    <td style={{ fontSize:'0.82rem', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                        {p.skillsOffered?.join(', ') || '—'}
                                    </td>
                                    <td style={{ textAlign:'center', color:'#a78bfa', fontWeight:600 }}>
                                        {p.requestCount ?? 0}
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${STATUS_COLORS[p.status] || 'admin-badge--blue'}`}>
                                            {p.status?.replace('_',' ')}
                                        </span>
                                    </td>
                                    <td style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)' }}>
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                                    </td>
                                    <td>
                                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                                            {p.status === 'FLAGGED' && (
                                                <button className="admin-btn admin-btn--success admin-btn--sm"
                                                    disabled={acting === p.id+'approve'}
                                                    onClick={() => doAction(p.id, 'approve')}>
                                                    ✓ Approve
                                                </button>
                                            )}
                                            {p.status !== 'FLAGGED' && (
                                                <button className="admin-btn admin-btn--secondary admin-btn--sm"
                                                    disabled={acting === p.id+'flag'}
                                                    onClick={() => doAction(p.id, 'flag')}>
                                                    🚩 Flag
                                                </button>
                                            )}
                                            <button className="admin-btn admin-btn--danger admin-btn--sm"
                                                disabled={acting === p.id+'del'}
                                                onClick={() => remove(p.id)}>
                                                Delete
                                            </button>
                                        </div>
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
