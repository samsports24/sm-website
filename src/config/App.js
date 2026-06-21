import { useEffect, useRef } from 'react'
import { PlayerImagesProvider } from '../components/PlayerAvatar'
import { useDispatch, useSelector } from 'react-redux'
import 'antd/dist/reset.css'

import '../styles/style.css'
import Routes from './Routes'
// FloatingChat removed – chat notifications now shown in sidebar badge
// import FloatingChat from '../components/FloatingChat'
import SamAIChat from '../components/SamAIChat'
import PasswordChangeModal from '../components/PasswordChangeModal'
import { light, dark } from './theme'
import { getUser } from '../redux'
import { version, base_url } from './constants'
import { notification } from 'antd'
import io from 'socket.io-client'
import { setSocket } from '../redux/actions/socketAction'
import { initErrorReporting } from '../utils/errorReporter'
import { trackPageView } from '../utils/analytics'
import { getUserLeagues } from '../redux/actions/leagueActions'
// AnnouncementBanner moved inside Routes.js (must be inside BrowserRouter)

// Initialize global error listeners (window.onerror, unhandledrejection)
initErrorReporting()

const App = () => {
  const theme = useSelector((state) => state.theme.theme)
  const dispatch = useDispatch()
  const socketRef = useRef(null);
  const authenticatedID = localStorage.getItem('userId')

  // Socket.io, single connection lifecycle
  useEffect(() => {
    if (!authenticatedID) return

    // Create socket only once per authenticated session
    if (!socketRef.current) {
      socketRef.current = io(base_url, {
        auth: { token: localStorage.getItem('token') },
        reconnection: true,
        reconnectionAttempts: Infinity, // Dynasty drafts can last 2+ days — never give up
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30000,    // Back off to max 30s between attempts
      })
    }

    const socket = socketRef.current
    socket.emit('join', authenticatedID)
    dispatch(setSocket(socket))

    // Re-join on reconnect
    const handleReconnect = () => {
      socket.emit('join', authenticatedID)
    }
    socket.on('reconnect', handleReconnect)

    return () => {
      socket.off('reconnect', handleReconnect)
      socket.disconnect()
      socketRef.current = null
    }
  }, [authenticatedID, dispatch]);

  useEffect(() => {
    if (theme === 'light') {
      Object.keys(light).forEach((key) => {
        document.body.style.setProperty(`--${key}`, light[key])
      })
    } else {
      Object.keys(dark).forEach((key) => {
        document.body.style.setProperty(`--${key}`, dark[key])
      })
    }
  }, [theme])

  // Pick up cross-sport auth token from URL (e.g., ?token=xxx from soccer app)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')
    if (tokenFromUrl) {
      // TODO: Migrate to httpOnly cookies (requires backend cookie support)
      // This should be replaced with a backend-set httpOnly cookie for better security
      localStorage.setItem('token', tokenFromUrl)
      // Clean the URL so token isn't visible in browser bar
      const cleanUrl = window.location.pathname + (window.location.hash || '')
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [])

  useEffect(() => {
    // Version check is handled in Routes.js — only fetch user data here
    if (localStorage.getItem('token')) {
      dispatch(getUser())
      // Fetch user leagues on app initialization
      try {
        getUserLeagues().catch(() => {
          // Silently fail - leagues are optional for app startup
        })
      } catch (err) {
        console.error('[App.js] Failed to fetch leagues on init:', err?.message)
      }
    }
  }, [dispatch])

  const handleExit = () => {
    const originalToken = localStorage.getItem("originalToken");
    if (originalToken) {
      localStorage.setItem("token", originalToken);
      localStorage.removeItem("originalToken");
      window.location.href = "/commissioner"; // redirect back
    }
  };

  return (
  <PlayerImagesProvider>
  <div>
    {localStorage.getItem("originalToken") &&
     <div style={{height: '50px', background: 'orange', position: 'fixed', top: 0, width: '100%', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
      <span>Logged in as Commissioner.</span>
      <button style={{marginLeft: '10px', padding: '5px 10px', cursor: 'pointer', position: 'fixed', right: '10px'}} onClick={handleExit}>Exit</button>
    </div>}
    <Routes />
    {/* FloatingChat removed – notifications handled by sidebar badge */}
    <SamAIChat />
    <PasswordChangeModal />
    </div>
  </PlayerImagesProvider>)
}

export default App
