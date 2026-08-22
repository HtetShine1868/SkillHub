import { useNavigate } from 'react-router-dom'
import './MyLearningPage.css'

/* Mock data — will be replaced with real enrollment API in Phase 6 */
const MOCK_IN_PROGRESS = [
  { id:1, title:'Java Fundamentals',        category:'Backend',  progress:65, totalLessons:12, completedLessons:8, lastLesson:'OOP Principles',    nextLessonId:5 },
  { id:3, title:'React & Modern CSS',       category:'Frontend', progress:30, totalLessons:10, completedLessons:3, lastLesson:'React Hooks',        nextLessonId:4 },
  { id:7, title:'Python for Data Science',  category:'Data',     progress:10, totalLessons:14, completedLessons:1, lastLesson:'NumPy Basics',       nextLessonId:2 },
]
const MOCK_COMPLETED = [
  { id:10, title:'Git & CI/CD Pipelines', category:'DevOps',   completedAt:'2026-08-10', rating:5 },
  { id:5,  title:'SQL & Database Design', category:'Database', completedAt:'2026-07-22', rating:4 },
]
const MOCK_SKILLS = [
  { name:'Java',              level:3, maxLevel:5 },
  { name:'Spring Boot',      level:2, maxLevel:5 },
  { name:'React',            level:2, maxLevel:5 },
  { name:'SQL',              level:4, maxLevel:5 },
  { name:'Git',              level:4, maxLevel:5 },
  { name:'Python',           level:1, maxLevel:5 },
]

const LEVEL_LABEL = ['None','Beginner','Basic','Intermediate','Advanced','Expert']
const CAT_COLOR   = { Backend:'#a78bfa', Frontend:'#38bdf8', Data:'#6ee7b7', DevOps:'#fcd34d', Database:'#f9a8d4' }

const MyLearningPage = () => {
  const navigate = useNavigate()

  return (
    <div className="mylearn">
      <div className="mylearn__blob mylearn__blob--1" />
      <div className="mylearn__blob mylearn__blob--2" />

      <div className="mylearn__inner">
        {/* Header */}
        <div className="mylearn__header">
          <div className="mylearn__badge">🎓 My Learning</div>
          <h1 className="mylearn__title">Your Learning <span className="mylearn__hl">Journey</span></h1>
          <p className="mylearn__subtitle">Track your progress, continue courses, and see how your skills are growing.</p>
        </div>

        {/* Stats row */}
        <div className="mylearn__stats-row">
          {[
            { icon:'📚', label:'In Progress',  value: MOCK_IN_PROGRESS.length },
            { icon:'✅', label:'Completed',    value: MOCK_COMPLETED.length },
            { icon:'🧠', label:'Skills Gained',value: MOCK_SKILLS.filter(s => s.level >= 2).length },
            { icon:'⏱',  label:'Hours Learned',value: '48h' },
          ].map(stat => (
            <div key={stat.label} className="mylearn__stat-card">
              <span className="mylearn__stat-icon">{stat.icon}</span>
              <span className="mylearn__stat-value">{stat.value}</span>
              <span className="mylearn__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* In Progress */}
        <section className="mylearn__section">
          <h2 className="mylearn__section-title">Continue Learning</h2>
          <div className="mylearn__course-list">
            {MOCK_IN_PROGRESS.map(course => (
              <div key={course.id} className="mylearn__course-card">
                <div className="mylearn__course-top">
                  <div>
                    <span className="mylearn__course-cat" style={{ color: CAT_COLOR[course.category] || '#a78bfa' }}>
                      {course.category}
                    </span>
                    <h3 className="mylearn__course-title">{course.title}</h3>
                    <p className="mylearn__course-last">Last: {course.lastLesson}</p>
                  </div>
                  <div className="mylearn__progress-circle">
                    <svg viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="24" className="mylearn__circle-bg" />
                      <circle cx="30" cy="30" r="24" className="mylearn__circle-fill"
                        strokeDasharray={`${(course.progress / 100) * 150.8} 150.8`} />
                    </svg>
                    <span className="mylearn__progress-pct">{course.progress}%</span>
                  </div>
                </div>
                <div className="mylearn__progress-track">
                  <div className="mylearn__progress-fill" style={{ width: `${course.progress}%` }} />
                </div>
                <div className="mylearn__course-meta">
                  <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                </div>
                <button
                  id={`btn-continue-${course.id}`}
                  className="mylearn__continue-btn"
                  onClick={() => navigate(`/courses/${course.id}/lessons/${course.nextLessonId}`)}
                >
                  Continue →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Progress */}
        <section className="mylearn__section">
          <h2 className="mylearn__section-title">Your Skill Profile</h2>
          <div className="mylearn__skills-card">
            {MOCK_SKILLS.map(skill => (
              <div key={skill.name} className="mylearn__skill">
                <div className="mylearn__skill-row">
                  <span className="mylearn__skill-name">{skill.name}</span>
                  <span className="mylearn__skill-level">{LEVEL_LABEL[skill.level]}</span>
                </div>
                <div className="mylearn__skill-track">
                  <div className="mylearn__skill-fill" style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Completed */}
        {MOCK_COMPLETED.length > 0 && (
          <section className="mylearn__section">
            <h2 className="mylearn__section-title">Completed Courses</h2>
            <div className="mylearn__completed-list">
              {MOCK_COMPLETED.map(course => (
                <div key={course.id} className="mylearn__completed-card">
                  <div className="mylearn__completed-check">✓</div>
                  <div className="mylearn__completed-info">
                    <h3 className="mylearn__completed-title">{course.title}</h3>
                    <span className="mylearn__completed-meta">{course.category} · Completed {course.completedAt}</span>
                  </div>
                  <div className="mylearn__completed-rating">
                    {'⭐'.repeat(course.rating)}
                  </div>
                  <button id={`btn-review-${course.id}`} className="mylearn__review-btn" onClick={() => navigate(`/courses/${course.id}`)}>
                    Review
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mylearn__explore-cta">
          <h3>Discover More Courses</h3>
          <p>Expand your skill set with hundreds of expert-designed courses aligned to your career path.</p>
          <button id="btn-explore-courses" className="mylearn__explore-btn" onClick={() => navigate('/courses')}>
            Browse Course Library →
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyLearningPage
