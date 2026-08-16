export default function SkillGapCard({ item }) {
  const statusConfig = {
    complete: {
      icon: '✓',
      label: 'Sufficient',
      className: 'gap-complete',
    },

    improve: {
      icon: '⚠',
      label: 'Needs Improvement',
      className: 'gap-improve',
    },

    missing: {
      icon: '×',
      label: 'Need to Learn',
      className: 'gap-missing',
    },
  }

  const config = statusConfig[item.status]

  return (
    <div className={`gap-card ${config.className}`}>

      <div className="gap-card-top">

        <div>
          <span className="gap-skill-name">
            {item.skill}
          </span>

          <span className="gap-status">
            {config.icon} {config.label}
          </span>
        </div>

        <div className="gap-arrow">
          →
        </div>

      </div>

      <div className="gap-levels">

        <div className="gap-level">
          <span>Your Level</span>
          <strong>{item.currentLevel}</strong>

          <div className="gap-mini-bar">
            <div
              style={{
                width: `${item.currentScore}%`,
              }}
            />
          </div>
        </div>

        <div className="gap-level">
          <span>Required Level</span>
          <strong>{item.requiredLevel}</strong>

          <div className="gap-mini-bar required">
            <div
              style={{
                width: `${item.requiredScore}%`,
              }}
            />
          </div>
        </div>

      </div>

      <p className="gap-message">
        {item.message}
      </p>

    </div>
  )
}