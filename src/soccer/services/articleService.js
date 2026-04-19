/**
 * Article Service — Public API
 *
 * Fetches AI-generated articles from the soccer backend.
 * No authentication required.
 */

import { soccerPublicAPI } from "../config/constants";

const BASE = "/api/v1/articles";

export const getArticles = (params = {}) =>
  soccerPublicAPI.get(BASE, { params });

export const getLatestArticles = (limit = 6) =>
  soccerPublicAPI.get(`${BASE}/latest`, { params: { limit } });

export const getArticlesByLeague = (league, params = {}) =>
  soccerPublicAPI.get(`${BASE}/by-league/${league}`, { params });

export const getArticleBySlug = (slug) =>
  soccerPublicAPI.get(`${BASE}/${slug}`);

export const getArticlesByFixture = (fixtureId) =>
  soccerPublicAPI.get(`${BASE}/by-fixture/${fixtureId}`);

export const getArticlesGroupedByLeague = (limit = 6, location) =>
  soccerPublicAPI.get(`${BASE}/grouped-by-league`, { params: { limit, location } });

export const getTranslatedArticle = (slug, lang) =>
  soccerPublicAPI.get(`${BASE}/translate/${slug}`, { params: { lang } });

export const getPlatformSettings = () =>
  soccerPublicAPI.get("/api/v1/admin-panel/platform-settings");
