import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { privateAPI, attachToken } from '../../config/constants'

// League invitation review — shows league details and lets an existing user
// Accept or Decline. Opened from the notification bell or the email link.
export default function InviteReview() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true })
  const [busy, setBusy] = useState('')

  useEffect(() => {
    attachToken()
    privateAPI.get(`/league/invite/${token}`)
      .then((r) => setState({ loading: false, ...r.data }))
      .catch((e) => setState({ loading: false, error: e.response?.data?.message || 'Could not load invitation' }))
  }, [token])

  const accept = async () => {
    setBusy('accept'); attachToken()
    try {
      await privateAPI.post('/league/invite/accept', { token })
      navigate('/dashboard')
    } catch (e) { setState((s) => ({ ...s, error: e.response?.data?.message || 'Could not accept' })); setBusy('') }
  }
  const decline = async () => {
    setBusy('decline'); attachToken()
    try { await privateAPI.post('/league/invite/decline', { token }); navigate('/hub') }
    catch (e) { setState((s) => ({ ...s, error: e.response?.data?.message || 'Could not decline' })); setBusy('') }
  }

  const wrap = { minHeight: '100vh', background: '#0b0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  const card = { width: '100%', maxWidth: 460, background: '#0f131c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, color: '#e8ebf0' }
  const row = { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14 }
  const btn = (p) => ({ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer', border: 'none', ...(p === 'accept' ? { background: '#22C55E', color: '#04240f' } : { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#c9d2e0' }) })

  if (state.loading) return <div style={wrap}><div style={card}>Loading invitation…</div></div>
  if (state.error) return <div style={wrap}><div style={card}><div style={{ color: '#EF4444', fontWeight: 700 }}>{state.error}</div><button style={{ ...btn('decline'), marginTop: 16 }} onClick={() => navigate('/hub')}>Back to hub</button></div></div>

  const L = state.league || {}
  const resolved = state.alreadyResolved

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: '#4a90d9', textTransform: 'uppercase', fontWeight: 700 }}>League Invitation</div>
        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>{L.name}</h1>
        <div style={{ color: '#8a93a6', fontSize: 13, marginBottom: 16 }}>Invited by {state.invitedBy}</div>

        <div style={row}><span style={{ color: '#8a93a6' }}>Commissioner</span><span style={{ fontWeight: 600 }}>{L.commissioner}</span></div>
        <div style={row}><span style={{ color: '#8a93a6' }}>Type</span><span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{L.type}{L.private ? ' · Private' : ''}</span></div>
        <div style={row}><span style={{ color: '#8a93a6' }}>Scoring</span><span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{L.scoringFormat}</span></div>
        {L.teams ? <div style={row}><span style={{ color: '#8a93a6' }}>Teams</span><span style={{ fontWeight: 600 }}>{L.teams}</span></div> : null}
        {L.entryFee ? <div style={row}><span style={{ color: '#8a93a6' }}>Entry fee</span><span style={{ fontWeight: 600 }}>{L.entryFee.toLocaleString()} {L.currency}</span></div> : null}
        {L.prizePool ? <div style={row}><span style={{ color: '#8a93a6' }}>Prize pool</span><span style={{ fontWeight: 600 }}>{L.prizePool.toLocaleString()} {L.currency}</span></div> : null}
        {L.description ? <div style={{ marginTop: 14, fontSize: 13, color: '#aab2c2', lineHeight: 1.6 }}>{L.description}</div> : null}

        {resolved
          ? <div style={{ marginTop: 20, color: '#8a93a6', fontSize: 14 }}>This invitation has already been {state.status}.</div>
          : (
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button style={btn('decline')} disabled={!!busy} onClick={decline}>{busy === 'decline' ? 'Declining…' : 'Decline'}</button>
              <button style={btn('accept')} disabled={!!busy} onClick={accept}>{busy === 'accept' ? 'Joining…' : 'Accept & Join'}</button>
            </div>
          )}
      </div>
    </div>
  )
}
