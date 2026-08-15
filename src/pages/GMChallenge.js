import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { notification } from 'antd'
import {
  getGmRatings,
  getGlobalGmRankings,
  getGmHistory,
  getGmLevels,
} from '../redux/actions/leagueActions'
import Header from '../components/Header'
import '../styles/pages/gmChallenge.css'
import TIER_ROOKIE from '../assets/tiers/rookie.png'
import TIER_RISING from '../assets/tiers/rising.png'
import TIER_VETERAN from '../assets/tiers/veteran.png'
import TIER_ALLSTAR from '../assets/tiers/all-star.png'
import TIER_ELITE from '../assets/tiers/elite.png'

// Full-card tier art, keyed by normalized level key/label. Levels without art
// (e.g. Elite) fall back to the text card below.
const TIER_ART = {
  rookie: TIER_ROOKIE,
  rising: TIER_RISING,
  veteran: TIER_VETERAN,
  'all-star': TIER_ALLSTAR,
  allstar: TIER_ALLSTAR,
  elite: TIER_ELITE,
}
const tierArtFor = (lvl) => {
  const key = (lvl?.key || '').toLowerCase().replace(/\s+/g, '-')
  const label = (lvl?.label || '').toLowerCase().replace(/\s+/g, '-')
  return TIER_ART[key] || TIER_ART[label] || null
}

const PAGE_SIZE = 25

/* ── formatting helpers ── */
// The canonical "GM Score" is the overall cross-league rating (what the hero and
// the header GM rank show). Fall back to per-league/legacy fields so a row that
// only carries one of them still renders a number instead of a mismatched value.
const gmScoreOf = (r) =>
  r?.overallRating ?? r?.gmScore ?? r?.gmRating ?? r?.score ?? null

const fmtScore = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const fmtInt = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString()
}

const initialsOf = (name) => {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]).join('').toUpperCase() || '?'
}

/* ── small presentational pieces ── */
const MedalRank = ({ rank }) => {
  const medal = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : null
  if (medal) {
    return <span className={`gmc-medal gmc-medal--${medal}`}>{rank}</span>
  }
  return <span className="gmc-rank-plain">{rank}</span>
}

const WeeklyChange = ({ value }) => {
  if (value === null || value === undefined) return <span className="gmc-muted">—</span>
  const num = Number(value)
  if (num > 0) return <span className="gmc-change gmc-change--up">↑ +{fmtScore(num)}</span>
  if (num < 0) return <span className="gmc-change gmc-change--down">↓ {fmtScore(num)}</span>
  return <span className="gmc-muted">0.0</span>
}

const TrendCell = ({ spark, trend }) => {
  const points = Array.isArray(spark) ? spark.filter((n) => n !== null && n !== undefined) : []
  const color =
    trend === 'up' ? 'var(--gmc-green)' : trend === 'down' ? 'var(--gmc-red)' : 'var(--gmc-muted)'

  if (points.length < 2) {
    if (trend === 'up') return <span className="gmc-trend-arrow gmc-change--up">↑</span>
    if (trend === 'down') return <span className="gmc-trend-arrow gmc-change--down">↓</span>
    return <span className="gmc-muted">—</span>
  }

  const w = 72
  const h = 24
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = points.length > 1 ? w / (points.length - 1) : w
  const coords = points.map((p, i) => {
    const x = i * step
    const y = h - 2 - ((p - min) / range) * (h - 4)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg className="gmc-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={coords[coords.length - 1].split(',')[0]} cy={coords[coords.length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  )
}

const TeamBadge = ({ abbr, color, name }) => (
  <div className="gmc-team">
    <span className="gmc-team-abbr" style={{ background: color || 'rgba(255,255,255,0.1)' }}>
      {abbr || initialsOf(name)}
    </span>
    <span className="gmc-team-name">{name || '—'}</span>
  </div>
)

const GmCell = ({ logo, avatar, name, isMe }) => (
  <div className="gmc-gm">
    {logo || avatar ? (
      <img className="gmc-gm-avatar" src={logo || avatar} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
    ) : (
      <span className="gmc-gm-avatar gmc-gm-avatar--initials">{initialsOf(name)}</span>
    )}
    <span className="gmc-gm-name">
      {name || 'Unknown GM'}
      {isMe && <span className="gmc-you">YOU</span>}
    </span>
  </div>
)

const SkeletonRows = ({ cols }) => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} className="gmc-skel-row">
        {Array.from({ length: cols }).map((__, c) => (
          <td key={c}><span className="gmc-skel-bar" /></td>
        ))}
      </tr>
    ))}
  </>
)

