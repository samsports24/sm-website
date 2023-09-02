import React, { useEffect, useState } from 'react'
// Third
import { Col, Row } from 'antd'

// Component
import Header from '../components/Header'
// import ScheduleBox from '../components/ScheduleBox'
import LeagueScoreCard from '../components/cards/leagueScoreCard'
import Pagination from '../components/Pagination'

// Mock Data
// import { leagueScoreData } from './mockData'
import { useNavigate } from 'react-router-dom'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { getScheduleByWeek } from '../redux'
import Loader from '../components/Loader'

const LeagueScore = () => {
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token')
  !isAuthenticated && navigate('/transactions')

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = useState(1)

  useEffect(() => {
    getDataByWeek()
  }, [week])

  const getDataByWeek = async () => {
    setLoading(true)
    const res = await getScheduleByWeek(week)
    setData(res)
    console.log(res)
    setLoading(false)
  }

  const handlePagination = (page) => {
    setWeek(page)
  }
  return (
    <div className='league_container'>
      {/* HEADER */}
      <Header />

      <main className='practice_squad_container wrapper'>
        {/* SCHEDULE ONE */}
        {/* <ScheduleBox /> */}

        <ButtonsAndPagination />

        {/* SCHEDULE TWO */}
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <Pagination
            title='Go To Week:'
            defaultCurrent={week}
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
              <p className='no_schedule_text'>No Scedules..</p>
            )}
          </Row>
        </section>
      </main>
    </div>
  )
}

export default LeagueScore
