import { Button, Breadcrumb, Row, Col, Typography, Input } from 'antd'
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

const PlayerLiveAuction = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [player, setPlayer] = useState({})
  const [news, setNews] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()
  console.log(id)

  useEffect(() => {
    getData()
  }, [])
  const getData = async () => {
    setIsLoading(true)
    // API CALL
    setTimeout(() => {
      setPlayer({})
      setNews()
      setIsLoading(false)
    }, 1000)
  }

  let infoData = [
    {
      title: 'Team',
      value: player?.Team || '-',
    },
    {
      title: 'Opponent',
      value: player?.UpcomingGameOpponent,
    },
    {
      title: 'Postion',
      value: player?.Position || '-',
    },
    {
      title: 'Height',
      value: player?.Height || '-',
    },
    {
      title: 'Years in League',
      value: player?.Experience <= 1 ? `${player?.Experience} Year` : `${player?.Experience} Years`,
    },
    {
      title: 'Player College',
      value: player?.College,
    },
    {
      title: 'Age',
      value: `${player?.Age} (${player?.BirthDateString})`,
    },
  ]

  return (
    <div className='player_interface_container'>
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

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <GmCard
            playerData={player}
            news={news}
            isButton={false}
            bidWinningPage={false}
            isAction={false}
          />

          <div className='info-card'>
            {infoData.map((item, index) => (
              <h3 key={index}>
                {item.title} : <span>{item.value}</span>
              </h3>
            ))}
          </div>
          <hr className='divider' />

          <section className='bid_section'>
            <Row gutter={[30, 30]} align={'middle'}>
              <Col xs={24} md={12} lg={12} xl={6}>
                <div className='bid_card'>
                  <img src={Image} />
                  <Typography.Title level={2}>
                    CURRENT
                    <br />
                    HIGHEST BID
                  </Typography.Title>
                </div>
              </Col>
              <Col xs={24} md={12} lg={12} xl={6}>
                <div className='bid_card'>
                  <Typography.Title level={2}>AUCTION CLOCK</Typography.Title>
                </div>
              </Col>
              <Col xs={24} md={12} lg={12} xl={6}>
                <div className='bid_card bid_card_normal'>
                  <Typography.Title level={2}>MANUAL BID ENTRY</Typography.Title>
                  <Input value={'*********'} disabled style={{ textAlign: 'center' }} />
                </div>
              </Col>
              <Col xs={24} md={12} lg={12} xl={6}>
                <div className='bid_card_btns'>
                  <Button type='primary'>Submit</Button>
                  <Button type='primary'>Quick Bid</Button>
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
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerLiveAuction
