import React, { useEffect, useState } from 'react'
import { Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
import LeagueScoreCard from '../components/cards/leagueScoreCard'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'

import { getScheduleByWeek, updateWeek } from '../redux'
import { useSelector, useDispatch } from 'react-redux'

const LeagueScore = () => {
  const SETTING = useSelector((state) => state?.user?.setting)

  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token')
  !isAuthenticated && navigate('/transactions')

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const dispatch = useDispatch()

  useEffect(() => {
    getDataByWeek()
  }, [SETTING?.week])

  const getDataByWeek = async () => {
    setLoading(true)
    const res = await getScheduleByWeek(SETTING?.week)
    setData(res)
    setLoading(false)
  }

  const handlePagination = (page) => {
    dispatch(updateWeek(page))
  }

  return (
    <div className='league_container'>
      {/* HEADER */}
      <Header />

      <main className='practice_squad_container wrapper'>
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <Pagination
            title='Go To Week:'
            current={SETTING?.week}
            defaultCurrent={SETTING?.week}
            total={180}
            onChange={handlePagination}
          />
        </section>

        {/* CARDS */}
        <section className='score_card_container'>
          <Row gutter={[100, 40]}>
            {loading ? (
              <Loader />
            ) : data?.length > 0 ? (
              data?.map((value, index) => (
                <Col xs={24} xl={12} key={index}>
                  {/* <LeagueScoreCard data={{ ...value, index }} /> */}
                  <NewLLeagueScoreCard data={{ ...value, index }} />
                </Col>
              ))
            ) : (
              <p className='no_schedule_text'>No Schedule..</p>
            )}
          </Row>
        </section>
      </main>
    </div>
  )
}

const NewLLeagueScoreCard = ({ data }) => {
  const navigate = useNavigate()

  const getName = (name) => {
    return name
      ?.split(' ')
      .map((v) => v[0])
      .join('')
  }

  return (
    <div className='nls_card'>
      <div className='nls_card_top'>
        <div className='nls_card_top_left'>
          <p>
            {data?.opponentOne?.name?.length > 12
              ? getName(data?.opponentOne?.name)
              : data?.opponentOne?.name}
          </p>
          <p>
            ( {data?.record?.teamOne?.win}-{data?.record?.teamOne?.lose})
          </p>
        </div>
        <div className='nls_card_top_center'>
          <div
            className='game_detail'
            onClick={() => {
              navigate('/game-details', {
                state: {
                  team1: data?.opponentOne,
                  team2: data?.opponentTwo,
                  scoreOne: data?.scoreOne,
                  scoreTwo: data?.scoreTwo,
                },
              })
            }}
          >
            <p>GAME DETAILS</p>
          </div>
        </div>
        <div className='nls_card_top_right'>
          <p>
            ({data?.record?.teamTwo?.win}-{data?.record?.teamTwo?.lose})
          </p>
          <p>
            {data?.opponentTwo?.name?.length > 12
              ? getName(data?.opponentTwo?.name)
              : data?.opponentTwo?.name}
          </p>
        </div>
      </div>
      <div className='nls_card_bottom'>
        <div className='nls_card_left'>
          <div
            className='nls_img_box'
            style={{ backgroundImage: `url(${data?.opponentOne?.logo})` }}
          ></div>
          <div className='nls_score_box_1'>
            <p>{data?.scoreOne}</p>
          </div>
        </div>
        <div className='nls_card_right'>
          <div className='nls_score_box_2'>
            <p>{data?.scoreTwo}</p>
          </div>
          <div
            className='nls_img_box'
            style={{ backgroundImage: `url(${data?.opponentTwo?.logo})` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default LeagueScore
