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
