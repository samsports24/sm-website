import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

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
