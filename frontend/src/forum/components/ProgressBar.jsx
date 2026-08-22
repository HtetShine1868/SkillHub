// Reusable ProgressBar component

export default function ProgressBar({ value, max, className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  // Color based on fill percentage
  const colorClass =
    pct >= 90 ? 'progress-bar--red'
    : pct >= 70 ? 'progress-bar--orange'
    : ''

  return (
    <div
      className={`progress-bar ${colorClass} ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${value} of ${max} members`}
    >
      <div
        className="progress-bar__fill"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
