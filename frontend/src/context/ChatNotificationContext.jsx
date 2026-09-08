import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import { useAuth } from './AuthContext'
import { playNotificationSound } from '../utils/soundUtils'
import './ChatNotificationContext.css'

const ChatNotificationContext = createContext(null)

const POLL_INTERVAL_MS = 5000

function seenStorageKey(userId) {
    return `skillhub_chat_seen_${userId}`
}

function loadSeenMap(userId) {
    try {
        const raw = localStorage.getItem(seenStorageKey(userId))
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function saveSeenMap(userId, map) {
    try {
        localStorage.setItem(seenStorageKey(userId), JSON.stringify(map))
    } catch {
        // ignore quota / privacy-mode errors
    }
}

/**
 * Global chat notification provider.
 *
 * Polls a lightweight "conversations" endpoint (role-aware) so students get
 * notified when an instructor replies, and instructors get notified when a
 * student sends a message — regardless of which page they're currently on.
 *
 * The existing page-scoped widgets (DualFloatingChat, InstructorChatInbox)
 * already show their own toast/sound while mounted, so this provider
 * suppresses its own toast+sound on the routes where those widgets are
 * already active, to avoid double notifications. The unread badge count is
 * always kept accurate regardless of route.
 */
export function ChatNotificationProvider({ children }) {
    const { user, isAuthenticated } = useAuth()
    const location = useLocation()

    const [unreadCount, setUnreadCount] = useState(0)
    const [toast, setToast] = useState(null)

    const seenMapRef = useRef({})
    const partnersRef = useRef([])
    const baselinedRef = useRef(false)
    const toastTimerRef = useRef(null)
    const locationRef = useRef(location)

    useEffect(() => {
        locationRef.current = location
    }, [location])

    const role = user?.role
    const isStudent = role === 'ROLE_USER'
    const isInstructor = role === 'ROLE_INSTRUCTOR'

    // Reset local tracking whenever the logged-in user changes (login/logout/switch)
    useEffect(() => {
        baselinedRef.current = false
        partnersRef.current = []
        setUnreadCount(0)
        setToast(null)
        seenMapRef.current = user?.id ? loadSeenMap(user.id) : {}
    }, [user?.id])

    const showToast = useCallback((message) => {
        setToast({ id: Date.now(), message })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 5000)
    }, [])

    const isSuppressedRoute = useCallback(() => {
        const path = locationRef.current?.pathname || ''
        if (isStudent) {
            return path.startsWith('/courses/') || path === '/chat'
        }
        if (isInstructor) {
            return path.startsWith('/instructor/dashboard')
        }
        return false
    }, [isStudent, isInstructor])

    const poll = useCallback(async () => {
        if (!isAuthenticated || !user?.id || (!isStudent && !isInstructor)) return

        try {
            let partners = []

            if (isStudent) {
                const res = await axiosClient.get('/api/chat/conversations').catch(() => null)
                const data = res?.data || []
                partners = data.map(c => ({
                    id: c.partnerId,
                    name: c.partnerName,
                    lastMessage: c.lastMessage,
                    lastSentAt: c.lastSentAt,
                    lastSenderId: c.lastSenderId
                }))
            } else if (isInstructor) {
                const res = await axiosClient.get('/api/chat/instructor/students').catch(() => null)
                let data = res?.data || []
                if (!data || data.length === 0) {
                    const convRes = await axiosClient.get('/api/chat/conversations').catch(() => null)
                    const convs = convRes?.data || []
                    data = convs.map(c => ({
                        id: c.partnerId,
                        name: c.partnerName,
                        lastMessage: c.lastMessage,
                        lastSentAt: c.lastSentAt,
                        lastSenderId: c.lastSenderId
                    }))
                } else {
                    data = data.map(s => ({
                        id: s.id,
                        name: s.name,
                        lastMessage: s.lastMessage,
                        lastSentAt: s.lastSentAt,
                        lastSenderId: s.lastSenderId
                    }))
                }
                partners = data
            }

            partnersRef.current = partners

            const seenMap = { ...seenMapRef.current }
            let newUnread = 0
            let newestIncoming = null

            partners.forEach(p => {
                if (!p.id || !p.lastSentAt) return
                // If we don't know the sender, don't guess — skip rather than risk false positives
                const isIncoming = p.lastSenderId != null && p.lastSenderId === p.id
                if (!isIncoming) return

                const seenAt = seenMap[p.id]
                const isUnseen = !seenAt || new Date(p.lastSentAt).getTime() > new Date(seenAt).getTime()

                if (isUnseen) {
                    newUnread += 1
                    if (!newestIncoming || new Date(p.lastSentAt) > new Date(newestIncoming.lastSentAt)) {
                        newestIncoming = p
                    }
                }
            })

            if (!baselinedRef.current) {
                // First successful poll after (re)load: baseline "seen" silently so
                // pre-existing messages don't spam a notification on every refresh.
                partners.forEach(p => {
                    if (p.id && p.lastSentAt) {
                        seenMap[p.id] = p.lastSentAt
                    }
                })
                seenMapRef.current = seenMap
                saveSeenMap(user.id, seenMap)
                baselinedRef.current = true
                setUnreadCount(0)
                return
            }

            if (newestIncoming && !isSuppressedRoute()) {
                playNotificationSound()
                showToast(
                    isStudent
                        ? `💬 New message from ${newestIncoming.name || 'your instructor'}: "${newestIncoming.lastMessage || ''}"`
                        : `🔔 New message from ${newestIncoming.name || 'a student'}: "${newestIncoming.lastMessage || ''}"`
                )
            }

            setUnreadCount(newUnread)
        } catch {
            // Silently ignore polling errors (network hiccups, auth race, etc.)
        }
    }, [isAuthenticated, user?.id, isStudent, isInstructor, isSuppressedRoute, showToast])

    useEffect(() => {
        if (!isAuthenticated || (!isStudent && !isInstructor)) return
        poll()
        const interval = setInterval(poll, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [isAuthenticated, isStudent, isInstructor, poll])

    const markThreadSeen = useCallback((partnerId, timestamp) => {
        if (!user?.id || !partnerId) return
        const seenMap = { ...seenMapRef.current, [partnerId]: timestamp || new Date().toISOString() }
        seenMapRef.current = seenMap
        saveSeenMap(user.id, seenMap)
        setUnreadCount(prev => Math.max(0, prev - 1))
    }, [user?.id])

    const markAllSeen = useCallback(() => {
        if (!user?.id) return
        const now = new Date().toISOString()
        const seenMap = { ...seenMapRef.current }
        partnersRef.current.forEach(p => {
            if (p.id) seenMap[p.id] = p.lastSentAt || now
        })
        seenMapRef.current = seenMap
        saveSeenMap(user.id, seenMap)
        setUnreadCount(0)
    }, [user?.id])

    const dismissToast = useCallback(() => setToast(null), [])

    return (
        <ChatNotificationContext.Provider value={{ unreadCount, markThreadSeen, markAllSeen }}>
            {children}
            {toast && (
                <div className="chat-global-toast" role="status">
                    <span className="chat-global-toast__icon">💬</span>
                    <span className="chat-global-toast__text">{toast.message}</span>
                    <button className="chat-global-toast__close" onClick={dismissToast} aria-label="Dismiss">✕</button>
                </div>
            )}
        </ChatNotificationContext.Provider>
    )
}

export function useChatNotifications() {
    const ctx = useContext(ChatNotificationContext)
    if (!ctx) {
        return { unreadCount: 0, markThreadSeen: () => {}, markAllSeen: () => {} }
    }
    return ctx
}
