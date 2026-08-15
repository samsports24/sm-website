import React, { useEffect, useRef, useState, useCallback } from 'react'
import io from 'socket.io-client'
import { base_url, privateAPI, attachToken } from '../../config/constants'
import GifPicker from '../GifPicker'

// Generic real-time thread used by BOTH the global platform chat and DMs.
// Props:
//   scope           'global' | 'dm'
//   otherUserId     dm only
//   title           header text
//   focusMessageId  scroll to + highlight this message (set from a notification click)
//
// Features: text, GIF search, @mentions, emoji reactions, threaded replies,
// polls, typing indicators, read receipts.

const QUICK_EMOJIS = ['👍', '🔥', '😂', '😮', '❤️', '🎉']
const socketBase = base_url.replace('/api/v1', '').replace('/api', '')
const ACCENT = '#4a90d9'

export default function ChatThread({ scope = 'global', otherUserId = null, title = 'Platform Chat', focusMessageId = null }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || ''
  const username = localStorage.getItem('userName') || 'Manager'
  const myId = localStorage.getItem('userId') || ''
  const isDM = scope === 'dm'

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [gifOpen, setGifOpen] = useState(false)
  const [pollOpen, setPollOpen] = useState(false)
  const [pollQ, setPollQ] = useState('')
  const [pollOpts, setPollOpts] = useState(['', ''])
  const [typing, setTyping] = useState('')
  const [conn, setConn] = useState('connecting')
  const [pickerFor, setPickerFor] = useState(null)

  // @mention autocomplete
  const [mentionQuery, setMentionQuery] = useState(null) // null = closed
  const [mentionHits, setMentionHits] = useState([])
  const [mentionIdx, setMentionIdx] = useState(0)

  // Read receipts: who has read up to where, in this DM.
  const [readByOther, setReadByOther] = useState(false)

  // My own @handle. Needed to highlight mentions OF ME: my display name is
  // "Julien Sevat" but the message text says "@julien.sevat", so comparing
  // against the name would never match.
  const [myHandle, setMyHandle] = useState('')

  const socketRef = useRef(null)
  const endRef = useRef(null)
  const listRef = useRef(null)
  const typingTimer = useRef(null)
  const mentionTimer = useRef(null)
  const inputRef = useRef(null)
  const msgRefs = useRef({})

  useEffect(() => {
    attachToken()
    privateAPI.get('/platform-chat/me')
      .then((r) => setMyHandle(String(r.data?.handle || '').toLowerCase()))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isDM && !otherUserId) return
    attachToken()
    const url = isDM ? `/platform-chat/dm/${otherUserId}?limit=50` : '/platform-chat/global?limit=50'
    privateAPI.get(url).then((r) => setMessages(r.data?.messages || [])).catch(() => {})

    const sock = io(socketBase, { auth: { token }, transports: ['websocket', 'polling'] })
    socketRef.current = sock
    const evt = isDM ? 'dmMessage' : 'globalMessage'

    sock.on('connect', () => {
      setConn('connected')
      if (isDM) {
        sock.emit('joinDM', { otherUserId })
        sock.emit('markRead', { otherUserId })   // opening the thread = reading it
      } else {
        sock.emit('joinGlobalChat')
      }
    })
    sock.on('connect_error', () => setConn('offline'))
    sock.on('disconnect', () => setConn('offline'))
    sock.on('chatError', (e) => { if (e && e.message) setConn('err:' + e.message) })
    sock.on('chatBanned', (e) => setConn('err:' + (e?.reason ? `Banned: ${e.reason}` : 'Banned from global chat')))

    sock.on(evt, (m) => {
      setMessages((prev) => prev.concat([m]).slice(-300))
      // A message arriving from the other side while the thread is open has, by
      // definition, been read.
      if (isDM && String(m.userId) !== String(myId)) sock.emit('markRead', { otherUserId })
      if (isDM && String(m.userId) === String(myId)) setReadByOther(false) // new msg, not read yet
    })
    sock.on('chatReaction', ({ messageId, reactions }) => setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))))
    sock.on('pollUpdate', ({ messageId, options }) => setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, poll: { ...m.poll, options } } : m))))
    sock.on('messageDeleted', ({ messageId }) => setMessages((prev) => prev.filter((m) => m._id !== messageId)))
    sock.on('chatTyping', ({ username: who, scope: s }) => {
      if (s !== scope) return
      setTyping(who + ' is typing…')
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTyping(''), 2500)
    })
    // Read receipt: the other person read this thread.
    sock.on('messagesRead', ({ readerId }) => {
      if (String(readerId) !== String(myId)) setReadByOther(true)
    })

    return () => sock.disconnect()
  }, [token, scope, otherUserId, isDM, myId])

  // Follow new messages — unless we were sent here to look at a specific one.
  useEffect(() => {
    if (focusMessageId) return
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, focusMessageId])

  // Land on the message a notification pointed at. Without this, clicking
  // "X replied to you" just dropped you at the bottom of the thread and left you
  // to find it yourself.
  useEffect(() => {
    if (!focusMessageId || !messages.length) return
    const el = msgRefs.current[focusMessageId]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusMessageId, messages])

  const emitTyping = () => socketRef.current?.emit('chatTyping', { scope, otherUserId, username })
  const sendEvt = isDM ? 'dmMessage' : 'globalMessage'
  const base = () => (isDM ? { otherUserId, username } : { username })

  // ── @mention autocomplete ────────────────────────────────────────────────
  // The composer inserts "@userName" (the unique handle). The SERVER re-parses
  // those handles out of the text to decide who actually got mentioned — it does
  // not trust anything this component sends. So the handle is the contract; if
  // it isn't in the text, no notification goes out.
  const searchMentions = useCallback((q) => {
    clearTimeout(mentionTimer.current)
    mentionTimer.current = setTimeout(async () => {
      if (!q || q.length < 1) { setMentionHits([]); return }
      try {
        attachToken()
        // mentionable=1: only accounts whose handle survives @mention parsing.
        // Offering a username with a space in it would insert "@Julien Sevat",
        // which parses as "@Julien", matches nobody, and notifies nobody.
        const r = await privateAPI.get(`/platform-chat/users/search?q=${encodeURIComponent(q)}&mentionable=1`)
        setMentionHits((r.data?.users || []).slice(0, 6))
        setMentionIdx(0)
      } catch (e) { setMentionHits([]) }
    }, 200)
  }, [])

  const onInputChange = (e) => {
    const val = e.target.value
    setInput(val)
    emitTyping()

    // Only the @token the caret is sitting in, not any @ in the message.
    const upToCaret = val.slice(0, e.target.selectionStart ?? val.length)
    const m = /(?:^|\s)@([A-Za-z0-9._-]{0,30})$/.exec(upToCaret)
    if (m) {
      setMentionQuery(m[1])
      if (m[1].length >= 2) searchMentions(m[1]); else setMentionHits([])
    } else {
      setMentionQuery(null)
      setMentionHits([])
    }
  }

  const applyMention = (user) => {
    const el = inputRef.current
    const caret = el?.selectionStart ?? input.length
    const before = input.slice(0, caret)
    const after = input.slice(caret)
    // Insert the HANDLE, not the display name. "Julien Sevat" has a space in it,
    // and "@Julien Sevat" parses as "@Julien" and mentions nobody.
    const replaced = before.replace(/(^|\s)@([A-Za-z0-9._-]{0,30})$/, `$1@${user.handle || user.userName} `)
    setInput(replaced + after)
    setMentionQuery(null)
    setMentionHits([])
    setTimeout(() => {
      el?.focus()
      const pos = replaced.length
      el?.setSelectionRange(pos, pos)
    }, 0)
  }

  const send = () => {
    const sock = socketRef.current
    if (!sock) return
    if (!input.trim()) return
    // No `mentions` field: the server parses @handles from the text itself.
    sock.emit(sendEvt, { ...base(), type: 'text', text: input.trim(), replyTo: replyTo?._id || null })
    setInput(''); setReplyTo(null); setMentionQuery(null); setMentionHits([])
  }

  const sendGif = (url) => {
    socketRef.current?.emit(sendEvt, { ...base(), type: 'gif', gifUrl: url, replyTo: replyTo?._id || null })
    setGifOpen(false); setReplyTo(null)
  }

  const createPoll = () => {
    const opts = pollOpts.map((o) => o.trim()).filter(Boolean)
    if (!pollQ.trim() || opts.length < 2) return
    socketRef.current?.emit(sendEvt, { ...base(), type: 'poll', poll: { question: pollQ.trim(), options: opts.map((t) => ({ text: t })) } })
    setPollQ(''); setPollOpts(['', '']); setPollOpen(false)
  }

  const react = (id, e) => socketRef.current?.emit('chatReaction', { messageId: id, emoji: e, username })
  const vote = (id, i) => socketRef.current?.emit('pollVote', { messageId: id, optionIndex: i })
  const del = (id) => { if (window.confirm('Delete this message?')) socketRef.current?.emit('deleteMessage', { messageId: id }) }

  const onKeyDown = (e) => {
    if (mentionHits.length && mentionQuery !== null) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx((i) => (i + 1) % mentionHits.length); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx((i) => (i - 1 + mentionHits.length) % mentionHits.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyMention(mentionHits[mentionIdx]); return }
      if (e.key === 'Escape') { setMentionQuery(null); setMentionHits([]); return }
    }
    if (e.key === 'Enter') send()
  }

  // Highlight @handles in rendered text, and make my own mentions stand out.
  //
  const renderText = (text) => {
    // Lookbehind: the "@" must start a word, so "foo@bar.com" isn't highlighted
    // as a mention of bar.com. Must match the server's MENTION_RX exactly.
    const parts = String(text).split(/((?<=^|\s)@[A-Za-z0-9._-]{2,30})/g)
    return parts.map((p, i) => {
      if (!p.startsWith('@')) return <span key={i}>{p}</span>
      // "@julien.sevat." at the end of a sentence captures the full stop, and no
      // handle ends in punctuation — so trim it before comparing, or you never
      // see your own mentions highlighted. Server-side resolveMentions does the
      // same thing; the two MUST agree or the highlight and the notification
      // disagree about who was mentioned.
      const isMe = p.slice(1).replace(/[._-]+$/g, '').toLowerCase() === myHandle
      return (
        <span key={i} style={{
          color: isMe ? '#0b0e14' : ACCENT,
          background: isMe ? '#F5C451' : 'transparent',
          fontWeight: 700, borderRadius: 4, padding: isMe ? '0 3px' : 0,
        }}>{p}</span>
      )
    })
  }

  const lastMine = isDM ? [...messages].reverse().find((m) => String(m.userId) === String(myId)) : null

  const S = {
    wrap: { display: 'flex', flexDirection: 'column', height: '100%', background: '#0f131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' },
    head: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 800, color: '#fff' },
    list: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
    name: { fontWeight: 700, fontSize: 13, color: ACCENT },
    text: { color: '#e8ebf0', fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    reply: { borderLeft: '2px solid ' + ACCENT, paddingLeft: 8, margin: '2px 0', fontSize: 12, color: '#8a93a6' },
    reactBtn: { cursor: 'pointer', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '1px 8px', fontSize: 12, marginRight: 4, border: 'none', color: '#c9d2e0' },
    foot: { borderTop: '1px solid rgba(255,255,255,0.08)', padding: 10, position: 'relative' },
    inputRow: { display: 'flex', gap: 8, alignItems: 'center' },
    input: { flex: 1, minWidth: 0, background: '#141a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#fff', outline: 'none' },
    btn: { flexShrink: 0, background: ACCENT, color: '#0b0e14', fontWeight: 800, border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer' },
    ghost: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#c9d2e0', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' },
    mentionBox: { position: 'absolute', bottom: '100%', left: 10, right: 10, marginBottom: 6, background: '#141C2D', border: '1px solid rgba(74,144,217,0.3)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden' },
    mentionRow: (active) => ({ padding: '8px 12px', cursor: 'pointer', background: active ? 'rgba(74,144,217,0.18)' : 'transparent', color: '#e8ebf0', fontSize: 13, display: 'flex', gap: 8, alignItems: 'baseline' }),
  }

  return (
    <div style={S.wrap}>
      <div style={{ ...S.head, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: conn === 'connected' ? '#22C55E' : '#EF4444' }}>
          {conn === 'connected' ? '● live' : conn.startsWith('err:') ? conn.slice(4) : '● offline'}
        </span>
      </div>

      <div style={S.list} ref={listRef}>
        {messages.map((m) => {
          const focused = focusMessageId && m._id === focusMessageId
          return (
            <div
              key={m._id}
              ref={(el) => { if (el) msgRefs.current[m._id] = el }}
              style={{
                marginBottom: 12,
                background: focused ? 'rgba(245,196,81,0.10)' : 'transparent',
                borderLeft: focused ? '3px solid #F5C451' : '3px solid transparent',
                paddingLeft: 8,
                borderRadius: 6,
                transition: 'background 400ms ease',
              }}
            >
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
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}><div style={{ width: pct + '%', height: '100%', background: ACCENT, borderRadius: 3 }} /></div>
                      </div>
                    )
                  })}
                </div>
              )}
              {m.text && <div style={S.text}>{renderText(m.text)}</div>}
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                {(m.reactions || []).map((r) => <button key={r.emoji} style={S.reactBtn} onClick={() => react(m._id, r.emoji)}>{r.emoji} {r.users.length}</button>)}
                <span onClick={() => setPickerFor(pickerFor === m._id ? null : m._id)} style={{ cursor: 'pointer', color: '#5a6272', fontSize: 13 }}>🙂+</span>
                <span onClick={() => setReplyTo(m)} style={{ color: ACCENT, fontSize: 11, cursor: 'pointer' }}>Reply</span>
                {String(m.userId) === myId && <span onClick={() => del(m._id)} style={{ color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Delete</span>}
                {pickerFor === m._id && QUICK_EMOJIS.map((e) => <span key={e} onClick={() => { react(m._id, e); setPickerFor(null) }} style={{ cursor: 'pointer', fontSize: 15 }}>{e}</span>)}
              </div>
              {/* Read receipt — only under MY most recent message in a DM. */}
              {isDM && lastMine && m._id === lastMine._id && (
                <div style={{ fontSize: 11, color: readByOther ? '#22C55E' : '#5a6272', marginTop: 2 }}>
                  {readByOther ? '✓✓ Read' : '✓ Sent'}
                </div>
              )}
            </div>
          )
        })}
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
        {replyTo && <div style={{ fontSize: 12, color: '#8a93a6', marginBottom: 6 }}>Replying to {replyTo.username} · <span style={{ cursor: 'pointer', color: ACCENT }} onClick={() => setReplyTo(null)}>cancel</span></div>}

        {/* The real GIF search panel. This used to be a text box that asked the
            user to paste a GIF URL by hand, while a working Tenor-backed picker
            sat unused in the same codebase. */}
        <GifPicker visible={gifOpen} onSelect={sendGif} onClose={() => setGifOpen(false)} accentColor={ACCENT} />

        {mentionQuery !== null && mentionHits.length > 0 && (
          <div style={S.mentionBox}>
            {mentionHits.map((u, i) => (
              <div
                key={u.id}
                style={S.mentionRow(i === mentionIdx)}
                onMouseEnter={() => setMentionIdx(i)}
                onMouseDown={(e) => { e.preventDefault(); applyMention(u) }}
              >
                <span style={{ fontWeight: 700 }}>@{u.handle || u.userName}</span>
                {u.name && u.name !== (u.handle || u.userName) && <span style={{ color: '#8a93a6', fontSize: 12 }}>{u.name}</span>}
              </div>
            ))}
          </div>
        )}

        <div style={S.inputRow}>
          <button className="nflr-chat-gif-btn" style={S.ghost} onClick={() => setGifOpen((v) => !v)}>GIF</button>
          <button style={S.ghost} onClick={() => setPollOpen((v) => !v)}>📊</button>
          <input
            ref={inputRef}
            style={S.input}
            placeholder={isDM ? 'Send a message…' : 'Message the community… use @ to mention'}
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
          />
          <button style={S.btn} onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}
