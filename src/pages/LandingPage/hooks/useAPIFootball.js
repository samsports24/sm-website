import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   API-Football v3 Integration Hook
   Provides: fixtures, events (key incidents), auto-commentary
   Docs: https://www.api-football.com/documentation-v3
   Host: v3.football.api-sports.io
   ═══════════════════════════════════════════════════════════ */

const API_HOST = 'https://v3.football.api-sports.io'
const API_KEY = process.env.REACT_APP_API_FOOTBALL_KEY || ''

const CACHE_TTL = 5 * 60 * 1000 // 5 min cache — reduces API-Football rate limit pressure
const REFRESH_INTERVAL = 60000 // 60s auto-refresh (was 30s — reduced to prevent page freeze)

// Module-level cache
const apiCache = {}
let apiFetchFailedUntil = 0 // timestamp: skip fetches until this time (cooldown after network/CORS failure)
const API_COOLDOWN = 30000 // 30s cooldown after a network failure before retrying

/* ── League mapping: API-Football league IDs ──
   type: 'euro-club'  = Aug-May season (season = year season started, e.g. 2025 for 2025-26)
   type: 'calendar'   = Jan-Dec season (season = current year)
   type: 'intl'       = International (season = current year)
   ── */
export const AF_LEAGUES = [
  // International
  { id: 10, name: 'Friendlies', emoji: '🤝', country: 'World', type: 'intl' },
  { id: 5, name: 'UEFA Nations League', emoji: '🇪🇺', country: 'World', type: 'intl' },
  { id: 32, name: 'WC Qualifiers Europe', emoji: '🌍', country: 'World', type: 'intl' },
  { id: 34, name: 'WC Qualifiers South America', emoji: '🌎', country: 'World', type: 'intl' },
  { id: 31, name: 'WC Qualifiers North America', emoji: '🌎', country: 'World', type: 'intl' },
  { id: 29, name: 'WC Qualifiers Asia', emoji: '🌏', country: 'World', type: 'intl' },
  { id: 1, name: 'World Cup', emoji: '🏆', country: 'World', type: 'intl' },
  { id: 9, name: 'Copa America', emoji: '🏆', country: 'World', type: 'intl' },
  { id: 6, name: 'Africa Cup of Nations', emoji: '🏆', country: 'World', type: 'intl' },
  // European Club
  { id: 2, name: 'Champions League', emoji: '🏆', country: 'World', type: 'euro-club' },
  { id: 3, name: 'Europa League', emoji: '🟠', country: 'World', type: 'euro-club' },
  { id: 848, name: 'Conference League', emoji: '🟣', country: 'World', type: 'euro-club' },
  { id: 39, name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', type: 'euro-club' },
  { id: 140, name: 'La Liga', emoji: '🇪🇸', country: 'Spain', type: 'euro-club' },
  { id: 78, name: 'Bundesliga', emoji: '🇩🇪', country: 'Germany', type: 'euro-club' },
  { id: 135, name: 'Serie A', emoji: '🇮🇹', country: 'Italy', type: 'euro-club' },
  { id: 61, name: 'Ligue 1', emoji: '🇫🇷', country: 'France', type: 'euro-club' },
  { id: 94, name: 'Primeira Liga', emoji: '🇵🇹', country: 'Portugal', type: 'euro-club' },
  { id: 88, name: 'Eredivisie', emoji: '🇳🇱', country: 'Netherlands', type: 'euro-club' },
  { id: 45, name: 'FA Cup', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', type: 'euro-club' },
  // Calendar-year leagues
  { id: 253, name: 'MLS', emoji: '🇺🇸', country: 'USA', type: 'calendar' },
  { id: 71, name: 'Serie A', emoji: '🇧🇷', country: 'Brazil', type: 'calendar' },
  { id: 128, name: 'Liga MX', emoji: '🇲🇽', country: 'Mexico', type: 'euro-club' },
]

/* ── Determine correct season year for a league ── */
const getSeasonYear = (league) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  if (league.type === 'calendar' || league.type === 'intl') {
    return year
  }
  // euro-club: Aug-May season → Jan-Jul = previous year started, Aug-Dec = current year
  return month <= 7 ? year - 1 : year
}

/* ── Generic fetcher with caching ── */
const apiFetch = async (endpoint, params = {}) => {
  if (!API_KEY) {
    return null
  }

  // After a network/CORS failure, wait for cooldown before retrying
  if (Date.now() < apiFetchFailedUntil) return null

  const qs = new URLSearchParams(params).toString()
  const url = `${API_HOST}${endpoint}${qs ? '?' + qs : ''}`
  const now = Date.now()

  // Check cache
  if (apiCache[url] && now - apiCache[url].ts < CACHE_TTL) {
    return apiCache[url].data
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
      },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    if (json.errors && Object.keys(json.errors).length > 0) {
      console.warn('[API-Football] API errors:', json.errors)
      return null
    }

    const data = json.response || []
    apiCache[url] = { data, ts: now }
    return data
  } catch (err) {
    // Network or CORS failure — back off for cooldown period, then retry
    if (err.message === 'Failed to fetch') {
      const wasAlreadyCooling = Date.now() < apiFetchFailedUntil
      apiFetchFailedUntil = Date.now() + API_COOLDOWN
      if (!wasAlreadyCooling) {
        console.warn(`[API-Football] Network/CORS error — pausing requests for ${API_COOLDOWN / 1000}s before retrying.`)
      }
    } else {
      console.warn(`[API-Football] Fetch error ${endpoint}:`, err.message)
    }
    return null
  }
}

