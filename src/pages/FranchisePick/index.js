import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { notification, Spin, Empty } from 'antd'
import { privateAPI, attachToken } from '../../config/constants'

/**
 * NFL FRANCHISE PICK
 *
 * A manager picks one real NFL franchise and that is the whole of his team
 * management. His score is what that franchise's players actually did, week by
 * week, on the SAM Metric the rest of the product already uses.
 *
 * Two things only: the board, and the table. There is no roster to manage, so
 * there is nothing else to build.
 */

const CONFS = ['AFC', 'NFC']
const DIVS = ['East', 'North', 'South', 'West']

const money = (n) => (Number(n) || 0).toFixed(1)

export default function FranchisePick() {
  // Two places hold "the league you are in" and they do not always agree —
  // state.league is set by the league screens, user.team.currentLeague by the
  // auth refresh. Straight after creating a league only the second one is
  // populated, and reading just the first showed "Pick a league first" on the
  // very screen the user was sent to. Take whichever is there.
  const { currentLeague } = useSelector((state) => state.league || {})
  const userLeague = useSelector((state) => state.user?.userDetails?.team?.currentLeague)
  const picked = (currentLeague && !Array.isArray(currentLeague) ? currentLeague : null) || userLeague
  const leagueId = picked?._id || picked?.id || null

  const [tab, setTab] = useState('board')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [board, setBoard] = useState(null)
  const [table, setTable] = useState(null)
  const [mine, setMine] = useState(null)

  const load = useCallback(async () => {
    if (!leagueId) { setLoading(false); return }
    setLoading(true)
    try {
      attachToken()
      const [b, s, me] = await Promise.all([
        privateAPI.get(`/franchise-pick/teams/${leagueId}`),
        privateAPI.get(`/franchise-pick/standings/${leagueId}`),
        privateAPI.get(`/franchise-pick/me/${leagueId}`),
      ])
      setBoard(b.data?.data || null)
      setTable(s.data?.data || null)
      setMine(me.data?.data || null)
    } catch (e) {
      notification.error({
        message: e?.response?.data?.message || 'Could not load the franchise board',
        duration: 3,
      })
    }
    setLoading(false)
  }, [leagueId])

  useEffect(() => { load() }, [load])

  const claim = async (team) => {
    setBusy(team)
    try {
      attachToken()
      const r = await privateAPI.post('/franchise-pick/claim', { leagueId, team })
      notification.success({ message: r.data?.data?.message || 'Franchise claimed', duration: 3 })
      await load()
    } catch (e) {
      // A 409 here is the normal case in a race, not an error worth shouting
      // about: somebody else got there first and the board is already stale.
      notification.warning({
        message: e?.response?.data?.message || 'Could not claim that franchise',
        duration: 4,
      })
      await load()
    }
    setBusy(null)
  }

  const randomAssign = async () => {
    setBusy('__random')
    try {
      attachToken()
      const r = await privateAPI.post(`/franchise-pick/random/${leagueId}`)
      notification.success({ message: r.data?.data?.message || 'Assigned', duration: 4 })
      await load()
    } catch (e) {
      notification.error({ message: e?.response?.data?.message || 'Could not assign', duration: 4 })
    }
    setBusy(null)
  }

  const grouped = useMemo(() => {
    const out = {}
    for (const t of board?.teams || []) {
      const k = `${t.conference} ${t.division}`
      ;(out[k] = out[k] || []).push(t)
    }
    return out
  }, [board])

  if (!leagueId) {
    return <Shell><Empty description="Pick a league first" /></Shell>
  }
  if (loading) {
    return <Shell><div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div></Shell>
  }

  const mode = board?.pickMode || 'first_come'
  const canClaim = mode === 'first_come' && !board?.yourTeam

  return (
    <Shell>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#fff' }}>Franchise Pick</h1>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
          One club. Its week is your week.
        </span>
      </div>

      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 18 }}>
        {board?.league?.name} · season {board?.league?.season} ·{' '}
        {mode === 'first_come' ? 'first come, first served'
          : mode === 'random' ? 'franchises are assigned at random'
          : 'franchises go to auction'}
      </div>

      {board?.yourTeam ? (
        <YourFranchise mine={mine} board={board} />
      ) : (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 18,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#86EFAC', fontSize: 13,
        }}>
          {mode === 'first_come'
            ? 'You have not picked yet. Take one below — first come, first served.'
            : mode === 'random'
              ? 'You have not been assigned a franchise yet. Your commissioner runs the draw.'
              : 'Franchises in this league go to auction.'}
        </div>
      )}

      {board?.isCommissioner && mode === 'random' && (
        <button
          onClick={randomAssign}
          disabled={busy === '__random'}
          style={btn(true)}
        >
          {busy === '__random' ? 'Assigning…' : 'Assign franchises at random'}
        </button>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '22px 0 16px' }}>
        {[['board', 'The board'], ['table', 'Standings']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={tabBtn(tab === k)}>{label}</button>
        ))}
      </div>

      {tab === 'board' ? (
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {CONFS.flatMap((c) => DIVS.map((d) => {
            const key = `${c} ${d}`
            const teams = grouped[key] || []
            if (!teams.length) return null
            return (
              <div key={key} style={card()}>
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 1,
                  color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase',
                }}>{key}</div>
                {teams.map((t) => (
                  <TeamRow
                    key={t.team}
                    t={t}
                    canClaim={canClaim}
                    busy={busy === t.team}
                    onClaim={() => claim(t.team)}
                  />
                ))}
              </div>
            )
          }))}
        </div>
      ) : (
        <Standings table={table} />
      )}
    </Shell>
  )
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

