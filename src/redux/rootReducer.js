import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'
import user from './reducers/userReducer'
import depthChart from './reducers/depthChartReducer'
import roster from './reducers/rosterReducer'
import auction from './reducers/auctionReducer'
import transaction from './reducers/transactionReducer'
import leagueReducer from './reducers/leagueReducer'
import draft from './reducers/draftReducer'
import socket from './reducers/socketReducer'
import clubhouse from './reducers/clubhouseReducer'
import stadium  from './reducers/stadiumReducers'
import chat from "./reducers/chatReducer"
import postseason from "./reducers/postseasonReducer"
import rookieDraft from "./reducers/rookieDraftReducer"
import exchange from "./reducers/exchangeReducer"
import governance from "./reducers/governanceReducer"
// import stripepayment from './reducers/'

const appReducer = combineReducers({
  theme,
  user,
  depthChart,
  roster,
  auction,
  draft,
  socket,
  transaction,
  league : leagueReducer,
  clubhouse,
  stadium,
  chat,
  postseason,
  rookieDraft,
  exchange,
  governance,
})

// When switching leagues, reset ALL league-specific state to initial values
// Only theme and socket persist across league switches
const rootReducer = (state, action) => {
  if (action.type === 'RESET_LEAGUE_DATA') {
    // Keep user, theme, and socket, clear everything else
    const { user: userState, theme: themeState, socket: socketState } = state
    state = { user: userState, theme: themeState, socket: socketState }
  }
  return appReducer(state, action)
}

export default rootReducer
