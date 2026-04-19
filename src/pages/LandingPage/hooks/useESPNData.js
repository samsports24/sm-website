import { useState, useEffect, useCallback, useRef } from 'react';

const BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const CACHE_TTL = 60000; // 60 seconds
const REFRESH_INTERVAL = 60000; // 60 seconds (was 20s — reduced to prevent page freeze)
let espnFetchFailedUntil = 0; // timestamp: skip fetches until this time (cooldown after network/CORS failure)
const ESPN_COOLDOWN = 10000; // 10s cooldown after a network failure (was 30s)

/**
 * Convert a Date (or date string) to ESPN's YYYYMMDD format
 * @param {Date|string|null} date
 * @returns {string} e.g. '20260313'
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
 * Fetch from ESPN API with caching
 * @param {string} url - The API endpoint URL
 * @returns {Promise<Object|null>} - Parsed JSON or null if error
 */
export const espnGet = async (url) => {
  const now = Date.now();

  // Check cache first — always return cached data if fresh
  if (espnCache[url]) {
    const { data, ts } = espnCache[url];
    if (now - ts < CACHE_TTL) {
      return data;
    }
  }

  // After a network/CORS failure, return stale cache if available, else null
  if (Date.now() < espnFetchFailedUntil) {
    if (espnCache[url]) return espnCache[url].data; // stale cache better than nothing
    return null;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // HTTP errors (400, 404, etc.) — don't trigger global cooldown
      // just skip this one URL
      console.warn(`[ESPN] HTTP ${response.status} for ${url.split('/').slice(-2).join('/')}`);
      return espnCache[url]?.data || null; // return stale cache if available
    }

    const data = await response.json();
    espnCache[url] = { data, ts: now };
    return data;
  } catch (error) {
    // Only trigger global cooldown on true network/CORS failures
    if (error.message === 'Failed to fetch') {
      const wasAlreadyCooling = Date.now() < espnFetchFailedUntil;
      espnFetchFailedUntil = Date.now() + ESPN_COOLDOWN;
      if (!wasAlreadyCooling) {
        console.warn(`[ESPN] Network/CORS error — pausing requests for ${ESPN_COOLDOWN / 1000}s before retrying.`);
      }
    } else {
      console.warn(`[ESPN] Fetch error:`, error.message);
    }
    return espnCache[url]?.data || null; // return stale cache if available
  }
};

/**
 * Custom hook to fetch ESPN scoreboard data
 * @param {string} sport - Sport identifier (e.g., 'soccer', 'football')
 * @param {string} league - League identifier (e.g., 'eng.1', 'nfl')
 * @returns {Object} - { events, loading, error, lastUpdated }
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
    const dateParam = selectedDate ? `?dates=${toESPNDate(selectedDate)}` : '';
    const url = `${BASE}/${sport}/${league}/scoreboard${dateParam}`;
    const data = await espnGet(url);

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

    // Initial fetch
    fetchScoreboard();

    // Set up auto-refresh interval
    intervalRef.current = setInterval(fetchScoreboard, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sport, league, selectedDate, fetchScoreboard]);

  return { events, loading, error, lastUpdated };
};

/**
 * Custom hook to fetch all soccer league scoreboards
 * @returns {Object} - { leagues, loading, totalMatches, activeLeagues }
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
        // Import SOCCER_LEAGUES from constants
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

        // Progressive loading: update state as each batch completes
        // so users see scores within ~1s instead of waiting for all 15+ leagues
        const BATCH_SIZE = 5;
        const allResults = [];
        for (let i = 0; i < SOCCER_LEAGUES.length; i += BATCH_SIZE) {
          if (cancelled) return;
          const batch = SOCCER_LEAGUES.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(
            batch.map(async (league) => {
              const data = await espnGet(`${BASE}/soccer/${league.id}/scoreboard${dateParam}`);
              return { lg: league, events: data?.events || [] };
            })
          );
          allResults.push(...batchResults);

          // Update state after each batch so UI renders progressively
          if (!cancelled) {
            const snapshot = [...allResults];
            const total = snapshot.reduce((sum, l) => sum + l.events.length, 0);
            const active = snapshot.filter(l => l.events.length > 0).length;
            // Always update leagues so the UI shows something
            setLeagues(snapshot);
            setTotalMatches(total);
            setActiveLeagues(active);
            // After first batch, stop showing loading spinner
            setLoading(false);
          }
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
 * Custom hook to fetch news from multiple ESPN sources
 * @param {Array} sources - Array of { sport, label, icon, espn } objects
 * @returns {Object} - { articles, loading }
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
        const promises = sources.map(src =>
          espnGet(`https://site.api.espn.com/apis/site/v2/sports/${src.espn}/news?limit=10`)
        );

        const results = await Promise.all(promises);

        // Combine and deduplicate by headline
        const combined = [];
        const seenHeadlines = new Set();

        results.forEach((result, idx) => {
          if (result && result.articles) {
            result.articles.forEach(article => {
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
          }
        });

        // Sort by published date descending
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
 * @param {string} sport - Sport identifier
 * @param {string} league - League identifier
 * @returns {Object} - { leaders, loading }
 */
export const useESPNLeaders = (sport, league) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sport || !league) return;

    const fetchLeaders = async () => {
      setLoading(true);
      const url = `${BASE}/${sport}/${league}/leaders`;
      const data = await espnGet(url);

      if (data && data.leaders) {
        // Extract goals/top scorers
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
 * @param {string} sport - Sport identifier
 * @param {string} league - League identifier
 * @returns {Object} - { tables, loading }
 */
export const useESPNStandings = (sport, league) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sport || !league) return;

    const fetchStandings = async () => {
      setLoading(true);
      const url = `${BASE}/${sport}/${league}/standings`;
      const data = await espnGet(url);

      if (data) {
        // Extract tables via recursive tree walk
        const extractTables = (node) => {
          const result = [];

          if (node.standings) {
            result.push(...node.standings);
          }

          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => {
              result.push(...extractTables(child));
            });
          }

          return result;
        };

        const extractedTables = extractTables(data);
        setTables(extractedTables);
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
 * @param {string} eventId - The event/match ID
 * @param {string} sport - Sport identifier
 * @param {string} league - League identifier
 * @returns {Object} - { data, loading }
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
      const url = `${BASE}/${sport}/${league}/summary?event=${eventId}`;
      // Direct fetch — bypass espnGet cooldown so match clicks are never blocked
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.warn('[MatchDetail] Fetch error:', err.message);
        setError(err.message);
        setData(null);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [eventId, sport, league, enabled]);

  return { data, loading, error };
};

/**
 * Generic multi-league scoreboard hook (works for tennis, or any sport with sub-leagues)
 * @param {string} sport - Sport identifier (e.g., 'tennis')
 * @param {Array} leagues - Array of { id, name, emoji, ... } objects
 * @param {Date|string|null} selectedDate
 * @returns {Object} - { leagues, loading, totalMatches, activeLeagues }
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

        // Progressive loading: update state per batch
        const BATCH_SIZE = 5;
        const allResults = [];
        for (let i = 0; i < leagues.length; i += BATCH_SIZE) {
          if (cancelled) return;
          const batch = leagues.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(
            batch.map(async (league) => {
              const sportPath = league.sport || sport;
              const data = await espnGet(`${BASE}/${sportPath}/${league.id}/scoreboard${dateParam}`);
              return { lg: league, events: data?.events || [] };
            })
          );
          allResults.push(...batchResults);

          if (!cancelled) {
            const snapshot = [...allResults];
            const total = snapshot.reduce((sum, l) => sum + l.events.length, 0);
            const active = snapshot.filter(l => l.events.length > 0).length;
            if (total > 0) {
              setLeagueResults(snapshot);
              setTotalMatches(total);
              setActiveLeagues(active);
              setLoading(false);
            }
          }
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
 * Fetch scoring plays from ESPN summary endpoint
 * @param {string} eventId - The event/match ID
 * @param {string} sport - Sport identifier
 * @param {string} league - League identifier
 * @returns {Promise<Object>} - { hScorers, aScorers } arrays
 */
export const fetchScorers = async (eventId, sport, league) => {
  const cacheKey = `${eventId}-${sport}-${league}`;

  if (scorerCache[cacheKey]) {
    return scorerCache[cacheKey];
  }

  try {
    const url = `${BASE}/${sport}/${league}/summary?event=${eventId}`;
    const data = await espnGet(url);

    if (!data || !data.article) {
      return { hScorers: [], aScorers: [] };
    }

    // Extract scorers from article or boxscore
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
