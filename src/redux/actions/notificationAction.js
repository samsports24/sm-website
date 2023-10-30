import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI } from '../../config/constants'
import store from '../store'

export const getAllNotification = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/notification/get-all`, payload)
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

export const getNotiCount = () => {
  return async (dispatch) => {
    const id = localStorage.getItem('userId')
    try {
      attachToken()
      const res = await publicAPI.get(`/notification/get-count/${id}`)
      if (res) {
        dispatch({
          type: 'SET_NOTIFICATION_COUNT',
          payload: res?.data?.data,
        })
      }
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }
}
