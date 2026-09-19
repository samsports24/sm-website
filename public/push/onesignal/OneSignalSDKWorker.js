// OneSignal's service worker, deliberately NOT at the site root, with one line
// of our own in front of the import. Both parts matter.
//
// ── WHY NOT THE ROOT ─────────────────────────────────────────────────────
// At the root its scope is "/" and it sees every fetch the app makes. In Chrome
// that broke us: the app's own API calls were intercepted and never completed,
// session restore timed out and dumped the user on onboarding. Push was
// switched off on 27 Aug 2026 rather than risk a login that won't load. Here
// its scope is /push/onesignal/, which controls no page anybody visits, while
// push still arrives - the browser hands a push event to the worker directly
// rather than through a page. The path and scope are set in
// src/utils/oneSignal.js, and ONLY there. This app is a Custom Code
// integration, so the dashboard's service worker path fields do not apply and
// must be left switched off - their own documentation says mixing the two
// does not work.
//
// ── WHY THE EMPTY LISTENER BELOW ─────────────────────────────────────────
// Subscribing does not happen on the page. The page posts a "Subscribe"
// command to this worker and waits for the reply. OneSignal registers the
// worker's message listener inside a setTimeout(..., 0):
//
//     setTimeout(() => { Ct.F(), Ct.R(St, async t => { ...subscribe... }) }, 0)
//
// which is after initial evaluation, and Chrome 151 refuses to start a worker
// for a message handler registered that late. It says so outright:
//
//     Event handler of 'message' event must be added on the initial
//     evaluation of worker script.
//
// So the command was never delivered and the page's wait never ended. On
// 18 Sep 2026 that presented as OneSignal.User.PushSubscription.optIn() and
// Notifications.requestPermission() hanging forever with no error - while a
// raw pushManager.subscribe() with the same VAPID key on this same worker
// succeeded first time.
//
// This listener does nothing. It exists so a message handler is present during
// initial evaluation, which is what Chrome requires before it will start the
// worker and dispatch - by which point OneSignal's own listener is registered
// and receives the command too.
self.addEventListener('message', () => {});

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
