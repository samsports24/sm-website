import React, { useEffect, useState } from 'react'
import { notification } from 'antd'
import { useLanguage } from '../../i18n/LanguageContext'
import logo from '../../assets/sam-football.png'
import { useNavigate } from 'react-router-dom'
import CreateLeague from '../../components/modal/CreateLeague'
import JoinLeagueModal from '../../components/modal/JoinLeagueModal'
import { useSelector } from 'react-redux'
import { getTeamSchedule } from '../../redux/actions/teamActions'
import LobbyMatchOfTheWeek from '../../components/MatchUpOfTheWeek/LobbyMatchOfTheWeek'
import VictoryShareCard from '../../components/VictoryShareCard'

const Lobby = () => {
  const { t } = useLanguage()
  const isAuthenticated = localStorage.getItem('token')
  const [data, setData] = useState([])
  const [victoryData, setVictoryData] = useState(null)
  const [showVictory, setShowVictory] = useState(false)
  const navigate = useNavigate()
  const isCommissioner = useSelector((state) => state.user?.userDetails?.isCommissioner)
  const week = useSelector((state) => state.user?.setting?.week)
  const weeknumber = useSelector((state) => state.user?.setting?.week)
  const league = useSelector((state) => state.user?.userDetails?.team?.currentLeague?.leagueType)
  const hasTeam = useSelector((state) => !!state.user?.userDetails?.team)
  const userTeam = useSelector((state) => state.user?.userDetails?.team)

  useEffect(() => {
    getData()
  }, [week])

  const getData = async () => {
    if (isAuthenticated) {
      const res = await getTeamSchedule({ teamFilter: '', week })
      setData(res)

      /* ── Tuesday 8 PM ET Victory Popup Check ── */
      const today = new Date()
      const etOptions = { timeZone: 'America/New_York', hour12: false }
      const etParts = new Intl.DateTimeFormat('en-US', { ...etOptions, weekday: 'short', hour: 'numeric' }).formatToParts(today)
      const etDay = etParts.find(p => p.type === 'weekday')?.value   // "Tue"
      const etHour = parseInt(etParts.find(p => p.type === 'hour')?.value, 10) // 0-23
      const isTuesday = etDay === 'Tue'
      const isAfter8pmET = etHour >= 20
      const weekKey = `${today.getFullYear()}-W${Math.ceil(((today - new Date(today.getFullYear(), 0, 1)) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)}`
      const shownKey = `victoryShown_nfl_${weekKey}`

      if (isTuesday && isAfter8pmET && !localStorage.getItem(shownKey) && Array.isArray(res) && res.length > 0) {
        // Look for the previous week's completed matchup
        const prevWeek = (week || 1) - 1
        const prevMatch = prevWeek > 0
          ? res.find(m => m.week === prevWeek)
          : res[res.length - 1] // fallback to last entry

        if (prevMatch) {
          const s1 = parseFloat(prevMatch.scoreOne) || 0
          const s2 = parseFloat(prevMatch.scoreTwo) || 0
          const userTeamId = userTeam?._id

          // Determine if user is opponentOne or opponentTwo
          const isTeamOne = (prevMatch.opponentOne?._id === userTeamId)
          const isTeamTwo = (prevMatch.opponentTwo?._id === userTeamId)
          const yourScore = isTeamOne ? s1 : isTeamTwo ? s2 : s1
          const oppScore = isTeamOne ? s2 : isTeamTwo ? s1 : s2

          if (yourScore > oppScore && yourScore > 0) {
            const yourName = isTeamOne
              ? (prevMatch.opponentOne?.name || userTeam?.name || 'My Team')
              : (prevMatch.opponentTwo?.name || userTeam?.name || 'My Team')
            const oppName = isTeamOne
              ? (prevMatch.opponentTwo?.name || 'Opponent')
              : (prevMatch.opponentOne?.name || 'Opponent')
            const record = prevMatch.record
            const myRecord = isTeamOne ? record?.teamOne : record?.teamTwo

            setVictoryData({
              yourTeam: yourName,
              opponent: oppName,
              yourScore: Math.round(yourScore * 10) / 10,
              oppScore: Math.round(oppScore * 10) / 10,
              matchweek: prevMatch.week || prevWeek,
              leagueName: league || 'Dynasty 32',
              record: myRecord ? `${myRecord.win ?? 0}-${myRecord.lose ?? 0}` : null,
              streak: null,
              mvp: null, // MVP requires game details, can be enhanced later
              sport: 'football',
            })
            setShowVictory(true)
            localStorage.setItem(shownKey, 'true')
          }
        }
      }
    }
  }

  // Requires login only
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      notification.error({ message: t('pleaseLoginFirst'), duration: 3 })
      return
    }
    callback()
  }

  // Requires login + active league/team
  const requireLeague = (callback) => {
    if (!isAuthenticated) {
      notification.error({ message: t('pleaseLoginFirst'), duration: 3 })
      return
    }
    if (!league && !hasTeam) {
      notification.warning({ message: t('joinLeagueFirst'), duration: 3 })
      navigate('/onboarding')
      return
    }
    callback()
  }

  // Is this card locked? (no login OR no league)
  const isLocked = !isAuthenticated || (!league && !hasTeam)

  return (
    <div className="lby-container">
      {/* Hero Banner */}
      <div className="lby-hero">
        <div className="lby-hero-glow" />
        <div className="lby-hero-content">
          <span className="lby-hero-badge">{t('heroBadge')}</span>
          <h1 className="lby-hero-title">{t('heroTitle')}</h1>
          <p className="lby-hero-sub">{t('heroSub')}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="lby-grid">
        {/* Featured Card - Current League */}
        <div
          className="lby-card lby-card-featured"
          onClick={() => requireAuth(() => league ? navigate('/my-league') : navigate('/onboarding'))}
        >
          <div className="lby-card-bg lby-bg-featured" />
          <div className="lby-card-content">
            <span className="lby-card-icon">&#127942;</span>
            {league ? (
              <>
                <div className="lby-card-label">{t('currentLeague')}</div>
                <div className="lby-card-title">{league}</div>
                <div className="lby-card-desc">{t('viewLeagueMatchups')}</div>
                <div className="lby-card-action">{t('enterLeague')}</div>
              </>
            ) : (
              <>
                <div className="lby-card-title">{t('getStarted')}</div>
                <div className="lby-card-desc">{t('getStartedDesc')}</div>
                <div className="lby-card-action">{t('findLeague')}</div>
              </>
            )}
          </div>
          {!isAuthenticated && <div className="lby-lock-badge">&#128274; {t('loginRequired')}</div>}
        </div>

        {/* Create League, only requires login */}
        <div className="lby-card lby-card-create" style={{ position: 'relative' }}>
          {!isAuthenticated && (
            <div
              className="lby-overlay"
              onClick={() => notification.error({ message: t('pleaseLoginFirst'), duration: 3 })}
            />
          )}
          <CreateLeague
            button={
              <div className="lby-card-inner">
                <div className="lby-card-bg lby-bg-create" />
                <div className="lby-card-content">
                  <span className="lby-card-icon">&#10133;</span>
                  <div className="lby-card-title">{t('createLeague')}</div>
                  <div className="lby-card-desc">{t('createLeagueDesc')}</div>
                </div>
              </div>
            }
            isCommissioner={isCommissioner}
          />
          {!isAuthenticated && <div className="lby-lock-badge">&#128274; {t('loginRequired')}</div>}
        </div>

        {/* Join League, only requires login */}
        <div className="lby-card lby-card-create" style={{ position: 'relative' }}>
          {!isAuthenticated && (
            <div
              className="lby-overlay"
              onClick={() => notification.error({ message: t('pleaseLoginFirst'), duration: 3 })}
            />
          )}
          <JoinLeagueModal
            button={
              <div className="lby-card-inner">
                <div className="lby-card-bg lby-bg-popular" />
                <div className="lby-card-content">
                  <span className="lby-card-icon">&#128270;</span>
                  <div className="lby-card-title">{t('joinLeague')}</div>
                  <div className="lby-card-desc">{t('joinLeagueDesc')}</div>
                </div>
              </div>
            }
          />
          {!isAuthenticated && <div className="lby-lock-badge">&#128274; {t('loginRequired')}</div>}
        </div>

        {/* My Leagues, requires login + league */}
        <div
          className="lby-card lby-card-myleagues"
          onClick={() => requireLeague(() => navigate('/my-league'))}
        >
          <div className="lby-card-bg lby-bg-myleagues" />
          <div className="lby-card-content">
            <span className="lby-card-icon">&#127941;</span>
            <div className="lby-card-title">{t('myLeagues')}</div>
            <div className="lby-card-desc">{t('manageLeaguesDesc')}</div>
          </div>
          {isLocked && (
            <div className="lby-lock-badge">
              &#128274; {!isAuthenticated ? t('loginRequired') : t('joinLeagueFirst')}
            </div>
          )}
        </div>

        {/* Roster, requires login + league */}
        <RosterCard isAuthenticated={isAuthenticated} league={league} hasTeam={hasTeam} requireLeague={requireLeague} isLocked={isLocked} />

        {/* GM Challenge, requires login + league */}
        <div
          className="lby-card lby-card-gm"
          onClick={() => requireLeague(() => navigate('/gm-challenge'))}
        >
          <div className="lby-card-bg lby-bg-gm" />
          <div className="lby-card-content">
            <span className="lby-card-icon">&#127775;</span>
            <div className="lby-card-title">{t('gmChallenge')}</div>
            <div className="lby-card-desc">
              {t('gmChallengeDesc')}
            </div>
            <div className="lby-card-badge-pill lby-card-badge-pill--live">{t('viewRankings')}</div>
          </div>
          {isLocked && (
            <div className="lby-lock-badge">
              &#128274; {!isAuthenticated ? t('loginRequired') : t('joinLeagueFirst')}
            </div>
          )}
        </div>

        {/* Front Office, requires login + league */}
        <div
          className="lby-card lby-card-warroom"
          onClick={() => requireLeague(() => navigate('/war-room'))}
        >
          <div className="lby-card-bg lby-bg-warroom" />
          <div className="lby-card-content">
            <span className="lby-card-icon">&#128640;</span>
            <div className="lby-card-title">{t('frontOffice')}</div>
            <div className="lby-card-desc">
              {t('frontOfficeSubtitle')}
            </div>
            <div className="lby-card-action">{t('enterFrontOffice')}</div>
          </div>
          {isLocked && (
            <div className="lby-lock-badge">
              &#128274; {!isAuthenticated ? t('loginRequired') : t('joinLeagueFirst')}
            </div>
          )}
        </div>

        {/* Match of the Week, requires login + league */}
        <div
          className="lby-card lby-card-motw"
          onClick={() => requireLeague(() => {})}
        >
          <div className="lby-card-bg lby-bg-motw" />
          <div className="lby-card-content">
            <span className="lby-card-icon">&#127944;</span>
            <div className="lby-card-title">
              {isAuthenticated && week ? `${t('weekN')} ${week}` : t('matchOfTheWeek')}
            </div>
            {isAuthenticated && league && week && data?.length > 0 ? (
              data.filter((item) => item.week === weeknumber).length > 0 ? (
                <LobbyMatchOfTheWeek key={0} data={{ ...data[data.length - 1] }} />
              ) : (
                <div className="lby-card-desc">{t('offSeason')}</div>
              )
            ) : (
              <div className="lby-card-desc">{t('followProTeam')}</div>
            )}
          </div>
          {isLocked && (
            <div className="lby-lock-badge">
              &#128274; {!isAuthenticated ? t('loginRequired') : t('joinLeagueFirst')}
            </div>
          )}
        </div>
      </div>

      {/* ═══ VICTORY SHARE POPUP, Shown on Tuesdays after a win ═══ */}
      <VictoryShareCard
        open={showVictory}
        onClose={() => setShowVictory(false)}
        data={victoryData}
      />
    </div>
  )
}

const RosterCard = ({ isAuthenticated, league, hasTeam, requireLeague, isLocked }) => {
  const { t } = useLanguage()
  const USER = useSelector((state) => state.user?.userDetails?.team)
  const navigate = useNavigate()

  return (
    <div
      className="lby-card lby-card-roster"
      onClick={() => requireLeague(() => navigate('/player-roster'))}
    >
      <div className="lby-card-bg lby-bg-roster" />
      <div className="lby-card-content">
        <span className="lby-card-icon">&#128101;</span>
        {USER ? (
          <>
            <div className="lby-card-label">{USER?.name}</div>
            <div className="lby-card-title">{t('myRoster')}</div>
            {USER?.logo && (
              <img src={USER.logo} alt="" className="lby-roster-logo" onError={(e) => { e.target.style.display = 'none' }} />
            )}
          </>
        ) : (
          <>
            <div className="lby-card-title">{t('roster')}</div>
            <div className="lby-card-desc">{t('buildTeamDesc')}</div>
          </>
        )}
      </div>
      {isLocked && (
        <div className="lby-lock-badge">
          &#128274; {!isAuthenticated ? t('loginRequired') : t('joinLeagueFirst')}
        </div>
      )}
    </div>
  )
}

export default Lobby
