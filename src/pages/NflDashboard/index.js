import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { attachToken, privateAPI } from '../../config/constants'
import PlayerAvatar from '../../components/PlayerAvatar'
import Header from '../../components/Header'
import CommissionerBadge from '../../components/CommissionerBadge'
import useIsLeagueCommissioner from '../../utils/useIsLeagueCommissioner'
import TeamLogo from '../../components/TeamLogo'
import MATCH_EMPTY from '../../assets/match-empty.png'
import MARKETPLACE_BADGE from '../../assets/marketplace.png'
import MOCKDRAFT_BADGE from '../../assets/mock-draft.png'
import INJURY_BADGE from '../../assets/injury-report.png'
import KTC_BADGE from '../../assets/keep-trade-cut.png'
import TRANSACTIONS_BADGE from '../../assets/transactions.png'
import SETLINEUP_BADGE from '../../assets/set-lineup.png'
import AUCTIONS_BADGE from '../../assets/auctions.png'
import PREDICTOR_BADGE from '../../assets/predictor.png'

/* ═══════════════════════════════════════════════════════════════
   NFL DASHBOARD — GM command center. Real data only: every panel is
   wired to a live feed and shows an honest empty state (or hides)
   when there's nothing to show. No sample/placeholder data.
   ═══════════════════════════════════════════════════════════════ */

const fmtBig = (v) => {
  if (v == null) return '-'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${Number(v).toLocaleString()}`
}
const timeAgo = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
const POS = {
  QB: '#FF6B6B', RB: '#8FB4F0', WR: '#B794F6', TE: '#F7C948', DEF: '#4ADE80', IDP: '#4ADE80',
  // Individual defensive positions
  DL: '#4ADE80', DE: '#4ADE80', DT: '#34D399', LB: '#22C55E', DB: '#5FD08A', CB: '#5FD08A', S: '#86EFAC',
}
const BANNER = `${process.env.PUBLIC_URL || ''}/assets/hub/dashboard-hero.png`

const C = {
  page: 'radial-gradient(120% 70% at 50% -8%, #0c0d12 0%, #060708 46%, #020203 100%)',
  panel: '#0A0E17', line: 'rgba(233,231,223,0.08)', ivory: '#ECEAE3',
  muted: '#69748B', gold: '#F7C948', green: '#4ADE80', red: '#FF6B6B', purple: '#8B5CF6', blue: '#3B82F6',
}
const panel = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }
const head = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }
const hTitle = { fontSize: 13, fontWeight: 800, color: C.ivory, letterSpacing: 0.3 }
const viewAll = { fontSize: 11, color: C.green, cursor: 'pointer', fontWeight: 700 }

// Compact SP formatter for auction bids
const fmtSP = (v) => {
  if (v == null || v === 0) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return Number(v).toLocaleString()
}
// "2h 14m" / "9m 03s" left until an auction's endDate
const timeLeft = (end) => {
  if (!end) return ''
  const ms = new Date(end).getTime() - Date.now()
  if (ms <= 0) return 'ending'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${String(sec).padStart(2, '0')}s`
}

// Live Auctions right-rail card. Self-contained 1s tick so the countdown
// stays fresh without re-rendering the whole dashboard. Auto-hides when
// nothing is live.
const LiveAuctionsPanel = ({ auctions, navigate }) => {
  const [, force] = useState(0)
  useEffect(() => {
    if (!auctions.length) return undefined
    const id = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [auctions.length])
  if (!auctions.length) return null
  return (
    <div style={panel}>
      <div style={head}>
        <span style={hTitle}>🔨 Live Auctions</span>
        <span style={viewAll} onClick={() => navigate('/player-auction')}>View All</span>
      </div>
      {auctions.slice(0, 6).map((a, i) => {
        const p = a.player || {}
        const tl = timeLeft(a.endDate)
        const ending = tl === 'ending' || (a.endDate && new Date(a.endDate).getTime() - Date.now() < 300000)
        return (
          <div key={a._id || i} onClick={() => navigate('/player-auction')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i ? `1px solid ${C.line}` : 'none', cursor: 'pointer' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: `${POS[p.Position] || C.muted}22`, color: POS[p.Position] || C.muted }}>{p.Position || '—'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.Name || 'Player'}</div>
              <div style={{ fontSize: 10.5, color: ending ? C.red : C.muted, fontWeight: ending ? 700 : 400 }}>
                {p.Team || ''}{p.Team && tl ? ' · ' : ''}{tl ? `${tl} left` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.green }}>{a.highestCurrentBid ? fmtSP(a.highestCurrentBid) : 'No bids'}</div>
              <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.highestCurrentBid ? 'top bid · SP' : 'awaiting bid'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const NflDashboard = () => {
  const navigate = useNavigate()
  const user = useSelector((s) => s.user?.userDetails)
  const isLeagueCommissioner = useIsLeagueCommissioner()

  const [topbar, setTopbar] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [news, setNews] = useState([])
  const [players, setPlayers] = useState([])
  const [standings, setStandings] = useState([])
  const [activity, setActivity] = useState([])
  const [liveAuctions, setLiveAuctions] = useState([])
  const [matchupCenter, setMatchupCenter] = useState(null)
  const [analyzerOpen, setAnalyzerOpen] = useState(false)

  const userId = user?._id
  const teamId = user?.team?._id
  useEffect(() => {
    if (!userId) return
    attachToken()
    ;(async () => {
      try {
        const r = await privateAPI.get('/user/get-user')
        const d = r?.data?.data || r?.data || {}
        const sp = d?.sampoints?.earnedSamPoints ?? d?.sampoints?.SamPoints
        const cap = d?.leagueSalaryCap, used = d?.teamSalaryCap ?? 0
        const t = user?.team || {}
        setTopbar({ sp: sp ?? 0, budget: cap ? Math.max(0, cap - used) : null, teamName: t.name || '', week: d?.currentWeek ?? 1, record: t.wins != null ? `${t.wins} - ${t.losses || 0}` : '', spWeek: 0, rank: '' })
      } catch (e) { /* real data only */ }
      try {
        const m = await privateAPI.post('/schedule/get-full-team-schedule', {})
        const weeks = m?.data?.data || m?.data || []
        const next = (Array.isArray(weeks) ? weeks : []).find((w) => (w.opponentOne || w.opponentTwo) && !w.isBye)
        if (next) setMatchup(next)
      } catch (e) { /* sample shows */ }
      try { const n = await privateAPI.get('/news/get-news'); const l = n?.data?.data || n?.data || []; if (l.length) setNews(l.slice(0, 4)) } catch (e) {}
      try { const p = await privateAPI.get('/nfl-top-performers?limit=12'); const l = p?.data?.data || p?.data || []; if (l.length) setPlayers(l.slice(0, 12)) } catch (e) {}
      try { const tx = await privateAPI.get('/transaction/get-top-transactions'); const l = tx?.data?.data?.topTransaction || tx?.data?.topTransaction || tx?.data?.data || []; if (l.length) setActivity(l.slice(0, 5)) } catch (e) {}
      try { const st = await privateAPI.get(`/ranking/get-league-standings/${user?.setting?.week || 1}`); const l = st?.data?.data || st?.data || []; if (l.length) setStandings(l.slice(0, 6)) } catch (e) {}
      try { const au = await privateAPI.get('/auction/getall'); const l = au?.data?.data?.liveAuctions || []; const live = l.filter((a) => !a.hasAuctionEnded).sort((a, b) => new Date(a.endDate) - new Date(b.endDate)); setLiveAuctions(live) } catch (e) {}
      try { const mc = await privateAPI.get('/dashboard/matchup-center'); const d = mc?.data?.data || mc?.data; if (d?.hasData) setMatchupCenter(d) } catch (e) {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, teamId])

  // Real data only — honest fallbacks when a value isn't available yet.
  const tb = {
    teamName: topbar?.teamName || user?.team?.name || 'My Team',
    week: topbar?.week || 1,
    sp: topbar?.sp ?? 0,
    budget: topbar?.budget ?? null,
    record: topbar?.record || '',
    spWeek: topbar?.spWeek || 0,
    rank: topbar?.rank || '',
    awayUntil: user?.team?.awayUntil || null,
  }
  const rawLogo = user?.team?.logo || user?.team?.logoUrl || ''
  const [logoOk, setLogoOk] = useState(true)
  // Responsive width hook — this page is inline-styled, so grids can't use CSS
  // media queries. Track the viewport and collapse the fixed columns on tablet/
  // phone/landscape widths so panels stack instead of overlapping.
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  useEffect(() => {
    const on = () => setVw(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const narrow = vw < 1024   // stack the main grid + inner two-up
  const phone = vw < 640
  const teamLogo = rawLogo && logoOk ? rawLogo : null
  const mData = matchup ? {
    week: matchup.week, when: matchup.startDate ? new Date(matchup.startDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD', time: matchup.startDate ? new Date(matchup.startDate).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
    projMe: matchup.projMe, projOpp: matchup.projOpp, winProb: matchup.winProb,
    me: matchup.opponentOne || {}, opp: matchup.opponentTwo || {},
  } : null
  const newsData = news
  const playersData = players
  const standData = standings
  const actData = activity

  const qaRef = useRef(null)
  const tpRef = useRef(null)
  const QUICK = [
    { icon: '🧩', img: SETLINEUP_BADGE, title: 'Set Lineup', sub: 'Optimize your team', color: C.green, to: '/depth-chart' },
    { icon: '🔁', img: TRANSACTIONS_BADGE, title: 'Make a Trade', sub: 'Improve your roster', color: C.purple, to: '/team-trade' },
    { icon: '🔨', img: AUCTIONS_BADGE, title: 'Auctions', sub: 'Bid on players', color: C.gold, to: '/player-auction' },
    { icon: '🛒', img: MARKETPLACE_BADGE, title: 'Marketplace', sub: 'Browse players', color: C.blue, to: '/values' },
    { icon: '📋', img: MOCKDRAFT_BADGE, title: 'Draft', sub: 'Prep your board', color: C.purple, to: '/mock-draft' },
    { icon: '🏥', img: INJURY_BADGE, title: 'Injury Report', sub: 'Check statuses', color: C.red, to: '/injury-report' },
    { icon: '📈', img: PREDICTOR_BADGE, title: 'Predictor', sub: 'Make your picks', color: C.blue, to: '/nfl-predictor' },
    { icon: '⚖️', img: KTC_BADGE, title: 'Keep, Trade, Cut', sub: 'Rank players', color: C.gold, to: '/values' },
  ]

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: C.page, color: C.ivory, fontVariantNumeric: 'tabular-nums' }}>
      {/* ── Shared account header — full feature set (Available/Total Earned, Buy SP,
          Transfer, GM Rank, Messages, Notifications, Live Auction, Trades) — slim command
          bar only; team info (name/league/record/budget) lives in the hero below. ── */}
      <Header slim />

      <div style={{ padding: phone ? 12 : 20, display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0,1fr) 340px', gap: 20, alignItems: 'start' }}>
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TEAM HERO BANNER — identity header (logo + name + league) over a stat row,
              with the team's eagle art filling the right. */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, minHeight: 200, border: `1px solid ${C.line}`, background: `linear-gradient(90deg, rgba(6,8,14,0.96) 0%, rgba(6,8,14,0.72) 40%, rgba(6,8,14,0.25) 72%, rgba(6,8,14,0) 100%), url(${BANNER}) center / cover no-repeat, linear-gradient(120deg,#0e1b2e,#0a0e17)`, padding: '22px 28px' }}>
            {teamLogo && <img src={teamLogo} alt="" onError={() => setLogoOk(false)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: '160%', width: 'auto', objectFit: 'contain', opacity: 0.9, pointerEvents: 'none', maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 42%, #000 78%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 42%, #000 78%)' }} />}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div onClick={() => !teamLogo && navigate('/team-setting')} style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0C1320', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: teamLogo ? 'default' : 'pointer' }}>
                  {teamLogo ? <TeamLogo src={teamLogo} name={tb.teamName || 'S'} size={60} round={false} style={{ width: '100%', height: '100%' }} /> : <span style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{(tb.teamName || 'S').charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1 }}>{tb.teamName}</span>
                    <CommissionerBadge show={isLeagueCommissioner} size={22} />
                    {tb.awayUntil && new Date(tb.awayUntil) > new Date() && (
                      <span title={`Away until ${new Date(tb.awayUntil).toLocaleDateString()}`} style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 6, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>✈ Away</span>
                    )}
                    <span onClick={() => navigate('/team-setting')} title="Edit team" style={{ cursor: 'pointer', color: C.muted, fontSize: 15 }}>✎</span>
                  </div>
                  <div onClick={() => navigate('/my-league')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, cursor: 'pointer', color: '#AEB6C4', fontSize: 13.5, fontWeight: 600 }}>
                    {user?.team?.currentLeague?.name || 'League'}<span style={{ fontSize: 12 }}>↗</span>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 34, flexWrap: 'wrap' }}>
                {tb.rank && <div style={{ width: 58, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 900, color: C.gold, border: `2px solid ${C.gold}`, clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }}>{tb.rank}</div>}
                <div>
                  <div style={{ fontSize: 12, color: C.muted }}>Record</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{tb.record || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.muted }}>SamPoints Balance</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.purple }}>{Number(tb.sp).toLocaleString()}</div>
                  {tb.spWeek > 0 && <div style={{ fontSize: 11, color: C.green, marginTop: 2 }}>▲ +{Number(tb.spWeek).toLocaleString()} SP this week</div>}
                </div>
                {tb.budget != null && (
                  <div>
                    <div style={{ fontSize: 12, color: C.muted }}>Budget Left</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: C.green }}>{fmtBig(tb.budget)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Quick Actions</div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
              <div ref={qaRef} className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', flex: 1, scrollBehavior: 'smooth', paddingBottom: 2 }}>
                {QUICK.map((q) => (
                  <button key={q.title} onClick={() => navigate(q.to)} style={{ flex: '0 0 240px', textAlign: 'left', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 46, height: 46, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden', background: q.img ? 'transparent' : `${q.color}22` }}>
                      {q.img
                        // Uniform green tint so every quick-action icon reads as
                        // one colour instead of the mix of blue/gold/multicolour
                        // badge art. grayscale+sepia+hue-rotate forces a single hue.
                        ? <img src={q.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 11, filter: 'grayscale(1) sepia(1) hue-rotate(62deg) saturate(3.4) brightness(0.95)' }} onError={(e) => { e.target.style.display = 'none' }} />
                        : q.icon}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.ivory }}>{q.title}</span>
                      <span style={{ display: 'block', fontSize: 10.5, color: C.muted }}>{q.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button aria-label="More quick actions" onClick={() => qaRef.current?.scrollBy({ left: 264, behavior: 'smooth' })} title="Scroll for more" style={{ flexShrink: 0, width: 44, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, color: C.muted, fontSize: 18, cursor: 'pointer' }}>→</button>
            </div>
          </div>

          {/* MATCHUP + NEWS */}
          <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 20 }}>
            {/* Upcoming Matchup */}
            <div style={panel}>
              <div style={hTitle}>Upcoming Matchup</div>
              {mData ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8, margin: '14px 0' }}>
                    <TeamBadge t={mData.me} fb={user?.team} />
                    <div style={{ textAlign: 'center', background: '#0C1320', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ color: C.green, fontWeight: 800, fontSize: 13 }}>Week {mData.week || 1}</div>
                      <div style={{ color: C.ivory, fontSize: 12.5, fontWeight: 600, margin: '4px 0 0' }}>{mData.when}</div>
                      {mData.time && <div style={{ color: C.ivory, fontSize: 12.5, fontWeight: 600, margin: '1px 0 0' }}>{mData.time}</div>}
                      <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>vs</div>
                    </div>
                    <TeamBadge t={mData.opp} />
                  </div>
                  {mData.projMe != null && mData.winProb != null && (
                    <>
                      <div style={{ fontSize: 10.5, color: C.muted, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.2, margin: '4px 0 8px' }}>Projected Score</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: C.green, lineHeight: 1 }}>{mData.projMe}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 5, margin: '0 12px', background: `linear-gradient(90deg, ${C.green} ${mData.winProb}%, #2a3550 ${mData.winProb}%)` }} />
                        <span style={{ fontSize: 28, fontWeight: 900, color: C.ivory, lineHeight: 1 }}>{mData.projOpp}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 14 }}>
                        <span style={{ color: C.green, fontWeight: 700 }}>{mData.winProb}%</span>
                        <span>Win Probability</span>
                        <span>{100 - mData.winProb}%</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate('/team-schedule')} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: C.green, color: '#08120b', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>View Matchup</button>
                    {matchupCenter?.analyzer?.length > 0 && (
                      <button onClick={() => setAnalyzerOpen(true)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: `1px solid ${C.line}`, background: 'transparent', color: C.ivory, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>📊 Matchup Analyzer</button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '14px 12px 22px', color: C.muted }}>
                  <img
                    src={MATCH_EMPTY}
                    alt=''
                    style={{ display: 'block', width: '100%', maxWidth: 360, margin: '0 auto 6px', mixBlendMode: 'screen' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.6 }}>No Upcoming Match Scheduled Yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Check back later for your next match.</div>
                </div>
              )}
            </div>

            {/* Breaking News */}
            <div style={panel}>
              <div style={head}><span style={hTitle}>Breaking News</span><span style={viewAll} onClick={() => navigate('/all-news')}>View All</span></div>
              {newsData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '34px 12px', color: C.muted }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>📰</div>
                  <div style={{ fontSize: 12.5 }}>No news right now</div>
                </div>
              ) : (
              <>
              <a href={newsData[0].link || '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(135deg,#141a26,#0A0E17)', display: 'flex', alignItems: 'flex-end' }}>
                  {newsData[0].image ? <img src={newsData[0].image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} /> : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🏈</span>}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 32%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.9) 100%)' }} />
                  <span style={{ position: 'absolute', top: 10, left: 10, background: C.red, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5 }}>BREAKING</span>
                  <div style={{ position: 'relative', zIndex: 1, padding: 12, width: '100%' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{newsData[0].headline}</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>{timeAgo(newsData[0].lastModified)}</div>
                  </div>
                </div>
              </a>
              {newsData.slice(1, 4).map((n, i) => (
                <a key={i} href={n.link || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${C.line}`, textDecoration: 'none' }}>
                  <div style={{ flex: '0 0 auto', width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(135deg,#141a26,#0A0E17)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {n.image ? <img src={n.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} /> : <span style={{ fontSize: 16 }}>🏈</span>}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ivory, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.headline}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{timeAgo(n.lastModified)}</div>
                  </div>
                </a>
              ))}
              </>
              )}
            </div>
          </div>

          {/* TOP PLAYERS — real 2025 top performers (SAM playerScore), scrollable carousel */}
          {playersData.length > 0 && (
          <div>
            <div style={head}>
              <span style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Top Players</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button aria-label="Previous" onClick={() => tpRef.current?.scrollBy({ left: -404, behavior: 'smooth' })} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panel, color: C.muted, cursor: 'pointer' }}>‹</button>
                <button aria-label="Next" onClick={() => tpRef.current?.scrollBy({ left: 404, behavior: 'smooth' })} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panel, color: C.muted, cursor: 'pointer' }}>›</button>
                <span style={viewAll} onClick={() => navigate('/values')}>View All</span>
              </span>
            </div>
            <div ref={tpRef} className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollBehavior: 'smooth', paddingBottom: 2 }}>
              {playersData.map((p, i) => (
                <div key={p._id || p.name || i} style={{ flex: '0 0 190px', ...panel, padding: 0, overflow: 'hidden', border: `1px solid ${(POS[p.position] || C.gold)}55` }}>
                  <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: `radial-gradient(circle at 50% 130%, ${POS[p.position] || C.gold}66, #0A0E17 72%)` }}>
                    <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, fontSize: 10, fontWeight: 800, color: '#0B0F17', background: POS[p.position] || C.gold, borderRadius: 5, padding: '3px 8px' }}>{p.position || '—'}</span>
                    <PlayerAvatar name={p.name} src={p.photo} size={110} borderRadius={0} style={{ width: '100%', height: '100%', borderRadius: 0, background: 'transparent', border: 'none' }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 9 }}>{[p.team, p.position].filter(Boolean).join(' · ')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div><div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase' }}>Projected</div><div style={{ fontSize: 16, fontWeight: 800, color: C.ivory }}>{Number(p.totalScore ?? 0).toFixed(1)}</div></div>
                      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase' }}>PPG</div><div style={{ fontSize: 13, fontWeight: 700, color: C.ivory }}>{p.ppg != null ? Number(p.ppg).toFixed(1) : '—'}</div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* ══════════ RIGHT RAIL ══════════ */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* League Standings */}
          {standData.length > 0 && (
          <div style={panel}>
            <div style={head}><span style={hTitle}>League Standings</span><span style={viewAll} onClick={() => navigate('/standings')}>View All</span></div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['#', 'Team', 'W-L', 'PCT', 'GB'].map((h, i) => <th key={i} style={{ textAlign: i < 2 ? 'left' : 'right', fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 4px', borderBottom: `1px solid ${C.line}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {standData.map((t, i) => {
                  const w = t.w ?? t.wins ?? 0, l = t.l ?? t.losses ?? 0
                  const mine = t.me || String(t._id || '') === meIdOf(user)
                  const pct = (w + l) ? (w / (w + l)).toFixed(3).replace(/^0/, '') : '.000'
                  return (
                    <tr key={i} style={{ background: mine ? `${C.green}14` : 'transparent', outline: mine ? `1px solid ${C.green}55` : 'none' }}>
                      <td style={{ padding: '9px 4px', fontSize: 12, color: mine ? C.green : C.muted, fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: '9px 4px', fontSize: 12.5, fontWeight: 700, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{t.name || t.teamName || 'Team'}</td>
                      <td style={{ padding: '9px 4px', fontSize: 12, textAlign: 'right', color: C.ivory }}>{w}-{l}</td>
                      <td style={{ padding: '9px 4px', fontSize: 12, textAlign: 'right', color: C.muted }}>{pct}</td>
                      <td style={{ padding: '9px 4px', fontSize: 12, textAlign: 'right', color: C.muted }}>{t.gb || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Game Center — real per-position strength vs the league (current week's lineups) */}
          <div style={panel}>
            <div style={head}>
              <span style={hTitle}>Game Center</span>
              {matchupCenter?.gameCenter?.length > 0 && <span style={{ fontSize: 10, color: C.muted }}>Week {matchupCenter.week} · vs league</span>}
            </div>
            {matchupCenter?.gameCenter?.length > 0 ? (
              matchupCenter.gameCenter.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <span style={{ width: 34, fontSize: 11, fontWeight: 800, color: POS[g.pos] || C.ivory }}>{g.pos}</span>
                  <div style={{ flex: 1, height: 7, borderRadius: 4, background: '#1a2030' }}><div style={{ width: `${g.pct}%`, height: '100%', borderRadius: 4, background: POS[g.pos] || C.green }} /></div>
                  <span style={{ width: 34, fontSize: 12, fontWeight: 700, color: C.ivory, textAlign: 'right' }}>{g.pct}%</span>
                  <span style={{ width: 40, fontSize: 11, color: C.muted, textAlign: 'right' }} title={`Rank ${g.rank} of ${g.teams}`}>#{g.rank}</span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '22px 10px', color: C.muted }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>Set your starting lineup to see how each position stacks up against the league.</div>
              </div>
            )}
            <button onClick={() => navigate('/depth-chart')} style={{ width: '100%', marginTop: 12, padding: '9px 0', borderRadius: 8, border: 'none', background: C.green, color: '#08120b', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Set Lineup</button>
          </div>

          {/* Live Auctions — auto-hides when nothing is live */}
          <LiveAuctionsPanel auctions={liveAuctions} navigate={navigate} />

          {/* Recent Activity */}
          <div style={panel}>
            <div style={head}><span style={hTitle}>Recent Activity</span><span style={viewAll} onClick={() => navigate('/transactions')}>View All</span></div>
            {actData.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 12px', color: C.muted, fontSize: 12.5 }}>No recent activity</div>
            )}
            {actData.map((a, i) => (
              <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: `${a.color || C.muted}22` }}>{a.icon || '📣'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title || a.module || 'Activity'}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{timeAgo(a.createdAt)}</div>
                </div>
                {a.amount && <span style={{ fontSize: 12, fontWeight: 800, color: a.color || C.muted }}>{a.amount}</span>}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {analyzerOpen && matchupCenter?.analyzer?.length > 0 && (
        <MatchupAnalyzer
          meName={matchupCenter.me?.name || tb.teamName}
          oppName={matchupCenter.opp?.name || 'Opponent'}
          meLogo={matchupCenter.me?.logo || teamLogo}
          oppLogo={matchupCenter.opp?.logo}
          rows={matchupCenter.analyzer}
          meTotal={matchupCenter.me?.total}
          oppTotal={matchupCenter.opp?.total}
          onClose={() => setAnalyzerOpen(false)}
        />
      )}
    </div>
  )
}

const MatchupAnalyzer = ({ meName, oppName, meLogo, oppLogo, rows = [], meTotal, oppTotal, onClose }) => {
  const mTotal = meTotal != null ? meTotal : rows.reduce((s, r) => s + (r.mine?.proj || 0), 0)
  const oTotal = oppTotal != null ? oppTotal : rows.reduce((s, r) => s + (r.opp?.proj || 0), 0)
  const meWins = rows.filter((r) => (r.mine?.proj || 0) >= (r.opp?.proj || 0)).length
  const Logo = ({ src }) => src
    ? <img src={src} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#141a26', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏈</div>
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(720px, 96vw)', maxHeight: '90vh', overflowY: 'auto', background: '#0A0E17', border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.ivory }}>📊 Matchup Analyzer</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo src={meLogo} />
            <div><div style={{ fontSize: 13, fontWeight: 800, color: C.ivory, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meName}</div><div style={{ fontSize: 22, fontWeight: 900, color: mTotal >= oTotal ? C.green : C.ivory }}>{mTotal.toFixed(1)}</div></div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>VS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', textAlign: 'right' }}>
            <div><div style={{ fontSize: 13, fontWeight: 800, color: C.ivory, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{oppName}</div><div style={{ fontSize: 22, fontWeight: 900, color: oTotal > mTotal ? C.green : C.ivory }}>{oTotal.toFixed(1)}</div></div>
            <Logo src={oppLogo} />
          </div>
        </div>
        <div style={{ padding: '0 12px 8px' }}>
          {rows.map((r, i) => {
            const meBetter = (r.mine?.proj || 0) >= (r.opp?.proj || 0)
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 54px 1fr', alignItems: 'center', gap: 8, padding: '10px 8px', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 10px', borderRadius: 8, background: meBetter ? `${C.green}12` : 'transparent' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.mine?.name || '—'}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: meBetter ? C.green : C.muted }}>{(r.mine?.proj || 0).toFixed(1)}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: C.muted, background: '#0C1320', border: `1px solid ${C.line}`, borderRadius: 6, padding: '4px 0' }}>{r.pos}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 10px', borderRadius: 8, background: !meBetter ? `${C.green}12` : 'transparent' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: !meBetter ? C.green : C.muted }}>{(r.opp?.proj || 0).toFixed(1)}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.opp?.name || '—'}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.muted }}>You lead <b style={{ color: C.green }}>{meWins}</b> of {rows.length} slots</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: mTotal >= oTotal ? C.green : C.red }}>{mTotal >= oTotal ? `Projected edge +${(mTotal - oTotal).toFixed(1)}` : `Projected deficit ${(mTotal - oTotal).toFixed(1)}`}</span>
        </div>
      </div>
    </div>
  )
}

const meIdOf = (user) => String(user?.team?._id || '__none__')

const TeamBadge = ({ t, fb }) => {
  const src = t?.logo || fb?.logo
  return (
    <div style={{ textAlign: 'center', minWidth: 96 }}>
      {src
        ? <img src={src} alt="" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(233,231,223,0.12)' }} />
        : <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#141a26', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🏈</div>}
      <div style={{ fontSize: 15, fontWeight: 800, color: '#eef1f6', marginTop: 8, maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t?.name || fb?.name || 'TBD'}</div>
      {t?.record && <div style={{ fontSize: 12.5, color: '#8a93a6', marginTop: 3 }}>{t.record}</div>}
    </div>
  )
}

export default NflDashboard
