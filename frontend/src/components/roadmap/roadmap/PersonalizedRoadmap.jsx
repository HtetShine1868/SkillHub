import RoadmapNode from './RoadmapNode'

export default function PersonalizedRoadmap({
  career,
  stages,
  onStageClick,
  nextCourseTitle,
}) {
  const safeStages = Array.isArray(stages) ? stages : []
  const languageOptions = safeStages.filter((stage) => stage.choiceGroup === 'starter-language')
  const linearStages = languageOptions.length >= 2
    ? safeStages.filter((stage) => stage.choiceGroup !== 'starter-language')
    : safeStages

  const completed = safeStages.filter(
    (stage) => (stage.status || '').toLowerCase() === 'completed' || (stage.progress !== undefined && stage.progress >= 100)
  ).length

  const current = safeStages.find(
    (stage) => {
      const s = (stage.status || '').toLowerCase()
      return s === 'current' || s === 'available' || (stage.progress !== undefined && stage.progress > 0 && stage.progress < 100)
    }
  ) || safeStages[0]

  const progress = safeStages.length === 0 ? 0 : Math.round(
    (completed / safeStages.length) * 100
  )

  const careerTitle = career?.title || career?.name || 'Selected Career'
  const showLanguageFork = languageOptions.length >= 2

  return (
    <section className="roadmap-screen">

      <div className="roadmap-glow" />

      <div className="roadmap-container">

        <div className="roadmap-header">

          <div>

            <span className="roadmap-eyebrow">
              YOUR PERSONALIZED PATH
            </span>

            <h1>
              {careerTitle}
            </h1>

            <p>
              {showLanguageFork
                ? 'Start at the top. Pick a first language, then follow the rest of your path.'
                : 'A learning journey designed around your current skills and goals. Start at the top.'}
            </p>

            <button
              className="secondary-button"
              style={{ marginTop: '12px', fontSize: '0.82rem', padding: '6px 14px', borderRadius: '999px' }}
              onClick={() => window.location.href = '/careers'}
            >
              Switch / Explore Careers
            </button>

          </div>

          <div className="roadmap-progress-card">

            <div className="progress-top">
              <span>Overall Progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="roadmap-progress-bar">
              <div
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span>
              {completed} / {safeStages.length} stages completed
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

              <span>{completed > 0 ? 'UP NEXT · OPEN THIS COURSE' : 'START HERE · OPEN THIS COURSE'}</span>

              <strong>
                {nextCourseTitle || current?.title || safeStages[0]?.title || 'Get Started'}
              </strong>

              <span>
                {completed > 0
                  ? `You finished ${completed} course${completed === 1 ? '' : 's'}. Continue with this next step.`
                  : `Then → ${safeStages[1]?.title || 'the rest of your path'}`}
              </span>

            </button>

            <div className="roadmap-path">

              <div className="roadmap-start">
                <span className="roadmap-start-icon">1</span>
                <span>Start here</span>
              </div>

              {showLanguageFork && (
                <div className="roadmap-fork">
                  <div className="roadmap-fork-title">
                    Choose a starting language
                  </div>
                  <p className="roadmap-fork-copy">
                    More than one beginner track exists for this career. Pick Java, JavaScript, or Python to begin — you can still take the others later.
                  </p>
                  <div className="roadmap-fork-grid">
                    {languageOptions.map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        className={`roadmap-fork-card ${(stage.status || '').toLowerCase()}`}
                        onClick={() => onStageClick(stage)}
                        disabled={(stage.status || '').toLowerCase() === 'locked'}
                      >
                        <span className="roadmap-fork-lang">{stage.choiceLabel || stage.title || 'Language'}</span>
                        <strong>{stage.choiceLabel || stage.title}</strong>
                        <small>Browse courses for this skill</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showLanguageFork && linearStages.length > 0 && (
                <div className="roadmap-connector">↓</div>
              )}

              {linearStages.map((stage, index) => (

                <div
                  className="roadmap-path-item"
                  key={stage.id || index}
                >

                  <RoadmapNode
                    stage={stage}
                    onClick={() =>
                      onStageClick(stage)
                    }
                  />

                  {index < linearStages.length - 1 && (
                    <div
                      className={`roadmap-connector ${
                        linearStages[index + 1].status === 'locked'
                          ? 'locked'
                          : ''
                      }`}
                    >
                      ↓
                    </div>
                  )}

                </div>

              ))}

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
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No roadmap skills found</h3>
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>
              We couldn't find skill milestones for this career yet. Explore our course catalog to get started manually.
            </p>
          </div>
        )}

      </div>

    </section>
  )
}
