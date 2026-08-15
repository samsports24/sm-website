import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { getPostseasonState } from '../../redux/actions/postseasonAction'
import Trophy from '../../assets/sambowl-xxvii.png'
import TeamLogo from '../../components/TeamLogo'

/* ══════════════════════════════════════════════════════════
   PLAYOFF BRACKET — Dynasty 32.
   14 teams (7 per conference) · #1 seed First-Round Bye ·
   Re-seeded after Wild Card · Pro Bowl bye Week 22 · Champions crowned Week 23.
   Real data only — no placeholders. Slots read TBD until the
   postseason bracket is seeded.
   ══════════════════════════════════════════════════════════ */

const C = {
  bg: '#0a0e1a', panel: 'rgba(19,26,43,0.66)', border: 'rgba(120,140,180,0.14)', borderSoft: 'rgba(120,140,180,0.10)',
  ivory: '#E8EDF5', muted: '#69748B', dim: '#8892A6', green: '#4ADE80', teal: '#2DD4BF', gold: '#F7C948',
  c1: '#A855F7', c2: '#3B82F6',
}
const glow = (c, a = 0.4) => `0 0 16px ${c}${Math.round(a * 255).toString(16).padStart(2, '0')}`
const card = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 }

const TABS = [
  { wk: 'Week 19', label: 'Wild Card' },
  { wk: 'Week 20', label: 'Divisional' },
  { wk: 'Week 21', label: 'Conf Finals' },
  { wk: 'Week 22', label: 'Pro Bowl · Bye' },
  { wk: 'Week 23', label: 'Sam Bowl XXVII' },
]

