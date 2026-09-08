import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInstructorCourses, getInstructorStats, submitCourseForApproval, deleteInstructorCourse } from '../../services/instructorService'
import InstructorChatInbox from './InstructorChatInbox'
import './InstructorDashboard.css'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = searchParams.get('tab') === 'messages' || searchParams.get('tab') === 'chat' ? 'MESSAGES' : 'ALL'

  const [stats, setStats] = useState({
    totalCourses: 0,
    drafts: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    totalStudents: 0,
    avgRating: 4.8
  })
  const [courses, setCourses] = useState([])
  const [tab, setTab] = useState(initialTab) // 'ALL' | 'PUBLISHED' | 'PENDING_APPROVAL' | 'DRAFT' | 'REJECTED' | 'MESSAGES'
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const handleTabChange = (newTab) => {
    setTab(newTab)
    if (newTab === 'MESSAGES') {
      setSearchParams({ tab: 'messages' })
    } else {
      setSearchParams({})
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [sData, cData] = await Promise.all([
        getInstructorStats().catch(() => ({})),
        getInstructorCourses().catch(() => [])
      ])
      setStats({
        totalCourses: sData?.totalCourses ?? 0,
        drafts: sData?.drafts ?? sData?.draftCount ?? 0,
        pending: sData?.pending ?? sData?.pendingCount ?? 0,
        published: sData?.published ?? sData?.publishedCount ?? 0,
        rejected: sData?.rejected ?? sData?.rejectedCount ?? 0,
        totalStudents: sData?.totalStudents ?? sData?.totalEnrollments ?? 0,
        avgRating: sData?.avgRating ?? sData?.averageRating ?? 4.8
      })
      setCourses(Array.isArray(cData) ? cData : [])
    } catch (err) {
      console.error('Failed to load instructor data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showNotification = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleSubmitForReview = async (id) => {
    try {
      await submitCourseForApproval(id)
      showNotification('🚀 Course submitted for Admin approval!')
      loadData()
    } catch {
      showNotification('Failed to submit course for review.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    try {
      await deleteInstructorCourse(id)
      showNotification('Course deleted successfully.')
      loadData()
    } catch {
      showNotification('Failed to delete course.')
    }
  }

  const filteredCourses = courses.filter(c => {
    if (tab === 'ALL') return true
    return c.status === tab
  })

  return (
    <div className="inst-dash">
      {toast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          background: 'linear-gradient(135deg, #0284c7, #6366f1)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontWeight: 600,
          animation: 'fadeIn 0.3s'
        }}>
          {toast}
        </div>
      )}

      <div className="inst-dash__inner">
        {/* Header */}
        <div className="inst-dash__header">
          <div>
            <span className="inst-dash__badge">👨‍🏫 Instructor Studio</span>
            <h1 className="inst-dash__title">Welcome, <span className="inst-dash__hl">{user?.name || 'Instructor'}</span></h1>
            <p className="inst-dash__subtitle">Manage courses, answer student inquiries, and mentor your learners in real time.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className={`inst-dash__create-btn ${tab === 'MESSAGES' ? 'inst-dash__create-btn--active' : ''}`}
              style={{ background: tab === 'MESSAGES' ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : undefined }}
              onClick={() => handleTabChange(tab === 'MESSAGES' ? 'ALL' : 'MESSAGES')}
            >
              💬 {tab === 'MESSAGES' ? 'View Courses Studio' : 'Student Messages Inbox'}
            </button>

            {tab !== 'MESSAGES' && (
              <button
                id="btn-create-course-header"
                className="inst-dash__create-btn"
                onClick={() => navigate('/instructor/courses/create')}
              >
                <span>+</span> Create New Course
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="inst-dash__stats-grid">
          <div
            className="inst-dash__stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTabChange('ALL')}
          >
            <div className="inst-dash__stat-icon">📚</div>
            <span className="inst-dash__stat-value">{stats.totalCourses}</span>
            <span className="inst-dash__stat-label">Total Courses</span>
          </div>
          <div
            className="inst-dash__stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTabChange('PUBLISHED')}
          >
            <div className="inst-dash__stat-icon">🚀</div>
            <span className="inst-dash__stat-value" style={{ color: '#34d399' }}>{stats.published}</span>
            <span className="inst-dash__stat-label">Published</span>
          </div>
          <div
            className="inst-dash__stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTabChange('PENDING_APPROVAL')}
          >
            <div className="inst-dash__stat-icon">⏳</div>
            <span className="inst-dash__stat-value" style={{ color: '#fbbf24' }}>{stats.pending}</span>
            <span className="inst-dash__stat-label">Pending Review</span>
          </div>
          <div
            className="inst-dash__stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTabChange('DRAFT')}
          >
            <div className="inst-dash__stat-icon">📝</div>
            <span className="inst-dash__stat-value" style={{ color: '#cbd5e1' }}>{stats.drafts}</span>
            <span className="inst-dash__stat-label">Drafts</span>
          </div>
          <div
            className="inst-dash__stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTabChange('MESSAGES')}
          >
            <div className="inst-dash__stat-icon">💬</div>
            <span className="inst-dash__stat-value" style={{ color: '#38bdf8' }}>Inbox</span>
            <span className="inst-dash__stat-label">Student Messages</span>
          </div>
          <div className="inst-dash__stat-card">
            <div className="inst-dash__stat-icon">👥</div>
            <span className="inst-dash__stat-value">{(stats?.totalStudents ?? 0).toLocaleString()}</span>
            <span className="inst-dash__stat-label">Enrolled Learners</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="inst-dash__tabs">
          <button
            className={`inst-dash__tab-btn ${tab === 'ALL' ? 'inst-dash__tab-btn--active' : ''}`}
            onClick={() => handleTabChange('ALL')}
          >
            All Courses ({courses.length})
          </button>
          <button
            className={`inst-dash__tab-btn ${tab === 'PUBLISHED' ? 'inst-dash__tab-btn--active' : ''}`}
            onClick={() => handleTabChange('PUBLISHED')}
          >
            🚀 Published ({courses.filter(c => c.status === 'PUBLISHED').length})
          </button>
          <button
            className={`inst-dash__tab-btn ${tab === 'PENDING_APPROVAL' ? 'inst-dash__tab-btn--active' : ''}`}
            onClick={() => handleTabChange('PENDING_APPROVAL')}
          >
            ⏳ Pending Approval ({courses.filter(c => c.status === 'PENDING_APPROVAL').length})
          </button>
          <button
            className={`inst-dash__tab-btn ${tab === 'DRAFT' ? 'inst-dash__tab-btn--active' : ''}`}
            onClick={() => handleTabChange('DRAFT')}
          >
            📝 Drafts ({courses.filter(c => c.status === 'DRAFT').length})
          </button>
          <button
            className={`inst-dash__tab-btn ${tab === 'REJECTED' ? 'inst-dash__tab-btn--active' : ''}`}
            onClick={() => handleTabChange('REJECTED')}
          >
            ❌ Needs Changes ({courses.filter(c => c.status === 'REJECTED').length})
          </button>
          <button
            className={`inst-dash__tab-btn ${tab === 'MESSAGES' ? 'inst-dash__tab-btn--active' : ''}`}
            style={{
              background: tab === 'MESSAGES' ? 'rgba(56, 189, 248, 0.2)' : undefined,
              borderColor: tab === 'MESSAGES' ? '#38bdf8' : undefined,
              color: tab === 'MESSAGES' ? '#38bdf8' : undefined
            }}
            onClick={() => handleTabChange('MESSAGES')}
          >
            💬 Student Q&A & Messages
          </button>
        </div>

        {/* ── Render Chat Inbox ── */}
        {tab === 'MESSAGES' && (
          <InstructorChatInbox />
        )}

        {/* ── Render Courses ── */}
        {tab !== 'MESSAGES' && (
          <>
            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#38bdf8' }}>
                <p>⏳ Loading your courses...</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredCourses.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                <h3 style={{ color: '#f8fafc', margin: '0 0 8px' }}>No courses in this status</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 24px' }}>
                  Create a new course or switch tabs to see your other courses.
                </p>
                <button
                  className="inst-dash__create-btn"
                  onClick={() => navigate('/instructor/courses/create')}
                >
                  + Create Course Now
                </button>
              </div>
            )}

            {/* Courses Grid */}
            {!loading && filteredCourses.length > 0 && (
              <div className="inst-dash__courses-grid">
                {filteredCourses.map(course => {
                  const statusClass = course.status ? course.status.toLowerCase() : 'draft'
                  const statusLabel = {
                    PUBLISHED: 'Published',
                    PENDING_APPROVAL: 'Pending Admin Review',
                    REJECTED: 'Changes Requested',
                    DRAFT: 'Draft'
                  }[course.status] || course.status

                  return (
                    <div key={course.id} className="inst-dash__card">
                      <div>
                        <div className="inst-dash__card-header">
                          <span className={`inst-dash__status-badge inst-dash__status-badge--${statusClass === 'pending_approval' ? 'pending' : statusClass}`}>
                            {statusLabel}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {course.durationHours || 4} hrs · {course.difficulty}
                          </span>
                        </div>

                        <h3 className="inst-dash__course-title">{course.title}</h3>

                        {/* Skill tags */}
                        <div className="inst-dash__skills-wrap">
                          {(course.skills || []).map((sk, idx) => (
                            <span key={idx} className="inst-dash__skill-tag">⚡ {sk}</span>
                          ))}
                        </div>

                        {/* Meta count */}
                        <div className="inst-dash__meta-row">
                          <span>📖 {course.lessonsCount || 0} Lessons</span>
                          <span>❓ {course.quizzesCount || 0} Quizzes</span>
                          <span>👥 {course.enrollmentCount || 0} Learners</span>
                          {course.rating > 0 && <span>⭐ {course.rating}</span>}
                        </div>

                        {/* Rejection Alert Box */}
                        {course.status === 'REJECTED' && course.rejectionReason && (
                          <div className="inst-dash__rejection-box">
                            <div className="inst-dash__rejection-title">
                              <span>⚠️ Admin Feedback:</span>
                            </div>
                            <p className="inst-dash__rejection-msg">{course.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="inst-dash__actions">
                        <button
                          className="inst-dash__btn-primary"
                          onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                        >
                          ✏️ {course.status === 'REJECTED' ? 'Edit & Fix' : 'Edit Course'}
                        </button>

                        {(course.status === 'DRAFT' || course.status === 'REJECTED') && (
                          <button
                            className="inst-dash__btn-submit"
                            onClick={() => handleSubmitForReview(course.id)}
                            title="Submit to Admin for Publishing Review"
                          >
                            🚀 {course.status === 'REJECTED' ? 'Resubmit' : 'Submit'}
                          </button>
                        )}

                        <button
                          className="inst-dash__btn-delete"
                          onClick={() => handleDelete(course.id)}
                          title="Delete Course"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

