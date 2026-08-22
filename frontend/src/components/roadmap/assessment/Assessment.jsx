import { useState } from 'react'
import AssessmentProgress from './AssessmentProgress'
import AssessmentQuestion from './AssessmentQuestion'

export default function Assessment({
  questions,
  onComplete,
  onBack,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const question = questions[currentIndex]

  const currentAnswer = answers[question.id]

  const handleSelect = (value) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }))
  }

  const handleNext = () => {
    if (!currentAnswer) return

    if (currentIndex === questions.length - 1) {
      onComplete(answers)
      return
    }

    setCurrentIndex((previous) => previous + 1)
  }

  const handlePrevious = () => {
    if (currentIndex === 0) {
      onBack()
      return
    }

    setCurrentIndex((previous) => previous - 1)
  }

  return (
    <div className="assessment-container">

      <AssessmentProgress
        current={currentIndex + 1}
        total={questions.length}
      />

      <AssessmentQuestion
        question={question}
        selectedAnswer={currentAnswer}
        onSelect={handleSelect}
      />

      <div className="assessment-navigation">

        <button
          type="button"
          className="secondary-button"
          onClick={handlePrevious}
        >
          ← Previous
        </button>

        <button
          type="button"
          className="primary-button"
          disabled={!currentAnswer}
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1
            ? 'Finish Assessment'
            : 'Next Question'}
          <span>→</span>
        </button>

      </div>

    </div>
  )
}