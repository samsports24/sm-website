import Axios from 'axios'
import store from '../redux/store'

// export const base_url = 'http://192.168.100.16:8000'
export const base_url = 'https://backend.samsports.io'

export const publicAPI = Axios.create({ baseURL: base_url })

export const privateAPI = Axios.create({ baseURL: base_url })

export const attachToken = async () => {
  const jwt = localStorage.getItem('token')
  privateAPI.defaults.headers.common.Authorization = `Bearer ${jwt}`
  // console.log("Token Attached");
}

export const isLocked = () => {
  const SETTING = store?.getState()?.user
  return SETTING?.setting?.week < SETTING?.currentWeek ? true : false
  // true is when we have selected current week
}

export const firstLetterCap = (str) => {
  return str !== '' ? str?.charAt(0).toUpperCase() + str.slice(1) : str
}

export const version = '2.0.1'

export const activeRosterCount = 53
export const practiceRosterCount = 53
export const legalPlayers = 46
export const proctectedSquadCount = 4
export const nonActivePlayers = 7

export const leagueSalaryCap = 199759446
