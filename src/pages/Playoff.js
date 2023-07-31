import React from 'react'

// Component
import Header from '../components/Header'
import ScheduleBox from '../components/ScheduleBox'
import TournamentBracket from '../components/TournamentBracket'

const Playoff = () => {
  return (
    <div className='playoff-container'>
      {/* HEADER */}
      <Header />

      <main className='wrapper'>
        {/* SCHEDULE ONE */}
        <ScheduleBox />

        <section className='bracket-wrapper'>
          <TournamentBracket />
        </section>
      </main>
    </div>
  )
}

export default Playoff
