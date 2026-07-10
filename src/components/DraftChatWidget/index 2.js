import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input, Button, Avatar, Badge, Spin } from 'antd'
import { SendOutlined, MinusOutlined, ExpandOutlined, DragOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { privateAPI, attachToken } from '../../config/constants'

/* ═══════════════════════════════════════════════
   Draggable Draft Chat Widget
   ═══════════════════════════════════════════════ */

const DraftChatWidget = ({ leagueName = 'Draft League', height = '100%' }) => {
  const { socket } = useSelector((state) => state.socket)
  const { currentLeague } = useSelector((state) => state.league)
  const user = useSelector((state) => state.user)

  const leagueId = currentLeague?._id || currentLeague?.id || currentLeague
  const currentTeamId = user?.userDetails?.team?._id || user?.userDetails?.team?.id || user?.userDetails?.team

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [minimized, setMinimized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [leagueRoomId, setLeagueRoomId] = useState(null)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  /* ── Drag state ── */
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 })
  const widgetRef = useRef(null)

  const handleDragStart = useCallback((e) => {
    // Prevent text selection while dragging
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    }
  }, [position])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPosition({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy,
      })
    }
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Find the league chat room from chat-rooms list
  const findLeagueRoom = useCallback(async () => {
    if (!leagueId) return null
    try {
      attachToken()
      const res = await privateAPI.get('/chat/user/chat-rooms')
      const rooms = res.data?.data?.chat_rooms || res.data?.data || []
      const leagueRoom = rooms.find(
        (r) => r.leagueChat || r.isLeagueChat || (r.league && String(r.league) === String(leagueId) && r.applicants?.length > 2)
      )
      if (leagueRoom) {
        const roomId = leagueRoom._id || leagueRoom.id
        setLeagueRoomId(roomId)
        return roomId
      }
      return null
    } catch (err) {
      console.warn('Failed to find league chat room:', err.message)
      return null
    }
  }, [leagueId])

  // Fetch messages for the league room
  const fetchMessages = useCallback(
    async (roomId, showLoader = false) => {
      const rid = roomId || leagueRoomId
      if (!rid) { setLoading(false); return }
      if (showLoader) setLoading(true)
      try {
        attachToken()
        const res = await privateAPI.get(`/chat/user/get/${rid}?page=1&perPage=10000`)
        const data = res.data?.data || res.data
        const msgs = data?.messages || data || []
        const msgArr = Array.isArray(msgs) ? msgs : []
        setMessages(msgArr)
      } catch (err) {
        console.warn('Draft chat fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    },
    [leagueRoomId]
  )

  // Initialize: find room, fetch messages, join socket
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const roomId = await findLeagueRoom()
      if (cancelled) return
      if (roomId) {
        await fetchMessages(roomId, true)
        if (socket) {
          socket.emit('joinleagueRoom', roomId)
        }
      } else {
        setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [findLeagueRoom, socket])

  // Listen for real-time messages via socket
  useEffect(() => {
    if (!socket || !leagueRoomId) return
    const handleNewMessage = () => {
      fetchMessages(leagueRoomId, false)
    }
    socket.on('sendleagueMessage', handleNewMessage)
    socket.on('Message', handleNewMessage)
    return () => {
      socket.off('sendleagueMessage', handleNewMessage)
      socket.off('Message', handleNewMessage)
    }
  }, [socket, leagueRoomId, fetchMessages])

  // Fallback polling every 15s
  useEffect(() => {
    if (!leagueRoomId) return
    pollRef.current = setInterval(() => fetchMessages(leagueRoomId, false), 15000)
    return () => clearInterval(pollRef.current)
  }, [leagueRoomId, fetchMessages])

  // Auto-scroll on new messages
  useEffect(() => {
    if (!minimized) scrollToBottom()
  }, [messages, minimized])

  const handleSend = async () => {
    if (!input.trim() || sending || !leagueRoomId) return
    const messageText = input.trim()
    setSending(true)
    setInput('')
    try {
      attachToken()
      await privateAPI.post('/chat/user/send', {
        room_id: leagueRoomId,
        message: messageText,
      })
      if (socket) {
        socket.emit('sendleagueMessage', {
          room_id: leagueRoomId,
          message: messageText,
        })
      }
      await fetchMessages(leagueRoomId, false)
    } catch (err) {
      console.warn('Draft chat send error:', err.message)
      setInput(messageText)
    } finally {
      setSending(false)
    }
  }

  // --- Helpers ---
  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    if (diff < 60 * 1000) return 'just now'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`
    return date.toLocaleDateString()
  }

  const getAvatarColor = (name) => {
    const colors = ['#22C55E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
    const str = name || '?'
    return colors[str.charCodeAt(0) % colors.length]
  }

  const getSenderName = (msg) => {
    if (msg.senderName) return msg.senderName
    if (msg.sender && typeof msg.sender === 'object') {
      return msg.sender.userName || msg.sender.teamName || msg.sender.name || msg.sender.username || 'User'
    }
    return msg.author || 'User'
  }

  const getSenderId = (msg) => {
    if (msg.sender && typeof msg.sender === 'object') {
      return msg.sender._id || msg.sender.id
    }
    return msg.sender || msg.senderId
  }

  const isMyMessage = (msg) => {
    const senderId = getSenderId(msg)
    return senderId && (
      String(senderId) === String(currentTeamId) ||
      String(senderId) === String(user?.userDetails?._id)
    )
  }

  const getInitial = (name) => (name || '?').charAt(0).toUpperCase()

  /* ── Drag handle bar (shared across all states) ── */
  const dragHandle = (
    <div
      onMouseDown={handleDragStart}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '4px 0 2px',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '36px', height: '4px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.15)',
      }} />
    </div>
  )

  /* ── Outer wrapper with drag position ── */
  const wrapperStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : 'transform 0.1s ease',
    userSelect: isDragging ? 'none' : 'auto',
  }

  // --- No league connected ---
  if (!leagueId) {
    if (minimized) {
      return (
        <div ref={widgetRef} style={wrapperStyle}>
          {dragHandle}
          <div
            onClick={() => setMinimized(false)}
            style={{
              background: 'rgba(20, 28, 45, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(110, 105, 128, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>💬</span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}>Draft Chat</span>
            </div>
            <ExpandOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }} />
          </div>
        </div>
      )
    }
    return (
      <div ref={widgetRef} style={wrapperStyle}>
        <div style={{
          background: 'rgba(20, 28, 45, 0.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(110, 105, 128, 0.15)', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', height, overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {dragHandle}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
            No league selected
          </span>
        </div>
      </div>
    )
  }

  // --- Minimized state ---
  if (minimized) {
    return (
      <div ref={widgetRef} style={wrapperStyle}>
        {dragHandle}
        <div
          onClick={() => setMinimized(false)}
          style={{
            background: 'rgba(20, 28, 45, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(110, 105, 128, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            transition: 'all 200ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}>Draft Chat</span>
            <Badge count={messages.length} style={{ backgroundColor: '#22C55E', fontSize: '10px', boxShadow: 'none' }} />
          </div>
          <ExpandOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }} />
        </div>
      </div>
    )
  }

  // --- Full view ---
  return (
    <div ref={widgetRef} style={wrapperStyle}>
      <div style={{
        background: 'rgba(20, 28, 45, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(110, 105, 128, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', height, overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div
          onMouseDown={handleDragStart}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            padding: '6px 0 0',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '36px', height: '4px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.15)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '6px 16px 10px',
          borderBottom: '1px solid rgba(110, 105, 128, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 700, color: '#fff' }}>
              Draft Chat
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
              {leagueName}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge count={messages.length} style={{ backgroundColor: '#22C55E', fontSize: '10px', boxShadow: 'none' }} />
            <button
              onClick={() => setMinimized(true)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(110,105,128,0.2)',
                borderRadius: '6px', width: '24px', height: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              <MinusOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0,
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Spin size="small" />
            </div>
          ) : !leagueRoomId ? (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1,
              color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif", fontSize: '11px',
              textAlign: 'center', padding: '16px',
            }}>
              No league chat room found. Chat will be available once the league chat room is created.
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1,
              color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', sans-serif", fontSize: '11px',
            }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderName = getSenderName(msg)
              const mine = isMyMessage(msg)

              // System message
              if (msg.type === 'system' || msg.isSystem) {
                return (
                  <div key={msg._id || msg.id || idx} style={{
                    textAlign: 'center', padding: '4px 8px',
                    fontSize: '10px', color: 'rgba(255,255,255,0.4)',
                    fontStyle: 'italic', fontFamily: "'Inter', sans-serif",
                  }}>
                    {msg.message || msg.text || msg.content}
                  </div>
                )
              }

              return (
                <div key={msg._id || msg.id || idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Avatar
                    size={24}
                    style={{
                      backgroundColor: mine ? '#22C55E' : getAvatarColor(senderName),
                      flexShrink: 0, fontSize: '11px', fontWeight: 700,
                    }}
                  >
                    {getInitial(senderName)}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: '11px',
                        fontWeight: 600, color: mine ? '#22C55E' : '#fff',
                      }}>
                        {mine ? 'You' : senderName}
                      </span>
                      <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: '9px',
                        color: 'rgba(255,255,255,0.3)',
                      }}>
                        {formatTime(msg.createdAt || msg.timestamp)}
                      </span>
                    </div>
                    <div style={{
                      padding: '6px 10px', borderRadius: '8px',
                      background: mine ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.2)',
                      border: mine ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(110,105,128,0.08)',
                      fontSize: '12px', color: 'rgba(255,255,255,0.8)',
                      fontFamily: "'Inter', sans-serif", lineHeight: 1.4, wordBreak: 'break-word',
                    }}>
                      {msg.message || msg.text || msg.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid rgba(110, 105, 128, 0.15)',
          display: 'flex', gap: '8px',
        }}>
          <Input
            placeholder={leagueRoomId ? 'Message...' : 'Chat unavailable'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            disabled={sending || !leagueRoomId}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(110,105,128,0.2)',
              color: 'white', borderRadius: '8px',
              height: '32px', fontSize: '12px',
            }}
          />
          <Button
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={!leagueRoomId}
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22C55E', borderRadius: '8px',
              height: '32px', width: '32px', minWidth: '32px',
              padding: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default DraftChatWidget
