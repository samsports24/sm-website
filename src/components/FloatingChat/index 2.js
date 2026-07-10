import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { getChatRooms, sendMessage, getPreviousMessages } from '../../redux/actions/chatAction'
import { privateAPI } from '../../config/constants'
import '../../styles/components/floatingChat.css'

// ═══ Content moderation — client-side quick check ═══
const BLOCKED_WORDS = [
  "nigger","nigga","chink","spic","kike","gook","raghead","faggot","fag","dyke","tranny",
  "nazi","kkk","white power","white supremacy",
  "porn","porno","hentai","nude","nudes","nudity",
  "rape","rapist","molest","pedophile","pedo",
  "pornhub","xvideos","onlyfans","chaturbate",
]
const BLOCKED_PATTERNS = [/n\s*i\s*g\s*g/i, /f\s*a\s*g/i, /f\s*u\s*c\s*k/i, /s\s*h\s*i\s*t/i, /c\s*u\s*n\s*t/i, /b\s*i\s*t\s*c\s*h/i]
const CONTENT_WHITELIST = ["class","classic","assassin","assist","pass","passing","grass","mass","bass","cocktail","arsenal","bigger","digger","trigger","button","seaweed","transfer","count","country","county","account","execute","analysis","analyst","canal","penalty","penalize","pension","pencil"]
const hasBlockedContent = (text) => {
  if (!text) return false
  const lower = text.toLowerCase()
  if (BLOCKED_PATTERNS.some(p => p.test(lower))) return true
  const words = lower.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/)
  return words.some(w => w && !CONTENT_WHITELIST.includes(w) && BLOCKED_WORDS.includes(w))
}

// ═══ Commissioner Ban/Kick Modal (NFL) ═══
const NFLBanModal = ({ target, leagueId, onClose, onSuccess }) => {
  const [action, setAction] = useState('ban')
  const [duration, setDuration] = useState('1')
  const [customDays, setCustomDays] = useState(7)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return alert('Please provide a reason.')
    setSubmitting(true)
    try {
      if (action === 'kick') {
        await privateAPI.post('/chat/moderation/kick', { userId: target.id, leagueId, reason: reason.trim() })
        alert(`${target.name} has been kicked from the league.`)
      } else {
        const days = duration === 'permanent' ? 0 : duration === 'custom' ? customDays : parseInt(duration)
        await privateAPI.post('/chat/moderation/ban', { userId: target.id, leagueId, reason: reason.trim(), days })
        const txt = duration === 'permanent' ? 'permanently' : `for ${days} day(s)`
        alert(`${target.name} has been banned from chat ${txt}.`)
      }
      onSuccess?.()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const s = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 },
    modal: { background: '#1a1a2e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 20, width: 340, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
    btn: (active, color) => ({ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: active ? `rgba(${color},0.15)` : 'transparent', border: `1px solid ${active ? `rgba(${color},0.4)` : 'rgba(110,105,128,0.2)'}`, color: active ? (color === '239,68,68' ? '#EF4444' : '#FF6B6B') : 'rgba(255,255,255,0.4)' }),
    dur: (active) => ({ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', background: active ? 'rgba(34,197,94,0.15)' : 'transparent', border: `1px solid ${active ? 'rgba(34,197,94,0.4)' : 'rgba(110,105,128,0.15)'}`, color: active ? '#22C55E' : 'rgba(255,255,255,0.4)' }),
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={s.modal}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>⚠ Moderate User</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
          Action against <strong style={{ color: '#22C55E' }}>{target.name}</strong>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button onClick={() => setAction('ban')} style={s.btn(action === 'ban', '239,68,68')}>🚫 Ban</button>
          <button onClick={() => setAction('kick')} style={s.btn(action === 'kick', '255,107,107')}>👢 Kick</button>
        </div>

        {action === 'ban' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {[{ v: '1', l: '1d' }, { v: '3', l: '3d' }, { v: '7', l: '7d' }, { v: '30', l: '30d' }, { v: 'permanent', l: 'Perm' }, { v: 'custom', l: 'Custom' }].map(o => (
              <button key={o.v} onClick={() => setDuration(o.v)} style={s.dur(duration === o.v)}>{o.l}</button>
            ))}
            {duration === 'custom' && (
              <input type="number" min={1} max={365} value={customDays} onChange={(e) => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 50, padding: '2px 6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.25)', color: '#fff', borderRadius: 4, fontSize: 11 }} />
            )}
          </div>
        )}

        {action === 'kick' && (
          <div style={{ padding: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, marginBottom: 10, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
            <strong style={{ color: '#EF4444' }}>Warning:</strong> This removes the user from the league permanently.
          </div>
        )}

        <textarea
          rows={2} placeholder="Reason..." value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500}
          style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.25)', color: '#fff', borderRadius: 6, fontSize: 12, resize: 'none', marginBottom: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(110,105,128,0.25)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444' }}>
            {submitting ? '...' : action === 'kick' ? 'Kick' : 'Ban'}
          </button>
        </div>
      </div>
    </div>
  )
}

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeRoom, setActiveRoom] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [contentWarning, setContentWarning] = useState('')
  const [modTarget, setModTarget] = useState(null)
  const [reportTarget, setReportTarget] = useState(null) // { messageId, senderName }

  // ── Report a message to commissioner ──
  const handleReport = async () => {
    if (!reportTarget) return
    try {
      const leagueId = league?._id || user?.team?.currentLeague?._id
      await privateAPI.post('/chat/report', {
        messageId: reportTarget.messageId,
        leagueId,
        reason: 'Reported by user',
      })
      alert('Your report has been sent to the commissioner.')
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send report')
    } finally {
      setReportTarget(null)
    }
  }
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const user = useSelector((state) => state?.user?.userDetails)
  const chatRooms = useSelector((state) => state?.chat?.chat_rooms) || []
  const messages = useSelector((state) => state?.chat?.messages) || []
  const socket = useSelector((state) => state?.socket?.socket)
  const league = useSelector((state) => state?.league?.currentLeague)
  const isAuthenticated = !!user?._id

  // Derive commissioner status for NFL
  const nflUserId = user?._id
  const isCommissioner = (() => {
    const lg = league || user?.team?.currentLeague
    if (!lg || !nflUserId) return false
    if (String(lg.commissioner) === String(nflUserId)) return true
    if (lg.commissioner?._id && String(lg.commissioner._id) === String(nflUserId)) return true
    if (lg.coCommissioners?.some(c => String(c) === String(nflUserId) || String(c?._id) === String(nflUserId))) return true
    return false
  })()

  // Load chat rooms on mount
  useEffect(() => {
    if (isAuthenticated) {
      getChatRooms()
    }
  }, [isAuthenticated])

  // Listen for incoming messages via socket
  // Backend emits 'Message' (DM) and 'sendleagueMessage' (league chat)
  useEffect(() => {
    if (!socket) return
    const handleNewMessage = (data) => {
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
      if (activeRoom) {
        getPreviousMessages(activeRoom._id || activeRoom.roomId)
      }
      getChatRooms()
    }
    socket.on('Message', handleNewMessage)
    socket.on('sendleagueMessage', handleNewMessage)
    return () => {
      socket.off('Message', handleNewMessage)
      socket.off('sendleagueMessage', handleNewMessage)
    }
  }, [socket, isOpen, activeRoom])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opening a room
  useEffect(() => {
    if (activeRoom && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [activeRoom, isOpen])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    if (!isOpen) setUnreadCount(0)
  }

  const handleOpenRoom = useCallback(async (room) => {
    setActiveRoom(room)
    const roomId = room._id || room.roomId
    if (roomId) {
      // Join the socket room so we receive real-time Message events for this conversation
      if (socket) {
        socket.emit(room.leagueChat ? 'joinleagueRoom' : 'joinRoom', roomId)
      }
      await getPreviousMessages(roomId)
    }
  }, [socket])

  const handleBack = () => {
    setActiveRoom(null)
  }

  const handleSend = async () => {
    if (!messageText.trim() || !activeRoom) return

    // Client-side content moderation
    if (hasBlockedContent(messageText)) {
      setContentWarning('Your message contains inappropriate content and cannot be sent.')
      return
    }
    setContentWarning('')

    const payload = {
      message: messageText.trim(),
      room_id: activeRoom._id || activeRoom.roomId,
      from: user?.team?._id,
      league: user?.team?.currentLeague?._id,
    }

    setMessageText('')
    await sendMessage(payload)
  }

  // Clear warning when message is edited
  useEffect(() => {
    if (contentWarning && !hasBlockedContent(messageText)) setContentWarning('')
  }, [messageText, contentWarning])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isAuthenticated) return null

  const getRoomName = (room) => {
    if (room.name) return room.name
    if (room.league_chat) return 'League Chat'
    // For DMs, find the other participant
    const other = room.participants?.find((p) => p?._id !== user?.team?._id)
    return other?.name || 'Chat'
  }

  return (
    <div className='fc-container'>
      {/* Chat Panel */}
      {isOpen && (
        <div className='fc-panel'>
          {/* Panel Header */}
          <div className='fc-panel-header'>
            {activeRoom ? (
              <>
                <button className='fc-back-btn' onClick={handleBack}>←</button>
                <span className='fc-panel-title'>{getRoomName(activeRoom)}</span>
              </>
            ) : (
              <span className='fc-panel-title'>Messages</span>
            )}
            <button className='fc-close-btn' onClick={handleToggle}>✕</button>
          </div>

          {/* Content */}
          {!activeRoom ? (
            /* Room List */
            <div className='fc-room-list'>
              {chatRooms.length === 0 && (
                <div className='fc-empty'>No conversations yet</div>
              )}
              {chatRooms.map((room, i) => (
                <div
                  key={room._id || i}
                  className='fc-room-item'
                  onClick={() => handleOpenRoom(room)}
                >
                  <div className='fc-room-avatar'>
                    {room.league_chat ? '🏈' : (getRoomName(room).charAt(0) || '?')}
                  </div>
                  <div className='fc-room-info'>
                    <span className='fc-room-name'>{getRoomName(room)}</span>
                    <span className='fc-room-preview'>
                      {room.lastMessage?.message || 'Tap to chat'}
                    </span>
                  </div>
                  {room.unreadCount > 0 && (
                    <span className='fc-room-badge'>{room.unreadCount}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Messages View */
            <>
              <div className='fc-messages'>
                {messages.map((msg, i) => {
                  const isMine = msg.sender?._id === user?.team?._id || msg.sender === user?.team?._id
                  const msgId = msg._id || msg.id
                  const senderId = msg.sender?._id || msg.sender?.id || msg.sender
                  const senderName = msg.sender?.name || msg.senderName || ''
                  return (
                    <div key={msgId || i} className={`fc-msg ${isMine ? 'fc-msg-mine' : 'fc-msg-other'}`}>
                      {!isMine && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className='fc-msg-sender'>{senderName}</span>
                          {isCommissioner && senderId && (
                            <button
                              onClick={() => setModTarget({ id: senderId, name: senderName })}
                              style={{
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#EF4444', borderRadius: 3, padding: '0px 4px', cursor: 'pointer',
                                fontSize: 9, fontWeight: 700, lineHeight: '16px',
                              }}
                              title="Ban/Kick this user"
                            >
                              BAN
                            </button>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div className={`fc-msg-bubble ${isMine ? 'mine' : 'other'} ${msg.flagged ? 'flagged' : ''}`}>
                          {msg.flagged && <span style={{ color: '#EF4444', fontSize: 11, marginRight: 4 }}>⚠</span>}
                          {msg.message}
                        </div>
                        {!isMine && msgId && (
                          <button
                            onClick={() => setReportTarget({ messageId: msgId, senderName })}
                            className="fc-report-btn"
                            title="Report this message"
                          >
                            🚩
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Content moderation warning */}
              {contentWarning && (
                <div className='fc-content-warning' style={{ padding: '6px 12px', fontSize: 11, color: '#EF4444', background: 'rgba(239,68,68,0.08)', borderTop: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>⚠</span> {contentWarning}
                </div>
              )}

              {/* Input */}
              <div className='fc-input-area'>
                <input
                  ref={inputRef}
                  className='fc-input'
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Type a message...'
                />
                <button
                  className='fc-send-btn'
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button className='fc-fab' onClick={handleToggle}>
        {isOpen ? '✕' : '💬'}
        {unreadCount > 0 && !isOpen && (
          <span className='fc-fab-badge'>{unreadCount}</span>
        )}
      </button>

      {/* Commissioner Moderation Modal */}
      {modTarget && (
        <NFLBanModal
          target={modTarget}
          leagueId={league?._id || user?.team?.currentLeague?._id}
          onClose={() => setModTarget(null)}
          onSuccess={() => {
            setModTarget(null)
            if (activeRoom) getPreviousMessages(activeRoom._id || activeRoom.roomId)
          }}
        />
      )}

      {/* Report Confirmation Dialog */}
      {reportTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setReportTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 20, width: 300, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              🚩 Report Message
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
              Do you want to report this message from <strong style={{ color: '#22C55E' }}>{reportTarget.senderName}</strong> to the commissioner?
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setReportTarget(null)} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(110,105,128,0.25)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
              <button onClick={handleReport} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E' }}>Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingChat
