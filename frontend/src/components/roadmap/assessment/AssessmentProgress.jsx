export default function AssessmentProgress({
  current,
  total,
}) {
  const percentage = (current / total) * 100

  return (
    <div className="assessment-progress">

      <div className="assessment-progress-info">
        <span>
          Question <strong>{current}</strong> of {total}
        </span>

        <span>
          {Math.round(percentage)}%
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