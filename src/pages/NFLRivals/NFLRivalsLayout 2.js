import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spin } from 'antd'
import { MessageOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons'
import { io } from 'socket.io-client'
import { privateAPI, attachToken } from '../../config/constants'
import GifPicker from '../../components/GifPicker'
import NFLRivalsSidebar from './NFLRivalsSidebar'
import './nfl-rivals.css'

/* ══════════════════════════════════════
   NFL RIVALS SIDE CHAT — persistent panel
   Socket.IO + GIF picker (matches Soccer)
   ══════════════════════════════════════ */
const NFLRivalsSideChat = () => {
  const user = useSelector(function (s) { return s.user?.userDetails })
  const token = localStorage.getItem('token')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [gifOpen, setGifOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const socketRef = useRef(null)
  const chatEndRef = useRef(null)

  var userId = user ? (user._id || user.id) : null
  var username = user ? (user.userName || user.username || 'Manager') : 'Anonymous'

  useEffect(function () {
    // Load chat history via REST
    attachToken()
    privateAPI.get('/nfl-rivals/chat').then(function (res) {
      if (res.data && res.data.data && res.data.data.messages) {
        setMessages(res.data.data.messages)
      }
    }).catch(function () { /* ignore */ })

    // Connect socket for real-time messages
    var apiUrl = process.env.REACT_APP_API_URL || 'https://backend.samsports.io'
    var baseUrl = apiUrl.replace('/api/v1', '').replace('/api', '')
    var sock = io(baseUrl, {
      auth: { token: token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = sock

    sock.on('connect', function () {
      setConnected(true)
      sock.emit('joinNFLRivalsChat')
    })
    sock.on('disconnect', function () { setConnected(false) })
    sock.on('nflRivalsMessage', function (msg) {
      setMessages(function (prev) { return prev.concat([msg]).slice(-200) })
    })

    return function () { sock.disconnect() }
  }, [token]) // eslint-disable-line

  useEffect(function () {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  var sendMessage = function () {
    if (!input.trim() || !socketRef.current) return
    socketRef.current.emit('nflRivalsMessage', {
      userId: userId,
      username: username,
      text: input.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
    })
    setInput('')
  }

  var sendGif = function (gifUrl) {
    if (!socketRef.current || !gifUrl) return
    socketRef.current.emit('nflRivalsMessage', {
      userId: userId,
      username: username,
      text: '[GIF]',
      type: 'gif',
      gifUrl: gifUrl,
      timestamp: new Date().toISOString(),
    })
  }

  if (minimized) {
    return (
      <div className="nflr-side-chat-minimized" onClick={function () { setMinimized(false) }}>
        <MessageOutlined />
        <span>Chat</span>
      </div>
    )
  }

  return (
    <div className="nflr-side-chat">
      <div className="nflr-side-chat-header">
        <MessageOutlined style={{ color: '#A78BFA' }} />
        <span className="nflr-side-chat-title">RIVALS Chat</span>
        <span className={'nflr-chat-status ' + (connected ? 'online' : 'offline')}>
          {connected ? 'LIVE' : 'Offline'}
        </span>
        <button className="nflr-side-chat-close" onClick={function () { setMinimized(true) }}>
          <CloseOutlined />
        </button>
      </div>

      <div className="nflr-side-chat-messages">
        {messages.length === 0 && (
          <div className="nflr-chat-empty">No messages yet. Say hello!</div>
        )}
        {messages.map(function (m, idx) {
          var isMe = m.userId === userId
          return (
            <div key={idx} className={'nflr-chat-msg ' + (isMe ? 'me' : '')}>
              {!isMe && <span className="nflr-chat-author">{m.username || 'Manager'}</span>}
              {m.type === 'gif' && m.gifUrl ? (
                <img src={m.gifUrl} alt="GIF" className="nflr-chat-gif" />
              ) : (
                <span className="nflr-chat-text">{m.text}</span>
              )}
              <span className="nflr-chat-time">
                {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="nflr-chat-input" style={{ position: 'relative' }}>
        <GifPicker
          visible={gifOpen}
          onSelect={function (url) { sendGif(url) }}
          onClose={function () { setGifOpen(false) }}
          accentColor="#A78BFA"
        />
        <button
          onClick={function () { setGifOpen(!gifOpen) }}
          className="nflr-chat-gif-btn"
          title="Send a GIF"
        >
          GIF
        </button>
        <input
          value={input}
          onChange={function (e) { setInput(e.target.value) }}
          onKeyDown={function (e) { if (e.key === 'Enter') sendMessage() }}
          placeholder="Type a message..."
          maxLength={500}
          className="nflr-chat-input-field"
        />
        <button onClick={sendMessage} className="nflr-chat-send" disabled={!input.trim()}>
          <SendOutlined />
        </button>
      </div>
    </div>
  )
}

const NFLRivalsLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // sm-website stores user in state.user.userDetails (no isAuthenticated flag)
  const userDetails = useSelector((s) => s.user?.userDetails)
  const token = localStorage.getItem('token')
  const isLoggedIn = !!(userDetails || token)
  const navigate = useNavigate()

  const [hasJoined, setHasJoined] = useState(false)
  useEffect(() => {
    if (!isLoggedIn) return
    attachToken()
    privateAPI.get('/nfl-rivals/profile').then(function (res) {
      var data = res.data && res.data.data
      if (data && data.entry) setHasJoined(true)
    }).catch(function () {})
  }, [isLoggedIn])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const handle = (e) => setSidebarCollapsed(e.matches)
    handle(mq)
    mq.addEventListener('change', handle)
    return () => mq.removeEventListener('change', handle)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) {
    return (
      <div className="nflr-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="nflr-layout">
      <NFLRivalsSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />
      <main
        className="nflr-main"
        style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
      >
        <div className={'nflr-content-wrap' + (hasJoined ? ' with-chat' : '')}>
          <div className="nflr-content-area">
            <Outlet />
          </div>
          {hasJoined && (
            <div className="nflr-chat-rail">
              <NFLRivalsSideChat />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default NFLRivalsLayout
