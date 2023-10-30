const getInitSection = (currentWeek) => {
  return currentWeek >= 1 && currentWeek <= 4
    ? 1
    : currentWeek >= 5 && currentWeek <= 8
    ? 2
    : currentWeek >= 9 && currentWeek <= 12
    ? 3
    : currentWeek >= 13 && currentWeek <= 16
    ? 4
    : currentWeek >= 17 && currentWeek <= 18
    ? 5
    : 1
}

const initialState = {
  userDetails: null,
  currentWeek: localStorage.getItem('week'),
  weekSection: getInitSection(localStorage.getItem('week')),
  setting: {
    week: localStorage.getItem('week'),
    isGameLocked: false,
  },
  teamSalaryCap: 0,
  record: null,
  notificationCount: null,
}

const userReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_USER_DETAILS': {
      return {
        ...state,
        userDetails: payload?.user,
        currentWeek: payload?.setting?.week,
        weekSection: getInitSection(payload?.setting?.week),
        record: payload?.record,
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
        weekSection: getInitSection(payload),
        setting: {
          ...state?.setting,
          week: payload,
        },
      }
    }
    case 'UPDATE_SECTION': {
      return {
        ...state,
        weekSection: payload,
      }
    }
    case 'SET_NOTIFICATION_COUNT': {
      return {
        ...state,
        notificationCount: payload,
      }
    }
    default:
      return state
  }
}

export default userReducer
