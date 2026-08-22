// Reusable StatusBadge component

export default function StatusBadge({ status }) {
  const cls =
    status === 'Recruiting' ? 'status-badge--recruiting'
    : status === 'Almost Full' ? 'status-badge--almost-full'
    : status === 'Full' ? 'status-badge--full'
    : 'status-badge--recruiting'

  return (
    <span className={`status-badge ${cls}`} role="status">
      {status}
    </span>
  )
}
