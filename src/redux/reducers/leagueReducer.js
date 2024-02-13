const initialState = {
    userLeagues: [],
    nonUserLeagues : []
  }
  
  const leagueReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
      case 'GET_USER_LEAGUES': {
        return {
          ...state,
          userLeagues: payload?.userLeagues,
          nonUserLeagues : payload?.nonUserLeagues
        }
      }
      default:
        return state
    }
  }
  
  export default leagueReducer
  