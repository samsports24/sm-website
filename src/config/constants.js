import Axios from 'axios'

// export const base_url = "https://env-backend.herokuapp.com";
// export const base_url = "https://trackingbackend.herokuapp.com";
export const base_url = 'http://34.203.233.165:8001'
// export const base_url = 'http://192.168.100.16:8001'
// export const base_url = 'http://localhost:8001'

export const publicAPI = Axios.create({ baseURL: base_url })

export const privateAPI = Axios.create({ baseURL: base_url })

export const attachToken = async () => {
  const jwt = localStorage.getItem('token')
  privateAPI.defaults.headers.common.Authorization = `Bearer ${jwt}`
  // console.log("Token Attached");
}

export const firstLetterCap = (str) => {
  return str !== '' ? str?.charAt(0).toUpperCase() + str.slice(1) : str
}

export const activeRosterCount = 53
export const practiceRosterCount = 53
export const legalPlayers = 53
export const proctectedSquadCount = 4
