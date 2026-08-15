import React, { useEffect, useState } from 'react'
import { oneSignalConfigured, oneSignalPermission, promptOneSignal } from '../../utils/oneSignal'

// A small, dismissible banner asking the user to turn on notifications so they
// don't miss their draft pick or get sniped in an auction. Shows only when
// OneSignal is configured and the user hasn't opted in yet. Permission must be
// requested from a user gesture, hence a button.
// iOS only allows web push when the site is installed to the Home Screen, so we
// show those users an extra hint. `standalone` = already added to Home Screen.
const isIOS = typeof navigator !== 'undefined' &&
  /iP(hone|ad|od)/.test(navigator.userAgent || '')
const isStandalone = typeof window !== 'undefined' &&
  (window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches))

export default function EnablePushPrompt({ context = 'this' }) {
  // Show immediately when OneSignal is configured, then hide only once we KNOW
  // the user has already granted permission. This avoids a silent-fail where the
  // banner never appears because the SDK's ready-callback was slow or never fired.
  const [visible, setVisible] = useState(oneSignalConfigured())
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    oneSignalPermission().then((perm) => {
      if (alive && perm === 'granted') setVisible(false)
    })
    return () => { alive = false }
  }, [])

  if (!visible) return null

  const enable = async () => {
    setBusy(true)
    await promptOneSignal()
    setBusy(false)
    setVisible(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)',
      borderRadius: 12, padding: '12px 16px', marginBottom: 16,
    }}>
      <span style={{ fontSize: 18 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 220, color: '#e2e8f0', fontSize: 13, lineHeight: 1.5 }}>
        {`Turn on notifications so you don't miss ${context === 'auction' ? 'a bid or your window' : "your pick when you're on the clock"} — we'll alert you even with the tab closed.`}
        {isIOS && !isStandalone && (
          <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 12 }}>
            {`On iPhone? Tap Share → "Add to Home Screen", open the app from that icon, then enable.`}
          </div>
        )}
      </div>
      <button
        onClick={enable}
        disabled={busy}
        style={{
          background: 'linear-gradient(135deg,#22C55E,#16A34A)', border: 'none', color: '#0B1120',
          fontWeight: 800, fontSize: 12, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', letterSpacing: 0.3,
        }}
      >
        {busy ? 'Enabling…' : 'Enable alerts'}
      </button>
      <button
        onClick={() => setVisible(false)}
        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
