import React, { useEffect, useState } from 'react'
import { Button, Image, Select } from 'antd'

// Image, Icon
// import AtlantaLogo from '../assets/AtlantaLegionLogo.png'
// import GeneralLogo from '../assets/GeneralTeamLogo.png'
import Versus from '../assets/versus-1.png'

// Component
import Header from '../components/Header'
// import ScheduleBox from '../components/ScheduleBox'
import ScoreCardTeam from '../components/cards/ScoreCardTeam'
import ScoreCardPlayer from '../components/cards/ScoreCardPlayer'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { useLocation, useNavigate } from 'react-router-dom'
import { getGameDeails } from '../redux'
import Loader from '../components/Loader'

const GameDetails = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [Data, setData] = useState(null)
  const [loading, setLoading] = useState(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      let data = await getGameDeails({
        team1: state?.team1?._id,
        team2: state?.team2?._id,
      })
      // console.log('data', data)
      setData(data)
      setLoading(false)
    })()
  }, [])
  console.log('Data', Data)
  return (
    <div className='game_details'>
      {/* HEADER */}
      <Header />

      <main className='practice_squad_container wrapper'>
        {/* SCHEDULE ONE */}
        {/* <ScheduleBox /> */}
        <ButtonsAndPagination />

        {/* SCHEDULE TWO */}
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <Button
            type='primary'
            onClick={() => {
              navigate(-1)
            }}
          >
            Back
          </Button>
        </section>

        {/* TEAM COMPARISION */}
        <section className='team-cards-container'>
          <ScoreCardTeam alignment='left' data={state?.team1} />
          <div className='versus-container'>
            <Image alt='vs' src={Versus} />
          </div>
          <ScoreCardTeam alignment='right' data={state?.team2} />
        </section>

        <section className='starters-sec'>
          <h3>Starters</h3>
          <div className='select_box'>
            <Select
              defaultValue='week-1'
              style={{ minWidth: 140 }}
              // onChange={handleChange}
              options={[
                {
                  value: 'week-1',
                  label: 'WK. 1',
                },
              ]}
            />
          </div>
        </section>

        {loading ? (
          <Loader />
        ) : (
          <>
            {/* PLAYER COMPARISION */}
            <section className='player-cards-container'>
              {Data?.starters?.map((player) => (
                <div key={player.position} className='row'>
                  <ScoreCardPlayer alignment='left' data={player.player1} />
                  <div className='position-label' style={{ color: '#0CD9F5' }}>
                    {player?.position?.split('/').map((pos) => (
                      <span key={pos}>{pos}</span>
                    ))}
                  </div>
                  <ScoreCardPlayer alignment='right' data={player.player2} />
                </div>
              ))}
              {/* <div className='row'>
                <ScoreCardPlayer alignment='left' data={player3} />
                <div className='position-label' style={{ color: '#2DFFA7' }}>
                  RB
                </div>
                <ScoreCardPlayer alignment='right' data={player4} />
              </div> */}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default GameDetails
