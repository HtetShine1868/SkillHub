import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import MemberAvatar from './MemberAvatar'
import SkillChip from './SkillChip'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const pct = Math.round((project.currentMembers / project.maxMembers) * 100)
  const spotsLeft = project.maxMembers - project.currentMembers

  function handleClick() {
    navigate(`/forum/project/${project.id}`)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.article
      className="project-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View project: ${project.title}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="project-card__header">
        <span className="project-card__category">{project.category}</span>
        <StatusBadge status={project.status} />
      </div>

      {/* Title & description */}
      <div>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__desc">{project.description}</p>
      </div>

      {/* Owner */}
      <div className="project-card__owner">
        <MemberAvatar
          name={project.owner.name}
          initials={project.owner.initials}
          size="sm"
        />
        <span className="project-card__owner-name">{project.owner.name}</span>
      </div>

      {/* Skills */}
      <div className="project-card__skills">
        {project.skills.slice(0, 3).map((skill) => (
          <SkillChip key={skill} skill={skill} />
        ))}
        {project.skills.length > 3 && (
          <SkillChip skill={`+${project.skills.length - 3}`} />
        )}
      </div>

      {/* Footer */}
      <div className="project-card__footer">
        {/* Member count & progress */}
        <div className="project-card__meta">
          <span className="project-card__members" aria-label={`${project.currentMembers} of ${project.maxMembers} members`}>
            <Users size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {project.currentMembers} / {project.maxMembers} members
          </span>
          <span style={{ fontWeight: 600, color: spotsLeft === 0 ? 'var(--f-red)' : 'var(--f-primary-deep)' }}>
            {spotsLeft === 0 ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>

        <ProgressBar value={project.currentMembers} max={project.maxMembers} />

        {/* Level & duration */}
        <div className="project-card__level-duration">
          <span>{project.level}</span>
          <span className="project-card__dot" aria-hidden="true" />
          <Clock size={12} />
          <span>{project.duration}</span>
        </div>

        {/* Action */}
        <div className="project-card__actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); handleClick() }}
            aria-label={`View ${project.title} details`}
          >
            View Project
          </button>
          {project.status === 'Recruiting' && (
            <span style={{ fontSize: 12, color: 'var(--f-text-light)' }}>
              {project.pendingRequests > 0 && `${project.pendingRequests} request${project.pendingRequests !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
