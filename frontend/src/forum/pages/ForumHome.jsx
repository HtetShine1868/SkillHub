import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Compass, Sparkles, SlidersHorizontal } from 'lucide-react'
import ForumNavbar from '../components/ForumNavbar'
import ProjectCard from '../components/ProjectCard'
import { getProjects } from '../services/forumApi'
import '../forum.css'

const CATEGORIES = [
  'All', 'Web Development', 'Mobile', 'AI / ML',
  'Data', 'Design', 'Business', 'Cybersecurity', 'Other',
]

const STATUS_FILTERS = ['Recruiting', 'Almost Full']
const LEVEL_FILTERS = ['Beginner', 'Intermediate', 'Advanced']
const SORT_OPTIONS = ['Newest', 'Most Popular', 'Most Needed', 'Almost Full']

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ForumHome() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('Newest')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProjects({ category, search, level: levelFilter, status: statusFilter, sort })
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }, [category, search, levelFilter, statusFilter, sort])

  useEffect(() => {
    const timer = setTimeout(() => { loadProjects() }, 250)
    return () => clearTimeout(timer)
  }, [loadProjects])

  function toggleLevel(level) {
    setLevelFilter((prev) => (prev === level ? '' : level))
  }

  function toggleStatus(status) {
    setStatusFilter((prev) => (prev === status ? '' : status))
  }

  return (
    <div className="forum-layout">
      <ForumNavbar />

      {/* Hero */}
      <section className="forum-hero" aria-labelledby="forum-hero-title">
        <div className="forum-hero__bg" aria-hidden="true">
          <div className="forum-hero__orb forum-hero__orb--1" />
          <div className="forum-hero__orb forum-hero__orb--2" />
        </div>
        <div className="forum-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="forum-hero__eyebrow">
              <Sparkles size={13} />
              Skill Exchange & Project Collaboration
            </div>
          </motion.div>

          <motion.h1
            id="forum-hero-title"
            className="forum-hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Exchange Skills.<br />
            Build Something <span>Great Together.</span>
          </motion.h1>

          <motion.p
            className="forum-hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find people with complementary skills, share your ideas, and build
            meaningful projects together.
          </motion.p>

          <motion.div
            className="forum-hero__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/skill-exchange/create" className="btn btn-primary btn-lg">
              <Plus size={18} />
              Create Project
            </Link>
            <a href="#projects" className="btn btn-secondary btn-lg">
              <Compass size={18} />
              Explore Projects
            </a>
          </motion.div>

          <motion.div
            className="forum-hero__stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            aria-label="Platform statistics"
          >
            {[
              { num: '8+', label: 'Active Projects' },
              { num: '24+', label: 'Skilled Members' },
              { num: '5', label: 'Categories' },
            ].map((stat) => (
              <div className="forum-hero__stat" key={stat.label}>
                <div className="forum-hero__stat-num">{stat.num}</div>
                <div className="forum-hero__stat-label">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <div id="projects" className="forum-search-section">
        {/* Search */}
        <div className="forum-search-bar">
          <Search size={18} className="forum-search-bar__icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, skills, or topics..."
            aria-label="Search projects"
          />
        </div>

        {/* Category filters */}
        <div className="forum-filters" role="group" aria-label="Category filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`forum-filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}

          <div className="forum-filter-divider" aria-hidden="true" />

          {/* Level filters */}
          {LEVEL_FILTERS.map((level) => (
            <button
              key={level}
              className={`forum-filter-pill ${levelFilter === level ? 'active' : ''}`}
              onClick={() => toggleLevel(level)}
              aria-pressed={levelFilter === level}
            >
              {level}
            </button>
          ))}

          <div className="forum-filter-divider" aria-hidden="true" />

          {/* Status filters */}
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              className={`forum-filter-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => toggleStatus(status)}
              aria-pressed={statusFilter === status}
            >
              {status}
            </button>
          ))}

          <div className="forum-filter-divider" aria-hidden="true" />

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--f-text-muted)' }} aria-hidden="true" />
            <select
              className="forum-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort projects by"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results header */}
      <div className="forum-results-header">
        <p className="forum-results-count">
          Showing <strong>{projects.length}</strong> project{projects.length !== 1 ? 's' : ''}
          {category !== 'All' && <> in <strong>{category}</strong></>}
          {search && <> matching <strong>"{search}"</strong></>}
        </p>
      </div>

      {/* Project grid */}
      <main style={{ padding: '0 24px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div className="loading-spinner" aria-live="polite" aria-label="Loading projects">
            <div className="spinner" />
            <span>Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="forum-empty" role="status">
            <div className="forum-empty__icon" aria-hidden="true">🔍</div>
            <h3>No projects found</h3>
            <p>Try adjusting your search or filters, or be the first to create one!</p>
            <Link to="/skill-exchange/create" className="btn btn-primary" style={{ marginTop: 20 }}>
              <Plus size={16} />
              Create a Project
            </Link>
          </div>
        ) : (
          <motion.div
            className="project-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={`${category}-${search}-${levelFilter}-${statusFilter}-${sort}`}
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project) => (
                <motion.div key={project.id} variants={cardVariants} layout>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}
