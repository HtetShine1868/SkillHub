import { useEffect, useState } from 'react'
import {
    getAdminCareers,
    createCareer,
    updateCareer,
    deleteCareer,
    toggleCareerActive,
} from '../../services/adminService'

const EMPTY = {
    name: '', category: '', shortDescription: '',
    fullDescription: '', active: true,
}

export default function AdminCareersPage() {
    const [careers, setCareers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(null)   // null | 'create' | 'edit'
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        getAdminCareers()
            .then(setCareers)
            .catch(() => setError('Failed to load careers'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => { setForm(EMPTY); setEditId(null); setModal('edit') }
    const openEdit = c => { setForm({ ...c }); setEditId(c.id); setModal('edit') }

    const handleSave = async e => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editId) await updateCareer(editId, form)
            else await createCareer(form)
            setModal(null)
            load()
        } catch { setError('Save failed') }
        finally { setSaving(false) }
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this career?')) return
        try { await deleteCareer(id); load() }
        catch { setError('Delete failed') }
    }

    const handleToggle = async id => {
        try { await toggleCareerActive(id); load() }
        catch { setError('Toggle failed') }
    }

    const filtered = careers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Careers</h1>
                    <p>Manage career paths available on the platform</p>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openCreate}>
                    + Add Career
                </button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-toolbar">
                <input
                    className="admin-search"
                    placeholder="Search careers…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="admin-loading">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">🎯</div>
                    <h3>No careers found</h3>
                    <p>Add your first career to get started.</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.name}</strong></td>
                                    <td>{c.category}</td>
                                    <td>
                                        <span className={`admin-badge ${c.active ? 'admin-badge--green' : 'admin-badge--red'}`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEdit(c)}>Edit</button>
                                        <button className="admin-btn admin-btn--sm admin-btn--success" onClick={() => handleToggle(c.id)}>
                                            {c.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="admin-modal-overlay" onClick={() => setModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editId ? 'Edit Career' : 'Add Career'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Name *</label>
                                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Category *</label>
                                    <input required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                                </div>
                            </div>
                            <div className="admin-field">
                                <label>Short Description</label>
                                <input value={form.shortDescription || ''} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                            </div>
                            <div className="admin-field">
                                <label>Full Description</label>
                                <textarea rows={4} value={form.fullDescription || ''} onChange={e => setForm(f => ({ ...f, fullDescription: e.target.value }))} />
                            </div>
                            <div className="admin-field">
                                <label>
                                    <input type="checkbox" checked={!!form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                                    {' '}Active
                                </label>
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
