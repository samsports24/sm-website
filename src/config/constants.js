import Axios from 'axios'
import store from '../redux/store'
import { getNotiCount } from '../redux/actions/notificationAction'
import { attachAxiosErrorReporting } from '../utils/errorReporter'
import football from '../assets/new_Football.png'
import hockey from '../assets/new_Hockey.png'
import soccer from '../assets/new_Soccerball.png'
import baseball from '../assets/new_Baseball.png'

export const base_url = process.env.REACT_APP_API_URL || 'https://backend.samsports.io'
export const frontEndUrl = process.env.REACT_APP_FRONTEND_URL || 'https://samsports.io'
export const draft_base_url = process.env.REACT_APP_DRAFT_API_URL || 'https://backend.samsports.io'

export const publicAPI = Axios.create({ baseURL: base_url, withCredentials: true })
export const privateAPI = Axios.create({ baseURL: base_url, withCredentials: true })
export const privateDRAFTAPI = Axios.create({ baseURL: draft_base_url, withCredentials: true })

// ── White-label: attach partner subdomain header so backend can identify partner context ──
;(() => {
  const host = window.location.hostname
  const parts = host.split('.')
  const skip = ['www', 'api', 'office', 'football', 'admin', 'staging', 'dev']
  let subdomain = null
  if (parts.length >= 3) {
    const candidate = parts[0].toLowerCase()
    if (!skip.includes(candidate)) subdomain = candidate
  }
  if (subdomain) {
    publicAPI.defaults.headers.common['X-Partner-Subdomain'] = subdomain
    privateAPI.defaults.headers.common['X-Partner-Subdomain'] = subdomain
    privateDRAFTAPI.defaults.headers.common['X-Partner-Subdomain'] = subdomain
  }
})()

export const attachToken = async () => {
  // Set Authorization header from localStorage as primary auth method.
  // httpOnly cookie serves as fallback via withCredentials: true.
  const token = localStorage.getItem('token')
  if (token) {
    privateAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`
    privateDRAFTAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

// Attach error reporting to all API instances
attachAxiosErrorReporting(publicAPI)
attachAxiosErrorReporting(privateAPI)
attachAxiosErrorReporting(privateDRAFTAPI)

// Flag to skip stale league/team headers during league switching
// When true, the JWT token alone determines league context on the backend
let _switchingLeague = false
export const setLeagueSwitching = (val) => { _switchingLeague = val }

// Debounced notification count, prevents hammering server with get-count
// on every API response (was firing ~20+ times per page load)
let _notiTimeout = null
const debouncedNotiCount = () => {
  if (_notiTimeout) clearTimeout(_notiTimeout)
  _notiTimeout = setTimeout(() => {
    debouncedNotiCount()
  }, 5000) // 5 seconds, only fires once after all API calls settle
}

// Helper to read a cookie value by name
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

// Inject auth token + league & team context on every authenticated request
privateAPI.interceptors.request.use((config) => {
  // Always attach Authorization header from localStorage
  const token = localStorage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`

  if (_switchingLeague) return config
  const state = store?.getState()
  const league = state?.league?.currentLeague?._id || state?.user?.userDetails?.team?.currentLeague?._id
  const team = state?.user?.userDetails?.team?._id
  if (league) config.headers['x-league-id'] = league
  if (team) config.headers['x-team-id'] = team

  // Attach CSRF token for mutation requests
  const method = (config.method || '').toUpperCase()
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCookie('csrf-token')
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken
  }

  return config
})

privateDRAFTAPI.interceptors.request.use((config) => {
  if (_switchingLeague) return config
  const state = store?.getState()
  const league = state?.league?.currentLeague?._id || state?.user?.userDetails?.team?.currentLeague?._id
  const team = state?.user?.userDetails?.team?._id
  if (league) config.headers['x-league-id'] = league
  if (team) config.headers['x-team-id'] = team
  return config
})

privateAPI.interceptors.response.use(
  async (response) => {
    debouncedNotiCount()
    return response
  },
  (error) => {
    // Clear session on 401 (cookie expired or invalid)
    if (error?.response?.status === 401) {
      console.warn('[Auth] 401 received, cookie expired or invalid, clearing session')
      localStorage.removeItem('userName')
      localStorage.removeItem('userId')
    }
    // Ensure error.response.data.message is always a string so notification.error()
    // doesn't crash React by trying to render a Mongoose error object
    if (error?.response?.data?.message && typeof error.response.data.message !== 'string') {
      error.response.data.message = error.response.data.message?.message || 'Server Error'
    }
    return Promise.reject(error)
  },
)

privateDRAFTAPI.interceptors.response.use(
  async (response) => {
    debouncedNotiCount()
    return response
  },
  (error) => {
    // Clear session on 401 (cookie expired or invalid)
    if (error?.response?.status === 401) {
      console.warn('[Auth] 401 received, cookie expired or invalid, clearing session')
      localStorage.removeItem('userName')
      localStorage.removeItem('userId')
    }
    if (error?.response?.data?.message && typeof error.response.data.message !== 'string') {
      error.response.data.message = error.response.data.message?.message || 'Server Error'
    }
    return Promise.reject(error)
  },
)

