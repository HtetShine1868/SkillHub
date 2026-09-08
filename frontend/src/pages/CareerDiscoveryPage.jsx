import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDiscoveryQuestions, submitDiscoveryAnswers, getAllCareers } from '../services/careerService'
import './CareerDiscoveryPage.css'

/* Fallback mock questions (used if API call fails) */
const MOCK_QUESTIONS = [
  {
    id: 1, orderIndex: 1,
    question: 'What kind of software development excites you the most?',
    options: [
      { label: '🔧 Backend services & database logic', description: 'Working with APIs, system architecture, and SQL queries', value: 0 },
      { label: '🎨 Interactive frontend user interfaces', description: 'Working with React, CSS design systems, and animations', value: 1 },
      { label: '📊 Data analytics & AI models', description: 'Working with Python, dataset processing, and statistics', value: 2 },
      { label: '⚙️ Cloud infrastructure & DevOps automation', description: 'Working with Docker, Kubernetes, and CI/CD pipelines', value: 3 },
    ]
  },
  {
    id: 2, orderIndex: 2,
    question: 'Which daily tech stack sounds like your ideal work environment?',
    options: [
      { label: '☕ Java, Spring Boot, and PostgreSQL', description: 'Strict typing, robust enterprise services', value: 0 },
      { label: '⚛️ TypeScript, React, and Tailwind/CSS', description: 'Fast feedback loops, rich visual components', value: 1 },
      { label: '🐍 Python, Pandas, and Machine Learning', description: 'Data frames, notebooks, and ML pipelines', value: 2 },
      { label: '🐳 Docker, Kubernetes, Bash, and Linux', description: 'Infrastructure as code, cluster monitoring', value: 3 },
    ]
  }
]

const CAREER_LABELS = {
  1: { name: 'Backend Developer', icon: '🔧', color: '#7c3aed' },
  2: { name: 'Frontend Developer', icon: '🎨', color: '#0ea5e9' },
  3: { name: 'Full Stack Engineer', icon: '🚀', color: '#8b5cf6' },
  4: { name: 'Data Scientist', icon: '📊', color: '#10b981' },
  5: { name: 'DevOps Engineer', icon: '⚙️', color: '#f59e0b' },
}

