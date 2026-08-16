export default function SkillSummary({ skills }) {
  const strongSkills = skills.filter(
    (skill) => skill.level === 4
  )

  const improveSkills = skills.filter(
    (skill) => skill.level === 2 || skill.level === 3
  )

  const learnSkills = skills.filter(
    (skill) => skill.level === 1
  )

  return (
    <div className="skill-summary">

      <div className="summary-section">
        <div className="summary-title">
          <span className="summary-icon strong">
            ✓
          </span>

          <div>
            <h3>Strong Skills</h3>
            <p>Skills you're already confident in.</p>
          </div>
        </div>

        <div className="summary-tags">
          {strongSkills.length > 0 ? (
            strongSkills.map((skill) => (
              <span key={skill.skill}>
                {skill.skill}
              </span>
            ))
          ) : (
            <small>No advanced skills yet</small>
          )}
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-title">
          <span className="summary-icon improve">
            ⚠
          </span>

          <div>
            <h3>Skills to Improve</h3>
            <p>Skills that need more practice.</p>
          </div>
        </div>

        <div className="summary-tags">
          {improveSkills.length > 0 ? (
            improveSkills.map((skill) => (
              <span key={skill.skill}>
                {skill.skill}
              </span>
            ))
          ) : (
            <small>No improvement areas</small>
          )}
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-title">
          <span className="summary-icon learn">
            ○
          </span>

          <div>
            <h3>Skills to Learn</h3>
            <p>Skills you'll need to develop.</p>
          </div>
        </div>

        <div className="summary-tags">
          {learnSkills.length > 0 ? (
            learnSkills.map((skill) => (
              <span key={skill.skill}>
                {skill.skill}
              </span>
            ))
          ) : (
            <small>No missing skills</small>
          )}
        </div>
      </div>

    </div>
  )
}