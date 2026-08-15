import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notification } from 'antd'
import Header from '../../components/Header'
import OnboardingGuide from '../../components/OnboardingGuide'
import PlayerAvatar from '../../components/PlayerAvatar'
import ReplacePlayer from '../../components/modal/ReplacePlayer'
import { positions as POS_MAP, leagueSalaryCap as CAP_FALLBACK } from '../../config/constants'
import { getActiveRosterCount, getteamFormation, clearDepthChart, assignLineupFormation, getPlayersByPosition, assignPlayerToStarter } from '../../redux/actions/depthChartAction'
import { getRoster } from '../../redux/actions/rosterAction'
import { FORMATION_SLOT_KEYS } from '../../config/lineupFormations'
import '../../styles/pages/startingXi.css'

/* Starting XI — rebuilt field UI (Offense/Defense) matching the design.
   Slots come from the existing depthChart data; clicking a slot opens the
   existing DepthChartModal, so all assignment/business logic is preserved. */

const POS_COLORS = { QB: '#8b5cf6', RB: '#24d26c', WR: '#3b82f6', TE: '#f6c453', OL: '#f97316', DL: '#ef4444', DE: '#ef4444', DT: '#f97316', LB: '#ec4899', CB: '#06b6d4', S: '#84cc16', DB: '#06b6d4', K: '#a78bfa', P: '#64748b', QB2: '#8b5cf6' }
const SPECIAL_KEYS = ['offense_qb-2', 'special_team_pk', 'special_team_pn']

/* Per-formation field rows (derived from the depthCard.css geometry so only the
   formation's real slots render, in the correct left-to-right order). This is
   what fixes the defense over-population — e.g. 4-3 = DE·DT·DT·DE / LB·LB·LB / CB·S·S·CB.
   Now sourced from the shared lineup-formation config so the Starting XI editor
   and the Postseason Roster Board stay in lockstep. */
const FORMATION_ROWS = FORMATION_SLOT_KEYS

const OFFENSE_FORMATIONS = [
  { label: 'Shotgun', value: 'shortgunnormal' }, { label: 'Singleback', value: 'singleback' },
  { label: 'I-Form', value: 'iformaton' }, { label: 'Pistol', value: 'pistol' }, { label: 'Spread', value: 'spread' },
]
const DEFENSE_FORMATIONS = [
  { label: '4-3 Base', value: 'formation_43' }, { label: '3-4', value: 'formation_34' }, { label: 'Nickel', value: 'formation_425' },
  { label: 'Dime', value: 'dime' }, { label: '3-3-5', value: 'nickel' }, { label: 'Cover 2', value: 'cover2' },
]

const OL_LABELS = ['LT', 'LG', 'C', 'RG', 'RT']
// Position string derived from a slot's classKey (for empty "Add Player" slots).
const keyToPos = (k) => {
  if (/offense_ol-(\d)/.test(k)) return 'ol'
  if (/offense_wr/.test(k)) return 'wr'
  if (/offense_te/.test(k)) return 'te'
  if (/offense_qb-1/.test(k)) return 'qb'
  if (/offense_rbwrte/.test(k)) return 'rb/wr/te'
  if (/offense_rb/.test(k)) return 'rb'
  if (/offense_qb-2/.test(k)) return 'backup qb'
  if (/special_team_pk/.test(k)) return 'K'
  if (/special_team_pn/.test(k)) return 'P'
  if (/(_de|_dtde)/.test(k)) return 'de'
  if (/(_dt|34_dl|34_dt)/.test(k)) return 'dt'
  if (/(_lb|34_old|_dtlb|lbcbs)/.test(k)) return 'lb'
  if (/_cbs/.test(k)) return 'cb/s'
  if (/_cb/.test(k)) return 'cb'
  if (/_s/.test(k)) return 's'
  return ''
}
// Badge label for a slot: OL slots become LT/LG/C/RG/RT; else the position map.
const badgeFor = (slot) => {
  const k = slot.classKey || ''
  if (k === 'special_team_pk') return 'K'
  if (k === 'special_team_pn') return 'P'
  if (k === 'offense_qb-2') return 'QB2'
  const m = /offense_ol-(\d)/.exec(k)
  if (m) return OL_LABELS[+m[1] - 1] || 'OL'
  const pos = slot.Position || keyToPos(k)
  return (POS_MAP[pos] || pos || '').toUpperCase()
}

