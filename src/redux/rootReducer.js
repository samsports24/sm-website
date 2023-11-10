import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'
import user from './reducers/userReducer'
import depthChart from './reducers/depthChartReducer'
import roster from './reducers/rosterReducer'

const rootReducer = combineReducers({
  theme,
  user,
  depthChart,
  roster,
})

export default rootReducer
