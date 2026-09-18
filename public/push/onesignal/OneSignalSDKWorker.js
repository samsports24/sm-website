// OneSignal's service worker, deliberately NOT at the site root.
//
// At the root its scope is "/" and it sees every fetch the app makes. In Chrome
// that broke us: the hub's own API calls were intercepted and never completed,
// empire counts came back 0, the site made no backend requests at all, and the
// soccer app's login stopped working. Safari was fine, which is why it took a
// while to spot. See commit 2388fa1, 27 August 2026.
//
// Hosted here, its scope is /push/onesignal/ and it can only control pages under
// that path - which is no page anybody visits. Push still works, because a push
// event is delivered to the worker by the browser rather than by a page, and it
// no longer sits in front of anything the app needs.
//
// The scope is set in src/utils/oneSignal.js via serviceWorkerParam. Both must
// agree, and the scope must be at or below this directory.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