const money = (n) => (n == null ? '--' : `$${(Number(n) / 1e6).toFixed(1)}M`)

/* ── Field placement ──────────────────────────────────────────────────────
   Each slot is positioned at an absolute point on the field (percent x/y),
   so the formation looks real instead of three evenly-spread rows.

   Vertical bands (y%) — smaller gaps than before, and clear of the endzone
   lettering at the top of the field photo. */
const OFF_Y = [27, 46, 60]     // [0] O-line, [1] QB, [2] RB
const DEF_Y = [55, 42, 29]     // [0] D-line, [1] LB, [2] secondary  (DL low, DBs high)
// The field is a broadcast angle, so it narrows toward the far endzone. Cards
// higher up (smaller y = farther away) shrink; foreground cards stay full size.
const scaleForY = (y) => +(0.80 + (y / 100) * 0.42).toFixed(3)   // ~0.91 far → ~1.05 near

const isOLkey = (k = '') => /offense_ol-/.test(k)
// Evenly spread N cards around midfield with a fixed step (tight = small step).
const xCentered = (row, step) => {
  const n = row.length
  return row.map((_, i) => (n === 1 ? 50 : 50 + (i - (n - 1) / 2) * step))
}
// Spread N cards across the full width between min% and max% (sidelines).
const xSpread = (row, min, max) => {
  const n = row.length
  if (n === 1) return [50]
  return row.map((_, i) => min + (i * (max - min)) / (n - 1))
}
// Offensive line row: OL tight in the centre, TEs just outside the tackles,
// WRs split wide to the numbers. Left/right decided by position around the OL.
const xOffenseLine = (row) => {
  const ols = row.map((s, i) => ({ i, ol: isOLkey(s.classKey) })).filter((o) => o.ol)
  const olN = ols.length
  const firstOl = ols.length ? ols[0].i : Math.floor(row.length / 2)
  const lastOl = ols.length ? ols[ols.length - 1].i : firstOl
  const leftIdx = row.map((s, i) => i).filter((i) => i < firstOl)
  const rightIdx = row.map((s, i) => i).filter((i) => i > lastOl)
  const leftLanes = { 1: [9], 2: [6, 20], 3: [5, 16, 27] }[leftIdx.length] || []
  const rightLanes = { 1: [91], 2: [80, 94], 3: [73, 84, 95] }[rightIdx.length] || []
  const x = new Array(row.length).fill(50)
  ols.forEach((o, k) => { x[o.i] = 50 + (k - (olN - 1) / 2) * 9 })       // line, a touch spread
  leftIdx.forEach((i, j) => { x[i] = leftLanes[j] ?? 12 })              // outside-in
  rightIdx.forEach((i, j) => { x[i] = rightLanes[j] ?? 88 })
  return x
}
// Horizontal perspective: the field narrows toward the far endzone, so rows
// higher up (smaller y) get pulled toward the centre; foreground rows spread
// out to the full width. Keeps far receivers/corners on the grass, not the stands.
const compressForY = (y) => 0.62 + (y / 100) * 0.70   // far ~0.81 → near ~1.04
const perspX = (x, y) => 50 + (x - 50) * compressForY(y)

/* Explicit per-formation coordinates (final screen positions on the field,
   endzone at the top). When a formation is listed here we use these numbers
   verbatim — no computed spread, no extra perspective — because they already
   account for the field narrowing toward the endzone (smaller scale = farther).
   Keyed by the app's slot classKey. Formations not listed use the computed
   fallback below. */
const FORMATION_COORDS = {
  // 4-3 Base — 4 DL, 3 LB, 4 DB
  formation_43: {
    'defense_cb-1': { x: 21, y: 20, scale: 0.82 }, // LCB
    'defense_s-2':  { x: 43, y: 15, scale: 0.78 }, // FS
    'defense_s':    { x: 57, y: 15, scale: 0.78 }, // SS
    'defense_cb-2': { x: 79, y: 20, scale: 0.82 }, // RCB
    'defense_lb-1': { x: 37, y: 35, scale: 0.90 }, // WLB
    'defense_lb-2': { x: 50, y: 34, scale: 0.90 }, // MLB
    'defense_lb-3': { x: 63, y: 35, scale: 0.90 }, // SLB
    'defense_de':   { x: 36, y: 53, scale: 1.00 }, // LDE
    'defense_dt':   { x: 45, y: 52, scale: 1.00 }, // LDT
    'defense_dt-2': { x: 55, y: 52, scale: 1.00 }, // RDT
    'defense_de-2': { x: 64, y: 53, scale: 1.00 }, // RDE
  },
  // 3-4 Base — 3 DL, 4 LB, 4 DB
  formation_34: {
    'defense_cb-1':    { x: 21, y: 20, scale: 0.82 }, // LCB
    'defense_s-2':     { x: 43, y: 15, scale: 0.78 }, // FS
    'defense_s':       { x: 57, y: 15, scale: 0.78 }, // SS
    'defense_cb-2':    { x: 79, y: 20, scale: 0.82 }, // RCB
    'defense34_old-1': { x: 31, y: 34, scale: 0.91 }, // LOLB
    'defense_lb-1':    { x: 44, y: 33, scale: 0.90 }, // LILB
    'defense_lb-2':    { x: 56, y: 33, scale: 0.90 }, // RILB
    'defense34_old-2': { x: 69, y: 34, scale: 0.91 }, // ROLB
    'defense34_dl':    { x: 40, y: 53, scale: 1.00 }, // LDE
    'defense_dt':      { x: 50, y: 52, scale: 1.00 }, // NT
    'defense34_dt':    { x: 60, y: 53, scale: 1.00 }, // RDE
  },
  // Nickel 4-2-5 — 4 DL, 2 LB, 5 DB (NB = nickel back → defense_cb-3)
  formation_425: {
    'defense_cb-1': { x: 18, y: 22, scale: 0.83 }, // LCB
    'defense_s-2':  { x: 43, y: 14, scale: 0.77 }, // FS
    'defense_s':    { x: 57, y: 14, scale: 0.77 }, // SS
    'defense_cb-2': { x: 82, y: 22, scale: 0.83 }, // RCB
    'defense_cb-3': { x: 69, y: 31, scale: 0.88 }, // NB
    'defense_lb-1': { x: 43, y: 33, scale: 0.91 }, // WLB
    'defense_lb-2': { x: 57, y: 33, scale: 0.91 }, // MLB
    'defense_de':   { x: 36, y: 53, scale: 1.00 }, // LDE
    'defense_dt':   { x: 45, y: 52, scale: 1.00 }, // LDT
    'defense_dt-2': { x: 55, y: 52, scale: 1.00 }, // RDT
    'defense_de-2': { x: 64, y: 53, scale: 1.00 }, // RDE
  },
  // Dime 4-1-6 — 4 DL, 1 LB, 6 DB (LNB/RNB nickel backs → cb-3/cb-4)
  dime: {
    'defense_cb-1': { x: 17, y: 23, scale: 0.83 }, // LCB
    'defense_cb-3': { x: 34, y: 31, scale: 0.87 }, // LNB
    'defense_s-2':  { x: 42, y: 13, scale: 0.76 }, // FS
    'defense_s':    { x: 58, y: 13, scale: 0.76 }, // SS
    'defense_cb-4': { x: 66, y: 31, scale: 0.87 }, // RNB
    'defense_cb-2': { x: 83, y: 23, scale: 0.83 }, // RCB
    'defense_lb-1': { x: 50, y: 33, scale: 0.91 }, // MLB
    'defense_de':   { x: 36, y: 53, scale: 1.00 }, // LDE
    'defense_dt':   { x: 45, y: 52, scale: 1.00 }, // LDT
    'defense_dt-2': { x: 55, y: 52, scale: 1.00 }, // RDT
    'defense_de-2': { x: 64, y: 53, scale: 1.00 }, // RDE
  },

  // ── Offense (line of scrimmage ~y50, backfield toward the camera = lower + larger) ──
  // Shotgun 11 personnel — 3 WR, TE, 5 OL, QB, RB
  shortgunnormal: {
    'offense_wr-1': { x: 15, y: 50, scale: 0.98 }, // X
    'offense_wr-3': { x: 26, y: 50, scale: 0.98 }, // slot (on the line)
    'offense_ol-1': { x: 34,   y: 50, scale: 1.00 }, // LT
    'offense_ol-2': { x: 42,   y: 50, scale: 1.00 }, // LG
    'offense_ol-3': { x: 50,   y: 50, scale: 1.00 }, // C
    'offense_ol-4': { x: 58,   y: 50, scale: 1.00 }, // RG
    'offense_ol-5': { x: 66,   y: 50, scale: 1.00 }, // RT
    'offense_te':   { x: 73, y: 50, scale: 1.00 }, // Y (TE)
    'offense_wr-2': { x: 85, y: 50, scale: 0.98 }, // Z
    'offense_qb-1': { x: 50, y: 64, scale: 1.08 }, // QB
    'offense_rb':   { x: 59, y: 70, scale: 1.12 }, // RB
  },
  // Singleback 11 personnel — app slot te-2 used as the slot receiver spot
  singleback: {
    'offense_wr-1': { x: 15, y: 50, scale: 0.98 }, // X
    'offense_te-2': { x: 27, y: 50, scale: 1.00 }, // in-line TE (left)
    'offense_ol-1': { x: 34,   y: 50, scale: 1.00 },
    'offense_ol-2': { x: 42,   y: 50, scale: 1.00 },
    'offense_ol-3': { x: 50,   y: 50, scale: 1.00 },
    'offense_ol-4': { x: 58,   y: 50, scale: 1.00 },
    'offense_ol-5': { x: 66,   y: 50, scale: 1.00 },
    'offense_te':   { x: 73, y: 50, scale: 1.00 }, // TE
    'offense_wr-2': { x: 85, y: 50, scale: 0.98 }, // Z
    'offense_qb-1': { x: 50, y: 61, scale: 1.05 }, // QB
    'offense_rb':   { x: 50, y: 75, scale: 1.13 }, // RB
  },
  // I-Formation 21 personnel — rbwrte = fullback lead
  iformaton: {
    'offense_wr-1':   { x: 15, y: 50, scale: 0.98 }, // X
    'offense_ol-1':   { x: 34,   y: 50, scale: 1.00 },
    'offense_ol-2':   { x: 42,   y: 50, scale: 1.00 },
    'offense_ol-3':   { x: 50,   y: 50, scale: 1.00 },
    'offense_ol-4':   { x: 58,   y: 50, scale: 1.00 },
    'offense_ol-5':   { x: 66,   y: 50, scale: 1.00 },
    'offense_te':     { x: 73, y: 50, scale: 1.00 }, // TE
    'offense_wr-2':   { x: 85, y: 50, scale: 0.98 }, // Z
    'offense_qb-1':   { x: 50, y: 61, scale: 1.05 }, // QB
    'offense_rbwrte': { x: 50, y: 72, scale: 1.10 }, // FB
    'offense_rb':     { x: 50, y: 83, scale: 1.16 }, // RB
  },
  // Pistol — app has 2 backs (rb, rb-2); split the single authored back left/right
  pistol: {
    'offense_wr-1': { x: 15, y: 50, scale: 0.98 }, // X
    'offense_ol-1': { x: 34,   y: 50, scale: 1.00 },
    'offense_ol-2': { x: 42,   y: 50, scale: 1.00 },
    'offense_ol-3': { x: 50,   y: 50, scale: 1.00 },
    'offense_ol-4': { x: 58,   y: 50, scale: 1.00 },
    'offense_ol-5': { x: 66,   y: 50, scale: 1.00 },
    'offense_te':   { x: 73, y: 50, scale: 1.00 }, // TE
    'offense_wr-2': { x: 85, y: 50, scale: 0.98 }, // Z
    'offense_qb-1': { x: 50, y: 62, scale: 1.07 }, // QB
    'offense_rb':   { x: 43, y: 74, scale: 1.12 }, // RB
    'offense_rb-2': { x: 57, y: 76, scale: 1.13 }, // RB2
  },
}

