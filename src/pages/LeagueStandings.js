import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from 'react-icons/fi'

import Header from '../components/Header'
import CommissionerBadge from '../components/CommissionerBadge'
import { getLeagueStandings, updateWeek } from '../redux'
import ATLANTA_LEGION_LOGO from '../assets/AtlantaLegionLogo.png'
import HIGHEST_SCORING_BADGE from '../assets/highest-scoring-team.png'
import BEST_DEFENSE_BADGE from '../assets/best-defense.png'
import MOST_WINS_BADGE from '../assets/most-wins.png'
import BEST_DIFF_BADGE from '../assets/best-point-differential.png'

import '../styles/pages/leagueStandings2.css'

/* ── Small count-up number (subtle animation) ── */
const CountUp = ({ value, decimals = 0, duration = 700 }) => {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const to = Number(value) || 0
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(to * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])
  return <>{display.toFixed(decimals)}</>
}

/* ── Tier helpers (rank-based; league payload has no playoff-spot field) ── */
const TIER_META = {
  bye: { label: 'Bye Round', groupLabel: 'Bye (Top Seeds)' },
  playoff: { label: 'Playoff Berth', groupLabel: 'Playoffs' },
  wildcard: { label: 'Wild Card', groupLabel: 'Wild Card' },
  out: { label: 'Eliminated', groupLabel: 'Out' },
}

// Teams without a logo on their record can be given a temporary local fallback
// image here, keyed by lowercased name. Remove once a real logo is uploaded.
const LOGO_FALLBACKS = {
  'atlanta alliance': ATLANTA_LEGION_LOGO,
}

