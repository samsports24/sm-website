const initialState = {
    loading: true,
    tableLoading: true,
    draftRounds: [],
    allPlayers: {
      players: [],
      total: 0,
    },
    selectedPlayer: null,
    search: '',
    limit: 10,
    position: 'ALL',
    page: 1,
    draftQueues: [],
    activeTab: 1,
    draftCounter: null,
    onTheClock: null,
    roundLoading: false,
    completed: false,
  }
  
  const draftReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
      case 'SET_DRAFT_LOADING': {
        return {
          ...state,
          loading: payload,
        }
      }
      case 'SET_DRAFT_TABLE_LOADING': {
        return {
          ...state,
          tableLoading: payload,
        }
      }
      case 'SET_DRAFT_ROUND': {
        return {
          ...state,
          draftRounds: payload,
        }
      }
      case 'SET_ALL_PLAYERS': {
        return {
          ...state,
          allPlayers: payload,
          selectedPlayer: payload?.players?.length > 0 ? payload?.players?.[0] : null,
        }
      }
      case 'SET_SELECTED_PLAYER': {
        return {
          ...state,
          selectedPlayer: payload,
        }
      }
      case 'SET_DRAFT_PLAYER_SEARCH': {
        return {
          ...state,
          search: payload,
        }
      }
      case 'SET_DRAFT_PLAYER_LIMIT': {
        return {
          ...state,
          limit: payload,
        }
      }
      case 'SET_DRAFT_PLAYER_POSITION': {
        return {
          ...state,
          position: payload,
        }
      }
      case 'SET_DRAFT_PLAYER_PAGE': {
        return {
          ...state,
          page: payload,
        }
      }
      case 'SET_DRAFT_QUEUE': {
        return {
          ...state,
          draftQueues: payload,
        }
      }
      case 'SET_DRAFT_TAB': {
        return {
          ...state,
          activeTab: payload,
        }
      }
      case 'SET_DRAFT_COUNTER': {
        let isTeam = null
        if (state?.draftRounds?.length > 0) {
          isTeam = state?.draftRounds?.find(
            (v) =>
              v?.round === state?.draftCounter?.round &&
              v?.position === state?.draftCounter?.position,
          )
        }
        return {
          ...state,
          draftCounter: payload,
          onTheClock: isTeam ? isTeam : null,
        }
      }
      case 'SET_ROUND_LOADING': {
        return {
          ...state,
          roundLoading: payload,
        }
      }
      case 'SET_COMPLETED': {
        return {
          ...state,
          completed: payload,
        }
      }
  
      default:
        return state
    }
  }
  
  export default draftReducer
  