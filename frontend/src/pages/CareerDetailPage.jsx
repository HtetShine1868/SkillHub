import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCareerById, getCareerSkills } from '../services/careerService'
import './CareerDetailPage.css'

/* Fallback mock detail for when the backend has no seed data */
const MOCK_DETAIL = {
  1: {
    id: 1, name: 'Backend Developer', category: 'Engineering', icon: '🔧',
    description: 'Backend developers build and maintain the server-side logic, APIs, and databases that power every web and mobile application. You\'ll work with languages like Java, Go, or Python and services like PostgreSQL, Redis, and Docker.',
    responsibilities: 'Design RESTful & GraphQL APIs · Model and optimize database schemas · Build microservices and serverless functions · Implement authentication and authorization · Monitor performance and reliability',
    skills: [
      { skillId: 1, skillName: 'Java',             skillCategory: 'Programming', requiredLevel: 4, importance: 0.9 },
      { skillId: 2, skillName: 'Spring Boot',       skillCategory: 'Framework',   requiredLevel: 4, importance: 0.85 },
      { skillId: 3, skillName: 'SQL & PostgreSQL',  skillCategory: 'Database',    requiredLevel: 3, importance: 0.8 },
      { skillId: 4, skillName: 'REST API Design',   skillCategory: 'Architecture',requiredLevel: 3, importance: 0.75 },
      { skillId: 5, skillName: 'Docker & K8s',      skillCategory: 'DevOps',      requiredLevel: 2, importance: 0.6 },
      { skillId: 6, skillName: 'Git & CI/CD',       skillCategory: 'Tools',       requiredLevel: 2, importance: 0.55 },
    ]
  },
  2: {
    id: 2, name: 'Frontend Developer', category: 'Engineering', icon: '🎨',
    description: 'Frontend developers craft the visual layer of the web — building interactive UIs, optimizing performance, and ensuring pixel-perfect experiences across devices.',
    responsibilities: 'Build responsive interfaces with React/Vue · Implement design systems · Optimize Core Web Vitals · Collaborate with UX designers · Write accessible, semantic HTML',
    skills: [
      { skillId: 7,  skillName: 'React.js',        skillCategory: 'Framework',   requiredLevel: 4, importance: 0.95 },
      { skillId: 8,  skillName: 'TypeScript',       skillCategory: 'Programming', requiredLevel: 3, importance: 0.8 },
      { skillId: 9,  skillName: 'CSS & Animations', skillCategory: 'Styling',     requiredLevel: 4, importance: 0.85 },
      { skillId: 10, skillName: 'REST/GraphQL',     skillCategory: 'API',         requiredLevel: 2, importance: 0.6 },
      { skillId: 11, skillName: 'Web Accessibility',skillCategory: 'Best Practice',requiredLevel: 2, importance: 0.55 },
    ]
  },
}

const DEFAULT_DETAIL = (id) => ({
  id, name: `Career #${id}`, category: 'Engineering', icon: '💼',
  description: 'Career details are being loaded from the backend. Make sure your Spring Boot server is running and seeded with career data.',
  responsibilities: 'No data yet',
  skills: []
})

const LEVEL_LABELS = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']

