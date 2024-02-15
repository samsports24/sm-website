import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import { getLeagueDetails } from './leagueActions'

export const createConference = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/conference/create-conference`, payload)
    if (res) {
      getLeagueDetails()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const createDivision = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/division/create-division`, payload)
    if (res) {
      getLeagueDetails()
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getDivisions = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/division/get-division`)
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
