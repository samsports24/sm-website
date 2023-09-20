import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Typography } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import Loader from '../components/Loader'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

const PlayerAuction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setData([
        {
          HostedHeadshotNoBackgroundUrl: 'https://pngimg.com/d/spider_man_PNG60.png',
          Position: 'OL',
          Name: 'Khizram Saeed',
          Age: 50,
          Team: 'FFF',
          Opponent: 'HHH',
          ByeWeek: 8,
          TimeLeft: new Date('2023-09-21T08:00:00').toISOString(),
        },
        {
          HostedHeadshotNoBackgroundUrl: 'https://pngimg.com/d/spider_man_PNG60.png',
          Position: 'OL',
          Name: 'Bilal Ali',
          Age: 50,
          Team: 'FFF',
          Opponent: 'HHH',
          ByeWeek: 8,
          TimeLeft: new Date('2023-09-25T12:30:00').toISOString(),
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  const AuctionCard = ({ data: v }) => {
    const [remainingTime, setRemainingTime] = useState('')

    useEffect(() => {
      const interval = setInterval(() => {
        const now = moment()
        const end = moment(v?.TimeLeft)
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

      return () => {
        clearInterval(interval)
      }
    }, [v?.TimeLeft])

    return (
      <div className='squad_card_box'>
        <div className='squad_content_body'>
          <div className='squad_image_box'>
            {v?.HostedHeadshotNoBackgroundUrl ? (
              <img src={v?.HostedHeadshotNoBackgroundUrl} />
            ) : (
              <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
            )}
          </div>
          <div>
            <p className='squad_text2'>position</p>
            <p className='squad_text1'>{v?.Position || '-'}</p>
          </div>
          <div>
            <p style={{ width: '160px' }} className='squad_text2'>
              player name
            </p>
            <p
              onClick={() => {
                navigate(`/player-live-auction/${v?._id}`)
              }}
              style={{ cursor: 'pointer' }}
              className='squad_text1 name_text_hover'
            >
              {v?.Name || '-'}
            </p>
          </div>
          <div>
            <p className='squad_text2'>age</p>
            <p className='squad_text1'>{v?.Age || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>team</p>
            <p className='squad_text1'>{v?.Team || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>opp</p>
            <p className='squad_text1'>{v?.Opponent || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>bye</p>
            <p className='squad_text1'>{v?.ByeWeek || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>player cap #</p>
            <p className='squad_text1'>{v?.PlayerCap || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>PF &nbsp;</p>
            <p className='squad_text1'>{v?.pointsPerGame || '-'}</p>
          </div>
          <div>
            <p className='squad_text2'>player rank</p>
            <p className='squad_text1'>{v?.playerRank || '-'}</p>
          </div>
          <div style={{ minWidth: '130px' }}>
            <p className='squad_text2'>time left</p>
            <p className='squad_text1' style={{ textTransform: 'lowercase' }}>
              {remainingTime || '-'}
            </p>
          </div>
          <Button type='primary'>PAY</Button>
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
        <div className='header'>
          <h2>PLAYER AUCTION</h2>
        </div>

        {isLoading ? (
          <Loader />
        ) : data?.length > 0 ? (
          <div className='standing-table-bg'>
            {data?.map((v, i) => {
              return <AuctionCard key={i} data={v} />
            })}
          </div>
        ) : (
          <div
            style={{
              minHeight: '70vh',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '30px',
            }}
          >
            <Typography.Title level={5} style={{ color: 'white' }}>
              AUCTION IS EMPTY
            </Typography.Title>
          </div>
        )}
      </section>
    </div>
  )
}

export default PlayerAuction
