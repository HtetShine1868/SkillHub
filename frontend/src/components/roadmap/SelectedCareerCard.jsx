export default function SelectedCareerCard({
  career,
  onStart,
}) {
  return (
    <div className="career-card">

      <div className="career-card-top">
        <span className="career-badge">
          YOUR CAREER GOAL
        </span>

        <span className="career-match">
          Personalized
        </span>
      </div>

      <div className="career-icon">
        {career.icon}
      </div>

      <h1>{career.title}</h1>

      <p className="career-category">
        {career.category}
      </p>

      <p className="career-description">
        {career.description}
      </p>

      <div className="career-divider" />

      <div className="skills-heading">
        <div>
          <h3>Skills you'll need</h3>
          <p>
            Your roadmap will be built around these skills.
          </p>
        </div>

        <span>
          {career.requiredSkills.length} skills
        </span>
      </div>

      <div className="career-skills">
        {career.requiredSkills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <button
        className="primary-button career-start-button"
        onClick={onStart}
      >
        Start Skill Assessment
        <span>→</span>
      </button>

      <p className="career-note">
        Takes about 2–3 minutes
      </p>
    </div>
  )
}