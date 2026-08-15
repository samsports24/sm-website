import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChatThread from '../../components/PlatformChat/ChatThread'
import DirectMessages from '../../components/PlatformChat/DirectMessages'

// Platform messaging hub: Community (global chat) + Direct (DMs).
//
// Deep links from the notification bell arrive here:
//   /messages?tab=community&m=<messageId>          — a mention/reply in global
//   /messages?tab=direct&u=<userId>&m=<messageId>  — a DM
//
// This page used to render <DirectMessages /> with NO props at all, so a "new
// message from X" notification dropped you on a generic inbox and left you to
// find the conversation yourself. The params below are what make the click land.
export default function Messages() {
  const [params] = useSearchParams()
  const tabParam = params.get('tab')
  const focusUser = params.get('u')
  const focusMessageId = params.get('m')

  const [tab, setTab] = useState(tabParam === 'direct' || focusUser ? 'direct' : 'community')

  // A second notification can arrive while this page is already open — react to
  // the URL changing, don't just read it once on mount.
  useEffect(() => {
    if (tabParam === 'direct' || focusUser) setTab('direct')
    else if (tabParam === 'community') setTab('community')
  }, [tabParam, focusUser])

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
          ? <ChatThread scope="global" title="💬 Platform Chat" focusMessageId={tab === 'community' ? focusMessageId : null} />
          : <DirectMessages initialUserId={focusUser} focusMessageId={focusMessageId} />}
      </div>
    </div>
  )
}
