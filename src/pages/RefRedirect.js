import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Handles referral links: samsports.io/ref/<code>.
// Stashes the code so the signup flow can attribute the referrer, then bounces
// the visitor onward — to the dashboard if they're already logged in, otherwise
// to the signup entry point. Renders nothing.
const RefRedirect = () => {
  const { code } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      if (code) localStorage.setItem('samsports_ref', code)
    } catch (e) {
      /* storage may be unavailable (private mode) — attribution just won't stick */
    }

    let loggedIn = false
    try {
      loggedIn = !!(localStorage.getItem('token') || localStorage.getItem('authToken'))
    } catch (e) {
      loggedIn = false
    }

    navigate(loggedIn ? '/dashboard' : '/select-game', { replace: true })
  }, [code, navigate])

  return null
}

export default RefRedirect
