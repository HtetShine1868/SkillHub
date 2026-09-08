import RoadmapNode from './RoadmapNode'

export default function PersonalizedRoadmap({
  career,
  stages,
  onStageClick,
}) {
  const safeStages = Array.isArray(stages) ? stages : []
  const completed = safeStages.filter(
    (stage) => (stage.status || '').toLowerCase() === 'completed' || (stage.progress !== undefined && stage.progress >= 100)
  ).length

  const current = safeStages.find(
    (stage) => {
      const s = (stage.status || '').toLowerCase()
      return s === 'current' || s === 'available' || (stage.progress !== undefined && stage.progress > 0 && stage.progress < 100)
    }
  )

  const progress = safeStages.length === 0 ? 0 : Math.round(
    (completed / safeStages.length) * 100
  )

  const careerTitle = career?.title || career?.name || 'Selected Career'

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
              A learning journey designed around
              your current skills and goals.
            </p>

            <button
              className="secondary-button"
              style={{ marginTop: '12px', fontSize: '0.82rem', padding: '6px 14px', borderRadius: '999px' }}
              onClick={() => window.location.href = '/careers'}
            >
              🧭 Switch / Explore Careers →
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
            <div className="roadmap-current">

              <span>CURRENTLY LEARNING</span>

              <strong>
                {current?.title || safeStages[0]?.title || 'Get Started'}
              </strong>

              <span>
                Next → {safeStages[completed + 1]?.title || 'Career Goal'}
              </span>

            </div>

            <div className="roadmap-path">

              <div className="roadmap-start">
                🎯
                <span>{careerTitle}</span>
              </div>

              {safeStages.map((stage, index) => (

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

                  {index < safeStages.length - 1 && (
                    <div
                      className={`roadmap-connector ${
                        safeStages[index + 1].status === 'locked'
                          ? 'locked'
                          : ''
                      }`}
                    >
                      ↓
                    </div>
                  )}

                </div>

              ))}

              <div className="roadmap-finish">
                🏆
                <span>Career Ready</span>
              </div>

            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No roadmap courses found</h3>
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>
              We couldn't find specific course requirements for this career yet. Explore our course catalog to get started manually.
            </p>
          </div>
        )}

      </div>

    </section>
  )
}