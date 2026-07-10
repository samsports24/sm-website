import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Badge, Spin, Tooltip, notification } from 'antd'
import { LoadingOutlined, CloseOutlined, TrophyOutlined, ReloadOutlined, CheckOutlined, StopOutlined, CrownOutlined, SendOutlined, MessageOutlined, SwapOutlined } from '@ant-design/icons'
import { attachToken, privateAPI } from '../../config/constants'
import './styles.css'

// ═══ Public routes where AI Coaches should NOT appear ═══
const PUBLIC_ROUTES = ['/', '/login', '/sign-up', '/signup', '/forgot-password', '/authentication', '/select-game', '/select-league', '/proleague', '/create-join-league', '/onboarding', '/hub', '/terms-condition', '/success', '/error', '/partner-dashboard']

const antIcon = <LoadingOutlined style={{ fontSize: 20, color: '#f97316' }} spin />

// Custom football helmet head icon, futuristic AI coach
const CoachIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Helmet shell */}
    <path d="M32 4C18 4 10 14 10 28C10 34 11 38 13 41L15 42L15 46C15 48 16 49 18 49L22 49L22 52C22 54 24 56 26 56L38 56C40 56 42 54 42 52L42 49L46 49C48 49 49 48 49 46L49 42L51 41C53 38 54 34 54 28C54 14 46 4 32 4Z" fill={color} opacity="0.9" />
    {/* Helmet stripe on top */}
    <path d="M30 4.5C30 4.5 30 16 30 28L34 28C34 16 34 4.5 34 4.5" fill={color} />
    {/* Ear hole */}
    <ellipse cx="14" cy="32" rx="3" ry="5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
    {/* Face opening */}
    <path d="M18 24C18 24 16 30 16 36C16 40 18 44 20 44L22 44" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
    {/* Facemask bars */}
    <path d="M18 28L10 30" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M17 33L8 34" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M17 38L9 38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    {/* Visor / eye shield glow line */}
    <path d="M19 26C19 26 22 25 28 25" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
)

// Role badge component, displayed next to AI assistant names
const RoleBadge = ({ role, color }) => (
  <span
    className='aicw-role-badge'
    style={{
      background: `${color}22`,
      color: color,
      border: `1px solid ${color}44`,
    }}
  >
    {role}
  </span>
)

// ═══ Fantasy Coach Config v2026.3.21 ═══
const FANTASY_COACH_CONFIG = {
  version: '2026.3.21',
  sport: 'nfl',
  core_formulas: {
    pdi: '((Key Passes * 5) + (Big Chances Created * 10)) / Total Passes * 100',
    simulated_xg: '(Shots on Target * 0.35) + (Big Chances Created * 0.1)',
    power_ranking: { attacking: 0.40, creativity: 0.30, defense: 0.20, discipline: 0.10 },
  },
  injury_surface_logic: {
    turf_alert_stadiums: ['MetLife', 'SoFi', 'AT&T', 'Mercedes-Benz', 'Lumen', 'Ford', 'Gillette', 'Superdome', 'Lucas Oil', 'Highmark', 'Rogers Centre', 'Tropicana', 'Chase', 'LoanDepot', 'Globe Life'],
    trigger_rule: { condition: 'IF (Surface == Turf) AND (Player_History == ACL OR Achilles)', penalty: '-15% Projection' },
  },
  sport_rules: {
    rookie_metric: 'YPRR (Yards Per Route Run)',
    qb_bridge_logic: 'Wait for veteran Bridge (Cousins/Geno) to have 2+ INT game before starting rookie (Mendoza)',
  },
  weather_logic: {
    wind_over_15mph: 'Downgrade Kickers 20%',
    rain_on_grass: 'Upgrade Rushing Yard floor (Power Backs)',
    temp_under_4c: 'Trigger Soft Tissue Alert for Hamstring/Calf history',
  },
  efficiency_protocol: {
    age_cliff_wr: 30,
    auction_trap: 'Nominate legacy names (Rodgers) early to drain opponent budgets',
    poach_priority: 'Keaton Mitchell (Chargers) - 4.37 speed',
  },
  commands: ['Scout-Pro Report', 'Tactical Friction', 'Auction Strategy'],
}

