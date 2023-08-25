import { notification } from 'antd'
import { publicAPI, attachToken } from '../../config/constants'

export const authSignup = async (payload, navigate) => {
  try {
    const res = await publicAPI.post('/auth/register', payload)
    if (res) {
      localStorage.setItem('token', res.data.data.token)
      localStorage.setItem('userName', res.data.data.user.name)
      localStorage.setItem('userId', res.data.data.user._id)
      attachToken()
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      navigate('/fantasy-league')
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const authLogin = (payload, navigate) => {
  return async () => {
    try {
      const res = await publicAPI.post('/auth/login', payload)
      if (res) {
        if (res.data.data.user.accountVerified) {
          localStorage.setItem('token', res.data.data.token)
          localStorage.setItem('userName', res.data.data.user.name)
          localStorage.setItem('userId', res.data.data.user._id)
          attachToken()
          notification.success({
            description: res.data.data.message,
            duration: 2,
          })
          navigate('/fantasy-league')
        } else {
          notification.error({
            message: 'Enter OTP sent to your registered email to verify your account',
            duration: 5,
          })
          navigate('/sign-up')
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
