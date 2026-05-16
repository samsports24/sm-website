import Axios from 'axios'
import store from '../../redux/store'

// Soccer backend, separate server from football
export const soccer_base_url = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'
export const frontEndUrl = process.env.REACT_APP_FRONTEND_URL || 'https://samsports.io'

export const soccerAPI = Axios.create({ baseURL: soccer_base_url })
export const soccerPublicAPI = Axios.create({ baseURL: soccer_base_url })

export const attachSoccerToken = () => {
  const jwt = localStorage.getItem('token')
  soccerAPI.defaults.headers.common.Authorization = `Bearer ${jwt}`
}

// Set active league/team context on every soccer request
soccerAPI.interceptors.request.use((cfg) => {
  const state = store.getState()
  const league = state.soccerLeague?.currentLeague?._id
  const team = state.soccerTeam?.currentTeam?._id
  if (league) cfg.headers['x-league-id'] = league
  if (team) cfg.headers['x-team-id'] = team
  return cfg
})

// Silently handle 401/403 from soccer backend — do NOT clear main NFL auth state
// (clearing 'token' here was nuking the NFL session after every login)
soccerAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      console.warn('[Soccer API] 401/403 received — ignoring (NFL token preserved)')
    }
    return Promise.reject(err)
  }
)

export const version = '1.0.0'

// ── Squad Rules ──
export const SQUAD_SIZE = 23
export const ACADEMY_SIZE = 3
export const TOTAL_ROSTER = 26
export const ACADEMY_MAX_AGE = 23
export const STARTING_XI = 11
export const SUBSTITUTES = 5
export const MATCHDAY_SQUAD = 16

// ── Salary Cap ──
export const SALARY_CAP = (() => { try { const s = JSON.parse(localStorage.getItem('samsports_cap_settings') || '{}'); return s.soccerCap || 200_000_000; } catch { return 200_000_000; } })()

// ── Positions ──
export const POSITIONS = {
  GK: { name: 'Goalkeeper', abbr: 'GK', category: 'goalkeeper', color: '#F59E0B' },
  CB: { name: 'Centre-Back', abbr: 'CB', category: 'defender', color: '#3B82F6' },
  LB: { name: 'Left-Back', abbr: 'LB', category: 'defender', color: '#3B82F6' },
  RB: { name: 'Right-Back', abbr: 'RB', category: 'defender', color: '#3B82F6' },
  LWB: { name: 'Left Wing-Back', abbr: 'LWB', category: 'defender', color: '#3B82F6' },
  RWB: { name: 'Right Wing-Back', abbr: 'RWB', category: 'defender', color: '#3B82F6' },
  CDM: { name: 'Defensive Mid', abbr: 'CDM', category: 'midfielder', color: '#22C55E' },
  CM: { name: 'Central Mid', abbr: 'CM', category: 'midfielder', color: '#22C55E' },
  CAM: { name: 'Attacking Mid', abbr: 'CAM', category: 'midfielder', color: '#22C55E' },
  LM: { name: 'Left Mid', abbr: 'LM', category: 'midfielder', color: '#22C55E' },
  RM: { name: 'Right Mid', abbr: 'RM', category: 'midfielder', color: '#22C55E' },
  LW: { name: 'Left Winger', abbr: 'LW', category: 'forward', color: '#EF4444' },
  RW: { name: 'Right Winger', abbr: 'RW', category: 'forward', color: '#EF4444' },
  CF: { name: 'Centre-Forward', abbr: 'CF', category: 'forward', color: '#EF4444' },
  ST: { name: 'Striker', abbr: 'ST', category: 'forward', color: '#EF4444' },
}

