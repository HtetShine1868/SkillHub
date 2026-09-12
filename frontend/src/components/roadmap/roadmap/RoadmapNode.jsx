export default function RoadmapNode({
  stage,
  onClick,
}) {
  const status = {
    completed: {
      icon: '✓',
      label: 'Completed',
    },

    current: {
      icon: '●',
      label: 'Currently Learning',
    },

    available: {
      icon: '→',
      label: 'Ready to Start',
    },

    locked: {
      icon: '🔒',
      label: 'Locked',
    },
  }

  const normalizedKey = (stage.status || 'available').toLowerCase()
  const config = status[normalizedKey] || status.available
  const skill = stage.choiceLabel || stage.title
  const progress = Number(stage.progress) || 0
  const locked = normalizedKey === 'locked'

  return (
    <button
      className={`roadmap-node ${normalizedKey}`}
      onClick={onClick}
      disabled={locked}
    >

      <div className="roadmap-node-icon">
        {config.icon}
      </div>

      <div className="roadmap-node-content">

        <span className="roadmap-node-status">
          {config.label}
        </span>

        <h3>{skill}</h3>

        <p>{locked ? stage.lockedReason : 'Open matching courses and start with the recommended pick.'}</p>

        {!locked && (
          <div className="roadmap-node-meta">
            <span className="roadmap-node-skill-chip">{skill}</span>
            {progress > 0 && (
              <span className="roadmap-node-progress-label">{progress}% done</span>
            )}
            <span className="roadmap-node-cta">View courses</span>
          </div>
        )}

        {!locked && progress > 0 && (
          <div className="roadmap-node-track" aria-hidden="true">
            <div style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}

      </div>

      {!locked && (
        <span className="roadmap-node-arrow">
          →
        </span>
      )}

    </button>
  )
}