/* ── History line chart (inline SVG) ── */
const HistoryChart = ({ points }) => {
  if (!points || !points.length) {
    return <p className="gmc-empty-note">History appears after the first weekly update.</p>
  }
  const w = 300
  const h = 120
  const pad = 8
  const scores = points.map((p) => Number(p.score) || 0)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = pad + i * step
    const y = h - pad - ((Number(p.score) - min) / range) * (h - pad * 2)
    return { x, y, week: p.week, score: p.score }
  })
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${pad},${h - pad} ${line} ${(pad + (points.length - 1) * step).toFixed(1)},${h - pad}`
  return (
    <svg className="gmc-linechart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="GM score over time">
      <polygon points={area} fill="rgba(34,197,94,0.12)" />
      <polyline points={line} fill="none" stroke="var(--gmc-green)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c) => (
        <circle key={c.week} cx={c.x} cy={c.y} r="3" fill="var(--gmc-green)">
          <title>{`Week ${c.week}: ${fmtScore(c.score)}`}</title>
        </circle>
      ))}
    </svg>
  )
}

/* ── FAQ accordion ── */
const FAQ_ITEMS = [
  {
    q: 'How often do the rankings update?',
    a: 'Rankings refresh after each weekly scoring cycle completes. Your weekly change and trend compare against the previous week\'s snapshot.',
  },
  {
    q: 'What affects my GM ranking?',
    a: 'Your ranking reflects how well you manage your franchise across the season — lineup decisions, roster management and overall team performance all contribute.',
  },
  {
    q: 'Why is my weekly change or trend empty?',
    a: 'These values appear once at least one prior weekly snapshot exists. Early in the season there may be nothing to compare against yet.',
  },
  {
    q: 'What is a GM Level?',
    a: 'GM Levels group managers by percentile tiers (Rookie through Elite). Climb the rankings to reach a higher tier and unlock more prestige.',
  },
]

const FaqCard = () => {
  const [open, setOpen] = useState(null)
  return (
    <div className="gmc-card gmc-faq">
      <h3 className="gmc-card-title">FAQ</h3>
      <div className="gmc-faq-list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="gmc-faq-item">
              <button
                type="button"
                className="gmc-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="gmc-faq-chevron">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && <p className="gmc-faq-a">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
const GMChallenge = () => {
  const SETTING = useSelector((state) => state.user?.setting)
  const currentUser = useSelector((state) => state.user?.userDetails)
  const currentLeagueId = currentUser?.team?.currentLeague?._id
  const myUserId = currentUser?._id

  const [activeTab, setActiveTab] = useState('league') // 'league' | 'global'
  const [leagueData, setLeagueData] = useState(null)
  const [globalData, setGlobalData] = useState(null)
  const [leagueLoading, setLeagueLoading] = useState(true)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [history, setHistory] = useState(null)
  const [levels, setLevels] = useState([])
  const [page, setPage] = useState(1)

  /* ── LEAGUE fetch ── */
  const fetchLeague = useCallback(async () => {
    setLeagueLoading(true)
    try {
      // Week param: use the league's current week from settings; the backend
      // clamps to its own currentWeek, so a sensible current value is enough.
      const data = await getGmRatings(SETTING?.week)
      setLeagueData(data && Array.isArray(data.ratings) ? data : { ratings: [], currentWeek: null })
    } catch (err) {
      setLeagueData({ ratings: [], currentWeek: null })
    }
    setLeagueLoading(false)
  }, [SETTING?.week])

  /* ── GLOBAL fetch (wired) ── */
  const fetchGlobal = useCallback(async () => {
    setGlobalLoading(true)
    try {
      const data = await getGlobalGmRankings()
      setGlobalData(data && Array.isArray(data.rankings) ? data : { rankings: [], total: 0 })
    } catch (err) {
      setGlobalData({ rankings: [], total: 0 })
    }
    setGlobalLoading(false)
  }, [])

  useEffect(() => {
    fetchLeague()
  }, [fetchLeague, currentLeagueId])

  // Global is needed both for the Global tab and the hero GM Score — fetch once.
  useEffect(() => {
    fetchGlobal()
  }, [fetchGlobal])

  // Levels strip (once)
  useEffect(() => {
    getGmLevels().then((d) => setLevels(d?.levels || []))
  }, [])

  // History follows the active tab's scope
  useEffect(() => {
    setHistory(null)
    getGmHistory(activeTab).then((d) => setHistory(d?.points || []))
  }, [activeTab])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  /* ── derived summary for the active tab ── */
  const isGlobal = activeTab === 'global'
  const activeData = isGlobal ? globalData : leagueData
  const activeLoading = isGlobal ? globalLoading : leagueLoading

  const summary = useMemo(() => {
    if (!activeData) return {}
    const rankValue = isGlobal
      ? activeData.myRank?.rank ?? null
      : activeData.myRank ?? null
    return {
      myRank: rankValue,
      myLevel: activeData.myLevel || null,
      myWeeklyChange: activeData.myWeeklyChange ?? null,
      myPreviousRank: activeData.myPreviousRank ?? null,
      myHighestRank: activeData.myHighestRank ?? null,
    }
  }, [activeData, isGlobal])

  // Hero GM Score follows the active tab so the big number always matches the
  // user's own row in the visible table: league score on the League tab, global
  // overall on the Global tab (falling back to the global overall if a league
  // row score isn't available).
  const heroScore = isGlobal
    ? (globalData?.myRank?.overallRating ?? null)
    : (gmScoreOf(leagueData?.ratings?.find((r) => String(r.userId) === String(myUserId)))
        ?? globalData?.myRank?.overallRating ?? null)
  const heroLevel = summary.myLevel || globalData?.myLevel || null
  const seasonLabel = SETTING?.season || new Date().getFullYear()

  const rows = useMemo(() => {
    if (!activeData) return []
    return isGlobal ? activeData.rankings || [] : activeData.ratings || []
  }, [activeData, isGlobal])

  const totalCount = isGlobal ? (globalData?.total ?? rows.length) : rows.length
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const showFrom = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const showTo = Math.min(page * PAGE_SIZE, rows.length)

  // My league row for the "why did my rank change" component panel
  const myLeagueRow = useMemo(() => {
    if (!leagueData?.ratings || !myUserId) return null
    return leagueData.ratings.find((r) => String(r.userId) === String(myUserId)) || null
  }, [leagueData, myUserId])

  const handleShare = (platform) => {
    const rank = summary.myRank || '?'
    const team = currentUser?.team?.name || 'My Team'
    const text = `I'm ranked #${rank} in the GM Challenge on SamSports! My team "${team}" is climbing the ranks. Can you beat me? #SamSports #GMChallenge #FantasyFootball`
    const url = 'https://samsports.io'
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${text}\n${url}`)
      notification.success({ message: 'Copied to clipboard!', duration: 2 })
    }
  }

  const cols = isGlobal ? 8 : 7
  const isEmpty = !activeLoading && rows.length === 0

  const hasComponentData =
    myLeagueRow &&
    (myLeagueRow.scoreComponent !== undefined ||
      myLeagueRow.diffComponent !== undefined ||
      myLeagueRow.avgWeeklyScore !== undefined ||
      myLeagueRow.weeklyChange !== null ||
      myLeagueRow.rankChange !== null)

  return (
    <div className="pro_league_container gmc-root">
      <Header />

      <div className="gmc-wrap">
        {/* ─── HERO ─── */}
        <section className="gmc-hero">
          <div className="gmc-hero-glow" aria-hidden="true" />
          <div className="gmc-hero-top">
            <div className="gmc-hero-heading">
              <div className="gmc-hero-icon" aria-hidden="true">🏆</div>
              <div>
                <div className="gmc-eyebrow">GM Challenge</div>
                <h1 className="gmc-hero-title">GM CHALLENGE</h1>
                <p className="gmc-hero-sub">
                  Compete against GMs across the platform. Your decisions on drafts, trades and
                  lineup management determine your ranking.
                </p>
              </div>
            </div>
            <div className="gmc-season-chip">Season {seasonLabel}</div>
          </div>

          <div className="gmc-hero-stats">
            <div className="gmc-stat">
              <div className="gmc-stat-label">
                <span className="gmc-shield" aria-hidden="true">🛡️</span> GM Level
              </div>
              <div className="gmc-stat-value">{heroLevel?.label || '—'}</div>
              <div className="gmc-stat-sub">
                {heroLevel?.percentileTop != null ? `Top ${heroLevel.percentileTop}%` : 'Unranked'}
              </div>
            </div>
            <div className="gmc-stat">
              <div className="gmc-stat-label">Your Current Rank</div>
              <div className="gmc-stat-value">{summary.myRank != null ? `#${summary.myRank}` : '—'}</div>
              <div className="gmc-stat-sub">
                {heroLevel?.percentileTop != null ? `Top ${heroLevel.percentileTop}%` : 'Not ranked yet'}
              </div>
            </div>
            <div className="gmc-stat">
              <div className="gmc-stat-label">Your GM Score</div>
              <div className="gmc-stat-value gmc-stat-value--green">{fmtScore(heroScore)}</div>
              <div className="gmc-stat-sub">
                {summary.myWeeklyChange != null ? (
                  <WeeklyChange value={summary.myWeeklyChange} />
                ) : (
                  <span className="gmc-muted">—</span>
                )}
                {summary.myWeeklyChange != null && <span className="gmc-muted"> vs last week</span>}
              </div>
            </div>
          </div>
        </section>

        <div className="gmc-layout">
          {/* ─── MAIN COLUMN ─── */}
          <div className="gmc-main">
            {/* Tabs */}
            <div className="gmc-tabs" role="tablist" aria-label="Ranking scope">
              <button
                type="button"
                role="tab"
                aria-selected={!isGlobal}
                className={`gmc-tab ${!isGlobal ? 'gmc-tab--active' : ''}`}
                onClick={() => setActiveTab('league')}
              >
                League Rankings
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isGlobal}
                className={`gmc-tab ${isGlobal ? 'gmc-tab--active' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                Global Rankings
              </button>
            </div>

            {/* Table / states */}
            {isEmpty ? (
              <div className="gmc-empty">
                <div className="gmc-empty-icon" aria-hidden="true">🏆</div>
                <h3 className="gmc-empty-title">Rankings Coming Soon</h3>
                <p className="gmc-empty-text">GM rankings become available once the season begins.</p>
              </div>
            ) : (
              <div className="gmc-card gmc-table-card">
                <div className="gmc-table-scroll">
                  <table className="gmc-table">
                    <thead>
                      <tr>
                        <th className="gmc-col-rank">Rank</th>
                        <th>GM</th>
                        {isGlobal ? <th>Grade</th> : <th>Team</th>}
                        <th className="gmc-col-num">GM Score</th>
                        <th className="gmc-col-num">Weekly Change</th>
                        <th className="gmc-col-trend">Trend</th>
                        {isGlobal ? <th className="gmc-col-num">Leagues</th> : null}
                        <th className="gmc-col-num">Record</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoading ? (
                        <SkeletonRows cols={cols} />
                      ) : (
                        pageRows.map((r) => {
                          const isMe = String(r.userId) === String(myUserId)
                          const isLeader = r.rank === 1
                          if (isGlobal) {
                            const wins = (r.leagues || []).reduce((s, l) => s + (l.wins || 0), 0)
                            const losses = (r.leagues || []).reduce((s, l) => s + (l.losses || 0), 0)
                            return (
                              <tr
                                key={r.userId || r.rank}
                                className={`${isMe ? 'gmc-row--me' : ''} ${isLeader ? 'gmc-row--leader' : ''}`}
                              >
                                <td className="gmc-col-rank"><MedalRank rank={r.rank} /></td>
                                <td><GmCell avatar={r.avatar} name={r.userName} isMe={isMe} /></td>
                                <td>
                                  <span className={`gmc-grade gmc-grade--${(r.grade || 'x').toLowerCase()}`}>{r.grade || '—'}</span>
                                </td>
                                <td className="gmc-col-num gmc-score">{fmtScore(gmScoreOf(r))}</td>
                                <td className="gmc-col-num"><WeeklyChange value={r.weeklyChange} /></td>
                                <td className="gmc-col-trend"><TrendCell spark={r.spark} trend={r.trend} /></td>
                                <td className="gmc-col-num">{fmtInt(r.leagueCount)}</td>
                                <td className="gmc-col-num gmc-record">{wins}-{losses}</td>
                              </tr>
                            )
                          }
                          return (
                            <tr
                              key={r.userId || r.teamId || r.rank}
                              className={`${isMe ? 'gmc-row--me' : ''} ${isLeader ? 'gmc-row--leader' : ''}`}
                            >
                              <td className="gmc-col-rank"><MedalRank rank={r.rank} /></td>
                              <td><GmCell logo={r.teamLogo} name={r.gmName} isMe={isMe} /></td>
                              <td><TeamBadge abbr={r.teamAbbr} color={r.teamColor} name={r.teamName} /></td>
                              <td className="gmc-col-num gmc-score">{fmtScore(gmScoreOf(r))}</td>
                              <td className="gmc-col-num"><WeeklyChange value={r.weeklyChange} /></td>
                              <td className="gmc-col-trend"><TrendCell spark={r.spark} trend={r.trend} /></td>
                              <td className="gmc-col-num gmc-record">{r.wins || 0}-{r.losses || 0}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!activeLoading && (
                  <div className="gmc-table-footer">
                    <span className="gmc-showing">
                      Showing {showFrom} to {showTo} of {fmtInt(totalCount)}
                    </span>
                    {totalPages > 1 && (
                      <div className="gmc-pager">
                        <button
                          type="button"
                          className="gmc-page-btn"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Prev
                        </button>
                        <span className="gmc-page-info">{page} / {totalPages}</span>
                        <button
                          type="button"
                          className="gmc-page-btn"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── HOW IT WORKS ─── */}
            <section className="gmc-card gmc-how">
              <h3 className="gmc-card-title">How It Works</h3>
              <div className="gmc-steps">
                {[
                  { n: 1, t: 'Manage your franchise', d: 'Draft, trade and set your lineups each week.' },
                  { n: 2, t: 'Earn points', d: 'The GM Challenge system rewards smart decisions.' },
                  { n: 3, t: 'Climb the rankings', d: 'Rise through your league and the global board.' },
                  { n: 4, t: 'Unlock prestige', d: 'Reach higher GM levels and earn recognition.' },
                ].map((s) => (
                  <div key={s.n} className="gmc-step">
                    <span className="gmc-step-num">{s.n}</span>
                    <div>
                      <div className="gmc-step-title">{s.t}</div>
                      <div className="gmc-step-desc">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              {levels.length > 0 && (
                <>
                  <h4 className="gmc-levels-title">GM Challenge Levels</h4>
                  <div className="gmc-levels">
                    {[...levels]
                      .sort((a, b) => (b.percentileTop ?? 0) - (a.percentileTop ?? 0))
                      .map((lvl) => {
                      const isCurrent = heroLevel?.key && lvl.key === heroLevel.key
                      const art = tierArtFor(lvl)
                      return (
                        <div key={lvl.key} className={`gmc-level ${isCurrent ? 'gmc-level--current' : ''} ${art ? 'gmc-level--art' : ''}`}>
                          {art ? (
                            <>
                              <img src={art} alt={`${lvl.label} — Top ${lvl.percentileTop}%`} className="gmc-level-art" onError={(e) => { e.target.style.display = 'none' }} />
                              {isCurrent && <span className="gmc-level-tag">You are here</span>}
                            </>
                          ) : (
                            <>
                              <span className="gmc-level-shield" aria-hidden="true">🛡️</span>
                              <div className="gmc-level-label">{lvl.label}</div>
                              <div className="gmc-level-pct">Top {lvl.percentileTop}%</div>
                              {isCurrent && <span className="gmc-level-tag">You are here</span>}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* ─── SIDEBAR ─── */}
          <aside className="gmc-sidebar">
            {/* Share */}
            <div className="gmc-card gmc-share">
              <h3 className="gmc-card-title">Share</h3>
              <div className="gmc-share-btns">
                <button type="button" className="gmc-share-btn gmc-share-btn--x" onClick={() => handleShare('twitter')}>
                  Share on X
                </button>
                <button type="button" className="gmc-share-btn gmc-share-btn--fb" onClick={() => handleShare('facebook')}>
                  Share on Facebook
                </button>
                <button type="button" className="gmc-share-btn" onClick={() => handleShare('copy')}>
                  Copy Link
                </button>
              </div>
            </div>

            {/* Your performance */}
            <div className="gmc-card">
              <h3 className="gmc-card-title">Your Performance</h3>
              <div className="gmc-perf">
                <div className="gmc-perf-item">
                  <span className="gmc-perf-label">Current Rank</span>
                  <span className="gmc-perf-value">{summary.myRank != null ? `#${summary.myRank}` : '—'}</span>
                </div>
                <div className="gmc-perf-item">
                  <span className="gmc-perf-label">Highest Rank</span>
                  <span className="gmc-perf-value">{summary.myHighestRank != null ? `#${summary.myHighestRank}` : '—'}</span>
                </div>
                <div className="gmc-perf-item">
                  <span className="gmc-perf-label">Weekly Change</span>
                  <span className="gmc-perf-value"><WeeklyChange value={summary.myWeeklyChange} /></span>
                </div>
                <div className="gmc-perf-item">
                  <span className="gmc-perf-label">Previous Week</span>
                  <span className="gmc-perf-value">{summary.myPreviousRank != null ? `#${summary.myPreviousRank}` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Why did my rank change (real components only) */}
            {hasComponentData && (
              <div className="gmc-card">
                <h3 className="gmc-card-title">Why Did My Rank Change?</h3>
                <div className="gmc-perf">
                  {myLeagueRow.scoreComponent !== undefined && (
                    <div className="gmc-perf-item">
                      <span className="gmc-perf-label">Score component</span>
                      <span className="gmc-perf-value">{fmtScore(myLeagueRow.scoreComponent)}</span>
                    </div>
                  )}
                  {myLeagueRow.diffComponent !== undefined && (
                    <div className="gmc-perf-item">
                      <span className="gmc-perf-label">Consistency</span>
                      <span className="gmc-perf-value">{fmtScore(myLeagueRow.diffComponent)}</span>
                    </div>
                  )}
                  {myLeagueRow.avgWeeklyScore !== undefined && (
                    <div className="gmc-perf-item">
                      <span className="gmc-perf-label">Avg weekly score</span>
                      <span className="gmc-perf-value">{fmtScore(myLeagueRow.avgWeeklyScore)}</span>
                    </div>
                  )}
                  <div className="gmc-perf-item">
                    <span className="gmc-perf-label">Weekly change</span>
                    <span className="gmc-perf-value"><WeeklyChange value={myLeagueRow.weeklyChange} /></span>
                  </div>
                  <div className="gmc-perf-item">
                    <span className="gmc-perf-label">Rank change</span>
                    <span className="gmc-perf-value">
                      {myLeagueRow.rankChange == null ? (
                        <span className="gmc-muted">—</span>
                      ) : myLeagueRow.rankChange > 0 ? (
                        <span className="gmc-change--up">↑ {myLeagueRow.rankChange}</span>
                      ) : myLeagueRow.rankChange < 0 ? (
                        <span className="gmc-change--down">↓ {Math.abs(myLeagueRow.rankChange)}</span>
                      ) : (
                        <span className="gmc-muted">0</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GM score over time */}
            <div className="gmc-card">
              <h3 className="gmc-card-title">GM Score Over Time</h3>
              {history === null ? (
                <span className="gmc-skel-bar gmc-skel-bar--chart" />
              ) : (
                <HistoryChart points={history} />
              )}
            </div>

            {/* FAQ */}
            <FaqCard />
          </aside>
        </div>
      </div>
    </div>
  )
}

export default GMChallenge
