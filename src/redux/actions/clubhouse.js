import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI, serverUrls } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'
import axios from 'axios'






export const setAllclubhouse = (payload) => {
  return {
    type: 'SET_ALL_CLUBHOUSE',
    payload: payload,
  }
}


export  const createClubhouse = async(payload) =>{

    try {
      attachToken()
      const res = await privateAPI.post(`/league/clubhouse`, payload)
      if (res) {
            // store.dispatch(getClubhouse(payload))
            await getClubhouse(payload);
        notification.success({
          description: res.data.data.message,
          duration: 2,
        })
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
  
  
  
  
  
  export const getClubhouse = async (params)=>{
    console.log('params',params);
    try {
        attachToken()
       const res = await privateAPI.get('/league/get-clubhouse',{ params });
        store.dispatch(setAllclubhouse(res.data.data))
        return res.data.data
      } catch (err) {
        notification.error({
          message: err?.response?.data?.message || 'Server Error',
          duration: 3,
        })
      } 
    }




    export  const GenerateVerificationCode = async(payload) =>{
      try {
        attachToken()
        const res = await privateAPI.put(`/clubhouse/generatecode`, payload)
        if (res) {
              // store.dispatch(getClubhouse(payload))
          notification.success({
            description: res.data.data.message,
            duration: 2,
          })
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
  
  