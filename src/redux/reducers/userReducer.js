const initialState = {
  userDetails: null,
}

const userReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_USER_DETAILS': {
      return {
        ...state,
        userDetails: payload,
      }
    }
    default:
      return state
  }
}

export default userReducer
