import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { base_url } from '../../config/constants'
import SiteHeader from '../../components/SiteHeader'
import { getWeeklyNflSchedule } from '../../redux/actions/leagueActions'
import { posColor } from '../PlayerValues/theme'
import '../../styles/pages/injuryReport2.css'

// ═══════════════════════════════════════════════════════════════════════════
//  NFL INJURY REPORT — public Fantasy Resources page. REDESIGN / RESKIN ONLY.
//
//  Core data comes UNCHANGED from GET /values/injuries, which surfaces the
//  league's own injury designations written onto each player by the Tank01 bio
//  sync. Real fields per row: id, name, position, team, status, bodyPart,
//  notes, photo, updated. Nothing in that feed is computed or invented by us.
//
//  Two columns are ENRICHED from other REAL, existing sources, joined on data
//  the feed already carries — never fabricated:
//    • Opponent / kickoff → GET /schedule/get-weekly-nfl-schedule (the same
//        getWeeklyNflSchedule the Roster Board uses). Joined by team abbr →
//        opponent + kickoff. "BYE" when the team has no game that week; "—"
//        when the schedule can't be loaded (e.g. anonymous visitor).
//    • Fantasy Impact     → GET /values/rankings (the SAM Value board). The
//        injury feed's id is the Player _id, and each PlayerValue.player is a
//        ref to that same _id, so the two join exactly by id. Impact is derived
//        from the player's REAL overall rank / crowdsourced value (thresholds
//        documented at fantasyLevel below). Shown only when a match exists;
//        players with no value on the board stay "—". The column and the
//        "Top Fantasy Impact Players" card only render when the board loads and
//        at least one injured player matches.
//
//  Fields the backend still does NOT provide are shown honestly, never faked:
//    • Practice Participation  → REAL when the twice-weekly NFL.com scrape has
//        it (NflPracticeWed/Thu/Fri on the payload); "—" when it doesn't.
//    • Outlook                 → from NFL.com's "Injury roundup" news wording
//        (NflNewsOutlook/Headline/Url), shown attributed + linked. Only set when
//        the headline said it explicitly; "Unknown" otherwise. We never invent a
//        return date or a severity level.
//    • Fantasy PPG             → not exposed by /values → SAM Value shown instead
//    • Contract / market value / news → not in feed → omitted from expand row
//
//  The shared LandingHeader + LiveTicker (rendered by <SiteHeader/>) are reused
//  as-is — the live sports ticker is NOT modified.
// ═══════════════════════════════════════════════════════════════════════════

// ── Official status → canonical key (only real designations, never severity) ─
const statusKey = (s) => {
  const k = String(s || '').toLowerCase().trim()
  if (/injured reserve|(^|\s)ir(\s|$|-)/.test(k)) return 'IR'
  if (/pup/.test(k)) return 'PUP'
  if (/nfi/.test(k)) return 'NFI'
  if (/suspen/.test(k)) return 'Suspended'
  if (/doubtful/.test(k)) return 'Doubtful'
  if (/questionable/.test(k)) return 'Questionable'
  if (/probable/.test(k)) return 'Probable'
  if (/day-to-day|day to day/.test(k)) return 'Day-To-Day'
  if (/(^|\s)out(\s|$)/.test(k)) return 'Out'
  return String(s || '').trim() || 'Unknown'
}

const STATUS_COLOR = {
  Out: '#EF4444', IR: '#EF4444', PUP: '#EF4444', NFI: '#EF4444', Suspended: '#EF4444',
  Doubtful: '#F97316', Questionable: '#D4A843', Probable: '#3B82F6', 'Day-To-Day': '#3B82F6',
}
const statusColor = (k) => STATUS_COLOR[k] || OUTLOOK_COLOR[k] || 'rgba(255,255,255,0.5)'

// Practice participation from the scraped NFL.com report. Prefers the most
// recent day present (Fri → Thu → Wed). Returns null when nothing was reported,
// so the UI can honestly show "—". `full`/`latest`/`day` help render it.
const practiceOf = (p) => {
  if (!p) return null
  const days = [
    { day: 'Fri', v: p.NflPracticeFri },
    { day: 'Thu', v: p.NflPracticeThu },
    { day: 'Wed', v: p.NflPracticeWed },
  ].filter((d) => d.v && String(d.v).trim())
  if (!days.length) return null
  const latest = days[0]
  return { latest: latest.v, day: latest.day, all: days.reverse() }
}

// Playing outlook from the scraped NFL.com news roundup. Only present when the
// headline used explicit wording; the headline + link travel with it so the UI
// can attribute and link the source. Returns null when there's no news.
const OUTLOOK_COLOR = {
  'Expected to play': '#22C55E',
  'Questionable': '#D4A843',
  'Game-time decision': '#F59E0B',
  'Doubtful': '#F97316',
  'Unlikely to play': '#EF4444',
}
const newsOf = (p) => {
  if (!p || (!p.NflNewsOutlook && !p.NflNewsHeadline)) return null
  return {
    outlook: p.NflNewsOutlook || null,
    headline: p.NflNewsHeadline || null,
    url: p.NflNewsUrl || null,
    color: OUTLOOK_COLOR[p.NflNewsOutlook] || 'rgba(255,255,255,0.6)',
  }
}

