import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   API-Football v3 Integration Hook  (v4 — FULLY PROXIED)

   ALL API-Football calls now go through the soccer backend proxy
   at /api/v1/match-detail/*. The browser NEVER calls
   v3.football.api-sports.io directly (CORS blocks it).

   Proxy endpoints:
     GET /api/v1/match-detail/fixtures-by-date?date=...&leagues=...
     GET /api/v1/match-detail/fixtures-live
     GET /api/v1/match-detail/:fixtureId   (full match detail)
   ═══════════════════════════════════════════════════════════ */

const SOCCER_BACKEND_URL = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'
const PROXY_BASE = `${SOCCER_BACKEND_URL}/api/v1/match-detail`

const CACHE_TTL = 3 * 60 * 1000 // 3 min client-side cache
const REFRESH_INTERVAL = 60000  // 60s auto-refresh

// Module-level client-side cache
const clientCache = {}
function getCached(key) {
  const c = clientCache[key]
  if (c && Date.now() - c.ts < CACHE_TTL) return c.data
  return null
}
function setClientCache(key, data) {
  clientCache[key] = { data, ts: Date.now() }
}

/* ── League mapping: API-Football league IDs ──
   type: 'euro-club'  = Aug-May season (season = year season started)
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

/* ═══════════════════════════════════════════════════════════
   Fixture Normalizer — Converts API-Football format to
   ESPN-compatible shape so existing MatchCard + SportPanel
   can render without changes
   ═══════════════════════════════════════════════════════════ */
const normalizeFixture = (f) => {
  const home = f.teams?.home || {}
  const away = f.teams?.away || {}
  const goals = f.goals || {}
  const status = f.fixture?.status || {}

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
    _afId: f.fixture?.id,
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
    status: { type: { state, shortDetail: label } },
    _status: { state, label },
  }
}

/* ═══════════════════════════════════════════════════════════
   Hook: useSoccerFixtures  (v4 — proxied)
   Fetches all soccer fixtures via backend proxy in 2 batch calls
   instead of 20+ individual browser→API-Football calls.
   ═══════════════════════════════════════════════════════════ */
