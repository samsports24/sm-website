import { useState, useEffect, useCallback, useRef } from 'react';

// ── All ESPN calls go through our backend proxy to avoid CORS ──
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://backend.samsports.io'
const PROXY_BASE = `${BACKEND_URL}/espn-proxy`

const CACHE_TTL = 60000; // 60 seconds
const REFRESH_INTERVAL = 60000; // 60 seconds

/**
 * Convert a Date (or date string) to ESPN's YYYYMMDD format
 */
const toESPNDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

// Module-level cache
const espnCache = {};

/**
 * Fetch from ESPN via our backend proxy — no CORS issues
 */
export const espnGet = async (sport, league, endpoint, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const url = `${PROXY_BASE}/${sport}/${league}/${endpoint}${qs ? '?' + qs : ''}`;
  const cacheKey = url;
  const now = Date.now();

  // Check cache
  if (espnCache[cacheKey]) {
    const { data, ts } = espnCache[cacheKey];
    if (now - ts < CACHE_TTL) return data;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[ESPN Proxy] HTTP ${response.status} for ${sport}/${league}/${endpoint}`);
      return espnCache[cacheKey]?.data || null;
    }
    const data = await response.json();
    espnCache[cacheKey] = { data, ts: now };
    return data;
  } catch (error) {
    console.warn(`[ESPN Proxy] Fetch error:`, error.message);
    return espnCache[cacheKey]?.data || null;
  }
};

/**
 * Batch fetch multiple ESPN endpoints in a single request
 */
const espnBatch = async (urlPaths) => {
  const url = `${PROXY_BASE}/batch`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urlPaths }),
    });
    if (!response.ok) return null;
    const { results } = await response.json();
    return results; // [{ url, data, error }, ...]
  } catch (error) {
    console.warn('[ESPN Proxy] Batch error:', error.message);
    return null;
  }
};

/**
 * Custom hook to fetch ESPN scoreboard data
 */
export const useESPNScoreboard = (sport, league, selectedDate = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchScoreboard = useCallback(async () => {
    if (!sport || !league) return;

    setLoading(true);
    const params = selectedDate ? { dates: toESPNDate(selectedDate) } : {};
    const data = await espnGet(sport, league, 'scoreboard', params);

    if (data && data.events) {
      setEvents(data.events);
      setLastUpdated(new Date());
      setError(null);
    } else {
      setError('Failed to fetch scoreboard data');
    }

    setLoading(false);
  }, [sport, league, selectedDate]);

  useEffect(() => {
    if (!sport || !league) return;

    fetchScoreboard();
    intervalRef.current = setInterval(fetchScoreboard, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sport, league, selectedDate, fetchScoreboard]);

  return { events, loading, error, lastUpdated };
};

/**
 * Custom hook to fetch all soccer league scoreboards via batch endpoint
 */
export const useSoccerScoreboards = (selectedDate = null, enabled = true) => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [totalMatches, setTotalMatches] = useState(0);
  const [activeLeagues, setActiveLeagues] = useState(0);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let cancelled = false;

    const fetchAllLeagues = async () => {
      try {
        let SOCCER_LEAGUES = [];
        try {
          const constantsModule = await import('../constants');
          SOCCER_LEAGUES = constantsModule.SOCCER_LEAGUES || [];
        } catch (e) {
          console.warn('Could not import SOCCER_LEAGUES from constants:', e);
          SOCCER_LEAGUES = [];
        }

        if (!SOCCER_LEAGUES.length) {
          setLeagues([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const dateParam = selectedDate ? `?dates=${toESPNDate(selectedDate)}` : '';

        // Use batch endpoint — 1 request instead of 15+
        const urlPaths = SOCCER_LEAGUES.map(
          (lg) => `soccer/${lg.id}/scoreboard${dateParam}`
        );

        const results = await espnBatch(urlPaths);

        if (cancelled) return;

        if (results) {
          const mapped = results.map((r, idx) => ({
            lg: SOCCER_LEAGUES[idx],
            events: r.data?.events || [],
          }));
          const total = mapped.reduce((sum, l) => sum + l.events.length, 0);
          const active = mapped.filter(l => l.events.length > 0).length;
          setLeagues(mapped);
          setTotalMatches(total);
          setActiveLeagues(active);
        }
      } catch (error) {
        console.error('Error fetching soccer scoreboards:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllLeagues();
    return () => { cancelled = true; };
  }, [selectedDate, enabled]);

  return { leagues, loading, totalMatches, activeLeagues };
};

/**
 * Custom hook to fetch news from multiple ESPN sources via batch
 */
export const useESPNNews = (sources) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sources || !sources.length) {
      setArticles([]);
      return;
    }

    const fetchNews = async () => {
      setLoading(true);
      try {
        const urlPaths = sources.map(
          (src) => `${src.espn}/news?limit=10`
        );
        const results = await espnBatch(urlPaths);

        const combined = [];
        const seenHeadlines = new Set();

        if (results) {
          results.forEach((result, idx) => {
            const articles = result.data?.articles || [];
            articles.forEach(article => {
              if (!seenHeadlines.has(article.headline)) {
                seenHeadlines.add(article.headline);
                combined.push({
                  ...article,
                  source: sources[idx].label,
                  _sport: sources[idx].sport,
                  _label: sources[idx].label,
                  _icon: sources[idx].icon,
                });
              }
            });
          });
        }

        combined.sort((a, b) => {
          const dateA = new Date(a.published || 0);
          const dateB = new Date(b.published || 0);
          return dateB - dateA;
        });

        setArticles(combined);
      } catch (error) {
        console.error('Error fetching ESPN news:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [sources]);

  return { articles, loading };
};

/**
 * Custom hook to fetch league leaders/top scorers
 */
export const useESPNLeaders = (sport, league) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sport || !league) return;

    const fetchLeaders = async () => {
      setLoading(true);
      const data = await espnGet(sport, league, 'leaders');

      if (data && data.leaders) {
        const goalLeaders = data.leaders.filter(leader =>
          leader.displayName && leader.displayName.toLowerCase().includes('goal')
        );
        setLeaders(goalLeaders);
      } else {
        setLeaders([]);
      }

      setLoading(false);
    };

    fetchLeaders();
  }, [sport, league]);

  return { leaders, loading };
};

/**
 * Custom hook to fetch league standings
 */
export const useESPNStandings = (sport, league) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sport || !league) return;

    const fetchStandings = async () => {
      setLoading(true);
      const data = await espnGet(sport, league, 'standings');

      if (data) {
        const extractTables = (node) => {
          const result = [];
          if (node.standings) result.push(...node.standings);
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => {
              result.push(...extractTables(child));
            });
          }
          return result;
        };
        setTables(extractTables(data));
      } else {
        setTables([]);
      }

      setLoading(false);
    };

    fetchStandings();
  }, [sport, league]);

  return { tables, loading };
};

/**
 * Custom hook to fetch match detail
 */
export const useMatchDetail = (eventId, sport, league, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId || !sport || !league || !enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      const result = await espnGet(sport, league, 'summary', { event: eventId });
      if (result) {
        setData(result);
      } else {
        setError('Failed to fetch match detail');
        setData(null);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [eventId, sport, league, enabled]);

  return { data, loading, error };
};

/**
 * Generic multi-league scoreboard hook via batch
 */
export const useMultiLeagueScoreboards = (sport, leagues, selectedDate = null) => {
  const [leagueResults, setLeagueResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [activeLeagues, setActiveLeagues] = useState(0);

  useEffect(() => {
    if (!leagues || !leagues.length || !sport) {
      setLeagueResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAllLeagues = async () => {
      try {
        setLoading(true);
        const dateParam = selectedDate ? `?dates=${toESPNDate(selectedDate)}` : '';

        // Batch all leagues in 1 request
        const urlPaths = leagues.map((lg) => {
          const sportPath = lg.sport || sport;
          return `${sportPath}/${lg.id}/scoreboard${dateParam}`;
        });

        const results = await espnBatch(urlPaths);

        if (cancelled) return;

        if (results) {
          const mapped = results.map((r, idx) => ({
            lg: leagues[idx],
            events: r.data?.events || [],
          }));
          const total = mapped.reduce((sum, l) => sum + l.events.length, 0);
          const active = mapped.filter(l => l.events.length > 0).length;
          setLeagueResults(mapped);
          setTotalMatches(total);
          setActiveLeagues(active);
        }
      } catch (error) {
        console.error(`Error fetching ${sport} scoreboards:`, error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllLeagues();
    return () => { cancelled = true; };
  }, [sport, leagues, selectedDate]);

  return { leagues: leagueResults, loading, totalMatches, activeLeagues };
};

// Scorer cache for optimization
const scorerCache = {};

/**
 * Fetch scoring plays via proxy
 */
export const fetchScorers = async (eventId, sport, league) => {
  const cacheKey = `${eventId}-${sport}-${league}`;

  if (scorerCache[cacheKey]) return scorerCache[cacheKey];

  try {
    const data = await espnGet(sport, league, 'summary', { event: eventId });

    if (!data || !data.article) {
      return { hScorers: [], aScorers: [] };
    }

    const hScorers = [];
    const aScorers = [];

    if (data.boxscore && data.boxscore.teams) {
      data.boxscore.teams.forEach((team, idx) => {
        const scorerList = idx === 0 ? hScorers : aScorers;
        if (team.players) {
          team.players.forEach(player => {
            if (player.stats && player.stats.goals) {
              scorerList.push({
                name: player.displayName,
                goals: player.stats.goals,
              });
            }
          });
        }
      });
    }

    const result = { hScorers, aScorers };
    scorerCache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error(`Error fetching scorers for event ${eventId}:`, error);
    return { hScorers: [], aScorers: [] };
  }
};
