import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Select } from 'antd'
import Header from '../../components/Header'
import PlayerAvatar from '../../components/PlayerAvatar'
import TeamLogo from '../../components/TeamLogo'
import RosterPlayerPopup from '../../components/modal/RosterPlayerPopup'
import { getProfessionalLeagueRanks, getWeeklyNflSchedule } from '../../redux/actions/leagueActions'
import { getTeamRoster } from '../../redux/actions/rosterAction'
import { getMyPicks } from '../../redux/actions/exchangeActions'
import { getPf } from '../../config/helperFunctions'
import { getLineupGroups } from '../../config/lineupFormations'
import HERO_ART from '../../assets/home-hero.png'
import '../../styles/pages/rosterBoard.css'

const { Option } = Select

/* ── IDP position palette (matches Starting XI + roster) ── */
const POS_COLORS = {
  QB: '#8b5cf6', RB: '#24d26c', WR: '#3b82f6', TE: '#f6c453', OL: '#f97316',
  DL: '#ef4444', LB: '#ec4899', DB: '#06b6d4', K: '#a78bfa', P: '#64748b',
  FLEX: '#a855f7', OTHER: '#5b657a',
}
/* Roster summary uses real IDP position groups (no team DEF) */
const SUMMARY_POS = [
  { key: 'QB', label: 'QB' }, { key: 'RB', label: 'RB' }, { key: 'WR', label: 'WR' },
  { key: 'TE', label: 'TE' }, { key: 'OL', label: 'OL' }, { key: 'DL', label: 'DL' },
  { key: 'LB', label: 'LB' }, { key: 'DB', label: 'DB' }, { key: 'K', label: 'K' },
]
const ROSTER_LIMIT = 69
/* Full starting lineup slots are now derived from the VIEWED team's saved
   offense/defense formation via getLineupGroups() — see the useMemo below. */

/* ── Field-name-tolerant IDP bucketer ── */
const posBucket = (pl) => {
  if (!pl) return 'OTHER'
  if (String(pl.FantasyPosition || '').toUpperCase() === 'OL') return 'OL'
  const p = String(pl.Position || '').toUpperCase()
  if (p === 'QB') return 'QB'
  if (['RB', 'HB', 'FB'].includes(p)) return 'RB'
  if (p === 'WR') return 'WR'
  if (p === 'TE') return 'TE'
  if (['C', 'G', 'T', 'OG', 'OT', 'LT', 'RT', 'LG', 'RG', 'OL', 'LS'].includes(p)) return 'OL'
  if (['DE', 'DT', 'NT', 'EDGE', 'DL'].includes(p)) return 'DL'
  if (['LB', 'ILB', 'OLB', 'MLB'].includes(p)) return 'LB'
  if (['CB', 'S', 'FS', 'SS', 'DB', 'SAF'].includes(p)) return 'DB'
  if (['K', 'PK'].includes(p)) return 'K'
  if (p === 'P') return 'P'
  return 'OTHER'
}
const scoreOf = (pl) => {
  if (!pl) return 0
  if (Array.isArray(pl.playerScore)) return Number(getPf(pl.playerScore)?.apf) || 0
  if (Array.isArray(pl.scores)) return Number(getPf(pl.scores)?.apf) || 0
  return Number(pl.projectedPoints ?? pl.projected ?? pl.pf ?? pl.avgPf ?? 0) || 0
}
const ovrOf = (pl) => Number(pl?.OVR ?? pl?.overall ?? pl?.ovr ?? pl?.rating ?? 0) || 0

