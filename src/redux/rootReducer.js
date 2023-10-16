import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'
import user from './reducers/userReducer'
import depthChart from './reducers/depthChartReducer'

const rootReducer = combineReducers({
  theme,
  user,
  depthChart,
})

export default rootReducer