export const isLocked = () => {
  const SETTING = store?.getState()?.user
  return SETTING?.setting?.week < SETTING?.currentWeek ? true : false
  // true is when we have selected current week
}

// export const version = '2.0.4'
export const version = '2.0.6'

export const activeRosterCount = 53
export const practiceRosterCount = 53
export const legalPlayers = 46
// export const legalPlayers = 53
export const proctectedSquadCount = 4
export const nonActivePlayers = 7

export const leagueSalaryCap = (() => { try { const s = JSON.parse(localStorage.getItem('samsports_cap_settings') || '{}'); return s.nflCeiling || 301200000; } catch { return 301200000; } })() // dynamic — editable from Admin Panel

// Trade Deadline System
export const TRADE_DEADLINE_WARNING_WEEK = 8  // Week 8: warning banner shown
export const TRADE_DEADLINE_LOCKOUT_WEEK = 9  // Week 9+: trades locked

export const isTradeDeadlinePassed = () => {
  const SETTING = store?.getState()?.user
  const currentWeek = SETTING?.currentWeek
  return currentWeek >= TRADE_DEADLINE_LOCKOUT_WEEK
}

export const isTradeDeadlineWarning = () => {
  const SETTING = store?.getState()?.user
  const currentWeek = SETTING?.currentWeek
  return currentWeek === TRADE_DEADLINE_WARNING_WEEK
}

export const landingSignup = () => window.open(frontEndUrl, '_self')

export const serverUrls = [
  {
    key: 'football',
    name: 'A.Football',
    url: base_url,
    frontEndUrl: 'https://samsports.io/homepage',
    disabled: false,
    image: football,
  },
  {
    key: 'hockey',
    name: 'Hockey',
    url: 'https://hockeybackend.samsports.io',
    frontEndUrl: 'https://hockey.samsports.io',
    disabled: false,
    image: hockey,
  },
  {
    key: 'baseball',
    name: 'Baseball',
    url: 'https://baseballbackend.samsports.io',
    frontEndUrl: 'https://baseball.samsports.io',
    disabled: false,
    image: baseball,
  },
  {
    key: 'eleven_fc',
    name: 'Eleven F.C',
    url: process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io',
    frontEndUrl: process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io',
    registerPath: '/api/v1/users/register', // Soccer backend uses a different route path
    disabled: false,
    image: soccer,
  },
  {
    key: 'college_football',
    name: 'College Football',
    url: 'https://collegefootballbackend.samsports.io',
    frontEndUrl: 'https://collegefootball.samsports.io',
    disabled: true,
  },
  {
    key: 'basketball',
    name: 'Basketball',
    url: 'https://basketballbackend.samsports.io',
    frontEndUrl: 'https://basketball.samsports.io',
    disabled: true,
  },
  {
    key: 'scouts',
    name: 'Scouting',
    url: 'https://scoutsbackend.samsports.io',
    frontEndUrl: 'https://scouts.samsports.io',
    disabled: true,
  },
]
export const positions = {
  DE: 'EDGE',
  DT: 'IDL',
  ILB: 'LB',
  OLB: 'EDGE',
  // OTC raw positions (from /contracts page before refinement)
  EDGE: 'EDGE',
  IDL: 'IDL',
  S: 'S',
  LB: 'LB',
  // OTC granular positions → display names
  LT: 'LT',
  LG: 'LG',
  RG: 'RG',
  RT: 'RT',
  C: 'C',
  FS: 'FS',
  SS: 'SS',
  LS: 'LS',
  FB: 'FB',
}

/**
 * Position group expansion map, maps filter buttons to all sub-positions
 * Used when a filter key like "OL" needs to match C, LG, RG, LT, RT, etc.
 */
export const POSITION_GROUPS = {
  OL: ['OL', 'C', 'LG', 'RG', 'LT', 'RT', 'G', 'T', 'OT', 'OG', 'OC', 'IOL'],
  LB: ['LB', 'ILB', 'OLB', 'MLB', 'LOLB', 'ROLB', 'LILB', 'RILB', 'WLB', 'SLB'],
  DL: ['DL', 'DE', 'DT', 'LE', 'RE', 'EDGE', 'NT', 'IDL'],
  DE: ['DE', 'LE', 'RE', 'EDGE', 'LOLB', 'ROLB'],
  DT: ['DT', 'NT', 'IDL', 'DL'],
  S: ['S', 'SS', 'FS'],
  CB: ['CB', 'SCB', 'NCB'],
  DB: ['DB', 'CB', 'SCB', 'NCB', 'S', 'SS', 'FS'],
  DEF: ['DEF', 'DEFENSE'],
  'K/P': ['K', 'P', 'LS', 'K/P'],
}

/**
 * Check if a player's position matches the selected filter key
 * @param {string} playerPos - The player's stored position (e.g. "LT", "C", "SS")
 * @param {string} filterKey - The filter button key (e.g. "OL", "LB", "K/P")
 * @returns {boolean}
 */
export const matchesPositionFilter = (playerPos, filterKey) => {
  if (!filterKey || filterKey === 'ALL') return true
  if (!playerPos) return false
  const upper = playerPos.toUpperCase().trim()
  const group = POSITION_GROUPS[filterKey]
  if (group) return group.includes(upper)
  return upper === filterKey.toUpperCase()
}