export const useSoccerFixtures = (selectedDate = undefined, leagues = AF_LEAGUES) => {
  const disabled = selectedDate === null
  const [data, setData] = useState({ leagues: [], loading: !disabled, totalMatches: 0, activeLeagues: 0 })
  const intervalRef = useRef(null)

  const PRIORITY_IDS = new Set([39, 140, 78, 135, 61, 2, 3])
  const priorityLeagues = leagues.filter(lg => PRIORITY_IDS.has(lg.id))
  const otherLeagues = leagues.filter(lg => !PRIORITY_IDS.has(lg.id))

  const fetchAll = useCallback(async () => {
    if (disabled) return
    const d = selectedDate || new Date()
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    // Build league param: "leagueId:season,leagueId:season,..."
    const buildLeagueParam = (lgList) =>
      lgList.map(lg => `${lg.id}:${getSeasonYear(lg)}`).join(',')

    // Helper: fetch a batch of leagues from proxy, return per-league results
    const fetchBatch = async (lgList) => {
      const leagueParam = buildLeagueParam(lgList)
      const cacheKey = `fix_${dateStr}_${leagueParam}`
      const cached = getCached(cacheKey)

      let leagueResults
      if (cached) {
        leagueResults = cached.leagues || []
      } else {
        try {
          const res = await fetch(`${PROXY_BASE}/fixtures-by-date?date=${dateStr}&leagues=${encodeURIComponent(leagueParam)}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          leagueResults = json.data?.leagues || []
          setClientCache(cacheKey, { leagues: leagueResults })
        } catch (err) {
          console.warn('[Fixtures Proxy] Error:', err.message)
          leagueResults = []
        }
      }

      // Map proxy results back to per-league format
      const byId = {}
      for (const lr of leagueResults) {
        byId[lr.leagueId] = lr.fixtures || []
      }

      return lgList.map(lg => ({
        lg,
        events: (byId[lg.id] || []).map(normalizeFixture),
      }))
    }

    // ── PHASE 1: Priority leagues (1 batch call) ──
    const priorityResults = await fetchBatch(priorityLeagues)
    const allResults = [...priorityResults]

    const pTotal = allResults.reduce((s, r) => s + r.events.length, 0)
    const pActive = allResults.filter(r => r.events.length > 0).length
    setData({ leagues: [...allResults], loading: false, totalMatches: pTotal, activeLeagues: pActive })

    // ── PHASE 2: Remaining leagues (1 batch call) ──
    if (otherLeagues.length > 0) {
      const otherResults = await fetchBatch(otherLeagues)
      allResults.push(...otherResults)

      const total = allResults.reduce((s, r) => s + r.events.length, 0)
      const active = allResults.filter(r => r.events.length > 0).length
      setData({ leagues: [...allResults], loading: false, totalMatches: total, activeLeagues: active })
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
   Hook: useLiveFixtures  (v4 — proxied)
   ═══════════════════════════════════════════════════════════ */
export const useLiveFixtures = () => {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const cached = getCached('live_fixtures')
        if (cached) {
          setFixtures(cached.map(normalizeFixture))
          setLoading(false)
          return
        }

        const res = await fetch(`${PROXY_BASE}/fixtures-live`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const data = json.data || []
        setClientCache('live_fixtures', data)
        setFixtures(data.map(normalizeFixture))
      } catch (err) {
        console.warn('[Live Fixtures Proxy] Error:', err.message)
      }
      setLoading(false)
    }

    fetchLive()
    const interval = setInterval(fetchLive, 60000)
    return () => clearInterval(interval)
  }, [])

  return { fixtures, loading }
}

/* ═══════════════════════════════════════════════════════════
   Standalone fetchers (kept for backward compatibility)
   These are no longer called by the main hooks but other
   components may import them directly.
   ═══════════════════════════════════════════════════════════ */
export const getFixtureEvents = async (fixtureId) => {
  if (!fixtureId) return []
  // Use the full match detail proxy (events are included)
  const detail = await fetchFromProxy(fixtureId)
  return detail?.events || []
}

export const getFixtureLineups = async (fixtureId) => {
  if (!fixtureId) return []
  const detail = await fetchFromProxy(fixtureId)
  return detail?.lineups || []
}

export const getFixtureStatistics = async (fixtureId) => {
  if (!fixtureId) return []
  const detail = await fetchFromProxy(fixtureId)
  return detail?.statistics || []
}

export const getFixturePlayers = async (fixtureId) => {
  if (!fixtureId) return []
  const detail = await fetchFromProxy(fixtureId)
  return detail?.players || []
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
   Hook: useAFMatchDetail  (v4 — proxied)
   Single backend call returns fixture + events + stats +
   lineups + players, all server-side cached.
   ═══════════════════════════════════════════════════════════ */

const _prefetchCache = {}
const _proxyCache = {}
const PROXY_CACHE_TTL = 60 * 1000

const fetchFromProxy = async (fixtureId) => {
  const cached = _proxyCache[fixtureId]
  if (cached && Date.now() - cached.ts < PROXY_CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(`${PROXY_BASE}/${fixtureId}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.success && json.data) {
      _proxyCache[fixtureId] = { data: json.data, ts: Date.now() }
      return json.data
    }
    return null
  } catch (err) {
    console.warn('[MatchDetail] Proxy error:', err.message)
    return null
  }
}

export const prefetchMatchDetail = (eventId) => {
  if (!eventId) return
  const id = String(eventId).replace('af-', '')
  if (!id || _prefetchCache[id]) return
  _prefetchCache[id] = true
  fetchFromProxy(id).catch(() => {})
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
      const result = await fetchFromProxy(fixtureId)
      if (cancelled) return

      if (!result) {
        setLoading(false)
        return
      }

      const fixture = result.fixture || null
      const events = result.events || []
      const homeTeam = fixture?.teams?.home?.name || ''
      const awayTeam = fixture?.teams?.away?.name || ''

      setData({
        fixture,
        events,
        statistics: result.statistics || null,
        lineups: result.lineups || null,
        playerStats: result.players || null,
        commentary: generateCommentary(events, homeTeam, awayTeam),
      })
      setLoading(false)
    }

    fetchDetail()

    // Auto-refresh only for live matches (45s)
    const interval = setInterval(async () => {
      const currentStatus = data?.fixture?.fixture?.status?.short || ''
      const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT'].includes(currentStatus)
      if (!isLive) return

      delete _proxyCache[fixtureId]
      const result = await fetchFromProxy(fixtureId)
      if (cancelled) return
      if (!result) return

      const fixture = result.fixture || null
      const events = result.events || []
      const homeTeam = fixture?.teams?.home?.name || ''
      const awayTeam = fixture?.teams?.away?.name || ''

      setData({
        fixture,
        events,
        statistics: result.statistics || null,
        lineups: result.lineups || null,
        playerStats: result.players || null,
        commentary: generateCommentary(events, homeTeam, awayTeam),
      })
    }, 45000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [fixtureId])

  return { data, loading }
}

/* ═══════════════════════════════════════════════════════════
   Hook: useAPIFootballStandings
   Already proxied via soccer backend (no change needed).
   ═══════════════════════════════════════════════════════════ */

const AF_ID_TO_KEY = {
  39: 'premier_league',
  140: 'la_liga',
  78: 'bundesliga',
  135: 'serie_a',
  61: 'ligue_1',
  106: 'ekstraklasa',
  2: 'champions_league',
}

const AF_ID_TO_NAME = {
  39: 'Premier League',
  140: 'La Liga',
  78: 'Bundesliga',
  135: 'Serie A',
  61: 'Ligue 1',
  106: 'Ekstraklasa',
  2: 'Champions League',
}

const standingsCache = {}
const STANDINGS_CACHE_TTL = 4 * 60 * 60 * 1000

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
