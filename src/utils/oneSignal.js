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
const APP_ID = process.env.REACT_APP_ONESIGNAL_APP_ID || '539b00b9-24ea-49ab-8dd6-dd33c371e574'

// Where the service worker lives, and what it is allowed to control.
//
// NOT the site root. At the root the worker's scope is "/" and it sits in front
// of every request the app makes; in Chrome it swallowed the hub's API calls
// (empire counts 0, no backend requests at all) and broke the soccer login.
// Under /push/onesignal/ it controls only pages below that path, which is none,
// while still receiving push events - the browser hands those to the worker
// directly rather than through a page.
//
// These two must agree with each other and with where the file actually sits in
// public/. The scope must be at or below the worker's own directory.
// ── CUSTOM CODE, NOT TYPICAL SITE ────────────────────────────────────────
//
// OneSignal has two integration modes and they read different configuration:
//
//   Typical Site  the dashboard's "Customize service worker paths and
//                 filenames" fields decide where the worker is. Anything
//                 passed to init() is IGNORED.
//   Custom Code   serviceWorkerPath and serviceWorkerParam below decide.
//                 The dashboard's path fields are IGNORED.
//
// Their documentation says it outright: "Mixing the two does not work:
// dashboard path fields do not apply to Custom Code, and serviceWorkerPath
// does not apply to Typical Site."
//
// We were set up as both. The SDK script is loaded by hand in
// public/index.html and init() is called here, which is the Custom Code
// shape, while the dashboard also had the customize fields filled in. On
// 18 Sep 2026 optIn() and requestPermission() hung forever with no error,
// while a raw pushManager.subscribe() with the same VAPID key on the same
// worker succeeded first try - the shape of a page waiting on a worker
// registration that is not the one it thinks it has.
//
// So: this app is CUSTOM CODE. These two constants are the only place the
// worker's path and scope are set. If somebody ticks "Customize service
// worker paths" in the dashboard again, it will not take effect and it will
// make this file look like it is lying. Leave it off.
const SW_PATH = 'push/onesignal/OneSignalSDKWorker.js'
const SW_SCOPE = '/push/onesignal/'

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
          serviceWorkerPath: SW_PATH,
          serviceWorkerParam: { scope: SW_SCOPE },
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