const COACH_INFO = {
  scout: {
    name: 'Ray',
    role: 'AI Scout',
    subtitle: 'Young Talent & Scouting Vault',
    icon: <CoachIcon size={22} color="#3b82f6" />,
    color: '#3b82f6',
    description: 'Analyzes 32-stat data, turf injury risks, and college-to-pro scouting. Finds undervalued players under 28 with high upside using YPRR and advanced metrics.',
  },
  closer: {
    name: 'Jon',
    role: 'AI Coach',
    subtitle: 'Matchday Strategist',
    icon: <CoachIcon size={22} color="#f97316" />,
    color: '#f97316',
    description: 'Ruthless efficiency protocol. Weather impact analysis, auction trap strategies, and live news-driven projections. Exploits age cliffs and drains opponent budgets.',
  },
}

const AICoachWidget = () => {
  const location = useLocation()
  const { currentLeague } = useSelector((state) => state.league)
  const user = useSelector((state) => state.user.userDetails)

  const [isOpen, setIsOpen] = useState(false)
  const [activeCoach, setActiveCoach] = useState(null) // 'scout' | 'closer'
  const [subscriptions, setSubscriptions] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [lineup, setLineup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState('picks') // 'picks' | 'lineup' | 'chat'

  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatId, setChatId] = useState(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const chatEndRef = useRef(null)
  const pricingRef = useRef(null)

  // Weekly usage tracking
  const [usage, setUsage] = useState(null)

  // Fetch subscriptions + usage
  const fetchSubscriptions = useCallback(async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/coach/subscriptions')
      const data = res.data?.data
      setSubscriptions(data?.subscriptions || [])
      if (data?.subscription?.usage) setUsage(data.subscription.usage)
    } catch (err) {
      console.error('Failed to fetch coach subscriptions:', err)
    }
  }, [])

  // Fetch unread count
  const fetchUnread = useCallback(async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/coach/unread-count')
      setUnreadCount(res.data?.data?.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }, [])

  // Fetch recommendations for active coach
  const fetchRecommendations = useCallback(async (coachType) => {
    try {
      setLoading(true)
      attachToken()
      const res = await privateAPI.get(`/coach/recommendations/${coachType}`)
      setRecommendations(res.data?.data?.recommendations || [])
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch lineup advice
  const fetchLineup = useCallback(async () => {
    try {
      attachToken()
      const res = await privateAPI.get('/coach/lineup')
      setLineup(res.data?.data?.lineup || null)
    } catch (err) {
      console.error('Failed to fetch lineup:', err)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
    fetchUnread()
  }, [fetchSubscriptions, fetchUnread])

  useEffect(() => {
    if (activeCoach) {
      fetchRecommendations(activeCoach)
      fetchLineup()
    }
  }, [activeCoach, fetchRecommendations, fetchLineup])

  // Check if user has an active subscription for a coach type
  const isSubscribed = (coachType) => subscriptions.some(
    (s) => s.status === 'active' && (s.coachType === 'both' || s.coachType === coachType)
  )
  const activeSub = subscriptions[0] || null
  const tierLabel = activeSub?.tier
    ? activeSub.tier.charAt(0).toUpperCase() + activeSub.tier.slice(1)
    : null

  // Request on-demand analysis
  const handleAnalyze = async (coachType) => {
    setAnalyzing(true)
    try {
      attachToken()
      await privateAPI.post('/coach/analyze', { coachType })
      notification.success({ message: `${COACH_INFO[coachType].name} analysis complete!` })
      fetchRecommendations(coachType)
      fetchLineup()
      fetchUnread()
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed'
      notification.error({ message: msg })
    } finally {
      setAnalyzing(false)
    }
  }

  // Subscribe to a coach tier
  const handleSubscribe = async (tier, plan) => {
    try {
      attachToken()
      const res = await privateAPI.post('/coach/checkout', { tier, plan })
      const url = res.data?.data?.url
      if (url) {
        window.location.href = url // Redirect to Stripe checkout
      }
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Checkout failed' })
    }
  }

  // Mark recommendation as read
  const handleMarkRead = async (id) => {
    try {
      attachToken()
      await privateAPI.put(`/coach/read/${id}`)
      fetchUnread()
    } catch (err) {
      console.error(err)
    }
  }

  // Update player action, if accepted, backend auto-creates auction
  const handlePlayerAction = async (recommendationId, playerIndex, action) => {
    try {
      attachToken()
      const res = await privateAPI.put('/coach/action', { recommendationId, playerIndex, action })
      const auctionData = res.data?.data?.auction

      if (auctionData?.auctionId) {
        notification.success({
          message: 'Auction Started',
          description: auctionData.message,
          duration: 6,
        })
      } else if (auctionData?.message) {
        notification.info({ message: auctionData.message, duration: 4 })
      }

      fetchRecommendations(activeCoach)
    } catch (err) {
      console.error(err)
      notification.error({ message: 'Failed to process action' })
    }
  }

  // ─── Chat functions ───

  // Fetch chat history when switching to chat tab or changing coach
  const fetchChatHistory = useCallback(async (coachType) => {
    try {
      attachToken()
      const res = await privateAPI.get(`/coach/chat/${coachType}`)
      const data = res.data?.data
      if (data?.messages?.length) {
        setChatMessages(data.messages)
        setChatId(data.chatId)
      } else {
        setChatMessages([])
        setChatId(null)
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
    }
  }, [])

  // Send message to coach
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading || !activeCoach) return

    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }])
    setChatLoading(true)

    try {
      attachToken()
      const res = await privateAPI.post('/coach/chat/send', {
        coachType: activeCoach,
        message: userMsg,
        chatId,
      })
      const data = res.data?.data
      setChatId(data?.chatId || chatId)
      setChatMessages((prev) => [
        ...prev,
        { role: 'coach', content: data?.response || 'No response', timestamp: new Date() },
      ])
    } catch (err) {
      const status = err.response?.status
      const errData = err.response?.data?.data || err.response?.data
      const errMsg = errData?.error || errData?.message || err.response?.data?.message || 'Failed to get response'

      if (status === 403) {
        // Subscription required — show paywall inline
        setShowPaywall(true)
      } else if (status === 429) {
        // Rate limit, show as warning with upgrade hint
        notification.warning({ message: 'Limit Reached', description: errMsg, duration: 6 })
        if (errData?.usage) setUsage(errData.usage)
      } else {
        notification.error({ message: errMsg })
      }
      // Remove the optimistic user message on failure
      setChatMessages((prev) => prev.slice(0, -1))
      setChatInput(userMsg) // Put the message back
    } finally {
      setChatLoading(false)
    }
  }

  // Start new chat
  const handleNewChat = async () => {
    if (!activeCoach) return
    try {
      attachToken()
      const res = await privateAPI.post('/coach/chat/new', { coachType: activeCoach })
      setChatId(res.data?.data?.chatId || null)
      setChatMessages([])
    } catch (err) {
      console.error('Failed to start new chat:', err)
    }
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Load chat history when entering chat tab
  useEffect(() => {
    if (activeTab === 'chat' && activeCoach) {
      fetchChatHistory(activeCoach)
    }
  }, [activeTab, activeCoach, fetchChatHistory])

  const latestRec = recommendations[0]

  // ═══ Hide AI Coaches on public/landing pages and partner dashboard ═══
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname) || location.pathname.startsWith('/partner-dashboard')
  if (isPublicRoute) return null

  return (
    <>
      {/* ═══ Floating toggle button (hidden when panel is open) ═══ */}
      {!isOpen && (
        <div className='aicw-toggle' onClick={() => setIsOpen(true)}>
          <Badge count={unreadCount} size='small' offset={[-2, 2]}>
            <div className='aicw-toggle-icon'>
              <CoachIcon size={24} color="#fff" />
            </div>
          </Badge>
        </div>
      )}

      {/* ═══ Sidebar panel ═══ */}
      {isOpen && (
        <div className='aicw-sidebar'>
          {/* Header */}
          <div className='aicw-header'>
            <div className='aicw-header-left'>
              <span className='aicw-header-icon'><CoachIcon size={22} color="#f97316" /></span>
              <span className='aicw-header-title'>AI Coaches</span>
            </div>
            <CloseOutlined className='aicw-close' onClick={() => setIsOpen(false)} />
          </div>

          {/* Coach selector */}
          {!activeCoach ? (
            <div className='aicw-coach-list'>
              {/* Weekly Usage Bar, shown for subscribed users */}
              {activeSub && usage && (
                <div className='aicw-usage-section'>
                  <div className='aicw-usage-header'>
                    <span className='aicw-usage-tier'>{tierLabel} Tier</span>
                    <span className='aicw-usage-reset'>Resets {usage.resetsAt ? new Date(usage.resetsAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Mon'}</span>
                  </div>
                  <div className='aicw-usage-bars'>
                    <div className='aicw-usage-item'>
                      <div className='aicw-usage-label'>
                        <span>Analyses</span>
                        <span>{usage.analyses?.used || 0}/{usage.analyses?.limit || 0}</span>
                      </div>
                      <div className='aicw-usage-bar'>
                        <div className='aicw-usage-fill' style={{ width: `${Math.min(100, ((usage.analyses?.used || 0) / (usage.analyses?.limit || 1)) * 100)}%`, background: '#f97316' }} />
                      </div>
                    </div>
                    <div className='aicw-usage-item'>
                      <div className='aicw-usage-label'>
                        <span>Chat Messages</span>
                        <span>{usage.chatMessages?.used || 0}/{usage.chatMessages?.limit || 0}</span>
                      </div>
                      <div className='aicw-usage-bar'>
                        <div className='aicw-usage-fill' style={{ width: `${Math.min(100, ((usage.chatMessages?.used || 0) / (usage.chatMessages?.limit || 1)) * 100)}%`, background: '#3b82f6' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coach Cards */}
              {['scout', 'closer'].map((type) => {
                const info = COACH_INFO[type]
                const subscribed = isSubscribed(type)

                return (
                  <div
                    key={type}
                    className={`aicw-coach-card`}
                    style={{ borderLeftColor: info.color, cursor: 'pointer' }}
                    onClick={() => setActiveCoach(type)}
                  >
                    <div className='aicw-coach-card-top'>
                      <div className='aicw-coach-icon' style={{ color: info.color }}>
                        {info.icon}
                      </div>
                      <div className='aicw-coach-info'>
                        <span className='aicw-coach-name'>
                          {info.name}
                          <RoleBadge role={info.role} color={info.color} />
                        </span>
                        <span className='aicw-coach-sub'>{info.subtitle}</span>
                      </div>
                      {subscribed ? (
                        <span className='aicw-active-badge'>Active</span>
                      ) : (
                        <span className='aicw-locked-badge' style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>Choose Plan</span>
                      )}
                    </div>
                    <p className='aicw-coach-desc'>{info.description}</p>
                  </div>
                )
              })}

              {/* Tier-based pricing, shown when user has no subscription */}
              {!activeSub && (
                <div className='aicw-tier-section' ref={pricingRef}>
                  <h4 className='aicw-tier-title'>Choose Your Plan</h4>
                  {[
                    { tier: 'rookie', label: 'Rookie', price: '$9.99/mo', yearly: '$89.99/yr', coaches: 'Both Coaches', chats: '40 chats/wk', analyses: '5 analyses/wk', color: '#22C55E' },
                    { tier: 'pro', label: 'Pro', price: '$17.99/mo', yearly: '$159.99/yr', coaches: 'Both Coaches', chats: '75 chats/wk', analyses: '10 analyses/wk', color: '#3b82f6', popular: true },
                    { tier: 'elite', label: 'Elite', price: '$29.99/mo', yearly: '$269.99/yr', coaches: 'Both Coaches', chats: '150 chats/wk', analyses: '20 analyses/wk', color: '#f97316' },
                  ].map((t) => (
                    <div key={t.tier} className='aicw-tier-card' style={{ borderColor: t.color + '44' }}>
                      {t.popular && <span className='aicw-tier-popular' style={{ background: t.color }}>Most Popular</span>}
                      <div className='aicw-tier-header'>
                        <span className='aicw-tier-name' style={{ color: t.color }}>{t.label}</span>
                        <span className='aicw-tier-price'>{t.price}</span>
                      </div>
                      <div className='aicw-tier-features'>
                        <span>{t.coaches}</span>
                        <span>{t.chats}</span>
                        <span>{t.analyses}</span>
                      </div>
                      <div className='aicw-subscribe-btns'>
                        <button className='aicw-btn aicw-btn-monthly' onClick={(e) => { e.stopPropagation(); handleSubscribe(t.tier, 'monthly') }}>
                          {t.price}
                        </button>
                        <button className='aicw-btn aicw-btn-yearly' onClick={(e) => { e.stopPropagation(); handleSubscribe(t.tier, 'yearly') }}>
                          {t.yearly}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Active coach view */}
              <div className='aicw-active-header'>
                <button className='aicw-back' onClick={() => { setActiveCoach(null); setActiveTab('picks'); setChatMessages([]); setChatId(null); setChatInput(''); setShowPaywall(false) }}>
                  &larr; Back
                </button>
                <div className='aicw-active-info'>
                  <span style={{ color: COACH_INFO[activeCoach].color }}>{COACH_INFO[activeCoach].icon}</span>
                  <span className='aicw-active-name'>
                    {COACH_INFO[activeCoach].name}
                    <RoleBadge role={COACH_INFO[activeCoach].role} color={COACH_INFO[activeCoach].color} />
                  </span>
                </div>
                <Tooltip title='Run new analysis'>
                  <button
                    className='aicw-analyze-btn'
                    onClick={() => handleAnalyze(activeCoach)}
                    disabled={analyzing}
                  >
                    {analyzing ? <Spin indicator={antIcon} /> : <ReloadOutlined />}
                  </button>
                </Tooltip>
              </div>

              {/* Tab switcher */}
              <div className='aicw-tabs'>
                <button
                  className={`aicw-tab ${activeTab === 'picks' ? 'aicw-tab-active' : ''}`}
                  onClick={() => setActiveTab('picks')}
                >
                  Player Picks
                </button>
                <button
                  className={`aicw-tab ${activeTab === 'lineup' ? 'aicw-tab-active' : ''}`}
                  onClick={() => setActiveTab('lineup')}
                >
                  Lineup
                </button>
                <button
                  className={`aicw-tab ${activeTab === 'chat' ? 'aicw-tab-active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageOutlined /> Chat
                </button>
              </div>

              {/* Content */}
              <div className='aicw-content'>
                {loading ? (
                  <div className='aicw-loading'><Spin indicator={antIcon} /></div>
                ) : activeTab === 'picks' ? (
                  <>
                    {/* Summary */}
                    {latestRec?.summary && (
                      <div className='aicw-summary'>
                        <p>{latestRec.summary}</p>
                        {latestRec.marketAnalysis && (
                          <p className='aicw-market'>{latestRec.marketAnalysis}</p>
                        )}
                      </div>
                    )}

                    {/* Player recommendations */}
                    {latestRec?.recommendations?.map((rec, i) => (
                      <div
                        key={i}
                        className='aicw-player-card'
                        onClick={() => { if (!latestRec.isRead) handleMarkRead(latestRec._id) }}
                      >
                        <div className='aicw-player-top'>
                          <div className='aicw-player-rank'>#{rec.priority}</div>
                          <div className='aicw-player-info'>
                            <span className='aicw-player-name'>{rec.playerName}</span>
                            <span className='aicw-player-meta'>
                              {rec.position} &middot; Age {rec.age} &middot; {rec.currentStatus?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <p className='aicw-player-reason'>{rec.reason}</p>

                        {rec.matchupInsight && (
                          <p className='aicw-matchup-insight'>
                            <TrophyOutlined /> {rec.matchupInsight}
                          </p>
                        )}

                        <div className='aicw-player-stats'>
                          {rec.performanceData?.last5GamesAvg != null && (
                            <span className='aicw-stat'>L5 Avg: {rec.performanceData.last5GamesAvg}</span>
                          )}
                          {rec.performanceData?.trend && (
                            <span className={`aicw-trend aicw-trend-${rec.performanceData.trend}`}>
                              {rec.performanceData.trend}
                            </span>
                          )}
                          <span className='aicw-stat'>{rec.acquisitionMethod?.replace(/_/g, ' ')}</span>
                        </div>

                        {rec.userAction === 'pending' && (
                          <div className='aicw-actions'>
                            <button
                              className='aicw-action-btn aicw-action-accept'
                              onClick={(e) => { e.stopPropagation(); handlePlayerAction(latestRec._id, i, 'accepted') }}
                            >
                              <CheckOutlined /> Accept
                            </button>
                            <button
                              className='aicw-action-btn aicw-action-dismiss'
                              onClick={(e) => { e.stopPropagation(); handlePlayerAction(latestRec._id, i, 'dismissed') }}
                            >
                              <StopOutlined /> Dismiss
                            </button>
                          </div>
                        )}
                        {rec.userAction !== 'pending' && (
                          <span className={`aicw-action-status aicw-status-${rec.userAction}`}>
                            {rec.userAction}
                          </span>
                        )}
                      </div>
                    ))}

                    {!latestRec && (
                      <div className='aicw-empty'>
                        <p>No recommendations yet.</p>
                        <button
                          className='aicw-btn aicw-btn-monthly'
                          onClick={() => handleAnalyze(activeCoach)}
                          disabled={analyzing}
                        >
                          {analyzing ? 'Analyzing...' : 'Run First Analysis'}
                        </button>
                      </div>
                    )}
                  </>
                ) : activeTab === 'lineup' ? (
                  /* Lineup tab */
                  <div className='aicw-lineup-section'>
                    {lineup?.bestLineup ? (
                      <>
                        <div className='aicw-lineup-group'>
                          <h4 className='aicw-lineup-heading'>
                            <CrownOutlined style={{ color: '#22c55e' }} /> Start These Players
                          </h4>
                          {lineup.bestLineup.starters?.map((s, i) => (
                            <div key={i} className='aicw-lineup-item aicw-lineup-start'>
                              <div className='aicw-lineup-player'>
                                <span className='aicw-lineup-name'>{s.playerName}</span>
                                <span className='aicw-lineup-pos'>{s.position}</span>
                              </div>
                              <p className='aicw-lineup-reason'>{s.reason}</p>
                            </div>
                          ))}
                        </div>

                        {lineup.bestLineup.sitCandidates?.length > 0 && (
                          <div className='aicw-lineup-group'>
                            <h4 className='aicw-lineup-heading'>
                              <StopOutlined style={{ color: '#ef4444' }} /> Consider Benching
                            </h4>
                            {lineup.bestLineup.sitCandidates?.map((s, i) => (
                              <div key={i} className='aicw-lineup-item aicw-lineup-sit'>
                                <div className='aicw-lineup-player'>
                                  <span className='aicw-lineup-name'>{s.playerName}</span>
                                  <span className='aicw-lineup-pos'>{s.position}</span>
                                </div>
                                <p className='aicw-lineup-reason'>{s.reason}</p>

                                {/* Replacement suggestion */}
                                {s.replacement?.playerName && (
                                  <div className='aicw-replacement'>
                                    <div className='aicw-replacement-header'>
                                      <SwapOutlined style={{ color: '#22c55e' }} />
                                      <span className='aicw-replacement-label'>Start Instead:</span>
                                    </div>
                                    <div className='aicw-replacement-player'>
                                      <span className='aicw-replacement-name'>{s.replacement.playerName}</span>
                                      <span className='aicw-replacement-pos'>{s.replacement.position}</span>
                                      {s.replacement.source && (
                                        <span className='aicw-replacement-source'>{s.replacement.source.replace(/_/g, ' ')}</span>
                                      )}
                                    </div>
                                    {s.replacement.reason && (
                                      <p className='aicw-replacement-reason'>{s.replacement.reason}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <p className='aicw-lineup-source'>
                          From {COACH_INFO[lineup.coachType]?.name || 'Coach'} &middot; {new Date(lineup.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <div className='aicw-empty'>
                        <p>No lineup advice yet. Run an analysis to get personalized start/sit recommendations based on this week&apos;s matchups, weather, and stadium.</p>
                        <button
                          className='aicw-btn aicw-btn-monthly'
                          onClick={() => handleAnalyze(activeCoach)}
                          disabled={analyzing}
                        >
                          {analyzing ? 'Analyzing...' : 'Get Lineup Advice'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chat tab */
                  <div className='aicw-chat-section'>
                    <div className='aicw-chat-header-bar'>
                      <span className='aicw-chat-title'>
                        Chat with {COACH_INFO[activeCoach]?.name}
                      </span>
                      <Tooltip title='New conversation'>
                        <button className='aicw-chat-new-btn' onClick={handleNewChat}>
                          New Chat
                        </button>
                      </Tooltip>
                    </div>

                    <div className='aicw-chat-messages'>
                      {chatMessages.length === 0 && !chatLoading && (
                        <div className='aicw-chat-welcome'>
                          <div className='aicw-chat-welcome-icon'>
                            {COACH_INFO[activeCoach]?.icon}
                          </div>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                            Welcome to the 2026 Season. Scouting Vault initialized (Injuries, Stadiums, Tactical Data).
                            Ask {COACH_INFO[activeCoach]?.name} about scout-pro reports, tactical friction, auction strategy, or any roster decision.
                          </p>
                          <div className='aicw-chat-suggestions'>
                            <button
                              className='aicw-chat-suggestion'
                              onClick={() => setChatInput('Run a Scout-Pro Report on my roster')}
                            >
                              Scout-Pro Report
                            </button>
                            <button
                              className='aicw-chat-suggestion'
                              onClick={() => setChatInput('Give me a Tactical Friction analysis for this week\'s matchup')}
                            >
                              Tactical Friction
                            </button>
                            <button
                              className='aicw-chat-suggestion'
                              onClick={() => setChatInput('What\'s my best Auction Strategy to drain opponents?')}
                            >
                              Auction Strategy
                            </button>
                          </div>
                        </div>
                      )}

                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`aicw-chat-bubble ${msg.role === 'user' ? 'aicw-chat-user' : 'aicw-chat-coach'}`}
                        >
                          {msg.role === 'coach' && (
                            <>
                              <div className='aicw-chat-avatar' style={{ color: COACH_INFO[activeCoach]?.color }}>
                                <CoachIcon size={16} color={COACH_INFO[activeCoach]?.color} />
                              </div>
                              <div className='aicw-chat-sender'>
                                <span className='aicw-chat-sender-name'>{COACH_INFO[activeCoach]?.name}</span>
                                <RoleBadge role={COACH_INFO[activeCoach]?.role} color={COACH_INFO[activeCoach]?.color} />
                              </div>
                            </>
                          )}
                          <div className='aicw-chat-text'>{msg.content}</div>
                        </div>
                      ))}

                      {chatLoading && (
                        <div className='aicw-chat-bubble aicw-chat-coach'>
                          <div className='aicw-chat-avatar' style={{ color: COACH_INFO[activeCoach]?.color }}>
                            <CoachIcon size={16} color={COACH_INFO[activeCoach]?.color} />
                          </div>
                          <div className='aicw-chat-typing'>
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* ═══ Paywall — shown when user tries to chat without subscription ═══ */}
                    {showPaywall && (
                      <div className='aicw-paywall'>
                        <div className='aicw-paywall-title'>Unlock AI Coaches</div>
                        <p className='aicw-paywall-desc'>Subscribe to chat with {COACH_INFO[activeCoach]?.name} and get player picks, lineup advice, and more.</p>
                        {[
                          { tier: 'rookie', label: 'Rookie', price: '$9.99/mo', yearly: '$89.99/yr', color: '#22C55E', features: ['Both AI Coaches (Ray & Jon)', '40 messages / week', '5 analyses / week', 'Player picks & lineup advice'] },
                          { tier: 'pro', label: 'Pro', price: '$17.99/mo', yearly: '$159.99/yr', color: '#3b82f6', popular: true, features: ['Both AI Coaches (Ray & Jon)', '75 messages / week', '10 analyses / week', 'Player picks & lineup advice', 'Auction strategy & trade insights'] },
                          { tier: 'elite', label: 'Elite', price: '$29.99/mo', yearly: '$269.99/yr', color: '#f97316', features: ['Both AI Coaches (Ray & Jon)', '150 messages / week', '20 analyses / week', 'Player picks & lineup advice', 'Auction strategy & trade insights', 'Priority responses & deep scouting'] },
                        ].map((t) => (
                          <div key={t.tier} className='aicw-paywall-plan' style={{ borderColor: t.color + '33' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ color: t.color, fontWeight: 800, fontSize: 14 }}>{t.label}</span>
                              {t.popular && <span style={{ background: t.color, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Popular</span>}
                            </div>
                            <div style={{ marginBottom: 10 }}>
                              {t.features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                  <span style={{ color: t.color, fontSize: 10 }}>&#10003;</span>
                                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                                </div>
                              ))}
                            </div>
                            <div className='aicw-subscribe-btns'>
                              <button className='aicw-btn aicw-btn-monthly' onClick={() => handleSubscribe(t.tier, 'monthly')}>
                                {t.price}
                              </button>
                              <button className='aicw-btn aicw-btn-yearly' onClick={() => handleSubscribe(t.tier, 'yearly')}>
                                {t.yearly} <span style={{ fontSize: 9, opacity: 0.7 }}>save {t.tier === 'rookie' ? '25%' : t.tier === 'pro' ? '26%' : '25%'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className='aicw-chat-input-bar'>
                      <input
                        type='text'
                        className='aicw-chat-input'
                        placeholder={`Ask ${COACH_INFO[activeCoach]?.name}...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                        disabled={chatLoading}
                        maxLength={1000}
                      />
                      <button
                        className='aicw-chat-send'
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || chatLoading}
                      >
                        <SendOutlined />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default AICoachWidget
