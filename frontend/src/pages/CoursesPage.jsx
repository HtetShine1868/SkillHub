import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCourses } from '../services/courseService'
import './CoursesPage.css'

const DIFF_COLOR = {
  BEGINNER:     { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  ADVANCED:     { bg: 'rgba(239,68,68,0.12)',  color: '#fca5a5' },
}

const MOCK_COURSES = [
  { id:1,  title:'Java Fundamentals',          category:'Backend',    difficulty:'BEGINNER',     durationHours:20, rating:4.8, enrollmentCount:1240, description:'Master Java syntax, OOP principles, and collections.' },
  { id:2,  title:'Spring Boot Essentials',     category:'Backend',    difficulty:'INTERMEDIATE', durationHours:30, rating:4.9, enrollmentCount:980,  description:'Build production-ready REST APIs with Spring Boot.' },
  { id:3,  title:'React & Modern CSS',         category:'Frontend',   difficulty:'BEGINNER',     durationHours:25, rating:4.7, enrollmentCount:1580, description:'Build dynamic UIs with React hooks and modern CSS.' },
  { id:4,  title:'TypeScript Deep Dive',       category:'Frontend',   difficulty:'INTERMEDIATE', durationHours:18, rating:4.6, enrollmentCount:730,  description:'Add type safety to your JavaScript projects.' },
  { id:5,  title:'SQL & Database Design',      category:'Database',   difficulty:'BEGINNER',     durationHours:15, rating:4.7, enrollmentCount:2100, description:'Master relational databases and query optimization.' },
  { id:6,  title:'Docker & Kubernetes',        category:'DevOps',     difficulty:'INTERMEDIATE', durationHours:22, rating:4.5, enrollmentCount:870,  description:'Containerize and orchestrate cloud-native apps.' },
  { id:7,  title:'Python for Data Science',   category:'Data',       difficulty:'BEGINNER',     durationHours:28, rating:4.8, enrollmentCount:3200, description:'Pandas, NumPy, and visualization with Matplotlib.' },
  { id:8,  title:'Machine Learning A-Z',      category:'AI',         difficulty:'ADVANCED',     durationHours:40, rating:4.9, enrollmentCount:1870, description:'Supervised & unsupervised learning, neural nets, deployment.' },
  { id:9,  title:'System Design Interviews',  category:'Architecture',difficulty:'ADVANCED',     durationHours:20, rating:4.9, enrollmentCount:2650, description:'Design scalable systems like top FAANG engineers.' },
  { id:10, title:'Git & CI/CD Pipelines',     category:'DevOps',     difficulty:'BEGINNER',     durationHours:10, rating:4.6, enrollmentCount:1560, description:'Version control mastery and automated deployment pipelines.' },
]

const ICON_MAP = {
  Backend:'🔧', Frontend:'🎨', Database:'🗄️', DevOps:'⚙️', Data:'📊', AI:'🤖', Architecture:'🏗️'
}

const CoursesPage = () => {
  const navigate  = useNavigate()
  const [courses, setCourses]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [diff, setDiff]         = useState('All')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getAllCourses()
      .then(data => { const d = data?.length ? data : MOCK_COURSES; setCourses(d); setFiltered(d) })
      .catch(() => { setCourses(MOCK_COURSES); setFiltered(MOCK_COURSES) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let list = [...courses]
    if (category !== 'All') list = list.filter(c => c.category === category)
    if (diff !== 'All')     list = list.filter(c => c.difficulty === diff)
    if (search.trim())      list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [category, diff, search, courses])

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))]
  const diffs = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

  return (
    <div className="courses">
      <div className="courses__blob courses__blob--1" />
      <div className="courses__blob courses__blob--2" />

      <div className="courses__inner">
        <div className="courses__header">
          <div className="courses__badge">📚 Course Library</div>
          <h1 className="courses__title">Build Skills That <span className="courses__hl">Matter</span></h1>
          <p className="courses__subtitle">{courses.length} expert-crafted courses aligned to real career paths.</p>
        </div>

        {/* Toolbar */}
        <div className="courses__toolbar">
          <input id="course-search" className="courses__search" type="text" placeholder="🔍 Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="courses__filter-row">
            <div className="courses__filters">
              {categories.map(cat => (
                <button key={cat} id={`cat-${cat}`}
                  className={`courses__filter ${category === cat ? 'courses__filter--active' : ''}`}
                  onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
            <div className="courses__filters">
              {diffs.map(d => (
                <button key={d} id={`diff-${d}`}
                  className={`courses__filter ${diff === d ? 'courses__filter--active courses__filter--diff' : ''}`}
                  onClick={() => setDiff(d)}>
                  {d === 'All' ? 'All Levels' : d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="courses__stats">
          <span>{filtered.length} courses</span>
          {(category !== 'All' || diff !== 'All' || search) && (
            <button className="courses__clear" onClick={() => { setCategory('All'); setDiff('All'); setSearch('') }}>Clear filters ×</button>
          )}
        </div>

        {loading ? (
          <div className="courses__loading"><div className="courses__spinner" /></div>
        ) : (
          <div className="courses__grid">
            {filtered.map(course => {
              const dc = DIFF_COLOR[course.difficulty] || DIFF_COLOR.INTERMEDIATE
              return (
                <button key={course.id} id={`course-${course.id}`} className="courses__card" onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="courses__card-top">
                    <span className="courses__card-icon">{ICON_MAP[course.category] || '📖'}</span>
                    <span className="courses__card-diff" style={{ background: dc.bg, color: dc.color }}>
                      {course.difficulty?.charAt(0) + course.difficulty?.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <h2 className="courses__card-title">{course.title}</h2>
                  <p className="courses__card-desc">{course.description}</p>
                  <div className="courses__card-footer">
                    <span>⏱ {course.durationHours}h</span>
                    <span>⭐ {course.rating?.toFixed(1)}</span>
                    <span>👥 {course.enrollmentCount?.toLocaleString()}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="courses__empty">
            <span>🔎</span>
            <p>No courses match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage
