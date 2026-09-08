import { useEffect, useState, useRef } from 'react'

export default function GenerateRoadmap({
  career,
  onComplete,
}) {
  const [step, setStep] = useState(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const steps = [
    'Analyzing your current skills',
    'Identifying your skill gaps',
    'Selecting suitable courses',
    'Organizing your learning path',
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => {
        if (current < steps.length - 1) {
          return current + 1
        }

        clearInterval(timer)
        return current
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [steps.length])

  useEffect(() => {
    if (step === steps.length - 1) {
      const timer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current()
        }
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <section className="generator-screen">

      <div className="generator-glow" />

      <div className="generator-container">

        <div className="generator-icon">
          ✦
        </div>

        <span className="generator-label">
          PERSONALIZED ROADMAP
        </span>

        <h1>
          Building your
          <br />
          learning journey.
        </h1>

        <p>
          Creating a roadmap for becoming a{' '}
          <strong>{career.title}</strong>.
        </p>

        <div className="generation-card">

          {steps.map((item, index) => {

            const completed = index < step
            const active = index === step

            return (
              <div
                className={`generation-step ${
                  completed
                    ? 'completed'
                    : active
                      ? 'active'
                      : ''
                }`}
                key={item}
              >

                <div className="generation-indicator">

                  {completed
                    ? '✓'
                    : active
                      ? '●'
                      : '○'}

                </div>

                <span>{item}</span>

                {active && (
                  <span className="thinking">
                    ...
                  </span>
                )}

              </div>
            )
          })}

        </div>

        <div className="generation-progress">

          <div
            className="generation-progress-fill"
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
            }}
          />

        </div>

        <span className="generation-note">
          Almost ready...
        </span>

      </div>

    </section>
  )
}