/* ═══════════════════════════════════════════════════════════
   Fixture Normalizer, Converts API-Football format to
   ESPN-compatible shape so existing MatchCard + SportPanel
   can render without changes
   ═══════════════════════════════════════════════════════════ */
const normalizeFixture = (f) => {
  const home = f.teams?.home || {}
  const away = f.teams?.away || {}
  const goals = f.goals || {}
  const status = f.fixture?.status || {}

  // Map API-Football status to our state system
  let state = 'scheduled'
  let label = ''
  const short = (status.short || '').toUpperCase()

  if (['1H', '2H', 'ET'].includes(short)) {
    state = 'live'
    label = status.elapsed ? `${status.elapsed}'` : 'LIVE'
  } else if (short === 'HT') {
    state = 'halftime'
    label = 'HT'
  } else if (['FT', 'AET', 'PEN'].includes(short)) {
    state = 'final'
    label = short === 'FT' ? 'FT' : short === 'AET' ? 'AET' : 'PEN'
  } else if (['NS', 'TBD'].includes(short)) {
    state = 'scheduled'
    const d = new Date(f.fixture?.date)
    label = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } else if (['PST', 'CANC', 'ABD', 'AWD', 'WO', 'SUSP', 'INT', 'BT', 'P'].includes(short)) {
    state = 'postponed'
    label = short
  }

  return {
    id: `af-${f.fixture?.id}`,
    _afId: f.fixture?.id, // Keep original ID for event/detail fetching
    date: f.fixture?.date,
    competitions: [
      {
        competitors: [
          {
            homeAway: 'home',
            score: goals.home != null ? String(goals.home) : undefined,
            team: {
              id: home.id,
              displayName: home.name,
              shortDisplayName: home.name,
              abbreviation: (home.name || '').slice(0, 3).toUpperCase(),
              logos: home.logo ? [{ href: home.logo }] : [],
              logo: home.logo,
            },
          },
          {
            homeAway: 'away',
            score: goals.away != null ? String(goals.away) : undefined,
            team: {
              id: away.id,
              displayName: away.name,
              shortDisplayName: away.name,
              abbreviation: (away.name || '').slice(0, 3).toUpperCase(),
              logos: away.logo ? [{ href: away.logo }] : [],
              logo: away.logo,
            },
          },
        ],
        status: {
          type: { state, shortDetail: label, detail: status.long || label },
        },
      },
    ],
    // Attach status info for getStatus() compatibility
    status: { type: { state, shortDetail: label } },
    _status: { state, label },
  }
}

/* ═══════════════════════════════════════════════════════════
   Hook: useSoccerFixtures
   Fetches all soccer fixtures across configured leagues
   for a given date. Outputs same shape as useSoccerScoreboards.
   ═══════════════════════════════════════════════════════════ */
