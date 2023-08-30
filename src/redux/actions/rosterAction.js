import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getRoster = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/team/get-roster')
    console.log(res)
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

export const getRosterPlayer = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/player/get-player/${id}`)
    console.log(res)
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
    console.log(res)
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
    console.log(res)
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
