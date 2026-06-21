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


export const authSignup = async (payload, navigate, setVerificationState) => {
  try {
    const res = await publicAPI.post('/auth/register', { ...payload, skipVerification: false })
    if (res) {
      clearStaleSessionData()
      localStorage.setItem('version', version)
      localStorage.setItem('email', payload.email)
      const resData = res.data?.data || res.data

      // ── New flow: email verification required ──
      if (resData?.requiresVerification) {
        localStorage.setItem('pendingUserId', resData.userId)
        notification.success({
          description: resData.message || 'Check your email for a verification code!',
          duration: 4,
        })
        // Tell the registration component to show code input
        if (setVerificationState) {
          setVerificationState({ userId: resData.userId, email: payload.email })
        } else {
          navigate('/verify-email')
        }
        return
      }

      // ── Legacy flow: direct token (shouldn't happen anymore, but fallback) ──
      if (resData?.token) {
        // Token now set as httpOnly cookie by backend (XSS-safe)
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

// ── Verify email with 6-digit code ──
export const verifyEmailCode = async (userId, code, navigate, sport) => {
  try {
    // Determine which backend to call
    const isSoccer = sport === 'eleven_fc' || sport === 'soccer'
    const res = isSoccer
      ? await axios.post(`${process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'}/api/v1/users/verify-email`, { userId, code })
      : await publicAPI.post('/auth/verify-email', { userId, code })

    const resData = res.data?.data || res.data

    if (resData?.token) {
      // Persist the token the same way login does — attachToken()/the API read
      // it from localStorage['token'] (Bearer auth). Without this the next page
      // has no token and shows "not logged in" despite a successful verify.
      localStorage.setItem('token', resData.token)
      localStorage.setItem('userName', resData.user?.userName || resData.user?.name || '')
      localStorage.setItem('userId', resData.user?._id || '')
      localStorage.removeItem('pendingUserId')
      attachToken()
      if (isSoccer) attachSoccerToken()
    }

    notification.success({
      description: 'Email verified! Welcome to SamSports!',
      duration: 3,
    })

    // Fetch user data
    try { await store.dispatch(getUser()) } catch (e) { /* noop */ }
    try { await getUserLeagues() } catch (e) { /* noop */ }

    navigate('/onboarding')
    return true
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Invalid verification code',
      duration: 3,
    })
    return false
  }
}

// ── Resend verification code ──
export const resendVerificationCode = async (userId, email, sport) => {
  try {
    const isSoccer = sport === 'eleven_fc' || sport === 'soccer'
    const payload = userId ? { userId } : { email }

    if (isSoccer) {
      await axios.post(`${process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'}/api/v1/users/resend-verification`, payload)
    } else {
      await publicAPI.post('/auth/resend-verification', payload)
    }

    notification.success({
      description: 'New verification code sent to your email!',
      duration: 3,
    })
    return true
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to resend code',
      duration: 3,
    })
    return false
  }
}

export const authSignupAdvanced = async (payload, navigate, setVerificationState) => {
  try {
    // Each sport backend may use a different register path (NFL: /auth/register, Soccer: /api/v1/users/register)
    const registerUrl = payload.registerPath
      ? `${payload.url}${payload.registerPath}`
      : `${payload.url}/auth/register`
    const res = await axios.post(registerUrl, { ...payload, skipVerification: false })
    if (res) {
      clearStaleSessionData()
      localStorage.setItem('version', version)
      localStorage.setItem('email', payload.email)
      const resData = res.data?.data || res.data

      // ── New flow: email verification required ──
      if (resData?.requiresVerification) {
        localStorage.setItem('pendingUserId', resData.userId)
        localStorage.setItem('pendingSport', payload.key || 'football')
        notification.success({
          description: resData.message || 'Check your email for a verification code!',
          duration: 4,
        })
        if (setVerificationState) {
          setVerificationState({
            userId: resData.userId,
            email: payload.email,
            sport: payload.key || 'football',
            frontEndUrl: payload.frontEndUrl,
          })
        } else {
          navigate('/verify-email')
        }
        return
      }

      // ── Legacy/fallback: direct token ──
      if (resData?.token) {
        // Token now set as httpOnly cookie by backend (XSS-safe)
        localStorage.setItem('userName', resData.user?.userName || resData.user?.name || '')
        localStorage.setItem('userId', resData.user?._id || '')
        attachToken()
        notification.success({
          description: resData.message || 'Account created successfully!',
          duration: 2,
        })

        try { await getUserLeagues() } catch (e) { /* noop */ }
        try { await store.dispatch(getUser()) } catch (e) { /* noop */ }

        if (payload.frontEndUrl) {
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
        // Store token in localStorage so Authorization header is sent on every request
        if (res.data?.data?.token || res.data?.data?.authToken) {
          localStorage.setItem('token', res.data.data.token || res.data.data.authToken)
        }
        localStorage.setItem('version', version)
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
          // Store token in localStorage so PrivateWrapper auth guard works
          if (res.data?.data?.token) {
            localStorage.setItem('token', res.data.data.token)
          }
          attachToken()
          localStorage.setItem('version', version)
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

          // Show SP login reward toast if daily reward was earned
          const loginReward = res.data.data.loginReward;
          if (loginReward && loginReward.points) {
            const streakEmoji = loginReward.streak >= 7 ? '🔥' : loginReward.streak >= 3 ? '⚡' : '✨';
            const spFormatted = loginReward.points >= 1000000
              ? `${(loginReward.points / 1000000).toFixed(1)}M`
              : loginReward.points >= 1000
                ? `${(loginReward.points / 1000).toFixed(0)}K`
                : loginReward.points;
            setTimeout(() => {
              notification.info({
                message: `${streakEmoji} +${spFormatted} SP earned!`,
                description: loginReward.streak === 7
                  ? `Day ${loginReward.streak} — Streak bonus unlocked!`
                  : `Day ${loginReward.streak} streak — keep it going!`,
                duration: 5,
                placement: 'topRight',
                style: { backgroundColor: '#1a1a0a', borderLeft: '3px solid #f59e0b', color: '#fff' },
              });
            }, 1500);
          }

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
            // Silently ignore — 404 means league not found in soccer DB (expected for some users)
          }
        }

        dispatch({
          type: SET_USER_DETAILS,
          payload,
        })
        localStorage.setItem('week', payload?.setting?.week)
      }
    } catch (err) {
      // 401/403 during getUser should NOT nuke the token — the login flow
      // fires getUser immediately and downstream calls (soccer, rivals) may
      // 401 before the user has data there.  Clearing the token here was the
      // root cause of the "Not logged in" loop.
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        console.warn('[getUser] 401/403 received — keeping token, clearing UI state only')
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
        // Token now set as httpOnly cookie by backend (XSS-safe)
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
        // Token now set as httpOnly cookie by backend (XSS-safe)
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