// Dev-only guard: every explicit formation must cover exactly its 11 real slots.
if (process.env.NODE_ENV !== 'production') {
  Object.entries(FORMATION_COORDS).forEach(([name, coords]) => {
    const keys = (FORMATION_ROWS[name] || []).flat()
    if (keys.length !== 11) console.error(`Starting XI: formation "${name}" has ${keys.length} slots, expected 11`)
    keys.forEach((k) => { if (!coords[k]) console.error(`Starting XI: formation "${name}" missing coords for slot "${k}"`) })
    if (Object.keys(coords).length !== keys.length) console.error(`Starting XI: formation "${name}" has extra/duplicate coord keys`)
  })
}

/* The explicit coordinates were authored for a field where the grass starts at
   the very top. THIS background image has a crowd + SAMSPORTS endzone across the
   top ~30%, so the grass actually starts lower. This remaps the authored y (0
   = top of grass) onto the visible grass of the current image. Pure vertical
   shift+compress; two tunable numbers. When a matching clean field image is
   dropped in (grass filling the frame), set ORIGIN=0 / GAIN=1 for a 1:1 map. */
const FIELD_Y_ORIGIN = 26    // where authored y=0 lands, % down the field box
const FIELD_Y_GAIN = 0.62    // compress to fit inside the visible grass
const calY = (uy) => +(FIELD_Y_ORIGIN + FIELD_Y_GAIN * uy).toFixed(2)

