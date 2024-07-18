const initialState = {
    allstadium: [],
    mystadium:{},

  }
  
  const stadiumReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
        case 'SET_ALL_STADIUM': {
          return {
            ...state,
            allstadium: payload,
          }
        }

        case 'SET_MY_STADIUM': {
          return {
            ...state,
            mystadium: payload,
          }
        }

        default:
          return state
      }



      
    }
    
    export default stadiumReducer
    