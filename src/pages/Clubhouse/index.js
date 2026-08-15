import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Button, Image, Input, notification, Tag, Empty, Tooltip, Modal } from 'antd'
import {
  SendOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ReloadOutlined,
  DollarOutlined,
  LinkOutlined,
  CopyOutlined,
  CheckOutlined,
  GiftOutlined,
  TrophyOutlined,
  LockOutlined,
  StarOutlined,
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  HourglassOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Header from '../../components/Header'
import HeadingAndWeek from '../../components/Pagination/HeadingAndWeek'
import sampointslogo from '../../assets/samcoinlogo.png'
import { useDispatch, useSelector } from 'react-redux'
import {
  createClubhouse,
  getClubhouse,
  resendInvitation,
  setAllclubhouse,
  getClubhouseOverview,
  getClubhouseLeaderboard,
  claimClubhouseRewards,
} from '../../redux/actions/clubhouse'
import { getUser } from '../../redux/actions/authActions'
import { getUserLeagues } from '../../redux/actions/leagueActions'
import ClubhouseModal from '../../components/modal/ClubhouseModal'
import '../../styles/pages/clubhouse.css'

dayjs.extend(relativeTime)

/* ── Count-up hook for animated numbers ── */
const useCountUp = (target, duration = 900) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const end = Number(target) || 0
    if (end <= 0) {
      setVal(0)
      return
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(eased * end))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setVal(end)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

const fmt = (n) => (Number(n) || 0).toLocaleString()

const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('') || '?'

const Clubhouse = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state?.user?.userDetails)
  const clubhouse = useSelector((state) => state.clubhouse.clubhouse.Clubhouse)

  const [referralemail, setReferralemail] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnloading, setBtnLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedRefCode, setCopiedRefCode] = useState(false)

  // ── New real-data endpoints ──
  const [overview, setOverview] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState(null)
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  // ── Invitation history table controls ──
  const [historySearch, setHistorySearch] = useState('')
  const [historyFilter, setHistoryFilter] = useState('All')
  const historyRef = useRef(null)

  // ── Per-league invite: the user picks WHICH league they are inviting to ──
  // The invite code/link/email payload are ALL derived from the chosen league,
  // so two leagues produce two distinct invites (bug fix: it used to always read
  // the single fixed team.currentLeague). Leagues come from the league reducer
  // slice populated by GET_USER_LEAGUES (getUserLeagues → /league/get-by-user-id).
  const userLeagues = useSelector((state) => state?.league?.userLeagues)
  const leagueList = useMemo(
    () => (Array.isArray(userLeagues) ? userLeagues.filter((l) => l && l._id) : []),
    [userLeagues],
  )

  // Make sure the league list is loaded — the selector reads straight from it.
  useEffect(() => {
    if (user) getUserLeagues()
  }, [user])

  const [selectedLeagueId, setSelectedLeagueId] = useState(null)

  // Default to the user's ACTIVE league if it's in their list, otherwise the
  // first league. Keeps a valid selection whenever the list arrives/changes.
  useEffect(() => {
    if (!leagueList.length) return
    const activeId = user?.team?.currentLeague?._id
    const hasActive = activeId && leagueList.some((l) => String(l._id) === String(activeId))
    setSelectedLeagueId((prev) => {
      if (prev && leagueList.some((l) => String(l._id) === String(prev))) return prev
      return hasActive ? activeId : leagueList[0]._id
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueList, user])

  // The chosen league drives every invite value below.
  const selectedLeague = useMemo(
    () => leagueList.find((l) => String(l._id) === String(selectedLeagueId)) || null,
    [leagueList, selectedLeagueId],
  )
  const hasLeagues = leagueList.length > 0

  // Auto-set invite type from the chosen league's visibility — no extra click.
  const invitationType = (selectedLeague?.isPublic === false || String(selectedLeague?.leagueType).toLowerCase() === 'private') ? 'Private' : 'Public'
  const [modalshow, setModalshow] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

  // ── Per-league join code + signup link (distinct per league) ──
  const lgId = selectedLeague?.leagueId || ''
  const inviteCode = lgId // the league's short JOIN CODE = the invite code
  // Carry the referrer's code on the shared join link so a NEW user who signs
  // up through it credits the referrer (JoinByCode stashes ?ref into
  // localStorage 'samsports_ref', which the register-time path forwards).
  const inviteLink = lgId
    ? `https://samsports.io/join/${lgId}${overview?.referralCode ? '?ref=' + encodeURIComponent(overview.referralCode) : ''}`
    : 'https://samsports.io'

  // ── Personal referral code (rewards program) — shown as a secondary line ──
  const referralCode = overview?.referralCode || ''
  const referralLink = inviteLink

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

  // Fetch legacy invitation records (used by history table). Keyed to the
  // SELECTED league so the history matches whichever league is chosen.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getClubhouse({
        season: selectedLeague?.season,
        userId: user?._id,
        leagueId: selectedLeague?._id,
      })
      if (data) {
        dispatch(setAllclubhouse(data))
      }
      setLoading(false)
    }
    if (user && selectedLeague?._id) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedLeague])

  // Fetch new referral overview + leaderboard
  const loadOverview = async () => {
    setOverviewLoading(true)
    const data = await getClubhouseOverview()
    if (data && data.success !== false) setOverview(data)
    setOverviewLoading(false)
  }

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true)
    const data = await getClubhouseLeaderboard('month')
    if (data && data.success !== false) setLeaderboard(data)
    setLeaderboardLoading(false)
  }

  // Credit any milestone / challenge rewards the user has newly earned. Safe to
  // call every load — the server pays each reward at most once. If anything was
  // credited, refresh the overview + the user's wallet so the balance updates.
  const claimRewards = async () => {
    const res = await claimClubhouseRewards()
    if (res && res.success && res.totalCredited > 0) {
      notification.success({
        message: 'Referral reward credited!',
        description: `You earned ${res.totalCredited.toLocaleString()} SamPoints from referral rewards.`,
        duration: 5,
      })
      await loadOverview()
      dispatch(getUser())
    }
  }

  useEffect(() => {
    if (user) {
      loadOverview()
      loadLeaderboard()
      claimRewards()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleInputChange = (e) => {
    setReferralemail(e.target.value)
  }

  const handlecreatereferral = async () => {
    if (!referralemail) {
      notification.warning({ message: 'Please enter an email address.', duration: 4 })
      return
    }
    if (!selectedLeague?._id) {
      notification.warning({ message: 'Please select a league to invite to.', duration: 4 })
      return
    }
    setBtnLoading(true)
    try {
      const payload = {
        league: selectedLeague?._id,
        user: user?._id,
        emailsent: referralemail,
        season: selectedLeague?.season,
        invitation_Type: invitationType,
      }
      await createClubhouse(payload)
      setReferralemail('')
      // Refresh records + real stats after a successful invite
      const data = await getClubhouse({
        season: selectedLeague?.season,
        userId: user?._id,
        leagueId: selectedLeague?._id,
      })
      if (data) dispatch(setAllclubhouse(data))
      loadOverview()
    } catch (error) {
      console.error('Error making referral:', error)
    } finally {
      setBtnLoading(false)
    }
  }

  const handleRefreshClick = (email) => async () => {
    try {
      if (!user?._id || !email) return
      const payload = { user: user?._id, emailsent: email }
      await resendInvitation(payload)
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  // ── Clipboard helpers (reused for the link + code copy buttons) ──
  const copyText = async (text, setFlag) => {
    try {
      await navigator.clipboard.writeText(text || '')
      setFlag(true)
      notification.success({ message: 'Copied!', description: 'Copied to clipboard.', duration: 2 })
      setTimeout(() => setFlag(false), 2000)
    } catch (e) {
      notification.error({ message: 'Could not copy', duration: 2 })
    }
  }
  const handleCopyLink = () => copyText(inviteLink, setCopied)
  const handleCopyCode = () => copyText(inviteCode, setCopiedCode)
  const handleCopyRefCode = () => copyText(referralCode, setCopiedRefCode)

  // ── Client-side share handlers (preserved from previous page) ──
  const shareText = (() => {
    const lgLabel = lgId ? ` League ID: ${lgId}.` : ''
    return `Join me on SamSports A.Football!${lgLabel} Build your fantasy football empire!`
  })()

  const handleShareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`,
      '_blank',
    )
  }
  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`,
      '_blank',
    )
  }

  // ── Referral level pill (purple, hidden when null) ──
  const referralLevel = overview?.referralLevel ?? null
  const referralLevelLabel =
    referralLevel == null
      ? null
      : typeof referralLevel === 'number' || /^\d+$/.test(String(referralLevel))
      ? `Referral Level ${referralLevel}`
      : String(referralLevel)

  // ── Derived real values ──
  const stats = overview?.stats || {
    invitesSent: 0,
    registered: 0,
    activeManagers: 0,
    pending: 0,
    pendingSP: 0,
    totalSP: 0,
  }
  const trends = stats.trends || {}
  const milestones = Array.isArray(overview?.milestones) ? overview.milestones : []
  const nextMilestone = overview?.nextMilestone || null
  const currentProgress = Number(overview?.currentProgress) || 0
  const badges = Array.isArray(overview?.badges) ? overview.badges : []
  const challenge = overview?.challenge || null
  const activity = Array.isArray(overview?.activity) ? overview.activity : []

  const totalSPCount = useCountUp(stats.totalSP)

  // First not-yet-unlocked milestone = the "current" node
  const currentMsIdx = milestones.findIndex((m) => !m.unlocked)

  // ── Invitation history (from real legacy records) ──
  const records = Array.isArray(clubhouse) ? clubhouse : []

  const matchesFilter = (item) => {
    if (historyFilter === 'All') return true
    if (historyFilter === 'Registered') return !!item?.isRegistered
    const s = (item?.status || '').toLowerCase()
    if (historyFilter === 'Pending') return !item?.isRegistered && (s === 'pending' || s === '')
    if (historyFilter === 'Expired') return s === 'expired'
    if (historyFilter === 'Cancelled') return s === 'cancelled' || s === 'canceled'
    return true
  }

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase()
    return records.filter((item) => {
      if (q && !(item?.emailsent || '').toLowerCase().includes(q)) return false
      return matchesFilter(item)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, historySearch, historyFilter])

  const statusMeta = (item) => {
    if (item?.isRegistered) return { label: 'Registered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', bd: 'rgba(34,197,94,0.3)' }
    const s = (item?.status || '').toLowerCase()
    if (s === 'expired') return { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', bd: 'rgba(239,68,68,0.3)' }
    if (s === 'cancelled' || s === 'canceled') return { label: 'Cancelled', color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)', bd: 'rgba(110,105,128,0.3)' }
    return { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', bd: 'rgba(245,158,11,0.3)' }
  }

  // ── Leaderboard rows (append `me` if not present in top list) ──
  const lbPlayers = Array.isArray(leaderboard?.players) ? leaderboard.players : []
  const lbMe = leaderboard?.me || null
  const meInList = lbPlayers.some((p) => p?.isCurrentUser)

  const HOW_STEPS = [
    { icon: <MailOutlined />, title: 'Invite', desc: 'Share your link or email a friend.' },
    { icon: <UserAddOutlined />, title: 'Register', desc: 'They create a SamSports account.' },
    { icon: <ThunderboltOutlined />, title: 'Play', desc: 'They join a league and play.' },
    { icon: <DollarOutlined />, title: 'Earn', desc: 'You unlock SamPoints rewards.' },
  ]

  // small helper: render a stat trend pill (green up / red down); omit when 0
  const renderTrend = (t) => {
    const v = Number(t)
    if (!v) return null
    const up = v > 0
    return (
      <span className={`ch-stat-trend ${up ? '' : 'is-down'}`}>
        {up ? <RiseOutlined /> : <FallOutlined />}
        {Math.abs(v)}% vs last 30 days
      </span>
    )
  }

  const statCards = [
    { key: 'sent', icon: <MailOutlined />, cls: 'ch-stat-icon-sent', value: stats.invitesSent, label: 'Invitations Sent', trend: trends.invitesSent },
    { key: 'reg', icon: <TeamOutlined />, cls: 'ch-stat-icon-reg', value: stats.registered, label: 'Registered Users', trend: trends.registered },
    { key: 'active', icon: <UserOutlined />, cls: 'ch-stat-icon-active', value: stats.activeManagers, label: 'Active Managers', trend: trends.activeManagers },
    { key: 'sp', icon: <DollarOutlined />, cls: 'ch-stat-icon-earn', value: stats.totalSP, label: 'Total SP Earned', trend: trends.totalSP, sp: true },
    { key: 'pending', icon: <HourglassOutlined />, cls: 'ch-stat-icon-pending', value: stats.pendingSP, label: 'Pending SP', info: true },
  ]

  return (
    <>
      <div className='clubhouse-main'>
        <Header />
        <HeadingAndWeek week={false} />
        <ClubhouseModal key={'modal'} visible={modalshow} onClose={handleConfirm} />

        <Modal
          open={faqOpen}
          onCancel={() => setFaqOpen(false)}
          footer={null}
          centered
          width={560}
          title='Clubhouse FAQ'
        >
          <div className='ch-faq-empty'>
            <InfoCircleOutlined className='ch-faq-empty-icon' />
            <span className='ch-faq-empty-title'>No FAQs yet</span>
            <span className='ch-faq-empty-sub'>
              Frequently asked questions about referrals and rewards will appear here soon.
            </span>
          </div>
        </Modal>

        <div className='ch-page'>
          {/* ═══ 1. HEADER ═══ */}
          <div className='ch-hero'>
            <div className='ch-hero-left'>
              <h1 className='ch-title'>CLUBHOUSE</h1>
              <span className='ch-subtitle'>Invite friends, grow the game, earn SamPoints.</span>
            </div>
            {referralLevelLabel && (
              <div className='ch-level-pill'>
                <CrownOutlined className='ch-level-pill-icon' />
                <div className='ch-level-pill-text'>
                  <span className='ch-level-pill-label'>Referral Level</span>
                  <span className='ch-level-pill-value'>{referralLevelLabel}</span>
                </div>
              </div>
            )}
          </div>

          {/* ═══ 2. TOP CARDS ROW ═══ */}
          <div className='ch-top-cards'>
            {/* a. Per-league invite code */}
            <div className='ch-card ch-card-code'>
              <div className='ch-card-head'>
                <LinkOutlined className='ch-card-head-icon' />
                <span>LEAGUE INVITE CODE</span>
              </div>

              {/* League selector — picks which league this invite is for. */}
              {hasLeagues ? (
                <div className='ch-league-select-wrap'>
                  <TrophyOutlined className='ch-league-select-icon' />
                  <select
                    className='ch-league-select'
                    value={selectedLeagueId || ''}
                    onChange={(e) => setSelectedLeagueId(e.target.value)}
                    disabled={leagueList.length <= 1}
                    aria-label='Choose which league to invite to'
                  >
                    {leagueList.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name || l.leagueId}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className='ch-card-hint'>Join or create a league to invite players.</p>
              )}

              <div className='ch-code-row'>
                <span className='ch-code-value'>{inviteCode || '—'}</span>
                <button
                  className='ch-icon-btn'
                  onClick={handleCopyCode}
                  disabled={!hasLeagues}
                  aria-label='Copy league invite code'
                >
                  {copiedCode ? <CheckOutlined /> : <CopyOutlined />}
                </button>
              </div>
              <p className='ch-card-hint'>Share this league code and earn SamPoints!</p>
              <div className='ch-linkbox'>
                <input className='ch-linkbox-input' value={inviteLink} readOnly aria-label='League invite link' />
                <button
                  className='ch-icon-btn ch-linkbox-copy'
                  onClick={handleCopyLink}
                  disabled={!hasLeagues}
                  aria-label='Copy league invite link'
                >
                  {copied ? <CheckOutlined /> : <CopyOutlined />}
                </button>
              </div>

              {/* Personal referral code (rewards program) — secondary line. */}
              {referralCode ? (
                <div className='ch-refcode-row'>
                  <span className='ch-refcode-label'>Your referral code</span>
                  <span className='ch-refcode-value'>{referralCode}</span>
                  <button
                    className='ch-refcode-copy'
                    onClick={handleCopyRefCode}
                    aria-label='Copy your personal referral code'
                  >
                    {copiedRefCode ? <CheckOutlined /> : <CopyOutlined />}
                  </button>
                </div>
              ) : null}
            </div>

            {/* b. Next reward */}
            <div className='ch-card ch-card-reward'>
              <div className='ch-card-head'>
                <GiftOutlined className='ch-card-head-icon ch-gold-icon' />
                <span>
                  NEXT REWARD
                  {nextMilestone && (
                    <>
                      : <span className='ch-gold'>{fmt(nextMilestone.rewardSP)} SP</span>
                    </>
                  )}
                </span>
              </div>
              {overviewLoading ? (
                <div className='ch-skel ch-skel-lines'>
                  <div className='ch-skel-line' />
                  <div className='ch-skel-line ch-skel-line-sm' />
                </div>
              ) : nextMilestone ? (
                <div className='ch-reward-main'>
                  <div className='ch-reward-left'>
                    <p className='ch-reward-text'>
                      Refer <strong>{Math.max(nextMilestone.remaining, 0)}</strong> more{' '}
                      {nextMilestone.remaining === 1 ? 'friend' : 'friends'} to unlock
                    </p>
                    <div className='ch-progress'>
                      <div
                        className='ch-progress-fill'
                        style={{
                          width: `${Math.min(
                            100,
                            nextMilestone.threshold ? (currentProgress / nextMilestone.threshold) * 100 : 0,
                          )}%`,
                        }}
                      />
                    </div>
                    <div className='ch-progress-meta'>
                      <span>
                        {currentProgress} / {nextMilestone.threshold}
                      </span>
                    </div>
                  </div>
                  <div className='ch-reward-badge'>
                    <Image preview={false} width={22} src={sampointslogo} alt='SP' />
                    <span className='ch-reward-badge-num'>{fmt(nextMilestone.rewardSP)}</span>
                    <span className='ch-reward-badge-cap'>SP</span>
                  </div>
                </div>
              ) : (
                <div className='ch-reward-done'>
                  <TrophyOutlined className='ch-gold-icon' style={{ fontSize: 22 }} />
                  <span>All milestones unlocked</span>
                </div>
              )}
            </div>

            {/* c. Total earned SP */}
            <div className='ch-card ch-card-total'>
              <div className='ch-card-head'>
                <DollarOutlined className='ch-card-head-icon ch-green-icon' />
                <span>TOTAL EARNED SP</span>
              </div>
              {overviewLoading ? (
                <div className='ch-skel ch-skel-big' />
              ) : (
                <div className='ch-total-value'>
                  <Image preview={false} width={30} src={sampointslogo} alt='SP' />
                  <span>{fmt(totalSPCount)}</span>
                </div>
              )}
              <span className='ch-total-label'>SamPoints earned from referrals</span>
              <div className='ch-total-motif' aria-hidden>
                <Image preview={false} width={88} src={sampointslogo} alt='' />
              </div>
            </div>
          </div>

          {/* ═══ 3. QUICK INVITE PANEL ═══ */}
          <div className='ch-quick-invite'>
            <div className='ch-quick-left'>
              <h3 className='ch-quick-title'>QUICK INVITE</h3>
              <span className='ch-quick-sub'>
                {hasLeagues
                  ? `Inviting to: ${selectedLeague?.name || selectedLeague?.leagueId || '—'}`
                  : 'Join or create a league to invite players.'}
              </span>
            </div>
            <div className='ch-quick-right'>
              <div className='ch-quick-email-row'>
                <div className='ch-invite-input-wrap'>
                  <MailOutlined className='ch-invite-input-icon' />
                  <Input
                    placeholder={hasLeagues ? 'Enter email address...' : 'Join a league to invite players'}
                    value={referralemail}
                    onChange={handleInputChange}
                    className='ch-invite-input'
                    onPressEnter={handlecreatereferral}
                    disabled={!hasLeagues}
                    aria-label='Friend email address'
                  />
                </div>
                <Button
                  loading={btnloading}
                  onClick={handlecreatereferral}
                  className='ch-invite-btn'
                  type='primary'
                  disabled={!hasLeagues}
                  icon={<SendOutlined />}
                >
                  SEND INVITE
                </Button>
              </div>
              <div className='ch-share-row'>
                <span className='ch-share-label'>OR SHARE VIA</span>
                <button className='ch-share-btn ch-share-x' onClick={handleShareX} aria-label='Share on X'>
                  𝕏
                </button>
                <button className='ch-share-btn ch-share-fb' onClick={handleShareFacebook} aria-label='Share on Facebook'>
                  f
                </button>
                <button className='ch-share-btn ch-share-copy' onClick={handleCopyLink} aria-label='Copy referral link'>
                  {copied ? <CheckOutlined /> : <LinkOutlined />}
                  <span>COPY LINK</span>
                </button>
              </div>
            </div>
          </div>

          {/* ═══ 4. FIVE STAT CARDS ═══ */}
          <div className='ch-stats-row'>
            {statCards.map((s) => (
              <div className='ch-stat-card' key={s.key}>
                {s.trend ? renderTrend(s.trend) : null}
                {s.info && (
                  <Tooltip title='SamPoints that will be credited once pending invites register.'>
                    <span className='ch-stat-info-btn' aria-label='About pending SP'>
                      <InfoCircleOutlined />
                    </span>
                  </Tooltip>
                )}
                <div className={`ch-stat-icon-wrap ${s.cls}`}>{s.icon}</div>
                <div className='ch-stat-info'>
                  {overviewLoading ? (
                    <div className='ch-skel ch-skel-stat' />
                  ) : (
                    <span className='ch-stat-value'>
                      {s.sp && <Image preview={false} width={18} src={sampointslogo} alt='SP' style={{ marginRight: 6 }} />}
                      {fmt(s.value)}
                    </span>
                  )}
                  <span className='ch-stat-label'>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ═══ 5. THREE-COLUMN DASHBOARD ═══ */}
          <div className='ch-dash-grid'>
            {/* ── LEFT COLUMN ── */}
            <div className='ch-dash-col'>
              {/* Referral progress */}
              <div className='ch-panel'>
                <div className='ch-panel-head'>
                  <span className='ch-panel-title'>
                    <RiseOutlined className='ch-panel-icon' /> REFERRAL PROGRESS
                  </span>
                </div>
                {overviewLoading ? (
                  <div className='ch-skel ch-skel-row' />
                ) : milestones.length > 0 ? (
                  <div className='ch-mstrack'>
                    {milestones.map((m, i) => {
                      const isCurrent = i === currentMsIdx
                      const state = m.unlocked ? 'is-unlocked' : isCurrent ? 'is-current' : 'is-locked'
                      return (
                        <div className={`ch-mnode ${state}`} key={m.threshold}>
                          <div className='ch-mnode-circle'>
                            {m.unlocked ? <CheckOutlined /> : isCurrent ? <GiftOutlined /> : <LockOutlined />}
                          </div>
                          <span className='ch-mnode-thresh'>
                            {m.threshold} {m.threshold === 1 ? 'Friend' : 'Friends'}
                          </span>
                          <span className='ch-mnode-reward'>{fmt(m.rewardSP)} SP</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Empty description={<span className='ch-empty-txt'>No milestones available</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>

              {/* Referral challenge */}
              {!overviewLoading && challenge && challenge.supported && (
                <div className='ch-panel ch-challenge'>
                  <div className='ch-panel-head'>
                    <span className='ch-panel-title'>
                      <ThunderboltOutlined className='ch-panel-icon ch-purple-icon' /> REFERRAL CHALLENGE
                    </span>
                    <span className='ch-tag-weekly'>WEEKLY</span>
                  </div>
                  <div className='ch-challenge-body'>
                    <div className='ch-challenge-left'>
                      <p className='ch-challenge-text'>
                        Invite <strong>{challenge.target}</strong> {challenge.target === 1 ? 'friend' : 'friends'} this week and earn{' '}
                        <strong className='ch-gold'>{fmt(challenge.rewardSP)} SP</strong>!
                      </p>
                      <div className='ch-progress'>
                        <div
                          className='ch-progress-fill ch-progress-purple'
                          style={{ width: `${Math.min(100, challenge.target ? (challenge.progress / challenge.target) * 100 : 0)}%` }}
                        />
                      </div>
                      <div className='ch-progress-meta'>
                        <span className='ch-purple-txt'>
                          {challenge.progress} / {challenge.target}
                        </span>
                      </div>
                    </div>
                    <div className='ch-challenge-reward-box'>
                      <div className='ch-reward-badge ch-reward-badge-sm'>
                        <Image preview={false} width={18} src={sampointslogo} alt='SP' />
                        <span className='ch-reward-badge-num'>{fmt(challenge.rewardSP)}</span>
                      </div>
                      <span className='ch-challenge-reward-cap'>REWARD</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── MIDDLE COLUMN ── */}
            <div className='ch-dash-col'>
              <div className='ch-panel ch-panel-fill'>
                <div className='ch-panel-head'>
                  <span className='ch-panel-title'>
                    <ThunderboltOutlined className='ch-panel-icon' /> REFERRAL ACTIVITY
                  </span>
                  <button className='ch-viewall' type='button'>VIEW ALL</button>
                </div>
                {overviewLoading ? (
                  <div className='ch-skel ch-skel-row' />
                ) : activity.length > 0 ? (
                  <>
                    <div className='ch-timeline2'>
                      {activity.map((a, i) => {
                        const isSp = !!a.sp
                        const iconCls = isSp ? 'is-sp' : a.type === 'registered' ? 'is-reg' : 'is-sent'
                        const icon = isSp ? <DollarOutlined /> : a.type === 'registered' ? <CheckCircleOutlined /> : <MailOutlined />
                        const text = isSp
                          ? `You earned ${fmt(a.sp)} SP`
                          : a.type === 'registered'
                          ? `${a.name || a.email || 'A new member'} joined your league`
                          : a.email
                          ? `Invitation sent to ${a.email}`
                          : 'New referral'
                        return (
                          <div className='ch-tl-row' key={i}>
                            <div className={`ch-tl-icon ${iconCls}`}>{icon}</div>
                            <div className='ch-tl-body'>
                              <span className='ch-tl-text'>{text}</span>
                            </div>
                            <span className='ch-tl-time'>{a.at ? dayjs(a.at).fromNow() : ''}</span>
                          </div>
                        )
                      })}
                    </div>
                    <button
                      className='ch-viewhistory-btn'
                      type='button'
                      onClick={() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      VIEW FULL HISTORY
                    </button>
                  </>
                ) : (
                  <Empty description={<span className='ch-empty-txt'>No activity yet</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className='ch-dash-col'>
              {/* Leaderboard */}
              <div className='ch-panel'>
                <div className='ch-panel-head'>
                  <span className='ch-panel-title'>
                    <TrophyOutlined className='ch-panel-icon ch-gold-icon' /> TOP REFERRERS THIS MONTH
                  </span>
                  <button className='ch-viewall' type='button'>VIEW ALL</button>
                </div>
                {leaderboardLoading ? (
                  <div className='ch-skel ch-skel-row' />
                ) : lbPlayers.length > 0 ? (
                  <div className='ch-lb'>
                    {lbPlayers.map((p) => {
                      const medal = p.rank === 1 ? 'is-gold' : p.rank === 2 ? 'is-silver' : p.rank === 3 ? 'is-bronze' : ''
                      return (
                        <div className={`ch-lb-row ${p.isCurrentUser ? 'is-me' : ''}`} key={p.userId || p.rank}>
                          {p.rank <= 3 ? (
                            <span className={`ch-lb-medal ${medal}`}>{p.rank}</span>
                          ) : (
                            <span className='ch-lb-rank'>{p.rank}</span>
                          )}
                          <div className='ch-lb-avatar'>
                            {p.avatar ? <img src={p.avatar} alt={p.name} /> : <span>{initialsOf(p.name)}</span>}
                          </div>
                          <div className='ch-lb-info'>
                            <span className='ch-lb-name'>{p.isCurrentUser ? 'You' : p.name}</span>
                            <span className='ch-lb-refs'>{fmt(p.referrals)} Referrals</span>
                          </div>
                          <span className='ch-lb-sp'>
                            <Image preview={false} width={14} src={sampointslogo} alt='SP' />
                            {fmt(p.sp)}
                          </span>
                        </div>
                      )
                    })}
                    {!meInList && lbMe && (
                      <div className='ch-lb-row is-me ch-lb-me-appended'>
                        <span className='ch-lb-rank'>{lbMe.rank}</span>
                        <div className='ch-lb-avatar'>
                          <span>{initialsOf(user?.name || 'You')}</span>
                        </div>
                        <div className='ch-lb-info'>
                          <span className='ch-lb-name'>You</span>
                          <span className='ch-lb-refs'>{fmt(lbMe.referrals)} Referrals</span>
                        </div>
                        <span className='ch-lb-sp'>
                          <Image preview={false} width={14} src={sampointslogo} alt='SP' />
                          {fmt(lbMe.sp)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty description={<span className='ch-empty-txt'>No referrers yet this month</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>

              {/* How it works */}
              <div className='ch-panel'>
                <div className='ch-panel-head'>
                  <span className='ch-panel-title'>
                    <GiftOutlined className='ch-panel-icon' /> HOW IT WORKS
                  </span>
                  <button className='ch-viewall' type='button' onClick={() => setFaqOpen(true)}>VIEW FAQ</button>
                </div>
                <div className='ch-how'>
                  {HOW_STEPS.map((s, i) => (
                    <div className='ch-how-step' key={s.title}>
                      <div className='ch-how-icon'>{s.icon}</div>
                      <span className='ch-how-title'>
                        {i + 1}. {s.title}
                      </span>
                      <span className='ch-how-desc'>{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 6. ACHIEVEMENT BADGES + INVITATION HISTORY (bottom row) ═══ */}
          <div className='ch-bottom-row'>
            {/* Achievement badges */}
            <div className='ch-panel ch-bottom-badges'>
              <div className='ch-panel-head'>
                <span className='ch-panel-title'>
                  <StarOutlined className='ch-panel-icon ch-gold-icon' /> ACHIEVEMENT BADGES
                </span>
                <button className='ch-viewall' type='button'>VIEW ALL</button>
              </div>
              {overviewLoading ? (
                <div className='ch-skel ch-skel-row' />
              ) : badges.length > 0 ? (
                <div className='ch-badges'>
                  {badges.map((b) => (
                    <div className={`ch-badgewrap ${b.unlocked ? 'is-unlocked' : 'is-locked'}`} key={b.key}>
                      <div className='ch-hex'>
                        <div className='ch-hex-inner'>{b.unlocked ? <StarOutlined /> : <LockOutlined />}</div>
                      </div>
                      <span className='ch-badge-label'>{b.label}</span>
                      <span className='ch-badge-req'>{b.requirement}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description={<span className='ch-empty-txt'>No badges available</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>

            {/* Invitation history */}
            <div className='ch-section ch-bottom-history' ref={historyRef}>
            <div className='ch-section-head'>
              <MailOutlined className='ch-section-icon' />
              <span>INVITATION HISTORY</span>
              <span className='ch-section-count'>{records.length}</span>
            </div>

            <div className='ch-history-controls'>
              <div className='ch-history-search'>
                <SearchOutlined className='ch-history-search-icon' />
                <Input
                  placeholder='Search by email...'
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className='ch-history-search-input'
                  aria-label='Search invitations by email'
                />
              </div>
              <div className='ch-history-chips' role='group' aria-label='Filter invitations'>
                {['All', 'Pending', 'Registered', 'Expired', 'Cancelled'].map((f) => (
                  <button
                    key={f}
                    className={`ch-chip ${historyFilter === f ? 'is-active' : ''}`}
                    onClick={() => setHistoryFilter(f)}
                    aria-pressed={historyFilter === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className='ch-skel ch-skel-row' />
            ) : filteredHistory.length > 0 ? (
              <div className='ch-table-scroll'>
                <table className='ch-table'>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Invited</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th>Reward</th>
                      <th aria-label='Actions'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, idx) => {
                      const sm = statusMeta(item)
                      return (
                        <tr key={item._id || idx}>
                          <td className='ch-td-email'>{item.emailsent}</td>
                          <td>{item.sentAt ? dayjs(item.sentAt).format('MMM D, YYYY') : '—'}</td>
                          <td>{item.acceptedAt ? dayjs(item.acceptedAt).format('MMM D, YYYY') : '—'}</td>
                          <td>
                            <Tag style={{ background: sm.bg, borderColor: sm.bd, color: sm.color, fontWeight: 700, fontSize: 10, borderRadius: 6 }}>
                              {sm.label.toUpperCase()}
                            </Tag>
                          </td>
                          <td className='ch-td-reward'>{item.sampoints ? `${fmt(item.sampoints)} SP` : '—'}</td>
                          <td>
                            {!item.isRegistered && (
                              <button
                                className='ch-resend-btn'
                                onClick={handleRefreshClick(item.emailsent)}
                                aria-label={`Resend invitation to ${item.emailsent}`}
                                title='Resend invitation'
                              >
                                <ReloadOutlined />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                description={<span className='ch-empty-txt'>{records.length === 0 ? 'No invitations sent yet' : 'No invitations match your filter'}</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Clubhouse
