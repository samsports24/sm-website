import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import store from '../store'

// ── Action Types ────────────────────────────────────────────
export const SET_ROOKIE_DRAFT_LOADING = 'SET_ROOKIE_DRAFT_LOADING'
export const SET_ROOKIE_DRAFT_ORDER = 'SET_ROOKIE_DRAFT_ORDER'
export const SET_ROOKIE_POOL = 'SET_ROOKIE_POOL'
export const SET_ROOKIE_DRAFT_QUEUE = 'SET_ROOKIE_DRAFT_QUEUE'

export const setRookieDraftLoading = (payload) => ({
  type: SET_ROOKIE_DRAFT_LOADING,
  payload,
})

export const setRookieDraftOrder = (payload) => ({
  type: SET_ROOKIE_DRAFT_ORDER,
  payload,
})

export const setRookiePool = (payload) => ({
  type: SET_ROOKIE_POOL,
  payload,
})

export const setRookieDraftQueue = (payload) => ({
  type: SET_ROOKIE_DRAFT_QUEUE,
  payload,
})

// ═══════════════════════════════════════════════════════════════
//  GET ROOKIE DRAFT ORDER
// ═══════════════════════════════════════════════════════════════
export const getRookieDraftOrder = async () => {
  try {
    await attachToken()
    store.dispatch(setRookieDraftLoading(true))
    const res = await privateAPI.get('/rookie-draft/order')
    store.dispatch(setRookieDraftOrder(res.data.data))
    store.dispatch(setRookieDraftLoading(false))
    return res.data.data
  } catch (error) {
    store.dispatch(setRookieDraftLoading(false))
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  BUILD ROOKIE DRAFT ORDER
// ═══════════════════════════════════════════════════════════════
export const buildRookieDraftOrder = async (rounds = 7) => {
  try {
    await attachToken()
    store.dispatch(setRookieDraftLoading(true))
    const res = await privateAPI.post('/rookie-draft/build-order', { rounds })
    store.dispatch(setRookieDraftOrder(res.data.data))
    store.dispatch(setRookieDraftLoading(false))
    notification.success({ message: 'Rookie draft order generated!' })
    return res.data.data
  } catch (error) {
    store.dispatch(setRookieDraftLoading(false))
    notification.error({
      message: error?.response?.data?.message || 'Failed to build draft order',
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET ROOKIE POOL
// ═══════════════════════════════════════════════════════════════
export const getRookiePool = async (params = {}) => {
  try {
    await attachToken()
    const res = await privateAPI.get('/rookie-draft/pool', { params })
    store.dispatch(setRookiePool(res.data.data))
    return res.data.data
  } catch (error) {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  MAKE ROOKIE PICK
// ═══════════════════════════════════════════════════════════════
export const makeRookiePick = async (playerId) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/rookie-draft/make-pick', { playerId })
    notification.success({ message: 'Pick made!' })
    return res.data.data
  } catch (error) {
    notification.error({
      message: error?.response?.data?.message || 'Failed to make pick',
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  TOGGLE DRAFT LIVE / PAUSE
// ═══════════════════════════════════════════════════════════════
export const toggleRookieDraftLive = async (isLive) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/rookie-draft/toggle-live', { isLive })
    store.dispatch(setRookieDraftOrder(res.data.data))
    return res.data.data
  } catch (error) {
    notification.error({
      message: error?.response?.data?.message || 'Failed to toggle draft',
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  TOGGLE AUTODRAFT
// ═══════════════════════════════════════════════════════════════
export const toggleRookieAutoDraft = async (autoDraft) => {
  try {
    await attachToken()
    await privateAPI.post('/rookie-draft/toggle-autodraft', { autoDraft })
    return true
  } catch (error) {
    notification.error({
      message: error?.response?.data?.message || 'Failed to toggle autodraft',
    })
    return false
  }
}

// ═══════════════════════════════════════════════════════════════
//  DRAFT QUEUE
// ═══════════════════════════════════════════════════════════════
export const getRookieDraftQueue = async () => {
  try {
    await attachToken()
    const res = await privateAPI.get('/rookie-draft/queue')
    store.dispatch(setRookieDraftQueue(res.data.data))
    return res.data.data
  } catch (error) {
    return null
  }
}

export const addToRookieQueue = async (playerId) => {
  try {
    await attachToken()
    await privateAPI.post('/rookie-draft/queue/add', { playerId })
    await getRookieDraftQueue()
    return true
  } catch (error) {
    notification.error({
      message: error?.response?.data?.message || 'Failed to add to queue',
    })
    return false
  }
}

export const removeFromRookieQueue = async (playerId) => {
  try {
    await attachToken()
    await privateAPI.post('/rookie-draft/queue/remove', { playerId })
    await getRookieDraftQueue()
    return true
  } catch (error) {
    return false
  }
}

export const reorderRookieQueue = async (playerIds) => {
  try {
    await attachToken()
    const res = await privateAPI.post('/rookie-draft/queue/reorder', { playerIds })
    store.dispatch(setRookieDraftQueue(res.data.data))
    return true
  } catch (error) {
    return false
  }
}
