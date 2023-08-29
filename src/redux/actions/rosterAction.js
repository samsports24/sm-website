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
