import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCareers } from '../services/careerService'
import './CareerListPage.css'

/* Fallback mock careers for when the backend has no seed data yet */
const MOCK_CAREERS = [
  { id: 1, name: 'Backend Developer',    category: 'Engineering', icon: '🔧',
    description: 'Design and maintain the server-side logic, databases, and APIs that power web applications.' },
  { id: 2, name: 'Frontend Developer',   category: 'Engineering', icon: '🎨',
    description: 'Craft beautiful, responsive user interfaces that deliver exceptional user experiences.' },
  { id: 3, name: 'Data Analyst',         category: 'Data',        icon: '📊',
    description: 'Transform raw data into actionable insights through visualization and statistical analysis.' },
  { id: 4, name: 'AI/ML Engineer',       category: 'AI',          icon: '🤖',
    description: 'Build intelligent systems that learn from data to automate decisions and predictions.' },
  { id: 5, name: 'DevOps Engineer',      category: 'Engineering', icon: '⚙️',
    description: 'Bridge development and operations to deliver software faster and more reliably.' },
  { id: 6, name: 'Cloud Architect',      category: 'Engineering', icon: '☁️',
    description: 'Design scalable, resilient cloud infrastructure for modern applications.' },
  { id: 7, name: 'Cybersecurity Analyst',category: 'Security',    icon: '🔒',
    description: 'Protect organizations from digital threats through proactive defense and incident response.' },
  { id: 8, name: 'Mobile Developer',     category: 'Engineering', icon: '📱',
    description: 'Build native and cross-platform mobile apps for iOS and Android.' },
  { id: 9, name: 'Product Manager',      category: 'Product',     icon: '🗺️',
    description: 'Lead product strategy, prioritize features, and align teams to deliver user value.' },
  { id: 10, name: 'UX Designer',         category: 'Design',      icon: '✏️',
    description: 'Research, prototype, and validate user experiences that are intuitive and delightful.' },
]

const CATEGORY_COLORS = {
  'Engineering': { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa' },
  'Data':        { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
  'AI':          { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
  'Security':    { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5' },
  'Product':     { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#7dd3fc' },
  'Design':      { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#f9a8d4' },
}

const CareerListPage = () => {
  const navigate   = useNavigate()
  const [careers, setCareers]     = useState([])
  const [filtered, setFiltered]   = useState([])
  const [category, setCategory]   = useState('All')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getAllCareers()
      .then(data => {
        const list = data && data.length ? data : MOCK_CAREERS
        setCareers(list)
        setFiltered(list)
      })
      .catch(() => { setCareers(MOCK_CAREERS); setFiltered(MOCK_CAREERS) })
      .finally(() => setLoading(false))
  }, [])

  /* Filter whenever search or category changes */
  useEffect(() => {
    let list = [...careers]
    if (category !== 'All') list = list.filter(c => c.category === category)
    if (search.trim())       list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
  }, [category, search, careers])

  const categories = ['All', ...Array.from(new Set(careers.map(c => c.category)))]

  return (
    <div className="careerlist">
      <div className="careerlist__blob careerlist__blob--1" />
      <div className="careerlist__blob careerlist__blob--2" />

      <div className="careerlist__inner">
        {/* Header */}
        <div className="careerlist__header">
          <div className="careerlist__badge">🗺️ Career Paths</div>
          <h1 className="careerlist__title">
            Discover Your <span className="careerlist__hl">Perfect Role</span>
          </h1>
          <p className="careerlist__subtitle">
            Explore {careers.length} tech career paths. Each comes with a personalized
            skill roadmap tailored to where you are today.
          </p>
        </div>

        {/* Search + filter */}
        <div className="careerlist__toolbar">
          <input
            id="career-search"
            className="careerlist__search"
            type="text"
            placeholder="🔍  Search careers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="careerlist__filters">
            {categories.map(cat => (
              <button
                key={cat}
                id={`filter-${cat}`}
                className={`careerlist__filter ${category === cat ? 'careerlist__filter--active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="careerlist__loading">
            <div className="careerlist__spinner" />
          </div>
        ) : (
          <div className="careerlist__grid">
            {filtered.map(career => {
              const catStyle = CATEGORY_COLORS[career.category] || CATEGORY_COLORS['Engineering']
              return (
                <button
                  key={career.id}
                  id={`career-card-${career.id}`}
                  className="careerlist__card"
                  onClick={() => navigate(`/careers/${career.id}`)}
                >
                  <div className="careerlist__card-top">
                    <span className="careerlist__card-icon">{career.icon || '💼'}</span>
                    <span
                      className="careerlist__card-cat"
                      style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}`, color: catStyle.text }}
                    >
                      {career.category}
                    </span>
                  </div>
                  <h2 className="careerlist__card-name">{career.name}</h2>
                  <p className="careerlist__card-desc">{career.description}</p>
                  <span className="careerlist__card-arrow">View Roadmap →</span>
                </button>
              )
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="careerlist__empty">
            <span>🔎</span>
            <p>No careers found matching "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CareerListPage
