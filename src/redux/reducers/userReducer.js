const initialState = {
  userDetails: null,
  setting: {
    week: localStorage.getItem('week'),
  },
}

const userReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_USER_DETAILS': {
      return {
        ...state,
        userDetails: payload?.user,
        setting: payload?.setting,
      }
    }
    default:
      return state
  }
}

export default userReducer
