import { notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getUserLeagues, selectLeague, joinLeague } from '../redux'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../i18n/LanguageContext'
import Logo from '../assets/sam-football.png'
import moment from 'moment'
import JoinLeague from '../components/modal/JoinLeague'
import EditLeague from '../components/modal/EditLeague'
import DeleteLeague from '../components/modal/DeleteLeague'
import ResetLeague from '../components/modal/ResetLeague'
import Loader from '../components/Loader'
import '../styles/pages/myLeagueList.css'

const LeagueRow = ({ data, yourLeague, active, fromHome, isFutureLeague = false }) => {
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.userDetails)
  const userId = localStorage.getItem('userId')

  const { name, draftStart, leagueType, leagueLogo, totalPlayers } = data
  const teamCount = data?.teams?.length || totalPlayers || 0
  const maxTeams = data?.numberOfTeams || 32
  const fillPercent = Math.min((teamCount / maxTeams) * 100, 100)

  const leaguejoin = async () => {
    setLoading(true)
    try {
      const payload = {
        email: user?.email,
        leagueId: data?.leagueId,
        leagueType: leagueType,
        teamName: `team ${user?.userName}`,
        userId,
      }
      localStorage.setItem('selectedGame', 'football')
      await joinLeague(payload)
      setLoading(false)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error in Joining League:', error)
      setLoading(false)
    }
  }

  const deleteHandler = async () => {
    setDeleteLoading(true)
    const { deleteLeagueCommissioner } = await import('../redux')
    await deleteLeagueCommissioner({ _id: data?._id })
    setDeleteLoading(false)
  }

  const resetHandler = async () => {
    setDeleteLoading(true)
    const { resetLeagueCommissioner } = await import('../redux')
    await resetLeagueCommissioner({ _id: data?._id })
    setDeleteLoading(false)
  }

  if (loading) {
    return <div className="ml-row ml-row--loading"><Loader /></div>
  }

  return (
    <div className={`ml-row ${active ? 'ml-row--active' : ''} ${isFutureLeague ? 'ml-row--future' : ''}`}>
      {/* Logo */}
      <div className="ml-row-logo">
        <img
          src={leagueLogo || Logo}
          alt={name}
          className="ml-row-logo-img"
          onError={(e) => { e.target.src = Logo }}
        />
      </div>

      {/* League info */}
      <div className="ml-row-info">
        <div className="ml-row-name-wrap">
          <span className="ml-row-name">{name}</span>
          <span className={`ml-row-type ml-row-type--${leagueType || 'public'}`}>
            {leagueType || 'Public'}
          </span>
        </div>
        <div className="ml-row-meta">
          <span className="ml-row-meta-item">
            <span className="ml-row-meta-val">{teamCount}</span>
            <span className="ml-row-meta-dim">/{maxTeams}</span>
            <span className="ml-row-meta-label"> players</span>
          </span>
          <span className="ml-row-meta-dot" />
          <span className="ml-row-meta-item">
            Draft {moment(draftStart).format('MMM D, YY')}
            <span className="ml-row-meta-sub"> {moment(draftStart).format('h A')} CST</span>
          </span>
        </div>
        {/* Slim fill bar */}
        <div className="ml-row-bar">
          <div className="ml-row-bar-fill" style={{ width: `${fillPercent}%` }} />
        </div>
      </div>

      {/* Actions */}
      <div className="ml-row-actions">
        {user?.isCommissioner && (
          <div className="ml-row-commissioner">
            <EditLeague data={data} isCommissioner={user?.isCommissioner} />
            {data?.mainCommissioner === user?._id && (
              <ResetLeague deleteHandler={resetHandler} deleteLoading={deleteLoading} />
            )}
            {data?.teams?.length === 0 && data?.users?.length === 0 && (
              <DeleteLeague deleteHandler={deleteHandler} deleteLoading={deleteLoading} />
            )}
          </div>
        )}

        {yourLeague ? (
          <button
            className={`ml-row-btn ${active ? 'ml-row-btn--active' : 'ml-row-btn--joined'}`}
            onClick={async () => {
              if (!active) {
                await selectLeague({ leagueId: data?._id }, navigate)
              }
            }}
          >
            {active ? 'Active' : 'Joined'}
          </button>
        ) : fromHome ? (
          <button className="ml-row-btn ml-row-btn--join" onClick={leaguejoin}>
            Join
          </button>
        ) : (
          <JoinLeague data={data} />
        )}
      </div>
    </div>
  )
}

