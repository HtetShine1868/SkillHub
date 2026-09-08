import { useEffect, useState } from 'react'
import {
    getAdminSkills,
    createSkill,
    updateSkill,
    deleteSkill,
} from '../../services/adminService'

const DEFAULT_SKILL_CATEGORIES = [
    'Backend',
    'Frontend',
    'Framework',
    'Database',
    'DevOps',
    'Data',
    'Cloud',
    'API',
    'Mobile',
    'Security',
    'Testing',
    'General',
]

const EMPTY = { name: '', category: 'Backend', description: '' }

export default function AdminSkillsPage() {
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [customCategory, setCustomCategory] = useState('')

    const load = () => {
        setLoading(true)
        getAdminSkills()
            .then(res => setSkills(Array.isArray(res) ? res : []))
            .catch(() => setError('Failed to load skills'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    // Derive category options from DB skills + defaults
    const dbCategories = Array.from(new Set((Array.isArray(skills) ? skills : []).map(s => s.category).filter(Boolean)))
    const categoryOptions = Array.from(new Set([...DEFAULT_SKILL_CATEGORIES, ...dbCategories]))

    const openCreate = () => {
        setForm(EMPTY)
        setEditId(null)
        setIsCustomCategory(false)
        setCustomCategory('')
        setModal(true)
    }

    const openEdit = s => {
        const isCustom = !categoryOptions.includes(s.category)
        setForm({
            name: s.name || '',
            category: s.category || 'Backend',
            description: s.description || ''
        })
        setEditId(s.id)
        setIsCustomCategory(isCustom)
        setCustomCategory(isCustom ? s.category : '')
        setModal(true)
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
            setError('Skill name is required.')
            return
        }

        const isDuplicate = (skills || []).some(s =>
            s.name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
            (!editId || Number(s.id) !== Number(editId))
        )
        if (isDuplicate) {
            setError(`A skill with the name "${trimmedName}" already exists. Duplicate skills are not allowed.`)
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
            if (editId) await updateSkill(editId, payload)
            else await createSkill(payload)
            setModal(false)
            load()
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to save skill'
            setError(msg)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this skill?')) return
        try {
            await deleteSkill(id)
            load()
        } catch {
            setError('Delete failed')
        }
    }

    const filtered = (Array.isArray(skills) ? skills : []).filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Skills</h1>
                    <p>Manage all skills available for career-to-skill mapping and assessments</p>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openCreate}>+ Add Skill</button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-toolbar">
                <input
                    className="admin-search"
                    placeholder="Search skills…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="admin-loading">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">⚡</div>
                    <h3>No skills found</h3>
                    <p>Add your first skill to get started.</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <tr key={s.id}>
                                    <td style={{ color: 'var(--f-text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                    <td><strong>{s.name}</strong></td>
                                    <td>
                                        {s.category && (
                                            <span className="admin-badge admin-badge--blue">{s.category}</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--f-text-muted)', fontSize: '0.88rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.description || '—'}
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEdit(s)}>Edit</button>
                                        <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(s.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <div className="admin-modal-overlay" onClick={() => setModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editId ? 'Edit Skill' : 'Add Skill'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Name *</label>
                                    <input
                                        required
                                        value={form.name || ''}
                                        placeholder="e.g. Java, React.js"
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
                                <label>Description</label>
                                <textarea
                                    value={form.description || ''}
                                    placeholder="Summary of topics or technologies covered"
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                />
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

