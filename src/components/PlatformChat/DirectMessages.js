import React, { useEffect, useState } from 'react'
import { privateAPI, attachToken } from '../../config/constants'
import ChatThread from './ChatThread'

// DM list + thread. Reuses ChatThread (scope="dm") so DMs get the full
// feature set (gif, poll, reactions, replies, typing).

export default function DirectMessages({ initialUserId = null, initialName = '' }) {
  const myId = localStorage.getItem('userId') || ''
  const [convos, setConvos] = useState([])
  const [sel, setSel] = useState(initialUserId ? { userId: initialUserId, name: initialName } : null)

  const otherOf = (room) => (room || '').replace('dm:', '').split('_').find((id) => id !== myId) || ''

  const load = () => {
    attachToken()
    privateAPI.get('/platform-chat/dm-conversations')
      .then((r) => setConvos(r.data?.conversations || [])).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const search = (val) => {
    setQ(val)
    if (val.trim().length < 2) { setResults([]); return }
    attachToken()
    privateAPI.get(`/platform-chat/users/search?q=${encodeURIComponent(val.trim())}`)
      .then((r) => setResults(r.data?.users || [])).catch(() => setResults([]))
  }
  const openDM = (u) => { setSel({ userId: u.id, name: u.name }); setQ(''); setResults([]) }

  const S = {
    wrap: { display: 'flex', height: '100%', gap: 12 },
    list: { width: 240, flexShrink: 0, background: '#0f131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflowY: 'auto' },
    item: (active) => ({ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: active ? 'rgba(74,144,217,0.12)' : 'transparent' }),
    thread: { flex: 1, minWidth: 0 },
  }

  // One-at-a-time (works in the narrow docked panel): open thread OR the list.
  if (sel) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div onClick={() => setSel(null)} style={{ padding: '4px 2px 8px', color: '#4a90d9', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>← Conversations</div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatThread scope="dm" otherUserId={sel.userId} title={'✉️ ' + (sel.name || 'Direct message')} />
        </div>
      </div>
    )
  }
  return (
    <div style={{ height: '100%', background: '#0f131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflowY: 'auto' }}>
      <div style={{ padding: '10px 14px', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Direct Messages</div>
      <div style={{ padding: '8px 10px' }}>
        <input value={q} onChange={(e) => search(e.target.value)} placeholder="Search users to message…"
          style={{ width: '100%', boxSizing: 'border-box', background: '#141a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 10px', color: '#fff', outline: 'none', fontSize: 13 }} />
        {results.map((u) => (
          <div key={u.id} onClick={() => openDM(u)} style={{ padding: '8px 8px', cursor: 'pointer', color: '#c9d2e0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>✉️ {u.name}</div>
        ))}
      </div>
      {convos.length === 0 && results.length === 0 && <div style={{ padding: 16, color: '#8a93a6', fontSize: 13 }}>No conversations yet. Search a user above to start one.</div>}
      {convos.map((c) => {
        const uid = otherOf(c.room)
        return (
          <div key={c.room} style={S.item(false)} onClick={() => setSel({ userId: uid, name: c.last?.username || 'User' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{c.last?.username || 'User'}</span>
              {c.unread > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 6px' }}>{c.unread}</span>}
            </div>
            <div style={{ color: '#8a93a6', fontSize: 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last?.text || (c.last?.type === 'gif' ? 'GIF' : '')}</div>
          </div>
        )
      })}
    </div>
  )
}
