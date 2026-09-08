import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, Clock, Settings, Inbox } from 'lucide-react'
import ForumNavbar from '../components/ForumNavbar'
import MemberAvatar from '../components/MemberAvatar'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import SkillChip from '../components/SkillChip'
import { getMyProjects, getMyPendingRequests } from '../services/forumApi'
import '../forum.css'

const TABS = [
  { id: 'owned', label: 'My Projects', icon: <Users size={14} /> },
  { id: 'joined', label: 'Joined Projects', icon: <Users size={14} /> },
  { id: 'pending', label: 'Pending Requests', icon: <Inbox size={14} /> },
]

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffHrs = Math.round((now - date) / 3600000)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return `${Math.floor(diffHrs / 24)}d ago`
}

export default function MyProjects() {
  const [activeTab, setActiveTab] = useState('owned')
  const [owned, setOwned] = useState([])
  const [joined, setJoined] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [projectsData, pendingData] = await Promise.all([
          getMyProjects(),
          getMyPendingRequests(),
        ])
        setOwned(projectsData.owned)
        setJoined(projectsData.joined)
        setPending(pendingData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const counts = { owned: owned.length, joined: joined.length, pending: pending.length }

  return (
    <div className="forum-layout">
      <ForumNavbar />

      <div className="page-header">
        <div className="page-header__eyebrow">Dashboard</div>
        <h1 className="page-header__title">My Projects</h1>
        <p className="page-header__subtitle">
          Manage your projects, track joined collaborations, and follow up on your pending requests.
        </p>
      </div>

      <div className="forum-container" style={{ paddingBottom: 64 }}>
        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Link to="/skill-exchange/create" className="btn btn-primary">
            <Plus size={16} />
            Create New Project
          </Link>
        </div>

        {/* Tabs */}
        <div className="my-projects-tabs" role="tablist" aria-label="My projects tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`my-projects-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className="tab-badge">{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Loading projects...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* My Projects */}
              {activeTab === 'owned' && (
                owned.length === 0 ? (
                  <EmptyState
                    icon="🚀"
                    title="No projects yet"
                    text="Create your first project and find your dream team."
                    action={<Link to="/skill-exchange/create" className="btn btn-primary"><Plus size={15} />Create Project</Link>}
                  />
                ) : (
                  <div>
                    {owned.map((project) => (
                      <div key={project.id} className="my-project-card">
                        <div className="my-project-card__info">
                          <div className="my-project-card__title">
                            <Link to={`/skill-exchange/project/${project.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {project.title}
                            </Link>
                          </div>
                          <div className="my-project-card__meta">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Users size={12} />
                              {project.currentMembers}/{project.maxMembers} members
                            </span>
                            <StatusBadge status={project.status} />
                            {project.pendingRequests > 0 && (
                              <span style={{ background: 'var(--f-orange-bg)', color: 'var(--f-orange)', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 'var(--f-radius-full)' }}>
                                {project.pendingRequests} pending request{project.pendingRequests !== 1 ? 's' : ''}
                              </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--f-text-light)' }}>
                              <Clock size={12} />
                              {project.duration}
                            </span>
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {project.skills.slice(0, 4).map((s) => <SkillChip key={s} skill={s} />)}
                          </div>
                          <div style={{ marginTop: 10, maxWidth: 300 }}>
                            <ProgressBar value={project.currentMembers} max={project.maxMembers} />
                          </div>
                        </div>
                        <div className="my-project-card__actions">
                          {project.pendingRequests > 0 && (
                            <Link
                              to={`/skill-exchange/project/${project.id}/requests`}
                              className="btn btn-primary btn-sm"
                              aria-label={`Manage ${project.pendingRequests} requests for ${project.title}`}
                            >
                              <Inbox size={13} />
                              Requests ({project.pendingRequests})
                            </Link>
                          )}
                          <Link
                            to={`/skill-exchange/project/${project.id}`}
                            className="btn btn-secondary btn-sm"
                            aria-label={`View ${project.title}`}
                          >
                            <Settings size={13} />
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Joined Projects */}
              {activeTab === 'joined' && (
                joined.length === 0 ? (
                  <EmptyState
                    icon="🤝"
                    title="Not in any projects yet"
                    text="Explore the forum and join a project that excites you!"
                    action={<Link to="/skill-exchange" className="btn btn-primary">Browse Projects</Link>}
                  />
                ) : (
                  <div>
                    {joined.map((project) => (
                      <div key={project.id} className="my-project-card">
                        <div className="my-project-card__info">
                          <div className="my-project-card__title">
                            <Link to={`/skill-exchange/project/${project.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {project.title}
                            </Link>
                          </div>
                          <div className="my-project-card__meta">
                            <span>by {project.owner.name}</span>
                            <StatusBadge status={project.status} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--f-text-light)' }}>
                              <Clock size={12} />
                              {project.duration}
                            </span>
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {project.skills.slice(0, 4).map((s) => <SkillChip key={s} skill={s} />)}
                          </div>
                        </div>
                        <div className="my-project-card__actions">
                          <Link
                            to={`/skill-exchange/project/${project.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            View Project
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Pending Requests */}
              {activeTab === 'pending' && (
                pending.length === 0 ? (
                  <EmptyState
                    icon="📬"
                    title="No pending requests"
                    text="You haven't sent any join requests yet, or all have been resolved."
                    action={<Link to="/skill-exchange" className="btn btn-primary">Explore Projects</Link>}
                  />
                ) : (
                  <div>
                    {pending.map((req) => (
                      <div key={req.id} className="pending-request-card">
                        <MemberAvatar name={req.project?.owner.name} initials={req.project?.owner.initials} size="lg" />
                        <div className="pending-request-card__body">
                          <div className="pending-request-card__project">
                            Requested to join
                          </div>
                          <div className="pending-request-card__title">
                            {req.project?.title || 'Unknown Project'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span className="pending-badge">
                              ⏳ Pending
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--f-text-light)' }}>
                              Sent {timeAgo(req.date)}
                            </span>
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {req.skills.slice(0, 4).map((s) => <SkillChip key={s} skill={s} />)}
                          </div>
                        </div>
                        <Link
                          to={`/skill-exchange/project/${req.projectId}`}
                          className="btn btn-ghost btn-sm"
                          style={{ flexShrink: 0 }}
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, text, action }) {
  return (
    <div className="forum-empty" style={{ paddingTop: 60 }}>
      <div className="forum-empty__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}
