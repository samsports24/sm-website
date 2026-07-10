const initialState = {
    socket: null,
  }
  
  const socketReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
      case 'SET_SOCKET':
        return {
          ...state,
          socket: payload,
        }
  
      default:
        return state
    }
  }
  
  export default socketReducer
  