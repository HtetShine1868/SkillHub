import AssessmentOption from './AssessmentOption'

export default function AssessmentQuestion({
  question,
  selectedAnswer,
  onSelect,
}) {
  return (
    <div className="question-card">

      <div className="question-top">

        <span className="question-skill">
          {question.skill}
        </span>

        <span className="question-type">
          {question.type === 'experience'
            ? 'Experience'
            : 'Skill Level'}
        </span>

      </div>

      <h1>{question.question}</h1>

      <p className="question-subtitle">
        Choose the option that best describes your
        current experience.
      </p>

      <div className="assessment-options">
        {question.options.map((option, index) => (
          <AssessmentOption
            key={option.value}
            index={index}
            option={option}
            selected={selectedAnswer === option.value}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </div>

    </div>
  )
}