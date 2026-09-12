import { useEffect, useState } from 'react'
import AssessmentProgress from './AssessmentProgress'
import AssessmentQuestion from './AssessmentQuestion'

export default function Assessment({
  questions,
  onComplete,
  onBack,
  onSkip,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finishing, setFinishing] = useState(false)

  const question = questions[currentIndex]

  const currentAnswer = answers[question.id]

  const handleSelect = (value) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }))
  }

  const handleNext = async () => {
    if (!currentAnswer || finishing) return

    if (currentIndex === questions.length - 1) {
      setFinishing(true)
      try {
        await onComplete(answers)
      } finally {
        setFinishing(false)
      }
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

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Enter' && currentAnswer && !finishing) {
        handleNext()
        return
      }
      const optionIndex = Number(event.key) - 1
      if (question?.options?.[optionIndex]) {
        handleSelect(question.options[optionIndex].value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentAnswer, finishing, currentIndex, question])

  return (
    <div className="assessment-container">
      {/* Top Header Controls */}
      <div className="assessment-top-bar">
        <button type="button" className="back-to-career" onClick={onBack}>
          ← Exit Assessment
        </button>
        {onSkip && (
          <button type="button" className="quick-skip-btn" onClick={onSkip}>
            ⚡ Quick Skip & Auto-Generate Roadmap →
          </button>
        )}
      </div>

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
          disabled={!currentAnswer || finishing}
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1
            ? (finishing ? 'Submitting…' : 'Finish Assessment')
            : 'Next Question'}
          <span>→</span>
        </button>

      </div>

    </div>
  )
}