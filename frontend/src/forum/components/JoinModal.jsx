import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Send } from 'lucide-react'
import MemberAvatar from './MemberAvatar'
import SkillChip from './SkillChip'
import { MOCK_CURRENT_USER } from '../data/forumData'
import { sendJoinRequest } from '../services/forumApi'

export default function JoinModal({ project, onClose, onSuccess }) {
  const [message, setMessage] = useState('')
  const [skills, setSkills] = useState([...MOCK_CURRENT_USER.skills])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please write a message to the project owner.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await sendJoinRequest(project.id, { message, skills })
      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={handleOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="join-modal-title"
      >
        <motion.div
          className="modal"
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          {/* Header */}
          <div className="modal__header">
            <h2 className="modal__title" id="join-modal-title">
              {success ? '🎉 Request Sent!' : 'Join this project?'}
            </h2>
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          <div className="modal__body">
            {success ? (
              /* Success state */
              <div className="modal__success">
                <div className="modal__success-icon">
                  <CheckCircle size={32} />
                </div>
                <h3>You're all set!</h3>
                <p>
                  Your request has been sent to <strong>{project.owner.name}</strong>.
                  You'll be notified once they respond.
                </p>
                <button
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 24 }}
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            ) : (
              /* Request form */
              <form onSubmit={handleSubmit}>
                {/* Project info */}
                <div className="modal__project-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <MemberAvatar
                      name={project.owner.name}
                      initials={project.owner.initials}
                      size="sm"
                    />
                    <div>
                      <div className="modal__project-title">{project.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--f-text-muted)' }}>
                        by {project.owner.name} · {project.currentMembers}/{project.maxMembers} members
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {project.skills.map((s) => (
                      <SkillChip key={s} skill={s} />
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="form-group">
                  <label className="form-label" htmlFor="join-message">
                    Why would you like to join? <span>*</span>
                  </label>
                  <textarea
                    id="join-message"
                    className={`form-textarea ${error ? 'error' : ''}`}
                    placeholder="Tell the project owner what skills you can contribute and why you're excited about this project..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError('') }}
                    rows={4}
                    aria-required="true"
                    aria-describedby={error ? 'join-message-error' : undefined}
                  />
                  {error && (
                    <div className="form-error" id="join-message-error" role="alert">
                      {error}
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="form-group">
                  <label className="form-label" htmlFor="join-skills">
                    Your relevant skills <span style={{ color: 'var(--f-text-muted)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div className="skill-input-area">
                    {skills.map((skill) => (
                      <SkillChip key={skill} skill={skill} onRemove={removeSkill} />
                    ))}
                    <input
                      id="join-skills"
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={addSkill}
                      placeholder="Add skill & press Enter"
                      aria-label="Add a skill"
                    />
                  </div>
                  <p className="form-hint">Press Enter or comma to add a skill</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                  style={{ marginTop: 4 }}
                >
                  <Send size={15} />
                  {loading ? 'Sending...' : 'Send Join Request'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
