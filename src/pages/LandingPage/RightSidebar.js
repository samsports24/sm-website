import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { authLogin, googleLogin } from '../../redux/actions/authActions'
import GmRankingWidget from './GmRankingWidget'

/* ── Google Client ID ── */
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

/* ═══════════════════════════════════════════════════════════
   Google Sign-In Button (uses Google Identity Services)
   ═══════════════════════════════════════════════════════════ */
const GoogleSignInButton = ({ onSuccess, disabled }) => {
  const btnRef = useRef(null)
  const [gsiReady, setGsiReady] = useState(false)

  useEffect(() => {
    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setGsiReady(true)
        return true
      }
      return false
    }
    if (checkGsi()) return
    const interval = setInterval(() => {
      if (checkGsi()) clearInterval(interval)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!gsiReady || !btnRef.current) return
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) onSuccess(response.credential)
        },
        auto_select: false,
        locale: 'en',
      })
      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: '100%',
        logo_alignment: 'left',
        locale: 'en',
      })
    } catch (err) {
      console.error('GSI init error:', err)
    }
  }, [gsiReady, onSuccess])

  if (!gsiReady) {
    return (
      <button type="button" className="ls-auth-google-btn" disabled={disabled}
        onClick={() => { if (window.google?.accounts?.id) window.google.accounts.id.prompt() }}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span>Sign in with Google</span>
      </button>
    )
  }
  return <div ref={btnRef} className="ls-auth-google-wrap" />
}

/* ═══════════════════════════════════════════════════════════
   Auth Card, Login / Sign Up / Google
   ═══════════════════════════════════════════════════════════ */
