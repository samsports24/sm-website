import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { attachToken, privateAPI } from '../../config/constants'
import { getPostseasonState } from '../../redux/actions/postseasonAction'
import TeamLogo from '../../components/TeamLogo'

/* ══════════════════════════════════════════════════════════
   PLAYOFF STANDINGS — 14-team single elimination.
   Real postseason data only. Rows are the qualified seeds
   (top 7 per conference); non-qualifying/eliminated teams and
   Points Against fill in when the full standings feed exists.
   ══════════════════════════════════════════════════════════ */

const C = {
  bg: '#0a0e1a', panel: 'rgba(19,26,43,0.7)', border: 'rgba(120,140,180,0.14)', borderSoft: 'rgba(120,140,180,0.08)',
  ivory: '#E8EDF5', muted: '#69748B', dim: '#8892A6', green: '#4ADE80', red: '#FF5C5C', gold: '#F7C948',
  c1: '#A855F7', c2: '#3B82F6',
}
const COLS = '34px minmax(0,1fr) 74px 74px 74px 118px 58px'

const PlayoffStandings = () => {
  const navigate = useNavigate()
  const { state: ps } = useSelector((s) => s.postseason || {})
  const [full, setFull] = useState(null) // full conference standings (record, PF, PA)

  useEffect(() => {
    getPostseasonState()
    attachToken()
    privateAPI.get('/postseason/conference-standings')
      .then((r) => { const d = r?.data?.data ?? r?.data; if (d && (d.conf1?.length || d.conf2?.length)) setFull(d) })
      .catch(() => {})
  }, [])

  const fmt = (n) => (n || n === 0) ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'

  const rows = useMemo(() => {
    // Prefer the full standings feed (all teams, real PF/PA). Fall back to the
    // qualified seeds from the postseason state when the feed is empty.
    if (full) {
      const map = (arr) => (arr || []).map((t) => ({
        seed: t.rank, name: t.name || t.abbreviation || null, logo: t.logo,
        record: `${t.wins || 0}-${t.losses || 0}`, pf: fmt(t.pointsFor), pa: fmt(t.pointsAgainst),
        eliminated: !!t.eliminated,
      }))
      return { 1: map(full.conf1), 2: map(full.conf2) }
    }
    const build = (cn) => (ps?.qualifiedTeams || [])
      .filter((t) => t.conference === cn)
      .sort((a, b) => a.seed - b.seed)
      .map((t) => ({
        seed: t.seed,
        name: t.team?.name || t.team?.abbreviation || null,
        logo: t.team?.logo,
        record: `${t.regSeasonWins || 0}-${t.regSeasonLosses || 0}`,
        pf: fmt(t.regSeasonPointsFor),
        pa: null,
        eliminated: !!t.isEliminated,
      }))
    return { 1: build(1), 2: build(2) }
  }, [ps, full])

  const typeOf = (seed) => (seed === 1 ? { k: 'BYE', label: 'Top Seed', c: C.c1 } : seed <= 4 ? { k: 'DIV', label: `Seed ${seed}`, c: C.c2 } : { k: 'WC', label: 'Wild Card', c: C.red })

  const Table = ({ cn }) => {
    const accent = cn === 1 ? C.c1 : C.c2
    const list = rows[cn]
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px 12px' }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: `${accent}22`, border: `1px solid ${accent}66`, color: accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>S</span>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, color: accent }}>CONFERENCE {cn}</span>
        </div>
        {/* head */}
        <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 8, padding: '6px 18px', color: C.muted, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', borderBottom: `1px solid ${C.borderSoft}` }}>
          <span>#</span><span>Team</span><span style={{ textAlign: 'center' }}>Record</span><span style={{ textAlign: 'center' }}>PF</span><span style={{ textAlign: 'center' }}>PA</span><span>Type</span><span style={{ textAlign: 'center' }}>Status</span>
        </div>
        {list.length ? list.map((t, i) => {
          const ty = typeOf(t.seed)
          return (
            <React.Fragment key={t.seed}>
              {i === 7 && list.length > 7 && <div style={{ padding: '5px 18px', fontSize: 9.5, letterSpacing: 1, color: C.red, textTransform: 'uppercase', textAlign: 'center', background: 'rgba(255,92,92,0.06)' }}>— Playoff Line · Top 7 Advance —</div>}
              <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 8, alignItems: 'center', padding: '9px 18px', borderBottom: `1px solid ${C.borderSoft}`, background: t.seed === 1 ? `${accent}12` : (t.eliminated ? 'transparent' : 'transparent'), opacity: t.eliminated ? 0.55 : 1 }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: `${accent}22`, color: accent, fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{t.seed}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: '#0d1526', border: `1px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <TeamLogo team={t} teamColor={accent} size={26} round={false} style={{ width: '100%', height: '100%' }} />
                  </span>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13.5, color: t.name ? C.ivory : C.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name || 'TBD'}</span>
                </span>
                <span style={{ textAlign: 'center', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: C.ivory }}>{t.record}</span>
                <span style={{ textAlign: 'center', fontSize: 12.5, color: C.dim }}>{t.pf}</span>
                <span style={{ textAlign: 'center', fontSize: 12.5, color: C.muted }}>{t.pa || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  {t.seed <= 7 ? (
                    <>
                      <span style={{ background: `${ty.c}22`, color: ty.c, border: `1px solid ${ty.c}55`, borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 800 }}>{ty.k}</span>
                      <span style={{ fontSize: 10.5, color: C.muted, whiteSpace: 'nowrap' }}>{ty.label}</span>
                    </>
                  ) : <span style={{ fontSize: 11, color: C.muted }}>—</span>}
                </span>
                <span style={{ textAlign: 'center' }}>{t.eliminated ? <span style={{ color: C.red, fontSize: 15 }}>○</span> : <span style={{ color: C.green, fontSize: 15, fontWeight: 800 }}>✕</span>}</span>
              </div>
            </React.Fragment>
          )
        }) : <div style={{ padding: '26px 18px', textAlign: 'center', color: C.muted, fontSize: 12.5 }}>Seeding is set when the regular season ends.</div>}
      </div>
    )
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '20px 28px 40px', maxWidth: 1720, margin: '0 auto', color: C.ivory }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 32, margin: 0, letterSpacing: 0.5 }}>PLAYOFF STANDINGS</h1>
            <div style={{ color: C.muted, fontSize: 13.5, marginTop: 4 }}>14‑Team Single Elimination · Week {ps?.currentWeek || 19} (Wild Card Week)</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
              <div style={{ color: C.dim }}><span style={{ color: C.green, fontWeight: 800 }}>✕</span> Clinched Playoff Spot</div>
              <div style={{ color: C.dim, marginTop: 4 }}><span style={{ color: C.red }}>○</span> Eliminated</div>
            </div>
            <button onClick={() => navigate('/playoff-bracket')} style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: C.c2, color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 0.5, cursor: 'pointer' }}>⌗ VIEW BRACKET</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 18 }}>
          <Table cn={1} />
          <Table cn={2} />
        </div>

        <div style={{ textAlign: 'center', color: C.muted, fontSize: 11.5, marginTop: 14 }}>Ranked by record then Points For · Top 7 in each conference make the playoffs.</div>
      </div>
    </div>
  )
}

export default PlayoffStandings
