const initialState = {
  isLoading: false,
}

const transactionReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_TRANSACTION_LOADING': {
      return {
        ...state,
        isLoading: payload,
      }
    }

    default:
      return state
  }
}

export default transactionReducer
