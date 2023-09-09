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

const ProfessionalLeague = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [ranks, setRanks] = useState(null)
  const [data, setData] = useState([])

  useEffect(() => {
    getTeamAndPlayerRank()
  }, [])

  const getTeamAndPlayerRank = async () => {
    let data = await getProfessionalLeagueRanks(SETTING?.week)
    setRanks(data)
    getDataByWeek()
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
              title: <p>Football</p>,
            },
            {
              title: <p>Professional League</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <section className='league_details_container'>
        <div className='left'>
          <LeagueStandings data={ranks?.teamRanks} />
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
    </div>
  )
}

export default ProfessionalLeague
