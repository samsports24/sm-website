import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

export const getAllTeam = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/team/get-all`)
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

export const getTeamSchedule = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/schedule/get-team-schedule`, payload)
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

export const updateTeam = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/team/update', payload)
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
