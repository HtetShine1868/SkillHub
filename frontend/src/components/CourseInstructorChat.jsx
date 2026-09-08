import { useState, useEffect, useRef, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import './CourseInstructorChat.css'

export default function CourseInstructorChat({ courseId, courseTitle, lessonTitle, defaultMode = 'COURSE' }) {
    const { user } = useAuth()
    const [mode, setMode] = useState(defaultMode) // 'COURSE' | 'GENERAL'
    const [instructor, setInstructor] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [loadingInstructor, setLoadingInstructor] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // 1. Load instructor for this course
    useEffect(() => {
        const loadInstructor = async () => {
            if (!courseId) return
            setLoadingInstructor(true)
            try {
                const res = await axiosClient.get(`/api/chat/course/${courseId}/instructor`)
                setInstructor(res.data)
            } catch (err) {
                console.error('Failed to load instructor for course:', err)
                // Fallback default instructor
                setInstructor({
                    id: 1,
                    name: 'Course Instructor',
                    role: 'INSTRUCTOR',
                    avatar: null
                })
            } finally {
                setLoadingInstructor(false)
            }
        }

        loadInstructor()
    }, [courseId])

    // 2. Fetch messages for the selected instructor & mode
    const fetchMessages = useCallback(async (isPolling = false) => {
        if (!instructor?.id) return

        if (!isPolling) setLoadingMessages(true)
        try {
            const params = {
                otherUserId: instructor.id,
                mode: mode
            }
            if (mode === 'COURSE' && courseId) {
                params.courseId = Number(courseId)
            }
            const res = await axiosClient.get('/api/chat/messages', { params })
            const data = res.data || []
            setMessages(prev => {
                if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
                    return prev
                }
                return data
            })
            if (!isPolling) {
                setTimeout(scrollToBottom, 100)
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        } finally {
            if (!isPolling) setLoadingMessages(false)
        }
    }, [instructor?.id, mode, courseId])

    useEffect(() => {
        fetchMessages(false)
    }, [fetchMessages])

    // 3. Polling for real-time incoming messages
    useEffect(() => {
        if (!instructor?.id) return

        const interval = setInterval(() => {
            fetchMessages(true)
        }, 3000)

        return () => clearInterval(interval)
    }, [instructor?.id, fetchMessages])

    // 4. Send message
    const handleSend = async (customText) => {
        const textToSend = typeof customText === 'string' ? customText : inputValue
        if (!textToSend.trim() || !instructor?.id || sending) return

        const cleanText = textToSend.trim()
        setInputValue('')
        setSending(true)

        try {
            const payload = {
                receiverId: instructor.id,
                content: cleanText,
                mode: mode,
                courseId: mode === 'COURSE' ? Number(courseId) : null
            }
            const res = await axiosClient.post('/api/chat/messages', payload)
            const sentMsg = res.data

            setMessages(prev => {
                if (prev.some(m => m.id === sentMsg.id)) return prev
                return [...prev, sentMsg]
            })
            setTimeout(scrollToBottom, 100)
        } catch (err) {
            console.error('Failed to send message:', err)
        } finally {
            setSending(false)
        }
    }

    const quickPrompts = mode === 'COURSE' ? [
        lessonTitle ? `Can you explain the main concept in "${lessonTitle}"?` : 'Can you explain the solution for this lesson?',
        'I am stuck on this coding exercise, could you give me a hint?',
        'What are the common edge cases for this topic?'
    ] : [
        'How can I prepare for junior roles in this track?',
        'What real-world portfolio project would you recommend?',
        'Could you share tips for technical interviews?'
    ]

    if (loadingInstructor) {
        return (
            <div className="course-chat-card loading">
                <div className="course-chat-spinner"></div>
                <p>Connecting with course instructor...</p>
            </div>
        )
    }

    return (
        <div className="course-chat-card">
            {/* Header */}
            <div className="course-chat-header">
                <div className="course-chat-instructor">
                    <div className="course-chat-avatar">
                        {instructor?.avatar ? (
                            <img src={instructor.avatar} alt={instructor.name} />
                        ) : (
                            instructor?.name?.charAt(0)?.toUpperCase() || 'I'
                        )}
                        <span className="course-chat-status-dot" title="Instructor online"></span>
                    </div>
                    <div className="course-chat-instructor-meta">
                        <div className="course-chat-name">
                            {instructor?.name || 'Course Instructor'}
                            <span className="course-chat-role-badge">{instructor?.role || 'INSTRUCTOR'}</span>
                        </div>
                        <div className="course-chat-course-context">
                            {mode === 'COURSE' ? (
                                <span>📖 Course Mentorship: <strong>{courseTitle || 'Current Course'}</strong></span>
                            ) : (
                                <span>💡 General Mentorship & Career Guidance</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="course-chat-mode-tabs">
                    <button
                        type="button"
                        className={`course-chat-mode-btn ${mode === 'COURSE' ? 'active' : ''}`}
                        onClick={() => setMode('COURSE')}
                    >
                        📚 Course & Lesson
                    </button>
                    <button
                        type="button"
                        className={`course-chat-mode-btn ${mode === 'GENERAL' ? 'active' : ''}`}
                        onClick={() => setMode('GENERAL')}
                    >
                        💡 General & Other
                    </button>
                </div>
            </div>

            {/* Mode Description Notice */}
            <div className={`course-chat-notice ${mode.toLowerCase()}`}>
                {mode === 'COURSE' ? (
                    <span>
                        💬 <strong>Course Mode:</strong> Asking questions directly related to <em>{courseTitle || 'this course'}</em> {lessonTitle ? `and lesson "${lessonTitle}"` : ''}.
                    </span>
                ) : (
                    <span>
                        🌟 <strong>General Mode:</strong> Ask anything about careers, portfolio reviews, industry best practices, or general mentorship.
                    </span>
                )}
            </div>

            {/* Message Thread Area */}
            <div className="course-chat-messages">
                {loadingMessages ? (
                    <div className="course-chat-empty">Loading conversation...</div>
                ) : messages.length === 0 ? (
                    <div className="course-chat-empty">
                        <div className="course-chat-empty-icon">{mode === 'COURSE' ? '📚' : '💬'}</div>
                        <h4>No messages yet in this mode</h4>
                        <p>
                            {mode === 'COURSE'
                                ? `Have questions about this lesson or exercise? Ask ${instructor?.name} below!`
                                : `Ask ${instructor?.name} for general advice, industry guidance, or learning roadmaps.`}
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === user?.id
                        const sentTime = msg.sentAt
                            ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''

                        return (
                            <div key={msg.id} className={`course-chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                                {!isMine && (
                                    <div className="course-chat-bubble-avatar">
                                        {msg.senderAvatar ? (
                                            <img src={msg.senderAvatar} alt={msg.senderName} />
                                        ) : (
                                            msg.senderName?.charAt(0)?.toUpperCase() || 'I'
                                        )}
                                    </div>
                                )}
                                <div className={`course-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                    <div className="course-chat-bubble-header">
                                        <span className="course-chat-bubble-author">{isMine ? 'You' : msg.senderName}</span>
                                        {msg.mode === 'COURSE' && <span className="course-chat-tag">Course</span>}
                                    </div>
                                    <div className="course-chat-bubble-text">{msg.content}</div>
                                    <div className="course-chat-bubble-time">{sentTime}</div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="course-chat-quick-prompts">
                <span className="course-chat-quick-label">Suggested:</span>
                {quickPrompts.map((prompt, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className="course-chat-prompt-pill"
                        onClick={() => handleSend(prompt)}
                        disabled={sending}
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {/* Input form */}
            <form className="course-chat-input-row" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <input
                    type="text"
                    className="course-chat-input"
                    placeholder={mode === 'COURSE' ? `Ask ${instructor?.name || 'instructor'} about this course/lesson...` : `Ask ${instructor?.name || 'instructor'} general question...`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="course-chat-send-btn"
                    disabled={!inputValue.trim() || sending}
                >
                    {sending ? '...' : 'Send ✈️'}
                </button>
            </form>
        </div>
    )
}
