import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'
import user from './reducers/userReducer'
import depthChart from './reducers/depthChartReducer'
import roster from './reducers/rosterReducer'
import auction from './reducers/auctionReducer'
import transaction from './reducers/transactionReducer'
import leagueReducer from './reducers/leagueReducer'

const rootReducer = combineReducers({
  theme,
  user,
  depthChart,
  roster,
  auction,
  transaction,
  league : leagueReducer
})

export default rootReducer
