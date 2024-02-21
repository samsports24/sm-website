const initialState = {
  userLeagues: [],
  nonUserLeagues: [],
  currentLeague: [],
}

const leagueReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'GET_USER_LEAGUES': {
      return {
        ...state,
        userLeagues: payload?.userLeagues,
        nonUserLeagues: payload?.nonUserLeagues,
      }
    }
    case 'SET_LEAGUES': {
      return {
        ...state,
        currentLeague: payload,
      }
    }
    case 'REMOVE_LEAGUES': {
      return {
        ...state,
        userLeagues: [],
        nonUserLeagues: [],
        currentLeague: [],
      }
    }
    default:
      return state
  }
}

export default leagueReducer