export const useSoccerFixtures = (selectedDate = undefined, leagues = AF_LEAGUES) => {
  const disabled = selectedDate === null // null = explicitly disabled
  const [data, setData] = useState({ leagues: [], loading: !disabled, totalMatches: 0, activeLeagues: 0 })
  const intervalRef = useRef(null)

  // Prioritize top 5 leagues so they load first (users see matches in <3s)
  const PRIORITY_IDS = new Set([39, 140, 78, 135, 61, 2, 3]) // PL, La Liga, Bundesliga, Serie A, Ligue 1, CL, EL
  const priorityLeagues = leagues.filter(lg => PRIORITY_IDS.has(lg.id))
  const otherLeagues = leagues.filter(lg => !PRIORITY_IDS.has(lg.id))
  const orderedLeagues = [...priorityLeagues, ...otherLeagues]

  const fetchAll = useCallback(async () => {
    if (disabled) return
    const d = selectedDate || new Date()
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const allResults = []

    // Helper to fetch one league
    const fetchLeague = async (lg) => {
      const season = getSeasonYear(lg)
      let fixtures = await apiFetch('/fixtures', {
        league: lg.id,
        season,
        date: dateStr,
      })
      // For international competitions, try previous year if no results
      if ((!fixtures || fixtures.length === 0) && lg.type === 'intl') {
        fixtures = await apiFetch('/fixtures', {
          league: lg.id,
          season: season - 1,
          date: dateStr,
        })
      }
      return { lg, events: (fixtures || []).map(normalizeFixture) }
    }

    // ── PHASE 1: Priority leagues (top 5 + CL/EL) — fetch all at once ──
    // These ~7 calls fire in parallel → results in ~1-2 seconds
    const priorityResults = await Promise.allSettled(priorityLeagues.map(fetchLeague))
    priorityResults.forEach(r => {
      allResults.push(r.status === 'fulfilled' ? r.value : { lg: priorityLeagues[0], events: [] })
    })

    // Show priority leagues immediately — don't wait for the rest
    const pTotal = allResults.reduce((s, r) => s + r.events.length, 0)
    const pActive = allResults.filter(r => r.events.length > 0).length
    if (pTotal > 0) {
      setData({ leagues: [...allResults], loading: false, totalMatches: pTotal, activeLeagues: pActive })
    } else {
      setData(prev => ({ ...prev, loading: false }))
    }

    // ── PHASE 2: Remaining leagues in background batches ──
    const BATCH_SIZE = 6
    for (let i = 0; i < otherLeagues.length; i += BATCH_SIZE) {
      const batch = otherLeagues.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(batch.map(fetchLeague))
      batchResults.forEach(r => {
        allResults.push(r.status === 'fulfilled' ? r.value : { lg: batch[0], events: [] })
      })

      // Update UI after each batch so new leagues appear progressively
      const total = allResults.reduce((s, r) => s + r.events.length, 0)
      const active = allResults.filter(r => r.events.length > 0).length
      setData({ leagues: [...allResults], loading: false, totalMatches: total, activeLeagues: active })

      // Minimal delay between batches to respect rate limits
      if (i + BATCH_SIZE < otherLeagues.length) {
        await new Promise((r) => setTimeout(r, 50))
      }
    }
  }, [selectedDate, leagues, disabled])

  useEffect(() => {
    if (disabled) return
    fetchAll()
    intervalRef.current = setInterval(fetchAll, REFRESH_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [fetchAll, disabled])

  return data
}

/* ═══════════════════════════════════════════════════════════
   Hook: useFixtureLive
   Fetches currently live fixtures across all leagues.
   ═══════════════════════════════════════════════════════════ */
export const useLiveFixtures = () => {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLive = async () => {
      const data = await apiFetch('/fixtures', { live: 'all' })
      if (data) {
        setFixtures(data.map(normalizeFixture))
      }
      setLoading(false)
    }

    fetchLive()
    const interval = setInterval(fetchLive, 60000) // 60s for live (was 15s)
    return () => clearInterval(interval)
  }, [])

  return { fixtures, loading }
}