const Crest = ({ team, accent, size = 26 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, flexShrink: 0, background: '#0d1526', border: `1.5px solid ${team?.name ? accent + '66' : 'rgba(120,140,180,0.22)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <TeamLogo team={team} teamColor={accent} size={size} round={false} style={{ width: '100%', height: '100%' }} />
  </div>
)

const PlayoffBracket = () => {
  const navigate = useNavigate()
  const { state: ps } = useSelector((s) => s.postseason || {})
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  useEffect(() => { getPostseasonState() }, [])
  useEffect(() => { const on = () => setVw(window.innerWidth); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])
  const narrow = vw < 1200

  const season = ps?.season || 27
  const roman = (n) => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let o = ''; m.forEach(([v, s]) => { while (n >= v) { o += s; n -= v } }); return o }

  const hasData = !!(ps?.qualifiedTeams && ps.qualifiedTeams.length)

  // 7 seed slots per conference. Real teams fill in; unfilled slots stay TBD.
  const seeds = useMemo(() => {
    const build = (cn) => {
      const map = {}
      ;(ps?.qualifiedTeams || []).filter((t) => t.conference === cn).forEach((t) => {
        map[t.seed] = { seed: t.seed, name: t.team?.name || t.team?.abbreviation || null, logo: t.team?.logo, record: `${t.regSeasonWins || 0}-${t.regSeasonLosses || 0}` }
      })
      return Array.from({ length: 7 }, (_, i) => map[i + 1] || { seed: i + 1, name: null, record: null })
    }
    return { 1: build(1), 2: build(2) }
  }, [ps])
  const bySeed = (cn, s) => seeds[cn].find((x) => x.seed === s) || { seed: s, name: null, record: null }
  const accentOf = (cn) => (cn === 1 ? C.c1 : C.c2)

  // League leaders — computed from real regular-season figures only.
  const leaders = useMemo(() => {
    const all = ps?.qualifiedTeams || []
    if (!all.length) return []
    const out = []
    const byPF = [...all].sort((a, b) => (b.regSeasonPointsFor || 0) - (a.regSeasonPointsFor || 0))[0]
    const byW = [...all].sort((a, b) => (b.regSeasonWins || 0) - (a.regSeasonWins || 0))[0]
    if (byPF?.regSeasonPointsFor) out.push({ icon: '🎯', label: 'Most Points For', name: byPF.team?.name, val: Number(byPF.regSeasonPointsFor).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), c: C.c1 })
    if (byW?.regSeasonWins) out.push({ icon: '🏆', label: 'Most Wins', name: byW.team?.name, val: String(byW.regSeasonWins), c: C.green })
    return out
  }, [ps])

  const SeedRow = ({ t, accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px' }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}1f`, border: `1px solid ${accent}55`, color: accent, fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.seed}</span>
      <Crest team={t} accent={accent} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: t.name ? C.ivory : C.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name || 'TBD'}</div>
        {t.record && <div style={{ fontSize: 10.5, color: C.muted }}>{t.record}</div>}
      </div>
    </div>
  )
  const WCMatch = ({ home, away, accent }) => (
    <div style={{ ...card, border: `1px solid ${accent}3a`, overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
      <SeedRow t={home} accent={accent} />
      <div style={{ height: 1, background: C.borderSoft }} />
      <SeedRow t={away} accent={accent} />
    </div>
  )
  const WildCardCol = ({ cn }) => {
    const a = accentOf(cn)
    return (
      <div style={{ minWidth: 176, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 1, color: a, textShadow: glow(a, 0.3), textAlign: 'center' }}>WILD CARD ROUND</div>
        <WCMatch home={bySeed(cn, 2)} away={bySeed(cn, 7)} accent={a} />
        <WCMatch home={bySeed(cn, 3)} away={bySeed(cn, 6)} accent={a} />
        <WCMatch home={bySeed(cn, 4)} away={bySeed(cn, 5)} accent={a} />
      </div>
    )
  }
  const DivisionalCol = ({ cn }) => {
    const a = accentOf(cn); const top = bySeed(cn, 1)
    return (
      <div style={{ minWidth: 158, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 1, color: a, textShadow: glow(a, 0.3), textAlign: 'center' }}>DIVISIONAL ROUND</div>
        <div style={{ ...card, border: `1px solid ${a}44`, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 15, color: top.name ? C.ivory : C.dim }}>{top.name || 'TBD'}</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>(1 Seed)</div>
          <div style={{ fontSize: 10, letterSpacing: 0.5, color: a, fontWeight: 700 }}>HOSTS · WAITING FOR</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: C.ivory }}>Lowest WC seed</div>
        </div>
        <div style={{ ...card, border: `1px solid ${a}44`, padding: 14, textAlign: 'center', color: C.dim, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12.5, lineHeight: 1.7 }}>
          <div style={{ fontSize: 9, color: a, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>RE-SEEDED</div>
          WC Winner<div style={{ color: C.muted, fontSize: 11 }}>VS</div>WC Winner
        </div>
      </div>
    )
  }
  const ConfFinalsCol = ({ cn }) => {
    const a = accentOf(cn)
    return (
      <div style={{ minWidth: 148, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 1, color: a, textShadow: glow(a, 0.3), textAlign: 'center' }}>CONFERENCE FINALS</div>
        <div style={{ ...card, background: 'rgba(11,15,26,0.72)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', border: `1px solid ${a}55`, padding: 14, textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: C.dim }}>Divisional Winner</div>
          <div style={{ color: C.muted, fontSize: 11, margin: '5px 0' }}>VS</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: C.dim }}>Divisional Winner</div>
          <div style={{ height: 1, background: C.borderSoft, margin: '10px 0' }} />
          <div style={{ fontSize: 10, color: a, fontWeight: 800, letterSpacing: 0.5 }}>WINNER → SAM BOWL</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Highest seed hosts</div>
        </div>
      </div>
    )
  }
  const TopSeed = ({ cn }) => {
    const a = accentOf(cn); const t = bySeed(cn, 1)
    return (
      <div style={{ ...card, border: `1.5px solid ${a}66`, padding: 16, boxShadow: `${glow(a, 0.25)}, 0 10px 30px rgba(0,0,0,0.4)`, maxWidth: 320 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${a}22`, border: `1px solid ${a}55`, color: a, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 800, marginBottom: 12 }}>★ TOP SEED</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Crest team={t} accent={a} size={42} />
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 18, color: t.name ? C.ivory : C.dim }}>#1 {t.name || 'TBD'}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{t.record || 'Seeding pending'}</div>
          </div>
        </div>
        <div style={{ height: 1, background: C.borderSoft, margin: '14px 0 10px' }} />
        <div style={{ color: C.green, fontSize: 12.5, fontWeight: 700 }}>✓ FIRST ROUND BYE</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Hosts Divisional Round</div>
      </div>
    )
  }

  const FORMAT = [
    { icon: '👥', title: '14 Teams', sub: '7 teams per conference' },
    { icon: '⚔️', title: '2 Wild Card', sub: 'Round 7 vs 2, 6 vs 3, 5 vs 4' },
    { icon: '🏆', title: 'Divisional Round', sub: 'Re-seeded after Wild Card' },
    { icon: '🎖️', title: 'Conference Finals', sub: 'Highest remaining seed hosts' },
    { icon: '🛡️', title: 'Sam Bowl', sub: 'Champions crowned in Week 23' },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: narrow ? '16px' : '20px 28px 40px', maxWidth: 1780, margin: '0 auto', color: C.ivory }}>

        {/* ── top zone: top-seed · title/tabs · top-seed ── */}
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '320px 1fr 320px', gap: 18, alignItems: 'start', marginBottom: 20 }}>
          <div style={{ order: narrow ? 2 : 0 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, color: C.c1, textShadow: glow(C.c1, 0.3), marginBottom: 10 }}>CONFERENCE 1</div>
            <TopSeed cn={1} />
          </div>
          <div style={{ order: narrow ? 1 : 0, textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: narrow ? 34 : 44, margin: 0, letterSpacing: 2, background: 'linear-gradient(92deg,#fff,#c9d3e6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PLAYOFFS</h1>
            <div style={{ color: C.muted, fontSize: 13, letterSpacing: 0.5, marginBottom: 14 }}>Dynasty 32 Team League · Season {season}</div>
            <div style={{ ...card, display: 'inline-flex', padding: 4, gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {TABS.map((t, i) => (
                <div key={t.wk} style={{ padding: '8px 16px', borderRadius: 9, textAlign: 'center', minWidth: 96, background: i === 0 ? `${C.green}18` : 'transparent', borderBottom: i === 0 ? `2px solid ${C.green}` : '2px solid transparent' }}>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12.5, color: i === 0 ? C.green : C.ivory }}>{t.wk}</div>
                  <div style={{ fontSize: 9.5, letterSpacing: 0.5, color: C.muted, textTransform: 'uppercase' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ order: narrow ? 3 : 0, textAlign: narrow ? 'left' : 'right' }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, color: C.c2, textShadow: glow(C.c2, 0.3), marginBottom: 10 }}>CONFERENCE 2</div>
            <div style={{ display: 'inline-block', textAlign: 'left' }}><TopSeed cn={2} /></div>
          </div>
        </div>

        {/* ── bracket zone ── */}
        <div style={{ ...card, position: 'relative', overflow: 'hidden', padding: narrow ? 14 : 22, marginBottom: 20, minHeight: 460 }}>
          {/* big trophy — melts into the bracket zone as a backdrop */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <img src={Trophy} alt="" style={{ width: narrow ? '94%' : '50%', maxWidth: 700, objectFit: 'contain', opacity: 0.72, WebkitMaskImage: 'radial-gradient(56% 60% at 50% 44%, #000 44%, transparent 100%)', maskImage: 'radial-gradient(56% 60% at 50% 44%, #000 44%, transparent 100%)' }} />
          </div>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(62% 72% at 50% 44%, rgba(10,14,26,0.05), rgba(10,14,26,0.62) 74%, rgba(10,14,26,0.92) 100%)' }} />
          <div style={{ position: 'relative', display: 'flex', gap: narrow ? 10 : 14, alignItems: 'center', justifyContent: 'safe center', overflowX: 'auto' }}>
            <WildCardCol cn={1} />
            <DivisionalCol cn={1} />
            <ConfFinalsCol cn={1} />
            <div style={{ flex: '0 0 auto', width: 250, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 420 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.c1, letterSpacing: 0.5, lineHeight: 1.2, textAlign: 'left' }}>CONFERENCE 1<br />CHAMPION</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.c2, letterSpacing: 0.5, lineHeight: 1.2, textAlign: 'right' }}>CONFERENCE 2<br />CHAMPION</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}>
                <div style={{ ...card, flex: 1, background: 'rgba(11,15,26,0.74)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', border: `1px solid ${C.c1}55`, padding: '14px 8px', color: C.dim, fontWeight: 800, fontSize: 12, textAlign: 'center' }}>TBD</div>
                <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', background: `${C.gold}1c`, border: `1px solid ${C.gold}66`, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12 }}>VS</div>
                <div style={{ ...card, flex: 1, background: 'rgba(11,15,26,0.74)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', border: `1px solid ${C.c2}55`, padding: '14px 8px', color: C.dim, fontWeight: 800, fontSize: 12, textAlign: 'center' }}>TBD</div>
              </div>
              <div style={{ ...card, background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', border: `1px solid ${C.green}55`, padding: '16px 18px', width: '100%', textAlign: 'center', boxShadow: `inset 0 0 34px ${C.green}12, 0 8px 28px rgba(0,0,0,0.5)` }}>
                <div style={{ fontSize: 10, letterSpacing: 2.5, color: C.gold, fontWeight: 800, textTransform: 'uppercase' }}>Super Bowl · Week 23</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 24, color: C.green, textShadow: glow(C.green, 0.45), letterSpacing: 0.5, marginTop: 2 }}>SAM BOWL {roman(season)}</div>
                <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: 'uppercase', marginTop: 6 }}>The Ultimate Dynasty</div>
              </div>
            </div>
            <ConfFinalsCol cn={2} />
            <DivisionalCol cn={2} />
            <WildCardCol cn={2} />
          </div>
        </div>

        {/* ── bottom: format · standings · leaders ── */}
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.7fr 1fr 1fr 1fr', gap: 16 }}>
          <div style={{ ...card, padding: 18 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 1, color: C.green, marginBottom: 14 }}>PLAYOFF FORMAT</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
              {FORMAT.map((f) => (
                <div key={f.title} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12.5, color: C.ivory, textTransform: 'uppercase' }}>{f.title}</div>
                  <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
          {[1, 2].map((cn) => {
            const named = seeds[cn].filter((t) => t.name).slice(0, 4)
            return (
              <div key={cn} style={{ ...card, padding: 18 }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12.5, letterSpacing: 0.5, color: accentOf(cn), marginBottom: 12 }}>CONFERENCE {cn} STANDINGS <span style={{ color: C.muted, fontWeight: 600 }}>(TOP 4)</span></div>
                {named.length ? named.map((t) => (
                  <div key={t.seed} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                    <span style={{ color: accentOf(cn), fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 13, width: 14 }}>{t.seed}</span>
                    <Crest team={t} accent={accentOf(cn)} size={22} />
                    <span style={{ flex: 1, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                    <span style={{ fontSize: 11.5, color: C.muted }}>{t.record}</span>
                  </div>
                )) : <div style={{ fontSize: 12, color: C.muted, padding: '14px 0' }}>Seeding is set when the regular season ends.</div>}
              </div>
            )
          })}
          <div style={{ ...card, padding: 18 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 12.5, letterSpacing: 0.5, color: C.green, marginBottom: 12 }}>LEAGUE LEADERS</div>
            {leaders.length ? leaders.map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: `${l.c}18`, border: `1px solid ${l.c}44`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{l.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, color: l.c, fontWeight: 700, letterSpacing: 0.3 }}>{l.label}</div>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name} <span style={{ color: C.muted }}>({l.val})</span></div>
                </div>
              </div>
            )) : <div style={{ fontSize: 12, color: C.muted, padding: '14px 0' }}>Leaders appear once the season is played.</div>}
          </div>
        </div>
        {!hasData && <div style={{ textAlign: 'center', color: C.muted, fontSize: 12.5, marginTop: 14 }}>Bracket seeds populate when the postseason is set.</div>}
      </div>
    </div>
  )
}

export default PlayoffBracket