const Shell = ({ children }) => (
  <div style={{ padding: '40px 20px', minHeight: '100vh' }}>{children}</div>
)

const card = () => ({
  background: 'rgba(20,28,45,0.6)',
  border: '1px solid rgba(110,105,128,0.18)',
  borderRadius: 12,
  padding: 14,
})

const btn = (primary) => ({
  padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  border: primary ? '1px solid rgba(34,197,94,0.45)' : '1px solid rgba(255,255,255,0.18)',
  background: primary ? 'rgba(34,197,94,0.16)' : 'transparent',
  color: primary ? '#4ADE80' : 'rgba(255,255,255,0.7)',
})

const tabBtn = (active) => ({
  padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  border: `1px solid ${active ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.14)'}`,
  background: active ? 'rgba(34,197,94,0.16)' : 'transparent',
  color: active ? '#4ADE80' : 'rgba(255,255,255,0.6)',
})

const TeamRow = ({ t, canClaim, busy, onClaim }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    opacity: t.taken && !t.isYours ? 0.55 : 1,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 13, fontWeight: 700,
        color: t.isYours ? '#4ADE80' : '#fff',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {t.teamName}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
        {t.isYours ? 'yours' : t.owner ? t.owner.name : 'free'}
      </div>
    </div>
    {!t.taken && canClaim && (
      <button onClick={onClaim} disabled={busy} style={btn(true)}>
        {busy ? '…' : 'Take'}
      </button>
    )}
  </div>
)

const YourFranchise = ({ mine, board }) => {
  const weeks = mine?.weeks || []
  return (
    <div style={{ ...card(), marginBottom: 18, borderColor: 'rgba(34,197,94,0.35)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#4ADE80' }}>
          {mine?.pick?.teamName || board?.yourTeam}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          {money(mine?.total)} pts this season
          {mine?.pick?.acquiredVia ? ` · ${String(mine.pick.acquiredVia).replace('_', ' ')}` : ''}
        </div>
      </div>
      {weeks.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {weeks.map((w) => (
            <div key={w.week} style={{
              padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center', minWidth: 58,
            }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>WK {w.week}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{money(w.score)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Standings = ({ table }) => {
  const rows = table?.rows || []
  if (!rows.length) return <Empty description="No scores yet" />
  return (
    <div style={card()}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
        Every NFL franchise, owned or not — so your pick is measured against the
        league rather than against the managers who happen to be in yours.
      </div>
      {rows.map((r) => (
        <div key={r.team} style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 120px 90px',
          alignItems: 'center', gap: 10, padding: '9px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: r.isYours ? 'rgba(34,197,94,0.07)' : 'transparent',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>{r.rank}</span>
          <span style={{
            color: r.isYours ? '#4ADE80' : '#fff', fontWeight: 700, fontSize: 13,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{r.teamName}</span>
          <span style={{
            fontSize: 12, color: 'rgba(255,255,255,0.45)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{r.owner ? r.owner.name : '—'}</span>
          <span style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: '#fff' }}>
            {money(r.total)}
          </span>
        </div>
      ))}
    </div>
  )
}
