import { notification } from 'antd'
import { attachToken, privateDRAFTAPI,privateAPI } from '../../config/constants'
import store from '../store'
import { getUser } from './authActions'
import { getLeagueDetails } from './leagueActions'


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

export const setRookieplayers = (payload) => {
  return {
    type: 'SET_DRAFT_PLAYER_ROOKIE_SEARCH',
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


export const setAllPlayersStats = (payload) => {
  return {
    type: 'SET_ALL_PLAYERS_stats',
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


// BLACK LIST

export const setBlackListQueue = (payload) => {
  return {
    type: 'SET_BLACKLIST_QUEUE',
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
    // const res = await privateDRAFTAPI.post('/player/get-all-players', payload)
    // const res = await privateDRAFTAPI.post('/draft/get-draft-all-players', payload)
    // const res = await privateDRAFTAPI.post(`/draft/get-draft-all-players?position=${payload.position}`);
   const res = await privateDRAFTAPI.post(`/draft/get-draft-all-players?position=${payload.position}`, payload);
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


export const getALLplayerStats = async (payload)=>{
  try {
    store.dispatch(setDraftTableLoading(true))
    attachToken()
    // const res = await privateDRAFTAPI.post('/player/get-all-players', payload)
    const res = await privateDRAFTAPI.post('/draft/get-stats-draft-all-players', payload)
    store.dispatch(setAllPlayersStats(res.data.data))
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
    const res = await privateDRAFTAPI.post('/draft/create-draft-round', payload)
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
    const res = await privateDRAFTAPI.post('/draft/create-randomized-draft-round', payload)
    if (res) {
      await getDraftRound()
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
    const res = await privateDRAFTAPI.post('/draft/generate-all-draft-round', payload)
    if (res) {
      await getDraftRound()
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
    const res = await privateDRAFTAPI.get('/draft/get-draft-round')
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
    const res = await privateDRAFTAPI.delete(`/draft/delete-draft-round?id=${id}`)
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
    const res = await privateDRAFTAPI.post('/draft/create-draft-queue', payload)
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
    const res = await privateDRAFTAPI.get('/draft/get-draft-queue')
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
    const res = await privateDRAFTAPI.delete(`/draft/delete-draft-queue?id=${id}`)
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


export const changeDraftQueueOrder = async (id,direction) => {
  try {
    attachToken()
    // const res = await privateDRAFTAPI.delete(`/draft/change-order-draft-queue?id=${id}`)
    const res = await privateDRAFTAPI.put(`/draft/change-order-draft-queue?id=${id}&direction=${direction}`);
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




// BLACK LIST 

export const createBlackListQueue = async (payload) => {
  try {
    attachToken()
    const res = await privateDRAFTAPI.post('/draft/create-black-list', payload)
    if (res) {
      await getBlackListQueue()
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}


export const getBlackListQueue = async () => {
  try {
    attachToken()
    // store.dispatch(setDraftLoading(true))
    const res = await privateDRAFTAPI.get('/draft/get-black-list')
    if (res) {
      store.dispatch(setBlackListQueue(res.data.data))
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




export const deleteBlacklistQueue = async (id) => {
  try {
    attachToken()
    const res = await privateDRAFTAPI.delete(`/draft/delete-black-list?id=${id}`)
    if (res) {
      await getBlackListQueue()
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
    const res = await privateDRAFTAPI.post('/draft/add-player-to-draft-socket', payload)
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
      store.dispatch(getUser())
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
    const res = await privateDRAFTAPI.get('/draft/get-draft-counter')
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



// DRAFT BIDDING
export const makeBid = async (payload) => {
  store.dispatch(setDraftLoading(true))
  try {
    attachToken()

    // Build the full payload the backend expects
    const state = store.getState()
    const team = state.user?.userDetails?.team
    const league = state.league?.currentLeague

    const fullPayload = {
      leagueid: league?._id,
      teamid: team?._id,
      bidamount: payload.amount || payload.bidamount,
      spotAuctionEnd: league?.spotAuctionEnd || null,
    }

    const res = await privateDRAFTAPI.post('/draft/make-bidding', fullPayload)
    if (res) {
      getDraftRound()
      store.dispatch(getUser())
      store.dispatch(setDraftLoading(false))
      return res.data.data
    }

  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
    store.dispatch(setDraftLoading(false))
  }
}

// ── Toggle Autodraft ──
export const toggleAutoDraft = async (enabled) => {
  try {
    attachToken()
    const res = await privateDRAFTAPI.post('/draft/toggle-autodraft', { enabled })
    if (res) {
      notification.success({
        message: enabled ? 'Autodraft ON' : 'Autodraft OFF',
        description: enabled ? 'Auto-picks best available when on the clock.' : 'You pick manually.',
        duration: 3,
      })
      return res.data?.data
    }
  } catch (err) {
    console.warn('Autodraft toggle:', err?.response?.data?.message || err.message)
  }
}

// ── Smart Autodraft, Analyze squad and pick best player by position need ──
export const getSmartAutoDraftPick = async () => {
  try {
    attachToken()
    const res = await privateDRAFTAPI.get('/draft/smart-autodraft')
    if (res?.data?.data) {
      const { player, position, analysis } = res.data.data
      if (player) {
        notification.info({
          message: `🤖 Smart Pick: ${player.Name}`,
          description: `Position: ${player.Position} | Need: ${position} (${analysis?.positionNeeds?.[0]?.need || 0} slots) | Proj: ${player.FantasyPoints24?.toFixed(1) || '?'} pts`,
          duration: 5,
        })
      }
      return res.data.data
    }
    return null
  } catch (err) {
    console.warn('Smart autodraft error:', err?.response?.data?.message || err.message)
    return null
  }
}

// ── Get Squad Analysis (position needs breakdown) ──
export const getSquadAnalysis = async () => {
  try {
    attachToken()
    const res = await privateDRAFTAPI.get('/draft/squad-analysis')
    return res?.data?.data || null
  } catch (err) {
    console.warn('Squad analysis error:', err?.response?.data?.message || err.message)
    return null
  }
}

// ── Toggle Draft Pause (Commissioner) ──
export const toggleDraftPause = async (paused) => {
  try {
    attachToken()
    const res = await privateDRAFTAPI.post('/draft/toggle-pause', { paused })
    if (res) {
      // Refresh league details to get updated draftPaused state
      await getLeagueDetails()
      notification.success({
        message: paused ? 'Draft paused' : 'Draft resumed',
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}