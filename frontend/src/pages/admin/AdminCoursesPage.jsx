import { useEffect, useState } from 'react'
import {
    getAdminCourses,
    createAdminCourse,
    updateAdminCourse,
    deleteAdminCourse,
    toggleCoursePublished,
    approveAdminCourse,
    rejectAdminCourse,
    getAdminLessons,
    createAdminLesson,
    updateAdminLesson,
    deleteAdminLesson,
} from '../../services/adminService'

const EMPTY_COURSE = {
    title: '', description: '', category: '', difficulty: 'BEGINNER',
    durationHours: 1, thumbnailUrl: '', published: true,
}
const EMPTY_LESSON = { title: '', lessonOrder: 1, estimatedMinutes: 15, content: '' }

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState([])
    const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'DRAFT'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    // Course modal
    const [courseModal, setCourseModal] = useState(false)
    const [courseForm, setCourseForm] = useState(EMPTY_COURSE)
    const [editCourseId, setEditCourseId] = useState(null)
    const [savingCourse, setSavingCourse] = useState(false)

    // Rejection Modal
    const [rejectModal, setRejectModal] = useState(false)
    const [rejectingCourseId, setRejectingCourseId] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Lesson panel
    const [activeCourse, setActiveCourse] = useState(null)
    const [lessons, setLessons] = useState([])
    const [lessonsLoading, setLessonsLoading] = useState(false)
    const [lessonModal, setLessonModal] = useState(false)
    const [lessonForm, setLessonForm] = useState(EMPTY_LESSON)
    const [editLessonId, setEditLessonId] = useState(null)
    const [savingLesson, setSavingLesson] = useState(false)

    const loadCourses = () => {
        setLoading(true)
        getAdminCourses()
            .then(data => setCourses(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load courses'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadCourses() }, [])

    // ── Approval handlers ────────────────────────────
    const handleApproveCourse = async (id) => {
        try {
            await approveAdminCourse(id)
            setCourses(prev => prev.map(c => String(c.id) === String(id) ? { ...c, status: 'PUBLISHED', published: true, rejectionReason: null } : c))
        } catch {
            setError('Failed to approve course')
        }
    }

    const openRejectModal = (id) => {
        setRejectingCourseId(id)
        setRejectionReason('Please add more comprehensive lesson materials, practical exercises, and quizzes.')
        setRejectModal(true)
    }

    const handleConfirmReject = async () => {
        if (!rejectingCourseId) return
        try {
            await rejectAdminCourse(rejectingCourseId, rejectionReason)
            setCourses(prev => prev.map(c => String(c.id) === String(rejectingCourseId) ? { ...c, status: 'REJECTED', published: false, rejectionReason } : c))
            setRejectModal(false)
            setRejectingCourseId(null)
        } catch {
            setError('Failed to reject course')
        }
    }

    // ── Course handlers ────────────────────────────
    const openCreateCourse = () => { setCourseForm(EMPTY_COURSE); setEditCourseId(null); setCourseModal(true) }
    const openEditCourse = c => {
        setCourseForm({
            title: c.title, description: c.description, category: c.category,
            difficulty: c.difficulty, durationHours: c.durationHours,
            thumbnailUrl: c.thumbnailUrl || '', published: c.published ?? true,
        })
        setEditCourseId(c.id)
        setCourseModal(true)
    }

    const handleSaveCourse = async e => {
        e.preventDefault()
        setSavingCourse(true)
        try {
            if (editCourseId) await updateAdminCourse(editCourseId, courseForm)
            else await createAdminCourse(courseForm)
            setCourseModal(false)
            loadCourses()
        } catch { setError('Save failed') }
        finally { setSavingCourse(false) }
    }

    const handleDeleteCourse = async id => {
        if (!window.confirm('Delete this course and all its lessons?')) return
        try { await deleteAdminCourse(id); if (activeCourse?.id === id) setActiveCourse(null); loadCourses() }
        catch { setError('Delete failed') }
    }

    const handleToggleCourse = async id => {
        try { await toggleCoursePublished(id); loadCourses() }
        catch { setError('Toggle failed') }
    }

    // ── Lesson handlers ────────────────────────────
    const openLessons = course => {
        setActiveCourse(course)
        setLessonsLoading(true)
        getAdminLessons(course.id)
            .then(setLessons)
            .catch(() => setError('Failed to load lessons'))
            .finally(() => setLessonsLoading(false))
    }

    const openCreateLesson = () => {
        setLessonForm({ ...EMPTY_LESSON, lessonOrder: lessons.length + 1 })
        setEditLessonId(null)
        setLessonModal(true)
    }

    const openEditLesson = l => {
        setLessonForm({ title: l.title, lessonOrder: l.lessonOrder, estimatedMinutes: l.estimatedMinutes, content: l.content || '' })
        setEditLessonId(l.id)
        setLessonModal(true)
    }

    const handleSaveLesson = async e => {
        e.preventDefault()
        setSavingLesson(true)
        try {
            if (editLessonId) await updateAdminLesson(activeCourse.id, editLessonId, lessonForm)
            else await createAdminLesson(activeCourse.id, lessonForm)
            setLessonModal(false)
            openLessons(activeCourse)
        } catch { setError('Lesson save failed') }
        finally { setSavingLesson(false) }
    }

    const handleDeleteLesson = async id => {
        if (!window.confirm('Delete this lesson?')) return
        try { await deleteAdminLesson(activeCourse.id, id); openLessons(activeCourse) }
        catch { setError('Delete failed') }
    }

    const DIFF = { BEGINNER: 'admin-badge--green', INTERMEDIATE: 'admin-badge--blue', ADVANCED: 'admin-badge--orange', EXPERT: 'admin-badge--red' }

    const safeCourses = Array.isArray(courses) ? courses : []
    const safeLessons = Array.isArray(lessons) ? [...lessons] : []

    const pendingCount = safeCourses.filter(c => c.status === 'PENDING_APPROVAL' || (!c.published && c.status !== 'DRAFT' && c.status !== 'REJECTED')).length

    const filtered = safeCourses.filter(c => {
        const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.category?.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false

        const cStatus = c.status || (c.published ? 'PUBLISHED' : 'DRAFT')
        if (statusFilter === 'ALL') return true
        if (statusFilter === 'PENDING_APPROVAL') return cStatus === 'PENDING_APPROVAL'
        if (statusFilter === 'PUBLISHED') return cStatus === 'PUBLISHED'
        if (statusFilter === 'REJECTED') return cStatus === 'REJECTED'
        if (statusFilter === 'DRAFT') return cStatus === 'DRAFT'
        return true
    })

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Courses &amp; Approval System</h1>
                    <p>Review instructor submissions, approve content for public catalog, and manage curriculum.</p>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openCreateCourse}>+ Add Course</button>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    className={`admin-btn admin-btn--sm ${statusFilter === 'ALL' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => setStatusFilter('ALL')}
                >
                    All Courses ({safeCourses.length})
                </button>
                <button
                    className={`admin-btn admin-btn--sm ${statusFilter === 'PENDING_APPROVAL' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => setStatusFilter('PENDING_APPROVAL')}
                    style={pendingCount > 0 ? { border: '1px solid #fbbf24', color: '#fbbf24' } : {}}
                >
                    ⏳ Pending Review ({pendingCount})
                </button>
                <button
                    className={`admin-btn admin-btn--sm ${statusFilter === 'PUBLISHED' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => setStatusFilter('PUBLISHED')}
                >
                    🚀 Published
                </button>
                <button
                    className={`admin-btn admin-btn--sm ${statusFilter === 'REJECTED' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => setStatusFilter('REJECTED')}
                >
                    ❌ Rejected
                </button>
                <button
                    className={`admin-btn admin-btn--sm ${statusFilter === 'DRAFT' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => setStatusFilter('DRAFT')}
                >
                    📝 Drafts
                </button>
            </div>

            {error && <div className="admin-error" onClick={() => setError('')}>{error} ✕</div>}

            <div style={{ display: 'grid', gridTemplateColumns: activeCourse ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                {/* Courses panel */}
                <div>
                    <div className="admin-toolbar">
                        <input className="admin-search" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {loading ? (
                        <div className="admin-loading">Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📚</div>
                            <h3>No courses matching this filter</h3>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Diff.</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(c => {
                                        const cStatus = c.status || (c.published ? 'PUBLISHED' : 'DRAFT')
                                        const isPending = cStatus === 'PENDING_APPROVAL'
                                        
                                        return (
                                        <tr key={c.id} style={activeCourse?.id === c.id ? { background: 'rgba(167,139,250,0.06)' } : {}}>
                                            <td>
                                                <button
                                                    style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'left', fontSize: 'inherit' }}
                                                    onClick={() => openLessons(c)}
                                                >
                                                    {c.title}
                                                </button>
                                                {c.rejectionReason && (
                                                    <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>
                                                        Reason: {c.rejectionReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{c.category}</td>
                                            <td><span className={`admin-badge ${DIFF[c.difficulty] || 'admin-badge--blue'}`}>{c.difficulty}</span></td>
                                            <td>
                                                <span className={`admin-badge ${cStatus === 'PUBLISHED' ? 'admin-badge--green' : cStatus === 'PENDING_APPROVAL' ? 'admin-badge--orange' : cStatus === 'REJECTED' ? 'admin-badge--red' : 'admin-badge--blue'}`}>
                                                    {cStatus === 'PENDING_APPROVAL' ? 'Pending Review' : cStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    {isPending && (
                                                        <>
                                                            <button className="admin-btn admin-btn--sm admin-btn--success" onClick={() => handleApproveCourse(c.id)}>
                                                                ✓ Approve
                                                            </button>
                                                            <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => openRejectModal(c.id)}>
                                                                ✕ Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEditCourse(c)}>Edit</button>
                                                    {!isPending && (
                                                        <button className="admin-btn admin-btn--sm admin-btn--success" onClick={() => handleToggleCourse(c.id)}>
                                                            {c.published ? 'Unpublish' : 'Publish'}
                                                        </button>
                                                    )}
                                                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDeleteCourse(c.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Lessons panel */}
                {activeCourse && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ color: '#f0f2ff', fontSize: '1rem', margin: 0 }}>Lessons — <em style={{ color: '#a78bfa' }}>{activeCourse.title}</em></h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={openCreateLesson}>+ Add Lesson</button>
                                <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => setActiveCourse(null)}>✕</button>
                            </div>
                        </div>

                        {lessonsLoading ? (
                            <div className="admin-loading">Loading lessons…</div>
                        ) : safeLessons.length === 0 ? (
                            <div className="admin-empty" style={{ padding: '2rem' }}>
                                <div className="admin-empty-icon">📖</div>
                                <h3>No lessons yet</h3>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Mins</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safeLessons.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0)).map(l => (
                                            <tr key={l.id}>
                                                <td style={{ color: 'var(--f-text-muted)', fontSize: '0.8rem' }}>{l.lessonOrder}</td>
                                                <td>{l.title}</td>
                                                <td>{l.estimatedMinutes}m</td>
                                                <td style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEditLesson(l)}>Edit</button>
                                                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDeleteLesson(l.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Course Modal */}
            {courseModal && (
                <div className="admin-modal-overlay" onClick={() => setCourseModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                        <h2>{editCourseId ? 'Edit Course' : 'Add Course'}</h2>
                        <form onSubmit={handleSaveCourse}>
                            <div className="admin-field">
                                <label>Title *</label>
                                <input required value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div className="admin-field">
                                <label>Description *</label>
                                <textarea required rows={3} value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Category *</label>
                                    <input required value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Difficulty</label>
                                    <select value={courseForm.difficulty} onChange={e => setCourseForm(f => ({ ...f, difficulty: e.target.value }))}>
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-field">
                                    <label>Duration (hours)</label>
                                    <input type="number" min={1} value={courseForm.durationHours} onChange={e => setCourseForm(f => ({ ...f, durationHours: Number(e.target.value) }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Thumbnail URL</label>
                                    <input value={courseForm.thumbnailUrl} onChange={e => setCourseForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
                                </div>
                            </div>
                            <div className="admin-field">
                                <label>
                                    <input type="checkbox" checked={courseForm.published} onChange={e => setCourseForm(f => ({ ...f, published: e.target.checked }))} />
                                    {' '}Published
                                </label>
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setCourseModal(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn--primary" disabled={savingCourse}>{savingCourse ? 'Saving…' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lesson Modal */}
            {lessonModal && (
                <div className="admin-modal-overlay" onClick={() => setLessonModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editLessonId ? 'Edit Lesson' : 'Add Lesson'}</h2>
                        <form onSubmit={handleSaveLesson}>
                            <div className="admin-form-row">
                                <div className="admin-field" style={{ flex: 3 }}>
                                    <label>Title *</label>
                                    <input required value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Order</label>
                                    <input type="number" min={1} value={lessonForm.lessonOrder} onChange={e => setLessonForm(f => ({ ...f, lessonOrder: Number(e.target.value) }))} />
                                </div>
                                <div className="admin-field">
                                    <label>Duration (mins)</label>
                                    <input type="number" min={1} value={lessonForm.estimatedMinutes} onChange={e => setLessonForm(f => ({ ...f, estimatedMinutes: Number(e.target.value) }))} />
                                </div>
                            </div>
                            <div className="admin-field">
                                <label>Content</label>
                                <textarea rows={6} value={lessonForm.content} onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))} placeholder="Lesson markdown content…" />
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setLessonModal(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn--primary" disabled={savingLesson}>{savingLesson ? 'Saving…' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectModal && (
                <div className="admin-modal-overlay" onClick={() => setRejectModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: '#f87171' }}>Reject Course Submission</h2>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Provide constructive feedback to the instructor explaining what changes or additions are needed before this course can be approved.
                        </p>
                        <div className="admin-field">
                            <label>Feedback / Reason for Rejection *</label>
                            <textarea
                                rows={4}
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="Explain what content, lessons, or exercises need improvement..."
                            />
                        </div>
                        <div className="admin-modal-actions">
                            <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setRejectModal(false)}>Cancel</button>
                            <button type="button" className="admin-btn admin-btn--danger" onClick={handleConfirmReject}>Confirm Rejection ✕</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
