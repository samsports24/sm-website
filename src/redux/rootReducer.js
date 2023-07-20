import { combineReducers } from 'redux'

import theme from './reducers/themeReducer'

const rootReducer = combineReducers({
  theme,
})

export default rootReducer
