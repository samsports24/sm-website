import { useEffect, useRef } from 'react'
import { PlayerImagesProvider } from '../components/PlayerAvatar'
import { useDispatch, useSelector } from 'react-redux'
import 'antd/dist/reset.css'

import '../styles/style.css'
import Routes from './Routes'
// FloatingChat removed – chat notifications now shown in sidebar badge
// import FloatingChat from '../components/FloatingChat'
import HubChatDock from '../components/PlatformChat/HubChatDock'
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
import { getUserLeagues, ensureActiveLeague } from '../redux/actions/leagueActions'
import { initOneSignal } from '../utils/oneSignal'
// AnnouncementBanner moved inside Routes.js (must be inside BrowserRouter)
// RotateHint moved there too, and for the same reason: it now reads the path
// with useLocation to stay off the public pages, and useLocation outside a
// Router throws - which took the whole app to a blank screen.

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

  // Boot: clear the worker that broke the hub, then start push.
  //
  // The old OneSignal worker was registered at the site root, so its scope was
  // "/" and it sat in front of every request the app made. In Chrome it stopped
  // the hub's API calls from completing — empire counts came back 0, the site
  // made no backend requests at all — and it broke the soccer app's login.
  // Safari was unaffected, which is why it went unnoticed for a while.
  //
  // So this used to unregister EVERY service worker on every boot. That healed
  // the browsers that were stuck, and it is still needed: anybody who loaded the
  // site before 27 August may still be carrying that root-scoped worker.
  //
  // But "unregister everything" cannot stay, because it would also kill the new
  // one a moment after it registers. So it now removes only workers whose scope
  // covers the app itself, and leaves anything scoped under /push/ alone. A
  // worker that cannot control a page the app uses cannot intercept its calls,
  // which was the whole fault.
  //
  // Push is started after that, so the cleanup can never race the registration.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    const startPush = () => { try { initOneSignal() } catch (e) { /* never block boot */ } }

    navigator.serviceWorker.getRegistrations()
      .then((regs) => Promise.all(
        regs.map((r) => {
          const scope = (r.scope || '')
          // Keep the scoped push worker. Remove anything that controls the app.
          if (scope.includes('/push/')) return Promise.resolve(false)
          return r.unregister().catch(() => false)
        })
      ))
      .then(startPush)
      .catch(startPush)
  }, [])

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
      // Load the user, then if no active league is selected but they belong to
      // one, silently activate it so the app isn't stuck on "select a league first."
      Promise.resolve(dispatch(getUser()))
        .then(() => ensureActiveLeague())
        .catch(() => {})
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
    {/* Platform-wide community chat, docked right on every authenticated page.
        It used to be mounted ONLY inside pages/SportHub, which meant the
        "global" chat existed on /hub and nowhere else — navigate anywhere and
        the community disappeared. Soccer has always mounted it app-wide; this
        brings NFL in line. Starts collapsed (a slim tab on the right edge) so it
        doesn't reflow pages until the user opens it. */}
    {authenticatedID && <HubChatDock />}
    <SamAIChat />
    <PasswordChangeModal />
    </div>
  </PlayerImagesProvider>)
}

export default App
