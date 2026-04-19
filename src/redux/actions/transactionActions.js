import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import store from '../store'

export const getTopTransactions = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/transaction/get-top-transactions')

    if (res) {
      return res?.data?.data?.topTransaction
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getAllTransactions = async (payload) => {
  try {
    store.dispatch({ type: 'SET_TRANSACTION_LOADING', payload: true })
    attachToken()
    const res = await privateAPI.post(`/transaction/get-all-transactions`,payload)

    if (res) {
      store.dispatch({ type: 'SET_TRANSACTION_LOADING', payload: false })
      return res?.data?.data?.transactions
    }
  } catch (err) {
    store.dispatch({ type: 'SET_TRANSACTION_LOADING', payload: false })
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
