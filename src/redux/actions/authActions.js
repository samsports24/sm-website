import { notification } from 'antd'
import { publicAPI, attachToken, privateAPI, version, base_url } from '../../config/constants'
import { soccerAPI, attachSoccerToken } from '../../soccer/config/constants'
import { SET_USER_DETAILS } from '../types/generalTypes'
import axios from 'axios'
import io from 'socket.io-client'
import { setSocket } from './socketAction'
import store from '../store'
import { getUserLeagues } from './leagueActions'

/* ── Clear stale session data (league, chat, invitation, etc.) ──
   MUST be called on every login / signup / logout so a new user
   never inherits another account's league context.             */
export const clearStaleSessionData = () => {
  const STALE_KEYS = [
    'AssignLeague', 'leagueroom', 'roomId', 'paid',
    'myinvitationtype', 'selectedGame', 'imagePath',
    'lrTeamId', 'modalShown', 'onboardingComplete',
    'selectedSports', 'authToken',
  ]
  STALE_KEYS.forEach(k => localStorage.removeItem(k))
}

export const handlePaymentIntent = async (payload) => {
  try {
    // Dispatch to Redux store instead of using React hooks (hooks cannot be used outside components)
    store.dispatch({
      type: 'SET_SHOW_PAYMENT_MODAL',
      payload: true,
    })
  } catch (error) {
    notification.error({
      message: 'Failed to initiate payment intent',
      duration: 5,
    });
  }
};


