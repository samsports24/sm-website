import { useState, useEffect, useCallback, useMemo } from 'react'
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
import RightSidebar, { AuthCard } from './RightSidebar'
import MatchDrawer from './MatchDrawer'
import NewsCarousel from './NewsCarousel'
import StandingsPanel from './StandingsPanel'
import WorldCupHub from './WorldCupHub'
import Footer from './Footer'
import ArticlesWidget from './ArticlesWidget'
import EcosystemPopup from '../../components/EcosystemPopup'
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
import { useSoccerFixtures } from './hooks/useAPIFootball'
import { useGNews } from './hooks/useGNewsData'

// Use API-Football for soccer if key is configured
const USE_API_FOOTBALL = !!process.env.REACT_APP_API_FOOTBALL_KEY

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

  // Top banner slide rotation (3 slides: SamSports, SAM RIVALS, SamSports)
  const [bannerSlide, setBannerSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setBannerSlide(prev => (prev + 1) % 3), 6000)
    return () => clearInterval(t)
  }, [])

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
  const navigate = useNavigate()
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
        }, '*')
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

  // Merge: use API-Football leagues that have data, fill gaps with ESPN
  const soccerData = useMemo(() => {
    if (!isSoccerActive) return { leagues: [], loading: false, totalMatches: 0, activeLeagues: 0 }
    if (!USE_API_FOOTBALL) return espnSoccerData

    const afLeagues = afSoccerData?.leagues || []
    const espnLeagues = espnSoccerData?.leagues || []

    const afCovered = new Set(
      afLeagues
        .filter(l => l.events?.length > 0)
        .map(l => (l.lg?.name || '').toLowerCase())
    )

    const espnExtras = espnLeagues.filter(l => {
      const name = (l.lg?.name || '').toLowerCase()
      return l.events?.length > 0 && !afCovered.has(name)
    })

    const merged = [...afLeagues, ...espnExtras]
    const totalMatches = merged.reduce((s, l) => s + (l.events?.length || 0), 0)
    const activeLeagues = merged.filter(l => l.events?.length > 0).length

    return {
      leagues: merged,
      loading: afSoccerData?.loading || espnSoccerData?.loading,
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
  const { articles: newsArticles } = useGNews()

  // Leaders (top scorers) — defer to avoid blocking initial render
  const [leadersReady, setLeadersReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLeadersReady(true), 3000)
    return () => clearTimeout(timer)
  }, [])
  const { leaders: topScorers } = useESPNLeaders(
    leadersReady ? 'soccer' : null,
    leadersReady ? 'eng.1' : null
  )

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
    for (const lg of (soccerData?.leagues || [])) {
      const tag = shortTag(lg.lg?.name || '')
      for (const ev of (lg.events || [])) {
        const item = parseEvent(ev, tag)
        if (item) items.push(item)
      }
    }

    // Fetch US sports (these use ESPN's cached responses when available)
    for (const [sport, league, tag] of [
      ['football', 'nfl', 'A.Football'], ['basketball', 'nba', 'NBA'],
      ['hockey', 'nhl', 'NHL'], ['baseball', 'mlb', 'MLB']
    ]) {
      try {
        const data = await espnGet(`${ESPN_API_BASE}/${sport}/${league}/scoreboard`)
        for (const ev of (data?.events || [])) {
          const item = parseEvent(ev, tag)
          if (item) items.push(item)
        }
      } catch (e) { /* skip */ }
    }

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

    // Defer initial ticker build to not compete with primary data loading
    const timer = setTimeout(buildTicker, 2000)
    const interval = setInterval(buildTicker, 60000) // was 30s
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [soccerData, leagueData, currentTab])

  // Headlines for left sidebar
  const headlines = useMemo(() => {
    if (!newsArticles.length) return []
    return newsArticles.slice(0, 10).map(a => ({
      ...a,
      _timeAgo: a.published ? timeAgo(new Date(a.published)) : ''
    }))
  }, [newsArticles])

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
    if (activeSport === 'worldcup') {
      return <WorldCupHub />
    }

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
        tennisData={tennisData}
        leagueData={leagueData}
        onMatchClick={handleMatchClick}
      />
    )
  }

  // Load Google Fonts once (not on every render)
  useEffect(() => {
    if (!document.getElementById('ls-gfonts')) {
      const link = document.createElement('link')
      link.id = 'ls-gfonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div className="ls-page">
      <SEO
        title="Fantasy Sports Hub — A.Football, Soccer, Tennis & More"
        description="SAM Sports is the ultimate fantasy sports platform. Draft real A.Football players, manage salary caps, compete in dynasty leagues, and climb the GM rankings."
        path="/"
      />

      {/* Ecosystem Popup - shows once per session */}
      <EcosystemPopup />

      <LandingHeader
        activeSport={activeSport}
        onSportChange={setActiveSport}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <LiveTicker tickerItems={tickerItems} />

      {/* Rotating Promo Banner (2 SamSports + 1 SAM RIVALS) */}
      <div className="ls-top-banner-wrap">
        <div className="ls-promo" onClick={() => navigate('/select-game')} style={bannerSlide !== 1 ? {background: 'linear-gradient(135deg, #0a1628 0%, #162544 50%, #0d2137 100%)'} : {}}>
          <div className="ls-promo-glow" style={bannerSlide !== 1 ? {background: 'radial-gradient(circle at 15% 50%, rgba(59,130,246,0.2), transparent 60%)'} : {}} />
          <div className="ls-promo-shimmer" />
          <div className="ls-promo-inner">
            {bannerSlide === 1 ? (
              <>
                <div className="ls-promo-left">
                  <span className="ls-promo-badge" style={{background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.4)'}}>NEW</span>
                  <div className="ls-promo-copy">
                    <span className="ls-promo-title">SAM <span className="ls-promo-highlight">RIVALS</span></span>
                    <span className="ls-promo-sub">Climb divisions · H2H Matchups · Promotion &amp; Relegation · Earn SamPoints</span>
                  </div>
                </div>
                <div className="ls-promo-right">
                  <div className="ls-promo-sports">
                    <span className="ls-promo-sport-pill active">Soccer</span>
                    <span className="ls-promo-sport-pill active" style={{background: 'rgba(124,58,237,0.2)', borderColor: 'rgba(124,58,237,0.4)', color: '#A78BFA'}}>A.Football</span>
                  </div>
                  <button className="ls-promo-cta" onClick={e => { e.stopPropagation(); navigate('/select-game') }}>
                    Enter Rivals
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="ls-promo-left">
                  <div className="ls-promo-copy">
                    <span className="ls-promo-title">SAM<span className="ls-promo-highlight" style={{color: '#3b82f6'}}>SPORTS</span></span>
                    <span className="ls-promo-sub">Fantasy Sports Reimagined. Draft, trade and compete across A.Football, Soccer &amp; more.</span>
                  </div>
                </div>
                <div className="ls-promo-right">
                  <div className="ls-promo-sports">
                    <span className="ls-promo-sport-pill active" style={{background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa'}}>A.Football</span>
                    <span className="ls-promo-sport-pill active">Soccer</span>
                  </div>
                  <button className="ls-promo-cta" onClick={e => { e.stopPropagation(); navigate('/select-game') }} style={{background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'}}>
                    Play Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Slide dots */}
        <div style={{display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8}}>
          {[0,1,2].map(i => (
            <button key={i} onClick={() => setBannerSlide(i)} style={{width: bannerSlide === i ? 18 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: bannerSlide === i ? (i === 1 ? '#22c55e' : '#3b82f6') : 'rgba(255,255,255,0.15)'}} />
          ))}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <DateNavBar selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Mobile Auth Card, visible only on narrow screens where sidebar is hidden */}
      {!isAuthenticated && (
        <div className="ls-mobile-auth-wrap">
          <AuthCard onSignup={() => navigate('/select-game')} />
        </div>
      )}

      <div className="ls-layout">
        <LeftSidebar
          headlines={headlines}
          onViewAllNews={() => setActiveSport('news')}
          onArticleClick={handleArticleClick}
        />

        <div className="ls-panels">
          <div className="ls-sec-hd">
            <div className="ls-sec-title">
              {currentTab?.emoji} <span>{currentTab?.label || 'A.Football'}</span>
            </div>
            <span className="ls-sec-sub">
              {activeSport === 'soccer' && soccerData?.totalMatches
                ? `${soccerData.activeLeagues} competitions · ${soccerData.totalMatches} matches`
                : ''}
            </span>
          </div>
          {renderMainContent()}
        </div>

        <RightSidebar
          scorers={topScorers}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <NewsCarousel articles={newsArticles} activeSport={activeSport} onArticleClick={handleArticleClick} />

      {/* SAM Reports — AI-Powered Match Analysis */}
      <ArticlesWidget limit={6} />

      {/* Discover SAMSports button removed — footer now handles About links */}

      {/* Main Footer */}
      <Footer />

      {/* Status Bar Footer */}
      <div className="ls-status-bar">
        <div className="ls-sb-left">
          <span><span className="ls-sb-dot g" /> Live Data, Updates every 60s</span>
          <span>Last refresh: {new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
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
          <a key={i} href={article.links?.web?.href || '#'} target="_blank" rel="noopener noreferrer" className="ls-news-card">
            {img ? (
              <img className="ls-news-img" src={img} alt="" loading="lazy" />
            ) : (
              <div className="ls-news-img-ph">{article._icon || '📰'}</div>
            )}
            <div className="ls-news-body">
              <div className="ls-news-sport">{article._icon} {article._label}</div>
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
