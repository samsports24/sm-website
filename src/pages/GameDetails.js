import React, { useEffect, useState } from 'react'

import Versus from '../assets/versus-1.png'

import { useLocation, useNavigate } from 'react-router-dom'
import { getGameDetails } from '../redux'

import { useSelector } from 'react-redux'

// Component
import Header from '../components/Header'
// import ScoreCardTeam from '../components/cards/ScoreCardTeam'
// import ScoreCardPlayer from '../components/cards/ScoreCardPlayer'
import Loader from '../components/Loader'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

import Player1 from '../assets/player-img-60x60.png'
import ViewBreakdown from '../components/modal/ViewBreakdown'

const GameDetails = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const { state } = useLocation()
  const [Data, setData] = useState(null)
  const [backupPlayer, setBackupPlayer] = useState(null)
  const [benchPlayer, setBenchPlayer] = useState([])
  const [lockedPlayer, setLockedPlayer] = useState(null)
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
      const createdData = []
      data?.bench1?.forEach((v, i) => {
        createdData?.push({
          player1: v?.players,
          player2: data?.bench2[i]?.players,
          position: 'BNH',
        })
      })
      setBenchPlayer(createdData)
      setData(data)
    } else {
      if (bigLength === 'bench1') {
        let array = data?.bench2
        Array(length)
          .fill({})
          ?.map((_, i) => {
            array.push({ _id: i })
          })
        const createdData = []
        data?.bench1?.forEach((v, i) => {
          createdData?.push({
            player1: v?.players,
            player2: array[i]?.players,
            position: 'BNH',
          })
        })
        setBenchPlayer(createdData)
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
        const createdData = []
        data?.bench2?.forEach((v, i) => {
          createdData?.push({
            player1: array[i]?.players,
            player2: v?.players,
            position: 'BNH',
          })
        })
        setBenchPlayer(createdData)
        setData({
          ...data,
          bench1: array,
        })
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (Data?.starters?.length > 0) {
      const merged = [...Data?.starters, ...benchPlayer]
      if (backupPlayer) merged.push(backupPlayer)
      const player1Locked = merged?.filter((v) => v?.player1 && v?.player1.isPlayerLocked === true)
      const player1UnLocked = merged?.filter(
        (v) => v?.player1 && v?.player1.isPlayerLocked === false,
      )
      const player2Locked = merged?.filter((v) => v?.player2 && v?.player2.isPlayerLocked === true)
      const player2UnLocked = merged?.filter(
        (v) => v?.player2 && v?.player2.isPlayerLocked === false,
      )
      setLockedPlayer({
        player1: {
          locked: player1Locked?.length,
          unlocked: player1UnLocked?.length,
        },
        player2: {
          locked: player2Locked?.length,
          unlocked: player2UnLocked?.length,
        },
      })
    }
  }, [Data, benchPlayer])

  return (
    <div className='game_details'>
      <Header />
      <HeadingAndWeek week={false} />

      {loading ? (
        <Loader />
      ) : (
        <div className='gd-scroll'>
          <section className='gd_body'>
            <GameHeader state={state} lockedPlayer={lockedPlayer} />

            <div className='heading_box_top'>
              <h2>STARTERS</h2>
            </div>

            {Data?.starters
              ?.filter((v) => v?.position?.toLowerCase() !== 'bqb')
              .map((player, i) => (
                <PlayerCardRow key={i} data={player} />
              ))}

            <div className='gd_score_box'>
              <div className='gdsb_left'>
                <p>-</p>
              </div>
              <div className='gdsb_center'>
                <h2>STARTERS SCORE</h2>
              </div>
              <div className='gdsb_right'>
                <p>-</p>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            <div style={{ height: '30px' }} />
            {backupPlayer && <PlayerCardRow data={backupPlayer} />}
            <div style={{ height: '50px' }} />
            {/* -------------------------------------------------------------- */}
            {benchPlayer?.map((player, i) => (
              <PlayerCardRow key={i} data={player} />
            ))}
            <div className='gd_score_box'>
              <div className='gdsb_left'>
                <p>-</p>
              </div>
              <div className='gdsb_center'>
                <h2>SCORE</h2>
              </div>
              <div className='gdsb_right'>
                <p>-</p>
              </div>
            </div>
            <div className='gd_score_box'>
              <div className='gdsb_left'>
                <p>-</p>
              </div>
              <div className='gdsb_center'>
                <h2>
                  <span style={{ fontWeight: 400, fontStyle: 'italic' }}>25%</span> <br />
                  BENCH SCORE
                </h2>
              </div>
              <div className='gdsb_right'>
                <p>-</p>
              </div>
            </div>
            <div style={{ height: '30px' }} />
            {/* -------------------------------------------------------------- */}
          </section>
        </div>
      )}
    </div>
  )
}

