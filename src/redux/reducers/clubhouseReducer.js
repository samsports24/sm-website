const initialState = {
    clubhouse: [],

  }
  
  const clubhouseReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
        case 'SET_ALL_CLUBHOUSE': {
          return {
            ...state,
            clubhouse: payload,
          }
        }
        default:
          return state
      }
    }
    
    export default clubhouseReducer
    