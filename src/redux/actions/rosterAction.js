import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getRoster = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/team/get-roster')
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

export const setNonActivePlayer = async (data) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/set-nonactive', { ids: data })
    if (res) {
      await getRoster()
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

export const setProtectedPlayer = async (data) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/protect-practice-player', { ids: data })
    if (res) {
      await getRoster()
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

export const getRosterPlayer = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/player/get-player/${id}`)
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

export const moveToPractice = async (data) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-to-practice', data)
    if (res) {
      await getRoster()
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

export const moveFromPractice = async (data) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-from-practice', data)
    if (res) {
      await getRoster()
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

export const releasePlayer = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/release-player', { id })
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

export const moveIrToRoster = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-ir-to-roster', id)
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
      duration: 3,
    })
  }
}

export const moveIrToPractice = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.post('/player/move-ir-to-practice', id)
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
