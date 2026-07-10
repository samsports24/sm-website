import React, { useEffect, useRef, useState } from 'react'

/**
 * UpdateBanner — detects when a new front-end build has been deployed and
 * prompts the user to refresh, so open tabs never get stuck on a stale
 * version. CRA rewrites asset-manifest.json with new hashed bundle names on
 * every build, so a change in its contents means a new deploy is live.
 */
const POLL_MS = 3 * 60 * 1000 // check every 3 minutes
const MANIFEST = '/asset-manifest.json'

const fetchSignature = async () => {
  try {
    const res = await fetch(`${MANIFEST}?ts=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return JSON.stringify(data.entrypoints || data.files || data)
  } catch {
    return null
  }
}

const UpdateBanner = () => {
  const baseline = useRef(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchSignature().then((sig) => { if (!cancelled) baseline.current = sig })

    const check = async () => {
      if (updateAvailable) return
      const sig = await fetchSignature()
      if (cancelled || !sig) return
      if (baseline.current && sig !== baseline.current) setUpdateAvailable(true)
    }

    const interval = setInterval(check, POLL_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateAvailable])

  if (!updateAvailable) return null

  return (
    <div
      role="alert"
      style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, display: 'flex', alignItems: 'center', gap: 14,
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        border: '1px solid rgba(212,168,67,0.4)', borderRadius: 12,
        padding: '12px 16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        fontFamily: "'Rajdhani', sans-serif", maxWidth: '92vw',
      }}
    >
      <span style={{ fontSize: 20 }}>🔄</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>A new version is available</span>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Refresh to get the latest updates.</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginLeft: 6, background: '#D4A843', color: '#111', border: 'none',
          borderRadius: 8, padding: '8px 16px', fontWeight: 800, fontSize: 13,
          cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        Refresh
      </button>
      <button
        onClick={() => setUpdateAvailable(false)}
        aria-label="Dismiss"
        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  )
}

export default UpdateBanner