const CareerDetailPage = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [career, setCareer]   = useState(null)
  const [skills, setSkills]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const numId = parseInt(id)
    Promise.allSettled([getCareerById(numId), getCareerSkills(numId)])
      .then(([careerRes, skillsRes]) => {
        const careerData = careerRes.status === 'fulfilled' && careerRes.value?.id
          ? careerRes.value
          : MOCK_DETAIL[numId] || DEFAULT_DETAIL(numId)

        const skillsData = skillsRes.status === 'fulfilled' && skillsRes.value?.length
          ? skillsRes.value
          : careerData.skills || []

        setCareer(careerData)
        setSkills(skillsData)
      })
      .catch(() => {
        const fallback = MOCK_DETAIL[numId] || DEFAULT_DETAIL(numId)
        setCareer(fallback)
        setSkills(fallback.skills || [])
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="careerdetail careerdetail--loading">
      <div className="careerdetail__spinner" />
    </div>
  )

  if (!career) return (
    <div className="careerdetail careerdetail--loading">
      <p>Career not found.</p>
    </div>
  )

  return (
    <div className="careerdetail">
      <div className="careerdetail__blob careerdetail__blob--1" />
      <div className="careerdetail__blob careerdetail__blob--2" />

      <div className="careerdetail__inner">

        {/* Breadcrumb */}
        <nav className="careerdetail__breadcrumb">
          <button onClick={() => navigate('/careers')}>← All Careers</button>
          <span>/</span>
          <span>{career.name}</span>
        </nav>

        {/* Hero */}
        <div className="careerdetail__hero">
          <div className="careerdetail__hero-left">
            <div className="careerdetail__icon">{career.icon || '💼'}</div>
            <div>
              <span className="careerdetail__cat">{career.category}</span>
              <h1 className="careerdetail__name">{career.name}</h1>
            </div>
          </div>
          <button
            id="btn-generate-roadmap"
            className="careerdetail__cta"
            onClick={() => navigate(`/roadmap?careerId=${career.id}`)}
          >
            🚀 Generate My Roadmap
          </button>
        </div>

        {/* Description */}
        <div className="careerdetail__card">
          <h2 className="careerdetail__section-title">About This Career</h2>
          <p className="careerdetail__desc">{career.description}</p>
        </div>

        {/* Responsibilities */}
        {career.responsibilities && (
          <div className="careerdetail__card">
            <h2 className="careerdetail__section-title">Key Responsibilities</h2>
            <ul className="careerdetail__resp-list">
              {career.responsibilities.split('·').map((r, i) => (
                <li key={i}>{r.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="careerdetail__card">
            <h2 className="careerdetail__section-title">Required Skills</h2>
            <p className="careerdetail__skills-sub">
              Skills are ranked by importance. Your personalized roadmap will fill the gaps based on your assessment results.
            </p>
            <div className="careerdetail__skills">
              {[...skills].sort((a, b) => b.importance - a.importance).map(skill => (
                <div key={skill.skillId} className="careerdetail__skill">
                  <div className="careerdetail__skill-header">
                    <span className="careerdetail__skill-name">{skill.skillName}</span>
                    <div className="careerdetail__skill-meta">
                      <span className="careerdetail__skill-cat">{skill.skillCategory}</span>
                      <span className="careerdetail__skill-level">{LEVEL_LABELS[skill.requiredLevel] || 'Advanced'}</span>
                    </div>
                  </div>
                  <div className="careerdetail__skill-track">
                    <div
                      className="careerdetail__skill-fill"
                      style={{ width: `${(skill.requiredLevel / 5) * 100}%`, opacity: 0.6 + skill.importance * 0.4 }}
                    />
                    <div
                      className="careerdetail__skill-importance"
                      title={`Importance: ${Math.round(skill.importance * 100)}%`}
                      style={{ left: `${skill.importance * 100}%` }}
                    />
                  </div>
                  <div className="careerdetail__skill-importance-label">
                    {Math.round(skill.importance * 100)}% importance
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA bottom */}
        <div className="careerdetail__bottom-cta">
          <h3>Ready to build your personalized roadmap?</h3>
          <p>Take a quick skill assessment and we'll create a step-by-step learning plan just for you.</p>
          <div className="careerdetail__bottom-actions">
            <button
              id="btn-roadmap-bottom"
              className="careerdetail__cta"
              onClick={() => navigate(`/roadmap?careerId=${career.id}`)}
            >
              🚀 Generate My Roadmap
            </button>
            <button
              id="btn-back-careers"
              className="careerdetail__btn-ghost"
              onClick={() => navigate('/careers')}
            >
              Browse Other Careers
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CareerDetailPage
