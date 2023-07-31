import React from 'react'
import { Button, Image } from 'antd'

// Image, Icon
import AtlantaLogo from '../assets/AtlantaLegionLogo.png'
import GeneralLogo from '../assets/GeneralTeamLogo.png'
import Versus from '../assets/versus-1.png'
import Player1 from '../assets/player-img-60x60.png'
import Player2 from '../assets/player-img-2-60x60.png'

// Component
import Header from '../components/Header'
import ScheduleBox from '../components/ScheduleBox'
import ScoreCardTeam from '../components/cards/ScoreCardTeam'
import ScoreCardPlayer from '../components/cards/ScoreCardPlayer'

const gameData = [
  { logo: AtlantaLogo, handle: '@MrMongrue84', name: 'Atlanta Legion', decimal: '17.73' },
  { logo: GeneralLogo, handle: '@MrMongrue84', name: 'Team 14', decimal: '22.93' },
]

const player1 = {
  image: Player1,
  name: 'B. Young',
  position: 'QB - CAR',
  matchTime: 'Sun 12:00 Pm @ ATL',
  handle: '@MrMongrue84',
}

const player2 = {
  image: Player2,
  name: 'J. Fields',
  position: 'RB - CIN',
  matchTime: 'Sun 3:25 Pm vs GB',
  handle: '@MrMongrue84',
}

const player3 = {
  image: Player1,
  name: 'N. Harris',
  position: 'RB - PIT',
  matchTime: 'Sun 12:00 Pm @ ATL',
  handle: '@MrMongrue84',
}

const player4 = {
  image: Player2,
  name: 'J. Mixon',
  position: 'RB - CIN',
  matchTime: 'Sun 3:25 Pm vs GB',
  handle: '@MrMongrue84',
}

const GameDetails = () => {
  return (
    <div className='game_details'>
      {/* HEADER */}
      <Header />

      <main className='wrapper'>
        {/* SCHEDULE ONE */}
        <ScheduleBox />

        {/* SCHEDULE TWO */}
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <Button type='primary'>Back</Button>
        </section>

        {/* TEAM COMPARISION */}
        <section className='team-cards-container'>
          <ScoreCardTeam alignment='left' data={gameData[0]} />
          <div className='versus-container'>
            <Image alt='vs' src={Versus} />
          </div>
          <ScoreCardTeam alignment='right' data={gameData[1]} />
        </section>

        <section className='starters-sec'>
          <h3>Starters</h3>
        </section>

        {/* PLAYER COMPARISION */}
        <section className='player-cards-container'>
          <div className='row'>
            <ScoreCardPlayer alignment='left' data={player1} />
            <div className='position-label' style={{ color: '#FF2D6C' }}>
              QB
            </div>
            <ScoreCardPlayer alignment='right' data={player2} />
          </div>
          <div className='row'>
            <ScoreCardPlayer alignment='left' data={player3} />
            <div className='position-label' style={{ color: '#2DFFA7' }}>
              RB
            </div>
            <ScoreCardPlayer alignment='right' data={player4} />
          </div>
        </section>
      </main>
    </div>
  )
}

export default GameDetails
