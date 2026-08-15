import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { privateAPI, attachToken } from '../../config/constants'

// Join-by-code landing page — the destination of the Clubhouse "copy invite
// link" (https://samsports.io/join/<CODE>). It shows the league that the CODE
// belongs to and lets an EXISTING logged-in user name a team and join, without
// ever logging out. The platform already allows one user to hold teams in
// multiple leagues (only the SAME league twice is blocked), so a logged-in
// user does NOT need a fresh account.
//
// If you arrive here logged OUT, we stash the path and send you to login; the
// login flow brings you straight back (see redirectAfterLogin in authActions).
// Before this page existed the link pointed at /sign-up, which is a
// <Navigate to='/select-game'> that DROPPED the ?league= param — so the link
// never joined anyone to a league and looked like it demanded a logout.

// The "already a member" message the backend returns (joinLleague). Matched as
// a substring so we can show a calm "you're already in" state rather than a
// scary error — being already in the league is not a failure.
const ALREADY_MEMBER = 'already have a team in this league'

export default function JoinByCode() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true })
  const [busy, setBusy] = useState(false)
  // joinLleague rejects with "Team name is required" — so Join has to collect
  // one. Without this the button could never succeed, only 400.
  const [teamName, setTeamName] = useState('')
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    // Capture the referrer BEFORE any redirect so it survives signup/login.
    // The Clubhouse copy link appends ?ref=<referralCode>; stash it under the
    // same key the register-time path reads (authSignupAdvanced ->
    // localStorage 'samsports_ref' -> referralCode on register) so a NEW user
    // signing up through this link credits the referrer.
    try {
      const ref = new URLSearchParams(window.location.search).get('ref')
      if (ref) localStorage.setItem('samsports_ref', ref)
    } catch (e) { /* non-fatal: ref capture is best-effort */ }

    // Logged out? Remember where we were going, then go and log in. Coming back
    // here afterwards is the whole point — an invite link you can't get back to
    // is not an invite link. Do NOT force account creation: an existing user
    // just logs in and lands right back on this join screen.
    const authed = localStorage.getItem('token') || localStorage.getItem('authToken')
    if (!authed) {
      // Stash the destination in localStorage, NOT in a query param: `/login`
      // is just a <Navigate to='/'> (Routes.js), so a ?redirect= would be thrown
      // away in the redirect. authLogin reads this key and comes back here.
      localStorage.setItem('redirectAfterLogin', `/join/${code}`)
      navigate('/', { replace: true })
      return
    }

    attachToken()
    privateAPI.get(`/league/find-by-code/${code}`)
      .then((r) => setState({ loading: false, league: r.data?.data || {} }))
      .catch((e) => setState({ loading: false, error: e.response?.data?.message || 'Could not load this league' }))
  }, [code, navigate])

  const join = async () => {
    if (!teamName.trim()) return
    setBusy(true); attachToken()
    try {
      // joinLleague reads req.body via the global multer middleware — it expects
      // multipart/form-data with leagueId = the SAM-XXXX code (NOT the Mongo _id)
      // and teamName. This mirrors OnboardingWizard's manual-code join exactly.
      const email = localStorage.getItem('email')
      const formData = new FormData()
      formData.append('leagueId', code)
      formData.append('teamName', teamName.trim())
      // This is an intentional invite link, so a private league's password gate
      // is bypassed (the link itself is the invitation).
      formData.append('viaInvite', 'true')
      if (email) formData.append('email', email)

      const r = await privateAPI.post('/league/join', formData)
      // The join issues a FRESH token whose payload makes the newly-joined team +
      // league the active one. If we ignore it, a user who already had a team
      // keeps their OLD token — so the dashboard still shows the old league and
      // "nothing happens". Adopt the new token, then HARD-reload so Redux
      // re-initialises on the new league (a SPA navigate would keep the stale
      // currentLeague in state).
      const t = r?.data?.data?.token || r?.data?.token
      if (t) { localStorage.setItem('token', t); attachToken() }
      window.location.href = '/dashboard'
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not join this league'
      // Already a member? That's not an error to panic over — they're in.
      if (String(msg).toLowerCase().includes(ALREADY_MEMBER)) {
        setAlreadyMember(true)
      } else {
        setState((s) => ({ ...s, error: msg }))
      }
      setBusy(false)
    }
  }

  const wrap = { minHeight: '100vh', background: '#0b0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  const card = { width: '100%', maxWidth: 460, background: '#0f131c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, color: '#e8ebf0' }
  const row = { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, gap: 12 }
  const btn = (p) => ({ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer', border: 'none', ...(p === 'join' ? { background: '#22C55E', color: '#04240f' } : { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#c9d2e0' }) })
  const label = { color: '#8a93a6', flexShrink: 0 }
  const val = { fontWeight: 600, textAlign: 'right' }

  if (state.loading) return <div style={wrap}><div style={card}>Loading league…</div></div>
  if (state.error) return <div style={wrap}><div style={card}><div style={{ color: '#EF4444', fontWeight: 700 }}>{state.error}</div><button style={{ ...btn('cancel'), marginTop: 16 }} onClick={() => navigate('/dashboard')}>Go to dashboard</button></div></div>

  const L = state.league || {}
  const members = L.memberCount != null ? L.memberCount : (Array.isArray(L.teams) ? L.teams.length : null)
  const cap = L.numberOfTeams

  const Row = ({ k, children }) => (children ? <div style={row}><span style={label}>{k}</span><span style={val}>{children}</span></div> : null)

  // Already a member — calm confirmation, not an error state.
  if (alreadyMember) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: '#22C55E', textTransform: 'uppercase', fontWeight: 700 }}>You&apos;re already in</div>
          <h1 style={{ fontSize: 22, margin: '10px 0 6px' }}>{L.name}</h1>
          <div style={{ color: '#aab2c2', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
            You already have a team in this league. You can join multiple leagues in the same sport, but not the same league twice.
          </div>
          <button style={btn('join')} onClick={() => { window.location.href = '/dashboard' }}>Go to dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: '#4a90d9', textTransform: 'uppercase', fontWeight: 700 }}>Join League</div>

        {L.leagueLogo ? (
          <img src={L.leagueLogo} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', margin: '12px 0 4px', display: 'block' }} />
        ) : null}

        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>{L.name}</h1>
        <div style={{ color: '#8a93a6', fontSize: 13, marginBottom: 16 }}>Invite code {L.leagueId || code}</div>

        <Row k="Type">{L.leagueType}{L.category ? ` · ${L.category}` : ''}</Row>
        <Row k="Sport">{L.sport}</Row>
        <Row k="Members">{members != null ? (cap ? `${members} / ${cap}` : members) : null}</Row>
        <Row k="Season">{L.season}</Row>

        {L.description ? <div style={{ marginTop: 14, fontSize: 13, color: '#aab2c2', lineHeight: 1.6 }}>{L.description}</div> : null}

        <div style={{ marginTop: 18 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#8a93a6', marginBottom: 6 }}>Name your team</label>
          <input
            autoFocus
            style={{ width: '100%', boxSizing: 'border-box', background: '#141a26', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', color: '#fff', outline: 'none', fontSize: 14 }}
            value={teamName}
            placeholder="e.g. Krakow Hawks"
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') join() }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button style={btn('cancel')} disabled={busy} onClick={() => navigate('/dashboard')}>Cancel</button>
          <button style={btn('join')} disabled={busy || !teamName.trim()} onClick={join}>
            {busy ? 'Joining…' : 'Join league'}
          </button>
        </div>
      </div>
    </div>
  )
}
