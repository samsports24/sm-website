import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isPublicPath } from '../../utils/publicPaths'

// Full-screen overlay shown on phones held in portrait. The draft board, the
// team sheet and the auction room are built for landscape, so inside the app
// this earns its place.
//
// ── WHY IT NO LONGER COVERS THE PUBLIC PAGES ─────────────────────────────────
//
// It was mounted app-wide with no route check, so it covered the landing page
// too. A stranger opening samsports.io on a phone, held the way phones are
// held, got a wall instead of the product: inset 0, z-index 100000, body scroll
// locked, no buttons. One wrote in: "Make me rotate my phone. I can't scroll
// and I don't see any buttons on this screen. Stuck."
//
// That is the signup funnel closed on mobile. Nobody rotates a phone to decide
// whether to join something; they leave. So every page a stranger can reach is
// exempt, unconditionally.
//
// And nowhere is a dead end any more: even inside the app it can be dismissed,
// because rotation can be locked for accessibility reasons that have nothing to
// do with us, and "stuck" is not a state to leave anyone in.
export default function RotateHint() {
  const { pathname } = useLocation()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const blocked = isPublicPath(pathname)

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait) and (max-width: 920px)')
    const update = () => setShow(mq.matches)
    update()
    if (mq.addEventListener) mq.addEventListener('change', update)
    else if (mq.addListener) mq.addListener(update)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else if (mq.removeListener) mq.removeListener(update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  // Lock the page behind the overlay while it's up. Guarded on the same
  // conditions as the render: locking the body while rendering nothing is how a
  // public page ends up frozen with no overlay to explain why.
  useEffect(() => {
    if (!show || blocked || dismissed) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [show, blocked, dismissed])

  if (!show || blocked || dismissed) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'radial-gradient(circle at 50% 40%, #0f1b12 0%, #050505 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', textAlign: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <style>{`
        @keyframes samRotateHint {
          0%, 30%   { transform: rotate(0deg); }
          55%, 80%  { transform: rotate(-90deg); }
          100%      { transform: rotate(-90deg); }
        }
      `}</style>

      <svg
        width="84" height="84" viewBox="0 0 24 24" fill="none"
        stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: 'samRotateHint 2.4s ease-in-out infinite', marginBottom: '28px' }}
        aria-hidden="true"
      >
        <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
        <line x1="11" y1="18" x2="13" y2="18"></line>
      </svg>

      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
        Rotate your phone
      </div>
      <div style={{ color: '#9aa4b6', fontSize: '14px', fontWeight: 500, maxWidth: '300px', lineHeight: 1.5 }}>
        SamSports works best in landscape. Turn your phone sideways to continue.
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{
          marginTop: 24, padding: '10px 20px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.22)', background: 'transparent',
          color: '#cfd6e4', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Continue anyway
      </button>
    </div>
  )
}