const GameHeader = ({ state, lockedPlayer }) => {
  return (
    <div className='game_header'>
      <div className='gh_left'>
        <p className='played_text'>
          {`PLAYED: ${lockedPlayer?.player1?.locked || '-'} YET TO PLAY: ${
            lockedPlayer?.player1?.unlocked || '-'
          }`}
        </p>
        <div className='bg_left' />
        <div className='wrapper'>
          <div className='stats'>
            <p className='text1'>STARTERS</p>
            <p className='points_text'>{'-'}</p>
            <p className='text1'>BENCH</p>
            <p className='text2'>{'-'}</p>
            <p className='text3'>25%</p>
            <p className='points_text'>{'-'}</p>
          </div>
          <div className='logo_box'>
            <img src={state?.team1?.logo} />
          </div>
          <div className='name_box'>
            <p>{state?.team1?.name}</p>
            <p>{`(${state?.team1Win}-${state?.team1Lose})`}</p>
          </div>
          <div className='points_box'>
            <p>{state?.scoreOne?.toFixed(2)}</p>
            {state?.scoreOne != state?.scoreTwo ? (
              <p className={`${state?.scoreOne > state?.scoreTwo ? 'green' : 'red'}`}>
                {`${state?.scoreOne >= state?.scoreTwo ? '+' : '-'}${Math.abs(
                  state?.scoreOne - state?.scoreTwo,
                )?.toFixed(2)}`}
              </p>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
      <div className='gh_center'>
        <div className='vs_box'>
          <img src={Versus} alt='VS' />
        </div>
      </div>
      <div className='gh_right'>
        <p className='played_text'>
          {`PLAYED: ${lockedPlayer?.player2?.locked || '-'} YET TO PLAY: ${
            lockedPlayer?.player2?.unlocked || '-'
          }`}
        </p>
        <div className='bg_right' />
        <div className='wrapper'>
          <div className='stats'>
            <p className='text1'>STARTERS</p>
            <p className='points_text'>{'-'}</p>
            <p className='text1'>BENCH</p>
            <p className='text2'>{'-'}</p>
            <p className='text3'>25%</p>
            <p className='points_text'>{'-'}</p>
          </div>
          <div className='logo_box'>
            <img src={state?.team2?.logo} />
          </div>
          <div className='name_box'>
            <p>{state?.team2?.name}</p>
            <p>{`(${state?.team2Win}-${state?.team2Lose})`}</p>
          </div>
          <div className='points_box'>
            <p>{state?.scoreTwo?.toFixed(2)}</p>
            {state?.scoreTwo != state?.scoreOne ? (
              <p className={`${state?.scoreOne > state?.scoreTwo ? 'red' : 'green'}`}>
                {`${state?.scoreTwo >= state?.scoreOne ? '+' : '-'}${Math.abs(
                  state?.scoreOne - state?.scoreTwo,
                )?.toFixed(2)}`}
              </p>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const PlayerCardRow = ({ data }) => {
  return (
    <div className='gd_card_box'>
      <div className='gdc_left'>
        <div className='gdc_content'>
          <div className='p_img_box'>
            <img src={data?.player1?.HostedHeadshotNoBackgroundUrl || Player1} />
          </div>
          <div className='name_box'>
            <div>
              <p>
                {data?.player1?.Name?.length >= 17 ? data?.player1?.ShortName : data?.player1?.Name}
              </p>
              <span>
                {data?.player1?.Position} - {data?.player1?.Team}
              </span>
            </div>
            {/* <p>FINAL L 31-33 to CLE</p> */}
            <p>FINAL </p>
          </div>
          <div className='breakdown_box'>
            {data?.player1?.playerScoreBreakDown?.length > 0 && (
              <ViewBreakdown data={data?.player1} />
            )}
          </div>
        </div>
        <div className='gdc_points'>
          <p>{data?.player1?.playerScore || '-'}</p>
        </div>
      </div>
      <div className='position-circle' style={{ color: '#0CD9F5' }}>
        {data?.position?.split('/').map((pos) => (
          <span key={pos}>{pos}</span>
        ))}
      </div>
      <div className='gdc_right'>
        <div className='gdc_content'>
          <div className='p_img_box'>
            <img src={data?.player2?.HostedHeadshotNoBackgroundUrl || Player1} />
          </div>
          <div className='name_box'>
            <div>
              <p>
                {data?.player2?.Name?.length >= 17 ? data?.player2?.ShortName : data?.player2?.Name}
              </p>
              <span>
                {data?.player2?.Position} - {data?.player2?.Team}
              </span>
            </div>
            <p>FINAL L 31-33 to CLE</p>
          </div>
          <div className='breakdown_box'>
            {data?.player2?.playerScoreBreakDown?.length > 0 && (
              <ViewBreakdown data={data?.player2} />
            )}
          </div>
        </div>
        <div className='gdc_points'>
          <p>{data?.player2?.playerScore || '-'}</p>
        </div>
      </div>
    </div>
  )
}

export default GameDetails
