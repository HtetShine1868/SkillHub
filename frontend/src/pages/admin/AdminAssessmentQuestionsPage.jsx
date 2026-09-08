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
            .then(([q, s]) => {
                setQuestions(Array.isArray(q) ? q : [])
                setSkills(Array.isArray(s) ? s : [])
            })
            .catch(() => setError('Failed to load data'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setForm({ ...EMPTY, options: ['', '', '', ''] })
        setEditId(null)
        setModal(true)
    }

    const openEdit = q => {
        let opts = ['', '', '', '']
        if (Array.isArray(q.options) && q.options.length > 0) {
            opts = [0, 1, 2, 3].map(i => q.options[i] !== undefined ? String(q.options[i]) : '')
        } else if (q.optionsJson) {
            try {
                const parsed = JSON.parse(q.optionsJson)
                if (Array.isArray(parsed)) {
                    opts = [0, 1, 2, 3].map(i => {
                        const item = parsed[i]
                        if (!item) return ''
                        if (typeof item === 'string') return item
                        return item.text || item.label || ''
                    })
                }
            } catch {
                opts = ['', '', '', '']
            }
        }
        let corr = q.correctAnswer || ''
        if (corr && ['A', 'B', 'C', 'D'].includes(corr.toUpperCase())) {
            const idx = corr.toUpperCase().charCodeAt(0) - 65
            if (opts[idx]) corr = opts[idx]
        }
        setForm({
            questionText: q.questionText || q.question || '',
            skillId: q.skillId || q.skill?.id || '',
            difficultyLevel: q.difficultyLevel || (q.difficulty === 1 ? 'BEGINNER' : q.difficulty === 2 ? 'INTERMEDIATE' : q.difficulty === 3 ? 'ADVANCED' : 'EXPERT') || 'BEGINNER',
            correctAnswer: corr,
            options: opts,
            explanation: q.explanation || '',
            pointsValue: q.pointsValue || (q.difficulty ? q.difficulty * 10 : 10),
        })
        setEditId(q.id)
        setModal(true)
    }

    const handleSave = async e => {
        e.preventDefault()
        setError('')
        setSaving(true)
        const filteredOptions = form.options.filter(o => o && o.trim() !== '')
        if (filteredOptions.length < 2) {
            setError('Please provide at least 2 answer options.')
            setSaving(false)
            return
        }
        if (!form.correctAnswer) {
            setError('Please select the correct answer option.')
            setSaving(false)
            return
        }
        const payload = {
            ...form,
            question: form.questionText,
            skillId: form.skillId ? Number(form.skillId) : null,
            options: filteredOptions.length > 0 ? filteredOptions : form.options,
        }
        try {
            if (editId) await updateAssessmentQuestion(editId, payload)
            else await createAssessmentQuestion(payload)
            setModal(false)
            load()
        } catch {
            setError('Failed to save assessment question')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async id => {
        if (!window.confirm('Delete this question?')) return
        try {
            await deleteAssessmentQuestion(id)
            load()
        } catch {
            setError('Delete failed')
        }
    }

    const setOption = (i, val) => {
        setForm(f => {
            const nextOpts = [...f.options]
            nextOpts[i] = val
            // If the current correctAnswer matched the old option value, update it
            let nextCorr = f.correctAnswer
            if (f.correctAnswer === f.options[i]) {
                nextCorr = val
            }
            return { ...f, options: nextOpts, correctAnswer: nextCorr }
        })
    }

    const safeSkills = Array.isArray(skills) ? skills : []
    const safeQuestions = Array.isArray(questions) ? questions : []

    const skillName = (id, fallbackName) => {
        if (fallbackName) return fallbackName
        return safeSkills.find(s => String(s.id) === String(id))?.name || '—'
    }

    const filtered = safeQuestions.filter(q => {
        const text = (q.questionText || q.question || '').toLowerCase()
        const sName = skillName(q.skillId || q.skill?.id, q.skillName).toLowerCase()
        const query = search.toLowerCase()
        return text.includes(query) || sName.includes(query)
    })

    const DIFF_COLORS = {
        BEGINNER: 'admin-badge--green',
        INTERMEDIATE: 'admin-badge--blue',
        ADVANCED: 'admin-badge--orange',
        EXPERT: 'admin-badge--red'
    }

    const availableOptions = (form.options || []).map((opt, i) => ({
        letter: String.fromCharCode(65 + i),
        text: (opt || '').trim(),
        index: i,
    })).filter(o => o.text !== '')

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
                <input
                    className="admin-search"
                    placeholder="Search questions or skills…"
                    value={search || ''}
                    onChange={e => setSearch(e.target.value)}
                />
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
                            {filtered.map(q => {
                                const diff = q.difficultyLevel || (q.difficulty === 1 ? 'BEGINNER' : q.difficulty === 2 ? 'INTERMEDIATE' : q.difficulty === 3 ? 'ADVANCED' : 'EXPERT') || 'BEGINNER'
                                const qText = q.questionText || q.question || '—'
                                return (
                                    <tr key={q.id}>
                                        <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {qText}
                                        </td>
                                        <td>{skillName(q.skillId || q.skill?.id, q.skillName)}</td>
                                        <td>
                                            <span className={`admin-badge ${DIFF_COLORS[diff] || 'admin-badge--blue'}`}>
                                                {diff}
                                            </span>
                                        </td>
                                        <td>{q.pointsValue || (q.difficulty ? q.difficulty * 10 : 10)}</td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEdit(q)}>Edit</button>
                                            <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(q.id)}>Delete</button>
                                        </td>
                                    </tr>
                                )
                            })}
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
                                <textarea
                                    required
                                    rows={3}
                                    value={form.questionText || ''}
                                    placeholder="e.g. Which React Hook is used to perform side effects?"
                                    onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                                />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Skill *</label>
                                    <select
                                        required
                                        value={form.skillId || ''}
                                        onChange={e => setForm(f => ({ ...f, skillId: e.target.value }))}
                                    >
                                        <option value="">— Select skill —</option>
                                        {safeSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="admin-field">
                                    <label>Difficulty</label>
                                    <select
                                        value={form.difficultyLevel || 'BEGINNER'}
                                        onChange={e => setForm(f => ({ ...f, difficultyLevel: e.target.value }))}
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--f-text-muted)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                                    Answer Options (fill in at least 2 options, then select the correct one below)
                                </label>
                                {(form.options || ['', '', '', '']).map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--f-text-muted)', fontSize: '0.8rem', width: 16 }}>{String.fromCharCode(65 + i)}.</span>
                                        <input
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt || ''}
                                            onChange={e => setOption(i, e.target.value)}
                                            style={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 8,
                                                padding: '0.6rem 0.9rem',
                                                color: '#f0f2ff',
                                                fontSize: '0.88rem',
                                                fontFamily: 'var(--sans)'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Correct Answer *</label>
                                    <select
                                        required
                                        value={form.correctAnswer || ''}
                                        onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                                    >
                                        <option value="">— Select Correct Option ({availableOptions.length} available) —</option>
                                        {availableOptions.map(opt => (
                                            <option key={opt.letter} value={opt.text}>
                                                Option {opt.letter}: {opt.text}
                                            </option>
                                        ))}
                                    </select>
                                    {availableOptions.length === 0 && (
                                        <span style={{ fontSize: '0.78rem', color: 'var(--f-text-muted)', marginTop: '0.3rem', display: 'block' }}>
                                            Please enter answer options above first.
                                        </span>
                                    )}
                                </div>
                                <div className="admin-field">
                                    <label>Points Value</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.pointsValue || 10}
                                        onChange={e => setForm(f => ({ ...f, pointsValue: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="admin-field">
                                <label>Explanation (shown after answering)</label>
                                <textarea
                                    rows={2}
                                    value={form.explanation || ''}
                                    onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
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


