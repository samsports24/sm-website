/**
 * Admin Panel Service Layer
 *
 * Wraps API calls to BOTH backends:
 *   NFL  → nflAdminAPI  (base: REACT_APP_API_URL / localhost:8000)
 *   Soccer → soccerAdminAPI (base: REACT_APP_SOCCER_API_URL / localhost:8001)
 *
 * Uses adminToken (separate from regular user JWT).
 */

import Axios from "axios";
import { publicAPI } from "../config/constants";
import { soccerPublicAPI } from "../soccer/config/constants";

const nflBase = process.env.REACT_APP_API_URL || "https://backend.samsports.io";
const soccerBase = process.env.REACT_APP_SOCCER_API_URL || "https://soccerbackend.samsports.io";

const nflAdminAPI = Axios.create({ baseURL: nflBase, withCredentials: true });
const soccerAdminAPI = Axios.create({ baseURL: soccerBase, withCredentials: true });

/* ── Attach admin token to each request ── */
const attachAdminToken = (instance) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return instance;
};


/* ── helpers ── */
const nfl = () => attachAdminToken(nflAdminAPI);
const soccer = () => attachAdminToken(soccerAdminAPI);

/* ══════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════ */
export const getDashboardStats = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/dashboard"),
    soccer().get("/api/v1/admin-panel/dashboard"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const getLeagueProgress = () => soccer().get("/api/v1/admin/league-progress");

export const getSystemHealth = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/health"),
    soccer().get("/api/v1/admin-panel/health"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data?.data || nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data?.data || soccerRes.value.data : null,
  };
};

/* ══════════════════════════════════════════
   USERS  (both backends share the same User collection,
           but we query NFL as the primary source)
   ══════════════════════════════════════════ */
export const listUsers = (sport, params = {}) =>
  sport === "soccer"
    ? soccer().get("/api/v1/admin-panel/users/list", { params })
    : nfl().get("/admin-panel/users/list", { params });

export const searchUsers = (query) =>
  nfl().get("/admin-panel/users/search", { params: { q: query } });

export const deleteUser = (userId) =>
  nfl().delete("/admin-panel/users", { data: { userId } });

export const resetUserEmail = (userId, newEmail) =>
  nfl().patch("/admin-panel/users/reset-email", { userId, newEmail });

export const adminResetPassword = (userId, newPassword) =>
  nfl().post("/admin-panel/users/reset-password", { userId, newPassword });

export const blockUser = (userId, days, reason) =>
  nfl().patch("/admin-panel/users/block", { userId, days, reason });

export const unblockUser = (userId) =>
  nfl().patch("/admin-panel/users/unblock", { userId });

export const sendSamPointsToAll = (amount, reason) =>
  nfl().post("/admin-panel/users/send-sampoints-all", { amount, reason });

export const sendSamPointsToUser = (userId, amount, reason) =>
  nfl().post("/admin-panel/users/send-sampoints", { userId, amount, reason });

export const searchLeagues = async (query, sport) => {
  const params = query ? { q: query } : {};
  if (sport === "nfl") {
    const r = await nfl().get("/admin-panel/leagues/search", { params });
    const leagues = (r.data?.data?.leagues || []).map(l => ({ ...l, _src: "nfl" }));
    return { data: { data: { leagues } } };
  }
  if (sport === "soccer") {
    const r = await soccer().get("/api/v1/admin-panel/leagues/search", { params });
    const leagues = (r.data?.data?.leagues || []).map(l => ({ ...l, _src: "soccer" }));
    return { data: { data: { leagues } } };
  }
  // No sport filter — fetch both
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/leagues/search", { params }),
    soccer().get("/api/v1/admin-panel/leagues/search", { params }),
  ]);
  const nflLeagues = (nflRes.status === "fulfilled" ? nflRes.value.data?.data?.leagues || [] : []).map(l => ({ ...l, _src: "nfl" }));
  const soccerLeagues = (soccerRes.status === "fulfilled" ? soccerRes.value.data?.data?.leagues || [] : []).map(l => ({ ...l, _src: "soccer" }));
  return { data: { data: { leagues: [...nflLeagues, ...soccerLeagues] } } };
};

