// Mock draft engine — pure functions, no React, no network.
//
// The roster template comes from the backend (/mock-draft/config) so the mock
// always matches the real SamSports rules:
//   full    → 53-man: QB1 RB1 WR3 TE1 OL5 | DE2 DT2 LB3 CB2 S2 | K1 P1 + 29 bench
//   offense → 20-man: QB1 RB2 WR3 TE1 FLEX3 K1 + 9 bench
//
// A template is [{ slot, count, eligible? }]. `eligible` defaults to [slot];
// FLEX and SUPERFLEX carry their own lists. Bench takes anyone.

export const BENCH = 'BENCH'

// Total roster size = starters + bench.
export const templateSize = (tpl) => tpl.reduce((n, r) => n + r.count, 0)

// Turn a config payload into a template, bench included.
export const buildTemplate = (preset) => [
  ...preset.starters.map((s) => ({
    slot: s.slot,
    count: s.count,
    label: s.label,
    eligible: s.eligible || [s.slot],
  })),
  { slot: BENCH, count: preset.bench, label: 'Bench', eligible: '*' },
]

// Which slot (if any) a player can still fill on this roster.
export const slotFor = (tpl, roster, pos) => {
  for (const r of tpl) {
    const taken = roster.filter((p) => p._slot === r.slot).length
    if (taken >= r.count) continue
    if (r.eligible === '*') return r.slot
    if (r.eligible.includes(pos)) return r.slot
  }
  return null
}

// Starting slots this team still has to fill (bench doesn't count).
export const openStarterSlots = (tpl, roster) => {
  const open = []
  for (const r of tpl) {
    if (r.slot === BENCH) continue
    const taken = roster.filter((p) => p._slot === r.slot).length
    for (let i = taken; i < r.count; i++) open.push(r)
  }
  return open
}

// ── Setup ──────────────────────────────────────────────────────────────────
const BOT_NAMES = [
  'GridironGus', 'BlitzBot', 'WaiverWire Wanda', 'The Commish', 'Sack Exchange',
  'Handcuff Hank', 'ZeroRB Zoe', 'Boom or Bust', 'Autodraft Andy', 'Trade Bait',
  'Bench Mob', 'Cap Casualty', 'Red Zone Rick', 'Pylon Pete', 'Cover Two Carla',
  'Trench Warfare', 'Special Teams Sam', 'Franchise Tag Fran', 'Hard Count Hal',
  'Play Action Pam', 'Draft Capital', 'Salary Cap Sid', 'Two Minute Drill',
  'Onside Kick', 'Fourth And Long', 'The Vulture', 'Practice Squad Pat',
  'Gadget Play Gary', 'Prevent Defense', 'Hail Mary Hank', 'Rookie Watch',
]

export const MIN_SALARY = 1 // every player costs at least 1M SP

export const makeTeams = (count, myIndex = 0, cap = 320) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: i === myIndex ? 'Your Team' : BOT_NAMES[i % BOT_NAMES.length],
    isYou: i === myIndex,
    roster: [],
    budget: cap, // cap space left, in SP millions — enforced in EVERY format
  }))

// ── The salary cap ─────────────────────────────────────────────────────────
// This is what makes the draft SamSports rather than generic fantasy. In snake
// and linear a pick costs that player's salary, so you can't hoard superstars:
// every team has to come in under the cap AND still fill all 53 spots. A pick is
// only legal if, after paying for him, you can still afford the minimum salary
// for every remaining roster spot.
export const priceOf = (player) => Math.max(MIN_SALARY, player.salary || MIN_SALARY)

// Cheapest price among a set of players (or the league minimum if none).
export const minPrice = (players) => {
  if (!players || !players.length) return MIN_SALARY
  let m = Infinity
  for (const p of players) { const pr = priceOf(p); if (pr < m) m = pr }
  return Number.isFinite(m) ? m : MIN_SALARY
}

// Cap space a team can spend on its NEXT pick and still fill every remaining
// spot. `reservePer` is what to hold back for each still-empty spot after this
// one. Defaults to the league minimum (back-compat with canAfford/UI callers),
// but the bot passes a REALISTIC figure — the cheapest player who still fits —
// so it can't overspend early and then strand itself unable to afford the rest.
export const maxAffordable = (team, size, reservePer = MIN_SALARY) => {
  const spotsAfter = Math.max(0, size - team.roster.length - 1)
  return team.budget - spotsAfter * Math.max(MIN_SALARY, reservePer)
}

export const canAfford = (team, player, size) => priceOf(player) <= maxAffordable(team, size)

export const capHit = (team) => team.roster.reduce((s, p) => s + (p._price || 0), 0)

export const buildOrder = (format, teamCount, rounds) => {
  const order = []
  for (let r = 0; r < rounds; r++) {
    const round = Array.from({ length: teamCount }, (_, i) => i)
    if (format === 'snake' && r % 2 === 1) round.reverse()
    order.push(...round)
  }
  return order
}

// ── Bot logic ──────────────────────────────────────────────────────────────
// A 53-man board is mostly linemen, defenders and a punter. A naive
// best-available bot would take skill players for 24 straight rounds and never
// field a legal lineup, so needs drive the pick:
//   · a player who fills an empty STARTING slot gets a big pull
//   · once picks left == starting slots left, the bot MUST draft for need
export const NEED_PULL = 120 // starter-need pull, in talent-score points

// Depth-chart penalty tiers. Backups/reserves/practice-squad/unknown get held
// back in EARLY rounds so a bot never spends pick 1 on a 4th-stringer; the
// penalty fades to nothing by the final round (see depthPenalty · lateness).
const DEPTH_TIER = {
  Starter: 0, Rotational: 1, Backup: 2, Reserve: 3, Unknown: 3,
  'Practice Squad': 4, 'Injured Reserve': 5,
}
const STARTER_PULL = NEED_PULL / 2 // ~60 on the 0-100 talent scale

// Talent on a single 0-100+ scale, higher = better. Prefer the backend's
// cpuPriority (already blends production, market value, ADP, role); fall back
// to board rank, then to nothing — never throws on a bare player object.
const talentOf = (p) => {
  if (p && p.cpuPriority != null) return p.cpuPriority
  if (p && p.rank != null) return Math.max(0, 100 - p.rank * 0.5)
  return 0
}

const depthPenalty = (p, lateness) => {
  const tier = DEPTH_TIER[p && p.depthChart] || 0
  return tier * 15 * (1 - lateness) // heavy in round 1, gone by the last round
}

// Structured log whenever the bot falls off the normal path or a pick is
// skipped, so a stalled draft is visible in the console instead of silent.
const logDraftFallback = (stage, info) => {
  try {
    // eslint-disable-next-line no-console
    console.warn('[MockDraft/botPick] fallback', stage, JSON.stringify(info))
  } catch (e) { /* logging must never throw */ }
}

// `ignoreSalary` is for the auction: there you pay your winning BID, not the
// player's listed salary, so a cap-squeezed bot must still be allowed to
// nominate a star (it just won't bid much for him).
//
// GUARANTEE: this returns null ONLY when `available` is empty. In every other
// case a real player comes back via the a→b→c→d fallback chain, so the driver
// loop can always advance and can never freeze.
export const botPick = (tpl, team, available, size, opts = {}) => {
  const {
    ignoreSalary = false, floor = null,
    round = null, totalRounds = null, draftId = null, pickNo = null,
  } = opts

  if (!available || !available.length) return null // nothing left at all

  const picksLeft = size - team.roster.length
  const open = openStarterSlots(tpl, team.roster)
  const mustFill = open.length >= picksLeft
  const used = capHit(team)

  // How far through the draft: 0 = round 1 (weight talent), 1 = final round
  // (weight roster completion + cap-floor compliance).
  const lateness = (round != null && totalRounds > 1)
    ? Math.min(1, Math.max(0, (round - 1) / (totalRounds - 1)))
    : (picksLeft <= open.length + 2 ? 0.85 : 0.3)

  // Players who fit an open slot at all (a starting slot OR the bench).
  const fitting = available.filter((p) => slotFor(tpl, team.roster, p.pos))

  // Realistic per-spot reserve = cheapest fitting player, so the bot keeps
  // enough to finish rather than holding back a token 1M each and overspending.
  const reservePer = ignoreSalary ? MIN_SALARY : minPrice(fitting.length ? fitting : available)
  const budgetCap = maxAffordable(team, size, reservePer)

  // Late-draft cap-FLOOR steer: how much we still ought to spend, per open spot.
  const stillMustSpend = floor != null ? Math.max(0, floor - used) : 0
  const needPerSpot = picksLeft > 0 ? stillMustSpend / picksLeft : 0

  // Remaining players per position — drives realistic positional RUNS: when a
  // needed position starts drying up, the bot prioritizes grabbing one.
  const posCount = {}
  for (const p of available) posCount[p.pos] = (posCount[p.pos] || 0) + 1

  const scoreOf = (p, startable) => {
    let s = talentOf(p)                                   // higher = better (BPA)
    if (startable) {
      // Need nudge: SMALL early so talent/BPA wins round 1, LARGE late so the
      // bot completes its starters (was a flat, over-strong +60..120 that made
      // bots reach for need from pick 1).
      s += 18 + 74 * lateness
      // Scarcity: reward filling a needed position that's running thin.
      const cnt = posCount[p.pos] || 99
      if (cnt <= 6) s += (7 - cnt) * 6 * (0.5 + 0.5 * lateness)
    }
    s -= depthPenalty(p, lateness)                        // avoid 4th-stringers early
    if (!ignoreSalary && needPerSpot > 0 && lateness > 0.45) {
      s += (priceOf(p) >= needPerSpot ? 15 : -8) * lateness // spend up toward the floor late
    }
    return s + (Math.random() * 6 - 3)
  }

  // a. Normal path: fits an open slot, affordable under the realistic reserve,
  //    respects mustFill (start-worthy when picks-left == open starters), best
  //    priority score wins. Keeps the bot UNDER the cap max.
  const legal = []
  for (const p of available.slice(0, 220)) {
    const fits = slotFor(tpl, team.roster, p.pos)
    if (!fits) continue
    const startable = fits !== BENCH
    if (mustFill && !startable) continue
    if (!ignoreSalary && priceOf(p) > budgetCap) continue
    legal.push({ p, score: scoreOf(p, startable) })
  }
  if (legal.length) return legal.sort((a, b) => b.score - a.score)[0].p

  const info = {
    draftId, round, pick: pickNo, team: team.name,
    openNeeds: open.map((o) => o.slot), picksLeft,
    remainingCap: budgetCap, floorGap: stillMustSpend,
    considered: available.length, fitting: fitting.length,
  }

  // b. Any fitting + affordable (relax the reserve to the bare minimum), cheapest first.
  const affordableFull = ignoreSalary ? Infinity : maxAffordable(team, size, MIN_SALARY)
  let pick = fitting
    .filter((p) => ignoreSalary || priceOf(p) <= affordableFull)
    .sort((a, b) => priceOf(a) - priceOf(b))[0]
  if (pick) { logDraftFallback('b:cheapest-affordable-fit', { ...info, took: pick.name }); return pick }

  // c. Any fitting, ignore the cap entirely — better to nick the reserve than freeze.
  pick = [...fitting].sort((a, b) => priceOf(a) - priceOf(b))[0]
  if (pick) { logDraftFallback('c:cheapest-fit-over-cap', { ...info, took: pick.name }); return pick }

  // d. Cheapest player left overall (bench accepts any position, so this all but
  //    always hits as long as the board isn't empty).
  pick = [...available].sort((a, b) => priceOf(a) - priceOf(b))[0]
  if (pick) { logDraftFallback('d:cheapest-overall', { ...info, took: pick.name }); return pick }

  return null // truly nothing left — the loop's watchdog handles this by skipping
}

