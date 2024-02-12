import Axios from 'axios'
import store from '../redux/store'
import { getNotiCount } from '../redux/actions/notificationAction'

// export const base_url = 'http://192.168.100.16:8000'
export const base_url = 'https://backend.samsports.io'
// export const base_url = 'http://localhost:8000'

export const publicAPI = Axios.create({ baseURL: base_url })

export const privateAPI = Axios.create({ baseURL: base_url })

export const attachToken = async () => {
  const jwt = localStorage.getItem('token')
  privateAPI.defaults.headers.common.Authorization = `Bearer ${jwt}`
}

privateAPI.interceptors.response.use(
  async (response) => {
    store?.dispatch(getNotiCount())
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export const isLocked = () => {
  const SETTING = store?.getState()?.user
  return SETTING?.setting?.week < SETTING?.currentWeek ? true : false
  // true is when we have selected current week
}

export const version = '2.0.2'

export const activeRosterCount = 53
export const practiceRosterCount = 53
export const legalPlayers = 46
export const proctectedSquadCount = 4
export const nonActivePlayers = 7

export const leagueSalaryCap = 199759446

export const includedTeams = [
  '64e5ee7d6e36d01a688fc6e1',
  '64e5ee7d6e36d01a688fc6d2',
]
export const serverUrls = [
  {
    key : "football",
    name : "Football",
    url : 'http://localhost:8000', 
    frontEndUrl : "http://localhost:3000"
    // url : 'https://backend.samsports.io' 
  },
  {
    key : "baseball",
    name : "Baseball",
    url : 'https://baseballbackend.samsports.io', 
    frontEndUrl : "http://localhost:3000"
  },
  {
    key : "hockey",
    name : "Hockey",
    url : 'https://hockeybackend.samsports.io', 
    frontEndUrl : "http://localhost:3000"
  },
  {
    key : "college_football",
    name : "College Football",
    url : 'https://collegefootballbackend.samsports.io', 
    frontEndUrl : "http://localhost:3000"
  },
  {
    key : "basketball",
    name : "Basketball",
    url : 'https://basketballbackend.samsports.io', 
    frontEndUrl : "http://localhost:3000"
  },
  {
    key : "eleven_fc",
    name : "Eleven F.C",
    url  : 'https://elevenfcbackend.samsports.io', 
    frontEndUrl : "http://localhost:3000"
  },
  {
    key : "scouts",
    name : "Scouting",
    url : 'https://scoutsbackend.samsports.io', 
    frontEndUrl : "http://localhost:3000"
  },
]