export default function AssessmentOption({
  option,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`assessment-option ${
        selected ? 'selected' : ''
      }`}
      onClick={onClick}
    >

      <div className="option-radio">
        {selected && <span />}
      </div>

      <div className="option-content">
        <strong>{option.label}</strong>

        <p>{option.description}</p>
      </div>

      <div className="option-arrow">
        →
      </div>

    </button>
  )
}