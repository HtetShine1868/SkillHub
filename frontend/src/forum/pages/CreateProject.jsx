import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Layers, FileText, Tag, Users,
  Clock, Calendar, Zap, CheckCircle
} from 'lucide-react'
import ForumNavbar from '../components/ForumNavbar'
import SkillChip from '../components/SkillChip'
import { createProject } from '../services/forumApi'
import '../forum.css'

const CATEGORIES = [
  'Web Development', 'Mobile', 'AI / ML',
  'Data', 'Design', 'Business', 'Cybersecurity', 'Other',
]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const DURATIONS = ['1–2 weeks', '3–4 weeks', '1–2 months', '2–3 months', '3+ months']
const COMMITMENTS = ['2–4 hrs/week', '5–8 hrs/week', '10–15 hrs/week', '15+ hrs/week']

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  level: '',
  maxMembers: 4,
  duration: '',
  commitment: '',
  deadline: '',
  tags: '',
}

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e })
  }

  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
      if (errors.skills) setErrors((prev) => { const e = { ...prev }; delete e.skills; return e })
    }
    setSkillInput('')
  }

  function removeSkill(skill) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  function handleSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Project title is required'
    if (form.title.length > 80) errs.title = 'Title must be 80 characters or less'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.length < 30) errs.description = 'Description must be at least 30 characters'
    if (!form.category) errs.category = 'Please select a category'
    if (skills.length === 0) errs.skills = 'Add at least one required skill'
    if (!form.level) errs.level = 'Please select an experience level'
    if (!form.duration) errs.duration = 'Please select a duration'
    if (!form.commitment) errs.commitment = 'Please select a commitment level'
    return errs
  }

  async function handlePublish(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll to first error
      const firstErrEl = document.querySelector('.form-input.error, .form-select.error, .form-textarea.error, .skill-input-area.error')
      if (firstErrEl) firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const project = await createProject({ ...form, skills, tags })
      setSuccess(true)
      setTimeout(() => navigate(`/forum/project/${project.id}`), 1200)
    } catch {
      setErrors({ submit: 'Failed to create project. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const spotsLeft = form.maxMembers - 1  // 1 = current user (owner)
  const dots = Array.from({ length: Math.min(form.maxMembers, 8) })

  if (success) {
    return (
      <div className="forum-layout">
        <ForumNavbar />
        <div className="full-page-center">
          <motion.div
            style={{ textAlign: 'center', padding: 32 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ width: 72, height: 72, background: 'var(--f-green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--f-green)' }}>
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>Project Created!</h2>
            <p style={{ color: 'var(--f-text-muted)' }}>Redirecting to your project...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="forum-layout">
      <ForumNavbar />

      {/* Page header */}
      <div className="page-header">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link to="/forum" className="project-details__back">
            <ArrowLeft size={16} />
            Back to Forum
          </Link>
          <div className="page-header__eyebrow">New Project</div>
          <h1 className="page-header__title">Create a Project</h1>
          <p className="page-header__subtitle">
            Share your idea with the SkillHub community and find the right collaborators to build it together.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handlePublish} className="create-project-form" noValidate>
        {/* Basic Info */}
        <motion.div
          className="create-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="create-form-card__title">
            <FileText size={16} />
            Basic Information
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-title">
              Project Title <span>*</span>
            </label>
            <input
              id="project-title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g. AI-Powered Study Assistant"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              maxLength={80}
              aria-required="true"
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && <div className="form-error" id="title-error" role="alert">{errors.title}</div>}
            <div className="form-hint">{form.title.length}/80 characters</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-desc">
              Description <span>*</span>
            </label>
            <textarea
              id="project-desc"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe your project — what are you building, what problem does it solve, and what will collaborators work on?"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={5}
              aria-required="true"
              aria-describedby={errors.description ? 'desc-error' : undefined}
            />
            {errors.description && <div className="form-error" id="desc-error" role="alert">{errors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="project-category">
                Category <span>*</span>
              </label>
              <select
                id="project-category"
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                aria-required="true"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div className="form-error" role="alert">{errors.category}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="project-level">
                Experience Level <span>*</span>
              </label>
              <select
                id="project-level"
                className={`form-select ${errors.level ? 'error' : ''}`}
                value={form.level}
                onChange={(e) => setField('level', e.target.value)}
                aria-required="true"
              >
                <option value="">Select level...</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <div className="form-error" role="alert">{errors.level}</div>}
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          className="create-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.07 }}
        >
          <div className="create-form-card__title">
            <Tag size={16} />
            Required Skills
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="skill-input">
              Skills needed <span>*</span>
            </label>
            <div className={`skill-input-area ${errors.skills ? 'error' : ''}`}>
              {skills.map((skill) => (
                <SkillChip key={skill} skill={skill} onRemove={removeSkill} />
              ))}
              <input
                id="skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={addSkill}
                placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
                aria-label="Add required skill"
              />
            </div>
            {errors.skills && <div className="form-error" role="alert">{errors.skills}</div>}
            <p className="form-hint">Press Enter or comma to add each skill</p>
          </div>
        </motion.div>

        {/* Project Details */}
        <motion.div
          className="create-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
        >
          <div className="create-form-card__title">
            <Layers size={16} />
            Project Details
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="project-duration">
                Duration <span>*</span>
              </label>
              <select
                id="project-duration"
                className={`form-select ${errors.duration ? 'error' : ''}`}
                value={form.duration}
                onChange={(e) => setField('duration', e.target.value)}
                aria-required="true"
              >
                <option value="">Select duration...</option>
                {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.duration && <div className="form-error" role="alert">{errors.duration}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-commitment">
                Weekly Commitment <span>*</span>
              </label>
              <select
                id="project-commitment"
                className={`form-select ${errors.commitment ? 'error' : ''}`}
                value={form.commitment}
                onChange={(e) => setField('commitment', e.target.value)}
                aria-required="true"
              >
                <option value="">Select commitment...</option>
                {COMMITMENTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.commitment && <div className="form-error" role="alert">{errors.commitment}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-deadline">
              Project Deadline
            </label>
            <input
              id="project-deadline"
              type="date"
              className="form-input"
              value={form.deadline}
              onChange={(e) => setField('deadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="project-tags">
              Tags
            </label>
            <input
              id="project-tags"
              type="text"
              className="form-input"
              placeholder="e.g. Education, AI, Students (comma-separated)"
              value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
            />
            <p className="form-hint">Separate tags with commas</p>
          </div>
        </motion.div>

        {/* Team Size */}
        <motion.div
          className="create-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.21 }}
        >
          <div className="create-form-card__title">
            <Users size={16} />
            Team Capacity
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Maximum Members</label>
            <div className="number-stepper">
              <button
                type="button"
                className="number-stepper__btn"
                onClick={() => setField('maxMembers', Math.max(2, form.maxMembers - 1))}
                disabled={form.maxMembers <= 2}
                aria-label="Decrease maximum members"
              >
                −
              </button>
              <span className="number-stepper__value" aria-live="polite">{form.maxMembers}</span>
              <button
                type="button"
                className="number-stepper__btn"
                onClick={() => setField('maxMembers', Math.min(12, form.maxMembers + 1))}
                disabled={form.maxMembers >= 12}
                aria-label="Increase maximum members"
              >
                +
              </button>
            </div>
          </div>

          {/* Capacity preview */}
          <div className="capacity-preview" aria-label="Capacity preview">
            <div className="capacity-preview__label">Project Capacity Preview</div>
            <div className="capacity-preview__dots" aria-hidden="true">
              {dots.map((_, i) => (
                <div
                  key={i}
                  className={`capacity-dot ${i === 0 ? 'capacity-dot--filled' : 'capacity-dot--empty'}`}
                />
              ))}
              {form.maxMembers > 8 && (
                <span style={{ fontSize: 12, color: 'var(--f-text-muted)', alignSelf: 'center' }}>
                  +{form.maxMembers - 8} more
                </span>
              )}
            </div>
            <div className="capacity-preview__text">
              <strong>Current members: 1</strong> (you) ·{' '}
              <strong>Maximum: {form.maxMembers}</strong>
              <br />
              <span style={{ color: 'var(--f-primary-deep)', fontWeight: 600 }}>
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        </motion.div>

        {/* Submit error */}
        {errors.submit && (
          <div className="form-error" role="alert" style={{ marginBottom: 16, fontSize: 14 }}>
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="create-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/forum')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => {/* Draft logic */}}
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
