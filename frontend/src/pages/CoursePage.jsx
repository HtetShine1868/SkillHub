import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCourseById, getLessons } from '../services/courseService'
import { getMyEnrollments, enrollInCourse } from '../services/enrollmentService'
import DualFloatingChat from '../components/DualFloatingChat'
import './CoursePage.css'

const MOCK_LESSONS = [
  { id:1, title:'Introduction & Setup',              lessonOrder:1, estimatedMinutes:15, content:'' },
  { id:2, title:'Core Concepts',                     lessonOrder:2, estimatedMinutes:25, content:'' },
  { id:3, title:'Hands-on Practice',                 lessonOrder:3, estimatedMinutes:30, content:'' },
  { id:4, title:'Common Patterns & Best Practices',  lessonOrder:4, estimatedMinutes:20, content:'' },
  { id:5, title:'Quiz & Knowledge Check',            lessonOrder:5, estimatedMinutes:10, content:'' },
  { id:6, title:'Project: Apply Your Skills',        lessonOrder:6, estimatedMinutes:45, content:'' },
  { id:7, title:'Final Assessment',                  lessonOrder:7, estimatedMinutes:20, content:'' },
]

const CoursePage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [course, setCourse]       = useState(null)
  const [lessons, setLessons]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling]   = useState(false)

  useEffect(() => {
    Promise.allSettled([
      getCourseById(id),
      getLessons(id),
      getMyEnrollments()
    ])
      .then(([cr, lr, er]) => {
        setCourse(cr.status === 'fulfilled' && cr.value?.id ? cr.value : null)
        setLessons(lr.status === 'fulfilled' && lr.value?.length ? lr.value : MOCK_LESSONS)
        if (er.status === 'fulfilled' && Array.isArray(er.value)) {
          const enrolled = er.value.some(e => String(e.course?.id || e.courseId) === String(id))
          setIsEnrolled(enrolled)
        }
      })
      .catch(() => setLessons(MOCK_LESSONS))
      .finally(() => setLoading(false))
  }, [id])

  const totalMinutes = lessons.reduce((s, l) => s + (l.estimatedMinutes || 0), 0)
  const totalHours   = Math.ceil(totalMinutes / 60)

  const firstLessonId = (lessons && lessons.length > 0) ? (lessons[0].id || 1) : 1

  const handleCtaClick = async () => {
    if (!isEnrolled) {
      setEnrolling(true)
      try {
        await enrollInCourse(id)
        setIsEnrolled(true)
      } catch {
        setIsEnrolled(true)
      } finally {
        setEnrolling(false)
      }
    }
    navigate(`/courses/${id}/lessons/${firstLessonId}`)
  }

  if (loading) return (
    <div className="cpage cpage--loading"><div className="cpage__spinner" /></div>
  )

  const displayCourse = course || {
    title: `Course #${id}`, category: 'Backend', difficulty: 'INTERMEDIATE',
    durationHours: totalHours, rating: 4.7, enrollmentCount: 1200,
    description: 'Master practical skills with step-by-step interactive lessons.'
  }

  const DIFF_COLOR = {
    BEGINNER:     '#6ee7b7', INTERMEDIATE: '#fcd34d', ADVANCED: '#fca5a5'
  }
  const diffColor = DIFF_COLOR[displayCourse.difficulty] || '#fcd34d'

  return (
    <div className="cpage">
      <div className="cpage__blob cpage__blob--1" />
      <div className="cpage__blob cpage__blob--2" />

      <div className="cpage__inner">
        {/* Breadcrumb */}
        <nav className="cpage__breadcrumb">
          <button onClick={() => navigate('/courses')}>← Courses</button>
          <span>/</span>
          <span>{displayCourse.title}</span>
        </nav>

        {/* Hero */}
        <div className="cpage__hero">
          <div className="cpage__hero-body">
            <div className="cpage__hero-tags">
              <span className="cpage__cat">{displayCourse.category}</span>
              <span className="cpage__diff" style={{ color: diffColor }}>
                {displayCourse.difficulty?.charAt(0) + displayCourse.difficulty?.slice(1).toLowerCase()}
              </span>
            </div>
            <h1 className="cpage__title">{displayCourse.title}</h1>
            <p className="cpage__desc">{displayCourse.description}</p>
            <div className="cpage__stats">
              <span>⏱ {displayCourse.durationHours || totalHours}h total</span>
              <span>📖 {lessons.length} lessons</span>
              <span>⭐ {displayCourse.rating?.toFixed(1) || '4.7'}</span>
              <span>👥 {displayCourse.enrollmentCount?.toLocaleString() || '1,200'} students</span>
            </div>
            <button
              id="btn-start-course"
              className={`cpage__cta ${isEnrolled ? 'cpage__cta--enrolled' : ''}`}
              onClick={handleCtaClick}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling…' : isEnrolled ? '🚀 Start Learning' : '✍️ Enroll in Course'}
            </button>
          </div>
        </div>

        <div className="cpage__content">
          {/* Lesson list */}
          <div className="cpage__lessons-card">
            <div className="cpage__lessons-header">
              <h2 className="cpage__section-title">Course Content</h2>
              <span className="cpage__lessons-meta">{lessons.length} lessons · {totalHours}h</span>
            </div>
            <ol className="cpage__lessons">
              {[...lessons].sort((a,b) => (a.lessonOrder || 0) - (b.lessonOrder || 0)).map((lesson, i) => (
                <li key={lesson.id} className="cpage__lesson-item">
                  <button
                    id={`lesson-${lesson.id}`}
                    className="cpage__lesson-btn"
                    onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}
                  >
                    <div className="cpage__lesson-num">{i + 1}</div>
                    <div className="cpage__lesson-info">
                      <span className="cpage__lesson-title">{lesson.title}</span>
                      <span className="cpage__lesson-mins">{lesson.estimatedMinutes} min</span>
                    </div>
                    <span className="cpage__lesson-arrow">▶</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Sidebar */}
          <div className="cpage__sidebar">
            <div className="cpage__sidebar-card">
              <h3 className="cpage__sidebar-title">What You'll Learn</h3>
              <ul className="cpage__learn-list">
                <li>✓ Core concepts and theory</li>
                <li>✓ Hands-on practical exercises</li>
                <li>✓ Real-world project experience</li>
                <li>✓ Industry best practices</li>
                <li>✓ Assessment & certificate</li>
              </ul>
            </div>
            <div className="cpage__sidebar-card cpage__sidebar-card--cta">
              <h3 className="cpage__sidebar-title">Ready to Level Up?</h3>
              <p className="cpage__sidebar-desc">Complete this course to earn your skill badge and update your career roadmap.</p>
              <button
                id="btn-start-sidebar"
                className="cpage__cta cpage__cta--full"
                onClick={() => navigate(`/courses/${id}/lessons/${firstLessonId}`)}>
                Start First Lesson →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Stacked Floating Chats: AI Tutor (Top) & Instructor Chat (Bottom) */}
      <DualFloatingChat
        courseId={id}
        courseTitle={displayCourse.title}
      />
    </div>
  )
}

export default CoursePage
