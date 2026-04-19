import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import { getLeagueDetails } from './leagueActions'

export const getAllTeam = async (payload) => {

  try {
    attachToken()
    // const res = await privateAPI.get(`/team/get-all`,payload)
    const res = await privateAPI.get('/team/get-all', {
      params: payload
    });
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

export const getTeamByPlayerName = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/team/league-roster-player-search`, payload)
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

export const getTeamSchedule = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/schedule/get-team-schedule`, payload)
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

/**
 * Fetch the full 22-week season calendar (18 reg + 4 playoff)
 * merged with actual matchup data. Auto-generates calendar if missing.
 */
export const getFullTeamSchedule = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/schedule/get-full-team-schedule`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    // Fallback silently, the carousel will use the old endpoint data
    console.warn('getFullTeamSchedule failed, falling back:', err?.response?.data?.message || err.message)
    return null
  }
}

export const updateTeam = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/team/update', payload)
    if (res) {
      notification.success({
        message: res.data.data,
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const updateTeamConfDivision = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/team/update-team-conf-division', payload)
    if (res) {
      getLeagueDetails()
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getQualifiedTeams = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/team/get-playoff-team`)
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

export const getAllTeamsList = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/team/get-all-teams-list`)
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
