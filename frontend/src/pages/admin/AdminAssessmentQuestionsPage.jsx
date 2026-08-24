import { useEffect, useState } from 'react'
import {
    getAssessmentQuestions,
    createAssessmentQuestion,
    updateAssessmentQuestion,
    deleteAssessmentQuestion,
    getAdminSkills,
} from '../../services/adminService'

const EMPTY = {
    questionText: '', skillId: '', difficultyLevel: 'BEGINNER',
    correctAnswer: '', options: ['', '', '', ''],
    explanation: '', pointsValue: 10,
}

export default function AdminAssessmentQuestionsPage() {
    const [questions, setQuestions] = useState([])
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        Promise.all([getAssessmentQuestions(), getAdminSkills()])
            .then(([q, s]) => { setQuestions(q); setSkills(s) })
            .catch(() => setError('Failed to load data'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => { setForm({ ...EMPTY, options: ['', '', '', ''] }); setEditId(null); setModal(true) }
    const openEdit = q => {
        setForm({
            questionText: q.questionText || '',
            skillId: q.skillId || q.skill?.id || '',
            difficultyLevel: q.difficultyLevel || 'BEGINNER',
            correctAnswer: q.correctAnswer || '',
            options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
            explanation: q.explanation || '',
            pointsValue: q.pointsValue || 10,
        })
        setEditId(q.id)
        setModal(true)
    }

    const handleSave = async e => {
        e.preventDefault()
        setSaving(true)
        const payload = { ...form, skillId: Number(form.skillId), options: form.options.filter(Boolean) }
        try {
            if (editId) await updateAssessmentQuestion(editId, payload)
            else await createAssessmentQuestion(payload)
            setModal(false)
            load()
        } catch { setError('Save failed') }
        finally { setSaving(false) }
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this question?')) return
        try { await deleteAssessmentQuestion(id); load() }
        catch { setError('Delete failed') }
    }

    const setOption = (i, val) => setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? val : o) }))

    const skillName = id => skills.find(s => String(s.id) === String(id))?.name || '—'

    const filtered = questions.filter(q =>
        q.questionText?.toLowerCase().includes(search.toLowerCase()) ||
        skillName(q.skillId || q.skill?.id).toLowerCase().includes(search.toLowerCase())
    )

    const DIFF_COLORS = { BEGINNER: 'admin-badge--green', INTERMEDIATE: 'admin-badge--blue', ADVANCED: 'admin-badge--orange', EXPERT: 'admin-badge--red' }

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Assessment Questions</h1>
                    <p>Manage questions used in skill assessments</p>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openCreate}>+ Add Question</button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-toolbar">
                <input className="admin-search" placeholder="Search questions or skills…"
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="admin-loading">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">📝</div>
                    <h3>No questions yet</h3>
                    <p>Add assessment questions to evaluate user skill levels.</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Skill</th>
                                <th>Difficulty</th>
                                <th>Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(q => (
                                <tr key={q.id}>
                                    <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {q.questionText}
                                    </td>
                                    <td>{skillName(q.skillId || q.skill?.id)}</td>
                                    <td>
                                        <span className={`admin-badge ${DIFF_COLORS[q.difficultyLevel] || 'admin-badge--blue'}`}>
                                            {q.difficultyLevel}
                                        </span>
                                    </td>
                                    <td>{q.pointsValue}</td>
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
                        <h2>{editId ? 'Edit Question' : 'Add Assessment Question'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="admin-field">
                                <label>Question Text *</label>
                                <textarea required rows={3} value={form.questionText}
                                    onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Skill *</label>
                                    <select required value={form.skillId}
                                        onChange={e => setForm(f => ({ ...f, skillId: e.target.value }))}>
                                        <option value="">— Select skill —</option>
                                        {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="admin-field">
                                    <label>Difficulty</label>
                                    <select value={form.difficultyLevel}
                                        onChange={e => setForm(f => ({ ...f, difficultyLevel: e.target.value }))}>
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--f-text-muted)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                                    Answer Options (mark the correct one below)
                                </label>
                                {form.options.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--f-text-muted)', fontSize: '0.8rem', width: 16 }}>{String.fromCharCode(65 + i)}.</span>
                                        <input
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt}
                                            onChange={e => setOption(i, e.target.value)}
                                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#f0f2ff', fontSize: '0.88rem', fontFamily: 'var(--sans)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Correct Answer *</label>
                                    <input required value={form.correctAnswer}
                                        placeholder="Exact text of the correct option"
                                        onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Points Value</label>
                                    <input type="number" min={1} value={form.pointsValue}
                                        onChange={e => setForm(f => ({ ...f, pointsValue: Number(e.target.value) }))} />
                                </div>
                            </div>
                            <div className="admin-field">
                                <label>Explanation (shown after answering)</label>
                                <textarea rows={2} value={form.explanation}
                                    onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
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
