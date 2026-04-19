import React, { useEffect, useState, useCallback } from 'react'
import { Image, Badge, Spin, Button, Dropdown } from 'antd'

import bellIcon from '../../assets/bell-icon.svg'
import sampointslogo from '../../assets/samcoinlogo.png'
import { useSelector, useDispatch } from 'react-redux'
import { BiRightArrowAlt } from 'react-icons/bi'
import { HiOutlineArrowsRightLeft } from 'react-icons/hi2'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  leagueSalaryCap,
  isTradeDeadlinePassed,
  isTradeDeadlineWarning,
  TRADE_DEADLINE_LOCKOUT_WEEK,
  privateAPI,
} from '../../config/constants'
import { getPendingTrade } from '../../redux/actions/teamTradeAction'
import LeaguePointsTransfer from '../modal/LeaguePointsTransfer'
import { TransferPointsToLeague, selectLeague, getUserLeagues } from '../../redux/actions/leagueActions'
import alertimage from '../../assets/new alert.png'
import { getAllNotification } from '../../redux/actions/notificationAction'
import { IoNotificationsOutline } from 'react-icons/io5'
import { MdOutlineGavel } from 'react-icons/md'
import { DownOutlined, SwapOutlined, TrophyOutlined } from '@ant-design/icons'

const Header = () => {
  const dispatch = useDispatch()
  const record = useSelector((state) => state.user.record)
  const user = useSelector((state) => state.user.userDetails)
  const leagueType = user?.team?.currentLeague?.leagueType
  const safepaylink = user?.team?.currentLeague?.safePayLink
  const teamSalary = useSelector((state) => state.user.teamSalaryCap)
  const { notificationCount } = useSelector((state) => state.user)
  const { auctionCount } = useSelector((state) => state.user)
  const walletData = useSelector((state) => state.user?.SamPoints)
  const sampoints = (walletData?.SamPoints || 0) + (walletData?.preAuctionPoints || 0)
  const userMainWallet = useSelector((state) => state.user?.userDetails?.mainWallet) || 0
  const earnedSP = (walletData?.earnedSamPoints || 0) + userMainWallet
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)
  const soccerFinancials = useSelector((state) => state.user?.soccerFinancials)
  const userLeagues = useSelector((state) => state.league?.userLeagues) || []
  const [modalVisible, setModalVisible] = useState(false)
  const [leaguepoints, setLeaguepoints] = useState('')
  const [notificationData, setNotificationData] = useState(null)
  const [tradeCount, setTradeCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const navigate = useNavigate()
  const SETTING = useSelector((state) => state?.user)

  const currentLeagueId = user?.team?.currentLeague?._id

  const teamFinancials = () => {
    navigate('/team-financials')
  }

  useEffect(() => {
    getData()
  }, [currentLeagueId])

  const getData = async () => {
    const res = await getAllNotification({
      week: SETTING?.currentWeek,
    })
    setNotificationData(res)
  }

  useEffect(() => {
    const fetchTradeCount = async () => {
      try {
        const trades = await getPendingTrade()
        if (trades && Array.isArray(trades)) {
          const pendingCount = trades.filter((t) => t.status === 'pending').length
          setTradeCount(pendingCount)
        }
      } catch (err) {
        console.error('Failed to fetch trade count', err)
      }
    }
    fetchTradeCount()
  }, [currentLeagueId])

  useEffect(() => {
    getUserLeagues()
  }, [])

  // ─── GM Rank badge ───
  const [gmRank, setGmRank] = useState(null)
  useEffect(() => {
    let cancelled = false
    const fetchGmRank = async () => {
      try {
        const { data } = await privateAPI.get('/ranking/gm-rankings/global')
        if (!cancelled && data?.data?.myRank) {
          setGmRank(data.data.myRank)
        }
      } catch (e) {
        // silently ignore
      }
    }
    fetchGmRank()
    return () => { cancelled = true }
  }, [currentLeagueId])

  const confirm = () => {
    setModalVisible(true)
  }

  const isPoaching = notificationData?.data?.some(
    (notification) =>
      notification.module === 'poaching' &&
      notification?.metadata?.team === user?.team?._id &&
      new Date(notification.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000),
  )

  const handletransferleaguepoints = async (direction = 'withdraw') => {
    try {
      const payload = {
        userid: user?._id,
        leagueid: user?.team?.currentLeague._id,
        teamid: user?.team?._id,
        leaguepoints: parseFloat(leaguepoints),
        direction,
      }
      await TransferPointsToLeague(payload)
      setLeaguepoints('')
      setModalVisible(false)
    } catch (error) {
      console.error('Error in transferring the league wallet:', error)
      setLeaguepoints('')
    }
  }

  const effectiveLeagueCap =
    myleagueSalaryCap?.leagueSalaryCap || myleagueSalaryCap || leagueSalaryCap

  const capLeft =
    effectiveLeagueCap != null && teamSalary != null ? effectiveLeagueCap - teamSalary : 0

  const formatCap = (val) => {
    if (val == null) return '$0'
    const abs = Math.abs(val)
    const sign = val < 0 ? '-' : ''
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
    return `${sign}$${abs}`
  }

  /* ── League Switcher ── */
  const handleLeagueSwitch = async (league) => {
    if (league._id === currentLeagueId) return
    await selectLeague({ leagueId: league._id }, navigate)
  }

  const leagueMenuItems = userLeagues
    ?.filter((l) => l._id !== currentLeagueId)
    ?.map((l) => ({
      key: l._id,
      label: (
        <div className='hdr-league-menu-item'>
          <div className='hdr-league-menu-top'>
            {l.myTeam?.logo ? (
              <img src={l.myTeam.logo} alt='' className='hdr-league-menu-logo' />
            ) : (
              <div className='hdr-league-menu-logo-placeholder'>
                {(l.myTeam?.name || l.name || 'L')[0]?.toUpperCase()}
              </div>
            )}
            <span className='hdr-league-menu-team'>{l.myTeam?.name || 'My Team'}</span>
          </div>
          <span className='hdr-league-menu-name'>{l.name || 'League'}</span>
        </div>
      ),
      onClick: () => handleLeagueSwitch(l),
    })) || []

  return user ? (
    <>
      <header className='hdr-shell no-scrollbar'>
        {/* ══════════════════════════════════════════════
            TOP BAR, Static / Account-level
        ══════════════════════════════════════════════ */}
        <div className='hdr-top'>
          {/* Brand */}
          <div className='hdr-brand' onClick={() => navigate('/home')}>
            <img src='/samsports-logo.svg' alt='SAMSports' className='hdr-brand-icon' />
            <span className='hdr-brand-text'>SAMSPORTS</span>
          </div>

          {/* SP Balance, account-wide */}
          <div className='hdr-sp-section'>
            <div className='hdr-sp-info'>
              <div className='hdr-sp-row'>
                <img className='hdr-sp-coin' src={sampointslogo} alt='SP' />
                <div className='hdr-sp-col'>
                  <span className='hdr-sp-label'>Available</span>
                  <span className='hdr-sp-val'>{sampoints ? sampoints.toLocaleString() : '0'}</span>
                </div>
              </div>
              <div className='hdr-sp-divider' />
              <div className='hdr-sp-row'>
                <div className='hdr-sp-earned-icon'>&#8593;</div>
                <div className='hdr-sp-col'>
                  <span className='hdr-sp-label hdr-sp-earned-label'>Total Earned</span>
                  <span className='hdr-sp-val hdr-sp-earned-val'>
                    {earnedSP.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className='hdr-sp-actions'>
              <Button
                className='hdr-btn-buy'
                type='primary'
                onClick={() => navigate('/buy-sam-points')}
              >
                BUY SP
              </Button>
              <Button className='hdr-btn-transfer' onClick={confirm}>
                TRANSFER
              </Button>
            </div>
          </div>

          {/* GM Rank Badge */}
          {gmRank && (
            <div
              className='hdr-gm-rank'
              onClick={() => navigate('/homepage')}
              title={`GM Rating: ${gmRank.overallRating?.toFixed(1)} (${gmRank.grade}), ${gmRank.leagueCount} league${gmRank.leagueCount !== 1 ? 's' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 80,
                padding: '6px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                background: gmRank.rank <= 10
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)'
                  : gmRank.rank <= 50
                    ? 'linear-gradient(135deg, #C0C0C0 0%, #9E9E9E 100%)'
                    : 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 100%)',
                marginLeft: 12,
              }}
            >
              <TrophyOutlined style={{ fontSize: 14, color: '#fff' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                GM Rank
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                #{gmRank.rank}
              </span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>
                {gmRank.overallRating?.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            BOTTOM STRIP, League-scoped, collapsible
        ══════════════════════════════════════════════ */}
        <div className='hdr-strip'>
          {/* Left: Team identity + league switcher */}
          <div className='hdr-strip-left'>
            <div className='hdr-team-logo'>
              {user?.team?.logo && !logoError ? (
                <Image
                  preview={false}
                  src={user.team.logo}
                  onError={() => setLogoError(true)}
                  alt={user?.team?.name || 'Team'}
                />
              ) : (
                <span className='hdr-team-letter'>
                  {(user?.team?.name || user?.name || 'S')?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className='hdr-team-col'>
              <span className='hdr-team-name'>{user?.team?.name || user?.name || 'My Team'}</span>
              {leagueMenuItems.length > 0 ? (
                <Dropdown
                  menu={{ items: leagueMenuItems }}
                  trigger={['click']}
                  placement='bottomLeft'
                >
                  <span className='hdr-league-switch'>
                    <span className='hdr-league-current'>
                      {user?.team?.currentLeague?.name || 'League'}
                    </span>
                    <SwapOutlined className='hdr-league-switch-icon' />
                  </span>
                </Dropdown>
              ) : (
                <span className='hdr-league-name-static'>
                  {user?.team?.currentLeague?.name || 'League'}
                </span>
              )}
            </div>
          </div>

          {/* Center: Compact stats + badges */}
          <div className='hdr-strip-center'>
            {/* Record */}
            <div className='hdr-compact-record'>
              <div className='hdr-compact-stat'>
                <span className='hdr-compact-label'>Overall</span>
                <span className='hdr-compact-val'>
                  {record?.overall?.win}-{record?.overall?.lose}-{record?.overall?.tie}
                </span>
              </div>
              <div className='hdr-compact-sep' />
              <div className='hdr-compact-stat'>
                <span className='hdr-compact-label'>Division</span>
                <span className='hdr-compact-val'>
                  {record?.division?.win}-{record?.division?.lose}-{record?.division?.tie}
                </span>
              </div>
            </div>

            {/* Compact Cap */}
            <div
              className={`hdr-compact-cap ${capLeft < 0 ? 'hdr-cap-negative' : ''}`}
              onClick={() => setDrawerOpen(!drawerOpen)}
              title='Click for full financials'
            >
              <span className='hdr-compact-cap-label'>Budget Left</span>
              <span className='hdr-compact-cap-val'>{formatCap(capLeft)}</span>
              <DownOutlined
                className={`hdr-cap-chevron ${drawerOpen ? 'hdr-cap-chevron-open' : ''}`}
              />
            </div>
          </div>

          {/* Right: Notification/Auction/Trade badges */}
          <div className='hdr-strip-right'>
            <span className='hdr-badge' onClick={() => navigate('/league-notification')}>
              {notificationCount ? (
                <Badge count={notificationCount} color='#d4a017' size='small'>
                  <img src={bellIcon} alt='Notifications' className='hdr-bell-icon' style={{ filter: 'brightness(1.5) sepia(1) hue-rotate(10deg) saturate(3)' }} />
                </Badge>
              ) : (
                <img src={bellIcon} alt='Notifications' className='hdr-bell-icon' />
              )}
              <span className='hdr-badge-label' style={notificationCount ? { color: '#d4a017' } : {}}>
                Notifications
              </span>
            </span>

            <span className='hdr-badge' onClick={() => navigate('/player-auction')}>
              <Badge count={auctionCount} color='#d4a017' size='small'>
                <MdOutlineGavel className='hdr-auction-icon' style={auctionCount ? { color: '#d4a017' } : {}} />
              </Badge>
              <span className='hdr-badge-label' style={auctionCount ? { color: '#d4a017' } : {}}>Live Auction</span>
            </span>

            {isPoaching && (
              <span className='hdr-badge hdr-poaching-alert'>
                <img width={18} src={alertimage} alt='Alert' />
                <span className='hdr-badge-label hdr-poaching-text'>Poaching Alert</span>
              </span>
            )}

            <span className='hdr-badge' onClick={() => navigate('/team-trade')}>
              <Badge count={tradeCount} color='#d4a017' size='small'>
                <HiOutlineArrowsRightLeft
                  className='hdr-trade-icon'
                  style={{ fontSize: 18, color: tradeCount ? '#d4a017' : '#94A3B8' }}
                />
              </Badge>
              <span className='hdr-badge-label' style={tradeCount ? { color: '#d4a017' } : {}}>Trades</span>
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            EXPANDED DRAWER, Full financials
        ══════════════════════════════════════════════ */}
        <div className={`hdr-drawer ${drawerOpen ? 'hdr-drawer-open' : ''}`}>
          <div className='hdr-drawer-inner'>
            <div className='hdr-fin-card' onClick={teamFinancials}>
              <div className='hdr-fin-header'>
                <span className='hdr-fin-title'>Team Financials</span>
                <BiRightArrowAlt className='hdr-fin-arrow' />
              </div>
              {soccerFinancials ? (
                <div className='hdr-fin-grid hdr-fin-grid-4'>
                  <div className='hdr-fin-item'>
                    <span className='hdr-fin-label'>League Value Cap</span>
                    <span className='hdr-fin-val'>{formatCap(soccerFinancials.leagueValueCap)}</span>
                  </div>
                  <div className='hdr-fin-item'>
                    <span className='hdr-fin-label'>Team Value Cap</span>
                    <span className='hdr-fin-val'>{formatCap(soccerFinancials.teamValueCap)}</span>
                  </div>
                  <div className='hdr-fin-item'>
                    <span className='hdr-fin-label'>Salary Cap</span>
                    <span className='hdr-fin-val'>{formatCap(soccerFinancials.salaryCap)}</span>
                  </div>
                  <div className='hdr-fin-item hdr-fin-highlight'>
                    <span className='hdr-fin-label'>League Salary Cap Avg</span>
                    <span className='hdr-fin-val'>{formatCap(soccerFinancials.leagueSalaryCapAverage)}</span>
                  </div>
                </div>
              ) : (
                <div className='hdr-fin-grid'>
                  <div className='hdr-fin-item'>
                    <span className='hdr-fin-label'>League Budget</span>
                    <span className='hdr-fin-val'>{formatCap(effectiveLeagueCap)}</span>
                  </div>
                  <div className='hdr-fin-item'>
                    <span className='hdr-fin-label'>Team Value</span>
                    <span className='hdr-fin-val'>{formatCap(teamSalary)}</span>
                  </div>
                  <div className='hdr-fin-item hdr-fin-highlight'>
                    <span className='hdr-fin-label'>Budget Left</span>
                    <span className='hdr-fin-val'>{formatCap(capLeft)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trade Deadline Banners */}
            {isTradeDeadlineWarning() && (
              <div className='hdr-deadline-banner hdr-deadline-warning'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <circle cx='12' cy='12' r='10' />
                  <line x1='12' y1='8' x2='12' y2='12' />
                  <line x1='12' y1='16' x2='12.01' y2='16' />
                </svg>
                <span>
                  Trade deadline approaching! All trades lock after Week{' '}
                  {TRADE_DEADLINE_LOCKOUT_WEEK - 1}.
                </span>
              </div>
            )}
            {isTradeDeadlinePassed() && (
              <div className='hdr-deadline-banner hdr-deadline-locked'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
                  <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                </svg>
                <span>Trade deadline has passed. No new trades can be submitted.</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <LeaguePointsTransfer
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  ) : (
    <div className='empty_header'>
      <Spin />
    </div>
  )
}

export default Header
