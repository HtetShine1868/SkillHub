import { useEffect, useState } from 'react'
import {
    getAdminCareers,
    createCareer,
    updateCareer,
    deleteCareer,
    toggleCareerActive,
} from '../../services/adminService'

const DEFAULT_CATEGORIES = [
    'Engineering',
    'Data',
    'Data & AI',
    'Cloud',
    'DevOps',
    'Security',
    'Database',
    'Mobile',
    'Design',
    'Product',
    'General',
]

const EMPTY = {
    name: '', category: 'Engineering', shortDescription: '',
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
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [customCategory, setCustomCategory] = useState('')

    const load = () => {
        setLoading(true)
        getAdminCareers()
            .then(res => setCareers(Array.isArray(res) ? res : []))
            .catch(() => setError('Failed to load careers'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    // Derive category list from DB careers merged with defaults
    const dbCategories = Array.from(new Set((Array.isArray(careers) ? careers : []).map(c => c.category).filter(Boolean)))
    const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories]))

    const openCreate = () => {
        setForm({ ...EMPTY })
        setEditId(null)
        setIsCustomCategory(false)
        setCustomCategory('')
        setModal('create')
    }

    const openEdit = c => {
        const isCustom = !categoryOptions.includes(c.category)
        setForm({
            name: c.name || '',
            category: c.category || 'Engineering',
            shortDescription: c.shortDescription || c.description || '',
            fullDescription: c.fullDescription || '',
            active: c.active !== undefined ? c.active : true,
        })
        setEditId(c.id)
        setIsCustomCategory(isCustom)
        setCustomCategory(isCustom ? c.category : '')
        setModal('edit')
    }

    const handleCategoryChange = e => {
        const val = e.target.value
        if (val === '__custom__') {
            setIsCustomCategory(true)
            setForm(f => ({ ...f, category: customCategory || '' }))
        } else {
            setIsCustomCategory(false)
            setForm(f => ({ ...f, category: val }))
        }
    }

    const handleSave = async e => {
        e.preventDefault()
        setError('')
        const trimmedName = (form.name || '').trim()
        if (!trimmedName) {
            setError('Career name is required.')
            return
        }

        const isDuplicate = (careers || []).some(c =>
            c.name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
            (!editId || Number(c.id) !== Number(editId))
        )
        if (isDuplicate) {
            setError(`A career with the name "${trimmedName}" already exists. Duplicate careers are not allowed.`)
            return
        }

        setSaving(true)
        const finalCategory = isCustomCategory ? customCategory.trim() || 'General' : form.category
        const payload = {
            ...form,
            name: trimmedName,
            category: finalCategory,
        }
        try {
            if (editId) await updateCareer(editId, payload)
            else await createCareer(payload)
            setModal(null)
            load()
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to save career'
            setError(msg)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this career?')) return
        try {
            await deleteCareer(id)
            load()
        } catch {
            setError('Delete failed')
        }
    }

    const handleToggle = async id => {
        try {
            await toggleCareerActive(id)
            load()
        } catch {
            setError('Toggle failed')
        }
    }

    const filtered = (Array.isArray(careers) ? careers : []).filter(c =>
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
                                    <td>
                                        <span className="admin-badge admin-badge--blue">{c.category || 'General'}</span>
                                    </td>
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
                                    <input
                                        required
                                        value={form.name || ''}
                                        placeholder="e.g. Backend Developer"
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    />
                                </div>
                                <div className="admin-field">
                                    <label>Category *</label>
                                    <select
                                        required
                                        value={isCustomCategory ? '__custom__' : form.category}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="">— Select Category —</option>
                                        {categoryOptions.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="__custom__">+ Add New Category...</option>
                                    </select>
                                    {isCustomCategory && (
                                        <input
                                            required
                                            style={{ marginTop: '0.5rem' }}
                                            placeholder="Enter new category name…"
                                            value={customCategory}
                                            onChange={e => {
                                                setCustomCategory(e.target.value)
                                                setForm(f => ({ ...f, category: e.target.value }))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="admin-field">
                                <label>Short Description</label>
                                <input
                                    value={form.shortDescription || ''}
                                    placeholder="Brief summary of this career role"
                                    onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                                />
                            </div>
                            <div className="admin-field">
                                <label>Full Description</label>
                                <textarea
                                    rows={4}
                                    value={form.fullDescription || ''}
                                    placeholder="Key responsibilities and skills in detail"
                                    onChange={e => setForm(f => ({ ...f, fullDescription: e.target.value }))}
                                />
                            </div>
                            <div className="admin-field">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!form.active}
                                        onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                                    />
                                    Active Career
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

