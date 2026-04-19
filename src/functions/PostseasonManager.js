/**
 * PostseasonManager.js
 * ─────────────────────────────────────────────────────────────────────
 * Dynasty 32, Single-Elimination Playoff Engine
 *
 * Handles:
 *   1. Roster Sanitization , wipe players whose NFL team is eliminated
 *   2. Draft Order Succession, recalculate snake draft order as fantasy
 *      teams are knocked out, preserving the "best regular-season record
 *      gets 1.01" rule
 *   3. Bracket seeding & dynamic re-seeding for Week 20
 * ─────────────────────────────────────────────────────────────────────
 */

// ── League topology ────────────────────────────────────────────────
const CONFERENCES = {
  1: ['A', 'B', 'C', 'D'],
  2: ['E', 'F', 'G', 'H'],
};

const PLAYOFF_WEEKS = {
  WILD_CARD:       19,   // Jan 16-18, 2027
  DIVISIONAL:      20,   // Jan 23-24, 2027
  CONFERENCE_CHAMP: 21,  // Jan 31, 2027
  SUPER_BOWL:      23,   // Feb 14, 2027
};

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Compare two teams by Win% → Total PF (tie-breaker).
 * Returns negative if a ranks higher than b.
 */
function compareByRecord(a, b) {
  const winPctA = a.gamesPlayed ? a.wins / a.gamesPlayed : 0;
  const winPctB = b.gamesPlayed ? b.wins / b.gamesPlayed : 0;
  if (winPctA !== winPctB) return winPctB - winPctA;      // higher win% first
  return (b.pointsFor ?? 0) - (a.pointsFor ?? 0);         // higher PF first
}

/**
 * Sort an array of teams in-place by record (best first).
 */
function sortByRecord(teams) {
  return [...teams].sort(compareByRecord);
}


// ═══════════════════════════════════════════════════════════════════
//  1.  QUALIFICATION, seed the 14-team bracket
// ═══════════════════════════════════════════════════════════════════

/**
 * Given all 32 teams, return the 14 qualifiers seeded per conference.
 *
 * @param {Array} allTeams, each: { id, name, conference, division,
 *                           wins, losses, gamesPlayed, pointsFor }
 * @returns {{ conference1: Team[], conference2: Team[] }}
 *          Each array has 7 entries, index 0 = seed 1, index 6 = seed 7.
 */
export function seedPlayoffBracket(allTeams) {
  const result = {};

  for (const [confId, divisions] of Object.entries(CONFERENCES)) {
    // group by division
    const divTeams = {};
    divisions.forEach(d => { divTeams[d] = []; });
    allTeams
      .filter(t => String(t.conference) === String(confId))
      .forEach(t => {
        if (divTeams[t.division]) divTeams[t.division].push(t);
      });

    // 4 division winners (best record in each division)
    const divWinners = divisions.map(d => sortByRecord(divTeams[d])[0]);
    const divWinnerIds = new Set(divWinners.map(t => t.id));

    // Rank div winners 1-4 by record
    const rankedDivWinners = sortByRecord(divWinners);

    // Remaining conference teams that aren't div winners
    const remaining = allTeams
      .filter(t => String(t.conference) === String(confId) && !divWinnerIds.has(t.id));
    const wildCards = sortByRecord(remaining).slice(0, 3);   // top 3

    // Seeds 1-4 = div winners by record, 5-7 = wild cards by record
    result[`conference${confId}`] = [...rankedDivWinners, ...wildCards];
  }

  return result;
}


// ═══════════════════════════════════════════════════════════════════
//  2.  BRACKET MATCHUPS, with dynamic re-seeding
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate Wild Card matchups (Week 19).
 * Seed 1 gets a BYE, seeds 2v7, 3v6, 4v5.
 */
export function wildCardMatchups(seededTeams) {
  // seededTeams is an array[7], index 0 = seed 1
  return {
    bye:     seededTeams[0],
    games: [
      { home: seededTeams[1], away: seededTeams[6], seedH: 2, seedA: 7 },
      { home: seededTeams[2], away: seededTeams[5], seedH: 3, seedA: 6 },
      { home: seededTeams[3], away: seededTeams[4], seedH: 4, seedA: 5 },
    ],
  };
}

/**
 * Generate Divisional matchups (Week 20) with dynamic re-seeding.
 * Seed 1 always plays the LOWEST remaining survivor.
 *
 * @param {Object} seed1    , the bye team
 * @param {Array}  survivors, 3 Wild Card winners (each with { ...team, seed })
 * @returns {Array} 2 matchups
 */
export function divisionalMatchups(seed1, survivors) {
  // Sort survivors by seed descending (lowest seed number = best)
  const sorted = [...survivors].sort((a, b) => a.seed - b.seed);
  // Seed 1 vs lowest surviving seed (which is highest seed number = worst)
  const lowestSurvivor = sorted[sorted.length - 1]; // highest seed# = lowest rank
  const remaining = sorted.filter(s => s.id !== lowestSurvivor.id);

  return [
    { home: { ...seed1, seed: 1 }, away: lowestSurvivor,
      label: `#1 ${seed1.name} vs #${lowestSurvivor.seed} ${lowestSurvivor.name}` },
    { home: remaining[0], away: remaining[1],
      label: `#${remaining[0].seed} ${remaining[0].name} vs #${remaining[1].seed} ${remaining[1].name}` },
  ];
}


// ═══════════════════════════════════════════════════════════════════
//  3.  ROSTER SANITIZATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Sanitize a fantasy team's roster every Tuesday:
 *   - Remove any player whose real-life NFL team has been eliminated.
 *   - Tag removed players for the Supplemental Draft Pool.
 *
 * @param {Array}  roster            , [{ playerId, playerName, nflTeam, source }]
 * @param {Set}    eliminatedNflTeams, Set of NFL team abbreviations that are out
 * @returns {{ activeRoster: Array, sanitizedPlayers: Array }}
 */
export function sanitizeRoster(roster, eliminatedNflTeams) {
  const activeRoster = [];
  const sanitizedPlayers = [];

  for (const player of roster) {
    if (eliminatedNflTeams.has(player.nflTeam)) {
      sanitizedPlayers.push({
        ...player,
        removedReason: 'NFL_TEAM_ELIMINATED',
        removedAt: new Date().toISOString(),
      });
    } else {
      activeRoster.push(player);
    }
  }

  return { activeRoster, sanitizedPlayers };
}

/**
 * Process full-league sanitization across all surviving fantasy teams.
 * Collects all wiped players into a single Supplemental Draft Pool.
 *
 * @param {Array}  survivingTeams    , [{ id, name, roster: [...] }]
 * @param {Set}    eliminatedNflTeams, NFL teams eliminated this week
 * @param {Array}  existingPool      , players already in the pool (from prior weeks)
 * @returns {{ updatedTeams: Array, draftPool: Array }}
 */
export function leagueWideSanitization(survivingTeams, eliminatedNflTeams, existingPool = []) {
  const updatedTeams = [];
  let newPoolEntries = [];

  for (const team of survivingTeams) {
    const { activeRoster, sanitizedPlayers } = sanitizeRoster(
      team.roster || [],
      eliminatedNflTeams
    );
    updatedTeams.push({ ...team, roster: activeRoster });
    newPoolEntries = [
      ...newPoolEntries,
      ...sanitizedPlayers.map(p => ({ ...p, formerFantasyTeam: team.name })),
    ];
  }

  return {
    updatedTeams,
    draftPool: [...existingPool, ...newPoolEntries],
  };
}


// ═══════════════════════════════════════════════════════════════════
//  4.  DRAFT ORDER SUCCESSION  (Snake Draft)
// ═══════════════════════════════════════════════════════════════════

/**
 * Build the supplemental snake-draft order for a given playoff week.
 *
 * RULES:
 *   - Order is based on REGULAR SEASON record (best record = pick 1.01).
 *   - When a fantasy team is eliminated, the next-best surviving team
 *     inherits their draft position.
 *   - Snake reverses every round.
 *
 * @param {Array}  allTeamsByRecord , all 32 teams, sorted best→worst by
 *                                     regular season record
 * @param {Set}    survivingTeamIds , ids of teams still alive in playoffs
 * @param {number} rounds           , how many rounds in the draft
 * @returns {Array}, ordered picks: [{ round, pick, teamId, teamName, overall }]
 */
export function buildDraftOrder(allTeamsByRecord, survivingTeamIds, rounds = 5) {
  // Filter to surviving teams, preserving their original reg-season rank order
  const ordered = allTeamsByRecord.filter(t => survivingTeamIds.has(t.id));
  const numTeams = ordered.length;
  const picks = [];
  let overall = 1;

  for (let round = 1; round <= rounds; round++) {
    const isReversed = round % 2 === 0;  // snake: even rounds reverse
    for (let i = 0; i < numTeams; i++) {
      const idx = isReversed ? numTeams - 1 - i : i;
      picks.push({
        round,
        pick: i + 1,
        overall: overall++,
        teamId: ordered[idx].id,
        teamName: ordered[idx].name,
        label: `${round}.${String(i + 1).padStart(2, '0')}`,
      });
    }
  }

  return picks;
}

/**
 * When a team is eliminated mid-postseason, recalculate the draft order
 * by removing them and collapsing the snake.
 *
 * @param {Array}  currentDraftOrder , existing picks array
 * @param {string} eliminatedTeamId  , the team just knocked out
 * @param {Array}  allTeamsByRecord  , all 32 original teams sorted by record
 * @param {Set}    newSurvivingIds   , updated surviving team ids
 * @param {number} rounds            , number of draft rounds
 * @returns {Array}, new picks array
 */
