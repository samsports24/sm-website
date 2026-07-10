/* ═══════════════════════════════════════════════════════════
   SAM Metric, Lightweight Fantasy Score Calculator

   Calculates a SAM fantasy score from API-Football per-player
   match statistics. Uses the same base points and position
   multipliers as the backend scoring engine.

   Formula:  fantasyPoints = Σ (statValue × basePoints × posMultiplier)
   SAM Rating: 0.0 - 10.0 scale mapped from total points
   ═══════════════════════════════════════════════════════════ */

// SAM group order (matches multiplier column index)
const GROUPS = ['GK', 'CB', 'FB', 'WB', 'CDM', 'CM', 'WM', 'CAM', 'WNG', 'CF', 'ST']

// Base points per stat
const BASE = {
  goals: 4.0,
  assists: 3.0,
  cleanSheets: 4.0,
  saves: 0.5,
  tacklesWon: 0.7,
  interceptions: 0.7,
  blockedShots: 0.7,
  aerialDuelsWon: 0.4,
  minutesPlayed: 2.0,    // 2 for 60+ min, 1 for <60
  yellowCards: -1.0,
  redCards: -3.0,
  ownGoals: -2.0,
  penaltySaved: 5.0,
  penaltyMissed: -2.0,
  keyPasses: 1.0,
  successfulDribbles: 0.5,
  passCompletion: 1.5,   // Bonus tiers: 85%+ = 1, 90%+ = 1.5, 95%+ = 2
}

