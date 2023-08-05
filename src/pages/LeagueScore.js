import React from 'react'
// Third
import { Col, Row } from 'antd'

// Image, Icon

// Component
import Header from '../components/Header'
import ScheduleBox from '../components/ScheduleBox'
import LeagueScoreCard from '../components/cards/leagueScoreCard'
import Pagination from '../components/Pagination'

// Mock Data
import { leagueScoreData } from './mockData'
import { useNavigate } from 'react-router-dom'

const LeagueScore = () => {
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token')
  !isAuthenticated && navigate('/transactions')

  const handlePagination = (page) => {
    console.log(page)
  }

  return (
    <div className='league_container'>
      {/* HEADER */}
      <Header />

      <main className='wrapper'>
        {/* SCHEDULE ONE */}
        <ScheduleBox />

        {/* SCHEDULE TWO */}
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <Pagination
            title='Go To Week:'
            defaultCurrent={1}
            total={180}
            onChange={handlePagination}
          />
        </section>

        {/* CARDS */}
        <section className='score_card_container'>
          <Row gutter={[30, 20]}>
            {leagueScoreData?.map((value, index) => (
              <Col xs={24} lg={12} xl={12} xxl={8} key={index}>
                <LeagueScoreCard data={{ ...value, index }} />
              </Col>
            ))}
          </Row>
        </section>
      </main>
    </div>
  )
}

export default LeagueScore
