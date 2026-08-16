export default function SkillCard({ skill, level, score }) {
  const levelLabels = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
  }

  const levelLabel = levelLabels[level] || 'Beginner'

  return (
    <div className="result-skill-card">
      <div className="skill-card-header">
        <div>
          <h3>{skill}</h3>
          <span>{levelLabel}</span>
        </div>

        <strong>{score}%</strong>
      </div>

      <div className="skill-bar">
        <div
          className="skill-bar-fill"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}