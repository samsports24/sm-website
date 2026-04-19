import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import store from '../store'

// ── Action type helpers ─────────────────────────────────────
export const setPostseasonLoading = (payload) => ({
  type: 'SET_POSTSEASON_LOADING',
  payload,
})

export const setPostseasonState = (payload) => ({
  type: 'SET_POSTSEASON_STATE',
  payload,
})

export const setSupplementalPool = (payload) => ({
  type: 'SET_SUPPLEMENTAL_POOL',
  payload,
})

export const setDraftOrder = (payload) => ({
  type: 'SET_SUPPLEMENTAL_DRAFT_ORDER',
  payload,
})

export const setRosterTags = (payload) => ({
  type: 'SET_ROSTER_TAGS',
  payload,
})

export const setPoolSearch = (payload) => ({
  type: 'SET_POOL_SEARCH',
  payload,
})

export const setPoolPosition = (payload) => ({
  type: 'SET_POOL_POSITION',
  payload,
})

export const setPoolPage = (payload) => ({
  type: 'SET_POOL_PAGE',
  payload,
})

// ═══════════════════════════════════════════════════════════════
//  GET POSTSEASON STATE
// ═══════════════════════════════════════════════════════════════
export const getPostseasonState = async () => {
  try {
    await attachToken()
    store.dispatch(setPostseasonLoading(true))
    const res = await privateAPI.get('/postseason/state')
    store.dispatch(setPostseasonState(res.data.data))
    store.dispatch(setPostseasonLoading(false))
    return res.data.data
  } catch (error) {
    store.dispatch(setPostseasonLoading(false))
    notification.error({ message: error?.response?.data?.message || 'Failed to load postseason' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  INITIALIZE POSTSEASON
// ═══════════════════════════════════════════════════════════════
export const initializePostseason = async () => {
  try {
    await attachToken()
    store.dispatch(setPostseasonLoading(true))
    const res = await privateAPI.post('/postseason/initialize')
    store.dispatch(setPostseasonState(res.data.data))
    store.dispatch(setPostseasonLoading(false))
    notification.success({ message: 'Postseason initialized! 14 teams seeded.' })
    return res.data.data
  } catch (error) {
    store.dispatch(setPostseasonLoading(false))
    notification.error({ message: error?.response?.data?.message || 'Failed to initialize' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  RECORD MATCHUP RESULT
// ═══════════════════════════════════════════════════════════════
export const recordMatchupResult = async (payload) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/record-result', payload)
    store.dispatch(setPostseasonState(res.data.data))
    notification.success({ message: 'Result recorded!' })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to record result' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  GENERATE DIVISIONAL MATCHUPS (re-seeding)
// ═══════════════════════════════════════════════════════════════
export const generateDivisionalMatchups = async () => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/generate-divisional')
    store.dispatch(setPostseasonState(res.data.data))
    notification.success({ message: 'Divisional matchups generated with re-seeding!' })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to generate matchups' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  ADD ELIMINATED NFL TEAMS
// ═══════════════════════════════════════════════════════════════
export const addEliminatedNflTeams = async (nflTeams) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/add-eliminated-nfl', { nflTeams })
    // Refresh state
    await getPostseasonState()
    notification.success({ message: `${nflTeams.length} NFL team(s) marked as eliminated` })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to update' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  SANITIZE ROSTERS (Tuesday wipe)
// ═══════════════════════════════════════════════════════════════
export const sanitizeRosters = async (eliminatedNflTeams) => {
  try {
    await attachToken()
    store.dispatch(setPostseasonLoading(true))
    const res = await privateAPI.post('/postseason/sanitize-rosters', { eliminatedNflTeams })
    store.dispatch(setPostseasonLoading(false))
    const data = res.data.data
    notification.success({
      message: `Rosters sanitized! ${data.sanitizedCount} players moved to pool.`,
    })
    return data
  } catch (error) {
    store.dispatch(setPostseasonLoading(false))
    notification.error({ message: error?.response?.data?.message || 'Sanitization failed' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  LIQUIDATE ROSTER (eliminated fantasy team)
// ═══════════════════════════════════════════════════════════════
export const liquidateRoster = async (teamId) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/liquidate-roster', { teamId })
    notification.success({ message: `Roster liquidated: ${res.data.data.liquidatedCount} players to pool` })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Liquidation failed' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET SUPPLEMENTAL POOL
// ═══════════════════════════════════════════════════════════════
export const getSupplementalPool = async (params = {}) => {
  try {
    await attachToken()
    const { position, search, page, limit } = params
    const query = new URLSearchParams()
    if (position) query.append('position', position)
    if (search) query.append('search', search)
    if (page) query.append('page', page)
    if (limit) query.append('limit', limit)

    const res = await privateAPI.get(`/postseason/supplemental-pool?${query.toString()}`)
    store.dispatch(setSupplementalPool(res.data.data))
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to load pool' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  BUILD DRAFT ORDER
// ═══════════════════════════════════════════════════════════════
export const buildDraftOrder = async (week, rounds = 5) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/build-draft-order', { week, rounds })
    store.dispatch(setDraftOrder(res.data.data))
    notification.success({ message: 'Supplemental draft order built!' })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to build order' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET DRAFT ORDER
// ═══════════════════════════════════════════════════════════════
export const getDraftOrder = async (week) => {
  try {
    await attachToken()
    const res = await privateAPI.get(`/postseason/draft-order?week=${week}`)
    store.dispatch(setDraftOrder(res.data.data))
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to load order' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  MAKE SUPPLEMENTAL PICK
// ═══════════════════════════════════════════════════════════════
export const makeSupplementalPick = async (playerId, week) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/make-pick', { playerId, week })
    store.dispatch(setDraftOrder(res.data.data.draftOrder))
    notification.success({ message: 'Pick submitted!' })
    // Refresh pool
    await getSupplementalPool()
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Pick failed' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  TOGGLE DRAFT LIVE
// ═══════════════════════════════════════════════════════════════
export const toggleDraftLive = async (week, isLive) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/toggle-draft-live', { week, isLive })
    store.dispatch(setDraftOrder(res.data.data))
    notification.success({ message: isLive ? 'Supplemental draft is LIVE!' : 'Draft paused' })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET ROSTER TAGS (Gold/Blue/Eliminated)
// ═══════════════════════════════════════════════════════════════
export const getRosterTags = async (teamId) => {
  try {
    await attachToken()
    const query = teamId ? `?teamId=${teamId}` : ''
    const res = await privateAPI.get(`/postseason/roster-tags${query}`)
    store.dispatch(setRosterTags(res.data.data))
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to load tags' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  ADVANCE WEEK
// ═══════════════════════════════════════════════════════════════
export const advanceWeek = async (nextWeek) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/advance-week', { nextWeek })
    store.dispatch(setPostseasonState(res.data.data))
    notification.success({ message: `Advanced to Week ${nextWeek}` })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to advance' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  AUTODRAFT TOGGLE
// ═══════════════════════════════════════════════════════════════
export const toggleAutoDraft = async (enabled, week) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/toggle-autodraft', { enabled, week })
    notification.success({ message: enabled ? 'Autodraft ON, picks in 5s' : 'Autodraft OFF' })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to toggle autodraft' })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  DRAFT QUEUE
// ═══════════════════════════════════════════════════════════════
export const setDraftQueue = (payload) => ({
  type: 'SET_SUPPLEMENTAL_DRAFT_QUEUE',
  payload,
})

export const getDraftQueue = async () => {
  try {
    await attachToken()
    const res = await privateAPI.get('/postseason/draft-queue')
    store.dispatch(setDraftQueue(res.data.data))
    return res.data.data
  } catch (error) {
    return null
  }
}

export const addToQueue = async (playerId) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/draft-queue/add', { playerId })
    // Refresh queue
    await getDraftQueue()
    notification.success({ message: 'Added to pre-pick queue' })
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to add to queue' })
    return null
  }
}

export const removeFromQueue = async (playerId) => {
  try {
    await attachToken()
    await privateAPI.post('/postseason/draft-queue/remove', { playerId })
    await getDraftQueue()
    notification.success({ message: 'Removed from queue' })
    return true
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to remove' })
    return null
  }
}

export const reorderQueue = async (playerIds) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/postseason/draft-queue/reorder', { playerIds })
    store.dispatch(setDraftQueue(res.data.data))
    return res.data.data
  } catch (error) {
    notification.error({ message: error?.response?.data?.message || 'Failed to reorder' })
    return null
  }
}
