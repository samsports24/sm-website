const initialState = {
  currentTeam: null,
  userTeams: [],
  loading: false,
  error: null,
}

const soccerTeamReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SOCCER_TEAM':
      return { ...state, currentTeam: action.payload, error: null }
    case 'SET_SOCCER_TEAMS':
      return { ...state, userTeams: action.payload, error: null }
    case 'SOCCER_TEAM_LOADING':
      return { ...state, loading: action.payload }
    case 'SOCCER_TEAM_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'REMOVE_SOCCER_TEAM':
      return initialState
    default:
      return state
  }
}

export default soccerTeamReducer
