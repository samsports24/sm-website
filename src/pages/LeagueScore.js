import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Pagination from '../components/Pagination'
import { getScheduleByWeek, getWeeklyNflSchedule, getGameDetails, updateWeek } from '../redux'
import { useSelector, useDispatch } from 'react-redux'
import Player1 from '../assets/player-img-60x60.png'
import { positions } from '../config/constants'
import PlayerAvatar from '../components/PlayerAvatar'
import MATCH_EMPTY from '../assets/match-empty.png'
import '../styles/pages/liveScoring2.css'

const mapPos = (p) => positions[p] || p

/* ═══════════════════════════════════════════════════════════════
   LIVE SCORING — Redesign (reskin only)
   Data flow preserved verbatim:
     - getScheduleByWeek(SETTING?.week)       → fantasy matchups
     - getWeeklyNflSchedule({ week })         → NFL games ticker
     - getGameDetails({ team1, team2, week }) → per-matchup rosters
     - updateWeek (redux) via week selector
     - refetch on [SETTING?.week, currentLeagueId]
   ═══════════════════════════════════════════════════════════════ */

/* ── count-up animation for score changes (no deps) ── */
const useCountUp = (target, duration = 550) => {
  const [val, setVal] = useState(Number(target) || 0)
  const prevRef = useRef(Number(target) || 0)
  useEffect(() => {
    const from = prevRef.current
    const to = Number(target) || 0
    if (from === to) {
      setVal(to)
      return undefined
    }
    let raf
    const start = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    const tick = (now) => {
      const t = (typeof performance !== 'undefined' ? now : Date.now())
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else prevRef.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

const fmt = (n) => (Number(n) || 0).toFixed(1)
const fmt2 = (n) => (Number(n) || 0).toFixed(2)

const shortName = (p) =>
  (p?.Name && p.Name.length >= 17 ? p?.ShortName : p?.Name) || p?.ShortName || '—'

const teamName = (t) => t?.name || t?.teamName || 'Team'
const teamOwner = (t) => t?.user?.username || t?.user?.name || ''

/* status classification for a fantasy matchup (derived from real fields) */
const matchupStatus = (m) => {
  const s1 = Number(m?.scoreOne) || 0
  const s2 = Number(m?.scoreTwo) || 0
  if (s1 > 0 || s2 > 0) return 'live'
  return 'upcoming'
}

const camelToTitle = (str) =>
  !str ? '' : str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase())

const LeagueScore = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const currentLeagueId = useSelector((state) => state?.user?.userDetails?.team?.currentLeague?._id)
  const leagueName = useSelector(
    (state) => state?.user?.userDetails?.team?.currentLeague?.name
  )
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = localStorage.getItem('token')
  !isAuthenticated && navigate('/transactions')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [carouselData, setCarouselData] = useState([])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('lsc_tab') || 'box'
    } catch (e) {
      return 'box'
    }
  })

  // Per-matchup game-details cache (preserved mechanism)
  const [gameDetailsCache, setGameDetailsCache] = useState({})
  const [detailsLoading, setDetailsLoading] = useState({})

  useEffect(() => {
    getDataByWeek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SETTING?.week, currentLeagueId])

  const getDataByWeek = async () => {
    setLoading(true)
    setGameDetailsCache({})
    setSelectedIndex(0)
    const res = await getScheduleByWeek(SETTING?.week)
    setData(Array.isArray(res) ? res : [])
    const schedule = await getWeeklyNflSchedule({ week: SETTING?.week })
    setCarouselData(Array.isArray(schedule) ? schedule : [])
    setLoading(false)
  }

  const handlePagination = (page) => {
    dispatch(updateWeek(page))
  }

  const goWeek = (delta) => {
    const next = (Number(SETTING?.week) || 1) + delta
    if (next < 1) return
    dispatch(updateWeek(next))
  }

  // Fetch game details for a matchup (cached) — preserved endpoint & payload
  const fetchDetails = useCallback(
    async (matchIndex, matchData) => {
      if (gameDetailsCache[matchIndex]) return gameDetailsCache[matchIndex]
      setDetailsLoading((p) => ({ ...p, [matchIndex]: true }))
      const d = await getGameDetails({
        team1: matchData?.opponentOne?._id,
        team2: matchData?.opponentTwo?._id,
        week: SETTING?.week,
      })
      setGameDetailsCache((p) => ({ ...p, [matchIndex]: d }))
      setDetailsLoading((p) => ({ ...p, [matchIndex]: false }))
      return d
    },
    [SETTING?.week, gameDetailsCache]
  )

  // Load details for the currently selected matchup
  useEffect(() => {
    if (loading) return
    const match = data?.[selectedIndex]
    if (match && !gameDetailsCache[selectedIndex]) {
      fetchDetails(selectedIndex, match)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, loading, data])

  const selectTab = (key) => {
    setActiveTab(key)
    try {
      localStorage.setItem('lsc_tab', key)
    } catch (e) {
      /* ignore */
    }
  }

  // NFL game lookup by team abbreviation (real data from getWeeklyNflSchedule)
  const nflGameMap = useMemo(() => {
    const map = {}
    ;(carouselData || []).forEach((g) => {
      if (g?.HomeTeam) map[g.HomeTeam] = g
      if (g?.AwayTeam) map[g.AwayTeam] = g
    })
    return map
  }, [carouselData])

  const selectedMatch = data?.[selectedIndex] || null
  const details = gameDetailsCache[selectedIndex]
  const isDetailsLoading = detailsLoading[selectedIndex]

  const weekNum = Number(SETTING?.week) || 1

  return (
    <div className='lsc-root'>
      <Header />

      <div className='lsc-wrap'>
        {/* ═══════ HEADER ═══════ */}
        <div className='lsc-header'>
          <div>
            <h1 className='lsc-title'>
              LIVE <span>SCORING</span>
            </h1>
            <p className='lsc-subtitle'>
              <span className='lsc-live-dot' />
              <span className='lsc-league-chip'>{leagueName || 'League'}</span>
              <span>Week {weekNum}</span>
            </p>
          </div>

          {/* Week selector — reuses updateWeek + Pagination logic */}
          <div className='lsc-week'>
            <span className='lsc-week-label'>Week</span>
            <button
              className='lsc-week-btn'
              onClick={() => goWeek(-1)}
              disabled={weekNum <= 1}
              aria-label='Previous week'
            >
              ‹
            </button>
            <span className='lsc-week-current'>Week {weekNum}</span>
            <button
              className='lsc-week-btn'
              onClick={() => goWeek(1)}
              aria-label='Next week'
            >
              ›
            </button>
            {/* Go-to-week (original Ant pagination, kept for parity/accessibility) */}
            <Pagination
              title=''
              current={weekNum}
              defaultCurrent={weekNum}
              total={230}
              onChange={handlePagination}
            />
          </div>
        </div>

        {/* ═══════ NFL TICKER (getWeeklyNflSchedule) ═══════ */}
        {carouselData?.length > 0 && (
          <>
            <div className='lsc-section-label'>Around the NFL</div>
            <div className='lsc-nfl-strip'>
              {carouselData.map((v, i) => {
                const isLive = v?.Status === 'InProgress'
                const status =
                  v?.AwayTeam === 'BYE'
                    ? `${v?.HomeTeam} BYE`
                    : v?.Status === 'Final'
                    ? 'FINAL'
                    : v?.Status === 'Scheduled'
                    ? 'SCHED'
                    : v?.Status || '—'
                return (
                  <div className='lsc-nfl-card' key={i}>
                    <div className='lsc-nfl-row'>
                      <span className={`lsc-nfl-team ${isLive ? 'lsc-live' : ''}`}>{v?.AwayTeam}</span>
                      <span className={`lsc-nfl-score ${isLive ? 'lsc-live' : ''}`}>
                        {v?.AwayScore > 0 ? v?.AwayScore : '-'}
                      </span>
                    </div>
                    <div className='lsc-nfl-row'>
                      <span className={`lsc-nfl-team ${isLive ? 'lsc-live' : ''}`}>{v?.HomeTeam}</span>
                      <span className={`lsc-nfl-score ${isLive ? 'lsc-live' : ''}`}>
                        {v?.HomeScore > 0 ? v?.HomeScore : '-'}
                      </span>
                    </div>
                    <div className={`lsc-nfl-status ${isLive ? 'lsc-live' : ''}`}>{status}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ═══════ MATCHUP CAROUSEL ═══════ */}
        <div className='lsc-section-label'>Matchups</div>
        {loading ? (
          <div className='lsc-carousel'>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className='lsc-skel lsc-skel-card' />
            ))}
          </div>
        ) : data?.length === 0 ? (
          <EmptyState
            image={MATCH_EMPTY}
            title='No matchups this week'
            text='There is no schedule available for the selected week yet.'
          />
        ) : (
          <MatchupCarousel
            data={data}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        )}

        {/* ═══════ HERO + BODY ═══════ */}
        {!loading && data?.length > 0 && selectedMatch && (
          <div className='lsc-grid lsc-fade'>
            <div className='lsc-main'>
              <MatchupHero
                match={selectedMatch}
                nflGames={carouselData}
                details={details}
              />

              {/* Tabs */}
              <div className='lsc-tabs' role='tablist'>
                {[
                  { key: 'box', label: 'Box Score' },
                  { key: 'breakdown', label: 'Player Breakdown' },
                  { key: 'log', label: 'Scoring Log' },
                ].map((t) => (
                  <button
                    key={t.key}
                    role='tab'
                    aria-selected={activeTab === t.key}
                    className={`lsc-tab ${activeTab === t.key ? 'is-active' : ''}`}
                    onClick={() => selectTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {isDetailsLoading ? (
                <div>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className='lsc-skel lsc-skel-line' />
                  ))}
                </div>
              ) : activeTab === 'box' ? (
                <BoxScoreTab match={selectedMatch} details={details} nflGameMap={nflGameMap} />
              ) : activeTab === 'breakdown' ? (
                <PlayerBreakdownTab match={selectedMatch} details={details} />
              ) : (
                <ScoringLogTab />
              )}
            </div>

            {/* Sidebar */}
            <MatchupSidebar
              match={selectedMatch}
              details={details}
              onViewFull={() => navigate('/game-details', { state: { data: selectedMatch } })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MATCHUP CAROUSEL
   ═══════════════════════════════════════════════════════════════ */
const MatchupCarousel = ({ data, selectedIndex, onSelect }) => (
  <div className='lsc-carousel' role='listbox' aria-label='Matchups'>
    {data.map((m, i) => {
      const s1 = Number(m?.scoreOne) || 0
      const s2 = Number(m?.scoreTwo) || 0
      const lead1 = s1 > s2
      const lead2 = s2 > s1
      const status = matchupStatus(m)
      return (
        <button
          key={m?._id || i}
          role='option'
          aria-selected={selectedIndex === i}
          className={`lsc-mcard ${selectedIndex === i ? 'is-active' : ''}`}
          onClick={() => onSelect(i)}
        >
          <div className='lsc-mcard-status'>
            {status === 'live' ? (
              <>
                <span className='lsc-live-dot' />
                <span className='lsc-live'>LIVE</span>
              </>
            ) : (
              <span>UPCOMING</span>
            )}
          </div>

          {[
            { t: m?.opponentOne, s: s1, lead: lead1 },
            { t: m?.opponentTwo, s: s2, lead: lead2 },
          ].map((row, ri) => (
            <div className='lsc-mcard-team' key={ri}>
              <div
                className='lsc-logo'
                style={{ backgroundImage: `url(${row.t?.logo})` }}
              />
              <div className='lsc-mcard-meta'>
                <div className='lsc-mcard-name'>{teamName(row.t)}</div>
                {teamOwner(row.t) ? (
                  <div className='lsc-mcard-owner'>{teamOwner(row.t)}</div>
                ) : (
                  <div className='lsc-mcard-owner'>—</div>
                )}
              </div>
              <div className={`lsc-mcard-score ${row.lead ? 'lsc-score-lead' : 'lsc-score-dim'}`}>
                {fmt(row.s)}
              </div>
            </div>
          ))}
        </button>
      )
    })}
  </div>
)

/* ═══════════════════════════════════════════════════════════════
   MATCHUP HERO — animated scores + progress bar
   ═══════════════════════════════════════════════════════════════ */
const MatchupHero = ({ match, nflGames, details }) => {
  const s1 = Number(match?.scoreOne) || 0
  const s2 = Number(match?.scoreTwo) || 0
  const a1 = useCountUp(s1)
  const a2 = useCountUp(s2)
  const lead1 = s1 > s2
  const lead2 = s2 > s1
  const total = s1 + s2
  const share1 = total > 0 ? (s1 / total) * 100 : 50

  // YTP (Yet To Play) = starters whose game isn't locked yet (real). PMR (Points
  // Max Remaining) needs projections, which the API doesn't provide → shown as 0.
  const hr1 = buildRoster(details, 'player1')
  const hr2 = buildRoster(details, 'player2')
  const ytp1 = hr1.starters.filter((p) => !p?.isPlayerLocked).length
  const ytp2 = hr2.starters.filter((p) => !p?.isPlayerLocked).length

  const liveGames = (nflGames || []).filter((g) => g?.Status === 'InProgress').length
  const started = matchupStatus(match) === 'live'
  const t1 = match?.opponentOne
  const t2 = match?.opponentTwo

  return (
    <div className='lsc-hero'>
      <div className='lsc-hero-status'>
        {started ? (
          <>
            <span className='lsc-live-dot' />
            <span className='lsc-live'>LIVE</span>
            {liveGames > 0 && <span>· {liveGames} NFL game{liveGames > 1 ? 's' : ''} in progress</span>}
          </>
        ) : (
          <span>MATCHUP · GAMES NOT STARTED</span>
        )}
      </div>

      <div className='lsc-hero-body'>
        <div className='lsc-hero-team'>
          <div className='lsc-hero-logo' style={{ backgroundImage: `url(${t1?.logo})` }} />
          <div className='lsc-hero-name'>{teamName(t1)}</div>
          <div className='lsc-hero-owner'>{teamOwner(t1) || '—'}</div>
          <div className='lsc-hero-score' style={{ color: lead1 ? 'var(--lsc-green)' : 'var(--lsc-text)' }}>
            {fmt2(a1)}
          </div>
          <div className='lsc-hero-ytp'>YTP: {ytp1} · PMR: 0</div>
        </div>

        <div className='lsc-hero-vs'>VS</div>

        <div className='lsc-hero-team'>
          <div className='lsc-hero-logo' style={{ backgroundImage: `url(${t2?.logo})` }} />
          <div className='lsc-hero-name'>{teamName(t2)}</div>
          <div className='lsc-hero-owner'>{teamOwner(t2) || '—'}</div>
          <div className='lsc-hero-score' style={{ color: lead2 ? 'var(--lsc-green)' : 'var(--lsc-text)' }}>
            {fmt2(a2)}
          </div>
          <div className='lsc-hero-ytp'>YTP: {ytp2} · PMR: 0</div>
        </div>
      </div>

      {started ? (
        <>
          <div className='lsc-progress'>
            <div className='lsc-progress-fill' style={{ width: `${share1}%` }} />
          </div>
          <div className='lsc-progress-legend'>
            <span>{fmt(s1)}</span>
            <span>{fmt(s2)}</span>
          </div>
        </>
      ) : (
        <div className='lsc-hero-empty'>
          Games haven&apos;t started for this matchup yet — check back once kickoff begins.
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Roster extraction helpers (from getGameDetails)
   ═══════════════════════════════════════════════════════════════ */
const buildRoster = (details, side) => {
  const starters = (details?.starters || [])
    .map((s) => ({ ...(s?.[side] || {}), position: s?.position, _bench: false }))
    .filter((p) => p?.Name || p?.ShortName)
  const benchArr = side === 'player1' ? details?.bench1 || [] : details?.bench2 || []
  const bench = benchArr
    .map((b) => ({ ...(b?.players || {}), position: 'BNH', _bench: true }))
    .filter((p) => p?.Name || p?.ShortName)
  return { starters, bench }
}

const ptsClass = (score) => {
  const s = Number(score) || 0
  if (s > 10) return 'lsc-pts-hot'
  if (s > 5) return 'lsc-pts-warm'
  if (s > 0) return ''
  return 'lsc-pts-cold'
}

/* NFL game cell — real mapping from player.Team → NFL schedule */
const NflGameCell = ({ team, nflGameMap }) => {
  const g = team ? nflGameMap[team] : null
  if (!g) return <div className='lsc-pgame'>—</div>
  const opp = g.HomeTeam === team ? `vs ${g.AwayTeam}` : `@ ${g.HomeTeam}`
  const isLive = g.Status === 'InProgress'
  const label =
    isLive ? 'live' : g.Status === 'Final' ? 'final' : g.Status === 'Scheduled' ? 'sched' : (g.Status || '')
  const cls = isLive ? 'lsc-chip-live' : g.Status === 'Final' ? 'lsc-chip-final' : 'lsc-chip-sched'
  return (
    <div className='lsc-pgame'>
      {opp}
      <small>
        <span className={`lsc-chip ${cls}`}>{label}</span>
      </small>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PLAYER STAT BREAKDOWN (real playerScoreBreakDown; OL-aware)
   ═══════════════════════════════════════════════════════════════ */
const PlayerStatBreakdown = ({ player }) => {
  const breakdown = player?.playerScoreBreakDown || []
  if (!breakdown || breakdown.length === 0) {
    return <div className='lsc-note'>Detailed stats unavailable — fantasy points: {fmt2(player?.playerScore)}</div>
  }
  const isOL =
    player?.FantasyPosition === 'OL' ||
    ['OL', 'G', 'OT', 'C'].includes(player?.Position)

  if (isOL && typeof breakdown[0] === 'object' && breakdown[0] && !breakdown[0].metric) {
    const rows = Object.entries(breakdown[0]).filter(([k]) => k !== 'playerSnap')
    return (
      <div>
        {rows.map(([metric, units], i) => (
          <div className='lsc-stat-row' key={i}>
            <span className='lsc-stat-metric'>{camelToTitle(metric)}</span>
            <span className='lsc-stat-val'>{String(units)}</span>
            <span className='lsc-stat-pts' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {breakdown.map((b, i) => (
        <div className='lsc-stat-row' key={i}>
          <span className='lsc-stat-metric'>{camelToTitle(b?.metric)}</span>
          <span className='lsc-stat-val'>{b?.units}</span>
          <span className='lsc-stat-pts'>{b?.total != null ? fmt2(b.total) : '—'}</span>
        </div>
      ))}
    </div>
  )
}

/* single expandable player row */
const PlayerRow = ({ player, nflGameMap, expanded, onToggle }) => {
  const score = Number(player?.playerScore) || 0
  return (
    <>
      <button
        className={`lsc-prow ${player?._bench ? 'is-bench' : ''}`}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className='lsc-pos'>{mapPos(player?.Position) || player?.position || '—'}</span>
        <span className='lsc-pname'>
          <PlayerAvatar name={shortName(player)} src={player?.HostedHeadshotNoBackgroundUrl || Player1} size={26} />
          <span className='lsc-pname-text'>{shortName(player)}</span>
        </span>
        <NflGameCell team={player?.Team} nflGameMap={nflGameMap} />
        <span className={`lsc-ppts ${ptsClass(score)}`}>{score > 0 ? fmt(score) : '—'}</span>
      </button>
      {expanded && (
        <div className='lsc-expand'>
          <PlayerStatBreakdown player={player} />
          {player?._bench && score > 0 && (
            <div className='lsc-note'>Bench counts at 25%: {fmt2(score * 0.25)}</div>
          )}
        </div>
      )}
    </>
  )
}

/* one team's roster table */
const RosterTable = ({ team, score, roster, nflGameMap }) => {
  const [openKey, setOpenKey] = useState(null)
  const all = [...roster.starters, ...roster.bench]
  const firstBenchIdx = roster.starters.length

  return (
    <div className='lsc-roster'>
      <div className='lsc-roster-head'>
        <div className='lsc-logo' style={{ backgroundImage: `url(${team?.logo})` }} />
        <div className='lsc-roster-title'>{teamName(team)}</div>
        <div className='lsc-roster-total'>{fmt2(score)}</div>
      </div>
      <div className='lsc-cols'>
        <span>Pos</span>
        <span>Player</span>
        <span>NFL Game</span>
        <span>Pts</span>
      </div>
      {all.length === 0 ? (
        <div className='lsc-note' style={{ padding: '14px' }}>No roster data available.</div>
      ) : (
        all.map((p, i) => (
          <React.Fragment key={i}>
            {i === firstBenchIdx && roster.bench.length > 0 && (
              <div className='lsc-bench-sep'>Bench · 25% value</div>
            )}
            <PlayerRow
              player={p}
              nflGameMap={nflGameMap}
              expanded={openKey === i}
              onToggle={() => setOpenKey(openKey === i ? null : i)}
            />
          </React.Fragment>
        ))
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BOX SCORE TAB — two side-by-side roster tables
   ═══════════════════════════════════════════════════════════════ */
const BoxScoreTab = ({ match, details, nflGameMap }) => {
  const r1 = buildRoster(details, 'player1')
  const r2 = buildRoster(details, 'player2')
  if (!details) {
    return (
      <EmptyState icon='📋' title='Box score unavailable' text='Roster details could not be loaded for this matchup.' />
    )
  }
  return (
    <div className='lsc-box-grid lsc-fade'>
      <RosterTable team={match?.opponentOne} score={match?.scoreOne} roster={r1} nflGameMap={nflGameMap} />
      <RosterTable team={match?.opponentTwo} score={match?.scoreTwo} roster={r2} nflGameMap={nflGameMap} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PLAYER BREAKDOWN TAB — expand any player for real stat splits
   ═══════════════════════════════════════════════════════════════ */
const PlayerBreakdownTab = ({ match, details }) => {
  const [openKey, setOpenKey] = useState(null)
  if (!details) {
    return <EmptyState icon='📊' title='Breakdown unavailable' text='Player stats could not be loaded for this matchup.' />
  }
  const teams = [
    { team: match?.opponentOne, roster: buildRoster(details, 'player1'), side: 'a' },
    { team: match?.opponentTwo, roster: buildRoster(details, 'player2'), side: 'b' },
  ]
  return (
    <div className='lsc-fade'>
      {teams.map((tm) => {
        const all = [...tm.roster.starters, ...tm.roster.bench]
        return (
          <div key={tm.side}>
            <div className='lsc-pb-team-label'>{teamName(tm.team)}</div>
            <div className='lsc-pb-list'>
              {all.length === 0 ? (
                <div className='lsc-note' style={{ padding: 14 }}>No players available.</div>
              ) : (
                all.map((p, i) => {
                  const key = `${tm.side}-${i}`
                  const score = Number(p?.playerScore) || 0
                  return (
                    <React.Fragment key={key}>
                      <button
                        className={`lsc-prow ${p?._bench ? 'is-bench' : ''}`}
                        onClick={() => setOpenKey(openKey === key ? null : key)}
                        aria-expanded={openKey === key}
                      >
                        <span className='lsc-pos'>{mapPos(p?.Position) || p?.position || '—'}</span>
                        <span className='lsc-pname'>
                          <PlayerAvatar name={shortName(p)} src={p?.HostedHeadshotNoBackgroundUrl || Player1} size={26} />
                          <span className='lsc-pname-text'>{shortName(p)}</span>
                        </span>
                        <span className='lsc-pgame'>{p?.Team || '—'}</span>
                        <span className={`lsc-ppts ${ptsClass(score)}`}>{score > 0 ? fmt(score) : '—'}</span>
                      </button>
                      {openKey === key && (
                        <div className='lsc-expand'>
                          <PlayerStatBreakdown player={p} />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCORING LOG TAB — no scoring-event source exists (honest empty)
   ═══════════════════════════════════════════════════════════════ */
const ScoringLogTab = () => (
  <EmptyState
    icon='🧾'
    title='No scoring feed available'
    text="A chronological scoring-event feed isn't provided by the scoring engine for this league. Player point totals update live in the Box Score tab."
  />
)

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════ */
const MatchupSidebar = ({ match, details, onViewFull }) => {
  const s1 = Number(match?.scoreOne) || 0
  const s2 = Number(match?.scoreTwo) || 0
  const lead1 = s1 > s2
  const tied = s1 === s2
  const margin = Math.abs(s1 - s2)
  const leader = lead1 ? match?.opponentOne : match?.opponentTwo

  const r1 = buildRoster(details, 'player1')
  const r2 = buildRoster(details, 'player2')

  // real: starters locked (game started) vs remaining, via isPlayerLocked
  const lockedCount = (roster) => roster.starters.filter((p) => p?.isPlayerLocked).length
  const startersLocked1 = lockedCount(r1)
  const startersLocked2 = lockedCount(r2)
  const remaining1 = r1.starters.length - startersLocked1
  const remaining2 = r2.starters.length - startersLocked2

  // top performers across the matchup (real playerScore)
  const tagged = [
    ...r1.starters.map((p) => ({ ...p, _team: teamName(match?.opponentOne) })),
    ...r1.bench.map((p) => ({ ...p, _team: teamName(match?.opponentOne) })),
    ...r2.starters.map((p) => ({ ...p, _team: teamName(match?.opponentTwo) })),
    ...r2.bench.map((p) => ({ ...p, _team: teamName(match?.opponentTwo) })),
  ]
    .filter((p) => (Number(p?.playerScore) || 0) > 0)
    .sort((a, b) => (Number(b?.playerScore) || 0) - (Number(a?.playerScore) || 0))
    .slice(0, 5)

  const hasRoster = r1.starters.length > 0 || r2.starters.length > 0

  return (
    <div className='lsc-side'>
      {/* Matchup Summary */}
      <div className='lsc-panel'>
        <div className='lsc-panel-title'>Matchup Summary</div>
        {tied ? (
          <div className='lsc-tied'>Tied at {fmt2(s1)}</div>
        ) : (
          <div className='lsc-winner'>
            <div className='lsc-logo' style={{ backgroundImage: `url(${leader?.logo})` }} />
            <div className='lsc-winner-name'>{teamName(leader)}</div>
            <div className='lsc-winner-margin'>+{fmt2(margin)}</div>
          </div>
        )}
      </div>

      {/* Quick Comparison — only real, derivable metrics */}
      {hasRoster && (
        <div className='lsc-panel'>
          <div className='lsc-panel-title'>Quick Comparison</div>
          <div className='lsc-cmp-row'>
            <span className='lsc-cmp-num l'>{startersLocked1}/{r1.starters.length}</span>
            <span className='lsc-cmp-label'>Starters Played</span>
            <span className='lsc-cmp-num r'>{startersLocked2}/{r2.starters.length}</span>
          </div>
          <div className='lsc-cmp-row'>
            <span className='lsc-cmp-num l'>{remaining1}</span>
            <span className='lsc-cmp-label'>Players Left</span>
            <span className='lsc-cmp-num r'>{remaining2}</span>
          </div>
          <div className='lsc-cmp-row'>
            <span className='lsc-cmp-num l'>{remaining1}</span>
            <span className='lsc-cmp-label'>YTP</span>
            <span className='lsc-cmp-num r'>{remaining2}</span>
          </div>
          <div className='lsc-cmp-row'>
            <span className='lsc-cmp-num l'>0</span>
            <span className='lsc-cmp-label' title='Points Max Remaining — needs projections (unavailable)'>PMR</span>
            <span className='lsc-cmp-num r'>0</span>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {tagged.length > 0 && (
        <div className='lsc-panel'>
          <div className='lsc-panel-title'>Top Performers</div>
          {tagged.map((p, i) => (
            <div className='lsc-top-row' key={i}>
              <span className='lsc-top-rank'>{i + 1}</span>
              <PlayerAvatar name={shortName(p)} src={p?.HostedHeadshotNoBackgroundUrl || Player1} size={30} />
              <div className='lsc-top-meta'>
                <div className='lsc-top-name'>{shortName(p)}</div>
                <div className='lsc-top-sub'>
                  {mapPos(p?.Position)} · {p?.Team || '—'} · {p?._team}
                </div>
              </div>
              <span className='lsc-top-pts'>{fmt(p?.playerScore)}</span>
            </div>
          ))}
        </div>
      )}

      <button className='lsc-full-btn lsc-tap' onClick={onViewFull}>
        View Full Box Score
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ icon, title, text, image }) => (
  <div className='lsc-empty lsc-fade'>
    {image ? (
      <img
        src={image}
        alt=''
        style={{ display: 'block', width: '100%', maxWidth: 460, margin: '0 auto 8px', mixBlendMode: 'screen' }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    ) : (
      <div className='lsc-empty-icon'>{icon}</div>
    )}
    <p className='lsc-empty-title'>{title}</p>
    <p className='lsc-empty-text'>{text}</p>
  </div>
)

export default LeagueScore