export const authSignup = async (payload, navigate) => {
  try {
    const res = await publicAPI.post('/auth/register', { ...payload, skipVerification: true })
    if (res) {
      clearStaleSessionData()
      localStorage.setItem('version', version)
      localStorage.setItem('email', payload.email)
      const resData = res.data?.data || res.data
      if (resData?.token) {
        localStorage.setItem('token', resData.token)
        localStorage.setItem('userName', resData.user?.userName || resData.user?.name || '')
        localStorage.setItem('userId', resData.user?._id || '')
        attachToken()
      }
      notification.success({
        description: resData.message || 'Account created successfully!',
        duration: 2,
      })
      navigate('/onboarding')
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const authSignupAdvanced = async (payload, navigate) => {
  try {
    // Each sport backend may use a different register path (NFL: /auth/register, Soccer: /api/v1/users/register)
    const registerUrl = payload.registerPath
      ? `${payload.url}${payload.registerPath}`
      : `${payload.url}/auth/register`
    const res = await axios.post(registerUrl, payload)
    if (res) {
      clearStaleSessionData()
      localStorage.setItem('version', version)
      localStorage.setItem('email', payload.email)
      const resData = res.data?.data || res.data

      // Skip verification: token returned directly, log in and go to onboarding
      if (payload.skipVerification && resData?.token) {
        // TODO: Migrate to httpOnly cookies (requires backend cookie support)
        localStorage.setItem('token', resData.token)
        localStorage.setItem('userName', resData.user?.userName || resData.user?.name || '')
        localStorage.setItem('userId', resData.user?._id || '')
        attachToken()
        notification.success({
          description: resData.message || 'Account created successfully!',
          duration: 2,
        })

        // Fetch user leagues after registration succeeds
        try {
          await getUserLeagues()
        } catch (leagueErr) {
          console.error('[authSignupAdvanced] Failed to fetch leagues:', leagueErr?.message)
          // Don't block registration if league fetch fails
        }

        // If the selected sport has its own frontend (e.g. Soccer → localhost:3001),
        // redirect there instead of staying on the NFL app
        if (payload.frontEndUrl) {
          // Pass auth token so the other app can pick it up
          const authToken = resData.token
          window.location.href = `${payload.frontEndUrl}/onboarding?token=${encodeURIComponent(authToken)}`
          return
        }

        const onboarded = localStorage.getItem('onboardingComplete')
        navigate(onboarded ? '/hub' : '/onboarding')
      } else {
        notification.success({
          description: resData.message || 'Account created!',
          duration: 2,
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

export const otpVerification = (otp, navigate) => {
  return async (dispatch) => {
    try {
      let email = localStorage.getItem('email')
      const res = await publicAPI.post('/auth/verifyAccount', { email, otp })
      if (res) {
        localStorage.setItem('version', version)
        // TODO: Migrate to httpOnly cookies (requires backend cookie support)
        localStorage.setItem('token', res.data.data.token)
        localStorage.setItem('userName', res.data.data.user.name)
        localStorage.setItem('userId', res.data.data.user._id)
        attachToken()
        dispatch(getUser())
        // dispatch({
        //   type: SET_USER_DETAILS,
        //   payload: res.data.data.user,
        // })
        notification.success({
          description: res.data.data.message,
          duration: 2,
        })

        // Fetch user leagues after OTP verification succeeds
        try {
          await getUserLeagues()
        } catch (leagueErr) {
          console.error('[otpVerification] Failed to fetch leagues:', leagueErr?.message)
          // Don't block navigation if league fetch fails
        }

        // New users always go to onboarding after OTP verification
        navigate('/onboarding')
      }
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }
}

export const authLogin = (payload, navigate, setShowPaymentModal) => {
const {userName}=payload
let username=userName

  return async (dispatch) => {
    try {
      const res = await publicAPI.post('/auth/login', payload)
      if (res) {
          clearStaleSessionData()
          attachToken()
          localStorage.setItem('version', version)
          // TODO: Migrate to httpOnly cookies (requires backend cookie support)
          localStorage.setItem('token', res.data.data.token)
          localStorage.setItem('userName', res.data.data.user.name || res.data.data.user.userName || '')
          localStorage.setItem('userId', res.data.data.user._id)
          dispatch(getUser())
           localStorage.setItem('week', res?.data?.data?.setting?.week)

          const socket = io(base_url)
          socket.emit('join', res.data.data.user._id)
          dispatch(setSocket(socket))

          notification.success({
            description: res.data.data.message,
            duration: 2,
          })

          // Fetch user leagues after login succeeds
          try {
            await getUserLeagues()
          } catch (leagueErr) {
            console.error('[authLogin] Failed to fetch leagues:', leagueErr?.message)
          }

          // Route to hub after login
          navigate('/hub')
           return res
      }
    } catch (err) {
      if (err?.response?.data?.message === 'payment not completed') {
        localStorage.setItem('userName',username);
        store.dispatch({
          type: 'SET_SHOW_PAYMENT_MODAL',
           payload: true,
          // userName
          // payload: {
          //   showPaymentModal: true,
          //  userName
          // },
        })
        // await createPaymentIntent(payload);

        // await handlePaymentIntent(payload);
      }

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
        const payload = { ...res.data.data }

        // If user is in a soccer league, fetch financials from the soccer server (port 8001)
        const sport = payload?.user?.team?.currentLeague?.sport || payload?.user?.team?.currentLeague?.gameType || ''
        const leagueId = payload?.user?.team?.currentLeague?._id
        if ((sport === 'soccer' || sport === 'football') && leagueId) {
          try {
            attachSoccerToken()
            const finRes = await soccerAPI.get(`/api/v1/teams/financials?leagueId=${leagueId}`)
            if (finRes?.data?.data) {
              payload.soccerFinancials = finRes.data.data
            }
          } catch (finErr) {
            console.error('[getUser] Soccer financials fetch error:', finErr?.message)
          }
        }

        dispatch({
          type: SET_USER_DETAILS,
          payload,
        })
        localStorage.setItem('week', payload?.setting?.week)
      }
    } catch (err) {
      // If token is invalid/expired, clear auth state so user sees LOG IN / SIGN UP
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        localStorage.removeItem('userId')
        dispatch({
          type: SET_USER_DETAILS,
          payload: { user: null, setting: null, record: null },
        })
      } else {
        notification.error({
          message: err?.response?.data?.message || 'Server Error',
          duration: 3,
        })
      }
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

export const createStaff = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/user/create-staff', payload)
    if (res) {
      notification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const updateStaff = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/user/update-staff', payload)
    if (res) {
      notification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getStaff = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/user/get-all-staff')
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

export const updateWeek = (week) => {
  return {
    type: 'UPDATE_WEEK',
    payload: week,
  }
}

export const updateSection = (payload) => {
  return {
    type: 'UPDATE_SECTION',
    payload: payload,
  }
}

// ── Google Sign-In ──
export const googleLogin = (credential, navigate) => {
  return async (dispatch) => {
    try {
      const res = await publicAPI.post('/auth/google-login', { credential })
      if (res) {
        attachToken()
        localStorage.setItem('version', version)
        localStorage.setItem('token', res.data.data.token)
        localStorage.setItem('userName', res.data.data.user.name || res.data.data.user.userName)
        localStorage.setItem('userId', res.data.data.user._id)
        dispatch(getUser())
        localStorage.setItem('week', res?.data?.data?.setting?.week)

        const socket = io(base_url)
        socket.emit('join', res.data.data.user._id)
        dispatch(setSocket(socket))

        notification.success({
          description: res.data.data.message,
          duration: 2,
        })

        // Fetch user leagues after Google login succeeds
        try {
          await getUserLeagues()
        } catch (leagueErr) {
          console.error('[googleLogin] Failed to fetch leagues:', leagueErr?.message)
          // Don't block login if league fetch fails
        }

        // Route to onboarding wizard if first time, else hub
        const onboarded = localStorage.getItem('onboardingComplete')
        navigate(onboarded ? '/hub' : '/onboarding')
        return res
      }
    } catch (err) {
      if (err?.response?.data?.message === 'payment not completed') {
        localStorage.setItem('userName', err?.response?.data?.user?.userName || '')
        store.dispatch({
          type: 'SET_SHOW_PAYMENT_MODAL',
          payload: true,
        })
      }

      notification.error({
        message: err?.response?.data?.message || 'Google login failed',
        duration: 3,
      })
    }
  }
}

// ── Facebook Login ──
export const facebookLogin = (accessToken, navigate) => {
  return async (dispatch) => {
    try {
      const res = await publicAPI.post('/auth/facebook-login', { accessToken })
      if (res) {
        attachToken()
        localStorage.setItem('version', version)
        localStorage.setItem('token', res.data.data.token)
        localStorage.setItem('userName', res.data.data.user.name || res.data.data.user.userName)
        localStorage.setItem('userId', res.data.data.user._id)
        dispatch(getUser())
        localStorage.setItem('week', res?.data?.data?.setting?.week)

        const socket = io(base_url)
        socket.emit('join', res.data.data.user._id)
        dispatch(setSocket(socket))

        notification.success({
          description: res.data.data.message,
          duration: 2,
        })

        try {
          await getUserLeagues()
        } catch (leagueErr) {
          console.error('[facebookLogin] Failed to fetch leagues:', leagueErr?.message)
        }

        const onboarded = localStorage.getItem('onboardingComplete')
        navigate(onboarded ? '/hub' : '/onboarding')
        return res
      }
    } catch (err) {
      if (err?.response?.data?.message === 'payment not completed') {
        store.dispatch({ type: 'SET_SHOW_PAYMENT_MODAL', payload: true })
      }
      notification.error({
        message: err?.response?.data?.message || 'Facebook login failed',
        duration: 3,
      })
    }
  }
}

export const impersonateUser = async (userId, leagueId, email) => {
    try {
    attachToken()
    const res = await privateAPI.post('/admin/impersonate', { userId, leagueId ,email })
    if (res) {
      return res.data.token
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
  };