const Logo = ({ team, cls, phCls }) => {
  // A broken/404 logo URL would otherwise show the browser's broken-image icon.
  // Fall back to the team initial when the image fails to load.
  const [broken, setBroken] = useState(false)
  const src = team?.logo || LOGO_FALLBACKS[(team?.name || '').trim().toLowerCase()]
  if (src && !broken) {
    return <img src={src} className={cls} alt='' onError={() => setBroken(true)} />
  }
  return (
    <div className={phCls} style={{ background: team?.teamColor || '#141a26' }}>
      {(team?.name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

const LeagueStandings = () => {
  const setting = useSelector((state) => state?.user?.setting)
  const USER = useSelector((state) => state.user?.userDetails)
  const currentWeek = useSelector((state) => state?.user?.currentWeek)
  const currentLeagueId = useSelector((state) => state?.user?.userDetails?.team?.currentLeague?._id)
  const currentTeamId = useSelector((state) => state?.user?.userDetails?.team?._id)
  const leagueName = USER?.team?.currentLeague?.name || 'League'

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [standings, setStandings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all') // all | playoff | eliminated
  const [expandedId, setExpandedId] = useState(null)

  const week = setting?.week ?? 0

  useEffect(() => {
    if (currentLeagueId) {
      getData()
    } else {
      setStandings(null)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting?.week, currentLeagueId])

  const getData = async () => {
    setLoading(true)
    const data = await getLeagueStandings(setting?.week)
    setStandings(data)
    setLoading(false)
  }

  /* ── Preserved row actions (same behavior/routes as before) ── */
  const handleTeamClick = (teamId) => {
    if (USER?.team?._id === teamId) {
      navigate('/player-roster')
    } else {
      // Roster Board is the single home for viewing another team's roster.
      navigate('/roster-board', { state: { teamId } })
    }
  }

  const handleStartersClick = (teamId, teamName) => {
    if (USER?.team?._id === teamId) {
      navigate('/depth-chart')
    } else {
      navigate(`/team-starters/${teamId}`, { state: { teamName } })
    }
  }

  /* ── Week selector reuses existing redux week logic (updateWeek + currentWeek bound) ── */
  const canPrev = week > 1
  const canNext = currentWeek ? week < currentWeek : false
  const goPrev = () => canPrev && dispatch(updateWeek(week - 1))
  const goNext = () => canNext && dispatch(updateWeek(week + 1))

  /* ── Flatten conference/division standings into one league-wide ranked list ── */
  const allTeams = useMemo(() => {
    const rows = []
    standings?.teamRanks?.forEach((div) => {
      ;(div?.standing || []).forEach((entry) => {
        rows.push({ ...entry, _division: div?._id, _conference: div?.conference })
      })
    })
    rows.sort((a, b) => {
      const wDiff = (b.teamScore?.win || 0) - (a.teamScore?.win || 0)
      if (wDiff !== 0) return wDiff
      return (b.teamScore?.avgPf || 0) - (a.teamScore?.avgPf || 0)
    })
    return rows.map((r, i) => ({ ...r, _rank: i + 1 }))
  }, [standings])

  const total = allTeams.length
  const playoffLine = Math.max(1, Math.ceil(total / 2))
  const byeCount = Math.min(2, playoffLine)

  const tierOf = (rank) => {
    if (rank <= byeCount) return 'bye'
    if (rank < playoffLine) return 'playoff'
    if (rank === playoffLine) return 'wildcard'
    return 'out'
  }

  /* ── League leaders (only fields that are real / derivable from teamScore) ── */
  const leaders = useMemo(() => {
    if (!allTeams.length) return null
    const played = allTeams.filter((t) => {
      const s = t.teamScore || {}
      return (s.win || 0) + (s.lose || 0) + (s.tie || 0) > 0
    })
    const pool = played.length ? played : allTeams
    const best = (fn, min) =>
      pool.reduce((a, b) => (min ? (fn(b) < fn(a) ? b : a) : fn(b) > fn(a) ? b : a))
    return {
      pf: best((t) => t.teamScore?.pf || 0),
      pa: best((t) => (t.teamScore?.pa ?? Infinity), true),
      win: best((t) => t.teamScore?.win || 0),
      diff: best((t) => (t.teamScore?.pf || 0) - (t.teamScore?.pa || 0)),
    }
  }, [allTeams])

  /* ── Client-side search + tier filter (no refetch) ── */
  const visibleTeams = useMemo(() => {
    let rows = allTeams
    if (tierFilter === 'playoff') rows = rows.filter((t) => t._rank <= playoffLine)
    else if (tierFilter === 'eliminated') rows = rows.filter((t) => t._rank > playoffLine)
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (t) =>
          (t.team?.name || '').toLowerCase().includes(q) ||
          (t.team?.user?.userName || '').toLowerCase().includes(q)
      )
    }
    return rows
  }, [allTeams, tierFilter, search, playoffLine])

  const showSeparators = tierFilter === 'all' && !search.trim()
  const toggleRow = (id) => setExpandedId((cur) => (cur === id ? null : id))

  const hasStandings = !loading && standings?.teamRanks?.length && week > 0 && total > 0

  return (
    <div className='lst-page'>
      <Header />

      <div className='lst-wrap'>
        {/* HEADER */}
        <div className='lst-hdr'>
          <div>
            <span className='lst-hdr-tick' />
            <h1 className='lst-title'>League Standings</h1>
            <p className='lst-sub'>
              <b>{leagueName}</b> • Week {week || '—'} • Regular Season
            </p>
          </div>

          <div className='lst-hdr-tools'>
            <div className='lst-week'>
              <button
                className='lst-week-btn'
                onClick={goPrev}
                disabled={!canPrev}
                aria-label='Previous week'
              >
                <FiChevronLeft />
              </button>
              <span className='lst-week-label'>Week {week || '—'}</span>
              <button
                className='lst-week-btn'
                onClick={goNext}
                disabled={!canNext}
                aria-label='Next week'
              >
                <FiChevronRight />
              </button>
            </div>

            <div className='lst-search'>
              <FiSearch size={15} />
              <input
                type='text'
                placeholder='Search team…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label='Search team'
              />
            </div>

            <div className='lst-pills' role='tablist' aria-label='Filter standings'>
              {[
                { k: 'all', label: 'All' },
                { k: 'playoff', label: 'Playoff' },
                { k: 'eliminated', label: 'Eliminated' },
              ].map((p) => (
                <button
                  key={p.k}
                  role='tab'
                  aria-selected={tierFilter === p.k}
                  data-tier={p.k}
                  className={`lst-pill ${tierFilter === p.k ? 'is-active' : ''}`}
                  onClick={() => setTierFilter(p.k)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {!loading && !hasStandings ? (
          <div className='lst-empty'>
            <div className='lst-empty-ic'>🏈</div>
            <h3>No Standings Yet</h3>
            <p>Season starts soon.</p>
          </div>
        ) : (
          <>
            {/* MAIN COLUMN */}
            <div className='lst-main'>
              <div className='lst-card'>
                <div className='lst-table-scroll'>
                  <div className='lst-grid'>
                    {/* head */}
                    <div className='lst-head'>
                      <span className='lst-th'>#</span>
                      <span className='lst-th'></span>
                      <span className='lst-th l'>Team</span>
                      <span className='lst-th'>Record</span>
                      <span className='lst-th'>PCT</span>
                      <span className='lst-th'>PF</span>
                      <span className='lst-th'>PA</span>
                      <span className='lst-th'>Streak</span>
                      <span className='lst-th'>Last 5</span>
                      <span className='lst-th'>Actions</span>
                    </div>

                    {/* loading skeleton rows */}
                    {loading &&
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={`sk-${i}`} className='lst-skel-row'>
                          <span className='lst-skel sm' style={{ width: 22 }} />
                          <span className='lst-skel dot' />
                          <span className='lst-skel line' style={{ maxWidth: 180 }} />
                          <span className='lst-skel sm' />
                          <span className='lst-skel sm' />
                          <span className='lst-skel sm' />
                        </div>
                      ))}

                    {/* rows */}
                    {!loading &&
                      visibleTeams.map((entry) => {
                        const s = entry.teamScore || {}
                        const team = entry.team || {}
                        const w = s.win || 0
                        const l = s.lose || 0
                        const t = s.tie || 0
                        const totalGames = w + l + t
                        const pct = totalGames > 0 ? (w / totalGames).toFixed(3) : '.000'
                        const rank = entry._rank
                        const tier = tierOf(rank)
                        const isMe = currentTeamId && entry.teamId === currentTeamId
                        const isOpen = expandedId === (entry._id || entry.teamId)
                        const rowId = entry._id || entry.teamId
                        const diff = (s.pf || 0) - (s.pa || 0)

                        return (
                          <div className='lst-row-outer' key={rowId}>
                            <div
                              className={`lst-row ${isMe ? 'is-me' : ''} ${isOpen ? 'is-open' : ''}`}
                              role='button'
                              tabIndex={0}
                              aria-expanded={isOpen}
                              onClick={() => toggleRow(rowId)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  toggleRow(rowId)
                                }
                              }}
                            >
                              <span className='lst-td'>
                                <span className={`lst-rank t-${tier}`}>{rank}</span>
                              </span>

                              {/* Trend: no week-over-week snapshot in payload → neutral */}
                              <span className='lst-trend' aria-label='No trend data'>
                                <FiMinus size={13} />
                              </span>

                              <span className='lst-td'>
                                <span className='lst-team'>
                                  <Logo team={team} cls='lst-logo' phCls='lst-logo-ph' />
                                  <span className='lst-team-meta'>
                                    <span className='lst-team-name'>
                                      {team?.name || 'Unknown'}
                                      <CommissionerBadge show={team?.isCommissioner && !team?.hideCommissionerBadge} />
                                      {isMe && <span className='lst-me-tag'>YOU</span>}
                                    </span>
                                    <span className='lst-team-owner'>
                                      {team?.user?.userName ? `@${team.user.userName}` : '—'}
                                    </span>
                                  </span>
                                </span>
                              </span>

                              <span className='lst-td lst-rec'>
                                <b>{w}</b>
                                <span>-{l}-{t}</span>
                              </span>
                              <span className='lst-td'>{pct}</span>
                              <span className='lst-td lst-pf'>{s.pf != null ? s.pf.toFixed(1) : '—'}</span>
                              <span className='lst-td lst-pa'>{s.pa != null ? s.pa.toFixed(1) : '—'}</span>
                              {/* Streak / Last 5 not present in ranks payload */}
                              <span className='lst-td lst-na'>—</span>
                              <span className='lst-td lst-na'>—</span>

                              <span className='lst-td'>
                                <span className='lst-actions'>
                                  <button
                                    className='lst-starters'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartersClick(entry.teamId, team?.name)
                                    }}
                                  >
                                    Starters
                                  </button>
                                  <span className={`lst-chev ${isOpen ? 'open' : ''}`}>
                                    <FiChevronDown size={16} />
                                  </span>
                                </span>
                              </span>
                            </div>

                            {/* EXPANDED */}
                            {isOpen && (
                              <div className='lst-expand'>
                                <div className='lst-expand-inner'>
                                  <div className='lst-tile'>
                                    <div className='lst-tile-label'>Overall Record</div>
                                    <div className='lst-tile-value'>
                                      {w}-{l}-{t}
                                    </div>
                                  </div>
                                  <div className='lst-tile'>
                                    <div className='lst-tile-label'>Current Rank</div>
                                    <div className='lst-tile-value'>
                                      #{rank} <span className='u'>/ {total}</span>
                                    </div>
                                  </div>
                                  <div className='lst-tile'>
                                    <div className='lst-tile-label'>Standing</div>
                                    <div className='lst-tile-value small'>{TIER_META[tier].label}</div>
                                  </div>
                                  <div className='lst-tile'>
                                    <div className='lst-tile-label'>Avg PF / PA</div>
                                    <div className='lst-tile-value small'>
                                      {s.avgPf != null ? s.avgPf.toFixed(1) : '—'}
                                      <span className='u'> / </span>
                                      {s.avgPa != null ? s.avgPa.toFixed(1) : '—'}
                                    </div>
                                  </div>
                                  <div className='lst-tile'>
                                    <div className='lst-tile-label'>Point Diff</div>
                                    <div className='lst-tile-value small'>
                                      {diff > 0 ? '+' : ''}
                                      {diff.toFixed(1)}
                                    </div>
                                  </div>
                                  <div className='lst-tile'>
                                    <div className='lst-tile-label'>Div / Conf</div>
                                    <div className='lst-tile-value small'>
                                      {s.divWin ?? 0}-{s.divLose ?? 0}-{s.divTie ?? 0}
                                      <span className='u'> · </span>
                                      {s.confWin ?? 0}-{s.confLose ?? 0}-{s.confTie ?? 0}
                                    </div>
                                  </div>

                                  <div className='lst-qa'>
                                    <button
                                      className='lst-qa-btn'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleTeamClick(entry.teamId)
                                      }}
                                    >
                                      View Team
                                    </button>
                                    <button
                                      className='lst-qa-btn'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate('/roster-board')
                                      }}
                                    >
                                      Roster Board
                                    </button>
                                    <button
                                      className='lst-qa-btn'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate('/all-transaction')
                                      }}
                                    >
                                      Trade History
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* tier separators (only in unfiltered/unsearched view) */}
                            {showSeparators && rank === byeCount && rank < total && (
                              <div className='lst-sep bye'>
                                <span className='lst-sep-line' />
                                <span className='lst-sep-label'>Bye Line</span>
                                <span className='lst-sep-line' />
                              </div>
                            )}
                            {showSeparators &&
                              rank === playoffLine &&
                              rank < total &&
                              rank !== byeCount && (
                                <div className='lst-sep playoff'>
                                  <span className='lst-sep-line' />
                                  <span className='lst-sep-label'>Playoff Line</span>
                                  <span className='lst-sep-line' />
                                </div>
                              )}
                          </div>
                        )
                      })}

                    {!loading && visibleTeams.length === 0 && (
                      <div className='lst-skel-row' style={{ justifyContent: 'center' }}>
                        <span className='lst-td dim'>No teams match your filter.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LEAGUE LEADERS */}
              {!loading && leaders && (
                <>
                  <div className='lst-leaders-hd'>
                    <h3>League Leaders</h3>
                    <button
                      className='lst-viewall'
                      onClick={() => {
                        setTierFilter('all')
                        setSearch('')
                      }}
                    >
                      View All
                    </button>
                  </div>
                  <div className='lst-leaders'>
                    <LeaderCard
                      color='green'
                      img={HIGHEST_SCORING_BADGE}
                      icon='🔥'
                      label='Highest Scoring Team'
                      value={leaders.pf.teamScore?.pf || 0}
                      decimals={1}
                      team={leaders.pf.team}
                    />
                    <LeaderCard
                      color='red'
                      img={BEST_DEFENSE_BADGE}
                      icon='🛡️'
                      label='Lowest Points Against'
                      value={leaders.pa.teamScore?.pa || 0}
                      decimals={1}
                      team={leaders.pa.team}
                    />
                    <LeaderCard
                      color='gold'
                      img={MOST_WINS_BADGE}
                      icon='🏆'
                      label='Most Wins'
                      value={leaders.win.teamScore?.win || 0}
                      decimals={0}
                      team={leaders.win.team}
                    />
                    <LeaderCard
                      color='purple'
                      img={BEST_DIFF_BADGE}
                      icon='📊'
                      label='Best Point Differential'
                      value={(leaders.diff.teamScore?.pf || 0) - (leaders.diff.teamScore?.pa || 0)}
                      decimals={1}
                      signed
                      team={leaders.diff.team}
                    />
                  </div>
                </>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className='lst-side'>
              <div className='lst-panel'>
                <div className='lst-panel-hd'>
                  <span className='lst-panel-tick' />
                  <h3>Playoff Cut</h3>
                </div>

                {loading ? (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`ssk-${i}`} className='lst-seed'>
                        <span className='lst-skel sm' style={{ width: 16 }} />
                        <span className='lst-skel dot' style={{ width: 22, height: 22 }} />
                        <span className='lst-skel line' />
                      </div>
                    ))}
                  </>
                ) : (
                  ['bye', 'playoff', 'wildcard', 'out'].map((tierKey) => {
                    const group = allTeams.filter((tm) => tierOf(tm._rank) === tierKey)
                    if (!group.length) return null
                    return (
                      <div className='lst-cut-group' key={tierKey}>
                        <p className={`lst-cut-gh ${tierKey}`}>
                          <span className='d' />
                          {TIER_META[tierKey].groupLabel}
                        </p>
                        {group.map((tm) => {
                          const s = tm.teamScore || {}
                          const isMe = currentTeamId && tm.teamId === currentTeamId
                          return (
                            <div className={`lst-seed ${isMe ? 'is-me' : ''}`} key={tm._id || tm.teamId}>
                              <span className='lst-seed-no'>{tm._rank}</span>
                              <Logo team={tm.team} cls='lst-seed-logo' phCls='lst-seed-ph' />
                              <span className='lst-seed-name'>
                                {tm.team?.abbreviation || tm.team?.name || 'Team'}
                              </span>
                              <span className='lst-seed-rec'>
                                {s.win || 0}-{s.lose || 0}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              {/* LEGEND */}
              <div className='lst-panel'>
                <div className='lst-panel-hd'>
                  <span className='lst-panel-tick' style={{ background: 'var(--g-purple)' }} />
                  <h3>Legend</h3>
                </div>
                <div className='lst-legend'>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-ic up'>
                      <FiArrowUp size={13} />
                    </span>
                    Moved Up
                  </div>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-ic down'>
                      <FiArrowDown size={13} />
                    </span>
                    Moved Down
                  </div>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-ic flat'>
                      <FiMinus size={13} />
                    </span>
                    No Change
                  </div>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-sw' style={{ background: 'var(--g-gold)' }} />
                    Bye (Top Seeds)
                  </div>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-sw' style={{ background: 'var(--g-green)' }} />
                    Playoffs
                  </div>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-sw' style={{ background: 'var(--g-purple)' }} />
                    Wild Card
                  </div>
                  <div className='lst-legend-row'>
                    <span className='lst-legend-sw' style={{ background: 'var(--g-muted)' }} />
                    Out
                  </div>
                </div>
                <p className='lst-legend-note'>
                  <span className='lst-live-dot' />
                  Standings as of Week {week || '—'}
                </p>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}

/* ── League Leader card ── */
/* Badge image that falls back to an emoji if the PNG fails to load (404),
   instead of showing the browser's broken-image glyph. */
const BadgeIcon = ({ img, icon }) => {
  const [broken, setBroken] = useState(false)
  if (img && !broken) {
    return <img className='lst-leader-ic-img' src={img} alt='' onError={() => setBroken(true)} />
  }
  return <span className='lst-leader-ic'>{icon}</span>
}

const LeaderCard = ({ color, icon, img, label, value, decimals = 0, signed, team }) => (
  <div className={`lst-leader ${color}`}>
    <div className='lst-leader-top'>
      <BadgeIcon img={img} icon={icon} />
      <span className='lst-leader-label'>{label}</span>
    </div>
    <div className='lst-leader-value'>
      {signed && value > 0 ? '+' : ''}
      <CountUp value={value} decimals={decimals} />
    </div>
    <div className='lst-leader-team'>
      <Logo team={team} cls='' phCls='ph' />
      <span>{team?.name || 'Unknown'}</span>
    </div>
  </div>
)

export default LeagueStandings
