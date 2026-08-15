import React, { useEffect, useState } from 'react'
import { notification } from 'antd'
import { FiCalendar, FiZap, FiRepeat, FiShare } from 'react-icons/fi'
import { FaBalanceScale, FaBandAid } from 'react-icons/fa'
import { useLanguage } from '../../i18n/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CreateLeague from '../../components/modal/CreateLeague'
import JoinLeagueModal from '../../components/modal/JoinLeagueModal'
import { getTeamSchedule } from '../../redux/actions/teamActions'
import VictoryShareCard from '../../components/VictoryShareCard'
import TeamLogo from '../../components/TeamLogo'
import HERO_BG from '../../assets/home-hero.png'
import EARN_BANNER from '../../assets/earn-sampoints.png'
import MATCH_EMPTY from '../../assets/match-empty.png'
import MYLEAGUES_BADGE from '../../assets/my-leagues.png'
import FRONTOFFICE_BADGE from '../../assets/front-office.png'
import MOCKDRAFT_BADGE from '../../assets/mock-draft.png'
import MARKETPLACE_BADGE from '../../assets/marketplace.png'
import MYROSTER_BADGE from '../../assets/my-roster.png'
import CREATE_LEAGUE_BADGE from '../../assets/create-league.png'
import JOIN_LEAGUE_BADGE from '../../assets/join-league.png'
import TRANSACTIONS_BADGE from '../../assets/transactions.png'
import CURRENT_FULL from '../../assets/current-full.png'
import CREATE_FULL from '../../assets/create-full.png'
import JOIN_FULL from '../../assets/join-full.png'
import MYLEAGUES_FULL from '../../assets/my-leagues-full.png'
import ROSTER_FULL from '../../assets/roster-full.png'
import FRONTOFFICE_FULL from '../../assets/front-office-full.png'
import MOCKDRAFT_FULL from '../../assets/mock-draft-full.png'
import MARKETPLACE_FULL from '../../assets/marketplace-full.png'
import QUICK_KTC from '../../assets/quick-ktc.png'
import QUICK_INJURY from '../../assets/quick-injury.png'
import QUICK_TXNS from '../../assets/quick-txns.png'
import KTC_BADGE from '../../assets/keep-trade-cut.png'
import INJURY_BADGE from '../../assets/injury-report.png'
import { privateAPI, attachToken } from '../../config/constants'

/* SAM Sports Home — a clean launcher (not an analytics dashboard).
   Hero "Continue Season" CTA, a grid of navigation cards, and a right rail
   with notifications + daily reward. Auth-gating and league checks preserved. */

// Real NFL team → ESPN public logo, so opponents like "Detroit Lions" show a
// crest instead of a letter when the schedule payload has no logo url.
const NFL_ABBR = {
  'arizona cardinals': 'ari', 'atlanta falcons': 'atl', 'baltimore ravens': 'bal',
  'buffalo bills': 'buf', 'carolina panthers': 'car', 'chicago bears': 'chi',
  'cincinnati bengals': 'cin', 'cleveland browns': 'cle', 'dallas cowboys': 'dal',
  'denver broncos': 'den', 'detroit lions': 'det', 'green bay packers': 'gb',
  'houston texans': 'hou', 'indianapolis colts': 'ind', 'jacksonville jaguars': 'jax',
  'kansas city chiefs': 'kc', 'los angeles chargers': 'lac', 'los angeles rams': 'lar',
  'las vegas raiders': 'lv', 'miami dolphins': 'mia', 'minnesota vikings': 'min',
  'new england patriots': 'ne', 'new orleans saints': 'no', 'new york giants': 'nyg',
  'new york jets': 'nyj', 'philadelphia eagles': 'phi', 'pittsburgh steelers': 'pit',
  'seattle seahawks': 'sea', 'san francisco 49ers': 'sf', 'tampa bay buccaneers': 'tb',
  'tennessee titans': 'ten', 'washington commanders': 'wsh',
}
const nflLogo = (name) => {
  const a = NFL_ABBR[String(name || '').trim().toLowerCase()]
  return a ? `https://a.espncdn.com/i/teamlogos/nfl/500/${a}.png` : null
}