// What a bot will pay, in SP millions. Always holds back 1M per empty roster
// spot so it can never strand itself with an unfillable squad.
export const botValue = (tpl, team, player, size, cap) => {
  const fits = slotFor(tpl, team.roster, player.pos)
  if (!fits) return 0

  const maxSpend = maxAffordable(team, size)
  if (maxSpend <= 0) return 0

  // The #1 player is worth roughly a third of the cap, tailing off fast.
  const raw = ((cap * 0.30) / Math.pow(player.rank, 0.55)) * (1 + (Math.random() * 0.25 - 0.1))
  const startable = fits !== BENCH
  return Math.min(maxSpend, Math.max(1, Math.round(startable ? raw : raw * 0.4)))
}

export const botBid = (tpl, team, player, currentBid, size, cap) => {
  const ceiling = botValue(tpl, team, player, size, cap)
  if (ceiling <= currentBid) return 0
  // Raise in real jumps. Bidding 1M at a time would take 150 rounds to settle a
  // headline player and the room would crawl.
  const gap = ceiling - currentBid
  const step = Math.max(1, Math.round(gap * (0.3 + Math.random() * 0.35)))
  return Math.min(ceiling, currentBid + step)
}

// ── Applying a pick ────────────────────────────────────────────────────────
export const applyPick = (tpl, teams, teamId, player, price = null) => {
  const next = teams.map((t) => ({ ...t, roster: [...t.roster] }))
  const team = next[teamId]
  const slot = slotFor(tpl, team.roster, player.pos) || BENCH
  // Auction: you pay your winning bid. Snake/linear: you pay his salary.
  const cost = price != null ? price : priceOf(player)
  team.roster.push({ ...player, _slot: slot, _price: cost })
  team.budget -= cost
  return next
}

export const canDraft = (tpl, team, player, size) =>
  team.roster.length < size &&
  !!slotFor(tpl, team.roster, player.pos) &&
  canAfford(team, player, size)

// Why a pick is illegal — so the UI can say so instead of just greying out.
export const draftBlockedReason = (tpl, team, player, size) => {
  if (!team) return null
  if (team.roster.length >= size) return 'Roster full'
  if (!slotFor(tpl, team.roster, player.pos)) return `No ${player.pos} spot left`
  if (!canAfford(team, player, size)) return `Over the cap — you can spend ${maxAffordable(team, size)}M`
  return null
}

// ── Legality helpers for the human's team ────────────────────────────────────

// Can every still-open STARTING slot be filled from what's left? Conservative:
// only returns false when a slot has literally zero eligible bodies available,
// so it never false-blocks a pick that is actually still fillable.
const canFillRequired = (tpl, roster, remaining) => {
  const open = openStarterSlots(tpl, roster)
  for (const slot of open) {
    const ok = slot.eligible === '*'
      ? remaining.length > 0
      : remaining.some((p) => slot.eligible.includes(p.pos))
    if (!ok) return false
  }
  return true
}

// Upper bound on what a team could still spend AFTER its current roster: the
// priciest fitting players for each empty spot, capped by cash on hand. Used to
// tell whether the cap floor is still mathematically reachable.
const maxAdditionalSpend = (tpl, roster, size, budgetLeft, remaining) => {
  const spots = Math.max(0, size - roster.length)
  if (spots <= 0) return 0
  const prices = remaining
    .filter((p) => slotFor(tpl, roster, p.pos))
    .map(priceOf)
    .sort((a, b) => b - a)
    .slice(0, spots)
  const top = prices.reduce((s, n) => s + n, 0)
  return Math.min(Math.max(0, budgetLeft), top)
}

