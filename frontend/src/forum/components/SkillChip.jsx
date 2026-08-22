// Reusable SkillChip component
// Display-only or removable (when onRemove is provided)

export default function SkillChip({ skill, onRemove }) {
  return (
    <span className={`skill-chip ${onRemove ? 'removable' : ''}`}>
      {skill}
      {onRemove && (
        <button
          type="button"
          className="skill-chip__remove"
          onClick={() => onRemove(skill)}
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
