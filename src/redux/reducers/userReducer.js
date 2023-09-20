const initialState = {
  userDetails: null,
  currentWeek: localStorage.getItem('week'),
  setting: {
    week: localStorage.getItem('week'),
    isGameLocked: false,
  },
  teamSalaryCap: 0,
}

const userReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_USER_DETAILS': {
      return {
        ...state,
        userDetails: payload?.user,
        currentWeek: payload?.setting?.week,
        setting: {
          ...state?.setting,
          week: payload?.setting?.week,
          isGameLocked: payload?.setting?.isGameLocked,
        },
        teamSalaryCap: payload?.teamSalaryCap,
      }
    }
    case 'UPDATE_WEEK': {
      return {
        ...state,
        setting: {
          ...state?.setting,
          week: payload,
        },
      }
    }
    default:
      return state
  }
}

export default userReducer
