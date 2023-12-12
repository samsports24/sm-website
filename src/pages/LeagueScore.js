import React, { useEffect, useState } from 'react'
import { Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
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
  const USER = useSelector((state) => state.user.userDetails)
  const navigate = useNavigate()

  const getName = (name) => {
    const array = name.split(' ')
    const length = array[0]?.length <= 3 ? true : false
    return length ? `${array[0]} ${array[1]}` : array[0]
  }

  const handleNavigate = (id) => {
    if (USER?.team?._id === id) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${id}`)
    }
  }

  return (
    <div className='nls_card'>
      <div className='nls_card_top'>
        <div className='nls_card_top_left'>
          <p onClick={() => handleNavigate(data?.opponentOne?._id)}>
            {getName(data?.opponentOne?.name)}
          </p>
          <p>
            ({data?.record?.teamOne?.win}-{data?.record?.teamOne?.lose})
          </p>
        </div>
        <div className='nls_card_top_center'>
          <div
            className='game_detail'
            onClick={() => {
              navigate('/game-details', {
                state: {
                  data,
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
          <p onClick={() => handleNavigate(data?.opponentTwo?._id)}>
            {getName(data?.opponentTwo?.name)}
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
            <p>{data?.scoreOne || '0.00'}</p>
          </div>
        </div>
        <div className='nls_card_right'>
          <div className='nls_score_box_2'>
            <p>{data?.scoreTwo || '0.00'}</p>
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