// Position multipliers [GK, CB, FB, WB, CDM, CM, WM, CAM, WNG, CF, ST]
const MULT = {
  goals:             [2.5, 1.5, 1.4, 1.4, 1.3, 1.2, 1.2, 1.1, 1.0, 1.0, 1.0],
  assists:           [1.0, 1.0, 1.2, 1.4, 1.1, 1.1, 1.3, 1.3, 1.5, 1.2, 1.0],
  cleanSheets:       [1.5, 1.2, 1.0, 0.8, 0.8, 0.4, 0.2, 0.0, 0.0, 0.0, 0.0],
  saves:             [2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  tacklesWon:        [0.4, 1.4, 1.3, 1.4, 1.8, 1.2, 1.0, 0.8, 0.6, 0.6, 0.6],
  interceptions:     [0.4, 1.5, 1.2, 1.2, 1.6, 1.1, 0.8, 0.6, 0.4, 0.4, 0.4],
  blockedShots:      [0.6, 1.6, 1.0, 0.8, 1.2, 0.8, 0.6, 0.4, 0.3, 0.3, 0.3],
  aerialDuelsWon:    [1.2, 1.6, 0.8, 0.8, 1.2, 1.0, 0.6, 0.6, 0.4, 1.0, 1.2],
  minutesPlayed:     [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  yellowCards:       [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  redCards:          [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  ownGoals:          [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  penaltySaved:      [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  penaltyMissed:     [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  keyPasses:         [0.2, 0.4, 0.8, 1.0, 0.8, 1.2, 1.4, 1.6, 1.5, 1.3, 0.8],
  successfulDribbles:[0.0, 0.3, 0.8, 1.0, 0.6, 1.0, 1.2, 1.4, 1.8, 1.4, 1.2],
  passCompletion:    [1.2, 1.0, 0.8, 0.7, 1.4, 1.2, 0.8, 0.8, 0.6, 0.6, 0.4],
}

// Map API-Football position codes to SAM groups
const POS_MAP = {
  G: 'GK', GK: 'GK',
  D: 'CB', CB: 'CB', LB: 'FB', RB: 'FB', LWB: 'WB', RWB: 'WB',
  M: 'CM', DM: 'CDM', CDM: 'CDM', CM: 'CM', AM: 'CAM', CAM: 'CAM',
  LM: 'WM', RM: 'WM', LW: 'WNG', RW: 'WNG',
  F: 'ST', FW: 'ST', ST: 'ST', CF: 'CF', LF: 'WNG', RF: 'WNG',
}

const getGroupIdx = (pos) => {
  const group = POS_MAP[pos] || 'CM'  // default to CM if unknown
  return GROUPS.indexOf(group)
}

/* ── Extract stats from API-Football player object ── */
const extractStats = (p, goalsConceded) => {
  const s = p.statistics?.[0] || {}
  const games = s.games || {}
  const goals = s.goals || {}
  const passes = s.passes || {}
  const tackles = s.tackles || {}
  const duels = s.duels || {}
  const dribbles = s.dribbles || {}
  const cards = s.cards || {}

  const minutes = games.minutes || 0
  const isGK = (games.position === 'G')
  const passAccuracy = parseInt(passes.accuracy) || 0

  // Pass completion bonus tiers
  let passBonus = 0
  if (passAccuracy >= 95) passBonus = 2
  else if (passAccuracy >= 90) passBonus = 1.5
  else if (passAccuracy >= 85) passBonus = 1

  return {
    goals: goals.total || 0,
    assists: goals.assists || 0,
    saves: goals.saves || 0,
    cleanSheets: (isGK && goalsConceded === 0 && minutes >= 60) ? 1 : 0,
    tacklesWon: tackles.total || 0,
    interceptions: tackles.interceptions || 0,
    blockedShots: tackles.blocks || 0,
    aerialDuelsWon: Math.round((duels.won || 0) * 0.3),  // Rough aerial estimate
    minutesPlayed: minutes > 0 ? 1 : 0,  // Full appearance points for all who played
    yellowCards: cards.yellow || 0,
    redCards: cards.red || 0,
    ownGoals: 0,  // Not in per-player stats
    penaltySaved: (isGK && (goals.saves || 0) > 0 && (s.penalty?.saved || 0) > 0) ? (s.penalty?.saved || 0) : 0,
    penaltyMissed: s.penalty?.missed || 0,
    keyPasses: passes.key || 0,
    successfulDribbles: dribbles.success || 0,
    passCompletion: passBonus,
  }
}

/* ── Calculate SAM fantasy points for one player ── */
const calcPlayerPoints = (stats, posIdx) => {
  let total = 0
  for (const [key, value] of Object.entries(stats)) {
    if (value === 0) continue
    const bp = BASE[key] || 0
    const mult = MULT[key]?.[posIdx] ?? 1.0
    total += value * bp * mult
  }
  return Math.round(total * 10) / 10
}

/* ── Convert points to SAM Rating (0.0 - 10.0) ── v2 anchors ── */
const RATING_ANCHORS = [
  [0, 0.0], [0.1, 3.0], [2, 4.0], [4, 5.0], [6, 6.0],
  [9, 7.0], [13, 8.0], [18, 9.0], [25, 10.0],
]

const pointsToRating = (pts) => {
  if (pts <= 0) return 0.0
  if (pts >= 25) return 10.0
  for (let i = 1; i < RATING_ANCHORS.length; i++) {
    const [p0, r0] = RATING_ANCHORS[i - 1]
    const [p1, r1] = RATING_ANCHORS[i]
    if (pts <= p1) {
      const t = (pts - p0) / (p1 - p0)
      return Math.round((r0 + t * (r1 - r0)) * 10) / 10
    }
  }
  return 10.0
}

/* ══════════════════════════════════════════════════════
   Main export: buildSAMScores

   Takes API-Football playerStats array and match goals,
   returns a Map keyed by BOTH player ID and player name
   so lookups work regardless of which key the caller uses.
   ══════════════════════════════════════════════════════ */
export const buildSAMScores = (playerStats, goalsConcededHome, goalsConcededAway) => {
  const scores = new Map()
  if (!playerStats?.length) return scores

  playerStats.forEach((teamData) => {
    const teamId = teamData.team?.id
    // Determine goals conceded for this team
    const goalsConceded = teamData.team?.id
      ? (teamId === playerStats[0]?.team?.id ? goalsConcededHome : goalsConcededAway)
      : 0

    ;(teamData.players || []).forEach((p) => {
      const name = p.player?.name
      const id = p.player?.id
      if (!name && !id) return

      const pos = p.statistics?.[0]?.games?.position || 'M'
      const posIdx = getGroupIdx(pos)
      const stats = extractStats(p, goalsConceded)
      const points = calcPlayerPoints(stats, posIdx)
      const rating = pointsToRating(points)

      const entry = {
        points,
        rating,
        pos: POS_MAP[pos] || 'CM',
        minutes: p.statistics?.[0]?.games?.minutes || 0,
      }

      // Store under both ID and name for flexible lookups
      if (id) scores.set(id, entry)
      if (name) scores.set(name, entry)
    })
  })

  return scores
}

/* ── Color for rating badge — unified 7-tier scheme ── */
export const ratingColor = (r) => {
  if (r >= 9.0) return '#8B5CF6'   // Purple, elite
  if (r >= 8.0) return '#3B82F6'   // Blue, excellent
  if (r >= 7.0) return '#22C55E'   // Green, great
  if (r >= 6.0) return '#A3E635'   // Lime, good
  if (r >= 5.0) return '#FBBF24'   // Amber, average
  if (r >= 4.0) return '#F97316'   // Orange, below avg
  return '#EF4444'                  // Red, poor
}

export default buildSAMScores