// ── Formations ──
export const FORMATIONS = {
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 15, y: 70 }, { pos: 'CB', x: 35, y: 73 }, { pos: 'CB', x: 65, y: 73 }, { pos: 'RB', x: 85, y: 70 },
      { pos: 'CM', x: 25, y: 48 }, { pos: 'CM', x: 50, y: 45 }, { pos: 'CM', x: 75, y: 48 },
      { pos: 'LW', x: 18, y: 22 }, { pos: 'ST', x: 50, y: 18 }, { pos: 'RW', x: 82, y: 22 },
    ],
  },
  '4-4-2': {
    label: '4-4-2',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 15, y: 70 }, { pos: 'CB', x: 35, y: 73 }, { pos: 'CB', x: 65, y: 73 }, { pos: 'RB', x: 85, y: 70 },
      { pos: 'LM', x: 15, y: 48 }, { pos: 'CM', x: 38, y: 48 }, { pos: 'CM', x: 62, y: 48 }, { pos: 'RM', x: 85, y: 48 },
      { pos: 'ST', x: 38, y: 20 }, { pos: 'ST', x: 62, y: 20 },
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'CB', x: 25, y: 73 }, { pos: 'CB', x: 50, y: 75 }, { pos: 'CB', x: 75, y: 73 },
      { pos: 'LWB', x: 10, y: 50 }, { pos: 'CM', x: 30, y: 48 }, { pos: 'CDM', x: 50, y: 52 }, { pos: 'CM', x: 70, y: 48 }, { pos: 'RWB', x: 90, y: 50 },
      { pos: 'ST', x: 38, y: 20 }, { pos: 'ST', x: 62, y: 20 },
    ],
  },
  '4-2-3-1': {
    label: '4-2-3-1',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 15, y: 70 }, { pos: 'CB', x: 35, y: 73 }, { pos: 'CB', x: 65, y: 73 }, { pos: 'RB', x: 85, y: 70 },
      { pos: 'CDM', x: 35, y: 55 }, { pos: 'CDM', x: 65, y: 55 },
      { pos: 'LW', x: 18, y: 35 }, { pos: 'CAM', x: 50, y: 33 }, { pos: 'RW', x: 82, y: 35 },
      { pos: 'ST', x: 50, y: 15 },
    ],
  },
  '3-4-3': {
    label: '3-4-3',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'CB', x: 25, y: 73 }, { pos: 'CB', x: 50, y: 75 }, { pos: 'CB', x: 75, y: 73 },
      { pos: 'LM', x: 15, y: 48 }, { pos: 'CM', x: 38, y: 48 }, { pos: 'CM', x: 62, y: 48 }, { pos: 'RM', x: 85, y: 48 },
      { pos: 'LW', x: 20, y: 22 }, { pos: 'ST', x: 50, y: 18 }, { pos: 'RW', x: 80, y: 22 },
    ],
  },
  '5-3-2': {
    label: '5-3-2',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LWB', x: 8, y: 65 }, { pos: 'CB', x: 28, y: 73 }, { pos: 'CB', x: 50, y: 75 }, { pos: 'CB', x: 72, y: 73 }, { pos: 'RWB', x: 92, y: 65 },
      { pos: 'CM', x: 25, y: 48 }, { pos: 'CM', x: 50, y: 45 }, { pos: 'CM', x: 75, y: 48 },
      { pos: 'ST', x: 38, y: 20 }, { pos: 'ST', x: 62, y: 20 },
    ],
  },
  '5-4-1': {
    label: '5-4-1',
    slots: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LWB', x: 8, y: 65 }, { pos: 'CB', x: 28, y: 73 }, { pos: 'CB', x: 50, y: 75 }, { pos: 'CB', x: 72, y: 73 }, { pos: 'RWB', x: 92, y: 65 },
      { pos: 'LM', x: 15, y: 48 }, { pos: 'CM', x: 38, y: 48 }, { pos: 'CM', x: 62, y: 48 }, { pos: 'RM', x: 85, y: 48 },
      { pos: 'ST', x: 50, y: 18 },
    ],
  },
}

// ── Real Leagues ──
export const REAL_LEAGUES = {
  premier_league: { name: 'English Premier', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3D195B' },
  la_liga: { name: 'Spanish First Division', country: 'Spain', flag: '🇪🇸', color: '#FF4B44' },
  serie_a: { name: 'Italian First Division', country: 'Italy', flag: '🇮🇹', color: '#008FD5' },
  bundesliga: { name: 'German First Division', country: 'Germany', flag: '🇩🇪', color: '#D20515' },
  ligue_1: { name: 'French First Division', country: 'France', flag: '🇫🇷', color: '#091C3E' },
  ekstraklasa: { name: 'Polish First Division', country: 'Poland', flag: '🇵🇱', color: '#DC143C' },
  champions_league: { name: 'European Cup', country: 'Europe', flag: '🇪🇺', color: '#071D49' },
  world_cup_2026: { name: 'World Cup 2026', country: 'International', flag: '🏆', color: '#D4AF37', maxTeams: 48, isWorldCup: true },
}
