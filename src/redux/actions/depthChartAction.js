import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getActiveRosterCount = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/depthChart/get-active-roster-count/${payload.week}`)
    if (res) {
      const depthChart = (await getDepthChartByType(payload)) || []
      return { count: res.data.data?.activePlayers, data: depthChart }
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getDepthChartByType = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/depthChart/get-players-by-type', payload)
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

export const getPlayersByPosition = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/depthChart/get-players-by-position', payload)
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

export const assignPlayerToStarter = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/depthChart/assign-player-to-starter', payload)
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

export const removePlayerFromStarter = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.post('/depthChart/remove-player-from-starter', { id })
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
