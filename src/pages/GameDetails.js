import React, { useEffect, useState } from 'react'
import {
  Button,
  Image,
  // Select
} from 'antd'

import Versus from '../assets/versus-1.png'

import { useLocation, useNavigate } from 'react-router-dom'
import { getGameDetails } from '../redux'

// Component
import Header from '../components/Header'
import ScoreCardTeam from '../components/cards/ScoreCardTeam'
import ScoreCardPlayer from '../components/cards/ScoreCardPlayer'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import { useSelector } from 'react-redux'

const GameDetails = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const { state } = useLocation()
  const [Data, setData] = useState(null)
  const [backupPlayer, setBackupPlayer] = useState(null)
  const [loading, setLoading] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    SETTING.week !== 0 && getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    let data = await getGameDetails({
      team1: state?.team1?._id,
      team2: state?.team2?._id,
      week: SETTING?.week,
    })

    const filterdBackupPlayer = data?.starters?.find((v) => v?.position?.toLowerCase() === 'bqb')
    setBackupPlayer(filterdBackupPlayer)

    const bench1Length = data?.bench1?.length || 0
    const bench2Length = data?.bench2?.length || 0

    const bigLength = bench1Length > bench2Length ? 'bench1' : 'bench2'

    const length = Math.abs(bench1Length - bench2Length)

    if (bench1Length == bench2Length) {
      setData(data)
    } else {
      if (bigLength === 'bench1') {
        let array = data?.bench2
        Array(length)
          .fill({})
          ?.map((_, i) => {
            array.push({ _id: i })
          })
        setData({
          ...data,
          bench2: array,
        })
      } else {
        let array = data?.bench1
        Array(length)
          .fill({})
          ?.map((_, i) => {
            array.push({ _id: i })
          })
        setData({
          ...data,
          bench1: array,
        })
      }
    }
    setLoading(false)
  }

  return (
    <div className='game_details'>
      {/* HEADER */}
      <Header />

      <main className='practice_squad_container wrapper'>
        {/* <ScheduleBox /> */}
        <ButtonsAndPagination noWeek={true} />

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
          <ScoreCardTeam
            alignment='left'
            data={state?.team1}
            score={state?.scoreOne || Data?.team1Score?.score || 0}
          />
          <div className='versus-container'>
            <Image preview={false} alt='vs' src={Versus} />
          </div>
          <ScoreCardTeam
            alignment='right'
            data={state?.team2}
            score={state?.scoreTwo || Data?.team2Score?.score || 0}
          />
        </section>

        {loading ? (
          <Loader />
        ) : (
          <>
            <section className='starters-sec'>
              <h3>Starters</h3>
              {/* <div className='select_box'>
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
              </div> */}
            </section>
            {/* PLAYER COMPARISION */}
            <section className='player-cards-container'>
              {Data?.starters
                ?.filter((v) => v?.position?.toLowerCase() !== 'bqb')
                .map((player, i) => (
                  <div key={player.position + i} className='row'>
                    <ScoreCardPlayer alignment='left' data={{ player: player.player1 }} />
                    <div className='position-label' style={{ color: '#0CD9F5' }}>
                      {player?.position?.split('/').map((pos) => (
                        <span key={pos}>{pos}</span>
                      ))}
                    </div>
                    <ScoreCardPlayer alignment='right' data={{ player: player.player2 }} />
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

            {/* BACKUP QB */}
            {backupPlayer && (
              <>
                <section className='starters-sec'>
                  <h3>Backup QB</h3>
                </section>
                {/* PLAYER COMPARISION */}
                <section className='player-cards-container'>
                  <div className='row'>
                    <ScoreCardPlayer
                      alignment='left'
                      data={{ player: { ...backupPlayer.player1?.players } }}
                    />
                    <div className='position-label' style={{ color: '#0CD9F5' }}>
                      <span>{backupPlayer?.position}</span>
                    </div>
                    <ScoreCardPlayer
                      alignment='right'
                      data={{ player: { ...backupPlayer.player2?.players } }}
                    />
                  </div>
                </section>
              </>
            )}

            {/* BENCH */}
            <section className='starters-sec'>
              <h3>Bench</h3>
            </section>
            {/* PLAYER COMPARISION */}
            <section className='player-cards-container'>
              {Data?.bench1?.map((v, i) => (
                <div key={i} className='row'>
                  <ScoreCardPlayer alignment='left' data={{ player: { ...v?.players } }} />
                  <div
                    className='position-label'
                    style={{ color: '#0CD9F5', backgroundColor: 'gray' }}
                  >
                    <span>BH</span>
                  </div>
                  <ScoreCardPlayer
                    alignment='right'
                    data={{
                      player: { ...Data?.bench2[i]?.players },
                    }}
                  />
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default GameDetails
