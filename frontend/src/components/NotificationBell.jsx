import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import './NotificationBell.css'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function typeIcon(type) {
  switch (type) {
    case 'PROJECT_MESSAGE': return '💬'
    case 'PROJECT_JOIN':
    case 'JOIN_APPROVED': return '🤝'
    case 'JOIN_REQUEST': return '📩'
    case 'INSTRUCTOR_REPLY': return '🎓'
    case 'CHAT_MESSAGE': return '✉️'
    default: return '🔔'
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState({ top: 72, right: 16 })
  const wrapRef = useRef(null)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onClick(e) {
      const inBell = wrapRef.current?.contains(e.target)
      const inPanel = panelRef.current?.contains(e.target)
      if (!inBell && !inPanel) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open || !wrapRef.current) return

    const place = () => {
      const rect = wrapRef.current.getBoundingClientRect()
      const width = Math.min(380, window.innerWidth - 24)
      let right = window.innerWidth - rect.right
      if (right + width > window.innerWidth - 12) {
        right = 12
      }
      setPanelPos({
        top: Math.min(rect.bottom + 10, window.innerHeight - 120),
        right: Math.max(12, right),
      })
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  async function handleItemClick(item) {
    if (!item.read) await markRead(item.id)
    setOpen(false)
    if (item.link) navigate(item.link)
  }

  return (
    <div className="notif-bell" ref={wrapRef}>
      <button
        type="button"
        className={`notif-bell__btn ${open ? 'open' : ''}`}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          className="notif-bell__panel"
          role="dialog"
          aria-label="Notifications"
          style={{ top: panelPos.top, right: panelPos.right }}
        >
          <div className="notif-bell__header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="notif-bell__mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="notif-bell__empty">You are all caught up.</div>
          ) : (
            <ul className="notif-bell__list">
              {notifications.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`notif-bell__item ${item.read ? '' : 'unread'}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="notif-bell__icon">{typeIcon(item.type)}</span>
                    <span className="notif-bell__body">
                      <span className="notif-bell__title">{item.title}</span>
                      <span className="notif-bell__message">{item.message}</span>
                      <span className="notif-bell__time">{timeAgo(item.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