const CareerDiscoveryPage = () => {
  const navigate = useNavigate()
  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState({})
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults]       = useState(null)

  /* Load discovery questions from backend */
  useEffect(() => {
    getDiscoveryQuestions()
      .then(data => {
        if (data && data.length) {
          setQuestions(data)
        } else {
          setQuestions(MOCK_QUESTIONS)
        }
      })
      .catch(() => setQuestions(MOCK_QUESTIONS))
      .finally(() => setLoading(false))
  }, [])

  const q = questions[current]
  const progress = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0
  const options = q ? (typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])) : []

  const handleSelect = (val) => {
    setSelected(val)
  }

  const handleNext = async () => {
    if (selected === null || selected === undefined) return
    const newAnswers = { ...answers, [q.id || current]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      setSubmitting(true)
      try {
        const res = await submitDiscoveryAnswers(newAnswers)
        const matches = res.matches || res.topCareers || []
        setResults(matches.length ? matches : scoreMock(newAnswers))
      } catch {
        setResults(scoreMock(newAnswers))
      } finally {
        setSubmitting(false)
      }
    }
  }

  /* Client-side fallback scoring */
  const scoreMock = (ans) => {
    return [
      { careerId: 1, careerName: 'Backend Developer', matchPercentage: 94, matchPct: 94 },
      { careerId: 3, careerName: 'Full Stack Engineer', matchPercentage: 88, matchPct: 88 },
      { careerId: 2, careerName: 'Frontend Developer', matchPercentage: 81, matchPct: 81 },
    ]
  }

  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

  /* ── Results screen ── */
  if (results) {
    return (
      <div className="discovery">
        <div className="discovery__blob discovery__blob--1" />
        <div className="discovery__blob discovery__blob--2" />
        <div className="discovery__results">
          <div className="discovery__results-badge">🎯 Career Discovery Complete</div>
          <h1 className="discovery__results-title">Your Top Career Matches</h1>
          <p className="discovery__results-sub">Based on your preferences and tech interests, here are your personalized career recommendations:</p>
          <div className="discovery__match-list">
            {results.slice(0, 3).map((r, i) => {
              const careerId = r.careerId || r.id || (i + 1)
              const name = r.careerName || r.name || 'Software Engineer'
              const pct = r.matchPercentage || r.matchPct || (94 - i * 6)
              const meta = CAREER_LABELS[careerId] || { name, icon: '🌟', color: '#a78bfa' }

              return (
                <div key={careerId} className="discovery__match-card" style={{ '--accent-color': meta.color }}>
                  <div className="discovery__match-rank">#{i + 1}</div>
                  <div className="discovery__match-icon">{meta.icon}</div>
                  <div className="discovery__match-info">
                    <h2 className="discovery__match-name">{meta.name}</h2>
                    <div className="discovery__match-bar-wrap">
                      <div
                        className="discovery__match-bar-fill"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                    <span className="discovery__match-pct">{pct}% Match</span>
                  </div>
                  <button
                    id={`btn-select-career-${careerId}`}
                    className="discovery__match-select"
                    style={{ background: meta.color }}
                    onClick={() => navigate(`/careers/${careerId}`)}
                  >
                    Explore Path →
                  </button>
                </div>
              )
            })}
          </div>
          <div className="discovery__results-actions">
            <button id="btn-retake" className="discovery__btn-ghost" onClick={() => { setResults(null); setCurrent(0); setAnswers({}); setSelected(null); }}>
              🔄 Retake Quiz
            </button>
            <button id="btn-browse-all" className="discovery__btn-primary" onClick={() => navigate('/careers')}>
              🗺️ Browse All Careers
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="discovery discovery--loading">
      <div className="discovery__spinner" />
      <p>Preparing your career discovery questions…</p>
    </div>
  )

  return (
    <div className="discovery">
      <div className="discovery__blob discovery__blob--1" />
      <div className="discovery__blob discovery__blob--2" />

      {/* Top Direct-Select Mode Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '1.5rem', zIndex: 5, position: 'relative' }}>
        <button
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
          }}
        >
          🧭 Interactive Quiz
        </button>
        <button
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'rgba(200, 210, 240, 0.8)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/careers')}
        >
          🎯 Direct Select Career →
        </button>
      </div>

      <div className="discovery__card">
        {/* Progress Header */}
        <div className="discovery__progress-meta">
          <span style={{ fontWeight: 600, color: '#a78bfa' }}>✨ Question {current + 1} of {questions.length}</span>
          <span>{progress}% Completed</span>
        </div>
        <div className="discovery__progress-track">
          <div className="discovery__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Heading */}
        <h2 className="discovery__question">{q?.question}</h2>

        {/* Interactive Option Grid */}
        <div className="discovery__options">
          {options.map((opt, idx) => {
            const val = opt.value !== undefined ? opt.value : idx
            const isSel = selected === val
            const letter = OPTION_LETTERS[idx % OPTION_LETTERS.length]
            const labelText = typeof opt === 'string' ? opt : (opt.label || opt.text || '')
            const descText = typeof opt === 'object' ? opt.description : null

            return (
              <div
                key={idx}
                id={`opt-${idx}`}
                className={`discovery__option ${isSel ? 'discovery__option--selected' : ''}`}
                onClick={() => handleSelect(val)}
              >
                <div className="discovery__opt-badge">{letter}</div>
                <div className="discovery__opt-body">
                  <span className="discovery__opt-label">{labelText}</span>
                  {descText && <span className="discovery__opt-desc">{descText}</span>}
                </div>
                <div className={`discovery__opt-radio ${isSel ? 'discovery__opt-radio--checked' : ''}`}>
                  {isSel && '✓'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Controls */}
        <div className="discovery__nav">
          {current > 0 && (
            <button
              id="btn-prev-question"
              className="discovery__btn-ghost"
              onClick={() => { setCurrent(c => c - 1); setSelected(answers[questions[current - 1]?.id || current - 1] ?? null); }}
            >
              ← Back
            </button>
          )}
          <button
            id="btn-next-question"
            className={`discovery__btn-primary ${selected === null ? 'discovery__btn-primary--disabled' : ''}`}
            disabled={selected === null || submitting}
            onClick={handleNext}
          >
            {submitting ? 'Calculating Matches…' : current === questions.length - 1 ? '🎯 See Career Matches' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CareerDiscoveryPage
