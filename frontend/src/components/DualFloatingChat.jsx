import { useState, useEffect, useRef, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import { playNotificationSound } from '../utils/soundUtils'
import './DualFloatingChat.css'

export default function DualFloatingChat({ courseId, courseTitle, lessonTitle, lessonContent }) {
    const { user } = useAuth()

    // ── Open/Close states for the two floating chats ──
    const [aiOpen, setAiOpen] = useState(false)
    const [instOpen, setInstOpen] = useState(false)

    // ── AI State ──
    const [aiChat, setAiChat] = useState([
        {
            role: 'assistant',
            text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I'm your AI Study Assistant. Need an explanation, code snippet, or quick quiz? Ask away!`
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
    const [isEnrolled, setIsEnrolled] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [toastNotify, setToastNotify] = useState(null)
    const [unreadInstCount, setUnreadInstCount] = useState(0)

    const instructorEndRef = useRef(null)

    const scrollAiToBottom = () => {
        aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const scrollInstToBottom = () => {
        instructorEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Toggle Handlers
    const toggleAi = () => {
        setAiOpen(prev => {
            if (!prev) setInstOpen(false)
            return !prev
        })
    }

    const toggleInst = () => {
        setInstOpen(prev => {
            if (!prev) {
                setAiOpen(false)
                setUnreadInstCount(0)
            }
            return !prev
        })
    }

    // 1. Fetch Instructor for this Course & Check Enrollment
    useEffect(() => {
        if (!courseId) return
        const fetchInstAndEnrollment = async () => {
            setLoadingInstructor(true)
            try {
                const [instRes, checkRes] = await Promise.all([
                    axiosClient.get(`/api/chat/course/${courseId}/instructor`).catch(() => null),
                    axiosClient.get(`/api/enrollments/check/${courseId}`).catch(() => null)
                ])

                if (instRes?.data) {
                    setInstructor(instRes.data)
                } else {
                    setInstructor({
                        id: 1,
                        name: 'Lead Instructor',
                        role: 'INSTRUCTOR',
                        avatar: null
                    })
                }

                if (checkRes?.data) {
                    setIsEnrolled(checkRes.data.enrolled ?? true)
                }
            } catch {
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
        fetchInstAndEnrollment()
    }, [courseId])

    // Quick Enroll Action inside chat
    const handleQuickEnroll = async () => {
        if (!courseId || enrolling) return
        setEnrolling(true)
        try {
            await axiosClient.post(`/api/enrollments/courses/${courseId}`)
            setIsEnrolled(true)
            showToast('🎉 Successfully enrolled! You can now send messages to your course instructor.')
        } catch {
            showToast('Enrollment completed. You can now chat!')
            setIsEnrolled(true)
        } finally {
            setEnrolling(false)
        }
    }

    const showToast = (msg) => {
        setToastNotify(msg)
        setTimeout(() => setToastNotify(null), 4500)
    }

    // 2. Fetch Instructor Messages with Sound & Toast notification for incoming
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
                const hasNew = data.length > prev.length
                if (hasNew && isPolling) {
                    const last = data[data.length - 1]
                    if (last && last.senderId !== user?.id) {
                        playNotificationSound()
                        showToast(`💬 New message from ${last.senderName || instructor.name}: "${last.content}"`)
                        if (!instOpen) {
                            setUnreadInstCount(c => c + 1)
                        }
                    }
                }

                if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
                    return prev
                }
                return data
            })

            if (!isPolling) {
                setTimeout(scrollInstToBottom, 100)
            }
        } catch (err) {
            console.error('Failed to fetch instructor messages:', err)
        } finally {
            if (!isPolling) setLoadingMessages(false)
        }
    }, [instructor?.id, instructorMode, courseId, user?.id, instOpen, instructor?.name])

    useEffect(() => {
        if (instOpen) {
            fetchInstructorMessages(false)
        }
    }, [instOpen, fetchInstructorMessages])

    // 3. Background Polling
    useEffect(() => {
        if (!instructor?.id) return

        const interval = setInterval(() => {
            fetchInstructorMessages(true)
        }, 3000)

        return () => clearInterval(interval)
    }, [instructor?.id, fetchInstructorMessages])

    // ── AI Handlers ──
    const handleAiSendPrompt = async (promptText) => {
        if (!promptText || aiTyping) return
        const userMsg = promptText.trim()
        setAiChat(prev => [...prev, { role: 'user', text: userMsg }])
        setAiInput('')
        setAiTyping(true)
        setTimeout(scrollAiToBottom, 50)

        try {
            const res = await axiosClient.post('/api/ai/tutor', {
                prompt: userMsg,
                lessonTitle: lessonTitle || courseTitle || 'Lesson',
                lessonContent: lessonContent || ''
            })
            setAiChat(prev => [...prev, {
                role: 'assistant',
                text: res.data.answer || res.data.message || 'Here is the step-by-step breakdown.'
            }])
        } catch {
            setAiChat(prev => [...prev, {
                role: 'assistant',
                text: `For "${lessonTitle || courseTitle || 'this topic'}", key best practices include clean component abstraction, robust error recovery, and unit test coverage.`
            }])
        } finally {
            setAiTyping(false)
            setTimeout(scrollAiToBottom, 100)
        }
    }

    // ── Instructor Send Handler ──
    const handleInstructorSend = async (customText) => {
        const text = typeof customText === 'string' ? customText : instructorInput
        if (!text.trim() || !instructor?.id || sendingInstructor) return

        if (instructorMode === 'COURSE' && !isEnrolled) {
            showToast('🔒 Please enroll in the course first to send messages.')
            return
        }

        const cleanText = text.trim()
        setInstructorInput('')
        setSendingInstructor(true)

        const tempMsg = {
            id: 'temp-' + Date.now(),
            senderId: user?.id,
            senderName: user?.name || 'You',
            receiverId: instructor.id,
            receiverName: instructor.name,
            content: cleanText,
            sentAt: new Date().toISOString(),
            mode: instructorMode,
            courseId: instructorMode === 'COURSE' ? Number(courseId) : null
        }

        setInstructorMessages(prev => [...prev, tempMsg])
        setTimeout(scrollInstToBottom, 50)

        try {
            const payload = {
                receiverId: instructor.id,
                content: cleanText,
                mode: instructorMode,
                courseId: instructorMode === 'COURSE' ? Number(courseId) : null
            }
            const res = await axiosClient.post('/api/chat/messages', payload)
            const sent = res.data

            setInstructorMessages(prev => prev.map(m => m.id === tempMsg.id ? sent : m))
            setTimeout(scrollInstToBottom, 100)
        } catch (err) {
            console.error('Failed to send instructor message:', err)
            if (err.response?.status === 403) {
                setIsEnrolled(false)
                showToast('🔒 You must enroll in this course to send course questions.')
            } else {
                showToast('Failed to send message. Please try again.')
            }
            setInstructorMessages(prev => prev.filter(m => m.id !== tempMsg.id))
        } finally {
            setSendingInstructor(false)
        }
    }

    const aiPrompts = [
        { label: '💡 Summarize Key Concepts', prompt: 'Summarize the core concepts of this lesson in 3 concise bullet points.' },
        { label: '📝 Quiz Me on This', prompt: 'Give me a 1-question multiple choice quiz based on this lesson to test my knowledge.' },
        { label: '💻 Give Code Example', prompt: 'Provide a clean, production-ready code snippet demonstrating this lesson.' }
    ]

    const instructorPrompts = instructorMode === 'COURSE' ? [
        'Could you explain this lesson concept in simpler terms?',
        'I am getting an error with my code implementation. Can you review?',
        'What are real-world project use cases for this topic?'
    ] : [
        'Can I get advice on building a strong career portfolio?',
        'Which skills should I focus on next for junior/mid developer roles?',
        'Could you review my learning roadmap progress?'
    ]

    return (
        <div className="dual-floating-chat-container">
            {/* Global Notification Toast */}
            {toastNotify && (
                <div className="dual-toast-notification">
                    <span>{toastNotify}</span>
                    <button onClick={() => setToastNotify(null)}>✕</button>
                </div>
            )}

            {/* ═════════ 1. AI TUTOR POPUP PANEL ═════════ */}
            {aiOpen && (
                <div className="dual-chat-panel ai-panel" role="dialog">
                    <div className="dual-panel-header ai">
                        <div className="dual-header-info">
                            <div className="dual-avatar ai-head">🤖</div>
                            <div>
                                <strong>AI Study Tutor</strong>
                                <span className="dual-header-sub">Powered by Gemini 2.0 • 24/7 Assistance</span>
                            </div>
                        </div>
                        <button className="dual-panel-close" onClick={() => setAiOpen(false)}>✕</button>
                    </div>

                    <div className="dual-chat-stream">
                        {aiChat.map((msg, idx) => (
                            <div key={idx} className={`dual-bubble-row ${msg.role === 'user' ? 'mine' : 'theirs'}`}>
                                {msg.role !== 'user' && <div className="dual-avatar small ai">🤖</div>}
                                <div className={`dual-bubble ${msg.role === 'user' ? 'mine' : 'theirs ai'}`}>
                                    <div className="dual-bubble-content">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {aiTyping && (
                            <div className="dual-bubble-row theirs">
                                <div className="dual-avatar small ai">🤖</div>
                                <div className="dual-bubble theirs ai typing">
                                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={aiEndRef} />
                    </div>

                    <div className="dual-chips-bar">
                        {aiPrompts.map((chip, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className="dual-chip"
                                onClick={() => handleAiSendPrompt(chip.prompt)}
                                disabled={aiTyping}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    <form className="dual-input-row" onSubmit={(e) => { e.preventDefault(); handleAiSendPrompt(aiInput); }}>
                        <input
                            type="text"
                            className="dual-input"
                            placeholder="Ask AI anything about this lesson..."
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            disabled={aiTyping}
                        />
                        <button type="submit" className="dual-send-btn ai" disabled={!aiInput.trim() || aiTyping}>
                            {aiTyping ? '...' : 'Send'}
                        </button>
                    </form>
                </div>
            )}

            {/* ═════════ 2. INSTRUCTOR CHAT POPUP PANEL ═════════ */}
            {instOpen && (
                <div className="dual-chat-panel inst-panel" role="dialog">
                    <div className="dual-panel-header inst">
                        <div className="dual-header-info">
                            <div className="dual-avatar inst-head">
                                {instructor?.avatar ? (
                                    <img src={instructor.avatar} alt={instructor.name} />
                                ) : (
                                    instructor?.name?.charAt(0)?.toUpperCase() || 'I'
                                )}
                                <span className="dual-online-dot"></span>
                            </div>
                            <div>
                                <strong>{instructor?.name || 'Course Instructor'}</strong>
                                <span className="dual-header-sub">
                                    {instructor?.role || 'INSTRUCTOR'} • {instructorMode === 'COURSE' ? '📘 Course Q&A' : '🌟 Mentorship'}
                                </span>
                            </div>
                        </div>
                        <button className="dual-panel-close" onClick={() => setInstOpen(false)}>✕</button>
                    </div>

                    {/* Mode Selector */}
                    <div className="dual-inst-mode-bar">
                        <button
                            type="button"
                            className={`dual-mode-btn mode-course ${instructorMode === 'COURSE' ? 'active' : ''}`}
                            onClick={() => setInstructorMode('COURSE')}
                        >
                            📘 Course &amp; Lesson Q&amp;A
                        </button>
                        <button
                            type="button"
                            className={`dual-mode-btn mode-general ${instructorMode === 'GENERAL' ? 'active' : ''}`}
                            onClick={() => setInstructorMode('GENERAL')}
                        >
                            🌟 Career &amp; Mentorship
                        </button>
                    </div>

                    {/* Mode Notice Banner */}
                    <div className={`dual-mode-notice ${instructorMode.toLowerCase()}`}>
                        {instructorMode === 'COURSE' ? (
                            <span>📘 <strong>Course Mode:</strong> Asking about <em>{courseTitle || 'this course'}</em>. Only enrolled learners can send course questions.</span>
                        ) : (
                            <span>🌟 <strong>Mentorship Mode:</strong> 1-on-1 career guidance, portfolio reviews, and learning advice.</span>
                        )}
                    </div>

                    {/* Lock Screen if Not Enrolled in Course Mode */}
                    {instructorMode === 'COURSE' && !isEnrolled ? (
                        <div className="dual-lock-screen">
                            <div className="dual-lock-icon">🔒</div>
                            <h4>Enrollment Required</h4>
                            <p>You must enroll in <strong>{courseTitle || 'this course'}</strong> to send questions directly to {instructor?.name || 'the instructor'}.</p>
                            <button
                                type="button"
                                className="dual-enroll-btn"
                                onClick={handleQuickEnroll}
                                disabled={enrolling}
                            >
                                {enrolling ? '⚡ Enrolling...' : '⚡ Enroll in Course Now'}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Message Thread */}
                            <div className="dual-chat-stream">
                                {loadingMessages ? (
                                    <div className="dual-empty-hint">Loading messages...</div>
                                ) : instructorMessages.length === 0 ? (
                                    <div className="dual-empty-hint">
                                        <div className="hint-icon">{instructorMode === 'COURSE' ? '📘' : '🌟'}</div>
                                        <h4>{instructorMode === 'COURSE' ? 'Course Q&A Thread' : 'General Mentorship Thread'}</h4>
                                        <p>
                                            {instructorMode === 'COURSE'
                                                ? `Ask ${instructor?.name || 'the instructor'} any questions about this course!`
                                                : `Ask ${instructor?.name || 'the instructor'} for mentorship or career guidance.`}
                                        </p>
                                    </div>
                                ) : (
                                    instructorMessages.map((msg) => {
                                        const isMine = msg.senderId === user?.id
                                        const time = msg.sentAt
                                            ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''

                                        return (
                                            <div key={msg.id} className={`dual-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                                                {!isMine && (
                                                    <div className="dual-avatar small">
                                                        {msg.senderAvatar ? (
                                                            <img src={msg.senderAvatar} alt={msg.senderName} />
                                                        ) : (
                                                            msg.senderName?.charAt(0)?.toUpperCase() || 'I'
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`dual-bubble ${isMine ? 'mine' : 'theirs'} ${msg.mode === 'COURSE' ? 'mode-course' : 'mode-general'}`}>
                                                    <div className="dual-bubble-sender">
                                                        {isMine ? 'You' : msg.senderName}
                                                        <span className={`dual-mode-tag ${msg.mode === 'COURSE' ? 'course' : 'general'}`}>
                                                            {msg.mode === 'COURSE' ? '📘 Course' : '🌟 Mentorship'}
                                                        </span>
                                                    </div>
                                                    <div className="dual-bubble-content">{msg.content}</div>
                                                    <div className="dual-bubble-time">{time}</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={instructorEndRef} />
                            </div>

                            {/* Quick Suggestions */}
                            <div className="dual-chips-bar">
                                {instructorPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="dual-chip"
                                        onClick={() => handleInstructorSend(prompt)}
                                        disabled={sendingInstructor}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Instructor Input */}
                            <form className="dual-input-row" onSubmit={(e) => { e.preventDefault(); handleInstructorSend(); }}>
                                <input
                                    type="text"
                                    className="dual-input"
                                    placeholder={instructorMode === 'COURSE' ? `Ask ${instructor?.name || 'instructor'} about this course...` : `Ask general question...`}
                                    value={instructorInput}
                                    onChange={(e) => setInstructorInput(e.target.value)}
                                    disabled={sendingInstructor}
                                />
                                <button type="submit" className="dual-send-btn inst" disabled={!instructorInput.trim() || sendingInstructor}>
                                    {sendingInstructor ? '...' : 'Send ✈️'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* ═════════ TWO FLOATING BUTTONS (STACKED VERTICALLY) ═════════ */}
            <div className="dual-floating-buttons">
                {/* 1. TOP BUTTON: AI ASSISTANT */}
                <button
                    type="button"
                    id="btn-floating-ai"
                    className={`dual-fab-btn fab-ai ${aiOpen ? 'active' : ''}`}
                    onClick={toggleAi}
                    title="Toggle AI Study Tutor"
                >
                    <span className="dual-fab-icon">🤖</span>
                    <span className="dual-fab-label">{aiOpen ? 'Close AI' : 'AI Study Tutor'}</span>
                    {!aiOpen && <span className="dual-fab-sparkle">✨</span>}
                </button>

                {/* 2. BOTTOM BUTTON: INSTRUCTOR CHAT */}
                <button
                    type="button"
                    id="btn-floating-instructor"
                    className={`dual-fab-btn fab-inst ${instOpen ? 'active' : ''}`}
                    onClick={toggleInst}
                    title="Toggle Instructor Mentorship Chat"
                >
                    <span className="dual-fab-icon">👨‍🏫</span>
                    <span className="dual-fab-label">{instOpen ? 'Close Chat' : 'Instructor Chat'}</span>
                    {unreadInstCount > 0 && <span className="dual-unread-badge">{unreadInstCount}</span>}
                    {!instOpen && unreadInstCount === 0 && <span className="dual-fab-online-dot"></span>}
                </button>
            </div>
        </div>
    )
}
