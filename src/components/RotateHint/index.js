import { useEffect, useState } from 'react'

// Full-screen overlay shown ONLY on phones held in portrait. The app is built for
// landscape, so this covers the page and asks the user to rotate, then clears
// itself automatically once they do. Mirrors the soccer site's RotateBanner so
// both products behave the same. (Green accent to match NFL branding.)
export default function RotateHint() {
  const [show, setShow] = useState(false)

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

  // Lock the page behind the overlay while it's up.
  useEffect(() => {
    if (!show) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [show])

  if (!show) return null

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
    </div>
  )
}
