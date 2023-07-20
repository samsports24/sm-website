import React from 'react'
import ReactDOM from 'react-dom'
import App from './config/App'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'

import store from './redux/store'

ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F55139',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </Provider>,
  document.getElementById('root'),
)