// Compute {x,y,scale} for every slot of a formation. rows = ordered formation
// rows; offense rows are [line, qb, rb]; defense rows are [DL, LB, secondary].
const placeSlots = (rows, isDefense, formation) => {
  // Explicit coordinate table wins when present for this formation.
  const explicit = FORMATION_COORDS[formation]
  if (explicit) {
    const out = []
    rows.forEach((row) => row.forEach((slot) => {
      const c = explicit[slot.classKey] || { x: 50, y: 50, scale: 1 }
      // Only defensive coords need the grass remap; offense coords already land
      // on the grass (line of scrimmage at y~50, backfield toward the camera).
      out.push({ slot, x: c.x, y: isDefense ? calY(c.y) : c.y, scale: c.scale })
    }))
    return out
  }
  const yArr = isDefense ? DEF_Y : OFF_Y
  const out = []
  rows.forEach((row, ri) => {
    if (!row.length) return
    let xs
    if (!isDefense) {
      if (ri === 0) xs = xOffenseLine(row)
      else if (ri === 1) xs = xCentered(row, 14)   // QB(s)
      else xs = xCentered(row, 16)                 // RB(s)
    } else {
      if (ri === 0) xs = xCentered(row, 8.5)       // D-line, tight
      else if (ri === 1) xs = xCentered(row, 19)   // linebackers, medium
      else xs = xSpread(row, 8, 92)                // secondary, full width
    }
    const y = yArr[ri] ?? 50
    row.forEach((slot, ci) => out.push({ slot, x: perspX(xs[ci] ?? 50, y), y, scale: scaleForY(y) }))
  })
  return out
}

const SlotCard = ({ slot, onClick }) => {
  const pos = badgeFor(slot)
  const color = POS_COLORS[pos] || '#8b5cf6'
  const filled = !!slot.Name
  return (
    <button className={`xi-card${filled ? '' : ' xi-card--empty'}${pos === 'WR' ? ' xi-card--wr' : ''}`} style={{ '--pos': color }} onClick={onClick}>
      <span className="xi-card-badge">{pos}</span>
      <span className="xi-card-photo">
        {filled ? <PlayerAvatar name={slot.Name} src={slot.imageUrl} size={40} /> : <span className="xi-card-plus" aria-hidden>+</span>}
      </span>
      <span className="xi-card-name">{slot.Name || 'Add Player'}</span>
      {filled && <span className="xi-card-opp">{slot.Opponent || '-'}</span>}
      {filled && (
        <span className="xi-card-stats"><span>OVR <b>--</b></span><span>Proj <b>--</b></span></span>
      )}
    </button>
  )
}

