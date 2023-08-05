import React from 'react'

// Images
import SuperBowl from '../assets/playoff-img.png'

// Component
import Header from '../components/Header'
import ScheduleBox from '../components/ScheduleBox'
import Flow from '../components/TournamentBracket'

const Playoff = () => {
  return (
    <div className='playoff-container'>
      {/* HEADER */}
      <Header />

      <main className='wrapper'>
        {/* SCHEDULE ONE */}
        <ScheduleBox />

        <section className='bracket-wrapper'>
          {/* <TournamentBracket /> */}
          <img className='super-bowl' alt='super-bowl' src={SuperBowl} />
          <Flow />
        </section>
      </main>
    </div>
  )
}

export default Playoff
