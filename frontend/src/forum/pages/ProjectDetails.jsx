import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Clock, Calendar, Zap, Target,
  MessageCircle, Heart, Reply, Send, Users,
  CheckCircle, Circle, ClipboardList
} from 'lucide-react'
import ForumNavbar from '../components/ForumNavbar'
import MemberAvatar from '../components/MemberAvatar'
import SkillChip from '../components/SkillChip'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import JoinModal from '../components/JoinModal'
import { getProjectById, addComment, toggleCommentLike } from '../services/forumApi'
import { useAuth } from '../../context/AuthContext'
import '../forum.css'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return `${Math.floor(diffHrs / 24)}d ago`
}

function formatDeadline(dateStr) {
  if (!dateStr) return 'No deadline'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectDetails() {
  const { user: currentUser } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [likedComments, setLikedComments] = useState(new Set())

  async function loadProject() {
    setLoading(true)
    try {
      const data = await getProjectById(id)
      setProject(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProject() }, [id])

  async function handleAddComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    await addComment(project.id, commentText)
    setCommentText('')
    loadProject()
  }

  async function handleAddReply(e, commentId) {
    e.preventDefault()
    if (!replyText.trim()) return
    await addComment(project.id, replyText, commentId)
    setReplyText('')
    setReplyingTo(null)
    loadProject()
  }

  async function handleLike(commentId) {
    if (likedComments.has(commentId)) return
    setLikedComments((prev) => new Set([...prev, commentId]))
    await toggleCommentLike(project.id, commentId)
    loadProject()
  }

  if (loading) {
    return (
      <div className="forum-layout">
        <ForumNavbar />
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Loading project...</span>
        </div>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="forum-layout">
        <ForumNavbar />
        <div className="forum-empty full-page-center">
          <div className="forum-empty__icon">🔍</div>
          <h3>Project not found</h3>
          <p>This project may have been removed or doesn't exist.</p>
          <Link to="/skill-exchange" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Forum
          </Link>
        </div>
      </div>
    )
  }

  const pct = Math.round((project.currentMembers / project.maxMembers) * 100)
  const spotsLeft = project.maxMembers - project.currentMembers
  const isFull = spotsLeft === 0
  const isOwner = project.userStatus === 'owner'
  const isMember = project.userStatus === 'member'
  const isPending = project.userStatus === 'pending'

  const openSlots = Array.from({ length: spotsLeft })

  return (
    <div className="forum-layout">
      <ForumNavbar />

      <div className="project-details">
        {/* Back */}
        <button
          className="project-details__back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={15} />
          Back to Forum
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="project-details__badges">
            <span className="project-card__category">{project.category}</span>
            <StatusBadge status={project.status} />
            {isOwner && (
              <span style={{ fontSize: 12, background: 'var(--f-blue-bg)', color: 'var(--f-blue)', padding: '3px 10px', borderRadius: 'var(--f-radius-full)', fontWeight: 600 }}>
                Your Project
              </span>
            )}
          </div>

          <h1 className="project-details__title">{project.title}</h1>

          <div className="project-details__owner">
            <MemberAvatar name={project.owner.name} initials={project.owner.initials} size="lg" />
            <div className="project-details__owner-info">
              <span className="project-details__owner-name">{project.owner.name}</span>
              <span className="project-details__owner-label">
                Project Owner · Posted {timeAgo(project.createdAt)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="project-details__content">
          {/* Main column */}
          <div className="project-details__main">
            {/* Description */}
            <motion.div
              className="details-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <h2 className="details-section__title">
                <FileTextIcon />
                About this Project
              </h2>
              <p className="project-description">{project.description}</p>

              {/* Required Skills */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--f-text-dark)', marginBottom: 10 }}>
                  Required Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.skills.map((skill) => (
                    <SkillChip key={skill} skill={skill} />
                  ))}
                </div>
              </div>

              {/* Tags */}
              {project.tags?.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{ fontSize: 12, color: 'var(--f-text-muted)', background: 'var(--f-bg)', border: '1px solid var(--f-border)', padding: '2px 10px', borderRadius: 'var(--f-radius-full)' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Project Goals */}
            <motion.div
              className="details-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="details-section__title">
                <ClipboardList size={16} />
                Project Goals
              </h2>
              <div className="goals-list" role="list">
                {project.goals.map((goal) => (
                  <div key={goal.id} className="goal-item" role="listitem">
                    <div className={`goal-check ${goal.done ? 'goal-check--done' : 'goal-check--todo'}`}>
                      {goal.done
                        ? <CheckCircle size={14} />
                        : <Circle size={12} />
                      }
                    </div>
                    <span className={`goal-text ${goal.done ? 'done' : ''}`}>
                      {goal.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Discussion */}
            <motion.div
              className="details-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <h2 className="details-section__title">
                <MessageCircle size={16} />
                Discussion
                {project.discussion.length > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--f-text-muted)', fontWeight: 400, marginLeft: 4 }}>
                    ({project.discussion.length})
                  </span>
                )}
              </h2>

              {project.discussion.length === 0 ? (
                <p style={{ color: 'var(--f-text-muted)', fontSize: 14 }}>
                  No comments yet. Start the conversation!
                </p>
              ) : (
                <div className="discussion-list">
                  {project.discussion.map((comment) => (
                    <div key={comment.id} className="discussion-comment">
                      <MemberAvatar name={comment.author.name} initials={comment.author.initials} size="sm" />
                      <div className="discussion-comment__body">
                        <div className="discussion-comment__header">
                          <span className="discussion-comment__name">{comment.author.name}</span>
                          <span className="discussion-comment__time">{timeAgo(comment.timestamp)}</span>
                        </div>
                        <p className="discussion-comment__text">"{comment.text}"</p>
                        <div className="discussion-comment__actions">
                          <button
                            className={`discussion-action-btn ${likedComments.has(comment.id) ? 'liked' : ''}`}
                            onClick={() => handleLike(comment.id)}
                            aria-label={`Like comment, ${comment.likes} likes`}
                          >
                            <Heart size={13} />
                            {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                          </button>
                          <button
                            className="discussion-action-btn"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            aria-label="Reply to comment"
                          >
                            <Reply size={13} />
                            Reply
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies?.length > 0 && (
                          <div className="discussion-replies">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="discussion-comment">
                                <MemberAvatar name={reply.author.name} initials={reply.author.initials} size="sm" />
                                <div className="discussion-comment__body">
                                  <div className="discussion-comment__header">
                                    <span className="discussion-comment__name">{reply.author.name}</span>
                                    <span className="discussion-comment__time">{timeAgo(reply.timestamp)}</span>
                                  </div>
                                  <p className="discussion-comment__text">{reply.text}</p>
                                  <div className="discussion-comment__actions">
                                    <button
                                      className={`discussion-action-btn ${likedComments.has(reply.id) ? 'liked' : ''}`}
                                      onClick={() => handleLike(reply.id)}
                                      aria-label={`Like reply, ${reply.likes} likes`}
                                    >
                                      <Heart size={13} />
                                      {reply.likes + (likedComments.has(reply.id) ? 1 : 0)}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply input */}
                        {replyingTo === comment.id && (
                          <form onSubmit={(e) => handleAddReply(e, comment.id)} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <MemberAvatar name={currentUser?.name} initials={currentUser?.initials} size="sm" />
                            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                              <textarea
                                className="form-textarea"
                                placeholder={`Reply to ${comment.author.name}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                style={{ minHeight: 60, resize: 'none' }}
                                aria-label="Write a reply"
                                autoFocus
                              />
                              <button type="submit" className="btn btn-primary btn-sm" disabled={!replyText.trim()} aria-label="Send reply">
                                <Send size={13} />
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New comment */}
              <form onSubmit={handleAddComment} className="discussion-input-area">
                <MemberAvatar name={currentUser?.name} initials={currentUser?.initials} size="sm" />
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    aria-label="Write a comment"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={!commentText.trim()}
                    >
                      <Send size={13} />
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="project-details__sidebar">
            {/* Join section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <div className="details-section">
                {/* Capacity bar */}
                <div className="capacity-bar-section">
                  <div className="capacity-bar-label">
                    <span className="capacity-bar-count">
                      <Users size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                      {project.currentMembers} / {project.maxMembers} members
                    </span>
                    <span className="capacity-bar-pct">{pct}%</span>
                  </div>
                  <ProgressBar value={project.currentMembers} max={project.maxMembers} />
                  <p style={{ fontSize: 12, color: 'var(--f-text-muted)', marginTop: 6 }}>
                    {isFull
                      ? 'This project is full'
                      : `${spotsLeft} open position${spotsLeft !== 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Join button */}
                <div className="join-btn-section">
                  {isOwner ? (
                    <>
                      <Link
                        to={`/skill-exchange/project/${project.id}/requests`}
                        className="btn btn-primary btn-full"
                      >
                        Manage Requests
                        {project.pendingRequests > 0 && (
                          <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                            {project.pendingRequests}
                          </span>
                        )}
                      </Link>
                      <p>You are the project owner</p>
                    </>
                  ) : isMember ? (
                    <>
                      <button className="btn btn-secondary btn-full" disabled>
                        <CheckCircle size={15} />
                        You Are a Member
                      </button>
                      <p>You're already part of this project</p>
                    </>
                  ) : isPending ? (
                    <>
                      <button className="btn btn-secondary btn-full" disabled>
                        ⏳ Request Pending
                      </button>
                      <p>Your join request is awaiting approval</p>
                    </>
                  ) : isFull ? (
                    <>
                      <button className="btn btn-ghost btn-full" disabled>
                        Project Full
                      </button>
                      <p>This project has reached maximum capacity</p>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary btn-full"
                        onClick={() => setShowJoinModal(true)}
                      >
                        <Users size={15} />
                        Join Project
                      </button>
                      <p>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
                    </>
                  )}
                </div>
              </div>

              {/* Project info */}
              <div className="details-section">
                <h2 className="details-section__title">
                  <Target size={16} />
                  Project Info
                </h2>
                <div className="project-info-grid">
                  <div className="project-info-item">
                    <div className="project-info-item__label">
                      <Target size={10} style={{ display: 'inline', marginRight: 3 }} />
                      Level
                    </div>
                    <div className="project-info-item__value">{project.level}</div>
                  </div>
                  <div className="project-info-item">
                    <div className="project-info-item__label">
                      <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                      Duration
                    </div>
                    <div className="project-info-item__value">{project.duration}</div>
                  </div>
                  <div className="project-info-item">
                    <div className="project-info-item__label">
                      <Zap size={10} style={{ display: 'inline', marginRight: 3 }} />
                      Commitment
                    </div>
                    <div className="project-info-item__value">{project.commitment}</div>
                  </div>
                  <div className="project-info-item">
                    <div className="project-info-item__label">
                      <Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />
                      Deadline
                    </div>
                    <div className="project-info-item__value">{formatDeadline(project.deadline)}</div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="details-section">
                <h2 className="details-section__title">
                  <Users size={16} />
                  Project Members
                </h2>
                <div className="members-grid">
                  {project.members.map((member) => (
                    <div key={member.id} className="member-card">
                      <MemberAvatar name={member.name} initials={member.initials} size="lg" />
                      <div className="member-card__name">{member.name}</div>
                      <div className="member-card__role">{member.role}</div>
                    </div>
                  ))}
                  {openSlots.map((_, i) => (
                    <div key={`open-${i}`} className="member-card open-slot">
                      <div className="open-slot-icon">+</div>
                      <div className="member-card__role">Open position</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <JoinModal
          project={project}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false)
            loadProject()
          }}
        />
      )}
    </div>
  )
}

// Small inline icon component to avoid import issues
function FileTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
