export default function CourseDetails({
  course,
  onClose,
}) {
  if (!course) return null

  return (
    <div
      className="course-details-overlay"
      onClick={onClose}
    >

      <div
        className="course-details"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          className="course-close"
          onClick={onClose}
        >
          ×
        </button>

        <span className="course-details-label">
          RECOMMENDED FOR YOUR ROADMAP
        </span>

        <h1>
          {course.title}
        </h1>

        <p className="course-details-description">
          {course.description}
        </p>

        <div className="course-details-stats">

          <div>
            <span>Rating</span>
            <strong>
              ⭐ {course.rating}
            </strong>
          </div>

          <div>
            <span>Difficulty</span>
            <strong>
              {course.difficulty}
            </strong>
          </div>

          <div>
            <span>Duration</span>
            <strong>
              {course.duration}
            </strong>
          </div>

          <div>
            <span>Lessons</span>
            <strong>
              {course.lessons}
            </strong>
          </div>

        </div>

        <div className="course-detail-section">

          <h2>
            Skills you'll learn
          </h2>

          <div className="detail-tags">

            {course.skills.map((skill) => (
              <span key={skill}>
                ✓ {skill}
              </span>
            ))}

          </div>

        </div>

        <div className="course-detail-section">

          <h2>
            Prerequisites
          </h2>

          <div className="detail-tags">

            {course.prerequisites.map(
              (skill) => (
                <span key={skill}>
                  ✓ {skill}
                </span>
              )
            )}

          </div>

        </div>

        <div className="course-why">

          <span>WHY THIS COURSE?</span>

          <p>
            {course.reason}
          </p>

        </div>

        <button
          className="start-course-button"
          disabled={course.status === 'locked'}
        >
          {course.status === 'locked'
            ? '🔒 Complete Previous Stage'
            : 'Start Course →'}
        </button>

      </div>

    </div>
  )
}