/* ═══════════════════════════════════════════════════════════
   Fetch: getFixtureEvents
   Returns key incidents for a specific match
   (goals, cards, substitutions, VAR)
   ═══════════════════════════════════════════════════════════ */
export const getFixtureEvents = async (fixtureId) => {
  if (!fixtureId) return []
  const data = await apiFetch('/fixtures/events', { fixture: fixtureId })
  return data || []
}

/* ═══════════════════════════════════════════════════════════
   Fetch: getFixtureLineups
   Returns starting XIs, formations, coaches
   ═══════════════════════════════════════════════════════════ */
export const getFixtureLineups = async (fixtureId) => {
  if (!fixtureId) return []
  const data = await apiFetch('/fixtures/lineups', { fixture: fixtureId })
  return data || []
}

/* ═══════════════════════════════════════════════════════════
   Fetch: getFixtureStatistics
   Returns match stats (possession, shots, corners, etc.)
   ═══════════════════════════════════════════════════════════ */
export const getFixtureStatistics = async (fixtureId) => {
  if (!fixtureId) return []
  const data = await apiFetch('/fixtures/statistics', { fixture: fixtureId })
  return data || []
}

/* ═══════════════════════════════════════════════════════════
   Fetch: getFixturePlayers
   Returns per-player detailed statistics for a fixture
   ═══════════════════════════════════════════════════════════ */
export const getFixturePlayers = async (fixtureId) => {
  if (!fixtureId) return []
  const data = await apiFetch('/fixtures/players', { fixture: fixtureId })
  return data || []
}

/* ═══════════════════════════════════════════════════════════
   Auto-Commentary Generator
   Converts structured events into readable text commentary
   ═══════════════════════════════════════════════════════════ */
const EVENT_ICONS = {
  Goal: '⚽',
  'Own Goal': '⚽🔴',
  'Normal Goal': '⚽',
  Penalty: '⚽ (P)',
  'Missed Penalty': '❌ (P)',
  Card: '🟨',
  'Yellow Card': '🟨',
  'Red Card': '🟥',
  'Second Yellow card': '🟨🟥',
  subst: '🔄',
  Var: '📺',
}

export const generateCommentary = (events = [], homeTeam = '', awayTeam = '') => {
  if (!events.length) return []

  return events
    .sort((a, b) => {
      const minA = a.time?.elapsed || 0
      const minB = b.time?.elapsed || 0
      return minA - minB
    })
    .map((ev) => {
      const min = ev.time?.elapsed || 0
      const extra = ev.time?.extra ? `+${ev.time.extra}` : ''
      const timestamp = `${min}${extra}'`
      const team = ev.team?.name || ''
      const player = ev.player?.name || ''
      const assist = ev.assist?.name || ''
      const type = ev.type || ''
      const detail = ev.detail || ''

      let icon = EVENT_ICONS[detail] || EVENT_ICONS[type] || '•'
      let text = ''

      switch (type) {
        case 'Goal':
          if (detail === 'Own Goal') {
            text = `Own Goal by ${player} (${team})`
            icon = '⚽🔴'
          } else if (detail === 'Penalty') {
            text = `GOAL! ${player} (${team}) converts from the penalty spot!`
            icon = '⚽ (P)'
          } else if (detail === 'Missed Penalty') {
            text = `Penalty MISSED by ${player} (${team})!`
            icon = '❌'
          } else {
            text = assist
              ? `GOAL! ${player} (${team}) scores! Assisted by ${assist}.`
              : `GOAL! ${player} (${team}) scores!`
          }
          break

        case 'Card':
          if (detail === 'Yellow Card') {
            text = `Yellow card shown to ${player} (${team})`
            icon = '🟨'
          } else if (detail === 'Red Card') {
            text = `RED CARD! ${player} (${team}) is sent off!`
            icon = '🟥'
          } else if (detail === 'Second Yellow card') {
            text = `SECOND YELLOW! ${player} (${team}) receives a second booking and is sent off!`
            icon = '🟨🟥'
          } else {
            text = `Card for ${player} (${team}), ${detail}`
          }
          break

        case 'subst':
          text = `Substitution (${team}): ${assist} comes on for ${player}`
          icon = '🔄'
          break

        case 'Var':
          text = `VAR Review (${team}): ${detail}${player ? `, ${player}` : ''}`
          icon = '📺'
          break

        default:
          text = `${type}${detail ? `, ${detail}` : ''}${player ? ` (${player})` : ''}`
          break
      }

      return {
        minute: min,
        extra: ev.time?.extra || null,
        timestamp,
        icon,
        text,
        type,
        detail,
        team,
        player,
        assist,
        side: team === homeTeam ? 'home' : 'away',
        raw: ev,
      }
    })
}

