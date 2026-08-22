import RoadmapNode from './RoadmapNode'

export default function PersonalizedRoadmap({
  career,
  stages,
  onStageClick,
}) {
  const completed = stages.filter(
    (stage) => stage.status === 'completed'
  ).length

  const current = stages.find(
    (stage) => stage.status === 'current'
  )

  const progress = Math.round(
    (completed / stages.length) * 100
  )

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
              {career.title}
            </h1>

            <p>
              A learning journey designed around
              your current skills and goals.
            </p>

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
              {completed} / {stages.length} stages completed
            </span>

          </div>

        </div>

        <div className="roadmap-current">

          <span>CURRENTLY LEARNING</span>

          <strong>
            {current?.title}
          </strong>

          <span>
            Next → {stages[completed + 1]?.title || 'Career Goal'}
          </span>

        </div>

        <div className="roadmap-path">

          <div className="roadmap-start">
            🎯
            <span>{career.title}</span>
          </div>

          {stages.map((stage, index) => (

            <div
              className="roadmap-path-item"
              key={stage.id}
            >

              <RoadmapNode
                stage={stage}
                onClick={() =>
                  onStageClick(stage)
                }
              />

              {index < stages.length - 1 && (
                <div
                  className={`roadmap-connector ${
                    stages[index + 1].status === 'locked'
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

      </div>

    </section>
  )
}