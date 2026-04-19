import { useState, useEffect } from 'react'
import '../styles/components/ecosystem-popup.css'

/* ── Minimal SVG sport icons ── */
const SportIcon = ({ sport }) => {
  const icons = {
    soccer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    ),
    nfl: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="10" ry="7" transform="rotate(-30 12 12)"/>
        <path d="M7.5 7.5l9 9M9 6.5l1.5 1.5M14 16l1.5 1.5M6.5 9l1.5 1.5M16 14l1.5 1.5"/>
      </svg>
    ),
    nba: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M4.93 4.93c4.08 2.38 8.18 4.63 14.14 0"/>
        <path d="M4.93 19.07c4.08-2.38 8.18-4.63 14.14 0"/>
        <path d="M12 2v20"/>
      </svg>
    ),
    nhl: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2l-5 5-5-5"/>
        <rect x="4" y="7" width="16" height="4" rx="2"/>
        <path d="M12 11v8"/>
        <path d="M8 22h8"/>
      </svg>
    ),
    mlb: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M18.5 5.5c-2 2.5-2 6.5 0 12"/>
        <path d="M5.5 5.5c2 2.5 2 6.5 0 12"/>
      </svg>
    ),
    tennis: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M18.178 5.822a15.94 15.94 0 0 1 0 12.356"/>
        <path d="M5.822 5.822a15.94 15.94 0 0 0 0 12.356"/>
      </svg>
    ),
  }
  return <div className="eco-sport-icon">{icons[sport]}</div>
}

/* ── Feature icons ── */
const FeatureIcon = ({ type }) => {
  const icons = {
    metric: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 5-10"/>
      </svg>
    ),
    points: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9 9H2l5.5 4.5L5 21l7-5 7 5-2.5-7.5L22 9h-7z"/>
      </svg>
    ),
    live: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M8.1 8.1a7 7 0 0 0 0 7.8"/><path d="M15.9 8.1a7 7 0 0 1 0 7.8"/><path d="M5.3 5.3a11 11 0 0 0 0 13.4"/><path d="M18.7 5.3a11 11 0 0 1 0 13.4"/>
      </svg>
    ),
    draft: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-8.5 8.5"/><path d="M3 21l8.5-8.5"/>
      </svg>
    ),
  }
  return <div className="eco-feat-icon">{icons[type]}</div>
}

const EcosystemPopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const shownInSession = sessionStorage.getItem('ecosystemPopupShown')
    if (!shownInSession) {
      const showDelay = setTimeout(() => {
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('ecosystemPopupShown', 'true')
      }, 300)
      const dismissDelay = setTimeout(() => {
        setIsVisible(false)
      }, 5300)
      return () => {
        clearTimeout(showDelay)
        clearTimeout(dismissDelay)
      }
    }
  }, [])

  const handleClose = () => setIsVisible(false)

  if (!hasShown) return null

  const sports = [
    { key: 'soccer', name: 'Soccer', live: true },
    { key: 'nfl', name: 'A.Football', live: true },
    { key: 'nba', name: 'NBA', live: false },
    { key: 'nhl', name: 'NHL', live: false },
    { key: 'mlb', name: 'MLB', live: false },
    { key: 'tennis', name: 'Tennis', live: false },
  ]

  const features = [
    { key: 'metric', name: 'SAM Metric', desc: 'Advanced scoring system' },
    { key: 'live', name: 'Live Scoring', desc: 'Real-time match data' },
    { key: 'draft', name: 'Live Drafts', desc: 'Draft against real GMs' },
    { key: 'points', name: 'SAM Points', desc: 'Play-to-earn rewards' },
  ]

  return (
    <div className={`eco-backdrop ${isVisible ? 'visible' : ''}`}>
      <div className={`eco-container ${isVisible ? 'visible' : ''}`}>
        {/* Close */}
        <button className="eco-close" onClick={handleClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="eco-header">
          <div className="eco-brand">
            <span className="eco-brand-sam">SAM</span>
            <span className="eco-brand-sports">SPORTS</span>
          </div>
          <h2 className="eco-tagline">Fantasy Sports Reimagined</h2>
          <p className="eco-subtitle">
            Multi-sport fantasy platform with live scoring, real-time drafts, and our proprietary SAM Metric system
          </p>
        </div>

        {/* Sports Row */}
        <div className="eco-sports-row">
          {sports.map((s) => (
            <div key={s.key} className={`eco-sport-chip ${s.live ? 'live' : 'upcoming'}`}>
              <SportIcon sport={s.key} />
              <span className="eco-sport-name">{s.name}</span>
              {s.live && <span className="eco-live-dot" />}
              {!s.live && <span className="eco-soon-label">Soon</span>}
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="eco-features">
          {features.map((f) => (
            <div key={f.key} className="eco-feat">
              <FeatureIcon type={f.key} />
              <div className="eco-feat-text">
                <span className="eco-feat-name">{f.name}</span>
                <span className="eco-feat-desc">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="eco-cta">
          <button className="eco-btn-primary" onClick={handleClose}>
            Explore Platform
          </button>
          <p className="eco-cta-note">Free to play &middot; No credit card required</p>
        </div>

        {/* Timer */}
        <div className="eco-timer">
          <div className="eco-timer-bar" />
        </div>
      </div>
    </div>
  )
}

export default EcosystemPopup
