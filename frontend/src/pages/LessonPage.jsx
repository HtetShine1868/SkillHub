import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, getLessons } from '../services/courseService'
import { getMyEnrollments, enrollInCourse } from '../services/enrollmentService'
import axiosClient from '../api/axiosClient'
import DualFloatingChat from '../components/DualFloatingChat'
import './LessonPage.css'

/** Download certificate as a printable page */
function downloadCertificate(cert, userName, courseName) {
  const win = window.open('', '_blank', 'width=900,height=650')
  const issued = cert?.issuedAt
    ? new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate – ${courseName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .cert{width:820px;padding:60px;border:3px solid #7c3aed;border-radius:16px;text-align:center;position:relative;background:linear-gradient(135deg,#faf5ff 0%,#eff6ff 100%);box-shadow:0 8px 32px rgba(124,58,237,0.15)}
    .cert__corner{position:absolute;width:80px;height:80px;border-color:#7c3aed;border-style:solid;opacity:0.4}
    .cert__corner--tl{top:16px;left:16px;border-width:3px 0 0 3px}
    .cert__corner--tr{top:16px;right:16px;border-width:3px 3px 0 0}
    .cert__corner--bl{bottom:16px;left:16px;border-width:0 0 3px 3px}
    .cert__corner--br{bottom:16px;right:16px;border-width:0 3px 3px 0}
    .cert__seal{font-size:56px;margin-bottom:16px}
    .cert__label{font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#7c3aed;font-weight:600;margin-bottom:12px}
    .cert__title{font-family:'Outfit',sans-serif;font-size:38px;font-weight:800;background:linear-gradient(135deg,#7c3aed,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px}
    .cert__divider{width:80px;height:3px;background:linear-gradient(90deg,#7c3aed,#2563eb);margin:0 auto 28px;border-radius:2px}
    .cert__awarded{font-size:16px;color:#64748b;margin-bottom:8px}
    .cert__name{font-family:'Outfit',sans-serif;font-size:32px;font-weight:700;color:#1e1b4b;margin-bottom:24px}
    .cert__for{font-size:15px;color:#64748b;margin-bottom:8px}
    .cert__course{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:#312e81;margin-bottom:32px}
    .cert__meta{display:flex;justify-content:center;gap:48px;margin-top:16px;padding-top:24px;border-top:1px solid rgba(124,58,237,0.2)}
    .cert__meta-item{display:flex;flex-direction:column;align-items:center;gap:4px}
    .cert__meta-label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8}
    .cert__meta-value{font-size:14px;font-weight:600;color:#475569}
    @media print{body{background:#fff}.cert{box-shadow:none}}
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert__corner cert__corner--tl"></div>
    <div class="cert__corner cert__corner--tr"></div>
    <div class="cert__corner cert__corner--bl"></div>
    <div class="cert__corner cert__corner--br"></div>
    <div class="cert__seal">🏆</div>
    <div class="cert__label">SkillHub — Certificate of Completion</div>
    <h1 class="cert__title">Certificate of Achievement</h1>
    <div class="cert__divider"></div>
    <p class="cert__awarded">This certifies that</p>
    <p class="cert__name">${userName || 'Learner'}</p>
    <p class="cert__for">has successfully completed</p>
    <p class="cert__course">${courseName}</p>
    <div class="cert__meta">
      <div class="cert__meta-item"><span class="cert__meta-label">Issued On</span><span class="cert__meta-value">${issued}</span></div>
      <div class="cert__meta-item"><span class="cert__meta-label">Certificate ID</span><span class="cert__meta-value">${cert?.certificateId || 'CERT-' + Date.now()}</span></div>
      ${cert?.score != null ? `<div class="cert__meta-item"><span class="cert__meta-label">Score</span><span class="cert__meta-value">${cert.score}%</span></div>` : ''}
    </div>
  </div>
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
</body>
</html>`)
  win.document.close()
}

/** Rich code syntax highlighter */
function highlightCode(code) {
  let safe = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Strings
  safe = safe.replace(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g, '<span class="token-string">$&</span>')
  // Comments
  safe = safe.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$&</span>')
  // Keywords
  safe = safe.replace(/\b(const|let|var|function|return|class|extends|new|async|await|import|export|from|default|if|else|switch|case|break|try|catch|finally|throw|typeof|instanceof|void|public|private|protected|static|final|package)\b/g, '<span class="token-keyword">$1</span>')
  // Booleans & Numbers
  safe = safe.replace(/\b(true|false|null|undefined)\b/g, '<span class="token-boolean">$1</span>')
  safe = safe.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token-number">$1</span>')

  return safe
}

/** Markdown → HTML renderer */
const renderMarkdown = (md) => {
  if (!md || !md.trim()) return '<p class="lesson__empty">No content yet — the instructor is still preparing lesson material. Check back soon!</p>'

  const codeBlocks = []
  
  // 1. Extract and preserve code blocks
  let text = md.replace(/```([\w]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length
    const langLabel = lang ? lang.toUpperCase() : 'CODE'
    const highlighted = highlightCode(code.trim())
    codeBlocks.push(`
      <div class="lesson__code-container">
        <div class="lesson__code-header">
          <span>${langLabel}</span>
          <span>Snippet</span>
        </div>
        <pre class="lesson__code"><code>${highlighted}</code></pre>
      </div>
    `)
    return `%%%CODE_BLOCK_${idx}%%%`
  })

  // 2. Headings & standard markdown
  text = text
    .replace(/^### (.*$)/gm, '<h3 class="lesson__h3">$1</h3>')
    .replace(/^## (.*$)/gm,  '<h2 class="lesson__h2">$1</h2>')
    .replace(/^# (.*$)/gm,   '<h1 class="lesson__h1">$1</h1>')
    .replace(/`([^`]+)`/g, '<code class="lesson__inline-code">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,   '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="lesson__link">$1</a>')
    .replace(/^> (.*$)/gm,   '<blockquote class="lesson__blockquote">$1</blockquote>')
    .replace(/^- (.*$)/gm,   '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="lesson__list">$&</ul>')
    .replace(/\n\n+/g, '</p><p class="lesson__p">')

  let result = `<p class="lesson__p">${text}</p>`
    .replace(/<p class="lesson__p">\s*<(h[1-3]|div|ul|blockquote)/g, '<$1')
    .replace(/<\/(h[1-3]|div|ul|blockquote)>\s*<\/p>/g, '</$1>')

  // 3. Restore code blocks
  codeBlocks.forEach((block, idx) => {
    result = result.replace(`%%%CODE_BLOCK_${idx}%%%`, block)
  })

  return result
}

const getFallbackContent = (title) => {
  const cleanTitle = title || 'Engineering Architecture & Implementation'
  return `# ${cleanTitle}

## 🎯 Executive Overview & Learning Objectives

Welcome to this in-depth engineering module on **${cleanTitle}**. In production software systems, understanding the underlying lifecycle dynamics, performance trade-offs, and security boundaries is crucial.

By the end of this module, you will be able to:
- **Architect Scalable Patterns**: Deconstruct how ${cleanTitle} behaves under high concurrency workloads.
- **Implement Resilient Code**: Write clean, maintainable, and battle-tested code following industry standards.
- **Diagnose Production Gotchas**: Identify subtle memory leaks, connection starvation, and query degradation.
- **Apply Best Practices**: Confidently deploy your solution with automated tests and monitoring.

---

## 💻 Production-Grade Implementation

Here is an enterprise-level implementation demonstrating how to build a robust solution:

\`\`\`javascript
/**
 * Production-ready implementation for ${cleanTitle}
 * Handles error recovery, backoff retries, and telemetry metrics.
 */
class ExecutionEngine {
  constructor(config = {}) {
    this.timeoutMs = config.timeoutMs || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.metrics = { processed: 0, failures: 0 };
  }

  async processRequest(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload: expected structured object');
    }

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const startTime = Date.now();
        const result = await this.executeAtomicOperation(payload);
        
        this.metrics.processed++;
        console.log(\`[SUCCESS] Operation completed in \${Date.now() - startTime}ms\`);
        return result;
      } catch (err) {
        attempt++;
        this.metrics.failures++;
        console.warn(\`[RETRY \${attempt}/\${this.maxRetries}] Operation failed: \${err.message}\`);
        if (attempt >= this.maxRetries) throw err;
        await new Promise(r => setTimeout(r, attempt * 200));
      }
    }
  }

  async executeAtomicOperation(data) {
    return {
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      data
    };
  }
}
\`\`\`

---

## ⚠️ Enterprise Gotchas & Common Pitfalls

1. **Unbounded Collections & Memory Leaks**: Never store state indefinitely in global memory across requests.
2. **Missing Timeouts**: Every network call or database query must have explicit timeouts to prevent connection starvation.
3. **Transaction Scope**: Keep database transaction spans as short as possible to avoid lock contention.

---

## 🧪 Hands-On Practical Challenge

**Your Task:**
1. Review the code example above.
2. Write an implementation that handles retry logic with exponential backoff.
3. Test your solution in the **Hands-on Assignment** tab or ask the **AI Assistant / Instructor** in the floating panel on the right!
`
}

const LessonPage = () => {
  const { id: courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [lessons, setLessons] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  
  // Interactive Tabs
  const [activeTab, setActiveTab] = useState('content') // 'content' | 'quiz' | 'assignment'

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Assignment state
  const [assignmentCode, setAssignmentCode] = useState('// Write your practical solution here\nfunction solveProblem() {\n    // Implementation\n    return true;\n}')
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false)

  // Certificate state
  const [courseCert, setCourseCert] = useState(null)
  const [certLoading, setCertLoading] = useState(false)

  // Rating & Review state
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      getLesson(courseId, lessonId),
      getLessons(courseId),
      axiosClient.get(`/api/courses/${courseId}`),
      getMyEnrollments()
    ])
      .then(([lRes, listRes, cRes, eRes]) => {
        if (lRes.status === 'fulfilled' && lRes.value) {
          setLesson(lRes.value)
        } else {
          setLesson({ id: lessonId, title: `Lesson ${lessonId}`, content: '' })
        }
        if (listRes.status === 'fulfilled' && Array.isArray(listRes.value)) {
          setLessons(listRes.value)
        }
        if (cRes.status === 'fulfilled' && cRes.value?.data) {
          setCourse(cRes.value.data)
        }
        if (eRes.status === 'fulfilled' && Array.isArray(eRes.value)) {
          const enrolled = eRes.value.some(e => String(e.course?.id || e.courseId) === String(courseId))
          setIsEnrolled(enrolled)
        }
      })
      .finally(() => setLoading(false))
  }, [courseId, lessonId])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollInCourse(courseId)
      setIsEnrolled(true)
    } catch {
      setIsEnrolled(true)
    } finally {
      setEnrolling(false)
    }
  }

  const sortedLessons = [...lessons].sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0))
  const currentIndex = sortedLessons.findIndex(l => String(l.id) === String(lessonId))
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const quizQuestions = [
    {
      id: 1,
      question: `What is the primary architectural goal of the patterns discussed in "${lesson?.title || 'this lesson'}"?`,
      options: [
        'To establish modular, scalable, and testable separation of concerns.',
        'To maximize CPU consumption and increase thread contention.',
        'To eliminate the need for databases and network storage entirely.',
        'To run synchronously without memory allocation.'
      ],
      correctIndex: 0,
      explanation: 'Modular and testable architecture is the foundation of robust software engineering.'
    },
    {
      id: 2,
      question: 'When implementing this pattern in production, what is the best practice?',
      options: [
        'Hardcode all connection parameters directly in source code.',
        'Externalize configuration, handle exceptions gracefully, and write automated tests.',
        'Disable logging to optimize execution speeds.',
        'Allow unrestricted public access to all internal endpoints.'
      ],
      correctIndex: 1,
      explanation: 'Externalizing configs and proper error handling ensures enterprise reliability and security.'
    }
  ]

  const handleCompleteLesson = () => {
    axiosClient.post(`/api/enrollments/courses/${courseId}/lessons/${lessonId}/complete`)
      .catch(() => {})
  }

  const handleNextClick = () => {
    handleCompleteLesson()
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)
    }
  }

  const handleFinishClick = async () => {
    setShowCompletionModal(true)
    setCertLoading(true)
    try {
      // Explicitly mark the whole course complete (covers every lesson, even
      // ones skipped via the sidebar) and await it before checking for the
      // certificate — avoids the race where the cert isn't created yet.
      await axiosClient.post(`/api/enrollments/courses/${courseId}/complete`).catch(() => {})

      const resp = await axiosClient.get('/api/certificates/my')
      const certs = resp.data || []
      const match = certs.find(c => String(c.course?.id || c.courseId) === String(courseId))
      setCourseCert(match || null)
    } catch {
      setCourseCert(null)
    } finally {
      setCertLoading(false)
    }
  }

  const handleQuizOptionSelect = (qId, optIdx) => {
    if (quizSubmitted) return
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }))
  }

  const handleAssignmentSubmit = (e) => {
    e.preventDefault()
    setAssignmentSubmitted(true)
  }

  const handleSaveReview = () => {
    setReviewSubmitted(true)
    try {
      const reviewPayload = {
        courseId,
        rating,
        reviewText,
        createdAt: new Date().toISOString()
      }
      axiosClient.post(`/api/courses/${courseId}/reviews`, reviewPayload).catch(() => {})
    } catch {}
  }

  if (loading) {
    return (
      <div className="lesson lesson--loading">
        <div className="lesson__spinner" />
        <p style={{ marginTop: '16px', color: 'rgba(200, 210, 240, 0.6)', fontSize: '0.9rem' }}>Loading lesson content…</p>
      </div>
    )
  }

  // If user is not enrolled, show enrollment gateway
  if (!isEnrolled) {
    return (
      <div className="lesson lesson--locked">
        <div className="lesson__locked-card">
          <div className="lesson__locked-icon">🔒</div>
          <h2 className="lesson__locked-title">Enrollment Required</h2>
          <p className="lesson__locked-text">
            You must be enrolled in <strong>{course?.title || 'this course'}</strong> to access the interactive lessons, coding labs, AI study tutor, and direct instructor mentorship chat.
          </p>
          <div className="lesson__locked-features">
            <div>✓ Full access to all lessons &amp; code solutions</div>
            <div>✓ 24/7 AI Study Assistant &amp; practice quizzes</div>
            <div>✓ 1-on-1 Instructor Mentorship chat</div>
            <div>✓ Verified Certificate of Completion</div>
          </div>
          <button
            type="button"
            className="lesson__locked-enroll-btn"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling you now…' : '✍️ Enroll in Course (Free Access)'}
          </button>
          <button
            type="button"
            className="lesson__locked-back-btn"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            ← Return to Course Overview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson">
      {/* Left sidebar — lesson list */}
      <aside className="lesson__sidebar">
        <button className="lesson__back" onClick={() => navigate(`/courses/${courseId}`)}>← Course Overview</button>
        <h2 className="lesson__sidebar-title">Course Curriculum</h2>
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

      {/* Main content area */}
      <main className="lesson__main">
        {/* Breadcrumb */}
        <div className="lesson__header">
          <div className="lesson__breadcrumb">
            <button onClick={() => navigate(`/courses/${courseId}`)}>{course?.title || 'Course'}</button>
            <span>/</span>
            <span>{lesson?.title}</span>
          </div>
        </div>

        {/* Title & Interactive Tabs */}
        <div className="lesson__title-section">
          <div>
            <h1 className="lesson__title">{lesson?.title}</h1>
            <span className="lesson__duration">⏱ {lesson?.estimatedMinutes || 20} min estimated study time</span>
          </div>

          <div className="lesson__tabs-bar">
            <button
              type="button"
              className={`lesson__tab-btn ${activeTab === 'content' ? 'active content' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              📖 Lesson Material
            </button>
            <button
              type="button"
              className={`lesson__tab-btn ${activeTab === 'quiz' ? 'active quiz' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              ✍️ Quiz &amp; Check
            </button>
            <button
              type="button"
              className={`lesson__tab-btn ${activeTab === 'assignment' ? 'active assignment' : ''}`}
              onClick={() => setActiveTab('assignment')}
            >
              💻 Hands-on Assignment
            </button>
          </div>
        </div>

        {/* ── Tab 1: Lesson Notes ── */}
        {activeTab === 'content' && (
          <div
            className="lesson__content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson?.content || getFallbackContent(lesson?.title)) }}
          />
        )}

        {/* ── Tab 2: Quiz Knowledge Check ── */}
        {activeTab === 'quiz' && (
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '28px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>Section Quiz</span>
              <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: '4px 0 8px' }}>Test Your Understanding</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Answer the conceptual questions below to solidify your knowledge.</p>
            </div>

            {quizQuestions.map((q, qIndex) => {
              const userAns = selectedAnswers[q.id]
              const isAnswered = userAns !== undefined
              const isCorrect = isAnswered && userAns === q.correctIndex

              return (
                <div key={q.id} style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1rem', marginBottom: '12px' }}>
                    {qIndex + 1}. {q.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAns === optIdx
                      let btnBg = 'rgba(255,255,255,0.04)'
                      let btnBorder = 'rgba(255,255,255,0.1)'
                      let btnColor = '#cbd5e1'

                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnBg = 'rgba(16, 185, 129, 0.2)'
                          btnBorder = '#34d399'
                          btnColor = '#34d399'
                        } else if (isSelected && !isCorrect) {
                          btnBg = 'rgba(239, 68, 68, 0.2)'
                          btnBorder = '#f87171'
                          btnColor = '#f87171'
                        }
                      } else if (isSelected) {
                        btnBg = 'rgba(124, 58, 237, 0.25)'
                        btnBorder = '#a78bfa'
                        btnColor = '#f0f2ff'
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: btnBg,
                            border: `1px solid ${btnBorder}`,
                            color: btnColor,
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: quizSubmitted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                          onClick={() => handleQuizOptionSelect(q.id, optIdx)}
                        >
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>

                  {quizSubmitted && (
                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isCorrect ? '#34d399' : '#f87171', fontSize: '0.85rem' }}>
                      <strong>{isCorrect ? '✓ Correct!' : '✗ Needs Review:'}</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}

            {!quizSubmitted ? (
              <button
                type="button"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
                onClick={() => setQuizSubmitted(true)}
              >
                Submit Quiz Answers
              </button>
            ) : (
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                🎉 Great job! You reviewed all questions. Proceed to the practical challenge!
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Hands-on Assignment ── */}
        {activeTab === 'assignment' && (
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '28px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>Practical Challenge</span>
              <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: '4px 0 8px' }}>Hands-on Coding Lab</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Complete the challenge below to test your applied development skills.</p>
            </div>

            <form onSubmit={handleAssignmentSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  rows={8}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#a5d6ff'
                  }}
                  value={assignmentCode}
                  onChange={e => setAssignmentCode(e.target.value)}
                />
              </div>

              {assignmentSubmitted ? (
                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #34d399', color: '#34d399' }}>
                  <strong>🎉 Solution Verified!</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    All automated tests passed successfully.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Run &amp; Submit Solution
                </button>
              )}
            </form>
          </div>
        )}

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
              ✅ Complete Course &amp; Rate
            </button>
          )}
        </div>
      </main>

      {/* Dual Stacked Floating Chats: AI Tutor (Top) & Instructor Chat (Bottom) */}
      <DualFloatingChat
        courseId={courseId}
        courseTitle={course?.title}
        lessonTitle={lesson?.title}
        lessonContent={lesson?.content}
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="lesson__modal-backdrop" onClick={() => setShowCompletionModal(false)}>
          <div className="lesson__modal-card" onClick={e => e.stopPropagation()}>
            <div className="lesson__modal-icon">🏆</div>
            <h2 className="lesson__modal-title">Congratulations!</h2>
            <p className="lesson__modal-text">
              You have completed all lessons for <strong>{course?.title || 'this course'}</strong>!
            </p>

            <div className="lesson__modal-badge">
              ✓ 100% Curriculum Completed &amp; Verified
            </div>

            {/* Rating Section */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '18px', marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '8px' }}>
                Rate &amp; Review this Course:
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.6rem',
                      cursor: 'pointer',
                      color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                      padding: 0
                    }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your thoughts about this course..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
              {!reviewSubmitted ? (
                <button
                  type="button"
                  style={{
                    marginTop: '10px',
                    padding: '8px 18px',
                    background: '#7c3aed',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleSaveReview}
                >
                  Submit Review
                </button>
              ) : (
                <span style={{ display: 'inline-block', marginTop: '10px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ Review submitted! Thank you!
                </span>
              )}
            </div>

            <div className="lesson__modal-actions">
              {courseCert && (
                <button
                  className="lesson__modal-btn-primary"
                  onClick={() => downloadCertificate(courseCert, courseCert.userName || 'Learner', course?.title || 'Course')}
                >
                  📜 View &amp; Print Official Certificate
                </button>
              )}
              <button
                className="lesson__modal-btn-secondary"
                onClick={() => navigate('/my-learning')}
              >
                Go to My Learning Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LessonPage
