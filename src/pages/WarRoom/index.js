import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Spin, Modal, notification } from 'antd'
import { attachToken, privateAPI, leagueSalaryCap } from '../../config/constants'
import {
  getExchangeListings,
  getMyListings,
  getMyOffers,
  getExchangeStats,
  getMyEmpireSale,
  delistEmpireSale,
  delistFranchise,
  createExchangeListing,
  createEmpireSale,
} from '../../redux/actions/exchangeActions'
import GovernanceSection from './GovernanceSection'
import ExchangeSection from './ExchangeSection'
import OffersManager from './OffersManager'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import TeamCard from './TeamCard'
import TrophyRoom from './TrophyRoom'
import OnboardingGuide from '../../components/OnboardingGuide'
import '../../styles/pages/warRoom.css'

/* ═══════════════════════════════════════════════════════════════
   YOUR EMPIRE — NFL Front Office (Hybrid Empire gold theme)
   Bloomberg ticker + franchise cards + Intel Feed sidebar
   Multi-team empire management across NFL + Soccer
   ═══════════════════════════════════════════════════════════════ */

const fmtMoney = (val) => {
  if (!val && val !== 0) return '-'
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M SP`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K SP`
  return `${val.toLocaleString()} SP`
}

const SPORT_EMOJIS = { all: '🌍', soccer: '⚽', nba: '🏀', nfl: '🏈', mlb: '⚾', ice_hockey: '🏒' }

