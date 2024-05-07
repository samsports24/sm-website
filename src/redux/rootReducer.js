import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'
import user from './reducers/userReducer'
import depthChart from './reducers/depthChartReducer'
import roster from './reducers/rosterReducer'
import auction from './reducers/auctionReducer'
import transaction from './reducers/transactionReducer'
import leagueReducer from './reducers/leagueReducer'
import contract from './reducers/contractReducer'
import draft from './reducers/draftReducer'
import socket from './reducers/socketReducer'

const rootReducer = combineReducers({
  theme,
  user,
  depthChart,
  roster,
  auction,
  draft,
  socket,
  transaction,
  league : leagueReducer,
  contract
  
})

export default rootReducer
