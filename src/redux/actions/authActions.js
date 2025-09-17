import { notification } from 'antd'
import { publicAPI, attachToken, privateAPI, version, base_url } from '../../config/constants'
import { SET_USER_DETAILS } from '../types/generalTypes'
import { ethers } from 'ethers'
import axios from 'axios'
import io from 'socket.io-client'
import { setSocket } from './socketAction'
import { createPaymentIntent } from './paymentAction'
import { useState } from 'react'
import store from '../store'





export const handlePaymentIntent = async (payload) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  try {
    setShowPaymentModal(true); 
  } catch (error) {
    console.error('Error initiating payment intent:', error);
    notification.error({
      message: 'Failed to initiate payment intent',
      duration: 5,
    });
  }
};


export const authSignup = async (payload, navigate) => {
  try {
    const res = await publicAPI.post('/auth/register', payload)
    if (res) {
      localStorage.setItem('version', version)
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

export const authSignupAdvanced = async (payload, navigate) => {
  try {
    const res = await axios.post(`${payload.url}/auth/register`, payload)
    if (res) {
      localStorage.setItem('version', version)
      localStorage.setItem('email', payload.email)
      notification.success({
        description: res.data.data.message,
        duration: 2,
      })
      navigate('/select-league')
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

const connectEthereumWallet = () => {
  return new Promise(async function (resolve, reject) {
    if (!window?.ethereum) {
      console.log('Ethereum provider not detected')
      resolve({
        message: 'Metamask not detected, make sure to connect your wallet to make payments.',
        status: 'warning',
      })
    }
    const provider = new ethers.BrowserProvider(window?.ethereum)
    try {
      const accounts = await provider.send('eth_requestAccounts', [])
      if (accounts.length) {
        const connectedAddress = accounts[0]
        const walletBalance = await provider.getBalance(connectedAddress)

        console.log('connectedAddress', connectedAddress)
        console.log('walletBalance', ethers.formatEther(walletBalance))
        if (connectedAddress) {
          resolve({ message: 'Wallet Connected', status: 'success', connectedAddress })
        } else {
          reject({
            message: 'Wallet Not Connected.',
          })
        }
      } else {
        reject({
          message: 'No account created',
        })
      }
    } catch (err) {
      console.error(err)
      reject({
        message: 'Failed to connect to wallet',
      })
    }
  })
}

export const authLogin = (payload, navigate, setShowPaymentModal) => {
 
  // console.log('payload',payload);
const {userName}=payload
let username=userName

  return async (dispatch) => {
    try {
      const res = await publicAPI.post('/auth/login', payload)
      if (res) {
        console.log('res', res?.data?.data?.setting);
        if (res.data.data.user.accountVerified) {
          // if (res.data.data.user.userType === 'owner') {
          // await connectEthereumWallet()
          //     .then(async (response) => {
          //       notification[response.status]({
          //         message: response.message,
          //         duration: 5,
          //       })
          //       localStorage.setItem('version', version)
          //       localStorage.setItem('token', res.data.data.token)
          //       localStorage.setItem('userName', res.data.data.user.name)
          //       localStorage.setItem('userId', res.data.data.user._id)
          //       attachToken()
          //       dispatch(getUser())
          //       if (response.status === 'success') {
          //         await saveWallet(response.connectedAddress)
          //       }
          //       localStorage.setItem('week', res?.data?.data?.setting?.week)
          //       notification.success({
          //         description: res.data.data.message,
          //         duration: 2,
          //       })
          //       navigate('/fantasy-league')
          //     })
          //     .catch((err) => {
          //       notification.error({
          //         message: err.message,
          //         duration: 5,
          //       })
          //     })
          // } else {
          attachToken()
          localStorage.setItem('version', version)
          localStorage.setItem('token', res.data.data.token)
          localStorage.setItem('userName', res.data.data.user.name)
          localStorage.setItem('userId', res.data.data.user._id)
          dispatch(getUser())
           localStorage.setItem('week', res?.data?.data?.setting?.week)
           // localStorage.setItem('date', res?.data?.data?.setting?.date)
           

          const socket = io(base_url)
          socket.emit('join', res.data.data.user._id)
          dispatch(setSocket(socket))

          notification.success({
            description: res.data.data.message,
            duration: 2,
          })
          navigate('/my-league')
           return res
          // }
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
      console.error('Error during login:', err); 
      

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
        // console.log('Payment not completed. Initiating payment intent...');
      //   console.log('res', res?.data?.data?.setting);
        // const userName= localStorage.setItem('userName',UserName);
      //   let email =getemail;
      //  console.log('userName',userName);
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

export const saveWallet = async (walletAddress) => {
  try {
    attachToken()
    await privateAPI.post('/auth/save-wallet', { walletAddress })
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
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
        localStorage.setItem('week', res?.data?.data?.setting?.week)
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

export const impersonateUser = async (userId, leagueId) => {
    try {
    attachToken()
    const res = await privateAPI.post('/admin/impersonate', { userId, leagueId ,email: "frenchyfriday@yahoo.com" })
    console.log('res of impersonate :', res);
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
