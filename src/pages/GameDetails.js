import React, { useEffect, useState } from 'react'

import Versus from '../assets/cloud.png'

import { useLocation } from 'react-router-dom'
import { getGameDetails } from '../redux'

import { useSelector } from 'react-redux'

// Component
import Header from '../components/Header'
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

  const { data } = state
  const team1Starters = data?.record?.teamOne?.starterSum?.toFixed(2)
  const team2Starters = data?.record?.teamTwo?.starterSum?.toFixed(2)

  const team1Bench = data?.record?.teamOne?.benchSum?.toFixed(2)
  const team2Bench = data?.record?.teamTwo?.benchSum?.toFixed(2)

  const team1Bench25 = data?.record?.teamOne?.bench25Sum?.toFixed(2)
  const team2Bench25 = data?.record?.teamTwo?.bench25Sum?.toFixed(2)

  const team1Id = data?.opponentOne?._id
  const team2Id = data?.opponentTwo?._id

  useEffect(() => {
    SETTING.week !== 0 && getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    let data = await getGameDetails({
      team1: team1Id,
      team2: team2Id,
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
                <p>{team1Starters}</p>
              </div>
              <div className='gdsb_center'>
                <h2>STARTERS SCORE</h2>
              </div>
              <div className='gdsb_right'>
                <p>{team2Starters}</p>
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
                <p>{team1Bench}</p>
              </div>
              <div className='gdsb_center'>
                <h2>SCORE</h2>
              </div>
              <div className='gdsb_right'>
                <p>{team2Bench}</p>
              </div>
            </div>
            <div className='gd_score_box'>
              <div className='gdsb_left'>
                <p>{team1Bench25}</p>
              </div>
              <div className='gdsb_center'>
                <h2>
                  <span style={{ fontWeight: 400, fontStyle: 'italic' }}>25%</span> <br />
                  BENCH SCORE
                </h2>
              </div>
              <div className='gdsb_right'>
                <p>{team2Bench25}</p>
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
  const { data } = state
  const team1WinLose = `(${data?.record?.teamOne?.win || ''}-${data?.record?.teamOne?.lose || ''})`
  const team2WinLose = `(${data?.record?.teamTwo?.win || ''}-${data?.record?.teamTwo?.lose || ''})`

  const score1 = data?.scoreOne
  const score2 = data?.scoreTwo

  const team1Logo = data?.opponentOne?.logo
  const team2Logo = data?.opponentTwo?.logo

  const team1Name = data?.opponentOne?.name
  const team2Name = data?.opponentTwo?.name

  const team1Starters = data?.record?.teamOne?.starterSum?.toFixed(2) || '-'
  const team2Starters = data?.record?.teamTwo?.starterSum?.toFixed(2) || '-'

  const team1Bench = data?.record?.teamOne?.benchSum?.toFixed(2) || '-'
  const team2Bench = data?.record?.teamTwo?.benchSum?.toFixed(2) || '-'

  const team1Bench25 = data?.record?.teamOne?.bench25Sum?.toFixed(2) || '-'
  const team2Bench25 = data?.record?.teamTwo?.bench25Sum?.toFixed(2) || '-'

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
            <p className='points_text'>{team1Starters}</p>
            <p className='text1'>BENCH</p>
            <p className='text2'>{team1Bench}</p>
            <p className='text3'>25%</p>
            <p className='points_text'>{team1Bench25}</p>
          </div>
          <div className='logo_box'>
            <img src={team1Logo} />
          </div>
          <div className='name_box'>
            <p>{team1Name}</p>
            <p>{team1WinLose}</p>
          </div>
          <div className='points_box'>
            <p>{score1?.toFixed(2)}</p>
            {score1 != score2 ? (
              <p className={`${score1 > score2 ? 'green' : 'red'}`}>
                {`${score1 >= score2 ? '+' : '-'}${Math.abs(score1 - score2)?.toFixed(2)}`}
              </p>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
      <div className='gh_center'>
        <div className='vs_box'>
          <div className='vs_text'>VS</div>
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
            <p className='points_text'>{team2Starters}</p>
            <p className='text1'>BENCH</p>
            <p className='text2'>{team2Bench}</p>
            <p className='text3'>25%</p>
            <p className='points_text'>{team2Bench25}</p>
          </div>
          <div className='logo_box'>
            <img src={team2Logo} />
          </div>
          <div className='name_box'>
            <p>{team2Name}</p>
            <p>{team2WinLose}</p>
          </div>
          <div className='points_box'>
            <p>{score2?.toFixed(2)}</p>
            {score2 != score1 ? (
              <p className={`${score1 > score2 ? 'red' : 'green'}`}>
                {`${score2 >= score1 ? '+' : '-'}${Math.abs(score1 - score2)?.toFixed(2)}`}
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
            {/* <p>FINAL L 31-33 to CLE</p> */}
            <p>FINAL </p>
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