const SPORT_COLORS = {
  all:    { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
  nfl:    { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
  soccer: { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
  nba:    { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
  mlb:    { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
  ice_hockey: { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
}

const WarRoom = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user?.userDetails)
  const leagueFromStore = useSelector((state) => state.league?.currentLeague)
  const league = (leagueFromStore && leagueFromStore._id) ? leagueFromStore : user?.team?.currentLeague

  const [activeTab, setActiveTab] = useState('empire')
  const [sportFilter, setSportFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [intelOpen, setIntelOpen] = useState(false)
  const [intelItems, setIntelItems] = useState([])

  const accent = SPORT_COLORS[sportFilter] || SPORT_COLORS.all

  // Sell modal state
  const [sellModal, setSellModal] = useState({
    visible: false, team: null, askingPrice: '', marketValue: 0,
    saleType: 'individual',
  })

  // Multi-team user teams
  const [userTeams, setUserTeams] = useState([])

  // Active empire sale + my listings (for cancel buttons)
  const [activeEmpireSale, setActiveEmpireSale] = useState(null)
  const myListings = useSelector((state) => state.exchange?.myListings || [])

  useEffect(() => {
    if (user) {
      fetchAllData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, league?._id])

  const fetchAllData = async () => {
    setLoading(true)
    attachToken()
    try {
      // Fetch user's NFL teams
      let teams = []
      try {
        const teamsRes = await privateAPI.get('/team/my-teams')
        if (teamsRes?.data?.data) {
          teams = Array.isArray(teamsRes.data.data) ? teamsRes.data.data : []
        } else if (Array.isArray(teamsRes?.data)) {
          teams = teamsRes.data
        }
      } catch (apiErr) {
        console.warn('my-teams endpoint not available, falling back to current team')
      }

      teams = teams.map((ttm) => ({
        ...ttm,
        league: { ...ttm.league, sport: ttm.league?.sport || 'nfl' },
      }))

      // Fallback if API failed or empty
      if (teams.length === 0 && user?.team) {
        const currentLeague = user?.team?.currentLeague || league
        teams = [{
          _id: user.team._id,
          name: user.team.name || 'My Team',
          logo: user.team.logo,
          league: { ...currentLeague, sport: 'nfl' },
          owner: user.team.owner,
          wins: user.team.wins || 0,
          losses: user.team.losses || 0,
          ties: user.team.ties || 0,
          position: user.team.position || 0,
          titles: user.team.titles || 0,
          trophies: user.team.trophies || [],
          createdAt: user.team.createdAt,
          salaryCap: leagueSalaryCap || 208200000,
          totalSalary: user.team.totalSalary || 0,
          squadSize: user.team.squad?.length || 0,
          marketValue: user.team.marketValue || 1000000,
          annualEarnings: user.team.annualEarnings || 0,
          annualSpending: user.team.annualSpending || 0,
          trendPct: user.team.trendPct || 0,
          pointsFor: user.team.pointsFor || 0,
          pointsAgainst: user.team.pointsAgainst || 0,
          form: user.team.form || [],
          keyPlayers: user.team.keyPlayers || [],
        }]
      }

      // Fetch Soccer teams from soccer backend
      const SOCCER_API = process.env.REACT_APP_SOCCER_API || 'https://soccerbackend.samsports.io/api/v1'
      let soccerTeams = []
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token')
        const soccerRes = await fetch(`${SOCCER_API}/teams/my-teams`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const soccerData = await soccerRes.json()
        const rawTeams = soccerData?.data || []
        soccerTeams = (Array.isArray(rawTeams) ? rawTeams : [])
      } catch (soccerErr) {
        console.warn('Soccer teams fetch failed:', soccerErr.message)
      }

      // Merge earned balances + the AUTHORITATIVE sport per team from the
      // cross-sport endpoint (it knows each team's real sport from its own DB).
      const sportMap = {}
      try {
        const earnedRes = await privateAPI.get('/league/my-teams-all-sports')
        const earnedData = earnedRes?.data?.data || {}
        const earnedMap = {}
        const earningsMap = {}
        ;(earnedData.nflTeams || []).forEach((ttm) => { earnedMap[String(ttm._id)] = ttm.earnedBalance || 0; earningsMap[String(ttm._id)] = ttm.annualEarnings || 0; sportMap[String(ttm._id)] = 'nfl' })
        ;(earnedData.soccerTeams || []).forEach((ttm) => { earnedMap[String(ttm._id)] = ttm.earnedBalance || 0; earningsMap[String(ttm._id)] = ttm.annualEarnings || 0; sportMap[String(ttm._id)] = 'soccer' })
        teams = teams.map((ttm) => ({ ...ttm, earnedBalance: earnedMap[String(ttm._id)] || ttm.earnedBalance || 0, annualEarnings: earningsMap[String(ttm._id)] || ttm.annualEarnings || 0 }))
        soccerTeams = soccerTeams.map((ttm) => ({ ...ttm, earnedBalance: earnedMap[String(ttm._id)] || ttm.earnedBalance || 0, annualEarnings: earningsMap[String(ttm._id)] || ttm.annualEarnings || 0 }))
      } catch (earnedErr) {
        console.warn('Could not fetch earned balances:', earnedErr.message)
      }

      // Combine both sources, set each team's sport from the authoritative map
      // (falling back to the team's own sport), then de-duplicate by _id.
      const seenTeam = new Set()
      const allTeams = [...teams, ...soccerTeams]
        .map((ttm) => {
          const id = String(ttm._id)
          const sp = (sportMap[id] || String(ttm.sport || ttm.league?.sport || '').toLowerCase())
          const norm = sp === 'soccer' ? 'soccer' : 'nfl'
          return { ...ttm, league: { ...ttm.league, sport: norm } }
        })
        .filter((ttm) => {
          const id = String(ttm._id)
          if (seenTeam.has(id)) return false
          seenTeam.add(id)
          return true
        })
      setUserTeams(allTeams)
      buildIntelFeed(allTeams)

      // Fetch exchange data
      dispatch(getExchangeListings())
      dispatch(getExchangeStats())
      dispatch(getMyListings())
      dispatch(getMyOffers())

      // Fetch active empire sale
      try {
        const empireSaleData = await dispatch(getMyEmpireSale())
        setActiveEmpireSale(empireSaleData || null)
      } catch (e) {
        setActiveEmpireSale(null)
      }
    } catch (err) {
      console.error('War Room data fetch error:', err)
    }
    setLoading(false)
  }

  // Build intel feed from real data
  const buildIntelFeed = useCallback((teams) => {
    const items = []
    teams.forEach((ttm) => {
      const sport = (ttm.league?.sport || 'nfl').toLowerCase()
      const emoji = sport === 'nfl' ? '🏈' : sport === 'soccer' ? '⚽' : '🏆'
      if (ttm.annualEarnings > 0) {
        items.push({ cat: 'EARNINGS', cls: 'earn', text: `${emoji} ${ttm.name} — Season revenue: +${fmtMoney(ttm.annualEarnings)}`, time: 'This season' })
      }
      if (ttm.marketValue > 0) {
        items.push({ cat: 'PORTFOLIO', cls: 'trade', text: `${emoji} ${ttm.name} valued at ${fmtMoney(ttm.marketValue)}`, time: 'Current' })
      }
      if (ttm.form && ttm.form.length > 0) {
        const lastResult = ttm.form[ttm.form.length - 1]
        const resultText = lastResult === 'W' ? 'Victory' : lastResult === 'L' ? 'Defeat' : 'Draw'
        items.push({ cat: 'RESULT', cls: lastResult === 'W' ? 'earn' : lastResult === 'L' ? 'injury' : 'auction', text: `${emoji} ${ttm.name} — Last game: ${resultText}`, time: 'Recent' })
      }
    })
    items.push({ cat: 'EXCHANGE', cls: 'auction', text: '🏪 New franchises listed on The Marketplace', time: 'Check Exchange tab' })
    items.push({ cat: 'GOVERNANCE', cls: 'gov', text: '🗳️ Check for active votes in your leagues', time: 'Governance tab' })
    setIntelItems(items)
  }, [])

  // Portfolio KPIs
  const portfolioValue = userTeams.reduce((sum, ttm) => sum + (ttm.marketValue || 0), 0)
  const annualEarnings = userTeams.reduce((sum, ttm) => sum + (ttm.annualEarnings || 0), 0)
  const annualSpending = userTeams.reduce((sum, ttm) => sum + (ttm.annualSpending || 0), 0)
  const netProfit = annualEarnings - annualSpending
  const totalWins = userTeams.reduce((sum, ttm) => sum + (ttm.wins || 0), 0)
  const totalGames = userTeams.reduce((sum, ttm) => sum + (ttm.wins || 0) + (ttm.losses || 0) + (ttm.ties || ttm.draws || 0), 0)
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0

  // Dark-themed confirm modal helper
  const darkConfirm = ({ icon, title, subtitle, onOk, okLabel = 'Confirm', cancelLabel = 'Go Back' }) => {
    Modal.confirm({
      icon: null,
      title: null,
      content: (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '13px', color: '#8a7a44', lineHeight: 1.5 }}>
            {subtitle}
          </div>
        </div>
      ),
      okText: okLabel,
      cancelText: cancelLabel,
      className: 'wr-dark-confirm',
      okButtonProps: {
        style: {
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
          color: '#EF4444', fontWeight: 700,
          borderRadius: '8px', height: '36px', fontSize: '13px',
        },
      },
      cancelButtonProps: {
        style: {
          background: '#1a1400', border: '1px solid #2a2200',
          color: '#8a7a44', fontWeight: 600,
          borderRadius: '8px', height: '36px', fontSize: '12px',
        },
      },
      onOk,
    })
  }

  // Cancel empire sale
  const handleCancelEmpireSale = () => {
    darkConfirm({
      icon: '👑',
      title: 'Cancel Empire Sale?',
      subtitle: 'All associated listings and pending offers will be removed. Your franchises stay with you.',
      okLabel: 'Cancel Sale',
      cancelLabel: 'Keep Selling',
      onOk: async () => {
        try {
          const result = await delistEmpireSale(activeEmpireSale._id, activeEmpireSale._sport || 'nfl')
          if (result) {
            setActiveEmpireSale(null)
            dispatch(getMyListings())
          }
        } catch (err) {
          notification.error({ message: 'Failed to cancel empire sale' })
        }
      },
    })
  }

  // Cancel individual team listing
  const handleCancelTeamListing = (listingId, teamName, sport = 'nfl') => {
    darkConfirm({
      icon: '🏷️',
      title: `Delist ${teamName}?`,
      subtitle: 'This will remove the franchise from The Marketplace and withdraw all pending offers.',
      okLabel: 'Delist',
      cancelLabel: 'Keep Listed',
      onOk: async () => {
        try {
          const result = await delistFranchise(listingId, sport)
          if (result) {
            dispatch(getMyListings())
          }
        } catch (err) {
          notification.error({ message: 'Failed to cancel listing' })
        }
      },
    })
  }

  // Check if a team is currently listed
  const getTeamListing = (teamId) => {
    return myListings.find((l) => l.status === 'active' && (String(l.team) === String(teamId) || String(l.team?._id) === String(teamId)))
  }

  // Handle listing for sale
  const handleListForSale = async () => {
    const price = parseFloat(sellModal.askingPrice)
    const { saleType } = sellModal

    if (saleType !== 'empire_individual' && (!price || price <= 0)) {
      notification.error({ message: 'Invalid Price', description: 'Please enter a valid asking price.' })
      return
    }

    const teamSport = sellModal.team?.league?.sport?.toLowerCase() || sellModal.team?._sport || 'nfl'

    if (saleType === 'individual') {
      const mv = sellModal.marketValue || 1000000
      try {
        const result = await createExchangeListing({
          teamId: sellModal.team._id,
          leagueId: sellModal.team.league?._id || sellModal.team.currentLeague,
          askingPrice: price,
          marketValue: mv,
        }, teamSport)
        if (result) {
          notification.success({ message: 'Listed!', description: `${sellModal.team.name} listed for ${fmtMoney(price)} on The Marketplace.` })
          setSellModal({ visible: false, team: null, askingPrice: '', marketValue: 0, saleType: 'individual' })
          dispatch(getMyListings())
          fetchAllData()
        }
      } catch (err) {
        notification.error({ message: 'Failed', description: err?.response?.data?.message || 'Could not list franchise.' })
      }
    }

    if (saleType === 'empire_bundle' || saleType === 'empire_individual') {
      try {
        const payload = { saleMode: saleType === 'empire_bundle' ? 'bundle' : 'individual' }
        if (saleType === 'empire_bundle') payload.askingPrice = price
        const result = await createEmpireSale(payload, teamSport)
        if (result) {
          notification.success({
            message: 'Empire Listed!',
            description: saleType === 'empire_bundle'
              ? `Your entire empire listed as a bundle for ${fmtMoney(price)}!`
              : 'All your franchises listed individually on The Marketplace!',
          })
          setSellModal({ visible: false, team: null, askingPrice: '', marketValue: 0, saleType: 'individual' })
          dispatch(getMyListings())
          fetchAllData()
        }
      } catch (err) {
        notification.error({ message: 'Failed', description: err?.response?.data?.message || 'Could not create empire sale.' })
      }
    }
  }

  // Filter teams
  const filteredTeams = sportFilter === 'all'
    ? userTeams
    : userTeams.filter((ttm) => {
      const sp = ttm.league?.sport?.toLowerCase() || 'nfl'
      return sp === sportFilter
    })

  const activeTeamId = user?.team?._id

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', background: '#050505' }}>
        <Spin size="large" />
      </div>
    )
  }

  const soccerSiteUrl = () => {
    const authToken = localStorage.getItem('token')
    const soccerUrl = process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io'
    return authToken ? `${soccerUrl}?token=${encodeURIComponent(authToken)}` : soccerUrl
  }

  return (
    <div className="empire-page">
      <OnboardingGuide tabKey="front-office" />

      {/* ══════════════ LIVE TICKER (moving) ══════════════
          Bloomberg-style scrolling strip. Two duplicate sequences let the CSS
          animation translate the track left without leaving a gap when the
          first sequence reaches the end. Matches today's soccer redesign. */}
      <div className="empire-ticker">
        <div className="empire-ticker-track">
          {[0, 1].map((dup) => (
            <div className="empire-ticker-seq" key={dup} aria-hidden={dup === 1}>
              {[
                { label: 'PORTFOLIO',  val: fmtMoney(portfolioValue), cls: 'val' },
                { label: 'EARNINGS',   val: `+${fmtMoney(annualEarnings)}`, cls: 'up' },
                { label: 'SPENDING',   val: `-${fmtMoney(annualSpending)}`, cls: 'down' },
                { label: 'NET P&L',    val: `${netProfit >= 0 ? '+' : ''}${fmtMoney(netProfit)}`, cls: netProfit >= 0 ? 'up' : 'down' },
                { label: 'FRANCHISES', val: String(userTeams.length), cls: 'val' },
                { label: 'WIN RATE',   val: `${winRate}%`, cls: 'up' },
                ...userTeams.slice(0, 4).map((ttm) => ({
                  label: (ttm.name || '').slice(0, 14).toUpperCase(),
                  val: fmtMoney(ttm.marketValue || 0),
                  cls: (ttm.annualEarnings || 0) >= 0 ? 'up' : 'down',
                })),
              ].map((tt, i) => (
                <div className="empire-ticker-item" key={i}>
                  <span className="empire-ticker-label">{tt.label}</span>
                  <span className={`empire-ticker-${tt.cls}`}>{tt.val}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ HEADER + TABS ══════════════ */}
      <div className="empire-header">
        <div className="empire-header-left">
          <span className="empire-crown">👑</span>
          <div>
            <h1 className="empire-title">Your <span>Empire</span></h1>
            <p className="empire-subtitle">Build, manage, and expand your sports franchise dynasty</p>
          </div>
        </div>
        <div className="empire-header-right">
          <div className="empire-sp-badge">{fmtMoney(portfolioValue)}</div>
          <button className="empire-intel-btn" onClick={() => setIntelOpen(!intelOpen)}>
            📡 Intel
          </button>
        </div>
      </div>

      <div className="empire-tab-bar">
        {[
          { key: 'empire', label: 'My Leagues' },
          { key: 'trophy', label: 'Trophies' },
          { key: 'exchange', label: 'Exchange' },
          { key: 'governance', label: 'Governance' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`empire-tab ${activeTab === tab.key ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content area with optional Intel sidebar */}
      <div className={`empire-content ${intelOpen ? 'intel-open' : ''}`}>
        <div className="empire-main">

          {/* ══════════════ MY LEAGUES TAB ══════════════ */}
          {activeTab === 'empire' && (
            <div className="empire-leagues">
              {/* KPI Strip — terminal tiles with sparklines (matches today's soccer redesign) */}
              <div className="empire-kpi-row">
                <div className="empire-kpi">
                  <span className="empire-kpi-label">Empire Valuation</span>
                  <span className="empire-kpi-value gold">{fmtMoney(portfolioValue)}</span>
                  <span className="empire-kpi-delta up">▲ Portfolio total</span>
                  <svg className="empire-spark" viewBox="0 0 120 26" preserveAspectRatio="none"><polyline points="0,20 18,18 36,21 54,14 72,15 90,9 108,7 120,4" fill="none" stroke="#5FD08A" strokeWidth="1.5" /></svg>
                </div>
                <div className="empire-kpi">
                  <span className="empire-kpi-label">Season Revenue</span>
                  <span className="empire-kpi-value green">+{fmtMoney(annualEarnings)}</span>
                  <span className="empire-kpi-delta up">Across all franchises</span>
                  <svg className="empire-spark" viewBox="0 0 120 26" preserveAspectRatio="none"><polyline points="0,22 20,20 40,17 60,16 80,11 100,8 120,6" fill="none" stroke="#5FD08A" strokeWidth="1.5" /></svg>
                </div>
                <div className="empire-kpi">
                  <span className="empire-kpi-label">Net P&amp;L · Season</span>
                  <span className={`empire-kpi-value ${netProfit >= 0 ? 'green' : 'red'}`}>{netProfit >= 0 ? '+' : ''}{fmtMoney(netProfit)}</span>
                  <span className={`empire-kpi-delta ${netProfit >= 0 ? 'up' : 'muted'}`}>{netProfit >= 0 ? '▲' : '▼'} revenue − spending</span>
                  <svg className="empire-spark" viewBox="0 0 120 26" preserveAspectRatio="none"><polyline points="0,16 18,19 36,12 54,15 72,10 90,12 108,7 120,8" fill="none" stroke={netProfit >= 0 ? '#5FD08A' : '#E8786C'} strokeWidth="1.5" /></svg>
                </div>
                <div className="empire-kpi">
                  <span className="empire-kpi-label">Franchises Owned</span>
                  <span className="empire-kpi-value">{userTeams.length}</span>
                  <span className="empire-kpi-delta muted">
                    {userTeams.filter((ttm) => (ttm.league?.sport) === 'nfl').length} NFL · {userTeams.filter((ttm) => (ttm.league?.sport) === 'soccer').length} Soccer
                  </span>
                  <div className="empire-kpi-allocrow">
                    <span style={{ flex: userTeams.filter((ttm) => (ttm.league?.sport) === 'nfl').length || 1, background: 'rgba(143,180,240,0.5)' }} />
                    <span style={{ flex: userTeams.filter((ttm) => (ttm.league?.sport) === 'soccer').length || 1, background: '#C9A86A' }} />
                  </div>
                </div>
              </div>

              {/* Active empire sale banner */}
              {activeEmpireSale && (
                <div className="empire-sale-banner">
                  <div>
                    <span className="empire-sale-badge">MTO SALE ACTIVE</span>
                    <span className="empire-sale-info">
                      {activeEmpireSale.saleMode === 'bundle' ? 'Bundle' : 'Individual'} · {activeEmpireSale.teams?.length || 0} franchises
                      {activeEmpireSale.askingPrice ? ` — ${fmtMoney(activeEmpireSale.askingPrice)}` : ''}
                    </span>
                  </div>
                  <button className="empire-sale-cancel" onClick={handleCancelEmpireSale}>Cancel Sale</button>
                </div>
              )}

              {/* Sport filter pills */}
              <div className="empire-filters">
                <span className="empire-filters-label">Your Franchises</span>
                <div className="empire-sport-pills">
                  {['all', 'nfl', 'soccer'].map((s) => (
                    <button key={s} onClick={() => setSportFilter(s)}
                      className={`empire-sport-pill ${sportFilter === s ? 'active' : ''}`}>
                      {SPORT_EMOJIS[s]} {s === 'all' ? 'All' : s === 'nfl' ? 'A.Football' : 'Soccer'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Franchise holdings + right rail (allocation donut) — matches today's soccer redesign */}
              <div className="empire-hold-layout">
                <div className="empire-holdings">
                  <table className="holdings-table">
                    <thead>
                      <tr>
                        <th className="th-left">Asset</th>
                        <th>Sport</th>
                        <th>Record</th>
                        <th>Value</th>
                        <th>Revenue</th>
                        <th>Alloc.</th>
                        <th className="th-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.length > 0 ? (() => {
                        const totalVal = filteredTeams.reduce((s, t) => s + (t.marketValue || 0), 0) || 1
                        return filteredTeams.map((ttm) => {
                          const sport = (ttm.league?.sport || ttm.sport || 'nfl').toLowerCase()
                          const leagueName = typeof ttm.league === 'object' ? (ttm.league?.name || 'League') : (ttm.league || 'League')
                          const record = ttm.record || `${ttm.wins || 0}-${ttm.draws ?? ttm.ties ?? 0}-${ttm.losses || 0}`
                          const rev = ttm.annualEarnings || 0
                          const alloc = Math.round(((ttm.marketValue || 0) / totalVal) * 100)
                          const listing = getTeamListing(ttm._id)
                          return (
                            <tr key={ttm._id} className={String(ttm._id) === String(activeTeamId) ? 'hold-active' : ''}>
                              <td className="td-left hold-asset">
                                <div className="hold-crest" style={{ color: accent.primary, background: `${accent.primary}22` }}>{(ttm.name || '?').charAt(0).toUpperCase()}</div>
                                <div>
                                  <div className="hold-name">{ttm.name}</div>
                                  <div className="hold-league">{leagueName}</div>
                                </div>
                              </td>
                              <td><span className={`hold-dot ${sport}`} />{sport === 'nfl' ? 'NFL' : 'Soccer'}</td>
                              <td className="num">{record}</td>
                              <td className="num">{fmtMoney(ttm.marketValue || 0)}</td>
                              <td className={`num ${rev >= 0 ? 'pl-up' : 'pl-down'}`}>{rev >= 0 ? '+' : ''}{fmtMoney(rev)}</td>
                              <td className="num"><span className="hold-alloc">{alloc}%<i className="hold-alloc-bar"><b style={{ width: `${alloc}%` }} /></i></span></td>
                              <td className="td-right">
                                <button className="hold-btn" onClick={() => {
                                  if (sport === 'soccer') { window.location.href = soccerSiteUrl() } else { navigate('/league') }
                                }}>Manage</button>
                                {listing
                                  ? <button className="hold-btn" onClick={() => handleCancelTeamListing(listing._id, ttm.name, listing._sport || ttm.league?.sport?.toLowerCase() || 'nfl')}>Unlist</button>
                                  : <button className="hold-btn gold" onClick={() => setSellModal({ visible: true, team: ttm, askingPrice: String(ttm.marketValue || 1000000), marketValue: ttm.marketValue || 1000000, saleType: 'individual' })}>List</button>}
                              </td>
                            </tr>
                          )
                        })
                      })() : (
                        <tr><td colSpan={7} className="empire-empty">No franchises found{sportFilter !== 'all' ? ` for ${sportFilter.toUpperCase()}` : ''}.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <aside className="empire-hold-rail">
                  <div className="empire-panel">
                    <div className="empire-panel-head"><h3>Allocation</h3><span className="empire-micro">By value</span></div>
                    <div className="empire-donut-wrap">
                      {(() => {
                        const total = userTeams.reduce((s, t) => s + (t.marketValue || 0), 0) || 1
                        const palette = ['#C9A86A', '#8FB4F0', '#5C7BB0', '#3A4D70', '#5FD08A', '#69748B']
                        let off = 25
                        const segs = [...userTeams].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)).map((t, i) => {
                          const pct = Math.round(((t.marketValue || 0) / total) * 100)
                          const s = { name: t.name, pct, color: palette[i % palette.length], dash: `${pct} ${100 - pct}`, off }
                          off -= pct
                          return s
                        })
                        return (
                          <>
                            <svg width="118" height="118" viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
                              <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(174,182,196,0.12)" strokeWidth="6" />
                              {segs.map((s, i) => (
                                <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={s.dash} strokeDashoffset={s.off} />
                              ))}
                              <text x="21" y="20.5" textAnchor="middle" fill="#ECEAE3" fontSize="6" fontWeight="600" fontFamily="Inter">{fmtMoney(portfolioValue)}</text>
                              <text x="21" y="25.5" textAnchor="middle" fill="#69748B" fontSize="2.6" letterSpacing="0.3" fontFamily="Inter">TOTAL SP</text>
                            </svg>
                            <div className="empire-donut-legend">
                              {segs.map((s, i) => (
                                <div key={i}><span><span className="empire-dot" style={{ background: s.color }} />{(s.name || '').slice(0, 14)}</span><span className="num">{s.pct}%</span></div>
                              ))}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </aside>
              </div>

              {/* Expand CTA */}
              <div className="empire-expand-cta">
                <button className="empire-expand-btn" onClick={() => navigate('/')}>
                  + Expand Your Empire
                </button>
                <div className="empire-expand-links">
                  <span onClick={() => navigate('/')}>🏈 Join A.Football League</span>
                  <span onClick={() => { window.location.href = soccerSiteUrl() }}>⚽ Join Soccer League</span>
                  <span className="disabled">🏀 Basketball (Soon)</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TROPHY TAB ══════════════ */}
          {activeTab === 'trophy' && (
            <div className="empire-leagues">
              <TrophyRoom userTeams={userTeams} accent={accent} />
            </div>
          )}

          {/* ══════════════ EXCHANGE TAB ══════════════ */}
          {activeTab === 'exchange' && (
            <div className="empire-leagues" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ExchangeSection onSellEmpire={() => setSellModal({
                visible: true, team: userTeams[0] || null,
                askingPrice: String(portfolioValue || 1000000),
                marketValue: portfolioValue || 1000000,
                saleType: 'empire_bundle',
              })} />
              <OffersManager accent={accent} />
            </div>
          )}

          {/* ══════════════ GOVERNANCE TAB ══════════════ */}
          {activeTab === 'governance' && (
            <div className="empire-leagues">
              <GovernanceSection />
            </div>
          )}
        </div>

        {/* ══════════════ INTEL FEED SIDEBAR ══════════════ */}
        {intelOpen && (
          <div className="empire-intel-sidebar">
            <div className="empire-intel-header">
              <div className="empire-intel-dot" />
              <span>Live Intel Feed</span>
              <button className="empire-intel-close" onClick={() => setIntelOpen(false)}>✕</button>
            </div>
            <div className="empire-intel-feed">
              {intelItems.map((item, i) => (
                <div key={i} className={`empire-intel-item ${item.cls}`}>
                  <div className="empire-intel-cat">{item.cat}</div>
                  <div className="empire-intel-text">{item.text}</div>
                  <div className="empire-intel-time">{item.time}</div>
                </div>
              ))}
              {intelItems.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                  No intel available yet. Play some games!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ SELL MODAL ═══ */}
      <Modal
        title={null} footer={null}
        open={sellModal.visible}
        onCancel={() => setSellModal({ visible: false, team: null, askingPrice: '', marketValue: 0, saleType: 'individual' })}
        centered width={480}
        bodyStyle={{ padding: 0, background: 'transparent' }}
        style={{ top: 20 }}
        maskStyle={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      >
        {sellModal.team && (
          <div className="empire-sell-modal">
            <div style={{ marginBottom: '24px' }}>
              <h3 className="empire-sell-title">Sell on The Marketplace</h3>
              <p className="empire-sell-subtitle">Choose how you want to sell your franchise.</p>
            </div>

            <div className="empire-sell-options">
              {[
                { key: 'individual', label: 'Sell This Franchise', color: '#D4AF37', rgba: '212,175,55',
                  desc: `List "${sellModal.team.name}" at your asking price` },
                { key: 'empire_bundle', label: 'Sell Empire (Bundle)', color: '#F59E0B', rgba: '245,158,11',
                  desc: `All ${userTeams.length} franchises as one package` },
                { key: 'empire_individual', label: 'Sell Empire (Individual)', color: '#8B5CF6', rgba: '139,92,246',
                  desc: 'Each franchise listed separately at market value' },
              ].map((opt) => {
                const sel = sellModal.saleType === opt.key
                return (
                  <div key={opt.key}
                    onClick={() => setSellModal({ ...sellModal, saleType: opt.key })}
                    className={`empire-sell-option ${sel ? 'selected' : ''}`}
                    style={{ '--opt-color': opt.color, '--opt-rgba': opt.rgba }}>
                    <span className="empire-sell-option-label">{opt.label}</span>
                    <p className="empire-sell-option-desc">{opt.desc}</p>
                  </div>
                )
              })}
            </div>

            {sellModal.saleType !== 'empire_individual' && (
              <>
                <div className="empire-sell-mv">
                  <div className="empire-sell-mv-label">
                    {sellModal.saleType === 'empire_bundle' ? 'Portfolio Value' : 'Market Value'}
                  </div>
                  <div className="empire-sell-mv-value">
                    {fmtMoney(sellModal.saleType === 'empire_bundle' ? portfolioValue : sellModal.marketValue)}
                  </div>
                </div>
                <div className="empire-sell-price-section">
                  <label className="empire-sell-price-label">Asking Price</label>
                  <input type="number" placeholder="Enter price in SP" value={sellModal.askingPrice}
                    onChange={(e) => setSellModal({ ...sellModal, askingPrice: e.target.value })}
                    className="empire-sell-input" />
                </div>
                <div className="empire-sell-multipliers">
                  {[0.75, 1.0, 1.25, 1.5].map((mult) => {
                    const base = sellModal.saleType === 'empire_bundle' ? portfolioValue : sellModal.marketValue
                    const val = Math.round(base * mult)
                    const sel = parseFloat(sellModal.askingPrice) === val
                    return (
                      <button key={mult} onClick={() => setSellModal({ ...sellModal, askingPrice: String(val) })}
                        className={`empire-sell-mult ${sel ? 'selected' : ''}`}>
                        {mult === 1.0 ? 'MV' : `${mult * 100}%`}
                        <div className="empire-sell-mult-val">{fmtMoney(val)}</div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            <div className="empire-sell-actions">
              <button className="empire-sell-cancel"
                onClick={() => setSellModal({ visible: false, team: null, askingPrice: '', marketValue: 0, saleType: 'individual' })}>
                Cancel
              </button>
              <button className="empire-sell-confirm" onClick={handleListForSale}>
                {sellModal.saleType === 'individual' ? 'List Franchise' : sellModal.saleType === 'empire_bundle' ? 'Sell Empire' : 'List All'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WarRoom
