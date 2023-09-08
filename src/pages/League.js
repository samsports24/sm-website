import React, { useEffect, useState } from 'react'

// Component
import Header from '../components/Header'
import LeagueStandings from '../components/LeagueStandings'
import PlayerRanking from '../components/PlayerRanking'
import RollingNewsFeed from '../components/RollingNewsFeed'
import TransactionTracker from '../components/TransactionTracker'
import { getProfessionalLeagueRanks } from '../redux'
import UserLog from '../components/UserLog'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const League = () => {
  const [ranks, setRanks] = useState(null)

  useEffect(() => {
    ;(async () => {
      let data = await getProfessionalLeagueRanks()
      setRanks(data)
    })()
  }, [])

  return (
    <div className='league_container_n1'>
      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <section className='league_details_container'>
        <div className='left'>
          <LeagueStandings data={ranks?.teamRanks} />
        </div>
        <div className='center'>
          <RollingNewsFeed />
          <TransactionTracker />
        </div>
        <div className='right'>
          <UserLog data={['', '', '', '', '', '', '', '']} />
          <PlayerRanking data={ranks?.playerRanks} />
        </div>
      </section>
    </div>
  )
}

export default League
