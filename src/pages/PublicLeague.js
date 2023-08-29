import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Breadcrumb, Button } from 'antd'

// Component
import Header from '../components/Header'
// import LeagueStandings from '../components/LeagueStandings'
import PublicLeagueBank from '../components/PublicLeagueBank'
import PowerRanking from '../components/PowerRanking'
import PlayerRanking from '../components/PlayerRanking'
// import MatchUpOfTheWeek from '../components/MatchUpOfTheWeek'
import QuickJoin from '../components/Carousel/QuickJoin'
import RollingNewsFeed from '../components/RollingNewsFeed'
import TransactionTracker from '../components/TransactionTracker'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const PublicLeague = () => {
  const navigate = useNavigate()
  const DataRank = [
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },

    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },

    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
    {
      League: 'League #00971',
      Rank: '54.06.937',
    },
  ]
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

      <ButtonsAndPagination />

      <section className='league_details_container'>
        <div className='left'>
          {/* <LeagueStandings /> */}

          <PublicLeagueBank data={DataRank} />
        </div>
        <div className='center'>
          <QuickJoin />
          <div className='join-league'>
            <h2>Join A Sam Football League</h2>
            <Button
              type='primary'
              onClick={() => {
                navigate('/choose-your-game-step1')
              }}
            >
              JOIN NOW
            </Button>
          </div>
          {/* <MatchUpOfTheWeek /> */}
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

export default PublicLeague
