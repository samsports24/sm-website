/**
 * Analytics Tracker — sm-website (landing page + admin)
 */

const API_URL = process.env.REACT_APP_SOCCER_API || "https://soccerbackend.samsports.io/api/v1";
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
let sessionStartTime = Date.now();
let lastPath = null;

const getDevice = () => {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};

const detectPlatform = (path) => {
  if (!path) return "landing";
  if (path.startsWith("/admin")) return "admin";
  return "landing";
};

const send = (body) => {
  try {
    if (body.type === "session_end" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      navigator.sendBeacon(`${API_URL}/analytics/event`, blob);
      return;
    }
    fetch(`${API_URL}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};

export const trackPageView = (path) => {
  if (path === lastPath) return;
  lastPath = path;
  send({
    type: "page_view",
    sessionId: SESSION_ID,
    platform: detectPlatform(path),
    sport: "general",
    path,
    referrer: document.referrer || null,
    device: getDevice(),
  });
};

export const trackSessionEnd = () => {
  const duration = Math.round((Date.now() - sessionStartTime) / 1000);
  send({
    type: "session_end",
    sessionId: SESSION_ID,
    platform: detectPlatform(window.location.pathname),
    duration,
    device: getDevice(),
  });
};

// Auto-init
send({
  type: "session_start",
  sessionId: SESSION_ID,
  platform: detectPlatform(window.location.pathname),
  device: getDevice(),
  path: window.location.pathname,
});

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", trackSessionEnd);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") trackSessionEnd();
  });
}