export const deleteLeague = (leagueId, backend = "nfl") =>
  backend === "soccer"
    ? soccer().delete("/api/v1/admin-panel/leagues", { data: { leagueId } })
    : nfl().delete("/admin-panel/leagues", { data: { leagueId } });

/* ══════════════════════════════════════════
   NFL PLAYERS
   ══════════════════════════════════════════ */
export const searchNFLPlayers = (query) =>
  nfl().get("/admin-panel/nfl-players/search", { params: { q: query } });

export const getAllNFLPlayers = () =>
  nfl().get("/admin-panel/nfl-players/all");

export const getNFLTeams = () =>
  nfl().get("/admin-panel/nfl-players/teams");

export const getNFLPlayersByTeam = (team) =>
  nfl().get("/admin-panel/nfl-players/by-team", { params: { team } });

export const updateNFLPlayer = (playerId, updates) =>
  nfl().patch("/admin-panel/nfl-players", { playerId, updates });

/* ══════════════════════════════════════════
   SOCCER PLAYERS
   ══════════════════════════════════════════ */
export const searchSoccerPlayers = (query) =>
  soccer().get("/api/v1/admin-panel/soccer-players/search", { params: { q: query } });

export const updateSoccerPlayer = (playerId, updates) =>
  soccer().patch("/api/v1/admin-panel/soccer-players", { playerId, updates });

/* ══════════════════════════════════════════
   TOGGLES / SETTINGS
   ══════════════════════════════════════════ */
export const getToggles = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/toggles"),
    soccer().get("/api/v1/admin-panel/toggles"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const updateNFLToggles = (updates) =>
  nfl().patch("/admin-panel/toggles", updates);

export const updateSoccerToggles = (updates) =>
  soccer().patch("/api/v1/admin-panel/toggles", updates);

/* ══════════════════════════════════════════
   CREDENTIALS VAULT
   ══════════════════════════════════════════ */
export const getVaultCredentials = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/vault"),
    soccer().get("/api/v1/admin-panel/vault"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const updateVaultCredential = (backend, envKey, value, notes) =>
  backend === "soccer"
    ? soccer().patch(`/api/v1/admin-panel/vault/${envKey}`, { value, notes })
    : nfl().patch(`/admin-panel/vault/${envKey}`, { value, notes });

export const testVaultCredential = (backend, envKey) =>
  backend === "soccer"
    ? soccer().post(`/api/v1/admin-panel/vault/${envKey}/test`)
    : nfl().post(`/admin-panel/vault/${envKey}/test`);

/* ══════════════════════════════════════════
   AUDIT LOGS
   ══════════════════════════════════════════ */
export const getAuditLogs = async (params = {}) => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/audit-logs", { params }),
    soccer().get("/api/v1/admin-panel/audit-logs", { params }),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

/* ══════════════════════════════════════════
   ANNOUNCEMENTS (Megaphone)
   ══════════════════════════════════════════ */
export const getAnnouncements = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/announcements"),
    soccer().get("/api/v1/admin-panel/announcements"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const createAnnouncement = async (data, imageFile) => {
  let imageUrl = null;

  // If there's an image file, upload to NFL backend via FormData first
  if (imageFile) {
    const formData = new FormData();
    formData.append("pictures", imageFile);
    formData.append("text", data.text);
    formData.append("type", data.type || "info");
    formData.append("target", data.target || "all");
    if (data.expiresAt) formData.append("expiresAt", data.expiresAt);
    if (data.displayMode) formData.append("displayMode", data.displayMode);
    if (data.pageTarget) formData.append("pageTarget", data.pageTarget);
    const nflUploadRes = await nfl().post("/admin-panel/announcements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    imageUrl = nflUploadRes.data?.data?.announcement?.imageUrl || nflUploadRes.data?.announcement?.imageUrl || null;
    // Send to soccer with the imageUrl (no file upload needed)
    const soccerRes = await soccer().post("/api/v1/admin-panel/announcements", { ...data, imageUrl }).catch(() => null);
    return {
      nfl: nflUploadRes.data || null,
      soccer: soccerRes?.data || null,
    };
  }

  // No image — send JSON to both backends
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().post("/admin-panel/announcements", data),
    soccer().post("/api/v1/admin-panel/announcements", data),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const dismissAnnouncement = async (announcementId) => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().patch("/admin-panel/announcements/dismiss", { id: announcementId, announcementId }),
    soccer().patch("/api/v1/admin-panel/announcements/dismiss", { announcementId }),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const deleteAnnouncement = (announcementId) =>
  soccer().delete(`/api/v1/admin-panel/announcements/${announcementId}`);

/* ══════════════════════════════════════════
   DATA SYNC TRIGGERS
   ══════════════════════════════════════════ */
export const triggerNFLSync = (action) =>
  nfl().post("/admin-panel/data-sync", { action });

export const triggerSoccerSync = (action) =>
  soccer().post("/api/v1/admin-panel/data-sync", { action });

// Per-league player seeding (API-Football + TransferMarkt)
export const seedLeaguePlayers = (league) =>
  soccer().post(`/api/v1/admin/seed-players/${league}`);

export const fullSeedLeague = (league) =>
  soccer().post(`/api/v1/admin/full-seed/${league}`);

export const scrapeLeagueValues = (league) =>
  soccer().post(`/api/v1/admin/scrape-values/${league}`);

export const updateValuations = (league) =>
  soccer().post("/api/v1/admin/update-valuations", { league: league || null });

/* ══════════════════════════════════════════
   FRANCHISE TAGS (SamMetric)
   ══════════════════════════════════════════ */
export const getFranchiseTags = () =>
  nfl().get("/admin-panel/franchise-tags");

export const updateFranchiseTag = (data) =>
  nfl().post("/admin/league/createsammetric", data);

export const bulkUpdateFranchiseTags = (tags) =>
  nfl().post("/admin-panel/franchise-tags/bulk", { tags });

/* ══════════════════════════════════════════
   SCORING METRICS (SamMetric stats)
   ══════════════════════════════════════════ */
export const getNFLScoringMetrics = (season) =>
  nfl().get("/admin-panel/scoring-metrics", { params: season ? { season } : {} });

export const updateNFLScoringMetrics = (Position, sammetricstats, season) =>
  nfl().patch("/admin-panel/scoring-metrics", { Position, sammetricstats, season });

export const getSoccerScoringMetrics = (season) =>
  soccer().get("/api/v1/admin-panel/scoring-metrics", { params: season ? { season } : {} });

export const updateSoccerScoringMetrics = (position, statWeights, season) =>
  soccer().patch("/api/v1/admin-panel/scoring-metrics", { position, statWeights, season });

export const seedSoccerScoringMetrics = (season) =>
  soccer().post("/api/v1/admin-panel/scoring-metrics/seed", { season });

/* ══════════════════════════════════════════
   RIVALS STATS
   ══════════════════════════════════════════ */
export const getRivalsStats = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/rivals-stats"),
    soccer().get("/api/v1/admin-panel/rivals-stats"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data : null,
  };
};

export const getDivisionsOverview = (sport, season) => {
  const params = season ? { season } : {};
  return sport === "soccer"
    ? soccer().get("/api/v1/admin-panel/rivals/divisions", { params })
    : nfl().get("/admin-panel/rivals/divisions", { params });
};

export const getIncompletePods = (sport, season, division) => {
  const params = {};
  if (season) params.season = season;
  if (division) params.division = division;
  return sport === "soccer"
    ? soccer().get("/api/v1/admin-panel/rivals/incomplete-pods", { params })
    : nfl().get("/admin-panel/rivals/incomplete-pods", { params });
};

export const mergePods = (sport, sourcePodId, targetPodId) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/merge-pods", { sourcePodId, targetPodId })
    : nfl().post("/admin-panel/rivals/merge-pods", { sourcePodId, targetPodId });

export const triggerAutoFill = (sport) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/auto-fill")
    : nfl().post("/admin-panel/rivals/auto-fill");

/* ══════════════════════════════════════════
   RIVALS — Entries, Seasons, Pods, Overrides
   ══════════════════════════════════════════ */
export const searchRivalsEntries = (sport, params = {}) =>
  sport === "soccer"
    ? soccer().get("/api/v1/admin-panel/rivals/entries", { params })
    : nfl().get("/admin-panel/rivals/entries", { params });

export const getRivalsSeasons = (sport) =>
  sport === "soccer"
    ? soccer().get("/api/v1/admin-panel/rivals/seasons")
    : nfl().get("/admin-panel/rivals/seasons");

export const searchRivalsPods = (sport, params = {}) =>
  sport === "soccer"
    ? soccer().get("/api/v1/admin-panel/rivals/pods", { params })
    : nfl().get("/admin-panel/rivals/pods", { params });

export const overrideMatchScore = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/override-score", data)
    : nfl().post("/admin-panel/rivals/override-score", data);

export const overrideSquadValue = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/override-squad-value", data)
    : nfl().post("/admin-panel/rivals/override-squad-value", data);

export const overrideDivision = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/override-division", data)
    : nfl().post("/admin-panel/rivals/override-division", data);

export const overrideSamPoints = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/override-sampoints", data)
    : nfl().post("/admin-panel/rivals/override-sampoints", data);

export const forceSquadReset = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/force-squad-reset", data)
    : nfl().post("/admin-panel/rivals/force-squad-reset", data);

export const disqualifyEntry = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/disqualify-entry", data)
    : nfl().post("/admin-panel/rivals/disqualify-entry", data);

export const rivalsSeasonAction = (sport, data) =>
  sport === "soccer"
    ? soccer().post("/api/v1/admin-panel/rivals/season-action", data)
    : nfl().post("/admin-panel/rivals/season-action", data);

/* ══════════════════════════════════════════
   PUBLIC ANNOUNCEMENTS (no auth required)
   ══════════════════════════════════════════ */
export const getActiveAnnouncements = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    publicAPI.get("/admin-panel/announcements/active"),
    soccerPublicAPI.get("/api/v1/admin-panel/announcements/active"),
  ]);
  const nflAnn = nflRes.status === "fulfilled" ? nflRes.value.data?.data || nflRes.value.data || [] : [];
  const soccerAnn = soccerRes.status === "fulfilled" ? soccerRes.value.data?.data || soccerRes.value.data || [] : [];
  // Deduplicate by text
  const seen = new Set();
  return [...nflAnn, ...soccerAnn].filter(a => {
    const k = a.text || a.message;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/* ══════════════════════════════════════════
   CRON STATUS (real backend data)
   ══════════════════════════════════════════ */
export const getCronStatus = async () => {
  const [nflRes, soccerRes] = await Promise.allSettled([
    nfl().get("/admin-panel/cron-status"),
    soccer().get("/api/v1/admin-panel/cron-status"),
  ]);
  return {
    nfl: nflRes.status === "fulfilled" ? nflRes.value.data?.data || nflRes.value.data : null,
    soccer: soccerRes.status === "fulfilled" ? soccerRes.value.data?.data || soccerRes.value.data : null,
  };
};

/* ══════════════════════════════════════════
   ADMIN AUTH (employee management)
   ══════════════════════════════════════════ */
export const getAdminMe = () =>
  nfl().get("/admin-auth/me");

export const listEmployees = () =>
  nfl().get("/admin-auth/employees");

export const createEmployee = (data) =>
  nfl().post("/admin-auth/employees", data);

export const deactivateEmployee = (id) =>
  nfl().put(`/admin-auth/employees/${id}/deactivate`);

export const activateEmployee = (id) =>
  nfl().put(`/admin-auth/employees/${id}/activate`);

export const resetEmployeePassword = (id, password, secondaryPassword) =>
  nfl().put(`/admin-auth/employees/${id}/reset-password`, { password, secondaryPassword });

export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

/* ══════════════════════════════════════════
   PREDICTOR ADMIN
   ══════════════════════════════════════════ */
export const getPredictorDashboard = () =>
  nfl().get("/admin-panel/predictor/dashboard");

export const getPredictorPending = () =>
  nfl().get("/admin-panel/predictor/pending");

export const getPredictorLeaderboard = (params) =>
  nfl().get("/admin-panel/predictor/leaderboard", { params });

export const adminSettleFixture = (data) =>
  nfl().post("/admin-panel/predictor/settle-fixture", data);

export const triggerAutoSettle = () =>
  nfl().post("/admin-panel/predictor/trigger-auto-settle");

export const resetFixtureSettlement = (fixtureId) =>
  nfl().post("/admin-panel/predictor/reset-fixture", { fixtureId });

/* ══════════════════════════════════════════
   CL FANTASY ADMIN
   Routes under /api/v1/admin-panel/cl-fantasy/*
   (uses admin auth, not user auth)
   ══════════════════════════════════════════ */
export const getCLFantasyStats = () =>
  soccer().get("/api/v1/admin-panel/cl-fantasy/stats");

export const getCLFantasyLeagues = (params) =>
  soccer().get("/api/v1/admin-panel/cl-fantasy/leagues", { params });

export const getCLPlayerPool = (params) =>
  soccer().get("/api/v1/admin-panel/cl-fantasy/player-pool", { params });

export const getCLTeams = (params) =>
  soccer().get("/api/v1/admin-panel/cl-fantasy/teams", { params });

export const triggerCLPlayerSync = (season) =>
  soccer().post("/api/v1/admin-panel/cl-fantasy/sync-players", { season });

// CL Elimination & Auction
export const adminEliminateClubs = (leagueId, clubs, phase) =>
  soccer().post(`/api/v1/admin-panel/cl-fantasy/league/${leagueId}/eliminate`, { clubs, phase });

export const adminOpenAuctionWindow = (leagueId, windowKey) =>
  soccer().post(`/api/v1/admin-panel/cl-fantasy/league/${leagueId}/auction-window/open`, { windowKey });

export const adminCloseAuctionWindow = (leagueId, windowKey) =>
  soccer().post(`/api/v1/admin-panel/cl-fantasy/league/${leagueId}/auction-window/close`, { windowKey });

export const getCLAuctionWindow = (leagueId) =>
  soccer().get(`/api/v1/admin-panel/cl-fantasy/league/${leagueId}/auction-window`);

export const getCLFreeAgents = (leagueId, params) =>
  soccer().get(`/api/v1/admin-panel/cl-fantasy/league/${leagueId}/free-agents`, { params });

export const getCLTeamEliminationStatus = (teamId) =>
  soccer().get(`/api/v1/cl-fantasy/team/${teamId}/elimination-status`);

// CL Player CRUD (admin-only)
export const updateCLPlayer = (playerId, updates) =>
  soccer().patch(`/api/v1/admin-panel/cl-fantasy/player/${playerId}`, { updates });

export const deleteCLPlayer = (playerId, permanent = false) =>
  soccer().delete(`/api/v1/admin-panel/cl-fantasy/player/${playerId}${permanent ? "?permanent=true" : ""}`);

export const removeCLClub = (clubName) =>
  soccer().post("/api/v1/admin-panel/cl-fantasy/remove-club", { clubName });

/* ══════════════════════════════════════════
   CROSS-LEAGUE STATS SYNC (CL + WC)
   ══════════════════════════════════════════ */
export const syncCrossLeagueStats = () =>
  soccer().post("/api/v1/admin/sync-cross-league");

// Generic player search (any realLeague)
export const searchPlayers = (q, realLeague) => {
  const params = { q };
  if (realLeague) params.realLeague = realLeague;
  return soccer().get("/api/v1/admin-panel/players/search", { params });
};

/* ══════════════════════════════════════════
   WORLD CUP 2026
   ══════════════════════════════════════════ */
export const seedWCPlayers = () =>
  soccer().post("/api/v1/admin-panel/wc-fantasy/seed-players");

export const getWCStats = () =>
  soccer().get("/api/v1/admin-panel/wc-fantasy/stats");

export const getWCActiveNations = () =>
  soccer().get("/api/v1/admin/wc-eliminate");

export const wcEliminateNations = (remaining) =>
  soccer().post("/api/v1/admin/wc-eliminate", { remaining });

/* ══════════════════════════════════════════
   AI ARTICLE GENERATOR
   ══════════════════════════════════════════ */
export const getArticles = (params) =>
  soccer().get("/api/v1/admin-panel/articles", { params });

export const getArticle = (id) =>
  soccer().get(`/api/v1/admin-panel/articles/${id}`);

export const updateArticle = (id, updates) =>
  soccer().patch(`/api/v1/admin-panel/articles/${id}`, updates);

export const deleteArticle = (id) =>
  soccer().delete(`/api/v1/admin-panel/articles/${id}`);

export const generateMatchArticle = (fixtureId, type, includeSAM = true) =>
  soccer().post("/api/v1/admin-panel/articles/generate-match", { fixtureId, type, includeSAM });

export const generateCustomArticle = (topic, topicType, realLeague, tone, includeSAM = true, coverImageFile = null) => {
  const fd = new FormData();
  fd.append("topic", topic);
  fd.append("topicType", topicType);
  fd.append("realLeague", realLeague);
  fd.append("tone", tone);
  fd.append("includeSAM", String(includeSAM));
  if (coverImageFile) fd.append("coverImage", coverImageFile);
  return soccer().post("/api/v1/admin-panel/articles/generate-custom", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const generateBatchArticles = (type) =>
  soccer().post("/api/v1/admin-panel/articles/generate-batch", { type });

export const getArticleStats = () =>
  soccer().get("/api/v1/admin-panel/articles-stats");

export const getArticleFixtures = (params) =>
  soccer().get("/api/v1/admin-panel/articles/fixtures", { params });

// NFL-specific article endpoints (Tank01 data)
export const getNFLFixtures = (params) =>
  soccer().get("/api/v1/admin-panel/articles/nfl-fixtures", { params });

export const generateNFLArticle = (game, type) =>
  soccer().post("/api/v1/admin-panel/articles/generate-nfl", { game, type });

export const uploadArticleImage = (articleId, formData) =>
  soccer().post(`/api/v1/admin-panel/articles/${articleId}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ═══ Infographics ═══
export const getInfographics = (params) =>
  soccer().get("/api/v1/admin-panel/infographics", { params });

export const generateSoccerInfographic = (fixture, league) =>
  soccer().post("/api/v1/admin-panel/infographics/generate-soccer", { fixture, league });

export const generateSoccerPostMatch = (fixture, league) =>
  soccer().post("/api/v1/admin-panel/infographics/generate-soccer-post", { fixture, league });

export const generateSoccerLive = (fixture, league) =>
  soccer().post("/api/v1/admin-panel/infographics/generate-soccer-live", { fixture, league });

export const generateNFLInfographic = (game) =>
  soccer().post("/api/v1/admin-panel/infographics/generate-nfl", { game });

export const getNFLInfographicFixtures = (params) =>
  soccer().get("/api/v1/admin-panel/infographics/nfl-fixtures", { params });

export const generateMatchEvent = (eventData) =>
  soccer().post("/api/v1/admin-panel/infographics/generate-event", eventData);

export const getEventTypes = () =>
  soccer().get("/api/v1/admin-panel/infographics/event-types");

export const deleteInfographic = (id) =>
  soccer().delete(`/api/v1/admin-panel/infographics/${id}`);

// ═══ Deployment — trigger server deploy from admin panel ═══
export const triggerDeploy = () =>
  soccer().post("/api/v1/admin-panel/deploy");

export const getServerStatus = () =>
  soccer().get("/api/v1/admin-panel/server-status");

// ═══ Analytics Report ═══
export const getAnalyticsReport = (range = "30d") =>
  soccer().get("/api/v1/admin-panel/analytics/report", { params: { range } });

/* ══════════════════════════════════════════
   FINANCE TRACKER
   ══════════════════════════════════════════ */
export const getFinanceSummary = (period = "month") =>
  nfl().get(`/admin-panel/finance/summary?period=${period}`);

export const getFinanceTransactions = (params) =>
  nfl().get("/admin-panel/finance/transactions", { params });

export const getFinanceMonthly = () =>
  nfl().get("/admin-panel/finance/monthly");

export const getFinanceByProduct = (period = "month") =>
  nfl().get(`/admin-panel/finance/by-product?period=${period}`);