const StartingXI = () => {
  const dispatch = useDispatch()
  const SETTING = useSelector((s) => s?.user?.setting)
  const currentLeagueId = useSelector((s) => s?.user?.userDetails?.team?.currentLeague?._id)
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const leagueCap = useSelector((s) => s?.user?.leagueSalaryCap)
  const teamCap = useSelector((s) => s?.user?.teamSalaryCap)
  const { staticData, data, activeFilter } = useSelector((s) => s?.depthChart) || {}
  const rosterData = useSelector((s) => s?.roster?.data)

  const [loading, setLoading] = useState(true)
  const [offForm, setOffForm] = useState('shortgunnormal')
  const [defForm, setDefForm] = useState('formation_43')
  const [modalSlot, setModalSlot] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [filling, setFilling] = useState(false)

  const filter = activeFilter || 'offense'
  const formation = filter === 'offense' ? offForm : defForm

  const load = async () => {
    setLoading(true)
    try {
      const res = await getActiveRosterCount({ week: SETTING?.week, type: filter, formation })
      if (res) dispatch({ type: 'SET_DEPTH_CHART_DATA', payload: { data: res.data, count: res.count } })
    } catch (e) { /* keep prior */ }
    setLoading(false)
  }

  useEffect(() => { (async () => { try { const r = await getteamFormation(); if (r?.offense_Formation) setOffForm(r.offense_Formation); if (r?.defense_Formation) setDefForm(r.defense_Formation) } catch {} })() }, [currentLeagueId])
  useEffect(() => { if (SETTING?.week) load(); if (!rosterData) getRoster(SETTING?.week) /* for donut + bench */ }, [SETTING?.week, filter, formation, currentLeagueId]) // eslint-disable-line

  const setFilter = (f) => { if (isOffenseOnly && f === 'defense') return; dispatch({ type: 'SET_ACTIVE_FILTER', payload: f }) }
  const formationOptions = filter === 'offense' ? OFFENSE_FORMATIONS : DEFENSE_FORMATIONS
  const handleFormation = async (val) => {
    if (filter === 'offense') setOffForm(val); else setDefForm(val)
    try { await assignLineupFormation({ payload: { formation: val, activeFilter: filter, week: SETTING?.week } }) } catch { /* keep local */ }
  }

  const slots = (data?.length ? data : (staticData || []).filter((s) => s.type === filter)) || []
  const slotByKey = useMemo(() => { const m = {}; slots.forEach((s) => { if (s.classKey) m[s.classKey] = s }); return m }, [slots])
  const specialSlots = SPECIAL_KEYS.map((k) => slotByKey[k] || { classKey: k })

  // Only the current formation's real slots, in the design's rows.
  const rows = useMemo(() => {
    const tmpl = FORMATION_ROWS[formation] || []
    return tmpl.map((row) => row.map((k) => slotByKey[k] || { classKey: k, Position: keyToPos(k) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotByKey, formation])

  // Absolute field coordinates for each slot of the current formation.
  const placed = useMemo(() => placeSlots(rows, filter === 'defense', formation), [rows, filter, formation])

  // Sidebar data
  const CAP_LIMIT = Number(leagueCap) > 0 ? Number(leagueCap) : CAP_FALLBACK
  const capTable = rosterData?.currentyearsalarycap || {}
  const capUsed = Number(teamCap) > 0 ? Number(teamCap) : Object.values(capTable).reduce((s, v) => s + (Number(v) || 0), 0)
  const rosterAll = useMemo(() => [
    ...(rosterData?.filterActiveRoster || []), ...(rosterData?.filterNonActiveRoster || []),
    ...(rosterData?.filterPracticeRoster || []), ...(rosterData?.filterProtectedRoster || []),
  ], [rosterData])
  const breakdown = useMemo(() => {
    const m = {}
    rosterAll.forEach((p) => { const g = (p?.players?.FantasyPosition === 'OL' ? 'OL' : p?.players?.Position) || 'DEF'; m[g] = (m[g] || 0) + 1 })
    const order = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'DEF']
    return order.filter((g) => m[g]).map((g) => ({ g, n: m[g], color: POS_COLORS[g] || '#64748b' }))
  }, [rosterAll])
  const bench = (rosterData?.filterNonActiveRoster || []).slice(0, 8)

  const doClear = async () => {
    setClearing(true)
    try { await clearDepthChart({ week: SETTING?.week, type: filter }); await load(); notification.success({ message: 'Lineup reset', duration: 2 }) }
    catch { notification.error({ message: 'Failed to reset lineup', duration: 3 }) }
    setClearing(false)
  }
  // Auto Fill — for each empty slot in the current view, assign the best available
  // player for that position (highest projected score not already used).
  const scoreOf = (b) => Number(b?.players?.pf ?? b?.players?.avgPf ?? b?.pf ?? 0)
  const autoFill = async () => {
    if (filling) return
    if (rosterData && !isOffenseOnly && !((rosterData?.filterActiveRoster || []).length === 46 && (rosterData?.filterNonActiveRoster || []).length === 7)) {
      notification.warning({ message: 'Illegal squad — set exactly 46 active and 7 inactive players before you can set your lineup.', duration: 4 })
      return
    }
    setFilling(true)
    try {
      const targets = [...rows.flat(), ...(filter === 'offense' ? specialSlots : [])].filter((s) => s && !s.Name)
      const used = new Set()
      let filled = 0
      for (const slot of targets) {
        const isB = slot.Position === 'backup qb' || slot.classKey === 'offense_qb-2'
        const pos = isB ? 'QB' : String(slot.Position || keyToPos(slot.classKey) || '').toUpperCase()
        if (!pos) continue
        let res
        try { res = await getPlayersByPosition({ position: pos, classKey: slot.classKey, week: SETTING?.week, formation }) } catch { continue }
        const cands = (res?.bench || []).filter((b) => b?.players?._id && !used.has(b.players._id))
        cands.sort((a, b) => scoreOf(b) - scoreOf(a))
        const pick = cands[0]
        if (pick) {
          try {
            await assignPlayerToStarter({ oldPlayerId: '', playerId: pick.players._id, classKey: slot.classKey, isBackup: isB, week: SETTING?.week })
            used.add(pick.players._id); filled++
          } catch { /* skip this slot */ }
        }
      }
      await load()
      notification.success({ message: filled ? `Auto-filled ${filled} spot${filled !== 1 ? 's' : ''} with the best available players` : 'No empty spots to fill', duration: 3 })
    } catch { notification.error({ message: 'Auto Fill failed', duration: 3 }) }
    setFilling(false)
  }

  const showGrid = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('grid')

  /* Squad-legality gate. Full-mode teams need exactly 46 active + 7 inactive
     (a full 53-man roster) before a lineup can be SAVED. Offense-only leagues
     are exempt. The field stays viewable when illegal — only the assignment
     actions are blocked, with a red message explaining why. We only treat the
     squad as illegal once the roster has loaded so we never flash the warning. */
  const xiActiveCount = (rosterData?.filterActiveRoster || []).length
  const xiBenchCount = (rosterData?.filterNonActiveRoster || []).length
  const squadLegal = isOffenseOnly || !rosterData || (xiActiveCount === 46 && xiBenchCount === 7)
  // The player pop-up stays openable even when the squad is illegal — you can
  // browse candidates, you just can't save the lineup (the modal's Confirm is
  // locked). Auto Fill (a bulk save) stays blocked.
  const openSlot = (slot) => setModalSlot(slot)

  return (
    <div className="xi-wrap">
      <Header />
      <OnboardingGuide tabKey="depth-chart" />
      <div className={`xi${modalSlot ? ' xi--drawer' : ''}`}>
        <div className="xi-main">
          {/* Toolbar */}
          <div className="xi-toolbar">
            <div>
              <h1 className="xi-title">Starting XI</h1>
            </div>
            <div className="xi-toolbar-right">
              <div className="xi-tabs">
                <button className={`xi-tab${filter === 'offense' ? ' xi-tab--on' : ''}`} onClick={() => setFilter('offense')}>Offense</button>
                {!isOffenseOnly && <button className={`xi-tab${filter === 'defense' ? ' xi-tab--on' : ''}`} onClick={() => setFilter('defense')}>Defense</button>}
              </div>
              <label className="xi-formation">Formation
                <select value={formation} onChange={(e) => handleFormation(e.target.value)}>
                  {formationOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </label>
              <span className="xi-weekchip">Week {SETTING?.week || '-'}</span>
              <button className="xi-btn xi-btn--ghost" onClick={autoFill} disabled={filling || !squadLegal}>⚡ {filling ? 'Filling…' : 'Auto Fill'}</button>
              <button className="xi-btn xi-btn--ghost" onClick={doClear} disabled={clearing}>↺ Reset</button>
            </div>
          </div>

          {/* Illegal-squad notice — field stays viewable, edits are blocked */}
          {!squadLegal && (
            <div className="xi-illegal-bar" role="alert">
              <span className="xi-illegal-bar-icon" aria-hidden>&#9888;</span>
              <div className="xi-illegal-bar-body">
                <b>Illegal squad — lineup can’t be saved.</b> You need exactly <b>46 active</b> and <b>7 inactive</b> players (a full 53-man roster). Currently {xiActiveCount} active · {xiBenchCount} inactive.
              </div>
              <a className="xi-illegal-bar-link" href="/player-roster">Fix in My Squad</a>
            </div>
          )}

          {/* Field — players placed at absolute formation coordinates */}
          <div className={`xi-field${filter === 'defense' ? ' xi-field--defense' : ''}`}>
            <div className="xi-field-lines" aria-hidden />
            {showGrid && <FieldGrid />}
            {loading ? (
              <div className="xi-field-loading">Loading lineup…</div>
            ) : (
              placed.map(({ slot, x, y }) => (
                <div className="xi-slot" key={slot.classKey} style={{ left: `${x}%`, top: `${y}%` }}>
                  <SlotCard slot={slot} onClick={() => openSlot(slot)} />
                </div>
              ))
            )}
          </div>

          {/* Special teams & backup QB — offense only (K/P/QB2 aren't in the defense view) */}
          {filter === 'offense' && (
            <div className="xi-special">
              <span className="xi-special-label">Special Teams &amp; Backup QB</span>
              <div className="xi-special-cards">
                {specialSlots.map((s) => <SlotCard key={s.classKey} slot={s} onClick={() => openSlot(s)} />)}
              </div>
            </div>
          )}

          {/* Bench (reserves — never K/P/QB2) */}
          <div className="xi-bench">
            <span className="xi-bench-label">Bench</span>
            <div className="xi-bench-cards">
              {bench.length === 0 ? <span className="xi-bench-empty">No reserves on the bench.</span> : bench.map((p, i) => (
                <div className="xi-bench-card" key={p?.players?.PlayerID || i}>
                  <span className="xi-card-badge" style={{ '--pos': POS_COLORS[p?.players?.Position] || '#64748b' }}>{p?.players?.Position || '--'}</span>
                  <PlayerAvatar name={p?.players?.Name} src={p?.players?.HostedHeadshotNoBackgroundUrl} size={32} />
                  <span className="xi-bench-name">{p?.players?.Name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ReplacePlayer open={!!modalSlot} slot={modalSlot} formation={formation} onClose={() => setModalSlot(null)} onDone={load} locked={!squadLegal} />
    </div>
  )
}

/* Dev-only coordinate grid (enable with ?grid=1). Hover the field to read the
   x/y percentage under the cursor, so precise per-position coordinates can be
   captured. Lines every 5%, labelled every 10%. */
const FieldGrid = () => {
  const [pos, setPos] = React.useState(null)
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10)
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({
      x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 10,
      y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 10,
    })
  }
  return (
    <div className="xi-grid" onMouseMove={onMove} onMouseLeave={() => setPos(null)}>
      {ticks.map((t) => (
        <div className="xi-grid-v" key={`v${t}`} style={{ left: `${t}%` }}><span className="xi-grid-lbl">{t}</span></div>
      ))}
      {ticks.map((t) => (
        <div className="xi-grid-h" key={`h${t}`} style={{ top: `${t}%` }}><span className="xi-grid-lbl">{t}</span></div>
      ))}
      <div className="xi-grid-readout">{pos ? `x: ${pos.x}%   y: ${pos.y}%` : 'hover the field…'}</div>
    </div>
  )
}

const Donut = ({ breakdown, total }) => {
  const sum = breakdown.reduce((s, b) => s + b.n, 0) || 1
  let a0 = -90
  const arcs = breakdown.map((b) => { const a1 = a0 + (b.n / sum) * 360; const seg = { ...b, a0, a1 }; a0 = a1; return seg })
  const pol = (a) => { const r = 46, c = 60, rad = (a * Math.PI) / 180; return [c + r * Math.cos(rad), c + r * Math.sin(rad)] }
  return (
    <div className="xi-donut-wrap">
      <svg viewBox="0 0 120 120" width="112" height="112">
        {arcs.map((s, i) => { const [x0, y0] = pol(s.a0); const [x1, y1] = pol(s.a1); const lg = s.a1 - s.a0 > 180 ? 1 : 0; return <path key={i} d={`M60 60 L ${x0} ${y0} A 46 46 0 ${lg} 1 ${x1} ${y1} Z`} fill={s.color} opacity="0.9" /> })}
        <circle cx="60" cy="60" r="30" fill="#0a0d14" />
        <text x="60" y="57" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{total}</text>
        <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#8a93a6">Players</text>
      </svg>
      <div className="xi-donut-legend">{breakdown.map((b) => <div key={b.g}><span style={{ background: b.color }} />{b.g}<b>{b.n}</b></div>)}</div>
    </div>
  )
}

export default StartingXI
