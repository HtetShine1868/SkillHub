import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Layers, FileText, Tag, Users,
  CheckCircle, ClipboardList, Plus, Trash2
} from 'lucide-react'
import ForumNavbar from '../components/ForumNavbar'
import SkillChip from '../components/SkillChip'
import { createProject, getCatalogSkills } from '../services/forumApi'
import '../forum.css'

const CATEGORIES = [
  'Web Development', 'Mobile', 'AI / ML',
  'Data', 'Design', 'Business', 'Cybersecurity', 'Other',
]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const DURATIONS = ['1–2 weeks', '3–4 weeks', '1–2 months', '2–3 months', '3+ months']
const COMMITMENTS = ['2–4 hrs/week', '5–8 hrs/week', '10–15 hrs/week', '15+ hrs/week']
const ROLE_PRESETS = [
  'Frontend', 'Backend', 'Full Stack', 'Designer', 'UI/UX',
  'Mobile', 'Data', 'ML Engineer', 'DevOps', 'QA', 'Product',
]

const FALLBACK_SKILLS = [
  'Java', 'Spring Boot', 'React.js', 'TypeScript', 'JavaScript', 'CSS & Tailwind',
  'Node.js & Express', 'Python', 'FastAPI', 'SQL & PostgreSQL', 'MongoDB', 'Redis',
  'REST APIs', 'GraphQL', 'Apache Kafka', 'Docker & Kubernetes', 'Git & GitHub',
  'CI/CD', 'Linux & Bash', 'Terraform', 'Ansible', 'AWS Cloud', 'Cloud Security',
  'Machine Learning', 'Data Visualization', 'Software Testing', 'React Native', 'Flutter',
]

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  level: '',
  duration: '',
  commitment: '',
  deadline: '',
  tags: '',
}

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [skills, setSkills] = useState([])
  const [goals, setGoals] = useState([{ id: 'new-1', text: '', done: false }])
  const [roles, setRoles] = useState([
    { id: 'r1', name: 'Frontend', slots: 1 },
    { id: 'r2', name: 'Backend', slots: 1 },
  ])
  const [catalogSkills, setCatalogSkills] = useState(FALLBACK_SKILLS)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    getCatalogSkills()
      .then((list) => {
        if (cancelled) return
        const names = list
          .map((s) => (typeof s === 'string' ? s : s?.name))
          .filter(Boolean)
        if (names.length > 0) setCatalogSkills(names)
      })
      .catch(() => {
        if (!cancelled) setCatalogSkills(FALLBACK_SKILLS)
      })
    return () => { cancelled = true }
  }, [])

  const availableSkills = useMemo(
    () => catalogSkills.filter((name) => !skills.includes(name)),
    [catalogSkills, skills]
  )

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e })
  }

  function addSkill(name) {
    const trimmed = name.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
      if (errors.skills) setErrors((prev) => { const e = { ...prev }; delete e.skills; return e })
    }
  }

  function removeSkill(skill) {
    setSkills((prev) => prev.filter((s) => s !== skill))
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
    if (goals.filter((g) => g.text.trim()).length === 0) errs.goals = 'Add at least one project goal'
    const namedRoles = roles.map((r) => r.name.trim()).filter(Boolean)
    if (namedRoles.length === 0) errs.roles = 'Add at least one role opening'
    const lowered = namedRoles.map((n) => n.toLowerCase())
    if (new Set(lowered).size !== lowered.length) errs.roles = 'Each role can only be listed once'
    if (namedRoles.some((n) => n.toLowerCase() === 'owner' || n.toLowerCase() === 'member')) {
      errs.roles = 'Choose a specific role such as Frontend or Designer'
    }
    const totalSlots = roles.filter((r) => r.name.trim()).reduce((sum, r) => sum + r.slots, 0)
    if (totalSlots > 11) errs.roles = 'Teams can have at most 12 people including you'
    return errs
  }

  function addGoal() {
    setGoals((prev) => [...prev, { id: `new-${Date.now()}`, text: '', done: false }])
    if (errors.goals) setErrors((prev) => { const e = { ...prev }; delete e.goals; return e })
  }

  function updateGoal(id, field, value) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
    if (errors.goals) setErrors((prev) => { const e = { ...prev }; delete e.goals; return e })
  }

  function removeGoal(id) {
    setGoals((prev) => (prev.length <= 1 ? prev : prev.filter((g) => g.id !== id)))
  }

  function addRole() {
    setRoles((prev) => [...prev, { id: `r-${Date.now()}`, name: '', slots: 1 }])
    if (errors.roles) setErrors((prev) => { const e = { ...prev }; delete e.roles; return e })
  }

  function updateRole(id, field, value) {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    if (errors.roles) setErrors((prev) => { const e = { ...prev }; delete e.roles; return e })
  }

  function removeRole(id) {
    setRoles((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
  }

  async function handlePublish(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll to first error
      const firstErrEl = document.querySelector('.form-input.error, .form-select.error, .form-textarea.error, .skill-input-area.error, .create-roles.error, .create-goals.error')
      if (firstErrEl) firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const cleanedGoals = goals
        .map((g) => ({ text: g.text.trim(), done: Boolean(g.done) }))
        .filter((g) => g.text)
      const roleSlots = roles
        .map((r) => ({ name: r.name.trim(), slots: r.slots }))
        .filter((r) => r.name && r.slots > 0)
      const maxMembers = 1 + roleSlots.reduce((sum, r) => sum + r.slots, 0)
      const project = await createProject({
        ...form,
        maxMembers,
        skills,
        tags,
        goals: cleanedGoals,
        roles: roleSlots,
      })
      setSuccess(true)
      setTimeout(() => navigate(`/skill-exchange/project/${project.id}`), 1200)
    } catch (err) {
      setErrors({
        submit: err.response?.data?.detail || err.response?.data?.message || 'Failed to create project. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const namedRoles = roles.filter((r) => r.name.trim())
  const collaboratorSlots = namedRoles.reduce((sum, r) => sum + r.slots, 0)
  const maxMembers = 1 + collaboratorSlots
  const spotsLeft = collaboratorSlots
  const dots = Array.from({ length: Math.min(maxMembers, 8) })

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
          <Link to="/skill-exchange" className="project-details__back">
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
            <label className="form-label" htmlFor="skill-select">
              Skills needed <span>*</span>
            </label>
            <select
              id="skill-select"
              className={`form-select ${errors.skills ? 'error' : ''}`}
              value=""
              onChange={(e) => addSkill(e.target.value)}
              aria-required="true"
              aria-label="Select a required skill"
            >
              <option value="">
                {availableSkills.length === 0 ? 'All catalog skills added' : 'Select a skill...'}
              </option>
              {availableSkills.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {skills.length > 0 && (
              <div className="skill-input-area" style={{ marginTop: 10 }}>
                {skills.map((skill) => (
                  <SkillChip key={skill} skill={skill} onRemove={removeSkill} />
                ))}
              </div>
            )}
            {errors.skills && <div className="form-error" role="alert">{errors.skills}</div>}
            <p className="form-hint">Choose skills from the catalog. You can add more than one.</p>
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

        {/* Goals */}
        <motion.div
          className="create-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <div className="create-form-card__title">
            <ClipboardList size={16} />
            Project Goals
          </div>
          <p className="form-hint" style={{ marginTop: 0, marginBottom: 14 }}>
            Define what the team will work toward. You can mark a goal as already finished while creating the project.
          </p>
          <div className={`create-goals ${errors.goals ? 'error' : ''}`}>
            {goals.map((goal, index) => (
              <div key={goal.id} className="create-goal-row">
                <span className="create-goal-row__index">{index + 1}</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Design the landing page"
                  value={goal.text}
                  onChange={(e) => updateGoal(goal.id, 'text', e.target.value)}
                  maxLength={160}
                  aria-label={`Goal ${index + 1}`}
                />
                <label className="create-goal-done">
                  <input
                    type="checkbox"
                    checked={goal.done}
                    onChange={(e) => updateGoal(goal.id, 'done', e.target.checked)}
                  />
                  Finished
                </label>
                <button
                  type="button"
                  className="create-goal-remove"
                  onClick={() => removeGoal(goal.id)}
                  disabled={goals.length <= 1}
                  aria-label={`Remove goal ${index + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          {errors.goals && <div className="form-error" role="alert">{errors.goals}</div>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addGoal} style={{ marginTop: 12 }}>
            <Plus size={14} />
            Add goal
          </button>
        </motion.div>

        {/* Roles needed */}
        <motion.div
          className="create-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.21 }}
        >
          <div className="create-form-card__title">
            <Users size={16} />
            Roles Needed
          </div>
          <p className="form-hint" style={{ marginTop: 0, marginBottom: 14 }}>
            List the openings teammates will apply for. You are the owner and do not take one of these slots.
          </p>

          <div className={`create-roles ${errors.roles ? 'error' : ''}`}>
            {roles.map((role, index) => (
              <div key={role.id} className="create-role-row">
                <span className="create-goal-row__index">{index + 1}</span>
                <input
                  type="text"
                  className="form-input"
                  list="role-presets"
                  placeholder="e.g. Frontend"
                  value={role.name}
                  onChange={(e) => updateRole(role.id, 'name', e.target.value)}
                  maxLength={50}
                  aria-label={`Role ${index + 1} name`}
                />
                <div className="number-stepper number-stepper--sm">
                  <button
                    type="button"
                    className="number-stepper__btn"
                    onClick={() => updateRole(role.id, 'slots', Math.max(1, role.slots - 1))}
                    disabled={role.slots <= 1}
                    aria-label={`Decrease openings for role ${index + 1}`}
                  >
                    −
                  </button>
                  <span className="number-stepper__value" aria-live="polite">{role.slots}</span>
                  <button
                    type="button"
                    className="number-stepper__btn"
                    onClick={() => updateRole(role.id, 'slots', Math.min(8, role.slots + 1))}
                    disabled={role.slots >= 8}
                    aria-label={`Increase openings for role ${index + 1}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="create-goal-remove"
                  onClick={() => removeRole(role.id)}
                  disabled={roles.length <= 1}
                  aria-label={`Remove role ${index + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <datalist id="role-presets">
            {ROLE_PRESETS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {errors.roles && <div className="form-error" role="alert">{errors.roles}</div>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addRole} style={{ marginTop: 12 }}>
            <Plus size={14} />
            Add role
          </button>

          <div className="capacity-preview" aria-label="Capacity preview" style={{ marginTop: 20 }}>
            <div className="capacity-preview__label">Team Preview</div>
            <div className="capacity-preview__dots" aria-hidden="true">
              {dots.map((_, i) => (
                <div
                  key={i}
                  className={`capacity-dot ${i === 0 ? 'capacity-dot--filled' : 'capacity-dot--empty'}`}
                />
              ))}
              {maxMembers > 8 && (
                <span style={{ fontSize: 12, color: 'var(--f-text-muted)', alignSelf: 'center' }}>
                  +{maxMembers - 8} more
                </span>
              )}
            </div>
            <div className="capacity-preview__text">
              <strong>You (owner)</strong>
              {namedRoles.length > 0 && namedRoles.map((r) => (
                <span key={r.id}> · {r.slots} {r.name.trim()}</span>
              ))}
              <br />
              <span style={{ color: 'var(--f-primary-deep)', fontWeight: 600 }}>
                {spotsLeft} opening{spotsLeft !== 1 ? 's' : ''} · team of {maxMembers}
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
            onClick={() => navigate('/skill-exchange')}
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
