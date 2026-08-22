import SkillCard from './SkillCard'
import SkillSummary from './SkillSummary'

export default function AssessmentResult({
  answers,
  questions,
  career,
  onContinue,
}) {
  const skills = questions.map((question) => {
    const level = answers[question.id] || 1

    const scoreMap = {
      1: 25,
      2: 50,
      3: 75,
      4: 100,
    }

    return {
      skill: question.skill,
      level,
      score: scoreMap[level],
    }
  })

  return (
    <section className="result-screen">

      <div className="result-background-glow" />

      <div className="result-container">

        {/* Header */}

        <div className="result-header">

          <span className="result-eyebrow">
            ASSESSMENT COMPLETE
          </span>

          <h1>
            Here's where you are
            <br />
            right now.
          </h1>

          <p>
            We've mapped your current skills for the{' '}
            <strong>{career.title}</strong> path.
          </p>

        </div>

        {/* Overall Card */}

        <div className="overall-result-card">

          <div>
            <span className="overall-label">
              YOUR CURRENT PROFILE
            </span>

            <h2>
              {skills.length} skills assessed
            </h2>

            <p>
              Your roadmap will focus on strengthening
              your weaker areas while building on what
              you already know.
            </p>
          </div>

          <div className="overall-circle">
            <span>
              {Math.round(
                skills.reduce(
                  (total, skill) => total + skill.score,
                  0
                ) / skills.length
              )}
              %
            </span>

            <small>overall</small>
          </div>

        </div>

        {/* Skills */}

        <div className="result-section">

          <div className="section-heading">
            <div>
              <span>SKILL PROFILE</span>
              <h2>Your current skills</h2>
            </div>

            <p>
              Based on your assessment
            </p>
          </div>

          <div className="skills-grid">

            {skills.map((skill) => (
              <SkillCard
                key={skill.skill}
                skill={skill.skill}
                level={skill.level}
                score={skill.score}
              />
            ))}

          </div>

        </div>

        {/* Summary */}

        <div className="result-section">

          <div className="section-heading">
            <div>
              <span>YOUR PROFILE</span>
              <h2>What this means</h2>
            </div>
          </div>

          <SkillSummary skills={skills} />

        </div>

        {/* Continue */}

        <div className="result-actions">

          <div>
            <strong>
              Ready to find your skill gaps?
            </strong>

            <p>
              We'll compare your current skills with
              what {career.title} requires.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={onContinue}
          >
            View Skill Gap
            <span>→</span>
          </button>

        </div>

      </div>

    </section>
  )
}