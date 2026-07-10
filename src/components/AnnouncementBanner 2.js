/**
 * AnnouncementBanner — Global banner for admin announcements
 *
 * Fetches active announcements from both backends (public, no auth)
 * and displays them at the top of the page. Supports:
 *   - Types: info (blue), warning (amber), urgent (red), success (green)
 *   - Targets: all, soccer, nfl, rivals_soccer, rivals_nfl
 *   - Page targeting: all_pages, rivals, dashboard, home
 *   - Display modes: persistent (session dismiss), one_click (remembered in localStorage)
 *   - Expiry dates: auto-hides when expired
 *   - Real-time deletion: banners removed by admin disappear on next fetch
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getActiveAnnouncements } from "../services/adminService";

const TYPE_STYLES = {
  info: {
    bg: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)",
    border: "#3b82f6",
    icon: "ℹ️",
    text: "#93c5fd",
  },
  warning: {
    bg: "linear-gradient(135deg, #4a3728 0%, #1e293b 100%)",
    border: "#f59e0b",
    icon: "⚠️",
    text: "#fcd34d",
  },
  urgent: {
    bg: "linear-gradient(135deg, #5a1e1e 0%, #1e293b 100%)",
    border: "#ef4444",
    icon: "🚨",
    text: "#fca5a5",
  },
  success: {
    bg: "linear-gradient(135deg, #1e3a2a 0%, #1e293b 100%)",
    border: "#22c55e",
    icon: "✅",
    text: "#86efac",
  },
};

// Get permanently dismissed banner IDs from localStorage
const getPermanentDismissals = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem("dismissedBanners") || "[]"));
  } catch {
    return new Set();
  }
};

const savePermanentDismissal = (id) => {
  try {
    const current = getPermanentDismissals();
    current.add(id);
    localStorage.setItem("dismissedBanners", JSON.stringify([...current]));
  } catch {
    // Silently fail
  }
};

// Check which page category the current route matches
const getPageCategory = (pathname) => {
  if (pathname.startsWith("/rivals")) return "rivals";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/" || pathname === "/home") return "home";
  return "other";
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [sessionDismissed, setSessionDismissed] = useState(new Set());
  const location = useLocation();

  // Only show announcements to authenticated users (not on public landing page)
  const isAuthenticated = !!localStorage.getItem("token");

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await getActiveAnnouncements();
      if (Array.isArray(data)) {
        // Always update — this ensures admin-deleted banners disappear
        setAnnouncements(data);
      }
    } catch {
      // Silently fail — announcements are non-critical
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    // Re-fetch every 60 seconds so admin deletions appear quickly
    const interval = setInterval(fetchAnnouncements, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const dismiss = (ann) => {
    const id = ann._id;
    if (ann.displayMode === "one_click") {
      // Permanently dismiss — remembered across sessions
      savePermanentDismissal(id);
    }
    // Always dismiss for current session
    setSessionDismissed((prev) => new Set([...prev, id]));
  };

  const permanentDismissals = getPermanentDismissals();
  const currentPage = getPageCategory(location.pathname);
  const now = Date.now();

  // Filter announcements
  const visible = announcements.filter((a) => {
    // Already dismissed this session
    if (sessionDismissed.has(a._id)) return false;
    // Permanently dismissed (one_click mode)
    if (permanentDismissals.has(a._id)) return false;
    // Not active
    if (a.isActive === false) return false;
    // Expired
    if (a.expiresAt && new Date(a.expiresAt).getTime() < now) return false;
    // Page targeting
    const pt = a.pageTarget || "all_pages";
    if (pt !== "all_pages" && pt !== currentPage) return false;
    return true;
  });

  // Don't show banners to unauthenticated users (public/landing pages)
  if (!isAuthenticated) return null;
  if (visible.length === 0) return null;

  return (
    <div style={{ position: "relative", zIndex: 900, width: "100%" }}>
      {visible.map((ann) => {
        const style = TYPE_STYLES[ann.type] || TYPE_STYLES.info;
        return (
          <div
            key={ann._id}
            style={{
              background: ann.imageUrl ? "transparent" : style.bg,
              borderBottom: `1px solid ${style.border}44`,
              padding: ann.imageUrl ? 0 : "10px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 42,
              position: "relative",
            }}
          >
            {ann.imageUrl ? (
              <div style={{ position: "relative", width: "100%" }}>
                <img
                  src={ann.imageUrl}
                  alt={ann.text || "Announcement"}
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {ann.text && ann.text !== "(image banner)" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                      padding: "16px 20px 8px",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {ann.text}
                  </div>
                )}
              </div>
            ) : (
              <>
                <span style={{ fontSize: 16 }}>{style.icon}</span>
                <span
                  style={{
                    color: style.text,
                    fontSize: 13,
                    fontWeight: 600,
                    flex: 1,
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  {ann.text}
                </span>
              </>
            )}
            {!ann.imageUrl && ann.target && ann.target !== "all" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: `${style.border}22`,
                  color: style.border,
                  border: `1px solid ${style.border}33`,
                  whiteSpace: "nowrap",
                }}
              >
                {ann.target.replace("_", " ")}
              </span>
            )}
            <button
              onClick={() => dismiss(ann)}
              style={{
                background: ann.imageUrl ? "rgba(0,0,0,0.5)" : "transparent",
                border: "none",
                color: ann.imageUrl ? "#fff" : style.text,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: ann.imageUrl ? "2px 6px" : "0 4px",
                borderRadius: ann.imageUrl ? 6 : 0,
                opacity: 0.6,
                flexShrink: 0,
                position: ann.imageUrl ? "absolute" : "static",
                top: ann.imageUrl ? 6 : "auto",
                right: ann.imageUrl ? 6 : "auto",
                zIndex: 2,
              }}
              title={ann.displayMode === "one_click" ? "Dismiss permanently" : "Dismiss"}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
