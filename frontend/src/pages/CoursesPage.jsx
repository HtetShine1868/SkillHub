import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllCourses } from '../services/courseService'
import './CoursesPage.css'

const DIFF_COLOR = {
  BEGINNER:     { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7' },
  INTERMEDIATE: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  ADVANCED:     { bg: 'rgba(239,68,68,0.12)',  color: '#fca5a5' },
}

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

const canonicalLevel = (value) => {
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) return ''
  if (/(beginner|novice|easy|foundational|entry)/.test(text) || text === '1') return 'BEGINNER'
  if (/(intermediate|medium)/.test(text) || text === '2' || text === '3') return 'INTERMEDIATE'
  if (/(advanced|expert|hard)/.test(text) || text === '4' || text === '5') return 'ADVANCED'
  return text.replace(/[^a-z0-9]/g, '').toUpperCase()
}

const normalizeCourses = (list) => (Array.isArray(list) ? list : []).map((course) => ({
  ...course,
  difficulty: canonicalLevel(course?.difficulty ?? course?.level ?? course?.difficultyLevel) || course?.difficulty || '',
}))

const MOCK_COURSES = [
  { id:1,  title:'Java & Spring Boot Core',            category:'Engineering', difficulty:'INTERMEDIATE', durationHours:12, rating:4.8, enrollmentCount:342,  description:'Master enterprise Java 17, Spring Boot 3 microservices, REST APIs, and JPA.' },
  { id:2,  title:'SQL & PostgreSQL Masterclass',       category:'Database',    difficulty:'BEGINNER',     durationHours:8,  rating:4.9, enrollmentCount:521,  description:'Master relational database modeling, complex joins, window functions, and indexing.' },
  { id:3,  title:'React & Modern Frontend Development', category:'Frontend',   difficulty:'BEGINNER',     durationHours:10, rating:4.7, enrollmentCount:689,  description:'Build production-grade React applications with hooks, TypeScript, and modern CSS.' },
  { id:4,  title:'Docker & Kubernetes in Production',   category:'DevOps',     difficulty:'INTERMEDIATE', durationHours:8,  rating:4.6, enrollmentCount:287,  description:'Package, deploy, and orchestrate containerized applications with Docker & K8s.' },
  { id:5,  title:'Python for Data Analysis',          category:'Data',       difficulty:'BEGINNER',     durationHours:9,  rating:4.8, enrollmentCount:445,  description:'Learn Python data analysis using Pandas, NumPy, and Matplotlib to extract insights.' },
  { id:6,  title:'Machine Learning Foundations',        category:'Data',       difficulty:'INTERMEDIATE', durationHours:12, rating:4.9, enrollmentCount:312,  description:'Build ML models using scikit-learn — from data preprocessing to model evaluation.' },
  { id:7,  title:'AWS Cloud Fundamentals',             category:'Cloud',      difficulty:'BEGINNER',     durationHours:10, rating:4.7, enrollmentCount:198,  description:'Get hands-on with AWS core services: EC2, S3, RDS, Lambda, IAM, and cloud deployment.' },
  { id:8,  title:'TypeScript & Modern JavaScript',      category:'Frontend',   difficulty:'BEGINNER',     durationHours:6,  rating:4.6, enrollmentCount:534,  description:'Level up from JS to TS — master static typing, generics, interfaces, and patterns.' },
  { id:9,  title:'Linux & DevOps Fundamentals',        category:'DevOps',     difficulty:'BEGINNER',     durationHours:7,  rating:4.5, enrollmentCount:231,  description:'Master Linux system administration, shell scripting, and essential DevOps tools.' },
  { id:10, title:'Node.js & Express REST APIs',         category:'Backend',    difficulty:'INTERMEDIATE', durationHours:8,  rating:4.7, enrollmentCount:389,  description:'Build fast, scalable REST APIs using Node.js, Express, MongoDB, and async JS.' },
]

const ICON_MAP = {
  Backend:'🔧', Engineering:'🔧', Frontend:'🎨', Database:'🗄️', DevOps:'⚙️', Data:'📊', AI:'🤖', Cloud:'☁️', Architecture:'🏗️'
}

