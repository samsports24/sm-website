import { useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { googleLogin, facebookLogin } from '../redux/actions/authActions'

// Public OAuth identifiers (safe to expose in the bundle).
//   REACT_APP_GOOGLE_CLIENT_ID  — Google Cloud OAuth "Web" client ID
//   REACT_APP_FACEBOOK_APP_ID   — Meta app ID
// Each button only renders if its ID is configured, so the page degrades
// gracefully before you've set them.
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || ''
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || ''

// Load an external script once (by id) and resolve when ready.
const loadScript = (src, id) =>
  new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.id = id
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })

const SocialLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const googleBtnRef = useRef(null)

  // Google Identity Services returns a signed ID token in response.credential;
  // the backend verifies it against GOOGLE_CLIENT_ID before trusting it.
  const onGoogle = useCallback(
    (response) => {
      if (response && response.credential) {
        dispatch(googleLogin(response.credential, navigate))
      }
    },
    [dispatch, navigate]
  )

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadScript('https://accounts.google.com/gsi/client', 'gsi-script')
      .then(() => {
        if (cancelled || !window.google || !googleBtnRef.current) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: onGoogle,
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'center',
          width: 300,
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [onGoogle])

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'fb-sdk')
      .then(() => {
        if (window.FB) {
          window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' })
        }
      })
      .catch(() => {})
  }, [])

  const onFacebook = () => {
    if (!window.FB) return
    window.FB.login(
      (resp) => {
        if (resp && resp.authResponse && resp.authResponse.accessToken) {
          dispatch(facebookLogin(resp.authResponse.accessToken, navigate))
        }
      },
      { scope: 'public_profile,email' }
    )
  }

  if (!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID) return null

  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '14px 0',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
          letterSpacing: 1,
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        OR
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
      </div>

      {GOOGLE_CLIENT_ID && (
        <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }} />
      )}

      {FACEBOOK_APP_ID && (
        <button
          type="button"
          onClick={onFacebook}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 24,
            border: 'none',
            cursor: 'pointer',
            background: '#1877F2',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
          </svg>
          Continue with Facebook
        </button>
      )}
    </div>
  )
}

export default SocialLogin