/* ═══════════════════════════════════════════════════════════
   Hook: useAFMatchDetail
   Fetches full match detail: events + stats + lineups
   for the match drawer.

   OPTIMISED (v2): Progressive loading
   Phase 1 (instant): fixture header + events → drawer opens
   Phase 2 (background): stats + lineups + players → tabs fill in
   Also supports pre-fetching on hover via prefetchMatchDetail()
   ═══════════════════════════════════════════════════════════ */

// Module-level prefetch cache — survives re-renders
const _prefetchCache = {}

/**
 * Call this on mouseEnter/touchStart to warm the cache
 * before the user actually clicks. Fire-and-forget.
 */
export const prefetchMatchDetail = (eventId) => {
  if (!eventId) return
  const id = String(eventId).replace('af-', '')
  if (!id || _prefetchCache[id]) return
  _prefetchCache[id] = true // mark started

  // Kick off all 5 fetches — they'll land in apiCache
  Promise.all([
    apiFetch('/fixtures', { id }),
    apiFetch('/fixtures/events', { fixture: id }),
    apiFetch('/fixtures/statistics', { fixture: id }),
    apiFetch('/fixtures/lineups', { fixture: id }),
    apiFetch('/fixtures/players', { fixture: id }),
  ]).catch(() => {}) // swallow errors — it's just prefetch
}

