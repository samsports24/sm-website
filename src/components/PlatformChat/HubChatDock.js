import React, { useState, useEffect } from 'react'
import HubChat from './HubChat'

// Right-docked community chat. Open by default on desktop, auto-collapsed on
// mobile. Collapsed state shows a slim "Chat" tab on the right edge.
export default function HubChatDock() {
  const isDesktop = () => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)
  const [open, setOpen] = useState(isDesktop())

  useEffect(() => {
    const onResize = () => { if (!isDesktop()) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Reserve space so the fixed panel doesn't cover page content when open.
  useEffect(() => {
    document.body.style.paddingRight = open ? '372px' : ''
    return () => { document.body.style.paddingRight = '' }
  }, [open])

  if (!open) {
    return (
      <div onClick={() => setOpen(true)}
        style={{ position: 'fixed', top: '50%', right: 0, transform: 'translateY(-50%)', background: '#4a90d9', color: '#0b0e14', fontWeight: 800, padding: '10px 8px', borderRadius: '8px 0 0 8px', cursor: 'pointer', zIndex: 950, writingMode: 'vertical-rl' }}>
        💬 Chat
      </div>
    )
  }
  return (
    <div style={{ position: 'fixed', top: 64, right: 0, bottom: 0, width: 360, maxWidth: '92vw', background: '#0b0e14', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '12px 12px 14px', zIndex: 950, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, letterSpacing: 2, color: '#4a90d9', textTransform: 'uppercase', fontWeight: 700 }}>Community</span>
        <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', color: '#8a93a6', fontSize: 18, lineHeight: 1 }}>›</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}><HubChat height="100%" /></div>
    </div>
  )
}
