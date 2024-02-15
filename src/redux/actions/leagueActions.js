import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'

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
    const res = await publicAPI.post(`/league/create`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      let game = localStorage.getItem('selectedGame')

      localStorage.removeItem('selectedGame')
      localStorage.removeItem('email')
      localStorage.removeItem('imagePath')

      let link = serverUrls.find((item) => item.key === game)
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
export const updateNewLeague = async (payload) => {
  try {
    const res = await publicAPI.post(`/league/update`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      // let game = localStorage.getItem('selectedGame')

      // localStorage.removeItem('selectedGame')
      // localStorage.removeItem('email')
      // localStorage.removeItem('imagePath')

      // let link = serverUrls.find((item) => item.key === game)
      // window.open(`${link.frontEndUrl}/login`, '_self', 'noreferrer')
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const createNewLeagueFromDashboard = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/create-from-platform`, payload)
    if (res) {
      getUserLeagues()
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const joinLeague = async (payload) => {
  try {
    const res = await publicAPI.post(`/league/join`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      let game = localStorage.getItem('selectedGame')

      localStorage.removeItem('selectedGame')
      localStorage.removeItem('email')
      localStorage.removeItem('imagePath')

      let link = serverUrls.find((item) => item.key === game)
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

export const selectLeague = async (payload, navigate) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/select-league`, payload)
    if (res) {
      localStorage.setItem('token', res.data.data.token)
      store.dispatch(getUser())
      attachToken()
      navigate('/professional-league')
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getHomeLeagues = async () => {
  try {
    const res = await publicAPI.get(`/league/home-leagues`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.log('err', err)
    // notification.error({
    //   message: err?.response?.data?.message || 'Server Error',
    //   duration: 3,
    // })
  }
}

export const getLeagueDetails = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/league/get-league`)
    if (res) {
      store.dispatch({
        type: 'SET_LEAGUES',
        payload: res.data.data,
      })
      return res.data.data
    }
  } catch (err) {
    console.log('err', err)
    // notification.error({
    //   message: err?.response?.data?.message || 'Server Error',
    //   duration: 3,
    // })
  }
}

export const joinLeagueFromPlatform = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/join-from-platform`, payload)
    if (res) {
      getUserLeagues()
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getUserLeagues = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/league/get-by-user-id`)
    if (res) {
      store.dispatch({
        type: 'GET_USER_LEAGUES',
        payload: res.data.data,
      })
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
    const res = await privateAPI.post(`/player/get-all-players`, payload)
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
