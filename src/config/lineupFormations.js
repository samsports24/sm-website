/* ──────────────────────────────────────────────────────────────────────────
   Shared lineup-formation → starting-slot config.

   Single source of truth for "which starting slots does a given NFL formation
   have?". Both the Starting XI editor (src/pages/StartingXI) and the Postseason
   Roster Board (src/pages/Postseason/RosterBoard.js) derive their slot sets from
   here, so the two always stay in lockstep.

   The per-formation slot geometry lives in `FORMATION_SLOT_KEYS` below — the
   exact same slot classKeys the Starting XI field renders (mirrors the
   `FORMATION_ROWS` table in src/pages/StartingXI/index.js). Each classKey is
   mapped to an IDP-style position label (QB/RB/WR/TE/OL/FLEX for offense,
   DL/LB/DB for defense) using the same logic StartingXI's `keyToPos`/`badgeFor`
   use, then the labels are ordered into a clean, grouped list for display.
   ────────────────────────────────────────────────────────────────────────── */

/* Per-formation ordered slot classKeys, grouped into field rows.
   Offense rows = [line, QB, backfield]; defense rows = [DL, LB, secondary].
   MUST match FORMATION_ROWS in src/pages/StartingXI/index.js exactly. */
export const FORMATION_SLOT_KEYS = {
  // ── Offense ──
  shortgunnormal: [['offense_wr-1', 'offense_wr-3', 'offense_ol-1', 'offense_ol-2', 'offense_ol-3', 'offense_ol-4', 'offense_ol-5', 'offense_te', 'offense_wr-2'], ['offense_qb-1'], ['offense_rb']],
  singleback: [['offense_wr-1', 'offense_te-2', 'offense_ol-1', 'offense_ol-2', 'offense_ol-3', 'offense_ol-4', 'offense_ol-5', 'offense_te', 'offense_wr-2'], ['offense_qb-1'], ['offense_rb']],
  iformaton: [['offense_wr-1', 'offense_ol-1', 'offense_ol-2', 'offense_ol-3', 'offense_ol-4', 'offense_ol-5', 'offense_te', 'offense_wr-2'], ['offense_qb-1'], ['offense_rbwrte', 'offense_rb']],
  pistol: [['offense_wr-1', 'offense_ol-1', 'offense_ol-2', 'offense_ol-3', 'offense_ol-4', 'offense_ol-5', 'offense_te', 'offense_wr-2'], ['offense_qb-1'], ['offense_rb', 'offense_rb-2']],
  spread: [['offense_wr-1', 'offense_wr-3', 'offense_ol-1', 'offense_ol-2', 'offense_ol-3', 'offense_ol-4', 'offense_ol-5', 'offense_wr-2'], ['offense_qb-1'], ['offense_rb', 'offense_rbwrte']],
  // ── Defense ──
  formation_43: [['defense_de', 'defense_dt', 'defense_dt-2', 'defense_de-2'], ['defense_lb-1', 'defense_lb-2', 'defense_lb-3'], ['defense_cb-1', 'defense_s-2', 'defense_s', 'defense_cb-2']],
  formation_34: [['defense34_dl', 'defense_dt', 'defense34_dt'], ['defense34_old-1', 'defense_lb-1', 'defense_lb-2', 'defense34_old-2'], ['defense_cb-1', 'defense_s-2', 'defense_s', 'defense_cb-2']],
  formation_425: [['defense_de', 'defense_dt', 'defense_dt-2', 'defense_de-2'], ['defense_lb-1', 'defense_lb-2'], ['defense_cb-1', 'defense_s-2', 'defense_s', 'defense_cb-3', 'defense_cb-2']],
  dime: [['defense_de', 'defense_dt', 'defense_dt-2', 'defense_de-2'], ['defense_lb-1'], ['defense_cb-1', 'defense_cb-3', 'defense_s-2', 'defense_s', 'defense_cb-4', 'defense_cb-2']],
  nickel: [['defense34_dl', 'defense_dt', 'defense34_dt'], ['defense_lb-1', 'defense_lb-2', 'defense_lb-3'], ['defense_cb-1', 'defense_cb-3', 'defense_s-2', 'defense_s', 'defense_cb-2']],
  cover2: [['defense_de', 'defense_dt', 'defense_dt-2', 'defense_de-2'], ['defense_lb-1', 'defense_lb-2', 'defense_lb-3'], ['defense_cb-1', 'defense_s-2', 'defense_s', 'defense_cb-2']],
}

