import React, { useState } from 'react'
import ChatThread from '../../components/PlatformChat/ChatThread'
import DirectMessages from '../../components/PlatformChat/DirectMessages'

// Platform messaging hub: Community (global chat) + Direct (DMs).
export default function Messages() {
  const [tab, setTab] = useState('community')

  const tabStyle = (active) => ({
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
    background: active ? '#4a90d9' : 'transparent', color: active ? '#0b0e14' : '#c9d2e0',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.15)',
  })

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 16px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={tabStyle(tab === 'community')} onClick={() => setTab('community')}>Community</div>
        <div style={tabStyle(tab === 'direct')} onClick={() => setTab('direct')}>Direct Messages</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === 'community'
          ? <ChatThread scope="global" title="💬 Platform Chat" />
          : <DirectMessages />}
      </div>
    </div>
  )
}
