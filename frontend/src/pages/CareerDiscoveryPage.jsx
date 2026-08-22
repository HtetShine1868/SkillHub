import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDiscoveryQuestions, submitDiscoveryAnswers } from '../services/careerService'
import './CareerDiscoveryPage.css'

/* ─── Fallback mock questions (used while backend has no seed data) ─── */
const MOCK_QUESTIONS = [
  {
    id: 1, orderIndex: 1,
    question: 'What kind of problems do you enjoy solving most?',
    options: [
      { label: '🔧 Technical systems & architecture', value: 'backend' },
      { label: '🎨 Visual design & user experience', value: 'frontend' },
      { label: '📊 Data patterns & predictions', value: 'data' },
      { label: '🤖 Automation & intelligent systems', value: 'ai' },
    ]
  },
  {
    id: 2, orderIndex: 2,
    question: 'How do you prefer to work?',
    options: [
      { label: '🏗️ Build scalable infrastructure behind the scenes', value: 'backend' },
      { label: '🖼️ Craft pixel-perfect interfaces users love', value: 'frontend' },
      { label: '🔬 Experiment, iterate, and validate hypotheses', value: 'data' },
      { label: '🧠 Train and improve machine-learning models', value: 'ai' },
    ]
  },
  {
    id: 3, orderIndex: 3,
    question: 'Which tools or technologies excite you most?',
    options: [
      { label: '☕ Java, Go, databases, cloud services', value: 'backend' },
      { label: '⚛️ React, CSS, animations, design systems', value: 'frontend' },
      { label: '🐍 Python, SQL, notebooks, visualizations', value: 'data' },
      { label: '🔥 PyTorch, transformers, embeddings, LLMs', value: 'ai' },
    ]
  },
  {
    id: 4, orderIndex: 4,
    question: 'Which outcome feels most rewarding to you?',
    options: [
      { label: '⚙️ A system that never goes down', value: 'backend' },
      { label: '✨ An interface that delights users', value: 'frontend' },
      { label: '💡 An insight that drives a business decision', value: 'data' },
      { label: '🚀 A model that predicts the future accurately', value: 'ai' },
    ]
  },
  {
    id: 5, orderIndex: 5,
    question: 'What is your strongest area right now?',
    options: [
      { label: '🛠️ Programming logic & algorithms', value: 'backend' },
      { label: '🎭 Creative thinking & visual communication', value: 'frontend' },
      { label: '📈 Mathematics & statistical reasoning', value: 'data' },
      { label: '🧬 Research & learning new concepts fast', value: 'ai' },
    ]
  },
]

const CAREER_LABELS = {
  backend:  { name: 'Backend Developer',      icon: '🔧', color: '#7c3aed' },
  frontend: { name: 'Frontend Developer',     icon: '🎨', color: '#0ea5e9' },
  data:     { name: 'Data Analyst',           icon: '📊', color: '#10b981' },
  ai:       { name: 'AI/ML Engineer',         icon: '🤖', color: '#f59e0b' },
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
  const [error, setError]           = useState(null)

  /* Load questions from API; fall back to mocks if backend is empty */
  useEffect(() => {
    getDiscoveryQuestions()
      .then(data => setQuestions(data && data.length ? data : MOCK_QUESTIONS))
      .catch(() => setQuestions(MOCK_QUESTIONS))
      .finally(() => setLoading(false))
  }, [])

  const q = questions[current]
  const progress = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0

  const handleSelect = (val) => setSelected(val)

  const handleNext = async () => {
    if (selected === null) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      // Submit answers
      setSubmitting(true)
      try {
        const res = await submitDiscoveryAnswers(newAnswers)
        setResults(res.matches || scoreMock(newAnswers))
      } catch {
        setResults(scoreMock(newAnswers))
      } finally {
        setSubmitting(false)
      }
    }
  }

  /* Client-side scoring fallback */
  const scoreMock = (ans) => {
    const counts = { backend: 0, frontend: 0, data: 0, ai: 0 }
    Object.values(ans).forEach(v => { if (counts[v] !== undefined) counts[v]++ })
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    return Object.entries(counts)
      .map(([key, count]) => ({ careerName: key, matchPct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.matchPct - a.matchPct)
  }

  /* ── Results screen ── */
  if (results) {
    return (
      <div className="discovery">
        <div className="discovery__blob discovery__blob--1" />
        <div className="discovery__blob discovery__blob--2" />
        <div className="discovery__results">
          <div className="discovery__results-badge">🎯 Your Results</div>
          <h1 className="discovery__results-title">Your Top Career Matches</h1>
          <p className="discovery__results-sub">Based on your answers, here are the careers that align most with your strengths and interests.</p>
          <div className="discovery__match-list">
            {results.slice(0, 3).map((r, i) => {
              const meta = CAREER_LABELS[r.careerName] || { name: r.careerName, icon: '🌟', color: '#a78bfa' }
              return (
                <div key={r.careerName} className="discovery__match-card" style={{ '--accent-color': meta.color }}>
                  <div className="discovery__match-rank">#{i + 1}</div>
                  <div className="discovery__match-icon">{meta.icon}</div>
                  <div className="discovery__match-info">
                    <h2 className="discovery__match-name">{meta.name}</h2>
                    <div className="discovery__match-bar-wrap">
                      <div
                        className="discovery__match-bar-fill"
                        style={{ width: `${r.matchPct}%`, background: meta.color }}
                      />
                    </div>
                    <span className="discovery__match-pct">{r.matchPct}% match</span>
                  </div>
                  <button
                    id={`btn-select-career-${r.careerName}`}
                    className="discovery__match-select"
                    style={{ background: meta.color }}
                    onClick={() => navigate('/careers')}
                  >
                    Explore →
                  </button>
                </div>
              )
            })}
          </div>
          <div className="discovery__results-actions">
            <button id="btn-retake" className="discovery__btn-ghost" onClick={() => { setResults(null); setCurrent(0); setAnswers({}); }}>
              Retake Quiz
            </button>
            <button id="btn-browse-all" className="discovery__btn-primary" onClick={() => navigate('/careers')}>
              Browse All Careers
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="discovery discovery--loading">
      <div className="discovery__spinner" />
      <p>Loading questions…</p>
    </div>
  )

  /* ── Question screen ── */
  return (
    <div className="discovery">
      <div className="discovery__blob discovery__blob--1" />
      <div className="discovery__blob discovery__blob--2" />

      <div className="discovery__card">
        {/* Progress */}
        <div className="discovery__progress-meta">
          <span className="discovery__step">Question {current + 1} of {questions.length}</span>
          <span className="discovery__pct">{progress}%</span>
        </div>
        <div className="discovery__progress-track">
          <div className="discovery__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <h2 className="discovery__question">{q?.question}</h2>

        {/* Options */}
        <div className="discovery__options">
          {(q?.options || []).map((opt) => (
            <button
              key={opt.value}
              id={`option-${opt.value}`}
              className={`discovery__option ${selected === opt.value ? 'discovery__option--selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="discovery__nav">
          {current > 0 && (
            <button
              id="btn-prev"
              className="discovery__btn-ghost"
              onClick={() => { setCurrent(c => c - 1); setSelected(answers[questions[current - 1]?.id] ?? null) }}
            >
              ← Back
            </button>
          )}
          <button
            id="btn-next"
            className={`discovery__btn-primary ${!selected ? 'discovery__btn-primary--disabled' : ''}`}
            onClick={handleNext}
            disabled={!selected || submitting}
          >
            {submitting ? 'Calculating…' : current === questions.length - 1 ? 'See My Results →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CareerDiscoveryPage
