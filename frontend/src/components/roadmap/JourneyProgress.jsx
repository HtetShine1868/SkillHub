const STEPS = [
  { key: 'career', label: 'Career', icon: '🎯' },
  { key: 'assess', label: 'Skills check', icon: '🧠' },
  { key: 'gaps', label: 'Gaps', icon: '📊' },
  { key: 'roadmap', label: 'Roadmap', icon: '🗺️' },
]

const STEP_INDEX = {
  onboarding: 0,
  discover: 0,
  careers: 0,
  'discovery-results': 0,
  career: 0,
  assessment: 1,
  results: 2,
  gap: 2,
  generate: 3,
  roadmap: 3,
}

export default function JourneyProgress({ screen }) {
  const current = STEP_INDEX[screen] ?? 0

  return (
    <ol className="journey-progress" aria-label="Career journey steps">
      {STEPS.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'todo'
        return (
          <li key={step.key} className={`journey-progress__step journey-progress__step--${state}`}>
            <span className="journey-progress__icon">{index < current ? '✓' : step.icon}</span>
            <span className="journey-progress__label">{step.label}</span>
            {index < STEPS.length - 1 && <span className="journey-progress__line" />}
          </li>
        )
      })}
    </ol>
  )
}
