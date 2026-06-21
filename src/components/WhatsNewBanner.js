import React, { useState, useEffect } from 'react'

/**
 * WhatsNewBanner — one-time release-notes panel that appears for each user
 * the first time they load the site on a new release. Subsequent visits
 * after the user clicks "Got it" never show this version again (tracked via
 * localStorage). When a fresh release goes out, bump RELEASE_ID below and
 * every user will see the new notes once.
 */
const RELEASE_ID = '2026-06-20-stabilisation'
const STORAGE_KEY = `samsports.whatsNew.seen.${RELEASE_ID}`

const HIGHLIGHTS = [
  '🗳️ League deletion now requires a 7-day owner vote (67% YES to pass). SamPoints in team wallets transfer back to your main wallet on deletion.',
  '👑 Transfer Commissioner is back — works for legacy leagues without a permission record, and accepts an explicit leagueId.',
  '🏈 War Room — cross-product NFL teams fetch is silent-on-error so the console stays clean even when the soccer side blips.',
  '📰 Articles page no longer crashes on stories that contain a photos widget.',
  '🛡️ Deleted leagues are now truly inaccessible — getLeague + selectLeague refuse soft-deleted leagues so you can\'t accidentally re-enter one you just removed.',
  '🧹 Stale leagues auto-cleanup — leagues with no activity for 365 days (or 90 days if never finished) get deletion warnings at T-30, T-7, T-1 days, then auto-deleted with samPoints refunded.',
]

const WhatsNewBanner = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const seen = window.localStorage?.getItem(STORAGE_KEY)
      if (!seen) setOpen(true)
    } catch { /* localStorage blocked — silent */ }
  }, [])

  const dismiss = () => {
    try { window.localStorage?.setItem(STORAGE_KEY, '1') } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-labelledby="samsports-whatsnew-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(3,7,18,0.72)', backdropFilter: 'blur(4px)',
        padding: 20, fontFamily: "'Rajdhani', 'Inter', sans-serif",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div style={{
        width: 'min(520px, 100%)',
        background: 'linear-gradient(135deg, #1f2937 0%, #0b1426 100%)',
        border: '1px solid rgba(212,168,67,0.45)', borderRadius: 16,
        padding: '24px 26px 22px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        color: '#ECEAE3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <h3 id="samsports-whatsnew-title" style={{
            margin: 0, fontWeight: 800, letterSpacing: 0.5,
            fontSize: 18, color: '#D4A843', textTransform: 'uppercase',
          }}>
            What&apos;s new
          </h3>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>
          Quick rundown of what shipped this week:
        </p>
        <ul style={{ margin: 0, padding: '0 0 8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HIGHLIGHTS.map((line, i) => (
            <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: '#ECEAE3' }}>{line}</li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button
            onClick={dismiss}
            style={{
              background: '#D4A843', color: '#111', border: 'none',
              borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatsNewBanner
