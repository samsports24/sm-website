import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SEO from '../../components/SEO'
import '../../styles/pages/landing.css'
import '../../styles/pages/custom-widgets.css'

// Sub-components
import LandingHeader from './LandingHeader'
import LiveTicker from './LiveTicker'
import SportPanel from './SportPanel'
import { SportWidgetPanel } from './CustomWidgets'

// Toggle: use new widget-style panels (set to true to enable)
const USE_WIDGET_PANELS = true
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import MatchDrawer from './MatchDrawer'
import NewsCarousel from './NewsCarousel'
import rivalsHeroSoccer from '../../assets/rivals-hero-soccer.png'
import rivalsHeroNfl from '../../assets/rivals-hero-nfl.png'
import StandingsPanel from './StandingsPanel'
import Footer from './Footer'
import ArticlesWidget from './ArticlesWidget'
import { getLatestArticles } from '../../soccer/services/articleService'
import PartnerAdverts from './PartnerAdverts'
import PartnerSimpleLanding from './PartnerSimpleLanding'
import { usePartner } from '../../contexts/PartnerContext'
import LoginModal from '../../components/LoginModal'
import { summarizeArticleUrl } from '../../redux/actions/newsAction'

// Hooks
import {
  useSoccerScoreboards,
  useESPNScoreboard,
  useMultiLeagueScoreboards,
  useESPNLeaders,
  espnGet
} from './hooks/useESPNData'
import { useSoccerFixtures, useLiveFixtures } from './hooks/useAPIFootball'
import { useGNews } from './hooks/useGNewsData'

// Soccer comes from the API-Football proxy on the soccer backend. The key lives
// on the BACKEND, so we must NOT gate this on a frontend env var — if that var is
// absent from a build, the app silently skips the working proxy and shows no
// soccer. Always use the proxy; the ESPN fallback covers the rare case it's empty.
const USE_API_FOOTBALL = true

// SAM Rivals hero banners (soccer + NFL). Wide art with black bars top/bottom
// that get cropped to a short, wide strip.
const RIVALS_HEROES = [rivalsHeroSoccer, rivalsHeroNfl]

// Backend base URL for the public landing-ads endpoint (admin-managed adverts).
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://backend.samsports.io'

// Constants
import {
  SPORT_TABS,
  ESPN_API_BASE,
  TENNIS_LEAGUES,
  getStatus,
  timeAgo
} from './constants'

