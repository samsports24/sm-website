import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Typography, Tooltip } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import Loader from '../components/Loader'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { auctionEnded, getAuctionPlayer, markAsPaid } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'

const PlayerAuction = () => {
  const USER = useSelector((state) => state?.user?.userDetails)

  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    const res = await getAuctionPlayer()
    setData(res)
    setIsLoading(false)
  }

  const AuctionCard = ({ data: v, payButton }) => {
    const [remainingTime, setRemainingTime] = useState('')
    const [loadingId, setLoadingId] = useState('')

    const pay = async (id) => {
      setLoadingId(id)
      const res = await markAsPaid({ auctionId: id })
      if (res) {
        setLoadingId('')
        getData()
      }
    }

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
          const end = moment(v?.endDate)
          const duration = moment.duration(end.diff(now))
          if (duration.asSeconds() <= 0) {
            console.log('Duration >>', duration.asSeconds() <= 0)
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

    return (
      <div className='squad_card_box'>
        <div className='squad_content_body'>
          <div className='squad_image_box'>
            {v?.player_id?.HostedHeadshotNoBackgroundUrl ? (
              <img src={v?.player_id?.HostedHeadshotNoBackgroundUrl} />
            ) : (
              <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
            )}
          </div>
          <div>
            <p className='squad_text2'>position</p>
            <p className='squad_text1'>{v?.player_id?.Position || '-'}</p>
          </div>
          <div>
            <p style={{ width: '160px' }} className='squad_text2'>
              player name
            </p>
            <p
              onClick={() => {
                if (v?.hasAuctionEnded) {
                  navigate(`/player-winning-bid/${v?._id}`)
                } else {
                  navigate(`/player-live-auction/${v?._id}`, {
                    state: v,
                  })
                }
              }}
              style={{ cursor: 'pointer' }}
              className='squad_text1 name_text_hover'
            >
              {v?.player_id?.Name || '-'}
            </p>
          </div>
          <div>
            <p className='squad_text2'>age</p>
            <p className='squad_text1'>{v?.player_id?.Age || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>team</p>
            <p className='squad_text1'>{v?.player_id?.Team || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>opp</p>
            <p className='squad_text1'>{v?.player_id?.UpcomingGameOpponent || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>bye</p>
            <p className='squad_text1'>{v?.player_id?.ByeWeek || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>player cap #</p>
            <p className='squad_text1'>{v?.player_id?.PlayerCap || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>current bid</p>
            <p className='squad_text1'>
              {v?.highestCurrentBid ? `$${v?.highestCurrentBid?.toLocaleString()}` : '-'}
            </p>
          </div>
          {v?.hasAuctionStarted ? (
            <div style={{ minWidth: '130px' }}>
              <p className='squad_text2'>time left</p>
              <p className='squad_text1' style={{ textTransform: 'lowercase' }}>
                {remainingTime || '-'}
              </p>
            </div>
          ) : (
            <div style={{ minWidth: '130px' }}>
              <p className='squad_text2'>time left</p>
              <p className='squad_text1' style={{ textTransform: 'lowercase' }}>
                Auction will start on {moment(v?.startDate).format('YYYY-MM-DD hh:mm a')}
              </p>
            </div>
          )}
          {payButton && v?.assigned?.user === USER?._id && (
            <Tooltip
              placement='top'
              title={
                v?.isPaid ? (
                  <>
                    <p>
                      The Auction has been mark as paid, the player will be transferred after admin
                      approval, and if the player is locked then the player will come up in the next
                      week roster
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
                onClick={() => pay(v?._id)}
                type='primary'
              >
                {v?.isPaid ? 'PAID' : 'PAY'}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary' onClick={() => navigate(-1)}>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Player</p>,
            },
            {
              title: <p>Player Auction</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination noWeek={true} />

      <section className='squad_card_container transparent' style={{ marginTop: '45px' }}>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className='header'>
              <h2>ALL AUCTION</h2>
            </div>
            {data?.allAuctions?.length > 0 ? (
              <>
                <div className='standing-table-bg'>
                  {data?.allAuctions?.map((v, i) => {
                    return <AuctionCard key={i} data={v} />
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  minHeight: '30vh',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '30px',
                }}
              >
                <Typography.Title level={5} style={{ color: 'white' }}>
                  ALL AUCTION IS EMPTY
                </Typography.Title>
              </div>
            )}
            <div className='header'>
              <h2>MY AUCTION</h2>
            </div>
            {data?.myAuctions?.length > 0 ? (
              <div className='standing-table-bg'>
                {data?.myAuctions?.map((v, i) => {
                  return <AuctionCard key={i + Date.now()} data={v} payButton />
                })}
              </div>
            ) : (
              <div
                style={{
                  minHeight: '30vh',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '30px',
                }}
              >
                <Typography.Title level={5} style={{ color: 'white' }}>
                  MY AUCTION IS EMPTY
                </Typography.Title>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default PlayerAuction
