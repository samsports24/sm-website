/**
 * Centralized Error Reporter
 *
 * Captures errors from:
 *  - React ErrorBoundary (componentDidCatch)
 *  - Global window.onerror / unhandledrejection
 *  - Axios interceptors (API errors)
 *
 * Currently logs to console + stores in sessionStorage for debugging.
 * To switch to Sentry later, just replace reportError() internals.
 *
 * Setup Sentry:
 *   npm install @sentry/react
 *   import * as Sentry from '@sentry/react'
 *   Sentry.init({ dsn: 'YOUR_DSN', environment: process.env.NODE_ENV })
 *   Then replace reportError body with: Sentry.captureException(error, { extra: context })
 */

const MAX_STORED_ERRORS = 50

export const reportError = (error, context = {}) => {
  const errorEntry = {
    message: error?.message || String(error),
    stack: error?.stack || null,
    context,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    userId: localStorage.getItem('userId') || null,
  }

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorReporter]', errorEntry)
  }

  // Store in sessionStorage for debugging (accessible via DevTools)
  try {
    const stored = JSON.parse(sessionStorage.getItem('errorLog') || '[]')
    stored.push(errorEntry)
    if (stored.length > MAX_STORED_ERRORS) stored.shift()
    sessionStorage.setItem('errorLog', JSON.stringify(stored))
  } catch (e) {
    // sessionStorage full or unavailable, silently ignore
  }

  // ═══ SENTRY INTEGRATION (uncomment when ready) ═══
  // import * as Sentry from '@sentry/react'
  // Sentry.captureException(error, { extra: context })
}

/**
 * Initialize global error listeners.
 * Call this once in your app entry point (index.js or App.js).
 */
export const initErrorReporting = () => {
  // Catch unhandled JS errors
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason || new Error('Unhandled Promise Rejection'), {
      source: 'unhandledrejection',
    })
  })
}

/**
 * Axios error interceptor, attach to your API instances.
 * Usage: attachAxiosErrorReporting(privateAPI)
 */
export const attachAxiosErrorReporting = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      reportError(error, {
        source: 'axios',
        url: error?.config?.url,
        method: error?.config?.method,
        status: error?.response?.status,
        data: error?.response?.data?.message || null,
      })
      return Promise.reject(error)
    }
  )
}

/**
 * Get stored error log (for debugging in DevTools console).
 * Usage: window.__getErrorLog()
 */
if (typeof window !== 'undefined') {
  window.__getErrorLog = () => {
    try {
      return JSON.parse(sessionStorage.getItem('errorLog') || '[]')
    } catch {
      return []
    }
  }
}
