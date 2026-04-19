import { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════
   Sports News Hook
   Primary: GNews API (requires REACT_APP_GNEWS_API_KEY)
   Fallback: ESPN free news endpoints (no key needed)
   ═══════════════════════════════════════════════════════════ */

const GNEWS_BASE = 'https://gnews.io/api/v4';
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const CACHE_TTL = 1800000; // 30 minutes, saves API quota
const REFRESH_INTERVAL = 1800000; // 30 minutes

// Module-level cache & quota tracking
const newsCache = {};
let gnewsBlocked = false; // set true on 403, skip further calls

/* ── ESPN free news endpoints (no API key needed) ── */
const ESPN_SPORTS = [
  { path: 'football/nfl', sport: 'nfl', label: 'A.Football', icon: '🏈' },
  { path: 'basketball/nba', sport: 'nba', label: 'NBA', icon: '🏀' },
  { path: 'soccer/eng.1', sport: 'soccer', label: 'Soccer', icon: '⚽' },
  { path: 'hockey/nhl', sport: 'nhl', label: 'NHL', icon: '🏒' },
  { path: 'baseball/mlb', sport: 'mlb', label: 'MLB', icon: '⚾' },
  { path: 'soccer/usa.1', sport: 'soccer', label: 'Soccer', icon: '⚽' },
  { path: 'soccer/uefa.champions', sport: 'soccer', label: 'Soccer', icon: '⚽' },
];

/**
 * Generic fetcher with module-level cache
 */
const cachedFetch = async (url) => {
  const now = Date.now();
  if (newsCache[url] && now - newsCache[url].ts < CACHE_TTL) {
    return newsCache[url].data;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) throw new Error('QUOTA_EXCEEDED');
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    newsCache[url] = { data, ts: now };
    return data;
  } catch (err) {
    if (err.message === 'QUOTA_EXCEEDED') throw err;
    // Network/CORS errors — suppress to avoid console noise
    return null;
  }
};

/**
 * Map a GNews article to the UI-compatible shape
 */
const mapGNewsArticle = (article, sport = 'general', label = 'Sports', icon = '📰') => ({
  headline: article.title,
  title: article.title,
  description: article.description || '',
  published: article.publishedAt,
  images: article.image ? [{ url: article.image }] : [],
  links: { web: { href: article.url } },
  source: article.source?.name || '',
  _sport: sport,
  _label: label,
  _icon: icon,
});

/**
 * Map an ESPN news article to the UI-compatible shape
 */
const mapESPNArticle = (article, sport, label, icon) => ({
  headline: article.headline || article.title || '',
  title: article.headline || article.title || '',
  description: article.description || '',
  published: article.published || '',
  images: article.images?.length ? [{ url: article.images[0]?.url || '' }] : [],
  links: { web: { href: article.links?.web?.href || article.links?.api?.news?.href || '#' } },
  source: 'ESPN',
  _sport: sport,
  _label: label,
  _icon: icon,
});

/**
 * Detect sport from article text
 */
const detectSport = (text) => {
  const t = text.toLowerCase();
  if (t.includes('soccer') || t.includes('premier league') || t.includes('champions league') || t.includes('la liga') || t.includes('serie a') || t.includes('bundesliga') || t.includes('mls'))
    return { sport: 'soccer', label: 'Soccer', icon: '⚽' };
  if (t.includes('nfl') || t.includes('touchdown') || t.includes('quarterback'))
    return { sport: 'nfl', label: 'A.Football', icon: '🏈' };
  if ((t.includes('nba') || t.includes('basketball')) && !t.includes('college'))
    return { sport: 'nba', label: 'NBA', icon: '🏀' };
  if (t.includes('nhl') || t.includes('hockey'))
    return { sport: 'nhl', label: 'NHL', icon: '🏒' };
  if (t.includes('mlb') || t.includes('baseball'))
    return { sport: 'mlb', label: 'MLB', icon: '⚾' };
  if (t.includes('college football') || t.includes('ncaa football'))
    return { sport: 'ncaafb', label: 'NCAA Football', icon: '🎓🏈' };
  if (t.includes('college basketball') || t.includes('march madness'))
    return { sport: 'ncaab', label: 'NCAA Basketball', icon: '🎓🏀' };
  return { sport: 'general', label: 'Sports', icon: '📰' };
};

