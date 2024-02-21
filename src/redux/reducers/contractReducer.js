const initialState = {
  address : null,
  balance : null
  }
  
  const contractReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
      case 'SET_ADDRESS_AND_BALANCE': {
        return {
          ...state,
          address : payload.address,
          balance : payload.balance
        }
      }
      default:
        return state
    }
  }
  
  export default contractReducer
  