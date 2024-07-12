import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'
import axios from 'axios'
import { useDispatch } from 'react-redux'



export const createPaymentIntent = async (payload) => {
  console.log('in the payload');
  try {
    attachToken()
    const res = await privateAPI.post('/payment/payment-intent',payload)
    if (res) {
      // console.log('res',res);
      return res.data.data

    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}






export const sendpayment = async (payload,navigate) => {
  // console.log('in the action payment');
  try {
    // attachToken()
    const res = await privateAPI.post('/payment/makepayment',payload)
    if (res) {
      // console.log('res',res);
      if (res && res.data.success) {
        localStorage.removeItem('email');
        localStorage.removeItem('AssignLeague');
        navigate('/fantasy-league')
        // If payment is successful and res.data.success is true
        // You can navigate to 'fantasy-league' here
        //  window.location.href = '/fantasy-league'; 
      }

else{
  localStorage.removeItem('email');
  localStorage.removeItem('AssignLeague');
  navigate('/')

}

  
      // return res.data.data
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}



export const createPaymentIntentforsampoints = async (payload) => {
  console.log('in the payload');
  try {
    attachToken()
     const res = await privateAPI.post('/payment/sampoints-payment-intent',payload)
    // const { sampoints } = payload;
    // const res = await privateAPI.post(`/payment/sampoints-payment-intent?sampoints=${sampoints}`, payload);
    if (res) {
      // console.log('res',res);
      return res.data.data

    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}



export const sendpaymentforsampoints = async (payload,navigate) => {
  // console.log('in the action payment');
  try {
    // attachToken()
    const res = await privateAPI.post('/payment/sampoints-makepayment',payload)
    if (res) {
      // console.log('res',res);
      if (res && res.data.success) {

        store.dispatch(getUser())
        // localStorage.removeItem('email');
        // localStorage.removeItem('AssignLeague');
         navigate('/professional-league')
        // If payment is successful and res.data.success is true
        // You can navigate to 'fantasy-league' here
        //  window.location.href = '/fantasy-league'; 
      }

  
      // return res.data.data
    }
  } catch (err) {
    console.log('err', err)
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
