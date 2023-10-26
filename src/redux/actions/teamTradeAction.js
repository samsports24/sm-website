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
