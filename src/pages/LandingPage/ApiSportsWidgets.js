import { useEffect, useRef } from 'react'

/**
 * API-Sports Widget Integration for SamSports Landing Page
 *
 * Embeds API-Sports widgets (v3.1.0) for live scores, standings,
 * game details, team profiles, and player profiles across all sports.
 *
 * Docs: https://api-sports.io/documentation/widgets/v3
 *
 * Usage:
 *   <ApiSportsWidgets sport="nfl" type="games" />
 *   <ApiSportsWidgets sport="football" type="standings" league={39} season="2025" />
 */

// ── Configuration ──────────────────────────────────────────────
const WIDGET_SCRIPT = 'https://widgets.api-sports.io/3.1.0/widgets.js'
const API_KEY = process.env.REACT_APP_API_SPORTS_KEY || ''

// Map SamSports sport keys → API-Sports data-sport values
const SPORT_MAP = {
  soccer:   'football',
  nfl:      'nfl',
  nba:      'nba',
  nhl:      'hockey',
  mlb:      'baseball',
  ncaafb:   'nfl',       // NCAA football uses same API
  ncaab:    'basketball', // NCAA basketball uses same API
  rugby:    'rugby',
  handball: 'handball',
  volleyball: 'volleyball',
  f1:       'f1',
  mma:      'mma',
  afl:      'afl',
}

// API-Sports league IDs for the sports we cover
const LEAGUE_IDS = {
  // NFL
  nfl: 1,          // NFL
  ncaafb: 2,       // NCAA

  // Soccer (API-Football v3 league IDs)
  epl: 39,         // Premier League
  laliga: 140,     // La Liga
  bundesliga: 78,  // Bundesliga
  seriea: 135,     // Serie A
  ligue1: 61,      // Ligue 1
  ucl: 2,          // Champions League
  uel: 3,          // Europa League
  mls: 253,        // MLS

  // NBA
  nba: 12,         // NBA standard league ID

  // Hockey
  nhl: 57,         // NHL

  // Baseball
  mlb: 1,          // MLB
}

// ── Script Loader (singleton) ──────────────────────────────────
let scriptLoaded = false
let scriptLoading = false
const loadWidgetScript = () => {
  if (scriptLoaded || scriptLoading) return
  scriptLoading = true

  // Check if already in DOM
  const existing = document.querySelector(`script[src="${WIDGET_SCRIPT}"]`)
  if (existing) {
    scriptLoaded = true
    scriptLoading = false
    return
  }

  const script = document.createElement('script')
  script.type = 'module'
  script.src = WIDGET_SCRIPT
  script.onload = () => {
    scriptLoaded = true
    scriptLoading = false
  }
  document.head.appendChild(script)
}


// ── Custom SamSports Dark Theme ────────────────────────────────
const SAMSPORTS_THEME_CSS = `
api-sports-widget[data-theme="samsports"] {
  --primary-color: #22C55E;
  --success-color: #22C55E;
  --warning-color: #f0b429;
  --danger-color: #ff3b3b;
  --light-color: #94A3B8;
  --home-color: #22C55E;
  --away-color: #64748B;
  --text-color: #F1F5F9;
  --text-color-info: #94A3B8;
  --background-color: #111827;
  --primary-font-size: 0.72rem;
  --secondary-font-size: 0.75rem;
  --button-font-size: 0.8rem;
  --title-font-size: 0.9rem;
  --header-text-transform: uppercase;
  --button-text-transform: uppercase;
  --title-text-transform: uppercase;
  --border: 1px solid #1E293B;
  --game-height: 2.3rem;
  --league-height: 2.35rem;
  --score-size: 2.25rem;
  --flag-size: 22px;
  --teams-logo-size: 18px;
  --teams-logo-size-xl: 5rem;
  --hover: rgba(34, 197, 94, 0.08);
}
`

let themeInjected = false
const injectTheme = () => {
  if (themeInjected) return
  themeInjected = true
  const style = document.createElement('style')
  style.textContent = SAMSPORTS_THEME_CSS
  document.head.appendChild(style)
}


// ── Config Widget (rendered once per page) ─────────────────────
let configRendered = false

const WidgetConfig = ({ sport }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (configRendered || !ref.current || !API_KEY) return
    configRendered = true

    const config = document.createElement('api-sports-widget')
    config.setAttribute('data-type', 'config')
    config.setAttribute('data-key', API_KEY)
    config.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    config.setAttribute('data-theme', 'samsports')
    config.setAttribute('data-lang', 'en')
    config.setAttribute('data-show-logos', 'true')
    config.setAttribute('data-show-errors', 'false')
    config.setAttribute('data-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York')

    ref.current.appendChild(config)

    return () => {
      configRendered = false
      if (ref.current) ref.current.innerHTML = ''
    }
  }, [sport])

  return <div ref={ref} style={{ display: 'none' }} />
}


