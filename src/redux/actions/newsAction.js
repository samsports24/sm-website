import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getNewsFeed = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/news/get-all')
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
