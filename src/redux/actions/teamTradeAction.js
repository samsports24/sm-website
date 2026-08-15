import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getOtherTeamTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/team/get-team-data`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const createTeamTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/create`, payload)
    if (res) {
      return res.data.data.message
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/get`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const updateCounterTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/counter`, payload)
    if (res) {
      return res.data.data.message
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const cancelTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/deny`, payload)
    if (res) {
      return res.data.data.message
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const approveTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/approve`, payload)
    if (res) {
      return res.data.data.message
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const payTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/pay`, payload)
    if (res) {
      return res.data.data.message
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const analyzeTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/analyze`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const initializeDraftPicks = async () => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/draft-picks/initialize`, {})
    if (res) {
      return res.data.data
    }
  } catch (err) {
    // Silent fail, picks may already be initialized
    console.error('Draft pick init:', err?.response?.data?.message || err.message)
  }
}

export const getCommissionerPendingTrades = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/trade/commissioner-pending`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const approveTradeAdmin = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/approve-admin`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const vetoTradeAdmin = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/veto`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getPendingTrade = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/trade/get-team-trade`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// ── League Trade Feed (recent completed public trades) ──
export const getLeagueTradeFeed = async (leagueId) => {
  try {
    if (!leagueId) return null
    attachToken()
    const res = await privateAPI.get(`/trade/league-feed/${leagueId}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.error('League trade feed:', err?.response?.data?.message || err.message)
  }
}

// ── Trade Block ──
export const getLeagueTradeBlock = async (leagueId) => {
  try {
    if (!leagueId) return null
    attachToken()
    const res = await privateAPI.get(`/trade/block/${leagueId}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.error('League trade block:', err?.response?.data?.message || err.message)
  }
}

export const toggleTradeBlock = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/trade/block/toggle`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// ── Trade Settings (per-user preferences) ──
export const getTradeSettings = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/trade/settings`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.error('Trade settings:', err?.response?.data?.message || err.message)
  }
}

export const updateTradeSettings = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.put(`/trade/settings`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// ── Trade Deadline (commissioner-only set/clear) ──
// payload: { leagueId, tradeDeadline }  (tradeDeadline = ISO string or null)
export const setTradeDeadline = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.put(`/trade/deadline`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// ── Trade window helper (shared by NewTrade + PendingTrade) ──
// Mirrors the server guard: explicit calendar deadline wins, else Week 8.
export const DEFAULT_TRADE_DEADLINE_WEEK = 8

export const computeTradeWindow = (league, currentWeek) => {
  const raw = league?.tradeDeadline ? new Date(league.tradeDeadline) : null
  if (raw && !Number.isNaN(raw.getTime())) {
    return {
      open: Date.now() <= raw.getTime(),
      deadline: raw,
      label: raw.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  }
  const wk = Number(currentWeek)
  return {
    open: Number.isNaN(wk) ? true : wk <= DEFAULT_TRADE_DEADLINE_WEEK,
    deadline: null,
    label: `Week ${DEFAULT_TRADE_DEADLINE_WEEK}`,
  }
}
