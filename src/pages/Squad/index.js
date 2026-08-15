import React, { useEffect, useMemo, useState } from 'react'
import { notification } from 'antd'
import { useSelector } from 'react-redux'
import Header from '../../components/Header'
import HeadingAndWeek from '../../components/Pagination/HeadingAndWeek'
import OnboardingGuide from '../../components/OnboardingGuide'
import PlayerAvatar from '../../components/PlayerAvatar'
import { getPf } from '../../config/helperFunctions'
import { leagueSalaryCap as CAP_FALLBACK } from '../../config/constants'
import { getWeeklyNflSchedule } from '../../redux/actions/leagueActions'
import {
  getRoster, moveToPractice, moveFromPractice, moveToIr, releasePlayer, setNonActivePlayer,
} from '../../redux/actions/rosterAction'
import '../../styles/pages/squad.css'

/* My Team — Squad. Rich fantasy roster over the existing getRoster data:
   Roster / Weekly / Season Stats / Game Log / Position views, status filters,
   customizable columns, and a detailed player drawer. Business logic, APIs,
   Redux and routing unchanged. Every field is read from real data — anything
   without a backing value shows "--" or an "unavailable" state (never invented). */

const MAX_ACTIVE_ROSTER = 53
const MAX_PRACTICE_SQUAD = 16
const MAX_PROTECTED = 4
const POS_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'DEF']
const POS_COLORS = { QB: '#8b5cf6', RB: '#24d26c', WR: '#3b82f6', TE: '#f6c453', OL: '#f97316', DL: '#ef4444', LB: '#ec4899', CB: '#06b6d4', S: '#84cc16', K: '#a78bfa', P: '#64748b', DEF: '#22d3ee' }

const VIEWS = [
  { key: 'roster', label: 'Roster' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'season', label: 'Season Stats' },
  { key: 'gamelog', label: 'Game Log' },
  { key: 'position', label: 'Position View' },
]
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'bench', label: 'Bench' },
  { key: 'practice', label: 'Practice Squad' },
  { key: 'ir', label: 'Injured Reserve' },
  { key: 'protected', label: 'Protected' },
]

/* Roster-view column catalogue. `player` and `actions` are always shown. */
const COLUMNS = [
  { key: 'position', label: 'Position', def: true },
  { key: 'team', label: 'NFL Team', def: true },
  { key: 'opp', label: 'Weekly Opponent', def: false },
  { key: 'gameTime', label: 'Game Time', def: false },
  { key: 'proj', label: 'Weekly Projection', def: true },
  { key: 'lastWk', label: 'Last Week', def: false },
  { key: 'seasonPts', label: 'Season Pts', def: false },
  { key: 'ppg', label: 'PPG', def: true },
  { key: 'ovr', label: 'OVR', def: true },
  { key: 'injury', label: 'Injury Status', def: true },
  { key: 'bye', label: 'Bye', def: true },
  { key: 'contract', label: 'Contract', def: false },
  { key: 'salary', label: 'Salary', def: true },
  { key: 'value', label: 'Market Value', def: true },
]

const money = (n) => (n == null ? '--' : `$${(Number(n) / 1e6).toFixed(1)}M`)
const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
const pv = (p) => p?.players || {}
const pd = (p) => p?.playerDetails || {}
const groupOf = (p) => {
  const fp = pv(p).FantasyPosition
  const pos = pv(p).Position
  if (fp === 'OL') return 'OL'
  return POS_ORDER.includes(pos) ? pos : (POS_ORDER.includes(fp) ? fp : (pos || 'DEF'))
}
const statusOf = (p) => {
  const s = pd(p).InjuryStatus || pv(p).InjuryStatus
  if (!s || s === 'Healthy' || s === 'Active') return { label: 'Active', cls: 'ok' }
  if (s === 'Injured Reserve') return { label: 'IR', cls: 'ir' }
  if (s === 'Questionable') return { label: 'Questionable', cls: 'warn' }
  if (s === 'Doubtful') return { label: 'Doubtful', cls: 'warn' }
  if (s === 'Out') return { label: 'Out', cls: 'bad' }
  return { label: s, cls: 'warn' }
}
const fmtKick = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

const Squad = () => {
  const SETTING = useSelector((s) => s?.user?.setting)
  const currentLeagueId = useSelector((s) => s?.user?.userDetails?.team?.currentLeague?._id)
  const leagueCap = useSelector((s) => s?.user?.leagueSalaryCap)
  const teamCap = useSelector((s) => s?.user?.teamSalaryCap)
  const teamLeague = useSelector((s) => s?.user?.userDetails?.team?.currentLeague)
  const reduxLeague = useSelector((s) => s?.league?.currentLeague)
  // Roster Limit = active roster + practice squad + protected.
  // Full NFL: 53 + 16 + 4 = 73. Offense-only uses its smaller active size (20).
  const activeLeague = (reduxLeague && reduxLeague._id) ? reduxLeague : teamLeague
  const isOffenseOnly = activeLeague?.leagueMode === 'offense_only'
  const activeSize = Number(activeLeague?.activeRosterSize) > 0
    ? Number(activeLeague.activeRosterSize)
    : (isOffenseOnly ? 20 : MAX_ACTIVE_ROSTER)
  const rosterLimit = isOffenseOnly ? activeSize : (activeSize + MAX_PRACTICE_SQUAD + MAX_PROTECTED)
  const { isLoading, data } = useSelector((s) => s?.roster) || {}
  const season = SETTING?.season
  const week = SETTING?.week ?? 0

  const [view, setView] = useState('roster')
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('OVR')
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [schedule, setSchedule] = useState({})
  const [colMenu, setColMenu] = useState(false)
  const [cols, setCols] = useState(() => new Set(COLUMNS.filter((c) => c.def).map((c) => c.key)))

  useEffect(() => { if (SETTING) getRoster(week) }, [SETTING?.week, currentLeagueId]) // eslint-disable-line

  /* NFL schedule for the current week → team-abbr map (opponent + kickoff) */
  useEffect(() => {
    let alive = true
    ;(async () => {
      const games = await getWeeklyNflSchedule({ week })
      if (!alive) return
      const map = {}
      if (Array.isArray(games)) {
        games.forEach((g) => {
          const h = String(g.HomeTeam || '').toUpperCase(); const a = String(g.AwayTeam || '').toUpperCase()
          const t = fmtKick(g.DateTime || g.Day || g.Date)
          if (h && h !== 'BYE') map[h] = { opp: a, home: true, time: t }
          if (a && a !== 'BYE') map[a] = { opp: h, home: false, time: t }
        })
      }
      setSchedule(map)
    })()
    return () => { alive = false }
  }, [week])

  const active = data?.filterActiveRoster || []
  const bench = data?.filterNonActiveRoster || []
  const practice = data?.filterPracticeRoster || []
  const protectedR = data?.filterProtectedRoster || []
  const all = useMemo(() => [...active, ...bench, ...practice, ...protectedR], [active, bench, practice, protectedR])
  const irList = useMemo(() => all.filter((p) => (pd(p).InjuryStatus || pv(p).InjuryStatus) === 'Injured Reserve'), [all])

  const capTable = data?.currentyearsalarycap || {}
  const avgPf = data?.averagePf || {}

  /* ── Real per-player derivations ── */
  const weeklyOf = (p) => {
    const arr = avgPf[pv(p).PlayerID]
    if (!Array.isArray(arr)) return []
    return arr.filter((i) => i && (season == null || i.season === season)).sort((a, b) => (a.week || 0) - (b.week || 0))
  }
  const seasonPtsOf = (p) => weeklyOf(p).reduce((s, i) => s + (Number(i.score) || 0), 0)
  const gamesOf = (p) => weeklyOf(p).filter((i) => Number(i.score) != null && i.week <= week).length
  const ppgOf = (p) => {
    const real = num(pd(p).pointsPerGame)
    if (real != null) return real
    const g = gamesOf(p); const s = seasonPtsOf(p)
    return g > 0 ? s / g : null
  }
  const lastWkOf = (p) => {
    const it = weeklyOf(p).find((i) => i.week === week - 1)
    return it ? Number(it.score) : null
  }
  const projOf = (p) => {
    const w = weeklyOf(p).filter((i) => i.week <= week).slice(-3)
    if (!w.length) return null
    return w.reduce((s, i) => s + (Number(i.score) || 0), 0) / w.length
  }
  const rateOf = (p) => {
    const arr = avgPf[pv(p).PlayerID]
    const v = Array.isArray(arr) ? Number(getPf(arr.filter((i) => i.season === 2024))?.apf) : null
    return v && !Number.isNaN(v) ? Math.round(v) : null
  }
  const salaryOf = (p) => capTable[pv(p).PlayerID] ?? num(pd(p).currentYearSalaryCap)
  const valueOf = (p) => num(pd(p).otcValuation)
  const byeOf = (p) => pd(p).ByeWeek || pv(p).ByeWeek || null
  const gameOf = (p) => schedule[String(pv(p).Team || '').toUpperCase()] || null
  const oppText = (p) => { const g = gameOf(p); return g ? (g.opp ? `${g.home ? 'vs' : '@'} ${g.opp}` : '') : (Object.keys(schedule).length ? 'BYE' : '') }

  const tabData = { all, active, bench, practice, ir: irList, protected: protectedR }[tab] || all

  const filtered = useMemo(() => {
    let list = tabData
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((p) => (pv(p).Name || '').toLowerCase().includes(q)) }
    return list
  }, [tabData, search]) // eslint-disable-line

  const sortList = (arr) => [...arr].sort((a, b) => {
    if (sort === 'OVR') return (rateOf(b) || 0) - (rateOf(a) || 0)
    if (sort === 'Projected') return (projOf(b) || 0) - (projOf(a) || 0)
    if (sort === 'Season Pts') return seasonPtsOf(b) - seasonPtsOf(a)
    if (sort === 'PPG') return (ppgOf(b) || 0) - (ppgOf(a) || 0)
    if (sort === 'Salary') return (salaryOf(b) || 0) - (salaryOf(a) || 0)
    if (sort === 'Value') return (valueOf(b) || 0) - (valueOf(a) || 0)
    return 0
  })

  const flatSorted = useMemo(() => sortList(filtered), [filtered, sort]) // eslint-disable-line
  const groups = useMemo(() => {
    const map = {}
    filtered.forEach((p) => { const g = groupOf(p); (map[g] = map[g] || []).push(p) })
    Object.values(map).forEach((arr) => arr.sort((a, b) => (rateOf(b) || 0) - (rateOf(a) || 0)))
    return POS_ORDER.filter((g) => map[g]?.length).map((g) => ({ g, players: map[g] }))
  }, [filtered]) // eslint-disable-line

  /* ── Summary ── */
  const totalPlayers = all.length
  const CAP_LIMIT = Number(leagueCap) > 0 ? Number(leagueCap) : CAP_FALLBACK
  const summedCap = Object.values(capTable).reduce((s, v) => s + (Number(v) || 0), 0)
  const capUsed = Number(teamCap) > 0 ? Number(teamCap) : summedCap
  const totalProj = all.reduce((s, p) => s + (projOf(p) || 0), 0)
  const rates = all.map(rateOf).filter((v) => v != null)
  const teamOvr = rates.length ? Math.round(rates.reduce((s, v) => s + v, 0) / rates.length) : '--'

  const breakdown = useMemo(() => {
    const map = {}
    all.forEach((p) => { const g = groupOf(p); map[g] = (map[g] || 0) + 1 })
    return POS_ORDER.filter((g) => map[g]).map((g) => ({ g, n: map[g], color: POS_COLORS[g] }))
  }, [all])
  const injuries = useMemo(() => all.filter((p) => { const s = pd(p).InjuryStatus || pv(p).InjuryStatus; return s && s !== 'Healthy' && s !== 'Active' }), [all])

  /* ── Actions ── */
  const act = async (fn) => { setBusy(true); try { await fn() } finally { setBusy(false); setDetail(null) } }
  const toPractice = (p) => act(() => moveToPractice({ id: pv(p).PlayerID, week }))
  const toActive = (p) => act(() => moveFromPractice({ id: pv(p).PlayerID, week }))
  const toIR = (p) => act(() => moveToIr({ id: pv(p).PlayerID, week }))
  const release = (p) => act(async () => { await releasePlayer({ id: pv(p).PlayerID, week }); notification.success({ message: 'Player released', duration: 3 }) })

  const helpers = { weeklyOf, seasonPtsOf, gamesOf, ppgOf, lastWkOf, projOf, rateOf, salaryOf, valueOf, byeOf, gameOf, oppText, cols }
  const statusCounts = { all: all.length, active: active.length, bench: bench.length, practice: practice.length, ir: irList.length, protected: protectedR.length }

  /* ── Squad legality (full NFL only) ──────────────────────────────────────
     To set a lineup you need exactly 46 active + 7 inactive players on the
     53-man roster. Offense-only leagues use their own smaller active roster
     and are exempt from this rule. */
  const REQ_ACTIVE = 46
  const REQ_BENCH = 7
  const activeCount = active.length
  const benchCount = bench.length
  const activeRosterCount = activeCount + benchCount
  const squadLegal = isOffenseOnly || (activeCount === REQ_ACTIVE && benchCount === REQ_BENCH)
  const legalityMsg = isOffenseOnly
    ? null
    : activeRosterCount < REQ_ACTIVE + REQ_BENCH
      ? `Your active roster has ${activeRosterCount}/53 players. Add ${REQ_ACTIVE + REQ_BENCH - activeRosterCount} more (draft or free agency), then set exactly ${REQ_ACTIVE} active and ${REQ_BENCH} inactive.`
      : `You must have exactly ${REQ_ACTIVE} active and ${REQ_BENCH} inactive players. You currently have ${activeCount} active and ${benchCount} inactive — move players between Active and Bench to fix this.`

  /* Active ↔ Bench toggle. /player/set-nonactive takes the COMPLETE list of
     inactive PlayerIDs; every other active-roster player becomes active. */
  const idOf = (p) => pv(p).PlayerID
  const isActiveP = (p) => active.some((x) => idOf(x) === idOf(p))
  const isBenchP = (p) => bench.some((x) => idOf(x) === idOf(p))
  const setActiveState = (p, makeActive) => {
    if (!makeActive && !isOffenseOnly && benchCount >= REQ_BENCH) {
      notification.warning({ message: `You can have at most ${REQ_BENCH} inactive players. Make one active first.`, duration: 4 })
      return
    }
    const id = idOf(p)
    return act(async () => {
      let ids = bench.map(idOf)
      if (makeActive) ids = ids.filter((x) => x !== id)
      else if (!ids.includes(id)) ids.push(id)
      await setNonActivePlayer({ ids }, week)
    })
  }

  return (
    <div className="sq2-wrap">
      <Header />
      <OnboardingGuide tabKey="roster" />
      <div className="sq2">
        <div className="sq2-main">
          {/* Hero */}
          <div className="sq2-hero">
            <div>
              <h1 className="sq2-title">My Squad</h1>
              <p className="sq2-sub">Manage your players, stats, and roster.</p>
            </div>
            <div className="sq2-hero-right"><HeadingAndWeek week={false} /></div>
          </div>

          {/* Illegal-squad banner — hard rule: 46 active + 7 inactive to set a lineup */}
          {!isLoading && !squadLegal && (
            <div className="sq2-illegal" role="alert">
              <span className="sq2-illegal-badge" aria-hidden>&#9888;</span>
              <div className="sq2-illegal-body">
                <div className="sq2-illegal-title">Illegal squad — you can’t set your Starting XI yet</div>
                <div className="sq2-illegal-msg">{legalityMsg}</div>
              </div>
              <div className="sq2-illegal-count">
                <b style={{ color: activeCount === REQ_ACTIVE ? '#24d26c' : '#ef4444' }}>{activeCount}</b>
                <span>/ {REQ_ACTIVE} active</span>
                <b style={{ color: benchCount === REQ_BENCH ? '#24d26c' : '#ef4444', marginLeft: 12 }}>{benchCount}</b>
                <span>/ {REQ_BENCH} inactive</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="sq2-summary">
            <Summary icon={'\u{1F465}'} accent="purple" label="Players" value={`${totalPlayers} / ${rosterLimit}`} sub="Roster Limit" />
            <Summary icon={'\u{1F4B0}'} accent="green" label="Salary Cap" value={money(capUsed)} sub={`of ${money(CAP_LIMIT)}`} />
            <Summary icon={'\u{1F3AF}'} accent="orange" label="Total Projected" value={totalProj ? totalProj.toFixed(1) : '--'} sub="Points" />
            <Summary icon={'\u{1F4C8}'} accent="purple" label="Team OVR" value={teamOvr} sub="Overall" />
            <Summary icon={'\u{1FA79}'} accent="blue" label="Injuries" value={injuries.length} sub="Reported" />
          </div>

          {/* View tabs */}
          <div className="sq2-views2">
            {VIEWS.map((v) => (
              <button key={v.key} className={`sq2-view2${view === v.key ? ' sq2-view2--on' : ''}`} onClick={() => setView(v.key)}>{v.label}</button>
            ))}
          </div>

          {/* Status filters + search + (columns for roster view) */}
          <div className="sq2-controls">
            <div className="sq2-tabs">
              {STATUS_TABS.map((tb) => {
                const target = !isOffenseOnly && tb.key === 'active' ? REQ_ACTIVE : !isOffenseOnly && tb.key === 'bench' ? REQ_BENCH : null
                const off = target != null && statusCounts[tb.key] !== target
                return (
                  <button key={tb.key} className={`sq2-tab${tab === tb.key ? ' sq2-tab--on' : ''}`} onClick={() => setTab(tb.key)}>
                    {tb.label}<span className="sq2-tab-badge" style={off ? { background: '#ef4444', color: '#fff' } : undefined}>{target != null ? `${statusCounts[tb.key]}/${target}` : statusCounts[tb.key]}</span>
                  </button>
                )
              })}
            </div>
            <div className="sq2-controls-right">
              <div className="sq2-search"><span aria-hidden>&#128269;</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…" /></div>
              <select className="sq2-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                {['OVR', 'Projected', 'Season Pts', 'PPG', 'Salary', 'Value'].map((s) => <option key={s}>{s}</option>)}
              </select>
              {view === 'roster' && (
                <div className="sq2-colwrap">
                  <button className="sq2-colbtn" onClick={() => setColMenu((v) => !v)}>&#9776; Columns</button>
                  {colMenu && (
                    <>
                      <div className="sq2-col-backdrop" onClick={() => setColMenu(false)} />
                      <div className="sq2-colmenu" role="menu">
                        {COLUMNS.map((c) => (
                          <label key={c.key} className="sq2-colitem">
                            <input type="checkbox" checked={cols.has(c.key)} onChange={() => setCols((s) => { const n = new Set(s); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n })} />
                            {c.label}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          {isLoading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="sq2-empty">
              <div className="sq2-empty-badge" aria-hidden>{'\u{1F3C8}'}</div>
              <h3>{search ? 'No players match your search' : 'No players here'}</h3>
              <p>{search ? 'Try a different name or clear the search.' : 'Add players from free agency or the draft to start building your franchise.'}</p>
            </div>
          ) : view === 'roster' ? (
            <RosterView groups={groups} helpers={helpers} onOpen={setDetail} />
          ) : view === 'position' ? (
            <RosterView groups={groups} helpers={helpers} onOpen={setDetail} forcePosition />
          ) : view === 'weekly' ? (
            <WeeklyView list={flatSorted} helpers={helpers} onOpen={setDetail} />
          ) : view === 'season' ? (
            <SeasonView list={flatSorted} helpers={helpers} onOpen={setDetail} />
          ) : (
            <GameLogView list={flatSorted} helpers={helpers} expanded={expanded} setExpanded={setExpanded} onOpen={setDetail} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="sq2-side">
          <Donut breakdown={breakdown} total={totalPlayers} />
          <div className="sq2-panel">
            <div className="sq2-panel-hd"><span>SALARY CAP</span></div>
            <div className="sq2-cap-val">{money(capUsed)} <span>/ {money(CAP_LIMIT)}</span></div>
            <div className="sq2-cap-bar"><div style={{ width: `${Math.min(100, (capUsed / CAP_LIMIT) * 100)}%` }} /></div>
            <div className="sq2-cap-space">{money(Math.max(0, CAP_LIMIT - capUsed))} Cap Space</div>
          </div>
          <div className="sq2-panel">
            <div className="sq2-panel-hd"><span>INJURIES</span></div>
            {injuries.length === 0 ? <div className="sq2-side-empty">No injuries reported. Squad is healthy.</div> : injuries.slice(0, 5).map((p, i) => {
              const st = statusOf(p)
              return (
                <div className="sq2-inj" key={i} onClick={() => setDetail(p)}>
                  <PlayerAvatar name={pv(p).Name} src={pv(p).HostedHeadshotNoBackgroundUrl} size={30} />
                  <div><div className="sq2-inj-name">{pv(p).Name}</div><div className="sq2-inj-pos">{pv(p).Position} · {pv(p).Team}</div></div>
                  <span className={`sq2-inj-tag sq2-status--${st.cls}`}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </aside>
      </div>

      {detail && (
        <PlayerDrawer p={detail} busy={busy} onClose={() => setDetail(null)} helpers={helpers} week={week}
          onPractice={() => toPractice(detail)} onActive={() => toActive(detail)} onIR={() => toIR(detail)} onRelease={() => release(detail)}
          isOnActive={isActiveP(detail)} isOnBench={isBenchP(detail)}
          onMakeActive={() => setActiveState(detail, true)} onBench={() => setActiveState(detail, false)} />
      )}
    </div>
  )
}

/* ═══ Views ═══ */

const RosterView = ({ groups, helpers, onOpen, forcePosition }) => {
  const { cols } = helpers
  const show = (k) => forcePosition ? true : cols.has(k)
  const nCols = COLUMNS.filter((c) => show(c.key)).length
  const tpl = `2.2fr ${Array(nCols).fill('0.8fr').join(' ')} 0.3fr`
  const minW = Math.max(720, 300 + nCols * 92)
  const gs = { gridTemplateColumns: tpl, minWidth: minW }
  return (
    <div className="sq2-table sq2-table--scroll">
      <div className="sq2-thead" style={gs}>
        <span className="sq2-c-player">PLAYER</span>
        {show('position') && <span>POS</span>}
        {show('team') && <span>TEAM</span>}
        {show('opp') && <span>OPP</span>}
        {show('gameTime') && <span>GAME</span>}
        {show('proj') && <span>PROJ</span>}
        {show('lastWk') && <span>LAST</span>}
        {show('seasonPts') && <span>SEASON</span>}
        {show('ppg') && <span>PPG</span>}
        {show('ovr') && <span>OVR</span>}
        {show('injury') && <span>STATUS</span>}
        {show('bye') && <span>BYE</span>}
        {show('contract') && <span>YRS</span>}
        {show('salary') && <span>SALARY</span>}
        {show('value') && <span>VALUE</span>}
        <span />
      </div>
      {groups.map(({ g, players }) => (
        <div className="sq2-group" key={g}>
          <div className="sq2-group-hd sq2-group-hd--static" style={{ '--pos': POS_COLORS[g] }}>
            <span className="sq2-group-name">{g} <span className="sq2-group-count">({players.length})</span></span>
          </div>
          {players.map((p, i) => <RosterRow key={pv(p).PlayerID || i} p={p} g={g} helpers={helpers} onOpen={onOpen} show={show} gs={gs} />)}
        </div>
      ))}
    </div>
  )
}

const RosterRow = ({ p, g, helpers, onOpen, show, gs }) => {
  const st = statusOf(p)
  const rate = helpers.rateOf(p); const proj = helpers.projOf(p)
  return (
    <div className="sq2-row" style={gs} onClick={() => onOpen(p)}>
      <span className="sq2-c-player">
        <PlayerAvatar name={pv(p).Name} src={pv(p).HostedHeadshotNoBackgroundUrl} size={34} />
        <span className="sq2-pname">{pv(p).Name || '--'}</span>
      </span>
      {show('position') && <span><span className="sq2-pos" style={{ '--pos': POS_COLORS[groupOf(p)] }}>{pv(p).Position || g}</span></span>}
      {show('team') && <span className="sq2-dim">{pv(p).Team || '--'}</span>}
      {show('opp') && <span className="sq2-dim">{helpers.oppText(p) || '--'}</span>}
      {show('gameTime') && <span className="sq2-dim">{helpers.gameOf(p)?.time || '--'}</span>}
      {show('proj') && <span className="sq2-num">{proj != null ? proj.toFixed(1) : '--'}</span>}
      {show('lastWk') && <span className="sq2-num">{helpers.lastWkOf(p) != null ? helpers.lastWkOf(p).toFixed(1) : '--'}</span>}
      {show('seasonPts') && <span className="sq2-num">{helpers.seasonPtsOf(p) ? helpers.seasonPtsOf(p).toFixed(1) : '--'}</span>}
      {show('ppg') && <span className="sq2-num">{helpers.ppgOf(p) != null ? helpers.ppgOf(p).toFixed(1) : '--'}</span>}
      {show('ovr') && <span className="sq2-num" style={{ color: rate ? POS_COLORS[groupOf(p)] : undefined }}>{rate ?? '--'}</span>}
      {show('injury') && <span><span className={`sq2-status sq2-status--${st.cls}`}>{st.label}</span></span>}
      {show('bye') && <span className="sq2-dim">{helpers.byeOf(p) || '--'}</span>}
      {show('contract') && <span className="sq2-dim">{pd(p).yearsLeftSalaryCap ? `${pd(p).yearsLeftSalaryCap} yr` : '--'}</span>}
      {show('salary') && <span className="sq2-num">{money(helpers.salaryOf(p))}</span>}
      {show('value') && <span className="sq2-num">{helpers.valueOf(p) != null ? helpers.valueOf(p).toLocaleString() : '--'}</span>}
      <span className="sq2-kebab" aria-hidden>&#8942;</span>
    </div>
  )
}

const WeeklyView = ({ list, helpers, onOpen }) => {
  const gs = { gridTemplateColumns: '2.2fr .9fr .9fr .6fr .6fr .9fr .9fr', minWidth: 740 }
  return (
  <div className="sq2-table sq2-table--scroll">
    <div className="sq2-thead" style={gs}>
      <span className="sq2-c-player">PLAYER</span><span>OPP</span><span>GAME</span><span>PROJ</span><span>LAST WK</span><span>TREND</span><span>STATUS</span>
    </div>
    {list.map((p, i) => {
      const st = statusOf(p); const proj = helpers.projOf(p); const last = helpers.lastWkOf(p)
      return (
        <div className="sq2-row" style={gs} key={pv(p).PlayerID || i} onClick={() => onOpen(p)}>
          <span className="sq2-c-player"><PlayerAvatar name={pv(p).Name} src={pv(p).HostedHeadshotNoBackgroundUrl} size={32} /><span className="sq2-pname">{pv(p).Name}</span></span>
          <span className="sq2-dim">{helpers.oppText(p) || '--'}</span>
          <span className="sq2-dim">{helpers.gameOf(p)?.time || '--'}</span>
          <span className="sq2-num">{proj != null ? proj.toFixed(1) : '--'}</span>
          <span className="sq2-num">{last != null ? last.toFixed(1) : '--'}</span>
          <span><Spark data={helpers.weeklyOf(p).slice(-6).map((i2) => Number(i2.score) || 0)} /></span>
          <span><span className={`sq2-status sq2-status--${st.cls}`}>{st.label}</span></span>
        </div>
      )
    })}
  </div>
  )
}

const SeasonView = ({ list, helpers, onOpen }) => {
  const gs = { gridTemplateColumns: '2.2fr .5fr .8fr .6fr .6fr .6fr .9fr', minWidth: 700 }
  return (
  <div className="sq2-table sq2-table--scroll">
    <div className="sq2-thead" style={gs}>
      <span className="sq2-c-player">PLAYER</span><span>GP</span><span>SEASON</span><span>PPG</span><span>BEST</span><span>WORST</span><span>VALUE</span>
    </div>
    {list.map((p, i) => {
      const wk = helpers.weeklyOf(p).map((x) => Number(x.score) || 0)
      const best = wk.length ? Math.max(...wk) : null; const worst = wk.length ? Math.min(...wk) : null
      return (
        <div className="sq2-row" style={gs} key={pv(p).PlayerID || i} onClick={() => onOpen(p)}>
          <span className="sq2-c-player"><PlayerAvatar name={pv(p).Name} src={pv(p).HostedHeadshotNoBackgroundUrl} size={32} /><span className="sq2-pname">{pv(p).Name}</span></span>
          <span className="sq2-num">{helpers.gamesOf(p) || '--'}</span>
          <span className="sq2-num">{helpers.seasonPtsOf(p) ? helpers.seasonPtsOf(p).toFixed(1) : '--'}</span>
          <span className="sq2-num">{helpers.ppgOf(p) != null ? helpers.ppgOf(p).toFixed(1) : '--'}</span>
          <span className="sq2-num" style={{ color: '#24d26c' }}>{best != null ? best.toFixed(1) : '--'}</span>
          <span className="sq2-num" style={{ color: '#ef4444' }}>{worst != null ? worst.toFixed(1) : '--'}</span>
          <span className="sq2-num">{helpers.valueOf(p) != null ? helpers.valueOf(p).toLocaleString() : '--'}</span>
        </div>
      )
    })}
  </div>
  )
}

const GameLogView = ({ list, helpers, expanded, setExpanded, onOpen }) => {
  const gs = { gridTemplateColumns: '2.2fr .5fr .8fr .6fr 1fr .3fr', minWidth: 680 }
  return (
  <div className="sq2-table sq2-table--scroll">
    <div className="sq2-thead" style={gs}>
      <span className="sq2-c-player">PLAYER</span><span>GP</span><span>SEASON</span><span>PPG</span><span>LAST 5</span><span />
    </div>
    {list.map((p, i) => {
      const pid = pv(p).PlayerID || i; const open = !!expanded[pid]
      const wk = helpers.weeklyOf(p)
      return (
        <div className="sq2-group" key={pid}>
          <div className="sq2-row" style={gs} onClick={() => setExpanded((e) => ({ ...e, [pid]: !open }))}>
            <span className="sq2-c-player"><PlayerAvatar name={pv(p).Name} src={pv(p).HostedHeadshotNoBackgroundUrl} size={32} /><span className="sq2-pname">{pv(p).Name}</span></span>
            <span className="sq2-num">{helpers.gamesOf(p) || '--'}</span>
            <span className="sq2-num">{helpers.seasonPtsOf(p) ? helpers.seasonPtsOf(p).toFixed(1) : '--'}</span>
            <span className="sq2-num">{helpers.ppgOf(p) != null ? helpers.ppgOf(p).toFixed(1) : '--'}</span>
            <span><Spark data={wk.slice(-5).map((x) => Number(x.score) || 0)} /></span>
            <span className={`sq2-caret${open ? ' sq2-caret--open' : ''}`}>&#8250;</span>
          </div>
          {open && (
            <div className="sq2-log">
              {wk.length ? wk.map((x, k) => (
                <div className="sq2-logrow" key={k}><span>Week {x.week}</span><b>{(Number(x.score) || 0).toFixed(1)}</b></div>
              )) : <div className="sq2-log-empty">No game data yet this season.</div>}
              <button className="sq2-log-more" onClick={(e) => { e.stopPropagation(); onOpen(p) }}>Full details</button>
            </div>
          )}
        </div>
      )
    })}
  </div>
  )
}

/* ═══ Small pieces ═══ */

const Spark = ({ data }) => {
  if (!data || data.length < 2) return <span className="sq2-dim">--</span>
  const max = Math.max(...data, 1); const w = 68; const h = 22; const step = w / (data.length - 1)
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ')
  const up = data[data.length - 1] >= data[0]
  return <svg width={w} height={h} className="sq2-spark"><polyline points={pts} fill="none" stroke={up ? '#24d26c' : '#ef4444'} strokeWidth="1.6" /></svg>
}

const Summary = ({ icon, accent, label, value, sub }) => (
  <div className={`sq2-sum sq2-${accent}`}>
    <span className="sq2-sum-icon" aria-hidden>{icon}</span>
    <div><div className="sq2-sum-label">{label}</div><div className="sq2-sum-value">{value}</div><div className="sq2-sum-sub">{sub}</div></div>
  </div>
)

const Donut = ({ breakdown, total }) => {
  const sum = breakdown.reduce((s, b) => s + b.n, 0) || 1
  let a0 = -90
  const arcs = breakdown.map((b) => { const a1 = a0 + (b.n / sum) * 360; const seg = { ...b, a0, a1 }; a0 = a1; return seg })
  const pol = (a) => { const r = 46, cx = 60, cy = 60, rad = (a * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] }
  return (
    <div className="sq2-panel">
      <div className="sq2-panel-hd"><span>ROSTER BREAKDOWN</span></div>
      <div className="sq2-donut-wrap">
        <svg viewBox="0 0 120 120" width="120" height="120">
          {arcs.map((s, i) => {
            const [x0, y0] = pol(s.a0); const [x1, y1] = pol(s.a1); const large = s.a1 - s.a0 > 180 ? 1 : 0
            return <path key={i} d={`M60 60 L ${x0} ${y0} A 46 46 0 ${large} 1 ${x1} ${y1} Z`} fill={s.color} opacity="0.9" />
          })}
          <circle cx="60" cy="60" r="30" fill="#0a0d14" />
          <text x="60" y="57" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{total}</text>
          <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#8a93a6">Players</text>
        </svg>
        <div className="sq2-donut-legend">
          {breakdown.map((b) => <div key={b.g}><span style={{ background: b.color }} />{b.g}<b>{b.n}</b></div>)}
        </div>
      </div>
    </div>
  )
}

/* ═══ Player drawer ═══ */

const PlayerDrawer = ({ p, busy, onClose, helpers, week, onPractice, onActive, onIR, onRelease, isOnActive, isOnBench, onMakeActive, onBench }) => {
  const pl = pv(p); const det = pd(p)
  const st = statusOf(p)
  const wk = helpers.weeklyOf(p)
  const scores = wk.map((x) => Number(x.score) || 0)
  const season = helpers.seasonPtsOf(p); const ppg = helpers.ppgOf(p)
  const best = scores.length ? Math.max(...scores) : null; const worst = scores.length ? Math.min(...scores) : null
  const last3 = scores.slice(-3); const avg3 = last3.length ? last3.reduce((s, v) => s + v, 0) / last3.length : null
  const proj = helpers.projOf(p); const value = helpers.valueOf(p); const salary = helpers.salaryOf(p)
  const game = helpers.gameOf(p)
  const max = Math.max(...scores, 1)

  return (
    <div className="sq2-drawer-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sq2-drawer sq2-drawer--wide">
        <button className="sq2-drawer-x" onClick={onClose} aria-label="Close">✕</button>
        <div className="sq2-drawer-hero">
          <PlayerAvatar name={pl.Name} src={pl.HostedHeadshotNoBackgroundUrl} size={72} />
          <div>
            <div className="sq2-drawer-name">{pl.Name}</div>
            <div className="sq2-drawer-meta">{[pl.Position, pl.Team, pl.Age ? `Age ${pl.Age}` : null].filter(Boolean).join(' · ')}</div>
            <span className={`sq2-status sq2-status--${st.cls}`}>{st.label}</span>
          </div>
          {helpers.rateOf(p) != null && <div className="sq2-drawer-ovr"><b>{helpers.rateOf(p)}</b><span>OVR</span></div>}
        </div>

        <div className="sq2-drawer-stats">
          <div><span>Proj</span><b>{proj != null ? proj.toFixed(1) : '--'}</b></div>
          <div><span>Season</span><b>{season ? season.toFixed(1) : '--'}</b></div>
          <div><span>PPG</span><b>{ppg != null ? ppg.toFixed(1) : '--'}</b></div>
          <div><span>Last 3</span><b>{avg3 != null ? avg3.toFixed(1) : '--'}</b></div>
        </div>

        {/* Matchup */}
        <div className="sq2-drawer-section-title">This Week</div>
        <div className="sq2-drawer-kv">
          <div><span>Opponent</span><b>{helpers.oppText(p) || (Object.keys(helpers.gameOf(p) || {}).length ? '--' : 'BYE')}</b></div>
          <div><span>Game</span><b>{game?.time || '--'}</b></div>
          <div><span>Bye Week</span><b>{helpers.byeOf(p) || '--'}</b></div>
          <div><span>Status</span><b>{st.label}</b></div>
        </div>

        {/* Weekly chart */}
        <div className="sq2-drawer-section-title">Weekly Fantasy Points</div>
        {scores.length ? (
          <div className="sq2-chart">
            {wk.map((x, i) => {
              const v = Number(x.score) || 0
              return (
                <div className="sq2-chart-col" key={i} title={`Week ${x.week}: ${v.toFixed(1)}`}>
                  <div className="sq2-chart-bar" style={{ height: `${Math.max(3, (v / max) * 100)}%`, background: v === best ? '#24d26c' : v === worst ? '#ef4444' : '#8b5cf6' }} />
                  <span className="sq2-chart-x">{x.week}</span>
                </div>
              )
            })}
          </div>
        ) : <div className="sq2-side-empty">No weekly data available yet.</div>}
        {scores.length > 0 && (
          <div className="sq2-drawer-kv sq2-drawer-kv--3">
            <div><span>Best</span><b style={{ color: '#24d26c' }}>{best.toFixed(1)}</b></div>
            <div><span>Worst</span><b style={{ color: '#ef4444' }}>{worst.toFixed(1)}</b></div>
            <div><span>Games</span><b>{helpers.gamesOf(p)}</b></div>
          </div>
        )}

        {/* Contract & value */}
        <div className="sq2-drawer-section-title">Contract &amp; Value</div>
        <div className="sq2-drawer-kv">
          <div><span>Salary</span><b>{money(salary)}</b></div>
          {det.nextYearSalaryCap != null && <div><span>Next Yr</span><b>{money(det.nextYearSalaryCap)}</b></div>}
          {det.yearsLeftSalaryCap != null && <div><span>Years Left</span><b>{det.yearsLeftSalaryCap}</b></div>}
          <div><span>Market Value</span><b>{value != null ? value.toLocaleString() : '--'}</b></div>
        </div>

        {/* Game log */}
        <div className="sq2-drawer-section-title">Game Log</div>
        {wk.length ? (
          <div className="sq2-drawer-log">
            {wk.map((x, i) => <div key={i}><span>Week {x.week}</span><b>{(Number(x.score) || 0).toFixed(1)}</b></div>)}
          </div>
        ) : <div className="sq2-side-empty">No games logged this season.</div>}

        <div className="sq2-drawer-section-title">Actions</div>
        <div className="sq2-drawer-actions">
          {isOnBench && <button disabled={busy} className="sq2-primary" onClick={onMakeActive}>Make Active (game-day)</button>}
          {isOnActive && <button disabled={busy} onClick={onBench}>Move to Bench (inactive)</button>}
          <button disabled={busy} onClick={onPractice}>Move to Practice</button>
          <button disabled={busy} onClick={onActive}>Move to Active</button>
          <button disabled={busy} onClick={onIR}>Move to IR</button>
          <button disabled={busy} className="sq2-danger" onClick={onRelease}>Release</button>
        </div>
        <p className="sq2-drawer-note">Trade and Protect flows use the existing Trade Center and Protected-squad tools.</p>
      </div>
    </div>
  )
}

const TableSkeleton = () => (
  <div className="sq2-table">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div className="sq2-row" key={i} style={{ pointerEvents: 'none' }}>
        <span className="sq2-c-player"><span className="sq2-skel" style={{ width: 34, height: 34, borderRadius: '50%' }} /><span className="sq2-skel" style={{ width: 120, height: 14 }} /></span>
        {Array.from({ length: 8 }).map((_, k) => <span key={k}><span className="sq2-skel" style={{ width: 40, height: 12 }} /></span>)}
        <span />
      </div>
    ))}
  </div>
)

export default Squad
