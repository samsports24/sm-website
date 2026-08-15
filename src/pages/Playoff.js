import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { attachToken, privateAPI } from '../config/constants'
import Header from '../components/Header'
import OnboardingGuide from '../components/OnboardingGuide'
import TeamLogo from '../components/TeamLogo'
// SamBowl trophy artwork (webpack-bundled from src/assets so it deploys reliably).
import Trophy from '../assets/sambowl-xxvii.png'

/* ══════════════════════════════════════════════════════════
   PLAYOFFS — Road to SamBowl (matches the GM dashboard mockup).
   Real data: /postseason/state (bracket), /ranking/gm-ratings
   (records + points), /user/get-user (salary cap). Sample fills
   any panel that has no live source yet so it reviews fully.
   ══════════════════════════════════════════════════════════ */

const C = {
  bg: '#0a0e1a', panelSoft: 'rgba(19,26,43,0.7)',
  border: 'rgba(120,140,180,0.14)', borderSoft: 'rgba(120,140,180,0.10)',
  ivory: '#E8EDF5', muted: '#69748B', dim: '#8892A6',
  green: '#4ADE80', greenDeep: '#22C55E', purple: '#8B5CF6', purpleLt: '#A855F7',
  blue: '#3B82F6', teal: '#2DD4BF', red: '#FF6B6B', gold: '#F7C948',
}

const ROUNDS = [
  { key: 'wildCard', label: 'Week 19', round: 'Wildcard Round', dates: 'Jan 16 – 18', week: 19, color: '#4ADE80' },
  { key: 'divisional', label: 'Week 20', round: 'Divisional Round', dates: 'Jan 23 – 24', week: 20, color: '#4ADE80' },
  { key: 'conferenceChamp', label: 'Week 21', round: 'Conference Champ', dates: 'Jan 31', week: 21, color: '#2DD4BF' },
  { key: 'bye', label: 'Week 22', round: 'Pro Bowl · Bye', dates: 'Feb 7', week: 22, color: '#F7C948' },
  { key: 'superBowl', label: 'Week 23', round: 'SamBowl', dates: 'Feb 14', week: 23, color: '#8B5CF6' },
]

const toRoman = (n) => {
  if (!n || n < 1) return ''
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''; map.forEach(([v, s]) => { while (n >= v) { out += s; n -= v } }); return out
}
const fmtM = (n) => { const m = (n || 0) / 1e6; return (Math.abs(m) >= 100 ? Math.round(m) : m.toFixed(1)) + 'M' }

const SAMPLE = { season: 27, currentWeek: 19, cap: 301e6, capSpace: 18.4e6, totalPts: '1,237', avgPts: '102.8' }

const Playoff = () => {
  const navigate = useNavigate()
  const numTeams = useSelector((s) => s.league?.currentLeague?.numberOfTeams)
  const [state, setState] = useState(null)
  const [ratings, setRatings] = useState([])
  const [cap, setCap] = useState({ salaryCap: null, capSpace: null })
  const [activeIdx, setActiveIdx] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)

  useEffect(() => {
    attachToken()
    const fetchRatings = (wk) => {
      privateAPI.get(`/ranking/gm-ratings/${wk}`)
        .then((r) => { const arr = r?.data?.data?.ratings ?? r?.data?.ratings ?? []; if (arr.length) setRatings(arr) })
        .catch(() => {})
    }
    Promise.allSettled([privateAPI.get('/postseason/state'), privateAPI.get('/user/get-user')])
      .then(([ps, us]) => {
        let wk = 18
        if (ps.status === 'fulfilled') {
          const s = ps.value?.data?.data ?? ps.value?.data
          if (s && (s.season || s.bracket)) {
            setState(s)
            const idx = ROUNDS.findIndex((x) => x.week === s.currentWeek)
            if (idx >= 0) setActiveIdx(idx)
            wk = s.currentWeek || 18
          }
        }
        fetchRatings(wk)
        if (us.status === 'fulfilled') {
          const d = us.value?.data?.data ?? us.value?.data ?? {}
          const capNum = typeof d.leagueSalaryCap === 'number' ? d.leagueSalaryCap : (d.leagueSalaryCap?.amount || d.leagueSalaryCap?.ceiling || d.leagueSalaryCap?.value || null)
          const used = d.teamSalaryCap ?? 0
          if (capNum) setCap({ salaryCap: capNum, capSpace: Math.max(0, capNum - used) })
        }
      })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    const on = () => setVw(window.innerWidth)
    window.addEventListener('resize', on)
    return () => { clearInterval(t); window.removeEventListener('resize', on) }
  }, [])

  const narrow = vw < 1080
  const phone = vw < 640
  const season = state?.season || SAMPLE.season
  const round = ROUNDS[activeIdx]
  const currentIdx = useMemo(() => {
    const i = ROUNDS.findIndex((x) => x.week === (state?.currentWeek || SAMPLE.currentWeek))
    return i >= 0 ? i : 0
  }, [state])

  // records + league points from gm-ratings
  const recordsMap = useMemo(() => {
    const m = {}
    ratings.forEach((r) => { if (r.teamId) m[String(r.teamId)] = `${r.wins || 0}-${r.losses || 0}` })
    return m
  }, [ratings])
  const pts = useMemo(() => {
    if (!ratings.length) return { total: '—', avg: '—' }
    const total = ratings.reduce((s, r) => s + (r.avgWeeklyScore || 0) * (r.weeksPlayed || 0), 0)
    const avg = ratings.reduce((s, r) => s + (r.avgWeeklyScore || 0), 0) / ratings.length
    return { total: Math.round(total).toLocaleString(), avg: avg.toFixed(1) }
  }, [ratings])

  const matchups = useMemo(() => {
    if (state && state.bracket) {
      let arr = state.bracket[round.key]
      if (round.key === 'superBowl') arr = arr && arr.homeTeam ? [arr] : []
      return (arr || []).map((m) => {
        const homeId = m.homeTeam?._id || m.homeTeam
        const awayId = m.awayTeam?._id || m.awayTeam
        const homeWon = m.winner && String(m.winner._id || m.winner) === String(homeId)
        const awayWon = m.winner && String(m.winner._id || m.winner) === String(awayId)
        return {
          homeName: m.homeTeam?.name || 'TBD', homeSub: recordsMap[String(homeId)] || (m.homeSeed ? `Seed ${m.homeSeed}` : ''), homeLogo: m.homeTeam?.logo, homeScore: m.homeScore ?? 0, homeWon,
          awayName: m.awayTeam?.name || 'TBD', awaySub: recordsMap[String(awayId)] || (m.awaySeed ? `Seed ${m.awaySeed}` : ''), awayLogo: m.awayTeam?.logo, awayScore: m.awayScore ?? 0, awayWon,
        }
      })
    }
    return []
  }, [state, round.key, recordsMap])

  // Countdown to NFL 2026 Week 1 kickoff — Wed Sep 9, 2026, 8:20 PM ET
  // (Seahawks host Patriots). A real postseason deadline, if present, wins.
  const NFL_WEEK1_KICKOFF = '2026-09-09T20:20:00-04:00'
  const targetDate = state?.deadline || state?.bracket?.superBowl?.scheduledDate || NFL_WEEK1_KICKOFF
  const cd = useMemo(() => {
    if (!targetDate) return null
    let ms = new Date(targetDate).getTime() - now; if (ms < 0) ms = 0
    return { d: Math.floor(ms / 86400000), h: Math.floor((ms % 86400000) / 3600000), m: Math.floor((ms % 3600000) / 60000), s: Math.floor((ms % 60000) / 1000) }
  }, [targetDate, now])

  const pctComplete = useMemo(() => {
    if (!state?.bracket) return '0%'
    let total = 0, done = 0
    ROUNDS.forEach((r) => { let arr = state.bracket[r.key]; if (r.key === 'superBowl') arr = arr && arr.homeTeam ? [arr] : []; (arr || []).forEach((m) => { total++; if (m.winner || m.completed) done++ }) })
    return total ? `${Math.round((done / total) * 100)}%` : '0%'
  }, [state])

  const stats = [
    { icon: '🏆', v: state?.qualifiedTeams?.length || 14, l: 'Playoff Teams', c: C.purpleLt },
    { icon: '📅', v: 5, l: 'Weeks', c: C.purple },
    { icon: '⭐', v: state?.isCompleted ? 1 : 0, l: 'Champion', c: C.purpleLt },
    { icon: '🛡️', v: season, l: 'Season', c: C.purple },
    { icon: '💰', v: cap.salaryCap ? fmtM(cap.salaryCap) : '—', l: 'Salary Cap', c: C.teal },
    { icon: '✅', v: pctComplete, l: 'Complete', c: C.green },
    { icon: '🎯', v: pts.total, l: 'Total Pts', c: C.gold },
    { icon: '📊', v: pts.avg, l: 'Avg Pts', c: C.blue },
    { icon: '💲', v: cap.capSpace ? '+' + fmtM(cap.capSpace) : '—', l: 'Cap Space', c: C.gold },
  ]

  const QUICK = [
    { icon: '🏆', title: 'GM Challenge', sub1: 'Complete challenges', sub2: 'Earn rewards', color: C.purple, to: '/gm-challenge', progress: { done: 3, total: 5 } },
    { icon: '🔁', title: 'Keep, Trade, Cut', sub1: 'Manage your roster', sub2: 'Optimize your team', color: C.green, to: '/values', cta: 'View Roster' },
    { icon: '➕', title: 'Injury Report', sub1: 'Track player injuries', sub2: 'View suspensions', color: C.teal, to: '/injury-report', cta: 'See Report' },
    { icon: '💬', title: 'Chat', sub1: 'Talk with your league', sub2: 'Stay connected', color: C.gold, to: '/chat', cta: 'Open Chat' },
    { icon: '🔍', title: 'Search Players', sub1: 'Find the perfect fit', sub2: 'Filter & scout', color: C.purpleLt, to: '/search-player', cta: 'Search Now' },
  ]

  const card = { background: C.panelSoft, border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: '0 10px 34px rgba(0,0,0,0.4)' }
  const glow = (c, a = 0.5) => `0 0 14px ${c}${Math.round(a * 255).toString(16).padStart(2, '0')}`
  const glassCard = { background: 'rgba(11,15,26,0.58)', backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)', border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: '0 10px 34px rgba(0,0,0,0.5)' }
  const wkTab = (active) => ({ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: active ? C.green : C.dim, cursor: 'pointer', padding: '4px 2px', background: 'none', border: 'none', borderBottom: active ? `2px solid ${C.green}` : '2px solid transparent', whiteSpace: 'nowrap' })
  const arrowBtn = { width: 34, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.panelSoft, color: C.ivory, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }

  const Team = ({ name, sub, logo, color, won }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, textAlign: 'center', minWidth: 0 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: logo ? '#0d1526' : `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <TeamLogo src={logo} name={name} teamColor={color} size={40} style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13.5, color: won ? C.green : C.ivory, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{name}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
    </div>
  )

  // Playoffs require 12+ teams — smaller leagues finish on standings.
  if (numTeams && numTeams < 12) {
    return (
      <div className='playoff-container' style={{ background: C.bg, minHeight: '100vh' }}>
        <Header />
        <div style={{ padding: '80px 24px', maxWidth: 620, margin: '0 auto', textAlign: 'center', color: C.ivory }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏈</div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 34, margin: '0 0 10px' }}>No Playoffs This Season</h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Playoffs are only available for leagues with <strong style={{ color: C.ivory }}>12 or more teams</strong>. With {numTeams} teams,
            this league is decided on final regular-season standings.
          </p>
          <button
            onClick={() => navigate('/league-standings')}
            style={{ marginTop: 22, padding: '11px 26px', borderRadius: 10, border: 'none', background: C.green, color: '#06210f', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            View Standings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='playoff-container' style={{ background: C.bg, minHeight: '100vh' }}>
      <Header />
      <OnboardingGuide tabKey="playoffs" />

      <div style={{ padding: phone ? '16px' : '20px 28px 40px', maxWidth: 1680, margin: '0 auto', color: C.ivory }}>
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: phone ? 34 : 46, margin: 0, letterSpacing: 1.5, lineHeight: 1, background: 'linear-gradient(92deg,#ffffff 0%,#cfd8ec 60%,#a9b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 20px rgba(139,92,246,0.25)' }}>PLAYOFFS</h1>
            <div style={{ height: 3, width: 60, background: `linear-gradient(90deg,${C.green},${C.teal})`, borderRadius: 2, margin: '8px 0 8px', boxShadow: glow(C.green, 0.5) }} />
            <div style={{ color: C.muted, fontSize: 14, letterSpacing: 0.4 }}>Road to SamBowl <span style={{ color: C.purpleLt, fontWeight: 700 }}>{toRoman(season)}</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {ROUNDS.map((r, i) => (<button key={r.key} style={wkTab(i === activeIdx)} onClick={() => setActiveIdx(i)}>{r.label}</button>))}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={arrowBtn} onClick={() => setActiveIdx((i) => Math.max(0, i - 1))} aria-label="Previous week">‹</button>
              <button style={{ ...arrowBtn, borderColor: C.green, color: C.green }} onClick={() => setActiveIdx((i) => Math.min(ROUNDS.length - 1, i + 1))} aria-label="Next week">›</button>
            </div>
          </div>
        </div>

        {/* hero row */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 18, border: `1px solid ${C.border}`, boxShadow: '0 14px 44px rgba(0,0,0,0.55)' }}>
          {/* trophy backdrop — baked into the hero, panels float over it */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${Trophy})`, backgroundSize: 'contain', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,11,20,0.96) 0%, rgba(8,11,20,0.58) 23%, rgba(8,11,20,0.08) 48%, rgba(8,11,20,0.55) 73%, rgba(8,11,20,0.96) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,11,20,0.5) 0%, transparent 24%, transparent 58%, rgba(10,14,26,0.97) 100%)' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '340px 1fr 470px', gap: 18, padding: 18, minHeight: narrow ? 'auto' : 400, alignItems: 'stretch' }}>
          <div style={{ ...glassCard, padding: 24, border: `1px solid ${C.green}55`, boxShadow: `0 10px 34px rgba(0,0,0,0.5), inset 0 0 40px ${C.green}12` }}>
            <div style={{ textAlign: 'center', fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 1.5 }}>SEASON <span style={{ color: C.green, textShadow: glow(C.green, 0.5) }}>{season}</span></div>
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 11.5, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>Championship</div>
            {cd ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                {[['Days', cd.d], ['Hrs', cd.h], ['Mins', cd.m], ['Secs', cd.s]].map(([l, v]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 36, lineHeight: 1, color: C.green, textShadow: glow(C.green, 0.45) }}>{String(v).padStart(2, '0')}</div>
                    <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 5 }}>{l}</div>
                  </div>
                ))}
              </div>
            ) : (<div style={{ textAlign: 'center', color: C.green, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, padding: '10px 0', textShadow: glow(C.green, 0.4) }}>Playoffs Live</div>)}
            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.green}44,transparent)`, margin: '22px 0' }} />
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase' }}>Current Week</div>
            <div style={{ textAlign: 'center', fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 30, color: C.green, letterSpacing: 1.5, textShadow: glow(C.green, 0.4) }}>{ROUNDS[currentIdx].label.toUpperCase()}</div>
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 12, letterSpacing: 1 }}>of 5</div>
            <button onClick={() => navigate('/playoff-draft')} style={{ width: '100%', marginTop: 18, padding: '11px 0', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.green},${C.teal})`, color: '#04120a', fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 1.5, cursor: 'pointer', boxShadow: glow(C.green, 0.4) }}>⚡ PLAYOFF DRAFT</button>
          </div>

          {/* center spacer — the trophy backdrop shows through here */}
          <div style={{ display: narrow ? 'none' : 'block' }} aria-hidden="true" />

          <div style={{ ...glassCard, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <span style={{ width: 4, height: 18, borderRadius: 2, background: `linear-gradient(${C.green},${C.teal})`, boxShadow: glow(C.green, 0.5) }} />
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 1.2 }}>{round.label.toUpperCase()} MATCHUPS</span>
            </div>
            {matchups.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matchups.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.borderSoft}` }}>
                    <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 30, color: m.homeWon ? C.green : C.ivory, width: 32, textAlign: 'center', textShadow: m.homeWon ? glow(C.green, 0.5) : 'none' }}>{m.homeScore}</div>
                    <Team name={m.homeName} sub={m.homeSub} logo={m.homeLogo} color={m.homeColor || C.purple} won={m.homeWon} />
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.muted, fontWeight: 800, flexShrink: 0, letterSpacing: 0.5 }}>VS</div>
                    <Team name={m.awayName} sub={m.awaySub} logo={m.awayLogo} color={m.awayColor || C.blue} won={m.awayWon} />
                    <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 30, color: m.awayWon ? C.green : C.ivory, width: 32, textAlign: 'center', textShadow: m.awayWon ? glow(C.green, 0.5) : 'none' }}>{m.awayScore}</div>
                  </div>
                ))}
              </div>
            ) : (<div style={{ color: C.muted, fontSize: 13, padding: '28px 0', textAlign: 'center' }}>{round.key === 'bye' ? 'Pro Bowl week — no playoff games.' : 'Teams to be confirmed — matchups appear once the bracket is seeded.'}</div>)}
            <button onClick={() => navigate('/playoff-bracket')} style={{ width: '100%', marginTop: 16, padding: '13px 0', borderRadius: 11, border: `1px solid ${C.green}`, background: `linear-gradient(180deg, rgba(74,222,128,0.16), rgba(74,222,128,0.06))`, color: C.green, fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: 1.5, cursor: 'pointer', boxShadow: glow(C.green, 0.28) }}>⌗ VIEW BRACKET</button>
          </div>
          </div>
        </div>

        {/* stats strip */}
        <div style={{ ...card, padding: phone ? 14 : '16px 8px', display: 'grid', gridTemplateColumns: `repeat(${phone ? 3 : 9}, 1fr)`, gap: 10, marginBottom: 18 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: `${s.c}1f`, border: `1px solid ${s.c}44`, boxShadow: `inset 0 0 12px ${s.c}22, ${glow(s.c, 0.22)}` }}>{s.icon}</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 27, color: s.c, lineHeight: 1, textShadow: glow(s.c, 0.4) }}>{s.v}</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${phone ? 160 : 240}px, 1fr))`, gap: 14, marginBottom: 18 }}>
          {QUICK.map((q) => (
            <div key={q.title} onClick={() => navigate(q.to)} style={{ ...card, padding: 18, cursor: 'pointer', border: `1px solid ${q.color}55`, background: `linear-gradient(150deg, ${q.color}22, rgba(10,14,26,0) 72%), ${C.panelSoft}`, boxShadow: `0 10px 30px rgba(0,0,0,0.4), inset 0 0 30px ${q.color}12`, display: 'flex', flexDirection: 'column', minHeight: 150 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${q.color}26`, border: `1px solid ${q.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: glow(q.color, 0.3) }}>{q.icon}</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 15.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{q.title}</div>
              </div>
              <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>{q.sub1}</div>
              <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5, marginBottom: 'auto' }}>{q.sub2}</div>
              {q.progress ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: C.ivory, marginBottom: 6 }}>{q.progress.done} / {q.progress.total} Completed</div>
                  <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}><div style={{ width: `${(q.progress.done / q.progress.total) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${q.color}, ${C.purpleLt})`, boxShadow: glow(q.color, 0.5) }} /></div>
                </div>
              ) : (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: q.color, fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 13.5 }}>
                  <span>{q.cta}</span><span style={{ fontSize: 16 }}>›</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* upcoming schedule */}
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 300px', gap: 18 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 4, height: 18, borderRadius: 2, background: `linear-gradient(${C.purple},${C.purpleLt})`, boxShadow: glow(C.purple, 0.5) }} />
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: 1.2 }}>UPCOMING SCHEDULE</span>
              </div>
              <button onClick={() => navigate('/playoff-bracket')} style={{ background: 'none', border: 'none', color: C.purpleLt, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 0.5, cursor: 'pointer' }}>VIEW FULL SCHEDULE ›</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, flexWrap: phone ? 'wrap' : 'nowrap' }}>
              {ROUNDS.map((r, i) => (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: phone ? '45%' : 0 }}>
                  <div onClick={() => setActiveIdx(i)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', borderRadius: 12, cursor: 'pointer', background: i === activeIdx ? `${r.color}12` : 'rgba(255,255,255,0.02)', border: `1px solid ${i === activeIdx ? r.color + '66' : C.borderSoft}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 16, color: r.color, background: `${r.color}26`, border: `1px solid ${r.color}66`, boxShadow: i === activeIdx ? glow(r.color, 0.45) : 'none' }}>{i + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{r.label}</div>
                      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.key === 'superBowl' ? `SamBowl ${toRoman(season)}` : r.round}</div>
                      <div style={{ fontSize: 10.5, color: C.muted }}>{r.dates}</div>
                    </div>
                  </div>
                  {i < ROUNDS.length - 1 && !phone && <span style={{ color: C.muted, flexShrink: 0 }}>- -</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 20, border: `1px solid ${C.purple}33`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
            <div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 19, color: C.purpleLt, letterSpacing: 0.8, textShadow: glow(C.purple, 0.4) }}>SAMBOWL {toRoman(season)}</div>
              <div style={{ color: C.ivory, fontSize: 14, marginTop: 10 }}>February 14, 2027</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>6:30 PM ET</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>SamSports Arena</div>
            </div>
            <img src={Trophy} alt="" style={{ position: 'absolute', right: -10, bottom: -6, width: 120, opacity: 0.55, pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Playoff
