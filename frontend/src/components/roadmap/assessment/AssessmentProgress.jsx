export default function AssessmentProgress({
  current,
  total,
}) {
  const percentage = (current / total) * 100

  return (
    <div className="assessment-progress">
      <div className="assessment-progress-info">
        <span className="assessment-step-badge">
          ✨ Question <strong>{current}</strong> of {total}
        </span>
        <span className="assessment-pct-badge">
          {Math.round(percentage)}% Completed
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}