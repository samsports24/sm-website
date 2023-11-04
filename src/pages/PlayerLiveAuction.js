import { Button, Breadcrumb, Row, Col, Typography, Input, notification } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'

import Arrow from '../assets/arrow-right.svg'
import Image from '../assets/logo2.png'

// Component
import Header from '../components/Header'

import GmCard from '../components/playerInterface/GmCard'
import PlayerStats from '../components/playerInterface/PlayerStats'
import ContractInfo from '../components/playerInterface/ContractInfo'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import { useEffect, useState } from 'react'
import PlayerInfoBottom from '../components/PlayerInfoBottom'
import moment from 'moment'
import { addBid, getSingleAuctionPlayer } from '../redux/actions/rosterAction'

const PlayerLiveAuction = () => {
  const [noti, contextHolder] = notification.useNotification()
  const [state, setState] = useState(null)
  const [remainingTime, setRemainingTime] = useState('')
  const [isLoading, setIsLoading] = useState({
    type: 'data',
    status: true,
  })
  const [manualBid, setManualBid] = useState('')
  const [bidError, setBidError] = useState('')
  const [news, setNews] = useState('')
  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    bidError && setBidError(false)
  }, [manualBid])

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading({
      type: 'data',
      status: true,
    })
    // API CALL
    const res = await getSingleAuctionPlayer(params?.id)
    if (res) {
      setState(res)
    }
    setNews()
    setIsLoading({
      type: 'data',
      status: false,
    })
  }

  useEffect(() => {
    let interval
    if (!state?.hasAuctionEnded) {
      interval = setInterval(() => {
        const now = moment()
        const end = moment(state?.endDate)
        const duration = moment.duration(end.diff(now))
        if (duration.asSeconds() <= 0) {
          clearInterval(interval)
          setRemainingTime('Time is up!')
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
      setRemainingTime('Time is up!')
    }

    return () => {
      clearInterval(interval)
    }
  }, [state?.endDate])

  const handleManualBid = async () => {
    if (manualBid?.trim() == '') {
      setBidError('ENTER BID BEFORE SUBMIT')
      return
    }
    if (state?.highestCurrentBid >= manualBid) {
      setBidError('PLACE BID HIGHER THEN CURRENT BID')
      return
    }

    setIsLoading({
      type: 'submit',
      status: true,
    })
    await addBid(
      {
        auctionId: state?._id,
        bidAmount: Number(manualBid),
      },
      navigate,
      noti,
    )
    // if (res) {
    //   navigate('/player-auction')
    // }
    setIsLoading({
      type: 'submit',
      status: false,
    })
  }

  const handleQuickBid = async () => {
    setIsLoading({
      type: 'quick',
      status: true,
    })
    await addBid(
      {
        auctionId: state?._id,
        bidAmount: Number(state?.highestCurrentBid) + 5,
      },
      navigate,
      noti,
    )
    // if (res) {
    //   ('/player-auction')
    // }
    setIsLoading({
      type: 'quick',
      status: false,
    })
  }

  return (
    <div className='player_interface_container'>
      {contextHolder}
      {/* BREADCRUMB */}
      <section className='_breadcrumb'>
        <Button className='_back_button' type='primary' onClick={() => navigate(-1)}>
          Back
        </Button>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      {isLoading?.status && isLoading?.type === 'data' ? (
        <Loader />
      ) : (
        <>
          <GmCard
            playerData={state?.player_id}
            news={news}
            isButton={false}
            bidWinningPage={false}
            isAction={false}
          />

          <PlayerInfoBottom
            player={state?.player_id}
            contract={state?.player_id?.PlayerCap?.toLocaleString() || '-'}
          />

          <section className='bid_section' style={{ marginTop: '20px' }}>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                <div className='bid_card' style={{ flexDirection: 'column' }}>
                  <img src={Image} />
                  <Typography.Title level={3}>
                    CURRENT HIGHEST BID
                    <br />
                    {`$${state?.highestCurrentBid?.toLocaleString()}`}
                  </Typography.Title>
                </div>
              </Col>
              <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                <div className='bid_card'>
                  <Typography.Title level={3}>
                    AUCTION CLOCK <br /> {remainingTime}
                  </Typography.Title>
                </div>
              </Col>
              <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                <div className='bid_card bid_card_normal'>
                  <Typography.Title level={3}>MANUAL BID ENTRY</Typography.Title>
                  <Input
                    value={manualBid}
                    type='number'
                    placeholder='Enter here'
                    style={{ textAlign: 'center' }}
                    onChange={(e) => setManualBid(e.target.value)}
                  />
                  {bidError != '' && <p className='error_text'>{bidError}</p>}
                </div>
              </Col>
              <Col xs={24} md={12} lg={12} xl={6}>
                <div className='bid_card_btns'>
                  <Button
                    loading={isLoading?.status && isLoading?.type === 'submit'}
                    type='primary'
                    onClick={handleManualBid}
                  >
                    Submit
                  </Button>
                  &nbsp; &nbsp;
                  <Button
                    loading={isLoading?.status && isLoading?.type === 'quick'}
                    type='primary'
                    onClick={handleQuickBid}
                  >
                    Quick Bid
                  </Button>
                </div>
              </Col>
            </Row>
          </section>

          <section className='player_info_container'>
            <PlayerStats />
            <ContractInfo />
          </section>

          <section className='bid_history_container'>
            <div className='header'>
              <h2>BID HISTORY</h2>
            </div>
            <div className='bid_history_body'>
              {state?.bidHistory
                ?.slice()
                ?.sort((a, b) => b.bid - a.bid)
                ?.map((v, i) => {
                  return (
                    <div key={i} className='squad_card_box'>
                      <div>
                        <p className='squad_text2'>date</p>
                        <p className='squad_text1'>
                          {moment(v?.date_time).format('YYYY-MM-DD') || '-'}
                        </p>
                      </div>
                      <div>
                        <p className='squad_text2'>user name</p>
                        <p className='squad_text1'>{v?.user?.userName || '-'}</p>
                      </div>
                      <div>
                        <p className='squad_text2'>team</p>
                        <p className='squad_text1'>{v?.team?.name || '-'}</p>
                      </div>
                      <div style={{ minWidth: '100px' }}>
                        <p className='squad_text2'>bid</p>
                        <p className='squad_text1'>{`$${v?.bid?.toLocaleString()}` || '-'}</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerLiveAuction
