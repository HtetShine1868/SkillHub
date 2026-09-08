export default function AssessmentOption({
  option,
  index = 0,
  selected,
  onClick,
}) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']
  const letter = letters[index % letters.length]

  return (
    <button
      type="button"
      className={`assessment-option ${
        selected ? 'selected' : ''
      }`}
      onClick={onClick}
    >
      <div className="option-letter-badge">
        {letter}
      </div>

      <div className="option-content">
        <strong className="option-title">{option.label}</strong>
        {option.description && (
          <p className="option-desc">{option.description}</p>
        )}
      </div>

      <div className={`option-check-circle ${selected ? 'option-check-circle--active' : ''}`}>
        {selected ? '✓' : ''}
      </div>
    </button>
  )
}