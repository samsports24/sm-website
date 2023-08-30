import { notification } from 'antd'
import {
  attachToken,
  //  legalPlayers,
  privateAPI,
} from '../../config/constants'

export const getActiveRosterCount = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.get('/depthChart/get-active-roster-count')
    if (res) {
      // const depthChart = (res.data.data === legalPlayers && getDepthChartByType(payload)) || []
      const depthChart = (await getDepthChartByType(payload)) || []
      return { count: res.data.data, data: depthChart }
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getDepthChartByType = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/depthChart/get-players-by-type', payload)
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

// export const setNonActivePlayer = async (data) => {
//   try {
//     attachToken()
//     const res = await privateAPI.post('/player/set-nonactive', { ids: data })
//     if (res) {
//       await getRoster()
//       notification.success({
//         message: res.data.data,
//         duration: 3,
//       })
//     }
//   } catch (err) {
//     notification.error({
//       message: err?.response?.data?.message || 'Server Error',
//       duration: 3,
//     })
//   }
// }
