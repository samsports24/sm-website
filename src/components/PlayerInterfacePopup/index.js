import React, { useEffect, useState } from 'react'
import { Button, Input, Spin, Table, notification } from 'antd'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  MoveToPracticeSquad,
  PoachPlayer,
  ReleasePlayer,
  TradePlayer,
} from '../modal/PlayerInterfaceModals'
import {
  addBid,
  auctionEnded,
  createAuction,
  getFreeAgentRosterPlayer,
  getRosterPlayer,
  getSingleAuctionPlayer,
} from '../../redux/actions/rosterAction'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { getPf, getPfScore, getRankAndPosition } from '../../config/helperFunctions'
import { isLocked } from '../../config/constants'

import Image from '../../assets/logo2.png'
import sampointslogo from "../../assets/samcoinlogo.png"

import { AiOutlineCloseCircle } from 'react-icons/ai'

import Loader from '../Loader'
import moment from 'moment'
import { getUser } from '../../redux'

const PlayerInterfacePopup = ({ state, closeModal, isModalOpen }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [isLoading, setIsLoading] = useState(true)
  const [auctionLoading, setAuctionLoading] = useState(false)
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
 
  const [data, setData] = useState({
    player: {},
    news: '',
    activePlayers: [],
    practicePlayers: [],
    playerContract: {},
  })
  const navigate = useNavigate()

  const playerIdBig = data?.player?._id
  const playerIdSmall = data?.player?.PlayerID
  const isPlayerLocked = data?.player?.isPlayerLocked
  const inPracticeSquad = data?.player?.inPracticeSquad
  const CapHit = data?.player?.currentYearSalaryCap

  const isOwnRoster = state?.isOwnRoster?.status
  const isTeamRoster = state?.isTeamRoster?.status
  const isFreeAgent = state?.isFreeAgent?.status
  const isAuction = state?.isAuction

//  console.log('data?.player',data?.player);
// console.log('data?.playerContract?.weeklyScoring',data?.playerContract?.weeklyScoring);


// console.log('mysampoints',sampoints);

  useEffect(() => {
    if (isModalOpen) {
      getData()
    }
  }, [isModalOpen])

  const getWeeklyScoring = (arr) => {
    if (arr?.length > 0) {
      let unique_values = [...new Set(arr.map((v) => v?.season))]
      const newArray = []

      unique_values
        ?.sort((a, b) => b - a)
        ?.forEach((v) => {
          const filteredSeasonScore = arr?.filter((x) => Number(x?.season) === v)

          const finalScoring = {}
          for (let i = 1; i <= 18; i++) {
            if (filteredSeasonScore.find((x) => x?.week === i)) {
              finalScoring[`week${i}`] = filteredSeasonScore.find((x) => x?.week === i)?.score
            } else {
              finalScoring[`week${i}`] = 0
            }
          }

          const totalPf = filteredSeasonScore?.reduce((acc, obj) => acc + obj.score, 0)

          newArray?.push({
            season: v,
            totalPoints: totalPf?.toFixed(2),
            averagePoints: totalPf > 0 ? (totalPf / filteredSeasonScore?.length)?.toFixed(2) : 0,
            weeklyScoring: finalScoring,
          })
        })
      return newArray
    }
  }

  const getData = async () => {
    setIsLoading(true)

    if (isFreeAgent) {
      const res = await getFreeAgentRosterPlayer({ id: state?.playerID, week: SETTING?.week })
      if (res) {
        setData({ ...res, playerHistory: getWeeklyScoring(res?.player?.weeklyScoring) })
      }
    } else if (isOwnRoster || isTeamRoster) {
      const res = await getRosterPlayer({
        id: state?.playerID,
        week: SETTING?.week,
        team: state?.teamId,
      })
      if (res) {
        setData({ ...res, playerHistory: getWeeklyScoring(res?.playerContract?.weeklyScoring) })
      }
    } else if (isAuction?.status) {
      const res = await getSingleAuctionPlayer(isAuction?.auctionId)
      if (res) getWeeklyScoring(res?.player_id?.weeklyScoring)
      setData({
        ...res,
        player: res?.player_id,
        playerContract: {
          weeklyScoring: res?.player_id?.weeklyScoring,
        },
        activePlayers: [],
        practicePlayers: [],
        reservedPlayers: [],
        playerHistory: getWeeklyScoring(res?.player_id?.weeklyScoring),
      })
    }
    setIsLoading(false)
  }

  const getBgImage = (position) => {
    const p = position?.toLowerCase()
    return p === 'back up qb'
      ? 'BACK_UP_QB'
      : p === 'bqb'
      ? 'BQB'
      : p === 'cb'
      ? 'CB'
      : p === 'db'
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
      : p === 'olb'
      ? 'LB'
      : p === 'ilb'
      ? 'LB'
      : p === 'ol'
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
      dataIndex: 'season',
      key: 'season',
      render: (t) => (t ? t : '-'),
    },
    {
      title: 'TOTAL POINTS',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (t) => (t ? t : '-'),
      width: 145,
    },
    {
      title: 'AVG. POINTS',
      dataIndex: 'averagePoints',
      key: 'averagePoints',
      render: (t) => (t ? t : '-'),
      width: 130,
    },
    ...Array.from({ length: 18 }, (_, index) => ({
      title: (
        <p>
          WK<b>{index + 1}</b>
        </p>
      ),
      dataIndex: `week${index + 1}`,
      key: `week${index + 1}`,
      render: (_, obj) =>
        obj?.weeklyScoring?.[`week${index + 1}`] ? obj?.weeklyScoring?.[`week${index + 1}`] : '-',
    })),
  ]

  const getYear = (contract) => {
    const signed = contract?.split(' signed a ')[1][0]
    if (signed) {
      return new Date().getFullYear() - 1 + Number(signed)
    } else {
      return '-'
    }
  }

  const handleCreateAuction = async () => {

    if (sampoints < CapHit) {
 
      // noti.error(`Bid amount ${bidAmount} exceeds your available points of ${sampoints}.`);
      notification.error({
        message: `Bid amount ${CapHit} exceeds your available points of ${sampoints}.`,
        duration: 4,
      });
      return
    }

    setAuctionLoading(true)


    const res = await createAuction({
      PlayerID: playerIdSmall,
      player_id: playerIdBig,
      auctionFrom: 'owner',
      // CapHit:CapHit,
      // CapHit: CapHit === 0 ? 1 : CapHit,
      CapHit : (CapHit === 0) ? 1 : (CapHit === undefined ? 1 : CapHit),
    })
    if (res) {
      closeModal()
      navigate('/player-auction')
    }
    setAuctionLoading(false)
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
                  {data?.player?.Position || '-'}
                </p>
                <p>
                  <b>team:</b>
                  {data?.player?.Team || '-'}
                </p>
                <p>
                  <b>bye:</b>
                  {data?.player?.ByeWeek || '-'}
                </p>
              </div>
              <div className='player_details_box'>
                <p>
                  <b>age:</b>
                  {data?.player?.Age || '-'}
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
            {state?.teamLogo && (
              <div className='top_row_3'>
                <p>
                  OWNING<b>TEAM</b>
                </p>
                {state?.teamLogo && <img src={state?.teamLogo} alt='Team Logo' />}
              </div>
            )}
            <div className='top_row_4'>
              {/* --------- OWN ROSTER --------- */}
              {isOwnRoster && !isLocked() && (
                <>
                <Button disabled={false} loading={auctionLoading} onClick={handleCreateAuction} type='primary'>
                    AUCTION PLAYER
                  </Button>
                  {/* <AuctionPlayer
                    disabled={isPlayerLocked}
                    playerIds={{
                      PlayerID: playerIdSmall,
                      player_id: playerIdBig,
                      playercaphit:CapHit,
                    }}
                    pInterfaceModalClose={closeModal}
                  /> */}

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
              {isOwnRoster && isLocked() && <PreviousDayView />}
              {/* --------- OWN ROSTER --------- */}

              {/* --------- FREE AGENT --------- */}
              {isFreeAgent && (
                <>
                  <Button disabled={false} loading={auctionLoading} onClick={handleCreateAuction} type='primary'>
                    AUCTION PLAYER
                  </Button>
                </>
              )}
              {/* --------- FREE AGENT --------- */}

              {/* --------- TEAM ROSTER --------- */}
              {isTeamRoster && state?.teamId && !isLocked() && (
                <>
                  <Button
                    type='primary'
                    onClick={() => {
                      navigate('/team-trade')
                    }}
                  >
                    Make Offer
                  </Button>
{data?.player?.inPracticeSquad  && !data?.player?.isPlayerProtected ? <PoachPlayer data={data} state={state} /> :
<>
</>
}

                  
                </>
              )}
              {isTeamRoster && state?.teamId && isLocked() && <PreviousDayView />}
              {/* --------- TEAM ROSTER --------- */}

              {/* --------- AUCTION --------- */}
              {isAuction?.status && !isAuction?.hasAuctionEnded && (
                <LiveAuctionBid data={data} getData={getData} closeModal={closeModal} />
              )}
              {isAuction?.status && isAuction?.hasAuctionEnded && <WinningBid data={data} />}
              {/* --------- AUCTION --------- */}
            </div>
          </div>
          <div className='bottom_row'>
            <div className='left'>
              <div className='left_top'>
                <div>
                  <h2>Player Rank</h2>
                  <div className='player_rank_box'>
                    <div>
                      <p className='text_1'>
                        {
                          getRankAndPosition(data?.playerContract?.weeklyScoring)
                            ?.playerPositionRank
                        }
                      </p>
                      <p className='text_2'>POSITION</p>
                    </div>
                    <div style={{ alignSelf: 'flex-start' }}>
                      <p className='text_2' style={{ fontSize: '18px' }}>
                        |
                      </p>
                    </div>
                    <div>
                      <p className='text_1'>
                        {getRankAndPosition(data?.playerContract?.weeklyScoring)?.playerOverallRank}
                      </p>
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
                    {/* <p>
                      {isFreeAgent
                      // {console.log('data?.playerContract?',data?.playerContract?.weeklyScoring)
                      
                        ? data?.player?.pf || '-'
                        : getPf(data?.playerContract?.weeklyScoring)?.tpf
                        }
                    </p> */}
                    <p>
  {isFreeAgent
    ? data?.player?.pf || '-'
    : getPf(data?.playerContract?.weeklyScoring?.filter(item => item.season === 2024))?.tpf}
</p>

                    <span style={{ fontSize: '22px', color: '#fff' }}>|</span>
                    {/* <p>
                      {isFreeAgent
                        ? data?.player?.avgPf || '-'
                        : getPf(data?.playerContract?.weeklyScoring)?.apf}
                    </p> */}
                    <p>
  {isFreeAgent
    ? data?.player?.avgPf || '-'
    : getPf(data?.playerContract?.weeklyScoring?.filter(item => item.season === 2024))?.apf}
</p>

                  </div>
                </div>
              </div>
              <div className='left_bottom'>
                <p>
                  PLAYER<b>HISTORY</b>
                </p>
                <Table
                  loading={isLoading}
                  dataSource={data?.playerHistory}
                  columns={columns}
                  bordered={false}
                  pagination={false}
                  scroll={{ x: 2000, y: 200 }}
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
                  {/* {obj ? `$${obj.currentYearSalaryCap.toLocaleString()}` : '-'} */}
                    <b>24&apos;</b>{' '}
                    {data?.player?.currentYearSalaryCap
                      // ? `$${data?.playerContract?.PlayerCap?.toLocaleString()}`
                         ? `$${data?.player?.currentYearSalaryCap?.toLocaleString()}`
                      : '-'}
                  </p>
                </div>
                <div className='caphit_year_box'>
                  <p>
                    25&apos; CAP<b>HIT</b>
                  </p>
                  <div>
                    <p>
                    {data?.player?.nextYearSalaryCap
                      // ? `$${data?.playerContract?.PlayerCap?.toLocaleString()}`
                         ? `$${data?.player?.nextYearSalaryCap?.toLocaleString()}`
                      : '-'}
                    </p>
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

const PreviousDayView = () => {
  return (
    <div style={{ height: '200px' }}>
      <p style={{ textAlign: 'center' }}>You are viewing previous day data in view only mode.</p>
    </div>
  )
}
const WinningBid = ({ data }) => {
  return (
    <section className='winning_bid_section'>
      <div className='wb_top_row'>
        <img src={Image} />
        <p>Winning Bid</p>
        <p>
          <b>{`$${data?.highestCurrentBid?.toLocaleString()}`}</b>
        </p>
      </div>
      <BidHistoryBox data={data?.bidHistory} height={'130px'} />
    </section>
  )
}
const LiveAuctionBid = ({ data, getData,closeModal }) => {
  const [noti, contextHolder] = notification.useNotification()
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const [remainingTime, setRemainingTime] = useState('')
  const [isLoading, setIsLoading] = useState({
    type: 'data',
    status: true,
  })
  const [manualBid, setManualBid] = useState('')
  const [bidError, setBidError] = useState('')
  // const USER = useSelector((state) => state.user)
  const USER = useSelector((state) => state.user.userDetails)

const dispatch = useDispatch()


  useEffect(() => {
    bidError && setBidError(false)
  }, [manualBid])

  const ended = async () => {
    const res = await auctionEnded({ auctionId: data?._id })
    if (res) {
      await getData()
    }
  }

  useEffect(() => {
    let interval
    if (!data?.hasAuctionEnded) {
      interval = setInterval(() => {
        const now = moment()
        const end = moment(data?.endDate)
         console.log('end',end);
        
        const duration = moment.duration(end.diff(now))
         console.log('second duration.asSeconds()',duration.asSeconds());
        
        if (duration.asSeconds() <= 0) {
          // console.log('in the second check');
          clearInterval(interval)
          setRemainingTime('Time is up!')
          ended()
        } else {
          const days = Math.floor(duration.asDays())
          const hours = String(duration.hours()).padStart(2, '0')
          const minutes = String(duration.minutes()).padStart(2, '0')
          const seconds = String(duration.seconds()).padStart(2, '0')
          setRemainingTime(
            days === 0
              ? `${hours} : ${minutes} : ${seconds}`
              : `${days} : ${hours} : ${minutes} : ${seconds}`,
          )
        }
      }, 1000)
    } else {
      setRemainingTime('Time is up!')
    }

    return () => {
      clearInterval(interval)
    }
  }, [data?.endDate])

  const handleManualBid = async () => {
    if (manualBid?.trim() == '') {
      setBidError('ENTER BID BEFORE SUBMIT')
      return
    }
    // if (data?.highestCurrentBid >= manualBid) {
    //   setBidError('PLACE BID HIGHER THEN CURRENT BID')
    //   return
    // }

    

    // if  (sampoints > manualBid) {
    //    setBidError(`Bid amount ${manualBid} exceeds your available points of ${sampoints}.`)
    //   return
    // }

    // if (Number(manualBid) > sampoints) {
    //   setBidError(`Bid amount ${manualBid} exceeds your available points of ${sampoints}.`);
    //   return;
    // }

    // setBidError('')

    setIsLoading({
      type: 'submit',
      status: true,
    })
    const res = await addBid(
      {
        auctionId: data?._id,
        bidAmount: Number(manualBid),
      },
        noti,
    )
    if (res) {

   
     await  getData()
     closeModal
   //  await getUser()
    }
    setIsLoading({
      type: 'submit',
      status: false,
    })
  }

//   const handleQuickBid = async () => {
//     setIsLoading({
//       type: 'quick',
//       status: true,
//     })

    
//     // samWallet?.SamPoints < bidamount
//     const res = await addBid(
//       {
//         auctionId: data?._id,
//         // bidAmount: Number(data?.highestCurrentBid) + 5,
//         bidAmount: Number(data?.highestCurrentBid) + 50000,
//       },
//       noti,
//     )
// if(sampoints > bidamount){
//   noti.error(`Bid amount ${bidAmount} exceeds your available points of ${sampoints}.`);

// }

//     if (res) {
//       getData()
// closeModal()
//     }
//     setIsLoading({
//       type: 'quick',
//       status: false,
//     })
//   }

const handleQuickBid = async () => {
  setIsLoading({
    type: 'quick',
    status: true,
  });

  const bidAmount = Number(data?.highestCurrentBid) + 50000;

  // Check if the user has enough points
  // if (sampoints < bidAmount) {
  //   setIsLoading({
  //     type: 'quick',
  //     status: false,
  //   });
  //   // noti.error(`Bid amount ${bidAmount} exceeds your available points of ${sampoints}.`);
  //   notification.error({
  //     message: `Bid amount ${bidAmount} exceeds your available points of ${sampoints}.`,
  //     duration: 4,
  //   });
  //   return
  // }

  try {
    const res = await addBid(
      {
        auctionId: data?._id,
        bidAmount,
      },
      noti,
    );

    if (res) {
      await getData();
      // await getUser()
    }
  } catch (error) {
    // Handle potential errors from addBid or getData
    noti.error('An error occurred while placing your bid. Please try again.');
  } finally {
    setIsLoading({
      type: 'quick',
      status: false,
    });
  }
};

console.log('data?.auctionStartedBy?.team',data?.auctionStartedBy?.team);
console.log('USER?.team?._id',USER);



 let  isDisabled = data?.auctionStartedBy?.team._id === USER?.team?._id && String(data?.auctionFrom) === 'owner';

 console.log('isDisabled',isDisabled);



  return (
    <>
      {contextHolder}
      <div className='live_auction_bid'>
        <div className='auction_clock'>
          <p>
            AUCTION<b>CLOCK</b>
          </p>
          <p>{remainingTime || '00 : 00 : 00'}</p>
        </div>
        <div className='top_bid'>
          <div className='top_bid_amount'>
            <div className='logo'>
              <img
                src={data?.bidHistory?.find((x) => x?.bid === data?.highestCurrentBid)?.team?.logo}
              />
            </div>
            <div className='amount'>
              
              <p>
                TOP<b>BID</b>
              </p>

              <div style={{display:'flex',justifyContent:'space-between',gap:'5px'}}>
            <img width={10} src={sampointslogo}></img>
              <p>{data?.highestCurrentBid && `${data?.highestCurrentBid?.toLocaleString()}`}</p>
              </div>
            </div>
          </div>
          <div     style={{
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1 
    }} className='bid_button' 
    // onClick={handleQuickBid}
    onClick={!isDisabled ? handleQuickBid : undefined} 
    >
            {isLoading?.status && isLoading?.type === 'quick' ? (
              <Spin />
            ) : (
              <>

                <p>QUICK BID</p>
                <div style={{display:'flex',justifyContent:'space-between',gap:'5px'}}>
                <img width={10} src={sampointslogo}></img>
                <p>50,000</p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className='manual_entry'>
          <div className='input_box'>
            <p className='manual_bid_text'>
              MANUAL<b>BID</b>
            </p>
            <Input
              value={manualBid}
              type='number'
              placeholder='Enter here'
              style={{ textAlign: 'center' }}
              onChange={(e) => setManualBid(e.target.value)}
            />
            {bidError != '' && <p className='error_text'>{bidError}</p>}
          </div>
          <div  onClick={!isDisabled ? handleManualBid : undefined} 
    style={{
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1 
    }} className='bid_button'
     // onClick={handleManualBid}
     >
            {isLoading?.status && isLoading?.type === 'submit' ? <Spin /> : <p>SUBMIT</p>}
          </div>
        </div>
        <BidHistoryBox data={data?.bidHistory} height={'90px'} />
      </div>
    </>
  )
}
const BidHistoryBox = ({ data, height }) => {
  return (
    <div className='bid_history_box'>
      <p>
        BID<b>HISTORY</b>
      </p>
      <div className='bid_card_box' style={{ height }}>
        <div className='bid_card_header'>
          <div style={{ width: '25px' }}></div>
          <p>USERNAME</p>
          <h3>
            BID
            <br />
            AMOUNT
          </h3>
        </div>
        {data
          ?.slice()
          ?.sort((a, b) => b.bid - a.bid)
          ?.map((v, i) => {
            return (
              <div key={i} className='bid_card'>
                <img src={v?.team?.logo} />
                <p>{v?.user?.userName}</p>
                <h3>{v?.bid && `SP${v?.bid?.toLocaleString()}`}</h3>
              </div>
            )
          })}
      </div>
    </div>
  )
}
