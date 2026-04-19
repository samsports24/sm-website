import React, { useEffect, useState } from 'react'
import { Button, Input, notification, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import moment from 'moment'

import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import {
  clearNotification,
  getAllNotification,
  deleteReadNotifications,
  deleteNotification,
  postCommissionerAnnouncement,
  getCommissionerAnnouncements,
  deleteCommissionerAnnouncement,
} from '../redux/actions/notificationAction'
import { approveTrade, cancelTrade, payTrade } from '../redux/actions/teamTradeAction'

import {
  IoAlertCircleSharp,
  IoCheckmarkCircle,
  IoInformationCircle,
  IoMegaphoneOutline,
  IoTrashOutline,
  IoCloseCircle,
  IoSendSharp,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5'
import { FiClock, FiBell, FiAlertTriangle, FiMessageSquare, FiShield } from 'react-icons/fi'

const { TextArea } = Input

const LeagueNotification = () => {
  const SETTING = useSelector((state) => state?.user)
  const isCommissioner = SETTING?.userDetails?.isCommissioner
  const [notificationData, setNotificationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [payId, setPayId] = useState('')
  const [clearBtnLoading, setClearBtnLoading] = useState(false)
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set())
  const [dismissingId, setDismissingId] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Commissioner announcement state
  const [announcements, setAnnouncements] = useState([])
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [announcementPriority, setAnnouncementPriority] = useState('normal')
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)
  const [announcementsExpanded, setAnnouncementsExpanded] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
    loadAnnouncements()
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
      await loadAnnouncements()
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

  const getVisibleNotifications = () => {
    const all = notificationData?.data?.filter((n) => !dismissedNotifications.has(n._id)) || []
    if (activeTab === 'all') return all
    return all.filter((n) => getNotificationType(n) === activeTab)
  }

  const visibleNotifications = getVisibleNotifications()
  const allCount = notificationData?.data?.filter((n) => !dismissedNotifications.has(n._id))?.length || 0
  const tradeCount = notificationData?.data?.filter((n) => !dismissedNotifications.has(n._id) && n?.module === 'trade')?.length || 0
  const alertCount = notificationData?.data?.filter((n) => !dismissedNotifications.has(n._id) && n?.alert)?.length || 0

  return (
    <div className='practice_squad_container team_trade_main league_notification_container'>
      <Header />
      <ButtonsAndPagination />

      <div className='ln-page'>
        {/* ═══ Commissioner Announcements Section ═══ */}
        {(announcements.length > 0 || isCommissioner) && (
          <div className='ln-announcements'>
            <div className='ln-ann-header' onClick={() => setAnnouncementsExpanded(!announcementsExpanded)}>
              <div className='ln-ann-header-left'>
                <FiShield size={18} className='ln-ann-shield' />
                <h3>Commissioner Announcements</h3>
                {announcements.length > 0 && (
                  <span className='ln-ann-count'>{announcements.length}</span>
                )}
              </div>
              <div className='ln-ann-header-right'>
                {isCommissioner && (
                  <button
                    className='ln-ann-compose-btn'
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAnnouncementForm(!showAnnouncementForm)
                    }}
                  >
                    <IoMegaphoneOutline size={14} />
                    New Message
                  </button>
                )}
                {announcementsExpanded ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
              </div>
            </div>

            {/* Commissioner Compose Form */}
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
                        {sendingAnnouncement ? 'Sending...' : (
                          <>
                            <IoSendSharp size={13} />
                            Send to League
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements List */}
            {announcementsExpanded && announcements.length > 0 && (
              <div className='ln-ann-list'>
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className={`ln-ann-card ln-ann-card-${ann.priority || 'normal'}`}
                  >
                    <div className='ln-ann-card-top'>
                      <div className='ln-ann-card-badge'>
                        <FiShield size={12} />
                        Commissioner
                      </div>
                      {ann.priority === 'urgent' && (
                        <span className='ln-ann-urgent-tag'>URGENT</span>
                      )}
                      {ann.priority === 'important' && (
                        <span className='ln-ann-important-tag'>IMPORTANT</span>
                      )}
                      <span className='ln-ann-time'>
                        <FiClock size={11} />
                        {moment(ann.createdAt).fromNow()}
                      </span>
                      {isCommissioner && (
                        <button
                          className='ln-ann-delete-btn'
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                        >
                          <IoTrashOutline size={14} />
                        </button>
                      )}
                    </div>
                    <h4 className='ln-ann-card-title'>{ann.title}</h4>
                    <p className='ln-ann-card-message'>{ann.message}</p>
                  </div>
                ))}
              </div>
            )}

            {announcementsExpanded && announcements.length === 0 && !showAnnouncementForm && (
              <div className='ln-ann-empty'>
                <p>No announcements yet</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ Notifications Section ═══ */}
        <div className='ln-notifications'>
          <div className='ln-header'>
            <div className='ln-header-left'>
              <FiBell size={20} className='ln-header-icon' />
              <h2>Notifications</h2>
              {allCount > 0 && <span className='ln-count-badge'>{allCount}</span>}
            </div>
            {allCount > 0 && (
              <div className='ln-header-actions'>
                <Button
                  loading={clearBtnLoading}
                  className='ln-action-btn'
                  onClick={clearAllNotification}
                >
                  Mark All Read
                </Button>
                <Button
                  loading={clearBtnLoading}
                  className='ln-action-btn ln-action-btn-danger'
                  onClick={handleDeleteAllRead}
                >
                  Delete Read
                </Button>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className='ln-tabs'>
            <button
              className={`ln-tab ${activeTab === 'all' ? 'ln-tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All {allCount > 0 && <span className='ln-tab-count'>{allCount}</span>}
            </button>
            <button
              className={`ln-tab ${activeTab === 'trade' ? 'ln-tab-active' : ''}`}
              onClick={() => setActiveTab('trade')}
            >
              Trades {tradeCount > 0 && <span className='ln-tab-count'>{tradeCount}</span>}
            </button>
            <button
              className={`ln-tab ${activeTab === 'alert' ? 'ln-tab-active' : ''}`}
              onClick={() => setActiveTab('alert')}
            >
              Alerts {alertCount > 0 && <span className='ln-tab-count'>{alertCount}</span>}
            </button>
            <button
              className={`ln-tab ${activeTab === 'info' ? 'ln-tab-active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Info
            </button>
          </div>

          {/* Notifications list */}
          <div className='ln-list'>
            {isLoading ? (
              <Loader />
            ) : visibleNotifications.length > 0 ? (
              visibleNotifications.map((v, i) => {
                const type = getNotificationType(v)
                return (
                  <div key={i} className={`ln-card ln-card-${type}`}>
                    <div className={`ln-card-indicator ln-indicator-${type}`} />
                    <div className='ln-card-body'>
                      <div className='ln-card-top-row'>
                        <span className={`ln-card-icon ln-icon-${type}`}>
                          {getNotificationIcon(type)}
                        </span>
                        <span className={`ln-card-type-label ln-type-${type}`}>
                          {type === 'trade' ? 'Trade' : type === 'alert' ? 'Alert' : 'Info'}
                        </span>
                        <span className='ln-card-time'>
                          <FiClock size={11} />
                          {moment(v?.createdAt).fromNow()}
                        </span>
                      </div>
                      <h4 className='ln-card-title'>{v?.title || 'Notification'}</h4>
                      <p className='ln-card-message'>{v?.message}</p>
                      <div className='ln-card-actions'>
                        {v?.module === 'trade' &&
                          !v?.metadata?.isCancelled &&
                          !v?.metadata?.isApproved && (
                            <button
                              className='ln-btn ln-btn-primary'
                              onClick={() =>
                                navigate('/counter-trade', {
                                  state: { tradeId: v?.metadata?.tradeId?._id },
                                })
                              }
                            >
                              View Trade
                            </button>
                          )}
                        {v?.metadata?.isApproved && !v?.metadata?.isCancelled && (
                          <button
                            disabled={isPayButtonDis(v?.metadata?.tradeId)}
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
                <p>
                  {activeTab === 'all'
                    ? "You're all caught up!"
                    : `No ${activeTab} notifications right now`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeagueNotification
