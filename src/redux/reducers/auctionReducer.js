const initialState = {
  isLoading: true,
  data: null,
}

const auctionReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_AUCTION_LOADING': {
      return {
        ...state,
        isLoading: payload,
      }
    }
    case 'SET_AUCTIONS': {
      return {
        ...state,
        data: payload,
      }
    }
    case 'SET_AUCTION_PLAYER': {
      let TempAllAuction = [...state?.data?.allAuctions]
      let TempMyAuction = [...state?.data?.myAuctions]
      const isExistInAllAuc = TempAllAuction.findIndex((v) => v?._id === payload?._id)
      const isExistInMyAuc = TempMyAuction.findIndex((v) => v?._id === payload?._id)

      if (isExistInAllAuc !== -1) {
        TempAllAuction[isExistInAllAuc] = { ...payload, player: payload?.player_id }
      } else {
        TempMyAuction[isExistInMyAuc] = { ...payload, player: payload?.player_id }
      }
      return {
        ...state,
        data: {
          ...state.data,
          allAuctions: TempAllAuction,
          myAuctions: TempMyAuction,
        },
      }
    }
    default:
      return state
  }
}

export default auctionReducer
