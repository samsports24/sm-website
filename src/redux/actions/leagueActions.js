import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls, setLeagueSwitching } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'
import axios from 'axios'

export const removeLeague = () => {
  return {
    type: 'REMOVE_LEAGUES',
    payload: null,
  }
}

export const setAllSamMetric = (payload) => {
  return {
    type: 'SET_ALL_SAM_Metric',
    payload: payload,
  }
}


export const getProfessionalLeagueRanks = async (week) => {
  if (!week && week !== 0) return null
  try {
    attachToken()
    const res = await privateAPI.get(`/ranking/professionalStats/${week}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    const msg = err?.response?.data?.message
    notification.error({
      message: typeof msg === 'string' ? msg : 'Server Error',
      duration: 3,
    })
  }
}

export const getGmRatings = async (week) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/ranking/gm-ratings/${week || 1}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    return null
  }
}

export const getGlobalGmRankings = async (sport) => {
  try {
    attachToken()
    const url = sport
      ? `/ranking/gm-rankings/global?sport=${sport}`
      : '/ranking/gm-rankings/global'
    const res = await privateAPI.get(url)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    return null
  }
}

export const createNewLeague = async (payload) => {
  try {
    let game = localStorage.getItem('selectedGame')
    let link = serverUrls.find((item) => item.key === game)
    const res = await axios.post(`${link.url}/league/create`, payload)
    // const res = await publicAPI.post(`/league/create`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })

      localStorage.removeItem('selectedGame')
      localStorage.removeItem('email')
      localStorage.removeItem('imagePath')

       window.open(`${link.frontEndUrl}/login`, '_self', 'noreferrer')
    }
  } catch (err) {
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
      // Reset ALL league-specific state so new league starts clean
      store.dispatch({ type: 'RESET_LEAGUE_DATA' })
      // Save new token (includes team/league info)
      if (res.data?.data?.token) {
        // TODO: Migrate to httpOnly cookies (requires backend cookie support)
        localStorage.setItem('token', res.data.data.token)
        attachToken()
      }
      // Update user state so team/currentLeague are available for navigation
      await store.dispatch(getUser())
      await getUserLeagues()
      notification.success({
        description: res.data.data.message || 'League created successfully!',
        duration: 2,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const updateCommissionersInLeague = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/update-commissioners-in-league`, payload)
    if (res) {
      // getUserLeagues()
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const joinLeague = async (payload) => {
  try {
    attachToken()
    let game = localStorage.getItem('selectedGame')
    let link = serverUrls.find((item) => item.key === game)
    const res = await axios.post(`${link.url}/league/join`, payload)

    // const res = await publicAPI.post(`/league/join`, payload)
    if (res) {
      // store.dispatch(getUser())
      // TODO: Migrate to httpOnly cookies (requires backend cookie support)
      localStorage.setItem('token', res.data.data.token)
      store.dispatch(getUser())
      attachToken()
      window.location.href = '/dashboard'


      notification.success({
        description: res.data.data.message,
        duration: 2,
      })

      localStorage.removeItem('selectedGame')
      localStorage.removeItem('email')
      localStorage.removeItem('imagePath')
      localStorage.removeItem('leagueroom')
      localStorage.removeItem('roomId')

      // window.open(`${link.frontEndUrl}/login`, '_self', 'noreferrer')
      // navigate('/dashboard')
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}


export const joinleaguePaymenttrue = async (payload) => {
  try {
    let game = localStorage.getItem('selectedGame')
    let link = serverUrls.find((item) => item.key === game)
    const res = await axios.post(`${link.url}/league/join-from-admin`, payload)

    // const res = await publicAPI.post(`/league/join`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })

      localStorage.removeItem('selectedGame')
      localStorage.removeItem('email')
      localStorage.removeItem('imagePath')
      localStorage.removeItem('paid')

      // window.open(`${link.frontEndUrl}/login`, '_self', 'noreferrer')
      // navigate('/homepage')
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}




export const updateLeague = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/update-league`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      getLeagueDetails()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const updateLeagueCommissioner = async (payload) => {
  try {
    attachToken()
    // Convert to FormData, the backend uses a global multer middleware that
    // strips req.body when receiving application/json instead of multipart/form-data
    const formData = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) continue
      if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    }
    const res = await privateAPI.post(`/league/update-league-commissioner`, formData)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      getUserLeagues()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const deleteLeagueCommissioner = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/delete-league-commissioner`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      getUserLeagues()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const resetLeagueCommissioner = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/league/reset-league-commissioner`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      getUserLeagues()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const selectLeague = async (payload, navigate) => {
  try {
    const res = await privateAPI.post(`/league/select-league`, payload)
    if (res) {
      console.log('[selectLeague] Switching league:', payload.leagueId)
      // Backend sets updated httpOnly cookie with new league context
      // Force a full page reload so Redux state re-initializes from the new cookie
      window.location.replace('/dashboard')
    }
  } catch (err) {
    const msg = err?.response?.data?.message
    notification.error({
      message: typeof msg === 'string' ? msg : 'Server Error',
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
      // Reset ALL league-specific state so new league starts clean
      store.dispatch({ type: 'RESET_LEAGUE_DATA' })
      // Save new token (includes team/league info) so auth middleware picks up the new team
      if (res.data?.data?.token) {
        // TODO: Migrate to httpOnly cookies (requires backend cookie support)
        localStorage.setItem('token', res.data.data.token)
        attachToken()
      }
      // Refresh user state so Header/Dashboard show the team
      store.dispatch(getUser())
      getUserLeagues()
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      return res
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
    throw err
  }
}

export const getUserLeagues = async (params) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/league/get-by-user-id`, { params })
    if (res) {
      store.dispatch({
        type: 'GET_USER_LEAGUES',
        payload: res.data.data,
      })
    }
  } catch (err) {
    // 401 = session expired — silently clear, don't toast "Not logged in"
    if (err?.response?.status === 401) return
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}


export const getALLeagues = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/league/get`)
    if (res) {
      store.dispatch({
        type: 'GET_USER_LEAGUES',
        payload: res.data.data,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}


export const getLandingLeagues = async () => {
  try {
    const res = await publicAPI.get(`/league/home-leagues`)
    if (res) {
      store.dispatch({
        type: 'GET_USER_LEAGUES',
        payload: res.data.data,
      })
    }
  } catch (err) {
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
  if (!week && week !== 0) return null
  try {
    attachToken()
    const res = await privateAPI.get(`/schedule/get-schedule/${week}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    const msg = err?.response?.data?.message
    notification.error({
      message: typeof msg === 'string' ? msg : 'Server Error',
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


export const TransferPointsToLeague =async (payload) =>{

  try {
    attachToken()
    const res = await privateAPI.post(`/league/transfer-points-to-league-wallet`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      store.dispatch(getUser())
     // getLeagueDetails()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }


}



export const makeiswallettrue =async (payload) =>{
  try {
    attachToken()
    const res = await privateAPI.put(`/league/is-wallet-true`, payload)
    if (res) {
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      store.dispatch(getUser())
     // getLeagueDetails()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }


}





export const getSamMetric =async (payload) =>{
  try {
    attachToken()
    const res = await privateAPI.get(`/admin/league/getsammetric`, payload)
    if (res) {
      
      store.dispatch(setAllSamMetric(res.data.data))
      return res.data.data

    
    
      // store.dispatch(getUser())
     // getLeagueDetails()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }


}


