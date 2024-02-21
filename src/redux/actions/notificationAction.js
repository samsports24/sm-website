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
    if (id) {
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
}

export const clearNotification = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/notification/clear`)
    if (res) {
      notification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res?.data?.data?.message
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
