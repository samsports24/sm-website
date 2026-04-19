const initialState = {
  loading: false,
  // Postseason bracket & seeding state
  state: null,
  // Supplemental draft pool
  pool: {
    players: [],
    total: 0,
    page: 1,
    limit: 25,
  },
  poolSearch: '',
  poolPosition: 'ALL',
  // Supplemental draft order
  draftOrder: null,
  // Player roster tags (gold/blue/eliminated)
  rosterTags: [],
  // Pre-pick queue
  draftQueue: [],
}

const postseasonReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_POSTSEASON_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_POSTSEASON_STATE':
      return { ...state, state: action.payload }

    case 'SET_SUPPLEMENTAL_POOL':
      return {
        ...state,
        pool: {
          players: action.payload?.pool || [],
          total: action.payload?.total || 0,
          page: action.payload?.page || 1,
          limit: action.payload?.limit || 25,
        },
      }

    case 'SET_SUPPLEMENTAL_DRAFT_ORDER':
      return { ...state, draftOrder: action.payload }

    case 'SET_ROSTER_TAGS':
      return { ...state, rosterTags: action.payload || [] }

    case 'SET_POOL_SEARCH':
      return { ...state, poolSearch: action.payload }

    case 'SET_POOL_POSITION':
      return { ...state, poolPosition: action.payload }

    case 'SET_POOL_PAGE':
      return {
        ...state,
        pool: { ...state.pool, page: action.payload },
      }

    case 'SET_SUPPLEMENTAL_DRAFT_QUEUE':
      return { ...state, draftQueue: action.payload || [] }

    default:
      return state
  }
}

export default postseasonReducer
