import Axios from 'axios'
import store from '../redux/store'
import { getNotiCount } from '../redux/actions/notificationAction'
import football from "../assets/new_Football.png"
import hockey from "../assets/new_Hockey.png"
import scocer from "../assets/new_Soccerball.png"
import baseball from "../assets/new_Baseball.png"

// export const base_url = 'http://localhost:8000'
// export const frontEndUrl = 'http://localhost:3001'

 export const base_url = 'https://backend.samsports.io'
 export const frontEndUrl = 'https://samsports.io'



//  export const base_url = 'http://192.168.100.11:8000'
//  export const frontEndUrl = 'http://192.168.100.11:3000'


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

// export const version = '2.0.4'
 export const version = '2.0.5'

export const activeRosterCount = 53
export const practiceRosterCount = 53
 export const legalPlayers = 46
// export const legalPlayers = 53
export const proctectedSquadCount = 4
export const nonActivePlayers = 7

export const leagueSalaryCap = 199759446

export const landingSignup = () => window.open(frontEndUrl, '_self')

export const includedTeams = ['64e5ee7d6e36d01a688fc6e1', '64e5ee7d6e36d01a688fc6d2']
export const serverUrls = [
  {
    key: 'football',
    name: 'Football',
    url: base_url,
    frontEndUrl: `${frontEndUrl}/fantasy-league`,
    disabled: false,
    image:football,
  },
  {
    key: 'hockey',
    name: 'Hockey',
    url: 'https://hockeybackend.samsports.io',
    frontEndUrl: 'https://hockey.samsports.io',
    // frontEndUrl: 'http://localhost:3002',
    // url: 'http://localhost:9000',
    disabled: false,
    image:hockey,
  },
  {
    key: 'baseball',
    name: 'Baseball',
    // url: 'https://baseballbackend.samsports.io',
    // frontEndUrl: 'https://baseball.samsports.io',
    url: 'http://localhost:8000',
    frontEndUrl: 'http://localhost:3000',
    disabled: false,
    image:baseball,
  },
  {
    key: 'eleven_fc',
    name: 'Eleven F.C',
    url: 'https://elevenfcbackend.samsports.io',
    frontEndUrl: 'http://localhost:3000',
    disabled: true,
    image:scocer,
  },
  {
    key: 'college_football',
    name: 'College Football',
    url: 'https://collegefootballbackend.samsports.io',
    frontEndUrl: 'http://localhost:3000',
    disabled: true,
  },
  {
    key: 'basketball',
    name: 'Basketball',
    url: 'https://basketballbackend.samsports.io',
    frontEndUrl: 'http://localhost:3000',
    disabled: true,
  },

  {
    key: 'scouts',
    name: 'Scouting',
    url: 'https://scoutsbackend.samsports.io',
    frontEndUrl: 'http://localhost:3000',
    disabled: true,
  },
]