const AuthCard = ({ onSignup }) => {
  const [activeTab, setActiveTab] = useState('login')
  const [loginData, setLoginData] = useState({ userName: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginData.userName || !loginData.password) { setError('Please enter both username and password'); return }
    setLoading(true); setError('')
    try { await dispatch(authLogin(loginData, navigate)) } catch (err) { setError(err?.message || 'Login failed') } finally { setLoading(false) }
  }

  const handleGoogleSuccess = useCallback(async (credential) => {
    setLoading(true); setError('')
    try { await dispatch(googleLogin(credential, navigate)) } catch (err) { setError('Google sign-in failed') } finally { setLoading(false) }
  }, [dispatch, navigate])

  return (
    <div className="ls-auth-card">
      <div className="ls-auth-logo-wrap">
        <div className="ls-auth-ult-badge">SAM ULTIMATE FANTASY</div>
      </div>
      <div className="ls-auth-tabs">
        <button className={`ls-auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setError('') }}>Login</button>
        <button className={`ls-auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => { setActiveTab('signup'); setError('') }}>Sign Up</button>
      </div>
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit} className="ls-auth-form">
          {error && <div className="ls-auth-error-msg">{error}</div>}
          <div className="ls-auth-field"><label className="ls-auth-label">Username</label><input type="text" name="userName" className="ls-auth-input" value={loginData.userName} onChange={handleLoginChange} placeholder="Enter username" autoComplete="username" required /></div>
          <div className="ls-auth-field"><label className="ls-auth-label">Password</label><input type="password" name="password" className="ls-auth-input" value={loginData.password} onChange={handleLoginChange} placeholder="Enter password" autoComplete="current-password" required /></div>
          <div className="ls-auth-row"><label className="ls-auth-check-lbl"><input type="checkbox" /> Remember me</label><a href="/forgot-password" className="ls-auth-link">Forgot password?</a></div>
          <button type="submit" className="ls-auth-btn" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          <div className="ls-auth-divider"><span>OR CONTINUE WITH</span></div>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={loading} />
        </form>
      )}
      {activeTab === 'signup' && (
        <div className="ls-auth-signup-body">
          <div className="ls-auth-signup-features">
            <div className="ls-auth-feature-item"><span className="ls-auth-feature-icon">🏆</span><span>Compete and earn SamPoints</span></div>
            <div className="ls-auth-feature-item"><span className="ls-auth-feature-icon">🏈</span><span>Multi-sport fantasy leagues</span></div>
            <div className="ls-auth-feature-item"><span className="ls-auth-feature-icon">📊</span><span>Live stats and scoring</span></div>
          </div>
          <button className="ls-auth-btn signup" onClick={onSignup}>Create Account</button>
          <div className="ls-auth-divider"><span>OR</span></div>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={loading} />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Quick Stats Widget
   ═══════════════════════════════════════════════════════════ */
const QuickStatsWidget = () => {
  const user = useSelector((state) => state?.user)
  const teamName = user?.userDetails?.team?.name || 'My Team'
  const wins = user?.userDetails?.team?.wins || 0
  const losses = user?.userDetails?.team?.losses || 0
  const ties = user?.userDetails?.team?.ties || 0
  const samPoints = user?.userDetails?.samPoints || user?.userDetails?.team?.samPoints || 0

  return (
    <div className="ls-quick-stats">
      <div className="ls-qs-header">
        <span className="ls-qs-team-name">{teamName}</span>
        <span className="ls-qs-badge">YOUR STATS</span>
      </div>
      <div className="ls-qs-grid">
        <div className="ls-qs-stat">
          <span className="ls-qs-val ls-qs-wins">{wins}</span>
          <span className="ls-qs-label">Wins</span>
        </div>
        <div className="ls-qs-stat">
          <span className="ls-qs-val ls-qs-losses">{losses}</span>
          <span className="ls-qs-label">Losses</span>
        </div>
        <div className="ls-qs-stat">
          <span className="ls-qs-val ls-qs-ties">{ties}</span>
          <span className="ls-qs-label">Ties</span>
        </div>
        <div className="ls-qs-stat">
          <span className="ls-qs-val ls-qs-sp">{samPoints >= 1000 ? `${(samPoints / 1000).toFixed(1)}K` : samPoints}</span>
          <span className="ls-qs-label">SAM Pts</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Trending Players Widget
   ═══════════════════════════════════════════════════════════ */
const TrendingPlayersWidget = ({ scorers = [] }) => {
  return (
    <div className="ls-trending">
      <div className="ls-trending-header">
        <div className="ls-trending-header-left">
          <span className="ls-trending-icon">🔥</span>
          <span className="ls-trending-title">TRENDING PLAYERS</span>
        </div>
        <span className="ls-trending-badge">LIVE</span>
      </div>
      <div className="ls-trending-list">
        {scorers.length > 0 ? scorers.slice(0, 5).map((entry, i) => {
          const ath = entry.athlete
          return (
            <div key={i} className="ls-trending-row">
              <span className={`ls-trending-rank ${i < 3 ? `ls-trending-rank-${i + 1}` : ''}`}>
                {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
              </span>
              <div className="ls-trending-player-wrap">
                {ath?.headshot?.href ? (
                  <img src={ath.headshot.href} className="ls-trending-photo" alt="" />
                ) : (
                  <div className="ls-trending-photo-ph">{(ath?.displayName || '?').charAt(0)}</div>
                )}
                <div className="ls-trending-info">
                  <div className="ls-trending-name">{ath?.displayName || '—'}</div>
                  <div className="ls-trending-club">{ath?.team?.displayName || ''}</div>
                </div>
              </div>
              <div className="ls-trending-stat">
                <span className="ls-trending-val">{entry.displayValue || entry.value || '0'}</span>
                <span className="ls-trending-stat-label">goals</span>
              </div>
            </div>
          )
        }) : (
          <div className="ls-trending-empty">
            <div style={{ fontSize: 28, marginBottom: 6 }}>⚽</div>
            <div style={{ color: 'var(--ls-gray)', fontSize: 11, fontFamily: 'var(--ls-font-cd)' }}>Player stats update when matches are live</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Quick Links Widget
   ═══════════════════════════════════════════════════════════ */
const QuickLinksWidget = () => {
  const navigate = useNavigate()

  const links = [
    { icon: '🏟️', label: 'My Leagues', path: '/homepage' },
    { icon: '📊', label: 'Live Scores', path: '/livescore' },
    { icon: '🔄', label: 'Trade Center', path: '/team-trade' },
    { icon: '🏪', label: 'War Room', path: '/warroom' },
  ]

  return (
    <div className="ls-quicklinks">
      {links.map((link, i) => (
        <button key={i} className="ls-ql-btn" onClick={() => navigate(link.path)}>
          <span className="ls-ql-icon">{link.icon}</span>
          <span className="ls-ql-label">{link.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Right Sidebar
   ═══════════════════════════════════════════════════════════ */
const RightSidebar = ({ scorers = [], isAuthenticated }) => {
  const navigate = useNavigate()
  const [adSlide, setAdSlide] = React.useState(0)

  // Rotate every 6 seconds
  React.useEffect(() => {
    const timer = setInterval(() => setAdSlide(prev => (prev + 1) % 3), 6000)
    return () => clearInterval(timer)
  }, [])

  const slides = [
    { id: 'samsports-1', type: 'brand' },
    { id: 'rivals', type: 'rivals' },
    { id: 'samsports-2', type: 'brand' },
  ]
  const current = slides[adSlide]

  return (
    <aside className="ls-sidebar">
      {/* GM Overall Ranking, always visible */}
      <GmRankingWidget />

      {/* Rotating Promo Cards */}
      <div className="ls-rsb-promo" onClick={() => navigate(current.type === 'rivals' ? '/select-game' : '/select-game')} style={current.type === 'brand' ? {background: 'linear-gradient(135deg, #0a1628 0%, #162544 50%, #0d2137 100%)'} : {}}>
        <div className="ls-rsb-promo-glow" style={current.type === 'brand' ? {background: 'radial-gradient(circle at 30% 20%, rgba(59,130,246,0.25), transparent 60%)'} : {}} />
        <div className="ls-rsb-promo-shimmer" />
        <div className="ls-rsb-promo-inner">

          {current.type === 'rivals' ? (
            <>
              <span className="ls-rsb-promo-badge">NEW</span>
              <h3 className="ls-rsb-promo-title">
                SAM<br /><span className="ls-rsb-promo-hl">RIVALS</span>
              </h3>
              <p className="ls-rsb-promo-desc">
                Competitive H2H matchups. Climb through divisions. Earn SamPoints every match.
              </p>
              <div className="ls-rsb-promo-sports">
                <span className="ls-rsb-promo-pill active">Soccer</span>
                <span className="ls-rsb-promo-pill active" style={{background: 'rgba(124,58,237,0.2)', borderColor: 'rgba(124,58,237,0.4)', color: '#A78BFA'}}>A.Football</span>
              </div>
              <a href="/select-game" className="ls-rsb-promo-cta" onClick={e => e.stopPropagation()}>
                Enter Rivals
              </a>
              <span className="ls-rsb-promo-note">Free to play · Earn SamPoints</span>
            </>
          ) : (
            <>
              <h3 className="ls-rsb-promo-title" style={{fontSize: 28, lineHeight: 1.1}}>
                SAM<span className="ls-rsb-promo-hl" style={{color: '#3b82f6'}}>SPORTS</span>
              </h3>
              <p className="ls-rsb-promo-desc" style={{fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8}}>
                Fantasy Sports Reimagined.
              </p>
              <div className="ls-rsb-promo-sports" style={{marginTop: 12}}>
                <span className="ls-rsb-promo-pill active" style={{background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa'}}>A.Football</span>
                <span className="ls-rsb-promo-pill active">Soccer</span>
              </div>
              <a href="/select-game" className="ls-rsb-promo-cta" onClick={e => e.stopPropagation()} style={{background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'}}>
                Play Now
              </a>
              <span className="ls-rsb-promo-note">Draft · Trade · Compete</span>
            </>
          )}

        </div>
      </div>

      {/* Slide indicators */}
      <div style={{display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8}}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setAdSlide(i)}
            style={{
              width: adSlide === i ? 18 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: adSlide === i
                ? (slides[i].type === 'rivals' ? '#22c55e' : '#3b82f6')
                : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </aside>
  )
}

export { AuthCard }
export default RightSidebar
