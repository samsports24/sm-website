import { notification } from 'antd'
import { publicAPI, attachToken, privateAPI } from '../../config/constants'
import { SET_USER_DETAILS } from '../types/generalTypes'

export const authSignup = async (payload, navigate) => {
  try {
    const res = await publicAPI.post('/auth/register', payload)
    if (res) {
      localStorage.setItem('email', payload.email)
      attachToken()
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      navigate('/authentication')
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const otpVerification = (otp, navigate) => {
  return async (dispatch) => {
    try {
      let email = localStorage.getItem('email')
      const res = await publicAPI.post('/auth/verifyAccount', { email, otp })
      if (res) {
        localStorage.setItem('token', res.data.data.token)
        localStorage.setItem('userName', res.data.data.user.name)
        localStorage.setItem('userId', res.data.data.user._id)
        attachToken()
        dispatch({
          type: SET_USER_DETAILS,
          payload: res.data.data.user,
        })
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
}

export const authLogin = (payload, navigate) => {
  return async (dispatch) => {
    try {
      const res = await publicAPI.post('/auth/login', payload)
      if (res) {
        if (res.data.data.user.accountVerified) {
          localStorage.setItem('token', res.data.data.token)
          localStorage.setItem('userName', res.data.data.user.name)
          localStorage.setItem('userId', res.data.data.user._id)
          attachToken()
          dispatch({
            type: SET_USER_DETAILS,
            payload: res.data.data.user,
          })
          notification.success({
            description: res.data.data.message,
            duration: 2,
          })
          navigate('/fantasy-league')
        } else {
          localStorage.setItem('email', res.data.data.user.email)
          notification.error({
            message:
              'Your account is not verified. Enter OTP sent to your registered email to verify your account',
            duration: 10,
          })
          navigate('/authentication')
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

export const getUser = () => {
  return async (dispatch) => {
    try {
      attachToken()
      const res = await privateAPI.get('/user/get-user')
      if (res) {
        dispatch({
          type: SET_USER_DETAILS,
          payload: res.data.data,
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

export const updateUserProfile = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/user/update', payload)
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
