import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAssessmentQuestions, submitAssessment } from '../services/assessmentService'
import './SkillAssessmentPage.css'

/* Mock questions per skill used as fallback */
const MOCK_QUESTIONS = [
  {
    id: 1, skillId: 1, skillName: 'Programming Logic', difficulty: 1,
    question: 'What does a function return if no return statement is present in JavaScript?',
    type: 'MCQ',
    optionsJson: JSON.stringify([
      { label: 'null', value: 0 },
      { label: 'undefined', value: 1 },
      { label: '0', value: 2 },
      { label: 'An error is thrown', value: 3 },
    ]),
    correctValue: 1,
  },
  {
    id: 2, skillId: 1, skillName: 'Programming Logic', difficulty: 2,
    question: 'Which data structure uses LIFO (Last In, First Out) ordering?',
    type: 'MCQ',
    optionsJson: JSON.stringify([
      { label: 'Queue', value: 0 },
      { label: 'Stack', value: 1 },
      { label: 'Linked List', value: 2 },
      { label: 'Tree', value: 3 },
    ]),
    correctValue: 1,
  },
  {
    id: 3, skillId: 2, skillName: 'Database Knowledge', difficulty: 2,
    question: 'What SQL clause is used to filter grouped results?',
    type: 'MCQ',
    optionsJson: JSON.stringify([
      { label: 'WHERE', value: 0 },
      { label: 'FILTER', value: 1 },
      { label: 'HAVING', value: 2 },
      { label: 'GROUP BY', value: 3 },
    ]),
    correctValue: 2,
  },
  {
    id: 4, skillId: 3, skillName: 'System Design', difficulty: 3,
    question: 'Which of the following best describes horizontal scaling?',
    type: 'MCQ',
    optionsJson: JSON.stringify([
      { label: 'Upgrading server hardware', value: 0 },
      { label: 'Adding more servers to distribute load', value: 1 },
      { label: 'Increasing RAM on existing servers', value: 2 },
      { label: 'Optimizing database queries', value: 3 },
    ]),
    correctValue: 1,
  },
  {
    id: 5, skillId: 3, skillName: 'System Design', difficulty: 3,
    question: 'What is the main purpose of a load balancer?',
    type: 'MCQ',
    optionsJson: JSON.stringify([
      { label: 'Store user sessions', value: 0 },
      { label: 'Encrypt network traffic', value: 1 },
      { label: 'Distribute incoming traffic across servers', value: 2 },
      { label: 'Cache database queries', value: 3 },
    ]),
    correctValue: 2,
  },
]

const DIFF_LABEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' }

const SkillAssessmentPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const careerId = searchParams.get('careerId') || 1

  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState({})      // { questionId: selectedValue }
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults]       = useState(null)

  useEffect(() => {
    getAssessmentQuestions(careerId)
      .then(data => setQuestions(data?.length ? data : MOCK_QUESTIONS))
      .catch(() => setQuestions(MOCK_QUESTIONS))
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
          {options.map((opt, i) => (
            <button
              key={i}
              id={`option-${i}`}
              className={`assess__option ${selected === opt.value ? 'assess__option--selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="assess__option-letter">{String.fromCharCode(65 + i)}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Nav */}
        <div className="assess__nav">
          {current > 0 && (
            <button id="btn-prev" className="assess__btn-ghost"
              onClick={() => { setCurrent(c => c - 1); setSelected(answers[questions[current - 1]?.id] ?? null) }}>
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
