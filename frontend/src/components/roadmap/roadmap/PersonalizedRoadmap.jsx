import RoadmapNode from './RoadmapNode'

export default function PersonalizedRoadmap({
  career,
  stages,
  onStageClick,
  nextCourseTitle,
}) {
  const safeStages = Array.isArray(stages) ? stages : []
  const requiredStages = safeStages.filter((stage) => (stage.requirement || 'REQUIRED') !== 'ALREADY_HAVE')
  const alreadyStages = safeStages.filter((stage) => stage.requirement === 'ALREADY_HAVE')

  const requiredLeft = requiredStages.filter((stage) => {
    const s = (stage.status || '').toLowerCase()
    return s !== 'completed'
  }).length

  const current = requiredStages.find((stage) => {
    const s = (stage.status || '').toLowerCase()
    return s === 'current' || s === 'available'
  }) || requiredStages[0]

  const careerTitle = career?.title || career?.name || 'Selected Career'

  return (
    <section className="roadmap-screen">
      <div className="roadmap-glow" />
      <div className="roadmap-container">
        <div className="roadmap-header">
          <div>
            <span className="roadmap-eyebrow">YOUR PERSONALIZED PATH</span>
            <h1>{careerTitle}</h1>
            <p>
              Required courses come first. Courses you already cover from your skill check stay on the path, marked as not needed.
            </p>
            <button
              className="secondary-button"
              style={{ marginTop: '12px', fontSize: '0.82rem', padding: '6px 14px', borderRadius: '999px' }}
              onClick={() => { window.location.href = '/careers' }}
            >
              Switch / Explore Careers
            </button>
          </div>

          <div className="roadmap-progress-card">
            <div className="progress-top">
              <span>Still required</span>
              <strong>{requiredLeft} left</strong>
            </div>
            <span>
              {requiredStages.length} required · {alreadyStages.length} already covered
            </span>
          </div>
        </div>

        {safeStages.length > 0 ? (
          <>
            <button
              type="button"
              className="roadmap-current roadmap-current--action"
              onClick={() => current && onStageClick?.(current)}
              disabled={!current || (current.status || '').toLowerCase() === 'locked'}
            >
              <span>START WITH THIS REQUIRED COURSE</span>
              <strong>
                {nextCourseTitle || current?.title || requiredStages[0]?.title || 'Get Started'}
              </strong>
              <span>
                {requiredLeft > 1
                  ? `Then ${requiredLeft - 1} more required course${requiredLeft - 1 === 1 ? '' : 's'}.`
                  : 'This is the last required course on your path.'}
              </span>
            </button>

            <div className="roadmap-path">
              <div className="roadmap-start">
                <span className="roadmap-start-icon">1</span>
                <span>Required first</span>
              </div>

              {requiredStages.map((stage, index) => (
                <div className="roadmap-path-item" key={stage.id || `req-${index}`}>
                  <RoadmapNode stage={stage} onClick={() => onStageClick(stage)} />
                  {index < requiredStages.length - 1 && (
                    <div className={`roadmap-connector ${requiredStages[index + 1].status === 'locked' ? 'locked' : ''}`}>
                      ↓
                    </div>
                  )}
                </div>
              ))}

              {alreadyStages.length > 0 && (
                <>
                  <div className="roadmap-connector">↓</div>
                  <div className="roadmap-already-banner">
                    Already covered by your skills — not required
                  </div>
                  {alreadyStages.map((stage, index) => (
                    <div className="roadmap-path-item" key={stage.id || `have-${index}`}>
                      <RoadmapNode stage={stage} onClick={() => onStageClick(stage)} />
                      {index < alreadyStages.length - 1 && <div className="roadmap-connector">↓</div>}
                    </div>
                  ))}
                </>
              )}

              <div className="roadmap-connector">↓</div>
              <div className="roadmap-finish">
                🏆
                <span>{careerTitle} — Career Ready</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No roadmap courses found</h3>
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>
              We could not match courses for this career yet. Generate again after the catalog updates.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
