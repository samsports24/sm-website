import React, { useEffect, useState } from 'react'
import { Button, Input, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import moment from 'moment'

import Header from '../components/Header'
import Loader from '../components/Loader'

import {
  clearNotification,
  getAllNotification,
  deleteReadNotifications,
  deleteNotification,
  postCommissionerAnnouncement,
  getCommissionerAnnouncements,
  getLeagueActivity,
  deleteCommissionerAnnouncement,
} from '../redux/actions/notificationAction'
import { payTrade } from '../redux/actions/teamTradeAction'

import {
  IoMegaphoneOutline,
  IoTrashOutline,
  IoSendSharp,
  IoArrowBack,
  IoRadioOutline,
} from 'react-icons/io5'
import {
  FiClock,
  FiBell,
  FiAlertTriangle,
  FiMessageSquare,
  FiShield,
  FiRepeat,
  FiUserPlus,
  FiSettings,
  FiClipboard,
  FiActivity,
  FiUsers,
  FiAward,
  FiTag,
  FiArrowRight,
} from 'react-icons/fi'

const { TextArea } = Input

// ── Filter chips (map notification modules → chip buckets) ──
const CHIP_DEFS = [
  { key: 'all', label: 'All' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'trades', label: 'Trades' },
  { key: 'draft', label: 'Draft' },
  { key: 'matchday', label: 'Matchday' },
  { key: 'league', label: 'League' },
  { key: 'system', label: 'System' },
]

const chipOfModule = (n) => {
  const m = (n?.module || '').toLowerCase()
  if (m === 'announcement') return 'announcements'
  if (m === 'trade') return 'trades'
  if (m === 'draft') return 'draft'
  if (m === 'matchday' || m === 'score' || m === 'scoring') return 'matchday'
  if (m === 'system' || m === 'admin') return 'system'
  return 'league'
}

// ── Activity category → icon + accent ──
const activityMeta = (cat, action) => {
  if (cat === 'trade') return { icon: <FiRepeat size={14} />, color: '#A855F7' }
  if (cat === 'draft') return { icon: <FiClipboard size={14} />, color: '#8B5CF6' }
  if (cat === 'member') return { icon: <FiUserPlus size={14} />, color: '#3B82F6' }
  if (cat === 'settings') return { icon: <FiSettings size={14} />, color: '#3B82F6' }
  if (cat === 'commissioner') return { icon: <IoMegaphoneOutline size={14} />, color: '#4ADE80' }
  if (cat === 'roster') return { icon: <FiUsers size={14} />, color: '#3B82F6' }
  if (cat === 'playoff') return { icon: <FiAward size={14} />, color: '#F7C948' }
  if (cat === 'auction') return { icon: <FiTag size={14} />, color: '#F59E0B' }
  if (action && action.includes('vetoed')) return { icon: <FiRepeat size={14} />, color: '#ef4444' }
  return { icon: <FiActivity size={14} />, color: '#94a3b8' }
}

const SCORING_LABEL = {
  ppr: 'PPR',
  half_ppr: 'Half PPR',
  standard: 'Standard',
  superflex: 'Superflex',
  te_premium: 'TE Premium',
  sam_metric: 'SAM Metric',
}

const LeagueNotification = () => {
  const SETTING = useSelector((state) => state?.user)
  const leagueState = useSelector((state) => state?.league?.currentLeague)
  const league = Array.isArray(leagueState) ? null : leagueState
  const isCommissioner = SETTING?.userDetails?.isCommissioner

  const [notificationData, setNotificationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [payId, setPayId] = useState('')
  const [clearBtnLoading, setClearBtnLoading] = useState(false)
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set())
  const [dismissingId, setDismissingId] = useState('')
  const [activeChip, setActiveChip] = useState('all')

  // Announcements
  const [announcements, setAnnouncements] = useState([])
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [announcementPriority, setAnnouncementPriority] = useState('normal')
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)

  // League activity feed
  const [activity, setActivity] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getData()
    loadAnnouncements()
    loadActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getData = async () => {
    setIsLoading(true)
    const res = await getAllNotification({ week: SETTING?.currentWeek })
    setNotificationData(res)
    setIsLoading(false)
  }

  const loadAnnouncements = async () => {
    const data = await getCommissionerAnnouncements()
    setAnnouncements(data || [])
  }

  const loadActivity = async () => {
    const data = await getLeagueActivity(15)
    setActivity(Array.isArray(data) ? data : [])
  }

  const handlePay = async (tradeId) => {
    setPayId(tradeId)
    const res = await payTrade({ tradeId })
    if (res) {
      notification.success({ message: res, duration: 3 })
      getData()
    }
    setPayId('')
  }

  const isPayButtonDis = (metadata) => {
    const buyerPaid = metadata?.hasBuyerPaid
    const sellerPaid = metadata?.hasSellerPaid
    const currentTeamId = SETTING?.userDetails?.team?._id
    const buyerTeamId = metadata?.buyer?.team
    const sellerTeamId = metadata?.seller?.team
    if (buyerPaid && currentTeamId === buyerTeamId) return true
    if (sellerPaid && currentTeamId === sellerTeamId) return true
    return false
  }

  const clearAllNotification = async () => {
    setClearBtnLoading(true)
    const res = await clearNotification()
    if (res) await getData()
    setClearBtnLoading(false)
  }

  const handleDismissNotification = async (notificationId) => {
    setDismissingId(notificationId)
    await deleteNotification(notificationId)
    const newDismissed = new Set(dismissedNotifications)
    newDismissed.add(notificationId)
    setDismissedNotifications(newDismissed)
    setDismissingId('')
  }

  const handleDeleteAllRead = async () => {
    setClearBtnLoading(true)
    await deleteReadNotifications()
    await getData()
    setClearBtnLoading(false)
  }

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      notification.warning({ message: 'Please fill in both title and message', duration: 3 })
      return
    }
    setSendingAnnouncement(true)
    const res = await postCommissionerAnnouncement({
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      priority: announcementPriority,
    })
    if (res) {
      setAnnouncementTitle('')
      setAnnouncementMessage('')
      setAnnouncementPriority('normal')
      setShowAnnouncementForm(false)
      await Promise.all([loadAnnouncements(), loadActivity()])
    }
    setSendingAnnouncement(false)
  }

  const handleDeleteAnnouncement = async (id) => {
    await deleteCommissionerAnnouncement(id)
    await loadAnnouncements()
  }

  const getNotificationType = (n) => {
    if (n?.alert) return 'alert'
    if (n?.module === 'trade') return 'trade'
    return 'info'
  }

  const getNotificationIcon = (type) => {
    if (type === 'alert') return <FiAlertTriangle size={16} />
    if (type === 'trade') return <FiMessageSquare size={16} />
    return <FiBell size={16} />
  }

  // ── Derived: notifications + chip counts ──
  const allNotifications = notificationData?.data?.filter((n) => !dismissedNotifications.has(n._id)) || []
  const chipCounts = CHIP_DEFS.reduce((acc, c) => {
    acc[c.key] = c.key === 'all' ? allNotifications.length : allNotifications.filter((n) => chipOfModule(n) === c.key).length
    return acc
  }, {})
  const visibleNotifications = activeChip === 'all'
    ? allNotifications
    : allNotifications.filter((n) => chipOfModule(n) === activeChip)

  // ── League info panel values ──
  const scoringLabel = league?.scoringMode ? (SCORING_LABEL[league.scoringMode] || 'SAM Metric') : null
  const formatLabel = league?.numberOfTeams
    ? `${league.numberOfTeams} Teams${scoringLabel ? ` · ${scoringLabel}` : ''}`
    : null
  const currentWeek = league?.currentWeek || SETTING?.currentWeek || null
  const totalWeeks = league?.totalWeeks || league?.regularSeasonWeeks || null
  const weekLabel = currentWeek
    ? `Week ${currentWeek}${totalWeeks ? ` of ${totalWeeks}` : ''}`
    : '—'

  const leagueInfo = [
    { label: 'League', value: league?.leagueName || league?.name || '—' },
    { label: 'Season', value: league?.season ? `Season ${league.season}` : '—' },
    { label: 'Format', value: formatLabel || '—' },
    { label: 'Status', value: league ? (league.status || 'Regular Season') : '—', pill: true },
    { label: 'Current Week', value: weekLabel },
  ]

  return (
    <div className='practice_squad_container team_trade_main league_notification_container'>
      <Header />

      <div className='ln-page ln-updates'>
        {/* ═══ PAGE HEADER ═══ */}
        <div className='ln-top'>
          <div className='ln-top-left'>
            <button className='ln-hub-btn' onClick={() => navigate('/homepage')}>
              <IoArrowBack size={14} /> Back to Hub
            </button>
            <div className='ln-title-row'>
              <h1 className='ln-title'>League Updates</h1>
              <IoMegaphoneOutline className='ln-title-mega' size={20} />
            </div>
            <p className='ln-subtitle'>Announcements and activity from across your league.</p>
          </div>
          <div className='ln-top-right'>
            {isCommissioner ? (
              <>
                <button
                  className='ln-new-ann-btn'
                  onClick={() => setShowAnnouncementForm((v) => !v)}
                >
                  <IoMegaphoneOutline size={15} /> New Announcement
                </button>
                <span className='ln-new-ann-note'>Commissioners only</span>
              </>
            ) : (
              <button className='ln-golive-btn' onClick={() => navigate('/live-auction')}>
                <IoRadioOutline size={15} /> Go Live
              </button>
            )}
          </div>
        </div>

        {/* ═══ FILTER CHIPS ═══ */}
        <div className='ln-chips'>
          {CHIP_DEFS.map((c) => (
            <button
              key={c.key}
              className={`ln-chip ${activeChip === c.key ? 'ln-chip-active' : ''}`}
              onClick={() => setActiveChip(c.key)}
            >
              {c.label}
              {chipCounts[c.key] > 0 && <span className='ln-chip-count'>{chipCounts[c.key]}</span>}
            </button>
          ))}
        </div>

        {/* ═══ TWO-COLUMN BODY ═══ */}
        <div className='ln-grid'>
          {/* ── MAIN COLUMN ── */}
          <div className='ln-main'>
            {/* Commissioner Announcements */}
            <div className='ln-panel'>
              <div className='ln-panel-head'>
                <div className='ln-panel-title'>
                  <FiShield size={16} className='ln-ann-shield' />
                  Commissioner Announcements
                  {announcements.length > 0 && <span className='ln-ann-count'>{announcements.length}</span>}
                </div>
              </div>

              {/* Compose form (commissioners) */}
              {showAnnouncementForm && isCommissioner && (
                <div className='ln-ann-form'>
                  <div className='ln-ann-form-inner'>
                    <Input
                      placeholder='Announcement title...'
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className='ln-ann-input'
                      maxLength={100}
                    />
                    <TextArea
                      placeholder='Write your message to the league...'
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                      className='ln-ann-textarea'
                      rows={3}
                      maxLength={500}
                    />
                    <div className='ln-ann-form-footer'>
                      <div className='ln-ann-priority'>
                        <span className='ln-ann-priority-label'>Priority:</span>
                        {['normal', 'important', 'urgent'].map((p) => (
                          <button
                            key={p}
                            className={`ln-ann-priority-btn ln-ann-priority-${p} ${announcementPriority === p ? 'active' : ''}`}
                            onClick={() => setAnnouncementPriority(p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className='ln-ann-form-actions'>
                        <button
                          className='ln-ann-cancel-btn'
                          onClick={() => {
                            setShowAnnouncementForm(false)
                            setAnnouncementTitle('')
                            setAnnouncementMessage('')
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className='ln-ann-send-btn'
                          onClick={handleSendAnnouncement}
                          disabled={sendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()}
                        >
                          {sendingAnnouncement ? 'Sending...' : (<><IoSendSharp size={13} /> Send to League</>)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Announcement list */}
              {announcements.length > 0 ? (
                <div className='ln-ann-list'>
                  {announcements.map((ann) => (
                    <div key={ann._id} className={`ln-ann-card ln-ann-card-${ann.priority || 'normal'}`}>
                      <div className='ln-ann-card-top'>
                        <div className='ln-ann-author'>
                          <span className='ln-ann-avatar'>{(ann.author?.name || 'C').charAt(0).toUpperCase()}</span>
                          <div className='ln-ann-author-meta'>
                            <span className='ln-ann-author-name'>{ann.author?.name || 'Commissioner'}</span>
                            <span className='ln-ann-card-badge'><FiShield size={10} /> Commissioner</span>
                          </div>
                        </div>
                        {ann.priority === 'urgent' && <span className='ln-ann-urgent-tag'>URGENT</span>}
                        {ann.priority === 'important' && <span className='ln-ann-important-tag'>IMPORTANT</span>}
                        <span className='ln-ann-time'><FiClock size={11} /> {moment(ann.createdAt).fromNow()}</span>
                        {isCommissioner && (
                          <button className='ln-ann-delete-btn' onClick={() => handleDeleteAnnouncement(ann._id)}>
                            <IoTrashOutline size={14} />
                          </button>
                        )}
                      </div>
                      <h4 className='ln-ann-card-title'>{ann.title}</h4>
                      <p className='ln-ann-card-message'>{ann.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                !showAnnouncementForm && (
                  <div className='ln-ann-empty'>
                    <IoMegaphoneOutline size={30} />
                    <p>No announcements yet</p>
                  </div>
                )
              )}
            </div>

            {/* Your Notifications */}
            <div className='ln-panel'>
              <div className='ln-panel-head'>
                <div className='ln-panel-title'>
                  <FiBell size={16} className='ln-header-icon' />
                  Your Notifications
                  {chipCounts.all > 0 && <span className='ln-count-badge'>{chipCounts.all}</span>}
                </div>
                {chipCounts.all > 0 && (
                  <div className='ln-header-actions'>
                    <Button loading={clearBtnLoading} className='ln-action-btn' onClick={clearAllNotification}>
                      Mark All Read
                    </Button>
                    <Button loading={clearBtnLoading} className='ln-action-btn ln-action-btn-danger' onClick={handleDeleteAllRead}>
                      Delete Read
                    </Button>
                  </div>
                )}
              </div>

              <div className='ln-list'>
                {isLoading ? (
                  <Loader />
                ) : visibleNotifications.length > 0 ? (
                  visibleNotifications.map((v, i) => {
                    const type = getNotificationType(v)
                    return (
                      <div key={v?._id || i} className={`ln-card ln-card-${type}`}>
                        <div className={`ln-card-indicator ln-indicator-${type}`} />
                        <div className='ln-card-body'>
                          <div className='ln-card-top-row'>
                            <span className={`ln-card-icon ln-icon-${type}`}>{getNotificationIcon(type)}</span>
                            <span className={`ln-card-type-label ln-type-${type}`}>
                              {type === 'trade' ? 'Trade' : type === 'alert' ? 'Alert' : 'Info'}
                            </span>
                            <span className='ln-card-time'><FiClock size={11} /> {moment(v?.createdAt).fromNow()}</span>
                          </div>
                          <h4 className='ln-card-title'>{v?.title || 'Notification'}</h4>
                          <p className='ln-card-message'>{v?.message}</p>
                          <div className='ln-card-actions'>
                            {v?.module === 'trade' && !v?.metadata?.isCancelled && !v?.metadata?.isApproved && (
                              <button
                                className='ln-btn ln-btn-primary'
                                onClick={() => navigate('/counter-trade', { state: { tradeId: v?.metadata?.tradeId?._id } })}
                              >
                                View Trade
                              </button>
                            )}
                            {v?.metadata?.isApproved && !v?.metadata?.isCancelled && (
                              <button
                                disabled={isPayButtonDis(v?.metadata?.tradeId) || payId === v?.metadata?.tradeId?._id}
                                className='ln-btn ln-btn-success'
                                onClick={() => handlePay(v?.metadata?.tradeId?._id)}
                              >
                                {isPayButtonDis(v?.metadata?.tradeId) ? 'Paid' : 'Pay'}
                              </button>
                            )}
                            <button
                              className='ln-btn ln-btn-ghost'
                              disabled={dismissingId === v?._id}
                              onClick={() => handleDismissNotification(v?._id)}
                            >
                              {dismissingId === v?._id ? '...' : 'Dismiss'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className='ln-empty'>
                    <FiBell size={40} />
                    <h3>No notifications</h3>
                    <p>{activeChip === 'all' ? "You're all caught up!" : `No ${activeChip} notifications right now`}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className='ln-side'>
            {/* League Activity */}
            <div className='ln-panel'>
              <div className='ln-panel-head'>
                <div className='ln-panel-title'><FiActivity size={16} /> League Activity</div>
                <span className='ln-live-pill'><span className='ln-live-dot' /> Live</span>
              </div>
              {activity.length === 0 ? (
                <div className='ln-ann-empty'>
                  <FiActivity size={28} />
                  <p>No recent activity yet</p>
                </div>
              ) : (
                <div className='ln-activity-list'>
                  {activity.map((ev, i) => {
                    const m = activityMeta(ev.category, ev.action)
                    return (
                      <div key={ev.id || i} className='ln-activity-item'>
                        <span className='ln-activity-icon' style={{ background: `${m.color}1f`, color: m.color }}>{m.icon}</span>
                        <div className='ln-activity-body'>
                          <div className='ln-activity-desc'>{ev.description}</div>
                          <div className='ln-activity-meta'>{ev.actorName} · {moment(ev.at).fromNow()}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {isCommissioner && (
                <button className='ln-viewlog-btn' onClick={() => navigate('/comissioner')}>
                  View Full Activity Log <FiArrowRight size={13} />
                </button>
              )}
            </div>

            {/* League Info */}
            <div className='ln-panel'>
              <div className='ln-panel-head'>
                <div className='ln-panel-title'>League Info</div>
              </div>
              <div className='ln-info-list'>
                {leagueInfo.map((row) => (
                  <div key={row.label} className='ln-info-row'>
                    <span className='ln-info-label'>{row.label}</span>
                    {row.pill ? (
                      <span className='ln-info-pill'>{row.value}</span>
                    ) : (
                      <span className='ln-info-value'>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeagueNotification
