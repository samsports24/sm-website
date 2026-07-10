import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import { base_url, privateAPI, attachToken } from '../../config/constants'

// Messages/Notifications bell: DMs, @mentions, replies, reactions, invites.
// Real-time via the shared socket (userNotification event) + REST fallback.

const socketBase = base_url.replace('/api/v1', '').replace('/api', '')
const ICON = { dm: '✉️', mention: '@', reply: '↩', reaction: '❤️', league_invite: '🏆', poll: '📊' }

export default function MessagesBell() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || ''
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const sockRef = useRef(null)

  const load = () => {
    attachToken()
    privateAPI.get('/platform-chat/notifications')
      .then((r) => { setItems(r.data?.notifications || []); setUnread(r.data?.unread || 0) })
      .catch(() => {})
  }

  useEffect(() => {
    load()
    const sock = io(socketBase, { auth: { token }, transports: ['websocket', 'polling'] })
    sockRef.current = sock
    sock.on('userNotification', (n) => {
      setItems((prev) => [n, ...prev].slice(0, 50))
      setUnread((u) => u + 1)
    })
    return () => sock.disconnect()
  }, [token])

  const openNotif = (n) => {
    attachToken()
    privateAPI.post('/platform-chat/notifications/read', { ids: [n._id] }).catch(() => {})
    setUnread((u) => Math.max(0, u - (n.read ? 0 : 1)))
    setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)))
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const markAll = () => {
    attachToken()
    privateAPI.post('/platform-chat/notifications/read', {}).catch(() => {})
    setUnread(0); setItems((prev) => prev.map((x) => ({ ...x, read: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setOpen((v) => !v); if (!open) load() }}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative', color: '#c9d2e0' }}>
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -6, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 5px' }}>{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 32, width: 340, maxHeight: 440, overflowY: 'auto', background: '#0f131c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontWeight: 800, color: '#fff' }}>Messages</span>
            <span onClick={markAll} style={{ fontSize: 12, color: '#4a90d9', cursor: 'pointer' }}>Mark all read</span>
          </div>
          {items.length === 0 && <div style={{ padding: 20, color: '#8a93a6', fontSize: 13, textAlign: 'center' }}>No notifications yet</div>}
          {items.map((n) => (
            <div key={n._id} onClick={() => openNotif(n)}
              style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(74,144,217,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{ICON[n.type] || '•'} {n.title}</div>
              {n.body && <div style={{ fontSize: 12, color: '#aab2c2', marginTop: 2 }}>{n.body}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
