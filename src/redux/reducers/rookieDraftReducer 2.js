const initialState = {
  loading: false,
  draftOrder: null,
  pool: {
    players: [],
    total: 0,
    page: 1,
    limit: 50,
  },
  draftQueue: [],
}

const rookieDraftReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ROOKIE_DRAFT_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ROOKIE_DRAFT_ORDER':
      return { ...state, draftOrder: action.payload }

    case 'SET_ROOKIE_POOL':
      return {
        ...state,
        pool: {
          players: action.payload?.players || [],
          total: action.payload?.total || 0,
          page: action.payload?.page || 1,
          limit: action.payload?.limit || 50,
        },
      }

    case 'SET_ROOKIE_DRAFT_QUEUE':
      return { ...state, draftQueue: action.payload || [] }

    default:
      return state
  }
}

export default rookieDraftReducer
