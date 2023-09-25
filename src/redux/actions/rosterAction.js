import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getRoster = async (week) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/team/get-roster/${week}`)
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

export const getAuctionPlayer = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/auction/getall')
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
export const addBid = async (payload, navigate, customnotification) => {
  try {
    attachToken()
    const res = await privateAPI.post('/auction/add-bid', payload)
    if (res) {
      customnotification.success({
        message: res.data.data.message,
        duration: 3,
      })
      navigate('/player-auction')
    }
    // return res.data.data
  } catch (err) {
    console.log('err', err)
    customnotification.error({
      message: err?.response?.data?.data?.message || 'Server Error',
      duration: 3,
    })
    // navigate('/player-auction')
  }
}
