import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Image, Input, notification, Tag, Spin, Empty } from 'antd'
import {
  SendOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ReloadOutlined,
  DollarOutlined,
  UserAddOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import Header from '../../components/Header'
import HeadingAndWeek from '../../components/Pagination/HeadingAndWeek'
import sampointslogo from '../../assets/samcoinlogo.png'
import { useDispatch, useSelector } from 'react-redux'
import {
  createClubhouse,
  getClubhouse,
  resendInvitation,
  setAllclubhouse,
} from '../../redux/actions/clubhouse'
import Loader from '../../components/Loader'
import ClubhouseModal from '../../components/modal/ClubhouseModal'

const Clubhouse = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state?.user?.userDetails)
  const clubhouse = useSelector((state) => state.clubhouse.clubhouse.Clubhouse)

  const [referralemail, setReferralemail] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnloading, setBtnLoading] = useState(false)
  const [invitationType, setInvitationType] = useState('')
  const [modalshow, setModalshow] = useState(false)

  useEffect(() => {
    const hasModalBeenShown = localStorage.getItem('modalShown')
    if (!hasModalBeenShown) {
      setModalshow(true)
      localStorage.setItem('modalShown', 'true')
    }
  }, [])

  const handleConfirm = async () => {
    setModalshow(false)
    localStorage.removeItem('modalShown')
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getClubhouse({
        season: user?.team?.currentLeague?.season,
        userId: user?._id,
        leagueId: user?.team?.currentLeague._id,
      })
      if (data) {
        dispatch(setAllclubhouse(data))
      }
      setLoading(false)
    }
    if (user) {
      fetchData()
    }
  }, [user])

  const handleInputChange = (e) => {
    setReferralemail(e.target.value)
  }

  const handleCheckboxChange = (type) => {
    if (invitationType === type) {
      setInvitationType(null)
    } else {
      setInvitationType(type)
    }
  }

  const handlecreatereferral = async () => {
    if (!invitationType) {
      notification.warning({ message: 'Please select a league type.', duration: 4 })
      return
    }
    setBtnLoading(true)
    try {
      const payload = {
        league: user?.team?.currentLeague._id,
        user: user?._id,
        emailsent: referralemail,
        season: user?.team?.currentLeague?.season,
        invitation_Type: invitationType,
      }
      await createClubhouse(payload)
      setReferralemail('')
      setInvitationType('')
    } catch (error) {
      console.error('Error making referral:', error)
    } finally {
      setBtnLoading(false)
    }
  }

  const getEarningValue = () => {
    return 2500000  // 2.5M per referral regardless of level
  }

  const handleRefreshClick = (email) => async () => {
    setLoading(true)
    try {
      if (!user?._id || !email) return
      await resendInvitation(email)
      const payload = { user: user?._id, emailsent: email }
      await resendInvitation(payload)
      setLoading(false)
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  const totalEarnings = clubhouse
    ?.filter((obj) => obj.isRegistered)
    .reduce((accumulator, obj) => {
      const points = obj.sampoints !== undefined ? obj.sampoints : getEarningValue(user?.referralLevel)
      return accumulator + points
    }, 0)

  const emailsSent = Array.isArray(clubhouse) ? clubhouse : []
  const registeredEmails = emailsSent.filter((item) => item?.isRegistered)
  const pendingEmails = emailsSent.filter((item) => !item?.isRegistered)

  // Referral level config
  const getLevelConfig = (level) => {
    switch (level) {
      case 'Private': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
      case 'Referral Level 1': return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
      case 'Referral Level 2': return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' }
      case 'Referral Level 3': return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' }
      case 'Public': return { color: '#a5b4fc', bg: 'rgba(165,180,252,0.12)', border: 'rgba(165,180,252,0.3)' }
      default: return { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(110,105,128,0.2)' }
    }
  }

  const levelCfg = getLevelConfig(user?.referralLevel)

  const getPointsDisplay = (item) => {
    if (item?.sampoints) return item.sampoints.toLocaleString()
    return '2,500,000'
  }

  return (
    <>
      <div className='clubhouse-main'>
        <Header />
        <HeadingAndWeek />
        <ClubhouseModal key={'modal'} visible={modalshow} onClose={handleConfirm} />

        <div className='ch-page'>
          {/* ── Page Header ── */}
          <div className='ch-page-header'>
            <div className='ch-page-header-left'>
              <h1 className='ch-title'>CLUBHOUSE</h1>
              <span className='ch-subtitle'>Invite friends, earn SAM Points</span>
            </div>
            <div className='ch-referral-badge' style={{ background: levelCfg.bg, borderColor: levelCfg.border }}>
              <CrownOutlined style={{ color: levelCfg.color, fontSize: 16 }} />
              <div className='ch-referral-badge-text'>
                <span className='ch-referral-badge-label'>Referral Level</span>
                <span className='ch-referral-badge-value' style={{ color: levelCfg.color }}>
                  {user?.referralLevel || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Invite Bar ── */}
          <div className='ch-invite-bar'>
            <div className='ch-invite-input-wrap'>
              <MailOutlined className='ch-invite-input-icon' />
              <Input
                placeholder='Enter email address...'
                value={referralemail}
                onChange={handleInputChange}
                className='ch-invite-input'
                onPressEnter={handlecreatereferral}
              />
            </div>
            <div className='ch-invite-types'>
              <div
                className={`ch-type-chip ${invitationType === 'Private' ? 'ch-type-chip-active' : ''}`}
                onClick={() => handleCheckboxChange('Private')}
              >
                <TrophyOutlined /> Private
              </div>
              <div
                className={`ch-type-chip ${invitationType === 'Public' ? 'ch-type-chip-active' : ''}`}
                onClick={() => handleCheckboxChange('Public')}
              >
                <UserAddOutlined /> Public
              </div>
            </div>
            <Button
              loading={btnloading}
              onClick={handlecreatereferral}
              className='ch-invite-btn'
              type='primary'
              icon={<SendOutlined />}
            >
              SEND INVITE
            </Button>

            {/* Social Sharing Buttons, include League ID in share text */}
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <button
                onClick={() => {
                  const lgId = user?.team?.currentLeague?.leagueId || user?.team?.currentLeague?.name || ''
                  const lgLabel = lgId ? ` League ID: ${lgId}.` : ''
                  const text = `Join me on SamSports A.Football!${lgLabel} The best fantasy football platform with SAM Metric scoring. Build your empire!`
                  const url = lgId ? `https://samsports.io/sign-up?league=${lgId}` : 'https://samsports.io'
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: '#000000', color: '#fff', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                X Share
              </button>
              <button
                onClick={() => {
                  const lgId = user?.team?.currentLeague?.leagueId || user?.team?.currentLeague?.name || ''
                  const lgLabel = lgId ? ` League ID: ${lgId}.` : ''
                  const text = `Join me on SamSports A.Football!${lgLabel} Build your fantasy football empire!`
                  const url = lgId ? `https://samsports.io/sign-up?league=${lgId}` : 'https://samsports.io'
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank')
                }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: '#1877F2', color: '#fff', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                Facebook
              </button>
              <button
                onClick={() => {
                  const lgId = user?.team?.currentLeague?.leagueId || user?.team?.currentLeague?.name || ''
                  const lgLabel = lgId ? ` League ID: ${lgId}.` : ''
                  const url = lgId ? `https://samsports.io/sign-up?league=${lgId}` : 'https://samsports.io'
                  const text = `Join me on SamSports A.Football!${lgLabel} ${url}`
                  navigator.clipboard.writeText(text)
                  notification.success({ message: 'Copied!', description: 'Invite link with League ID copied to clipboard!' })
                }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(110,105,128,0.3)',
                  background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className='ch-stats-row'>
            <div className='ch-stat-card'>
              <div className='ch-stat-icon-wrap ch-stat-icon-sent'>
                <MailOutlined />
              </div>
              <div className='ch-stat-info'>
                <span className='ch-stat-value'>{emailsSent.length}</span>
                <span className='ch-stat-label'>Invites Sent</span>
              </div>
            </div>
            <div className='ch-stat-card'>
              <div className='ch-stat-icon-wrap ch-stat-icon-reg'>
                <CheckCircleOutlined />
              </div>
              <div className='ch-stat-info'>
                <span className='ch-stat-value'>{registeredEmails.length}</span>
                <span className='ch-stat-label'>Registered</span>
              </div>
            </div>
            <div className='ch-stat-card'>
              <div className='ch-stat-icon-wrap ch-stat-icon-earn'>
                <DollarOutlined />
              </div>
              <div className='ch-stat-info'>
                <span className='ch-stat-value'>
                  <Image preview={false} width={20} src={sampointslogo} alt='sam' style={{ marginRight: 6 }} />
                  {totalEarnings?.toLocaleString() || '0'}
                </span>
                <span className='ch-stat-label'>Total Earnings</span>
              </div>
            </div>
          </div>

          {/* ── Content Panels ── */}
          {loading || btnloading ? (
            <Loader />
          ) : (
            <div className='ch-panels'>
              {/* Left Panel: Emails Sent */}
              <div className='ch-panel'>
                <div className='ch-panel-header'>
                  <MailOutlined className='ch-panel-header-icon' />
                  <span>INVITATIONS SENT</span>
                  <span className='ch-panel-count'>{emailsSent.length}</span>
                </div>
                <div className='ch-panel-body'>
                  {emailsSent.length > 0 ? (
                    emailsSent.map((item, index) => (
                      <div key={index} className='ch-email-row'>
                        <div className='ch-email-row-left'>
                          <span className='ch-email-num'>{index + 1}</span>
                          <div className='ch-email-info'>
                            <span className='ch-email-address'>{item.emailsent}</span>
                            <Tag
                              className='ch-email-type-tag'
                              style={{
                                background: item?.invitation_Type === 'Private'
                                  ? 'rgba(245,158,11,0.1)' : 'rgba(165,180,252,0.1)',
                                borderColor: item?.invitation_Type === 'Private'
                                  ? 'rgba(245,158,11,0.25)' : 'rgba(165,180,252,0.25)',
                                color: item?.invitation_Type === 'Private'
                                  ? '#f59e0b' : '#a5b4fc',
                              }}
                            >
                              {item?.invitation_Type?.charAt(0)?.toUpperCase()}
                            </Tag>
                          </div>
                        </div>
                        <div className='ch-email-row-right'>
                          {item.isRegistered ? (
                            <Tag
                              icon={<CheckCircleOutlined />}
                              style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.25)', color: '#22c55e', fontWeight: 700, fontSize: 10 }}
                            >
                              REGISTERED
                            </Tag>
                          ) : (
                            <>
                              <Tag style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 700, fontSize: 10 }}>
                                PENDING
                              </Tag>
                              <ReloadOutlined
                                className='ch-resend-icon'
                                onClick={handleRefreshClick(item.emailsent)}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='ch-panel-empty'>
                      <Empty
                        description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No invitations sent yet</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Successful Registrations */}
              <div className='ch-panel'>
                <div className='ch-panel-header ch-panel-header-success'>
                  <CheckCircleOutlined className='ch-panel-header-icon' />
                  <span>SUCCESSFUL REGISTRATIONS</span>
                  <span className='ch-panel-count'>{registeredEmails.length}</span>
                </div>
                <div className='ch-panel-body'>
                  {registeredEmails.length > 0 ? (
                    registeredEmails.map((item, index) => (
                      <div key={index} className='ch-reg-row'>
                        <div className='ch-reg-row-left'>
                          <span className='ch-email-num'>{index + 1}</span>
                          <span className='ch-email-address'>{item.emailsent}</span>
                        </div>
                        <div className='ch-reg-row-right'>
                          <Image preview={false} width={18} src={sampointslogo} alt='sam' />
                          <span className='ch-reg-points'>{getPointsDisplay(item)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='ch-panel-empty'>
                      <Empty
                        description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No registrations yet</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )}
                </div>

                {/* Total Earnings Footer */}
                <div className='ch-panel-footer'>
                  <span className='ch-footer-label'>TOTAL EARNINGS</span>
                  <div className='ch-footer-value'>
                    <Image preview={false} width={22} src={sampointslogo} alt='sam' />
                    <span>{totalEarnings?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Clubhouse
