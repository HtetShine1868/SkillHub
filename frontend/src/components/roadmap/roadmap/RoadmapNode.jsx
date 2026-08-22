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

  const config = status[stage.status]

  return (
    <button
      className={`roadmap-node ${stage.status}`}
      onClick={onClick}
      disabled={stage.status === 'locked'}
    >

      <div className="roadmap-node-icon">
        {config.icon}
      </div>

      <div className="roadmap-node-content">

        <span className="roadmap-node-status">
          {config.label}
        </span>

        <h3>{stage.title}</h3>

        <p>{stage.description}</p>

        {stage.status === 'locked' && (
          <small>
            {stage.lockedReason}
          </small>
        )}

      </div>

      {stage.status !== 'locked' && (
        <span className="roadmap-node-arrow">
          →
        </span>
      )}

    </button>
  )
}