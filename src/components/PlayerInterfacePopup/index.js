import React from 'react'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  MoveToPracticeSquad,
  // MoveToReserve,
  ReleasePlayer,
  TradePlayer,
} from '../modal/PlayerInterfaceModals'
import { AiOutlineCloseCircle } from 'react-icons/ai'

const PlayerInterfacePopup = ({ data }) => {
  // const isReserve = true
  const getData = () => {}
  const activePlayers = []
  const practicePlayers = []
  // const reservedPlayers = []

  const playerCenterData = [
    { name: 'Team:', value: 'SJ' || '-' },
    { name: 'Opponent:', value: '' || '-' },
    { name: 'Postion:', value: 'C' || '-' },
    { name: 'Height:', value: 75 || '-' },
    { name: 'Years in League:', value: null || '-' },
    { name: 'Player Caps:', value: '$8,137,500' || '-' },
    { name: 'Player College:', value: null || '-' },
    { name: 'Age:', value: null || '-' },
  ]

  return (
    <div className='player_interface_popup'>
      <AiOutlineCloseCircle className='close_icon' />
      <div className='wrapper'>
        <div className='top_row'>
          <div className='top_row_left'></div>
          <div className='top_row_center'>
            <h2>Player news:</h2>
            <p>
              {
                "According to a source, the New York Giants hosted free-agent linebacker Anthony Barr for a visit on Thursday, but no deal is imminent. Barr also recently visited with the New Orleans Saints as he looks to find a new home before the start of the 2023 regular season in early September. The former ninth overall pick of the Minnesota Vikings in 2014 out of UCLA has been hurt by injuries in recent seasons and hasn't played a whole year since 2017 with the Vikes. The four-time Pro Bowler spent the 2022 campaign with the Dallas Cowboys, recording 58 tackles (35 solo), one sack, four QB hits, and two fumble recoveries in 14 games (10 starts). If he signs with the G-Men, he'll provide depth at linebacker this year."
              }
            </p>
          </div>
          <div className='top_row_right'>
            <AuctionPlayer
              disabled={data?.isPlayerLocked}
              playerIds={{
                PlayerID: data?.player_id?.PlayerID,
                player_id: data?.player_id?._id,
              }}
            />

            <TradePlayer disabled={data?.isPlayerLocked} />

            <ReleasePlayer disabled={data?.isPlayerLocked} playerId={data?.player_id?._id} />

            <MoveToInjured
              disabled={
                data?.player_id?.InjuryStatus?.toLowerCase() != 'out' || data?.isPlayerLocked
              }
              playerId={data?.player_id?._id}
              getData={getData}
            />

            <ActivateFromPracticeSquad
              disabled={!data?.inPracticeSquad || data?.isPlayerLocked}
              playerId={data?.player_id?._id}
              getData={getData}
              activePlayers={activePlayers}
            />

            <MoveToPracticeSquad
              disabled={data?.inPracticeSquad || data?.isPlayerLocked}
              playerId={data?.player_id?._id}
              getData={getData}
              activePlayersCount={activePlayers?.length}
              practicePlayers={practicePlayers}
            />
          </div>
        </div>
        <div className='middle_row'>
          {playerCenterData?.map((v) => {
            return (
              <h3 key={v?.name}>
                {v?.name}
                <span>{v?.value}</span>
              </h3>
            )
          })}
        </div>
        <div className='bottom_row'>
          <div className='left'>
            <h2>Player past projected stats & scores</h2>
            <div className='coming_soon_box'>
              <h1>Coming Soon</h1>
            </div>
          </div>
          <div className='right'>
            <div className='right_wrapper'>
              <h2>Player Contract Info</h2>
              <p>
                Anthony Barr signed a 1 year, $2,000,000 contract with the Dallas Cowboys, including
                a $500,000 signing bonus, $1,750,000 guaranteed, and an average annual salary of
                $2,000,000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerInterfacePopup
