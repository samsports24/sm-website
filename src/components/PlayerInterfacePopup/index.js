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
import { getFreeAgentRosterPlayer, getRosterPlayer } from '../../redux/actions/rosterAction'
import { useSelector } from 'react-redux'
import Loader from '../Loader'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { Button, Table } from 'antd'
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
    const res = state?.isFreeAgent
      ? await getFreeAgentRosterPlayer({ id: state?.playerID, week: SETTING?.week })
      : await getRosterPlayer({
          id: state?.playerID,
          week: SETTING?.week,
          team: state?.teamId,
        })
    if (res) {
      setData(res)
    }
    setIsLoading(false)
  }

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

  const columns = [
    {
      title: 'YEAR',
      dataIndex: 'year',
      key: 'year',
      render: (t) => (t ? t : '-'),
    },
    {
      title: 'TOTAL POINTS',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (t) => (t ? t : '-'),
      width: 130,
    },
    {
      title: 'AVG. POINTS',
      dataIndex: 'avgPoints',
      key: 'avgPoints',
      render: (t) => (t ? t : '-'),
      width: 130,
    },
    {
      title: (
        <p>
          WK<b>1</b>
        </p>
      ),
      dataIndex: 'week1',
      key: 'week1',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>2</b>
        </p>
      ),
      dataIndex: 'week2',
      key: 'week2',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>3</b>
        </p>
      ),
      dataIndex: 'week3',
      key: 'week3',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>4</b>
        </p>
      ),
      dataIndex: 'week4',
      key: 'week4',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>5</b>
        </p>
      ),
      dataIndex: 'week5',
      key: 'week5',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>6</b>
        </p>
      ),
      dataIndex: 'week6',
      key: 'week6',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>7</b>
        </p>
      ),
      dataIndex: 'week7',
      key: 'week7',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>8</b>
        </p>
      ),
      dataIndex: 'week8',
      key: 'week8',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>9</b>
        </p>
      ),
      dataIndex: 'week9',
      key: 'week9',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>10</b>
        </p>
      ),
      dataIndex: 'week10',
      key: 'week10',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>11</b>
        </p>
      ),
      dataIndex: 'week11',
      key: 'week11',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>12</b>
        </p>
      ),
      dataIndex: 'week12',
      key: 'week12',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>13</b>
        </p>
      ),
      dataIndex: 'week13',
      key: 'week13',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>14</b>
        </p>
      ),
      dataIndex: 'week14',
      key: 'week14',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>15</b>
        </p>
      ),
      dataIndex: 'week15',
      key: 'week15',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>16</b>
        </p>
      ),
      dataIndex: 'week16',
      key: 'week16',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>17</b>
        </p>
      ),
      dataIndex: 'week17',
      key: 'week17',
      render: (t) => (t ? t : '-'),
    },
    {
      title: (
        <p>
          WK<b>18</b>
        </p>
      ),
      dataIndex: 'week18',
      key: 'week18',
      render: (t) => (t ? t : '-'),
    },
  ]

  const getYear = (contract) => {
    const signed = contract?.split(' signed a ')[1][0]
    if (signed) {
      return new Date().getFullYear() - 1 + Number(signed)
    } else {
      return '-'
    }
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
            <div className='top_row_1'>
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
            <div className='top_row_2'>
              <p className='top_player_name'>
                {data?.player?.FirstName}
                <b>{data?.player?.LastName}</b>
              </p>
              <div className='player_details_box'>
                <p>
                  <b>position:</b>
                  {data?.player?.Position}
                </p>
                <p>
                  <b>team:</b>
                  {data?.player?.Team}
                </p>
              </div>
              <div className='player_details_box'>
                <p>
                  <b>age:</b>
                  {data?.player?.Age}
                </p>
                <p>
                  <b>height:</b>
                  {data?.player?.Height ? data?.player?.Height : '-'}
                </p>
                <p>
                  <b>weight:</b>
                  {data?.player?.Weight ? (
                    <>
                      {data?.player?.Weight}
                      <span>lbs</span>
                    </>
                  ) : (
                    '-'
                  )}
                </p>
                <p>
                  <b>exp:</b>
                  {data?.player?.Experience ? (
                    data?.player?.Experience <= 1 ? (
                      <>
                        {data?.player?.Experience}
                        <span>Year</span>
                      </>
                    ) : (
                      <>
                        {data?.player?.Experience}
                        <span>Years</span>
                      </>
                    )
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div className='player_news_box'>
                <p className='title'>
                  player<b>news</b>
                </p>
                <p className='news_text'>{data?.news || 'No news available'}</p>
              </div>
            </div>
            {!state?.isFreeAgent && (
              <div className='top_row_3'>
                <p>
                  OWNING<b>TEAM</b>
                </p>
                {state?.teamLogo && <img src={state?.teamLogo} alt='Team Logo' />}
              </div>
            )}
            <div className='top_row_4'>
              {state?.isFreeAgent ? (
                <>
                  <Button type='primary'>AUCTION PLAYER</Button>
                </>
              ) : state?.teamId ? (
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
          <div className='bottom_row'>
            <div className='left'>
              <div className='left_top'>
                <div>
                  <h2>Player Rank</h2>
                  <div className='player_rank_box'>
                    <div>
                      <p className='text_1'>#</p>
                      <p className='text_2'>POSITION</p>
                    </div>
                    <div style={{ alignSelf: 'flex-start' }}>
                      <p className='text_2' style={{ fontSize: '18px' }}>
                        |
                      </p>
                    </div>
                    <div>
                      <p className='text_1'>#</p>
                      <p className='text_2'>OVERALL</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2>Ownership</h2>
                  <div className='ownership_box'>
                    <div>
                      <p className='text_1'>0%</p>
                      <p className='text_2'>ROSTERED</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2>TPF / APF</h2>
                  <div className='tpf_apf_box'>
                    <p>-</p>
                    <span style={{ fontSize: '22px', color: '#fff' }}>|</span>
                    <p>-</p>
                  </div>
                </div>
              </div>
              <div className='left_bottom'>
                <p>
                  PLAYER<b>HISTORY</b>
                </p>
                <Table
                  loading={false}
                  dataSource={[]}
                  columns={columns}
                  bordered={false}
                  pagination={false}
                  scroll={{ x: 1700, y: 200 }}
                  className='interface_table'
                />
              </div>
            </div>
            <div className='right'>
              <p>
                PLAYER<b>CONTRACT</b>
              </p>
              <div className='contract_box'>
                <div className='caphit_box'>
                  <p>
                    CAP<b>HIT</b>
                  </p>
                  <p>
                    <b>23&apos;</b>{' '}
                    {data?.playerContract?.PlayerCap
                      ? `$${data?.playerContract?.PlayerCap?.toLocaleString()}`
                      : '-'}
                  </p>
                </div>
                <div className='caphit_year_box'>
                  <p>
                    24&apos; CAP<b>HIT</b>
                  </p>
                  <div>
                    <p>$-</p>
                  </div>
                </div>
                <div className='caphit_year_box'>
                  <p>
                    FINAL<b>YEAR</b>
                  </p>
                  <div>
                    <p>{getYear(data?.playerContract?.contractInfo)}</p>
                  </div>
                </div>
                <div className='contract_info_box'>
                  <p>
                    CONTRACT<b>INFO:</b>
                  </p>
                  <p>{data?.playerContract?.contractInfo || 'No contract available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerInterfacePopup
