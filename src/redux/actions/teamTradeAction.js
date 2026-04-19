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
