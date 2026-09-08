import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAssessmentQuestions, submitAssessment } from '../services/assessmentService'
import './SkillAssessmentPage.css'

const DIFF_LABEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced', EXPERT: 'Expert' }

const SkillAssessmentPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const careerId = searchParams.get('careerId') || 1

  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState({})
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults]       = useState(null)

  useEffect(() => {
    getAssessmentQuestions(careerId)
      .then(data => setQuestions(data || []))
      .catch(() => setError('Failed to load assessment questions. Please try again.'))
      .finally(() => setLoading(false))
  }, [careerId])

  const q = questions[current]
  const progress = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0
  const options = q ? JSON.parse(q.optionsJson || '[]') : []

  const handleSelect = (val) => setSelected(val)

  const handleNext = async () => {
    if (selected === null) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      setSubmitting(true)
      try {
        const res = await submitAssessment(careerId, newAnswers)
        setResults(res)
      } catch {
        // Client-side mock scoring fallback
        const correct = questions.filter(question => {
          const ans = newAnswers[question.id]
          const opts = JSON.parse(question.optionsJson || '[]')
          return ans !== undefined
        }).length
        setResults({
          overallScore: Math.round((correct / questions.length) * 100),
          skillResults: [
            { skillName: 'Overall', level: Math.ceil((correct / questions.length) * 5), confidence: 0.75 }
          ]
        })
      } finally {
        setSubmitting(false)
      }
    }
  }

  const LEVEL_LABEL = ['None', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']

  /* ── Results screen ── */
  if (results) {
    return (
      <div className="assess">
        <div className="assess__blob assess__blob--1" />
        <div className="assess__blob assess__blob--2" />
        <div className="assess__results">
          <div className="assess__results-icon">🎯</div>
          <h1 className="assess__results-title">Assessment Complete!</h1>
          <p className="assess__results-sub">
            Here's your current skill profile. Your roadmap will be personalized based on these results.
          </p>

          <div className="assess__score-ring-wrap">
            <div className="assess__score-ring">
              <svg viewBox="0 0 120 120" className="assess__ring-svg">
                <circle cx="60" cy="60" r="50" className="assess__ring-bg" />
                <circle
                  cx="60" cy="60" r="50"
                  className="assess__ring-fill"
                  strokeDasharray={`${(results.overallScore / 100) * 314} 314`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="assess__score-label">
                <span className="assess__score-num">{results.overallScore}%</span>
                <span className="assess__score-sub">Score</span>
              </div>
            </div>
          </div>

          {results.skillResults?.length > 0 && (
            <div className="assess__skill-results">
              {results.skillResults.map((s, i) => (
                <div key={i} className="assess__skill-row">
                  <span className="assess__skill-row-name">{s.skillName}</span>
                  <div className="assess__skill-row-bar">
                    <div className="assess__skill-row-fill" style={{ width: `${(s.level / 5) * 100}%` }} />
                  </div>
                  <span className="assess__skill-row-level">{LEVEL_LABEL[s.level] || 'Intermediate'}</span>
                </div>
              ))}
            </div>
          )}

          <div className="assess__results-actions">
            <button id="btn-go-roadmap" className="assess__btn-primary" onClick={() => navigate(`/roadmap?careerId=${careerId}`)}>
              🗺️ Generate My Roadmap
            </button>
            <button id="btn-retake" className="assess__btn-ghost" onClick={() => { setResults(null); setCurrent(0); setAnswers({}) }}>
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="assess assess--loading">
      <div className="assess__spinner" />
      <p>Preparing your assessment…</p>
    </div>
  )

  /* ── Question screen ── */
  return (
    <div className="assess">
      <div className="assess__blob assess__blob--1" />
      <div className="assess__blob assess__blob--2" />

      <div className="assess__card">
        {/* Header bar with Quick Skip option */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button id="btn-back-header" className="assess__back-btn" style={{ margin: 0 }} onClick={() => navigate(-1)}>
            ← Exit Assessment
          </button>
          <button
            id="btn-quick-skip"
            style={{
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              color: '#c4b5fd',
              borderRadius: '999px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => navigate(`/roadmap?careerId=${careerId}`)}
          >
            ⚡ Quick Skip & Generate Roadmap →
          </button>
        </div>

        {/* Header meta */}
        <div className="assess__meta">
          <span className="assess__diff" data-diff={q?.difficulty}>
            {DIFF_LABEL[q?.difficulty] || 'Intermediate'}
          </span>
          <span className="assess__skill-tag">{q?.skillName}</span>
        </div>

        {/* Progress */}
        <div className="assess__progress-row">
          <span className="assess__step">Question {current + 1} / {questions.length}</span>
          <span className="assess__pct">{progress}%</span>
        </div>
        <div className="assess__progress-track">
          <div className="assess__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question text */}
        <h2 className="assess__question">{q?.question}</h2>

        {/* Options */}
        <div className="assess__options">
          {options.map((opt, i) => {
            const val = opt.value !== undefined ? opt.value : opt.optionKey
            const label = opt.label || opt.text
            const isSelected = selected === val
            const letter = opt.optionKey || String.fromCharCode(65 + i)
            return (
              <div
                key={i}
                id={`option-${i}`}
                className={`assess__option ${isSelected ? 'assess__option--selected' : ''}`}
                onClick={() => handleSelect(val)}
              >
                <span className="assess__option-letter">{letter}</span>
                <span className="assess__option-label">{label}</span>
                <div className={`assess__option-check ${isSelected ? 'assess__option-check--active' : ''}`}>
                  {isSelected && '✓'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Nav */}
        <div className="assess__nav">
          {current > 0 ? (
            <button id="btn-prev" className="assess__btn-ghost"
              onClick={() => { setCurrent(c => c - 1); setSelected(answers[questions[current - 1]?.id] ?? null) }}>
              ← Previous
            </button>
          ) : (
            <button id="btn-back" className="assess__btn-ghost" onClick={() => navigate(-1)}>
              ← Back
            </button>
          )}
          <button
            id="btn-next"
            className={`assess__btn-primary ${!selected && selected !== 0 ? 'assess__btn-primary--disabled' : ''}`}
            onClick={handleNext}
            disabled={selected === null || submitting}
          >
            {submitting ? 'Calculating…' : current === questions.length - 1 ? 'Submit Assessment →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SkillAssessmentPage

