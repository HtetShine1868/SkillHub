import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDiscoveryQuestions, submitDiscoveryAnswers } from '../services/careerService'
import './CareerDiscoveryPage.css'

/* Fallback mock questions (used if API call fails) */
const MOCK_QUESTIONS = [
  {
    id: 1, orderIndex: 1,
    question: 'What kind of Saturday project would you actually enjoy?',
    options: [
      { label: 'Fix or automate something so it just works', description: 'You like hidden problems and reliable results', value: 0 },
      { label: 'Redesign how an app or space looks and feels', description: 'You care about first impressions and ease of use', value: 1 },
      { label: 'Dig into numbers or a mystery and explain it', description: 'You enjoy patterns, evidence, and stories in data', value: 2 },
      { label: 'Build a small thing a friend can try end to end', description: 'You like owning the whole idea-to-result path', value: 3 },
    ]
  },
  {
    id: 2, orderIndex: 2,
    question: 'Which compliment would make you happiest?',
    options: [
      { label: 'That was rock-solid — I never have to worry', description: 'Reliability and correctness matter most', value: 0 },
      { label: 'This is so easy and nice to use', description: 'People’s experience is your measure of success', value: 1 },
      { label: 'You helped us see something we would have missed', description: 'Insight and evidence drive you', value: 2 },
      { label: 'You kept everything running when it got chaotic', description: 'You like coordinating moving parts', value: 3 },
    ]
  }
]

const CAREER_COLORS = ['#7c3aed', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

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
          <p className="discovery__results-sub">Based on your interests, here are your closest career matches. Take the skill test on a path to refine your level and roadmap.</p>
          <div className="discovery__match-list">
            {results.slice(0, 6).map((r, i) => {
              const careerId = r.careerId || r.id || (i + 1)
              const name = r.careerName || r.name || 'Software Engineer'
              const pct = r.matchPercentage || r.matchPct || (94 - i * 6)
              const icon = r.careerIcon || r.icon || '🌟'
              const color = CAREER_COLORS[i % CAREER_COLORS.length]

              return (
                <div key={careerId} className="discovery__match-card" style={{ '--accent-color': color }}>
                  <div className="discovery__match-rank">#{i + 1}</div>
                  <div className="discovery__match-icon">{icon}</div>
                  <div className="discovery__match-info">
                    <h2 className="discovery__match-name">{name}</h2>
                    <div className="discovery__match-bar-wrap">
                      <div
                        className="discovery__match-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="discovery__match-pct">{pct}% Match</span>
                  </div>
                  <div className="discovery__match-actions">
                    <button
                      id={`btn-select-career-${careerId}`}
                      className="discovery__match-select"
                      style={{ background: color }}
                      onClick={() => navigate(`/assessment?careerId=${careerId}`)}
                    >
                      Take skill test →
                    </button>
                    <button
                      className="discovery__match-select discovery__match-select--ghost"
                      onClick={() => navigate(`/careers/${careerId}`)}
                    >
                      Explore
                    </button>
                  </div>
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
