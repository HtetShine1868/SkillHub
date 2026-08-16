import SkillGapCard from './SkillGapCard'

export default function SkillGap({
  gapData,
  career,
  onContinue,
  onBack,
}) {
  const complete = gapData.filter(
    (item) => item.status === 'complete'
  ).length

  const needsWork = gapData.filter(
    (item) => item.status === 'improve'
  ).length

  const missing = gapData.filter(
    (item) => item.status === 'missing'
  ).length

  return (
    <section className="skill-gap-screen">

      <div className="gap-background-glow" />

      <div className="gap-container">

        <button
          className="gap-back"
          onClick={onBack}
        >
          ← Back to Results
        </button>

        <div className="gap-header">

          <span>SKILL GAP ANALYSIS</span>

          <h1>
            Your path to
            <br />
            {career.title}.
          </h1>

          <p>
            We compared your current skills with the
            skills required for your target career.
          </p>

        </div>

        <div className="gap-summary">

          <div>
            <strong>{complete}</strong>
            <span>Already strong</span>
          </div>

          <div>
            <strong>{needsWork}</strong>
            <span>Need improvement</span>
          </div>

          <div>
            <strong>{missing}</strong>
            <span>Need to learn</span>
          </div>

        </div>

        <div className="gap-list">

          {gapData.map((item) => (
            <SkillGapCard
              key={item.id}
              item={item}
            />
          ))}

        </div>

        <div className="gap-footer">

          <div>
            <strong>
              Your skill gap is ready.
            </strong>

            <p>
              We'll use these gaps to create your
              personalized learning journey.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={onContinue}
          >
            Build My Roadmap →
          </button>

        </div>

      </div>

    </section>
  )
}