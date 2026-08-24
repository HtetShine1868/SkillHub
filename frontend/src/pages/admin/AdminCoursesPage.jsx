import { useEffect, useState } from 'react'
import {
    getAdminCourses,
    createAdminCourse,
    updateAdminCourse,
    deleteAdminCourse,
    toggleCoursePublished,
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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    // Course modal
    const [courseModal, setCourseModal] = useState(false)
    const [courseForm, setCourseForm] = useState(EMPTY_COURSE)
    const [editCourseId, setEditCourseId] = useState(null)
    const [savingCourse, setSavingCourse] = useState(false)

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
            .then(setCourses)
            .catch(() => setError('Failed to load courses'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadCourses() }, [])

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

    const filtered = courses.filter(c =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Courses &amp; Lessons</h1>
                    <p>Manage all courses and their lesson content</p>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openCreateCourse}>+ Add Course</button>
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
                            <h3>No courses yet</h3>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Diff.</th>
                                        <th>Hrs</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(c => (
                                        <tr key={c.id} style={activeCourse?.id === c.id ? { background: 'rgba(167,139,250,0.06)' } : {}}>
                                            <td>
                                                <button
                                                    style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'left', fontSize: 'inherit' }}
                                                    onClick={() => openLessons(c)}
                                                >
                                                    {c.title}
                                                </button>
                                            </td>
                                            <td>{c.category}</td>
                                            <td><span className={`admin-badge ${DIFF[c.difficulty] || 'admin-badge--blue'}`}>{c.difficulty}</span></td>
                                            <td>{c.durationHours}h</td>
                                            <td>
                                                <span className={`admin-badge ${c.published ? 'admin-badge--green' : 'admin-badge--red'}`}>
                                                    {c.published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => openEditCourse(c)}>Edit</button>
                                                    <button className="admin-btn admin-btn--sm admin-btn--success" onClick={() => handleToggleCourse(c.id)}>
                                                        {c.published ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDeleteCourse(c.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                        ) : lessons.length === 0 ? (
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
                                        {lessons.sort((a, b) => a.lessonOrder - b.lessonOrder).map(l => (
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
        </div>
    )
}