const MyLeague = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const leagues = useSelector((state) => state.league)
  const user = useSelector((state) => state.user.userDetails)
  const isAuthenticated = localStorage.getItem('token')
  const [loaded, setLoaded] = useState(false)

  const getData = async () => {
    if (isAuthenticated) {
      await getUserLeagues()
    }
    setLoaded(true)
  }

  useEffect(() => {
    getData()
  }, [])

  const hasLeagues = leagues?.userLeagues?.length > 0
  const hasNonUserLeagues = leagues?.nonUserLeagues?.length > 0
  const hasFutureLeagues = leagues?.futureLeagues?.length > 0
  const hasAnyLeagues = hasLeagues || hasNonUserLeagues || hasFutureLeagues

  return (
    <div className="ml-page">
      {/* Page header */}
      <div className="ml-page-hdr">
        <div>
          <h1 className="ml-page-title">{t('myLeagues')}</h1>
          <p className="ml-page-sub">
            {hasLeagues ? t('manageLeaguesDesc') : t('getStartedDesc')}
          </p>
        </div>
        <div className="ml-page-actions">
          <button className="ml-page-btn ml-page-btn--create" onClick={() => navigate('/onboarding')}>
            + Create League
          </button>
          <button className="ml-page-btn ml-page-btn--browse" onClick={() => navigate('/popular-league')}>
            Browse Leagues
          </button>
        </div>
      </div>

      {loaded && !hasAnyLeagues ? (
        <div className="ml-empty">
          <div className="ml-empty-icon">&#127942;</div>
          <h2 className="ml-empty-title">{t('getStarted')}</h2>
          <p className="ml-empty-desc">{t('getStartedDesc')}</p>
          <div className="ml-empty-btns">
            <button className="ml-page-btn ml-page-btn--create" onClick={() => navigate('/onboarding')}>
              {t('createLeague')}
            </button>
            <button className="ml-page-btn ml-page-btn--browse" onClick={() => navigate('/popular-league')}>
              {t('joinLeague')}
            </button>
          </div>
        </div>
      ) : (
        <div className="ml-list">
          {/* Column labels */}
          <div className="ml-list-hdr">
            <span className="ml-list-hdr-col ml-list-hdr-col--lg">League</span>
            <span className="ml-list-hdr-col ml-list-hdr-col--sm">Status</span>
          </div>

          {hasLeagues && (
            <>
              {leagues.userLeagues.map((value, index) => (
                <LeagueRow
                  key={`user-${index}`}
                  data={value}
                  active={user?.team?.currentLeague?._id === value?._id}
                  yourLeague={true}
                />
              ))}
            </>
          )}

          {leagues?.futureLeagues?.map((value, index) => (
            <LeagueRow
              key={`future-${index}`}
              data={value}
              active={false}
              yourLeague={false}
              totalTeams={value?.numberOfTeams}
              isFutureLeague={true}
            />
          ))}

          {!hasLeagues && leagues?.nonUserLeagues
            ?.filter(value => value._id !== '64fc5edaf8f2513bd263845a')
            ?.map((value, index) => (
              <LeagueRow
                key={`non-${index}`}
                data={value}
                active={user?.team?.currentLeague?._id === value?._id}
                yourLeague={false}
                fromHome={true}
              />
            ))
          }
        </div>
      )}
    </div>
  )
}

export default MyLeague
