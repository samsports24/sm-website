import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { base_url, privateAPI, attachToken } from '../../config/constants'

// Generic real-time thread used by BOTH the global platform chat and DMs.
// Props: scope 'global'|'dm', otherUserId (dm only), title.
// Features: text, GIF, emoji reactions, threaded replies, polls, typing.

const QUICK_EMOJIS = ['👍', '🔥', '😂', '😮', '❤️', '🎉']
const socketBase = base_url.replace('/api/v1', '').replace('/api', '')

export default function ChatThread({ scope = 'global', otherUserId = null, title = 'Platform Chat' }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || ''
  const username = localStorage.getItem('userName') || 'Manager'
  const isDM = scope === 'dm'

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [gifOpen, setGifOpen] = useState(false)
  const [gifUrl, setGifUrl] = useState('')
  const [pollOpen, setPollOpen] = useState(false)
  const [pollQ, setPollQ] = useState('')
  const [pollOpts, setPollOpts] = useState(['', ''])
  const [typing, setTyping] = useState('')
  const [conn, setConn] = useState('connecting')
  const [pickerFor, setPickerFor] = useState(null)
  const socketRef = useRef(null)
  const endRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    if (isDM && !otherUserId) return
    attachToken()
    const url = isDM ? `/platform-chat/dm/${otherUserId}?limit=50` : '/platform-chat/global?limit=50'
    privateAPI.get(url).then((r) => setMessages(r.data?.messages || [])).catch(() => {})

    const sock = io(socketBase, { auth: { token }, transports: ['websocket', 'polling'] })
    socketRef.current = sock
    const evt = isDM ? 'dmMessage' : 'globalMessage'
    sock.on('connect', () => { setConn('connected'); isDM ? sock.emit('joinDM', { otherUserId }) : sock.emit('joinGlobalChat') })
    sock.on('connect_error', (e) => setConn('offline'))
    sock.on('disconnect', () => setConn('offline'))
    sock.on('chatError', (e) => { if (e && e.message) setConn('err:' + e.message) })
    sock.on(evt, (m) => setMessages((prev) => prev.concat([m]).slice(-300)))
    sock.on('chatReaction', ({ messageId, reactions }) => setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))))
    sock.on('pollUpdate', ({ messageId, options }) => setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, poll: { ...m.poll, options } } : m))))
    sock.on('chatTyping', ({ username: who, scope: s }) => { if (s !== scope) return; setTyping(who + ' is typing…'); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(''), 2500) })
    return () => sock.disconnect()
  }, [token, scope, otherUserId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const emitTyping = () => socketRef.current?.emit('chatTyping', { scope, otherUserId, username })
  const sendEvt = isDM ? 'dmMessage' : 'globalMessage'
  const base = () => (isDM ? { otherUserId, username } : { username })

  const send = () => {
    const sock = socketRef.current
    if (!sock) return
    if (gifUrl.trim()) { sock.emit(sendEvt, { ...base(), type: 'gif', gifUrl: gifUrl.trim(), replyTo: replyTo?._id || null }); setGifUrl(''); setGifOpen(false); setReplyTo(null); return }
    if (!input.trim()) return
    sock.emit(sendEvt, { ...base(), type: 'text', text: input.trim(), mentions: [], replyTo: replyTo?._id || null })
    setInput(''); setReplyTo(null)
  }
  const createPoll = () => {
    const opts = pollOpts.map((o) => o.trim()).filter(Boolean)
    if (!pollQ.trim() || opts.length < 2) return
    socketRef.current?.emit(sendEvt, { ...base(), type: 'poll', poll: { question: pollQ.trim(), options: opts.map((t) => ({ text: t })) } })
    setPollQ(''); setPollOpts(['', '']); setPollOpen(false)
  }
  const react = (id, e) => socketRef.current?.emit('chatReaction', { messageId: id, emoji: e })
  const vote = (id, i) => socketRef.current?.emit('pollVote', { messageId: id, optionIndex: i })

  const S = {
    wrap: { display: 'flex', flexDirection: 'column', height: '100%', background: '#0f131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' },
    head: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 800, color: '#fff' },
    list: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
    name: { fontWeight: 700, fontSize: 13, color: '#4a90d9' },
    text: { color: '#e8ebf0', fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    reply: { borderLeft: '2px solid #4a90d9', paddingLeft: 8, margin: '2px 0', fontSize: 12, color: '#8a93a6' },
    reactBtn: { cursor: 'pointer', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '1px 8px', fontSize: 12, marginRight: 4, border: 'none', color: '#c9d2e0' },
    foot: { borderTop: '1px solid rgba(255,255,255,0.08)', padding: 10 },
    inputRow: { display: 'flex', gap: 8, alignItems: 'center' },
    input: { flex: 1, minWidth: 0, background: '#141a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#fff', outline: 'none' },
    btn: { flexShrink: 0, background: '#4a90d9', color: '#0b0e14', fontWeight: 800, border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer' },
    ghost: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#c9d2e0', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' },
  }

  return (
    <div style={S.wrap}>
      <div style={{ ...S.head, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: conn === 'connected' ? '#22C55E' : '#EF4444' }}>
          {conn === 'connected' ? '● live' : conn.startsWith('err:') ? conn.slice(4) : '● offline'}
        </span>
      </div>
      <div style={S.list}>
        {messages.map((m) => (
          <div key={m._id} style={{ marginBottom: 12 }}>
            <div style={S.name}>{m.username}</div>
            {m.replyTo && <div style={S.reply}>↩ {m.replyTo.username}: {(m.replyTo.text || '').slice(0, 80)}</div>}
            {m.type === 'gif' && m.gifUrl && <img src={m.gifUrl} alt="gif" style={{ maxWidth: 220, borderRadius: 8, display: 'block' }} />}
            {m.type === 'poll' && m.poll && (
              <div style={{ background: '#141a26', borderRadius: 8, padding: 10, marginTop: 4 }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>📊 {m.poll.question}</div>
                {m.poll.options.map((o, i) => {
                  const total = m.poll.options.reduce((s, x) => s + (x.votes?.length || 0), 0) || 1
                  const pct = Math.round(((o.votes?.length || 0) / total) * 100)
                  return (
                    <div key={i} onClick={() => vote(m._id, i)} style={{ cursor: 'pointer', marginBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#c9d2e0' }}><span>{o.text}</span><span>{pct}%</span></div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}><div style={{ width: pct + '%', height: '100%', background: '#4a90d9', borderRadius: 3 }} /></div>
                    </div>
                  )
                })}
              </div>
            )}
            {m.text && <div style={S.text}>{m.text}</div>}
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              {(m.reactions || []).map((r) => <button key={r.emoji} style={S.reactBtn} onClick={() => react(m._id, r.emoji)}>{r.emoji} {r.users.length}</button>)}
              <span onClick={() => setPickerFor(pickerFor === m._id ? null : m._id)} style={{ cursor: 'pointer', color: '#5a6272', fontSize: 13 }}>🙂+</span>
              <span onClick={() => setReplyTo(m)} style={{ color: '#4a90d9', fontSize: 11, cursor: 'pointer' }}>Reply</span>
              {pickerFor === m._id && QUICK_EMOJIS.map((e) => <span key={e} onClick={() => { react(m._id, e); setPickerFor(null) }} style={{ cursor: 'pointer', fontSize: 15 }}>{e}</span>)}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {typing && <div style={{ padding: '2px 16px', fontSize: 12, color: '#8a93a6' }}>{typing}</div>}
      {pollOpen && (
        <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input style={{ ...S.input, marginBottom: 6 }} placeholder="Poll question" value={pollQ} onChange={(e) => setPollQ(e.target.value)} />
          {pollOpts.map((o, i) => <input key={i} style={{ ...S.input, marginBottom: 6 }} placeholder={'Option ' + (i + 1)} value={o} onChange={(e) => setPollOpts((p) => p.map((x, j) => (j === i ? e.target.value : x)))} />)}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.ghost} onClick={() => setPollOpts((p) => [...p, ''])}>+ Option</button>
            <button style={S.btn} onClick={createPoll}>Post poll</button>
            <button style={S.ghost} onClick={() => setPollOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div style={S.foot}>
        {replyTo && <div style={{ fontSize: 12, color: '#8a93a6', marginBottom: 6 }}>Replying to {replyTo.username} · <span style={{ cursor: 'pointer', color: '#4a90d9' }} onClick={() => setReplyTo(null)}>cancel</span></div>}
        {gifOpen && <div style={{ marginBottom: 8 }}><input style={S.input} placeholder="Paste a Giphy/Tenor GIF URL" value={gifUrl} onChange={(e) => setGifUrl(e.target.value)} /></div>}
        <div style={S.inputRow}>
          <button style={S.ghost} onClick={() => setGifOpen((v) => !v)}>GIF</button>
          <button style={S.ghost} onClick={() => setPollOpen((v) => !v)}>📊</button>
          <input style={S.input} placeholder={isDM ? 'Send a message…' : 'Message the community…'} value={input}
            onChange={(e) => { setInput(e.target.value); emitTyping() }}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
          <button style={S.btn} onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}
