import React, { useEffect, useState } from 'react'

import { Breadcrumb } from 'antd'

// Component
import Header from '../components/Header'
import LeagueStandings from '../components/LeagueStandings'
import PowerRanking from '../components/PowerRanking'
import PlayerRanking from '../components/PlayerRanking'
import MatchUpOfTheWeek from '../components/MatchUpOfTheWeek'
import RollingNewsFeed from '../components/RollingNewsFeed'
import TransactionTracker from '../components/TransactionTracker'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { getProfessionalLeagueRanks, getScheduleByWeek } from '../redux'
import { useSelector } from 'react-redux'
import Loader from '../components/Loader'

// WILL BE RENDER FOR HOCKEY
// import LeagueStandingsHockey from '../components/LeagueStandingsHockey'

const ProfessionalLeague = () => {
  const SETTING = useSelector((state) => state.user.setting)
  const [ranks, setRanks] = useState(null)
  const [data, setData] = useState([])
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    getTeamAndPlayerRank()
  }, [SETTING?.week])

  const getTeamAndPlayerRank = async () => {
    setIsloading(true)
    let data = await getProfessionalLeagueRanks(SETTING?.week)
    setRanks(data)
    await getDataByWeek()
    setIsloading(false)
  }
  const getDataByWeek = async () => {
    const res = await getScheduleByWeek(SETTING?.week)
    setData(res)
  }

  return (
    <div className='pro_league_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator='|'
          items={[
            {
              title: <p>Fantasy Leagues</p>,
            },
            {
              title: <p>Hockey</p>,
            },
            {
              title: <p>Professional League</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <ButtonsAndPagination />

          <section className='league_details_container'>
            <div className='left'>
              <LeagueStandings data={ranks?.teamRanks} />
              {/* WILL BE RENDER FOR HOCKEY */}
              {/* <LeagueStandingsHockey data={[]} /> */}
            </div>
            <div className='center'>
              {[data?.[0]].map((item, index) => (
                <MatchUpOfTheWeek key={index} data={{ ...item }} />
              ))}
              <RollingNewsFeed />
              <TransactionTracker />
            </div>
            <div className='right'>
              <PowerRanking data={ranks?.teamRanks} />
              <PlayerRanking data={ranks?.playerRanks} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default ProfessionalLeague
