// OneSignal (web push) — thin wrapper around the v16 Web SDK.
//
// Setup: the SDK script is loaded in public/index.html, and OneSignal hosts the
// service worker (public/OneSignalSDKWorker.js just imports theirs).
//
// The backend targets a user by their id as OneSignal's "external id", so after
// login we call OneSignal.login(userId). On this site the user id lives in
// localStorage under 'userId'.

// The App ID is public (it ships in the client bundle regardless), so we default
// it here — no build-time env var needed. NFL and Soccer share one OneSignal app.
// An env var still overrides it if you ever point a build at a different app.
const APP_ID = process.env.REACT_APP_ONESIGNAL_APP_ID || '042e5db5-0ab9-493e-8ddd-63e713ab7588'

let initPromise = null

// OneSignal v16 uses a deferred queue: push a function and it runs once the SDK
// is ready, whether that's before or after this call.
function withOneSignal(fn) {
  if (!APP_ID) return
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(fn)
}

export function initOneSignal() {
  if (!APP_ID || initPromise) return initPromise
  initPromise = new Promise((resolve) => {
    withOneSignal(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: APP_ID,
          allowLocalhostAsSecureOrigin: true,
        })
        // If a user id is already stored, link this device to them.
        const uid = localStorage.getItem('userId')
        if (uid) {
          try { await OneSignal.login(String(uid)) } catch (e) { /* already linked */ }
        }
      } catch (e) {
        // init throws if called twice; harmless.
      }
      resolve(OneSignal)
    })
  })
  return initPromise
}

// Associate this device with the signed-in user so the backend can push by id.
export function linkOneSignalUser(userId) {
  const uid = userId || localStorage.getItem('userId')
  if (!APP_ID || !uid) return
  withOneSignal(async (OneSignal) => {
    try { await OneSignal.login(String(uid)) } catch (e) { /* not ready / already linked */ }
  })
}

export function logoutOneSignal() {
  if (!APP_ID) return
  withOneSignal(async (OneSignal) => {
    try { await OneSignal.logout() } catch (e) { /* noop */ }
  })
}

// Ask the browser for notification permission (must be a user gesture). Returns
// true if the user is now opted in.
export async function promptOneSignal() {
  if (!APP_ID) return false
  const OneSignal = await initOneSignal()
  if (!OneSignal) return false
  // Fire the request but DON'T await it — OneSignal's promise can hang (e.g. when
  // the domain isn't configured in the OneSignal app). Instead we poll the real
  // browser permission state, so the caller never gets stuck on "Enabling…".
  try { OneSignal.Notifications.requestPermission() } catch (e) { /* ignore */ }
  const perm = () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  for (let i = 0; i < 24; i++) { // up to ~12s
    if (perm() === 'granted') return true
    if (perm() === 'denied') return false
    await new Promise((r) => setTimeout(r, 500))
  }
  return perm() === 'granted'
}

export function oneSignalConfigured() {
  return !!APP_ID
}

// Has the user already granted permission?
export async function oneSignalPermission() {
  if (!APP_ID) return 'default'
  const OneSignal = await initOneSignal()
  try {
    return OneSignal.Notifications.permission ? 'granted' : 'default'
  } catch (e) {
    return 'default'
  }
}
