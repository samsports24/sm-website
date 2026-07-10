const initialState = {
  isLoading: true,
  roasterdraftdata:null,
  roasterroundandpick:null,
  data: {
    playerCaps: null,
    active: [],
    practice: [],
    nonActivePlayer: [],
    protectedPlayer: [],
    retired: [],
    filterActiveRoster: [],
    filterNonActiveRoster: [],
    filterPracticeRoster: [],
    filterProtectedRoster: [],
  },
}

const rosterReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_ROSTER_LOADING': {
      return {
        ...state,
        isLoading: payload,
      }
    }
    case 'SET_ROSTERS': {
      let _nonActivePlayer = []
      payload?.active?.forEach((v) => {
        if (v?.players?.isActive !== true) {
          _nonActivePlayer.push(v?.players?.PlayerID)
        }
      })
      let _protectedPlayer = []
      payload?.practice?.forEach((v) => {
        if (v?.players?.isPlayerProtected == true) {
          _protectedPlayer.push(v?.players?.PlayerID)
        }
      })
      return {
        ...state,
        data: {
          
          ...payload,
          nonActivePlayer: _nonActivePlayer,
          protectedPlayer: _protectedPlayer,
          filterActiveRoster: payload?.active?.filter((x) => x?.players?.isActive === true),
          filterNonActiveRoster: payload?.active?.filter((x) => x?.players?.isActive !== true),
          filterPracticeRoster: payload?.practice?.filter(
            (x) => x?.players?.isPlayerProtected !== true,
          ),
          filterProtectedRoster: payload?.practice?.filter(
            (x) => x?.players?.isPlayerProtected === true,
          ),
        },
      }
    }



    case 'SET_DRAFT_ROSTERS': {

      let _nonActivePlayer = []
      payload?.active?.forEach((v) => {
        if (v?.players?.isActive !== true) {
          _nonActivePlayer.push(v?.players?.PlayerID)
        }
      })
      let _protectedPlayer = []
      payload?.practice?.forEach((v) => {
        if (v?.players?.isPlayerProtected == true) {
          _protectedPlayer.push(v?.players?.PlayerID)
        }
      })

      return {
        ...state,
        roasterdraftdata: payload,
      }
    }

    case 'SET_ROSTERS_PICK_ROUND':{
      return {
        ...state,
        roasterroundandpick: payload,
      }

    }
  
    default:
      return state
  }
}

export default rosterReducer
