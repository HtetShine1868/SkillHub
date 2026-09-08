import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import { useChatNotifications } from '../context/ChatNotificationContext'
import './ChatPage.css'

export default function ChatPage() {
    const { user } = useAuth()
    const { markThreadSeen, markAllSeen } = useChatNotifications()
    const [searchParams] = useSearchParams()

    // Query params for deep-linking
    const initialInstructorId = searchParams.get('instructorId')
    const initialCourseId = searchParams.get('courseId')
    const initialMode = searchParams.get('mode') || 'COURSE'

    const [conversations, setConversations] = useState([])
    const [availableInstructors, setAvailableInstructors] = useState([])
    const [selectedPartner, setSelectedPartner] = useState(null)
    const [mode, setMode] = useState(initialMode) // 'COURSE' | 'GENERAL'
    const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId ? Number(initialCourseId) : null)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // 1. Fetch initial conversations and available instructors
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true)
            try {
                const [convRes, instRes] = await Promise.all([
                    axiosClient.get('/api/chat/conversations'),
                    axiosClient.get('/api/chat/available-instructors')
                ])

                const convList = convRes.data || []
                const instList = instRes.data || []

                setConversations(convList)
                setAvailableInstructors(instList)

                // If deep linked with instructorId
                if (initialInstructorId) {
                    const foundInst = instList.find(i => String(i.id) === String(initialInstructorId))
                    if (foundInst) {
                        setSelectedPartner({
                            partnerId: foundInst.id,
                            partnerName: foundInst.name,
                            partnerAvatar: foundInst.avatar,
                            partnerRole: foundInst.role,
                            courses: foundInst.courses || []
                        })
                        if (initialCourseId) {
                            setSelectedCourseId(Number(initialCourseId))
                        } else if (foundInst.courses?.length > 0) {
                            setSelectedCourseId(foundInst.courses[0].id)
                        }
                    }
                } else if (convList.length > 0) {
                    // Default to first conversation
                    const first = convList[0]
                    const matchingInst = instList.find(i => i.id === first.partnerId)
                    setSelectedPartner({
                        ...first,
                        courses: matchingInst?.courses || []
                    })
                    if (first.courseId) setSelectedCourseId(first.courseId)
                    if (first.mode) setMode(first.mode)
                } else if (instList.length > 0) {
                    // Default to first available instructor
                    const first = instList[0]
                    setSelectedPartner({
                        partnerId: first.id,
                        partnerName: first.name,
                        partnerAvatar: first.avatar,
                        partnerRole: first.role,
                        courses: first.courses || []
                    })
                    if (first.courses?.length > 0) {
                        setSelectedCourseId(first.courses[0].id)
                    }
                }

                // Visiting the Chat page means the user has seen all current conversations
                markAllSeen()
            } catch (err) {
                console.error('Failed to load chat data:', err)
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialInstructorId, initialCourseId])

    // Helper to fetch messages
    const fetchMessages = useCallback(async (isPolling = false) => {
        if (!selectedPartner?.partnerId) return

        try {
            const params = {
                otherUserId: selectedPartner.partnerId,
                mode: mode
            }
            if (mode === 'COURSE' && selectedCourseId) {
                params.courseId = selectedCourseId
            }
            const res = await axiosClient.get('/api/chat/messages', { params })
            const data = res.data || []
            setMessages(prev => {
                // If content is identical, do not trigger re-render
                if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
                    return prev
                }
                return data
            })
            // Actively viewing this thread — keep it marked as seen for the global badge
            markThreadSeen(selectedPartner.partnerId)
            if (!isPolling) {
                setTimeout(scrollToBottom, 100)
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        }
    }, [selectedPartner?.partnerId, mode, selectedCourseId, markThreadSeen])

    // 2. Fetch message thread when partner, mode, or course changes
    useEffect(() => {
        fetchMessages(false)
    }, [fetchMessages])

    // 3. Polling interval for real-time updates (every 3 seconds)
    useEffect(() => {
        if (!selectedPartner?.partnerId) return

        const intervalId = setInterval(() => {
            fetchMessages(true)
        }, 3000)

        return () => clearInterval(intervalId)
    }, [selectedPartner?.partnerId, fetchMessages])

    // Send message
    const handleSendMessage = async (e) => {
        e?.preventDefault()
        if (!inputValue.trim() || !selectedPartner?.partnerId || sending) return

        const messageText = inputValue.trim()
        setInputValue('')
        setSending(true)

        try {
            const payload = {
                receiverId: selectedPartner.partnerId,
                content: messageText,
                mode: mode,
                courseId: mode === 'COURSE' ? selectedCourseId : null
            }
            const res = await axiosClient.post('/api/chat/messages', payload)
            const sentMsg = res.data

            setMessages(prev => {
                if (prev.some(m => m.id === sentMsg.id)) return prev
                return [...prev, sentMsg]
            })
            setTimeout(scrollToBottom, 100)

            setConversations(prev => {
                const existing = prev.find(c => c.partnerId === selectedPartner.partnerId)
                if (existing) {
                    return prev.map(c => c.partnerId === selectedPartner.partnerId ? {
                        ...c,
                        lastMessage: messageText,
                        lastSentAt: new Date().toISOString()
                    } : c)
                }
                return [{
                    partnerId: selectedPartner.partnerId,
                    partnerName: selectedPartner.partnerName,
                    partnerAvatar: selectedPartner.partnerAvatar,
                    partnerRole: selectedPartner.partnerRole,
                    lastMessage: messageText,
                    lastSentAt: new Date().toISOString(),
                    mode: mode,
                    courseId: selectedCourseId
                }, ...prev]
            })
        } catch (err) {
            console.error('Failed to send message:', err)
        } finally {
            setSending(false)
        }
    }

    const selectConversation = (partner) => {
        setSelectedPartner(partner)
        markThreadSeen(partner.partnerId)
        const matchingInst = availableInstructors.find(i => i.id === partner.partnerId)
        if (matchingInst?.courses?.length > 0) {
            if (!selectedCourseId || !matchingInst.courses.some(c => c.id === selectedCourseId)) {
                setSelectedCourseId(matchingInst.courses[0].id)
            }
        }
    }

    const currentInstructorCourses = selectedPartner?.courses ||
        availableInstructors.find(i => i.id === selectedPartner?.partnerId)?.courses || []

    const activeCourseName = currentInstructorCourses.find(c => c.id === selectedCourseId)?.title || 'Course'

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Left Sidebar */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar__header">
                        <h2>💬 Chat & Mentorship</h2>
                        <span className="chat-sidebar__status-badge">
                            🟢 Online
                        </span>
                    </div>

                    {/* Available Enrolled Instructors */}
                    <div className="chat-sidebar__section-title">Instructors (Enrolled Courses)</div>
                    <div className="chat-sidebar__instructors">
                        {availableInstructors.length === 0 ? (
                            <div className="chat-sidebar__empty">
                                <p>Enroll in a course to start chatting with instructors!</p>
                                <Link to="/courses" className="chat-sidebar__explore-link">Explore Courses →</Link>
                            </div>
                        ) : (
                            availableInstructors.map(inst => {
                                const isSelected = selectedPartner?.partnerId === inst.id
                                return (
                                    <div
                                        key={inst.id}
                                        className={`chat-sidebar__instructor-card ${isSelected ? 'active' : ''}`}
                                        onClick={() => selectConversation({
                                            partnerId: inst.id,
                                            partnerName: inst.name,
                                            partnerAvatar: inst.avatar,
                                            partnerRole: inst.role,
                                            courses: inst.courses
                                        })}
                                    >
                                        <div className="chat-sidebar__avatar">
                                            {inst.avatar ? (
                                                <img src={inst.avatar} alt={inst.name} />
                                            ) : (
                                                inst.name?.charAt(0)?.toUpperCase() || 'I'
                                            )}
                                        </div>
                                        <div className="chat-sidebar__info">
                                            <div className="chat-sidebar__name">{inst.name}</div>
                                            <div className="chat-sidebar__meta">
                                                {inst.courses?.length || 0} Course{inst.courses?.length > 1 ? 's' : ''} • Instructor
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Recent Conversations */}
                    {conversations.length > 0 && (
                        <>
                            <div className="chat-sidebar__section-title">Recent Conversations</div>
                            <div className="chat-sidebar__conv-list">
                                {conversations.map(conv => {
                                    const isSelected = selectedPartner?.partnerId === conv.partnerId
                                    return (
                                        <div
                                            key={conv.partnerId}
                                            className={`chat-sidebar__conv-item ${isSelected ? 'active' : ''}`}
                                            onClick={() => selectConversation(conv)}
                                        >
                                            <div className="chat-sidebar__avatar small">
                                                {conv.partnerAvatar ? (
                                                    <img src={conv.partnerAvatar} alt={conv.partnerName} />
                                                ) : (
                                                    conv.partnerName?.charAt(0)?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="chat-sidebar__conv-details">
                                                <div className="chat-sidebar__conv-name">{conv.partnerName}</div>
                                                <div className="chat-sidebar__conv-snippet">{conv.lastMessage}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="chat-main">
                    {selectedPartner ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header">
                                <div className="chat-header__partner">
                                    <div className="chat-header__avatar">
                                        {selectedPartner.partnerAvatar ? (
                                            <img src={selectedPartner.partnerAvatar} alt={selectedPartner.partnerName} />
                                        ) : (
                                            selectedPartner.partnerName?.charAt(0)?.toUpperCase() || 'I'
                                        )}
                                    </div>
                                    <div className="chat-header__partner-info">
                                        <div className="chat-header__name">
                                            {selectedPartner.partnerName}
                                            <span className="chat-header__badge">{selectedPartner.partnerRole || 'INSTRUCTOR'}</span>
                                        </div>
                                        <div className="chat-header__subtext">
                                            {mode === 'COURSE' ? `Discussion for: ${activeCourseName}` : 'General Mentorship & Questions'}
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Switcher & Course Selector */}
                                <div className="chat-header__controls">
                                    <div className="chat-mode-tabs">
                                        <button
                                            type="button"
                                            className={`chat-mode-tab ${mode === 'COURSE' ? 'active' : ''}`}
                                            onClick={() => setMode('COURSE')}
                                        >
                                            📚 Lessons & Course
                                        </button>
                                        <button
                                            type="button"
                                            className={`chat-mode-tab ${mode === 'GENERAL' ? 'active' : ''}`}
                                            onClick={() => setMode('GENERAL')}
                                        >
                                            💡 General & Career
                                        </button>
                                    </div>

                                    {mode === 'COURSE' && currentInstructorCourses.length > 1 && (
                                        <select
                                            className="chat-course-select"
                                            value={selectedCourseId || ''}
                                            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                                        >
                                            {currentInstructorCourses.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Mode Banner */}
                            <div className={`chat-mode-banner ${mode.toLowerCase()}`}>
                                {mode === 'COURSE' ? (
                                    <span>
                                        📖 <strong>Course & Lesson Mode:</strong> Discuss exercises, lessons, code challenges, and curriculum doubts for <em>{activeCourseName}</em>.
                                    </span>
                                ) : (
                                    <span>
                                        🌟 <strong>General Mode:</strong> Ask mentorship questions, career advice, industry insights, or general feedback.
                                    </span>
                                )}
                            </div>

                            {/* Messages Container */}
                            <div className="chat-messages">
                                {loading ? (
                                    <div className="chat-empty-state">Loading messages...</div>
                                ) : messages.length === 0 ? (
                                    <div className="chat-empty-state">
                                        <div className="chat-empty-icon">{mode === 'COURSE' ? '📚' : '💬'}</div>
                                        <h3>No messages in this mode yet</h3>
                                        <p>
                                            {mode === 'COURSE'
                                                ? `Start a conversation with ${selectedPartner.partnerName} about lessons or coursework!`
                                                : `Reach out to ${selectedPartner.partnerName} for career guidance, portfolio reviews, or general questions.`}
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.senderId === user?.id
                                        const sentTime = msg.sentAt
                                            ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`chat-bubble-row ${isMine ? 'mine' : 'partner'}`}
                                            >
                                                {!isMine && (
                                                    <div className="chat-bubble-avatar">
                                                        {msg.senderAvatar ? (
                                                            <img src={msg.senderAvatar} alt={msg.senderName} />
                                                        ) : (
                                                            msg.senderName?.charAt(0)?.toUpperCase() || 'U'
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`chat-bubble ${isMine ? 'mine' : 'partner'}`}>
                                                    <div className="chat-bubble__sender">
                                                        {isMine ? 'You' : msg.senderName}
                                                        {msg.mode === 'COURSE' && (
                                                            <span className="chat-bubble__mode-tag">Course</span>
                                                        )}
                                                    </div>
                                                    <div className="chat-bubble__text">{msg.content}</div>
                                                    <div className="chat-bubble__time">{sentTime}</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input Box */}
                            <form className="chat-input-box" onSubmit={handleSendMessage}>
                                <div className="chat-input-pill">
                                    {mode === 'COURSE' ? `Asking about: ${activeCourseName}` : 'General Inquiry'}
                                </div>
                                <div className="chat-input-wrapper">
                                    <textarea
                                        className="chat-input-field"
                                        placeholder={`Message ${selectedPartner.partnerName}... (Press Enter to send)`}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage()
                                            }
                                        }}
                                        rows={2}
                                    />
                                    <button
                                        type="submit"
                                        className="chat-send-btn"
                                        disabled={!inputValue.trim() || sending}
                                    >
                                        {sending ? '...' : 'Send ✈️'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="chat-no-selection">
                            <div className="chat-no-selection-icon">💬</div>
                            <h2>Select an Instructor to Chat</h2>
                            <p>Connect with your course instructors for real-time guidance on lessons or career advice.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
