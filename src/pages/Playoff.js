import React, { useState, useEffect } from 'react'

// Images
// import SuperBowl from '../assets/Super_Bowl_LIV.png'
import SuperBowl from '../assets/SAMBOWL24.png'

// Component
import Header from '../components/Header'
import ScheduleBox from '../components/ScheduleBox'
import Flow from '../components/TournamentBracket'
import { getQualifiedTeams } from '../redux/actions/teamActions'

const Playoff = () => {
  const [teams, setTeams] = useState([])

  const getTeams = async () => {
    const res = await getQualifiedTeams()
    setTeams(res)
  }

  useEffect(() => {
    getTeams()
  }, [])

  return (
    <div className='playoff-container'>
      {/* HEADER */}
      <Header />

      <main className='wrapper'>
        {/* SCHEDULE ONE */}
        <ScheduleBox title={'Playoffs'}/>

        <section className='bracket-wrapper'>
          {/* <TournamentBracket /> */}
          <img className='super-bowl' alt='super-bowl' src={SuperBowl} />
          {teams?.length > 0 && <Flow allTeams={teams} />}
        </section>
      </main>
    </div>
  )
}

export default Playoff
