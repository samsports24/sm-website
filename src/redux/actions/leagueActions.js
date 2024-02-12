import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'

export const getProfessionalLeagueRanks = async (week) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/ranking/professionalStats/${week}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const createNewLeague = async (payload) => {
  try {
    const res = await publicAPI.post(`/league/create` , payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      let game = localStorage.getItem("selectedGame")
      let link = serverUrls.find(item => item.key === game)
      window.open(`${link.frontEndUrl}/login`, '_self', 'noreferrer')
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getLeagueStandings = async (week) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/ranking/get-league-standings/${week}`)
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
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getWeeklyNflSchedule = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/schedule/get-weekly-nfl-schedule`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.log('err', err)
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

export const getPlayerStandings = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/player/get-standings`, payload)
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

export const getTeamFinancials = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/ranking/get-team-financials`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getPlayerForWeeklyScoring = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/player/get-all-players`,payload)
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