/* ═══ AI Article Summary Modal ═══ */
const ArticleSummaryModal = ({ article, summary, loading, onClose }) => {
  if (!article) return null
  const headline = article.headline || article.title || ''
  const image = article.images?.[0]?.url || ''
  const source = article.source || ''
  const published = article.published ? new Date(article.published).toLocaleDateString() : ''
  const badge = article._icon ? `${article._icon} ${article._label}` : source
  const articleUrl = article.links?.web?.href || ''

  return (
    <div className="ls-article-overlay" onClick={onClose}>
      <div className="ls-article-popup" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="ls-article-close" onClick={onClose}>&times;</button>

        {/* Image header */}
        {image && (
          <div className="ls-article-img-wrap">
            <img src={image} alt="" className="ls-article-img" onError={(e) => { e.target.style.display = 'none' }} />
            <div className="ls-article-img-overlay" />
          </div>
        )}

        {/* Content */}
        <div className="ls-article-body">
          <div className="ls-article-meta-row">
            {badge && <span className="ls-article-badge">{badge}</span>}
            {published && <span className="ls-article-date">{published}</span>}
          </div>
          <h2 className="ls-article-headline">{headline}</h2>

          {/* AI Summary */}
          <div className="ls-article-summary-section">
            <div className="ls-article-ai-tag">
              <span className="ls-article-ai-dot" />
              SAM AI Reporter
            </div>
            {loading ? (
              <div className="ls-article-skeleton">
                <div className="ls-article-skeleton-line w80" />
                <div className="ls-article-skeleton-line w100" />
                <div className="ls-article-skeleton-line w60" />
                <div className="ls-article-skeleton-line w90" />
                <div className="ls-article-skeleton-line w70" />
              </div>
            ) : summary ? (
              <div className="ls-article-summary-text">
                {summary.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="ls-article-summary-text" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Summary unavailable. Click below to read the full article.
              </p>
            )}
          </div>

          {/* Read full article link */}
          {articleUrl && (
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ls-article-read-link"
            >
              Read Full Article
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══ Date Navigation Bar ═══ */
const DateNavBar = ({ selectedDate, onDateChange }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build ±7 days
  const days = []
  for (let i = -7; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }

  const isToday = (d) => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d.getTime() === t.getTime()
  }

  const isSameDay = (a, b) => {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
  }

  const formatDay = (d) => {
    if (isToday(d)) return 'Today'
    const diff = Math.round((d - today) / 86400000)
    if (diff === -1) return 'Yesterday'
    if (diff === 1) return 'Tomorrow'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const handleCalendar = (e) => {
    const val = e.target.value
    if (val) onDateChange(new Date(val + 'T00:00:00'))
  }

  const sel = selectedDate || today

  return (
    <div className="ls-date-nav">
      <div className="ls-date-nav-scroll">
        {days.map((d, i) => (
          <button
            key={i}
            className={`ls-date-pill ${isSameDay(d, sel) ? 'active' : ''} ${isToday(d) ? 'today' : ''}`}
            onClick={() => onDateChange(d)}
          >
            <span className="ls-date-pill-day">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="ls-date-pill-num">{d.getDate()}</span>
            {isToday(d) && <span className="ls-date-pill-dot" />}
          </button>
        ))}
      </div>
      <div className="ls-date-nav-cal">
        <input
          type="date"
          className="ls-date-cal-input"
          value={`${sel.getFullYear()}-${String(sel.getMonth() + 1).padStart(2, '0')}-${String(sel.getDate()).padStart(2, '0')}`}
          onChange={handleCalendar}
        />
        <span className="ls-date-nav-label">{formatDay(sel)}</span>
      </div>
    </div>
  )
}

const LandingPage = () => {
  const { isPartnerSite, landingPageMode } = usePartner()
  const navigate = useNavigate()

  // Live clock for status bar (updates every 30s)
  const [clockTime, setClockTime] = useState(() => new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'}))
  useEffect(() => {
    const id = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    }, 30000)
    return () => clearInterval(id)
  }, [])

  // Global state
  const [activeSport, setActiveSport] = useState('soccer')
  const [activeStanding, setActiveStanding] = useState('epl')

  // Date navigation state
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Login modal state
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // SAM Rivals hero banner — rotates between the football and soccer versions.
  const [heroIdx, setHeroIdx] = useState(0)
  const heroPausedRef = useRef(false)
  useEffect(() => {
    const id = setInterval(() => {
      if (!heroPausedRef.current) setHeroIdx((i) => (i + 1) % RIVALS_HEROES.length)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  // Admin-managed landing adverts (hero / left / right). Only ACTIVE ads with an
  // image are used; everything else falls back to the built-in promos.
  const [landingAds, setLandingAds] = useState({})
  useEffect(() => {
    let alive = true
    fetch(`${BACKEND_URL}/landing-ads`)
      .then((r) => r.json())
      .then((res) => {
        if (!alive) return
        const list = res?.data?.ads || res?.ads || []
        const map = {}
        list.forEach((a) => {
          if (a && a.active !== false && a.imageUrl) map[a.slot] = a
        })
        setLandingAds(map)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // Ad click: external URLs use a full navigation, internal paths use the router.
  const handleAdClick = useCallback((linkUrl) => {
    if (!linkUrl) { navigate('/select-game'); return }
    if (/^https?:\/\//i.test(linkUrl)) window.location.href = linkUrl
    else navigate(linkUrl)
  }, [navigate])

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerInfo, setDrawerInfo] = useState({ eventId: null, sport: '', league: '', leagueName: '' })

  // Article summary modal state
  const [modalArticle, setModalArticle] = useState(null)
  const [modalSummary, setModalSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Auth state from Redux
  const user = useSelector(state => state?.user)
  const isAuthenticated = !!user?.userDetails?._id
  const dispatch = useDispatch()

  // Listen for predictor iframe requesting login
  useEffect(() => {
    const handler = (e) => {
      try {
        if (e.data && typeof e.data === 'object' && e.data.type === 'wcp:requestLogin') {
          setLoginModalOpen(true)
        }
      } catch (_) { /* ignore non-serializable messages */ }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Partner "login" mode: redirect to game selection page
  useEffect(() => {
    if (isPartnerSite && landingPageMode === 'login') {
      navigate('/select-game', { replace: true })
    }
  }, [isPartnerSite, landingPageMode, navigate])

  // After login, push user into predictor iframe if it exists
  useEffect(() => {
    if (!isAuthenticated) return
    try {
      const uid = localStorage.getItem('userId')
      const name = localStorage.getItem('userName')
      if (!uid || !name) return
      const frame = document.getElementById('wcp-iframe')
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({
          type: 'wcp:auth',
          user: { id: uid, displayName: name, country: localStorage.getItem('userCountry') || '' },
          token: localStorage.getItem('token') || null, // JWT for backend API calls
        }, 'https://predictor.samsports.io')
      }
    } catch (_) { /* silent */ }
  }, [isAuthenticated])

  // Logout handler, clears localStorage and Redux state
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('week')
    // Clear stale league/invitation data so next login starts fresh
    ;['AssignLeague','leagueroom','roomId','paid','myinvitationtype',
      'selectedGame','imagePath','lrTeamId','modalShown','email',
      'onboardingComplete','selectedSports','authToken'].forEach(k => localStorage.removeItem(k))
    dispatch({ type: 'SET_USER_DETAILS', payload: { user: null, setting: null, record: null } })
  }, [dispatch])

  // Get current sport tab config
  const currentTab = SPORT_TABS.find(t => t.key === activeSport) || SPORT_TABS[0]

  // Data hooks — ONLY fetch data for the active sport tab to avoid 50+ concurrent API calls
  const isSoccerActive = activeSport === 'soccer'
  const isTennisActive = activeSport === 'tennis'
  const isMultiLeague = isSoccerActive || isTennisActive

  // Soccer: only fetch when soccer tab is active
  const espnSoccerData = useSoccerScoreboards(selectedDate, isSoccerActive)
  const afSoccerData = useSoccerFixtures(USE_API_FOOTBALL && isSoccerActive ? selectedDate : null)
  // All currently-live fixtures, independent of the league whitelist, the
  // selected date, OR the active tab — the ticker is a global bar, so live soccer
  // should show there even when the user is on another sport's tab.
  const { fixtures: liveSoccerFixtures } = useLiveFixtures(USE_API_FOOTBALL)

  // Soccer source is API-Football ONLY (when the key is present). We do NOT
  // merge ESPN in: the same competition appears under different names across
  // providers (ESPN "World Cup" vs API-Football "FIFA World Cup 2026"), which
  // showed every match twice. One source, no duplicates. ESPN is used only as
  // the full fallback when API-Football is unavailable.
  const soccerData = useMemo(() => {
    if (!isSoccerActive) return { leagues: [], loading: false, totalMatches: 0, activeLeagues: 0 }
    if (!USE_API_FOOTBALL) return espnSoccerData

    const afLeagues = afSoccerData?.leagues || []
    const totalMatches = afLeagues.reduce((s, l) => s + (l.events?.length || 0), 0)
    const activeLeagues = afLeagues.filter(l => l.events?.length > 0).length

    // Resilience: if API-Football returned nothing once it has finished loading
    // (proxy down, missing/invalid key, exhausted quota, or a gap the AF league
    // list doesn't cover) fall back to the ESPN feed so soccer still shows.
    if (totalMatches === 0 && afSoccerData && afSoccerData.loading === false) {
      const espnTotal = (espnSoccerData?.leagues || []).reduce((s, l) => s + (l.events?.length || 0), 0)
      if (espnTotal > 0) return espnSoccerData
    }

    return {
      leagues: afLeagues,
      loading: afSoccerData?.loading,
      totalMatches,
      activeLeagues,
    }
  }, [isSoccerActive, espnSoccerData, afSoccerData])

  // Tennis: only fetch when tennis tab is active
  const tennisData = useMultiLeagueScoreboards(
    isTennisActive ? 'tennis' : null,
    TENNIS_LEAGUES,
    selectedDate
  )

  // For non-soccer/non-tennis sports, determine the ESPN sport/league path
  const sportPath = currentTab?.sport || 'soccer'
  const leaguePath = currentTab?.league || 'eng.1'

  const leagueData = useESPNScoreboard(
    !isMultiLeague && currentTab?.sport ? sportPath : null,
    !isMultiLeague && currentTab?.league ? leaguePath : null,
    selectedDate
  )

  // News data (GNews API)
  const { articles: gnewsArticles } = useGNews()

  // SAM AI articles (generated via the admin panel) — blended into the same feed.
  const [aiArticles, setAiArticles] = useState([])
  useEffect(() => {
    let alive = true
    getLatestArticles(20)
      .then((res) => {
        const list = res?.data?.data?.articles || []
        if (!alive) return
        const SPORT_META = { football: { s: 'nfl', i: '🏈', l: 'A.Football' } }
        setAiArticles(list.map((a) => {
          const meta = SPORT_META[a.sport] || { s: 'soccer', i: '⚽', l: 'Soccer' }
          return {
            headline: a.title,
            title: a.title,
            published: a.createdAt || a.publishedAt,
            images: a.coverImage ? [{ url: a.coverImage }] : [],
            links: { web: { href: `/articles?article=${a.slug}` } },
            source: 'SAM AI',
            _sport: meta.s,
            _icon: meta.i,
            _label: meta.l,
            _ai: true,
            _slug: a.slug,
          }
        }))
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // Blended feed: SAM AI articles mixed with real headlines, newest first.
  const newsArticles = useMemo(() => {
    const combined = [...aiArticles, ...(gnewsArticles || [])]
    return combined.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0))
  }, [aiArticles, gnewsArticles])

  // Leaders (top scorers) — defer to avoid blocking initial render
  const [leadersReady, setLeadersReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLeadersReady(true), 500)
    return () => clearTimeout(timer)
  }, [])
  // ESPN leaders endpoint doesn't exist for soccer — disabled to avoid 404 spam
  const topScorers = []

  // Build ticker items, live games, next 24h upcoming, and recent results
  const [tickerItems, setTickerItems] = useState([])

  // Build ticker: soccer from already-fetched data, US sports via ESPN (with resilient fetch)
  useEffect(() => {
    const buildTicker = async () => {
    const items = []

    const parseEvent = (ev, tag) => {
      const comp = ev.competitions?.[0]
      if (!comp) return null
      const cs = comp.competitors || []
      const home = cs.find(c => c.homeAway === 'home') || cs[0]
      const away = cs.find(c => c.homeAway === 'away') || cs[1]
      if (!home || !away) return null
      const st = getStatus(comp)
      const eventDate = ev.date ? new Date(ev.date) : null

      let category = 'finished', sortKey = 2
      if (st.state === 'live' || st.state === 'halftime') { category = 'live'; sortKey = 0 }
      else if (st.state === 'scheduled') { category = 'upcoming'; sortKey = 1 }

      let score, statusLabel, statusCls
      if (category === 'live') {
        score = `${home.score || 0}-${away.score || 0}`
        statusCls = 'live'
        statusLabel = st.state === 'halftime' ? 'HT' : (st.clock || st.label || 'LIVE')
      } else if (category === 'upcoming') {
        score = 'vs'
        statusCls = 'upcoming'
        if (eventDate) {
          const h = String(eventDate.getHours()).padStart(2, '0')
          const m = String(eventDate.getMinutes()).padStart(2, '0')
          statusLabel = `${h}:${m}`
        } else {
          statusLabel = st.label || 'Soon'
        }
      } else {
        score = home.score !== undefined ? `${home.score}-${away.score}` : '-'
        statusCls = 'ft'
        statusLabel = st.label || 'FT'
      }

      return {
        tag, category, sortKey,
        homeAbbr: home.team?.abbreviation || '?',
        awayAbbr: away.team?.abbreviation || '?',
        score, statusCls, statusLabel,
        eventTime: eventDate ? eventDate.getTime() : 0,
      }
    }

    const shortTag = (name) => {
      const map = {
        'World Cup Qualifiers - UEFA': 'WCQ UEFA',
        'World Cup Qualifiers - CONMEBOL': 'WCQ SAM',
        'World Cup Qualifiers - CONCACAF': 'WCQ NAM',
        'World Cup Qualifiers - AFC': 'WCQ AFC',
        'World Cup Qualifiers - CAF': 'WCQ CAF',
        'World Cup Qualifiers - OFC': 'WCQ OFC',
        'Friendlies': 'Friendly',
        'UEFA Nations League': 'UNL',
        'Champions League': 'UCL',
        'Europa League': 'UEL',
        'Premier League': 'EPL',
        'La Liga': 'La Liga',
        'Bundesliga': 'BuLi',
        'Serie A': 'Serie A',
        'Ligue 1': 'Ligue 1',
        'FA Cup': 'FA Cup',
        'MLS': 'MLS',
      }
      return map[name] || name
    }

    // Use already-fetched soccer data (API-Football + ESPN merged) — no extra API calls
    const seenSoccer = new Set()
    for (const lg of (soccerData?.leagues || [])) {
      const tag = shortTag(lg.lg?.name || '')
      for (const ev of (lg.events || [])) {
        if (ev.id) seenSoccer.add(ev.id)
        const item = parseEvent(ev, tag)
        if (item) items.push(item)
      }
    }

    // Merge in ALL live fixtures (unfiltered by league/date). This catches live
    // matches in competitions that aren't in the configured league list.
    for (const ev of (liveSoccerFixtures || [])) {
      if (ev.id && seenSoccer.has(ev.id)) continue
      const item = parseEvent(ev, shortTag(ev._leagueName || '') || 'Live')
      if (item) items.push(item)
    }

    // Fetch US sports in parallel (only 4 calls — safe for ESPN rate limits)
    const usSports = [
      ['football', 'nfl', 'A.Football'], ['basketball', 'nba', 'NBA'],
      ['hockey', 'nhl', 'NHL'], ['baseball', 'mlb', 'MLB']
    ]
    const usSportsResults = await Promise.allSettled(
      usSports.map(([sport, league]) =>
        espnGet(sport, league, 'scoreboard')
      )
    )
    usSportsResults.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        for (const ev of (result.value?.events || [])) {
          const item = parseEvent(ev, usSports[idx][2])
          if (item) items.push(item)
        }
      }
    })

    // Sort: live first (recent), upcoming (soonest), finished (most recent)
    items.sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey
      if (a.sortKey === 1) return a.eventTime - b.eventTime
      return b.eventTime - a.eventTime
    })

    if (items.length > 0) {
      setTickerItems(items)
    }
    }

    // Short defer to let React render first frame, then build ticker
    const timer = setTimeout(buildTicker, 500)
    const interval = setInterval(buildTicker, 60000) // was 30s
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [soccerData, leagueData, currentTab, liveSoccerFixtures])

  // Headlines for left sidebar
  const headlines = useMemo(() => {
    if (!newsArticles.length) return []
    // Lead with headlines for the sport the user is viewing (mockup shows
    // soccer stories on the Soccer tab). Fall back to all news if that sport
    // has none, so the panel is never empty.
    const sportKey = activeSport === 'worldcup' ? 'soccer'
      : (activeSport === 'standings' || activeSport === 'news') ? null
        : activeSport === 'ncaafb' ? 'nfl'
          : activeSport === 'ncaab' ? 'nba'
            : activeSport
    const inSport = sportKey ? newsArticles.filter(a => a._sport === sportKey) : []
    const ordered = inSport.length
      ? [...inSport, ...newsArticles.filter(a => a._sport !== sportKey)]
      : newsArticles
    return ordered.slice(0, 10).map(a => ({
      ...a,
      _timeAgo: a.published ? timeAgo(new Date(a.published)) : ''
    }))
  }, [newsArticles, activeSport])

  // Match click handler
  const handleMatchClick = useCallback((eventId, sport, league, leagueName) => {
    setDrawerInfo({ eventId, sport, league, leagueName })
    setDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  // Article click → open AI summary modal
  const handleArticleClick = useCallback(async (article) => {
    const headline = article.headline || article.title || ''
    const url = article.links?.web?.href || ''
    setModalArticle(article)
    setModalSummary('')
    setSummaryLoading(true)

    try {
      const result = await summarizeArticleUrl(url, headline)
      setModalSummary(result?.summary || `${headline}. Stay tuned for more details on this developing story.`)
    } catch (err) {
      console.error('Article summary failed:', err)
      setModalSummary(`${headline}. Stay tuned for more details on this developing story.`)
    }
    setSummaryLoading(false)
  }, [])

  const closeArticleModal = useCallback(() => {
    setModalArticle(null)
    setModalSummary('')
  }, [])

  // Removed countdown timer — it was re-rendering the ENTIRE page every 1 second

  // Determine what main content to render
  const renderMainContent = () => {
    if (activeSport === 'standings') {
      return <StandingsPanel activeStanding={activeStanding} onStandingChange={setActiveStanding} />
    }

    if (activeSport === 'news') {
      return <NewsPanel articles={newsArticles} />
    }

    // Use widget-style panels or classic panels
    const PanelComponent = USE_WIDGET_PANELS ? SportWidgetPanel : SportPanel
    return (
      <PanelComponent
        activeSport={activeSport}
        currentTab={currentTab}
        soccerData={soccerData}
        liveSoccerFixtures={liveSoccerFixtures}
        tennisData={tennisData}
        leagueData={leagueData}
        onMatchClick={handleMatchClick}
        onSportChange={setActiveSport}
        onTeamClick={(sp, lg, id) => navigate(`/team/${sp}/${lg}/${id}`)}
      />
    )
  }

  // Google Fonts now loaded via public/index.html <link> for no FOUT

  // ── Partner landing page mode switching ──
  // Must be AFTER all hooks (React rules of hooks) but BEFORE main JSX return
  if (isPartnerSite && landingPageMode === 'login') {
    // Redirect handled by useEffect below to avoid calling navigate during render
    return null
  }
  if (isPartnerSite && landingPageMode === 'simple') {
    return <PartnerSimpleLanding />
  }
  // "full" or default → continue with the full sports hub landing page

  return (
    <div className="ls-page">
      <SEO
        title="Fantasy Sports Hub — A.Football, Soccer, Tennis & More"
        description="SAM Sports is the ultimate fantasy sports platform. Draft real A.Football players, manage salary caps, compete in dynasty leagues, and climb the GM rankings."
        path="/"
      />

      <LandingHeader
        activeSport={activeSport}
        onSportChange={setActiveSport}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <LiveTicker tickerItems={tickerItems} />

      {/* Partner Landing Banner Advert (only shows on partner subdomains) */}
      {isPartnerSite && <PartnerAdverts position="landing-banner" />}

      {/* Hero banner — an admin-configured advert if present, otherwise the
          built-in SAM Rivals rotation (football & soccer versions). */}
      {!isPartnerSite && (
        landingAds.hero ? (
          <div className="ls-top-banner-wrap">
            <button className="ls-hero-banner" onClick={() => handleAdClick(landingAds.hero.linkUrl)} aria-label="Advertisement">
              <img
                src={landingAds.hero.imageUrl}
                alt="Advertisement"
                className="ls-hero-banner-img active"
                loading="eager"
              />
            </button>
          </div>
        ) : (
          <div className="ls-top-banner-wrap"
            onMouseEnter={() => { heroPausedRef.current = true }}
            onMouseLeave={() => { heroPausedRef.current = false }}>
            <button className="ls-hero-banner" onClick={() => navigate('/select-game')} aria-label="SAM Rivals — enter">
              {RIVALS_HEROES.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="SAM Rivals"
                  className={`ls-hero-banner-img${i === heroIdx ? ' active' : ''}`}
                  loading="eager"
                />
              ))}
            </button>
            {RIVALS_HEROES.length > 1 && (
              <div className="ls-hero-dots">
                {RIVALS_HEROES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`ls-hero-dot${i === heroIdx ? ' active' : ''}`}
                    aria-label={`Banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Partner In-Feed Advert (only on partner sites, between banner and content) */}
      {isPartnerSite && <PartnerAdverts position="in-feed" />}

      {/* Date Navigation Bar */}
      <DateNavBar selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Mobile login is now on-demand: the header "Log in" button opens the
          LoginModal, so we no longer show a persistent auth card on mobile. */}

      <div className="ls-layout">
        <LeftSidebar
          headlines={headlines}
          onViewAllNews={() => setActiveSport('news')}
          onArticleClick={handleArticleClick}
          ad={landingAds.left}
        />

        <div className="ls-panels">
          <div className="ls-sec-hd">
            <div className="ls-sec-title">
              <span>{
                activeSport === 'standings' ? 'Standings'
                  : activeSport === 'worldcup' ? 'World Cup 2026'
                    : activeSport === 'news' ? 'Latest News'
                      : 'Live & Upcoming'
              }</span>
            </div>
            <span className="ls-sec-sub">
              {activeSport === 'soccer' && soccerData?.totalMatches
                ? `${soccerData.activeLeagues} competitions · ${soccerData.totalMatches} matches`
                : ''}
            </span>
          </div>
          {renderMainContent()}
        </div>

        <div>
          <RightSidebar
            scorers={topScorers}
            isAuthenticated={isAuthenticated}
            ad={landingAds.right}
          />
          {isPartnerSite && <PartnerAdverts position="sidebar" />}
        </div>
      </div>

      {/* Key Stories carousel — not in the approved mockup; moved off the
          landing for now (component preserved, just not rendered here). */}
      {false && <NewsCarousel articles={newsArticles} activeSport={activeSport} onArticleClick={handleArticleClick} />}

      {/* SAM Reports — AI-Powered Match Analysis */}
      <ArticlesWidget limit={6} />

      {/* Discover SAMSports button removed — footer now handles About links */}

      {/* Main Footer */}
      <Footer />

      {/* Status Bar Footer */}
      <div className="ls-status-bar">
        <div className="ls-sb-left">
          <span><span className="ls-sb-dot g" /> Live Data, Updates every 60s</span>
          <span>Last refresh: {clockTime}</span>
        </div>
        <span style={{color:'var(--ls-cyan)',fontFamily:'var(--ls-font-cd)',fontSize:9}}>Auto-refresh active</span>
        <span>SAMSports © 2026</span>
      </div>

      {/* Match Detail Drawer */}
      <MatchDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        eventId={drawerInfo.eventId}
        sport={drawerInfo.sport}
        league={drawerInfo.league}
        leagueName={drawerInfo.leagueName}
      />

      {/* Login Modal */}
      <LoginModal
        visible={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* AI Article Summary Modal */}
      {modalArticle && (
        <ArticleSummaryModal
          article={modalArticle}
          summary={modalSummary}
          loading={summaryLoading}
          onClose={closeArticleModal}
        />
      )}
    </div>
  )
}

// Simple News Panel for the "news" tab
const NewsPanel = ({ articles = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(0)
  const perPage = 8

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'soccer', label: '⚽ Soccer' },
    { key: 'nfl', label: '🏈 A.Football' },
    { key: 'nba', label: '🏀 NBA' },
    { key: 'nhl', label: '🏒 NHL' },
    { key: 'mlb', label: '⚾ MLB' },
  ]

  const filtered = activeFilter === 'all' ? articles : articles.filter(a => a._sport === activeFilter)
  const totalPages = Math.ceil(filtered.length / perPage)
  const currentPage = Math.min(page, totalPages - 1)
  const slice = filtered.slice(currentPage * perPage, (currentPage + 1) * perPage)

  return (
    <div>
      <div className="ls-news-filter-row">
        {filters.map(f => (
          <button
            key={f.key}
            className={`ls-news-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => { setActiveFilter(f.key); setPage(0); }}
          >
            {f.label}
          </button>
        ))}
      </div>
      {slice.map((article, i) => {
        const img = article.images?.[0]?.url
        return (
          <a key={i} href={article.links?.web?.href || '#'} {...(article._ai ? {} : { target: '_blank', rel: 'noopener noreferrer' })} className="ls-news-card">
            {img ? (
              <img className="ls-news-img" src={img} alt="" loading="lazy" />
            ) : (
              <div className="ls-news-img-ph">{article._icon || '📰'}</div>
            )}
            <div className="ls-news-body">
              <div className="ls-news-sport">
                {article._icon} {article._label}
                {article._ai && (
                  <span style={{ marginLeft: 6, background: '#22C55E', color: '#04120a', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>SAM AI</span>
                )}
              </div>
              <div className="ls-news-headline">{article.headline || article.title}</div>
              <div className="ls-news-meta">
                {article.source && <><span>{article.source}</span><span style={{color:'var(--ls-gdim)'}}>·</span></>}
                <span>{article.published ? timeAgo(new Date(article.published)) : ''}</span>
              </div>
            </div>
          </a>
        )
      })}
      {totalPages > 1 && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'16px 0',marginTop:4,borderTop:'1px solid var(--ls-bdim)'}}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            style={{fontFamily:'var(--ls-font-cd)',fontSize:11,fontWeight:700,padding:'6px 14px',background:'var(--ls-surface)',border:'1px solid var(--ls-border)',color: currentPage === 0 ? 'var(--ls-gdim)' : 'var(--ls-white)',borderRadius:6,cursor:'pointer'}}
          >
            ← Prev
          </button>
          <span style={{fontFamily:'var(--ls-font-cd)',fontSize:10,color:'var(--ls-gray)'}}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            style={{fontFamily:'var(--ls-font-cd)',fontSize:11,fontWeight:700,padding:'6px 14px',background:'var(--ls-surface)',border:'1px solid var(--ls-border)',color: currentPage === totalPages - 1 ? 'var(--ls-gdim)' : 'var(--ls-white)',borderRadius:6,cursor:'pointer'}}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default LandingPage
