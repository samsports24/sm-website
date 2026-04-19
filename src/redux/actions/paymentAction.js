import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'

export const createPaymentIntentforsampoints = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/payment/sampoints-payment-intent', payload)
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

export const sendpaymentforsampoints = async (payload, navigate) => {
  try {
    const res = await privateAPI.post('/payment/sampoints-makepayment', payload)
    if (res) {
      if (res && res.data.success) {
        store.dispatch(getUser())
        navigate('/dashboard')
      }
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
