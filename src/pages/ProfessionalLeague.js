import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FiZap } from 'react-icons/fi'

import Header from '../components/Header'
import LeagueStandings from '../components/LeagueStandings'
import PlayerRanking from '../components/PlayerRanking'
import RollingNewsFeed from '../components/RollingNewsFeed'
import TransactionTracker from '../components/TransactionTracker'
import TopPlayersBox from '../components/TopPlayersBox'
import Loader from '../components/Loader'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

import { getProfessionalLeagueRanks, getScheduleByWeek, getNewsFeed } from '../redux'
import { useSelector } from 'react-redux'
import { getTeamSchedule } from '../redux/actions/teamActions'
import { TeamScheduleCustomCarousel } from '../components/TeamScheduleCarousel'
import { useNavigate } from 'react-router-dom'
import DraftCountdownBanner from '../components/DraftCountdownBanner'
import DashboardTour from '../components/DashboardTour'

/* ═══ Live News Ticker ═══ */
const LiveNewsTicker = ({ headlines }) => {
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const navigate = useNavigate()

  if (!headlines || headlines.length === 0) return null

  // Double the headlines for seamless loop
  const doubled = [...headlines, ...headlines]

  return (
    <div
      className='ticker-bar'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className='ticker-label'>
        <FiZap size={12} />
        <span>LIVE</span>
      </div>
      <div className='ticker-track-wrap'>
        <div
          className={`ticker-track ${paused ? 'ticker-paused' : ''}`}
          ref={trackRef}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className='ticker-item'
              onClick={() => navigate('/all-news')}
            >
              <span className='ticker-bullet'>&#9679;</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const ProfessionalLeague = () => {
  const SETTING = useSelector((state) => state.user.setting)
  const [ranks, setRanks] = useState(null)
  const [data, setData] = useState([])
  const [teamSchedule, setTeamSchedule] = useState([])
  const [tickerHeadlines, setTickerHeadlines] = useState([])
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getTeamAndPlayerRank()
    }
  }, [SETTING?.week])

  useEffect(() => {
    ;(async () => {
      const news = await getNewsFeed()
      if (news && news.length > 0) {
        setTickerHeadlines(news.slice(0, 8).map((n) => n.headline).filter(Boolean))
      }
    })()
  }, [])

  const getTeamAndPlayerRank = async () => {
    setIsloading(true)
    await getProLeagueRank()
    await getDataByWeek()
    await getTeamScheduleFn()
    setIsloading(false)
  }

  const getProLeagueRank = async () => {
    let data = await getProfessionalLeagueRanks(SETTING?.week)
    setRanks(data)
  }
  const getDataByWeek = async () => {
    const res = await getScheduleByWeek(SETTING?.week)
    setData(res)
  }
  const getTeamScheduleFn = async () => {
    const res = await getTeamSchedule({ teamFilter: '', week: SETTING?.week })
    setTeamSchedule(res)
  }

  return (
    <div className='pro_league_container'>
      <Header />

      <DashboardTour />
      <DraftCountdownBanner />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <HeadingAndWeek />

          {/* ═══ Live News Ticker ═══ */}
          <LiveNewsTicker headlines={tickerHeadlines} />

          {teamSchedule?.length > 0 && <TeamScheduleCustomCarousel data={teamSchedule} />}

          {/* ═══ Main Dashboard Grid ═══ */}
          <div className='dash-grid'>

            {/* ── Left: News Feed (main content) ── */}
            <div className='dash-main'>
              <RollingNewsFeed height='520px' />
              <TransactionTracker />
            </div>

            {/* ── Right: Sidebar widgets ── */}
            <div className='dash-sidebar'>
              <LeagueStandings data={ranks} maxHeight='400px' />
              <TopPlayersBox data={ranks} side='offense' />
              <TopPlayersBox data={ranks} side='defense' />
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default ProfessionalLeague
