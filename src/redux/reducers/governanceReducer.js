import { GOVERNANCE_TYPES } from '../actions/governanceActions'

const initialState = {
  // Active governance votes
  activeVotes: [],
  activeVotesLoading: false,

  // Vote history
  history: [],

  // Commissioner info
  commissionerInfo: {
    mainCommissioner: null,
    leagueCommissioners: [],
    aiCommissionerActive: false,
    aiCommissionerSince: null,
    activeElectionId: null,
  },
}

const governanceReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case GOVERNANCE_TYPES.SET_ACTIVE_VOTES:
      return {
        ...state,
        activeVotes: payload || [],
      }

    case GOVERNANCE_TYPES.SET_ACTIVE_VOTES_LOADING:
      return {
        ...state,
        activeVotesLoading: payload,
      }

    case GOVERNANCE_TYPES.SET_GOVERNANCE_HISTORY:
      return {
        ...state,
        history: payload || [],
      }

    case GOVERNANCE_TYPES.SET_COMMISSIONER_INFO:
      return {
        ...state,
        commissionerInfo: payload || initialState.commissionerInfo,
      }

    case GOVERNANCE_TYPES.CLEAR_GOVERNANCE:
      return initialState

    default:
      return state
  }
}

export default governanceReducer
