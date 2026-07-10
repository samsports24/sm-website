// ═══════════════════════════════════════════════════════════════
//  NFL RIVALS — SHARED CONFIGURATION
//  Single source of truth for all NFL Rivals constants.
//  Import from this file instead of hardcoding values.
// ═══════════════════════════════════════════════════════════════

// ── Division Names & Colors ──
export const DIVISIONS = {
  1: 'GRIDIRON LEGENDS',
  2: 'IRON CURTAIN',
  3: 'BLITZ DIVISION',
  4: 'ROOKIE LEAGUE',
}

export const DIVISION_COLORS = {
  1: '#ffd700',
  2: '#c0c0c0',
  3: '#A78BFA',
  4: '#8b5cf6',
}

// ── Roster Rules ──
export const SQUAD_SIZE = 53
export const ACTIVE_SIZE = 24
export const BENCH_SIZE = 29
export const OFFENSE_SIZE = 11
export const DEFENSE_SIZE = 11
export const SPECIAL_TEAMS_SIZE = 2

// ── Salary Cap ──
export const SALARY_CAP = (() => { try { const s = JSON.parse(localStorage.getItem('samsports_cap_settings') || '{}'); return s.nflCeiling || 301_000_000; } catch { return 301_000_000; } })()
export const SALARY_FLOOR = (() => { try { const s = JSON.parse(localStorage.getItem('samsports_cap_settings') || '{}'); return s.nflFloor || 280_000_000; } catch { return 280_000_000; } })()

// ── Position Requirements (Active Gameday Roster) ──
export const POSITION_REQS = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 1,
  OL: 5,
  DL: 3,
  LB: 3,
  CB: 2,
  S: 2,
  K: 1,
  P: 1,
}

// ── Draft Position Targets (full 53-man roster) ──
export const DRAFT_TARGETS = {
  QB: 2, OL: 9, RB: 4, WR: 6, TE: 3,
  DL: 6, LB: 7, CB: 5, S: 4, K: 1, P: 1,
}

// ── Zone Capacities (SquadBuilder grid) ──
export const ZONE_CAPS = {
  offense: OFFENSE_SIZE,
  defense: DEFENSE_SIZE,
  specialTeams: SPECIAL_TEAMS_SIZE,
  bench: BENCH_SIZE,
}

// ── Pod & Promotion ──
export const POD_SIZE = 12
export const PROMO_SPOTS = 3
export const RELEGATION_SPOTS = 3

// ── Season Structure ──
export const SEASON_WEEKS = { 1: 5, 2: 5, 3: 4, 4: 4 }

// ── Trophy Icons ──
export const TROPHY_ICONS = {
  division_trophy: '🏆',
  giant_killer: '⚔️',
  wonderkid_whisperer: '🌟',
  the_invincible: '🛡️',
  gridiron_elite: '👑',
}

// ── Quick-Ref Rules (for Rulesbook) ──
export const QUICK_REF = [
  { label: 'Roster Size', value: `${SQUAD_SIZE} players` },
  { label: 'Active Gameday', value: `${ACTIVE_SIZE} players` },
  { label: 'Bench', value: `${BENCH_SIZE} players` },
  { label: 'Salary Cap', value: `$${(SALARY_CAP / 1e6).toFixed(0)}M` },
  { label: 'Salary Floor', value: `$${(SALARY_FLOOR / 1e6).toFixed(0)}M` },
  { label: 'Offense', value: `${OFFENSE_SIZE} (1 QB, 5 OL min, 5 flex)` },
  { label: 'Defense', value: `${DEFENSE_SIZE} (3 DL min, 8 flex)` },
  { label: 'Special Teams', value: `${SPECIAL_TEAMS_SIZE} (1 K, 1 P)` },
  { label: 'Pod Size', value: `${POD_SIZE} managers` },
  { label: 'Divisions', value: '4' },
  { label: 'Promotion', value: `Top ${PROMO_SPOTS}` },
  { label: 'Relegation', value: `Bottom ${RELEGATION_SPOTS}` },
]

// ── Formatting Helpers ──
export const formatSalary = (val) => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val}`
}
