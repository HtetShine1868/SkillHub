import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, X, AlertCircle, Users } from 'lucide-react'
import ForumNavbar from '../components/ForumNavbar'
import MemberAvatar from '../components/MemberAvatar'
import SkillChip from '../components/SkillChip'
import ProgressBar from '../components/ProgressBar'
import {
  getProjectById,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '../services/forumApi'
import '../forum.css'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffHrs = Math.round((now - date) / 3600000)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return `${Math.floor(diffHrs / 24)}d ago`
}

export default function ProjectRequests() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [resolved, setResolved] = useState({})  // requestId -> 'approved' | 'rejected'
  const [projectFull, setProjectFull] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [proj, reqs] = await Promise.all([
        getProjectById(id),
        getJoinRequests(id),
      ])
      setProject(proj)
      setRequests(reqs)
      setProjectFull(proj.currentMembers >= proj.maxMembers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleApprove(requestId) {
    setActionLoading((prev) => ({ ...prev, [requestId]: 'approving' }))
    try {
      await approveJoinRequest(id, requestId)
      setResolved((prev) => ({ ...prev, [requestId]: 'approved' }))
      // Reload to get updated project
      const updated = await getProjectById(id)
      setProject(updated)
      if (updated.currentMembers >= updated.maxMembers) {
        setProjectFull(true)
      }
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[requestId]; return n })
    }
  }

  async function handleReject(requestId) {
    setActionLoading((prev) => ({ ...prev, [requestId]: 'rejecting' }))
    try {
      await rejectJoinRequest(id, requestId)
      setResolved((prev) => ({ ...prev, [requestId]: 'rejected' }))
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[requestId]; return n })
    }
  }

  if (loading) {
    return (
      <div className="forum-layout">
        <ForumNavbar />
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Loading requests...</span>
        </div>
      </div>
    )
  }

  const pendingCount = requests.filter((r) => !resolved[r.id]).length

  return (
    <div className="forum-layout">
      <ForumNavbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 64px', width: '100%' }}>
        {/* Back */}
        <Link
          to={`/skill-exchange/project/${id}`}
          className="project-details__back"
          style={{ display: 'inline-flex', marginBottom: 24 }}
        >
          <ArrowLeft size={15} />
          Back to Project
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="page-header__eyebrow">{project?.title}</div>
          <h1 className="page-header__title" style={{ marginBottom: 8 }}>
            Join Requests
          </h1>

          {/* Project capacity */}
          {project && (
            <div style={{
              background: 'var(--f-surface)',
              border: '1px solid var(--f-border)',
              borderRadius: 'var(--f-radius-md)',
              padding: '14px 18px',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} style={{ color: 'var(--f-primary-deep)' }} />
                <span style={{ fontWeight: 600, color: 'var(--f-text-dark)' }}>
                  {project.currentMembers} / {project.maxMembers} members
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <ProgressBar value={project.currentMembers} max={project.maxMembers} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--f-text-muted)', whiteSpace: 'nowrap' }}>
                {project.maxMembers - project.currentMembers} spot{project.maxMembers - project.currentMembers !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}

          {/* Project full banner */}
          <AnimatePresence>
            {projectFull && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  background: 'var(--f-orange-bg)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: 'var(--f-radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  color: 'var(--f-orange)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
                role="alert"
              >
                <AlertCircle size={16} />
                This project is now full. No more members can be accepted.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Requests list */}
        {requests.length === 0 ? (
          <div className="forum-empty">
            <div className="forum-empty__icon">📬</div>
            <h3>No pending requests</h3>
            <p>There are no join requests for this project yet.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: 'var(--f-text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--f-text-dark)' }}>{pendingCount}</strong> pending request{pendingCount !== 1 ? 's' : ''}
            </p>
            <AnimatePresence>
              {requests.map((req, i) => {
                const status = resolved[req.id]
                const isActing = actionLoading[req.id]

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: status ? 0.6 : 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="request-card"
                    style={status ? { background: 'var(--f-bg)' } : {}}
                  >
                    {/* Header */}
                    <div className="request-card__header">
                      <div className="request-card__applicant">
                        <MemberAvatar
                          name={req.applicant.name}
                          initials={req.applicant.initials}
                          size="lg"
                        />
                        <div className="request-card__applicant-info">
                          <h4>{req.applicant.name}</h4>
                          <div className="request-card__date">
                            Applied {timeAgo(req.date)}
                          </div>
                        </div>
                      </div>
                      <span className="request-card__level">{req.level}</span>
                    </div>

                    {/* Skills */}
                    <div className="request-card__skills">
                      {req.skills.map((skill) => (
                        <SkillChip key={skill} skill={skill} />
                      ))}
                    </div>

                    {/* Message */}
                    <div className="request-card__message">
                      "{req.message}"
                    </div>

                    {/* Actions */}
                    {status === 'approved' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f-green)', fontWeight: 600, fontSize: 14 }}>
                        <CheckCircle size={16} />
                        Accepted — {req.applicant.name} has joined the project
                      </div>
                    ) : status === 'rejected' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f-red)', fontWeight: 600, fontSize: 14 }}>
                        <X size={16} />
                        Request rejected
                      </div>
                    ) : (
                      <div className="request-card__actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(req.id)}
                          disabled={isActing || projectFull}
                          aria-label={`Accept ${req.applicant.name}'s request`}
                        >
                          <CheckCircle size={15} />
                          {isActing === 'approving' ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(req.id)}
                          disabled={isActing}
                          aria-label={`Reject ${req.applicant.name}'s request`}
                        >
                          <X size={15} />
                          {isActing === 'rejecting' ? 'Rejecting...' : 'Reject'}
                        </button>
                        {projectFull && !status && (
                          <span style={{ fontSize: 12, color: 'var(--f-orange)' }}>
                            Project is full — cannot accept
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
