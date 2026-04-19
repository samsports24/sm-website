import React, { useEffect, useState } from 'react'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  MoveToPracticeSquad,
  PoachPlayer,
  ReleasePlayer,
  TradePlayer,
} from '../modal/PlayerInterfaceModals'
import { getRosterPlayer } from '../../redux/actions/rosterAction'
import { useSelector } from 'react-redux'
import Loader from '../Loader'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const PlayerInterfacePopup = ({ state, closeModal, showModal }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({
    player: {},
    news: '',
    activePlayers: [],
    practicePlayers: [],
    playerContract: {},
  })
  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [showModal])

  const getData = async () => {
    setIsLoading(true)
    const res = await getRosterPlayer({
      id: state?.playerID,
      week: SETTING?.week,
      team: state?.teamId,
    })
    if (res) {
      setData(res)
    }
    setIsLoading(false)
  }

  const playerCenterData = [
    { name: 'Team:', value: data?.player?.Team || '-' },
    { name: 'Opponent:', value: data?.player?.UpcomingGameOpponent || '-' },
    { name: 'Postion:', value: data?.player?.Position || '-' },
    { name: 'Height:', value: data?.player?.Height || '-' },
    {
      name: 'Years in League:',
      value: data?.player?.Experience
        ? data?.player?.Experience <= 1
          ? `${data?.player?.Experience} Year`
          : `${data?.player?.Experience} Years`
        : '-',
    },
    {
      name: 'Player Caps:',
      value: data?.playerContract?.PlayerCap
        // ? `$${data?.playerContract?.PlayerCap?.toLocaleString()}`
          ? `$${data?.player?.currentYearSalaryCap?.toLocaleString()}`
        : '-',
    },
    { name: 'Player College:', value: data?.player?.College || '-' },
    { name: 'Age:', value: data?.player?.Age || '-' },
  ]

  const playerIdBig = data?.player?._id
  const playerIdSmall = data?.player?.PlayerID
  const isPlayerLocked = data?.player?.isPlayerLocked
  const inPracticeSquad = data?.player?.inPracticeSquad

  const getBgImage = (position) => {
    const p = position?.toLowerCase()
    return p === 'back up qb'
      ? 'BACK_UP_QB'
      : p === 'bqb'
      ? 'BQB'
      : p === 'cb'
      ? 'CB'
      : p === 'de'
      ? 'DE'
      : p === 'dt'
      ? 'DT'
      : p === 'dl'
      ? 'DT'
      : p === 'flex'
      ? 'FLEX'
      : p === 'k'
      ? 'K'
      : p === 'lb'
      ? 'LB'
      : p === 'ol'
      ? 'OL'
      : p === 'olb'
      ? 'OL'
      : p === 'ilb'
      ? 'OL'
      : p === 'ot'
      ? 'OL'
      : p === 'p'
      ? 'P'
      : p === 'qb'
      ? 'QB'
      : p === 's'
      ? 'S'
      : p === 'ss'
      ? 'S'
      : p === 'te'
      ? 'TE'
      : p === 'wr'
      ? 'WR'
      : p === 'rb'
      ? 'RB'
      : 'FLEX'
  }

  return (
    <div className='player_interface_popup'>
      <AiOutlineCloseCircle className='close_icon' onClick={closeModal} />
      {isLoading ? (
        <Loader />
      ) : (
        <div className='wrapper'>
          {state?.teamId && (
            <div className='viewing_roster_heading'>
              <h2>Your are viewing {state?.teamName || 'other team'} rosters.</h2>
            </div>
          )}
          <div className='top_row'>
            <div className='top_row_left'>
              <div className='image_box'>
                <img
                  className='bg_image'
                  src={require(`../../assets/interface-card/${getBgImage(
                    data?.player?.FantasyPosition === 'OL' ? 'OL' : data?.player?.Position,
                  )}.png`)}
                />
                <div className='player_img_box'>
                  {data?.player?.HostedHeadshotNoBackgroundUrl && (
                    <img src={data?.player?.HostedHeadshotNoBackgroundUrl} />
                  )}
                </div>
                <h2 className='player_name'>{data?.player?.Name || '-'}</h2>
                <h2 className='player_opponent'>{data?.player?.UpcomingGameOpponent || '-'}</h2>
                <h2 className='player_team'>{data?.player?.Team || '-'}</h2>
                <h2 className='player_projection'>{data?.player?.InjuryStatus || '-'}</h2>
              </div>
            </div>
            <div className='top_row_center'>
              <h2>Player news:</h2>
              <p>{data?.news || '-'}</p>
            </div>
            <div className='top_row_right'>
              {state?.teamId ? (
                <>
                  <Button
                    type='primary'
                    onClick={() => {
                      navigate('/team-trade')
                    }}
                  >
                    Make Offer
                  </Button>
                  <PoachPlayer />
                </>
              ) : (
                <>
                  <AuctionPlayer
                    disabled={isPlayerLocked}
                    playerIds={{
                      PlayerID: playerIdSmall,
                      player_id: playerIdBig,
                    }}
                    pInterfaceModalClose={closeModal}
                  />

                  <TradePlayer disabled={isPlayerLocked} pInterfaceModalClose={closeModal} />

                  <ReleasePlayer
                    disabled={isPlayerLocked}
                    playerId={playerIdSmall}
                    pInterfaceModalClose={closeModal}
                  />

                  <MoveToInjured
                    disabled={data?.player?.InjuryStatus?.toLowerCase() != 'out' || isPlayerLocked}
                    playerId={playerIdSmall}
                    pInterfaceModalClose={closeModal}
                  />

                  <ActivateFromPracticeSquad
                    disabled={!inPracticeSquad || isPlayerLocked}
                    playerId={playerIdSmall}
                    activePlayers={data?.activePlayers}
                    pInterfaceModalClose={closeModal}
                  />

                  <MoveToPracticeSquad
                    disabled={inPracticeSquad || isPlayerLocked}
                    playerId={playerIdSmall}
                    activePlayersCount={data?.activePlayers?.length}
                    practicePlayers={data?.practicePlayers}
                    pInterfaceModalClose={closeModal}
                  />
                </>
              )}
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
                <p>{data?.playerContract?.contractInfo || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerInterfacePopup
