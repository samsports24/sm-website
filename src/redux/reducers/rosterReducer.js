const initialState = {
  isLoading: true,
  data: {
    playerCaps: null,
    active: [],
    practice: [],
    nonActivePlayer: [],
    protectedPlayer: [],
    retired: [],
  },
}

const rosterReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
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
        },
      }
    }
    default:
      return state
  }
}

export default rosterReducer