// A rounded status for the user's roster — icon + TEXT, never colour-only.
// States: Roster Incomplete · Missing Required Position · Below Cap Floor ·
// Over Salary Cap · Legal Roster.
export const rosterStatus = (team, tpl, size, cap, floor) => {
  if (!team) return { state: 'Roster Incomplete', icon: '○', text: 'Start drafting your roster.' }
  const used = capHit(team)
  const picksLeft = size - team.roster.length
  const open = openStarterSlots(tpl, team.roster)

  if (used > cap) {
    return { state: 'Over Salary Cap', icon: '✕',
      text: `Over Salary Cap — trim $${used - cap}M to get under $${cap}M.` }
  }
  if (open.length > picksLeft) {
    return { state: 'Missing Required Position', icon: '⚠',
      text: `Missing Required Position — ${open.length} starter slot${open.length > 1 ? 's' : ''} open, only ${picksLeft} pick${picksLeft !== 1 ? 's' : ''} left.` }
  }
  if (picksLeft > 0) {
    return { state: 'Roster Incomplete', icon: '○',
      text: `Roster Incomplete — ${picksLeft} pick${picksLeft !== 1 ? 's' : ''} to go${open.length ? `, ${open.length} starter slot${open.length > 1 ? 's' : ''} still open` : ''}.` }
  }
  if (open.length > 0) {
    return { state: 'Missing Required Position', icon: '⚠',
      text: `Missing Required Position — ${open.length} starting slot${open.length > 1 ? 's' : ''} unfilled.` }
  }
  if (floor != null && used < floor) {
    return { state: 'Below Cap Floor', icon: '⚠',
      text: `Below Cap Floor — you must spend at least $${floor - used}M more.` }
  }
  return { state: 'Legal Roster', icon: '✓',
    text: 'Legal Roster — all required positions filled and salary within range.' }
}

// Warn (and let the UI block) a human pick that would make a legal FINISH
// impossible: busts the cap max, leaves a required starting slot unfillable, or
// puts the cap floor out of reach. Returns a message, or null when the pick is
// fine. Deliberately conservative — it blocks only provable dead-ends.
export const pickWarning = (tpl, team, player, size, cap, floor, available) => {
  if (!team || !player) return null
  const price = priceOf(player)
  const used = capHit(team)
  const newUsed = used + price
  const budgetLeft = team.budget - price
  const spotsAfter = size - team.roster.length - 1

  // (a) cap max
  if (newUsed > cap) return `That puts you $${newUsed - cap}M over the $${cap}M cap.`

  const slot = slotFor(tpl, team.roster, player.pos) || BENCH
  const simRoster = [...team.roster, { ...player, _slot: slot, _price: price }]
  const openAfter = openStarterSlots(tpl, simRoster)
  const remaining = (available || []).filter((p) => p.id !== player.id)

  // (c) required positions still fillable with the picks left
  if (openAfter.length > spotsAfter) {
    return `You'd still need ${openAfter.length} starter${openAfter.length > 1 ? 's' : ''} with only ${Math.max(0, spotsAfter)} pick${spotsAfter !== 1 ? 's' : ''} left — this pick doesn't help fill them.`
  }
  if (!canFillRequired(tpl, simRoster, remaining)) {
    return 'No players left to fill all your required starting positions after this pick.'
  }

  // (b) cap floor still reachable
  if (floor != null && newUsed < floor) {
    const maxMore = maxAdditionalSpend(tpl, simRoster, size, budgetLeft, remaining)
    if (newUsed + maxMore < floor) {
      return `This makes the $${floor}M floor unreachable — you'd top out around $${Math.round(newUsed + maxMore)}M.`
    }
  }
  return null
}

// ── Grading ────────────────────────────────────────────────────────────────
export const gradeTeams = (teams) => {
  const scores = teams.map((t) => {
    const total = t.roster.reduce((s, p, i) => {
      const expected = (i + 1) * teams.length // roughly where that slot picks
      return s + Math.max(0, expected - p.rank)
    }, 0)
    return { id: t.id, score: total }
  })
  const sorted = [...scores].sort((a, b) => b.score - a.score)
  const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D']
  const byId = {}
  sorted.forEach((s, i) => {
    byId[s.id] = GRADES[Math.min(Math.floor((i / Math.max(1, sorted.length - 1)) * (GRADES.length - 1)), GRADES.length - 1)]
  })
  return byId
}
