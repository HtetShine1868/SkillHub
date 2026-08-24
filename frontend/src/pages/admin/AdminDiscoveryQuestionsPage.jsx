import { useEffect, useState } from 'react'
import {
    getDiscoveryQuestions,
    createDiscoveryQuestion,
    updateDiscoveryQuestion,
    deleteDiscoveryQuestion,
} from '../../services/adminService'

const EMPTY = { questionText: '', questionOrder: 1, options: [] }
const EMPTY_OPT = { optionText: '', optionOrder: 1 }

export default function AdminDiscoveryQuestionsPage() {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        getDiscoveryQuestions()
            .then(setQuestions)
            .catch(() => setError('Failed to load questions'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setForm({ ...EMPTY, options: [{ ...EMPTY_OPT }] })
        setEditId(null)
        setModal(true)
    }

    const openEdit = q => {
        setForm({
            questionText: q.questionText,
            questionOrder: q.questionOrder,
            options: (q.options || []).map(o => ({
                optionText: o.optionText,
                optionOrder: o.optionOrder,
                weights: o.weights || {}
            }))
        })
        setEditId(q.id)
        setModal(true)
    }

    const addOption = () => setForm(f => ({
        ...f,
        options: [...f.options, { optionText: '', optionOrder: f.options.length + 1, weights: {} }]
    }))

    const removeOption = i => setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }))

    const setOption = (i, key, val) => setForm(f => ({
        ...f,
        options: f.options.map((o, idx) => idx === i ? { ...o, [key]: val } : o)
    }))

    const handleSave = async e => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editId) await updateDiscoveryQuestion(editId, form)
            else await createDiscoveryQuestion(form)
            setModal(false)
            load()
        } catch { setError('Save failed') }
        finally { setSaving(false) }
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this question?')) return
        try { await deleteDiscoveryQuestion(id); load() }
        catch { setError('Delete failed') }
    }

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Discovery Questions</h1>
                    <p>Questions shown during the career discovery quiz</p>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openCreate}>+ Add Question</button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            {loading ? (
                <div className="admin-loading">Loading…</div>
            ) : questions.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">🔍</div>
                    <h3>No questions yet</h3>
                    <p>Add discovery questions to power the career quiz.</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Question</th>
                                <th>Options</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.sort((a, b) => a.questionOrder - b.questionOrder).map(q => (
                                <tr key={q.id}>
                                    <td style={{ color: 'var(--f-text-muted)', fontSize: '0.85rem' }}>{q.questionOrder}</td>
                                    <td style={{ maxWidth: 340 }}>{q.questionText}</td>
                                    <td>
                                        <span className="admin-badge admin-badge--blue">{(q.options || []).length} options</span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEdit(q)}>Edit</button>
                                        <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(q.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <div className="admin-modal-overlay" onClick={() => setModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                        <h2>{editId ? 'Edit Question' : 'Add Question'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="admin-form-row">
                                <div className="admin-field" style={{ flex: 3 }}>
                                    <label>Question Text *</label>
                                    <input required value={form.questionText}
                                        onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Order</label>
                                    <input type="number" min={1} value={form.questionOrder}
                                        onChange={e => setForm(f => ({ ...f, questionOrder: Number(e.target.value) }))} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--f-text-muted)', fontWeight: 500 }}>Answer Options</label>
                                    <button type="button" className="admin-btn admin-btn--sm admin-btn--secondary" onClick={addOption}>+ Option</button>
                                </div>
                                {form.options.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            placeholder={`Option ${i + 1} text`}
                                            value={opt.optionText}
                                            onChange={e => setOption(i, 'optionText', e.target.value)}
                                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#f0f2ff', fontSize: '0.88rem', fontFamily: 'var(--sans)' }}
                                        />
                                        <input type="number" min={1}
                                            value={opt.optionOrder}
                                            onChange={e => setOption(i, 'optionOrder', Number(e.target.value))}
                                            style={{ width: 60, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.6rem', color: '#f0f2ff', fontSize: '0.88rem', textAlign: 'center' }}
                                            title="Order"
                                        />
                                        <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeOption(i)}>✕</button>
                                    </div>
                                ))}
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
