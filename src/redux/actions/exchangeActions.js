import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import { soccerAPI, attachSoccerToken } from '../../soccer/config/constants'

// ═══════════════════════════════════════════════════════════════
//  EXCHANGE ACTIONS, The Exchange Trading Floor (Multi-Sport)
// ═══════════════════════════════════════════════════════════════

// ── Action Types ─────────────────────────────────────────────
export const EXCHANGE_TYPES = {
  SET_LISTINGS: 'EXCHANGE_SET_LISTINGS',
  SET_LISTINGS_LOADING: 'EXCHANGE_SET_LISTINGS_LOADING',
  SET_MY_LISTINGS: 'EXCHANGE_SET_MY_LISTINGS',
  SET_MY_OFFERS: 'EXCHANGE_SET_MY_OFFERS',
  SET_RECEIVED_OFFERS: 'EXCHANGE_SET_RECEIVED_OFFERS',
  SET_STATS: 'EXCHANGE_SET_STATS',
  SET_CONVERSATIONS: 'EXCHANGE_SET_CONVERSATIONS',
  SET_ACTIVE_CONVERSATION: 'EXCHANGE_SET_ACTIVE_CONVERSATION',
  SET_HISTORY: 'EXCHANGE_SET_HISTORY',
  CLEAR_EXCHANGE: 'EXCHANGE_CLEAR',
  // Empire Sale
  SET_EMPIRE_LISTINGS: 'EXCHANGE_SET_EMPIRE_LISTINGS',
  SET_EMPIRE_LISTINGS_LOADING: 'EXCHANGE_SET_EMPIRE_LISTINGS_LOADING',
  SET_MY_EMPIRE_SALE: 'EXCHANGE_SET_MY_EMPIRE_SALE',
  SET_MY_TEAMS_FOR_SALE: 'EXCHANGE_SET_MY_TEAMS_FOR_SALE',
}

// ── Sport-Aware API Helper ───────────────────────────────────
// Returns the correct axios instance + token attach based on sport
const getAPI = (sport) => {
  if (sport === 'soccer') {
    attachSoccerToken()
    return soccerAPI
  }
  attachToken()
  return privateAPI
}

// For routes that include /api/v1 prefix on soccer but not on NFL
const exchangePath = (sport, path) => {
  if (sport === 'soccer') return `/api/v1/exchange${path}`
  return `/exchange${path}`
}

// Fetches from both backends and merges results (for browse endpoints)
const fetchBothBackends = async (path, params = {}) => {
  const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : ''

  const results = await Promise.allSettled([
    (() => {
      attachToken()
      return privateAPI.get(`/exchange${path}${query}`)
    })(),
    (() => {
      attachSoccerToken()
      return soccerAPI.get(`/api/v1/exchange${path}${query}`)
    })(),
  ])

  const nflData = results[0].status === 'fulfilled' ? results[0].value?.data?.data : null
  const soccerData = results[1].status === 'fulfilled' ? results[1].value?.data?.data : null

  return { nflData, soccerData }
}

// ═══════════════════════════════════════════════════════════════
//  LISTINGS
// ═══════════════════════════════════════════════════════════════

/**
 * Browse active listings from ALL backends
 * @param {Object} params - { sport, sort, page, limit }
 */
export const getExchangeListings = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: EXCHANGE_TYPES.SET_LISTINGS_LOADING, payload: true })

    const { nflData, soccerData } = await fetchBothBackends('/listings', params)

    // Merge and tag with sport for frontend filtering
    const nflListings = Array.isArray(nflData)
      ? nflData.map((l) => ({ ...l, _sport: l.teamSnapshot?.sport || 'nfl' }))
      : []
    const soccerListings = Array.isArray(soccerData)
      ? soccerData.map((l) => ({ ...l, _sport: l.teamSnapshot?.sport || 'soccer' }))
      : []

    const merged = [...nflListings, ...soccerListings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    dispatch({ type: EXCHANGE_TYPES.SET_LISTINGS, payload: merged })
    return merged
  } catch (err) {
    console.error('Exchange listings error:', err)
    notification.error({
      message: 'Failed to load Exchange listings',
      duration: 3,
    })
  } finally {
    dispatch({ type: EXCHANGE_TYPES.SET_LISTINGS_LOADING, payload: false })
  }
}