// Canonical ordering for the status tabs; only rendered when present in data.
const STATUS_ORDER = ['Out', 'Doubtful', 'Questionable', 'Probable', 'IR', 'PUP', 'NFI', 'Suspended', 'Day-To-Day']
// Severity used ONLY to order the "Most Serious" proxy list — a real, labelled
// ordering by official designation, NOT an invented fantasy-impact value.
const SEVERITY = { IR: 5, Out: 5, PUP: 4, NFI: 4, Suspended: 4, Doubtful: 3, Questionable: 2, Probable: 1, 'Day-To-Day': 1 }

// The bucket a player is grouped under in the summary widgets + status filter.
// Prefers a REAL official designation; when there isn't one (e.g. offseason,
// only a news mention), falls back to the news outlook — a real signal — rather
// than lumping everyone into "Unknown". The Official Status column stays strict.
const bucketKey = (p) => {
  const sk = statusKey(p.status)
  if (STATUS_ORDER.includes(sk)) return sk
  return p.NflNewsOutlook || 'Unknown'
}
// Ordering for the "Most Serious" list — official severity first, then a coarse
// outlook severity so the list is still meaningful before designations post.
const OUTLOOK_SEVERITY = { 'Unlikely to play': 3, Doubtful: 3, 'Game-time decision': 2, Questionable: 2, 'Expected to play': 1 }
const bucketSev = (k) => SEVERITY[k] ?? OUTLOOK_SEVERITY[k] ?? 0

// ── Position groups (client-side filter over the real position strings) ──────
const POS_GROUPS = {
  QB: ['QB'], RB: ['RB', 'FB', 'HB'], WR: ['WR'], TE: ['TE'],
  OL: ['OL', 'C', 'G', 'T', 'OT', 'OG', 'LT', 'RT', 'LG', 'RG', 'OC'],
  DL: ['DL', 'DT', 'DE', 'NT'],
  EDGE: ['EDGE', 'DE', 'OLB'],
  LB: ['LB', 'ILB', 'MLB', 'OLB'],
  CB: ['CB', 'DB'], S: ['S', 'FS', 'SS', 'SAF', 'DB'],
  K: ['K', 'PK'], P: ['P'],
}
const IDP_POS = new Set(['DL', 'DT', 'DE', 'NT', 'EDGE', 'OLB', 'LB', 'ILB', 'MLB', 'CB', 'DB', 'S', 'FS', 'SS', 'SAF'])
const POS_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'EDGE', 'LB', 'CB', 'S', 'K', 'P', 'IDP']

const matchesPos = (rawPos, group) => {
  if (group === 'ALL') return true
  const p = String(rawPos || '').toUpperCase().trim()
  if (!p) return false
  if (group === 'IDP') return IDP_POS.has(p)
  return (POS_GROUPS[group] || []).includes(p)
}

// ESPN public logo CDN keyed by team abbreviation (same source as the ticker).
// Falls back to the abbreviation text badge on error — no wrong data is shown.
const teamLogoUrl = (abbr) =>
  abbr ? `https://a.espncdn.com/i/teamlogos/nfl/500/${String(abbr).toLowerCase()}.png` : null

const fmtWhen = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

