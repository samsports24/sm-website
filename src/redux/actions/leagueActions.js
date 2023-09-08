import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getProfessionalLeagueRanks = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/ranking/professionalStats')
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

export const getLeagueStandings = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/ranking/get-league-standings')
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

export const getScheduleByWeek = async (week) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/schedule/get-schedule/${week}`)
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

export const getGameDetails = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/schedule/get-game-details`, payload)
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
