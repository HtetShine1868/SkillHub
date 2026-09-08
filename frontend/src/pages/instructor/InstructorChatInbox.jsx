import { useState, useEffect, useRef, useCallback } from 'react'
import axiosClient from '../../api/axiosClient'
import { useAuth } from '../../context/AuthContext'
import { useChatNotifications } from '../../context/ChatNotificationContext'
import { playNotificationSound } from '../../utils/soundUtils'
import './InstructorChatInbox.css'

export default function InstructorChatInbox() {
  const { user } = useAuth()
  const { markThreadSeen, markAllSeen } = useChatNotifications()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyText, setReplyText] = useState('')
  const [chatMode, setChatMode] = useState('COURSE') // 'COURSE' | 'GENERAL'
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'UNREPLIED' | 'COURSE' | 'GENERAL'
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [toastNotify, setToastNotify] = useState(null)

  const messagesEndRef = useRef(null)
  const pollTimerRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [])

  const showNotification = (msg) => {
    setToastNotify(msg)
    setTimeout(() => setToastNotify(null), 4000)
  }

  // Load students & recent conversations
  const loadStudents = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingStudents(true)
    try {
      // 1. Fetch instructor student list
      const res = await axiosClient.get('/api/chat/instructor/students').catch(() => null)
      let list = res?.data || []

      // 2. Fallback to /api/chat/conversations if list is empty
      if (!list || list.length === 0) {
        const convRes = await axiosClient.get('/api/chat/conversations').catch(() => null)
        const convs = convRes?.data || []
        list = convs.map(c => ({
          id: c.partnerId,
          name: c.partnerName,
          email: c.partnerEmail || '',
          avatar: c.partnerAvatar,
          role: c.partnerRole,
          lastMessage: c.lastMessage,
          lastSentAt: c.lastSentAt,
          mode: c.mode,
          courseId: c.courseId,
          courses: c.courseId ? [{ id: c.courseId, title: c.courseTitle || 'Course' }] : []
        }))
      }

      setStudents(prev => {
        // Sound notification if a new incoming message from student
        if (isSilent && list.length > 0) {
          const unreplied = list.find(s => s.lastSenderId && s.lastSenderId === s.id && (!prev.find(p => p.id === s.id && p.lastSentAt === s.lastSentAt)))
          if (unreplied) {
            playNotificationSound()
            showNotification(`🔔 New student message from ${unreplied.name}: "${unreplied.lastMessage}"`)
          }
        }
        return list
      })

      // Auto-select first student if none selected
      setSelectedStudent(prev => {
        if (!prev && list.length > 0) {
          const first = list[0]
          if (first.courses && first.courses.length > 0) {
            setSelectedCourseId(first.courses[0].id)
          }
          if (first.mode) setChatMode(first.mode)
          return first
        }
        if (prev) {
          const found = list.find(s => s.id === prev.id)
          return found || prev
        }
        return null
      })
    } catch (err) {
      console.error('Failed to load instructor students:', err)
      if (!isSilent) setErrorMsg('Failed to load students list.')
    } finally {
      if (!isSilent) setLoadingStudents(false)
    }
  }, [])

  // Load messages for the selected student & mode
  const loadMessages = useCallback(async (isSilent = false) => {
    if (!selectedStudent) return
    if (!isSilent) setLoadingMessages(true)

    try {
      const params = {
        otherUserId: selectedStudent.id,
        mode: chatMode
      }
      if (chatMode === 'COURSE' && selectedCourseId) {
        params.courseId = selectedCourseId
      }

      const res = await axiosClient.get('/api/chat/messages', { params })
      const newMsgs = Array.isArray(res.data) ? res.data : []

      setMessages(prev => {
        const isDifferent = prev.length !== newMsgs.length ||
          (prev.length > 0 && newMsgs.length > 0 && prev[prev.length - 1].id !== newMsgs[newMsgs.length - 1].id)

        if (isDifferent && isSilent && newMsgs.length > prev.length) {
          const lastMsg = newMsgs[newMsgs.length - 1]
          if (lastMsg && lastMsg.senderId === selectedStudent.id) {
            playNotificationSound()
            showNotification(`🔔 ${selectedStudent.name}: "${lastMsg.content}"`)
          }
        }

        if (isDifferent) {
          setTimeout(() => scrollToBottom(true), 80)
        }
        return newMsgs
      })
      // Actively viewing this student's thread — keep it marked as seen for the global badge
      markThreadSeen(selectedStudent.id)
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      if (!isSilent) setLoadingMessages(false)
    }
  }, [selectedStudent, chatMode, selectedCourseId, scrollToBottom, markThreadSeen])

  // Initial load
  useEffect(() => {
    loadStudents(false)
    // Opening the inbox counts as having seen all current conversations
    markAllSeen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStudents])

  // When selected student or mode/course changes, load messages immediately
  useEffect(() => {
    if (selectedStudent) {
      // Set default course ID if student has courses and in COURSE mode
      if (chatMode === 'COURSE') {
        if (selectedStudent.courses && selectedStudent.courses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(selectedStudent.courses[0].id)
        }
      }
      loadMessages(false)
    }
  }, [selectedStudent, chatMode, selectedCourseId, loadMessages])

  // Polling for live chat updates every 3.5 seconds
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      loadStudents(true)
      if (selectedStudent) {
        loadMessages(true)
      }
    }, 3500)

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [selectedStudent, loadStudents, loadMessages])

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    markThreadSeen(student.id)
    if (student.mode) {
      setChatMode(student.mode)
    }
    if (student.courses && student.courses.length > 0) {
      setSelectedCourseId(student.courses[0].id)
    } else {
      setSelectedCourseId(null)
    }
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus()
    }, 100)
  }

  // Handle sending reply
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!replyText.trim() || !selectedStudent || sending) return

    const payload = {
      receiverId: selectedStudent.id,
      content: replyText.trim(),
      mode: chatMode,
      courseId: chatMode === 'COURSE' ? selectedCourseId : null
    }

    const tempMsg = {
      id: 'temp-' + Date.now(),
      senderId: user?.id,
      senderName: user?.name || 'Instructor',
      receiverId: selectedStudent.id,
      receiverName: selectedStudent.name,
      content: replyText.trim(),
      sentAt: new Date().toISOString(),
      mode: chatMode,
      courseId: payload.courseId
    }

    setMessages(prev => [...prev, tempMsg])
    setReplyText('')
    setSending(true)
    setTimeout(() => scrollToBottom(true), 50)

    try {
      const res = await axiosClient.post('/api/chat/messages', payload)
      if (res?.data) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m))
      }
      loadStudents(true)
    } catch (err) {
      console.error('Failed to send message:', err)
      setErrorMsg('Could not send message. Please check connection.')
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
    } finally {
      setSending(false)
    }
  }

  // Quick reply snippet injection
  const handleQuickReply = (text) => {
    setReplyText(prev => prev ? `${prev} ${text}` : text)
    if (inputRef.current) inputRef.current.focus()
  }

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.courses && s.courses.some(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase())))

    if (!matchesSearch) return false

    if (filterType === 'UNREPLIED') {
      return s.lastSenderId && s.lastSenderId === s.id
    }
    if (filterType === 'COURSE') {
      return s.mode === 'COURSE' || (s.courses && s.courses.length > 0)
    }
    if (filterType === 'GENERAL') {
      return s.mode === 'GENERAL'
    }
    return true
  })

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="inst-chat">
      {toastNotify && (
        <div className="inst-chat__toast-banner">
          <span>{toastNotify}</span>
          <button onClick={() => setToastNotify(null)}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="inst-chat__error-banner">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}

      {/* Main Container */}
      <div className="inst-chat__layout">

        {/* ── Left Sidebar: Student Conversations ── */}
        <div className="inst-chat__sidebar">
          {/* Header & Search */}
          <div className="inst-chat__sidebar-header">
            <div className="inst-chat__sidebar-title-row">
              <h3>💬 Student Inquiries</h3>
              <span className="inst-chat__badge-count">{students.length}</span>
            </div>

            {/* Search Input */}
            <div className="inst-chat__search-wrap">
              <span className="inst-chat__search-icon">🔍</span>
              <input
                type="text"
                className="inst-chat__search-input"
                placeholder="Search students or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="inst-chat__search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="inst-chat__filters">
              <button
                className={`inst-chat__filter-chip ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                All ({students.length})
              </button>
              <button
                className={`inst-chat__filter-chip ${filterType === 'UNREPLIED' ? 'active' : ''}`}
                onClick={() => setFilterType('UNREPLIED')}
              >
                ⚡ Needs Reply
              </button>
              <button
                className={`inst-chat__filter-chip ${filterType === 'COURSE' ? 'active' : ''}`}
                onClick={() => setFilterType('COURSE')}
              >
                📘 Course Q&A
              </button>
              <button
                className={`inst-chat__filter-chip ${filterType === 'GENERAL' ? 'active' : ''}`}
                onClick={() => setFilterType('GENERAL')}
              >
                🌟 Mentorship
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="inst-chat__student-list">
            {loadingStudents && students.length === 0 ? (
              <div className="inst-chat__empty-list">
                <span>⏳ Loading student threads...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="inst-chat__empty-list">
                <p>No student conversations found.</p>
                <small>Students will appear here once they enroll or ask a course question.</small>
              </div>
            ) : (
              filteredStudents.map(student => {
                const isSelected = selectedStudent?.id === student.id
                const needsReply = student.lastSenderId && student.lastSenderId === student.id
                const avatarInitial = student.name?.charAt(0)?.toUpperCase() || 'S'
                const primaryCourse = student.courses && student.courses.length > 0 ? student.courses[0] : null

                return (
                  <div
                    key={student.id}
                    className={`inst-chat__student-item ${isSelected ? 'selected' : ''} ${needsReply ? 'needs-reply' : ''}`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="inst-chat__student-avatar-wrap">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="inst-chat__student-avatar" />
                      ) : (
                        <div className="inst-chat__student-avatar-initial">{avatarInitial}</div>
                      )}
                      {needsReply && <span className="inst-chat__unread-dot" title="Awaiting instructor response" />}
                    </div>

                    <div className="inst-chat__student-info">
                      <div className="inst-chat__student-header">
                        <span className="inst-chat__student-name">{student.name}</span>
                        {student.lastSentAt && (
                          <span className="inst-chat__time">{formatTime(student.lastSentAt)}</span>
                        )}
                      </div>

                      {primaryCourse && (
                        <span className="inst-chat__student-course">
                          📘 {primaryCourse.title}
                        </span>
                      )}

                      <div className="inst-chat__student-last-msg">
                        {student.lastMessage ? (
                          <span>
                            {student.lastSenderId === user?.id ? 'You: ' : ''}
                            {student.lastMessage}
                          </span>
                        ) : (
                          <span className="inst-chat__no-msg-yet">Enrolled student · No messages yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right Column: Live Chat Conversation ── */}
        <div className="inst-chat__main">
          {selectedStudent ? (
            <>
              {/* Conversation Header */}
              <div className="inst-chat__main-header">
                <div className="inst-chat__main-user-meta">
                  <div className="inst-chat__main-avatar">
                    {selectedStudent.avatar ? (
                      <img src={selectedStudent.avatar} alt={selectedStudent.name} />
                    ) : (
                      <span>{selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="inst-chat__main-name">
                      {selectedStudent.name}
                      <span className="inst-chat__role-pill">{selectedStudent.role || 'STUDENT'}</span>
                    </h3>
                    <p className="inst-chat__main-email">{selectedStudent.email}</p>
                  </div>
                </div>

                {/* Mode & Course Selectors */}
                <div className="inst-chat__header-controls">
                  <div className="inst-chat__mode-toggle">
                    <button
                      className={`inst-chat__mode-btn ${chatMode === 'COURSE' ? 'active' : ''}`}
                      onClick={() => setChatMode('COURSE')}
                      title="Course-specific discussions and lesson code Q&A"
                    >
                      📘 Course Q&A
                    </button>
                    <button
                      className={`inst-chat__mode-btn ${chatMode === 'GENERAL' ? 'active' : ''}`}
                      onClick={() => setChatMode('GENERAL')}
                      title="General career advice, portfolio mentorship, and inquiries"
                    >
                      🌟 Mentorship
                    </button>
                  </div>

                  {/* Course Dropdown (if student enrolled in multiple courses) */}
                  {chatMode === 'COURSE' && selectedStudent.courses && selectedStudent.courses.length > 0 && (
                    <select
                      className="inst-chat__course-select"
                      value={selectedCourseId || ''}
                      onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                    >
                      {selectedStudent.courses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} {c.progress ? `(${c.progress}%)` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Thread Banner */}
              <div className="inst-chat__thread-banner">
                {chatMode === 'COURSE' ? (
                  <span>
                    📘 Showing discussion thread for: <strong>{selectedStudent.courses?.find(c => c.id === selectedCourseId)?.title || 'Selected Course'}</strong>
                  </span>
                ) : (
                  <span>
                    🌟 Showing <strong>1-on-1 General Mentorship & Career Guidance</strong> thread with {selectedStudent.name}
                  </span>
                )}
              </div>

              {/* Messages Body */}
              <div className="inst-chat__messages-body">
                {loadingMessages && messages.length === 0 ? (
                  <div className="inst-chat__empty-thread">
                    <span>⏳ Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="inst-chat__empty-thread">
                    <div className="inst-chat__empty-icon">💬</div>
                    <h4>No messages in this thread yet</h4>
                    <p>
                      {chatMode === 'COURSE'
                        ? `Send a message or reply to ${selectedStudent.name} regarding course concepts, assignments, and lesson help.`
                        : `Provide mentorship, advice, or career guidance to ${selectedStudent.name}.`}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id || msg.senderRole === 'INSTRUCTOR' || msg.senderName === user?.name
                    const showHeader = index === 0 || messages[index - 1].senderId !== msg.senderId

                    return (
                      <div
                        key={msg.id || index}
                        className={`inst-chat__bubble-row ${isMe ? 'me' : 'them'}`}
                      >
                        {!isMe && showHeader && (
                          <div className="inst-chat__sender-tag">
                            {msg.senderName || selectedStudent.name}
                          </div>
                        )}
                        {isMe && showHeader && (
                          <div className="inst-chat__sender-tag me">
                            You (Instructor)
                          </div>
                        )}

                        <div className={`inst-chat__bubble ${isMe ? 'inst-chat__bubble--me' : 'inst-chat__bubble--them'}`}>
                          <div className="inst-chat__bubble-text">{msg.content}</div>
                          <div className="inst-chat__bubble-meta">
                            {msg.sentAt && <span>{formatTime(msg.sentAt)}</span>}
                            {isMe && <span className="inst-chat__check">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="inst-chat__quick-suggestions">
                <span className="inst-chat__quick-label">⚡ Quick Templates:</span>
                <button
                  type="button"
                  className="inst-chat__suggestion-chip"
                  onClick={() => handleQuickReply('👍 Great question! Let’s break it down step by step:')}
                >
                  Great question
                </button>
                <button
                  type="button"
                  className="inst-chat__suggestion-chip"
                  onClick={() => handleQuickReply('📖 Please review the code walkthrough in the lesson materials.')}
                >
                  Review lesson code
                </button>
                <button
                  type="button"
                  className="inst-chat__suggestion-chip"
                  onClick={() => handleQuickReply('🎉 Fantastic work completing the module and quiz!')}
                >
                  Congratulate progress
                </button>
                <button
                  type="button"
                  className="inst-chat__suggestion-chip"
                  onClick={() => handleQuickReply('💡 Tip: double check your syntax, variable scope, and imports.')}
                >
                  Syntax & Debug Tip
                </button>
              </div>

              {/* Input Footer */}
              <form className="inst-chat__footer" onSubmit={handleSendMessage}>
                <textarea
                  ref={inputRef}
                  className="inst-chat__input"
                  placeholder={`Reply to ${selectedStudent.name}... (Press Enter to send, Shift+Enter for new line)`}
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <button
                  type="submit"
                  className="inst-chat__send-btn"
                  disabled={!replyText.trim() || sending}
                >
                  {sending ? '⏳' : '➤'}
                </button>
              </form>
            </>
          ) : (
            <div className="inst-chat__empty-selection">
              <div className="inst-chat__empty-icon">👨‍🏫</div>
              <h3>Select a Student Conversation</h3>
              <p>Choose a student inquiry from the left sidebar to read their question, provide feedback, and send replies.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
