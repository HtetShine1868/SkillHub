import { useEffect, useState, useRef } from 'react'

export default function GenerateRoadmap({
  career,
  onGenerate,
  onReady,
  onBack,
}) {
  const [step, setStep] = useState(0)
  const [apiDone, setApiDone] = useState(false)
  const [apiError, setApiError] = useState(null)
  const generateRef = useRef(onGenerate)
  const readyRef = useRef(onReady)

  useEffect(() => {
    generateRef.current = onGenerate
    readyRef.current = onReady
  }, [onGenerate, onReady])

  const steps = [
    'Analyzing your current skills',
    'Identifying your skill gaps',
    'Matching courses for each skill',
    'Organizing your learning path',
  ]

  useEffect(() => {
    let cancelled = false
    Promise.resolve(generateRef.current?.())
      .then(() => {
        if (!cancelled) setApiDone(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setApiError(err?.message || 'Could not generate your roadmap.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (apiError) return
    const timer = setInterval(() => {
      setStep((current) => {
        if (current < steps.length - 1) return current + 1
        clearInterval(timer)
        return current
      })
    }, apiDone ? 280 : 700)
    return () => clearInterval(timer)
  }, [apiDone, apiError, steps.length])

  useEffect(() => {
    if (apiError || !apiDone || step < steps.length - 1) return
    const timer = setTimeout(() => readyRef.current?.(), 350)
    return () => clearTimeout(timer)
  }, [apiDone, apiError, step, steps.length])

  return (
    <section className="generator-screen">
      <div className="generator-glow" />
      <div className="generator-container">
        <div className="generator-icon">✦</div>
        <span className="generator-label">PERSONALIZED ROADMAP</span>
        <h1>
          Building your
          <br />
          learning journey.
        </h1>
        <p>
          Creating a roadmap for becoming a{' '}
          <strong>{career?.title || career?.name || 'your career'}</strong>.
        </p>

        <div className="generation-card">
          {steps.map((item, index) => {
            const completed = index < step || (apiDone && index <= step)
            const active = index === step && !apiError
            return (
              <div
                className={`generation-step ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}
                key={item}
              >
                <div className="generation-indicator">
                  {completed ? '✓' : active ? '●' : '○'}
                </div>
                <span>{item}</span>
                {active && <span className="thinking">...</span>}
              </div>
            )
          })}
        </div>

        <div className="generation-progress">
          <div
            className="generation-progress-fill"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {apiError ? (
          <>
            <span className="generation-note" style={{ color: '#fca5a5' }}>{apiError}</span>
            {onBack && (
              <button type="button" className="secondary-button" style={{ marginTop: 16 }} onClick={onBack}>
                ← Back and try again
              </button>
            )}
          </>
        ) : (
          <span className="generation-note">
            {apiDone ? 'Path ready — opening your roadmap…' : 'Matching skills to published courses…'}
          </span>
        )}
      </div>
    </section>
  )
}
