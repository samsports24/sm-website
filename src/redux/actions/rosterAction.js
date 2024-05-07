import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import store from '../store'

const setRosterLoading = (payload) => {
  return {
    type: 'SET_ROSTER_LOADING',
    payload: payload,
  }
}
const setRosterData = (payload) => {
  return {
    type: 'SET_ROSTERS',
    payload: payload,
  }
}
const setAuctionData = (payload) => {
  return {
    type: 'SET_AUCTIONS',
    payload: payload,
  }
}
const setAuctionPlayer = (payload) => {
  return {
    type: 'SET_AUCTION_PLAYER',
    payload: payload,
  }
}

export const getRoster = async (week) => {
  try {
    store.dispatch(setRosterLoading(true))
    attachToken()
    const res = await privateAPI.get(`/team/get-roster/${week}`)
    if (res) {
      store.dispatch(setRosterData(res.data.data))
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  } finally {
    store.dispatch(setRosterLoading(false))
  }
}

export const getDraftTeamRoster = async (week) => {
  console.log('in the date',week);
  try {
    store.dispatch(setRosterLoading(true))
    attachToken()
    const res = await privateAPI.get(`/team/get-roster-draft/${week}`)
    if (res) {
       console.log('in res',res);
      store.dispatch(setRosterData(res.data.data))
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  } finally {
    store.dispatch(setRosterLoading(false))
  }
}

export const getTeamRoster = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/team/get-other-roster`, payload)
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

export const getLeagueRoster = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/team/get-league-team-roster`, payload)
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

export const setNonActivePlayer = async (data, week) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/set-nonactive', data)
    if (res) {
      await getRoster(week)
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const setProtectedPlayer = async (data, week) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/protect-practice-player', data)
    if (res) {
      await getRoster(week)
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getRosterPlayer = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/player/get-player`, payload)
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

export const getFreeAgentRosterPlayer = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/player/get-free-agent-player`, payload)
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

export const moveToPractice = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-to-practice', payload)
    if (res) {
      await getRoster(payload?.week)
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const moveFromPractice = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-from-practice', payload)
    if (res) {
      await getRoster(payload?.week)
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const releasePlayer = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/release-player', payload)
    if (res) {
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getFreeAgent = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/player/get-free-agents`, payload)
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

export const getNFLFreeAgent = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/player/get-free-nfl-players`, payload)
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

export const getAllIr = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/player/get-all-ir')
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const moveToIr = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-to-ir', id)
    if (res) {
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const moveIrToRoster = async (payload, setIsError) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-ir-to-roster', payload)
    if (res) {
      notification.success({
        message: res.data.data,
        duration: 3,
      })
      await getAllIr()
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 5,
    })
    if (err?.response?.data?.message === 'Active Roster Full') {
      setIsError(true)
    }
  }
}

export const moveIrToPractice = async (paylaod) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-ir-to-practice', paylaod)
    if (res) {
      notification.success({
        message: res.data.data,
        duration: 3,
      })
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const createAuction = async (paylaod) => {
  try {
    attachToken()
    const res = await privateAPI.post('/auction/create', paylaod)
    if (res) {
      notification.success({
        message: res.data.data?.message,
        duration: 3,
      })
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// Make request to pick player from NFL free players
export const requestIsPicked = async (paylaod) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/request-pick', paylaod)
    if (res) {
      console.log('res',res)
      notification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getAuctionPlayer = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/auction/getall')
    if (res) {
      store?.dispatch(setAuctionData(res.data.data))
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getSingleAuctionPlayer = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/auction/get-auction/${id}`)
    if (res) {
      return res?.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const addBid = async (payload, customnotification) => {
  try {
    attachToken()
    const res = await privateAPI.post('/auction/add-bid', payload)
    store?.dispatch(setAuctionPlayer(res?.data?.data?.auction))
    if (res) {
      customnotification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res
  } catch (err) {
    console.log('err', err)
    customnotification.error({
      message: err?.response?.data?.data?.message || 'Server Error',
      duration: 3,
    })
    // navigate('/player-auction')
  }
}

export const markAsPaid = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/auction/mark-as-paid', payload)
    if (res) {
      notification.success({
        message: res.data.data.message,
        duration: 10,
      })
    }
    return true
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const auctionEnded = async (payload) => {
  try {
    attachToken()
    await privateAPI.post('/auction/end-auction', payload)
    return true
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