/**
 * Get single listing detail
 * @param {string} listingId
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const getListingDetail = async (listingId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.get(exchangePath(sport, `/listings/${listingId}`))
    return res?.data?.data
  } catch (err) {
    console.error('Listing detail error:', err)
    return null
  }
}

/**
 * Create a new listing (put franchise On the Block)
 * @param {Object} payload - { teamId, askingPrice, ... }
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const createExchangeListing = async (payload, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/list'), payload)
    if (res?.data?.success) {
      notification.success({
        message: 'Franchise listed on The Exchange!',
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to list franchise',
      duration: 3,
    })
    return null
  }
}

/**
 * Delist a franchise
 * @param {string} listingId
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const delistFranchise = async (listingId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.delete(exchangePath(sport, `/delist/${listingId}`))
    if (res?.data?.success) {
      notification.success({
        message: 'Franchise removed from The Exchange',
        duration: 3,
      })
      return true
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to delist',
      duration: 3,
    })
    return false
  }
}

/**
 * Get seller's own listings from ALL backends
 */
export const getMyListings = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/my-listings')

    const nflListings = Array.isArray(nflData)
      ? nflData.map((l) => ({ ...l, _sport: l.teamSnapshot?.sport || 'nfl' }))
      : []
    const soccerListings = Array.isArray(soccerData)
      ? soccerData.map((l) => ({ ...l, _sport: l.teamSnapshot?.sport || 'soccer' }))
      : []

    dispatch({ type: EXCHANGE_TYPES.SET_MY_LISTINGS, payload: [...nflListings, ...soccerListings] })
  } catch (err) {
    console.error('My listings error:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
//  OFFERS
// ═══════════════════════════════════════════════════════════════

/**
 * Make an offer on a listing
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const makeOffer = async ({ listingId, amount, message, sport = 'nfl' }) => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/offer'), { listingId, amount, message })
    if (res?.data?.success) {
      notification.success({
        message: `Offer of ${amount.toLocaleString()} SP submitted!`,
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to submit offer',
      duration: 3,
    })
    return null
  }
}

/**
 * Get buyer's sent offers from ALL backends
 */
export const getMyOffers = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/my-offers')

    const nfl = Array.isArray(nflData) ? nflData.map((o) => ({ ...o, _sport: 'nfl' })) : []
    const soccer = Array.isArray(soccerData) ? soccerData.map((o) => ({ ...o, _sport: 'soccer' })) : []

    dispatch({ type: EXCHANGE_TYPES.SET_MY_OFFERS, payload: [...nfl, ...soccer] })
  } catch (err) {
    console.error('My offers error:', err)
  }
}

/**
 * Get seller's received offers from ALL backends
 */
export const getReceivedOffers = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/received-offers')

    const nfl = Array.isArray(nflData) ? nflData.map((o) => ({ ...o, _sport: 'nfl' })) : []
    const soccer = Array.isArray(soccerData) ? soccerData.map((o) => ({ ...o, _sport: 'soccer' })) : []

    dispatch({ type: EXCHANGE_TYPES.SET_RECEIVED_OFFERS, payload: [...nfl, ...soccer] })
  } catch (err) {
    console.error('Received offers error:', err)
  }
}

/**
 * Accept an offer (seller action, triggers ownership transfer)
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const acceptOffer = async (offerId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/accept`))
    if (res?.data?.success) {
      notification.success({
        message: 'Offer accepted! Franchise sold.',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to accept offer',
      duration: 3,
    })
    return null
  }
}

/**
 * Reject an offer
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const rejectOffer = async (offerId, response = '', sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/reject`), { response })
    if (res?.data?.success) {
      notification.info({ message: 'Offer rejected', duration: 3 })
      return true
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to reject offer',
      duration: 3,
    })
    return false
  }
}

/**
 * Withdraw own offer
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const withdrawOffer = async (offerId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/withdraw`))
    if (res?.data?.success) {
      notification.info({ message: 'Offer withdrawn', duration: 3 })
      return true
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to withdraw offer',
      duration: 3,
    })
    return false
  }
}

// ═══════════════════════════════════════════════════════════════
//  COUNTER-OFFERS
// ═══════════════════════════════════════════════════════════════

export const sendCounterOffer = async ({ offerId, counterAmount, counterMessage, sport = 'nfl' }) => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/counter`), { counterAmount, counterMessage })
    if (res?.data?.success) {
      notification.success({ message: `Counter-offer of ${counterAmount.toLocaleString()} SP sent!`, duration: 3 })
      return res.data.data
    }
  } catch (err) {
    notification.error({ message: err?.response?.data?.message || 'Failed to send counter-offer', duration: 3 })
    return null
  }
}

export const acceptCounterOffer = async (offerId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/accept-counter`))
    if (res?.data?.success) {
      notification.success({ message: 'Counter-offer accepted!', duration: 3 })
      return res.data.data
    }
  } catch (err) {
    notification.error({ message: err?.response?.data?.message || 'Failed to accept counter', duration: 3 })
    return null
  }
}

export const rejectCounterOffer = async (offerId, message = '', sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/reject-counter`), { message })
    if (res?.data?.success) {
      notification.info({ message: 'Counter-offer rejected', duration: 3 })
      return true
    }
  } catch (err) {
    notification.error({ message: err?.response?.data?.message || 'Failed to reject counter', duration: 3 })
    return false
  }
}

export const sendBuyerCounter = async ({ offerId, counterAmount, counterMessage, sport = 'nfl' }) => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/offer/${offerId}/buyer-counter`), { counterAmount, counterMessage })
    if (res?.data?.success) {
      notification.success({ message: `New offer of ${counterAmount.toLocaleString()} SP sent!`, duration: 3 })
      return res.data.data
    }
  } catch (err) {
    notification.error({ message: err?.response?.data?.message || 'Failed to send counter', duration: 3 })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  BUY NOW
// ═══════════════════════════════════════════════════════════════

/**
 * Acquire franchise at asking price
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const buyNowFranchise = async (listingId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/buy-now'), { listingId })
    if (res?.data?.success) {
      notification.success({
        message: 'Franchise Acquired!',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Acquisition failed',
      duration: 3,
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════════════════════

/**
 * Get Exchange KPI data, merges stats from both backends
 */
export const getExchangeStats = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/stats')

    // Merge stats: sum numeric KPIs
    const mergedStats = {
      activeListings: (nflData?.activeListings || 0) + (soccerData?.activeListings || 0),
      totalFloorValue: (nflData?.totalFloorValue || 0) + (soccerData?.totalFloorValue || 0),
      avgAskingPrice: (() => {
        const nflCount = nflData?.activeListings || 0
        const soccerCount = soccerData?.activeListings || 0
        const total = nflCount + soccerCount
        if (!total) return 0
        return Math.round(
          ((nflData?.avgAskingPrice || 0) * nflCount +
            (soccerData?.avgAskingPrice || 0) * soccerCount) /
            total
        )
      })(),
      myActiveOffers: (nflData?.myActiveOffers || 0) + (soccerData?.myActiveOffers || 0),
      mySPBalance: nflData?.mySPBalance || soccerData?.mySPBalance || 0,
    }

    dispatch({ type: EXCHANGE_TYPES.SET_STATS, payload: mergedStats })
    return mergedStats
  } catch (err) {
    console.error('Exchange stats error:', err)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  DMs
// ═══════════════════════════════════════════════════════════════

/**
 * Get all DM conversations from ALL backends
 */
export const getExchangeConversations = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/dm')

    const nfl = Array.isArray(nflData) ? nflData.map((c) => ({ ...c, _sport: 'nfl' })) : []
    const soccer = Array.isArray(soccerData) ? soccerData.map((c) => ({ ...c, _sport: 'soccer' })) : []

    dispatch({ type: EXCHANGE_TYPES.SET_CONVERSATIONS, payload: [...nfl, ...soccer] })
  } catch (err) {
    console.error('Exchange DM error:', err)
  }
}

/**
 * Send a DM
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const sendExchangeDm = async ({ recipientId, text, listingId, sport = 'nfl' }) => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/dm/send'), { recipientId, text, listingId })
    return res?.data?.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to send message',
      duration: 3,
    })
    return null
  }
}

/**
 * Mark conversation as read
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const markDmRead = async (conversationId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    await api.post(exchangePath(sport, `/dm/${conversationId}/read`))
  } catch (err) {
    console.error('Mark read error:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Get user's exchange transaction history from ALL backends
 */
export const getExchangeHistory = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/history')

    const nfl = Array.isArray(nflData) ? nflData.map((h) => ({ ...h, _sport: 'nfl' })) : []
    const soccer = Array.isArray(soccerData) ? soccerData.map((h) => ({ ...h, _sport: 'soccer' })) : []

    const merged = [...nfl, ...soccer].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    dispatch({ type: EXCHANGE_TYPES.SET_HISTORY, payload: merged })
  } catch (err) {
    console.error('Exchange history error:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
//  TEAM VALUATION
// ═══════════════════════════════════════════════════════════════

/**
 * Get team valuation breakdown
 * @param {string} teamId
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const getTeamValue = async (teamId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.get(exchangePath(sport, `/team-value/${teamId}`))
    return res?.data?.data
  } catch (err) {
    console.error('Team value error:', err)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  EMPIRE SALE
// ═══════════════════════════════════════════════════════════════

/**
 * Get seller's teams for empire sale setup, from ALL backends
 */
export const getMyTeamsForSale = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/empire/my-teams')

    const nfl = Array.isArray(nflData) ? nflData.map((t) => ({ ...t, _sport: 'nfl' })) : []
    const soccer = Array.isArray(soccerData) ? soccerData.map((t) => ({ ...t, _sport: 'soccer' })) : []

    const merged = [...nfl, ...soccer]
    dispatch({ type: EXCHANGE_TYPES.SET_MY_TEAMS_FOR_SALE, payload: merged })
    return merged
  } catch (err) {
    console.error('My teams for sale error:', err)
    return null
  }
}

/**
 * Create empire sale (bundle or individual)
 * @param {Object} payload - { saleMode, askingPrice?, teamStats? }
 * @param {string} sport - 'nfl' | 'soccer' | 'all' (for cross-sport empire)
 */
export const createEmpireSale = async (payload, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/empire/create'), payload)
    if (res?.data?.success) {
      notification.success({
        message: 'Empire Listed on The Exchange!',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to list empire',
      duration: 3,
    })
    return null
  }
}

/**
 * Browse empire bundle listings from ALL backends
 */
export const getEmpireListings = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: EXCHANGE_TYPES.SET_EMPIRE_LISTINGS_LOADING, payload: true })

    const { nflData, soccerData } = await fetchBothBackends('/empire/listings', params)

    const nfl = Array.isArray(nflData) ? nflData.map((e) => ({ ...e, _sport: 'nfl' })) : []
    const soccer = Array.isArray(soccerData) ? soccerData.map((e) => ({ ...e, _sport: 'soccer' })) : []

    const merged = [...nfl, ...soccer].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    dispatch({ type: EXCHANGE_TYPES.SET_EMPIRE_LISTINGS, payload: merged })
    return merged
  } catch (err) {
    console.error('Empire listings error:', err)
  } finally {
    dispatch({ type: EXCHANGE_TYPES.SET_EMPIRE_LISTINGS_LOADING, payload: false })
  }
}

/**
 * Get single empire sale detail
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const getEmpireSaleDetail = async (empireSaleId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.get(exchangePath(sport, `/empire/${empireSaleId}`))
    return res?.data?.data
  } catch (err) {
    console.error('Empire sale detail error:', err)
    return null
  }
}

/**
 * Buy entire empire bundle
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const buyEmpireBundle = async (empireSaleId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/empire/buy-bundle'), { empireSaleId })
    if (res?.data?.success) {
      notification.success({
        message: 'Empire Acquired!',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Empire acquisition failed',
      duration: 3,
    })
    return null
  }
}

/**
 * Make offer on empire bundle
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const makeEmpireOffer = async ({ empireSaleId, amount, message, sport = 'nfl' }) => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/empire/offer'), { empireSaleId, amount, message })
    if (res?.data?.success) {
      notification.success({
        message: `Empire offer of ${amount.toLocaleString()} SP submitted!`,
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to submit empire offer',
      duration: 3,
    })
    return null
  }
}

/**
 * Accept empire offer (seller action)
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const acceptEmpireOffer = async (offerId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, `/empire/offer/${offerId}/accept`))
    if (res?.data?.success) {
      notification.success({
        message: 'Empire Sold!',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to accept empire offer',
      duration: 3,
    })
    return null
  }
}

/**
 * Delist empire sale
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const delistEmpireSale = async (empireSaleId, sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.delete(exchangePath(sport, `/empire/delist/${empireSaleId}`))
    if (res?.data?.success) {
      notification.success({
        message: 'Empire sale removed from The Exchange',
        duration: 3,
      })
      return true
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to delist empire',
      duration: 3,
    })
    return false
  }
}

/**
 * Get seller's active empire sale from ALL backends
 */
export const getMyEmpireSale = () => async (dispatch) => {
  try {
    const { nflData, soccerData } = await fetchBothBackends('/empire/my-sale')

    // Return whichever has an active sale (a user can only have one active empire sale)
    const activeSale = nflData || soccerData || null
    if (activeSale && !activeSale._sport) {
      activeSale._sport = nflData ? 'nfl' : 'soccer'
    }

    dispatch({ type: EXCHANGE_TYPES.SET_MY_EMPIRE_SALE, payload: activeSale })
    return activeSale
  } catch (err) {
    console.error('My empire sale error:', err)
    return null
  }
}

/**
 * Reactivate dormant account
 * @param {string} sport - 'nfl' | 'soccer'
 */
export const reactivateAccount = async (sport = 'nfl') => {
  try {
    const api = getAPI(sport)
    const res = await api.post(exchangePath(sport, '/empire/reactivate'))
    if (res?.data?.success) {
      notification.success({
        message: 'Account Reactivated!',
        description: 'Welcome back to the game.',
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to reactivate account',
      duration: 3,
    })
    return null
  }
}
