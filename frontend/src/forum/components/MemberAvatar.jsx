// Reusable MemberAvatar component
// Shows initials with a gradient background

const COLORS = [
  ['#FEF3C7', '#F6D365'],
  ['#D1FAE5', '#6EE7B7'],
  ['#DBEAFE', '#93C5FD'],
  ['#FCE7F3', '#F9A8D4'],
  ['#EDE9FE', '#C4B5FD'],
  ['#FEE2E2', '#FCA5A5'],
]

function getColor(name) {
  const idx = (name?.charCodeAt(0) || 0) % COLORS.length
  return COLORS[idx]
}

export default function MemberAvatar({ name, initials, size = 'default', style = {} }) {
  const [bg, accent] = getColor(name)
  const sizeClass =
    size === 'sm' ? 'member-avatar--sm'
    : size === 'lg' ? 'member-avatar--lg'
    : size === 'xl' ? 'member-avatar--xl'
    : ''

  return (
    <div
      className={`member-avatar ${sizeClass}`}
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${accent} 100%)`,
        ...style,
      }}
      aria-label={name}
      title={name}
    >
      {initials || (name ? name.slice(0, 2).toUpperCase() : '??')}
    </div>
  )
}
