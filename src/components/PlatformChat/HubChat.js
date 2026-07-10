import React, { useState } from 'react'
import ChatThread from './ChatThread'
import DirectMessages from './DirectMessages'

// Embedded chat panel for the hub — always visible, not a separate route.
// Global community chat with a Direct-messages toggle.
export default function HubChat({ height = '100%' }) {
  const [view, setView] = useState('community')
  const pill = (active) => ({
    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
    background: active ? '#4a90d9' : 'transparent', color: active ? '#0b0e14' : '#c9d2e0',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.15)',
  })
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexShrink: 0 }}>
        <div style={pill(view === 'community')} onClick={() => setView('community')}>🌐 Community</div>
        <div style={pill(view === 'direct')} onClick={() => setView('direct')}>✉️ Direct</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {view === 'community'
          ? <ChatThread scope="global" title="💬 Platform Chat" />
          : <DirectMessages />}
      </div>
    </div>
  )
}
