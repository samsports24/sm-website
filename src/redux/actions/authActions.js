import { notification } from 'antd'
import { publicAPI, attachToken } from '../../config/constants'

export const authLogin = (payload, navigate) => {
  return async () => {
    try {
      const res = await publicAPI.post('/employee/login', payload)
      if (res) {
        if (res.data.user.blocked) {
          notification.error({
            message: 'You are Blocked by the Management',
            duration: 3,
          })
        } else {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userName', res.data.user.name)
          localStorage.setItem('userId', res.data.user._id)
          localStorage.setItem('userType', res.data.userType)
          attachToken()
          notification.success({
            description: res.data.message,
            duration: 2,
          })
          window.location.reload()
          navigate('/')
        }
      }
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }
}
