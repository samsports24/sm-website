import React from 'react'

import { Button, Breadcrumb } from 'antd'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'
import LeagueStandings from '../components/LeagueStandings'
import PowerRanking from '../components/PowerRanking'
import PlayerRanking from '../components/PlayerRanking'
import MatchUpOfTheWeek from '../components/MatchUpOfTheWeek'
import RollingNewsFeed from '../components/RollingNewsFeed'
import TransactionTracker from '../components/TransactionTracker'

const ProfessionalLeague = () => {
  return (
    <div className='pro_league_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator='|'
          items={[
            {
              title: <p>Fantacy Leagues</p>,
            },
            {
              title: <p>Football</p>,
            },
            {
              title: <p>Professionl League</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
        <WeekPagination />
      </section>

      <section className='league_details_container'>
        <div className='left'>
          <LeagueStandings />
        </div>
        <div className='center'>
          <MatchUpOfTheWeek />
          <RollingNewsFeed />
          <TransactionTracker />
        </div>
        <div className='right'>
          <PowerRanking />
          <PlayerRanking />
        </div>
      </section>
    </div>
  )
}

export default ProfessionalLeague
