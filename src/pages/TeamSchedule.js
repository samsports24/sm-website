import React from 'react'

import { Button, Breadcrumb, Row, Col, Select } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'
import MatchUpOfTheWeek from '../components/MatchUpOfTheWeek'

const TeamSchedule = () => {
  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
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

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
        <WeekPagination />
      </section>

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <Row gutter={[30, 30]}>
          <Col xs={24}>
            <div className='header'>
              <h2>TEAM SCHEDULE</h2>
              <div className='right'>
                <p>YOUR TEAM</p>
                <Select
                  placeholder='Team'
                  style={{ minWidth: 130 }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: 'teams',
                      label: 'Teams',
                    },
                  ]}
                />
              </div>
            </div>
          </Col>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Col key={item} xs={24} lg={12}>
              <MatchUpOfTheWeek />
            </Col>
          ))}
        </Row>
      </section>
    </div>
  )
}

export default TeamSchedule