export const useAFMatchDetail = (fixtureId) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!fixtureId) {
      setData(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchDetail = async () => {
      // ── PHASE 1: fixture + events (fastest, most important) ──
      // These two calls give us the score header and match events
      // which is what the user sees first in the Events tab.
      const [fixtureData, events] = await Promise.all([
        apiFetch('/fixtures', { id: fixtureId }),
        getFixtureEvents(fixtureId),
      ])
      if (cancelled) return

      const fixture = fixtureData?.[0] || null
      const homeTeam = fixture?.teams?.home?.name || ''
      const awayTeam = fixture?.teams?.away?.name || ''

      // Show drawer immediately with events + commentary
      setData({
        fixture,
        events,
        statistics: null,
        lineups: null,
        playerStats: null,
        commentary: generateCommentary(events, homeTeam, awayTeam),
      })
      setLoading(false) // ← Drawer opens NOW (Phase 1 done)

      // ── PHASE 2: stats + lineups + players (background) ──
      // These fill in the Stats/Lineups tabs silently
      const [stats, lineups, playerStats] = await Promise.all([
        getFixtureStatistics(fixtureId),
        getFixtureLineups(fixtureId),
        getFixturePlayers(fixtureId),
      ])
      if (cancelled) return

      setData(prev => ({
        ...prev,
        statistics: stats,
        lineups,
        playerStats,
      }))
    }

    fetchDetail()

    // Auto-refresh only for live matches (45s) — skip for finished/scheduled
    const interval = setInterval(async () => {
      // Check if match is live before refreshing
      const currentStatus = data?.fixture?.fixture?.status?.short || ''
      const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT'].includes(currentStatus)
      if (!isLive) return // Don't waste API calls on finished/scheduled matches

      const [fixtureData, events, stats, lineups, playerStats] = await Promise.all([
        apiFetch('/fixtures', { id: fixtureId }),
        getFixtureEvents(fixtureId),
        getFixtureStatistics(fixtureId),
        getFixtureLineups(fixtureId),
        getFixturePlayers(fixtureId),
      ])
      if (cancelled) return

      const fixture = fixtureData?.[0] || null
      const homeTeam = fixture?.teams?.home?.name || ''
      const awayTeam = fixture?.teams?.away?.name || ''

      setData({
        fixture,
        events,
        statistics: stats,
        lineups,
        playerStats,
        commentary: generateCommentary(events, homeTeam, awayTeam),
      })
    }, 45000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [fixtureId])

  return { data, loading }
}

/* ═══════════════════════════════════════════════════════════
   Hook: useAPIFootballStandings
   Fetches real-world league standings via our backend proxy
   (avoids CORS — server calls API-Football, not the browser).
   Returns data in the same shape as ESPN standings so
   StandingsPanel can render it without changes.
   ═══════════════════════════════════════════════════════════ */

// Mapping from API-Football league IDs to soccer-server leagueKey format
const AF_ID_TO_KEY = {
  39: 'premier_league',
  140: 'la_liga',
  78: 'bundesliga',
  135: 'serie_a',
  61: 'ligue_1',
  106: 'ekstraklasa',
  2: 'champions_league',
}

// League display names for table headers
const AF_ID_TO_NAME = {
  39: 'Premier League',
  140: 'La Liga',
  78: 'Bundesliga',
  135: 'Serie A',
  61: 'Ligue 1',
  106: 'Ekstraklasa',
  2: 'Champions League',
}

// Soccer server has the working API-Football connection
const SOCCER_BACKEND_URL = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'
const standingsCache = {}
const STANDINGS_CACHE_TTL = 4 * 60 * 60 * 1000 // 4 hours

export const useAPIFootballStandings = (leagueId) => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leagueId) {
      setTables([])
      return
    }

    const leagueKey = AF_ID_TO_KEY[leagueId]
    if (!leagueKey) {
      setTables([])
      return
    }

    // Check client-side cache
    const cached = standingsCache[leagueKey]
    if (cached && Date.now() - cached.ts < STANDINGS_CACHE_TTL) {
      setTables(cached.data)
      return
    }

    const fetchStandings = async () => {
      setLoading(true)

      try {
        const res = await fetch(`${SOCCER_BACKEND_URL}/api/v1/leagues/real-standings/${leagueKey}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        if (json.success && json.data && json.data.length > 0) {
          // Transform soccer server format into ESPN-compatible format for StandingsTable
          const now = new Date()
          const year = now.getFullYear()
          const season = now.getMonth() < 7 ? year - 1 : year
          const leagueName = AF_ID_TO_NAME[leagueId] || leagueKey

          const transformed = [{
            name: leagueName,
            season: `${season}/${season + 1}`,
            entries: json.data.map((team) => ({
              position: team.rank,
              team: team.teamName,
              logo: team.teamLogo,
              form: team.form || '',
              zone: team.description
                ? team.description.toLowerCase().includes('champions league') || team.description.toLowerCase().includes('promotion')
                  ? 'CL'
                  : team.description.toLowerCase().includes('europa')
                    ? 'EL'
                    : team.description.toLowerCase().includes('relegation')
                      ? 'Rel'
                      : ''
                : '',
              stats: [
                { name: 'played', displayValue: String(team.played || 0) },
                { name: 'wins', displayValue: String(team.wins || 0) },
                { name: 'draws', displayValue: String(team.draws || 0) },
                { name: 'losses', displayValue: String(team.losses || 0) },
                { name: 'goalsFor', displayValue: String(team.goalsFor || 0) },
                { name: 'goalsAgainst', displayValue: String(team.goalsAgainst || 0) },
                { name: 'goalsDiff', displayValue: String(team.goalDifference || 0) },
                { name: 'points', displayValue: String(team.points || 0) },
              ],
            })),
          }]

          standingsCache[leagueKey] = { data: transformed, ts: Date.now() }
          setTables(transformed)
        } else {
          setTables([])
        }
      } catch (err) {
        console.warn('[Standings Proxy] Error:', err.message)
        setTables([])
      }

      setLoading(false)
    }

    fetchStandings()
  }, [leagueId])

  return { tables, loading }
}

export default {
  useSoccerFixtures,
  useLiveFixtures,
  useAFMatchDetail,
  useAPIFootballStandings,
  getFixtureEvents,
  getFixtureLineups,
  getFixtureStatistics,
  getFixturePlayers,
  generateCommentary,
  AF_LEAGUES,
}