// ── Games Widget (Live Scores) ─────────────────────────────────
/**
 * Live scores for a given sport/date.
 *
 * Props:
 *   sport     - SamSports key: 'nfl', 'nba', 'soccer', etc.
 *   date      - Optional: 'YYYY-MM-DD' string
 *   league    - Optional: API-Sports league ID to filter
 *   refresh   - Auto-refresh interval in seconds (min 15)
 *   tab       - Default tab: 'all' | 'live' | 'finished' | 'scheduled'
 *   style     - 1 = two-line (default), 2 = compact single-line
 *   onGameClick - 'modal' or CSS selector for game detail target
 */
export const GamesWidget = ({
  sport = 'nfl',
  date,
  league,
  refresh = 20,
  tab = 'all',
  style: gameStyle = 1,
  onGameClick = 'modal',
  showToolbar = true,
  height,
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current) return

    // Clear previous widget
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'games')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-refresh', String(refresh))
    widget.setAttribute('data-tab', tab)
    widget.setAttribute('data-games-style', String(gameStyle))
    widget.setAttribute('data-show-toolbar', String(showToolbar))
    widget.setAttribute('data-target-game', onGameClick)

    if (date) widget.setAttribute('data-date', date)
    if (league) widget.setAttribute('data-league', String(league))

    ref.current.appendChild(widget)

    return () => {
      if (ref.current) ref.current.innerHTML = ''
    }
  }, [sport, date, league, refresh, tab, gameStyle, showToolbar, onGameClick])

  return (
    <div
      ref={ref}
      className="asw-container asw-games"
      style={height ? { maxHeight: height, overflow: 'auto' } : undefined}
    />
  )
}


// ── Standings Widget ───────────────────────────────────────────
/**
 * League standings table.
 *
 * Props:
 *   sport   - SamSports key
 *   league  - API-Sports league ID (required)
 *   season  - Season year string e.g. '2025'
 */
export const StandingsWidget = ({
  sport = 'nfl',
  league,
  season,
  onTeamClick = 'modal',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current || !league) return
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'standings')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-league', String(league))
    if (season) widget.setAttribute('data-season', season)
    widget.setAttribute('data-target-team', onTeamClick)

    ref.current.appendChild(widget)
    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [sport, league, season, onTeamClick])

  return <div ref={ref} className="asw-container asw-standings" />
}


// ── Game Detail Widget ─────────────────────────────────────────
/**
 * Single game detail view with stats, events, player stats.
 *
 * Props:
 *   sport        - SamSports key
 *   gameId       - API-Sports game ID
 *   showStats    - Show team statistics tab
 *   showPlayers  - Show player statistics tab
 *   showEvents   - Show events (plays) tab
 */
export const GameWidget = ({
  sport = 'nfl',
  gameId,
  refresh = 30,
  showStats = true,
  showPlayers = true,
  showEvents = true,
  defaultTab = 'statistics',
  onTeamClick = 'modal',
  onPlayerClick = 'modal',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current || !gameId) return
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'game')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-game-id', String(gameId))
    widget.setAttribute('data-refresh', String(refresh))
    widget.setAttribute('data-game-tab', defaultTab)
    widget.setAttribute('data-team-statistics', String(showStats))
    widget.setAttribute('data-player-statistics', String(showPlayers))
    widget.setAttribute('data-events', String(showEvents))
    widget.setAttribute('data-target-team', onTeamClick)
    widget.setAttribute('data-target-player', onPlayerClick)

    ref.current.appendChild(widget)
    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [sport, gameId, refresh, showStats, showPlayers, showEvents, defaultTab, onTeamClick, onPlayerClick])

  return <div ref={ref} className="asw-container asw-game-detail" />
}


// ── League Widget (Full Schedule) ──────────────────────────────
/**
 * Full league schedule with today/results/upcoming tabs + optional standings.
 */
export const LeagueWidget = ({
  sport = 'nfl',
  league,
  season,
  showStandings = true,
  tab = 'today',
  refresh = 30,
  onGameClick = 'modal',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current || !league) return
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'league')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-league', String(league))
    widget.setAttribute('data-standings', String(showStandings))
    widget.setAttribute('data-tab', tab)
    widget.setAttribute('data-refresh', String(refresh))
    widget.setAttribute('data-target-game', onGameClick)
    if (season) widget.setAttribute('data-season', season)

    ref.current.appendChild(widget)
    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [sport, league, season, showStandings, tab, refresh, onGameClick])

  return <div ref={ref} className="asw-container asw-league" />
}