/* ── GNews fetcher ── */
const fetchFromGNews = async (apiKey) => {
  if (gnewsBlocked) return null;

  try {
    const headlinesUrl = `${GNEWS_BASE}/top-headlines?category=sports&lang=en&country=us&max=10&apikey=${apiKey}`;
    const headlinesData = await cachedFetch(headlinesUrl);

    const combined = [];
    const seenTitles = new Set();

    if (headlinesData?.articles) {
      headlinesData.articles.forEach(article => {
        if (!seenTitles.has(article.title)) {
          seenTitles.add(article.title);
          const { sport, label, icon } = detectSport(`${article.title} ${article.description || ''}`);
          combined.push(mapGNewsArticle(article, sport, label, icon));
        }
      });
    }

    // Fetch 3 sport-specific searches (soccer, NFL, NBA)
    const SPORT_QUERIES = [
      { sport: 'soccer', label: 'Soccer', icon: '⚽', q: 'soccer OR Premier League OR Champions League OR La Liga' },
      { sport: 'nfl', label: 'A.Football', icon: '🏈', q: 'NFL football' },
      { sport: 'nba', label: 'NBA', icon: '🏀', q: 'NBA basketball' },
    ];

    await Promise.all(
      SPORT_QUERIES.map(async (sq) => {
        const searchUrl = `${GNEWS_BASE}/search?q=${encodeURIComponent(sq.q)}&lang=en&max=5&apikey=${apiKey}`;
        const data = await cachedFetch(searchUrl);
        if (data?.articles) {
          data.articles.forEach(article => {
            if (!seenTitles.has(article.title)) {
              seenTitles.add(article.title);
              combined.push(mapGNewsArticle(article, sq.sport, sq.label, sq.icon));
            }
          });
        }
      })
    );

    return combined.length > 0 ? combined : null;
  } catch (err) {
    if (err.message === 'QUOTA_EXCEEDED') {
      if (!gnewsBlocked) {
        console.warn('[News] GNews rate-limited. Switching to ESPN fallback.');
      }
      gnewsBlocked = true;
    }
    return null;
  }
};

/* ── ESPN fallback fetcher (FREE, no API key) ── */
const fetchFromESPN = async () => {
  const combined = [];
  const seenTitles = new Set();

  const results = await Promise.allSettled(
    ESPN_SPORTS.map(async ({ path, sport, label, icon }) => {
      const url = `${ESPN_BASE}/${path}/news?limit=8`;
      const data = await cachedFetch(url);
      if (data?.articles) {
        data.articles.forEach(article => {
          const title = article.headline || article.title || '';
          if (title && !seenTitles.has(title)) {
            seenTitles.add(title);
            combined.push(mapESPNArticle(article, sport, label, icon));
          }
        });
      }
    })
  );

  return combined;
};

/**
 * Custom hook to fetch sports news
 * Tries GNews first, falls back to ESPN free news API
 */
export const useGNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GNEWS_API_KEY;

    const fetchNews = async () => {
      setLoading(true);
      try {
        let result = null;

        // Try GNews first (if key present and not blocked)
        if (apiKey && !gnewsBlocked) {
          result = await fetchFromGNews(apiKey);
        }

        // Fallback to ESPN free news
        if (!result || result.length === 0) {
          result = await fetchFromESPN();
        }

        // Sort by published date descending
        if (result && result.length > 0) {
          result.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
          setArticles(result);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    intervalRef.current = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  return { articles, loading };
};

export default useGNews;
