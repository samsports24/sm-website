import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'
import user from './reducers/userReducer'

const rootReducer = combineReducers({
  theme,
  user,
})

export default rootReducer
