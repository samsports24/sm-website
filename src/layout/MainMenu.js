import { useEffect, useState } from 'react'
import { Button, notification } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi'
import { MdDashboard, MdOutlineStadium } from 'react-icons/md'
import { FaPlusCircle, FaRegChartBar } from 'react-icons/fa'
import { RiAuctionLine, RiDraftLine } from 'react-icons/ri'
import { SiLeagueoflegends, SiWechat } from 'react-icons/si'
import { BsShop } from 'react-icons/bs'
import {
  GiStarMedal,
  GiTrade,
  GiBabyfootPlayers,
  GiAmericanFootballPlayer,
  GiCastle,
} from 'react-icons/gi'
import { RxEnvelopeClosed } from 'react-icons/rx'
import { PiUsersThreeLight, PiNotebookLight, PiMagnifyingGlassLight, PiTargetLight } from 'react-icons/pi'
import { TbLivePhoto } from 'react-icons/tb'
import { AiOutlineSetting } from 'react-icons/ai'
import { IoChevronDown } from 'react-icons/io5'
import comissioner from '../assets/comissioner.png'
import { useSelector } from 'react-redux'
import { landingSignup, privateAPI, attachToken } from '../config/constants'
import LoginDropdown from './LoginDropdown'
import { useLanguage } from '../i18n/LanguageContext'
import Job from '../assets/job.png'
import FAQ from '../assets/faq.png'
import {
  clearChatNotification,
  getAllChatNotification,
  getAllNotification,
} from '../redux/actions/notificationAction'
import { getUser } from '../redux'
import { getchatacount } from '../redux/actions/chatAction'

const MainMenu = ({ visible }) => {
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [active, setActive] = useState('dashboard')
  const [openGroup, setOpenGroup] = useState(null)
  const user = useSelector((state) => state.user.userDetails)
  const isdraftlive = user?.team?.currentLeague?.isDraftLive
  const isDormant = user?.isDormant === true
  const hasLeague = !!user?.team?.currentLeague
  const hasTeam = !!user?.team
  const isFullAccess = isAuthenticated && (hasLeague || hasTeam)
  const [filteredCount, setFilteredCount] = useState(0)
  const [commInboxCount, setCommInboxCount] = useState(0)
  const { pathname } = useLocation()
  // Detect soccer mode from league sport field or URL path
  const leagueSport = user?.team?.currentLeague?.sport || user?.team?.currentLeague?.gameType || ''
  const isSoccer = leagueSport === 'soccer' || leagueSport === 'football' || pathname.startsWith('/soccer')

  useEffect(() => {
    getUser()
  })

  useEffect(() => {
    const nflMap = {
      '/homepage': 'home',
      '/dashboard': 'dashboard',
      '/player-roster': 'roster',
      '/depth-chart': 'depth-chart',
      '/team-trade': 'trade',
      '/player-auction': 'auctions',
      '/injured-reserve': 'injuries-reserve',
      '/league-rosters': 'league-rosters',
      '/league-standings': 'league-standings',
      '/leagueScore': 'leagueScore',
      '/playoff': 'playoff',
      '/playoff-bracket': 'playoff-bracket',
      '/playoff-standings': 'playoff-standings',
      '/playoff-draft': 'playoff-draft',
      '/supplemental-draft': 'supplemental-draft',
      '/roster-board': 'roster-board',
      '/rookie-draft': 'rookie-draft',
      '/team-setting': 'team-setting',
      '/stadium': 'stadium',
      '/clubhouse': 'clubhouse',
      '/my-league': 'my-league',
      '/commissioner': 'comissioner',
      '/rule-book': 'rule-book',
      '/search-player': 'search-player',
      '/chat': 'chat',
      '/live-draft': 'draft',
      '/war-room': 'war-room',
      '/nfl-predictor': 'nfl-predictor',
      '/faq': 'faq',
    }

    setActive(nflMap[pathname] || '')
  }, [pathname])

  useEffect(() => {
    getData()
  }, [user])

  const getData = async () => {
    try {
      if (isAuthenticated) {
        const res = await getchatacount()
        setFilteredCount(res?.count)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // ── Poll commissioner inbox for pending items (green glow) ──
  useEffect(() => {
    const leagueId = user?.team?.currentLeague?._id
    if (!isAuthenticated || !leagueId) { setCommInboxCount(0); return }
    const fetchCommInbox = async () => {
      try {
        attachToken()
        const res = await privateAPI.get(`/sale-approval/${leagueId}/pending`)
        const items = res?.data?.data || res?.data || []
        setCommInboxCount(Array.isArray(items) ? items.length : 0)
      } catch { setCommInboxCount(0) }
    }
    fetchCommInbox()
    const interval = setInterval(fetchCommInbox, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [user?.team?.currentLeague?._id, isAuthenticated])

  const handleClick = () => {
    if (filteredCount > 0) {
      clearChatNotification()
    }
    navigate('/chat')
  }

  const navigatePath = (path) => {
    if (user?.team?.currentLeague?._id) {
      navigate(path)
    } else {
      notification.error({
        message: 'Please select a league from My Leagues first.',
        duration: 6,
      })
    }
  }

  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group)
  }

  const MenuItem = ({ id, icon, label, onClick, badge, glowColor }) => (
    <div
      className={`sm-item ${active === id ? 'sm-active' : ''}`}
      onClick={onClick}
      style={glowColor ? { position: 'relative' } : undefined}
    >
      <span className="sm-icon">{icon}</span>
      <span
        className="sm-label"
        style={glowColor ? {
          color: glowColor,
          textShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}55`,
          fontWeight: 700,
          transition: 'all 0.3s ease',
        } : undefined}
      >
        {label}
      </span>
      {badge > 0 && <span className="sm-badge">{badge}</span>}
      {glowColor && (
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: glowColor,
          boxShadow: `0 0 6px ${glowColor}`,
          marginLeft: 'auto', flexShrink: 0,
        }} />
      )}
    </div>
  )

  const GroupHeader = ({ id, icon, label, isOpen }) => (
    <div
      className={`sm-group-hd ${isOpen ? 'sm-group-open' : ''}`}
      onClick={() => toggleGroup(id)}
    >
      <span className="sm-icon">{icon}</span>
      <span className="sm-label">{label}</span>
      <IoChevronDown className={`sm-chevron ${isOpen ? 'sm-chevron-up' : ''}`} />
    </div>
  )

  /* ── NFL Sidebar ── */
  return (
    <>
      <div className="sm-sidebar no-scrollbar">
        <div className="sm-nav">
          {/* Home - always visible */}
          <MenuItem id="home" icon={<HiOutlineHome />} label={t('home')} onClick={() => navigate('/homepage')} />

          {/* Draft Live Banner, shown when draft is active (not for dormant users) */}
          {isFullAccess && isdraftlive && !isDormant && (
            <div
              className="sm-item sm-draft-live-banner"
              onClick={() => navigate('/live-draft')}
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 8,
                margin: '4px 8px',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <TbLivePhoto style={{ color: '#22C55E', fontSize: 16, animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>{t('draftLive').toUpperCase()}</span>
            </div>
          )}

          {isFullAccess && (
            <>
              {/* War Room, visible even when dormant */}
              <MenuItem id="war-room" icon={<GiCastle />} label={t('frontOffice')} onClick={() => navigate('/war-room')} />

              {/* Dormant banner, shown when user sold their empire */}
              {isDormant && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 8,
                    margin: '8px 8px 4px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t('dormantMode')}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.4 }}>{t('dormantBanner')}</span>
                </div>
              )}

              {/* Everything below is HIDDEN for dormant users */}
              {!isDormant && (
                <>
                  {/* Dashboard */}
                  <MenuItem id="dashboard" icon={<MdDashboard />} label={t('dashboard')} onClick={() => navigatePath('/dashboard')} />

                  {/* My Team group */}
                  <GroupHeader id="team" icon={<PiUsersThreeLight />} label={t('myTeam')} isOpen={openGroup === 'team'} />
                  {openGroup === 'team' && (
                    <div className="sm-group-items">
                      <MenuItem id="roster" icon={<PiUsersThreeLight />} label={isSoccer ? 'Squad' : t('roster')} onClick={() => navigatePath('/player-roster')} />
                      <MenuItem id="depth-chart" icon={<FaRegChartBar />} label={isSoccer ? 'Starting XI' : t('starters')} onClick={() => navigatePath('/depth-chart')} />
                      <MenuItem id="roster-board" icon={<PiUsersThreeLight />} label={t('rosterBoard')} onClick={() => navigatePath('/roster-board')} />
                      <MenuItem id="team-setting" icon={<AiOutlineSetting />} label={t('teamSettings')} onClick={() => navigatePath('/team-setting')} />
                      <MenuItem id="stadium" icon={<MdOutlineStadium />} label={t('stadium')} onClick={() => navigatePath('/stadium')} />
                    </div>
                  )}

                  {/* League group */}
                  <GroupHeader id="league" icon={<SiLeagueoflegends />} label={t('league')} isOpen={openGroup === 'league'} />
                  {openGroup === 'league' && (
                    <div className="sm-group-items">
                      <MenuItem id="my-league" icon={<SiLeagueoflegends />} label={t('myLeagues')} onClick={() => navigate('/my-league')} />
                      <MenuItem id="league-rosters" icon={<GiAmericanFootballPlayer />} label={t('rosters')} onClick={() => navigatePath('/league-rosters')} />
                      <MenuItem id="league-standings" icon={<BsShop />} label={t('standings')} onClick={() => navigatePath('/league-standings')} />
                      <MenuItem id="leagueScore" icon={<TbLivePhoto />} label={t('liveScoring')} onClick={() => navigatePath('/leagueScore')} />
                      <MenuItem id="comissioner" icon={<img src={comissioner} alt="" />} label={t('commissioner')} onClick={() => { setCommInboxCount(0); navigate('/commissioner'); }} glowColor={commInboxCount > 0 ? '#22C55E' : null} />
                    </div>
                  )}

                  {/* Transactions group */}
                  <GroupHeader id="transactions" icon={<GiTrade />} label={t('transactions')} isOpen={openGroup === 'transactions'} />
                  {openGroup === 'transactions' && (
                    <div className="sm-group-items">
                      <MenuItem id="trade" icon={<GiTrade />} label={t('trade')} onClick={() => navigatePath('/team-trade')} />
                      <MenuItem id="auctions" icon={<RiAuctionLine />} label={t('auctions')} onClick={() => navigatePath('/player-auction')} />
                      <MenuItem id="injuries-reserve" icon={<FaPlusCircle />} label={t('injuredReserve')} onClick={() => navigatePath('/injured-reserve')} />
                    </div>
                  )}

                  {/* Draft group */}
                  <GroupHeader id="draft-group" icon={<RiDraftLine />} label={t('draft')} isOpen={openGroup === 'draft-group'} />
                  {openGroup === 'draft-group' && (
                    <div className="sm-group-items">
                      <MenuItem id="draft" icon={<RiDraftLine />} label={t('draftLive')} onClick={() => navigate('/live-draft')} />
                      <MenuItem id="supplemental-draft" icon={<RiDraftLine />} label={t('supplementalDraft')} onClick={() => navigatePath('/supplemental-draft')} />
                      <MenuItem id="rookie-draft" icon={<RiDraftLine />} label={t('rookieDraft')} onClick={() => navigatePath('/rookie-draft')} />
                    </div>
                  )}

                  {/* Playoffs group */}
                  <GroupHeader id="playoffs" icon={<GiBabyfootPlayers />} label={t('playoffs')} isOpen={openGroup === 'playoffs'} />
                  {openGroup === 'playoffs' && (
                    <div className="sm-group-items">
                      <MenuItem id="playoff" icon={<GiBabyfootPlayers />} label={t('playoffs')} onClick={() => navigatePath('/playoff')} />
                      <MenuItem id="playoff-bracket" icon={<GiBabyfootPlayers />} label={t('bracket')} onClick={() => navigatePath('/playoff-bracket')} />
                      <MenuItem id="playoff-standings" icon={<GiStarMedal />} label={t('playoffStandings')} onClick={() => navigatePath('/playoff-standings')} />
                      <MenuItem id="playoff-draft" icon={<RiDraftLine />} label="Playoff Draft" onClick={() => navigatePath('/playoff-draft')} />
                    </div>
                  )}

                  {/* Standalone items */}
                  <MenuItem id="search-player" icon={<PiMagnifyingGlassLight />} label={t('search')} onClick={() => navigatePath('/search-player')} />
                  <MenuItem id="chat" icon={<SiWechat />} label={t('chat')} onClick={handleClick} badge={filteredCount} glowColor={filteredCount > 0 ? '#22C55E' : null} />
                  <MenuItem id="clubhouse" icon={<RxEnvelopeClosed />} label={t('clubhouse')} onClick={() => navigatePath('/clubhouse')} />
                  <MenuItem id="nfl-predictor" icon={<PiTargetLight />} label="Predictor" onClick={() => navigate('/nfl-predictor')} />
                </>
              )}
            </>
          )}

          {/* Admin Panel — only visible for admin / superadmin */}
          {user?.role && ['admin', 'superadmin'].includes(user.role.toLowerCase()) && (
            <>
              <div className="sm-divider" />
              <MenuItem id="admin" icon={<MdDashboard />} label="Admin Panel" onClick={() => navigate('/admin')} />
            </>
          )}

          {/* Always visible */}
          <div className="sm-divider" />
          <MenuItem id="rule-book" icon={<PiNotebookLight />} label={t('rules')} onClick={() => navigate('/rule-book')} />
          <MenuItem id="faq" icon={<img src={FAQ} alt="" />} label={t('faq')} onClick={() => navigate('/faq')} />

          {/* Back to Hub — always visible, routes to the multi-sport hub */}
          <div className="sm-divider" />
          <MenuItem id="hub" icon={<HiOutlineArrowLeft />} label="Back to Hub" onClick={() => navigate('/hub')} />
        </div>
      </div>

      {!isAuthenticated && (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <LoginDropdown loginFromSideMenu drawerVisible={visible} />
          <Button className="login-btn signup-btn mobile" onClick={landingSignup}>
            Sign Up
          </Button>
        </div>
      )}
    </>
  )
}

export default MainMenu
