const initialState = {
  currentLeague: null,
  userLeagues: [],
  loading: false,
  error: null,
}

const soccerLeagueReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SOCCER_LEAGUE':
      return { ...state, currentLeague: action.payload, error: null }
    case 'SET_SOCCER_LEAGUES':
      return { ...state, userLeagues: action.payload, error: null }
    case 'SOCCER_LEAGUE_LOADING':
      return { ...state, loading: action.payload }
    case 'SOCCER_LEAGUE_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'REMOVE_SOCCER_LEAGUE':
      return initialState
    default:
      return state
  }
}

export default soccerLeagueReducer