/* Format an NFL kickoff into "Sun 1:00 PM" */
const fmtKick = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  const day = d.toLocaleDateString('en-US', { weekday: 'short' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} ${time}`
}

const slotMatch = (slot, bucket) =>
  slot === 'FLEX' ? ['RB', 'WR', 'TE'].includes(bucket) : slot === bucket

const RosterBoard = () => {
  const user = useSelector((s) => s.user)
  const setting = useSelector((s) => s?.user?.setting)
  const currentWeek = setting?.week ?? 0
  const myTeamId = user?.userDetails?.team?._id || user?.team?._id
  const location = useLocation()
  // A team can be preselected when arriving from Standings "View Team" or a
  // legacy team-roster link (via navigation state or ?team=<id>).
  const preselectTeamId = location?.state?.teamId || new URLSearchParams(location?.search || '').get('team') || null

  const [ranks, setRanks] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [opponentId, setOpponentId] = useState(null)
  const [week, setWeek] = useState(currentWeek)
  const [roster, setRoster] = useState(null)
  const [picks, setPicks] = useState([])
  const [schedule, setSchedule] = useState({ map: {}, loaded: false })
  const [activeEntry, setActiveEntry] = useState(null)
  const [rosterNonce, setRosterNonce] = useState(0)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingRoster, setLoadingRoster] = useState(true)
  const [filters, setFilters] = useState({ dynasty: true, supplemental: true, hideElim: false })

  /* Teams (ranks) */
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoadingTeams(true)
      const data = await getProfessionalLeagueRanks(currentWeek)
      if (!alive) return
      setRanks(data)
      const list = data?.teamRanks || []
      const hasPreselect = preselectTeamId && list.some((e) => (e.team?._id || e.teamId) === preselectTeamId)
      const initial = (hasPreselect && preselectTeamId) || myTeamId || list[0]?.team?._id
      setSelectedTeamId(initial)
      const opp = list.find((e) => (e.team?._id || e.teamId) !== initial)
      setOpponentId(opp?.team?._id || opp?.teamId || null)
      setLoadingTeams(false)
    })()
    return () => { alive = false }
  }, [currentWeek, myTeamId, preselectTeamId])

  /* Roster for selected team + week */
  useEffect(() => {
    if (!selectedTeamId) return
    let alive = true
    ;(async () => {
      setLoadingRoster(true)
      const res = await getTeamRoster({ week, team: selectedTeamId })
      if (!alive) return
      setRoster(res || null)
      setLoadingRoster(false)
    })()
    return () => { alive = false }
  }, [selectedTeamId, week, rosterNonce])

  /* NFL schedule for the selected week → team-abbr → game map.
     Fills the kickoff / opponent line on every card once schedule data exists
     (after the season schedule is populated and users have drafted). */
  useEffect(() => {
    let alive = true
    ;(async () => {
      setSchedule({ map: {}, loaded: false })
      const games = await getWeeklyNflSchedule({ week })
      if (!alive) return
      const map = {}
      if (Array.isArray(games)) {
        games.forEach((g) => {
          const home = String(g.HomeTeam || '').toUpperCase()
          const away = String(g.AwayTeam || '').toUpperCase()
          const time = fmtKick(g.DateTime || g.Day || g.Date)
          if (home && home !== 'BYE') map[home] = { opp: away, home: true, time }
          if (away && away !== 'BYE') map[away] = { opp: home, home: false, time }
        })
      }
      setSchedule({ map, loaded: true })
    })()
    return () => { alive = false }
  }, [week])

  /* Own future picks (only available for the signed-in user's team) */
  useEffect(() => {
    let alive = true
    ;(async () => {
      const p = await getMyPicks('nfl')
      if (alive) setPicks(Array.isArray(p) ? p : [])
    })()
    return () => { alive = false }
  }, [])

  const teams = ranks?.teamRanks || []
  const selectedEntry = useMemo(
    () => teams.find((e) => (e.team?._id || e.teamId) === selectedTeamId),
    [teams, selectedTeamId]
  )
  const selRank = useMemo(
    () => teams.findIndex((e) => (e.team?._id || e.teamId) === selectedTeamId) + 1,
    [teams, selectedTeamId]
  )
  const team = selectedEntry?.team || {}
  const score = selectedEntry?.teamScore || {}
  const isOwnTeam = selectedTeamId === myTeamId

  /* Filter helper (dynasty / supplemental / eliminated) */
  const passFilters = (e) => {
    if (!filters.dynasty && e?.source === 'dynasty') return false
    if (!filters.supplemental && e?.source === 'supplemental') return false
    if (filters.hideElim && (e?.nflTeamEliminated || e?.players?.nflTeamEliminated)) return false
    return true
  }

  const activeEntries = useMemo(
    () => (roster?.active || []).filter(passFilters),
    [roster, filters] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const practiceEntries = useMemo(
    () => (roster?.practice || []).filter(passFilters),
    [roster, filters] // eslint-disable-line react-hooks/exhaustive-deps
  )

  /* Starting-lineup slot set for the VIEWED team, driven by its saved
     offense/defense formation (falls back to sane defaults when missing). */
  const lineupGroups = useMemo(
    () => getLineupGroups(roster?.offense_Formation, roster?.defense_Formation),
    [roster?.offense_Formation, roster?.defense_Formation]
  )
  const totalSlotCount = useMemo(
    () => lineupGroups.reduce((n, g) => n + g.slots.length, 0),
    [lineupGroups]
  )

  /* Derive starters per group (best available per slot) + bench (active, unused) */
  const { starterGroups, bench } = useMemo(() => {
    const pool = [...activeEntries]
      .filter((e) => e.players?.isActive !== false)
      .sort((a, b) => scoreOf(b.players) - scoreOf(a.players))
    const used = new Set()
    const assign = (slot) => {
      const pick = pool.find((e) => !used.has(e) && slotMatch(slot, posBucket(e.players)))
      if (pick) used.add(pick)
      return { slot, entry: pick || null }
    }
    const groups = lineupGroups.map((g) => ({ label: g.label, items: g.slots.map(assign) }))
    return { starterGroups: groups, bench: activeEntries.filter((e) => !used.has(e)) }
  }, [activeEntries, lineupGroups])

  /* Practice squad = poachable (unprotected); protected = locked */
  const practiceSquad = useMemo(
    () => practiceEntries.filter((e) => !e.players?.isPlayerProtected),
    [practiceEntries]
  )
  const protectedList = useMemo(
    () => practiceEntries.filter((e) => e.players?.isPlayerProtected),
    [practiceEntries]
  )

  /* Roster summary counts (IDP position groups) */
  const summary = useMemo(() => {
    const counts = {}
    ;[...activeEntries, ...practiceEntries].forEach((e) => {
      const b = posBucket(e.players)
      counts[b] = (counts[b] || 0) + 1
    })
    return { counts, total: activeEntries.length + practiceEntries.length }
  }, [activeEntries, practiceEntries])

  /* Draft-pick grid (own team only has data) */
  const pickGrid = useMemo(() => {
    const years = []
    const baseYear = Number(setting?.season) || new Date().getFullYear()
    for (let y = 0; y < 3; y++) years.push(baseYear + y)
    const map = {}
    if (isOwnTeam) {
      picks.forEach((p) => {
        const yr = Number(p.season)
        const rd = Number(p.round)
        if (!yr || !rd) return
        if (!map[yr]) map[yr] = {}
        map[yr][rd] = { owner: team?.abbreviation || team?.name?.slice(0, 3)?.toUpperCase() || '—', traded: !!p.isTraded }
      })
    }
    return { years, map }
  }, [picks, isOwnTeam, setting?.season, team])

  const budget = roster?.currentyearsalarycap
  const budgetTxt = budget != null ? `$${(Number(budget) / 1_000_000).toFixed(1)}M` : '—'
  const samPoints = team?.samPoints ?? team?.sam_points ?? user?.samPoints
  const samTxt = samPoints != null ? Number(samPoints).toLocaleString() : '—'
  const record = `${score.win ?? 0} - ${score.lose ?? 0}`
  const leagueName = team?.league?.name || team?.leagueName || setting?.league?.name || 'Sam Football League'

  const teamLabel = (e) => e.team?.name || 'Team'
  const teamVal = (e) => e.team?._id || e.teamId

  /* Resolve a player's game for the selected week (null until schedule loads, BYE if no game) */
  const gameFor = (pl) => {
    const abbr = String(pl?.Team || '').toUpperCase()
    if (!abbr) return null
    const g = schedule.map[abbr]
    if (g) return g
    return schedule.loaded ? { bye: true } : null
  }

  return (
    <div className="rb-page">
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Header />

      <div className="rb-inner">
        {/* Title + Select Team */}
        <div className="rb-titlerow">
          <div>
            <h1 className="rb-title">Roster Board</h1>
            <p className="rb-sub">View opponent rosters within the league.</p>
          </div>
          <div className="rb-field">
            <span className="rb-field-lbl">Select Team</span>
            <Select
              className="rb-select"
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              loading={loadingTeams}
              popupClassName="rb-dropdown"
              placeholder="Select a team"
            >
              {teams.map((e) => (
                <Option key={teamVal(e)} value={teamVal(e)}>{teamLabel(e)}</Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className="rb-filters" role="group" aria-label="Draft pick filters">
          <FilterChip
            on={filters.dynasty}
            title="Dynasty Asset (Original)"
            hint="Include original draft picks"
            onToggle={() => setFilters((f) => ({ ...f, dynasty: !f.dynasty }))}
          />
          <FilterChip
            on={filters.supplemental}
            title="Supplemental Draft"
            hint="Include supplemental picks"
            onToggle={() => setFilters((f) => ({ ...f, supplemental: !f.supplemental }))}
          />
          <FilterChip
            on={filters.hideElim}
            title="Eliminated (NFL team out)"
            hint="Hide eliminated teams"
            onToggle={() => setFilters((f) => ({ ...f, hideElim: !f.hideElim }))}
          />
        </div>

        {!loadingTeams && teams.length === 0 ? (
          <div className="rb-card rb-empty">
            <div className="rb-empty-ico">📋</div>
            <h3 className="rb-empty-title">No league rosters yet</h3>
            <p className="rb-empty-msg">
              Once your league is set up and teams have drafted, you&apos;ll be able to scout every roster here, compare lineups, and study future draft picks.
            </p>
            <button className="rb-empty-cta" onClick={() => window.location.assign('/league')}>Go to League</button>
          </div>
        ) : (
        <>
        {/* Hero + side controls */}
        <div className="rb-herorow">
          <div className="rb-hero">
            <img className="rb-hero-art" src={HERO_ART} alt="" onError={(e) => { e.target.style.display = 'none' }} />
            <TeamLogo team={team} size={108} round={false} className="rb-hero-logo" />
            <div className="rb-hero-body">
              <div className="rb-hero-name-row">
                <h2 className="rb-hero-name">{team?.name || (loadingTeams ? 'Loading…' : 'Select a team')}</h2>
                {isOwnTeam && <span className="rb-hero-edit" title="Edit team">✎</span>}
              </div>
              <div className="rb-hero-league">{team?.name ? leagueName : ''}</div>
              <div className="rb-hero-stats">
                <div><div className="rb-stat-lbl">Record</div><div className="rb-stat-val">{record}</div></div>
                <div><div className="rb-stat-lbl">Rank</div><div className="rb-stat-val">{selRank > 0 ? `#${selRank}` : '—'}</div></div>
                <div><div className="rb-stat-lbl">SamPoints Balance</div><div className="rb-stat-val rb-purple">{samTxt}</div></div>
                <div><div className="rb-stat-lbl">Budget Left</div><div className="rb-stat-val rb-green">{budgetTxt}</div></div>
              </div>
            </div>
          </div>

          <div className="rb-sidectrl">
            <div className="rb-field">
              <span className="rb-field-lbl">Opponent</span>
              <Select className="rb-select" value={opponentId} onChange={setOpponentId} placeholder="Opponent">
                {teams.filter((e) => teamVal(e) !== selectedTeamId).map((e) => (
                  <Option key={teamVal(e)} value={teamVal(e)}>{teamLabel(e)}</Option>
                ))}
              </Select>
            </div>
            <div className="rb-field">
              <span className="rb-field-lbl">Week</span>
              <Select className="rb-select" value={week} onChange={setWeek} placeholder="Week">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                  <Option key={w} value={w}>Week {w}</Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Main: lineup | bench */}
        <div className="rb-maingrid">
          <div className="rb-card">
            <h3 className="rb-card-title">Starting Lineup</h3>
            {loadingRoster ? (
              <div className="rb-lineup-grid">
                {Array.from({ length: totalSlotCount }).map((_, i) => <div key={i} className="rb-skel rb-skel-slot" />)}
              </div>
            ) : (
              <>
                {starterGroups.map((g) => (
                  <div className="rb-lineup-group" key={g.label}>
                    <div className="rb-lineup-grouplabel">{g.label}</div>
                    <div className="rb-lineup-grid">
                      {g.items.map(({ slot, entry }, i) => (
                        <StarterCard key={i} slot={slot} entry={entry} game={entry?.players ? gameFor(entry.players) : null} onOpen={setActiveEntry} />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rb-lineup-legend">
                  <span><span className="rb-dot" style={{ background: '#b794ff' }} /> Projected Points</span>
                  <span><span className="rb-dot" style={{ background: '#fff' }} /> OVR</span>
                </div>
              </>
            )}
          </div>

          <div className="rb-rightcol">
            <RosterListCard title="Bench" titleClass="rb-t-purple" rows={bench} loading={loadingRoster} gameFor={gameFor} onOpen={setActiveEntry} emptyText="No bench players." />
            <RosterListCard title="Practice Squad" titleClass="rb-t-gold" badge="Poachable" badgeColor="#24d26c" rows={practiceSquad} loading={loadingRoster} gameFor={gameFor} onOpen={setActiveEntry} emptyText="No practice-squad players." />
            <RosterListCard title="Protected" badge="Locked" badgeColor="#f6c453" rows={protectedList} loading={loadingRoster} gameFor={gameFor} onOpen={setActiveEntry} emptyText="No protected players." />
          </div>
        </div>

        {/* Bottom: picks | legend | summary */}
        <div className="rb-botgrid">
          <div className="rb-card">
            <h3 className="rb-card-title rb-t-gold">Future Draft Picks</h3>
            <table className="rb-picks">
              <thead>
                <tr>
                  <th>Year</th>
                  {[1, 2, 3, 4, 5, 6, 7].map((r) => <th key={r}>Round {r}</th>)}
                </tr>
              </thead>
              <tbody>
                {pickGrid.years.map((yr) => (
                  <tr key={yr}>
                    <td>{yr}</td>
                    {[1, 2, 3, 4, 5, 6, 7].map((r) => {
                      const cell = pickGrid.map[yr]?.[r]
                      return (
                        <td key={r}>
                          {cell ? (
                            <span className={`rb-pick-cell ${cell.traded ? 'rb-pick-traded' : ''}`}>
                              {team?.logo && <TeamLogo team={team} size={16} round={false} />}{cell.owner}
                            </span>
                          ) : (
                            <span className="rb-pick-none">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {!isOwnTeam && (
              <p className="rb-picks-note">Detailed pick ownership is shown for your own team. Select your team to view your future picks.</p>
            )}
          </div>

          <div className="rb-card">
            <h3 className="rb-card-title">Legend</h3>
            <div className="rb-legend-list">
              <LegendItem color="#b794ff" label="Projected Points" />
              <LegendItem color={POS_COLORS.RB} label="Opponent Rank" />
              <LegendItem color={POS_COLORS.TE} label="Questionable" />
              <LegendItem color={POS_COLORS.DEF} label="Injured" />
              <LegendItem color="#5b657a" label="Bye Week" />
              <LegendItem color={POS_COLORS.QB} label="Dynasty Asset" />
              <LegendItem color={POS_COLORS.WR} label="Supplemental Draft" />
            </div>
          </div>

          <div className="rb-card">
            <h3 className="rb-card-title rb-t-purple">Roster Summary</h3>
            <div className="rb-summary">
              <Donut counts={summary.counts} total={summary.total} loading={loadingRoster} />
              <div className="rb-sum-rows">
                {SUMMARY_POS.map((p) => (
                  <div key={p.key} className="rb-sum-row">
                    <span className="rb-dot" style={{ background: POS_COLORS[p.key] }} />
                    <span className="rb-sum-pos">{p.label}</span>
                    <span className="rb-sum-cnt">{summary.counts[p.key] || 0}</span>
                  </div>
                ))}
                <div className="rb-sum-total">
                  <span className="rb-sum-pos">Total</span>
                  <b>{summary.total} / {ROSTER_LIMIT}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {activeEntry && (
        <RosterPlayerPopup
          entry={activeEntry}
          teamId={selectedTeamId}
          teamName={team?.name}
          isOwnTeam={isOwnTeam}
          onClose={() => setActiveEntry(null)}
          onPoached={() => { setActiveEntry(null); setRosterNonce((n) => n + 1) }}
        />
      )}
    </div>
  )
}

/* ── Sub-components ── */

const FilterChip = ({ on, title, hint, onToggle }) => (
  <div
    className={`rb-filter ${on ? 'rb-filter--on' : ''}`}
    role="checkbox" aria-checked={on} tabIndex={0}
    onClick={onToggle}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
  >
    <div className="rb-filter-box">{on ? '✓' : ''}</div>
    <div className="rb-filter-txt">
      <span className="rb-filter-title">{title}</span>
      <span className="rb-filter-hint">{hint}</span>
    </div>
  </div>
)

const gameText = (g) => {
  if (!g) return ''
  if (g.bye) return 'BYE'
  const vs = g.opp ? ` ${g.home ? 'vs' : '@'} ${g.opp}` : ''
  return `${g.time || ''}${vs}`.trim()
}

const StarterCard = ({ slot, entry, game, onOpen }) => {
  const pl = entry?.players
  const color = POS_COLORS[slot] || '#fff'
  if (!pl) {
    return (
      <div className="rb-slot" style={{ cursor: 'default' }}>
        <span className="rb-slot-pos" style={{ color }}>{slot}</span>
        <div className="rb-slot-empty">Empty</div>
      </div>
    )
  }
  const gt = gameText(game)
  return (
    <div className="rb-slot" onClick={() => onOpen?.(entry)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(entry) } }}>
      <span className="rb-slot-pos" style={{ color }}>{slot}</span>
      <div className="rb-slot-avatar">
        <PlayerAvatar name={pl.Name} src={pl.HostedHeadshotNoBackgroundUrl} size={56} />
      </div>
      <div className="rb-slot-name">{pl.Name || 'Unknown'}</div>
      <div className="rb-slot-meta">{`${pl.Position || ''} · ${pl.Team || 'FA'}`}</div>
      {gt && <div className="rb-slot-game">{gt}</div>}
      <div className="rb-slot-foot">
        <span className="rb-slot-ovr">{ovrOf(pl) || '—'}</span>
        <span className="rb-slot-proj">{scoreOf(pl).toFixed(1)}</span>
      </div>
    </div>
  )
}

const RosterListCard = ({ title, titleClass, badge, badgeColor, rows, loading, gameFor, onOpen, emptyText }) => (
  <div className="rb-card">
    <h3 className={`rb-card-title ${titleClass || ''}`}>
      {title}
      {!loading && <span className="rb-count-pill">{rows.length}</span>}
      {badge && (
        <span className="rb-poach-pill" style={badgeColor ? { color: badgeColor, borderColor: badgeColor } : undefined}>{badge}</span>
      )}
    </h3>
    {loading ? (
      <div className="rb-bench-list">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="rb-skel rb-skel-row" />)}
      </div>
    ) : rows.length ? (
      <div className="rb-bench-list">
        {rows.map((e, i) => <BenchRow key={i} entry={e} game={gameFor(e.players)} onOpen={onOpen} />)}
      </div>
    ) : (
      <p className="rb-slot-empty" style={{ padding: '18px 0' }}>{emptyText}</p>
    )}
  </div>
)

const BenchRow = ({ entry, game, onOpen }) => {
  const pl = entry?.players
  if (!pl) return null
  return (
    <div className="rb-bench-row" onClick={() => onOpen?.(entry)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(entry) } }}>
      <span className="rb-bench-tag">BN</span>
      <PlayerAvatar name={pl.Name} src={pl.HostedHeadshotNoBackgroundUrl} size={30} />
      <div>
        <div className="rb-bench-name">{pl.Name || 'Unknown'}</div>
        <div className="rb-bench-meta">{pl.Position || ''} · {pl.Team || 'FA'}</div>
      </div>
      <div className="rb-bench-game">{gameText(game)}</div>
      <div className="rb-bench-nums">
        <div className="rb-bench-ovr">{ovrOf(pl) || '—'}</div>
        <div className="rb-bench-proj">{scoreOf(pl).toFixed(1)}</div>
      </div>
    </div>
  )
}

const LegendItem = ({ color, label }) => (
  <div className="rb-legend-item">
    <span className="rb-legend-swatch" style={{ background: color }} />
    {label}
  </div>
)

const Donut = ({ counts, total, loading }) => {
  const segs = SUMMARY_POS
    .map((p) => ({ color: POS_COLORS[p.key], val: counts[p.key] || 0 }))
    .filter((s) => s.val > 0)
  const other = (counts.OTHER || 0)
  if (other > 0) segs.push({ color: POS_COLORS.OTHER, val: other })
  const sum = segs.reduce((a, s) => a + s.val, 0) || 1
  const R = 54, C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="rb-donut-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#1b2233" strokeWidth="16" />
        {!loading && segs.map((s, i) => {
          const len = (s.val / sum) * C
          const el = (
            <circle
              key={i} cx="64" cy="64" r={R} fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              transform="rotate(-90 64 64)" strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="rb-donut-center">
        <div>
          <div className="rb-donut-num">{loading ? '—' : total}</div>
          <div className="rb-donut-lbl">Players</div>
        </div>
      </div>
    </div>
  )
}

export default RosterBoard
