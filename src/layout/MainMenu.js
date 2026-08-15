import { useEffect, useState } from 'react'
import { Button, notification } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi'
import { MdDashboard, MdOutlineStadium } from 'react-icons/md'
import { FaPlusCircle, FaRegChartBar, FaBriefcaseMedical } from 'react-icons/fa'
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
import { PiUsersThreeLight, PiNotebookLight, PiMagnifyingGlassLight, PiTargetLight, PiQuestionLight } from 'react-icons/pi'
import { TbLivePhoto } from 'react-icons/tb'
import { AiOutlineSetting } from 'react-icons/ai'
import { IoChevronDown } from 'react-icons/io5'
import comissioner from '../assets/comissioner.png'
import { useSelector } from 'react-redux'
import { isCommissionerOfLeague } from '../utils/useIsLeagueCommissioner'
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
import HowToPlayTour from '../components/HowToPlayTour'

const DYNASTY_TOUR = [
  { title: 'Welcome to Dynasty 32', body: 'A quick walkthrough of how your league app is organized and what each area does.' },
  { selector: '[data-tour="dyn-home"]', title: 'Home', body: 'Your starting point. Jump to your league and see what needs attention.' },
  { selector: '[data-tour="dyn-frontoffice"]', title: 'Front Office', body: 'Your GM command center for big-picture roster and franchise moves.' },
  { selector: '[data-tour="dyn-dashboard"]', title: 'Dashboard', body: 'Your team at a glance: this week matchup, roster health, and news.' },
  { selector: '[data-tour="dyn-myteam"]', title: 'My Team', body: 'Manage your roster: your Roster/Squad, Starters and depth chart, Roster Board, Team Settings, and your Stadium.' },
  { selector: '[data-tour="dyn-league"]', title: 'League', body: 'Your competition: My Leagues, Rosters, Standings, Live Scoring, and Commissioner tools if you run the league.' },
  { selector: '[data-tour="dyn-transactions"]', title: 'Transactions', body: 'Move players: Trades, Auctions, and Injured Reserve.' },
  { selector: '[data-tour="dyn-draft"]', title: 'Draft', body: 'All your drafts: Live Draft, Supplemental, Rookie, and Mock drafts.' },
  { selector: '[data-tour="dyn-playoffs"]', title: 'Playoffs', body: 'The postseason: Playoffs, Bracket, Playoff Standings, and Playoff Draft.' },
  { selector: '[data-tour="dyn-gm"]', title: 'GM Challenge', body: 'Compete in manager challenges for extra rewards.' },
  { selector: '[data-tour="dyn-values"]', title: 'Keep Trade Cut', body: 'Player trade values to help you make and judge deals.' },
  { selector: '[data-tour="dyn-injury"]', title: 'Injury Report', body: 'Stay ahead of injuries across the league before you set your lineup.' },
  { selector: '[data-tour="dyn-search"]', title: 'Search', body: 'Find any player fast.' },
  { selector: '[data-tour="dyn-chat"]', title: 'Chat', body: 'Talk with your league and line up trades.' },
  { selector: '[data-tour="dyn-clubhouse"]', title: 'Clubhouse', body: 'Your league social hub.' },
  { selector: '[data-tour="dyn-predictor"]', title: 'Predictor', body: 'Predict real NFL results to earn points.' },
  { selector: '[data-tour="dyn-rules"]', title: 'Rules', body: 'The full rule book and scoring reference for everything.' },
  { title: 'You are ready', body: 'Set your lineup each week, work the wire and trades, and chase the title. Reopen this tour any time from How to Play.' },
]

const MainMenu = ({ visible }) => {
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [active, setActive] = useState('dashboard')
  const [openGroup, setOpenGroup] = useState(null)
  const [tourOpen, setTourOpen] = useState(false)
  const user = useSelector((state) => state.user.userDetails)
  // Commissioner-only nav gating. Resolve the active league the way the app does
  // (redux league first, else the user's team league), then check pure
  // commissioner status — NOT the badge-hide preference — so a commissioner who
  // hid their badge still keeps the menu, and regular members never see it.
  const _leagueForComm = useSelector((s) => s.league?.currentLeague)
  const _commLeague = _leagueForComm && !Array.isArray(_leagueForComm) ? _leagueForComm : user?.team?.currentLeague
  const isLeagueCommissioner = isCommissionerOfLeague(_commLeague, user?._id)
  const isdraftlive = user?.team?.currentLeague?.isDraftLive
  const isDormant = user?.isDormant === true
  const hasLeague = !!user?.team?.currentLeague
  const hasTeam = !!user?.team
  const isFullAccess = isAuthenticated && (hasLeague || hasTeam)
  const [filteredCount, setFilteredCount] = useState(0)
  const [commInboxCount, setCommInboxCount] = useState(0)
  // Real GM rating (0–100) from the ranking endpoint. New users have no rating → 0.
  const [gmRating, setGmRating] = useState(0)
  const { pathname } = useLocation()
  // Detect soccer mode from league sport field or URL path
  const leagueSport = user?.team?.currentLeague?.sport || user?.team?.currentLeague?.gameType || ''
  const isSoccer = leagueSport === 'soccer' || leagueSport === 'football' || pathname.startsWith('/soccer')

  useEffect(() => {
    getUser()
  })

  // Fetch the user's real GM rating so the sidebar shows their actual standing
  // (a brand-new user with no games returns 0 — no fake level/XP).
  useEffect(() => {
    if (!isAuthenticated) return
    let alive = true
    ;(async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/ranking/gm-rankings/global')
        const r = data?.data?.overallRating ?? data?.overallRating ?? data?.data?.rating ?? 0
        if (alive) setGmRating(Number(r) || 0)
      } catch (e) { /* leave at 0 */ }
    })()
    return () => { alive = false }
  }, [isAuthenticated])

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
      '/mock-draft': 'mock-draft',
      '/gm-challenge': 'gm-challenge',
      '/values': 'values',
      '/war-room': 'war-room',
      '/front-office': 'war-room',
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
    // Only commissioners have an inbox — don't poll (or badge) for members.
    if (!isAuthenticated || !leagueId || !isLeagueCommissioner) { setCommInboxCount(0); return }
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
  }, [user?.team?.currentLeague?._id, isAuthenticated, isLeagueCommissioner])

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

  const MenuItem = ({ id, icon, label, onClick, badge, glowColor, dataTour }) => (
    <div
      className={`sm-item ${active === id ? 'sm-active' : ''}`}
      onClick={onClick}
      data-tour={dataTour}
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

  const GroupHeader = ({ id, icon, label, isOpen, dataTour }) => (
    <div
      className={`sm-group-hd ${isOpen ? 'sm-group-open' : ''}`}
      onClick={() => toggleGroup(id)}
      data-tour={dataTour}
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
          <MenuItem id="home" icon={<HiOutlineHome />} label={t('home')} onClick={() => navigate('/homepage')} dataTour="dyn-home" />

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
              <MenuItem id="war-room" icon={<GiCastle />} label={t('frontOffice')} onClick={() => navigate('/front-office')} dataTour="dyn-frontoffice" />

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
                  <MenuItem id="dashboard" icon={<MdDashboard />} label={t('dashboard')} onClick={() => navigatePath('/dashboard')} dataTour="dyn-dashboard" />

                  {/* My Team group */}
                  <GroupHeader id="team" icon={<PiUsersThreeLight />} label={t('myTeam')} isOpen={openGroup === 'team'} dataTour="dyn-myteam" />
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
                  <GroupHeader id="league" icon={<SiLeagueoflegends />} label={t('league')} isOpen={openGroup === 'league'} dataTour="dyn-league" />
                  {openGroup === 'league' && (
                    <div className="sm-group-items">
                      <MenuItem id="my-league" icon={<SiLeagueoflegends />} label={t('myLeagues')} onClick={() => navigate('/my-league')} />
                      <MenuItem id="league-rosters" icon={<GiAmericanFootballPlayer />} label={t('rosters')} onClick={() => navigatePath('/league-rosters')} />
                      <MenuItem id="league-standings" icon={<BsShop />} label={t('standings')} onClick={() => navigatePath('/league-standings')} />
                      <MenuItem id="leagueScore" icon={<TbLivePhoto />} label={t('liveScoring')} onClick={() => navigatePath('/leagueScore')} />
                      {isLeagueCommissioner && <MenuItem id="comissioner" icon={<img src={comissioner} alt="" />} label={t('commissioner')} onClick={() => { setCommInboxCount(0); navigate('/commissioner'); }} glowColor={commInboxCount > 0 ? '#22C55E' : null} />}
                    </div>
                  )}

                  {/* Transactions group */}
                  <GroupHeader id="transactions" icon={<GiTrade />} label={t('transactions')} isOpen={openGroup === 'transactions'} dataTour="dyn-transactions" />
                  {openGroup === 'transactions' && (
                    <div className="sm-group-items">
                      <MenuItem id="trade" icon={<GiTrade />} label={t('trade')} onClick={() => navigatePath('/team-trade')} />
                      <MenuItem id="auctions" icon={<RiAuctionLine />} label={t('auctions')} onClick={() => navigatePath('/player-auction')} />
                      <MenuItem id="injuries-reserve" icon={<FaPlusCircle />} label={t('injuredReserve')} onClick={() => navigatePath('/injured-reserve')} />
                    </div>
                  )}

                  {/* Draft group */}
                  <GroupHeader id="draft-group" icon={<RiDraftLine />} label={t('draft')} isOpen={openGroup === 'draft-group'} dataTour="dyn-draft" />
                  {openGroup === 'draft-group' && (
                    <div className="sm-group-items">
                      <MenuItem id="draft" icon={<RiDraftLine />} label={t('draftLive')} onClick={() => navigate('/live-draft')} />
                      <MenuItem id="supplemental-draft" icon={<RiDraftLine />} label={t('supplementalDraft')} onClick={() => navigatePath('/supplemental-draft')} />
                      <MenuItem id="rookie-draft" icon={<RiDraftLine />} label={t('rookieDraft')} onClick={() => navigatePath('/rookie-draft')} />
                      {/* Mock draft needs no league — anyone can practise, including
                          people who haven't joined one yet. So navigate(), not
                          navigatePath(), which would block them with an error toast. */}
                      <MenuItem id="mock-draft" icon={<RiDraftLine />} label="Mock Draft" onClick={() => navigate('/mock-draft')} />
                    </div>
                  )}

                  {/* Playoffs group */}
                  <GroupHeader id="playoffs" icon={<GiBabyfootPlayers />} label={t('playoffs')} isOpen={openGroup === 'playoffs'} dataTour="dyn-playoffs" />
                  {openGroup === 'playoffs' && (
                    <div className="sm-group-items">
                      <MenuItem id="playoff" icon={<GiBabyfootPlayers />} label={t('playoffs')} onClick={() => navigatePath('/playoff')} />
                      <MenuItem id="playoff-bracket" icon={<GiBabyfootPlayers />} label={t('bracket')} onClick={() => navigatePath('/playoff-bracket')} />
                      <MenuItem id="playoff-standings" icon={<GiStarMedal />} label={t('playoffStandings')} onClick={() => navigatePath('/playoff-standings')} />
                      <MenuItem id="playoff-draft" icon={<RiDraftLine />} label="Playoff Draft" onClick={() => navigatePath('/playoff-draft')} />
                    </div>
                  )}

                  {/* Standalone items */}
                  {/* GM Challenge — moved here from the homepage lobby, where its
                      card was replaced by Keep/Trade/Cut. It DOES need a league
                      (you're ranked against the managers in yours), so it keeps
                      navigatePath(), unlike Mock Draft above. */}
                  <MenuItem id="gm-challenge" icon={<GiStarMedal />} label={t('gmChallenge')} onClick={() => navigatePath('/gm-challenge')} dataTour="dyn-gm" />
                  {/* Keep/Trade/Cut needs NO league and no account — the vote
                      endpoint takes anonymous votes, and volume is the point.
                      navigate(), not navigatePath(). */}
                  <MenuItem id="values" icon={<RiAuctionLine />} label={t('keepTradeCut')} onClick={() => navigate('/values')} dataTour="dyn-values" />
                  {/* Injury report — no league, no account, public like the value
                      board. Reads Tank01 injury designations. */}
                  <MenuItem id="injury-report" icon={<FaBriefcaseMedical />} label={t('injuryReport')} onClick={() => navigate('/injury-report')} dataTour="dyn-injury" />
                  <MenuItem id="search-player" icon={<PiMagnifyingGlassLight />} label={t('search')} onClick={() => navigatePath('/search-player')} dataTour="dyn-search" />
                  <MenuItem id="chat" icon={<SiWechat />} label={t('chat')} onClick={handleClick} badge={filteredCount} glowColor={filteredCount > 0 ? '#22C55E' : null} dataTour="dyn-chat" />
                  <MenuItem id="clubhouse" icon={<RxEnvelopeClosed />} label={t('clubhouse')} onClick={() => navigatePath('/clubhouse')} dataTour="dyn-clubhouse" />
                  <MenuItem id="nfl-predictor" icon={<PiTargetLight />} label="Predictor" onClick={() => navigate('/nfl-predictor')} dataTour="dyn-predictor" />
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
          <MenuItem id="rule-book" icon={<PiNotebookLight />} label={t('rules')} onClick={() => navigate('/rule-book')} dataTour="dyn-rules" />
          <MenuItem id="faq" icon={<img src={FAQ} alt="" />} label={t('faq')} onClick={() => navigate('/faq')} />
          {/* How to Play — opens the guided tour, does NOT navigate */}
          <MenuItem id="how-to-play" icon={<PiQuestionLight />} label={t('howToPlay')} onClick={() => setTourOpen(true)} dataTour="dyn-howtoplay" />

          {/* Back to Hub — always visible, routes to the multi-sport hub */}
          <div className="sm-divider" />
          <MenuItem id="hub" icon={<HiOutlineArrowLeft />} label="Back to Hub" onClick={() => navigate('/hub')} />

          {/* GM footer — Earn SamPoints · GM Profile · GM Level XP */}
          {isAuthenticated && (
            <div style={{ padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'linear-gradient(160deg,rgba(34,197,94,0.18),rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#ECEAE3', marginBottom: 3 }}>Earn SamPoints</div>
                <div style={{ fontSize: 11, color: '#9aa4b6', marginBottom: 10, lineHeight: 1.4 }}>Compete, win and earn rewards.</div>
                <button onClick={() => navigate('/front-office')} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#22C55E,#16A34A)', color: '#06210f', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>View Rewards</button>
              </div>
              <div onClick={() => navigate('/edit-profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '0 2px' }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#16A34A,#0f7a37)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{(user?.team?.name || 'U').charAt(0).toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#ECEAE3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.team?.name || 'Your Team'}</div>
                  <div style={{ fontSize: 11, color: '#69748B' }}>GM Profile ▾</div>
                </div>
              </div>
              <div style={{ padding: '0 2px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 5 }}>
                  <span style={{ fontWeight: 800, color: '#AEB6C4', letterSpacing: 0.3 }}>GM RATING {Math.round(gmRating)}</span>
                  <span style={{ color: '#69748B' }}>{Math.round(gmRating)} / 100</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: '#1a2030' }}><div style={{ width: `${Math.min(100, Math.max(0, gmRating))}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#4ADE80,#22C55E)' }} /></div>
              </div>
            </div>
          )}
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

      <HowToPlayTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        accent="#7C3AED"
        brand="Dynasty 32"
        steps={DYNASTY_TOUR}
      />
    </>
  )
}

export default MainMenu
