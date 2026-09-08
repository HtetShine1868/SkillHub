import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PersonalizedRoadmapPage from './PersonalizedRoadmapPage'
import { getMyEnrollments } from '../services/enrollmentService'
import { getAllCourses } from '../services/courseService'
import { getMyRoadmap } from '../services/roadmapService'
import './MyLearningPage.css'

const CAT_COLOR = { Backend: '#a78bfa', Frontend: '#38bdf8', Data: '#6ee7b7', DevOps: '#fcd34d', Database: '#f9a8d4', Engineering: '#a78bfa' }

const MyLearningPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const filterFromUrl = searchParams.get('filter')
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'roadmap' ? 'roadmap' : 'courses')

  // Courses state
  const [enrollments, setEnrollments] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [filter, setFilter] = useState(filterFromUrl === 'completed' ? 'completed' : 'in_progress')
  const [loading, setLoading] = useState(true)

  // Roadmap state
  const [userRoadmap, setUserRoadmap] = useState(null)
  const [roadmapCompleteness, setRoadmapCompleteness] = useState(0)

  useEffect(() => {
    if (tabFromUrl === 'roadmap') {
      setActiveTab('roadmap')
    } else {
      setActiveTab('courses')
    }
  }, [tabFromUrl])

  // Fetch real enrollments & courses from backend
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [myEnrolls, courses] = await Promise.all([
          getMyEnrollments().catch(() => []),
          getAllCourses().catch(() => [])
        ])

        setEnrollments(myEnrolls || [])
        setAllCourses(courses || [])

        // Attempt to load active user roadmap - check localStorage first
        try {
          const userKeyPrefix = user?.id ? `_${user.id}` : ''
          const roadmapKey = `skillhub_active_roadmap${userKeyPrefix}`
          const careerKey = `skillhub_active_career${userKeyPrefix}`

          const savedRoadmapStr = typeof window !== 'undefined' ? localStorage.getItem(roadmapKey) : null
          const savedCareerStr = typeof window !== 'undefined' ? localStorage.getItem(careerKey) : null

          if (savedRoadmapStr) {
            const roadmap = JSON.parse(savedRoadmapStr)
            if (roadmap && roadmap.items) {
              setUserRoadmap(roadmap)
              const completedCount = roadmap.items.filter(i => i.status === 'COMPLETED').length
              const pct = roadmap.items.length > 0 ? Math.round((completedCount / roadmap.items.length) * 100) : 0
              setRoadmapCompleteness(pct)
            }
          } else if (savedCareerStr) {
            const career = JSON.parse(savedCareerStr)
            if (career && career.id) {
              const roadmap = await getMyRoadmap(career.id).catch(() => null)
              if (roadmap && roadmap.items) {
                setUserRoadmap(roadmap)
                localStorage.setItem(roadmapKey, JSON.stringify(roadmap))
                const completedCount = roadmap.items.filter(i => i.status === 'COMPLETED').length
                const pct = roadmap.items.length > 0 ? Math.round((completedCount / roadmap.items.length) * 100) : 0
                setRoadmapCompleteness(pct)
              }
            }
          }
        } catch {
          // Silently ignore
        }
      } catch (e) {
        console.error("Failed to load learning data", e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setSearchParams(tabKey === 'roadmap' ? { tab: 'roadmap' } : {})
  }

  // Helper functions for enrollment extraction
  const getProgress = (item) => item.progressPercentage ?? item.progress ?? 0
  const checkCompleted = (item) => item.completed === true || item.status === 'COMPLETED' || getProgress(item) >= 100
  const getCourseId = (item) => item.course?.id || item.courseId || item.id

  // Derive in-progress and completed list
  const inProgressEnrollments = enrollments.filter(e => !checkCompleted(e))
  const completedEnrollments = enrollments.filter(e => checkCompleted(e))

  // Show enrolled courses if user has any; otherwise show available catalog courses
  const isEnrolledView = enrollments.length > 0
  const displayedCourses = isEnrolledView ? enrollments : allCourses.map(c => ({
    id: c.id,
    courseId: c.id,
    title: c.title,
    category: c.category || 'Engineering',
    progress: 0,
    progressPercentage: 0,
    status: 'NOT_STARTED',
    completed: false,
    completedLessons: 0,
    totalLessons: c.durationHours || 10
  }))

  const filteredCourses = displayedCourses.filter(item => {
    const isComp = checkCompleted(item)
    if (filter === 'in_progress') return !isComp
    if (filter === 'completed') return isComp
    return true
  }).sort((a, b) => getProgress(b) - getProgress(a)) // Priority: highest progress first

  return (
    <div className="mylearn">
      <div className="mylearn__blob mylearn__blob--1" />
      <div className="mylearn__blob mylearn__blob--2" />

      <div className="mylearn__inner">
        {/* Header */}
        <div className="mylearn__header">
          <div className="mylearn__badge">🎓 My Space</div>
          <h1 className="mylearn__title">Your Learning <span className="mylearn__hl">Journey</span></h1>
          <p className="mylearn__subtitle">Track your enrolled courses, monitor milestone progress, and build your career skills.</p>
          
          {/* Sub-tabs Navigation */}
          <div className="mylearn__nav-tabs">
            <button
              id="tab-btn-mycourses"
              className={`mylearn__tab-btn ${activeTab === 'courses' ? 'mylearn__tab-btn--active' : ''}`}
              onClick={() => handleTabChange('courses')}
            >
              📚 My Courses ({enrollments.length || allCourses.length})
            </button>
            <button
              id="tab-btn-myroadmap"
              className={`mylearn__tab-btn ${activeTab === 'roadmap' ? 'mylearn__tab-btn--active' : ''}`}
              onClick={() => handleTabChange('roadmap')}
            >
              🗺️ My Career Roadmap {userRoadmap ? `(${roadmapCompleteness}%)` : ''}
            </button>
          </div>
        </div>

        {/* ── Sub-Tab 1: Courses ── */}
        {activeTab === 'courses' && (
          <>
            {/* Filters toolbar */}
            <div className="mylearn__filter-bar">
              <span className="mylearn__filter-label">Filter:</span>
              <button
                className={`mylearn__filter-btn ${filter === 'in_progress' ? 'mylearn__filter-btn--active' : ''}`}
                onClick={() => setFilter('in_progress')}
              >
                🔥 In Progress ({inProgressEnrollments.length})
              </button>
              <button
                className={`mylearn__filter-btn ${filter === 'all' ? 'mylearn__filter-btn--active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Courses ({displayedCourses.length})
              </button>
              <button
                className={`mylearn__filter-btn ${filter === 'completed' ? 'mylearn__filter-btn--active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                ✅ Completed ({completedEnrollments.length})
              </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#a78bfa' }}>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>⏳ Loading your learning space...</p>
              </div>
            )}

            {/* Empty state when filtering in_progress but user hasn't started any yet */}
            {!loading && filteredCourses.length === 0 && filter === 'in_progress' && (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                margin: '20px 0'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
                <h3 style={{ color: '#f8fafc', margin: '0 0 8px' }}>No courses in progress yet</h3>
                <p style={{ color: '#cbd5e1', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px' }}>
                  Explore available courses from our catalog or generate your career roadmap to begin learning.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setFilter('all')}
                  >
                    View All Courses →
                  </button>
                  <button
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/careers')}
                  >
                    Generate Roadmap 🗺️
                  </button>
                </div>
              </div>
            )}

            {/* Courses List */}
            {!loading && (
              <section className="mylearn__section">
              <div className="mylearn__course-list">
                {filteredCourses.map(item => {
                  const title = item.course?.title || item.title || 'Course'
                  const cat = item.course?.category || item.category || 'Backend'
                  const pct = getProgress(item)
                  const isDone = checkCompleted(item)
                  const courseTargetId = getCourseId(item)

                  return (
                    <div key={item.id} className="mylearn__course-card">
                      <div className="mylearn__course-top">
                        <div>
                          <span className="mylearn__course-cat" style={{ color: CAT_COLOR[cat] || '#a78bfa' }}>
                            {cat}
                          </span>
                          <h3 className="mylearn__course-title">{title}</h3>
                          <span style={{ fontSize: '0.8rem', color: isDone ? '#4ade80' : '#a78bfa', fontWeight: 600 }}>
                            {isDone ? '✓ Completed' : `${pct}% Completed`}
                          </span>
                        </div>
                        <div className="mylearn__progress-circle">
                          <svg viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="24" className="mylearn__circle-bg" />
                            <circle cx="30" cy="30" r="24" className="mylearn__circle-fill"
                              strokeDasharray={`${(pct / 100) * 150.8} 150.8`} />
                          </svg>
                          <span className="mylearn__progress-pct">{pct}%</span>
                        </div>
                      </div>
                      <div className="mylearn__progress-track">
                        <div className="mylearn__progress-fill" style={{ width: `${pct}%`, background: isDone ? '#10b981' : undefined }} />
                      </div>
                      <button
                        id={`btn-continue-${item.id}`}
                        className="mylearn__continue-btn"
                        onClick={() => navigate(`/courses/${courseTargetId}`)}
                      >
                        {isDone ? 'Review Course →' : 'Continue Learning →'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
            )}
          </>
        )}

        {/* ── Sub-Tab 2: My Roadmap ── */}
        {activeTab === 'roadmap' && (
          <div className="mylearn__roadmap-wrapper">
            <PersonalizedRoadmapPage />
          </div>
        )}
      </div>
    </div>
  )
}

export default MyLearningPage
