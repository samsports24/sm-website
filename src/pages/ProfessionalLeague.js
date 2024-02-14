import React, { useEffect, useState, useRef } from 'react'

// import { Breadcrumb } from 'antd'

// Components
import Header from '../components/Header'
import LeagueStandings from '../components/LeagueStandings'
import PowerRanking from '../components/PowerRanking'
import PlayerRanking from '../components/PlayerRanking'
import MatchUpOfTheWeek from '../components/MatchUpOfTheWeek'
import RollingNewsFeed from '../components/RollingNewsFeed'
import TransactionTracker from '../components/TransactionTracker'
import Loader from '../components/Loader'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

import { getProfessionalLeagueRanks, getScheduleByWeek } from '../redux'
import { useSelector } from 'react-redux'
import { getTeamSchedule } from '../redux/actions/teamActions'
import TeamScheduleCarousel, {
  TeamScheduleCustomCarousel,
} from '../components/TeamScheduleCarousel'

const ProfessionalLeague = () => {
  const SETTING = useSelector((state) => state.user.setting)
  const [ranks, setRanks] = useState(null)
  const [data, setData] = useState([])
  const [teamSchedule, setTeamSchedule] = useState([])
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    getTeamAndPlayerRank()
  }, [SETTING?.week])

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

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <HeadingAndWeek />

        {teamSchedule?.length > 0 &&  <TeamScheduleCustomCarousel data={teamSchedule} />}
          {/* <TeamScheduleCarousel data={teamSchedule} /> */}

          <section className='league_details_container'>
            <div className='left'>
              <LeagueStandings data={ranks} maxHeight={'1325px'} />
            </div>
            <div className='center'>
              {[data?.[0]].map((item, index) => (
                <MatchUpOfTheWeek key={index} data={{ ...item }} />
              ))}
              <RollingNewsFeed />
              <TransactionTracker />
            </div>
            <div className='right'>
              <PowerRanking data={ranks} maxHeight={'626px'} />
              <PlayerRanking data={ranks} maxHeight={'626px'} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default ProfessionalLeague
