import React, { useEffect, useState } from 'react'

import { Button, Tooltip, Table, Tabs } from 'antd'

// Component
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useNavigate } from 'react-router-dom'
import { approveAndRejectAuction, auctionEnded, getAuctionPlayer, markAsPaid } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'
import moment from 'moment'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'
import { positions } from '../config/constants'

const PlayerAuction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { data } = useSelector((state) => state.auction)
  const [tab, setTab] = useState(1)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    await getAuctionPlayer()
    setIsLoading(false)
  }

  function mapPosition(position) {
  return positions[position] || position;
}

  const columns = [
    {
      title: ' ',
      dataIndex: 'HostedHeadshotNoBackgroundUrl',
      key: 'HostedHeadshotNoBackgroundUrl',
      render: (_, obj) => {
        return (
          <div className='squad_image_box'>
            {obj?.player_id?.HostedHeadshotNoBackgroundUrl ? (
              <img src={obj?.player_id?.HostedHeadshotNoBackgroundUrl} alt={'Player'} />
            ) : (
              <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
            )}
          </div>
        )
      },
    },
    {
      title: 'POSITION',
      dataIndex: 'Position',
      key: 'Position',
      render: (_, obj) => <p>{mapPosition(obj?.player_id?.Position) || '-'}</p>,
    },
    {
      title: 'PLAYER NAME',
      dataIndex: 'Name',
      key: 'Name',
      render: (_, obj) => {
        return (
          <PlayerDetailsModal
            button={<span className='fa_p_name name_text_hover'>{obj?.player_id?.Name}</span>}
            state={{
              playerID: null,
              isReserve: false,
              teamId: null,
              teamName: '',
              teamLogo: null,
              isAuction: {
                status: true,
                auctionId: obj?._id,
                hasAuctionEnded: obj?.hasAuctionEnded,
              },
            }}
          />
          // <p
          //   onClick={() => {
          //     if (obj?.hasAuctionEnded) {
          //       navigate(`/player-winning-bid/${obj?._id}`)
          //     } else {
          //       navigate(`/player-live-auction/${obj?._id}`, {
          //         state: obj,
          //       })
          //     }
          //   }}
          //   style={{ cursor: 'pointer' }}
          //   className='name_text_hover'
          // >
          //   {obj?.player_id?.Name || '-'}{' '}
          //   {obj?.module === 'waiver' && <span className='waiver_tag'>Waiver</span>}
          // </p>
        )
      },
    },
    {
      title: 'AGE',
      dataIndex: 'BirthDate',
      key: 'BirthDate',
      render: (_, obj) => <p>{obj?.player_id?.Age || getAge(obj?.player_id?.BirthDate) || '-'}</p>,
    },
    {
      title: 'TEAM',
      dataIndex: 'Team',
      key: 'Team',
      render: (_, obj) => <p>{obj?.player_id?.Team || '-'}</p>,
    },
    {
      title: 'OPP',
      dataIndex: 'UpcomingGameOpponent',
      key: 'UpcomingGameOpponent',
      render: (_, obj) => <p>{obj?.player_id?.UpcomingGameOpponent || '-'}</p>,
    },
    {
      title: 'BYE',
      dataIndex: 'ByeWeek',
      key: 'ByeWeek',
      render: (_, obj) => <p>{obj?.player_id?.ByeWeek || '-'}</p>,
    },
    {
      title: 'PLAYER CAP #',
      dataIndex: 'PlayerCap',
      key: 'PlayerCap',
      render: (_, obj) => (
        <p>
          {' '}
          {/* {obj?.player_id?.PlayerCap ? `$${obj?.player_id?.PlayerCap?.toLocaleString()}` : '-'} */}
          {obj?.player_id?.PlayerCap ? `SP ${obj?.player_id?.currentYearSalaryCap?.toLocaleString()}` : '-'}
          
        </p>
      ),
    },
    {
      title: 'CURRENT BID',
      dataIndex: 'highestCurrentBid',
      key: 'highestCurrentBid',
      render: (t) => <p>{t ? `SP ${t?.toLocaleString()}` : '-'}</p>,
    },
    {
      title: 'TIME LEFT',
      dataIndex: 'hasAuctionStarted',
      key: 'hasAuctionStarted',
      render: (_, obj) => <AuctionTimer data={obj} getData={getData} />,
    },
  ]

  const columnWithPayButton = [
    ...columns,
    {
      title: 'ACTION',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (_, obj) => <PayButton data={obj} getData={getData} />,
    },
  ]

  const items = [
    {
      key: '1',
      label: 'Live Auction',
      children: (
        <div className='new_table_container auction_table_container'>
          <Table
            loading={isLoading}
            dataSource={data?.liveAuctions}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1100 }}
            className='all_auction_table '
            rowKey='_id'
          />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Past Auction',
      children: (
        <div className='new_table_container auction_table_container'>
          <Table
            loading={isLoading}
            dataSource={data?.pastAuctions}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1100 }}
            className='all_auction_table '
            rowKey='_id'
          />
        </div>
      ),
    },
  ]

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <hr className='divider' />

      <div className='header' style={{ marginBlock: '20px' }}>
        <h2>AUCTIONS</h2>
      </div>

      <Tabs size='large' defaultActiveKey='1' items={items} onChange={(key) => setTab(key)} />

      <div className='header' style={{ marginBlock: '20px' }}>
        <h2>MY AUCTION</h2>
      </div>

      <div className='new_table_container auction_table_container'>
        <Table
          loading={isLoading}
          dataSource={data?.myAuctions}
          columns={columnWithPayButton}
          bordered={false}
          pagination={false}
          scroll={{ x: 1200 }}
          className='my_auction_table'
          rowKey='_id'
        />
      </div>
    </div>
  )
}

const AuctionTimer = ({ data: v, getData }) => {
  const [remainingTime, setRemainingTime] = useState('')

  const ended = async () => {
    const res = await auctionEnded({ auctionId: v?._id })
    if (res) {
      await getData()
    }
  }

  useEffect(() => {
    let interval
    if (!v?.hasAuctionEnded) {
      interval = setInterval(() => {
        const now = moment()
        // console.log('v?.endDate',v?.endDate);
        
        const end = moment(v?.endDate)
         console.log('check end',end);
        const duration = moment.duration(end.diff(now))
         console.log('first duration.asSeconds()',duration.asSeconds());
        if (duration.asSeconds() <= 0) {
          // console.log('in the first check');
          clearInterval(interval)
          setRemainingTime('Auction Ended!')
         ended()
        } else {
          const days = Math.floor(duration.asDays())
          const hours = String(duration.hours()).padStart(2, '0')
          const minutes = String(duration.minutes()).padStart(2, '0')
          const seconds = String(duration.seconds()).padStart(2, '0')
          setRemainingTime(
            days === 0
              ? `${hours}h ${minutes}m ${seconds}s`
              : `${days}d ${hours}h ${minutes}m ${seconds}s`,
          )
        }
      }, 1000)
    } else {
      setRemainingTime('Auction Ended!')
    }

    return () => {
      clearInterval(interval)
    }
  }, [v?.endDate])


  // useEffect(() => {
  //   let interval
  //   if (!data?.hasAuctionEnded) {
  //     interval = setInterval(() => {
  //       const now = moment()
  //       console.log('v?.endDate',data?.endDate);
        
  //       const end = moment(data?.endDate)
  //       console.log('check end',end);
  //       const duration = moment.duration(end.diff(now))
  //       console.log('first duration.asSeconds()',duration.asSeconds());
  //       if (duration.asSeconds() <= 0) {
  //         console.log('in the first check');
  //         clearInterval(interval)
  //         setRemainingTime('Auction Ended!')
  //        ended()
  //       } else {
  //         const days = Math.floor(duration.asDays())
  //         const hours = String(duration.hours()).padStart(2, '0')
  //         const minutes = String(duration.minutes()).padStart(2, '0')
  //         const seconds = String(duration.seconds()).padStart(2, '0')
  //         setRemainingTime(
  //           days === 0
  //             ? `${hours}h ${minutes}m ${seconds}s`
  //             : `${days}d ${hours}h ${minutes}m ${seconds}s`,
  //         )
  //       }
  //     }, 1000)
  //   } else {
  //     setRemainingTime('Auction Ended!')
  //   }

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [data?.endDate])

  return (
    <>
      {v?.hasAuctionStarted ? (
        <div style={{ minWidth: '130px' }}>
          <p
            style={{ textTransform: remainingTime === 'Auction Ended!' ? 'initial' : 'lowercase' }}
          >
            {remainingTime || '-'}
          </p>
        </div>
      ) : (
        <div style={{ minWidth: '130px' }}>
          <p style={{ textTransform: 'lowercase' }}>
            Auction will start on {moment(v?.startDate).format('YYYY-MM-DD hh:mm a')}
          </p>
        </div>
      )}
    </>
  )
}

// const PayButton = ({ data: v, getData }) => {
//   const USER = useSelector((state) => state?.user?.userDetails)
//   const [loadingId, setLoadingId] = useState('')

//   const pay = async (id) => {
//     setLoadingId(id)
//     const res = await markAsPaid({ auctionId: id })
//     if (res) {
//       setLoadingId('')
//       getData()
//     }
//   }


const PayButton = ({ data: v, getData }) => {
  const USER = useSelector((state) => state?.user?.userDetails)
  const [loadingId, setLoadingId] = useState('')
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)

  const pay = async (id,CapHit) => {
    let wallet_deduct=false;
    let status='Rejected'
    setLoadingId(id)

    if (sampoints < CapHit) {
 
      // noti.error(`Bid amount ${bidAmount} exceeds your available points of ${sampoints}.`);
      notification.error({
        message: `Bid amount ${CapHit} exceeds your available points of ${sampoints}.`,
        duration: 4,
      });
      return
    }

    else {
      wallet_deduct=true
      status='approved'
    }

    const res = await approveAndRejectAuction({ auctionId: id, wallet_deduct,status})
    if (res) {
      setLoadingId('')
    await  getData()
     await getAuctionPlayer()
    }
  }


 console.log('v',v);
 console.log('v?.bidHistory[0]?.team',v?.bidHistory[0]?.team);
 

  console.log('USER?.team._id',USER?.team._id);
  
 

  return (
    <>
      {
      // v?.bidHistory.length > 1 && 
      v?.bidHistory[0]?.team === USER?.team._id && 
v?.hasAuctionEnded &&  (
        <Tooltip
          placement='top'
          title={
            v?.isPaid ? (
              <>
                <p>
                  The Auction has been mark as paid, the player will be transferred after admin
                  approval, and if the player is locked then the player will come up in the next
                  week roster.
                </p>
              </>
            ) : (
              <>
                <p>Pay Before:</p>
                <p style={{ fontWeight: 700 }}>{`${moment(v?.payBefore).format(
                  'ddd, YYYY-MM-DD hh:mm a',
                )}`}</p>
                <p>
                  to add this player to your active roster in the upcoming week otherwise the
                  auction will be cancelled.
                </p>
              </>
            )
          }
        >
          <Button
            disabled={v?.isPaid}
            loading={loadingId === v?._id}
            onClick={() => pay(v?._id,v?.highestCurrentBid)}
            type='primary'
          >
            {v?.isPaid ? 'PAID' : 'PAY'}
          </Button>
        </Tooltip>
      )}
    </>
  )
}
export default PlayerAuction