// ── Team Widget ────────────────────────────────────────────────
export const TeamWidget = ({
  sport = 'nfl',
  teamId,
  showStats = true,
  showSquad = true,
  defaultTab = 'squads',
  onPlayerClick = 'modal',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current || !teamId) return
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'team')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-team-id', String(teamId))
    widget.setAttribute('data-team-tab', defaultTab)
    widget.setAttribute('data-team-statistics', String(showStats))
    widget.setAttribute('data-team-squads', String(showSquad))
    widget.setAttribute('data-target-player', onPlayerClick)

    ref.current.appendChild(widget)
    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [sport, teamId, showStats, showSquad, defaultTab, onPlayerClick])

  return <div ref={ref} className="asw-container asw-team" />
}


// ── Player Widget ──────────────────────────────────────────────
export const PlayerWidget = ({
  sport = 'nfl',
  playerId,
  season,
  showStats = true,
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current || !playerId) return
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'player')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-player-id', String(playerId))
    widget.setAttribute('data-player-statistics', String(showStats))
    if (season) widget.setAttribute('data-season', season)

    ref.current.appendChild(widget)
    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [sport, playerId, season, showStats])

  return <div ref={ref} className="asw-container asw-player" />
}


// ── H2H Widget ─────────────────────────────────────────────────
export const H2HWidget = ({
  sport = 'nfl',
  teamId1,
  teamId2,
  onGameClick = 'modal',
}) => {
  const ref = useRef(null)

  useEffect(() => {
    loadWidgetScript()
    injectTheme()
  }, [])

  useEffect(() => {
    if (!ref.current || !teamId1 || !teamId2) return
    ref.current.innerHTML = ''

    const widget = document.createElement('api-sports-widget')
    widget.setAttribute('data-type', 'h2h')
    widget.setAttribute('data-sport', SPORT_MAP[sport] || sport)
    widget.setAttribute('data-theme', 'samsports')
    widget.setAttribute('data-h2h', `${teamId1}-${teamId2}`)
    widget.setAttribute('data-target-game', onGameClick)

    ref.current.appendChild(widget)
    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [sport, teamId1, teamId2, onGameClick])

  return <div ref={ref} className="asw-container asw-h2h" />
}


// ── Multi-Sport Landing Page Widget ────────────────────────────
/**
 * Drop-in replacement/addition for the landing page SportPanel.
 * Shows live scores + standings for the active sport tab.
 *
 * Usage in LandingPage:
 *   import { SportWidgetPanel } from './ApiSportsWidgets'
 *   <SportWidgetPanel activeSport="nfl" selectedDate={selectedDate} />
 */
export const SportWidgetPanel = ({ activeSport, selectedDate }) => {
  const dateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : undefined

  // Map the active sport to the right league for the games widget
  const sportConfig = {
    soccer:  { sport: 'soccer',  leagues: [39, 140, 78, 135, 61, 2, 3] },
    nfl:     { sport: 'nfl',     league: LEAGUE_IDS.nfl },
    nba:     { sport: 'nba',     league: LEAGUE_IDS.nba },
    nhl:     { sport: 'nhl',     league: LEAGUE_IDS.nhl },
    mlb:     { sport: 'mlb',     league: LEAGUE_IDS.mlb },
    ncaafb:  { sport: 'ncaafb',  league: LEAGUE_IDS.ncaafb },
    ncaab:   { sport: 'ncaab' },
  }

  const config = sportConfig[activeSport]
  if (!config) return null

  // For soccer, show multiple leagues joined with dashes
  const leagueParam = config.leagues
    ? config.leagues.join('-')
    : config.league

  return (
    <div className="asw-sport-panel">
      <WidgetConfig sport={config.sport} />

      {/* Game detail target container */}
      <div id="asw-game-detail" />

      {/* Live Scores */}
      <GamesWidget
        sport={config.sport}
        date={dateStr}
        league={leagueParam}
        refresh={20}
        tab="all"
        showToolbar={true}
        onGameClick="#asw-game-detail"
      />
    </div>
  )
}


// ── Standalone Standings Page Widget ───────────────────────────
/**
 * Full standings for any league.
 *
 * Usage:
 *   <StandingsPageWidget sport="nfl" league={1} season="2025" />
 */
export const StandingsPageWidget = ({ sport, league, season }) => {
  return (
    <div className="asw-standings-page">
      <WidgetConfig sport={sport} />
      <StandingsWidget sport={sport} league={league} season={season} />
    </div>
  )
}


// ── Export everything ──────────────────────────────────────────
export { SPORT_MAP, LEAGUE_IDS, WidgetConfig }

export default {
  GamesWidget,
  StandingsWidget,
  GameWidget,
  LeagueWidget,
  TeamWidget,
  PlayerWidget,
  H2HWidget,
  SportWidgetPanel,
  StandingsPageWidget,
  WidgetConfig,
  SPORT_MAP,
  LEAGUE_IDS,
}
