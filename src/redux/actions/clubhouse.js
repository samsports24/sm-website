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

export const createClubhouse = async (payload) => {
  try {
    // leagueId: '668e710dabe4a59553b33167'
    // season: 2024
    // userId: '668e6dfbabe4a59553b3314b'
    attachToken()
    const res = await privateAPI.post(`/league/clubhouse`, payload)
    if (res) {
      // console.log('res',res);
      // console.log('res.data.data',res.data.data);
      // store.dispatch(getClubhouse(payload))
      // store.dispatch(setAllclubhouse(res.data.data))
      console.log('payload inside create club house', payload)
      const tempPayload = {
        leagueId: payload?.league,
        userId: payload?.user,
        season: payload?.season
      }
      await getClubhouse(tempPayload)
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

export const getClubhouse = async (params) => {
  console.log('params', params)
  try {
    attachToken()
    const res = await privateAPI.get('/league/get-clubhouse', { params })
    store.dispatch(setAllclubhouse(res.data.data))
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const GenerateVerificationCode = async (payload) => {
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

export const resendInvitation = async (payload) => {
  console.log('in the action', payload)
  try {
    attachToken()
    const res = await privateAPI.post(`/league/resendinvitation`, payload)
    if (res) {
      // store.dispatch(getClubhouse(payload))
      // await getClubhouse(payload)
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
