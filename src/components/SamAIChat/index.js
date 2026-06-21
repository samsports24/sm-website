import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { soccerAPI } from '../../soccer/config/constants'
import './samAIChat.css'

// ═══════════════════════════════════════════════════════════════
//  SAM AI SUPPORT CHAT — User-facing chatbot (Eleven FC / Soccer)
//  Connects to POST /api/v1/ai-agent/chat on soccer backend
// ═══════════════════════════════════════════════════════════════

const SAM_AVATAR = '⚽'
const GREETING = "Hey! I'm SAM, your SamSports assistant. Ask me anything about leagues, drafts, auctions, or your account!"

const SamAIChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: GREETING, ts: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState([])
  const [toolsUsed, setToolsUsed] = useState([])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const user = useSelector((state) => state?.user?.userDetails)
  const soccerUser = useSelector((state) => state?.soccerUser?.userDetails)
  const soccerLeague = useSelector((state) => state?.soccerLeague?.currentLeague)
  const soccerTeam = useSelector((state) => state?.soccerTeam?.currentTeam)
  const isAuthenticated = !!(user?._id || soccerUser?._id)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !showHistory) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, showHistory])

  // ── Send message to AI agent ──
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text, ts: Date.now() }])
    setLoading(true)
    setToolsUsed([])

    try {
      const payload = {
        message: text,
        sessionId,
        leagueId: soccerLeague?._id,
        teamId: soccerTeam?._id,
      }

      const { data } = await soccerAPI.post('/api/v1/ai-agent/chat', payload)
      const result = data?.data || data

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          tools: result.toolsUsed,
          ts: Date.now(),
        },
      ])

      if (result.sessionId) setSessionId(result.sessionId)
      if (result.toolsUsed?.length) setToolsUsed(result.toolsUsed)
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || 'Something went wrong'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I ran into an error: ${errMsg}. Please try again!`,
          error: true,
          ts: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, sessionId, soccerLeague, soccerTeam])

  // ── Load chat history ──
  const loadHistory = useCallback(async () => {
    try {
      const { data } = await soccerAPI.get('/api/v1/ai-agent/sessions')
      setSessions(data?.data || data || [])
      setShowHistory(true)
    } catch {
      setSessions([])
      setShowHistory(true)
    }
  }, [])

  // ── Resume a previous session ──
  const resumeSession = useCallback(async (sid) => {
    try {
      const { data } = await soccerAPI.get(`/api/v1/ai-agent/sessions/${sid}`)
      const session = data?.data || data
      if (session?.messages?.length) {
        setMessages(
          session.messages.map((m) => ({
            role: m.role,
            content: m.content,
            ts: new Date(m.createdAt || Date.now()).getTime(),
          }))
        )
      }
      setSessionId(sid)
      setShowHistory(false)
    } catch {
      setShowHistory(false)
    }
  }, [])

  // ── Start a new conversation ──
  const newConversation = useCallback(() => {
    setMessages([{ role: 'assistant', content: GREETING, ts: Date.now() }])
    setSessionId(null)
    setShowHistory(false)
    setToolsUsed([])
  }, [])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    setShowHistory(false)
  }

  // Don't render for unauthenticated users or on partner dashboard
  if (!isAuthenticated) return null
  if (window.location.pathname.startsWith('/partner-dashboard')) return null

  return (
    <div className="sam-ai-container">
      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="sam-ai-panel">
          {/* Header */}
          <div className="sam-ai-header">
            <div className="sam-ai-header-left">
              <span className="sam-ai-avatar">{SAM_AVATAR}</span>
              <div>
                <span className="sam-ai-header-title">SAM Assistant</span>
                <span className="sam-ai-header-sub">AI-powered support</span>
              </div>
            </div>
            <div className="sam-ai-header-actions">
              <button
                className="sam-ai-header-btn"
                onClick={loadHistory}
                title="Chat history"
              >
                📋
              </button>
              <button
                className="sam-ai-header-btn"
                onClick={newConversation}
                title="New conversation"
              >
                ✚
              </button>
              <button
                className="sam-ai-header-btn sam-ai-close"
                onClick={handleToggle}
              >
                ✕
              </button>
            </div>
          </div>

          {/* History View */}
          {showHistory ? (
            <div className="sam-ai-history">
              <div className="sam-ai-history-title">Previous Conversations</div>
              {sessions.length === 0 && (
                <div className="sam-ai-empty">No previous conversations</div>
              )}
              {sessions.map((s) => (
                <div
                  key={s.id || s._id}
                  className="sam-ai-history-item"
                  onClick={() => resumeSession(s.id || s._id)}
                >
                  <div className="sam-ai-history-preview">
                    {s.lastMessage || s.summary || 'Conversation'}
                  </div>
                  <div className="sam-ai-history-meta">
                    {s.messageCount || 0} messages ·{' '}
                    {new Date(s.lastActivity).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <button
                className="sam-ai-history-back"
                onClick={() => setShowHistory(false)}
              >
                ← Back to chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="sam-ai-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`sam-ai-msg ${
                      msg.role === 'user' ? 'sam-ai-msg-user' : 'sam-ai-msg-bot'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <span className="sam-ai-msg-avatar">{SAM_AVATAR}</span>
                    )}
                    <div
                      className={`sam-ai-msg-bubble ${
                        msg.role === 'user' ? 'user' : 'bot'
                      } ${msg.error ? 'error' : ''}`}
                    >
                      {msg.content}
                      {msg.tools?.length > 0 && (
                        <div className="sam-ai-tools-used">
                          {msg.tools.map((t, j) => (
                            <span key={j} className="sam-ai-tool-tag">
                              🔧 {t.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="sam-ai-msg sam-ai-msg-bot">
                    <span className="sam-ai-msg-avatar">{SAM_AVATAR}</span>
                    <div className="sam-ai-msg-bubble bot">
                      <div className="sam-ai-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions (only on first message) */}
              {messages.length === 1 && (
                <div className="sam-ai-suggestions">
                  {[
                    'How do drafts work?',
                    'Check my SamPoints',
                    'How to trade players?',
                    'Report a bug',
                  ].map((q) => (
                    <button
                      key={q}
                      className="sam-ai-suggestion"
                      onClick={() => {
                        setInput(q)
                        setTimeout(() => {
                          setInput('')
                          setMessages((prev) => [
                            ...prev,
                            { role: 'user', content: q, ts: Date.now() },
                          ])
                          setLoading(true)
                          soccerAPI
                            .post('/api/v1/ai-agent/chat', {
                              message: q,
                              sessionId,
                              leagueId: soccerLeague?._id,
                              teamId: soccerTeam?._id,
                            })
                            .then(({ data }) => {
                              const result = data?.data || data
                              setMessages((prev) => [
                                ...prev,
                                {
                                  role: 'assistant',
                                  content: result.response,
                                  tools: result.toolsUsed,
                                  ts: Date.now(),
                                },
                              ])
                              if (result.sessionId) setSessionId(result.sessionId)
                            })
                            .catch(() => {
                              setMessages((prev) => [
                                ...prev,
                                {
                                  role: 'assistant',
                                  content: 'Sorry, something went wrong. Try again!',
                                  error: true,
                                  ts: Date.now(),
                                },
                              ])
                            })
                            .finally(() => setLoading(false))
                        }, 50)
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="sam-ai-input-area">
                <input
                  ref={inputRef}
                  className="sam-ai-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask SAM anything..."
                  disabled={loading}
                />
                <button
                  className="sam-ai-send"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Floating Button ── */}
      <button className="sam-ai-fab" onClick={handleToggle} title="Ask SAM AI">
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  )
}

export default SamAIChat
