import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'



export const setAllstadium = (payload) => {
    return {
      type: 'SET_ALL_STADIUM',
      payload,
    }
  }

  export const setMystadium = (payload) => {
    return {
      type: 'SET_MY_STADIUM',
      payload,
    }
  }

  
  export const getallstadiumlevel = async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/stadium/getallstadiumlevel')
      store.dispatch(setAllstadium(res.data.data))
      return res.data.data
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }
  

  export const createStadium = async (payload) => {
    try {
      // leagueId: '668e710dabe4a59553b33167'
      // season: 2024
      // userId: '668e6dfbabe4a59553b3314b'
      attachToken()
      const res = await privateAPI.post(`/stadium/createstadium`, payload)
      if (res) {
        // console.log('res',res);
        // console.log('res.data.data',res.data.data);
        // store.dispatch(getClubhouse(payload))
        // store.dispatch(setAllclubhouse(res.data.data))
      
        const tempPayload = {
          league: payload?.league,
          user: payload?.user,
          season: payload?.season,
          teamId:payload?.teamId
        }

        // console.log('tempPayload',tempPayload);
        await getstadium(tempPayload)
           store.dispatch(getUser())
        // store.dispatch(setAllclubhouse(res.data.data))
        notification.success({
          description: res.data.data.message,
          duration: 2,
        })
        return res.data.data
        // store.dispatch(getUser())
        // getLeagueDetails()
      }
    } catch (err) {
      console.log('err', err)
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }


  export const getstadium = async (payload) => {  
    console.log('get payload',payload);
    try {
      attachToken()
      const res = await privateAPI.get('/stadium/getstadium', payload)
      store.dispatch(setMystadium(res.data.data))
      return res.data.data
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Server Error',
        duration: 3,
      })
    }
  }


  