// Format an NFL kickoff into "Sun 1:00 PM" — same helper the Roster Board uses.
const fmtKick = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return ''
  const day = d.toLocaleDateString('en-US', { weekday: 'short' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} ${time}`
}

// ── Fantasy Impact — derived from the player's REAL SAM Value board standing ──
// Source: GET /values/rankings (crowdsourced 0–9999 value + overall rank). We
// key impact off the overall rank when present (the most interpretable real
// signal), falling back to the raw value when a rank isn't populated:
//   • High   → top 40 overall (or value ≥ 6000)
//   • Medium → top 120 overall (or value ≥ 3000)
//   • Low    → ranked/valued below that
// A player with no entry on the board has no reachable fantasy value → "—".
const fantasyLevel = (rank, value) => {
  const r = Number(rank) || 0
  if (r > 0) return r <= 40 ? 'High' : r <= 120 ? 'Medium' : 'Low'
  const v = Number(value) || 0
  return v >= 6000 ? 'High' : v >= 3000 ? 'Medium' : 'Low'
}
const FANTASY_COLOR = { High: '#EF4444', Medium: '#F97316', Low: '#3B82F6' }

// ── Small presentational pieces ─────────────────────────────────────────────
const Initials = ({ name, big }) => (
  <div className={`inj-initials${big ? ' inj-initials-lg' : ''}`} aria-hidden="true">
    {String(name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
  </div>
)
const Avatar = ({ src, name, big }) => {
  const [bad, setBad] = useState(false)
  if (!src || bad) return <Initials name={name} big={big} />
  return (
    <img className={`inj-avatar${big ? ' inj-avatar-lg' : ''}`} src={src} alt="" onError={() => setBad(true)} />
  )
}
const TeamCell = ({ abbr }) => {
  const [bad, setBad] = useState(false)
  const url = teamLogoUrl(abbr)
  return (
    <span className="inj-teamcell">
      {url && !bad && <img className="inj-teamlogo" src={url} alt="" onError={() => setBad(true)} />}
      <span className="inj-teamabbr">{abbr || '—'}</span>
    </span>
  )
}
const PosTag = ({ pos }) =>
  pos ? <span className="inj-pos" style={{ background: posColor(String(pos).toUpperCase()) }}>{pos}</span> : <span className="inj-muted">—</span>
const StatusBadge = ({ k }) => (
  <span className="inj-badge" style={{ '--inj-badge-c': statusColor(k) }}>{k}</span>
)

// Opponent cell — logo + "vs OPP" / "@ OPP" + kickoff, from the weekly schedule.
// "BYE" when the team plays no game that week; "—" when the schedule isn't
// loaded (anonymous visitor / empty response). Never fabricates a matchup.
const OpponentCell = ({ info }) => {
  const [bad, setBad] = useState(false)
  if (!info || info.kind === 'unknown') return <span className="inj-muted">—</span>
  if (info.kind === 'bye') return <span className="inj-bye">BYE</span>
  const url = teamLogoUrl(info.opp)
  return (
    <span className="inj-oppcell">
      {url && !bad && <img className="inj-opplogo" src={url} alt="" onError={() => setBad(true)} />}
      <span className="inj-oppmain">
        <span className="inj-opptxt">{info.home ? 'vs' : '@'} {info.opp}</span>
        {info.time && <span className="inj-oppkick">{info.time}</span>}
      </span>
    </span>
  )
}
const FantasyTag = ({ level }) =>
  level
    ? <span className="inj-fan" style={{ '--inj-fan-c': FANTASY_COLOR[level] || 'var(--inj-dim)' }}>{level}</span>
    : <span className="inj-muted">—</span>

// ── Injury Overview donut (inline SVG, no chart lib) ─────────────────────────
const Donut = ({ segments, total }) => {
  const R = 52, C = 2 * Math.PI * R, cx = 64, cy = 64
  let offset = 0
  return (
    <svg className="inj-donut" width="128" height="128" viewBox="0 0 128 128" role="img"
      aria-label={`Total injuries ${total}`}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      {total > 0 && segments.map((s) => {
        const len = (s.value / total) * C
        const el = (
          <circle key={s.key} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
        )
        offset += len
        return el
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" className="inj-donut-center-num">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="inj-donut-center-lbl">INJURIES</text>
    </svg>
  )
}

// ── Skeleton rows (no full-page spinner) ─────────────────────────────────────
const SkeletonRows = () =>
  Array.from({ length: 8 }).map((_, i) => (
    <tr key={i}>
      <td>
        <div className="inj-player">
          <div className="inj-sk inj-sk-dot" />
          <div style={{ flex: 1 }}>
            <div className="inj-sk inj-sk-line" style={{ width: '60%', marginBottom: 6 }} />
            <div className="inj-sk inj-sk-line" style={{ width: '35%', height: 9 }} />
          </div>
        </div>
      </td>
      {Array.from({ length: 6 }).map((__, j) => (
        <td key={j}><div className="inj-sk inj-sk-line" style={{ width: '70%' }} /></td>
      ))}
    </tr>
  ))

const EmptyState = ({ icon, title, children }) => (
  <div className="inj-empty">
    <div className="inj-empty-icon" aria-hidden="true">{icon}</div>
    <div className="inj-empty-title">{title}</div>
    <div>{children}</div>
  </div>
)

export default function InjuryReport() {
  const navigate = useNavigate()
  // Return the manager to wherever they came from (their fantasy dashboard),
  // or fall back to the dashboard if they opened this page directly.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/dashboard')
  }

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [q, setQ] = useState('')
  const [pos, setPos] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [view, setView] = useState('table') // table | cards | calendar
  const [expanded, setExpanded] = useState(() => new Set())
  const [narrow, setNarrow] = useState(false)

  // Current NFL week from the user setting (like Roster Board / Live Scoring),
  // else week 1. Drives which weekly schedule we join opponents from.
  const settingWeek = useSelector((s) => s?.user?.setting?.week)
  const week = settingWeek || 1

  // Enrichment sources (both REAL, both fail-soft to "—"):
  //   schedule → team-abbr → { opp, home, time } map for the Opponent column
  //   fantasy  → player-id  → { level, value, rank, posRank } for Fantasy Impact
  const [schedule, setSchedule] = useState({ map: {}, loaded: false })
  const [fantasy, setFantasy] = useState({ map: {}, loaded: false })

  // Data fetch — UNCHANGED from the original page.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`${base_url}/values/injuries`).then((x) => x.json())
        if (!r.success) throw new Error(r.message || 'Could not load the injury report')
        if (!cancelled) setRows(r.players || [])
      } catch (e) {
        if (!cancelled) setErr(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Weekly NFL schedule → team-abbr → game map, exactly like the Roster Board.
  // The schedule route is auth-guarded, so we only attempt it when a session
  // token exists; anonymous visitors simply keep an honest "—" opponent rather
  // than triggering a failed request. If the response is empty we stay unloaded.
  useEffect(() => {
    let alive = true
    const hasToken = (() => {
      try { return !!localStorage.getItem('token') } catch (e) { return false }
    })()
    if (!hasToken) { setSchedule({ map: {}, loaded: false }); return }
    ;(async () => {
      const games = await getWeeklyNflSchedule({ week })
      if (!alive) return
      if (!Array.isArray(games) || games.length === 0) {
        setSchedule({ map: {}, loaded: false })
        return
      }
      const map = {}
      games.forEach((g) => {
        const home = String(g.HomeTeam || '').toUpperCase()
        const away = String(g.AwayTeam || '').toUpperCase()
        const time = fmtKick(g.DateTime || g.Day || g.Date)
        if (home && home !== 'BYE') map[home] = { opp: away, home: true, time }
        if (away && away !== 'BYE') map[away] = { opp: home, home: false, time }
      })
      setSchedule({ map, loaded: true })
    })()
    return () => { alive = false }
  }, [week])

  // SAM Value board (public, same endpoint the Player Values page uses) →
  // player-id → real fantasy standing. Joined by id, which is the Player _id in
  // both the injury feed and PlayerValue.player. Fail-soft: no board, no column.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch(`${base_url}/values/rankings?position=ALL&limit=500`).then((x) => x.json())
        if (!alive) return
        if (!r.success || !Array.isArray(r.players) || r.players.length === 0) {
          setFantasy({ map: {}, loaded: false })
          return
        }
        const map = {}
        r.players.forEach((p) => {
          const rank = Number(p.rank) || 0
          const value = Number(p.value) || 0
          map[String(p.id)] = { level: fantasyLevel(rank, value), value, rank, posRank: p.posRank }
        })
        setFantasy({ map, loaded: true })
      } catch (e) {
        if (alive) setFantasy({ map: {}, loaded: false })
      }
    })()
    return () => { alive = false }
  }, [])

  // On narrow / landscape-mobile viewports, the table degrades to cards.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on)
    return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on) }
  }, [])

  // Normalise each row once (adds statusK; keeps all real fields).
  const data = useMemo(() => rows.map((p) => ({ ...p, statusK: statusKey(p.status), bucketK: bucketKey(p) })), [rows])

  // Opponent for a team abbr, from the loaded schedule. unknown → "—" (schedule
  // not available), bye → team has no game this week, game → real matchup.
  const oppInfo = useCallback((teamAbbr) => {
    if (!schedule.loaded || !teamAbbr) return { kind: 'unknown' }
    const g = schedule.map[String(teamAbbr).toUpperCase()]
    if (!g) return { kind: 'bye' }
    return { kind: 'game', opp: g.opp, home: g.home, time: g.time }
  }, [schedule])

  // Real fantasy standing for a player id, or null when he isn't on the board.
  const fantasyOf = useCallback((id) => fantasy.map[String(id)] || null, [fantasy])

  // How many injured players we can actually price. The Fantasy Impact column +
  // "Top Fantasy Impact Players" card only render when the board loaded AND at
  // least one injured player matches — otherwise the feature stays omitted.
  const fantasyMatchCount = useMemo(
    () => (fantasy.loaded ? data.filter((p) => fantasy.map[String(p.id)]).length : 0),
    [data, fantasy]
  )
  const showFantasy = fantasy.loaded && fantasyMatchCount > 0

  // Table column count (for the expand row colSpan): Player, Pos, Team,
  // Opponent, Status, [Fantasy], Injury, Practice, Exp. Return, Notes, chevron.
  const colCount = 10 + (showFantasy ? 1 : 0)

  const bySearch = useCallback((p) => {
    const needle = q.trim().toLowerCase()
    if (!needle) return true
    return `${p.name} ${p.team} ${p.position}`.toLowerCase().includes(needle)
  }, [q])

  // Pill counts: search + status applied (not position) so pills don't vanish.
  const posCounts = useMemo(() => {
    const base = data.filter((p) => bySearch(p) && (status === 'ALL' || p.bucketK === status))
    const out = {}
    POS_ORDER.forEach((g) => { out[g] = base.filter((p) => matchesPos(p.position, g)).length })
    return out
  }, [data, bySearch, status])

  // Status counts: search + position applied (not status).
  const statusCounts = useMemo(() => {
    const base = data.filter((p) => bySearch(p) && matchesPos(p.position, pos))
    const out = {}
    base.forEach((p) => { out[p.bucketK] = (out[p.bucketK] || 0) + 1 })
    return out
  }, [data, bySearch, pos])
  const statusTabs = useMemo(
    () => STATUS_ORDER.filter((s) => statusCounts[s] > 0)
      .concat(Object.keys(statusCounts).filter((s) => !STATUS_ORDER.includes(s))),
    [statusCounts]
  )

  // The visible dataset (search + position + status).
  const filtered = useMemo(
    () => data.filter((p) => bySearch(p) && matchesPos(p.position, pos) && (status === 'ALL' || p.bucketK === status)),
    [data, bySearch, pos, status]
  )

  // Sidebar aggregates from the CURRENT filtered dataset.
  const donutSegments = useMemo(() => {
    const counts = {}
    filtered.forEach((p) => { counts[p.bucketK] = (counts[p.bucketK] || 0) + 1 })
    const keys = STATUS_ORDER.filter((s) => counts[s]).concat(Object.keys(counts).filter((s) => !STATUS_ORDER.includes(s)))
    return keys.map((k) => ({ key: k, value: counts[k], color: statusColor(k) }))
  }, [filtered])

  const posBars = useMemo(() => {
    const rowsB = POS_ORDER.filter((g) => g !== 'IDP').map((g) => ({
      group: g, count: filtered.filter((p) => matchesPos(p.position, g)).length,
    })).filter((b) => b.count > 0).sort((a, b) => b.count - a.count)
    const max = Math.max(1, ...rowsB.map((b) => b.count))
    return { rowsB, max }
  }, [filtered])

  // "Most Serious" proxy list — ordered by OFFICIAL designation severity, a real
  // signal, explicitly labelled as such (no fantasy-points field exists to rank).
  const topSerious = useMemo(
    () => [...filtered]
      .sort((a, b) => bucketSev(b.bucketK) - bucketSev(a.bucketK) || a.name.localeCompare(b.name))
      .slice(0, 6),
    [filtered]
  )

  // Top Fantasy Impact players — the injured players with the highest REAL SAM
  // Value, in the current view. Only populated when the value board is joined.
  const topFantasy = useMemo(
    () => filtered
      .filter((p) => fantasy.map[String(p.id)])
      .sort((a, b) => (fantasy.map[String(b.id)].value - fantasy.map[String(a.id)].value) || a.name.localeCompare(b.name))
      .slice(0, 6),
    [filtered, fantasy]
  )

  const lastUpdated = useMemo(() => {
    const ts = rows.map((p) => p.updated).filter(Boolean).map((s) => new Date(s).getTime()).filter((n) => !isNaN(n))
    return ts.length ? fmtWhen(new Date(Math.max(...ts)).toISOString()) : null
  }, [rows])

  const toggle = (id) => setExpanded((prev) => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const showCards = view === 'cards' || (view === 'table' && narrow)
  const emptyReason = rows.length === 0
    ? { title: 'No injuries listed', body: 'The report fills as teams post their weekly designations.' }
    : { title: 'No players match', body: 'Try clearing the search or a different position / status filter.' }

  return (
    <div className="inj-root">
      {/* Shared live sports ticker + nav — reused untouched. */}
      <SiteHeader activeSport="fantasy" />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="inj-hero">
        <div className="inj-wrap">
          <button className="inj-back-btn" onClick={goBack} aria-label="Back to your league">
            <span aria-hidden="true">←</span> Back to my league
          </button>
          <div className="inj-kicker">FANTASY RESOURCES</div>
          <h1 className="inj-h1">NFL Injury Report</h1>
          <p className="inj-sub">Every notable injury across the league, updated from official reports.</p>

          {/* Update cards — REAL values only. "Next Update" is omitted because the
              feed exposes no scheduled-refresh value; a real count card is shown. */}
          <div className="inj-updates">
            <div className="inj-update">
              <div className="inj-update-label">Last Updated</div>
              <div className="inj-update-value">{lastUpdated || 'Unknown'}</div>
            </div>
            <div className="inj-update">
              <div className="inj-update-label">Players Listed</div>
              <div className="inj-update-value inj-accent">{loading ? '—' : rows.length}</div>
            </div>
            <div className="inj-update">
              <div className="inj-update-label">Data Source</div>
              <div className="inj-update-value">Official team reports</div>
            </div>
          </div>
        </div>
      </div>

      <div className="inj-body">
        {/* ── Sticky search + view modes ─────────────────────────────── */}
        <div className="inj-toolbar">
          <div className="inj-wrap" style={{ padding: 0 }}>
            <div className="inj-search-row">
              <div className="inj-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search player, team, or position…"
                  aria-label="Search injuries by player, team, or position"
                />
              </div>
              <div className="inj-views" role="tablist" aria-label="View mode">
                {['table', 'cards', 'calendar'].map((v) => (
                  <button key={v} role="tab" aria-selected={view === v}
                    className={`inj-view-btn${view === v ? ' inj-on' : ''}`} onClick={() => setView(v)}>
                    {v[0].toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Position pills ─────────────────────────────────────────── */}
        <div className="inj-filters">
          <div className="inj-pill-scroll" role="group" aria-label="Filter by position">
            <button className={`inj-pill${pos === 'ALL' ? ' inj-on' : ''}`}
              style={pos === 'ALL' ? { background: 'var(--inj-green)' } : undefined}
              onClick={() => setPos('ALL')}>All</button>
            {POS_ORDER.filter((g) => posCounts[g] > 0).map((g) => (
              <button key={g} className={`inj-pill${pos === g ? ' inj-on' : ''}`}
                style={pos === g ? { background: posColor(g === 'IDP' ? 'DL' : g) } : undefined}
                onClick={() => setPos(g)}>
                {g}<span className="inj-pill-count">{posCounts[g]}</span>
              </button>
            ))}
          </div>

          {/* Status tabs — only real designations present in the dataset. */}
          <div className="inj-status-scroll" role="group" aria-label="Filter by official status">
            <button className={`inj-stab${status === 'ALL' ? ' inj-on' : ''}`}
              style={{ '--inj-stab-c': 'var(--inj-green)' }} onClick={() => setStatus('ALL')}>
              <span className="inj-stab-dot" style={{ background: 'var(--inj-green)' }} />
              All Status
              <span className="inj-stab-count">{filtered.length}</span>
            </button>
            {statusTabs.map((s) => (
              <button key={s} className={`inj-stab${status === s ? ' inj-on' : ''}`}
                style={{ '--inj-stab-c': statusColor(s) }} onClick={() => setStatus(s)}>
                <span className="inj-stab-dot" style={{ background: statusColor(s) }} />
                {s}
                <span className="inj-stab-count">{statusCounts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main grid: content + sidebar ───────────────────────────── */}
        <div className="inj-grid">
          <div>
            {err && <div className="inj-panel"><div className="inj-err">{err}</div></div>}

            {/* CALENDAR VIEW — grouped by expected-return week. The feed carries no
                expected-return dates, so this is an honest empty state. */}
            {!err && view === 'calendar' && (
              <div className="inj-panel">
                <EmptyState icon="🗓" title="Return dates aren’t in this feed">
                  Official reports here list designations (Out, Questionable, IR…) but not projected
                  return weeks, so there’s nothing to place on a calendar. Switch to Table or Cards.
                </EmptyState>
              </div>
            )}

            {/* TABLE VIEW (also renders skeletons while loading) */}
            {!err && view === 'table' && !showCards && (
              <div className="inj-panel">
                <div className="inj-table-wrap">
                  <table className="inj-table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Pos</th>
                        <th>Team</th>
                        <th>Opponent</th>
                        <th>Official Status</th>
                        {showFantasy && <th>Fantasy Impact</th>}
                        <th>Injury</th>
                        <th>Practice</th>
                        <th>Outlook</th>
                        <th>Notes</th>
                        <th aria-label="Expand" />
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <SkeletonRows />}
                      {!loading && filtered.map((p) => {
                        const open = expanded.has(p.id)
                        return (
                          <React.Fragment key={p.id}>
                            <tr className="inj-tr" tabIndex={0} onClick={() => toggle(p.id)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(p.id) } }}
                              aria-expanded={open}>
                              <td>
                                <div className="inj-player">
                                  <Avatar src={p.photo} name={p.name} />
                                  <span style={{ minWidth: 0 }}>
                                    <span className="inj-pname">{p.name}</span>
                                    <span className="inj-pteam" style={{ display: 'block' }}>{p.team}</span>
                                  </span>
                                </div>
                              </td>
                              <td><PosTag pos={p.position} /></td>
                              <td><TeamCell abbr={p.team} /></td>
                              <td><OpponentCell info={oppInfo(p.team)} /></td>
                              <td><StatusBadge k={p.statusK} /></td>
                              {showFantasy && <td><FantasyTag level={fantasyOf(p.id)?.level} /></td>}
                              <td className="inj-injury">{p.bodyPart ? <b>{p.bodyPart}</b> : <span className="inj-muted">—</span>}</td>
                              {/* Practice participation — real when the NFL.com scrape has it, else honest dash */}
                              <td>{(() => { const pr = practiceOf(p); return pr ? <span title={pr.all.map((d) => `${d.day}: ${d.v}`).join('  ·  ')}><b>{pr.latest}</b> <span className="inj-muted" style={{ fontSize: 11 }}>({pr.day})</span></span> : <span className="inj-muted">—</span> })()}</td>
                              {/* Outlook — from NFL.com's news roundup wording, attributed + linked. No news → Unknown. */}
                              <td>{(() => { const n = newsOf(p); if (!n) return <span className="inj-muted">Unknown</span>; const inner = <><span style={{ color: n.color, fontWeight: 700 }}>{n.outlook || 'See update'}</span></>; return n.url ? <a href={n.url} target="_blank" rel="noopener noreferrer" title={n.headline || 'NFL.com update'} style={{ textDecoration: 'none' }}>{inner} <span className="inj-muted" style={{ fontSize: 11 }}>↗</span></a> : <span title={n.headline || ''}>{inner}</span> })()}</td>
                              <td style={{ maxWidth: 220, color: 'var(--inj-dim)' }}>{p.notes || <span className="inj-muted">—</span>}</td>
                              <td>
                                <span className={`inj-chev${open ? ' inj-open' : ''}`} aria-hidden="true">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </span>
                              </td>
                            </tr>
                            {open && (() => {
                              const oi = oppInfo(p.team)
                              const fv = fantasyOf(p.id)
                              const oppText = oi.kind === 'game'
                                ? `${oi.home ? 'vs' : '@'} ${oi.opp}${oi.time ? ` · ${oi.time}` : ''}`
                                : oi.kind === 'bye' ? 'Bye week — no game scheduled' : null
                              return (
                              <tr className="inj-expand">
                                <td colSpan={colCount}>
                                  <div className="inj-expand-inner">
                                    <Avatar src={p.photo} name={p.name} big />
                                    <div className="inj-expand-body">
                                      <div className="inj-expand-title">
                                        <strong>{p.name}</strong>
                                        <PosTag pos={p.position} />
                                        <TeamCell abbr={p.team} />
                                        <StatusBadge k={p.statusK} />
                                        {fv && <FantasyTag level={fv.level} />}
                                      </div>
                                      <dl className="inj-kv">
                                        <dt>Official Status</dt><dd>{p.statusK}</dd>
                                        <dt>Upcoming Opponent</dt>
                                        <dd>{oppText || <span className="inj-muted">Not available</span>}</dd>
                                        <dt>Injury</dt><dd>{p.bodyPart || '—'}{p.bodyPart && p.notes ? ` — ${p.notes}` : (p.notes && !p.bodyPart ? p.notes : '')}</dd>
                                        {fv && (<><dt>Fantasy Impact</dt>
                                          <dd>{fv.level} · SAM Value {fv.value}{fv.rank ? ` (overall #${fv.rank})` : ''}{fv.posRank ? ` · ${fv.posRank}` : ''}</dd></>)}
                                        <dt>Practice</dt>
                                        <dd>{(() => { const pr = practiceOf(p); return pr ? pr.all.map((d) => `${d.day}: ${d.v}`).join('  ·  ') : <span className="inj-muted">Not reported</span> })()}</dd>
                                        {p.NflGameStatus && (<><dt>Game Status</dt><dd>{p.NflGameStatus}</dd></>)}
                                        {(() => { const n = newsOf(p); return n ? (<><dt>Outlook</dt><dd>{n.outlook ? <span style={{ color: n.color, fontWeight: 700 }}>{n.outlook}</span> : 'See update'}{n.url && (<> · <a href={n.url} target="_blank" rel="noopener noreferrer">NFL.com</a></>)}</dd>{n.headline && (<><dt>Latest news</dt><dd style={{ color: 'var(--inj-dim)' }}>{n.url ? <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{n.headline}</a> : n.headline}</dd></>)}</>) : (<><dt>Expected Return</dt><dd className="inj-muted">Unknown</dd></>) })()}
                                        {fmtWhen(p.updated) && (<><dt>Last Updated</dt><dd>{fmtWhen(p.updated)}</dd></>)}
                                      </dl>
                                      <div className="inj-note">
                                        Opponent comes from the weekly NFL schedule and Fantasy Impact from the SAM
                                        Value board — both real, joined by team and player. Snap/practice history,
                                        projected return and market value aren’t part of these feeds, so they’re
                                        omitted rather than estimated.
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )})()}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {!loading && filtered.length === 0 && (
                  <EmptyState icon="🩺" title={emptyReason.title}>{emptyReason.body}</EmptyState>
                )}
              </div>
            )}

            {/* CARDS VIEW (also used when table degrades on narrow screens) */}
            {!err && (view === 'cards' || (view === 'table' && showCards)) && (
              <>
                {loading && (
                  <div className="inj-cards">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="inj-ucard">
                        <div className="inj-ucard-top">
                          <div className="inj-sk inj-sk-dot inj-avatar-lg" />
                          <div style={{ flex: 1 }}>
                            <div className="inj-sk inj-sk-line" style={{ width: '70%', marginBottom: 8 }} />
                            <div className="inj-sk inj-sk-line" style={{ width: '40%', height: 9 }} />
                          </div>
                        </div>
                        <div className="inj-sk inj-sk-line" style={{ width: '100%', height: 40 }} />
                      </div>
                    ))}
                  </div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="inj-panel"><EmptyState icon="🩺" title={emptyReason.title}>{emptyReason.body}</EmptyState></div>
                )}
                {!loading && filtered.length > 0 && (
                  <div className="inj-cards">
                    {filtered.map((p) => (
                      <div key={p.id} className="inj-ucard">
                        <div className="inj-ucard-top">
                          <Avatar src={p.photo} name={p.name} big />
                          <div style={{ minWidth: 0 }}>
                            <div className="inj-pname" style={{ fontSize: 15 }}>{p.name}</div>
                            <div className="inj-ucard-meta">
                              <PosTag pos={p.position} />
                              <TeamCell abbr={p.team} />
                            </div>
                          </div>
                        </div>
                        <div><StatusBadge k={p.statusK} /></div>
                        <div className="inj-ucard-rows">
                          <div className="inj-r"><span>Opponent</span><span><OpponentCell info={oppInfo(p.team)} /></span></div>
                          {showFantasy && (
                            <div className="inj-r"><span>Fantasy Impact</span><span><FantasyTag level={fantasyOf(p.id)?.level} /></span></div>
                          )}
                          <div className="inj-r"><span>Injury</span><span>{p.bodyPart || '—'}</span></div>
                          <div className="inj-r"><span>Practice</span><span>{(() => { const pr = practiceOf(p); return pr ? `${pr.latest} (${pr.day})` : <span className="inj-muted">—</span> })()}</span></div>
                          <div className="inj-r"><span>Outlook</span><span>{(() => { const n = newsOf(p); if (!n) return <span className="inj-muted">Unknown</span>; const label = <span style={{ color: n.color, fontWeight: 700 }}>{n.outlook || 'See update'}</span>; return n.url ? <a href={n.url} target="_blank" rel="noopener noreferrer" title={n.headline || ''} style={{ textDecoration: 'none' }}>{label}</a> : label })()}</span></div>
                          {p.notes && <div className="inj-r"><span>Notes</span><span style={{ textAlign: 'right' }}>{p.notes}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="inj-foot">
              Designations (Out, Doubtful, Questionable, IR, PUP, NFI, Suspended) come straight from official
              team reports and refresh with the weekly player sync. Opponent and kickoff are joined from the
              weekly NFL schedule.
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="inj-side" aria-label="Injury summary">
            {/* Injury Overview donut */}
            <div className="inj-side-card">
              <div className="inj-side-title">Injury Overview</div>
              {filtered.length === 0 ? (
                <div className="inj-muted" style={{ fontSize: 13 }}>No injuries in the current view.</div>
              ) : (
                <div className="inj-donut-wrap">
                  <Donut segments={donutSegments} total={filtered.length} />
                  <div className="inj-legend">
                    {donutSegments.map((s) => (
                      <div key={s.key} className="inj-legend-row">
                        <span className="inj-legend-dot" style={{ background: s.color }} />
                        <span className="inj-legend-name">{s.key}</span>
                        <span className="inj-legend-val">{s.value}</span>
                        <span className="inj-legend-pct">{Math.round((s.value / filtered.length) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Injuries by position */}
            <div className="inj-side-card">
              <div className="inj-side-title">Injuries By Position</div>
              {posBars.rowsB.length === 0 ? (
                <div className="inj-muted" style={{ fontSize: 13 }}>No injuries in the current view.</div>
              ) : posBars.rowsB.map((b) => (
                <div key={b.group} className="inj-bar-row">
                  <div className="inj-bar-head"><span>{b.group}</span><span>{b.count}</span></div>
                  <div className="inj-bar-track">
                    <div className="inj-bar-fill" style={{ width: `${(b.count / posBars.max) * 100}%`, background: posColor(b.group === 'IDP' ? 'DL' : b.group) }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Top Fantasy Impact — injured players ranked by their REAL SAM Value
                board standing. Shown only when that value board is joined; if it
                isn't reachable we fall back to the honest "Most Serious" proxy,
                which is ordered by official designation severity (a real signal),
                never an invented fantasy number. */}
            {showFantasy ? (
              <div className="inj-side-card">
                <div className="inj-side-title">Top Fantasy Impact Players</div>
                {topFantasy.length === 0 ? (
                  <div className="inj-muted" style={{ fontSize: 13 }}>No priced players in the current view.</div>
                ) : topFantasy.map((p, i) => {
                  const fv = fantasy.map[String(p.id)]
                  return (
                    <div key={p.id} className="inj-top-row">
                      <span className="inj-top-rank">{i + 1}</span>
                      <Avatar src={p.photo} name={p.name} />
                      <div className="inj-top-info">
                        <div className="inj-top-name">{p.name}</div>
                        <div className="inj-top-sub">{[p.position, p.team].filter(Boolean).join(' · ')} · Value {fv.value}</div>
                      </div>
                      <FantasyTag level={fv.level} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="inj-side-card">
                <div className="inj-side-title">Most Serious (by official status)</div>
                {topSerious.length === 0 ? (
                  <div className="inj-muted" style={{ fontSize: 13 }}>No injuries in the current view.</div>
                ) : topSerious.map((p, i) => (
                  <div key={p.id} className="inj-top-row">
                    <span className="inj-top-rank">{i + 1}</span>
                    <Avatar src={p.photo} name={p.name} />
                    <div className="inj-top-info">
                      <div className="inj-top-name">{p.name}</div>
                      <div className="inj-top-sub">{[p.position, p.team].filter(Boolean).join(' · ')}</div>
                    </div>
                    <StatusBadge k={p.statusK} />
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
