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
          <Row gutter={[30, 20]}>
            {loading ? (
              <Loader />
            ) : data?.length > 0 ? (
              data?.map((value, index) => (
                <Col xs={24} lg={12} xl={12} xxl={8} key={index}>
                  <LeagueScoreCard data={{ ...value, index }} />
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

export default LeagueScore