export const DEFAULT_OFFENSE_FORMATION = 'shortgunnormal'
export const DEFAULT_DEFENSE_FORMATION = 'formation_43'

/* Map a slot classKey → IDP position label, mirroring StartingXI's keyToPos()/
   badgeFor() bucketing (OL keys → OL, wr → WR, qb → QB, rb → RB, te → TE, the
   rb/wr/te flex slot → FLEX; defense de/dt/dl → DL, lb/olb → LB, cb/s → DB). */
export const keyToLabel = (key = '') => {
  const k = String(key)
  if (k.startsWith('offense')) {
    if (k.includes('rbwrte')) return 'FLEX' // rb/wr/te flex (e.g. I-form FB, spread 4th skill)
    if (k.includes('ol-')) return 'OL'
    if (k.includes('wr')) return 'WR'
    if (k.includes('te')) return 'TE'
    if (k.includes('qb')) return 'QB'
    if (k.includes('rb')) return 'RB'
    if (k.includes('special_team_pk')) return 'K'
    if (k.includes('special_team_pn')) return 'P'
    return ''
  }
  // defense
  if (k.includes('_cb') || k.includes('_s')) return 'DB'
  if (k.includes('_lb') || k.includes('34_old')) return 'LB'
  if (k.includes('_de') || k.includes('_dt') || k.includes('34_dl') || k.includes('34_dt')) return 'DL'
  return ''
}

/* Canonical display ordering for the derived slot lists. */
const OFFENSE_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL', 'FLEX']
const DEFENSE_ORDER = ['DL', 'LB', 'DB']

const orderLabels = (labels, order) => {
  const rank = (l) => { const i = order.indexOf(l); return i === -1 ? order.length : i }
  return [...labels].sort((a, b) => rank(a) - rank(b))
}

/* Derive the ordered position-label list for a single formation's slots. */
const slotsForFormation = (formation, order) => {
  const rows = FORMATION_SLOT_KEYS[formation]
  if (!rows) return null
  const labels = rows.flat().map(keyToLabel).filter(Boolean)
  return orderLabels(labels, order)
}

/* Precomputed per-formation slot lists (also handy for tests/inspection). */
export const OFFENSE_FORMATION_SLOTS = {}
export const DEFENSE_FORMATION_SLOTS = {}
Object.keys(FORMATION_SLOT_KEYS).forEach((f) => {
  const off = slotsForFormation(f, OFFENSE_ORDER)
  const def = slotsForFormation(f, DEFENSE_ORDER)
  // Offense formations produce QB/skill/OL labels; defense produce DL/LB/DB.
  if (f.startsWith('formation_') || ['dime', 'nickel', 'cover2'].includes(f)) {
    DEFENSE_FORMATION_SLOTS[f] = def
  } else {
    OFFENSE_FORMATION_SLOTS[f] = off
  }
})

/* Special teams stay fixed (K + P) — no formation defines them today. */
export const SPECIAL_TEAMS_SLOTS = ['K', 'P']

/* Return the full starting-lineup groups for a team's saved formations, with
   safe defaults when a value is missing or unknown. Shape matches the legacy
   hardcoded LINEUP_GROUPS the Roster Board used. */
export const getLineupGroups = (offenseFormation, defenseFormation) => {
  const offSlots =
    OFFENSE_FORMATION_SLOTS[offenseFormation] ||
    OFFENSE_FORMATION_SLOTS[DEFAULT_OFFENSE_FORMATION]
  const defSlots =
    DEFENSE_FORMATION_SLOTS[defenseFormation] ||
    DEFENSE_FORMATION_SLOTS[DEFAULT_DEFENSE_FORMATION]
  return [
    { label: 'Offense', slots: offSlots },
    { label: 'Defense', slots: defSlots },
    { label: 'Special Teams', slots: [...SPECIAL_TEAMS_SLOTS] },
  ]
}

export default getLineupGroups