const Lobby = () => {
  const { t } = useLanguage()
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [victoryData, setVictoryData] = useState(null)
  const [showVictory, setShowVictory] = useState(false)
  // ── Daily reward (real: /daily-reward) ──
  const [reward, setReward] = useState(null) // { canClaim, amount, streak, nextResetAt }
  const [claiming, setClaiming] = useState(false)
  const [resetLabel, setResetLabel] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    let alive = true
    ;(async () => {
      try {
        attachToken()
        const { data: d } = await privateAPI.get('/daily-reward/status')
        if (alive) setReward(d?.data || null)
      } catch (e) { /* leave null */ }
    })()
    return () => { alive = false }
  }, [isAuthenticated])

  // Live countdown to the next reset.
  useEffect(() => {
    if (!reward?.nextResetAt) { setResetLabel(''); return }
    const tick = () => {
      const ms = new Date(reward.nextResetAt).getTime() - Date.now()
      if (ms <= 0) { setResetLabel('now'); return }
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      setResetLabel(`${h}h ${m}m`)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [reward?.nextResetAt])

  const claimDaily = async () => {
    if (claiming || !reward?.canClaim) return
    setClaiming(true)
    try {
      attachToken()
      const { data: d } = await privateAPI.post('/daily-reward/claim')
      const r = d?.data || {}
      if (r.claimed) {
        const amt = (r.amount || 0).toLocaleString()
        notification.success({ message: `Daily reward claimed! +${amt} SP`, description: r.streak > 1 ? `${r.streak}-day streak 🔥` : undefined, duration: 4 })
        setReward((prev) => ({ ...(prev || {}), canClaim: false, streak: r.streak, nextResetAt: r.nextResetAt }))
      } else {
        notification.info({ message: r.message || 'Already claimed today.', duration: 3 })
        setReward((prev) => ({ ...(prev || {}), canClaim: false }))
      }
    } catch (e) {
      notification.error({ message: e?.response?.data?.message || 'Could not claim reward.', duration: 3 })
    } finally {
      setClaiming(false)
    }
  }

  const isCommissioner = useSelector((state) => state.user?.userDetails?.isCommissioner)
  const week = useSelector((state) => state.user?.setting?.week)
  const league = useSelector((state) => state.user?.userDetails?.team?.currentLeague?.leagueType)
  const hasTeam = useSelector((state) => !!state.user?.userDetails?.team)
  const userTeam = useSelector((state) => state.user?.userDetails?.team)
  const userName = useSelector((state) => state.user?.userDetails?.userName || state.user?.userDetails?.name)

  useEffect(() => { getData() }, [week])

  const getData = async () => {
    if (!isAuthenticated) return
    const res = await getTeamSchedule({ teamFilter: '', week })
    setData(res)

    /* ── Tuesday 8 PM ET Victory Popup Check ── */
    const today = new Date()
    const etParts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour12: false, weekday: 'short', hour: 'numeric' }).formatToParts(today)
    const etDay = etParts.find((p) => p.type === 'weekday')?.value
    const etHour = parseInt(etParts.find((p) => p.type === 'hour')?.value, 10)
    const weekKey = `${today.getFullYear()}-W${Math.ceil(((today - new Date(today.getFullYear(), 0, 1)) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)}`
    const shownKey = `victoryShown_nfl_${weekKey}`

    if (etDay === 'Tue' && etHour >= 20 && !localStorage.getItem(shownKey) && Array.isArray(res) && res.length > 0) {
      const prevWeek = (week || 1) - 1
      const prevMatch = prevWeek > 0 ? res.find((m) => m.week === prevWeek) : res[res.length - 1]
      if (prevMatch) {
        const s1 = parseFloat(prevMatch.scoreOne) || 0
        const s2 = parseFloat(prevMatch.scoreTwo) || 0
        const userTeamId = userTeam?._id
        const isTeamOne = prevMatch.opponentOne?._id === userTeamId
        const isTeamTwo = prevMatch.opponentTwo?._id === userTeamId
        const yourScore = isTeamOne ? s1 : isTeamTwo ? s2 : s1
        const oppScore = isTeamOne ? s2 : isTeamTwo ? s1 : s2
        if (yourScore > oppScore && yourScore > 0) {
          const record = prevMatch.record
          const myRecord = isTeamOne ? record?.teamOne : record?.teamTwo
          setVictoryData({
            yourTeam: (isTeamOne ? prevMatch.opponentOne?.name : prevMatch.opponentTwo?.name) || userTeam?.name || 'My Team',
            opponent: (isTeamOne ? prevMatch.opponentTwo?.name : prevMatch.opponentOne?.name) || 'Opponent',
            yourScore: Math.round(yourScore * 10) / 10,
            oppScore: Math.round(oppScore * 10) / 10,
            matchweek: prevMatch.week || prevWeek,
            leagueName: league || 'Dynasty 32',
            record: myRecord ? `${myRecord.win ?? 0}-${myRecord.lose ?? 0}` : null,
            sport: 'football',
          })
          setShowVictory(true)
          localStorage.setItem(shownKey, 'true')
        }
      }
    }
  }

  const requireAuth = (cb) => {
    if (!isAuthenticated) { notification.error({ message: t('pleaseLoginFirst'), duration: 3 }); return }
    cb()
  }
  const requireLeague = (cb) => {
    if (!isAuthenticated) { notification.error({ message: t('pleaseLoginFirst'), duration: 3 }); return }
    if (!league && !hasTeam) { notification.warning({ message: t('joinLeagueFirst'), duration: 3 }); navigate('/onboarding'); return }
    cb()
  }
  const isLocked = !isAuthenticated || (!league && !hasTeam)
  const lockNode = isLocked ? (
    <div className="lby2-lock">&#128274; {!isAuthenticated ? t('loginRequired') : t('joinLeagueFirst')}</div>
  ) : null

  // ── Navigation cards (launcher). Create/Join open modals. ──
  // Current League badge: the commissioner-uploaded league logo if there is one,
  // otherwise the SamSports brand logo.
  const SAM_LOGO = `${process.env.PUBLIC_URL || ''}/samsports-logo.svg`
  const currentLeagueLogo = userTeam?.currentLeague?.leagueLogo || userTeam?.currentLeague?.leagueImage || userTeam?.currentLeague?.logo || null
  const cards = [
    { key: 'current', accent: 'green', img: currentLeagueLogo || SAM_LOGO, fullArt: CURRENT_FULL, icon: '\u{1F6E1}\u{FE0F}', title: t('currentLeague'), desc: 'Continue managing your league', onClick: () => requireAuth(() => (league ? navigate('/my-league') : navigate('/onboarding'))), locked: !isAuthenticated },
    { key: 'create', accent: 'green', badgeImg: CREATE_LEAGUE_BADGE, fullArt: CREATE_FULL, icon: '\u{2795}', title: t('createLeague'), desc: 'Start your own league and invite friends', modal: 'create' },
    { key: 'join', accent: 'blue', badgeImg: JOIN_LEAGUE_BADGE, fullArt: JOIN_FULL, icon: '\u{1F465}', title: t('joinLeague'), desc: 'Find and join an existing league', modal: 'join' },
    { key: 'myleagues', accent: 'gold', badgeImg: MYLEAGUES_BADGE, fullArt: MYLEAGUES_FULL, icon: '\u{1F3C6}', title: t('myLeagues'), desc: 'View and manage your leagues', onClick: () => requireLeague(() => navigate('/my-league')), locked: isLocked },
    { key: 'roster', accent: 'green', badgeImg: MYROSTER_BADGE, fullArt: ROSTER_FULL, icon: '\u{1F3C8}', title: t('myRoster'), desc: 'Manage your team and lineup', onClick: () => requireLeague(() => navigate('/player-roster')), locked: isLocked },
    { key: 'frontoffice', accent: 'gold', badgeImg: FRONTOFFICE_BADGE, fullArt: FRONTOFFICE_FULL, icon: '\u{1F4BC}', title: t('frontOffice'), desc: 'Manage your organization, staff and finances', onClick: () => requireLeague(() => navigate('/front-office')), locked: isLocked },
    { key: 'marketplace', accent: 'red', badgeImg: MARKETPLACE_BADGE, fullArt: MARKETPLACE_FULL, icon: '\u{1F501}', title: 'Marketplace', desc: 'Trade players, make offers and negotiate', onClick: () => requireLeague(() => navigate('/player-auction')), locked: isLocked },
    { key: 'mockdraft', accent: 'teal', badgeImg: MOCKDRAFT_BADGE, fullArt: MOCKDRAFT_FULL, icon: '\u{1F4CB}', title: 'Mock Draft', desc: 'Practice your draft strategy before the real draft.', onClick: () => requireAuth(() => navigate('/mock-draft')), locked: !isAuthenticated },
  ]

  // Is the user actually in a league? Drives whether we show season/match state.
  const hasLeague = !!league || !!userTeam?.currentLeague

  // ── Upcoming match — only from a REAL scheduled game for a user in a league.
  //    No placeholder teams/dates: a new user with no league sees no match card.
  const matches = Array.isArray(data) ? data : []
  const match = hasLeague ? (matches.find((m) => m.week === week) || matches[matches.length - 1] || null) : null
  const home = match ? {
    name: match?.opponentOne?.name || userTeam?.name || 'Home',
    logo: match?.opponentOne?.logo || userTeam?.logo || nflLogo(match?.opponentOne?.name || userTeam?.name || ''),
    record: match?.record?.teamOne ? `${match.record.teamOne.win ?? 0} - ${match.record.teamOne.draw ?? 0} - ${match.record.teamOne.lose ?? 0}` : '0 - 0 - 0',
  } : null
  const away = match ? {
    name: match?.opponentTwo?.name || 'Opponent',
    logo: match?.opponentTwo?.logo || nflLogo(match?.opponentTwo?.name || ''),
    record: match?.record?.teamTwo ? `${match.record.teamTwo.win ?? 0} - ${match.record.teamTwo.draw ?? 0} - ${match.record.teamTwo.lose ?? 0}` : '0 - 0 - 0',
  } : null
  const matchMeta = match?.matchDate
    ? new Date(match.matchDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : ''

  // ── Notifications — real only. No fabricated trade/vote entries.
  const notifs = []

  const quickActions = [
    { key: 'ktc', accent: 'green', icon: FaBalanceScale, badgeImg: KTC_BADGE, banner: QUICK_KTC, title: t('keepTradeCut'), desc: 'Manage your roster moves', onClick: () => navigate('/values') },
    { key: 'injury', accent: 'red', icon: FaBandAid, badgeImg: INJURY_BADGE, banner: QUICK_INJURY, title: t('injuryReport'), desc: 'View player injury updates', onClick: () => navigate('/injury-report') },
    { key: 'txns', accent: 'teal', icon: FiRepeat, badgeImg: TRANSACTIONS_BADGE, banner: QUICK_TXNS, title: t('transactions'), desc: 'View recent league activity', onClick: () => requireLeague(() => navigate('/all-transaction')) },
  ]

  // Native share of the current page (no-op where unsupported).
  const handleShare = () => {
    try {
      if (navigator.share) navigator.share({ url: window.location.href }).catch(() => {})
    } catch (e) { /* no-op */ }
  }

  return (
    <div className="lby2">
      <div className="lby2-main">
        {/* Hero */}
        <section className="lby2-hero">
          <img src={HERO_BG} alt="" className="lby2-hero-img" onError={(e) => { e.target.style.display = 'none' }} />
          <div className="lby2-hero-inner">
            <span className="lby2-eyebrow">{hasLeague ? t('welcomeBack') : 'Welcome'}{userName ? `, ${userName}` : ''}</span>
            <h1 className="lby2-hero-title">{hasLeague ? <>Continue where<br />you left off</> : <>Let&#39;s get you<br />in the game</>}</h1>
            <button className="lby2-cta" onClick={() => (hasLeague ? navigate('/my-league') : navigate('/onboarding'))}>
              {hasLeague ? 'Continue Season' : 'Get Started'} <span aria-hidden>&#8594;</span>
            </button>
          </div>
        </section>

        {/* Navigation cards */}
        <section className="lby2-cards">
          {cards.map((c) => {
            const inner = c.fullArt ? (
              <div className={`lby2-card lby2-card--art lby2-${c.accent}`}>
                {c.locked && lockNode}
                <img src={c.fullArt} alt={c.title} className="lby2-card-fullimg" />
              </div>
            ) : (
              <div className={`lby2-card lby2-${c.accent}`}>
                {c.locked && lockNode}
                <div className="lby2-card-badge">
                  {c.badgeImg
                    ? <img src={c.badgeImg} alt="" className="lby2-card-badge-fill" />
                    : c.img
                      ? <img src={c.img} alt="" className="lby2-card-logo" onError={(e) => { e.target.onerror = null; e.target.src = SAM_LOGO }} />
                      : <span className="lby2-card-icon" aria-hidden>{c.icon}</span>}
                </div>
                <div className="lby2-card-title">{c.title}</div>
                <div className="lby2-card-desc">{c.desc}</div>
                <span className="lby2-card-arrow" aria-hidden>&#8594;</span>
              </div>
            )
            if (c.modal === 'create') {
              return (
                <div key={c.key} className="lby2-card-wrap">
                  {!isAuthenticated && <div className="lby2-overlay" onClick={() => notification.error({ message: t('pleaseLoginFirst'), duration: 3 })} />}
                  <CreateLeague button={inner} isCommissioner={isCommissioner} />
                </div>
              )
            }
            if (c.modal === 'join') {
              return (
                <div key={c.key} className="lby2-card-wrap">
                  {!isAuthenticated && <div className="lby2-overlay" onClick={() => notification.error({ message: t('pleaseLoginFirst'), duration: 3 })} />}
                  <JoinLeagueModal button={inner} />
                </div>
              )
            }
            return <button key={c.key} className="lby2-card-wrap" onClick={c.onClick}>{inner}</button>
          })}
        </section>

        {/* Bottom: upcoming match + quick actions */}
        <section className="lby2-bottom">
          <div className="lby2-match">
            <div className="lby2-match-head">
              <FiCalendar className="lby2-week-ico" aria-hidden />
              <span className="lby2-week">{week ? `Week ${week}` : 'Preseason'}</span>
              <span className="lby2-head-div" aria-hidden />
              <span className="lby2-match-label">Upcoming Match</span>
            </div>
            {match ? (
              <>
                <div className="lby2-match-body">
                  <div className="lby2-team">
                    <TeamLogo src={home.logo} name={home.name} size={58} round={false} className="lby2-team-logo" />
                    <div className="lby2-team-name">{home.name}</div>
                    <div className="lby2-team-rec">{home.record}</div>
                  </div>
                  <div className="lby2-vs">
                    <span>VS</span>
                    {matchMeta && <span className="lby2-match-meta">{matchMeta}</span>}
                    {match?.venue && <span className="lby2-match-venue">{match.venue}</span>}
                  </div>
                  <div className="lby2-team">
                    <TeamLogo src={away.logo} name={away.name} size={58} round={false} className="lby2-team-logo" />
                    <div className="lby2-team-name">{away.name}</div>
                    <div className="lby2-team-rec">{away.record}</div>
                  </div>
                </div>
                <button className="lby2-match-btn" onClick={() => requireLeague(() => navigate('/my-league'))}>View Matchup <span aria-hidden>&#8594;</span></button>
              </>
            ) : (
              <div className="lby2-match-empty">
                <img src={MATCH_EMPTY} alt="" className="lby2-empty-art-img" onError={(e) => { e.target.style.display = 'none' }} />
                <div className="lby2-empty-title">{hasLeague ? 'No Upcoming Match Scheduled Yet' : 'No League Yet'}</div>
                <div className="lby2-empty-sub">{hasLeague ? 'Check back later for your next match.' : 'Join or create a league to see your matchups.'}</div>
              </div>
            )}
            <div className="lby2-match-foot">
              <button className="lby2-edit" onClick={() => requireLeague(() => navigate('/depth-chart'))}>Edit</button>
            </div>
          </div>

          <div className="lby2-quick">
            <div className="lby2-quick-head">
              <FiZap className="lby2-quick-ico-zap" aria-hidden />
              <span className="lby2-panel-title">Quick Actions</span>
            </div>
            <div className="lby2-quick-underline" aria-hidden />
            {quickActions.map((q) => {
              const Icon = q.icon
              if (q.banner) {
                return (
                  <button
                    key={q.key}
                    className="lby2-quick-banner"
                    onClick={q.onClick}
                    aria-label={q.title}
                    style={{ padding: 0, border: 'none', background: 'transparent', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', display: 'block', width: '100%', lineHeight: 0, marginBottom: 10 }}
                  >
                    <img src={q.banner} alt={q.title} style={{ display: 'block', width: '100%', height: 'auto' }} />
                  </button>
                )
              }
              return (
                <button key={q.key} className={`lby2-quick-row lby2-${q.accent}`} onClick={q.onClick}>
                  <span className="lby2-quick-badge" aria-hidden>
                    {q.badgeImg
                      ? <img src={q.badgeImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none' }} />
                      : <Icon />}
                  </span>
                  <span className="lby2-quick-tt">
                    <span className="lby2-quick-title">{q.title}</span>
                    <span className="lby2-quick-desc">{q.desc}</span>
                  </span>
                  <span className="lby2-quick-chev" aria-hidden>&#8250;</span>
                </button>
              )
            })}
            <div className="lby2-quick-foot">
              <button className="lby2-share" onClick={handleShare} aria-label="Share"><FiShare aria-hidden /></button>
            </div>
          </div>
        </section>
      </div>

      {/* Right rail */}
      <aside className="lby2-rail">
        <div className="lby2-panel">
          <div className="lby2-panel-head">
            <span className="lby2-panel-title">{t('notifications')}</span>
            <button className="lby2-viewall" onClick={() => navigate('/clubhouse')}>View All</button>
          </div>
          {notifs.map((n, i) => (
            <div key={i} className="lby2-notif">
              <span className={`lby2-notif-icon lby2-${n.accent}`} aria-hidden>{n.icon}</span>
              <div className="lby2-notif-body">
                <div className="lby2-notif-title">{n.title}</div>
                <div className="lby2-notif-desc">{n.desc}</div>
              </div>
              <div className="lby2-notif-meta">
                {n.unread && <span className={`lby2-dot lby2-${n.accent}`} />}
                <span className="lby2-notif-time">{n.time}</span>
              </div>
            </div>
          ))}
          {notifs.length === 0 && (
            <div className="lby2-notif-empty" style={{ padding: '18px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              No new notifications.
            </div>
          )}
        </div>

        <div className="lby2-panel lby2-reward">
          <div className="lby2-panel-head">
            <span className="lby2-panel-title">Daily Reward</span>
            {resetLabel && <span className="lby2-reward-reset">Resets in {resetLabel}</span>}
          </div>
          <img src={EARN_BANNER} alt="Earn SamPoints" className="lby2-reward-banner" onError={(e) => { e.target.style.display = 'none' }} />
          <div className="lby2-reward-text">
            {reward?.canClaim
              ? <>Claim <b>+{(reward?.amount || 0).toLocaleString()} SP</b> today!{reward?.streak > 0 ? <><br />{reward.streak}-day streak 🔥</> : null}</>
              : <>Come back tomorrow<br />for more SP!</>}
          </div>
          <button
            className="lby2-reward-btn"
            disabled={!reward?.canClaim || claiming}
            style={(!reward?.canClaim || claiming) ? { opacity: 0.5, cursor: 'default' } : {}}
            onClick={() => requireAuth(claimDaily)}
          >
            {claiming ? 'Claiming…' : reward?.canClaim ? 'Claim Reward' : 'Claimed ✓'}
          </button>
        </div>
      </aside>

      <VictoryShareCard open={showVictory} onClose={() => setShowVictory(false)} data={victoryData} />
    </div>
  )
}

export default Lobby
