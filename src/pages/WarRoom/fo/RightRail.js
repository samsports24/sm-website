import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { T } from './primitives'
import { getActiveVotes, getCommissionerInfo, getGovernanceHistory } from '../../../redux/actions/governanceActions'

/* RightRail — the persistent contextual column from target_front_office_design.png.
   Three stacked panels (Trophies cabinet, Exchange preview, Governance + Commissioner).
   Governance uses real redux data. The Trophies and Exchange previews have no
   dedicated real feed here, so they render clean empty states (never fabricated
   data) and deep-link to their full tabs via onTab, which are the source of truth. */

const panel = { background: 'linear-gradient(180deg,#0b0f18,#080b12)', border: `1px solid ${T.border}`, borderRadius: 16, padding: 16 }
const head = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }
const hIcon = (bg) => ({ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 })
const hTitle = { fontSize: 13, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: '#fff', lineHeight: 1.1 }
const hSub = { fontSize: 10.5, color: T.muted }
const goldBtn = { padding: '7px 0', borderRadius: 8, border: 'none', background: T.gold, color: '#0a0a0a', fontWeight: 800, fontSize: 11.5, cursor: 'pointer', width: '100%' }

/* ── Trophies ─────────────────────────────────────────────── */
function TrophyCabinet({ onTab }) {
  return (
    <div style={panel}>
      <div style={{ ...head, marginBottom: 6, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span aria-hidden style={hIcon('rgba(247,201,72,0.16)')}>🏆</span>
          <div><div style={hTitle}>Trophies</div><div style={hSub}>Celebrate your empire&apos;s legacy.</div></div>
        </div>
        <button onClick={() => onTab && onTab('trophies')} style={{ fontSize: 11, color: T.muted, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>All Sports ▾</button>
      </div>
      <div style={{ fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, margin: '8px 2px 8px' }}>Trophy Cabinet</div>
      <div onClick={() => onTab && onTab('trophies')} style={{ textAlign: 'center', padding: '20px 8px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border}` }}>
        <div aria-hidden style={{ fontSize: 26 }}>🏆</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.secondary, marginTop: 6 }}>No trophies yet</div>
        <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2 }}>Win titles to fill your cabinet.</div>
      </div>
    </div>
  )
}

/* ── Exchange ─────────────────────────────────────────────── */
const CHIPS = ['All Sports', 'NFL', 'Soccer', 'A.Football', 'Price', 'ROI', 'Newest', 'Trending']
function ExchangePreview({ onTab }) {
  return (
    <div style={panel}>
      <div style={head}>
        <span aria-hidden style={hIcon('rgba(139,92,246,0.16)')}>💠</span>
        <div><div style={hTitle}>Exchange</div><div style={hSub}>Acquire. Trade. Dominate.</div></div>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
        {CHIPS.map((c, i) => (
          <button key={c} onClick={() => onTab && onTab('exchange')} style={{ flex: '0 0 auto', fontSize: 10.5, fontWeight: 700, padding: '5px 10px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap', border: `1px solid ${i === 0 ? T.gold : T.border}`, background: i === 0 ? 'rgba(247,201,72,0.12)' : 'transparent', color: i === 0 ? T.gold : T.muted }}>{c}</button>
        ))}
      </div>
      <div onClick={() => onTab && onTab('exchange')} style={{ textAlign: 'center', padding: '22px 8px', borderRadius: 12, cursor: 'pointer', background: '#0a0e17', border: `1px solid ${T.border}` }}>
        <div aria-hidden style={{ fontSize: 24 }}>💠</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.secondary, marginTop: 6 }}>No listings yet</div>
        <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2, marginBottom: 10 }}>Open the Exchange to browse the market.</div>
        <button onClick={() => onTab && onTab('exchange')} style={{ ...goldBtn, width: 'auto', padding: '6px 14px' }}>Go to Exchange</button>
      </div>
    </div>
  )
}

/* ── Governance + Commissioner (real data) ────────────────── */
const govTimeLeft = (deadline) => {
  if (!deadline) return ''
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return 'Ended'
  const hrs = Math.floor(diff / 3600000)
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hrs}h ${mins}m`
}
const govVoteTitle = (v) => {
  if (v.voteType === 'custom_proposal') return v.title || 'League Proposal'
  if (v.voteType === 'no_confidence') return 'Vote of No Confidence'
  if (v.voteType === 'league_pause') return 'League Pause Vote'
  if (v.voteType === 'commissioner_election') return 'Commissioner Election'
  return v.title || 'League Vote'
}
const govVoteSub = (v) => {
  if (v.voteType === 'custom_proposal') return v.description || 'Yes / no league vote'
  if (v.voteType === 'no_confidence') return 'Remove the current commissioner'
  if (v.voteType === 'league_pause') return 'Pause league activity'
  if (v.voteType === 'commissioner_election') return 'Elect a new commissioner'
  return ''
}

function GovernancePreview({ onTab }) {
  const dispatch = useDispatch()
  const league = useSelector((s) => s.league?.currentLeague || s.user?.userDetails?.team?.currentLeague)
  const { activeVotes, history, commissionerInfo } = useSelector((s) => s.governance || {})
  const leagueId = league?._id || league

  useEffect(() => {
    if (leagueId) {
      dispatch(getActiveVotes(leagueId))
      dispatch(getCommissionerInfo(leagueId))
      dispatch(getGovernanceHistory(leagueId))
    }
  }, [leagueId, dispatch])

  const votes = (activeVotes || [])
    .filter((v) => v.status === 'active' || v.status === 'nomination_phase' || v.status === 'election_active')
    .slice(0, 3)

  // Real commissioner stats
  const created = (activeVotes?.length || 0) + (history?.length || 0)
  const resolved = (history || []).filter((h) => ['executed', 'election_complete', 'failed', 'expired'].includes(h.status))
  const passed = (history || []).filter((h) => h.status === 'executed' || h.status === 'election_complete' || h.result?.passed).length
  const rate = resolved.length ? `${Math.round((passed / resolved.length) * 100)}%` : '—'

  const commAI = commissionerInfo?.aiCommissionerActive
  const comm = commissionerInfo?.mainCommissioner
  const commName = commAI ? 'AI Commissioner' : (comm ? `${comm.firstName || comm.userName || ''} ${comm.lastName || ''}`.trim() || 'Commissioner' : null)

  return (
    <div style={panel}>
      <div style={head}>
        <span aria-hidden style={hIcon('rgba(59,130,246,0.16)')}>🏛️</span>
        <div><div style={hTitle}>Governance</div><div style={hSub}>Lead your league. Shape the future.</div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderBottom: `1px solid ${T.border}`, paddingBottom: 8, marginBottom: 12 }}>
        <span style={{ color: T.gold, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `2px solid ${T.gold}`, paddingBottom: 8, marginBottom: -9 }}>Active Votes</span>
        <button onClick={() => onTab && onTab('governance')} style={{ fontSize: 10.5, fontWeight: 700, color: T.green, background: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>+ New Vote</button>
      </div>

      {votes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 8px', background: '#0a0e17', border: `1px solid ${T.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🗳️</div>
          <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 10 }}>No active votes right now</div>
          <button onClick={() => onTab && onTab('governance')} style={{ ...goldBtn, width: 'auto', padding: '6px 14px' }}>Create a Vote</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {votes.map((v) => {
            const yes = v.votes?.filter((x) => x.vote === 'yes').length || 0
            const no = v.votes?.filter((x) => x.vote === 'no').length || 0
            const pct = yes + no > 0 ? Math.round((yes / (yes + no)) * 100) : 0
            const c = pct >= 66 ? T.green : pct >= 50 ? T.gold : T.purple
            return (
              <div key={v._id} style={{ background: '#0a0e17', border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#fff' }}>{govVoteTitle(v)}</div>
                  <div className="fo-num" style={{ fontSize: 12.5, fontWeight: 700, color: c }}>{pct}%</div>
                </div>
                <div style={{ fontSize: 10.5, color: T.muted, margin: '2px 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{govVoteSub(v)}</div>
                <div style={{ height: 6, borderRadius: 4, background: '#151f31', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: c }} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, margin: '6px 0 8px' }}>
                  <span style={{ color: T.green }}>{yes} Votes For</span><span style={{ color: T.red }}>{no} Votes Against</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9.5, color: T.muted }}>Ends in {govTimeLeft(v.votingClosesAt)}</span>
                  <button onClick={() => onTab && onTab('governance')} style={{ ...goldBtn, width: 'auto', padding: '6px 14px' }}>Vote Now</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Commissioner */}
      {commName && (
        <div style={{ marginTop: 12, background: '#0a0e17', border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Commissioner</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#16A34A,#0f7a37)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{commName.charAt(0).toUpperCase()}</span>
            <div><div style={{ fontSize: 12.5, fontWeight: 800, color: '#fff' }}>{commName}</div><div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, padding: '2px 8px', background: 'rgba(217,170,0,0.15)', border: '1px solid rgba(217,170,0,0.35)', borderRadius: 999, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: '#e8c400', lineHeight: 1.4 }}><img src={`${process.env.PUBLIC_URL || ''}/assets/commissioner-badge.png`} alt="" aria-hidden style={{ height: 15, width: 15, objectFit: 'contain', borderRadius: 3 }} />{commAI ? 'AI Commissioner' : 'Commissioner'}</div></div>
          </div>
          {[['Total Votes Created', created], ['Votes Passed', passed], ['Approval Rate', rate]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0' }}>
              <span style={{ color: T.muted }}>{k}</span><span className="fo-num" style={{ color: '#fff', fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <button onClick={() => onTab && onTab('governance')} style={{ ...goldBtn, marginTop: 10 }}>Manage Governance</button>
        </div>
      )}
    </div>
  )
}

export default function RightRail({ onTab }) {
  return (
    <aside className="fo-rail fo-anim">
      <TrophyCabinet onTab={onTab} />
      <ExchangePreview onTab={onTab} />
      <GovernancePreview onTab={onTab} />
    </aside>
  )
}