export function recalculateDraftOrder(
  currentDraftOrder,
  eliminatedTeamId,
  allTeamsByRecord,
  newSurvivingIds,
  rounds = 5
) {
  // Simply rebuild from scratch with the updated surviving set
  return buildDraftOrder(allTeamsByRecord, newSurvivingIds, rounds);
}


// ═══════════════════════════════════════════════════════════════════
//  5.  LIQUIDATION, eliminated fantasy team's roster → pool
// ═══════════════════════════════════════════════════════════════════

/**
 * When a fantasy team is eliminated, move their entire roster
 * to the Supplemental Draft Pool.
 *
 * @param {Object} eliminatedTeam , { id, name, roster: [...] }
 * @param {Array}  currentPool    , existing draft pool
 * @returns {Array}, updated draft pool
 */
export function liquidateRoster(eliminatedTeam, currentPool = []) {
  const liquidated = (eliminatedTeam.roster || []).map(player => ({
    ...player,
    formerFantasyTeam: eliminatedTeam.name,
    liquidatedAt: new Date().toISOString(),
    removedReason: 'FANTASY_TEAM_ELIMINATED',
  }));

  return [...currentPool, ...liquidated];
}


// ═══════════════════════════════════════════════════════════════════
//  6.  PLAYER SOURCE TAGGING  (Gold / Blue border logic)
// ═══════════════════════════════════════════════════════════════════

/**
 * Tag each player on a roster with their display border type.
 *
 * @param {Array} roster, player objects with `source` field
 * @param {Set}   eliminatedNflTeams
 * @returns {Array}, players with added `borderType` and `isEliminated`
 */
export function tagRosterForDisplay(roster, eliminatedNflTeams) {
  return roster.map(player => ({
    ...player,
    borderType: player.source === 'supplemental_draft' ? 'blue' : 'gold',
    isEliminated: eliminatedNflTeams.has(player.nflTeam),
  }));
}


// ═══════════════════════════════════════════════════════════════════
//  7.  ORCHESTRATOR, full weekly cycle
// ═══════════════════════════════════════════════════════════════════

/**
 * Run the complete Tuesday cycle for a given playoff week:
 *   1. Liquidate eliminated fantasy teams' rosters
 *   2. Sanitize surviving rosters (remove dead NFL players)
 *   3. Recalculate the supplemental draft order
 *
 * @param {Object} params
 * @param {Array}  params.allTeamsByRecord    , 32 teams sorted by reg season
 * @param {Array}  params.playoffTeams        , 14 qualified fantasy teams
 * @param {Set}    params.eliminatedFantasyIds , fantasy teams knocked out this week
 * @param {Set}    params.eliminatedNflTeams   , NFL teams eliminated
 * @param {Array}  params.existingPool         , current draft pool
 * @param {number} params.draftRounds          , rounds in supplemental draft
 * @returns {{ survivingTeams, draftPool, draftOrder, liquidatedCount, sanitizedCount }}
 */
export function runWeeklyCycle({
  allTeamsByRecord,
  playoffTeams,
  eliminatedFantasyIds,
  eliminatedNflTeams,
  existingPool = [],
  draftRounds = 5,
}) {
  let draftPool = [...existingPool];
  let liquidatedCount = 0;
  let sanitizedCount = 0;

  // ── Step 1: Liquidate eliminated fantasy teams ──
  const survivingTeams = [];
  for (const team of playoffTeams) {
    if (eliminatedFantasyIds.has(team.id)) {
      draftPool = liquidateRoster(team, draftPool);
      liquidatedCount += (team.roster || []).length;
    } else {
      survivingTeams.push(team);
    }
  }

  // ── Step 2: Sanitize surviving rosters ──
  const { updatedTeams, draftPool: sanitizedPool } = leagueWideSanitization(
    survivingTeams,
    eliminatedNflTeams,
    draftPool
  );
  sanitizedCount = sanitizedPool.length - draftPool.length;
  draftPool = sanitizedPool;

  // ── Step 3: Rebuild draft order ──
  const survivingIds = new Set(updatedTeams.map(t => t.id));
  const draftOrder = buildDraftOrder(allTeamsByRecord, survivingIds, draftRounds);

  return {
    survivingTeams: updatedTeams,
    draftPool,
    draftOrder,
    liquidatedCount,
    sanitizedCount,
  };
}


// ── Exports for convenience ────────────────────────────────────────
export default {
  CONFERENCES,
  PLAYOFF_WEEKS,
  seedPlayoffBracket,
  wildCardMatchups,
  divisionalMatchups,
  sanitizeRoster,
  leagueWideSanitization,
  buildDraftOrder,
  recalculateDraftOrder,
  liquidateRoster,
  tagRosterForDisplay,
  runWeeklyCycle,
};
