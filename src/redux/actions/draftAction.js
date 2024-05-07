import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'
import store from '../store'

export const setDraftRound = (payload) => {
  return {
    type: 'SET_DRAFT_ROUND',
    payload,
  }
}
export const setDraftLoading = (payload) => {
  return {
    type: 'SET_DRAFT_LOADING',
    payload,
  }
}
export const setDraftTableLoading = (payload) => {
  return {
    type: 'SET_DRAFT_TABLE_LOADING',
    payload,
  }
}
export const setSearch = (payload) => {
  return {
    type: 'SET_DRAFT_PLAYER_SEARCH',
    payload,
  }
}
export const setPosition = (payload) => {
  return {
    type: 'SET_DRAFT_PLAYER_POSITION',
    payload,
  }
}
export const setLimit = (payload) => {
  return {
    type: 'SET_DRAFT_PLAYER_LIMIT',
    payload,
  }
}
export const setPage = (payload) => {
  return {
    type: 'SET_DRAFT_PLAYER_PAGE',
    payload,
  }
}
export const setAllPlayers = (payload) => {
  return {
    type: 'SET_ALL_PLAYERS',
    payload: payload,
  }
}
export const setSelectedPlayer = (payload) => {
  return {
    type: 'SET_SELECTED_PLAYER',
    payload: payload,
  }
}
export const setDraftQueue = (payload) => {
  return {
    type: 'SET_DRAFT_QUEUE',
    payload: payload,
  }
}
export const setDraftTab = (payload) => {
  return {
    type: 'SET_DRAFT_TAB',
    payload: payload,
  }
}
export const setDraftCounter = (payload) => {
  return {
    type: 'SET_DRAFT_COUNTER',
    payload,
  }
}
export const setRoundLoading = (payload) => {
  return {
    type: 'SET_ROUND_LOADING',
    payload,
  }
}
export const setCompleted = (payload) => {
  return {
    type: 'SET_COMPLETED',
    payload,
  }
}

export const getAllPlayers = async (payload) => {
  try {
    store.dispatch(setDraftTableLoading(true))
    attachToken()
    // const res = await privateAPI.post('/player/get-all-players', payload)
    const res = await privateAPI.post('/draft/get-draft-all-players', payload)
    store.dispatch(setAllPlayers(res.data.data))
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  } finally {
    store.dispatch(setDraftTableLoading(false))
  }
}

export const createDraftRound = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/draft/create-draft-round', payload)
    if (res) {
      getDraftRound(false)
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const createRandomizedDraftRound = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/draft/create-randomized-draft-round', payload)
    if (res) {
      getDraftRound()
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const generateAllRound = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/draft/generate-all-draft-round', payload)
    if (res) {
      getDraftRound()
    }
    return res.data.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getDraftRound = async (isLoading = true) => {
  try {
    attachToken()
    isLoading && store.dispatch(setDraftLoading(true))
    const res = await privateAPI.get('/draft/get-draft-round')
    if (res) {
      await getDraftCounter()
      store.dispatch(setDraftRound(res.data.data))
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  } finally {
    isLoading && store.dispatch(setDraftLoading(false))
  }
}

export const deleteDraftRound = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.delete(`/draft/delete-draft-round?id=${id}`)
    if (res) {
      getDraftRound(false)
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// DRAFT QUEUE
export const createDraftQueue = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/draft/create-draft-queue', payload)
    if (res) {
      await getDraftQueue()
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getDraftQueue = async () => {
  try {
    attachToken()
    // store.dispatch(setDraftLoading(true))
    const res = await privateAPI.get('/draft/get-draft-queue')
    if (res) {
      store.dispatch(setDraftQueue(res.data.data))
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
    // store.dispatch(setDraftLoading(false))
  }
}

export const deleteDraftQueue = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.delete(`/draft/delete-draft-queue?id=${id}`)
    if (res) {
      await getDraftQueue()
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// DRAFT HISTORY
export const addPlayerToDraft = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post('/draft/add-player-to-draft', payload)
    if (res) {
      // const draftState = store.getState().draft
      // // getDraftCounter()
      // // getAllPlayers({
      // //   position: draftState?.position,
      // //   search: draftState?.search,
      // //   limit: draftState?.limit,
      // //   page: draftState?.page,
      // // })
      // // getDraftQueue()
      // // getDraftRound()
      console.log('add draft',res.data.data);
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// DRAFT COUNTER
export const getDraftCounter = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/draft/get-draft-counter')
    if (res) {
      store.dispatch(setDraftCounter(res?.data?.data))
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}
