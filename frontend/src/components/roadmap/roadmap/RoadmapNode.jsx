export default function RoadmapNode({
  stage,
  onClick,
}) {
  const status = {
    completed: { icon: '✓', label: 'Completed' },
    current: { icon: '●', label: 'Currently learning' },
    available: { icon: '→', label: 'Required next' },
    already: { icon: '○', label: 'Not required' },
    choice: { icon: '◇', label: 'Language option' },
    locked: { icon: '🔒', label: 'Locked' },
  }

  const normalizedKey = (stage.status || 'available').toLowerCase()
  const config = status[normalizedKey] || status.available
  const already = normalizedKey === 'already' || stage.requirement === 'ALREADY_HAVE'
  const choice = normalizedKey === 'choice' || stage.requirement === 'CHOICE'
  const locked = normalizedKey === 'locked'
  const title = stage.title || stage.choiceLabel
  const skills = Array.isArray(stage.skills) ? stage.skills : []

  return (
    <button
      className={`roadmap-node ${normalizedKey}${already ? ' already' : ''}`}
      onClick={onClick}
      disabled={locked}
    >
      <div className="roadmap-node-icon">
        {config.icon}
      </div>

      <div className="roadmap-node-content">
        <span className="roadmap-node-status">
          {already && normalizedKey !== 'completed'
            ? 'Not required for you'
            : choice
              ? 'Optional language track'
              : config.label}
        </span>
        <h3>{title}</h3>
        <p>
          {locked
            ? stage.lockedReason
            : already
              ? (stage.description || 'Your skill check already covers this course.')
              : (stage.description || 'Required from your skill gap. Open the course to start.')}
        </p>
        <div className="roadmap-node-meta">
          <span className={`roadmap-node-skill-chip ${already ? 'is-skip' : 'is-need'}`}>
            {already ? 'Already skilled' : choice ? 'Your choice' : 'Required'}
          </span>
          {skills.slice(0, 2).map((skill) => (
            <span key={skill} className="roadmap-node-skill-chip">{skill}</span>
          ))}
          {!locked && <span className="roadmap-node-cta">Open course</span>}
        </div>
      </div>

      {!locked && (
        <span className="roadmap-node-arrow">→</span>
      )}
    </button>
  )
}
