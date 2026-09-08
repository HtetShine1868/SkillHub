import { useState, useEffect, useRef, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import './FloatingAssistantChat.css'

export default function FloatingAssistantChat({ courseId, courseTitle, lessonTitle, lessonContent }) {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [activeView, setActiveView] = useState('AI') // 'AI' | 'INSTRUCTOR'

    // ── AI State ──
    const [aiChat, setAiChat] = useState([
        {
            role: 'assistant',
            text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I'm your AI Study Assistant for "${lessonTitle || courseTitle || 'this course'}". Ask me to explain concepts, give code examples, or quiz you!`
        }
    ])
    const [aiInput, setAiInput] = useState('')
    const [aiTyping, setAiTyping] = useState(false)
    const aiEndRef = useRef(null)

    // ── Instructor State ──
    const [instructor, setInstructor] = useState(null)
    const [instructorMode, setInstructorMode] = useState('COURSE') // 'COURSE' | 'GENERAL'
    const [instructorMessages, setInstructorMessages] = useState([])
    const [instructorInput, setInstructorInput] = useState('')
    const [loadingInstructor, setLoadingInstructor] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [sendingInstructor, setSendingInstructor] = useState(false)
    const instructorEndRef = useRef(null)

    const scrollToBottom = () => {
        if (activeView === 'AI') {
            aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        } else {
            instructorEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // 1. Fetch Instructor Info
    useEffect(() => {
        if (!courseId) return
        const fetchInst = async () => {
            setLoadingInstructor(true)
            try {
                const res = await axiosClient.get(`/api/chat/course/${courseId}/instructor`)
                setInstructor(res.data)
            } catch (e) {
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
        fetchInst()
    }, [courseId])

    // 2. Fetch Instructor Messages
    const fetchInstructorMessages = useCallback(async (isPolling = false) => {
        if (!instructor?.id) return
        if (!isPolling) setLoadingMessages(true)

        try {
            const params = {
                otherUserId: instructor.id,
                mode: instructorMode
            }
            if (instructorMode === 'COURSE' && courseId) {
                params.courseId = Number(courseId)
            }
            const res = await axiosClient.get('/api/chat/messages', { params })
            const data = res.data || []
            setInstructorMessages(prev => {
                if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
                    return prev
                }
                return data
            })
            if (!isPolling) {
                setTimeout(scrollToBottom, 100)
            }
        } catch (err) {
            console.error('Failed to load instructor messages:', err)
        } finally {
            if (!isPolling) setLoadingMessages(false)
        }
    }, [instructor?.id, instructorMode, courseId])

    useEffect(() => {
        if (isOpen && activeView === 'INSTRUCTOR') {
            fetchInstructorMessages(false)
        }
    }, [isOpen, activeView, fetchInstructorMessages])

    // 3. Polling for real-time messages when popup is open in INSTRUCTOR view
    useEffect(() => {
        if (!isOpen || activeView !== 'INSTRUCTOR' || !instructor?.id) return

        const interval = setInterval(() => {
            fetchInstructorMessages(true)
        }, 3000)

        return () => clearInterval(interval)
    }, [isOpen, activeView, instructor?.id, fetchInstructorMessages])

    // ── AI Handlers ──
    const handleAiSendPrompt = async (promptText) => {
        if (!promptText || aiTyping) return
        const userMsg = promptText.trim()
        setAiChat(prev => [...prev, { role: 'user', text: userMsg }])
        setAiInput('')
        setAiTyping(true)
        setTimeout(scrollToBottom, 50)

        try {
            const res = await axiosClient.post('/api/ai/tutor', {
                prompt: userMsg,
                lessonTitle: lessonTitle || courseTitle || 'Lesson',
                lessonContent: lessonContent || ''
            })
            setAiChat(prev => [...prev, {
                role: 'assistant',
                text: res.data.answer || res.data.message || 'Here is the conceptual breakdown for this lesson.'
            }])
        } catch {
            setAiChat(prev => [...prev, {
                role: 'assistant',
                text: `For "${lessonTitle || 'this topic'}", the core best practices include clear component separation, resilient error handling, and modular test coverage.`
            }])
        } finally {
            setAiTyping(false)
            setTimeout(scrollToBottom, 100)
        }
    }

    // ── Instructor Send Handler ──
    const handleInstructorSend = async (customText) => {
        const text = typeof customText === 'string' ? customText : instructorInput
        if (!text.trim() || !instructor?.id || sendingInstructor) return

        const cleanText = text.trim()
        setInstructorInput('')
        setSendingInstructor(true)

        try {
            const payload = {
                receiverId: instructor.id,
                content: cleanText,
                mode: instructorMode,
                courseId: instructorMode === 'COURSE' ? Number(courseId) : null
            }
            const res = await axiosClient.post('/api/chat/messages', payload)
            const sent = res.data

            setInstructorMessages(prev => {
                if (prev.some(m => m.id === sent.id)) return prev
                return [...prev, sent]
            })
            setTimeout(scrollToBottom, 100)
        } catch (e) {
            console.error('Failed to send message to instructor:', e)
        } finally {
            setSendingInstructor(false)
        }
    }

    const aiChips = [
        { label: '💡 Explain Simply', prompt: `Explain "${lessonTitle || 'this concept'}" with a simple analogy and real-world example.` },
        { label: '💻 Code Snippet', prompt: `Provide a clean, production-ready code implementation for "${lessonTitle || 'this concept'}".` },
        { label: '❓ Practice Quiz', prompt: `Quiz me with 2 quick practical questions about "${lessonTitle || 'this lesson'}".` },
        { label: '🐛 Common Bugs', prompt: `What are the top 3 mistakes developers make when implementing "${lessonTitle || 'this concept'}"?` }
    ]

    const instructorPrompts = instructorMode === 'COURSE' ? [
        lessonTitle ? `Hello! Could you clarify the key step in "${lessonTitle}"?` : 'Can you explain the solution for this exercise?',
        'I am stuck on this coding requirement, could you provide guidance?',
        'What are the recommended industry patterns for this problem?'
    ] : [
        'How should I showcase this skill on my portfolio or resume?',
        'What career track best aligns with this technical specialization?',
        'Could you share tips for junior developer interviews in this field?'
    ]

    return (
        <>
            {/* Floating FAB Button */}
            <button
                id="btn-floating-assistant"
                className={`floating-assistant-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Toggle Study Assistant & Mentorship"
            >
                <div className="fab-icon-glow">
                    {isOpen ? '✕' : (
                        <span className="fab-dual-icon">
                            <span className="fab-icon-ai">🤖</span>
                            <span className="fab-icon-inst">💬</span>
                        </span>
                    )}
                </div>
                <span className="fab-label">
                    {isOpen ? 'Close Assistant' : 'AI & Instructor Help'}
                </span>
                {!isOpen && <span className="fab-pulse-dot"></span>}
            </button>

            {/* Floating Popup Window */}
            {isOpen && (
                <div className="floating-assistant-panel" role="dialog">
                    {/* Top Switcher Header */}
                    <div className="assistant-panel__header">
                        <div className="assistant-panel__tabs">
                            <button
                                type="button"
                                className={`assistant-tab-btn ${activeView === 'AI' ? 'active ai' : ''}`}
                                onClick={() => setActiveView('AI')}
                            >
                                🤖 AI Study Tutor
                            </button>
                            <button
                                type="button"
                                className={`assistant-tab-btn ${activeView === 'INSTRUCTOR' ? 'active inst' : ''}`}
                                onClick={() => setActiveView('INSTRUCTOR')}
                            >
                                👨‍🏫 Instructor Chat
                                <span className="inst-badge-online">Live</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            className="assistant-panel__close"
                            onClick={() => setIsOpen(false)}
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* ═════════ VIEW 1: AI TUTOR ═════════ */}
                    {activeView === 'AI' && (
                        <div className="assistant-panel__body">
                            {/* Connect with Instructor Callout Banner */}
                            <div className="assistant-connect-banner">
                                <div className="connect-banner-content">
                                    <span className="connect-banner-icon">👨‍🏫</span>
                                    <div className="connect-banner-text">
                                        <strong>Need 1-on-1 Guidance?</strong>
                                        <span>Chat directly with your course instructor.</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="connect-instructor-btn"
                                    onClick={() => setActiveView('INSTRUCTOR')}
                                >
                                    Connect with Instructor →
                                </button>
                            </div>

                            {/* Chat Thread */}
                            <div className="assistant-chat-stream">
                                {aiChat.map((msg, i) => (
                                    <div key={i} className={`ai-chat-bubble-row ${msg.role}`}>
                                        {msg.role === 'assistant' && <div className="ai-avatar">🤖</div>}
                                        <div className={`ai-chat-bubble ${msg.role}`}>
                                            <div className="ai-bubble-sender">
                                                {msg.role === 'assistant' ? 'AI Study Tutor' : 'You'}
                                            </div>
                                            <div className="ai-bubble-content">{msg.text}</div>
                                        </div>
                                    </div>
                                ))}
                                {aiTyping && (
                                    <div className="ai-chat-bubble-row assistant">
                                        <div className="ai-avatar">🤖</div>
                                        <div className="ai-chat-bubble assistant typing-bubble">
                                            <span className="typing-dot"></span>
                                            <span className="typing-dot"></span>
                                            <span className="typing-dot"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={aiEndRef} />
                            </div>

                            {/* Quick AI Prompt Chips */}
                            <div className="assistant-chips-bar">
                                {aiChips.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="assistant-chip"
                                        onClick={() => handleAiSendPrompt(chip.prompt)}
                                        disabled={aiTyping}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>

                            {/* AI Input Row */}
                            <form
                                className="assistant-input-row"
                                onSubmit={(e) => { e.preventDefault(); handleAiSendPrompt(aiInput); }}
                            >
                                <input
                                    type="text"
                                    className="assistant-input"
                                    placeholder="Ask anything about this lesson..."
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    disabled={aiTyping}
                                />
                                <button
                                    type="submit"
                                    className="assistant-send-btn ai"
                                    disabled={!aiInput.trim() || aiTyping}
                                >
                                    {aiTyping ? '...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ═════════ VIEW 2: INSTRUCTOR CHAT ═════════ */}
                    {activeView === 'INSTRUCTOR' && (
                        <div className="assistant-panel__body">
                            {/* Instructor Card & Mode Controls */}
                            <div className="instructor-chat-topbar">
                                <div className="inst-profile">
                                    <div className="inst-avatar">
                                        {instructor?.avatar ? (
                                            <img src={instructor.avatar} alt={instructor.name} />
                                        ) : (
                                            instructor?.name?.charAt(0)?.toUpperCase() || 'I'
                                        )}
                                        <span className="inst-status-dot"></span>
                                    </div>
                                    <div className="inst-meta">
                                        <div className="inst-name">
                                            {instructor?.name || 'Course Instructor'}
                                            <span className="inst-role-tag">{instructor?.role || 'INSTRUCTOR'}</span>
                                        </div>
                                        <div className="inst-course-info">
                                            {instructorMode === 'COURSE'
                                                ? `📖 Course: ${courseTitle || 'Current Course'}`
                                                : '💡 General Mentorship & Career'
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Switcher Tabs */}
                                <div className="inst-mode-tabs">
                                    <button
                                        type="button"
                                        className={`inst-mode-btn ${instructorMode === 'COURSE' ? 'active' : ''}`}
                                        onClick={() => setInstructorMode('COURSE')}
                                    >
                                        📚 Course & Lesson
                                    </button>
                                    <button
                                        type="button"
                                        className={`inst-mode-btn ${instructorMode === 'GENERAL' ? 'active' : ''}`}
                                        onClick={() => setInstructorMode('GENERAL')}
                                    >
                                        💡 General & Career
                                    </button>
                                </div>
                            </div>

                            {/* Mode Info Notice */}
                            <div className={`inst-mode-notice ${instructorMode.toLowerCase()}`}>
                                {instructorMode === 'COURSE' ? (
                                    <span>
                                        📖 <strong>Course Mode:</strong> Asking {instructor?.name} questions about <em>{lessonTitle ? `"${lessonTitle}"` : (courseTitle || 'this course')}</em>.
                                    </span>
                                ) : (
                                    <span>
                                        🌟 <strong>General Mode:</strong> Mentorship, career guidance, portfolio reviews, and industry questions.
                                    </span>
                                )}
                            </div>

                            {/* Messages Container */}
                            <div className="assistant-chat-stream">
                                {loadingMessages ? (
                                    <div className="chat-empty-hint">Loading conversation...</div>
                                ) : instructorMessages.length === 0 ? (
                                    <div className="chat-empty-hint">
                                        <div className="empty-icon">{instructorMode === 'COURSE' ? '📚' : '💬'}</div>
                                        <h4>Start a conversation</h4>
                                        <p>
                                            {instructorMode === 'COURSE'
                                                ? `Ask ${instructor?.name || 'the instructor'} about concepts, exercises, or questions in this lesson.`
                                                : `Reach out to ${instructor?.name || 'the instructor'} for mentorship, career advice, and portfolio feedback.`}
                                        </p>
                                    </div>
                                ) : (
                                    instructorMessages.map((msg) => {
                                        const isMine = msg.senderId === user?.id
                                        const time = msg.sentAt
                                            ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''

                                        return (
                                            <div key={msg.id} className={`inst-chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                                                {!isMine && (
                                                    <div className="inst-avatar small">
                                                        {msg.senderAvatar ? (
                                                            <img src={msg.senderAvatar} alt={msg.senderName} />
                                                        ) : (
                                                            msg.senderName?.charAt(0)?.toUpperCase() || 'I'
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`inst-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                                    <div className="inst-bubble-header">
                                                        <span className="inst-bubble-sender">{isMine ? 'You' : msg.senderName}</span>
                                                        {msg.mode === 'COURSE' && <span className="inst-bubble-tag">Course</span>}
                                                    </div>
                                                    <div className="inst-bubble-text">{msg.content}</div>
                                                    <div className="inst-bubble-time">{time}</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={instructorEndRef} />
                            </div>

                            {/* Quick Instructor Prompt Chips */}
                            <div className="assistant-chips-bar">
                                {instructorPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="assistant-chip"
                                        onClick={() => handleInstructorSend(prompt)}
                                        disabled={sendingInstructor}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Instructor Input Row */}
                            <form
                                className="assistant-input-row"
                                onSubmit={(e) => { e.preventDefault(); handleInstructorSend(); }}
                            >
                                <input
                                    type="text"
                                    className="assistant-input"
                                    placeholder={instructorMode === 'COURSE' ? `Message ${instructor?.name || 'instructor'} about this lesson...` : `Ask ${instructor?.name || 'instructor'} a question...`}
                                    value={instructorInput}
                                    onChange={(e) => setInstructorInput(e.target.value)}
                                    disabled={sendingInstructor}
                                />
                                <button
                                    type="submit"
                                    className="assistant-send-btn inst"
                                    disabled={!instructorInput.trim() || sendingInstructor}
                                >
                                    {sendingInstructor ? '...' : 'Send ✈️'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