const CoursesPage = () => {
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const skillFilter = (searchParams.get('skill') || '').trim()
  const learnerLevel = searchParams.get('learnerLevel')
  const [courses, setCourses]   = useState(skillFilter ? [] : normalizeCourses(MOCK_COURSES))
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [diff, setDiff]         = useState('All')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = skillFilter
      ? { skill: skillFilter, ...(learnerLevel ? { learnerLevel: Number(learnerLevel) } : {}) }
      : {}
    getAllCourses(params)
      .then(data => {
        if (data?.length) {
          setCourses(normalizeCourses(data))
        } else if (skillFilter) {
          setCourses([])
        }
      })
      .catch(() => {
        if (skillFilter) {
          const fallback = MOCK_COURSES.filter(c =>
            c.title.toLowerCase().includes(skillFilter.toLowerCase())
            || c.description?.toLowerCase().includes(skillFilter.toLowerCase())
          )
          setCourses(normalizeCourses(fallback))
        }
      })
      .finally(() => setLoading(false))
  }, [skillFilter, learnerLevel])

  const filtered = useMemo(() => {
    let list = courses
    if (category !== 'All') {
      list = list.filter(c => String(c.category || '').toLowerCase() === String(category).toLowerCase())
    }
    if (diff !== 'All') {
      list = list.filter(c => canonicalLevel(c.difficulty ?? c.level ?? c.difficultyLevel) === diff)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        String(c.title || '').toLowerCase().includes(q)
        || String(c.description || '').toLowerCase().includes(q)
      )
    }
    return [...list.filter(c => c.recommended), ...list.filter(c => !c.recommended)]
  }, [category, diff, search, courses])

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))]
  const diffs = ['All', ...LEVELS]
  const recommendedCourse = filtered.find(c => c.recommended)

  return (
    <div className="courses">
      <div className="courses__blob courses__blob--1" />
      <div className="courses__blob courses__blob--2" />

      <div className="courses__inner">
        <div className="courses__header">
          <div className="courses__badge">{skillFilter ? '🎯 Skill Courses' : '📚 Course Library'}</div>
          <h1 className="courses__title">
            {skillFilter
              ? <>Courses for <span className="courses__hl">{skillFilter}</span></>
              : <>Build Skills That <span className="courses__hl">Matter</span></>}
          </h1>
          <p className="courses__subtitle">
            {skillFilter
              ? `${courses.length} published course${courses.length === 1 ? '' : 's'} that teach ${skillFilter}. The top pick is recommended for you.`
              : `${courses.length} expert-crafted courses aligned to real career paths.`}
          </p>
          {skillFilter && (
            <button className="courses__clear" onClick={() => navigate('/courses')}>
              View all courses →
            </button>
          )}
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
              const level = canonicalLevel(course.difficulty) || 'INTERMEDIATE'
              const dc = DIFF_COLOR[level] || DIFF_COLOR.INTERMEDIATE
              const isRecommended = Boolean(course.recommended)
              return (
                <button
                  key={course.id}
                  id={`course-${course.id}`}
                  className={`courses__card ${isRecommended ? 'courses__card--recommended' : ''}`}
                  onClick={() => navigate(`/courses/${course.id}`, { state: { fromSkill: skillFilter || undefined } })}
                >
                  <div className="courses__card-top">
                    <span className="courses__card-icon">{ICON_MAP[course.category] || '📖'}</span>
                    <div className="courses__card-badges">
                      {isRecommended && (
                        <span className="courses__card-recommended">Recommended for you</span>
                      )}
                      <span className="courses__card-diff" style={{ background: dc.bg, color: dc.color }}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <h2 className="courses__card-title">{course.title}</h2>
                  <p className="courses__card-desc">{course.description}</p>
                  {isRecommended && course.recommendationReason && (
                    <p className="courses__card-reason">{course.recommendationReason}</p>
                  )}
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
            <p>{skillFilter ? `No published courses found for ${skillFilter} yet.` : 'No courses match your filters.'}</p>
          </div>
        )}

        {!loading && skillFilter && recommendedCourse && filtered.length > 1 && (
          <p className="courses__recommend-note">
            Other instructors’ courses for {skillFilter} are listed below the recommended pick.
          </p>
        )}
      </div>
    </div>
  )
}

export default CoursesPage
