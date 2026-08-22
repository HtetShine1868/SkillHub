import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, getLessons } from '../services/courseService'
import axiosClient from '../api/axiosClient'
import './LessonPage.css'

const MOCK_CONTENT = `
## Welcome to this lesson

In this lesson you will learn the core concepts needed to progress in your career path.

### Key Topics

- Understanding the fundamentals
- Applying concepts in real scenarios
- Common pitfalls to avoid
- Best practices from industry experts

### Code Example

\`\`\`java
// Example code block
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello, SkillHub learner!");
    }
}
\`\`\`

### Summary

Practice the concepts above before moving to the next lesson. Remember, consistency beats intensity — even 30 minutes per day will get you there.

> 💡 **Tip:** Use the AI Assistant on the right to ask questions about this lesson at any time.
`

/** Minimal markdown → HTML renderer */
const renderMarkdown = (md) => {
  if (!md || !md.trim()) return '<p class="lesson__empty">No content yet — the instructor is still uploading lesson material. Check back soon!</p>'
  return md
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="lesson__code"><code>$1</code></pre>')
    .replace(/^### (.*$)/gm, '<h3 class="lesson__h3">$1</h3>')
    .replace(/^## (.*$)/gm,  '<h2 class="lesson__h2">$1</h2>')
    .replace(/^# (.*$)/gm,   '<h1 class="lesson__h1">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,   '<em>$1</em>')
    .replace(/^> (.*$)/gm,   '<blockquote class="lesson__blockquote">$1</blockquote>')
    .replace(/^- (.*$)/gm,   '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="lesson__list">$1</ul>')
    .replace(/\n\n/g, '</p><p class="lesson__p">')
    .replace(/^(?!<[h|p|u|b|l|p])/gm, '<p class="lesson__p">')
}

const LessonPage = () => {
  const { id: courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson]   = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiOpen, setAiOpen]   = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiChat, setAiChat]   = useState([
    { role: 'assistant', text: "Hi! I'm your AI study assistant. Ask me anything about this lesson — I'm here to help! 🤖" }
  ])

  useEffect(() => {
    Promise.allSettled([getLesson(courseId, lessonId), getLessons(courseId)])
      .then(([lr, lsr]) => {
        setLesson(lr.status === 'fulfilled' && lr.value?.id ? lr.value : { id: lessonId, title: 'Lesson', content: MOCK_CONTENT, estimatedMinutes: 20 })
        setLessons(lsr.status === 'fulfilled' ? lsr.value : [])
      })
      .catch(() => setLesson({ id: lessonId, title: 'Lesson', content: MOCK_CONTENT, estimatedMinutes: 20 }))
      .finally(() => setLoading(false))
  }, [courseId, lessonId])

  const sortedLessons = [...lessons].sort((a, b) => a.lessonOrder - b.lessonOrder)
  const currentIdx    = sortedLessons.findIndex(l => String(l.id) === String(lessonId))
  const prevLesson    = currentIdx > 0 ? sortedLessons[currentIdx - 1] : null
  const nextLesson    = currentIdx < sortedLessons.length - 1 ? sortedLessons[currentIdx + 1] : null

  const handleAiSend = async () => {
    if (!aiInput.trim()) return
    const userMsg = aiInput.trim()
    setAiChat(c => [...c, { role: 'user', text: userMsg }])
    setAiInput('')
    try {
      const response = await axiosClient.post('/api/ai/tutor', {
        prompt: userMsg,
        lessonTitle: lesson?.title || 'Lesson',
        lessonContent: lesson?.content || ''
      })
      setAiChat(c => [...c, {
        role: 'assistant',
        text: response.data.answer
      }])
    } catch (error) {
      setAiChat(c => [...c, {
        role: 'assistant',
        text: 'The AI Tutor is currently offline or unreachable. Please try again later.'
      }])
    }
  }

  const handleCompleteLesson = async () => {
    try {
      await axiosClient.post(`/api/enrollments/courses/${courseId}/lessons/${lessonId}/complete`)
    } catch (e) {
      // Offline fallback
    }
  }

  const handleNextClick = async () => {
    await handleCompleteLesson()
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)
    }
  }

  const handleFinishClick = async () => {
    await handleCompleteLesson()
    navigate(`/courses/${courseId}`)
  }

  if (loading) return <div className="lesson lesson--loading"><div className="lesson__spinner" /></div>

  return (
    <div className="lesson">
      {/* Left sidebar — lesson list */}
      <aside className="lesson__sidebar">
        <button className="lesson__back" onClick={() => navigate(`/courses/${courseId}`)}>← Course Overview</button>
        <h2 className="lesson__sidebar-title">Lessons</h2>
        <ol className="lesson__sidebar-list">
          {sortedLessons.map((l, i) => (
            <li key={l.id}>
              <button
                id={`sidebar-lesson-${l.id}`}
                className={`lesson__sidebar-item ${String(l.id) === String(lessonId) ? 'lesson__sidebar-item--active' : ''}`}
                onClick={() => navigate(`/courses/${courseId}/lessons/${l.id}`)}
              >
                <span className="lesson__sidebar-num">{i + 1}</span>
                <span className="lesson__sidebar-name">{l.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {/* Main content */}
      <main className="lesson__main">
        <div className="lesson__header">
          <div className="lesson__breadcrumb">
            <button onClick={() => navigate(`/courses/${courseId}`)}>Course</button>
            <span>/</span>
            <span>{lesson?.title}</span>
          </div>
          <button
            id="btn-ai-toggle"
            className={`lesson__ai-toggle ${aiOpen ? 'lesson__ai-toggle--active' : ''}`}
            onClick={() => setAiOpen(o => !o)}
          >
            🤖 AI Assistant
          </button>
        </div>

        <h1 className="lesson__title">{lesson?.title}</h1>
        <span className="lesson__duration">⏱ {lesson?.estimatedMinutes} min</span>

        <div
          className="lesson__content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson?.content || MOCK_CONTENT) }}
        />

        {/* Navigation */}
        <div className="lesson__nav">
          {prevLesson ? (
            <button id="btn-prev-lesson" className="lesson__nav-btn lesson__nav-btn--prev" onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}>
              ← {prevLesson.title}
            </button>
          ) : <div />}
          {nextLesson ? (
            <button id="btn-next-lesson" className="lesson__nav-btn lesson__nav-btn--next" onClick={handleNextClick}>
              {nextLesson.title} →
            </button>
          ) : (
            <button id="btn-complete" className="lesson__nav-btn lesson__nav-btn--complete" onClick={handleFinishClick}>
              ✅ Complete Course
            </button>
          )}
        </div>
      </main>

      {/* AI Assistant panel */}
      {aiOpen && (
        <aside className="lesson__ai-panel">
          <div className="lesson__ai-header">
            <span>🤖 AI Study Assistant</span>
            <button onClick={() => setAiOpen(false)}>✕</button>
          </div>
          <div className="lesson__ai-chat">
            {aiChat.map((msg, i) => (
              <div key={i} className={`lesson__ai-msg lesson__ai-msg--${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="lesson__ai-input-row">
            <input
              id="ai-input"
              className="lesson__ai-input"
              placeholder="Ask anything about this lesson…"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSend()}
            />
            <button id="btn-ai-send" className="lesson__ai-send" onClick={handleAiSend}>Send</button>
          </div>
        </aside>
      )}
    </div>
  )
}

export default LessonPage
