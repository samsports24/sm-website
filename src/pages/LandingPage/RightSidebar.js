import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { authLogin, googleLogin } from '../../redux/actions/authActions'
import GmRankingWidget from './GmRankingWidget'
import LeaguesTeamsBrowser from './LeaguesTeamsBrowser'
import mockdraftPromo from '../../assets/mockdraft-promo.png'
import { base_url } from '../../config/constants'

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
/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DRAFT PROMO — the cheapest thing we have to convert a scores visitor.
   No signup wall, so the pitch is simply "play it right now".
   ═══════════════════════════════════════════════════════════════════════════ */
const MockDraftPromo = ({ ad }) => {
  const navigate = useNavigate()
  const handleClick = () => {
    if (ad && ad.linkUrl) {
      if (/^https?:\/\//i.test(ad.linkUrl)) window.location.href = ad.linkUrl
      else navigate(ad.linkUrl)
    } else {
      navigate('/mock-draft')
    }
  }
  return (
    <div
      onClick={handleClick}
      role="button"
      aria-label={ad && ad.imageUrl ? 'Advertisement' : 'Start a Mock Draft'}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: '#05070c',
      }}
    >
      <img
        src={ad && ad.imageUrl ? ad.imageUrl : mockdraftPromo}
        alt={ad && ad.imageUrl ? 'Advertisement' : 'Mock Draft — Start Drafting'}
        style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 16 }}
      />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════════════
   NFL INJURIES — the report exists at /injury-report and was reachable only
   through the Fantasy menu, two clicks in, so nobody found it. This is the
   short version: the worst statuses first, with a way through to the full
   report.

   Source: GET /values/injuries on the NFL backend, which reads the Tank01
   status and the official NFL.com weekly designation. No new endpoint.
   ═══════════════════════════════════════════════════════════════════════════ */
const INJ_COLOR = (status) => {
  const s = String(status || '').toLowerCase()
  if (/(^|\b)(out|ir|injured reserve|pup|nfi|suspension)/.test(s)) return '#EF4444'
  if (s.includes('doubtful')) return '#F97316'
  if (s.includes('questionable')) return '#F59E0B'
  return '#94A3B8'
}

const NflInjuriesWidget = ({ limit = 6 }) => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    let alive = true
    fetch(`${base_url}/values/injuries`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((j) => {
        if (!alive) return
        const list = (j && (j.players || j.data)) || []
        setRows(list.slice(0, limit))
        setState(list.length ? 'ok' : 'empty')
      })
      .catch(() => alive && setState('error'))
    return () => { alive = false }
  }, [limit])

  // Nothing to show is not a widget. An empty box on the landing page reads as
  // broken, so it renders nothing at all until there is something to say.
  if (state === 'loading' || state === 'empty' || state === 'error') return null

  return (
    <div style={{
      borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
      background: '#05070c', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, color: '#fff' }}>
          🏥 NFL INJURY REPORT
        </span>
        <button
          onClick={() => navigate('/injury-report')}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: '#22C55E', fontSize: 11, fontWeight: 700,
          }}
        >All →</button>
      </div>
      <div>
        {rows.map((p) => (
          <div
            key={p.id || p.name}
            onClick={() => navigate('/injury-report')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span style={{
              width: 3, height: 26, borderRadius: 2, background: INJ_COLOR(p.status),
            }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#fff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>
                {[p.position, p.team, p.bodyPart].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 800, color: INJ_COLOR(p.status),
              whiteSpace: 'nowrap',
            }}>{p.status || 'Unknown'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const RightSidebar = ({ scorers = [], isAuthenticated, ad }) => {
  return (
    <aside className="ls-sidebar">
      {/* GM Overall Ranking, always visible */}
      <GmRankingWidget />

      {/* NFL injuries, short list into the full report */}
      <NflInjuriesWidget />

      {/* Mock draft — top of the sidebar (or admin-configured advert) */}
      <MockDraftPromo ad={ad} />

      {/* Leagues & Teams browser — replaces the rotating advert; links to Team pages */}
      <LeaguesTeamsBrowser />
    </aside>
  )
}

export { AuthCard }
export default RightSidebar
