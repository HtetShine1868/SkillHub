import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { playNotificationSound } from '../utils/soundUtils'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService'
import '../context/ChatNotificationContext.css'

const NotificationContext = createContext(null)
const POLL_INTERVAL_MS = 15000

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)

  const knownIdsRef = useRef(new Set())
  const baselinedRef = useRef(false)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    knownIdsRef.current = new Set()
    baselinedRef.current = false
    setNotifications([])
    setToast(null)
  }, [user?.id])

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 5000)
  }, [])

  const poll = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return
    try {
      const list = await getNotifications()
      if (!baselinedRef.current) {
        knownIdsRef.current = new Set(list.map((n) => n.id))
        baselinedRef.current = true
        setNotifications(list)
        return
      }

      const newestUnread = list.find((n) => !knownIdsRef.current.has(n.id) && !n.read)
      if (newestUnread && newestUnread.type !== 'INSTRUCTOR_REPLY' && newestUnread.type !== 'CHAT_MESSAGE') {
        playNotificationSound()
        showToast(newestUnread.title)
      }
      knownIdsRef.current = new Set(list.map((n) => n.id))
      setNotifications(list)
    } catch {
      // ignore polling hiccups
    }
  }, [isAuthenticated, user?.id, showToast])

  useEffect(() => {
    if (!isAuthenticated) return
    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isAuthenticated, poll])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await markNotificationRead(id)
    } catch {
      // keep optimistic state
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsRead()
    } catch {
      // keep optimistic state
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh: poll }}>
      {children}
      {toast && (
        <div className="chat-global-toast" role="status">
          <span className="chat-global-toast__icon">🔔</span>
          <span className="chat-global-toast__text">{toast.message}</span>
          <button className="chat-global-toast__close" onClick={() => setToast(null)} aria-label="Dismiss">✕</button>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      markRead: async () => {},
      markAllRead: async () => {},
      refresh: async () => {},
    }
  }
  return ctx
}
