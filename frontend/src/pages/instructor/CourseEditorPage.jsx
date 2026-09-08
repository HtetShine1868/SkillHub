import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getInstructorCourseById,
  createInstructorCourse,
  updateInstructorCourse,
  submitCourseForApproval
} from '../../services/instructorService'
import { getAdminSkills } from '../../services/adminService'
import './CourseEditorPage.css'

const DEFAULT_SKILLS = [
  'Java', 'SQL', 'Spring Boot', 'REST API', 'JPA/Hibernate',
  'Spring Security', 'Docker', 'React', 'Python', 'Git', 'JavaScript', 'HTML', 'CSS'
]

export default function CourseEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'skills' | 'lessons' | 'quizzes' | 'assignments'
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availableSkills, setAvailableSkills] = useState(DEFAULT_SKILLS)

  // Course Form
  const [courseData, setCourseData] = useState({
    title: '',
    category: 'Backend',
    difficulty: 'BEGINNER',
    durationHours: 6,
    description: '',
    fullDescription: '',
    learningObjectives: '',
    prerequisites: '',
    thumbnailUrl: '',
    skills: ['Java'],
    lessons: [
      { id: 1, title: 'Introduction & Setup', lessonOrder: 1, estimatedMinutes: 15, content: '# Welcome to the Course\n\nIn this lesson, you will set up your development environment.' }
    ],
    quizzes: [
      {
        id: 1,
        question: 'What is the primary purpose of this technology?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'Option A is correct because it aligns with core architectural principles.'
      }
    ],
    assignments: [
      {
        id: 1,
        title: 'Capstone Project: Build a Working Service',
        description: 'Implement a working module with required endpoints and tests.',
        starterCode: '// Starter Template\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
        criteria: '1. Clean structure\n2. Handles edge cases\n3. Tests included'
      }
    ]
  })

  // Load existing course and skills
  useEffect(() => {
    // Fetch global skills
    getAdminSkills()
      .then(skills => {
        if (Array.isArray(skills) && skills.length > 0) {
          const names = skills.map(s => s.name || s.skillName || s).filter(Boolean)
          setAvailableSkills(Array.from(new Set([...names, ...DEFAULT_SKILLS])))
        }
      })
      .catch(() => {})

    if (isEditing) {
      setLoading(true)
      getInstructorCourseById(id)
        .then(data => {
          if (data) {
            setCourseData(prev => ({
              ...prev,
              ...data,
              lessons: data.lessons?.length ? data.lessons : prev.lessons,
              quizzes: data.quizzes?.length ? data.quizzes : prev.quizzes,
              assignments: data.assignments?.length ? data.assignments : prev.assignments
            }))
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  const toggleSkill = (skill) => {
    setCourseData(prev => {
      const exists = prev.skills.includes(skill)
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      }
    })
  }

  // Lesson handlers
  const addLesson = () => {
    const nextOrder = (courseData.lessons || []).length + 1
    const newLesson = {
      id: Date.now(),
      title: `Lesson ${nextOrder}: New Topic`,
      lessonOrder: nextOrder,
      estimatedMinutes: 20,
      content: '## Lesson Content\n\nWrite your markdown explanation and code blocks here.'
    }
    setCourseData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }))
  }

  const updateLesson = (idx, field, value) => {
    setCourseData(prev => {
      const updated = [...prev.lessons]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...prev, lessons: updated }
    })
  }

  const removeLesson = (idx) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== idx)
    }))
  }

  // Quiz handlers
  const addQuizQuestion = () => {
    const newQuiz = {
      id: Date.now(),
      question: 'New Question: What is...?',
      options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctIndex: 0,
      explanation: 'Explanation for why this is the correct answer.'
    }
    setCourseData(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, newQuiz]
    }))
  }

  const updateQuiz = (idx, field, value) => {
    setCourseData(prev => {
      const updated = [...prev.quizzes]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...prev, quizzes: updated }
    })
  }

  const updateQuizOption = (qIdx, optIdx, val) => {
    setCourseData(prev => {
      const updated = [...prev.quizzes]
      const newOpts = [...updated[qIdx].options]
      newOpts[optIdx] = val
      updated[qIdx] = { ...updated[qIdx], options: newOpts }
      return { ...prev, quizzes: updated }
    })
  }

  const removeQuiz = (idx) => {
    setCourseData(prev => ({
      ...prev,
      quizzes: prev.quizzes.filter((_, i) => i !== idx)
    }))
  }

  // Assignment handlers
  const addAssignment = () => {
    const newAss = {
      id: Date.now(),
      title: 'New Hands-on Project',
      description: 'Describe the project goals and requirements here.',
      starterCode: '// Starter code here',
      criteria: 'Passes tests and follows standard formatting.'
    }
    setCourseData(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAss]
    }))
  }

  const updateAssignment = (idx, field, value) => {
    setCourseData(prev => {
      const updated = [...prev.assignments]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...prev, assignments: updated }
    })
  }

  const removeAssignment = (idx) => {
    setCourseData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== idx)
    }))
  }

  // Save as Draft
  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      if (isEditing) {
        await updateInstructorCourse(id, courseData)
      } else {
        await createInstructorCourse(courseData)
      }
      navigate('/instructor/dashboard')
    } catch {
      alert('Failed to save course draft.')
    } finally {
      setSaving(false)
    }
  }

  // Submit for Approval
  const handleSubmitReview = async () => {
    if (!courseData.title.trim()) {
      alert('Please provide a Course Title before submitting.')
      setActiveTab('overview')
      return
    }
    if (courseData.skills.length === 0) {
      alert('Please select at least one Skill taught by this course.')
      setActiveTab('skills')
      return
    }
    if (courseData.lessons.length === 0) {
      alert('Please add at least one Lesson before submitting.')
      setActiveTab('lessons')
      return
    }

    setSaving(true)
    try {
      let targetId = id
      if (isEditing) {
        await updateInstructorCourse(id, courseData)
      } else {
        const created = await createInstructorCourse(courseData)
        targetId = created.id
      }
      await submitCourseForApproval(targetId)
      navigate('/instructor/dashboard')
    } catch {
      alert('Failed to submit course for approval.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="course-editor">
        <div style={{ textAlign: 'center', padding: '100px', color: '#38bdf8' }}>
          <p>⏳ Loading course details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="course-editor">
      <div className="course-editor__inner">
        {/* Top bar */}
        <div className="course-editor__top-bar">
          <button className="course-editor__back-btn" onClick={() => navigate('/instructor/dashboard')}>
            ← Back to Studio
          </button>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Status: <strong style={{ color: '#38bdf8' }}>{courseData.status || 'DRAFT'}</strong>
          </span>
        </div>

        {/* Header */}
        <div className="course-editor__header">
          <h1 className="course-editor__title">
            {isEditing ? `Edit: ${courseData.title || 'Course'}` : 'Create New Course'}
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Follow the 5-step curriculum builder to prepare your course for Admin verification and publishing.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="course-editor__tabs">
          <button
            className={`course-editor__tab ${activeTab === 'overview' ? 'course-editor__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 1. Course Overview
          </button>
          <button
            className={`course-editor__tab ${activeTab === 'skills' ? 'course-editor__tab--active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            ⚡ 2. Skills Taught ({courseData.skills.length})
          </button>
          <button
            className={`course-editor__tab ${activeTab === 'lessons' ? 'course-editor__tab--active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            📖 3. Lessons ({courseData.lessons.length})
          </button>
          <button
            className={`course-editor__tab ${activeTab === 'quizzes' ? 'course-editor__tab--active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            ❓ 4. Quizzes ({courseData.quizzes.length})
          </button>
          <button
            className={`course-editor__tab ${activeTab === 'assignments' ? 'course-editor__tab--active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            💻 5. Projects / Assignments ({courseData.assignments.length})
          </button>
        </div>

        {/* ── Tab 1: Overview ── */}
        {activeTab === 'overview' && (
          <div className="course-editor__form-card">
            <div className="course-editor__field">
              <label className="course-editor__label">Course Title *</label>
              <input
                id="course-title-input"
                className="course-editor__input"
                placeholder="e.g. Master Spring Boot & Cloud Native Architecture"
                value={courseData.title}
                onChange={e => setCourseData({ ...courseData, title: e.target.value })}
              />
            </div>

            <div className="course-editor__form-grid">
              <div className="course-editor__field">
                <label className="course-editor__label">Category</label>
                <select
                  className="course-editor__select"
                  value={courseData.category}
                  onChange={e => setCourseData({ ...courseData, category: e.target.value })}
                >
                  <option value="Backend">Backend Development</option>
                  <option value="Frontend">Frontend Development</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="Mobile">Mobile Development</option>
                  <option value="AI / ML">AI / Machine Learning</option>
                  <option value="Data">Data & Analytics</option>
                  <option value="DevOps">DevOps & Cloud</option>
                  <option value="Database">Database & SQL</option>
                </select>
              </div>

              <div className="course-editor__field">
                <label className="course-editor__label">Difficulty Level</label>
                <select
                  className="course-editor__select"
                  value={courseData.difficulty}
                  onChange={e => setCourseData({ ...courseData, difficulty: e.target.value })}
                >
                  <option value="BEGINNER">Beginner (Foundational)</option>
                  <option value="INTERMEDIATE">Intermediate (Core Concepts)</option>
                  <option value="ADVANCED">Advanced (Production / Tuning)</option>
                </select>
              </div>
            </div>

            <div className="course-editor__form-grid">
              <div className="course-editor__field">
                <label className="course-editor__label">Estimated Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="course-editor__input"
                  value={courseData.durationHours}
                  onChange={e => setCourseData({ ...courseData, durationHours: Number(e.target.value) })}
                />
              </div>

              <div className="course-editor__field">
                <label className="course-editor__label">Thumbnail Image URL (Optional)</label>
                <input
                  className="course-editor__input"
                  placeholder="https://example.com/thumbnail.png"
                  value={courseData.thumbnailUrl}
                  onChange={e => setCourseData({ ...courseData, thumbnailUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="course-editor__field">
              <label className="course-editor__label">Short Description</label>
              <textarea
                rows="2"
                className="course-editor__textarea"
                placeholder="A concise summary of what students will achieve."
                value={courseData.description}
                onChange={e => setCourseData({ ...courseData, description: e.target.value })}
              />
            </div>

            <div className="course-editor__field">
              <label className="course-editor__label">Learning Objectives (What will students learn?)</label>
              <textarea
                rows="3"
                className="course-editor__textarea"
                placeholder="• Build real REST APIs&#10;• Understand dependency injection&#10;• Deploy to Docker"
                value={courseData.learningObjectives}
                onChange={e => setCourseData({ ...courseData, learningObjectives: e.target.value })}
              />
            </div>

            <div className="course-editor__field">
              <label className="course-editor__label">Prerequisites</label>
              <input
                className="course-editor__input"
                placeholder="e.g. Basic familiarity with Java syntax."
                value={courseData.prerequisites}
                onChange={e => setCourseData({ ...courseData, prerequisites: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* ── Tab 2: Skills Taught ── */}
        {activeTab === 'skills' && (
          <div className="course-editor__form-card">
            <h3 style={{ margin: '0 0 8px', color: '#f8fafc' }}>Map to Global Skills</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              Select existing global skills from the Skill Library that this course teaches. (Adhering to system rule: no duplicate skills created).
            </p>

            <div className="course-editor__skills-picker">
              {availableSkills.map(sk => {
                const isSelected = courseData.skills.includes(sk)
                return (
                  <button
                    key={sk}
                    type="button"
                    className={`course-editor__skill-toggle ${isSelected ? 'course-editor__skill-toggle--selected' : ''}`}
                    onClick={() => toggleSkill(sk)}
                  >
                    {isSelected ? '✓ ' : '+ '} {sk}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Tab 3: Lessons Builder ── */}
        {activeTab === 'lessons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>Curriculum Lessons</h3>
              <button type="button" className="course-editor__add-btn" onClick={addLesson}>
                + Add Lesson
              </button>
            </div>

            {courseData.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="course-editor__item-card">
                <div className="course-editor__item-header">
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>Lesson {idx + 1}</span>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => removeLesson(idx)}
                  >
                    Remove 🗑️
                  </button>
                </div>

                <div className="course-editor__form-grid">
                  <div className="course-editor__field">
                    <label className="course-editor__label">Lesson Title</label>
                    <input
                      className="course-editor__input"
                      value={lesson.title}
                      onChange={e => updateLesson(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="course-editor__field">
                    <label className="course-editor__label">Estimated Minutes</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      className="course-editor__input"
                      value={lesson.estimatedMinutes}
                      onChange={e => updateLesson(idx, 'estimatedMinutes', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Lesson Content (Markdown & Code)</label>
                  <textarea
                    rows="6"
                    className="course-editor__textarea"
                    placeholder="Write detailed lesson notes with code snippets..."
                    value={lesson.content}
                    onChange={e => updateLesson(idx, 'content', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab 4: Quizzes Builder ── */}
        {activeTab === 'quizzes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>Interactive Quizzes</h3>
              <button type="button" className="course-editor__add-btn" onClick={addQuizQuestion}>
                + Add Question
              </button>
            </div>

            {courseData.quizzes.map((quiz, qIdx) => (
              <div key={quiz.id} className="course-editor__item-card">
                <div className="course-editor__item-header">
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>Question {qIdx + 1}</span>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => removeQuiz(qIdx)}
                  >
                    Remove 🗑️
                  </button>
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Question Prompt</label>
                  <input
                    className="course-editor__input"
                    value={quiz.question}
                    onChange={e => updateQuiz(qIdx, 'question', e.target.value)}
                  />
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Answer Options (Select correct radio button)</label>
                  {quiz.options.map((opt, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name={`correct-ans-${quiz.id}`}
                        checked={quiz.correctIndex === optIdx}
                        onChange={() => updateQuiz(qIdx, 'correctIndex', optIdx)}
                      />
                      <input
                        className="course-editor__input"
                        value={opt}
                        placeholder={`Option ${optIdx + 1}`}
                        onChange={e => updateQuizOption(qIdx, optIdx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Answer Explanation (Shown to student after answering)</label>
                  <textarea
                    rows="2"
                    className="course-editor__textarea"
                    value={quiz.explanation}
                    onChange={e => updateQuiz(qIdx, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab 5: Assignments Builder ── */}
        {activeTab === 'assignments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>Hands-on Projects & Assignments</h3>
              <button type="button" className="course-editor__add-btn" onClick={addAssignment}>
                + Add Project
              </button>
            </div>

            {courseData.assignments.map((ass, aIdx) => (
              <div key={ass.id} className="course-editor__item-card">
                <div className="course-editor__item-header">
                  <span style={{ fontWeight: 700, color: '#34d399' }}>Project {aIdx + 1}</span>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => removeAssignment(aIdx)}
                  >
                    Remove 🗑️
                  </button>
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Project Title</label>
                  <input
                    className="course-editor__input"
                    value={ass.title}
                    onChange={e => updateAssignment(aIdx, 'title', e.target.value)}
                  />
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Project Instructions & Description</label>
                  <textarea
                    rows="3"
                    className="course-editor__textarea"
                    value={ass.description}
                    onChange={e => updateAssignment(aIdx, 'description', e.target.value)}
                  />
                </div>

                <div className="course-editor__field">
                  <label className="course-editor__label">Starter Code Template</label>
                  <textarea
                    rows="4"
                    className="course-editor__textarea"
                    style={{ fontFamily: 'monospace' }}
                    value={ass.starterCode}
                    onChange={e => updateAssignment(aIdx, 'starterCode', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="course-editor__floating-bar">
        <div className="course-editor__floating-inner">
          <button className="course-editor__btn-draft" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save as Draft'}
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="course-editor__btn-submit" onClick={handleSubmitReview} disabled={saving}>
              {saving ? 'Submitting...' : '🚀 Submit for Admin Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
