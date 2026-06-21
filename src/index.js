import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './config/App'
import { Provider } from 'react-redux'
import { ConfigProvider, theme as antTheme } from 'antd'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { LanguageProvider } from './i18n/LanguageContext'
import { PartnerProvider } from './contexts/PartnerContext'

import store from './redux/store'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <Provider store={store}>
    <ConfigProvider
      theme={{
        algorithm: antTheme.darkAlgorithm,
        token: {
          colorPrimary: '#22C55E',
          colorBgContainer: '#1a1d2e',
          colorBgElevated: '#1e2235',
          colorBorder: 'rgba(255,255,255,0.1)',
          colorText: '#e2e8f0',
          colorTextSecondary: 'rgba(255,255,255,0.5)',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        components: {
          DatePicker: {
            cellActiveWithRangeBg: 'rgba(34,197,94,0.15)',
            cellHoverBg: 'rgba(34,197,94,0.12)',
            cellRangeBorderColor: '#22C55E',
            activeBorderColor: '#22C55E',
            hoverBorderColor: '#22C55E',
          },
          TimePicker: {
            activeBorderColor: '#22C55E',
            hoverBorderColor: '#22C55E',
          },
          Select: {
            optionSelectedBg: 'rgba(34,197,94,0.15)',
          },
          Input: {
            activeBorderColor: '#22C55E',
            hoverBorderColor: '#22C55E',
          },
          InputNumber: {
            activeBorderColor: '#22C55E',
            hoverBorderColor: '#22C55E',
          },
        },
      }}
    >
      <ErrorBoundary>
        <PartnerProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </PartnerProvider>
      </ErrorBoundary>
    </ConfigProvider>
  </Provider>,
)
