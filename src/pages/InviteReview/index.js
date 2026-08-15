import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { privateAPI, attachToken } from '../../config/constants'

// League invitation review — shows league details and lets an existing user
// Accept or Decline. Opened from the notification bell or the email link.
//
// If you arrive here logged OUT, we stash the path and send you to login; the
// login flow brings you straight back (see redirectAfterLogin in authActions).
// Before that existed, the email link simply lost you.

const PRETTY = {
  draftType: { live: 'Live draft', auto: 'Auto draft' },
  draftFormat: { snake: 'Snake', linear: 'Linear', auction: 'Auction' },
  rosterFormat: {
    sam_default: 'Full 53-man roster',
    offense_standard: 'Offense only (standard)',
    offense_superflex: 'Offense only (superflex)',
    custom: 'Custom roster',
  },
  leagueMode: { full: 'Full squad', offense_only: 'Offense only' },
}
const pretty = (field, v) => (v ? (PRETTY[field]?.[v] || String(v).replace(/_/g, ' ')) : null)

const fmtDate = (d) => {
  if (!d) return null
  try {
    return new Date(d).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  } catch (e) { return null }
}

export default function InviteReview() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true })
  const [busy, setBusy] = useState('')
  // joinLeagueFromPlatform rejects with "Team name is required" — so Accept has
  // to collect one. Without this the button could never succeed, only 400.
  const [teamName, setTeamName] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    // Logged out? Remember where we were going, then go and log in. Coming back
    // here afterwards is the whole point — an invitation you can't get back to
    // is not an invitation.
    const authed = localStorage.getItem('token') || localStorage.getItem('authToken')
    if (!authed) {
      // Stash the destination in localStorage, NOT in a query param: `/login`
      // is just a <Navigate to='/'> (Routes.js), so a ?redirect= would be thrown
      // away in the redirect. authLogin reads this key and comes back here.
      localStorage.setItem('redirectAfterLogin', `/hub/invite/${token}`)
      navigate('/', { replace: true })
      return
    }

    attachToken()
    privateAPI.get(`/league/invite/${token}`)
      .then((r) => setState({ loading: false, ...r.data }))
      .catch((e) => setState({ loading: false, error: e.response?.data?.message || 'Could not load invitation' }))
  }, [token, navigate])

  const accept = async () => {
    if (!teamName.trim()) { setAsking(true); return }
    setBusy('accept'); attachToken()
    try {
      const r = await privateAPI.post('/league/invite/accept', { token, teamName: teamName.trim() })
      // The join issues a FRESH token whose payload makes the newly-joined team +
      // league the active one. If we ignore it (as before), a user who already had
      // an NFL team keeps their OLD token — so the dashboard still shows the old
      // team and "nothing happens". Adopt the new token, drop any stale invite
      // context, and HARD-reload so Redux re-initialises on the new league (a
      // SPA navigate would keep the stale currentLeague in state).
      const newToken = r?.data?.data?.token || r?.data?.token
      if (newToken) { localStorage.setItem('token', newToken); attachToken() }
      localStorage.removeItem('pendingInviteLeague')
      localStorage.removeItem('pendingInviteSport')
      localStorage.removeItem('AssignLeague')
      window.location.href = '/dashboard'
    } catch (e) { setState((s) => ({ ...s, error: e.response?.data?.message || 'Could not accept' })); setBusy('') }
  }
  const decline = async () => {
    setBusy('decline'); attachToken()
    try { await privateAPI.post('/league/invite/decline', { token }); navigate('/hub') }
    catch (e) { setState((s) => ({ ...s, error: e.response?.data?.message || 'Could not decline' })); setBusy('') }
  }

  const wrap = { minHeight: '100vh', background: '#0b0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  const card = { width: '100%', maxWidth: 460, background: '#0f131c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, color: '#e8ebf0' }
  const row = { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, gap: 12 }
  const btn = (p) => ({ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer', border: 'none', ...(p === 'accept' ? { background: '#22C55E', color: '#04240f' } : { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#c9d2e0' }) })
  const label = { color: '#8a93a6', flexShrink: 0 }
  const val = { fontWeight: 600, textAlign: 'right' }

  if (state.loading) return <div style={wrap}><div style={card}>Loading invitation…</div></div>
  if (state.error) return <div style={wrap}><div style={card}><div style={{ color: '#EF4444', fontWeight: 700 }}>{state.error}</div><button style={{ ...btn('decline'), marginTop: 16 }} onClick={() => navigate('/hub')}>Back to hub</button></div></div>

  const L = state.league || {}
  const resolved = state.alreadyResolved

  const Row = ({ k, children }) => (children ? <div style={row}><span style={label}>{k}</span><span style={val}>{children}</span></div> : null)

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: '#4a90d9', textTransform: 'uppercase', fontWeight: 700 }}>League Invitation</div>

        {/* The API has always returned a logo. Nothing ever rendered it. */}
        {L.logo ? (
          <img src={L.logo} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', margin: '12px 0 4px', display: 'block' }} />
        ) : null}

        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>{L.name}</h1>
        <div style={{ color: '#8a93a6', fontSize: 13, marginBottom: 16 }}>Invited by {state.invitedBy}</div>

        <Row k="Commissioner">{L.commissioner}</Row>
        <Row k="Type">{L.type}{L.private ? ' · Private' : ''}</Row>
        <Row k="Scoring">{L.scoringFormat}</Row>
        <Row k="Teams">{L.teams}</Row>

        {/* Entry requirements */}
        <Row k="Entry fee">{L.entryFee ? `${Number(L.entryFee).toLocaleString()} ${L.currency}` : 'Free to join'}</Row>
        <Row k="Prize pool">{L.prizePool ? `${Number(L.prizePool).toLocaleString()} ${L.currency}` : null}</Row>
        <Row k="Starting budget">{L.startingBudget ? `${Number(L.startingBudget).toLocaleString()} SP` : null}</Row>

        {/* Custom league settings — what you're actually signing up to */}
        <Row k="Roster">{pretty('rosterFormat', L.rosterFormat) || pretty('leagueMode', L.leagueMode)}</Row>
        <Row k="Draft">
          {[pretty('draftFormat', L.draftFormat), pretty('draftType', L.draftType)].filter(Boolean).join(' · ') || null}
        </Row>
        <Row k="Draft starts">{fmtDate(L.draftStart)}</Row>
        <Row k="Trade deadline">{L.tradeDeadlineWeek ? `Week ${L.tradeDeadlineWeek}` : null}</Row>

        {L.description ? <div style={{ marginTop: 14, fontSize: 13, color: '#aab2c2', lineHeight: 1.6 }}>{L.description}</div> : null}

        {resolved ? (
          <div style={{ marginTop: 20, color: '#8a93a6', fontSize: 14 }}>This invitation has already been {state.status}.</div>
        ) : (
          <>
            {(asking || teamName) && (
              <div style={{ marginTop: 18 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#8a93a6', marginBottom: 6 }}>Name your team</label>
                <input
                  autoFocus
                  style={{ width: '100%', boxSizing: 'border-box', background: '#141a26', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', color: '#fff', outline: 'none', fontSize: 14 }}
                  value={teamName}
                  placeholder="e.g. Krakow Hawks"
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') accept() }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button style={btn('decline')} disabled={!!busy} onClick={decline}>{busy === 'decline' ? 'Declining…' : 'Decline'}</button>
              <button style={btn('accept')} disabled={!!busy} onClick={accept}>
                {busy === 'accept' ? 'Joining…' : asking && !teamName.trim() ? 'Enter a team name' : 'Accept & Join'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
