export default function CourseCard({
  course,
  onView,
}) {
  const locked = course.status === 'locked'

  return (
    <div
      className={`course-card ${
        locked ? 'course-locked' : ''
      }`}
    >

      <div className="course-card-top">

        <span className="course-badge">
          {locked ? '🔒 Locked' : 'Recommended'}
        </span>

        <span className="course-rating">
          ⭐ {course.rating}
        </span>

      </div>

      <h3>
        {course.title}
      </h3>

      <p>
        {course.description}
      </p>

      <div className="course-meta">

        <span>
          ◷ {course.duration}
        </span>

        <span>
          ● {course.difficulty}
        </span>

        <span>
          ☰ {course.lessons} lessons
        </span>

      </div>

      <div className="course-skills">

        {course.skills.map((skill) => (
          <span key={skill}>
            {skill}
          </span>
        ))}

      </div>

      <button
        className="course-button"
        onClick={() => onView(course)}
      >
        {locked
          ? 'View Course'
          : 'View Course'}
        <span>→</span>
      </button>

    </div>
  )
}